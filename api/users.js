import { withSupabase } from '@supabase/server';

export const config = { runtime: 'edge' };

export default withSupabase({ auth: 'none' }, async (req, ctx) => {
  const { method } = req;
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  try {
    // ─── GET all users ────────────────────────────────────────────────────────
    if (method === 'GET') {
      // Search by phone
      if (action === 'search') {
        const phone = url.searchParams.get('phone');
        if (!phone) return Response.json({ error: 'Phone is required for search' }, { status: 400 });

        let cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);

        const { data: results, error: searchErr } = await ctx.supabaseAdmin
          .from('users')
          .select('phone, name, status')
          .eq('status', 'active')
          .like('phone', `%${cleaned}%`)
          .order('name', { ascending: true })
          .limit(10);

        if (searchErr) throw searchErr;
        return Response.json(results || []);
      }

      const { data: dbUsers, error: fetchErr } = await ctx.supabaseAdmin
        .from('users')
        .select('phone, name, status, created_at, can_create_group, can_register_members')
        .order('name', { ascending: true });

      if (fetchErr) throw fetchErr;

      const formattedUsers = (dbUsers || []).map(u => ({
        phone: u.phone,
        name: u.name,
        status: u.status,
        created_at: u.created_at,
        canCreateGroup: !!u.can_create_group,
        canRegisterMembers: !!u.can_register_members
      }));

      return Response.json(formattedUsers);
    }

    // ─── POST actions ─────────────────────────────────────────────────────────
    if (method === 'POST') {
      const body = await req.json().catch(() => ({}));

      // Toggle active / suspended
      if (action === 'toggle') {
        const { phone } = body;
        if (!phone) return Response.json({ error: 'Phone is required' }, { status: 400 });

        const { data: user, error: fetchErr } = await ctx.supabaseAdmin
          .from('users')
          .select('status')
          .eq('phone', phone)
          .single();

        if (fetchErr || !user) return Response.json({ error: 'User not found' }, { status: 404 });

        const nextStatus = user.status === 'active' ? 'suspended' : 'active';
        const { error: updateErr } = await ctx.supabaseAdmin
          .from('users')
          .update({ status: nextStatus })
          .eq('phone', phone);

        if (updateErr) throw updateErr;

        return Response.json({ message: `User status changed to ${nextStatus}`, status: nextStatus });
      }

      // Create user (admin only)
      if (action === 'create') {
        const { name, phone, password } = body;
        if (!name || !phone || !password) {
          return Response.json({ error: 'All fields are required' }, { status: 400 });
        }

        let cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);

        // Check for existing country code — if missing, default to Kenya 254
        const startsWithCountryCode = /^(254|255|256|257|258|1|44|91|33|49)/.test(cleaned);
        if (!startsWithCountryCode && cleaned.length <= 10) {
          cleaned = '254' + cleaned;
        }

        const { data: existing, error: existErr } = await ctx.supabaseAdmin
          .from('users')
          .select('phone')
          .eq('phone', cleaned)
          .limit(1);

        if (existErr) throw existErr;
        if (existing && existing.length > 0) {
          return Response.json({ error: 'A user with this number already exists.' }, { status: 409 });
        }

        const { error: insertErr } = await ctx.supabaseAdmin
          .from('users')
          .insert({ phone: cleaned, name: name.trim(), password, status: 'active' });

        if (insertErr) throw insertErr;

        return Response.json({ message: 'User created successfully' }, { status: 201 });
      }

      // Reset password (admin only)
      if (action === 'reset_password') {
        const { phone, newPassword } = body;
        if (!phone || !newPassword) {
          return Response.json({ error: 'Phone and new password are required' }, { status: 400 });
        }
        const { data: user, error: existErr } = await ctx.supabaseAdmin
          .from('users')
          .select('phone')
          .eq('phone', phone)
          .limit(1);

        if (existErr || !user || user.length === 0) {
          return Response.json({ error: 'User not found' }, { status: 404 });
        }

        const { error: updateErr } = await ctx.supabaseAdmin
          .from('users')
          .update({ password: newPassword })
          .eq('phone', phone);

        if (updateErr) throw updateErr;

        return Response.json({ message: 'Password reset successfully' });
      }

      // Change own password (self-service) — requires current password verification
      if (action === 'change_password') {
        const { phone, currentPassword, newPassword } = body;
        if (!phone || !currentPassword || !newPassword) {
          return Response.json({ error: 'Phone, current password, and new password are required' }, { status: 400 });
        }
        if (newPassword.length < 4) {
          return Response.json({ error: 'New password must be at least 4 characters long' }, { status: 400 });
        }

        const { data: users, error: fetchErr } = await ctx.supabaseAdmin
          .from('users')
          .select('phone, password')
          .eq('phone', phone)
          .limit(1);

        if (fetchErr) throw fetchErr;

        // Super Admin — verify against either DB password or the legacy seed
        const isAdmin = phone === '254775499650';
        const dbUser = users && users.length > 0 ? users[0] : null;
        const storedPassword = dbUser ? dbUser.password : (isAdmin ? 'admin123' : null);

        if (!storedPassword) {
          return Response.json({ error: 'User not found' }, { status: 404 });
        }
        if (currentPassword !== storedPassword) {
          return Response.json({ error: 'Current password is incorrect' }, { status: 401 });
        }

        if (dbUser) {
          // Update existing DB record
          const { error: updateErr } = await ctx.supabaseAdmin
            .from('users')
            .update({ password: newPassword })
            .eq('phone', phone);
          if (updateErr) throw updateErr;
        } else if (isAdmin) {
          // Super Admin record may not exist in DB yet — upsert it
          const { error: upsertErr } = await ctx.supabaseAdmin
            .from('users')
            .upsert({ phone, name: 'Super Admin', password: newPassword, status: 'active', can_create_group: true, can_register_members: true });
          if (upsertErr) throw upsertErr;
        }

        return Response.json({ message: 'Password changed successfully' });
      }

      // Toggle can_create_group permission
      if (action === 'toggle_group_creation') {
        const { phone } = body;
        if (!phone) return Response.json({ error: 'Phone is required' }, { status: 400 });

        const { data: user, error: fetchErr } = await ctx.supabaseAdmin
          .from('users')
          .select('can_create_group')
          .eq('phone', phone)
          .single();

        if (fetchErr || !user) return Response.json({ error: 'User not found' }, { status: 404 });

        const next = !user.can_create_group;
        const { error: updateErr } = await ctx.supabaseAdmin
          .from('users')
          .update({ can_create_group: next })
          .eq('phone', phone);

        if (updateErr) throw updateErr;

        return Response.json({ message: `Group creation ${next ? 'enabled' : 'disabled'}`, canCreateGroup: next });
      }

      // Toggle can_register_members permission
      if (action === 'toggle_member_registration') {
        const { phone } = body;
        if (!phone) return Response.json({ error: 'Phone is required' }, { status: 400 });

        const { data: user, error: fetchErr } = await ctx.supabaseAdmin
          .from('users')
          .select('can_register_members')
          .eq('phone', phone)
          .single();

        if (fetchErr || !user) return Response.json({ error: 'User not found' }, { status: 404 });

        const next = !user.can_register_members;
        const { error: updateErr } = await ctx.supabaseAdmin
          .from('users')
          .update({ can_register_members: next })
          .eq('phone', phone);

        if (updateErr) throw updateErr;

        return Response.json({ message: `Member registration ${next ? 'enabled' : 'disabled'}`, canRegisterMembers: next });
      }

      // Delete user (admin only)
      if (action === 'delete') {
        const { phone } = body;
        if (!phone) return Response.json({ error: 'Phone is required' }, { status: 400 });

        const { data: user, error: existErr } = await ctx.supabaseAdmin
          .from('users')
          .select('phone')
          .eq('phone', phone)
          .limit(1);

        if (existErr || !user || user.length === 0) {
          return Response.json({ error: 'User not found' }, { status: 404 });
        }

        // Delete user's leads manually to avoid orphan reference issues
        const { error: leadsDelErr } = await ctx.supabaseAdmin
          .from('leads')
          .delete()
          .eq('ref_user_phone', phone);
        if (leadsDelErr) throw leadsDelErr;

        // Delete user
        const { error: userDelErr } = await ctx.supabaseAdmin
          .from('users')
          .delete()
          .eq('phone', phone);
        if (userDelErr) throw userDelErr;

        return Response.json({ message: 'User deleted successfully' });
      }
    }

    return Response.json({ error: 'Invalid method or action' }, { status: 400 });
  } catch (error) {
    console.error('Users handler error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
});
