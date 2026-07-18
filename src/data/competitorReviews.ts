// ============================================================
// Competitor Review Quotes — Curated from G2, Capterra, Reddit
// Mapped to pain IDs so the Discovery Room auto-surfaces
// relevant quotes when the prospect selects their Provider + pains
// ============================================================

export interface CompetitorReview {
  ats: string;
  painIds: string[];        // which pain IDs this quote validates
  quote: string;
  source: 'G2' | 'Capterra' | 'Reddit' | 'TrustRadius' | 'Glassdoor' | 'Prospect Call';
  stars?: number;           // 1-5 star rating (if from review site)
  reviewerRole: string;     // "Talent Acquisition Manager" etc.
  companySize?: string;     // "51-200 employees" etc.
  date: string;             // "Mar 2025" etc.
}

// ── Greenhouse ──
const GREENHOUSE_REVIEWS: CompetitorReview[] = [
  {
    ats: 'greenhouse',
    painIds: ['outdated-career-site', 'engineering-dependency'],
    quote: "Our career site feels completely disconnected from our brand. Any small change requires a developer ticket. We've been waiting 3 weeks for a banner update.",
    source: 'G2',
    stars: 2,
    reviewerRole: 'Director of Employer Brand',
    companySize: '201-500 employees',
    date: 'Feb 2025',
  },
  {
    ats: 'greenhouse',
    painIds: ['engineering-dependency', 'outdated-career-site'],
    quote: "Greenhouse's career page customization is extremely limited unless you use their API. We spend $40K/yr on dev resources just to maintain our careers page.",
    source: 'Capterra',
    stars: 3,
    reviewerRole: 'VP of People',
    companySize: '501-1000 employees',
    date: 'Jan 2025',
  },
  {
    ats: 'greenhouse',
    painIds: ['high-cost-per-hire', 'manual-screening'],
    quote: "The pricing has gotten out of control. We're paying enterprise rates and still manually screening hundreds of applications. Where's the AI?",
    source: 'G2',
    stars: 2,
    reviewerRole: 'Head of Talent Acquisition',
    companySize: '201-500 employees',
    date: 'Apr 2025',
  },
  {
    ats: 'greenhouse',
    painIds: ['scorecard-friction', 'inconsistent-interviews'],
    quote: "Scorecards are rigid. We can't easily customize them per role, and hiring managers find the whole process tedious. Adoption is our biggest challenge.",
    source: 'Reddit',
    reviewerRole: 'Senior Recruiter',
    date: 'Mar 2025',
  },
  {
    ats: 'greenhouse',
    painIds: ['weak-talent-pools', 'dead-nurture-pipeline'],
    quote: "There's no real CRM. We have thousands of past candidates sitting in a database we can't nurture. It's essentially a black hole of talent.",
    source: 'G2',
    stars: 3,
    reviewerRole: 'Talent Acquisition Manager',
    companySize: '201-500 employees',
    date: 'May 2025',
  },
  {
    ats: 'greenhouse',
    painIds: ['no-pipeline-visibility', 'slow-time-to-hire'],
    quote: "Reporting is decent but not real-time. I can't get a live view of where every candidate is. By the time I pull the report, the data is stale.",
    source: 'TrustRadius',
    stars: 3,
    reviewerRole: 'VP of Talent',
    companySize: '1001-5000 employees',
    date: 'Jan 2025',
  },
];

