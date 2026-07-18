import { readFileSync } from 'fs';
import { resolve } from 'path';

const envFile = readFileSync(resolve('/Users/ryan.walker/Desktop/teamtailor/.env'), 'utf-8');
const match = envFile.match(/SALESLOFT_API_KEY=(.*)/);

if (match) {
  const apiKey = match[1];
  
  async function auditSalesloft() {
    console.log('--- SALESLOFT DATA AUDIT ---');
    // Fetch last 100 calls across the team
    const url = `https://api.salesloft.com/v2/activities/calls.json?per_page=100`;
    const r = await fetch(url, { headers: { 'Authorization': `Bearer ${apiKey}` } });
    const data = await r.json();
    
    if (!data.data) {
      console.log('Failed to fetch data:', data);
      return;
    }
    
    const calls = data.data;
    console.log(`Fetched ${calls.length} recent calls.`);
    
    const dispositions: Record<string, number> = {};
    const sentiments: Record<string, number> = {};
    const durationBuckets = { '0': 0, '1-15s': 0, '15-120s': 0, '>120s': 0 };
    
    calls.forEach((c: any) => {
      const disp = c.disposition || 'NO_DISPOSITION';
      dispositions[disp] = (dispositions[disp] || 0) + 1;
      
      const sent = c.sentiment || 'NO_SENTIMENT';
      sentiments[sent] = (sentiments[sent] || 0) + 1;
      
      const d = c.duration || 0;
      if (d === 0) durationBuckets['0']++;
      else if (d <= 15) durationBuckets['1-15s']++;
      else if (d <= 120) durationBuckets['15-120s']++;
      else durationBuckets['>120s']++;
    });
    
    console.log('\n--- Dispositions Found ---');
    console.log(dispositions);
    
    console.log('\n--- Sentiments Found ---');
    console.log(sentiments);
    
    console.log('\n--- Duration Buckets ---');
    console.log(durationBuckets);
  }
  
  auditSalesloft().catch(console.error);
}
