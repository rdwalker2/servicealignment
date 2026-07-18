#!/usr/bin/env node
/**
 * Enhanced Farmer's Insurance scraper — extracts individual District Managers
 * and recruiters from each city page using the embedded JS poi data.
 * 
 * Usage: node scripts/scrapeFarmersV2.mjs
 */

import https from 'https';
import fs from 'fs';
import path from 'path';

const BASE = 'https://recruitment.farmers.com';

const STATE_CODES = [
  'al', 'az', 'ar', 'ca', 'co', 'ct', 'ga', 'id', 'il', 'in', 'ia', 'ks',
  'md', 'ma', 'mi', 'mn', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj', 'nm', 'ny',
  'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'sc', 'sd', 'tn', 'tx', 'ut', 'va',
  'wa', 'wv', 'wi'
];

const STATE_NAMES = {
  'al': 'Alabama', 'az': 'Arizona', 'ar': 'Arkansas', 'ca': 'California',
  'co': 'Colorado', 'ct': 'Connecticut', 'ga': 'Georgia', 'id': 'Idaho',
  'il': 'Illinois', 'in': 'Indiana', 'ia': 'Iowa', 'ks': 'Kansas',
  'md': 'Maryland', 'ma': 'Massachusetts', 'mi': 'Michigan', 'mn': 'Minnesota',
  'mo': 'Missouri', 'mt': 'Montana', 'ne': 'Nebraska', 'nv': 'Nevada',
  'nh': 'New Hampshire', 'nj': 'New Jersey', 'nm': 'New Mexico', 'ny': 'New York',
  'nc': 'North Carolina', 'nd': 'North Dakota', 'oh': 'Ohio', 'ok': 'Oklahoma',
  'or': 'Oregon', 'pa': 'Pennsylvania', 'sc': 'South Carolina', 'sd': 'South Dakota',
  'tn': 'Tennessee', 'tx': 'Texas', 'ut': 'Utah', 'va': 'Virginia',
  'wa': 'Washington', 'wv': 'West Virginia', 'wi': 'Wisconsin'
};

