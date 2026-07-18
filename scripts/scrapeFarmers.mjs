#!/usr/bin/env node
/**
 * Scrapes Farmer's Insurance recruiter locations from their website.
 * Outputs farmersLocations.json with structured data.
 * 
 * Usage: node scripts/scrapeFarmers.mjs
 */

import https from 'https';
import fs from 'fs';
import path from 'path';

const BASE = 'https://recruitment.farmers.com';

// All state codes from the main directory page
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
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Extract city links from state page
function extractCityLinks(html, stateCode) {
  const links = [];
  const re = /href="\/industry-recruiter-locator\/([a-z]{2})\/([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (m[1] === stateCode) {
      links.push({ stateCode: m[1], citySlug: m[2] });
    }
  }
  // Deduplicate
  const seen = new Set();
  return links.filter(l => {
    const key = `${l.stateCode}/${l.citySlug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Extract individual location data from a city page
function extractLocations(html, stateCode, citySlug) {
  const locations = [];
  const stateName = STATE_NAMES[stateCode] || stateCode.toUpperCase();
  const region = STATE_TO_REGION[stateCode] || 'Other';
  
  // Try to find location cards - Farmers uses structured listing cards
  // Look for name patterns in the HTML
  const nameRegex = /class="[^"]*location[^"]*name[^"]*"[^>]*>([^<]+)</gi;
  const addressRegex = /class="[^"]*Address[^"]*"[^>]*>([^<]+)</gi;
  const phoneRegex = /href="tel:([^"]+)"/gi;
  
  // Alternative: look for the locator card pattern with POI data
  const poiRegex = /data-(?:name|title)="([^"]+)"/gi;
  
  // Try structured data first (JSON-LD)
  const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatch) {
    for (const block of jsonLdMatch) {
      try {
        const jsonStr = block.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
        const data = JSON.parse(jsonStr);
        if (data['@type'] === 'LocalBusiness' || data['@type'] === 'InsuranceAgency' || data.name) {
          const loc = {
            name: data.name || 'Unknown',
            title: data.jobTitle || 'District Recruiter',
            city: data.address?.addressLocality || citySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            state: stateName,
            stateCode: stateCode.toUpperCase(),
            address: data.address?.streetAddress || '',
            zip: data.address?.postalCode || '',
            phone: data.telephone || null,
            profileUrl: `${BASE}/industry-recruiter-locator/${stateCode}/${citySlug}`,
            region,
          };
          locations.push(loc);
        }
      } catch {}
    }
  }
  
  // If no JSON-LD, try parsing from HTML structure
  if (locations.length === 0) {
    // Look for heading patterns that indicate a person/location name
    const headingMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const name = headingMatch ? headingMatch[1].trim() : null;
    
    // Look for address
    const addrMatch = html.match(/class="[^"]*[Aa]ddress[^"]*"[^>]*>([\s\S]*?)<\/(?:div|span|p)>/i);
    const addr = addrMatch ? addrMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    
    // Look for phone
    const phoneMatch = html.match(/href="tel:([^"]+)"/i);
    const phone = phoneMatch ? phoneMatch[1].trim() : null;
    
    // Look for zip
    const zipMatch = addr.match(/\b(\d{5}(?:-\d{4})?)\b/);
    const zip = zipMatch ? zipMatch[1] : '';
    
    const cityName = citySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    
    if (name) {
      locations.push({
        name: name.replace(/\s+/g, ' ').trim(),
        title: 'District Recruiter',
        city: cityName,
        state: stateName,
        stateCode: stateCode.toUpperCase(),
        address: addr,
        zip,
        phone,
        profileUrl: `${BASE}/industry-recruiter-locator/${stateCode}/${citySlug}`,
        region,
      });
    } else {
      // Fallback: create entry from URL structure
      locations.push({
        name: `Farmers ${cityName} Office`,
        title: 'District Office',
        city: cityName,
        state: stateName,
        stateCode: stateCode.toUpperCase(),
        address: '',
        zip: '',
        phone: null,
        profileUrl: `${BASE}/industry-recruiter-locator/${stateCode}/${citySlug}`,
        region,
      });
    }
  }
  
  return locations;
}

async function main() {
  console.log('🏢 Scraping Farmer\'s Insurance locations...\n');
  
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
      
      console.log(`found ${cityLinks.length} cities`);
      
      for (const link of cityLinks) {
        try {
          const cityHtml = await fetch(`${BASE}/industry-recruiter-locator/${link.stateCode}/${link.citySlug}`);
          const locs = extractLocations(cityHtml, stateCode, link.citySlug);
          
          for (const loc of locs) {
            loc.id = `farmers_${String(id++).padStart(4, '0')}`;
            allLocations.push(loc);
          }
          
          // Be polite
          await sleep(200);
        } catch (err) {
          console.error(`  ⚠️ Error fetching ${link.citySlug}: ${err.message}`);
        }
      }
    } catch (err) {
      console.error(`⚠️ Error fetching state ${stateCode}: ${err.message}`);
    }
    
    // Pause between states
    await sleep(300);
  }
  
  // Save JSON
  const outputPath = path.resolve('src/data/farmersLocations.json');
  fs.writeFileSync(outputPath, JSON.stringify(allLocations, null, 2));
  console.log(`\n✅ Saved ${allLocations.length} locations to ${outputPath}`);
  
  // Print summary
  const states = new Set(allLocations.map(l => l.stateCode));
  const regions = new Set(allLocations.map(l => l.region));
  console.log(`\n📊 Summary:`);
  console.log(`   Total locations: ${allLocations.length}`);
  console.log(`   States: ${states.size}`);
  console.log(`   Regions: ${regions.size}`);
  
  // Per-state breakdown
  for (const sc of [...states].sort()) {
    const count = allLocations.filter(l => l.stateCode === sc).length;
    console.log(`   ${sc}: ${count} locations`);
  }
}

main().catch(console.error);
