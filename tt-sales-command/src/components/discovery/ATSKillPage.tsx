import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, TrendingUp, Star, Quote, AlertCircle, Building2, User } from 'lucide-react';
import { getRelevantReviews, getATSDisplayName } from '../../data/competitorReviews';

interface ATSKillPageProps {
  ats: string | null;
  selectedPains: string[];
  themeColor: string;
  companyName: string;
}

// Structured comparison data per ATS
interface ComparisonRow {
  capability: string;
  teamtailor: string;
  competitor: string;
  ttWins: boolean;
}

const ATS_COMPARISONS: Record<string, {
  headline: string;
  subheadline: string;
  painSummary: string;
  switchRate: string;
  avgTimeSaved: string;
  rows: ComparisonRow[];
}> = {
  greenhouse: {
    headline: 'Greenhouse is holding your brand hostage.',
    subheadline: "It was built for engineers to track applications — not for talent teams to attract them. Every career site edit requires a developer ticket, and there's still no native CRM.",
    painSummary: 'Career site flexibility, talent nurturing, and cost-efficiency',
    switchRate: '68%',
    avgTimeSaved: '12 hrs/wk',
    rows: [
      { capability: 'Career Site Customization', teamtailor: 'No-code, drag-and-drop builder. Fully branded in hours.', competitor: 'Requires developer + API access for every meaningful change.', ttWins: true },
      { capability: 'Native Candidate CRM', teamtailor: 'Built-in talent pools, automated nurture campaigns, re-engagement workflows.', competitor: 'No native CRM. Past candidates are a dead list.', ttWins: true },
      { capability: 'AI-Powered Screening', teamtailor: 'AI Co-pilot surfaces top candidates and writes scorecards automatically.', competitor: 'Manual review only. No AI screening assistance.', ttWins: true },
      { capability: 'Hiring Manager Experience', teamtailor: 'Full mobile app. One-tap approvals, feedback, and scheduling.', competitor: 'Desktop-first. Scorecards are rigid and frequently skipped.', ttWins: true },
      { capability: 'All-in-One Pricing', teamtailor: 'Career site, ATS, CRM, analytics — one flat subscription.', competitor: 'Core ATS + costly add-ons for analytics, sourcing, and CRM.', ttWins: true },
    ],
  },
  workday: {
    headline: "Workday is an ERP pretending to be an ATS.",
    subheadline: "Designed for Fortune 500 finance teams, not for recruiters. The result: a 7-click process to move a candidate, an application that breaks on mobile, and hiring managers who simply refuse to use it.",
    painSummary: 'Candidate experience, recruiter efficiency, and manager adoption',
    switchRate: '74%',
    avgTimeSaved: '15+ hrs/wk',
    rows: [
      { capability: 'Candidate Application Experience', teamtailor: 'Frictionless, mobile-first. Average apply time: 4 minutes.', competitor: 'Multi-portal login, broken mobile forms. Under 30% completion rate.', ttWins: true },
      { capability: 'Recruiter Workflow Speed', teamtailor: 'Single click to advance, auto-triggers, automated follow-ups.', competitor: '7+ clicks per candidate action. Designed for ERP admin, not recruiting.', ttWins: true },
      { capability: 'Hiring Manager Adoption', teamtailor: 'Mobile app with push notifications. 80%+ active HM adoption.', competitor: "So complex that HMs email feedback instead of logging in. Zero ROI on their license.", ttWins: true },
      { capability: 'Implementation Speed', teamtailor: 'Configured and live in days. No consultants required.', competitor: '6-12 month implementation. Typically $100K+ in consulting fees.', ttWins: true },
      { capability: 'Total Cost of Ownership', teamtailor: 'Predictable flat subscription. Zero surprise fees.', competitor: 'License + mandatory implementation + consultants + annual support.', ttWins: true },
    ],
  },
  lever: {
    headline: "Lever is coasting on its 2018 reputation.",
    subheadline: "Since the acquisition, roadmap velocity has stalled. Your recruiters are still doing the same manual processes they were doing 4 years ago, while paying enterprise prices for a mid-market product.",
    painSummary: 'Innovation, analytics access, and career site brand control',
    switchRate: '61%',
    avgTimeSaved: '8 hrs/wk',
    rows: [
      { capability: 'Product Innovation Velocity', teamtailor: 'New features shipped every 2 weeks. AI tools built natively.', competitor: 'Roadmap stalled post-acquisition. Same core product since 2021.', ttWins: true },
      { capability: 'Career Site Control', teamtailor: 'Full no-code builder. Unlimited pages, video, culture content.', competitor: 'Generic template. Custom branding requires API development.', ttWins: true },
      { capability: 'Analytics & Reporting', teamtailor: 'Real-time dashboards. All analytics included in base plan.', competitor: 'Custom reports locked behind premium tiers.', ttWins: true },
      { capability: 'Talent Pool Nurturing', teamtailor: 'Native email campaigns, automated re-engagement, pipeline warmth scoring.', competitor: 'Basic saved searches. No automated nurture sequences.', ttWins: true },
      { capability: 'Pricing Transparency', teamtailor: 'What you see is what you pay. No add-on surprises.', competitor: '40%+ average cost overrun vs. original quote.', ttWins: true },
    ],
  },
  bamboohr: {
    headline: "BambooHR is an HR admin tool. Not an ATS.",
    subheadline: "It was built to manage employees you already have — not attract ones you want. The result is a careers page with zero brand personality and manual screening with zero AI.",
    painSummary: 'Employer brand, AI screening, and analytics',
    switchRate: '79%',
    avgTimeSaved: '10 hrs/wk',
    rows: [
      { capability: 'Career Site & Employer Brand', teamtailor: 'Stunning, fully branded career sites with video, blogs, team profiles.', competitor: 'Logo + job list. Zero culture content or customization.', ttWins: true },
      { capability: 'AI Screening & Co-pilot', teamtailor: 'AI surfaces top 10% of candidates. Automated Q&A screening.', competitor: 'Zero AI. Every application read manually.', ttWins: true },
      { capability: 'Analytics & Source Reporting', teamtailor: 'Live pipeline dashboards. Source ROI. Time-to-hire trends.', competitor: 'Export to Excel and build your own. Reporting is near-absent.', ttWins: true },
      { capability: 'Candidate Re-engagement', teamtailor: 'Native CRM nurture campaigns. Silver medalists re-engaged automatically.', competitor: 'Rejected candidates are gone forever. No re-engagement capability.', ttWins: true },
      { capability: 'Recruiter-First Design', teamtailor: 'Purpose-built for talent acquisition teams of any size.', competitor: 'Built for HR generalists. Recruiting is a secondary feature.', ttWins: true },
    ],
  },
  ashby: {
    headline: "Ashby nails the data. It missed the candidate experience.",
    subheadline: "The analytics are best-in-class, but the career site is a template afterthought. If you care about how your brand appears to candidates, Ashby requires expensive custom development — and it still won't match what Teamtailor does out of the box.",
    painSummary: 'Career site brand, candidate experience, and compliance',
    switchRate: '52%',
    avgTimeSaved: '6 hrs/wk',
    rows: [
      { capability: 'Career Site Brand Control', teamtailor: 'No-code, pixel-perfect builder. Stunning brand experiences in hours.', competitor: 'Basic template. Real customization requires API + developer costs.', ttWins: true },
      { capability: 'Candidate Experience & Mobile', teamtailor: 'Mobile-first applications. Sub-4-minute apply times.', competitor: 'Functional but utilitarian. Not designed to delight candidates.', ttWins: true },
      { capability: 'GDPR & Compliance Engine', teamtailor: 'Automated consent management, data retention policies, EU-native.', competitor: 'Basic compliance. Limited EU data residency options.', ttWins: true },
      { capability: 'Analytics & Pipeline Data', teamtailor: 'Real-time dashboards. All key metrics built-in.', competitor: 'Best-in-class analytics. Comparable or better in this area.', ttWins: false },
      { capability: 'Hiring Manager Mobile App', teamtailor: 'Full iOS/Android app. Approvals, feedback, and interview notes on mobile.', competitor: 'Scheduler lags. HMs default to email communication.', ttWins: true },
    ],
  },
  icims: {
    headline: "iCIMS is the most expensive recruiter demoralizer on the market.",
    subheadline: "You need a full-time iCIMS admin just to run it. Your hiring managers won't log in. Your candidates think your process is from 2008. And you're paying $250K+ a year for the privilege.",
    painSummary: 'Admin overhead, HM adoption, and candidate experience',
    switchRate: '81%',
    avgTimeSaved: '20 hrs/wk',
    rows: [
      { capability: 'Ease of Use for Recruiters', teamtailor: 'Intuitive interface. New recruiter trained and productive in under 1 day.', competitor: 'Requires dedicated admin/configuration team. Interface is deeply complex.', ttWins: true },
      { capability: 'Hiring Manager Adoption', teamtailor: 'One-tap mobile app. Average HM engagement rate over 80%.', competitor: 'So complex that HMs refuse to log in. Recruiters do their admin for them.', ttWins: true },
      { capability: 'Candidate Experience', teamtailor: 'Beautiful, modern career sites. Industry-best application completion rates.', competitor: "Consistently rated worst candidate experience in the market. Candidates openly complain.", ttWins: true },
      { capability: 'Total Cost of Ownership', teamtailor: 'Simple, transparent subscription. Zero hidden fees.', competitor: 'License + mandatory professional services + annual consultant cost = $250K+.', ttWins: true },
      { capability: 'Implementation Time', teamtailor: 'Live and configured in days, not months.', competitor: '3-6 month implementations. Multiple "go-live" delays are common.', ttWins: true },
    ],
  },
  smartrecruiters: {
    headline: "SmartRecruiters over-promises and under-delivers on AI.",
    subheadline: "Their 'AI matching' is keyword matching with a marketing rebrand. Meanwhile, you're still reading every application manually, paying enterprise prices for a product that hasn't fundamentally changed.",
    painSummary: 'Real AI utility, career site brand, and reporting depth',
    switchRate: '58%',
    avgTimeSaved: '9 hrs/wk',
    rows: [
      { capability: 'AI Screening Quality', teamtailor: 'True AI Co-pilot. Contextual matching, automated Q&A, predictive scoring.', competitor: 'Keyword-based matching marketed as AI. Low trust, low adoption.', ttWins: true },
      { capability: 'Career Site Flexibility', teamtailor: 'No-code builder. Unique brand per brand or region in hours.', competitor: 'Template-constrained. Differentiation requires developer + API.', ttWins: true },
      { capability: 'Reporting & Analytics', teamtailor: 'Real-time pipeline reports. Source ROI. Time-to-hire trends. All included.', competitor: 'Rigid pre-built reports. Most teams export to Tableau to get real insights.', ttWins: true },
      { capability: 'Pricing vs. Value', teamtailor: 'Right-sized pricing for teams under 500. Full feature access.', competitor: 'Enterprise pricing for mid-market teams. Paying for features never used.', ttWins: true },
      { capability: 'Customer Support & Partnership', teamtailor: 'Dedicated success manager. SLA-backed support. Fast response times.', competitor: 'Support varies widely. Escalation paths are complex.', ttWins: true },
    ],
  },
  workable: {
    headline: "Workable grew up. Your talent strategy didn't.",
    subheadline: "Workable is a solid starter ATS — but it caps out fast. Once you need a real employer brand, deep analytics, or a CRM to nurture passive talent, you've hit a hard ceiling.",
    painSummary: 'Employer brand depth, analytics maturity, and talent nurturing',
    switchRate: '55%',
    avgTimeSaved: '7 hrs/wk',
    rows: [
      { capability: 'Career Site Depth', teamtailor: 'Unlimited pages, video, culture blogs, team profiles. Total brand ownership.', competitor: 'Basic color/logo customization. Video and content pages require API work.', ttWins: true },
      { capability: 'Talent CRM & Nurturing', teamtailor: 'Automated nurture campaigns. Silver medalists re-engaged for future roles.', competitor: 'Basic candidate database. No nurture automation or campaign tools.', ttWins: true },
      { capability: 'Analytics Depth', teamtailor: 'Live dashboards, source ROI, pipeline velocity, diversity analytics.', competitor: 'Pre-built reports only. Custom analytics not available.', ttWins: true },
      { capability: 'AI-Powered Screening', teamtailor: 'AI Co-pilot with contextual screening and auto-generated scorecards.', competitor: 'Basic automated screening. Not AI-native.', ttWins: true },
      { capability: 'Ease of Use', teamtailor: 'Consistently rated #1 for usability on G2 and Capterra.', competitor: 'Good usability for a starter tool. Comparable for basic workflows.', ttWins: false },
    ],
  },
  jazzhr: {
    headline: "JazzHR is a filing cabinet, not a recruiting platform.",
    subheadline: "Built for teams of 1-5 who just need to track applicants. The moment you need a career site, structured interviews, automation, or AI — you've outgrown it. And your candidate emails are going to spam.",
    painSummary: 'Career site, email deliverability, and screening automation',
    switchRate: '72%',
    avgTimeSaved: '8 hrs/wk',
    rows: [
      { capability: 'Career Site & Employer Brand', teamtailor: 'No-code career site builder with video, blogs, team profiles. Full brand ownership.', competitor: 'No career site builder. Job listings only. Zero brand storytelling.', ttWins: true },
      { capability: 'Email Deliverability', teamtailor: 'Enterprise-grade email with SPF/DKIM/DMARC. Messages reach candidates reliably.', competitor: 'Candidate emails consistently land in spam. Prospects report messages going "to nowhere."', ttWins: true },
      { capability: 'AI-Powered Screening', teamtailor: 'AI Co-pilot screens and scores candidates automatically. 3x recruiter throughput.', competitor: 'Zero AI. Every application reviewed manually. No screening automation.', ttWins: true },
      { capability: 'GDPR & Compliance', teamtailor: 'Automated consent, data retention, right-to-deletion. EU-native infrastructure.', competitor: 'Basic data handling. No automated GDPR workflows. Manual compliance risk.', ttWins: true },
      { capability: 'Candidate Database', teamtailor: 'Auto-merge duplicates, talent pools, nurture campaigns, re-engagement.', competitor: 'Duplicate records everywhere. No candidate merge or deduplication.', ttWins: true },
    ],
  },
  successfactors: {
    headline: "SuccessFactors is an FTE management tool pretending to recruit.",
    subheadline: "Built for SAP headcount planning, not for attracting talent. Rigid workflows, manual FTE capacity management, and a career site that looks like a procurement portal. Enterprise teams are walking away.",
    painSummary: 'FTE rigidity, career site, and hiring manager adoption',
    switchRate: '67%',
    avgTimeSaved: '14 hrs/wk',
    rows: [
      { capability: 'Workflow Flexibility', teamtailor: 'Custom workflows per role type, business unit, or region. No rigid templates.', competitor: 'Fixed FTE-based workflows. "Sometimes the FTE is reached to maximum and we manually increase capacity."', ttWins: true },
      { capability: 'Career Site Experience', teamtailor: 'Stunning, localized career sites in 30+ languages. No-code builder.', competitor: 'SAP-style portal. No employer brand personality. Looks like an internal system.', ttWins: true },
      { capability: 'Hiring Manager Adoption', teamtailor: 'Full mobile app. One-tap approvals. 80%+ adoption rate.', competitor: 'Complex desktop-first interface. Managers route around the system.', ttWins: true },
      { capability: 'Scorecard & Interview Governance', teamtailor: 'Structured scorecards with auto-aggregation. Consistent hiring bar.', competitor: 'Manual scorecard aggregation. Recruiters compile ratings by hand.', ttWins: true },
      { capability: 'Total Cost & Implementation', teamtailor: 'Flat subscription. Live in days. No consultants required.', competitor: 'SAP licensing + implementation partner + annual support = $200K+ TCO.', ttWins: true },
    ],
  },
  paycor: {
    headline: "Paycor's ATS is an afterthought bolted onto payroll.",
    subheadline: "Payroll-first, recruiting-last. The same rigid workflow for every role, a career site that's a job listing page, and hiring managers who've never logged in. You're paying HRIS prices for an ATS that can't keep up.",
    painSummary: 'Workflow rigidity, career site, and recruiting automation',
    switchRate: '76%',
    avgTimeSaved: '11 hrs/wk',
    rows: [
      { capability: 'Career Site & Brand', teamtailor: 'Fully branded, no-code career sites with culture content, video, and team profiles.', competitor: 'Generic job listing page. No brand personality. Zero content capabilities.', ttWins: true },
      { capability: 'Workflow Customization', teamtailor: 'Unique workflows per role type, department, or location. Full flexibility.', competitor: 'One rigid workflow for all roles. Payroll-first design with recruiting as add-on.', ttWins: true },
      { capability: 'AI Screening', teamtailor: 'AI Co-pilot surfaces top candidates. Automated Q&A screening criteria.', competitor: 'No AI screening. Manual review of every application.', ttWins: true },
      { capability: 'Mobile Experience', teamtailor: 'Full iOS/Android app for HMs. Push notifications, one-tap feedback.', competitor: 'Desktop-only. No native mobile app for hiring managers.', ttWins: true },
      { capability: 'Candidate Experience', teamtailor: 'Mobile-first applications. Sub-4-minute apply time. Automated status updates.', competitor: 'Clunky forms designed for HR admin, not candidates. Poor mobile experience.', ttWins: true },
    ],
  },
  paycom: {
    headline: "Paycom charges double for half the recruiting capability.",
    subheadline: "Premium HRIS pricing with a basic recruiting frontend. The ATS is an afterthought in a payroll bundle — no career site builder, no AI, no candidate nurturing. You're overpaying for a system that can't attract talent.",
    painSummary: 'Cost efficiency, career site, and recruiter productivity',
    switchRate: '78%',
    avgTimeSaved: '12 hrs/wk',
    rows: [
      { capability: 'True Cost of Ownership', teamtailor: 'Flat, predictable ATS subscription. Unlimited users included.', competitor: 'Double the cost of standard HRIS. ATS is bundled afterthought at premium price.', ttWins: true },
      { capability: 'Career Site Builder', teamtailor: 'No-code drag-and-drop. Video, blogs, team profiles. Full brand control.', competitor: 'No career site builder. Basic job listing only.', ttWins: true },
      { capability: 'AI & Automation', teamtailor: 'AI screening, automated triggers, smart scheduling, candidate scoring.', competitor: 'Minimal automation. Manual workflows throughout the hiring process.', ttWins: true },
      { capability: 'Candidate CRM', teamtailor: 'Talent pools, nurture campaigns, Connect for passive candidates.', competitor: 'No CRM. Rejected candidates are lost. Zero re-engagement capability.', ttWins: true },
      { capability: 'Analytics', teamtailor: 'Real-time dashboards. Source ROI. Pipeline velocity. All included.', competitor: 'Basic reports. HR-focused metrics, not recruiting-specific analytics.', ttWins: true },
    ],
  },
  dayforce: {
    headline: "Dayforce recruiting is stuck in the last decade.",
    subheadline: "An archaic UX that forces one workflow for all roles, with no distinction between retail floor staff and head office professionals. Hiring managers won't use it. Candidates won't finish the application. And you're locked into an enterprise contract.",
    painSummary: 'UX modernization, workflow flexibility, and manager adoption',
    switchRate: '71%',
    avgTimeSaved: '13 hrs/wk',
    rows: [
      { capability: 'User Experience', teamtailor: 'Modern, intuitive interface. New users productive in under 1 day.', competitor: 'Archaic UX. One workflow for all roles. No retail/HO distinction.', ttWins: true },
      { capability: 'Career Site', teamtailor: 'Stunning career sites with full brand control. No-code builder.', competitor: 'Corporate portal look. Limited customization. Candidates bounce.', ttWins: true },
      { capability: 'Hiring Manager Mobile', teamtailor: 'Full native app. Push notifications. One-tap approvals from phone.', competitor: 'Desktop-required. HMs email feedback instead of logging in.', ttWins: true },
      { capability: 'AI & Screening', teamtailor: 'AI Co-pilot with contextual matching. 246 apps handled vs 66 manually.', competitor: 'No AI screening. Manual review. Legacy automation rules only.', ttWins: true },
      { capability: 'Pipeline Visibility', teamtailor: 'Real-time dashboards. Live pipeline view across all roles and stages.', competitor: 'Reporting is rigid. Custom views require configuration support.', ttWins: true },
    ],
  },
  rippling: {
    headline: "Rippling nails HR admin. It missed recruiting entirely.",
    subheadline: "World-class for headcount planning, payroll, and IT provisioning — but the ATS module is thin. No career site builder, limited screening, and no talent CRM. Rippling stays for HCM; Teamtailor handles the actual hiring.",
    painSummary: 'Career site, talent nurturing, and recruiting depth',
    switchRate: '54%',
    avgTimeSaved: '7 hrs/wk',
    rows: [
      { capability: 'Career Site & Employer Brand', teamtailor: 'No-code career site builder. Video, blogs, culture content. Full brand control.', competitor: 'Basic job listing page. No content hub or brand storytelling.', ttWins: true },
      { capability: 'Talent CRM & Nurturing', teamtailor: 'Talent pools, nurture campaigns, Connect for passive candidates. Re-engage silver medalists.', competitor: 'No CRM. Basic candidate database only. No nurture automation.', ttWins: true },
      { capability: 'AI Screening', teamtailor: 'AI Co-pilot scores and ranks candidates. Automated screening Q&A.', competitor: 'Limited screening capabilities. Manual review is the default.', ttWins: true },
      { capability: 'HRIS Integration', teamtailor: 'Integrates with Rippling via API. TT handles recruiting, Rippling handles HCM.', competitor: 'Native HRIS. Strong for employee management post-hire.', ttWins: false },
      { capability: 'Interview Governance', teamtailor: 'Structured scorecards, interview kits, auto-aggregated feedback.', competitor: 'Basic interview tracking. No structured scoring framework.', ttWins: true },
    ],
  },
  bullhorn: {
    headline: "Bullhorn is a staffing CRM. Not an in-house ATS.",
    subheadline: "Built for recruitment agencies managing placements, not for corporate TA teams building employer brands. If you're hiring internally, you need a career site, candidate experience, and hiring manager collaboration — none of which Bullhorn provides.",
    painSummary: 'Career site, candidate experience, and internal hiring workflows',
    switchRate: '63%',
    avgTimeSaved: '9 hrs/wk',
    rows: [
      { capability: 'Career Site & Brand', teamtailor: 'Full career site CMS. Culture content, video, team profiles. Attracts direct applicants.', competitor: 'No career site. Agency-facing CRM. Not designed for direct employer branding.', ttWins: true },
      { capability: 'Candidate Experience', teamtailor: 'Mobile-first, branded applications. Automated status updates. Sub-4-min apply time.', competitor: 'Built for recruiters placing candidates, not for candidate self-service.', ttWins: true },
      { capability: 'Hiring Manager Collaboration', teamtailor: 'Full mobile app. Structured scorecards. Push notification approvals.', competitor: 'No HM-facing tools. CRM is recruiter/agency focused.', ttWins: true },
      { capability: 'Analytics & Pipeline', teamtailor: 'Real-time TA dashboards. Source ROI. Time-to-fill trends. DEI reporting.', competitor: 'Agency metrics (placements, margins). Not built for internal TA reporting.', ttWins: true },
      { capability: 'Staffing Agency Features', teamtailor: 'Basic agency portal for receiving referrals. Not a staffing CRM.', competitor: 'Best-in-class for agency workflow, client management, and placement tracking.', ttWins: false },
    ],
  },
  adp: {
    headline: "ADP keeps your recruiting stuck in the '80s.",
    subheadline: "Built for payroll and compliance, not for attracting talent. The recruiting module is rigid, not user-friendly, and rolls out changes with zero training. Your recruiters are manually entering data into the backend just to get basic analytics. Candidates deserve better.",
    painSummary: 'Career site, candidate experience, and recruiter usability',
    switchRate: '77%',
    avgTimeSaved: '12 hrs/wk',
    rows: [
      { capability: 'Career Site & Employer Brand', teamtailor: 'Stunning, no-code career sites with video, blogs, team profiles. Full brand ownership.', competitor: 'No career site builder. Generic job listing page. Zero employer brand storytelling.', ttWins: true },
      { capability: 'AI Screening & Co-pilot', teamtailor: 'AI surfaces top candidates, writes scorecards, drafts job ads. All included.', competitor: 'Zero AI. Every application reviewed manually. No screening automation.', ttWins: true },
      { capability: 'Mobile Experience', teamtailor: 'Full iOS/Android app for HMs. Push notifications, one-tap feedback, mobile apply.', competitor: 'No native mobile recruiting app. Desktop-only workflows.', ttWins: true },
      { capability: 'Usability & Training', teamtailor: 'Intuitive interface. New users productive in under 1 day. Continuous UX improvements.', competitor: 'Not user-friendly. Dashboard changes with no prior training. Backend data entry required for analytics.', ttWins: true },
      { capability: 'Analytics & Reporting', teamtailor: 'Real-time dashboards. Source ROI. Pipeline velocity. All included out of the box.', competitor: 'Must manually enter data into the backend to use analytics. Reporting is an afterthought.', ttWins: true },
    ],
  },
  paylocity: {
    headline: "Paylocity tracks applicants. It doesn't attract them.",
    subheadline: "It's a payroll system with a recruiting module bolted on. No employer branding, no mobile app, no candidate-forward design. Gmail candidate emails go to spam. Your team can't do anything on the go, and your candidates see a process that feels stuck in 2015.",
    painSummary: 'Employer branding, mobile experience, email deliverability, and candidate attraction',
    switchRate: '75%',
    avgTimeSaved: '10 hrs/wk',
    rows: [
      { capability: 'Employer Branding & Career Site', teamtailor: 'No-code career site builder with video, blogs, culture content. Full brand control.', competitor: 'No employer branding tools. Basic job listing page. Zero culture content.', ttWins: true },
      { capability: 'Email Deliverability', teamtailor: 'Enterprise-grade email with SPF/DKIM/DMARC. Messages reach candidates reliably.', competitor: 'Gmail addresses are funneled into spam and junk. Candidates with Gmail never receive emails.', ttWins: true },
      { capability: 'Mobile Experience', teamtailor: 'Full native mobile app. Recruiters and HMs can review, approve, and act from anywhere.', competitor: 'No mobile app. "We cannot do anything on the go." Desktop-only.', ttWins: true },
      { capability: 'AI Screening & Automation', teamtailor: 'AI Co-pilot screens, scores, and ranks candidates. Automated nurture campaigns.', competitor: 'No AI screening. Manual review of every application. Basic automation only.', ttWins: true },
      { capability: 'Candidate Experience', teamtailor: 'Mobile-first, sub-4-minute apply. Automated status updates. Branded communications.', competitor: 'Not intuitive, not tech-forward, not candidate-forward. Indeed salary listings go out wrong.', ttWins: true },
    ],
  },
};

