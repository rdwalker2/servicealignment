import dotenv from 'dotenv';
dotenv.config();

const GRANOLA_API_BASE = 'https://public-api.granola.ai/v1';
const GRANOLA_API_KEY = process.env.GRANOLA_API_KEY;

async function fetchNotes() {
  const resp = await fetch(`${GRANOLA_API_BASE}/notes?limit=10`, {
    headers: {
      'Authorization': `Bearer ${GRANOLA_API_KEY}`,
      'Accept': 'application/json',
    },
  });
  const data = await resp.json();
  const notes = data.notes || data.items || data || [];
  
  for (const note of notes) {
    console.log(`Note ID: ${note.id}, Title: ${note.title}`);
    console.log(`Attendees: ${JSON.stringify(note.attendees)}`);
    console.log('---');
  }
}

fetchNotes();
