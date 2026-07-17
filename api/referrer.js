import { withSupabase } from '@supabase/server';

export const config = { runtime: 'edge' };

export default withSupabase({ auth: 'none' }, async (req, ctx) => {
  const url = new URL(req.url);
  const phone = url.searchParams.get('phone');
  const group = url.searchParams.get('group');

  if (req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  if (group) {
    try {
      let membersQuery = ctx.supabaseAdmin
        .from('group_members')
        .select(`
          user_phone,
          groups!inner (
            id,
            name
          )
        `);

      if (/^\d+$/.test(group)) {
        membersQuery = membersQuery.eq('group_id', parseInt(group));
      } else {
        membersQuery = membersQuery.eq('groups.name', group);
      }

      const { data: members, error: memErr } = await membersQuery;
      if (memErr) throw memErr;

      if (members && members.length > 0) {
        const phones = members.map(m => m.user_phone);

        // Get active users for these phones
        const { data: activeUsers, error: userErr } = await ctx.supabaseAdmin
          .from('users')
          .select('phone, name')
          .eq('status', 'active')
          .in('phone', phones);

        if (userErr) throw userErr;

        if (activeUsers && activeUsers.length > 0) {
          const activePhones = activeUsers.map(u => u.phone);

          // Fetch leads for these active phones to count/order by last lead created_at
          const { data: leads, error: leadErr } = await ctx.supabaseAdmin
            .from('leads')
            .select('ref_user_phone, created_at')
            .in('ref_user_phone', activePhones);

          if (leadErr) throw leadErr;

          // Map users to their last lead time (created_at)
          const userLeadTimes = activeUsers.map(u => {
            const userLeads = (leads || []).filter(l => l.ref_user_phone === u.phone);
            const lastTime = userLeads.length > 0
              ? Math.max(...userLeads.map(l => new Date(l.created_at).getTime()))
              : 0; // 0 represents oldest/never received (NULLS FIRST)
            return { ...u, lastTime };
          });

          // Sort: oldest last lead time first (0 first), then phone alphabetically
          userLeadTimes.sort((a, b) => {
            if (a.lastTime !== b.lastTime) {
              return a.lastTime - b.lastTime;
            }
            return a.phone.localeCompare(b.phone);
          });

          return Response.json({ name: userLeadTimes[0].name, phone: userLeadTimes[0].phone });
        }
      }

      // Default fallback if no active members found in the group
      return Response.json({ name: 'Tonny', phone: '254775499650' });
    } catch (error) {
      console.error('Error resolving round robin group referrer:', error);
      return Response.json({ name: 'Tonny', phone: '254775499650' });
    }
  }

  if (!phone) {
    return Response.json({ name: 'Tonny', phone: '254775499650' });
  }

  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  try {
    // Lookup user in DB using flexible phone matching
    const { data: dbUsers, error: fetchErr } = await ctx.supabaseAdmin
      .from('users')
      .select('name, phone')
      .or(`phone.eq.${cleaned},phone.like.%${cleaned}`);

    if (fetchErr) throw fetchErr;

    const matchedUser = (dbUsers || []).find(u => {
      return u.phone === cleaned ||
        (cleaned.length >= 7 && u.phone.endsWith(cleaned)) ||
        (u.phone.length >= 7 && cleaned.endsWith(u.phone));
    });

    if (matchedUser) {
      return Response.json({ name: matchedUser.name, phone: matchedUser.phone });
    }

    // Fallback
    return Response.json({ name: 'Tonny', phone: cleaned });
  } catch (error) {
    console.error('Referrer endpoint error:', error);
    return Response.json({ name: 'Tonny', phone: phone });
  }
});
