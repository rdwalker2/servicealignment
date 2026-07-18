import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import { routeSignal } from './lead-router.js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

const APOLLO_API_KEY = process.env.APOLLO_API_KEY;

/**
 * Searches Apollo for contacts matching the persona at the given domains.
 */
export async function discoverContacts(domains, titles = ['VP HR', 'CHRO', 'Vice President Human Resources', 'Director Talent Acquisition', 'VP People', 'Chief People Officer']) {
  if (!APOLLO_API_KEY) {
    console.warn('[Apollo] No API Key. Mocking discovery for', domains);
    return mockDiscovery(domains);
  }

  try {
    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        api_key: APOLLO_API_KEY,
        q_organization_domains: domains.join('\n'),
        person_titles: titles,
        page: 1,
        per_page: 10 // Get up to 10 contacts per batch
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[Apollo] Search failed:', err);
      throw new Error(`Apollo API error: ${response.status}`);
    }

    const data = await response.json();
    return processApolloResults(data.people || [], domains);
  } catch (err) {
    console.error('[Apollo] Error during contact discovery:', err);
    throw err;
  }
}

async function processApolloResults(people, requestedDomains) {
  const results = { processed: 0, inserted: 0, errors: [] };
  
  for (const person of people) {
    try {
      results.processed++;
      const domain = person.organization?.primary_domain || requestedDomains[0];
      
      // Basic routing logic
      const routing = await routeSignal({
        domain,
        triggeredBy: 'apollo_discovery',
      });

      // Upsert into accounts table
      const accountPayload = {
        company_domain: domain,
        company_name: person.organization?.name || domain,
        employee_count: person.organization?.estimated_num_employees || 0,
        industry: person.organization?.industry || null,
        linkedin_company_url: person.organization?.linkedin_url || null,
        assigned_rep_id: routing.assigned ? routing.repId : null,
        status: 'working', // Assuming if we are pulling contacts, we are working the account
        updated_at: new Date().toISOString()
      };

      const { error: accErr } = await supabase
        .from('accounts')
        .upsert(accountPayload, { onConflict: 'company_domain' });

      if (accErr) {
        console.error('[Apollo] Error upserting account:', accErr);
        results.errors.push(accErr.message);
        continue;
      }

      // Insert into clay_signals to show on Signal Board
      // We will set the signal_type to 'apollo_discovery'
      const signalPayload = {
        company_domain: domain,
        company_name: person.organization?.name || domain,
        contact_name: `${person.first_name} ${person.last_name}`.trim(),
        contact_title: person.title || null,
        contact_email: person.email || null, // Might be null if unverified
        linkedin_url: person.linkedin_url || null,
        signal_type: 'apollo_discovery',
        signal_label: 'Discovered Contact (Apollo)',
        signal_score: 5, // Base score for a found contact
        signal_source: 'apollo',
        assigned_rep_id: routing.assigned ? routing.repId : null,
      };

      // In a real app we'd also want to dedupe contacts, but clay_signals is an event log.
      const { error: sigErr } = await supabase
        .from('clay_signals')
        .insert(signalPayload);

      if (sigErr) {
        console.error('[Apollo] Error inserting signal:', sigErr);
        results.errors.push(sigErr.message);
      } else {
        results.inserted++;
      }

    } catch (err) {
      console.error('[Apollo] Row processing error:', err.message);
      results.errors.push(err.message);
    }
  }
  
  return results;
}

// ── Mock Logic if no API Key ──
async function mockDiscovery(domains) {
  // Generate a mock response
  const mockPeople = domains.map((domain, i) => ({
    first_name: `Jane${i}`,
    last_name: `Doe${i}`,
    title: 'VP of Human Resources',
    email: `jane.doe${i}@${domain}`,
    linkedin_url: `https://linkedin.com/in/janedoe${i}`,
    organization: {
      primary_domain: domain,
      name: domain.split('.')[0].toUpperCase(),
      estimated_num_employees: 500,
    }
  }));

  return processApolloResults(mockPeople, domains);
}