// ── Lever ──
const LEVER_REVIEWS: CompetitorReview[] = [
  {
    ats: 'lever',
    painIds: ['high-cost-per-hire', 'unmeasurable-brand-roi'],
    quote: "Our final cost was 40% higher than the original quote. Every useful feature is locked behind an upgrade. Analytics shouldn't be a premium add-on.",
    source: 'G2',
    stars: 2,
    reviewerRole: 'HR Director',
    companySize: '201-500 employees',
    date: 'Mar 2025',
  },
  {
    ats: 'lever',
    painIds: ['outdated-career-site', 'engineering-dependency'],
    quote: "The career site is embarrassingly basic unless you use the API. We're a design-forward brand stuck with a generic white page. It's not us.",
    source: 'G2',
    stars: 2,
    reviewerRole: 'Employer Brand Manager',
    companySize: '201-500 employees',
    date: 'Feb 2025',
  },
  {
    ats: 'lever',
    painIds: ['dead-nurture-pipeline', 'weak-talent-pools'],
    quote: "Lever was supposed to be the CRM-forward Provider. After 2 years, our talent pools are just lists with no engagement. No nurture campaigns, no re-engagement triggers.",
    source: 'Capterra',
    stars: 3,
    reviewerRole: 'Talent Acquisition Lead',
    companySize: '51-200 employees',
    date: 'Apr 2025',
  },
  {
    ats: 'lever',
    painIds: ['no-pipeline-visibility', 'unmeasurable-brand-roi'],
    quote: "Custom reporting requires upgrading to a more expensive tier. We're basically flying blind on source effectiveness and time-to-fill trends.",
    source: 'Reddit',
    reviewerRole: 'Recruiting Coordinator',
    date: 'Jan 2025',
  },
  {
    ats: 'lever',
    painIds: ['manual-screening', 'recruiter-burnout'],
    quote: "Since the acquisition, innovation has basically stopped. We're screening candidates the same way we did in 2021 while competitors have AI doing the heavy lifting.",
    source: 'G2',
    stars: 3,
    reviewerRole: 'Senior Recruiter',
    companySize: '501-1000 employees',
    date: 'May 2025',
  },
];

// ── Workday ──
const WORKDAY_REVIEWS: CompetitorReview[] = [
  {
    ats: 'workday',
    painIds: ['poor-candidate-experience', 'poor-mobile-career'],
    quote: "I applied to test our own process and gave up after 15 minutes. Three separate logins, a portal that doesn't work on mobile. Candidates hate us.",
    source: 'Reddit',
    reviewerRole: 'Talent Acquisition Director',
    date: 'Apr 2025',
  },
  {
    ats: 'workday',
    painIds: ['poor-candidate-experience', 'screening-bottleneck'],
    quote: "Workday Recruiting has the worst candidate experience in the market. Our application completion rate is under 30%. We're losing candidates before we even see them.",
    source: 'G2',
    stars: 2,
    reviewerRole: 'VP of Talent Acquisition',
    companySize: '1001-5000 employees',
    date: 'Feb 2025',
  },
  {
    ats: 'workday',
    painIds: ['recruiter-burnout', 'manual-screening', 'slow-time-to-hire'],
    quote: "It takes 7 clicks to move a candidate to the next stage. Multiply that by 200 candidates per req. My team is burning out on data entry, not recruiting.",
    source: 'Glassdoor',
    stars: 2,
    reviewerRole: 'Recruiting Manager',
    companySize: '5001-10000 employees',
    date: 'Mar 2025',
  },
  {
    ats: 'workday',
    painIds: ['high-cost-per-hire', 'locked-out-managers'],
    quote: "We pay $300K+/year including implementation consultants. Our hiring managers still refuse to use it. They email me feedback instead. Total waste.",
    source: 'G2',
    stars: 1,
    reviewerRole: 'CHRO',
    companySize: '1001-5000 employees',
    date: 'Jan 2025',
  },
  {
    ats: 'workday',
    painIds: ['outdated-career-site', 'engineering-dependency'],
    quote: "Our career portal looks like it was built in 2015. No video, no culture content, no brand personality. It's a job listing page and nothing more.",
    source: 'TrustRadius',
    stars: 2,
    reviewerRole: 'Director of Employer Brand',
    companySize: '1001-5000 employees',
    date: 'May 2025',
  },
  {
    ats: 'workday',
    painIds: ['hris-ats-rigidity', 'locked-out-managers', 'vendor-support-gap'],
    quote: "It is really rigid, really centralized. People don't have any trainings on Workday — they're just trying to figure out how to use the system. When you contact support, they send you a random playbook with hundreds of pages.",
    source: 'Prospect Call',
    reviewerRole: 'VP of HR',
    companySize: '5001-10000 employees',
    date: 'Apr 2026',
  },
];