export function ATSKillPage({ ats, selectedPains, themeColor, companyName }: ATSKillPageProps) {
  const atsKey = ats ? ats.toLowerCase().replace(/\s+/g, '') : '';
  const data = ATS_COMPARISONS[atsKey];
  const atsName = ats ? getATSDisplayName(ats) : '';
  const reviews = getRelevantReviews(ats, selectedPains, 2);

  if (!ats || !data || ats === 'None' || ats === 'other') return null;

  const [viewMode, setViewMode] = useState<'narrative' | 'table'>('narrative');

  // Feature comparison categories for the table view
  const featureCategories = [
    { feature: 'Employer Branding', tt: 'Stunning career sites with video, blogs, team profiles & culture content', competitor: 'Basic job listing page with limited customization', ttWins: true },
    { feature: 'Career Site', tt: 'No-code drag-and-drop builder, fully branded in hours', competitor: 'Template-based or requires developer access', ttWins: true },
    { feature: 'Job Distribution', tt: 'Multi-channel distribution with source ROI tracking', competitor: 'Manual posting to individual job boards', ttWins: true },
    { feature: 'AI Features', tt: 'AI Co-pilot for screening, scorecards, and candidate matching', competitor: 'Limited or no AI-powered automation', ttWins: true },
    { feature: 'Interview Scheduling', tt: 'Smart scheduling with calendar sync & candidate self-booking', competitor: 'Manual coordination via email', ttWins: true },
    { feature: 'Analytics', tt: 'Real-time dashboards, pipeline velocity, DEI & source analytics', competitor: 'Basic pre-built reports or manual exports', ttWins: true },
    { feature: 'Candidate Experience', tt: 'Mobile-first, sub-4-min apply time, automated updates', competitor: 'Desktop-heavy with slow, multi-step applications', ttWins: true },
    { feature: 'Integrations', tt: '60+ native integrations, open API, HRIS connectors', competitor: 'Limited ecosystem, often requires middleware', ttWins: false },
    { feature: 'Support', tt: 'Dedicated CSM, SLA-backed support, hypercare onboarding', competitor: 'Tiered support with variable response times', ttWins: true },
    { feature: 'Pricing', tt: 'Flat-fee, transparent, unlimited users included', competitor: 'Per-seat pricing with costly add-ons and hidden fees', ttWins: true },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-12 text-center">
        {/* View mode toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex gap-1 rounded-full bg-zinc-100 p-0.5">
            <button
              className={viewMode === 'narrative'
                ? 'bg-white shadow-sm rounded-full px-3 py-1 text-xs font-semibold text-zinc-800 transition-all'
                : 'px-3 py-1 text-xs text-zinc-500 hover:text-zinc-700 rounded-full transition-all'}
              onClick={() => setViewMode('narrative')}
            >
              Story
            </button>
            <button
              className={viewMode === 'table'
                ? 'bg-white shadow-sm rounded-full px-3 py-1 text-xs font-semibold text-zinc-800 transition-all'
                : 'px-3 py-1 text-xs text-zinc-500 hover:text-zinc-700 rounded-full transition-all'}
              onClick={() => setViewMode('table')}
            >
              Compare
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5"
        >
          <AlertCircle size={13} className="text-red-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-red-600">Competitive Analysis</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mb-4 text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-4xl"
        >
          {data.headline}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mx-auto max-w-2xl text-zinc-500 leading-relaxed"
        >
          {data.subheadline}
        </motion.p>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'narrative' ? (
          <motion.div
            key="narrative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >

      {/* KPI Pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="mb-10 flex flex-wrap justify-center gap-4"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-3 shadow-sm">
          <TrendingUp size={18} className="text-emerald-500" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Teams That Switch</p>
            <p className="text-xl font-bold text-zinc-900">{data.switchRate}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-3 shadow-sm">
          <div className="h-5 w-5 rounded-full flex items-center justify-center" style={{ backgroundColor: themeColor }}>
            <Check size={11} className="text-white" strokeWidth={3} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Avg Time Saved / Week</p>
            <p className="text-xl font-bold text-zinc-900">{data.avgTimeSaved}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-3 shadow-sm">
          <AlertCircle size={18} className="text-amber-500" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Key Gap Area</p>
            <p className="text-sm font-bold text-zinc-900 max-w-[180px] leading-tight">{data.painSummary}</p>
          </div>
        </div>
      </motion.div>

      {/* Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mb-12 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg"
      >
        {/* Table Header */}
        <div className="grid grid-cols-3 border-b border-zinc-200">
          <div className="px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Capability</p>
          </div>
          <div className="border-l border-zinc-200 px-5 py-4" style={{ backgroundColor: `${themeColor}08` }}>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: themeColor }} />
              <p className="text-xs font-bold text-zinc-900">Teamtailor</p>
            </div>
          </div>
          <div className="border-l border-zinc-200 bg-zinc-50 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-zinc-400" />
              <p className="text-xs font-bold text-zinc-500">{atsName}</p>
            </div>
          </div>
        </div>

        {/* Rows */}
        {data.rows.map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 * i }}
            className="grid grid-cols-3 border-b border-zinc-100 last:border-b-0"
          >
            <div className="px-5 py-4">
              <p className="text-xs font-bold text-zinc-700">{row.capability}</p>
            </div>
            <div className="border-l border-zinc-100 px-5 py-4" style={{ backgroundColor: `${themeColor}05` }}>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 shrink-0">
                  <Check size={13} className="text-emerald-500" strokeWidth={3} />
                </div>
                <p className="text-xs leading-relaxed text-zinc-700">{row.teamtailor}</p>
              </div>
            </div>
            <div className="border-l border-zinc-100 bg-zinc-50/50 px-5 py-4">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 shrink-0">
                  {row.ttWins
                    ? <X size={13} className="text-red-400" strokeWidth={3} />
                    : <Check size={13} className="text-emerald-500" strokeWidth={3} />
                  }
                </div>
                <p className={`text-xs leading-relaxed ${row.ttWins ? 'text-zinc-500' : 'text-zinc-700'}`}>{row.competitor}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Review Quotes */}
      {reviews.length > 0 && (
        <div>
          <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">
            What {atsName} customers are saying
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            {reviews.map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <div className="absolute left-0 top-0 h-1 w-full bg-red-400/60" />
                <Quote className="mb-3 h-6 w-6 text-zinc-100" />
                {review.stars && (
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} size={11} className={s < review.stars! ? 'fill-amber-400 text-amber-400' : 'fill-zinc-200 text-zinc-200'} />
                    ))}
                  </div>
                )}
                <p className="mb-4 text-sm italic leading-relaxed text-zinc-700">"{review.quote}"</p>
                <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800">
                      <User size={11} className="text-zinc-400" />
                      {review.reviewerRole}
                    </p>
                    {review.companySize && (
                      <p className="mt-0.5 flex items-center gap-1 text-[10px] text-zinc-400">
                        <Building2 size={9} />
                        {review.companySize}
                      </p>
                    )}
                  </div>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    {review.source}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {/* Side-by-Side Comparison Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg"
            >
              {/* Table Header */}
              <div className="grid grid-cols-3 border-b border-zinc-200">
                <div className="px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Feature</p>
                </div>
                <div className="border-l border-zinc-200 px-5 py-4 bg-zinc-50">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-zinc-400" />
                    <p className="text-xs font-bold text-zinc-500">{atsName}</p>
                  </div>
                </div>
                <div className="border-l border-zinc-200 px-5 py-4" style={{ backgroundColor: `${themeColor}08` }}>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: themeColor }} />
                    <p className="text-xs font-bold text-zinc-900">Teamtailor</p>
                  </div>
                </div>
              </div>

              {/* Rows */}
              {featureCategories.map((row, i) => (
                <motion.div
                  key={row.feature}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.04 * i }}
                  className={`grid grid-cols-3 border-b border-zinc-100 last:border-b-0 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}
                >
                  <div className="px-5 py-4">
                    <p className="text-xs font-bold text-zinc-700">{row.feature}</p>
                  </div>
                  <div className="border-l border-zinc-100 px-5 py-4">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 shrink-0">
                        {row.ttWins
                          ? <X size={13} className="text-red-400" strokeWidth={3} />
                          : <Check size={13} className="text-emerald-500" strokeWidth={3} />
                        }
                      </div>
                      <p className={`text-xs leading-relaxed ${row.ttWins ? 'text-zinc-500' : 'text-zinc-700'}`}>{row.competitor}</p>
                    </div>
                  </div>
                  <div className="border-l border-zinc-100 px-5 py-4" style={{ backgroundColor: `${themeColor}05` }}>
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 shrink-0">
                        <Check size={13} className="text-emerald-500" strokeWidth={3} />
                      </div>
                      <p className="text-xs leading-relaxed text-zinc-700">{row.tt}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
