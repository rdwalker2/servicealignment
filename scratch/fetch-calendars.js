import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.SALESLOFT_API_KEY;

async function fetchCalendars() {
  const token = 'v2_ak_111987_5d3dc65e5c43e592d637faf9f09dc73478b233e01f46c3ad32bbf4ed0aa180ff';
  
  // Fetch events starting from 1 day ago to catch recent/upcoming ones
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const startDate = date.toISOString();

  const resp = await fetch(`https://api.salesloft.com/v2/calendar_events?start_time%5Bgte%5D=${startDate}&sort_by=start_time&sort_direction=ASC`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  
  const data = await resp.json();
  
  if (!data.data || data.data.length === 0) {
    console.log('No upcoming calendar events found.');
    return;
  }
  
  console.log(`Found ${data.data.length} upcoming events.`);
  
  // Just show the first 5 to the user
  const sample = data.data.slice(0, 5);
  
  sample.forEach(ev => {
    console.log(`\n--- Event ID: ${ev.id} ---`);
    console.log(`Title: ${ev.title}`);
    console.log(`Start Time: ${ev.start_time}`);
    console.log(`Attendees/Guests: ${JSON.stringify(ev.guests)}`);
    console.log(`CRM References: ${JSON.stringify(ev.crm_references, null, 2)}`);
  });
}

fetchCalendars();