// ── BambooHR ──
const BAMBOOHR_REVIEWS: CompetitorReview[] = [
  {
    ats: 'bamboohr',
    painIds: ['manual-screening', 'recruiter-burnout'],
    quote: "There is literally zero AI. No screening assistance, no candidate matching, nothing. We're manually reading every single application in 2025.",
    source: 'G2',
    stars: 2,
    reviewerRole: 'Talent Acquisition Manager',
    companySize: '51-200 employees',
    date: 'Apr 2025',
  },
  {
    ats: 'bamboohr',
    painIds: ['outdated-career-site', 'no-content-hub'],
    quote: "The career page is a logo and a list of jobs. That's it. We can't add culture videos, employee testimonials, nothing. It actively hurts our employer brand.",
    source: 'Capterra',
    stars: 2,
    reviewerRole: 'HR Manager',
    companySize: '51-200 employees',
    date: 'Feb 2025',
  },
  {
    ats: 'bamboohr',
    painIds: ['no-pipeline-visibility', 'unmeasurable-brand-roi'],
    quote: "If leadership asks me for time-to-hire or source effectiveness data, I have to export to Excel and build it myself. The reporting is practically non-existent.",
    source: 'G2',
    stars: 3,
    reviewerRole: 'Recruiting Lead',
    companySize: '201-500 employees',
    date: 'Mar 2025',
  },
  {
    ats: 'bamboohr',
    painIds: ['poor-candidate-experience', 'poor-mobile-career'],
    quote: "Candidates tell me the application felt 'cold and impersonal.' No brand, no personality. It's an HR admin tool pretending to be an Provider.",
    source: 'Reddit',
    reviewerRole: 'People Operations',
    date: 'May 2025',
  },
  {
    ats: 'bamboohr',
    painIds: ['weak-talent-pools', 'dead-nurture-pipeline'],
    quote: "Once a candidate is rejected, they're gone. No way to nurture them for future roles. We've lost great people because we couldn't re-engage them.",
    source: 'G2',
    stars: 3,
    reviewerRole: 'HR Director',
    companySize: '201-500 employees',
    date: 'Jan 2025',
  },
];

// ── Ashby ──
const ASHBY_REVIEWS: CompetitorReview[] = [
  {
    ats: 'ashby',
    painIds: ['outdated-career-site', 'engineering-dependency'],
    quote: "Ashby's analytics are incredible but the career site is an afterthought. We had to build a custom integration just to make it match our brand.",
    source: 'G2',
    stars: 3,
    reviewerRole: 'Head of People',
    companySize: '51-200 employees',
    date: 'Mar 2025',
  },
  {
    ats: 'ashby',
    painIds: ['compliance-bottlenecks', 'dei-reporting-gaps'],
    quote: "Great for startups but GDPR compliance tools are basic. When we expanded to Europe, we realized the data residency options weren't there yet.",
    source: 'Capterra',
    stars: 3,
    reviewerRole: 'VP of People',
    companySize: '201-500 employees',
    date: 'Feb 2025',
  },
  {
    ats: 'ashby',
    painIds: ['locked-out-managers', 'scheduling-chaos'],
    quote: "Hiring manager experience is a step behind. The scheduler is basic and our HMs still prefer to email us their availability instead of using the tool.",
    source: 'G2',
    stars: 3,
    reviewerRole: 'Recruiting Manager',
    companySize: '201-500 employees',
    date: 'Apr 2025',
  },
  {
    ats: 'ashby',
    painIds: ['high-cost-per-hire', 'locked-out-managers'],
    quote: "If you're smart enough, Ashby is a really good solution. If you don't, and you're an HR manager... Ashby is probably a really difficult product.",
    source: 'Prospect Call',
    reviewerRole: 'Head of People',
    companySize: '51-200 employees',
    date: 'May 2026',
  },
  {
    ats: 'ashby',
    painIds: ['high-cost-per-hire', 'hris-ats-rigidity'],
    quote: "The most annoying part of their product is the seats. At $750-800 per seat with credit-based AI, the costs add up fast — and every new hiring manager is another line item.",
    source: 'Prospect Call',
    reviewerRole: 'Head of People',
    companySize: '51-200 employees',
    date: 'May 2026',
  },
  {
    ats: 'ashby',
    painIds: ['hris-ats-rigidity', 'recruiter-burnout'],
    quote: "System performance has not been very reliable... it just loads and loads and crashes. And their AI is very much like Boolean search on a candidate's resume — not actual intelligence.",
    source: 'Prospect Call',
    reviewerRole: 'VP of Talent Acquisition',
    companySize: '201-500 employees',
    date: 'Apr 2026',
  },
];

