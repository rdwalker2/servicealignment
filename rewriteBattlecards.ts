import * as fs from 'fs';
import * as path from 'path';

const battlecardsPath = '/Users/ryan.walker/Desktop/teamtailor/src/data/battlecards.ts';
let content = fs.readFileSync(battlecardsPath, 'utf-8');

// 1. Update the Type Definition
content = content.replace(
  'winRate: number;',
  "category: 'Modern ATS' | 'HRIS / All-in-One' | 'Legacy Enterprise' | 'SMB & Point Solutions';\n  tier: 1 | 2 | 3;"
);

// 2. We will do a regex replace to remove winRate and inject category/tier.
// A simple way is to match `competitorName: 'Name',` and then insert category/tier.
const categorized = [
  { name: 'Greenhouse', cat: 'Modern ATS', tier: 1 },
  { name: 'Lever', cat: 'Modern ATS', tier: 1 },
  { name: 'Ashby', cat: 'Modern ATS', tier: 1 },
  { name: 'Pinpoint', cat: 'Modern ATS', tier: 2 },
  { name: 'Workable', cat: 'Modern ATS', tier: 2 },
  { name: 'Factorial', cat: 'HRIS / All-in-One', tier: 2 },
  { name: 'BambooHR', cat: 'HRIS / All-in-One', tier: 1 },
  { name: 'Rippling', cat: 'HRIS / All-in-One', tier: 1 },
  { name: 'Paylocity', cat: 'HRIS / All-in-One', tier: 2 },
  { name: 'ADP Workforce Now', cat: 'HRIS / All-in-One', tier: 1 },
  { name: 'Workday Recruiting', cat: 'Legacy Enterprise', tier: 1 },
  { name: 'Oracle Taleo', cat: 'Legacy Enterprise', tier: 1 },
  { name: 'Jobvite', cat: 'Legacy Enterprise', tier: 2 },
  { name: 'Bullhorn', cat: 'Legacy Enterprise', tier: 2 },
  { name: 'JazzHR', cat: 'SMB & Point Solutions', tier: 2 },
  { name: 'HireBridge', cat: 'SMB & Point Solutions', tier: 3 },
  { name: 'EdJoin', cat: 'SMB & Point Solutions', tier: 3 },
  { name: 'Loxo', cat: 'SMB & Point Solutions', tier: 3 },
  { name: 'Breezy HR', cat: 'SMB & Point Solutions', tier: 2 },
  { name: 'isolved', cat: 'HRIS / All-in-One', tier: 3 }
];

// Remove winRate lines
content = content.replace(/\s*winRate:\s*\d+,/g, '');

// Insert category and tier after competitorName
for (const comp of categorized) {
  const regex = new RegExp(`competitorName:\\s*'${comp.name}',`);
  content = content.replace(regex, `competitorName: '${comp.name}',\n    category: '${comp.cat}',\n    tier: ${comp.tier},`);
}

fs.writeFileSync(battlecardsPath, content);
console.log('Battlecards updated!');
