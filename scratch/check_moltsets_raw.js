import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const MOLTSETS_API_KEY = process.env.MOLTSETS_API_KEY || 'ms_49896b9586d9df9d3197734ea3875641';

async function checkRawMoltsets() {
  const query = `Cushman Property Manager OR Facility Director OR Real Estate Manager Ohio OR Cincinnati`;
  
  try {
    const searchRes = await fetch('https://api.moltsets.com/api/v1/tools/search_people', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MOLTSETS_API_KEY}` },
      body: JSON.stringify({ query: query, limit: 1 })
    });
    const searchData = await searchRes.json();
    
    if (searchData.results && searchData.results.results && searchData.results.results.length > 0) {
      console.log("RAW PROFILE DATA:");
      console.log(JSON.stringify(searchData.results.results[0], null, 2));
    }
  } catch (e) {
    console.error(e);
  }
}

checkRawMoltsets();
