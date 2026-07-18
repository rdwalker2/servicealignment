// ── Signal Board Data ──
// Data model matches Clay's webhook output format exactly.
// Each row = one signal event about one person at one company.
// The Signal Board groups/aggregates these rows for display.

import type { DbAccount, DbContact } from '../lib/signalBoardDb';

// ════════════════════════════════════════════
// CORE TYPE — This IS a Clay row. Nothing more.
// ════════════════════════════════════════════

export interface ClayRow {
  // ─ Person ─
  full_name: string;
  email: string;
  job_title: string;
  linkedin_url: string;
  phone?: string;

  // ─ Company ─
  company_name: string;
  company_domain: string;
  company_location: string;
  employee_count: number;
  company_size_linkedin?: string;
  open_roles: number;
  current_ats: string;
  audience_source?: string;         // e.g. 'Rippling', 'K-12', 'Farmers'

  // ─ Signal ─
  signal_name: string;
  signal_source: 'rb2b' | 'clay' | 'linkedin' | 'job_board';
  signal_score: number;           // 1-10 weight
  signal_description: string;
  detected_at: string;            // ISO date
  page_visited?: string;          // e.g. '/pricing' — only for web intent signals

  // ─ Clay computed ─
  icp_tier: 'hot' | 'warm' | 'watch';
  assigned_rep_id: string;        // territory assignment
  ai_research_brief?: string;     // Claygent AI generated summary

  // ─ ISP Enrichment (from Clay's AI analysis) ─
  account_intel?: string[];          // up to 5 account intelligence bullets
  pain_points?: string[];            // up to 4 pain point questions to explore
  recommended_approach?: string[];   // up to 6 approach/positioning suggestions
  pipeline_stage?: string;
  isp_explanation?: string;          // AI paragraph explaining the ISP score
  isp_score?: number;                // composite Intent Signal Processing score (0-100)
  g2_score?: number;                 // G2 employer review score
  indeed_score?: number;             // Indeed employer review score  
  glassdoor_score?: number;          // Glassdoor employer review score
  negative_reviews?: string;         // AI analysis of negative employer reviews
  signal_category?: string;          // e.g. 'Tech Stack & Change Readiness'
  hiring_signals?: string;           // LinkedIn hiring signals detected

  // ─ Salesforce CRM ─
  sf_account_owner?: string;         // Salesforce Account Owner (from Clay enrichment)
  salesforce_account_id?: string;    // Salesforce Account ID
  salesforce_contact_id?: string;    // Salesforce Contact ID
  sf_sync_status?: 'pending' | 'synced' | 'not_in_sfdc' | 'created' | 'error';
  sf_last_synced_at?: string;

  // ─ July Pilot Fields ─
  market?: string;                   // us, ca, eu — market separation
  firmographic_tier?: string;        // tier_1, tier_2, tier_3 — ICP fit from pipeline data
  pages_visited_count?: number;      // RB2B: number of pages in session
  session_duration_seconds?: number; // RB2B: time on site
  visited_pricing?: boolean;         // RB2B: hit pricing page
  utm_source?: string;               // Salesloft cadence attribution
  utm_campaign?: string;
  is_existing_customer?: boolean;    // suppress from prospecting
  account_owner_email?: string;      // rep routing
  contact_persona?: ContactPersona;
}

export type ContactPersona = 'exec_hr' | 'exec_business' | 'head_of_ta' | 'hr_director' | 'ta_manager' | 'hr_manager' | 'recruiter' | 'hr_coordinator' | 'it_security' | 'finance_ops';
export type BuyingCommitteeRole = 'champion' | 'decision_maker' | 'evaluator' | 'end_user' | 'technical_buyer' | 'economic_buyer';

// Persona → buying committee role (auto-derived)
const PERSONA_TO_COMMITTEE: Record<ContactPersona, BuyingCommitteeRole> = {
  exec_hr: 'decision_maker',
  exec_business: 'decision_maker',
  head_of_ta: 'champion',
  hr_director: 'champion',  // decision_maker at <200 emp, but champion is safer default
  ta_manager: 'evaluator',
  hr_manager: 'evaluator',
  recruiter: 'end_user',
  hr_coordinator: 'end_user',
  it_security: 'technical_buyer',
  finance_ops: 'economic_buyer',
};

// Persona tier for sorting (higher = more valuable)
const PERSONA_TIER: Record<ContactPersona, number> = {
  exec_hr: 10,
  head_of_ta: 9,
  hr_director: 9,
  exec_business: 8,
  ta_manager: 6,
  hr_manager: 5,
  it_security: 4,
  finance_ops: 4,
  recruiter: 3,
  hr_coordinator: 2,
};

export function getCommitteeRole(persona: ContactPersona): BuyingCommitteeRole {
  return PERSONA_TO_COMMITTEE[persona];
}

export function getPersonaTier(persona: ContactPersona): number {
  return PERSONA_TIER[persona] ?? 0;
}

const PERSONA_LABELS: Record<ContactPersona, string> = {
  exec_hr: 'HR Executive',
  exec_business: 'Business Executive',
  head_of_ta: 'TA Leader',
  hr_director: 'HR Director',
  ta_manager: 'TA Manager',
  hr_manager: 'HR Manager',
  recruiter: 'Recruiter',
  hr_coordinator: 'HR Coordinator',
  it_security: 'IT / Security',
  finance_ops: 'Finance / Ops',
};

export function getPersonaLabel(persona: ContactPersona): string {
  return PERSONA_LABELS[persona] ?? persona;
}

// ════════════════════════════════════════════
// DERIVED TYPES — computed by the Signal Board, not stored
// ════════════════════════════════════════════

export interface SignalEvent {
  name: string;
  source: ClayRow['signal_source'];
  score: number;
  description: string;
  detectedAt: string;
  pageVisited?: string;
  contactName: string;            // who triggered this signal
  contactEmail: string;
}

export interface ContactView {
  name: string;
  email: string;
  title: string;
  linkedinUrl: string;
  phone?: string;
  avatarColor: string;
  isPrimary: boolean;             // best contact to reach first
  contactPersona?: ContactPersona;
  committeeRole?: BuyingCommitteeRole;
  companyName: string;
  companyDomain: string;
  companyLocation: string;
  companyTier: 'hot' | 'warm' | 'watch' | 'none';
  employeeCount: number;
  industry?: string;
  signals: SignalEvent[];
  contactScore: number;           // sum of signal scores for this person
  lastSignalAt: string;
  lastPageVisited?: string;
  webVisitCount: number;
  assignedRepId: string;
  sfContactId?: string;
  // Cadence membership (from Salesloft sync)
  inActiveCadence?: boolean;
  cadenceName?: string;
  cadenceStatus?: string;
  // Email engagement (from Salesloft sync)
  emailsSent?: number;
  emailsOpened?: number;
  emailsClicked?: number;
  emailsReplied?: number;
  emailsBounced?: number;
  // Call activity (from Salesloft sync — includes Nooks)
  callsTotal?: number;
  callsConnected?: number;
  lastCallDisposition?: string;
}

export interface AccountView {
  companyName: string;
  companyDomain: string;
  companyLocation: string;
  employeeCount: number;
  employeeSizeRange?: string;    // SFDC picklist: "26-100", "101-250", etc.
  companySizeLinkedin?: string;
  openRoles: number;
  currentAts: string;
  audienceSource?: string;
  tier: 'hot' | 'warm' | 'watch' | 'none';
  score: number;                  // sum of all signal scores
  fitScore: number;               // firmographic fit (clay + job_board signals)
  intentScore: number;            // behavioral intent (rb2b + linkedin signals)
  signals: SignalEvent[];
  signalCount?: number;           // from DB view
  contacts: ContactView[];
  contactCount?: number;          // from DB view
  lastActivity: string;
  webVisits: number;              // count of rb2b signals
  assignedRepId: string;
  aiResearchBrief?: string;
  // ISP enrichment (passed through from Clay)
  accountIntel?: string[];
  painPoints?: string[];
  recommendedApproach?: string[];
  ispExplanation?: string;
  ispScore?: number;
  g2Score?: number;
  indeedScore?: number;
  glassdoorScore?: number;
  negativeReviews?: string;
  signalCategory?: string;
  hiringSignals?: string;
  // Salesforce CRM
  sfAccountOwner?: string;          // Salesforce Account Owner name
  sfAccountId?: string;             // Salesforce Account ID
  sfSyncStatus?: 'pending' | 'synced' | 'not_in_sfdc' | 'created' | 'error';
  sfLastSyncedAt?: string;
  // July Pilot
  market?: string;
  firmographicTier?: string;        // tier_1, tier_2, tier_3
  isExistingCustomer?: boolean;
  // Buying committee coverage
  committeeRoles: Set<BuyingCommitteeRole>;   // which committee roles are covered
  personasCovered: Set<ContactPersona>;       // which actual personas are on the account
  // UI state (local only, not from Clay)
  pushedToCadence: boolean;
  notes: AccountNote[];
}

