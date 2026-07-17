import { withSupabase } from '@supabase/server';

export const config = { runtime: 'edge' };

async function syncLeadsSequence(supabaseAdmin) {
  if (!supabaseAdmin) return;
  try {
    const { error } = await supabaseAdmin.rpc('sync_leads_sequence');
    if (error) {
      console.error('Error syncing leads sequence via Supabase RPC:', error);
    } else {
      console.log('Successfully synced leads table sequence via Supabase RPC.');
    }
  } catch (err) {
    console.error('Error syncing leads sequence:', err);
  }
}

export default withSupabase({ auth: 'none' }, async (req, ctx) => {
  const { method } = req;
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  try {
    // ─── GET ─────────────────────────────────────────────────────────────────
    if (method === 'GET') {
      const refUserPhone = url.searchParams.get('refUserPhone');

      let query = ctx.supabaseAdmin
        .from('leads')
        .select('id, name, country_name, country_code, dial_code, raw_number, full_number, ref_user_phone, created_at, exported, verified, seen, group_id')
        .order('name', { ascending: true });

      if (refUserPhone) {
        query = query.eq('ref_user_phone', refUserPhone);
      }

      const { data: dbLeads, error: fetchErr } = await query;
      if (fetchErr) throw fetchErr;

      const formattedLeads = (dbLeads || []).map(l => ({
        id: l.id,
        name: l.name,
        countryName: l.country_name,
        countryCode: l.country_code,
        dialCode: l.dial_code,
        rawNumber: l.raw_number,
        fullNumber: l.full_number,
        refUserPhone: l.ref_user_phone,
        timestamp: l.created_at,
        exported: !!l.exported,
        verified: !!l.verified,
        seen: !!l.seen,
        groupId: l.group_id,
      }));

      return Response.json(formattedLeads);
    }

    // ─── POST ────────────────────────────────────────────────────────────────
    if (method === 'POST') {
      const body = await req.json().catch(() => ({}));

      // ── Create lead ────────────────────────────────────────────────────────
      if (action === 'create') {
        const { name, countryName, countryCode, dialCode, rawNumber, fullNumber, refUserPhone, groupId } = body;

        if (!name || !fullNumber) {
          return Response.json({ error: 'Name and phone number are required' }, { status: 400 });
        }

        // Call the bulletproof transaction-locked round-robin RPC function
        const { data, error: rpcErr } = await ctx.supabaseAdmin.rpc('create_lead_with_round_robin', {
          p_name: name,
          p_country_name: countryName || null,
          p_country_code: countryCode || null,
          p_dial_code: dialCode || null,
          p_raw_number: rawNumber || null,
          p_full_number: fullNumber,
          p_ref_user_phone: refUserPhone || null,
          p_group_id: groupId ? parseInt(groupId) : null
        });

        if (rpcErr) throw rpcErr;

        const result = data && data.length > 0 ? data[0] : null;
        if (!result) {
          return Response.json({ error: 'Failed to save contact information' }, { status: 500 });
        }

        // Handle duplicate detection returned from database function
        if (result.out_status === 'duplicate') {
          return Response.json({
            error: 'duplicate',
            message: 'You have already registered through this group!',
            assignedMemberPhone: result.out_assigned_phone,
          }, { status: 409 });
        }

        return Response.json({
          message: 'Lead created successfully',
          id: result.out_lead_id,
          timestamp: result.out_created_at,
          assignedPhone: result.out_assigned_phone,
        }, { status: 201 });
      }



      // ── Mark exported ──────────────────────────────────────────────────────
      if (action === 'mark_exported') {
        const { ids } = body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
          return Response.json({ error: 'IDs array is required' }, { status: 400 });
        }
        const { error: updErr } = await ctx.supabaseAdmin
          .from('leads')
          .update({ exported: true })
          .in('id', ids);
        if (updErr) throw updErr;
        return Response.json({ message: 'Leads marked as exported successfully' });
      }

      // ── Verify lead ────────────────────────────────────────────────────────
      if (action === 'verify') {
        const { id } = body;
        if (!id) return Response.json({ error: 'Lead ID is required' }, { status: 400 });
        const { error: updErr } = await ctx.supabaseAdmin
          .from('leads')
          .update({ verified: true })
          .eq('id', id);
        if (updErr) throw updErr;
        return Response.json({ message: 'Lead marked as verified successfully' });
      }

      // ── Mark seen ──────────────────────────────────────────────────────────
      if (action === 'mark_seen') {
        const { id } = body;
        if (!id) return Response.json({ error: 'Lead ID is required' }, { status: 400 });
        const { error: updErr } = await ctx.supabaseAdmin
          .from('leads')
          .update({ seen: true })
          .eq('id', id);
        if (updErr) throw updErr;
        return Response.json({ message: 'Lead marked as seen' });
      }

      // ── Create WA Log ──────────────────────────────────────────────────────
      if (action === 'create_wa_log') {
        const { userPhone, timestamp } = body;
        if (!userPhone || !timestamp) {
          return Response.json({ error: 'User phone and timestamp are required' }, { status: 400 });
        }
        const { error: insErr } = await ctx.supabaseAdmin
          .from('leads')
          .insert({
            name: '__wa_log__',
            country_name: 'WA Log',
            country_code: 'WA',
            dial_code: '',
            raw_number: '',
            full_number: timestamp.toString(),
            ref_user_phone: userPhone,
            seen: true,
            verified: false,
            exported: false
          });
        if (insErr) throw insErr;
        return Response.json({ message: 'WA log stored successfully' });
      }

      // ── Create SMS Log ─────────────────────────────────────────────────────
      if (action === 'create_sms_log') {
        const { userPhone, timestamp } = body;
        if (!userPhone || !timestamp) {
          return Response.json({ error: 'User phone and timestamp are required' }, { status: 400 });
        }
        const { error: insErr } = await ctx.supabaseAdmin
          .from('leads')
          .insert({
            name: '__sms_log__',
            country_name: 'SMS Log',
            country_code: 'SMS',
            dial_code: '',
            raw_number: '',
            full_number: timestamp.toString(),
            ref_user_phone: userPhone,
            seen: true,
            verified: false,
            exported: false
          });
        if (insErr) throw insErr;
        return Response.json({ message: 'SMS log stored successfully' });
      }

      // ── Reset Unseen Leads (Admin Only) ────────────────────────────────────
      if (action === 'reset_unseen_leads') {
        const { adminPhone, targetUserPhone } = body;
        if (!adminPhone || !targetUserPhone) {
          return Response.json({ error: 'Admin phone and target user phone are required' }, { status: 400 });
        }

        // 1. Security Safeguard: Only accounts with Admin roles can execute this
        if (adminPhone !== '254775499650') {
          return Response.json({ error: 'Forbidden: Only accounts with Admin roles/permissions can execute this counter-reset API endpoint.' }, { status: 403 });
        }

        // Double check in database that the admin user is active
        const { data: adminUser, error: adminErr } = await ctx.supabaseAdmin
          .from('users')
          .select('phone, status')
          .eq('phone', adminPhone)
          .single();

        if (adminErr || !adminUser || adminUser.status !== 'active') {
          return Response.json({ error: 'Forbidden: Admin authorization failed.' }, { status: 403 });
        }

        // 2. Perform the counter reset: mark all currently unseen leads on that target user's dashboard as seen/processed
        const { error: resetErr } = await ctx.supabaseAdmin
          .from('leads')
          .update({ seen: true })
          .eq('ref_user_phone', targetUserPhone)
          .eq('seen', false);

        if (resetErr) throw resetErr;

        return Response.json({ message: 'Unseen lead counter reset to zero successfully' });
      }


      // ── Create Skip Log ────────────────────────────────────────────────────
      if (action === 'create_skip_log') {
        const { userPhone, leadId } = body;
        if (!userPhone || !leadId) {
          return Response.json({ error: 'User phone and lead ID are required' }, { status: 400 });
        }
        const { error: insErr } = await ctx.supabaseAdmin
          .from('leads')
          .insert({
            name: '__skip_log__',
            country_name: 'Skip Log',
            country_code: 'SKIP',
            dial_code: '',
            raw_number: '',
            full_number: leadId.toString(),
            ref_user_phone: userPhone,
            seen: true,
            verified: false,
            exported: false
          });
        if (insErr) throw insErr;
        return Response.json({ message: 'Skip log stored successfully' });
      }
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────
    if (method === 'DELETE') {
      if (action === 'delete_single') {
        const id = url.searchParams.get('id');
        if (!id) return Response.json({ error: 'Lead ID is required' }, { status: 400 });
        const { error: delErr } = await ctx.supabaseAdmin
          .from('leads')
          .delete()
          .eq('id', parseInt(id));
        if (delErr) throw delErr;
        return Response.json({ message: 'Lead deleted successfully' });
      }

      if (action === 'clear') {
        const { error: delErr } = await ctx.supabaseAdmin
          .from('leads')
          .delete()
          .neq('id', 0); // delete all rows
        if (delErr) throw delErr;
        return Response.json({ message: 'All leads cleared successfully' });
      }
    }

    return Response.json({ error: 'Invalid method or action' }, { status: 400 });
  } catch (error) {
    console.error('Leads handler error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
});
