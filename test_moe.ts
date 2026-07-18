import { readFileSync } from 'fs';
import { resolve } from 'path';

const envFile = readFileSync(resolve('/Users/ryan.walker/Desktop/teamtailor/.env'), 'utf-8');
const match = envFile.match(/SALESLOFT_API_KEY=(.*)/);

if (match) {
  const apiKey = match[1];
  
  // Moe's GUID
  const guid = 'c70131d4-a2d8-4671-8c27-846340480c63';
  
  // Last 30 days
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  const startIso = start.toISOString().replace(/\.\d+Z$/, '.000000Z');
  const endIso = end.toISOString().replace(/\.\d+Z$/, '.000000Z');

  const url = `https://api.salesloft.com/v2/activities/calls.json?user_guid[]=${guid}&created_at[gte]=${startIso}&created_at[lt]=${endIso}`;
  
  fetch(url, { headers: { 'Authorization': `Bearer ${apiKey}` } })
    .then(r => r.json())
    .then(data => {
      console.log(`Moe calls in last 30 days:`, data.data ? data.data.length : data);
    })
    .catch(console.error);
}
