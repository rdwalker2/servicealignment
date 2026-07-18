import { readFileSync } from 'fs';
import { resolve } from 'path';

const envFile = readFileSync(resolve('/Users/ryan.walker/Desktop/teamtailor/.env'), 'utf-8');
const match = envFile.match(/SALESLOFT_API_KEY=(.*)/);

if (match) {
  const apiKey = match[1];
  
  async function auditSalesloftDeep() {
    console.log('--- SALESLOFT DEEP AUDIT ---');
    
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    const startIso = start.toISOString().replace(/\.\d+Z$/, '.000000Z');
    
    let allData: any[] = [];
    let page = 1;
    
    // Fetch up to 20 pages (2000 calls)
    while (page <= 20) {
      const url = `https://api.salesloft.com/v2/activities/calls.json?created_at[gte]=${startIso}&per_page=100&page=${page}`;
      const r = await fetch(url, { headers: { 'Authorization': `Bearer ${apiKey}` } });
      const data = await r.json();
      
      if (!data.data || data.data.length === 0) break;
      allData = allData.concat(data.data);
      page++;
    }
    
    console.log(`Fetched ${allData.length} recent calls.`);
    
    const dispositions: Record<string, number> = {};
    const sentiments: Record<string, number> = {};
    const durationBuckets = { '0': 0, '1-15s': 0, '15-60s': 0, '60-120s': 0, '>120s': 0 };
    
    // Check if there are any specific tags or note texts that Nooks uses
    const nooksTags: string[] = [];
    let meetingNotes = 0;
    
    allData.forEach((c: any) => {
      const disp = c.disposition || 'NO_DISPOSITION';
      dispositions[disp] = (dispositions[disp] || 0) + 1;
      
      const sent = c.sentiment || 'NO_SENTIMENT';
      sentiments[sent] = (sentiments[sent] || 0) + 1;
      
      const d = c.duration || 0;
      if (d === 0) durationBuckets['0']++;
      else if (d <= 15) durationBuckets['1-15s']++;
      else if (d <= 60) durationBuckets['15-60s']++;
      else if (d <= 120) durationBuckets['60-120s']++;
      else durationBuckets['>120s']++;
      
      // Look for "meeting" in notes if available
      if (c.note?.content?.toLowerCase().includes('meeting')) {
        meetingNotes++;
      }
    });
    
    console.log('\n--- All Dispositions (Last 2000 calls) ---');
    console.log(dispositions);
    
    console.log('\n--- All Sentiments (Last 2000 calls) ---');
    console.log(sentiments);
    
    console.log('\n--- Duration Buckets ---');
    console.log(durationBuckets);
    
    console.log(`\nCalls with 'meeting' in the notes: ${meetingNotes}`);
  }
  
  auditSalesloftDeep().catch(console.error);
}
