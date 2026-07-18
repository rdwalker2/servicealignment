import fs from 'fs';
import path from 'path';

// Parse .env manually so we don't need external dependencies
const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length > 0) {
    env[key.trim()] = vals.join('=').trim();
  }
});

const SUPABASE_URL = env['VITE_SUPABASE_URL'];
const SUPABASE_ANON_KEY = env['VITE_SUPABASE_ANON_KEY'];

const WEBHOOK_URL = `${SUPABASE_URL}/rest/v1/clay_signals`;

async function fetchSignals() {
  const response = await fetch(WEBHOOK_URL, {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    console.error('Failed!', response.status, await response.text());
  } else {
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  }
}

fetchSignals();