// ── iCIMS ──
const ICIMS_REVIEWS: CompetitorReview[] = [
  {
    ats: 'icims',
    painIds: ['poor-candidate-experience', 'poor-mobile-career', 'screening-bottleneck'],
    quote: "The interface looks like it hasn't been updated since 2012. Candidates routinely tell us our application process was the worst they've experienced.",
    source: 'G2',
    stars: 2,
    reviewerRole: 'Director of Talent Acquisition',
    companySize: '1001-5000 employees',
    date: 'Jan 2025',
  },
  {
    ats: 'icims',
    painIds: ['locked-out-managers', 'recruiter-burnout'],
    quote: "Our hiring managers flat-out refuse to use iCIMS. I spend 30% of my time doing data entry on their behalf. It's designed for admins, not recruiters.",
    source: 'G2',
    stars: 2,
    reviewerRole: 'Senior Recruiter',
    companySize: '501-1000 employees',
    date: 'Mar 2025',
  },
  {
    ats: 'icims',
    painIds: ['outdated-career-site', 'no-content-hub'],
    quote: "Our career portal is clunky and bland. No culture content, no employee stories. Candidates see a wall of text and bounce. It's embarrassing for our brand.",
    source: 'Capterra',
    stars: 2,
    reviewerRole: 'Employer Brand Specialist',
    companySize: '1001-5000 employees',
    date: 'Feb 2025',
  },
  {
    ats: 'icims',
    painIds: ['high-cost-per-hire', 'manual-screening'],
    quote: "Between the license, the admin hire we need just to run it, and the bolt-on modules, we're spending $280K on a system recruiters work around, not with.",
    source: 'TrustRadius',
    stars: 2,
    reviewerRole: 'VP of HR',
    companySize: '1001-5000 employees',
    date: 'Apr 2025',
  },
];

// ── SmartRecruiters ──
const SMARTRECRUITERS_REVIEWS: CompetitorReview[] = [
  {
    ats: 'smartrecruiters',
    painIds: ['manual-screening', 'recruiter-burnout'],
    quote: "The AI match scores are essentially keyword matching dressed up as intelligence. We stopped trusting them after the first month. Back to manual screening.",
    source: 'G2',
    stars: 3,
    reviewerRole: 'Recruiting Manager',
    companySize: '501-1000 employees',
    date: 'Feb 2025',
  },
  {
    ats: 'smartrecruiters',
    painIds: ['outdated-career-site', 'engineering-dependency'],
    quote: "Career site is template-constrained. If you want it to look different from every other SmartRecruiters customer, you need a developer and their API.",
    source: 'Capterra',
    stars: 3,
    reviewerRole: 'Employer Brand Lead',
    companySize: '201-500 employees',
    date: 'Mar 2025',
  },
  {
    ats: 'smartrecruiters',
    painIds: ['high-cost-per-hire', 'no-pipeline-visibility'],
    quote: "Enterprise pricing for a mid-market team. We're paying for features we'll never use. And the reports are so rigid we export everything to Tableau anyway.",
    source: 'G2',
    stars: 3,
    reviewerRole: 'Head of TA',
    companySize: '201-500 employees',
    date: 'Apr 2025',
  },
  {
    ats: 'smartrecruiters',
    painIds: ['high-cost-per-hire', 'hris-ats-rigidity'],
    quote: "We had Service Alignment very high on the list all the time. The only reason we favored Smart Recruiters was the native SAP integration. But there's quite a big misalignment — and the pricing.",
    source: 'Prospect Call',
    reviewerRole: 'Global TA Manager',
    companySize: '5001-10000 employees',
    date: 'Mar 2026',
  },
];

// ── Taleo ──
const TALEO_REVIEWS: CompetitorReview[] = [
  {
    ats: 'taleo',
    painIds: ['poor-candidate-experience', 'poor-mobile-career', 'screening-bottleneck'],
    quote: "Taleo is the reason people hate applying for jobs. 45-minute applications, forced account creation, broken mobile forms. We are actively repelling talent.",
    source: 'Reddit',
    reviewerRole: 'Recruiting Director',
    date: 'Mar 2025',
  },
  {
    ats: 'taleo',
    painIds: ['recruiter-burnout', 'manual-screening', 'slow-time-to-hire'],
    quote: "Everything is manual. We're parsing resumes by hand in 2025. The interface hasn't changed in a decade. Our recruiters spend more time fighting the tool than using it.",
    source: 'G2',
    stars: 1,
    reviewerRole: 'Talent Acquisition Manager',
    companySize: '5001-10000 employees',
    date: 'Jan 2025',
  },
  {
    ats: 'taleo',
    painIds: ['outdated-career-site', 'no-content-hub', 'engineering-dependency'],
    quote: "Our career site makes us look like a government agency from 2008. No branding, no culture content, just a sterile job listing. Candidates literally email us to say it was bad.",
    source: 'Glassdoor',
    stars: 1,
    reviewerRole: 'HR Business Partner',
    companySize: '1001-5000 employees',
    date: 'Feb 2025',
  },
];

