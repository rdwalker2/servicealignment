import { readFileSync } from 'fs';
import { resolve } from 'path';

const envFile = readFileSync(resolve('/Users/ryan.walker/Desktop/teamtailor/.env'), 'utf-8');
const match = envFile.match(/SALESLOFT_API_KEY=(.*)/);

if (match) {
  const apiKey = match[1];
  
  // Last 30 days
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  const startIso = start.toISOString().replace(/\.\d+Z$/, '.000000Z');
  const endIso = end.toISOString().replace(/\.\d+Z$/, '.000000Z');

  async function checkUser(name: string, guid: string) {
    const url = `https://api.salesloft.com/v2/activities/calls.json?user_guid[]=${guid}&created_at[gte]=${startIso}&created_at[lt]=${endIso}`;
    const r = await fetch(url, { headers: { 'Authorization': `Bearer ${apiKey}` } });
    const data = await r.json();
    console.log(`${name} calls via user_guid[]:`, data.data ? data.data.length : data);

    const url2 = `https://api.salesloft.com/v2/activities/calls.json?user_guid=${guid}&created_at[gte]=${startIso}&created_at[lt]=${endIso}`;
    const r2 = await fetch(url2, { headers: { 'Authorization': `Bearer ${apiKey}` } });
    const data2 = await r2.json();
    console.log(`${name} calls via user_guid:`, data2.data ? data2.data.length : data2);
  }

  checkUser('Jack', '5b01a11c-6e1b-4312-8487-55542a9f1578')
    .then(() => checkUser('Moe', '515705b8-fbac-423c-a180-0731bcaf6e93'))
    .then(() => checkUser('Tyler', 'c70131d4-a2d8-4671-8c27-846340480c63'));
}
