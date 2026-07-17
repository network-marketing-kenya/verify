import { withSupabase } from '@supabase/server';

export const config = { runtime: 'edge' };

export default withSupabase({ auth: 'none' }, async (req, ctx) => {
  const { method } = req;
  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  const scope = url.searchParams.get('scope');

  try {
    // ─── GET ─────────────────────────────────────────────────────────────────
    if (method === 'GET') {
      // Return pending group requests (admin)
      if (scope === 'requests') {
        const { data: requests, error: reqErr } = await ctx.supabaseAdmin
          .from('group_requests')
          .select(`
            id,
            group_name,
            status,
            created_at,
            requested_by_phone,
            users!group_requests_requested_by_phone_fkey (
              name
            )
          `)
          .order('created_at', { ascending: false });

        if (reqErr) throw reqErr;

        const formattedRequests = (requests || []).map(r => ({
          id: r.id,
          group_name: r.group_name,
          status: r.status,
          created_at: r.created_at,
          requestedByPhone: r.requested_by_phone,
          requestedByName: r.users ? r.users.name : null
        }));

        return Response.json(formattedRequests);
      }

      // Return all groups with member details
      const { data: groupsData, error: groupsErr } = await ctx.supabaseAdmin
        .from('groups')
        .select(`
          id,
          name,
          created_by_phone,
          users!groups_created_by_phone_fkey (
            name
          ),
          group_members (
            user_phone,
            users!group_members_user_phone_fkey (
              name
            )
          )
        `)
        .order('name', { ascending: true });

      if (groupsErr) throw groupsErr;

      const formattedGroups = (groupsData || []).map(g => {
        const membersList = (g.group_members || [])
          .filter(m => m.users !== null)
          .map(m => ({
            phone: m.user_phone,
            name: m.users.name
          }));

        return {
          id: g.id,
          name: g.name,
          createdByPhone: g.created_by_phone,
          creatorName: g.users ? g.users.name : null,
          members: membersList
        };
      });

      return Response.json(formattedGroups);
    }

    // ─── POST ────────────────────────────────────────────────────────────────
    if (method === 'POST') {
      const body = await req.json().catch(() => ({}));

      // ── Admin: Create group directly ────────────────────────────────────────
      if (action === 'create') {
        const { name } = body;
        if (!name || !name.trim()) return Response.json({ error: 'Group name is required' }, { status: 400 });

        const trimmedName = name.trim();
        const { data: existing, error: existErr } = await ctx.supabaseAdmin
          .from('groups')
          .select('id')
          .eq('name', trimmedName)
          .limit(1);

        if (existErr) throw existErr;
        if (existing && existing.length > 0) {
          return Response.json({ error: 'A group with this name already exists.' }, { status: 409 });
        }

        const { data: created, error: createErr } = await ctx.supabaseAdmin
          .from('groups')
          .insert({ name: trimmedName })
          .select('id')
          .single();

        if (createErr) throw createErr;

        return Response.json({ message: 'Group created successfully', id: created.id }, { status: 201 });
      }

      // ── Admin: Delete group ─────────────────────────────────────────────────
      if (action === 'delete') {
        const { id } = body;
        if (!id) return Response.json({ error: 'Group ID is required' }, { status: 400 });
        const { error: deleteErr } = await ctx.supabaseAdmin
          .from('groups')
          .delete()
          .eq('id', parseInt(id));

        if (deleteErr) throw deleteErr;
        return Response.json({ message: 'Group deleted successfully' });
      }

      // ── Admin: Update members (add/remove by phone list) ────────────────────
      if (action === 'update_members') {
        const { id, memberPhones } = body;
        if (!id) return Response.json({ error: 'Group ID is required' }, { status: 400 });

        const groupId = parseInt(id);
        // Delete all members in group
        const { error: delErr } = await ctx.supabaseAdmin
          .from('group_members')
          .delete()
          .eq('group_id', groupId);
        if (delErr) throw delErr;

        if (memberPhones && Array.isArray(memberPhones) && memberPhones.length > 0) {
          const inserts = memberPhones.map(phone => ({
            group_id: groupId,
            user_phone: phone
          }));
          const { error: insErr } = await ctx.supabaseAdmin
            .from('group_members')
            .insert(inserts);
          if (insErr) throw insErr;
        }
        return Response.json({ message: 'Group members updated successfully' });
      }

      // ── Admin: Add single member ────────────────────────────────────────────
      if (action === 'add_member') {
        const { groupId, userPhone } = body;
        if (!groupId || !userPhone) return Response.json({ error: 'groupId and userPhone are required' }, { status: 400 });

        const { data: check } = await ctx.supabaseAdmin
          .from('group_members')
          .select('id')
          .eq('group_id', parseInt(groupId))
          .eq('user_phone', userPhone)
          .limit(1);

        if (!check || check.length === 0) {
          const { error: insertErr } = await ctx.supabaseAdmin
            .from('group_members')
            .insert({ group_id: parseInt(groupId), user_phone: userPhone });
          if (insertErr) throw insertErr;
        }

        return Response.json({ message: 'Member added to group' });
      }

      // ── Admin: Remove single member ─────────────────────────────────────────
      if (action === 'remove_member') {
        const { groupId, userPhone } = body;
        if (!groupId || !userPhone) return Response.json({ error: 'groupId and userPhone are required' }, { status: 400 });

        const { error: delErr } = await ctx.supabaseAdmin
          .from('group_members')
          .delete()
          .eq('group_id', parseInt(groupId))
          .eq('user_phone', userPhone);

        if (delErr) throw delErr;
        return Response.json({ message: 'Member removed from group' });
      }

      // ── Member: Request group creation ──────────────────────────────────────
      if (action === 'request_create') {
        const { groupName, requestedByPhone } = body;
        if (!groupName || !requestedByPhone) {
          return Response.json({ error: 'Group name and requestor phone are required' }, { status: 400 });
        }

        // Check if a pending request with this name already exists
        const { data: existingReq, error: checkErr } = await ctx.supabaseAdmin
          .from('group_requests')
          .select('id')
          .eq('group_name', groupName.trim())
          .eq('status', 'pending')
          .limit(1);

        if (checkErr) throw checkErr;
        if (existingReq && existingReq.length > 0) {
          return Response.json({ error: 'A pending request for this group name already exists.' }, { status: 409 });
        }

        const { error: insertErr } = await ctx.supabaseAdmin
          .from('group_requests')
          .insert({ group_name: groupName.trim(), requested_by_phone: requestedByPhone, status: 'pending' });

        if (insertErr) throw insertErr;
        return Response.json({ message: 'Group creation request submitted. Awaiting admin approval.' }, { status: 201 });
      }

      // ── Admin: Approve group request ────────────────────────────────────────
      if (action === 'approve_request') {
        const { id } = body;
        if (!id) return Response.json({ error: 'Request ID is required' }, { status: 400 });

        const { data: reqRow, error: fetchErr } = await ctx.supabaseAdmin
          .from('group_requests')
          .select('*')
          .eq('id', parseInt(id))
          .single();

        if (fetchErr || !reqRow) return Response.json({ error: 'Request not found' }, { status: 404 });

        const group_name = reqRow.group_name;
        const requested_by_phone = reqRow.requested_by_phone;

        // Create the actual group
        const { data: existing } = await ctx.supabaseAdmin
          .from('groups')
          .select('id')
          .eq('name', group_name)
          .limit(1);

        let newGroupId;
        if (existing && existing.length > 0) {
          newGroupId = existing[0].id;
        } else {
          const { data: created, error: createErr } = await ctx.supabaseAdmin
            .from('groups')
            .insert({ name: group_name, created_by_phone: requested_by_phone })
            .select('id')
            .single();

          if (createErr) throw createErr;
          newGroupId = created.id;

          // Auto-add the requester as a member of the new group
          await ctx.supabaseAdmin
            .from('group_members')
            .insert({ group_id: newGroupId, user_phone: requested_by_phone });
        }

        const { error: updErr } = await ctx.supabaseAdmin
          .from('group_requests')
          .update({ status: 'approved' })
          .eq('id', parseInt(id));

        if (updErr) throw updErr;

        return Response.json({ message: 'Group approved and created', groupId: newGroupId });
      }

      // ── Admin: Reject group request ─────────────────────────────────────────
      if (action === 'reject_request') {
        const { id } = body;
        if (!id) return Response.json({ error: 'Request ID is required' }, { status: 400 });

        const { error: updErr } = await ctx.supabaseAdmin
          .from('group_requests')
          .update({ status: 'rejected' })
          .eq('id', parseInt(id));

        if (updErr) throw updErr;
        return Response.json({ message: 'Group request rejected' });
      }
    }

    return Response.json({ error: 'Invalid method or action' }, { status: 400 });
  } catch (error) {
    console.error('Groups handler error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
});
