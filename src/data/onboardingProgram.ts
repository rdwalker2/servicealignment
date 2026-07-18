export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  route?: string;
  enablementTab?: string;
  topicId?: string;
  externalUrl?: string;
  type?: 'reading' | 'quiz' | 'external' | 'interactive';
  icon: string;
  wikiIds?: string[];
}

export interface OnboardingModule {
  id: string;
  title: string;
  description: string;
  tasks: OnboardingTask[];
}

export interface OnboardingPhase {
  id: string;
  phase: number;
  title: string;
  subtitle: string;
  emoji: string;
  timeline: string;
  color: string;
  modules: OnboardingModule[];
  gate: {
    title: string;
    description: string;
  };
}

export interface OnboardingProgram {
  title: string;
  description: string;
  phases: OnboardingPhase[];
}

export const ONBOARDING_PROGRAM: OnboardingProgram = {
  title: 'AE Onboarding Launch Pad',
  description: 'Your 90-Day Launch Pad — everything you need to ramp into a top performer.',
  phases: [
    {
      id: 'phase-1',
      phase: 1,
      title: 'Foundation',
      subtitle: 'Company, product, methodology basics',
      emoji: '🏗️',
      timeline: 'Week 1-2',
      color: '#10b981', // emerald
      modules: [
        {
          id: 'p1-m1',
          title: 'Workspace Orientation',
          description: 'Get familiar with your command center',
          tasks: [
            { id: 'p1-m1-t1', title: 'Navigate the workspace sidebar', description: 'Understand layout', estimatedMinutes: 5, route: '/team/tracker', icon: 'Layout' },
            { id: 'p1-m1-t2', title: 'Review your Goals dashboard', description: 'See where targets live', estimatedMinutes: 10, route: '/team/goals', icon: 'Crosshair' },
            { id: 'p1-m1-t3', title: 'Explore your Analytics page', description: 'Understand metrics', estimatedMinutes: 10, route: '/team/analytics', icon: 'BarChart2' },
          ]
        },
        {
          id: 'p1-m-crm',
          title: 'Module 1.1b — CRM Hygiene & Tech Stack',
          description: 'Master your daily tools',
          tasks: [
            { id: 'p1-crm-t1', title: 'Salesforce Pipeline Management', description: 'Clean data saves deals', estimatedMinutes: 20, icon: 'Database', route: '/team/process/overview', topicId: 'sales-techstack' },
            { id: 'p1-crm-t2', title: 'Granola & Salesloft Best Practices', description: 'Communication platforms', estimatedMinutes: 20, icon: 'Mic', route: '/team/process/overview', topicId: 'sales-techstack' }
          ]
        },
        {
          id: 'p1-m2',
          title: 'Module 1.2 — Service Alignment Product Deep-Dive',
          description: 'Explore the core platform and Add-Ons',
          tasks: [
            { id: 'p1-m2-t1', title: 'Provider Core & Pipeline Automation', description: 'Triggers & Smart Move', estimatedMinutes: 30, route: '/team/wiki/product', icon: 'Layers' },
            { id: 'p1-m2-t2', title: 'AI Copilot & Smart Screening', description: 'Resume parsing & Video pitches', estimatedMinutes: 20, route: '/team/wiki/product', icon: 'Bot' },
            { id: 'p1-m2-t3', title: 'Candidate Communication & Nurture', description: 'Campaigns & SMS', estimatedMinutes: 20, route: '/team/wiki/product', icon: 'MessageSquare' },
            { id: 'p1-m2-t4', title: 'Smart Scheduling & Calendaring', description: 'Self-booking & Panels', estimatedMinutes: 15, route: '/team/wiki/product', icon: 'Calendar' },
            { id: 'p1-m2-t5', title: 'Career Site & Employer Branding', description: 'Connect widget & Page builder', estimatedMinutes: 25, route: '/team/wiki/product', icon: 'Layout' },
            { id: 'p1-m2-t6', title: 'Analytics & Reporting', description: 'Dashboards & Custom reports', estimatedMinutes: 20, route: '/team/wiki/product', icon: 'BarChart' },
            { id: 'p1-m2-t7', title: 'Developer APIs, Security & Compliance', description: 'Architecture & GDPR', estimatedMinutes: 20, route: '/team/wiki/product', icon: 'Shield' },
            { id: 'p1-m2-t8', title: 'Integrations & Job Board Promotion', description: 'Partner ecosystem', estimatedMinutes: 15, route: '/team/wiki/product', icon: 'Puzzle' }
          ]
        },
        {
          id: 'p1-m3',
          title: 'Module 1.3 — Post-Sale & CS Knowledge',
          description: 'Understand the customer lifecycle',
          tasks: [
            { id: 'p1-m3-t1', title: 'Onboarding Models: Digital vs CSM vs Enterprise', description: 'Implementation', estimatedMinutes: 20, route: '/team/wiki/cs', icon: 'Users', wikiIds: ['onboarding-digital-tier', 'onboarding-csm-standard', 'onboarding-enterprise'] },
            { id: 'p1-m3-t2', title: 'Pricing Policies & Discount Rules', description: 'Negotiation', estimatedMinutes: 15, route: '/team/wiki/cs', icon: 'DollarSign', wikiIds: ['price-caps-policy', 'free-months-policy', 'discount-ramp-off'] },
            { id: 'p1-m3-t3', title: 'Data Migration Best Practices', description: 'What we can/cannot migrate', estimatedMinutes: 20, route: '/team/wiki/cs', icon: 'Database' },
            { id: 'p1-m3-t4', title: 'Technical Implementation & SLAs', description: 'Timelines', estimatedMinutes: 15, route: '/team/wiki/cs', icon: 'Clock' },
            { id: 'p1-m3-t5', title: 'Sales-to-CS Handover Process', description: 'Rules of engagement', estimatedMinutes: 15, route: '/team/wiki/cs', icon: 'ArrowRight', wikiIds: ['sales-to-cs-handover'] },
          ],
        },
        {
          id: 'p1-m4',
          title: 'Sales Methodology Foundations',
          description: 'Learn how we sell',
          tasks: [
            { id: 'p1-m4-t1', title: 'Core Paradigm — Buyer-Centric Selling', description: 'Foundation', estimatedMinutes: 20, route: '/team/process/overview', topicId: 'overview', icon: 'BookOpen' },
            { id: 'p1-m4-t2', title: 'Buyer\'s Intent — Why Prospects Buy', description: 'Psychology', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'buyer-intent', icon: 'Target' },
            { id: 'p1-m4-t3', title: 'Push vs Pull — How to Sell Without Pushing', description: 'Approach', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'push-vs-pull', icon: 'ArrowLeftRight' },
            { id: 'p1-m4-t4', title: 'Date vs Doctor — Be the Doctor', description: 'Mindset', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'date-vs-doctor', icon: 'Stethoscope' },
            { id: 'p1-m4-t5', title: 'Five Fatalities — Deals That Die Early', description: 'Risks', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'five-fatalities', icon: 'AlertTriangle' },
            { id: 'p1-m4-t6', title: 'Three Checkpoints — Qualification Gates', description: 'Process', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'three-checkpoints', icon: 'CheckSquare' },
            { id: 'p1-m4-t7', title: 'BAP Framework — Scoring Buyer Readiness', description: 'Qualification', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'bap-framework', icon: 'Gauge' },
            { id: 'p1-m4-t8', title: 'Sales Stages & MEDDPICC Mapping', description: 'Process', estimatedMinutes: 20, route: '/team/process/overview', topicId: 'sales-stages', icon: 'GitBranch' },
            { id: 'p1-m4-t9', title: 'MEDDPICC', description: 'Qualification', estimatedMinutes: 20, route: '/team/process/overview', topicId: 'meddpicc', icon: 'Target' },
            { id: 'p1-m4-t16', title: 'The 8 Core USPs', description: 'Product Value', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'unique-selling-points', icon: 'Trophy' },
            { id: 'p1-m4-t12', title: 'Time Management', description: 'Productivity', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'time-management', icon: 'Clock' },
            { id: 'p1-m4-t13', title: 'Recruiting Basics', description: 'Industry Knowledge', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'recruiting-basics', icon: 'BookOpen' },
            { id: 'p1-m4-t14', title: 'Customer Types', description: 'Industry Knowledge', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'customer-types', icon: 'Building2' },
            { id: 'p1-m4-t15', title: 'Sales Techstack', description: 'Operations', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'sales-techstack', icon: 'Settings2' },
            { id: 'p1-m4-t17', title: 'Value Drivers', description: 'Money, Time, Risk', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'value-drivers', icon: 'Trophy' },
            { id: 'p1-m4-t18', title: 'FAB Framework', description: 'Value Selling', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'fab-framework', icon: 'Lightbulb' },
          ]
        },
        {
          id: 'p1-m5',
          title: 'Rep Workbook Self-Study',
          description: 'Review methodology concepts',
          tasks: [
            { id: 'p1-m5-t1', title: 'Methodology Quick Reference', description: 'Review the Sales Playbook Core Paradigm', estimatedMinutes: 30, route: '/team/process/overview', icon: 'Notebook' },
          ]
        },
        {
          id: 'p1-m6',
          title: 'Week 1 & 2 Daily Quizzes',
          description: 'Test your knowledge',
          tasks: [
            { id: 'p1-q1', title: 'Week 1 - Day 1 Quiz', description: 'Knowledge Check', estimatedMinutes: 5, type: 'quiz', externalUrl: 'https://kahoot.it/solo?quizId=b3dab34f-cd75-4f67-a088-b1c63f087a7e', icon: 'CheckCircle2' },
            { id: 'p1-q2', title: 'Week 1 - Day 2 Quiz', description: 'Knowledge Check', estimatedMinutes: 5, type: 'quiz', externalUrl: 'https://kahoot.it/solo?quizId=e533b5fc-0415-4156-8868-5ae4eaae9aa2', icon: 'CheckCircle2' },
            { id: 'p1-q3', title: 'Week 1 - Day 3 Quiz', description: 'Knowledge Check', estimatedMinutes: 5, type: 'quiz', externalUrl: 'https://kahoot.it/solo?quizId=1545c5fd-22ae-4a21-ad2d-678ad90c19a1', icon: 'CheckCircle2' },
            { id: 'p1-q4', title: 'Week 1 - Day 4 Quiz', description: 'Knowledge Check', estimatedMinutes: 5, type: 'quiz', externalUrl: 'https://kahoot.it/solo?quizId=ec0eb51b-2336-42c5-9dd0-46ace894dfaf', icon: 'CheckCircle2' },
            { id: 'p1-q5', title: 'Week 2 - Day 1 Quiz', description: 'Knowledge Check', estimatedMinutes: 5, type: 'quiz', externalUrl: 'https://kahoot.it/solo?quizId=4110a686-ec51-4737-83ec-5cab4ec4f922', icon: 'CheckCircle2' },
            { id: 'p1-q6', title: 'Week 2 - Day 2 Quiz', description: 'Knowledge Check', estimatedMinutes: 5, type: 'quiz', externalUrl: 'https://kahoot.it/solo?quizId=ea687898-d370-41bc-9596-a6f746acb18d', icon: 'CheckCircle2' },
            { id: 'p1-q7', title: 'Week 2 - Day 3 Quiz', description: 'Knowledge Check', estimatedMinutes: 5, type: 'quiz', externalUrl: 'https://kahoot.it/solo?quizId=117368db-bfa9-458a-ae8f-5f6567f3708b', icon: 'CheckCircle2' },
            { id: 'p1-q8', title: 'Week 2 - Day 4 Quiz', description: 'Knowledge Check', estimatedMinutes: 5, type: 'quiz', externalUrl: 'https://kahoot.it/solo?quizId=c8aa73ab-a2d3-4aab-b3a9-63f7bdc36a85', icon: 'CheckCircle2' },
          ]
        }
      ],
      gate: {
        title: 'Methodology Certification',
        description: '1:1 with your manager to discuss the Core Paradigm, 5 Fatalities, 3 Checkpoints, and BAP Framework. Be ready to explain each in your own words.'
      }
    },
    {
      id: 'phase-2',
      phase: 2,
      title: 'Prospecting & Discovery',
      subtitle: 'Outbound engine, call frameworks, D1-D2',
      emoji: '🎯',
      timeline: 'Week 3-4',
      color: '#3b82f6', // blue
      modules: [
        {
          id: 'p2-m1',
          title: 'Prospecting Fundamentals',
          description: 'Building pipeline',
          tasks: [
            { id: 'p2-m1-t1', title: 'Three Waves & Call Trees — Prospecting Overview', description: 'Playbook', estimatedMinutes: 25, route: '/team/process/overview', topicId: 'prospecting-overview', icon: 'Phone' },
            { id: 'p2-m1-t2', title: 'Proven Scripts — Copy-Ready Outbound Scripts', description: 'Playbook', estimatedMinutes: 20, route: '/team/process/overview', topicId: 'proven-scripts', icon: 'FileText' },
            { id: 'p2-m1-t3', title: 'Hiring Stack Audit — Research Before the Call', description: 'Playbook', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'hiring-stack-audit', icon: 'Search' },
            { id: 'p2-m1-t4', title: 'Call Decision Trees — Branching Conversation Paths', description: 'Playbook', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'call-decision-trees', icon: 'GitBranch' },
            { id: 'p2-m1-t5', title: 'Ideal Customer Profile (ICP)', description: 'Targeting', estimatedMinutes: 20, route: '/team/process/overview', topicId: 'icp-pains', icon: 'Target' },
            { id: 'p2-m1-t7', title: 'ICP & Pains', description: 'Positioning against alternatives', estimatedMinutes: 20, route: '/team/process/overview', topicId: 'icp-pains', icon: 'ShieldAlert' },
          ]
        },
        {
          id: 'p2-m2',
          title: 'Cold Calling Mastery',
          description: 'Execution',
          tasks: [
            { id: 'p2-m2-t1', title: 'Three Waves Cold Call Framework', description: 'Framework', estimatedMinutes: 30, route: '/enablement/cold-call-playbook', icon: 'Phone' },
            { id: 'p2-m2-t2', title: 'The HRIS Wedge Play', description: 'Tactic', estimatedMinutes: 15, route: '/enablement/cold-call-playbook', icon: 'Zap' },
            { id: 'p2-m2-t3', title: 'Common Objections & Rebuttals', description: 'Objection Handling', estimatedMinutes: 20, route: '/enablement/cold-call-playbook', icon: 'Shield' },
            { id: 'p2-m2-t4', title: 'Golden Minute', description: 'Playbook', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'golden-minute', icon: 'MessageSquare' }
          ]
        },
        {
          id: 'p2-m3',
          title: 'Setting the Meeting',
          description: 'Interactive simulator',
          tasks: [
            { id: 'p2-m3-t1', title: 'Practice the interactive decision-tree simulator', description: 'All personas', estimatedMinutes: 30, route: '/enablement/setting-the-meeting', icon: 'MessageSquare' },
          ]
        },
        {
          id: 'p2-m4',
          title: 'Outreach Cadence',
          description: 'Multi-channel sequences',
          tasks: [
            { id: 'p2-m4-t1', title: 'Study the 21-Day Multi-Channel Cadence', description: 'Strategy', estimatedMinutes: 15, route: '/enablement/outreach-cadence', icon: 'Mail' },
            { id: 'p2-m4-t2', title: 'Review email templates', description: 'Customize for your voice', estimatedMinutes: 20, route: '/enablement/outreach-cadence', icon: 'Edit' },
          ]
        },
        {
          id: 'p2-m5',
          title: 'Cadence Architecture',
          description: 'Deep dive',
          tasks: [
            { id: 'p2-m5-t1', title: 'Deep-dive on Cadence Strategy', description: 'Playbook', estimatedMinutes: 25, route: '/team/process/overview', topicId: 'cadence-strategy', icon: 'Calendar' },
          ]
        },
        {
          id: 'p2-m6',
          title: 'D1: Discovery Deep-Dive',
          description: 'Initial discovery',
          tasks: [
            { id: 'p2-m6-t1', title: 'D1 Overview — Be the Detective', description: 'Playbook', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'd1-overview', icon: 'Search' },
            { id: 'p2-m6-t2', title: 'Taking Leadership on the Call', description: 'Playbook', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'urgency-leadership', icon: 'Crown' },
            { id: 'p2-m6-t3', title: 'Buyer\'s Objective & Decision Makers', description: 'Discovery', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'urgency-objective', icon: 'Users' },
            { id: 'p2-m6-t4', title: 'Current Reality & Business Pain', description: 'Discovery', estimatedMinutes: 20, route: '/team/process/overview', topicId: 'urgency-business-pain', icon: 'AlertCircle' },
            { id: 'p2-m6-t5', title: 'PRePCo & AXNOT Frameworks', description: 'Agenda Setting', estimatedMinutes: 20, route: '/team/process/overview', topicId: 'prepco', icon: 'ClipboardCheck' },
            { id: 'p2-m6-t6', title: 'Inverted Pyramid', description: 'Digging Deep', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'inverted-pyramid', icon: 'GitFork' }
          ]
        },
        {
          id: 'p2-m7',
          title: 'Persona Mastery',
          description: 'Know your audience',
          tasks: [
            { id: 'p2-m7-t1', title: 'VP HR Discovery Sheet', description: 'Study persona', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'sheet-vphr', icon: 'UserCheck' },
            { id: 'p2-m7-t2', title: 'TA Director Discovery Sheet', description: 'Study persona', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'sheet-ta-director', icon: 'UserCheck' },
            { id: 'p2-m7-t3', title: 'People Ops Discovery Sheet', description: 'Study persona', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'sheet-people-ops', icon: 'UserCheck' },
            { id: 'p2-m7-t4', title: 'Office Manager (SMB) Discovery Sheet', description: 'Study persona', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'sheet-smb', icon: 'UserCheck' },
            { id: 'p2-m7-t5', title: 'CHRO / Executive Talent Discovery Sheet', description: 'Executive persona', estimatedMinutes: 20, route: '/team/process/overview', topicId: 'sheet-chro', icon: 'Crown' },
            { id: 'p2-m7-t6', title: 'CEO / Founder Discovery Sheet', description: 'Executive persona', estimatedMinutes: 20, route: '/team/process/overview', topicId: 'sheet-ceo', icon: 'Crown' },
            { id: 'p2-m7-t7', title: 'CFO / Finance Discovery Sheet', description: 'Executive persona', estimatedMinutes: 20, route: '/team/process/overview', topicId: 'sheet-cfo', icon: 'Crown' }
          ]
        },
        {
          id: 'p2-m8',
          title: 'D2: Diagnosis Deep-Dive',
          description: 'Uncovering the gap',
          tasks: [
            { id: 'p2-m8-t1', title: 'D2 Overview — Be the Doctor', description: 'Playbook', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'd2-overview', icon: 'Stethoscope' },
            { id: 'p2-m8-t2', title: 'Handling Other Vendors', description: 'Playbook', estimatedMinutes: 20, route: '/team/process/overview', topicId: 'gap-other-vendors', icon: 'Shield' },
            { id: 'p2-m8-t3', title: 'Problem Diagnosis', description: 'Playbook', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'gap-problem-diagnosis', icon: 'Microscope' },
            { id: 'p2-m8-t4', title: 'Buying Process, Budget & Timeline', description: 'Playbook', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'gap-buying-process', icon: 'Clock' },
          ]
        },
        {
          id: 'p2-m-roleplay',
          title: 'Roleplay Scenarios',
          description: 'Live practice',
          tasks: [
            { id: 'p2-rp-t1', title: 'Cold Call Roleplay with Manager', description: 'Practice', estimatedMinutes: 30, icon: 'Phone', route: '/enablement/cold-call-playbook' },
            { id: 'p2-rp-t2', title: 'D1 Discovery Mock Call', description: 'Practice', estimatedMinutes: 45, icon: 'Users', route: '/team/process/overview', topicId: 'd1-overview' },
            { id: 'p2-rp-t3', title: 'Demo (D3) Sandbox Practice', description: 'Practice', estimatedMinutes: 60, icon: 'Monitor', route: '/team/process/overview', topicId: 'd3-overview' }
          ]
        },
        {
          id: 'p2-m9',
          title: 'Week 3 & 4 Daily Quizzes',
          description: 'Test your knowledge',
          tasks: [
            { id: 'p2-q1', title: 'Week 3 - Day 1 Quiz', description: 'Knowledge Check', estimatedMinutes: 5, type: 'quiz', externalUrl: 'https://kahoot.it/solo?quizId=e55a5888-c7e4-44a8-8c32-2314af3ffdf6', icon: 'CheckCircle2' },
            { id: 'p2-q2', title: 'Week 3 - Day 2 Quiz', description: 'Knowledge Check', estimatedMinutes: 5, type: 'quiz', externalUrl: 'https://kahoot.it/solo?quizId=3657df72-f9de-4537-baad-57b972e698d1', icon: 'CheckCircle2' },
            { id: 'p2-q3', title: 'Week 3 - Day 3 Quiz', description: 'Knowledge Check', estimatedMinutes: 5, type: 'quiz', externalUrl: 'https://kahoot.it/solo?quizId=f753d934-248e-41a3-bf27-94c70f095899', icon: 'CheckCircle2' },
            { id: 'p2-q4', title: 'Week 3 - Day 4 Quiz', description: 'Knowledge Check', estimatedMinutes: 5, type: 'quiz', externalUrl: 'https://kahoot.it/solo?quizId=7462b6bf-1e0c-4797-a451-232d44a1fae1', icon: 'CheckCircle2' },
            { id: 'p2-q5', title: 'Week 4 - Day 1 Quiz', description: 'Knowledge Check', estimatedMinutes: 5, type: 'quiz', externalUrl: 'https://kahoot.it/solo?quizId=6133b93f-6856-4f9d-a42e-99d1855d9528', icon: 'CheckCircle2' },
            { id: 'p2-q6', title: 'Week 4 - Day 2 Quiz', description: 'Knowledge Check', estimatedMinutes: 5, type: 'quiz', externalUrl: 'https://kahoot.it/solo?quizId=ac28133a-098e-4e36-8c0f-25330ed6a67e', icon: 'CheckCircle2' },
            { id: 'p2-q7', title: 'Week 4 - Day 3 Quiz', description: 'Knowledge Check', estimatedMinutes: 5, type: 'quiz', externalUrl: 'https://kahoot.it/solo?quizId=47e7e97d-244f-40c2-8c3b-8b7310b24055', icon: 'CheckCircle2' },
            { id: 'p2-q8', title: 'Week 4 - Day 4 Quiz', description: 'Knowledge Check', estimatedMinutes: 5, type: 'quiz', externalUrl: 'https://kahoot.it/solo?quizId=a33fbb33-2cc4-4d97-828f-5b6fb3aa8990', icon: 'CheckCircle2' },
          ]
        }
      ],
      gate: {
        title: 'Prospecting Readiness',
        description: 'Shadow 3 live discovery calls with a teammate. Debrief each call with your manager identifying D1/D2 execution.'
      }
    },
    {
      id: 'phase-3',
      phase: 3,
      title: 'Solution & Close',
      subtitle: 'D3-D4, deal rooms, competitive',
      emoji: '💎',
      timeline: 'Week 5-8',
      color: '#8b5cf6', // violet
      modules: [
        {
          id: 'p3-m-mentor',
          title: 'Mentorship Program',
          description: 'Learn from the best',
          tasks: [
            { id: 'p3-ment-t1', title: 'Shadow 5 Live D1/D2 Calls', description: 'Shadowing', estimatedMinutes: 150, icon: 'Headphones', route: '/team/process/overview', topicId: 'd1-overview' }
          ]
        },
        {
          id: 'p3-m1',
          title: 'D3: Solution Mapping',
          description: 'Presenting the solution',
          tasks: [
            { id: 'p3-m1-t1', title: 'D3 Overview — Show, Don\'t Tell', description: 'Playbook', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'd3-overview', icon: 'Monitor' },
            { id: 'p3-m1-t2', title: 'Proven Results & Case Studies', description: 'Playbook', estimatedMinutes: 20, route: '/team/process/overview', topicId: 'solution-proven-results', icon: 'Award' },
            { id: 'p3-m1-t3', title: 'Clear Solution Mapping', description: 'Strategy', estimatedMinutes: 20, route: '/team/process/overview', topicId: 'solution-clear-solution', icon: 'CheckCircle' },
            { id: 'p3-m1-t4', title: 'Timeline & Price Presentation', description: 'Strategy', estimatedMinutes: 20, route: '/team/process/overview', topicId: 'solution-timeline-price', icon: 'DollarSign' }
          ]
        },
        {
          id: 'p3-m2',
          title: 'D4: Closing',
          description: 'Getting the win',
          tasks: [
            { id: 'p3-m2-t1', title: 'D4 Overview — The Confirmation Close', description: 'Playbook', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'd4-overview', icon: 'Flag' },
            { id: 'p3-m2-t2', title: 'Confirmation Close — 5 Alignment Checks', description: 'Playbook', estimatedMinutes: 25, route: '/team/process/overview', topicId: 'confirmation-close', icon: 'CheckSquare' },
            { id: 'p3-m2-t3', title: 'DOA Proposals — Avoiding Dead Proposals', description: 'Playbook', estimatedMinutes: 15, route: '/team/process/overview', topicId: 'doa-proposals', icon: 'AlertTriangle' },
            { id: 'p3-m2-t4', title: 'BAMFAM', description: 'Playbook', estimatedMinutes: 10, route: '/team/process/overview', topicId: 'bamfam', icon: 'Clock' },
          ]
        },
        {
          id: 'p3-m3',
          title: 'Master Script',
          description: 'End-to-end flow',
          tasks: [
            { id: 'p3-m3-t1', title: 'Study the Full Master Script (D1→D4)', description: 'Playbook', estimatedMinutes: 45, route: '/team/process/overview', topicId: 'master-script', icon: 'FileText' },
          ]
        },
        {
          id: 'p3-m4',
          title: 'Competitive Intelligence',
          description: 'Know the enemy',
          tasks: [
            { id: 'p3-m4-t1', title: 'Greenhouse Battlecard', description: 'Battlecards', estimatedMinutes: 15, route: '/team/wiki/competitors', icon: 'Swords' },
            { id: 'p3-m4-t2', title: 'Lever Battlecard', description: 'Battlecards', estimatedMinutes: 15, route: '/team/wiki/competitors', icon: 'Swords' },
            { id: 'p3-m4-t3', title: 'BambooHR Battlecard', description: 'Battlecards', estimatedMinutes: 15, route: '/team/wiki/competitors', icon: 'Swords' },
            { id: 'p3-m4-t4', title: 'ADP Workforce Now Battlecard', description: 'Battlecards', estimatedMinutes: 15, route: '/team/wiki/competitors', icon: 'Swords' },
            { id: 'p3-m4-t5', title: 'Workable Battlecard', description: 'Battlecards', estimatedMinutes: 10, route: '/team/wiki/competitors', icon: 'Swords' },
          ]
        },
        {
          id: 'p3-m5',
          title: 'Operational Playbooks',
          description: 'Demonstrating value',
          tasks: [
            { id: 'p3-m5-t1', title: 'Playbook 1: Auto-Screen & Fast-Track Top Candidates', description: 'Triggers', estimatedMinutes: 15, route: '/enablement/operational-playbooks', icon: 'Zap' },
            { id: 'p3-m5-t2', title: 'Playbook 2: Never Lose a Silver Medalist Again', description: 'Nurture', estimatedMinutes: 15, route: '/enablement/operational-playbooks', icon: 'Heart' },
            { id: 'p3-m5-t3', title: 'Playbook 3: Get Hiring Managers to Review Candidates', description: 'Collaboration', estimatedMinutes: 15, route: '/enablement/operational-playbooks', icon: 'Users' },
            { id: 'p3-m5-t4', title: 'Playbook 4: Automate Assessments', description: 'Integrations', estimatedMinutes: 15, route: '/enablement/operational-playbooks', icon: 'CheckSquare' },
            { id: 'p3-m5-t5', title: 'Playbook 5: Build a Career Site That Sells', description: 'Brand', estimatedMinutes: 15, route: '/enablement/operational-playbooks', icon: 'Layout' },
            { id: 'p3-m5-t6', title: 'Playbook 6: Standardize Hiring With Job Templates', description: 'Consistency', estimatedMinutes: 15, route: '/enablement/operational-playbooks', icon: 'Copy' },
            { id: 'p3-m5-t7', title: 'Playbook 7: Hire-to-Onboard in One Click With ADP', description: 'Integrations', estimatedMinutes: 15, route: '/enablement/operational-playbooks', icon: 'ArrowRight' },
            { id: 'p3-m5-t8', title: 'Playbook 8: Manage High Volume Seasonal Hiring', description: 'Volume', estimatedMinutes: 15, route: '/enablement/operational-playbooks', icon: 'Users' },
            { id: 'p3-m5-t9', title: 'Playbook 9: Build a Diverse Talent Pool', description: 'Diversity', estimatedMinutes: 15, route: '/enablement/operational-playbooks', icon: 'Globe' }
          ]
        },
        {
          id: 'p3-m6',
          title: 'Deal Room Mastery',
          description: 'CMS Workspace',
          tasks: [
            { id: 'p3-m6-t1', title: 'Explore the Deal Room / CMS Workspace', description: 'Pipeline', estimatedMinutes: 20, route: '/team/pipeline', icon: 'Kanban' },
          ]
        }
      ],
      gate: {
        title: 'Demo & Close Certification',
        description: 'Deliver a full mock demo (D3) + Confirmation Close (D4) with your manager playing the prospect. Must hit all 5 Alignment Checks.'
      }
    },
    {
      id: 'phase-4',
      phase: 4,
      title: 'Full Cycle Mastery',
      subtitle: 'Pipeline management, advanced plays',
      emoji: '🚀',
      timeline: 'Week 9-12',
      color: '#f59e0b', // amber
      modules: [
        {
          id: 'p4-m1',
          title: 'Pipeline Management',
          description: 'Managing your book',
          tasks: [
            { id: 'p4-m1-t1', title: 'Master the Pipeline Board — Stages & Hygiene', description: 'Pipeline', estimatedMinutes: 20, route: '/team/pipeline', icon: 'Kanban' },
            { id: 'p4-m1-t2', title: 'Pipeline Doctor — Funnel Diagnostics', description: 'Diagnostics', estimatedMinutes: 25, route: '/enablement/pipeline-doctor', icon: 'Stethoscope' },
          ]
        },
        {
          id: 'p4-m2',
          title: 'Closed Lost Analysis',
          description: 'Learning from losses',
          tasks: [
            { id: 'p4-m2-t1', title: 'Study the Closed Lost Audit tool', description: 'Audit', estimatedMinutes: 20, route: '/team/lost', icon: 'TrendingDown' },
          ]
        },
        {
          id: 'p4-m3',
          title: 'Signals & Territory',
          description: 'Finding targets',
          tasks: [
            { id: 'p4-m3-t1', title: 'Signal Board — Reading Account Signals', description: 'Signals', estimatedMinutes: 15, route: '/team/signals', icon: 'Zap' },
            { id: 'p4-m3-t2', title: 'Territory Map — Prioritizing Your Patch', description: 'Territory', estimatedMinutes: 15, route: '/team/territory-map', icon: 'Map' },
          ]
        },
        {
          id: 'p4-m4',
          title: 'Advanced Competitive',
          description: 'Deep cuts',
          tasks: [
            { id: 'p4-m4-t1', title: 'Ashby Battlecard', description: 'Defeating modern Provider', estimatedMinutes: 15, route: '/team/wiki/competitors', icon: 'Swords' },
            { id: 'p4-m4-t2', title: 'Workday Recruiting Battlecard', description: 'Defeating ERPs', estimatedMinutes: 20, route: '/team/wiki/competitors', icon: 'Swords' },
            { id: 'p4-m4-t3', title: 'Rippling Battlecard', description: 'Defeating all-in-ones', estimatedMinutes: 15, route: '/team/wiki/competitors', icon: 'Swords' },
            { id: 'p4-m4-t4', title: 'Oracle Taleo Battlecard', description: 'Defeating legacy Provider', estimatedMinutes: 20, route: '/team/wiki/competitors', icon: 'Swords' },
            { id: 'p4-m4-t5', title: 'Jobvite Battlecard', description: 'Defeating legacy Provider', estimatedMinutes: 15, route: '/team/wiki/competitors', icon: 'Swords' },
            { id: 'p4-m4-t6', title: 'Paylocity & isolved Battlecard', description: 'Defeating payroll bundles', estimatedMinutes: 20, route: '/team/wiki/competitors', icon: 'Swords' },
            { id: 'p4-m4-t7', title: 'Pinpoint & BreezyHR Battlecards', description: 'Defeating SMB point solutions', estimatedMinutes: 15, route: '/team/wiki/competitors', icon: 'Swords' }
          ]
        },
        {
          id: 'p4-m5',
          title: 'Goal Setting & Rhythm',
          description: 'Building habits',
          tasks: [
            { id: 'p4-m5-t1', title: 'Set your first quota-period goals', description: 'Goals', estimatedMinutes: 15, route: '/team/goals', icon: 'Crosshair' },
            { id: 'p4-m5-t2', title: 'Master the Weekly Tracker — Build your daily rhythm', description: 'Habits', estimatedMinutes: 15, route: '/team/tracker', icon: 'Home' },
          ]
        }
      ],
      gate: {
        title: 'Full Ramp Graduation 🎓',
        description: 'Complete a full ramp review with your manager: mock deal walkthrough (D1→D4), pipeline review, and territory prioritization strategy.'
      }
    }
  ]
};

export function getTotalTaskCount(): number {
  return ONBOARDING_PROGRAM.phases.reduce(
    (total, phase) => total + phase.modules.reduce((modTotal, mod) => modTotal + mod.tasks.length, 0),
    0
  );
}

export function getAllTaskIds(): string[] {
  const ids: string[] = [];
  for (const phase of ONBOARDING_PROGRAM.phases) {
    for (const mod of phase.modules) {
      for (const task of mod.tasks) {
        ids.push(task.id);
      }
    }
  }
  return ids;
}
