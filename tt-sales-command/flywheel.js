import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { routeSignal } from './lead-router.js';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY 
);

// ISP / freemail domains — these are personal visitors, not company signals
const ISP_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
  'icloud.com', 'live.com', 'msn.com', 'protonmail.com', 'mail.com',
  'comcast.net', 'att.net', 'verizon.net', 'cox.net', 'spectrum.net',
]);

export async function handleInboundWebhook(payload) {
  console.log('[Flywheel] Received inbound payload:', payload);
  
  // ── 1. Extract domain ──────────────────────────────────────────────
  let domain = payload.company?.domain || payload.domain || payload.email?.split('@')[1];
  if (!domain) {
    console.log('[Flywheel] ❌ Ignored: No domain found in payload.');
    return { status: 'ignored', reason: 'no_domain' };
  }
  domain = domain.toLowerCase().trim();

  // ── 2. Drop ISP / freemail (not a real company signal) ─────────────
  if (ISP_DOMAINS.has(domain)) {
    console.log(`[Flywheel] ❌ Ignored: ISP/freemail domain (${domain})`);
    return { status: 'ignored', reason: 'isp_domain' };
  }

  // ── 3. Extract firmographics from payload ──────────────────────────
  const industry = payload.company?.industry || null;
  const employeeCount = payload.company?.employees || 0;
  const companyName = payload.company?.name || domain;
  const pageVisited = payload.page?.url || payload.page_url || null;
  const visitedPricing = pageVisited?.toLowerCase().includes('pricing') || false;

  // ── Parse UTM params from page URL for attribution ──
  let utmSource = null, utmCampaign = null, utmMedium = null, utmContent = null;
  if (pageVisited) {
    try {
      const url = new URL(pageVisited);
      utmSource = url.searchParams.get('utm_source') || null;
      utmCampaign = url.searchParams.get('utm_campaign') || null;
      utmMedium = url.searchParams.get('utm_medium') || null;
      utmContent = url.searchParams.get('utm_content') || null;
    } catch (e) { /* not a valid URL, skip */ }
  }

  // Try to detect ATS from payload tags or existing account data
  let ats = payload.company?.tags?.find(t => t.toLowerCase().includes('ats')) || null;

  console.log(`[Flywheel] Identified: ${domain} | Emp: ${employeeCount} | Ind: ${industry || 'unknown'}`);

  // ── 4. Check if account exists in our database ─────────────────────
  const { data: existingAccount } = await supabase
    .from('accounts')
    .select('current_ats, employee_count, is_existing_customer, industry')
    .eq('domain', domain)
    .single();

  // Use our enriched data if payload data is missing
  if (existingAccount) {
    if (!ats) ats = existingAccount.current_ats;
    if (!industry && existingAccount.industry) {
      // Use our enriched industry
    }
  }

  // ── 5. SCORE the signal (never hard-reject) ────────────────────────
  // Every signal gets through. Score determines priority, not eligibility.
  let signalScore = 50; // Base score for any website visitor
  let icpTier = 'monitor';
  const scoreFactors = [];

  // Competitor ATS = high value (they're using something we can displace)
  const atsLower = (ats || '').toLowerCase();
  if (atsLower.includes('rippling')) {
    signalScore += 30;
    scoreFactors.push('Rippling ATS (+30)');
  } else if (atsLower.includes('greenhouse')) {
    signalScore += 25;
    scoreFactors.push('Greenhouse ATS (+25)');
  } else if (atsLower.includes('lever') || atsLower.includes('icims') || atsLower.includes('workday') || atsLower.includes('paycom')) {
    signalScore += 20;
    scoreFactors.push(`Competitor ATS: ${ats} (+20)`);
  }

  // Pricing page = high intent
  if (visitedPricing) {
    signalScore += 20;
    scoreFactors.push('Visited pricing page (+20)');
  }

  // Sweet spot employee count (50-2000)
  if (employeeCount >= 50 && employeeCount <= 2000) {
    signalScore += 15;
    scoreFactors.push(`Employee sweet spot: ${employeeCount} (+15)`);
  } else if (employeeCount > 2000 && employeeCount <= 10000) {
    signalScore += 10;
    scoreFactors.push(`Mid-enterprise: ${employeeCount} (+10)`);
  } else if (employeeCount > 10000) {
    signalScore += 5;
    scoreFactors.push(`Large enterprise: ${employeeCount} (+5)`);
  }
  // Small companies still get through, just lower score

  // Existing customer = flag but don't reject (expansion opportunity)
  if (existingAccount?.is_existing_customer) {
    signalScore -= 10;
    scoreFactors.push('Existing customer (-10, flag for expansion)');
  }

  // Known account in our audience = boost
  if (existingAccount) {
    signalScore += 5;
    scoreFactors.push('Known account (+5)');
  }

  // Cap at 100
  signalScore = Math.min(100, signalScore);

  // Tier based on score
  if (signalScore >= 80) icpTier = 'hot';
  else if (signalScore >= 60) icpTier = 'warm';
  else icpTier = 'monitor';

  console.log(`[Flywheel] Score: ${signalScore}/100 (${icpTier}) — ${scoreFactors.join(', ')}`);

  // ── 6. Deduplication — bump score on revisits ──────────────────────
  const { data: existing } = await supabase
    .from('clay_signals')
    .select('id, signal_score, created_at')
    .eq('company_domain', domain)
    .single();

  if (existing) {
    console.log(`[Flywheel] ⚠️ Repeat visit — bumping score.`);
    const newScore = Math.min(100, Math.max(existing.signal_score, signalScore) + 10);
    const updateFields = {
      signal_score: newScore,
      icp_tier: newScore >= 80 ? 'hot' : newScore >= 60 ? 'warm' : 'monitor',
      page_visited: pageVisited || undefined,
      visited_pricing: visitedPricing || undefined,
    };
    // Overwrite UTMs if this visit has them (latest attribution wins)
    if (utmSource) updateFields.utm_source = utmSource;
    if (utmCampaign) updateFields.utm_campaign = utmCampaign;
    if (utmMedium) updateFields.utm_medium = utmMedium;
    if (utmContent) updateFields.utm_content = utmContent;
    await supabase.from('clay_signals').update(updateFields).eq('id', existing.id);

    const routing = await routeSignal({ domain, companyName, signalId: existing.id, triggeredBy: 'flywheel_revisit' });
    return { status: 'updated', score: newScore, tier: icpTier, routing };
  }

  // ── 7. Insert new signal ───────────────────────────────────────────
  const record = {
    full_name: payload.person?.name || 'Inbound Visitor',
    email: payload.person?.email || null,
    company_name: companyName,
    company_domain: domain,
    current_ats: ats,
    signal_name: `Web Visit${visitedPricing ? ' (Pricing)' : ''}`,
    signal_source: 'rb2b',
    signal_score: signalScore,
    signal_description: `Score: ${signalScore} (${scoreFactors.join(', ')})`,
    icp_tier: icpTier,
    employee_count: employeeCount || null,
    industry: industry,
    page_visited: pageVisited,
    visited_pricing: visitedPricing,
    job_title: payload.person?.title || null,
    linkedin_url: payload.person?.linkedin_url || null,
    phone: payload.person?.phone || null,
    // UTM attribution from Salesloft cadence links
    utm_source: utmSource,
    utm_campaign: utmCampaign,
    utm_medium: utmMedium,
    utm_content: utmContent,
  };

  const { data: inserted, error } = await supabase.from('clay_signals').insert(record).select('id').single();
  if (error) {
    console.error('[Flywheel] ❌ Supabase Insert Error:', error);
    return { status: 'error', reason: error.message };
  }

  // ── 8. Route to a rep ──────────────────────────────────────────────
  const routing = await routeSignal({
    domain,
    companyName,
    signalId: inserted?.id,
    triggeredBy: 'flywheel',
  });

  console.log(`[Flywheel] ✅ ${domain} → Score ${signalScore} (${icpTier})${routing.assigned ? ` → ${routing.repName}` : ''}`);
  return { status: 'routed', score: signalScore, tier: icpTier, routing };
}
