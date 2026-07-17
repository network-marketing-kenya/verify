import { withSupabase } from '@supabase/server';

export const config = { runtime: 'edge' };

export default withSupabase({ auth: 'none' }, async (req, ctx) => {
  const { method } = req;
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  if (method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { name, phone, password } = body;

    // ── Login ────────────────────────────────────────────────────────────────
    if (action === 'login') {
      if (!phone || !password) {
        return Response.json({ error: 'Phone and password are required' }, { status: 400 });
      }

      let cleanedPhone = phone.trim().replace(/\D/g, '');
      if (cleanedPhone.startsWith('0')) cleanedPhone = cleanedPhone.substring(1);

      // Fetch candidates matching the phone (partial match) — includes Super Admin
      const { data: dbUsers, error: dbErr } = await ctx.supabaseAdmin
        .from('users')
        .select('*')
        .or(`phone.eq.${cleanedPhone},phone.like.%${cleanedPhone}`);

      if (dbErr) throw dbErr;

      const matchedUser = (dbUsers || []).find(u => {
        return u.phone === cleanedPhone ||
          (cleanedPhone.length >= 7 && u.phone.endsWith(cleanedPhone)) ||
          (u.phone.length >= 7 && cleanedPhone.endsWith(u.phone));
      });

      // Super Admin fallback: if the DB record doesn't exist yet, allow the seed credentials
      if (!matchedUser) {
        if (cleanedPhone === '254775499650' && password === 'admin123') {
          return Response.json({ name: 'Super Admin', phone: '254775499650', role: 'admin' });
        }
        return Response.json({ error: 'Invalid credentials. Please try again.' }, { status: 401 });
      }

      if (matchedUser.password !== password) {
        return Response.json({ error: 'Invalid credentials. Please try again.' }, { status: 401 });
      }
      if (matchedUser.status === 'suspended') {
        return Response.json({ error: 'Your downline dashboard has been suspended. Contact Super Admin Tonny.' }, { status: 403 });
      }

      // Determine role — admin if phone is the Super Admin phone
      const role = matchedUser.phone === '254775499650' ? 'admin' : 'user';
      return Response.json({ name: matchedUser.name, phone: matchedUser.phone, status: matchedUser.status, role });
    }


    // ── Register ─────────────────────────────────────────────────────────────
    if (action === 'register') {
      if (!name || !phone || !password) {
        return Response.json({ error: 'All fields are required' }, { status: 400 });
      }

      let cleanedPhone = phone.trim().replace(/\D/g, '');
      if (cleanedPhone.startsWith('0')) cleanedPhone = cleanedPhone.substring(1);

      const { data: existingUsers, error: existErr } = await ctx.supabaseAdmin
        .from('users')
        .select('phone')
        .or(`phone.eq.${cleanedPhone},phone.like.%${cleanedPhone}`);

      if (existErr) throw existErr;

      const alreadyExists = (existingUsers || []).some(u => {
        return u.phone === cleanedPhone ||
          (cleanedPhone.length >= 7 && u.phone.endsWith(cleanedPhone)) ||
          (u.phone.length >= 7 && cleanedPhone.endsWith(u.phone));
      });

      if (alreadyExists) {
        return Response.json({ error: 'An account with this phone number already exists.' }, { status: 409 });
      }

      const { error: insertErr } = await ctx.supabaseAdmin
        .from('users')
        .insert({ phone: cleanedPhone, name: name.trim(), password, status: 'active' });

      if (insertErr) throw insertErr;

      return Response.json({ message: 'User registered successfully' }, { status: 201 });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth handler error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
});
