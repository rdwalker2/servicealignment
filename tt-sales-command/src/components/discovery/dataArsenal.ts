// ============================================================
// Data Arsenal — contextual stats mapped to selected pains
// Used by CopilotDrawerContent to surface relevant data points
// ============================================================

export const DATA_ARSENAL: Record<string, { stat: string; source: string }[]> = {
  'manual-screening': [
    { stat: '0.74% of applications result in a hire (6M apps analyzed)', source: 'Teamtailor Enterprise Data' },
    { stat: '5.4x more likely to be hired at 5/5 AI screening match', source: 'Teamtailor Enterprise Data' },
    { stat: '16M+ candidates screened through AI — this is not a guinea pig', source: 'Teamtailor Platform' },
    { stat: 'Recruiters using AI handle 246 apps vs 66 without — 3x capacity', source: 'Teamtailor Enterprise Data' },
  ],
  'screening-bottleneck': [
    { stat: '0.74% of applications result in a hire — needle in a haystack', source: 'Teamtailor Enterprise Data' },
    { stat: '5.4x more likely to be hired at 5/5 AI screening match', source: 'Teamtailor Enterprise Data' },
    { stat: '60M candidates screened through AI globally', source: 'Teamtailor Platform' },
  ],
  'poor-candidate-experience': [
    { stat: '80% of candidate withdrawals due to communication delays', source: 'Indeed 2024' },
    { stat: 'Gen Z expects to hear back in 5-7 days', source: 'Industry Research' },
    { stat: '2.6x more applications YoY vs 12 months ago', source: 'Indeed Recruit' },
  ],
  'slow-time-to-hire': [
    { stat: '80% of withdrawn applications due to communication delays', source: 'Indeed 2024' },
    { stat: 'Motorpoint: 58% reduction in time-to-hire downtime with SLA triggers', source: 'Customer Case Study' },
    { stat: 'Lotus Cars: TTH reduced from 55 → 23 days', source: 'Customer Case Study' },
  ],
  'outdated-career-site': [
    { stat: '63% of candidates research careers page before first interview', source: 'Randstad State of Employer Branding 2025' },
    { stat: 'Foot Asylum: 0% → 40% direct applications via careers page in 2 years', source: 'Customer Case Study' },
  ],
  'no-content-hub': [
    { stat: '63% of candidates research careers page before first interview', source: 'Randstad State of Employer Branding 2025' },
    { stat: 'Gen Z/Alpha prefer short-form video — attention spans require rich media', source: 'Industry Panel Discussion' },
  ],
  'high-cost-per-hire': [
    { stat: '£408/day per vacancy — one enterprise customer calculated £31M total', source: 'Anonymized Business Case' },
    { stat: '20% reduction in vacancy cost = millions in savings', source: 'Anonymized Business Case' },
    { stat: 'Foot Asylum: 17.1% of hires from Connect CRM (1 in 5 hires free)', source: 'Customer Case Study' },
  ],
  'agency-spend': [
    { stat: 'Foot Asylum: 17.1% of 2,500 hires from Connect — massive agency offset', source: 'Customer Case Study' },
    { stat: '200,000 applications via careers page = zero job board cost', source: 'Foot Asylum Case Study' },
  ],
  'weak-talent-pools': [
    { stat: 'Foot Asylum: 17.1% of all hires from Connect talent pool', source: 'Customer Case Study' },
    { stat: '13,000 customers with aggregated benchmarking data available', source: 'Teamtailor Platform' },
  ],
  'locked-out-managers': [
    { stat: 'Octavo: 100% hiring manager adoption in ~3 months (from technophobic HMs)', source: 'Customer Case Study' },
    { stat: 'Savills: Embedded training videos on dashboard — 15,000 employee org', source: 'Customer Case Study' },
  ],
  'hris-ats-rigidity': [
    { stat: 'Paycom is double the cost of a standard HRIS with limited ATS capabilities', source: 'Eagle Mountain Casino evaluation' },
    { stat: '90% of hiring managers bypass HRIS recruiting modules due to clunky desktop UIs', source: 'Platform Adoption Benchmark' },
  ],
  'agency-to-in-house-transition': [
    { stat: 'Foot Asylum: Direct hiring model cut agency spend by 65% in 18 months', source: 'Customer Case Study' },
    { stat: 'Average agency fee is 15-20% of first-year salary ($15K+ per hire)', source: 'Industry Standard' },
  ],
  'mobile-retail-capture-gap': [
    { stat: 'JD Sports: 40% candidate capture boost using in-store QR codes', source: 'Retail Case Study' },
    { stat: 'Over 60% of retail/hospitality job seekers apply on a mobile device', source: 'Indeed Benchmark' },
  ],
  'candidate-communication-black-hole': [
    { stat: '80% of candidate withdrawals due to communication delays', source: 'Indeed 2024' },
    { stat: 'Gen Z/Alpha expect contact in 24-48 hours via text/SMS', source: 'Industry Panel' },
    { stat: 'Indeed Study: 80% of withdrawn applications could be prevented with automated triggers', source: 'Indeed Research' },
  ],
  'assessment-integration-gap': [
    { stat: '0.74% of applications result in a hire — structured screening is essential to find the needle', source: 'Teamtailor Enterprise Data' },
    { stat: 'Octavo: 100% hiring manager adoption in ~3 months using structured scorecards', source: 'Customer Case Study' },
  ],
  'fragmented-multi-brand': [
    { stat: 'Zelis Group consolidated 4 separate ATS systems into one Teamtailor instance across brands', source: 'Customer Case Study' },
    { stat: '13,000 customers with multi-brand career site support built-in', source: 'Teamtailor Platform' },
  ],
  'vendor-support-gap': [
    { stat: 'Average Teamtailor implementation: 63 days from contract to live', source: 'Customer Benchmark' },
    { stat: 'Dedicated CSM assigned to every account — no self-service abandonment', source: 'Teamtailor Platform' },
  ],
  'reporting-analytics-blind': [
    { stat: 'Frontera switched from Greenhouse citing "lack of good reporting structure"', source: 'Customer Case Study' },
    { stat: 'Built-in DEI dashboards, source-of-hire analytics, and time-to-fill tracking out of the box', source: 'Teamtailor Platform' },
  ],
  'tool-sprawl-centralization': [
    { stat: 'Sterling Staffing replaced spreadsheet-driven candidate tracking with centralized CRM + ATS', source: 'Customer Case Study' },
    { stat: 'Single platform covers career site, ATS, CRM, analytics, and scheduling', source: 'Teamtailor Platform' },
  ],
  'onboarding-handoff-gap': [
    { stat: 'Automated offer-to-onboarding workflows reduce new hire no-shows by up to 30%', source: 'Industry Benchmark' },
    { stat: 'Teamtailor connects directly to HRIS systems for seamless Day 1 data handoff', source: 'Teamtailor Platform' },
  ],
  'email-deliverability': [
    { stat: 'JazzHR users report candidate emails consistently going to spam — candidates never see interview invites', source: 'JK Transcript: Henley / Centre Tech' },
    { stat: 'Teamtailor uses enterprise-grade email infrastructure with SPF/DKIM/DMARC compliance', source: 'Teamtailor Platform' },
  ],
  'gdpr-automation-gap': [
    { stat: 'GDPR fines can reach €20M or 4% of global annual turnover — whichever is higher', source: 'EU GDPR Regulation' },
    { stat: 'Teamtailor is GDPR-native with automated consent management, data retention, and right-to-deletion', source: 'Teamtailor Platform' },
  ],
  'duplicate-candidate-mess': [
    { stat: 'Duplicate records create false pipeline metrics — one candidate counted as 3 inflates funnel data', source: 'Industry Research' },
    { stat: 'Teamtailor automatically detects and merges duplicate candidate profiles', source: 'Teamtailor Platform' },
  ],
  'hm-handwritten-notes': [
    { stat: 'Hiring managers using handwritten notes create zero audit trail — legal risk in discrimination claims', source: 'Employment Law Best Practice' },
    { stat: 'Teamtailor mobile app: hiring managers leave structured feedback in 30 seconds from their phone', source: 'Teamtailor Platform' },
  ],
  'job-posting-formatting': [
    { stat: 'Job postings with broken formatting get 40% fewer applications than properly formatted listings', source: 'LinkedIn Talent Solutions' },
    { stat: "Teamtailor's multi-channel distribution preserves formatting across LinkedIn, Indeed, and 30+ job boards", source: 'Teamtailor Platform' },
  ],
  'adoption-gap': [
    { stat: 'Amy Bush / Outform: 3.5-4 hours every Monday doing manual reports that should be automated', source: 'JK Transcript: Outform' },
    { stat: 'Octavo: 100% hiring manager adoption in ~3 months — even from technophobic managers', source: 'Customer Case Study' },
  ],
  'careers-page-ownership-conflict': [
    { stat: 'James Keating builds a custom Teamtailor career site in 15 minutes live on demo calls — zero IT dependency', source: 'JK Demo Technique' },
    { stat: '63% of candidates research careers page before first interview', source: 'Randstad Employer Branding 2025' },
  ],
  'application-volume-explosion': [
    { stat: 'Jessica/Henley: reviewed 60 CVs in 2 hours with zero qualified candidates — AI screening fixes this', source: 'JK Transcript: Henley' },
    { stat: 'Recruiters using AI handle 246 apps vs 66 without — 3x capacity increase', source: 'Teamtailor Enterprise Data' },
  ],
  'internal-mobility-gap': [
    { stat: 'Companies with strong internal mobility reduce external hiring costs by 20-30%', source: 'Industry Research' },
    { stat: 'Teamtailor Connect enables internal talent pools and cross-brand job visibility', source: 'Teamtailor Platform' },
  ],
  'interview-governance-gap': [
    { stat: 'Unstructured interviews are only 14% predictive vs. 26% for structured interviews', source: 'Schmidt & Hunter Meta-Analysis' },
    { stat: 'Teamtailor Interview Kits provide standardized scorecards and AI-generated questions', source: 'Teamtailor Platform' },
  ],
};