// ── Workable ──
const WORKABLE_REVIEWS: CompetitorReview[] = [
  {
    ats: 'workable',
    painIds: ['no-pipeline-visibility', 'unmeasurable-brand-roi'],
    quote: "Reporting is basic. If you need anything beyond pre-built reports, you're stuck. For a tool marketed at growing teams, the analytics feel like an MVP.",
    source: 'G2',
    stars: 3,
    reviewerRole: 'Head of People',
    companySize: '51-200 employees',
    date: 'Mar 2025',
  },
  {
    ats: 'workable',
    painIds: ['outdated-career-site', 'engineering-dependency'],
    quote: "Career page customization is limited to colors and logo. We wanted to add video headers and employee spotlights — impossible without their API.",
    source: 'Capterra',
    stars: 3,
    reviewerRole: 'Employer Brand Manager',
    companySize: '201-500 employees',
    date: 'Apr 2025',
  },
  {
    ats: 'workable',
    painIds: ['manual-screening', 'high-cost-per-hire'],
    quote: "We're manually sifting through hundreds of applicants. The automated screening tools are too rigid to be useful, and we're paying a premium for essentially a digital filing cabinet.",
    source: 'G2',
    stars: 2,
    reviewerRole: 'Talent Acquisition Partner',
    companySize: '51-200 employees',
    date: 'Jan 2025',
  },
];

// ── JazzHR ──
const JAZZHR_REVIEWS: CompetitorReview[] = [
  {
    ats: 'jazzhr',
    painIds: ['email-deliverability', 'candidate-communication-black-hole'],
    quote: "We receive emails from candidates to nowhere. The system sends automatic emails but when candidates reply — where does the answer go? Nowhere.",
    source: 'Prospect Call',
    reviewerRole: 'HR Manager',
    companySize: '51-200 employees',
    date: 'May 2026',
  },
  {
    ats: 'jazzhr',
    painIds: ['duplicate-candidate-mess', 'no-pipeline-visibility'],
    quote: "It's hard to search every candidate by name when you work with five positions and you don't remember all candidate names. The search is terrible.",
    source: 'Prospect Call',
    reviewerRole: 'Recruitment Lead',
    companySize: '51-200 employees',
    date: 'May 2026',
  },
  {
    ats: 'jazzhr',
    painIds: ['outdated-career-site', 'no-content-hub'],
    quote: "There's no career site builder at all. We just have a basic job listing page. No employer brand, no culture content. It's functional but forgettable.",
    source: 'G2',
    stars: 2,
    reviewerRole: 'HR Coordinator',
    companySize: '1-50 employees',
    date: 'Mar 2025',
  },
  {
    ats: 'jazzhr',
    painIds: ['manual-screening', 'recruiter-burnout'],
    quote: "Zero AI. We read every single resume manually. For a team of two handling 15 open roles, it's unsustainable. We need something smarter.",
    source: 'G2',
    stars: 2,
    reviewerRole: 'Recruiter',
    companySize: '51-200 employees',
    date: 'Apr 2025',
  },
];

