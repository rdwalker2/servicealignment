import dotenv from 'dotenv';
dotenv.config();

async function fetchMyRepsCalendars() {
  const token = 'v2_ak_111987_5d3dc65e5c43e592d637faf9f09dc73478b233e01f46c3ad32bbf4ed0aa180ff';
  
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const startDate = date.toISOString();
  
  // The emails of the 3 reps on this team
  const repEmails = [
    'jack.luther@teamtailor.com', 
    'moe.aqel@teamtailor.com',
    'tyler.hanson@teamtailor.com'
  ];

  const url = `https://api.salesloft.com/v2/calendar_events?start_time%5Bgte%5D=${startDate}&sort_by=start_time&sort_direction=ASC&per_page=100`;
  const resp = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  
  const data = await resp.json();
  
  if (!data.data || data.data.length === 0) {
    console.log(`\nNo upcoming calendar events found.`);
    return;
  }
  
  console.log(`Fetched ${data.data.length} global events. Filtering for Jack, Moe, and Tyler...`);
  
  const myRepsEvents = data.data.filter(ev => {
    if (!ev.guests) return false;
    return ev.guests.some(guest => repEmails.includes(guest.toLowerCase()));
  });

  if (myRepsEvents.length === 0) {
    console.log('\n❌ None of the upcoming events on the calendar belong to your 3 reps.');
  } else {
    console.log(`\n✅ Found ${myRepsEvents.length} events for your reps!`);
    myRepsEvents.forEach(ev => {
      console.log(`\n--- Event ID: ${ev.id} ---`);
      console.log(`Title: ${ev.title}`);
      console.log(`Attendees: ${JSON.stringify(ev.guests)}`);
      console.log(`CRM References: ${JSON.stringify(ev.crm_references)}`);
    });
  }
}

fetchMyRepsCalendars();
