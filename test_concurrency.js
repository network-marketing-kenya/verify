import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function runTest() {
  console.log('=== REAL CONCURRENCY ROUND-ROBIN TEST (30 LEADS) ===\n');

  const groupId = 5; // Group ID for "My new 2026 team 😊"
  console.log(`1. Fetching group details for Group ID: ${groupId}...`);

  const { data: group, error: groupErr } = await supabase
    .from('groups')
    .select('id, name')
    .eq('id', groupId)
    .single();

  if (groupErr || !group) {
    console.error('Error finding Group 5. Please ensure Group 5 exists in the DB.', groupErr);
    process.exit(1);
  }

  console.log(`Group Name: "${group.name}"`);

  // Fetch only the REAL active members of this group
  console.log('2. Fetching real active group members from database...');
  const { data: members, error: memErr } = await supabase
    .from('group_members')
    .select('user_phone')
    .eq('group_id', groupId);

  if (memErr || !members || members.length === 0) {
    console.error('No members found in Group 5.', memErr);
    process.exit(1);
  }

  const phones = members.map(m => m.user_phone);

  const { data: activeUsers, error: userErr } = await supabase
    .from('users')
    .select('phone, name')
    .eq('status', 'active')
    .in('phone', phones);

  if (userErr || !activeUsers || activeUsers.length === 0) {
    console.error('No active users found in Group 5.', userErr);
    process.exit(1);
  }

  console.log('\nActive Group Members who will receive leads:');
  activeUsers.forEach(u => console.log(`- ${u.name} (${u.phone})`));
  console.log('');

  // 3. Trigger 30 concurrent lead creations for these real members
  console.log(`3. Simulating 30 concurrent visitor registrations...`);
  
  const requests = Array.from({ length: 30 }).map((_, index) => {
    // Generate a unique phone number based on timestamp and index to guarantee fresh leads
    const uniqueVal = String(Date.now()).substring(5) + String(100 + index).substring(1);
    const leadNum = `254707${uniqueVal}`;
    return supabase.rpc('create_lead_with_round_robin', {
      p_name: `Surge Test Lead ${index + 1}`,
      p_country_name: 'Kenya',
      p_country_code: 'KE',
      p_dial_code: '+254',
      p_raw_number: leadNum.substring(4),
      p_full_number: leadNum,
      p_ref_user_phone: null,
      p_group_id: groupId
    });
  });


  console.log('Sending all 30 requests in parallel via Promise.all...');
  const startTime = Date.now();
  const responses = await Promise.all(requests);
  const duration = Date.now() - startTime;

  console.log(`Finished processing 30 parallel requests in ${duration}ms.\n`);

  // 4. Analyze assignments
  console.log('4. Analyzing Lead Assignment Results:');
  const assignmentCounts = {};

  responses.forEach((res, index) => {
    if (res.error) {
      console.error(`Request ${index + 1} failed:`, res.error);
    } else {
      const details = res.data?.[0];
      const assignedTo = details?.out_assigned_phone;
      const status = details?.out_status;

      // Find the user name
      const userName = activeUsers.find(u => u.phone === assignedTo)?.name || 'Unknown User';
      console.log(`Lead ${index + 1} -> Assigned to: ${userName} (${assignedTo}) [Status: ${status}]`);
      assignmentCounts[userName] = (assignmentCounts[userName] || 0) + 1;
    }
  });

  console.log('\n=== ASSIGNMENT SUMMARY ===');
  console.log(JSON.stringify(assignmentCounts, null, 2));
  console.log('\nNote: Leads have NOT been deleted from the database so that you can open the website and verify they show up in each member\'s dashboard!');
}

runTest();
