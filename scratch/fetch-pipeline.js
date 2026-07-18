import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.SALESLOFT_API_KEY; // Wait, in the earlier curl, I used v2_ak_111987_5d3dc65e5c43e592d637faf9f09dc73478b233e01f46c3ad32bbf4ed0aa180ff

async function getPipeline() {
  const token = 'v2_ak_111987_5d3dc65e5c43e592d637faf9f09dc73478b233e01f46c3ad32bbf4ed0aa180ff';
  const resp = await fetch('https://api.salesloft.com/v2/opportunities?per_page=100', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  const data = await resp.json();
  
  const openOpps = data.data.filter(opp => !opp.is_closed);
  
  const pipeline = {};
  openOpps.forEach(opp => {
    const owner = opp.owner_crm_name || 'Unassigned';
    if (!pipeline[owner]) pipeline[owner] = [];
    pipeline[owner].push({
      name: opp.name,
      account: opp.account_name,
      stage: opp.stage_name,
      amount: opp.amount
    });
  });
  
  for (const [owner, opps] of Object.entries(pipeline)) {
    console.log(`\n=== Rep: ${owner} ===`);
    opps.forEach(o => {
      console.log(`- ${o.account} | ${o.name} | Stage: ${o.stage} | $${o.amount || 0}`);
    });
  }
}

getPipeline();