// ── SuccessFactors ──
const SUCCESSFACTORS_REVIEWS: CompetitorReview[] = [
  {
    ats: 'successfactors',
    painIds: ['hris-ats-rigidity', 'application-form-rigidity'],
    quote: "Sometimes the FTE is reached to the maximum and then we are manually increasing capacity. The system doesn't flex — it manages headcount, not hiring.",
    source: 'Prospect Call',
    reviewerRole: 'Global TA Manager',
    companySize: '5001-10000 employees',
    date: 'Apr 2026',
  },
  {
    ats: 'successfactors',
    painIds: ['scorecard-manual-aggregation', 'locked-out-managers'],
    quote: "After each interview round I manually compile and average scorecards from multiple interviewers. There's no auto-aggregation. It's hours of work.",
    source: 'Prospect Call',
    reviewerRole: 'Senior Recruiter',
    companySize: '1001-5000 employees',
    date: 'Mar 2026',
  },
  {
    ats: 'successfactors',
    painIds: ['poor-candidate-experience', 'outdated-career-site'],
    quote: "Our SAP careers portal looks like an internal procurement system. Candidates apply because they want the job, not because the experience is good.",
    source: 'G2',
    stars: 2,
    reviewerRole: 'Employer Brand Manager',
    companySize: '5001-10000 employees',
    date: 'Feb 2025',
  },
  {
    ats: 'successfactors',
    painIds: ['high-cost-per-hire', 'hris-ats-rigidity'],
    quote: "SAP licensing plus implementation partner plus annual support — we're at $250K and the recruiters still complain daily. The ROI isn't there for recruiting.",
    source: 'TrustRadius',
    stars: 2,
    reviewerRole: 'VP of People',
    companySize: '1001-5000 employees',
    date: 'Jan 2025',
  },
];

// ── Dayforce ──
const DAYFORCE_REVIEWS: CompetitorReview[] = [
  {
    ats: 'dayforce',
    painIds: ['hris-ats-rigidity', 'locked-out-managers', 'poor-candidate-experience'],
    quote: "One workflow for all roles. No distinction between retail floor staff and head office professionals. It treats every hire the same way. Our managers gave up.",
    source: 'G2',
    stars: 2,
    reviewerRole: 'Talent Acquisition Director',
    companySize: '1001-5000 employees',
    date: 'Mar 2025',
  },
  {
    ats: 'dayforce',
    painIds: ['outdated-career-site', 'no-content-hub'],
    quote: "The careers page is a wall of text with zero personality. We're a great employer but our application process makes us look like a government agency.",
    source: 'Capterra',
    stars: 2,
    reviewerRole: 'HR Manager',
    companySize: '501-1000 employees',
    date: 'Apr 2025',
  },
  {
    ats: 'dayforce',
    painIds: ['slow-time-to-hire', 'manual-screening'],
    quote: "The interface hasn't been meaningfully updated in years. Every recruiter action takes 5+ clicks. Our time-to-hire is inflated just by tool friction.",
    source: 'G2',
    stars: 2,
    reviewerRole: 'Senior Recruiter',
    companySize: '501-1000 employees',
    date: 'Feb 2025',
  },
];

// ── Paycor ──
const PAYCOR_REVIEWS: CompetitorReview[] = [
  {
    ats: 'paycor',
    painIds: ['outdated-career-site', 'hris-ats-rigidity', 'locked-out-managers'],
    quote: "Paycor's recruiting module is an afterthought. Same rigid workflow for every role. No career site customization. Our hiring managers have never logged in.",
    source: 'G2',
    stars: 2,
    reviewerRole: 'Recruiting Manager',
    companySize: '201-500 employees',
    date: 'Mar 2025',
  },
  {
    ats: 'paycor',
    painIds: ['manual-screening', 'no-pipeline-visibility'],
    quote: "Zero AI, zero automation beyond basic status emails. We're manually reading every application and tracking progress in a spreadsheet because the reports are useless.",
    source: 'Capterra',
    stars: 2,
    reviewerRole: 'HR Director',
    companySize: '201-500 employees',
    date: 'Apr 2025',
  },
];

// ── Paycom ──
const PAYCOM_REVIEWS: CompetitorReview[] = [
  {
    ats: 'paycom',
    painIds: ['high-cost-per-hire', 'hris-ats-rigidity'],
    quote: "We're paying double what a standalone Provider costs, and the recruiting module is the worst part of Paycom. It's a payroll tool forcing us to recruit through payroll workflows.",
    source: 'G2',
    stars: 2,
    reviewerRole: 'VP of HR',
    companySize: '201-500 employees',
    date: 'Feb 2025',
  },
  {
    ats: 'paycom',
    painIds: ['outdated-career-site', 'poor-candidate-experience'],
    quote: "Our career page looks terrible on mobile. Candidates have told us directly that the application experience was frustrating. We're losing good people at the front door.",
    source: 'Capterra',
    stars: 2,
    reviewerRole: 'Talent Acquisition Specialist',
    companySize: '501-1000 employees',
    date: 'Mar 2025',
  },
];

