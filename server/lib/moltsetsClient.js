import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);
const MOLTSETS_API_KEY = process.env.MOLTSETS_API_KEY || 'ms_49896b9586d9df9d3197734ea3875641';

/**
 * Automatically find and enrich Property Managers/Facilities contacts for a given company.
 * @param {string} domain The company domain (e.g. 'soleno.com')
 * @param {string} companyName The company name (e.g. 'Soleno Therapeutics')
 */
export async function enrichDomainWithMoltSets(domain, companyName) {
  if (!domain || !companyName) return;
  console.log(`[MoltSets] Starting background enrichment for ${companyName} (${domain})...`);

  // 1. Search for Property/Facilities people using text search
  // Limit 10 to conserve 1k/5hr fair use tokens on MoltSets $27 tier
  const coreName = companyName.split(' ')[0].replace(',', '');
  const query = `${coreName} Property Manager OR Facility Director OR Facilities OR Owner`;

  try {
    const searchRes = await fetch('https://api.moltsets.com/api/v1/tools/search_people', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MOLTSETS_API_KEY}` },
      body: JSON.stringify({ query: query, limit: 10 })
    });
    const searchData = await searchRes.json();

    if (searchData.error) {
      console.error('[MoltSets] API Error:', searchData.error.message);
      return;
    }

    let bestMatch = null;
    if (searchData.results && searchData.results.results) {
      const baseDomain = domain.replace('www.', '').toLowerCase();

      // Find employees actually at the target company
      const companyEmployees = searchData.results.results.filter(r => {
        if (!r.company) return false;
        const urlMatch = r.company.website_url && r.company.website_url.toLowerCase().includes(baseDomain);
        const nameMatch = r.company.name && r.company.name.toLowerCase().includes(coreName.toLowerCase());
        return urlMatch || nameMatch;
      });

      // Find Property/Facility decision makers
      bestMatch = companyEmployees.find(r => {
        const t = (r.title || '').toLowerCase();
        const fa = r.functional_area || [];
        return t.includes('property') || t.includes('facility') || t.includes('facilities') || t.includes('owner') || fa.includes('Real Estate');
      });
    }

    if (!bestMatch) {
      console.log(`[MoltSets] No matching property/facility contact found natively for ${domain}.`);
      return;
    }

    console.log(`[MoltSets] Found Decision Maker for ${domain}: ${bestMatch.full_name} - ${bestMatch.title}`);

    // 2. Fetch Email
    const emailRes = await fetch('https://api.moltsets.com/api/v1/tools/linkedin_to_best_email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MOLTSETS_API_KEY}` },
      body: JSON.stringify({ linkedin_url: bestMatch.linkedin_url })
    });
    const emailData = await emailRes.json();

    let email = `info@${domain}`; // fallback
    if (emailData.status === 'ok' && emailData.results && emailData.results.email) {
      email = emailData.results.email;
      console.log(`[MoltSets] Resolved Email: ${email}`);
    } else {
      console.log(`[MoltSets] No email resolved, using fallback: ${email}`);
    }

    // 3. Upsert to clay_signals
    // This injects the MoltSets contact as a high-intent signal into our pipeline
    const signalRecord = {
      full_name: bestMatch.full_name,
      email: email,
      job_title: bestMatch.title,
      linkedin_url: bestMatch.linkedin_url,
      company_name: companyName,
      company_domain: domain,
      signal_name: 'MoltSets Expansion (Roof Health Intent)',
      signal_source: 'moltsets',
      signal_score: 85, // High score for a targeted buyer matching a roof health intent
      signal_description: `Automatically identified Property/Facilities decision maker. Title: ${bestMatch.title}`,
      icp_tier: 'warm'
    };

    const { error: insErr } = await supabase
      .from('clay_signals')
      .upsert(signalRecord, { onConflict: 'email', ignoreDuplicates: false });

    if (insErr) {
      console.error(`[MoltSets] Supabase insert error for ${email}:`, insErr.message);
    } else {
      console.log(`[MoltSets] Successfully injected MoltSets contact into pipeline for ${domain}!`);
    }

  } catch (err) {
    console.error(`[MoltSets] Error processing ${domain}:`, err.message);
  }
}