const STATE_TO_REGION = {
  'ca': 'West', 'or': 'West', 'wa': 'West', 'nv': 'West',
  'co': 'Mountain', 'ut': 'Mountain', 'id': 'Mountain', 'mt': 'Mountain', 'az': 'Mountain', 'nm': 'Mountain',
  'il': 'Midwest', 'in': 'Midwest', 'ia': 'Midwest', 'ks': 'Midwest', 'mi': 'Midwest',
  'mn': 'Midwest', 'mo': 'Midwest', 'ne': 'Midwest', 'nd': 'Midwest', 'oh': 'Midwest',
  'sd': 'Midwest', 'wi': 'Midwest',
  'al': 'South', 'ar': 'South', 'ga': 'South', 'sc': 'South', 'tn': 'South',
  'tx': 'South', 'ok': 'South', 'nc': 'South',
  'ct': 'Northeast', 'ma': 'Northeast', 'md': 'Northeast', 'nh': 'Northeast',
  'nj': 'Northeast', 'ny': 'Northeast', 'pa': 'Northeast', 'va': 'Northeast',
  'wv': 'Northeast',
};

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetch(res.headers.location).then(resolve).catch(reject);
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function extractCityLinks(html, stateCode) {
  const links = [];
  const re = /href="\/industry-recruiter-locator\/([a-z]{2})\/([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (m[1] === stateCode && !m[2].includes('/')) {
      links.push({ stateCode: m[1], citySlug: m[2] });
    }
  }
  const seen = new Set();
  return links.filter(l => {
    const key = `${l.stateCode}/${l.citySlug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Extract individual people from a city page.
 * The pages embed poi data in JS like:
 *   name : 'Timothy J McReavy - 459 N 300 W',
 *   address1 : '459 N 300 w',
 *   phone : '+1 801-683-3430',
 *   loc_url : 'https://...',
 */
function extractPeople(html, stateCode, citySlug) {
  const people = [];
  const stateName = STATE_NAMES[stateCode] || stateCode.toUpperCase();
  const region = STATE_TO_REGION[stateCode] || 'Other';
  const cityName = citySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // Determine type from page title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const pageTitle = titleMatch ? titleMatch[1] : '';
  const isDistrictManager = pageTitle.toLowerCase().includes('district manager');

  // Extract from embedded JS poi data
  const poiBlocks = html.split(/name\s*:\s*'/);
  
  for (let i = 1; i < poiBlocks.length; i++) {
    const block = poiBlocks[i];
    
    // Parse name (format: "First Last - Address")
    const nameEnd = block.indexOf("'");
    if (nameEnd === -1) continue;
    const rawName = block.substring(0, nameEnd);
    
    // Skip if it's a map control name
    if (rawName === 'zoom' || rawName.includes('SlippyMap') || rawName === 'US' || rawName === 'UT' || rawName.length <= 2) continue;
    
    // Split "Name - Address" 
    const parts = rawName.split(' - ');
    const personName = parts[0]?.trim();
    if (!personName || personName.length < 3) continue;
    
    // Extract address
    const addr1Match = block.match(/address1\s*:\s*'([^']*?)'/);
    const address = addr1Match ? addr1Match[1].trim() : (parts[1] || '').trim();
    
    // Extract phone
    const phoneMatch = block.match(/phone\s*:\s*'([^']*?)'/);
    const phone = phoneMatch ? phoneMatch[1].trim() : null;
    
    // Extract profile URL
    const urlMatch = block.match(/loc_url\s*:\s*'([^']*?)'/);
    const profileUrl = urlMatch ? urlMatch[1].trim() : `${BASE}/industry-recruiter-locator/${stateCode}/${citySlug}`;
    
    // Extract zip from address
    const zipMatch = address.match(/\b(\d{5}(?:-\d{4})?)\b/);
    const zip = zipMatch ? zipMatch[1] : '';
    
    // Determine type from title or URL structure
    let type = 'District Manager'; // Default from recruiter locator
    if (profileUrl.includes('/district-manager') || isDistrictManager) {
      type = 'District Manager';
    }
    
    // Deduplicate
    const key = `${personName}-${address}`;
    if (people.some(p => `${p.name}-${p.address}` === key)) continue;
    
    people.push({
      name: personName,
      type,
      city: cityName,
      state: stateName,
      stateCode: stateCode.toUpperCase(),
      address,
      zip,
      phone: phone || null,
      profileUrl,
      region,
      district: cityName, // The city page represents the district
    });
  }
  
  // Also try JSON-LD
  const jsonLdMatches = html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of jsonLdMatches) {
    try {
      const data = JSON.parse(match[1].trim());
      if (data.name && data.address) {
        const nameClean = data.name.split(' - ')[0].trim();
        // Don't add if already found via poi
        if (!people.some(p => p.name === nameClean)) {
          people.push({
            name: nameClean,
            type: isDistrictManager ? 'District Manager' : 'Recruiter',
            city: data.address.addressLocality || cityName,
            state: stateName,
            stateCode: stateCode.toUpperCase(),
            address: data.address.streetAddress || '',
            zip: data.address.postalCode || '',
            phone: data.telephone || null,
            profileUrl: `${BASE}/industry-recruiter-locator/${stateCode}/${citySlug}`,
            region,
            district: cityName,
          });
        }
      }
    } catch {}
  }
  
  // Fallback if nothing found
  if (people.length === 0) {
    people.push({
      name: `${cityName} District Office`,
      type: 'District Office',
      city: cityName,
      state: stateName,
      stateCode: stateCode.toUpperCase(),
      address: '',
      zip: '',
      phone: null,
      profileUrl: `${BASE}/industry-recruiter-locator/${stateCode}/${citySlug}`,
      region,
      district: cityName,
    });
  }
  
  return people;
}

async function main() {
  console.log('🏢 Scraping Farmer\'s Insurance locations (v2 - individual people)...\n');
  
  const allLocations = [];
  let id = 1;
  
  for (const stateCode of STATE_CODES) {
    const stateName = STATE_NAMES[stateCode];
    process.stdout.write(`📍 ${stateName} (${stateCode.toUpperCase()})... `);
    
    try {
      const stateHtml = await fetch(`${BASE}/industry-recruiter-locator/${stateCode}`);
      const cityLinks = extractCityLinks(stateHtml, stateCode);
      
      if (cityLinks.length === 0) {
        console.log('no cities found');
        continue;
      }
      
      let stateTotal = 0;
      for (const link of cityLinks) {
        try {
          const cityHtml = await fetch(`${BASE}/industry-recruiter-locator/${link.stateCode}/${link.citySlug}`);
          const people = extractPeople(cityHtml, stateCode, link.citySlug);
          
          for (const person of people) {
            person.id = `farmers_${String(id++).padStart(4, '0')}`;
            allLocations.push(person);
            stateTotal++;
          }
          
          await sleep(200);
        } catch (err) {
          console.error(`  ⚠️ Error fetching ${link.citySlug}: ${err.message}`);
        }
      }
      console.log(`${stateTotal} people across ${cityLinks.length} cities`);
    } catch (err) {
      console.error(`⚠️ Error fetching state ${stateCode}: ${err.message}`);
    }
    
    await sleep(300);
  }
  
  // Save JSON
  const outputPath = path.resolve('src/data/farmersLocations.json');
  fs.writeFileSync(outputPath, JSON.stringify(allLocations, null, 2));
  console.log(`\n✅ Saved ${allLocations.length} people to ${outputPath}`);
  
  // Print summary
  const states = new Set(allLocations.map(l => l.stateCode));
  const districts = new Set(allLocations.map(l => l.district));
  const types = {};
  allLocations.forEach(l => { types[l.type] = (types[l.type] || 0) + 1; });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total people: ${allLocations.length}`);
  console.log(`   States: ${states.size}`);
  console.log(`   District cities: ${districts.size}`);
  console.log(`   By type: ${JSON.stringify(types)}`);
  
  for (const sc of [...states].sort()) {
    const count = allLocations.filter(l => l.stateCode === sc).length;
    console.log(`   ${sc}: ${count} people`);
  }
}

main().catch(console.error);