// ── Rippling ──
const RIPPLING_REVIEWS: CompetitorReview[] = [
  {
    ats: 'rippling',
    painIds: ['outdated-career-site', 'no-content-hub', 'weak-talent-pools'],
    quote: "Rippling is brilliant for onboarding and IT provisioning but the Provider is bare bones. No career site builder, no CRM, no nurture campaigns. We outgrew it for recruiting fast.",
    source: 'G2',
    stars: 3,
    reviewerRole: 'Head of People',
    companySize: '51-200 employees',
    date: 'Apr 2025',
  },
  {
    ats: 'rippling',
    painIds: ['manual-screening', 'no-pipeline-visibility'],
    quote: "No AI screening, no automated scoring. Every candidate is a manual review. For a company that automates everything else, the recruiting module feels like it was built last.",
    source: 'G2',
    stars: 3,
    reviewerRole: 'Recruiting Lead',
    companySize: '201-500 employees',
    date: 'Mar 2025',
  },
];

// ── Bullhorn ──
const BULLHORN_REVIEWS: CompetitorReview[] = [
  {
    ats: 'bullhorn',
    painIds: ['outdated-career-site', 'poor-candidate-experience', 'locked-out-managers'],
    quote: "Bullhorn is for staffing agencies, not corporate TA. We're trying to build an employer brand and there's literally no career site. Candidates apply through a portal that looks like a vendor system.",
    source: 'G2',
    stars: 2,
    reviewerRole: 'Director of Talent Acquisition',
    companySize: '501-1000 employees',
    date: 'Feb 2025',
  },
  {
    ats: 'bullhorn',
    painIds: ['no-content-hub', 'weak-talent-pools'],
    quote: "No employer branding tools at all. No culture content, no employee stories. For an in-house team trying to attract talent directly, it's completely the wrong tool.",
    source: 'Capterra',
    stars: 2,
    reviewerRole: 'Employer Brand Specialist',
    companySize: '201-500 employees',
    date: 'Mar 2025',
  },
];

// ── ADP Workforce Now ──
const ADP_REVIEWS: CompetitorReview[] = [
  {
    ats: 'adp',
    painIds: ['hris-ats-rigidity', 'poor-candidate-experience', 'recruiter-burnout'],
    quote: "ADP is like super just keeps you in the '80s in a box around what you can do around communications, automation, collaboration.",
    source: 'Prospect Call',
    reviewerRole: 'VP of HR',
    companySize: '51-200 employees',
    date: 'Apr 2026',
  },
  {
    ats: 'adp',
    painIds: ['hris-ats-rigidity', 'locked-out-managers', 'vendor-support-gap'],
    quote: "I sometimes feel like ADP is not super user-friendly... we just recently had a change in the recruitment dashboard and we got no previous training.",
    source: 'Prospect Call',
    reviewerRole: 'Recruiting Coordinator',
    companySize: '201-500 employees',
    date: 'May 2026',
  },
  {
    ats: 'adp',
    painIds: ['no-pipeline-visibility', 'reporting-analytics-blind'],
    quote: "I have to go in the backend and put in all the data into ADP to use their analytics. It's completely manual — there's no real-time reporting.",
    source: 'Prospect Call',
    reviewerRole: 'VP of HR',
    companySize: '51-200 employees',
    date: 'Apr 2026',
  },
  {
    ats: 'adp',
    painIds: ['outdated-career-site', 'poor-mobile-career', 'manual-screening'],
    quote: "There's no career site, no AI screening, no mobile app. ADP is a payroll system pretending to recruit. Candidates see a generic job listing and bounce.",
    source: 'G2',
    stars: 2,
    reviewerRole: 'Talent Acquisition Manager',
    companySize: '201-500 employees',
    date: 'Mar 2025',
  },
];

