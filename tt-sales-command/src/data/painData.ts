import {
    Calendar, Building2, Globe, Users, Briefcase, MousePointerClick,
    Smartphone, Search, Clock, FileWarning, LineChart, FileText, Share2,
    MessageSquare, Mail, HelpCircle, Lock, Layout, ShieldAlert, FileSearch,
    Building, Scale, GraduationCap, Cross, Fingerprint, Banknote, Coffee,
    Wrench, MapPin, Database, Zap, Settings, BookOpen, AlertCircle,
    TrendingDown, FolderTree, FileSpreadsheet, Inbox, RefreshCcw,
    Workflow, Bot, Copy, Boxes, ServerCrash, Frown, Users2, BrainCircuit,
    DollarSign, Waves, ArrowLeftRight, Brain, Target, CheckCircle2,
    Palette, Activity, ShieldCheck, Timer, BarChart3, Heart, PieChart,
    Star, CalendarDays, ChevronDown, QrCode, AlertTriangle,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type PersonaId = 'dir-eb' | 'vp-ta' | 'chro' | 'hiring-manager' | 'cfo' | 'recruiter' | 'all';

export type ATSOption =
    | 'None' | 'Greenhouse' | 'Ashby' | 'BambooHR' | 'Lever'
    | 'Workday' | 'iCIMS' | 'SmartRecruiters' | 'Workable'
    | 'JazzHR' | 'Breezy HR' | 'Paycor' | 'Paycom' | 'ADP' | 'Dayforce'
    | 'ePloy' | 'Kalidus' | 'Paylocity' | 'Applicant Pro'
    | 'Pinpoint' | 'HireBridge' | 'EdJoin' | 'Loxo' | 'Bullhorn'
    | 'Rippling' | 'Jobvite' | 'SuccessFactors' | 'isolved' | 'Other';

export type PainCategory = 'brand' | 'candidate-exp' | 'ats-workflow' | 'reporting' | 'hm-adoption' | 'scheduling' | 'cost' | 'compliance' | 'sourcing';

export interface PainDefinition {
    id: string;
    persona: string;
    category: PainCategory;
    personaTabs?: string[];
    title: string;
    description: string;
    icon: React.ElementType;
    ttFeature: string;
    verbatim?: string;
    topRank?: number;
}

/* ------------------------------------------------------------------ */
/*  Personas                                                           */
/* ------------------------------------------------------------------ */

export const PERSONAS = [
    { id: 'all', label: 'All Execs' },
    { id: 'dir-eb', label: 'Dir. of Employer Brand' },
    { id: 'vp-ta', label: 'VP of TA' },
    { id: 'chro', label: 'CHRO' },
    { id: 'cfo', label: 'CFO / Finance' },
    { id: 'recruiter', label: 'Recruiters / TA' },
    { id: 'hiring-manager', label: 'Hiring Managers' },
    { id: 'procurement', label: 'Procurement' },
    { id: 'it-cio', label: 'IT / CIO' },
];

/* ------------------------------------------------------------------ */
/*  ATS Options & Mappings                                             */
/* ------------------------------------------------------------------ */

export const ATS_OPTIONS: ATSOption[] = [
    'None', 'Greenhouse', 'Ashby', 'BambooHR', 'Lever',
    'Workday', 'iCIMS', 'SmartRecruiters', 'Workable',
    'JazzHR', 'Breezy HR', 'Paycor', 'Paycom', 'ADP', 'Dayforce',
    'ePloy', 'Kalidus', 'Paylocity', 'Applicant Pro',
    'Pinpoint', 'HireBridge', 'EdJoin', 'Loxo', 'Bullhorn',
    'Rippling', 'Jobvite', 'SuccessFactors', 'isolved', 'Other',
];

export const ATS_PAIN_MAP: Record<string, string[]> = {
    Greenhouse: ['outdated-career-site', 'locked-out-managers', 'manual-screening', 'no-content-hub', 'scorecard-manual-aggregation', 'no-pipeline-visibility'],
    Ashby: ['no-content-hub', 'multi-language-gaps', 'scorecard-friction', 'locked-out-managers'],
    BambooHR: ['outdated-career-site', 'manual-screening', 'weak-talent-pools', 'no-pipeline-visibility'],
    Lever: ['outdated-career-site', 'no-pipeline-visibility', 'slow-time-to-hire', 'locked-out-managers', 'manual-screening'],
    Workday: ['poor-candidate-experience', 'locked-out-managers', 'high-cost-per-hire', 'slow-time-to-hire', 'application-form-rigidity', 'scorecard-manual-aggregation'],
    iCIMS: ['outdated-career-site', 'locked-out-managers', 'high-cost-per-hire', 'scorecard-friction'],
    Paycor: ['outdated-career-site', 'locked-out-managers', 'no-mobile-feedback', 'poor-candidate-experience', 'hris-ats-rigidity'],
    Paycom: ['outdated-career-site', 'locked-out-managers', 'high-cost-per-hire', 'hris-ats-rigidity', 'no-content-hub'],
    ADP: ['outdated-career-site', 'poor-candidate-experience', 'manual-screening', 'locked-out-managers'],
    Dayforce: ['poor-candidate-experience', 'locked-out-managers', 'no-pipeline-visibility', 'slow-time-to-hire', 'hris-ats-rigidity'],
    ePloy: ['manual-screening', 'no-pipeline-visibility', 'slow-time-to-hire', 'weak-talent-pools', 'fragmented-multi-brand'],
    Kalidus: ['outdated-career-site', 'manual-screening', 'no-pipeline-visibility', 'screening-bottleneck', 'vendor-support-gap'],
    Paylocity: ['outdated-career-site', 'poor-candidate-experience', 'no-content-hub', 'locked-out-managers', 'hris-ats-rigidity'],
    'Applicant Pro': ['outdated-career-site', 'weak-talent-pools', 'no-pipeline-visibility', 'duplicate-candidate-mess'],
    Pinpoint: ['outdated-career-site', 'manual-screening'],
    JazzHR: ['outdated-career-site', 'email-deliverability', 'manual-screening', 'locked-out-managers', 'compliance-bottlenecks', 'duplicate-candidate-mess', 'candidate-communication-black-hole'],
    SmartRecruiters: ['outdated-career-site', 'scorecard-manual-aggregation', 'poor-candidate-experience', 'locked-out-managers'],
    'Breezy HR': ['manual-screening', 'weak-talent-pools', 'outdated-career-site', 'no-pipeline-visibility'],
    HireBridge: ['outdated-career-site', 'vendor-support-gap', 'manual-screening', 'locked-out-managers'],
    EdJoin: ['outdated-career-site', 'manual-screening', 'application-volume-explosion', 'poor-candidate-experience'],
    Loxo: ['outdated-career-site', 'no-content-hub', 'assessment-integration-gap', 'manual-screening'],
    Bullhorn: ['outdated-career-site', 'locked-out-managers', 'poor-candidate-experience', 'no-content-hub'],
    Rippling: ['outdated-career-site', 'no-content-hub', 'manual-screening', 'weak-talent-pools'],
    Jobvite: ['high-cost-per-hire', 'locked-out-managers', 'slow-time-to-hire', 'hris-ats-rigidity'],
    SuccessFactors: ['locked-out-managers', 'hris-ats-rigidity', 'application-form-rigidity', 'scorecard-manual-aggregation', 'poor-candidate-experience'],
    isolved: ['outdated-career-site', 'poor-candidate-experience', 'manual-screening', 'hris-ats-rigidity'],
};

export const ATS_MATURITY_MAP: Record<string, { play: string; context: string; color: string }> = {
    None:            { play: 'First ATS',      context: 'No incumbent — position as first real TA infrastructure', color: 'emerald' },
    Greenhouse:      { play: 'Displacement',   context: 'Mid-market overlay — lead with career site & HM experience gap', color: 'amber' },
    Ashby:           { play: 'Displacement',   context: 'Analytics-first buyer — match their language, win on conversion data', color: 'amber' },
    BambooHR:        { play: 'Graduation',     context: 'Outgrown HRIS add-on — they know it, they just need permission to move', color: 'orange' },
    Lever:           { play: 'Graduation',     context: "Sourcing-first ATS — show them the brand + nurture layer they're missing", color: 'orange' },
    Workday:         { play: 'Add-On',         context: 'Enterprise overlay — rigid, centralized, terrible support ("sends random playbooks"). HMs refuse to use it. TT as the hiring front-end, Workday stays for HCM. Vopak case: VP of HR leaning TT over Workday.', color: 'purple' },
    iCIMS:           { play: 'Displacement',   context: 'Enterprise rescue — complexity without outcomes, frame as antidote', color: 'rose' },
    SmartRecruiters: { play: 'Displacement',   context: 'Marketplace fatigue — pricing misalignment post-SAP acquisition. Yazaki came back to TT after SmartRecruiters. Win on simplicity, pricing, and career site.', color: 'amber' },
    Workable:        { play: 'Graduation',     context: 'Ready to scale — validate their frustration, show the next level', color: 'orange' },
    'JazzHR':        { play: 'Graduation',     context: 'Budget ATS — cheap but limited UX, emails go "to nowhere," no career site builder. Don\'t push the switch for small teams — plant the seed for growth.', color: 'orange' },
    'Breezy HR':     { play: 'Graduation',     context: 'Growing past basic tracking — career site & automation gap', color: 'orange' },
    Paycor:          { play: 'Displacement',   context: 'Payroll-first bundled ATS — same pattern as BambooHR', color: 'amber' },
    Paycom:          { play: 'Liberation',     context: 'High-cost payroll-first HRIS — twice the standard cost, basic recruiting frontend', color: 'rose' },
    ADP:              { play: 'Liberation',   context: 'ATS is afterthought in HRIS bundle — terrible mobile, no screening, no automation', color: 'rose' },
    Dayforce:         { play: 'Displacement', context: 'Enterprise legacy — archaic UX, one workflow for all roles, no retail/HO distinction', color: 'rose' },
    ePloy:            { play: 'Displacement', context: 'UK legacy ATS — 28-step manual process identified, no AI, limited reporting', color: 'rose' },
    Kalidus:          { play: 'Graduation',   context: 'LMS company that neglected ATS — prospect says "done us well" but outgrown', color: 'orange' },
    Paylocity:        { play: 'Liberation',   context: 'Payroll-first HRIS — functionality might exist but communication is the failure', color: 'rose' },
    'Applicant Pro':  { play: 'Graduation',   context: 'No investment in 6-7 years — one person managing for 10+ years', color: 'orange' },
    Pinpoint:         { play: 'Displacement', context: 'UK mid-market — evaluate side-by-side on career site + AI capabilities', color: 'amber' },
    HireBridge:       { play: 'Rescue',       context: 'Dead platform — 1987 interface, 5 months no support, zero mobile. This is a mercy kill', color: 'rose' },
    EdJoin:           { play: 'Add-On',       context: 'State-mandated job board — TT sits on top as recruiting engine with AI + career site', color: 'purple' },
    Loxo:             { play: 'Displacement', context: 'Agency sourcing tool — for in-house teams, lacks career site, screening, and employer brand', color: 'amber' },
    Bullhorn:         { play: 'Displacement', context: 'Staffing agency CRM — for corporate TA, lacks career site, employer brand, and HM experience', color: 'amber' },
    Rippling:         { play: 'Add-On',       context: 'HRIS module ATS — strong for HC planning, weak for actual recruiting. TT as recruiting front-end', color: 'purple' },
    Jobvite:          { play: 'Displacement', context: 'Enterprise Employ Inc. portfolio — overkill for SMB/MM, dated UX, opaque pricing', color: 'amber' },
    SuccessFactors:   { play: 'Displacement', context: 'Enterprise HRIS module — rigid FTE management, expensive, slow to innovate. Yazaki came back to TT after SuccessFactors/SmartRecruiters failed on pricing and integration.', color: 'rose' },
    isolved:          { play: 'Liberation',   context: 'HCM-bundled ATS — same pattern as BambooHR. Native payroll sync but recruiting is an afterthought', color: 'rose' },
    Other:           { play: 'Discovery',      context: 'Unknown incumbent — focus full discovery on current pain before positioning', color: 'zinc' },
};

/* ------------------------------------------------------------------ */
/*  Industry & Company Size                                            */
/* ------------------------------------------------------------------ */

export const INDUSTRIES = [
    { id: 'none', label: 'Select Industry…' },
    { id: 'food-beverage', label: 'Food & Beverage' },
    { id: 'retail', label: 'Retail & Apparel' },
    { id: 'fitness-wellness', label: 'Fitness & Wellness' },
    { id: 'hospitality', label: 'Hospitality & Hotels' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'staffing', label: 'Staffing & Recruiting' },
    { id: 'professional-services', label: 'Professional Services' },
    { id: 'nonprofit', label: 'Nonprofit & Education' },
    { id: 'construction', label: 'Construction & Facilities' },
    { id: 'manufacturing', label: 'Manufacturing & Industrial' },
    { id: 'automotive', label: 'Automotive & Mobility' },
    { id: 'technology', label: 'Technology & SaaS' },
    { id: 'energy-maritime', label: 'Energy, Maritime & Logistics' },
    { id: 'other', label: 'Other' },
];

export const INDUSTRY_PAIN_MAP: Record<string, string[]> = {
    'food-beverage': ['slow-time-to-hire', 'locked-out-managers', 'poor-candidate-experience', 'high-cost-per-hire', 'recruiter-burnout', 'scheduling-chaos', 'candidate-communication-black-hole'],
    'retail': ['outdated-career-site', 'locked-out-managers', 'poor-candidate-experience', 'weak-referrals', 'onboarding-gaps', 'no-pipeline-visibility', 'no-in-store-capture', 'candidate-communication-black-hole'],
    'fitness-wellness': ['weak-referrals', 'dead-nurture-pipeline', 'outdated-career-site', 'no-pipeline-visibility', 'locked-out-managers', 'scheduling-chaos'],
    'hospitality': ['locked-out-managers', 'slow-time-to-hire', 'poor-candidate-experience', 'multi-language-gaps', 'scheduling-chaos', 'recruiter-burnout', 'no-in-store-capture', 'candidate-communication-black-hole'],
    'healthcare': ['compliance-bottlenecks', 'slow-time-to-hire', 'high-cost-per-hire', 'scorecard-friction', 'manual-screening', 'onboarding-gaps'],
    'staffing': ['no-pipeline-visibility', 'dead-nurture-pipeline', 'weak-talent-pools', 'manual-screening', 'compliance-bottlenecks', 'recruiter-burnout'],
    'professional-services': ['unmeasurable-brand-roi', 'outdated-career-site', 'dei-reporting-gaps', 'onboarding-gaps', 'slow-time-to-hire', 'inconsistent-interviews'],
    'nonprofit': ['high-cost-per-hire', 'outdated-career-site', 'weak-referrals', 'recruiter-burnout', 'dei-reporting-gaps', 'poor-candidate-experience'],
    'construction': ['agency-to-in-house-transition', 'weak-talent-pools', 'locked-out-managers', 'no-pipeline-visibility', 'recruiter-admin-heavy'],
    'manufacturing': ['application-form-rigidity', 'multi-country-career-site', 'locked-out-managers', 'hris-ats-rigidity', 'compliance-bottlenecks', 'hiring-forecast-gap', 'slow-time-to-hire'],
    'automotive': ['multi-country-career-site', 'hris-ats-rigidity', 'application-form-rigidity', 'scorecard-manual-aggregation', 'compliance-bottlenecks', 'fragmented-multi-brand', 'locked-out-managers'],
    'technology': ['outdated-career-site', 'manual-screening', 'weak-talent-pools', 'inconsistent-interviews', 'scorecard-manual-aggregation', 'internal-mobility-gap', 'dead-nurture-pipeline'],
    'energy-maritime': ['multi-country-career-site', 'locked-out-managers', 'hris-ats-rigidity', 'compliance-bottlenecks', 'application-volume-explosion', 'reporting-analytics-blind', 'fragmented-multi-brand'],
};

export const COMPANY_SIZES = [
    { id: 'none', label: 'Company Size…' },
    { id: '1-50', label: '1–50 employees' },
    { id: '51-200', label: '51–200 employees' },
    { id: '201-500', label: '201–500 employees' },
    { id: '501-2000', label: '501–2,000 employees' },
    { id: '2001+', label: '2,000+ employees' },
];

export const USE_CASES = [
    { id: 'none', label: 'Primary Use Case…' },
    { id: 'replacing-ats', label: 'Replacing existing ATS' },
    { id: 'first-ats', label: 'First real ATS / no system today' },
    { id: 'adding-brand', label: 'Adding employer branding layer' },
    { id: 'consolidating', label: 'Consolidating multiple tools' },
    { id: 'scaling', label: 'Scaling hiring for growth' },
];

/* ------------------------------------------------------------------ */
/*  Pain Categories                                                    */
/* ------------------------------------------------------------------ */

export const PAIN_CATEGORIES: { id: PainCategory; label: string; emoji: string }[] = [
  { id: 'brand', label: 'Employer Brand & Careers', emoji: '🎨' },
  { id: 'candidate-exp', label: 'Candidate Experience', emoji: '📥' },
  { id: 'ats-workflow', label: 'ATS & Workflow', emoji: '⚙️' },
  { id: 'reporting', label: 'Reporting & Data', emoji: '📊' },
  { id: 'hm-adoption', label: 'Hiring Manager Adoption', emoji: '👥' },
  { id: 'scheduling', label: 'Scheduling & Speed', emoji: '⏱️' },
  { id: 'cost', label: 'Cost & Budget', emoji: '💰' },
  { id: 'compliance', label: 'Compliance & Onboarding', emoji: '🔐' },
  { id: 'sourcing', label: 'Sourcing & Pipeline', emoji: '🔍' },
];

/* ------------------------------------------------------------------ */
/*  Pain Definitions (55+ pains)                                       */
/* ------------------------------------------------------------------ */

export const TT_PAINS: PainDefinition[] = [
    /* ---- Dir of Employer Brand ---- */
    { id: 'outdated-career-site', persona: 'dir-eb', category: 'brand', title: 'Outdated, Rigid Career Pages', description: "We have a great culture, but our career site looks like it's from 2010. And we have to wait on IT for every minor copy change.", icon: Palette, ttFeature: 'Career Site Builder', verbatim: '"I don\'t feel like we have our name out there as much as it should be. I want to have that same seamless marketing standards that our marketing department already has, but without adding to their workload." — Destiny Erazo & Jesus Garcia', topRank: 2 },
    { id: 'unmeasurable-brand-roi', persona: 'dir-eb', category: 'brand', title: 'Blind Spots in Brand ROI', description: 'We spend heavily on employer branding, but have zero visibility into which campaigns or content actually drive quality applications.', icon: Activity, ttFeature: 'Reporting & Analytics' },
    { id: 'dead-nurture-pipeline', persona: 'dir-eb', category: 'brand', title: "The 'Black Hole' Talent Pool", description: "Great candidates who weren't hired today are completely forgotten. We have no system to warm them up for future roles.", icon: Mail, ttFeature: 'Connect & Nurture Campaigns' },
    { id: 'no-content-hub', persona: 'dir-eb', category: 'brand', title: 'Scattered Employer Brand Content', description: "Our team stories and culture posts live entirely on social media because we don't have a centralized content hub on our careers site.", icon: FileText, ttFeature: 'Built-in Blog & Content', verbatim: '"We have an Emmy nominated multimedia producer and why we like working here videos that we\'ve never even put to use because I don\'t want to bog down marketing with their website." — Jesus Garcia, Eagle Mountain Casino' },
    { id: 'poor-mobile-career', persona: 'dir-eb', category: 'brand', title: 'Losing Mobile Candidates', description: 'Over half our traffic is on mobile, but our forms break and load slowly. We are literally watching candidates abandon the application.', icon: Smartphone, ttFeature: 'Mobile-First Career Pages' },
    { id: 'multi-language-gaps', persona: 'dir-eb', category: 'brand', title: 'Friction for Global Talent', description: "We're a global brand stuck with a single-language career site. We're losing incredible international talent because the experience isn't localized.", icon: Globe, ttFeature: '30+ Language Support' },

    /* ---- VP of TA ---- */
    { id: 'engineering-dependency', persona: 'vp-ta', category: 'ats-workflow', title: 'Blocked by IT & Engineering', description: 'We have to file an engineering ticket just to add a new video or change a headline. It kills our agility and speed to market.', icon: Palette, ttFeature: 'No-Code Career Site' },
    { id: 'weak-talent-pools', persona: 'vp-ta', category: 'sourcing', title: 'No Proactive Talent Pipeline', description: 'Every time we open a new role, we start from scratch and pay job boards. Our passive talent pools are completely unengaged.', icon: Users, ttFeature: 'Candidate CRM', topRank: 15 },
    { id: 'inconsistent-interviews', persona: 'vp-ta', category: 'hm-adoption', title: 'Inconsistent, Biased Interviews', description: "Every hiring manager asks different questions. Without structured scorecards, we rely on 'gut-feel' which leads to bad hires.", icon: FileText, ttFeature: 'Interview Kits' },
    { id: 'manual-screening', persona: 'vp-ta', category: 'ats-workflow', title: 'Drowning in Manual Screening', description: 'My recruiters spend 20+ hours a week just reading CVs. We desperately need a way to instantly surface the top 10% of applicants.', icon: Brain, ttFeature: 'AI Co-pilot Screening', verbatim: '"70% of those don\'t even have the minimum qualifications for an entry level job. It\'s people\'s my first job or my second job or it has nothing to do with guest service." — Jesus Garcia, Eagle Mountain Casino', topRank: 1 },
    { id: 'slow-time-to-hire', persona: 'vp-ta', category: 'scheduling', title: 'Candidates Stalling in Pipeline', description: 'Without automated stage triggers and follow-ups, candidates fall through the cracks and our time-to-hire metrics are suffering.', icon: Timer, ttFeature: 'Automation & Triggers', verbatim: '"I don\'t want to wait a lot of time. We have these positions open and I want to fill them up without paying all the hunters." — Pedro Serrajordia' },
    { id: 'no-pipeline-visibility', persona: 'vp-ta', category: 'reporting', title: 'Reporting in Spreadsheets', description: 'When leadership asks for pipeline metrics, my team loses hours building manual spreadsheets because we lack live, trustworthy dashboards.', icon: BarChart3, ttFeature: 'Real-Time Analytics', verbatim: '"Lever doesn\'t really have anything even remotely close to this. A lot of the time I\'m just putting in dates for when I screen people on an Excel sheet." — Jack Reddington, Kaleidoscope', topRank: 3 },

    /* ---- CHRO ---- */
    { id: 'poor-candidate-experience', persona: 'chro', category: 'candidate-exp', title: 'Losing Talent to a Clunky Process', description: 'We pride ourselves on our culture, but our application process is a miserable, outdated experience that damages our employer brand.', icon: Target, ttFeature: 'Candidate Experience', verbatim: '"I hate to have to have someone apply online and then have to send them the fillable version of what they want to see." — Destiny Erazo, El Cortez Casino' },
    { id: 'screening-bottleneck', persona: 'chro', category: 'ats-workflow', title: 'Inefficient Recruiting Workflows', description: 'Our team is bogged down by manual screening. We need intelligent automation to rank talent and give recruiters their time back.', icon: Brain, ttFeature: 'AI Co-pilot', verbatim: '"My biggest pain point is that the ATS doesn\'t have a knockout feature. We don\'t sponsor visas. 90% of people that apply need a visa." — Irene Chabina, Enterprise Knowledge' },
    { id: 'compliance-bottlenecks', persona: 'chro', category: 'compliance', personaTabs: ['chro', 'vp-ta', 'it-cio'], title: 'GDPR & Data Privacy Risk', description: 'We lack automated data retention policies, consent management, and right-to-deletion workflows. Paper CVs at events create untracked data. We\'re one audit away from a serious fine.', icon: ShieldCheck, ttFeature: 'GDPR & Compliance Engine', verbatim: '"We still have paper applications. Our paper applications that I\'ve created into a fillable — they prefer that over our online application." — Destiny Erazo, El Cortez Casino' },
    { id: 'high-cost-per-hire', persona: 'cfo', category: 'cost', title: 'Bloated Tech Stack Costs', description: "We're paying for a separate ATS, CRM, career site, and analytics tools. The hidden costs and lack of integration are driving up our cost-per-hire.", icon: DollarSign, ttFeature: 'All-in-One Platform', verbatim: '"Paycom is funny in the way they charge — per person, per payroll. We realized it was twice as expensive as our previous HRIS." — Jesus Garcia, Eagle Mountain Casino', topRank: 14 },

    /* ---- CFO / Finance ---- */
    { id: 'c-suite-budget-friction', persona: 'cfo', category: 'cost', title: 'C-Suite Budget Friction', description: "Deals stall because we can't prove the ROI of ATS overhauls to our CFO. The board sees HR tech as a cost, not an investment.", icon: Banknote, ttFeature: 'ROI & Cost Consolidation', verbatim: '"It\'ll just be a matter of convincing the board that it is worth the money. We\'re entering into a period of uncertainty financially." — Chris Fierro, San Jacinto USD' },
    { id: 'agency-spend', persona: 'cfo', category: 'cost', title: 'Runaway Agency Spend', description: "We are spending hundreds of thousands on recruitment agencies because we can't source talent organically. This is completely unsustainable.", icon: Banknote, ttFeature: 'Career Site Builder', verbatim: '"I\'ve used 2 or 3 headhunters, just try before you buy. They send me redacted candidate resumes and I\'ve been extremely unimpressed." — Steve Bonser, Equity Smith', topRank: 8 },
    { id: 'recruiter-burnout', persona: 'chro', category: 'sourcing', title: 'Recruiter Burnout from Admin', description: 'Our tooling creates busywork instead of leverage. Repetitive admin tasks are draining the team and causing high recruiter turnover.', icon: Heart, ttFeature: 'Workflow Automation', verbatim: '"I am at my wits end with recruiting." — Diana Grajales, Hum' },
    { id: 'dei-reporting-gaps', persona: 'chro', category: 'reporting', title: 'No Visibility into DEI Metrics', description: 'The Board demands diversity metrics, but we have no structured way to capture candidate demographic data or track pipeline diversity in real time.', icon: PieChart, ttFeature: 'Structured Hiring & Analytics' },

    /* ---- Recruiters / TA ---- */
    { id: 'manual-sourcing', persona: 'recruiter', category: 'sourcing', title: 'Endless Manual Sourcing', description: 'We spend all day sending LinkedIn InMails and manually entering data into the ATS instead of actually speaking with candidates.', icon: Users, ttFeature: 'Sourcing Extension' },
    { id: 'recruiter-admin-heavy', persona: 'recruiter', category: 'sourcing', title: 'Drowning in Admin Work', description: 'Between scheduling, copying data, and sending rejection emails, 70% of our day is pure admin work instead of relationship building.', icon: FileText, ttFeature: 'Workflow Automation', verbatim: '"We have about 650 employees. Anything and everything HR related, myself and Savannah handle." — Destiny Erazo, El Cortez Casino', topRank: 12 },
    { id: 'poor-candidate-communication', persona: 'recruiter', category: 'candidate-exp', title: 'Candidates Ghosting Us', description: 'Because our system does not allow for quick SMS or automated updates, candidates feel ignored and end up ghosting our interviews.', icon: Smartphone, ttFeature: 'Candidate Messaging (SMS)', topRank: 9 },
    { id: 'feedback-chasing', persona: 'recruiter', category: 'hm-adoption', title: 'Chasing Hiring Managers', description: 'We have to constantly ping hiring managers on Slack or email to review CVs and submit interview feedback, slowing everything down.', icon: Timer, ttFeature: 'Manager Mobile App & Pings', verbatim: '"I\'m trying to figure out how to make her job easier, faster. Because I think we\'re reaching her limits right now." — Jesus Garcia, Eagle Mountain Casino', topRank: 13 },

    /* ---- Hiring Managers ---- */
    { id: 'locked-out-managers', persona: 'hiring-manager', category: 'hm-adoption', title: 'Managers Refuse to Use the ATS', description: 'Our legacy ATS is so frustrating that my managers refuse to log in. Recruiters end up doing all the admin work for them.', icon: Smartphone, ttFeature: 'Mobile App', verbatim: '"I wish I used it more. I wish I used it more to be honest with you... it\'s nothing too great to be honest with you." — Jack Reddington on Lever, Kaleidoscope', topRank: 4 },
    { id: 'weak-referrals', persona: 'hiring-manager', category: 'sourcing', title: 'Leaving Referrals on the Table', description: 'We know our best hires come from referrals, but we have no structured, frictionless way to engage our employees to source them.', icon: Users, ttFeature: 'Employee Referrals' },
    { id: 'onboarding-gaps', persona: 'hiring-manager', category: 'compliance', title: 'Losing Hires Before Day One', description: "We have an 'engagement black hole' between offer acceptance and Day 1. Hires are dropping out because we lack a structured pre-boarding flow.", icon: Zap, ttFeature: 'Onboarding' },
    { id: 'scorecard-friction', persona: 'hiring-manager', category: 'hm-adoption', title: 'Scorecards are Too Complex', description: 'The feedback forms are too long and clunky. Interviewers skip them, causing delays and forcing us to make decisions based on memory.', icon: Star, ttFeature: 'Simple Rating System' },
    { id: 'scheduling-chaos', persona: 'hiring-manager', category: 'scheduling', title: 'The Scheduling Nightmare', description: 'Coordinators waste hours sending emails back and forth to book a single interview. Top candidates accept other offers while we struggle to find a time.', icon: CalendarDays, ttFeature: 'Calendar Integration', verbatim: '"For classified, there\'s no hiring season. It just goes from crazy to super crazy and then back down to crazy." — Chris Fierro, San Jacinto USD', topRank: 5 },
    { id: 'no-mobile-feedback', persona: 'hiring-manager', category: 'hm-adoption', title: "Tethered to the Desktop", description: "I'm constantly in meetings or travelling. I need to be able to review CVs and approve offers from my phone, not wait until I'm back at my desk.", icon: Smartphone, ttFeature: 'Full Mobile App' },

    /* ---- Pains from live transcript analysis ---- */
    { id: 'no-in-store-capture', persona: 'hiring-manager', category: 'sourcing', personaTabs: ['hiring-manager', 'recruiter', 'vp-ta'], title: 'No Walk-In or Event Candidate Capture', description: "Candidates walk into our stores asking about jobs, but we can't capture their intent digitally. We're losing walk-in talent or taking paper CVs at the till.", icon: Smartphone, ttFeature: 'QR Code + Connect' },
    { id: 'interview-scheduling-manual', persona: 'recruiter', category: 'scheduling', title: 'Manual Multi-Panel Scheduling', description: "We're emailing back and forth for days to find a slot where 3 panellists and the candidate are all free. Top candidates accept other offers while we're still coordinating.", icon: CalendarDays, ttFeature: 'Smart Schedule', verbatim: '"Back-and-forth calendar coordination between recruiters, candidates, and hiring managers eats hours every week." — composite from multiple calls', topRank: 3 },
    { id: 'agency-to-in-house-transition', persona: 'cfo', category: 'cost', title: 'Agency-to-In-House Transition Gap', description: "We are trying to transition from expensive external agencies to in-house recruitment, but we lack the sourcing power, modern employer branding, and pipeline visibility to make the shift successfully.", icon: ArrowLeftRight, ttFeature: 'Career Site + CRM + Sourcing', verbatim: '"Historically, the company has been using headhunters for recruiting, and I really want to implement our in-house recruiting." — Pedro Serrajordia' },
    { id: 'hris-ats-rigidity', persona: 'chro', category: 'ats-workflow', title: 'HRIS ATS Rigidity & Single-Workflow Friction', description: "Our current system (like Dayforce/Paylocity) forces a single, rigid workflow for all roles. We cannot customize the experience for different business units or job types.", icon: Settings, ttFeature: 'Custom Hiring Workflows', verbatim: '"It won\'t allow me to do multiple locations for the job. So I had to open two postings." — Heather Ortega, FSI', topRank: 11 },
    { id: 'candidate-communication-black-hole', persona: 'recruiter', category: 'candidate-exp', title: 'Candidate Communication Black Hole', description: "Candidates are dropping out or withdrawing due to slow updates. Industry data shows that the majority of candidates will disengage after just a few days of silence; we lack instant messaging and automated updates to keep them warm.", icon: AlertTriangle, ttFeature: 'Automated Triggers & SMS', verbatim: '"Our biggest challenge has always been recruiting. I mean, I know Las Vegas hotel, hospitality industry, always crazy turnover." — Destiny Erazo, El Cortez Casino' },

    /* ---- New pains from expanded transcript analysis ---- */
    { id: 'assessment-integration-gap', persona: 'recruiter', category: 'hm-adoption', personaTabs: ['vp-ta', 'recruiter', 'hiring-manager'], title: 'No Structured Assessments', description: 'Current ATS lacks knockout questions, evaluation scorecards, and structured interview assessments — recruiters can\'t filter or score candidates consistently.', icon: FileText, ttFeature: 'Interview Kits & Scorecards', verbatim: '"I don\'t personally love that. I wish we had some type of way to screen candidates a little bit better." — Cecelia Baltich-Schecter, Fresh Air Fund' },
    { id: 'fragmented-multi-brand', persona: 'chro', category: 'sourcing', personaTabs: ['chro', 'vp-ta', 'dir-eb'], title: 'Fragmented Multi-Brand Hiring', description: 'Multi-entity or multi-brand organization running separate ATS systems per subsidiary — no consolidated reporting, inconsistent candidate experience across brands.', icon: Globe, ttFeature: 'Multi-Brand Divisions' },
    { id: 'vendor-support-gap', persona: 'vp-ta', category: 'ats-workflow', personaTabs: ['vp-ta', 'chro', 'it-cio'], title: 'Vendor Has Gone Dark', description: 'Current ATS vendor is unresponsive, product is end-of-life, or support quality has degraded — team feels abandoned and stuck.', icon: Heart, ttFeature: 'Dedicated CS + Hypercare', verbatim: '"We are constantly trying to bolt things on and improve something with patches. The longer that goes on, the more reliant we become on that core." — Catherine Mellington, Shore Trust', topRank: 7 },
    { id: 'reporting-analytics-blind', persona: 'chro', category: 'reporting', personaTabs: ['chro', 'vp-ta', 'cfo'], title: 'Reporting & Analytics Black Hole', description: 'Cannot pull the data leadership needs — funnel metrics, DEI reports, source-of-hire ROI, or time-to-fill breakdowns are manual or impossible.', icon: BarChart3, ttFeature: 'Real-Time Analytics', verbatim: '"Our definitions of certain metrics are slightly different... it\'s difficult to present back one view of the truth." — Zelis Group' },
    { id: 'tool-sprawl-centralization', persona: 'vp-ta', category: 'ats-workflow', personaTabs: ['vp-ta', 'recruiter', 'chro'], title: 'Tool Sprawl & Scattered Data', description: 'Recruiting is scattered across spreadsheets, email, LinkedIn, and 3-4 disconnected tools — no single source of truth for candidates or pipeline.', icon: Settings, ttFeature: 'All-in-One Platform', verbatim: '"It\'s sad to say we have like 10 to 15 different systems that her and I have to input for every new hire." — Destiny Erazo, El Cortez Casino', topRank: 6 },
    { id: 'onboarding-handoff-gap', persona: 'vp-ta', category: 'compliance', personaTabs: ['vp-ta', 'chro', 'hiring-manager'], title: 'Offer-to-Day-1 Black Hole', description: 'Once a candidate accepts the offer, the handoff to onboarding is manual, disjointed, or non-existent — new hires fall through the cracks before Day 1.', icon: Zap, ttFeature: 'Onboarding' },

    /* ---- Enterprise Pain Points ---- */
    { id: 'application-volume-explosion', persona: 'vp-ta', category: 'ats-workflow', personaTabs: ['vp-ta', 'recruiter', 'chro'], title: 'Drowning in AI-Generated Applications', description: 'Application volume has exploded 2-3x year-over-year as AI tools auto-apply for candidates — recruiters are buried under hundreds of unqualified CVs per role with no way to separate signal from noise.', icon: Waves, ttFeature: 'AI Screening Criteria', verbatim: '"I can tell you right off the bat, 70% of those don\'t even have the minimum qualifications for an entry level job." — Jesus Garcia, Eagle Mountain Casino', topRank: 10 },
    { id: 'careers-page-ownership-conflict', persona: 'vp-ta', category: 'brand', personaTabs: ['vp-ta', 'dir-eb', 'recruiter'], title: 'Marketing Owns the Careers Page', description: 'TA has zero control over the careers page — every change requires a ticket to marketing or IT, taking weeks to update. Can\'t iterate on employer brand or test content without gatekeepers.', icon: Globe, ttFeature: 'Career Site CMS', verbatim: '"Career page not a priority — CEO is territorial about the website." — Irene Chabina, Enterprise Knowledge' },
    { id: 'internal-mobility-gap', persona: 'chro', category: 'reporting', personaTabs: ['chro', 'vp-ta', 'hiring-manager'], title: 'No Internal Mobility Visibility', description: 'Employees can\'t see opportunities across brands or departments — there\'s no internal careers portal or cross-brand job board, so talent leaves instead of moving internally.', icon: ArrowLeftRight, ttFeature: 'Connect & Internal Jobs' },
    { id: 'interview-governance-gap', persona: 'vp-ta', category: 'hm-adoption', personaTabs: ['vp-ta', 'chro', 'hiring-manager'], title: 'No Standardized Hiring Bar', description: 'There\'s no structured framework for evaluating candidates — interviewers wing it, scorecards are optional, and nobody can explain why a hire was great or a reject was justified.', icon: FileText, ttFeature: 'Scorecards & Interview Kits' },
    { id: 'adoption-gap', persona: 'chro', category: 'ats-workflow', personaTabs: ['chro', 'vp-ta', 'recruiter'], title: 'Team Bought Tech But Won\'t Use It', description: 'Despite investing in an ATS, the team still downloads CVs, emails hiring managers, and tracks candidates in spreadsheets — the tool sits underutilized and ROI never materializes.', icon: AlertTriangle, ttFeature: 'Ease of Use & Mobile App' },

    /* ---- New pains from JK transcript analysis ---- */
    { id: 'email-deliverability', persona: 'recruiter', category: 'candidate-exp', personaTabs: ['recruiter', 'vp-ta'], title: 'ATS Emails Going to Spam', description: 'Candidate communications from our current ATS are landing in spam folders — candidates never see our interview invites, offer letters, or status updates. We\'re losing hires to a deliverability problem.', icon: Mail, ttFeature: 'Enterprise Email Infrastructure' },
    { id: 'duplicate-candidate-mess', persona: 'recruiter', category: 'ats-workflow', personaTabs: ['recruiter', 'vp-ta'], title: 'Duplicate Candidate Records Everywhere', description: 'Our database is full of duplicate candidate profiles from multiple applications, referrals, and manual entry. We can\'t get a clean view of our pipeline or candidate history.', icon: Users, ttFeature: 'Candidate Merge & Dedup', verbatim: '"I can\'t merge them. She applied three times, so now I have three duplicate profiles." — Heather Ortega, FSI' },
    { id: 'hm-handwritten-notes', persona: 'hiring-manager', category: 'hm-adoption', personaTabs: ['hiring-manager', 'vp-ta', 'recruiter'], title: 'Hiring Managers Using Handwritten Notes', description: 'Our hiring managers refuse to use the ATS for feedback — they\'re emailing handwritten notes, using Word docs, or giving verbal feedback that never gets captured. We have zero audit trail for hiring decisions.', icon: FileText, ttFeature: 'Mobile App + Simple Scorecards' },
    { id: 'job-posting-formatting', persona: 'recruiter', category: 'candidate-exp', personaTabs: ['recruiter', 'dir-eb'], title: 'Job Posting Formatting Breaks on Distribution', description: 'When we syndicate job postings from our ATS to LinkedIn and job boards, the formatting breaks — bullet points disappear, spacing is wrong, and our listings look unprofessional.', icon: FileText, ttFeature: 'Multi-Channel Job Distribution' },

    /* ---- New pains from Thanos (International) transcript analysis ---- */
    { id: 'application-form-rigidity', persona: 'vp-ta', category: 'ats-workflow', personaTabs: ['vp-ta', 'recruiter', 'hiring-manager'], title: 'Application Forms Locked Per Role', description: 'Our application form asks the same questions for every role — a housekeeping position asks for the same info as an engineering role. We can\'t customize per job type, and candidates abandon forms that feel irrelevant.', icon: FileText, ttFeature: 'Custom Application Forms' },
    { id: 'hiring-forecast-gap', persona: 'chro', category: 'reporting', personaTabs: ['chro', 'vp-ta', 'cfo'], title: 'No Hiring Forecast or Workforce Plan', description: 'Managers don\'t submit headcount plans in advance — we\'re always reactive, hiring "yesterday." Without forecasting, we overspend on agencies and compromise on quality.', icon: BarChart3, ttFeature: 'Requisition Planning' },
    { id: 'scorecard-manual-aggregation', persona: 'recruiter', category: 'hm-adoption', personaTabs: ['recruiter', 'vp-ta', 'hiring-manager'], title: 'No Scorecard Auto-Summary', description: 'After each round of interviews, I manually compile and average scorecards from multiple interviewers. There\'s no auto-aggregation — it\'s error-prone and wastes hours every week.', icon: Star, ttFeature: 'Scorecard Auto-Summary' },
    { id: 'multi-country-career-site', persona: 'dir-eb', category: 'brand', personaTabs: ['dir-eb', 'vp-ta', 'chro'], title: 'Single-Language Career Site for Global Org', description: 'We operate in 10+ countries but our career site is only in one language. We\'re losing local talent because the experience isn\'t localized — candidates can\'t read our job postings in their language.', icon: Globe, ttFeature: '30+ Language Career Sites' },

    /* ---- New pains from pain taxonomy audit ---- */
    { id: 'ats-price-shock', persona: 'cfo', category: 'cost', personaTabs: ['cfo', 'vp-ta', 'chro'], title: 'ATS Renewal Price Shock', description: 'Our current ATS vendor just hit us with a 40-60% price increase on renewal. We\'re paying enterprise prices for a tool that half the team doesn\'t use.', icon: DollarSign, ttFeature: 'Transparent Pricing' },
    { id: 'no-passive-pipeline', persona: 'vp-ta', category: 'sourcing', personaTabs: ['vp-ta', 'recruiter'], title: 'No Passive Talent Pipeline', description: 'We have no way to engage passive candidates or build talent pools for future roles. Every req starts from zero — we pay job boards and pray.', icon: Users, ttFeature: 'Connect & Nurture Campaigns' },
    { id: 'vendor-lock-in', persona: 'vp-ta', category: 'ats-workflow', personaTabs: ['vp-ta', 'chro'], title: 'Contract Lock-In & Data Ransom', description: 'Our current vendor won\'t release our data until the contract ends, or they charge steep "data extortion" fees (e.g., $3,000 for raw exports). We\'re trapped in a multi-year deal.', icon: Lock, ttFeature: 'Easy Migration & Data Import' },
    { id: 'scattered-scheduling', persona: 'recruiter', category: 'scheduling', personaTabs: ['recruiter', 'hiring-manager'], title: 'Scattered Scheduling Updates', description: 'When we update or reschedule an interview, the updates don\'t sync for all panelists simultaneously (common issue with Lever). Panelists show up at the wrong time.', icon: Calendar, ttFeature: 'Centralized Smart Scheduling' },
    { id: 'no-video-interview', persona: 'recruiter', category: 'candidate-exp', personaTabs: ['recruiter', 'hiring-manager', 'vp-ta'], title: 'No Video or Async Interview Capability', description: 'We can\'t do video screening questions or async interviews — every candidate requires a live phone screen, which eats 30+ hours per week across the team.', icon: Smartphone, ttFeature: 'Video Questions' },
    { id: 'seasonal-surge-chaos', persona: 'vp-ta', category: 'scheduling', personaTabs: ['vp-ta', 'recruiter', 'hiring-manager'], title: 'Seasonal & Surge Hiring Chaos', description: 'We go from 5 open roles to 50 overnight for seasonal ramps, but our process can\'t scale. We end up with mass-hiring chaos — paper apps, walk-in lines, and zero structure.', icon: Waves, ttFeature: 'Scalable Workflows & QR Capture' },
    { id: 'post-hire-data-gap', persona: 'chro', category: 'compliance', personaTabs: ['chro', 'vp-ta'], title: 'Post-Hire Data Doesn\'t Flow Anywhere', description: 'When a candidate is hired, nothing flows to payroll, HRIS, or onboarding. Someone manually re-enters all their data into ADP/Workday/Paylocity. It\'s error-prone and wastes hours.', icon: ArrowLeftRight, ttFeature: 'HRIS Webhooks & Integrations' },
    { id: 'ai-mass-apply-spam', persona: 'recruiter', category: 'ats-workflow', personaTabs: ['recruiter', 'vp-ta'], title: 'Candidates Mass-Applying via AI Tools', description: 'Candidates are using AI tools to auto-apply to hundreds of jobs. Our inbox is flooded with copy-paste applications that aren\'t even customized — we can\'t tell who actually wants the job.', icon: Brain, ttFeature: 'AI Screening & Knockout Questions' },
];
