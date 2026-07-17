import { withSupabase } from '@supabase/server';
import { generateText } from './ai_engine.js';

export const config = { runtime: 'edge' };

export default withSupabase({ auth: 'none' }, async (req, ctx) => {
  const { method } = req;

  if (method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return Response.json({
      error: 'API Key missing',
      message: 'Please configure your GEMINI_API_KEY in the Secrets panel of Google AI Studio Settings. Once added, the AI Copilot will be fully functional!'
    }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { message: userQuery } = body;

    if (!userQuery) {
      return Response.json({ error: 'Query message is required' }, { status: 400 });
    }

    // 1. Fetch live system snapshot from Supabase database in parallel
    const [usersResult, groupsResult, leadsResult] = await Promise.all([
      ctx.supabaseAdmin.from('users').select('phone, name, status, created_at'),
      ctx.supabaseAdmin.from('groups').select(`
        id,
        name,
        created_by_phone,
        group_members (
          user_phone
        )
      `),
      ctx.supabaseAdmin.from('leads').select('id, name, full_number, ref_user_phone, created_at, verified, seen, group_id')
    ]);

    if (usersResult.error) throw usersResult.error;
    if (groupsResult.error) throw groupsResult.error;
    if (leadsResult.error) throw leadsResult.error;

    const dbUsers = usersResult.data;
    const dbGroups = groupsResult.data;
    const dbLeads = leadsResult.data;

    // 2. Process data for Gemini context
    const totalUsers = dbUsers?.length || 0;
    const totalGroups = dbGroups?.length || 0;

    // Filter out log/telemetry entries from actual leads
    const actualLeads = (dbLeads || []).filter(l => l.name !== '__wa_log__' && l.name !== '__skip_log__');
    const totalActiveLeads = actualLeads.length;
    const totalVerifiedLeads = actualLeads.filter(l => l.verified).length;
    const totalSeenLeads = actualLeads.filter(l => l.seen).length;

    // Compute stats per group
    const groupStats = (dbGroups || []).map(g => {
      const groupLeads = actualLeads.filter(l => String(l.group_id) === String(g.id));
      const membersList = g.group_members || [];
      const memberCount = membersList.length;

      // Group progression metrics
      const totalAssigned = groupLeads.length;
      const seenLeads = groupLeads.filter(l => l.seen).length;
      const progressPct = totalAssigned > 0 ? Math.round((seenLeads / totalAssigned) * 100) : 0;

      // Breakdown of lead counts per member in this group
      const memberBreakdowns = membersList.map(m => {
        const userObj = dbUsers.find(u => u.phone === m.user_phone);
        const name = userObj ? userObj.name : 'Unknown User';
        const mLeads = groupLeads.filter(l => l.ref_user_phone === m.user_phone);
        const mTotal = mLeads.length;
        const mSeen = mLeads.filter(l => l.seen).length;
        const mUnseen = mTotal - mSeen;
        const mProgress = mTotal > 0 ? Math.round((mSeen / mTotal) * 100) : 0;

        return {
          name,
          phone: m.user_phone,
          totalGroupLeads: mTotal,
          seenGroupLeads: mSeen,
          unseenGroupLeads: mUnseen,
          progress: mProgress
        };
      });

      return {
        id: g.id,
        name: g.name,
        memberCount,
        totalLeadsInGroup: totalAssigned,
        progressPct,
        members: memberBreakdowns
      };
    });

    // Compute Personal Direct Leads (Personal Dashboard Leads) per registered user
    const personalLeadsStats = (dbUsers || []).map(u => {
      const personalLeads = actualLeads.filter(l => (!l.group_id || l.group_id === null) && l.ref_user_phone === u.phone);
      const totalPersonal = personalLeads.length;
      const seenPersonal = personalLeads.filter(l => l.seen).length;
      const unseenPersonal = totalPersonal - seenPersonal;
      const progressPct = totalPersonal > 0 ? Math.round((seenPersonal / totalPersonal) * 100) : 0;

      return {
        name: u.name,
        phone: u.phone,
        totalPersonalLeads: totalPersonal,
        seenPersonalLeads: seenPersonal,
        unseenPersonalLeads: unseenPersonal,
        progress: progressPct
      };
    });

    // Pinpoint inactive or struggling members ("stuck" members) in groups
    // Stuck members are defined as those with unseen leads and < 40% progress, or have >= 2 unseen leads.
    const stuckMembers = [];
    groupStats.forEach(g => {
      g.members.forEach(m => {
        if (m.unseenGroupLeads >= 2 || (m.totalGroupLeads > 0 && m.progress < 40)) {
          stuckMembers.push({
            groupName: g.name,
            memberName: m.name,
            phone: m.phone,
            totalGroupLeads: m.totalGroupLeads,
            unseenGroupLeads: m.unseenGroupLeads,
            progress: m.progress
          });
        }
      });
    });

    // 3. Draft system prompt containing the live database data
    const systemPrompt = `You are the Expert AI Copilot and System Analyst for Tonny's Contacts Collection System (designed to capture leads from Facebook Ads and distribute them to rotation groups using a round-robin system).
Your purpose is to help the administrator (Tonny) track and optimize team performances, analyze real-time leads flow, and identify where to focus.

### DICTIONARY & CONCEPTS (HOW TO DIFFERENTIATE LEADS):
1. **Personal Dashboard Leads (Direct Referral Leads)**:
   - These are leads captured directly via an individual member's referral/invitation link.
   - Database rule: group_id is null or empty, and ref_user_phone matches the user's phone number.
   - These leads are unique to that particular person's personal dashboard/link and are NOT shared or distributed to any rotation group.
2. **Group-Assigned Leads (Rotation Group Leads)**:
   - These are leads captured via a group's referral/invitation link and automatically distributed to group members using a round-robin rotation pattern.
   - Database rule: group_id is valid/not-null, and ref_user_phone indicates which member received it in rotation.
   - These leads belong strictly to the group rotation process.

You have direct, real-time read access to the system database. Here is the current live system snapshot:

### OVERALL METRICS
- Total Registered Users/Members: ${totalUsers}
- Total Lead Rotation Groups: ${totalGroups}
- Total Active Leads Collected: ${totalActiveLeads}
- Total Seen/Followed-up Leads: ${totalSeenLeads}
- Total Verified Leads (Highly Engaged): ${totalVerifiedLeads}
- Overall System Completion Rate: ${totalActiveLeads > 0 ? Math.round((totalSeenLeads / totalActiveLeads) * 100) : 0}%

### 1. PERSONAL DASHBOARD LEADS STATS (BY USER - NOT GROUP)
${JSON.stringify(personalLeadsStats, null, 2)}

### 2. GROUP-WISE LIVE STATS (BY ROTATION GROUP)
${JSON.stringify(groupStats, null, 2)}

### MEMBERS WHO NEED IMMEDIATE FOCUS (STUCK / LOW PROGRESS WITH UNSEEN GROUP LEADS)
${JSON.stringify(stuckMembers, null, 2)}

---

### INSTRUCTIONS FOR YOUR RESPONSE:
1. ANSWER DIRECTLY: Focus entirely on answering the user's exact request or question. Do not provide a generic full report, summary, or general metrics unless the user explicitly asks for a general health check, full summary, or overall status.
2. DIFFERENTIATE CAREFULLY: Always differentiate between a user's **Personal Dashboard Leads** (where group_id is null) and their **Group-Assigned Leads** (leads they got from their membership in a rotation group). Be crystal clear when replying which one you are talking about.
3. Concise & Relevant: Get straight to the point. Avoid lengthy introductory boilerplate, generic motivational slogans, or dumping irrelevant database tables unless requested.
4. Exact Data: Use the live database snapshot above to answer with precise numbers. Do not simulate or guess information.
5. Target Bottlenecks on Demand: Only highlight stuck members or suggest sending WhatsApp reminders (using the "Remind Action" button) if the user's query asks about lags, bottlenecks, or who needs attention.
6. Tone: Direct, warm, professional, and clear. Use clean Markdown elements (bold text, bullet points) only where they make the answer easier to read.`;

    // 4. Query multi-provider AI Engine with resilient failover rotation
    let outputText = 'I was unable to analyze the data. Please try again.';
    let activeProvider = 'Unknown Provider';
    try {
      const result = await generateText({
        prompt: userQuery,
        systemInstruction: systemPrompt,
        maxTokens: 1500,
        temperature: 0.7
      });
      if (result && result.text) {
        outputText = result.text;
        activeProvider = result.providerName || 'Unknown Provider';
        console.log(`[ai_copilot] Analyzed successfully using provider: ${activeProvider}`);
      }
    } catch (err) {
      console.error('[ai_copilot] Fallback engine generation failed:', err.message || err);
      throw err;
    }

    return Response.json({
      text: outputText,
      provider: activeProvider,
      snapshot: {
        totalActiveLeads,
        totalVerifiedLeads,
        totalSeenLeads,
        totalGroups,
        totalUsers
      }
    });

  } catch (error) {
    console.error('AI Copilot route error:', error);
    return Response.json({
      error: 'analysis_failed',
      message: error.message || 'The AI assistant encountered an issue analyzing the database.'
    }, { status: 500 });
  }
});