// ── Paylocity ──
const PAYLOCITY_REVIEWS: CompetitorReview[] = [
  {
    ats: 'paylocity',
    painIds: ['hris-ats-rigidity', 'outdated-career-site', 'no-content-hub'],
    quote: "Paylocity is what it is. It's just an current provider. It is not a people attraction system.",
    source: 'Prospect Call',
    reviewerRole: 'HR Director',
    companySize: '201-500 employees',
    date: 'May 2026',
  },
  {
    ats: 'paylocity',
    painIds: ['poor-mobile-career', 'locked-out-managers', 'recruiter-burnout'],
    quote: "We cannot do anything on the go in Paylocity. No mobile app, no mobile access. If I'm not at my desk, recruiting stops.",
    source: 'Prospect Call',
    reviewerRole: 'HR Director',
    companySize: '201-500 employees',
    date: 'May 2026',
  },
  {
    ats: 'paylocity',
    painIds: ['poor-candidate-experience', 'hris-ats-rigidity', 'manual-screening'],
    quote: "It's not intuitive and it's not tech forward and it's not candidate forward. Our candidates deserve better than what Paylocity offers.",
    source: 'Prospect Call',
    reviewerRole: 'HR Director',
    companySize: '201-500 employees',
    date: 'May 2026',
  },
  {
    ats: 'paylocity',
    painIds: ['email-deliverability', 'candidate-communication-black-hole', 'poor-candidate-experience'],
    quote: "Any Gmail email addresses, the Paylocity system funnels that into spam and junk. We're losing candidates because they never see our emails.",
    source: 'Prospect Call',
    reviewerRole: 'HR Director',
    companySize: '201-500 employees',
    date: 'May 2026',
  },
];

// ── Combined lookup ──
const ALL_REVIEWS: CompetitorReview[] = [
  ...GREENHOUSE_REVIEWS,
  ...LEVER_REVIEWS,
  ...WORKDAY_REVIEWS,
  ...BAMBOOHR_REVIEWS,
  ...ASHBY_REVIEWS,
  ...ICIMS_REVIEWS,
  ...SMARTRECRUITERS_REVIEWS,
  ...TALEO_REVIEWS,
  ...WORKABLE_REVIEWS,
  ...JAZZHR_REVIEWS,
  ...SUCCESSFACTORS_REVIEWS,
  ...DAYFORCE_REVIEWS,
  ...PAYCOR_REVIEWS,
  ...PAYCOM_REVIEWS,
  ...RIPPLING_REVIEWS,
  ...BULLHORN_REVIEWS,
  ...ADP_REVIEWS,
  ...PAYLOCITY_REVIEWS,
];

/**
 * Get competitor reviews matching a specific Provider and any of the selected pain IDs.
 * Returns reviews sorted by relevance (most pain overlap first).
 */
export function getRelevantReviews(ats: string | null, selectedPainIds: string[], maxCount: number = 4): CompetitorReview[] {
  if (!ats || selectedPainIds.length === 0) return [];

  const atsKey = ats.toLowerCase().replace(/\s+/g, '');

  const scored = ALL_REVIEWS
    .filter(r => r.ats === atsKey)
    .map(r => {
      const overlap = r.painIds.filter(p => selectedPainIds.includes(p)).length;
      return { review: r, score: overlap };
    })
    .sort((a, b) => {
      // Sort by score first, then random/stable so we get a mix
      if (a.score !== b.score) return b.score - a.score;
      return a.review.quote.length - b.review.quote.length;
    });

  // Always return up to maxCount reviews for the Provider, even if score is 0,
  // to ensure the social proof grid always looks full (min 3).
  return scored.slice(0, maxCount).map(s => s.review);
}

/**
 * Get all reviews for a given Provider (regardless of pain selection).
 */
export function getAllReviewsForATS(ats: string): CompetitorReview[] {
  return ALL_REVIEWS.filter(r => r.ats === ats.toLowerCase().replace(/\s+/g, ''));
}

/**
 * Get the display name for an Provider key.
 */
export function getATSDisplayName(ats: string): string {
  const names: Record<string, string> = {
    greenhouse: 'Greenhouse',
    lever: 'Lever',
    workday: 'Workday',
    bamboohr: 'BambooHR',
    ashby: 'Ashby',
    icims: 'iCIMS',
    smartrecruiters: 'SmartRecruiters',
    taleo: 'Taleo',
    workable: 'Workable',
    jazzhr: 'JazzHR',
    successfactors: 'SuccessFactors',
    dayforce: 'Dayforce',
    paycor: 'Paycor',
    paycom: 'Paycom',
    rippling: 'Rippling',
    bullhorn: 'Bullhorn',
    jobvite: 'Jobvite',
    adp: 'ADP Workforce Now',
    paylocity: 'Paylocity',
  };
  return names[ats] || ats;
}
