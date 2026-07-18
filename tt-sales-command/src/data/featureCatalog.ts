// ============================================================
// featureCatalog.ts — Complete Teamtailor Feature Catalog
// Used in the Solution section for AE-selectable feature grids
// ============================================================

export interface Feature {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  status: 'included' | 'add-on' | 'upcoming';
}

export interface FeatureCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export const FEATURE_CATEGORIES: FeatureCategory[] = [
  { id: 'ai-intelligence',     label: 'AI & Intelligence',                 icon: '🤖', color: '#8b5cf6' },
  { id: 'sourcing',            label: 'Sourcing & Talent Attraction',      icon: '🎯', color: '#6366f1' },
  { id: 'career-site',         label: 'Career Site & Employer Brand',      icon: '🌐', color: '#0ea5e9' },
  { id: 'workflow-automation',  label: 'Recruiting Workflow & Automation',  icon: '⚙️', color: '#f59e0b' },
  { id: 'collaboration',       label: 'Collaboration & Hiring Team',       icon: '👥', color: '#10b981' },
  { id: 'offers-compliance',   label: 'Offer Management & Compliance',     icon: '📋', color: '#ef4444' },
  { id: 'integrations',        label: 'Integrations & Core Infrastructure', icon: '🔗', color: '#64748b' },
  { id: 'analytics',           label: 'Analytics & Reporting',              icon: '📊', color: '#ec4899' },
];