export interface AccountNote {
  id: string;
  text: string;
  createdAt: string;
  authorName: string;
}


// ════════════════════════════════════════════
// GROUPING FUNCTIONS
// ════════════════════════════════════════════

// Deterministic avatar color from name
export function avatarColorFn(name: string): string {
  const colors = ['#6366f1','#f43f5e','#0ea5e9','#10b981','#f59e0b','#8b5cf6','#ec4899','#14b8a6','#f97316','#6366f1'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function groupByAccount(rows: ClayRow[]): AccountView[] {
  const map = new Map<string, ClayRow[]>();
  for (const r of rows) {
    const key = r.company_domain;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }

  return Array.from(map.entries()).map(([domain, rows]) => {
    const first = rows[0];
    const signalsRaw: SignalEvent[] = rows.map(r => ({
      name: r.signal_name,
      source: r.signal_source,
      score: r.signal_score,
      description: r.signal_description,
      detectedAt: r.detected_at,
      pageVisited: r.page_visited,
      contactName: r.full_name,
      contactEmail: r.email,
    }));
    // Deduplicate: same signal name + source + contact = keep only the most recent
    const dedupeMap = new Map<string, SignalEvent>();
    for (const s of signalsRaw) {
      const key = `${s.name}|${s.source}|${s.contactEmail}`;
      const existing = dedupeMap.get(key);
      if (!existing || s.detectedAt > existing.detectedAt) {
        dedupeMap.set(key, s);
      }
    }
    // Filter out "ATS Verified" signals — these are enrichment metadata, not actionable signals.
    // They confirm the company's Current ATS Provider (Salesforce picklist field).
    const ATS_VERIFIED_RE = /^(.+)\s+ATS\s+Verified$/i;
    const KNOWN_ATS = new Set(['Greenhouse', 'Ashby', 'BambooHR', 'BreezyHR', 'Lever', 'Workday', 'iCIMS',
      'SmartRecruiters', 'SuccessFactors', 'Workable', 'JazzHR', 'Paycor', 'Paycom', 'Paylocity',
      'Rippling', 'UKG', 'ADP', 'Dayforce'].map(a => a.toLowerCase()));
    let enrichedAts: string | null = null;
    const signals = Array.from(dedupeMap.values())
      .filter(s => {
        const m = s.name.match(ATS_VERIFIED_RE);
        if (m) {
          // Extract ATS name and store it for account enrichment
          const atsName = m[1].trim();
          if (KNOWN_ATS.has(atsName.toLowerCase())) {
            enrichedAts = atsName;
          }
          return false; // remove from timeline
        }
        return true;
      })
      .sort((a, b) => (b.detectedAt > a.detectedAt ? 1 : -1));

    // Dedupe contacts by email
    const contactMap = new Map<string, ContactView>();
    for (const r of rows) {
      if (!contactMap.has(r.email)) {
        contactMap.set(r.email, {
          name: r.full_name,
          email: r.email,
          title: r.job_title,
          linkedinUrl: r.linkedin_url,
          phone: r.phone,
          avatarColor: avatarColorFn(r.full_name),
          isPrimary: false,
          contactPersona: r.contact_persona,
          committeeRole: r.contact_persona ? getCommitteeRole(r.contact_persona) : undefined,
          companyName: r.company_name,
          companyDomain: r.company_domain,
          companyLocation: r.company_location,
          companyTier: r.icp_tier,
          employeeCount: r.employee_count,
          signals: [],
          contactScore: 0,
          lastSignalAt: r.detected_at,
          lastPageVisited: undefined,
          webVisitCount: 0,
          assignedRepId: r.assigned_rep_id,
          sfContactId: r.salesforce_contact_id,
        });
      }
      const cv = contactMap.get(r.email)!;
      cv.signals.push({
        name: r.signal_name,
        source: r.signal_source,
        score: r.signal_score,
        description: r.signal_description,
        detectedAt: r.detected_at,
        pageVisited: r.page_visited,
        contactName: r.full_name,
        contactEmail: r.email,
      });
      cv.contactScore += r.signal_score;
      if (r.detected_at > cv.lastSignalAt) cv.lastSignalAt = r.detected_at;
      if (r.signal_source === 'rb2b') {
        cv.webVisitCount += 1;
        if (r.page_visited) {
          if (!cv.lastPageVisited || r.detected_at > (cv.lastSignalAt || '')) {
            cv.lastPageVisited = r.page_visited;
          }
        }
      }
    }

    const contacts = Array.from(contactMap.values());
    // Pick primary: highest persona tier > highest score
    contacts.sort((a, b) => {
      const tierA = a.contactPersona ? getPersonaTier(a.contactPersona) : 0;
      const tierB = b.contactPersona ? getPersonaTier(b.contactPersona) : 0;
      if (tierA !== tierB) return tierB - tierA;
      return b.contactScore - a.contactScore;
    });
    if (contacts.length > 0) contacts[0].isPrimary = true;

    // Committee coverage (auto-derived from personas)
    const committeeRoles = new Set<BuyingCommitteeRole>();
    const personasCovered = new Set<ContactPersona>();
    for (const c of contacts) {
      if (c.contactPersona) {
        personasCovered.add(c.contactPersona);
        committeeRoles.add(getCommitteeRole(c.contactPersona));
      }
    }

    const score = signals.reduce((s, sig) => s + sig.score, 0);
    const fitScore = signals.filter(s => s.source === 'clay' || s.source === 'job_board').reduce((s, sig) => s + sig.score, 0);
    const intentScore = signals.filter(s => s.source === 'rb2b' || s.source === 'linkedin').reduce((s, sig) => s + sig.score, 0);
    const lastActivity = signals.reduce((latest, s) => s.detectedAt > latest ? s.detectedAt : latest, signals[0]?.detectedAt || '');
    const webVisits = signals.filter(s => s.source === 'rb2b').length;

    return {
      companyName: first.company_name,
      companyDomain: domain,
      companyLocation: first.company_location,
      employeeCount: first.employee_count,
      companySizeLinkedin: first.company_size_linkedin,
      openRoles: first.open_roles,
      currentAts: first.current_ats || enrichedAts || '',
      audienceSource: first.audience_source,
      tier: first.icp_tier,
      score,
      fitScore,
      intentScore,
      signals,
      contacts,
      lastActivity,
      webVisits,
      assignedRepId: first.assigned_rep_id,
      aiResearchBrief: first.ai_research_brief,
      accountIntel: first.account_intel,
      painPoints: first.pain_points,
      recommendedApproach: first.recommended_approach,
      ispExplanation: first.isp_explanation,
      ispScore: first.isp_score,
      g2Score: first.g2_score,
      indeedScore: first.indeed_score,
      glassdoorScore: first.glassdoor_score,
      negativeReviews: first.negative_reviews,
      signalCategory: first.signal_category,
      hiringSignals: first.hiring_signals,
      sfAccountOwner: first.sf_account_owner,
      sfAccountId: first.salesforce_account_id,
      sfSyncStatus: first.sf_sync_status,
      sfLastSyncedAt: first.sf_last_synced_at,
      // July Pilot
      market: first.market,
      firmographicTier: first.firmographic_tier,
      isExistingCustomer: first.is_existing_customer,
      committeeRoles,
      personasCovered,
      pushedToCadence: false,
      notes: [],
    };
  }).sort((a, b) => b.score - a.score);
}

export function groupByContact(rows: ClayRow[]): ContactView[] {
  const accounts = groupByAccount(rows);
  const all: ContactView[] = [];
  for (const acct of accounts) {
    for (const c of acct.contacts) all.push(c);
  }
  return all.sort((a, b) => b.contactScore - a.contactScore);
}

/**
 * Merge signal-grouped accounts with the full CRM account list.
 * Accounts WITH signals keep their signal-driven data.
 * Accounts WITHOUT signals get created with score=0, tier='none'.
 * CRM contacts are also merged for non-signaled accounts.
 */
export function mergeBookAccounts(
  signaledAccounts: AccountView[],
  allCrmAccounts: DbAccount[],
  allCrmContacts: DbContact[]
): AccountView[] {
  // Build a set of domains already covered by signals
  const signaledDomains = new Set(signaledAccounts.map(a => a.companyDomain));

  // Group CRM contacts by domain
  const contactsByDomain = new Map<string, DbContact[]>();
  for (const c of allCrmContacts) {
    if (!c.domain) continue;
    const existing = contactsByDomain.get(c.domain) || [];
    existing.push(c);
    contactsByDomain.set(c.domain, existing);
  }

  // Create AccountView entries for non-signaled CRM accounts
  const nonSignaledAccounts: AccountView[] = allCrmAccounts
    .filter(a => a.domain && !signaledDomains.has(a.domain))
    .map(a => {
      const crmContacts = contactsByDomain.get(a.domain) || [];
      const contacts: ContactView[] = crmContacts.map(c => ({
        name: c.name || 'Unknown',
        email: c.email,
        title: c.title || '',
        linkedinUrl: c.linkedin_url || '',
        phone: c.phone,
        avatarColor: avatarColorFn(c.name || c.email),
        isPrimary: false,
        companyName: a.company_name || '',
        companyDomain: a.domain,
        companyLocation: [a.city, a.state].filter(Boolean).join(', '),
        companyTier: 'none' as const,
        employeeCount: a.employee_count || 0,
        signals: [],
        contactScore: 0,
        lastSignalAt: '',
        webVisitCount: 0,
        assignedRepId: '',
        inActiveCadence: c.in_active_cadence || false,
        cadenceName: c.cadence_name,
        cadenceStatus: c.cadence_status,
        emailsSent: c.emails_sent || 0,
        emailsOpened: c.emails_opened || 0,
        emailsClicked: c.emails_clicked || 0,
        emailsReplied: c.emails_replied || 0,
        emailsBounced: c.emails_bounced || 0,
        callsTotal: c.calls_total || 0,
        callsConnected: c.calls_connected || 0,
        lastCallDisposition: c.last_call_disposition,
        sfContactId: c.sf_contact_id,
      }));

      // Filter out Unknown contacts, sort best contacts first (has title > has name)
      const knownContacts = contacts.filter(c => c.name !== 'Unknown' && c.name !== 'Unknown Contact');
      const sortedContacts = knownContacts.sort((a, b) => {
        // Contacts with titles first
        if (a.title && !b.title) return -1;
        if (!a.title && b.title) return 1;
        // Then alphabetical
        return a.name.localeCompare(b.name);
      });

      // Mark first contact as primary
      if (sortedContacts.length > 0) sortedContacts[0].isPrimary = true;
      // Use sorted known contacts (fall back to original if all unknown)
      const finalContacts = sortedContacts.length > 0 ? sortedContacts : contacts;

      return {
        companyName: a.company_name || a.domain,
        companyDomain: a.domain,
        companyLocation: a.location || [a.city, a.state, a.country].filter(Boolean).join(', '),
        employeeCount: a.employee_count || 0,
        employeeSizeRange: a.employee_size_range,
        openRoles: a.open_roles_count || 0,
        currentAts: a.current_ats || '',
        audienceSource: a.audience_source,
        tier: 'none' as const,
        score: 0,
        fitScore: 0,
        intentScore: 0,
        signals: [],
        contacts: finalContacts,
        contactCount: finalContacts.length,
        lastActivity: a.updated_at || '',
        webVisits: 0,
        assignedRepId: '',
        sfAccountOwner: a.sf_account_owner,
        sfAccountId: a.sf_account_id,
        market: a.country === 'Canada' ? 'ca' : a.country === 'United States' ? 'us' : undefined,
        firmographicTier: a.icp_fit,
        isExistingCustomer: a.company_type === 'Customer',
        committeeRoles: new Set<BuyingCommitteeRole>(),
        personasCovered: new Set<ContactPersona>(),
        pushedToCadence: false,
        notes: [],
      } as AccountView;
    });

  // Also enrich signaled accounts with CRM contact data they might be missing
  for (const acct of signaledAccounts) {
    const crmContacts = contactsByDomain.get(acct.companyDomain) || [];
    const existingEmails = new Set(acct.contacts.map(c => c.email));
    for (const c of crmContacts) {
      if (!existingEmails.has(c.email)) {
        acct.contacts.push({
          name: c.name || 'Unknown',
          email: c.email,
          title: c.title || '',
          linkedinUrl: c.linkedin_url || '',
          phone: c.phone,
          avatarColor: avatarColorFn(c.name || c.email),
          isPrimary: false,
          companyName: acct.companyName,
          companyDomain: acct.companyDomain,
          companyLocation: acct.companyLocation,
          companyTier: acct.tier,
          employeeCount: acct.employeeCount,
          signals: [],
          contactScore: 0,
          lastSignalAt: '',
          webVisitCount: 0,
          assignedRepId: acct.assignedRepId,
          inActiveCadence: c.in_active_cadence || false,
          cadenceName: c.cadence_name,
          cadenceStatus: c.cadence_status,
          emailsSent: c.emails_sent || 0,
          emailsOpened: c.emails_opened || 0,
          emailsClicked: c.emails_clicked || 0,
          emailsReplied: c.emails_replied || 0,
          emailsBounced: c.emails_bounced || 0,
          callsTotal: c.calls_total || 0,
          callsConnected: c.calls_connected || 0,
          lastCallDisposition: c.last_call_disposition,
        });
      }
    }
  }
  // Post-merge: for ALL accounts, sort contacts so best one is primary
  const allAccounts = [...signaledAccounts, ...nonSignaledAccounts];
  for (const acct of allAccounts) {
    // Filter out nameless contacts from display
    const named = acct.contacts.filter(c => 
      c.name && c.name !== 'Unknown' && c.name !== 'Unknown Contact' && c.name.trim() !== ''
    );
    // Sort: titled contacts first, then alphabetical
    named.sort((a, b) => {
      if (a.title && !b.title) return -1;
      if (!a.title && b.title) return 1;
      return a.name.localeCompare(b.name);
    });
    // Reset primary flags
    for (const c of named) c.isPrimary = false;
    if (named.length > 0) named[0].isPrimary = true;
    // Use named contacts if available, otherwise keep originals
    if (named.length > 0) {
      acct.contacts = named;
      acct.contactCount = named.length;
    }
  }

  return allAccounts;
}


// ════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════

export function getSignalIcon(source: ClayRow['signal_source'], signalName: string): string {
  if (source === 'rb2b') return '🌐';
  if (source === 'linkedin') return '👤';
  if (source === 'job_board') return '💼';
  // Clay enrichment — pick by keyword
  if (signalName.toLowerCase().includes('ats') || signalName.toLowerCase().includes('legacy')) return '⚠️';
  if (signalName.toLowerCase().includes('turnover') || signalName.toLowerCase().includes('repost')) return '⚡';
  if (signalName.toLowerCase().includes('career') || signalName.toLowerCase().includes('page')) return '🔍';
  if (signalName.toLowerCase().includes('multi') || signalName.toLowerCase().includes('location')) return '🏢';
  if (signalName.toLowerCase().includes('regulated') || signalName.toLowerCase().includes('compliance')) return '🛡️';
  if (signalName.toLowerCase().includes('hiring') || signalName.toLowerCase().includes('growth')) return '📈';
  if (signalName.toLowerCase().includes('recruiter') || signalName.toLowerCase().includes('overload')) return '⚡';
  return '📊';
}

/**
 * Returns a plain-English sentence describing ONLY web intent (Vector) signals.
 * Returns null if no Vector signals exist — nothing is fabricated.
 * Always includes the real timestamp so reps can judge freshness themselves.
 */
export function getWebIntentLine(signals: SignalEvent[]): string | null {
  const webSignals = signals
    .filter(s => s.source === 'rb2b')
    .sort((a, b) => (b.detectedAt > a.detectedAt ? 1 : -1)); // most recent first

  if (webSignals.length === 0) return null;

  const pricing  = webSignals.filter(s => s.pageVisited?.includes('/pricing'));
  const demo     = webSignals.filter(s => s.pageVisited?.includes('/demo'));
  const caseStudy = webSignals.filter(s => s.pageVisited?.includes('/case-stud'));
  const product  = webSignals.filter(s => s.pageVisited?.includes('/product'));

  const parts: string[] = [];

  // Most valuable pages first
  if (pricing.length >= 2) {
    parts.push(`Visited pricing ${pricing.length}× — last ${timeAgo(pricing[0].detectedAt)}`);
  } else if (pricing.length === 1) {
    parts.push(`Visited pricing page ${timeAgo(pricing[0].detectedAt)}`);
  }

  if (demo.length > 0 && parts.length < 2) {
    parts.push(`Viewed demo page ${timeAgo(demo[0].detectedAt)}`);
  }

  if (caseStudy.length > 0 && parts.length < 2) {
    parts.push(`Reading case studies ${timeAgo(caseStudy[0].detectedAt)}`);
  }

  if (product.length > 0 && parts.length < 2) {
    parts.push(`Viewed product tour ${timeAgo(product[0].detectedAt)}`);
  }

  // Fallback: any other web visit with the real page slug
  if (parts.length === 0) {
    const top = webSignals[0];
    const page = top.pageVisited ? top.pageVisited.replace(/^\//, '') : 'site';
    parts.push(`Visited ${page} ${timeAgo(top.detectedAt)}`);
  }

  // If multiple visitors from same company, call it out
  const uniqueVisitors = [...new Set(webSignals.map(s => s.contactName).filter(Boolean))];
  if (uniqueVisitors.length > 1 && parts.length < 2) {
    parts.push(`${uniqueVisitors.length} people on site`);
  }

  return parts.join(' · ');
}

/**
 * Synthesize signals into a single "Why Now?" action line.
 * Formula: [Strongest signal] + [Context] + [Why it matters]
 */
export function getWhyNowLine(account: AccountView): string {
  const { signals, currentAts, openRoles, employeeCount, contacts } = account;
  if (signals.length === 0) return '';

  const webSignals = signals.filter(s => s.source === 'rb2b');
  const pricingVisits = webSignals.filter(s => s.pageVisited?.includes('/pricing'));
  const demoVisits = webSignals.filter(s => s.pageVisited?.includes('/demo'));
  const atsSignal = signals.find(s => s.name.toLowerCase().includes('ats') || s.name.toLowerCase().includes('limitation'));
  const hiringSignal = signals.find(s => s.name.toLowerCase().includes('open role') || s.name.toLowerCase().includes('job volume'));
  const leadershipSignal = signals.find(s => s.name.toLowerCase().includes('leadership') || s.name.toLowerCase().includes('new hr'));
  const uniqueWebVisitors = new Set(webSignals.map(s => s.contactName).filter(Boolean));

  const parts: string[] = [];

  // Lead with the strongest signal
  if (pricingVisits.length >= 2) {
    const who = pricingVisits[0].contactName;
    parts.push(`${who || 'Visitor'} hit pricing ${pricingVisits.length}×`);
  } else if (pricingVisits.length === 1) {
    const who = pricingVisits[0].contactName;
    const ago = timeAgo(pricingVisits[0].detectedAt);
    parts.push(`${who || 'Visitor'} visited pricing ${ago}`);
  } else if (demoVisits.length > 0) {
    parts.push(`${demoVisits[0].contactName || 'Visitor'} viewed demo page`);
  } else if (leadershipSignal) {
    parts.push(leadershipSignal.name);
  } else if (hiringSignal) {
    parts.push(`${openRoles || ''}+ open roles${openRoles >= 30 ? ' — high velocity' : ''}`);
  }

  // Add context
  if (currentAts && parts.length > 0) {
    const isDisplacement = atsSignal != null;
    parts.push(isDisplacement ? `on ${currentAts} (displacement)` : `using ${currentAts}`);
  } else if (currentAts && parts.length === 0) {
    parts.push(`Using ${currentAts}`);
    if (openRoles > 0) parts.push(`${openRoles}+ open roles`);
  }

  // Multi-person web visit is extremely strong
  if (uniqueWebVisitors.size >= 2 && parts.length < 3) {
    parts.push(`${uniqueWebVisitors.size} people on site`);
  }

  // Contacts / buying committee
  if (contacts.length >= 3 && parts.length < 3) {
    parts.push(`${contacts.length} stakeholders identified`);
  }

  // Fallback
  if (parts.length === 0) {
    const topSignal = signals.sort((a, b) => b.score - a.score)[0];
    parts.push(topSignal.name);
    if (topSignal.description) {
      const desc = topSignal.description.length > 60 ? topSignal.description.slice(0, 57) + '...' : topSignal.description;
      parts.push(desc);
    }
  }

  return parts.join(' — ');
}

/**
 * Determine urgency tier for visual row treatment.
 * Returns: 'act_now' | 'high' | 'normal'
 */
export type UrgencyTier = 'act_now' | 'high' | 'normal';
export function getUrgencyTier(account: AccountView): UrgencyTier {
  const now = Date.now();
  const h48 = 48 * 60 * 60 * 1000;
  const d7 = 7 * 24 * 60 * 60 * 1000;

  const webSignals = account.signals.filter(s => s.source === 'rb2b');
  const recentWeb = webSignals.filter(s => now - new Date(s.detectedAt).getTime() < h48);
  const weekWeb = webSignals.filter(s => now - new Date(s.detectedAt).getTime() < d7);
  const pricingVisits = webSignals.filter(s => s.pageVisited?.includes('/pricing'));
  const uniqueWebVisitors = new Set(webSignals.map(s => s.contactName).filter(Boolean));

  // Act Now: pricing page in last 48h OR 2+ people on site
  if (recentWeb.some(s => s.pageVisited?.includes('/pricing'))) return 'act_now';
  if (uniqueWebVisitors.size >= 2) return 'act_now';
  if (pricingVisits.length >= 2) return 'act_now';

  // High: web visit in last 7d + 2+ other signals
  if (weekWeb.length > 0 && account.signals.length >= 3) return 'high';
  if (account.score >= 30) return 'high';

  return 'normal';
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export function tierNum(tier: 'hot' | 'warm' | 'watch' | 'none'): 1 | 2 | 3 | 4 {
  return tier === 'hot' ? 1 : tier === 'warm' ? 2 : tier === 'watch' ? 3 : 4;
}

export function tierLabel(tier: 'hot' | 'warm' | 'watch' | 'none'): string {
  return tier === 'hot' ? 'Hot' : tier === 'warm' ? 'Warm' : tier === 'watch' ? 'Watch' : 'No Signals';
}


// ════════════════════════════════════════════
// SEED DATA — Rippling Displacement Campaign
// Each row = one signal event from Daniel's Clay table
// Target: Companies currently using Rippling as their ATS/HR platform
// ════════════════════════════════════════════

const _RAW_SEED_ROWS: ClayRow[] = [

  // ═══ HOT: Nuveen Investments — Andrea Coletti (Jack's territory) ═══
  {
    full_name: 'Andrea Coletti', email: 'andrea.coletti@nuveen.com', job_title: 'VP, Talent Acquisition',
    linkedin_url: 'https://linkedin.com/in/andrea-coletti-ta', phone: '(212) 916-4400',
    company_name: 'Nuveen (TIAA)', company_domain: 'nuveen.com', company_location: 'New York, NY',
    employee_count: 2800, open_roles: 34, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'Visited Pricing Page', signal_source: 'vector', signal_score: 10,
    signal_description: 'Andrea Coletti visited teamtailor.com/pricing', detected_at: '2026-06-11T10:45:00Z',
    page_visited: '/pricing', icp_tier: 'hot', assigned_rep_id: 'rep-jl',
    ai_research_brief: 'Nuveen is a TIAA subsidiary managing $1.2T in assets. They adopted Rippling for unified HR/IT but are outgrowing the ATS module as they scale specialized hiring across 34+ open roles. Their careers page is a generic Rippling embed with zero employer branding — a significant gap for a firm competing with BlackRock and Vanguard for top talent.',
    account_intel: [
      'Scale: 2,800 employees across offices in New York, Charlotte, Chicago, and London.',
      'Infrastructure: Rippling for unified HR/IT/payroll, but ATS module is the weak link — no customization.',
      'Market Position: Subsidiary of TIAA, managing $1.2T AUM. Competing with BlackRock, Vanguard, Fidelity for talent.',
      'Challenge: 34+ open roles across investment management, tech, and compliance — career page has zero brand differentiation.',
      'Leadership: VP of TA (Andrea Coletti) has been in role 8 months — still in her tooling evaluation window.',
    ],
    pain_points: [
      'Employer Brand: How is Nuveen differentiating from BlackRock and Vanguard on the careers page when the current Rippling embed looks identical to every other company?',
      'Candidate Experience: With 34+ open roles in specialized finance and tech, what is the drop-off rate on the generic application flow?',
      'Analytics: Can you report on source-of-hire, time-to-fill by department, and pipeline velocity with the current Rippling ATS module?',
      'Scalability: As TIAA expands Nuveen\'s mandate, is the ATS built to handle 50-100+ concurrent requisitions with approval workflows?',
    ],
    recommended_approach: [
      'Lead with employer branding — show how a branded career site attracts passive candidates in competitive asset management.',
      'Target Andrea Coletti during her evaluation window (8 months in role, still optimizing her stack).',
      'Position Teamtailor as "Keep Rippling for payroll and IT, upgrade the ATS for the talent experience."',
      'Propose a 15-minute career page audit comparing Nuveen\'s current Rippling embed to competitors like BlackRock\'s careers site.',
      'Reference financial services case studies showing improved quality-of-hire metrics.',
    ],
    isp_explanation: 'High ISP score driven by: Rippling ATS limitations for employer branding at scale, new VP of TA in evaluation window, 34+ open roles in a hyper-competitive talent market (asset management), and zero career page differentiation vs. direct competitors. The combination of a senior leader actively browsing pricing + a clear product gap makes this a strong displacement opportunity.',
    isp_score: 78,
    signal_category: 'Tech Stack & Change Readiness',
    glassdoor_score: 3.8,
    indeed_score: 3.6,
    g2_score: 4.1,
    negative_reviews: 'Common themes: "career development unclear," "work-life balance varies by team," "internal hiring process is slow and opaque." Candidates report a frustrating application experience.',
    hiring_signals: 'VP of TA posted "building out the talent function" on LinkedIn. 6 recruiter roles posted in Q2.',
    sf_account_owner: 'Jack Luther',
  },
  {
    full_name: 'Andrea Coletti', email: 'andrea.coletti@nuveen.com', job_title: 'VP, Talent Acquisition',
    linkedin_url: 'https://linkedin.com/in/andrea-coletti-ta', phone: '(212) 916-4400',
    company_name: 'Nuveen (TIAA)', company_domain: 'nuveen.com', company_location: 'New York, NY',
    employee_count: 2800, open_roles: 34, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'ATS Limitation: Rippling', signal_source: 'clay', signal_score: 10,
    signal_description: 'Rippling ATS module lacks employer branding, custom workflows, and advanced analytics', detected_at: '2026-06-01T00:00:00Z',
    icp_tier: 'hot', assigned_rep_id: 'rep-jl',
    sf_account_owner: 'Jack Luther',
  },
  {
    full_name: 'Andrea Coletti', email: 'andrea.coletti@nuveen.com', job_title: 'VP, Talent Acquisition',
    linkedin_url: 'https://linkedin.com/in/andrea-coletti-ta', phone: '(212) 916-4400',
    company_name: 'Nuveen (TIAA)', company_domain: 'nuveen.com', company_location: 'New York, NY',
    employee_count: 2800, open_roles: 34, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: '34+ Open Roles', signal_source: 'job_board', signal_score: 9,
    signal_description: 'Active hiring across investment management, engineering, and compliance', detected_at: '2026-06-08T00:00:00Z',
    icp_tier: 'hot', assigned_rep_id: 'rep-jl',
    sf_account_owner: 'Jack Luther',
  },
  {
    full_name: 'Marcus Webb', email: 'marcus.webb@nuveen.com', job_title: 'Director, People Operations',
    linkedin_url: 'https://linkedin.com/in/marcus-webb-hr',
    company_name: 'Nuveen (TIAA)', company_domain: 'nuveen.com', company_location: 'New York, NY',
    employee_count: 2800, open_roles: 34, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'Viewed Product Tour', signal_source: 'vector', signal_score: 8,
    signal_description: 'Marcus Webb visited teamtailor.com/product', detected_at: '2026-06-10T14:20:00Z',
    page_visited: '/product', icp_tier: 'hot', assigned_rep_id: 'rep-jl',
    sf_account_owner: 'Jack Luther',
  },
  {
    full_name: 'Andrea Coletti', email: 'andrea.coletti@nuveen.com', job_title: 'VP, Talent Acquisition',
    linkedin_url: 'https://linkedin.com/in/andrea-coletti-ta', phone: '(212) 916-4400',
    company_name: 'Nuveen (TIAA)', company_domain: 'nuveen.com', company_location: 'New York, NY',
    employee_count: 2800, open_roles: 34, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'Career Page Narrative Gap', signal_source: 'clay', signal_score: 8,
    signal_description: 'Generic Rippling careers embed — zero employer brand differentiation vs competitors', detected_at: '2026-06-05T00:00:00Z',
    icp_tier: 'hot', assigned_rep_id: 'rep-jl',
    sf_account_owner: 'Jack Luther',
  },

  // ═══ HOT: DispatchHealth — Tanya Reeves (Moe's territory) ═══
  {
    full_name: 'Tanya Reeves', email: 'tanya.reeves@dispatchhealth.com', job_title: 'Head of Talent Acquisition',
    linkedin_url: 'https://linkedin.com/in/tanya-reeves-ta', phone: '(303) 500-1518',
    company_name: 'DispatchHealth', company_domain: 'dispatchhealth.com', company_location: 'Denver, CO',
    employee_count: 1200, open_roles: 58, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'Visited Pricing Page', signal_source: 'vector', signal_score: 10,
    signal_description: 'Tanya Reeves visited teamtailor.com/pricing', detected_at: '2026-06-11T08:30:00Z',
    page_visited: '/pricing', icp_tier: 'hot', assigned_rep_id: 'rep-ma',
    ai_research_brief: 'DispatchHealth is a high-growth healthcare company (in-home urgent care) that raised $330M+ in funding. They have 58+ open roles across clinical and ops, but their Rippling ATS cannot handle credentialing workflows, compliance tracking, or multi-state hiring complexity. Career page is a basic Rippling widget with no healthcare-specific messaging.',
    account_intel: [
      'Scale: 1,200 employees operating across 50+ US markets — rapid expansion model.',
      'Infrastructure: Rippling for unified HR, but ATS module inadequate for healthcare credentialing.',
      'Funding: $330M+ raised (Series D). Backed by Tiger Global, Alta Partners. Growth-mode hiring.',
      'Challenge: 58+ open roles spanning clinical (NPs, PAs), ops, and tech — credentialing is a bottleneck.',
      'Regulation: Multi-state licensure requirements make every clinical hire compliance-heavy.',
    ],
    pain_points: [
      'Credentialing: How are you tracking state-by-state licensure and credentialing for clinical hires across 50+ markets?',
      'Speed: With 58+ open roles in a high-growth environment, what is your current time-to-fill for Nurse Practitioners and Physician Assistants?',
      'Compliance: Can Rippling\'s ATS handle automated background checks, license verification, and multi-state compliance documentation?',
      'Employer Brand: In a clinical talent market where candidates choose between hospitals, how does the career page convey DispatchHealth\'s unique value?',
    ],
    recommended_approach: [
      'Lead with healthcare hiring complexity — credentialing, compliance, and multi-state licensure.',
      'Position Teamtailor as the ATS layer Rippling can\'t provide — "Keep Rippling for payroll, upgrade recruiting."',
      'Target Head of TA (Tanya Reeves) during this hiring surge — 58 open roles creates urgency.',
      'Propose a 15-minute "Healthcare Recruiting Audit" focused on time-to-fill for clinical roles.',
      'Highlight employer branding for clinical candidates — nurses and PAs evaluate employer careers pages differently than office workers.',
    ],
    isp_explanation: 'Very high ISP score: Rippling ATS cannot handle healthcare credentialing, multi-state compliance, or clinical-specific workflows. 58+ open roles in a high-growth, VC-backed company with real budget and urgency. Head of TA actively browsing pricing pages.',
    isp_score: 82,
    signal_category: 'Hiring Volume & Volatility',
    glassdoor_score: 3.4,
    indeed_score: 3.2,
    g2_score: 4.0,
    negative_reviews: '"Rapid growth means processes are still being figured out." "Hiring process is slow despite urgency." "Career page doesn\'t reflect the mission."',
    hiring_signals: '12 clinical recruiter roles posted in last 90 days. Head of TA posted about "scaling healthcare hiring infrastructure."',
    sf_account_owner: 'Moe Aqel',
  },
  {
    full_name: 'Tanya Reeves', email: 'tanya.reeves@dispatchhealth.com', job_title: 'Head of Talent Acquisition',
    linkedin_url: 'https://linkedin.com/in/tanya-reeves-ta', phone: '(303) 500-1518',
    company_name: 'DispatchHealth', company_domain: 'dispatchhealth.com', company_location: 'Denver, CO',
    employee_count: 1200, open_roles: 58, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'High Job Volume Surge', signal_source: 'job_board', signal_score: 9,
    signal_description: '58+ open roles — clinical, operations, and tech. Volume tripled in 6 months.', detected_at: '2026-06-08T00:00:00Z',
    icp_tier: 'hot', assigned_rep_id: 'rep-ma',
    sf_account_owner: 'Moe Aqel',
  },
  {
    full_name: 'Tanya Reeves', email: 'tanya.reeves@dispatchhealth.com', job_title: 'Head of Talent Acquisition',
    linkedin_url: 'https://linkedin.com/in/tanya-reeves-ta', phone: '(303) 500-1518',
    company_name: 'DispatchHealth', company_domain: 'dispatchhealth.com', company_location: 'Denver, CO',
    employee_count: 1200, open_roles: 58, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'ATS Limitation: Rippling', signal_source: 'clay', signal_score: 10,
    signal_description: 'Rippling ATS lacks credentialing workflows, compliance tracking, and multi-state hiring support', detected_at: '2026-06-02T00:00:00Z',
    icp_tier: 'hot', assigned_rep_id: 'rep-ma',
    sf_account_owner: 'Moe Aqel',
  },
  {
    full_name: 'Jordan Hale', email: 'jordan.hale@dispatchhealth.com', job_title: 'Sr. Recruiter, Clinical',
    linkedin_url: 'https://linkedin.com/in/jordan-hale-recruit',
    company_name: 'DispatchHealth', company_domain: 'dispatchhealth.com', company_location: 'Denver, CO',
    employee_count: 1200, open_roles: 58, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'Viewed Healthcare Case Study', signal_source: 'vector', signal_score: 8,
    signal_description: 'Jordan Hale visited teamtailor.com/case-studies', detected_at: '2026-06-10T11:15:00Z',
    page_visited: '/case-studies', icp_tier: 'hot', assigned_rep_id: 'rep-ma',
    sf_account_owner: 'Moe Aqel',
  },

  // ═══ HOT: Podium — Rachel Sorensen (Tyler's territory) ═══
  {
    full_name: 'Rachel Sorensen', email: 'rachel.sorensen@podium.com', job_title: 'Director, People & Talent',
    linkedin_url: 'https://linkedin.com/in/rachel-sorensen-people', phone: '(801) 849-5507',
    company_name: 'Podium', company_domain: 'podium.com', company_location: 'Lehi, UT',
    employee_count: 1800, open_roles: 42, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'Visited Pricing Page', signal_source: 'vector', signal_score: 10,
    signal_description: 'Rachel Sorensen visited teamtailor.com/pricing', detected_at: '2026-06-12T09:00:00Z',
    page_visited: '/pricing', icp_tier: 'hot', assigned_rep_id: 'rep-th',
    ai_research_brief: 'Podium (B2B SaaS, messaging/reviews platform) raised $310M at a $3B valuation. Aggressive hiring — 42+ roles across engineering, sales, and customer success. Using Rippling but outgrowing the ATS as they scale GTM. New VP People hired Q1 2026 is reviewing the full HR stack.',
    account_intel: [
      'Scale: 1,800 employees. HQ in Lehi, UT with offices in São Paulo, Melbourne, and Provo.',
      'Funding: $310M raised, $3B valuation. Backed by Y Combinator, Summit Partners, IVP.',
      'Infrastructure: Rippling for HR/payroll, but ATS is insufficient for structured interview workflows and candidate analytics.',
      'Leadership: New VP of People (Rachel Sorensen) hired Q1 2026 — actively reviewing tooling.',
      'GTM Expansion: 42+ open roles across SDR/AE functions, engineering, and CS — aggressive hiring plan.',
    ],
    pain_points: [
      'Structured Hiring: Does the current ATS support standardized scorecards, interview kits, and calibration workflows for 42+ concurrent requisitions?',
      'Analytics: Can you report on pipeline velocity, source effectiveness, and interviewer quality metrics?',
      'Employer Brand: As a $3B SaaS company competing with Qualtrics, Domo, and Pluralsight for Utah tech talent, is the career page reflecting that?',
      'Onboarding Handoff: How does candidate data flow from ATS to Rippling\'s onboarding module today?',
    ],
    recommended_approach: [
      'Lead with structured hiring at scale — scorecards, interview workflows, and hiring manager enablement.',
      'Target Rachel Sorensen (new VP People, Q1 2026) during her stack review.',
      'Position as "Teamtailor for recruiting, Rippling for everything else" — clean integration story.',
      'Propose a branded career page mockup showing what Podium\'s employer brand could look like.',
      'Reference similar SaaS companies that made the switch from Rippling ATS to a dedicated solution.',
    ],
    isp_explanation: 'High ISP: new VP People reviewing tools, 42+ open roles with aggressive GTM hiring, Rippling ATS lacking structured interview workflows and analytics, $3B company competing for talent in Utah tech market. Strong displacement window.',
    isp_score: 75,
    signal_category: 'Tech Stack & Change Readiness',
    glassdoor_score: 4.0,
    indeed_score: 3.7,
    g2_score: 4.3,
    negative_reviews: '"Hiring process is inconsistent across teams." "Career page doesn\'t match the product quality." "Hard to track where you are in the process as a candidate."',
    hiring_signals: 'New VP People posted "excited to build" on LinkedIn. 3 recruiter roles posted in last 30 days.',
    sf_account_owner: 'Tyler Hanson',
  },
  {
    full_name: 'Rachel Sorensen', email: 'rachel.sorensen@podium.com', job_title: 'Director, People & Talent',
    linkedin_url: 'https://linkedin.com/in/rachel-sorensen-people', phone: '(801) 849-5507',
    company_name: 'Podium', company_domain: 'podium.com', company_location: 'Lehi, UT',
    employee_count: 1800, open_roles: 42, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'New HR Leadership', signal_source: 'linkedin', signal_score: 9,
    signal_description: 'New VP of People appointed Q1 2026 — tooling review window open', detected_at: '2026-05-15T00:00:00Z',
    icp_tier: 'hot', assigned_rep_id: 'rep-th',
    sf_account_owner: 'Tyler Hanson',
  },
  {
    full_name: 'Rachel Sorensen', email: 'rachel.sorensen@podium.com', job_title: 'Director, People & Talent',
    linkedin_url: 'https://linkedin.com/in/rachel-sorensen-people', phone: '(801) 849-5507',
    company_name: 'Podium', company_domain: 'podium.com', company_location: 'Lehi, UT',
    employee_count: 1800, open_roles: 42, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'ATS Limitation: Rippling', signal_source: 'clay', signal_score: 10,
    signal_description: 'Rippling ATS lacks structured interview workflows, scorecards, and hiring analytics', detected_at: '2026-06-01T00:00:00Z',
    icp_tier: 'hot', assigned_rep_id: 'rep-th',
    sf_account_owner: 'Tyler Hanson',
  },

  // ═══ WARM: HealthMarkets — Pam Nguyen (Jack's territory) ═══
  {
    full_name: 'Pam Nguyen', email: 'pam.nguyen@healthmarkets.com', job_title: 'Director of Human Resources',
    linkedin_url: 'https://linkedin.com/in/pam-nguyen-hr', phone: '(817) 748-6100',
    company_name: 'HealthMarkets', company_domain: 'healthmarkets.com', company_location: 'North Richland Hills, TX',
    employee_count: 950, open_roles: 28, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'Recruiter Overload Stress', signal_source: 'clay', signal_score: 10,
    signal_description: '2 recruiters handling 28+ open roles — 14:1 requisition ratio detected', detected_at: '2026-06-07T00:00:00Z',
    icp_tier: 'warm', assigned_rep_id: 'rep-jl',
    ai_research_brief: 'HealthMarkets is a major insurance distribution company (1M+ customers). They have 28+ open roles across sales agents, operations, and IT, but only 2 recruiters — a 14:1 ratio that signals recruiter burnout and process bottlenecks. Rippling ATS lacks automation for high-volume agent hiring.',
    account_intel: [
      'Scale: 950 employees, 12,000+ independent agents. Headquartered in North Richland Hills, TX.',
      'Model: Insurance distribution — high-volume agent recruiting is the core talent challenge.',
      'Infrastructure: Rippling ATS not built for high-volume hiring funnels or agent onboarding workflows.',
      'Challenge: 2 recruiters managing 28+ roles = 14:1 ratio. Severe recruiter overload.',
    ],
    pain_points: [
      'Volume: With a 14:1 requisition ratio, how are your recruiters managing candidate communications without dropping qualified applicants?',
      'Agent Hiring: Does the current ATS support high-volume screening, automated scheduling, and batch processing for agent roles?',
      'Recruiter Burnout: What is the plan if one of the two recruiters leaves? Is the process documented or person-dependent?',
    ],
    recommended_approach: [
      'Lead with automation — show how Teamtailor reduces manual work for high-volume hiring.',
      'Position around recruiter productivity: "Do more with 2 recruiters, or scale to 4 without doubling headcount cost."',
      'Propose a quick demo focused on automated workflows and candidate self-scheduling.',
    ],
    isp_explanation: 'Warm ISP: severe recruiter overload (14:1 ratio), high-volume agent hiring model that Rippling ATS was not designed for, and operational bottleneck risk if either recruiter leaves.',
    isp_score: 61,
    signal_category: 'Hiring Volume & Volatility',
  },
  {
    full_name: 'Pam Nguyen', email: 'pam.nguyen@healthmarkets.com', job_title: 'Director of Human Resources',
    linkedin_url: 'https://linkedin.com/in/pam-nguyen-hr', phone: '(817) 748-6100',
    company_name: 'HealthMarkets', company_domain: 'healthmarkets.com', company_location: 'North Richland Hills, TX',
    employee_count: 950, open_roles: 28, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: '28+ Open Roles', signal_source: 'job_board', signal_score: 9,
    signal_description: 'High volume hiring across agent, ops, and IT roles', detected_at: '2026-06-06T00:00:00Z',
    icp_tier: 'warm', assigned_rep_id: 'rep-jl',
    sf_account_owner: '',
  },
  {
    full_name: 'Pam Nguyen', email: 'pam.nguyen@healthmarkets.com', job_title: 'Director of Human Resources',
    linkedin_url: 'https://linkedin.com/in/pam-nguyen-hr', phone: '(817) 748-6100',
    company_name: 'HealthMarkets', company_domain: 'healthmarkets.com', company_location: 'North Richland Hills, TX',
    employee_count: 950, open_roles: 28, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'Career Page Narrative Gap', signal_source: 'clay', signal_score: 7,
    signal_description: 'Generic Rippling careers widget — no employer value proposition or benefits messaging', detected_at: '2026-06-04T00:00:00Z',
    icp_tier: 'warm', assigned_rep_id: 'rep-jl',
    sf_account_owner: '',
  },

  // ═══ WARM: Ro (health tech) — Kim Dao (Moe's territory) ═══
  {
    full_name: 'Kim Dao', email: 'kim.dao@ro.co', job_title: 'Head of People',
    linkedin_url: 'https://linkedin.com/in/kim-dao-people',
    company_name: 'Ro', company_domain: 'ro.co', company_location: 'New York, NY',
    employee_count: 800, open_roles: 22, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'Visited Demo Page', signal_source: 'vector', signal_score: 9,
    signal_description: 'Kim Dao visited teamtailor.com/demo', detected_at: '2026-06-10T16:00:00Z',
    page_visited: '/demo', icp_tier: 'warm', assigned_rep_id: 'rep-ma',
    ai_research_brief: 'Ro is a direct-to-patient healthcare company (telemedicine, pharmacy, diagnostics). 800 employees, $876M raised. Using Rippling for HR but the ATS module can\'t support compliance-heavy clinical hiring or structured engineering interviews. 22+ open roles across product, engineering, and clinical operations.',
    sf_account_owner: 'Moe Aqel',
  },
  {
    full_name: 'Kim Dao', email: 'kim.dao@ro.co', job_title: 'Head of People',
    linkedin_url: 'https://linkedin.com/in/kim-dao-people',
    company_name: 'Ro', company_domain: 'ro.co', company_location: 'New York, NY',
    employee_count: 800, open_roles: 22, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'ATS Limitation: Rippling', signal_source: 'clay', signal_score: 10,
    signal_description: 'Rippling ATS insufficient for structured engineering interviews and clinical compliance', detected_at: '2026-06-03T00:00:00Z',
    icp_tier: 'warm', assigned_rep_id: 'rep-ma',
    sf_account_owner: 'Moe Aqel',
  },
  {
    full_name: 'Kim Dao', email: 'kim.dao@ro.co', job_title: 'Head of People',
    linkedin_url: 'https://linkedin.com/in/kim-dao-people',
    company_name: 'Ro', company_domain: 'ro.co', company_location: 'New York, NY',
    employee_count: 800, open_roles: 22, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'Regulated Roles', signal_source: 'clay', signal_score: 9,
    signal_description: 'Clinical and pharmacy roles require state licensure verification and background checks', detected_at: '2026-06-01T00:00:00Z',
    icp_tier: 'warm', assigned_rep_id: 'rep-ma',
    sf_account_owner: 'Moe Aqel',
  },

  // ═══ WARM: Brex — Derek Hayashi (Tyler's territory) ═══
  {
    full_name: 'Derek Hayashi', email: 'derek.hayashi@brex.com', job_title: 'Senior Director, Talent',
    linkedin_url: 'https://linkedin.com/in/derek-hayashi-talent', phone: '(415) 906-3700',
    company_name: 'Brex', company_domain: 'brex.com', company_location: 'San Francisco, CA',
    employee_count: 1100, open_roles: 31, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'Multi-Location Hiring', signal_source: 'clay', signal_score: 9,
    signal_description: 'Hiring across SF, NYC, Vancouver, São Paulo — Rippling ATS lacks multi-region workflow support', detected_at: '2026-06-05T00:00:00Z',
    icp_tier: 'warm', assigned_rep_id: 'rep-th',
    ai_research_brief: 'Brex is a fintech (corporate credit cards, spend management) valued at $12.3B. They consolidated on Rippling for HR ops but the ATS can\'t handle multi-region hiring workflows across 4 countries. 31+ open roles across engineering, product, and GTM. Career page is a basic Rippling embed.',
    sf_account_owner: 'Tyler Hanson',
  },
  {
    full_name: 'Derek Hayashi', email: 'derek.hayashi@brex.com', job_title: 'Senior Director, Talent',
    linkedin_url: 'https://linkedin.com/in/derek-hayashi-talent', phone: '(415) 906-3700',
    company_name: 'Brex', company_domain: 'brex.com', company_location: 'San Francisco, CA',
    employee_count: 1100, open_roles: 31, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'Career Page Narrative Gap', signal_source: 'clay', signal_score: 8,
    signal_description: 'Careers page is a basic Rippling widget — no engineering culture content, no team pages', detected_at: '2026-06-02T00:00:00Z',
    icp_tier: 'warm', assigned_rep_id: 'rep-th',
    sf_account_owner: 'Tyler Hanson',
  },
  {
    full_name: 'Derek Hayashi', email: 'derek.hayashi@brex.com', job_title: 'Senior Director, Talent',
    linkedin_url: 'https://linkedin.com/in/derek-hayashi-talent', phone: '(415) 906-3700',
    company_name: 'Brex', company_domain: 'brex.com', company_location: 'San Francisco, CA',
    employee_count: 1100, open_roles: 31, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: '31+ Open Roles', signal_source: 'job_board', signal_score: 9,
    signal_description: 'Hiring across engineering, product, sales, and customer success', detected_at: '2026-06-07T00:00:00Z',
    icp_tier: 'warm', assigned_rep_id: 'rep-th',
    sf_account_owner: 'Tyler Hanson',
  },

  // ═══ WARM: Pipe — Alina Torres (Jack's territory) ═══
  {
    full_name: 'Alina Torres', email: 'alina.torres@pipe.com', job_title: 'VP People',
    linkedin_url: 'https://linkedin.com/in/alina-torres-people',
    company_name: 'Pipe', company_domain: 'pipe.com', company_location: 'Miami, FL',
    employee_count: 350, open_roles: 16, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'Visited Pricing Page', signal_source: 'vector', signal_score: 10,
    signal_description: 'Alina Torres visited teamtailor.com/pricing', detected_at: '2026-06-11T13:30:00Z',
    page_visited: '/pricing', icp_tier: 'warm', assigned_rep_id: 'rep-jl',
    ai_research_brief: 'Pipe is a fintech (revenue-based financing platform) that raised $316M. 350 employees, 16 open roles. Using Rippling across the board but VP People is actively browsing ATS alternatives — pricing page visit is a strong intent signal. Small but growing team means every hire matters more.',
    sf_account_owner: 'Jack Luther',
  },
  {
    full_name: 'Alina Torres', email: 'alina.torres@pipe.com', job_title: 'VP People',
    linkedin_url: 'https://linkedin.com/in/alina-torres-people',
    company_name: 'Pipe', company_domain: 'pipe.com', company_location: 'Miami, FL',
    employee_count: 350, open_roles: 16, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'ATS Limitation: Rippling', signal_source: 'clay', signal_score: 10,
    signal_description: 'Rippling ATS lacks advanced analytics, structured scorecards, and career page customization', detected_at: '2026-06-04T00:00:00Z',
    icp_tier: 'warm', assigned_rep_id: 'rep-jl',
    sf_account_owner: 'Jack Luther',
  },

  // ═══ WATCH: Calendly — Devon West (Moe's territory) ═══
  {
    full_name: 'Devon West', email: 'devon.west@calendly.com', job_title: 'People Operations Manager',
    linkedin_url: 'https://linkedin.com/in/devon-west-hr',
    company_name: 'Calendly', company_domain: 'calendly.com', company_location: 'Atlanta, GA',
    employee_count: 700, open_roles: 14, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'ATS Limitation: Rippling', signal_source: 'clay', signal_score: 10,
    signal_description: 'Rippling ATS insufficient for product-led growth company hiring at Calendly\'s scale', detected_at: '2026-06-01T00:00:00Z',
    icp_tier: 'watch', assigned_rep_id: 'rep-ma',
  },
  {
    full_name: 'Devon West', email: 'devon.west@calendly.com', job_title: 'People Operations Manager',
    linkedin_url: 'https://linkedin.com/in/devon-west-hr',
    company_name: 'Calendly', company_domain: 'calendly.com', company_location: 'Atlanta, GA',
    employee_count: 700, open_roles: 14, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'External Recruiter Dependency', signal_source: 'clay', signal_score: 7,
    signal_description: '3+ agency recruiter job posts detected — potential reliance on external sourcing', detected_at: '2026-06-03T00:00:00Z',
    icp_tier: 'watch', assigned_rep_id: 'rep-ma',
  },

  // ═══ WATCH: Pax8 — Nina Alvarez (Tyler's territory) ═══
  {
    full_name: 'Nina Alvarez', email: 'nina.alvarez@pax8.com', job_title: 'HR Business Partner',
    linkedin_url: 'https://linkedin.com/in/nina-alvarez-hrbp',
    company_name: 'Pax8', company_domain: 'pax8.com', company_location: 'Denver, CO',
    employee_count: 900, open_roles: 19, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'ATS Limitation: Rippling', signal_source: 'clay', signal_score: 10,
    signal_description: 'Rippling ATS lacks hiring manager enablement features and structured interview support', detected_at: '2026-06-01T00:00:00Z',
    icp_tier: 'watch', assigned_rep_id: 'rep-th',
  },
  {
    full_name: 'Nina Alvarez', email: 'nina.alvarez@pax8.com', job_title: 'HR Business Partner',
    linkedin_url: 'https://linkedin.com/in/nina-alvarez-hrbp',
    company_name: 'Pax8', company_domain: 'pax8.com', company_location: 'Denver, CO',
    employee_count: 900, open_roles: 19, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'Hiring Manager Enablement Gap', signal_source: 'clay', signal_score: 6,
    signal_description: 'Hiring managers posting roles via email chains — no self-service requisition workflow', detected_at: '2026-06-02T00:00:00Z',
    icp_tier: 'watch', assigned_rep_id: 'rep-th',
  },
  {
    full_name: 'Nina Alvarez', email: 'nina.alvarez@pax8.com', job_title: 'HR Business Partner',
    linkedin_url: 'https://linkedin.com/in/nina-alvarez-hrbp',
    company_name: 'Pax8', company_domain: 'pax8.com', company_location: 'Denver, CO',
    employee_count: 900, open_roles: 19, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'Multi-Location Hiring', signal_source: 'clay', signal_score: 8,
    signal_description: 'Hiring across Denver, Orlando, and Sydney — Rippling ATS lacks multi-region support', detected_at: '2026-06-04T00:00:00Z',
    icp_tier: 'watch', assigned_rep_id: 'rep-th',
  },

  // ═══ WATCH: Notion — Sam Kowalski (Jack's territory) ═══
  {
    full_name: 'Sam Kowalski', email: 'sam.kowalski@makenotion.com', job_title: 'Recruiting Lead',
    linkedin_url: 'https://linkedin.com/in/sam-kowalski-recruit',
    company_name: 'Notion', company_domain: 'notion.so', company_location: 'San Francisco, CA',
    employee_count: 600, open_roles: 18, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'Career Page Narrative Gap', signal_source: 'clay', signal_score: 8,
    signal_description: 'Notion\'s career page doesn\'t reflect their brand quality — basic Rippling widget vs. their polished product', detected_at: '2026-06-03T00:00:00Z',
    icp_tier: 'watch', assigned_rep_id: 'rep-jl',
  },
  {
    full_name: 'Sam Kowalski', email: 'sam.kowalski@makenotion.com', job_title: 'Recruiting Lead',
    linkedin_url: 'https://linkedin.com/in/sam-kowalski-recruit',
    company_name: 'Notion', company_domain: 'notion.so', company_location: 'San Francisco, CA',
    employee_count: 600, open_roles: 18, current_ats: 'Rippling', audience_source: 'Rippling',
    signal_name: 'ATS Limitation: Rippling', signal_source: 'clay', signal_score: 10,
    signal_description: 'Rippling ATS cannot match Notion\'s brand standards for candidate experience', detected_at: '2026-06-01T00:00:00Z',
    icp_tier: 'watch', assigned_rep_id: 'rep-jl',
  },
];

// Generate deterministic dynamic dates so filters work
const now = Date.now();
const hour = 60 * 60 * 1000;
const day = 24 * hour;

function hashOffset(str: string, maxDays: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % maxDays;
}

export const SEED_CLAY_ROWS: ClayRow[] = _RAW_SEED_ROWS.map(row => {
  const daysAgo = hashOffset(row.signal_description + row.full_name, 30);
  const hoursAgo = hashOffset(row.signal_name, 24);
  const d = new Date(now - (daysAgo * day) - (hoursAgo * hour));
  return { ...row, detected_at: d.toISOString() };
});