export const FEATURE_CATALOG: Feature[] = [
  // ── AI & Intelligence ──────────────────────────────────────────
  { id: 'ai-screening',        title: 'AI Candidate Screening',       description: 'Define criteria per role. Copilot evaluates every applicant with ✓/✗ per requirement and reasoning.', category: 'ai-intelligence', icon: '🎯', status: 'included' },
  { id: 'ai-resume-summary',   title: 'AI Resume Summaries',          description: 'Instant candidate summaries on every profile — key qualifications, experience highlights, red flags.', category: 'ai-intelligence', icon: '📄', status: 'included' },
  { id: 'ai-jd-drafts',        title: 'AI Job Description Drafts',    description: 'Generate complete, bias-checked job descriptions from a few bullet points or an existing JD.', category: 'ai-intelligence', icon: '✍️', status: 'included' },
  { id: 'ask-copilot',         title: 'Ask Copilot',                  description: 'Ask any question about a candidate in plain English. Copilot searches their resume, answers, and transcripts.', category: 'ai-intelligence', icon: '💬', status: 'included' },
  { id: 'copilot-suggestions',  title: 'Copilot Talent Pool Matching', description: 'AI scans your existing database and surfaces candidates who match new roles before you source externally.', category: 'ai-intelligence', icon: '🔮', status: 'included' },
  { id: 'ai-bias-detection',    title: 'Bias Detection',              description: 'AI flags potentially biased language in job descriptions and screening criteria before publishing.', category: 'ai-intelligence', icon: '⚖️', status: 'included' },
  { id: 'interview-recording',  title: 'Interview Recording & AI Notes', description: 'Record interviews in-platform. AI generates transcripts, highlights key moments, and creates shareable clips.', category: 'ai-intelligence', icon: '🎥', status: 'included' },
  { id: 'mcp-protocol',        title: 'MCP (AI Protocol)',            description: 'Model Context Protocol — connect any AI tool (Claude, ChatGPT, custom agents) directly to your ATS data.', category: 'ai-intelligence', icon: '🔗', status: 'included' },

  // ── Sourcing & Talent Attraction ────────────────────────────────
  { id: 'connect',             title: 'Connect',                      description: 'Passive candidates express interest via your career site — no open role needed. Auto-alerted when matches open.', category: 'sourcing', icon: '🎯', status: 'included' },
  { id: 'nurture-campaigns',   title: 'Nurture Campaigns',            description: 'Multi-step automated email drip sequences. Silver medalists auto-enter via pipeline triggers.', category: 'sourcing', icon: '📧', status: 'included' },
  { id: 'sms-messaging',       title: 'SMS Messaging',                description: 'Two-way SMS from candidate cards. Reach candidates where they are most responsive.', category: 'sourcing', icon: '📨', status: 'included' },
  { id: 'linkedin-rsc',        title: 'LinkedIn RSC Integration',     description: 'Two-way sync with LinkedIn Recruiter. See which candidates are already in your ATS, export in one click.', category: 'sourcing', icon: '💼', status: 'included' },
  { id: 'referral-portal',     title: 'Employee Referral Portal',     description: 'Branded referral portal. Employees browse open roles, submit referrals, track status. Gamification built in.', category: 'sourcing', icon: '🤝', status: 'included' },
  { id: 'external-recruiter',  title: 'External Recruiter Portal',    description: 'Agencies submit candidates through a branded portal. No ATS login required. Track agency performance.', category: 'sourcing', icon: '🏢', status: 'included' },
  { id: 'open-marketplace',    title: 'Open Marketplace',             description: 'Pre-built integrations with Gem, hireEZ, SeekOut, SourceWhale — plug in best-of-breed sourcing tools.', category: 'sourcing', icon: '🧩', status: 'included' },
  { id: 'job-board-posting',   title: 'Multi-Board Job Distribution', description: 'Post to Indeed, LinkedIn, Glassdoor, ZipRecruiter, and niche boards from one click. Track source performance.', category: 'sourcing', icon: '📡', status: 'included' },

  // ── Career Site & Employer Brand ────────────────────────────────
  { id: 'career-site-builder', title: 'Career Site Builder',           description: 'Drag-and-drop career site with custom sections, departments, locations. No developer needed.', category: 'career-site', icon: '🌐', status: 'included' },
  { id: 'custom-landing-pages', title: 'Custom Landing Pages',        description: 'Build targeted landing pages for specific roles, campaigns, or events with unique URLs.', category: 'career-site', icon: '📄', status: 'included' },
  { id: 'video-content',        title: 'Video & Media Blocks',        description: 'Embed team videos, office tours, and day-in-the-life content directly on your career site.', category: 'career-site', icon: '🎬', status: 'included' },
  { id: 'department-pages',     title: 'Department Pages',            description: 'Auto-generated department pages with team photos, open roles, and custom content per team.', category: 'career-site', icon: '🏷️', status: 'included' },
  { id: 'multi-language',       title: 'Multi-Language Support',      description: 'Career site and application flow in 30+ languages. Auto-detect visitor language or let them choose.', category: 'career-site', icon: '🌍', status: 'included' },
  { id: 'seo-optimized',       title: 'SEO & Google Jobs',            description: 'Career site built for search engines. Automatic Google for Jobs schema markup on every listing.', category: 'career-site', icon: '🔍', status: 'included' },

  // ── Recruiting Workflow & Automation ────────────────────────────
  { id: 'smart-move',          title: 'Smart Move (Auto-Triggers)',    description: 'Automated stage transitions, emails, tasks, and notifications triggered by pipeline events.', category: 'workflow-automation', icon: '⚡', status: 'included' },
  { id: 'job-templates',       title: 'Job Templates',                description: 'Save pipeline stages, screening criteria, interview kits, and auto-triggers as reusable templates.', category: 'workflow-automation', icon: '📋', status: 'included' },
  { id: 'self-scheduling',     title: 'Self-Scheduling',              description: 'Candidates book interviews from your calendar availability. Syncs with Outlook, Google, and MS Teams.', category: 'workflow-automation', icon: '📅', status: 'included' },
  { id: 'video-questions',     title: 'Video Questions',              description: 'Async video screening — candidates record answers to your questions on their own time. Review at your pace.', category: 'workflow-automation', icon: '🎥', status: 'included' },
  { id: 'custom-forms',        title: 'Custom Application Forms',     description: 'Build role-specific application forms with conditional logic, file uploads, and custom fields.', category: 'workflow-automation', icon: '📝', status: 'included' },
  { id: 'pipeline-kanban',     title: 'Kanban Pipeline',              description: 'Visual drag-and-drop pipeline. Move candidates between stages with a click. Bulk actions supported.', category: 'workflow-automation', icon: '📊', status: 'included' },
  { id: 'approval-routing',    title: 'Job Approval Routing',         description: 'Multi-step approval workflows for new job postings. Configurable per department or role level.', category: 'workflow-automation', icon: '✅', status: 'included' },

  // ── Collaboration & Hiring Team ─────────────────────────────────
  { id: 'team-collaboration',  title: 'Team Notes & @Mentions',       description: 'Leave notes on candidates, @mention colleagues, track all communication in one timeline.', category: 'collaboration', icon: '💬', status: 'included' },
  { id: 'interview-kits',      title: 'Structured Interview Kits',    description: 'Standardized scorecards with competency-based questions. Ensure consistent, fair evaluations.', category: 'collaboration', icon: '📋', status: 'included' },
  { id: 'hiring-manager-portal', title: 'Hiring Manager Portal',      description: 'Simplified view for hiring managers — review candidates, leave feedback, approve offers without ATS training.', category: 'collaboration', icon: '👤', status: 'included' },
  { id: 'mobile-app',          title: 'Mobile App',                   description: 'Full ATS on iOS and Android. Review candidates, leave notes, and manage pipeline from anywhere.', category: 'collaboration', icon: '📱', status: 'included' },

  // ── Offer Management & Compliance ──────────────────────────────
  { id: 'branded-offers',      title: 'Branded Offer Letters',        description: 'Beautiful, branded offer letters with dynamic fields. Template library for different role types.', category: 'offers-compliance', icon: '📜', status: 'included' },
  { id: 'e-signature',         title: 'E-Signature (Native)',         description: 'Built-in electronic signatures on offer letters. No DocuSign required (though DocuSign integration available).', category: 'offers-compliance', icon: '✍️', status: 'included' },
  { id: 'eeo-tracking',        title: 'EEO & OFCCP Tracking',        description: 'Voluntary self-identification collection. OFCCP-compliant reporting for federal contractors.', category: 'offers-compliance', icon: '📊', status: 'included' },
  { id: 'gdpr-compliance',     title: 'GDPR & Data Privacy',          description: 'Built-in consent management, data retention policies, right-to-be-forgotten automation. EU AI Act ready.', category: 'offers-compliance', icon: '🛡️', status: 'included' },
  { id: 'audit-trail',         title: 'Full Audit Trail',             description: 'Every action logged — who moved a candidate, when, why. Complete compliance trail for any audit.', category: 'offers-compliance', icon: '📝', status: 'included' },

  // ── Integrations & Core Infrastructure ─────────────────────────
  { id: 'hris-sync',           title: 'HRIS Integration',             description: 'Bi-directional sync with BambooHR, Workday, ADP, SAP SuccessFactors, and more. New hire data flows automatically.', category: 'integrations', icon: '🔄', status: 'included' },
  { id: 'calendar-sync',       title: 'Calendar Sync',                description: 'Native sync with Outlook, Google Calendar, and Microsoft Teams. Automatic availability detection.', category: 'integrations', icon: '📅', status: 'included' },
  { id: 'assessment-tools',    title: 'Assessment Integrations',      description: 'Pre-built connections to TestGorilla, Bryq, Alva Labs, and others. Results appear on the candidate card.', category: 'integrations', icon: '🧪', status: 'included' },
  { id: 'background-checks',   title: 'Background Check Integration', description: 'Initiate background checks from the candidate card. Results flow back into the pipeline automatically.', category: 'integrations', icon: '🔍', status: 'included' },
  { id: 'docusign',            title: 'DocuSign Integration',         description: 'Send offer letters via DocuSign directly from Teamtailor. Status tracked on the candidate card.', category: 'integrations', icon: '📎', status: 'included' },
  { id: 'slack-teams',         title: 'Slack & MS Teams',             description: 'Get notifications, review candidates, and take actions directly in Slack or Microsoft Teams.', category: 'integrations', icon: '💬', status: 'included' },
  { id: 'open-api',            title: 'Open API',                     description: 'Full REST API for custom integrations. Build anything you need on top of your ATS data.', category: 'integrations', icon: '🔧', status: 'included' },
  { id: 'sso',                 title: 'SSO & SCIM',                   description: 'SAML SSO with any provider. SCIM for automatic user provisioning and deprovisioning.', category: 'integrations', icon: '🔐', status: 'included' },

  // ── Analytics & Reporting ──────────────────────────────────────
  { id: 'analytics-dashboard',  title: 'Analytics Dashboard',         description: 'Real-time hiring metrics — time-to-hire, source performance, pipeline velocity, diversity stats.', category: 'analytics', icon: '📊', status: 'included' },
  { id: 'custom-reports',       title: 'Custom Reports',              description: 'Build and save custom reports with filters, date ranges, and export to CSV/PDF.', category: 'analytics', icon: '📈', status: 'included' },
  { id: 'source-tracking',      title: 'Source Tracking',             description: 'Know exactly where every candidate came from. Track ROI per source, board, and campaign.', category: 'analytics', icon: '🎯', status: 'included' },
  { id: 'dei-reporting',        title: 'DEI Reporting',               description: 'Diversity metrics across pipeline stages. Identify where underrepresented candidates drop off.', category: 'analytics', icon: '📊', status: 'included' },
];

// ── Helpers ──────────────────────────────────────────────────────────

export function getFeaturesByCategory(categoryId: string): Feature[] {
  return FEATURE_CATALOG.filter(f => f.category === categoryId);
}

export function getFeatureById(id: string): Feature | undefined {
  return FEATURE_CATALOG.find(f => f.id === id);
}

export function getCategoryById(id: string): FeatureCategory | undefined {
  return FEATURE_CATEGORIES.find(c => c.id === id);
}

/** Default features shown if the rep hasn't customized the selection */
export const DEFAULT_SOLUTION_FEATURES = [
  'ai-screening',
  'smart-move', 
  'career-site-builder',
  'self-scheduling',
  'ask-copilot',
  'interview-recording',
];
