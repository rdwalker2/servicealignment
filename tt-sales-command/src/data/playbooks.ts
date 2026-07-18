// ============================================================
// Playbooks — Full Sales Playbook Data
// 9 pre-built playbooks with complete content extracted from
// the presentation HTML for use in the sales command center.
// ============================================================

export interface PlaybookStep {
  navPath?: string;
  title: string;
  description: string;
  proTip?: string;
}

export interface PlaybookFlow {
  icon: string;
  label: 'Stage' | 'Trigger' | 'Result';
  name: string;
}

export interface PlaybookNeed {
  icon: string;
  name: string;
  type: 'core' | 'integration';
}

export interface PlaybookMetric {
  value: string;
  label: string;
}

export interface PlaybookSpotlight {
  feature: string;
  description: string;
}

export interface Playbook {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  personas: string[];
  setupTime: string;
  features: string[];
  demoAreaIds: string[];
  automationFlow: PlaybookFlow[];
  beforeList: string[];
  afterList: string[];
  needs: PlaybookNeed[];
  steps: PlaybookStep[];
  spotlights: PlaybookSpotlight[];
  results: {
    metrics: PlaybookMetric[];
    caseStudy: { company: string; result: string };
  };
}

export const PLAYBOOKS: Playbook[] = [
  // ──────────────────────────────────────────────
  // 1. Auto-Screen & Fast-Track
  // ──────────────────────────────────────────────
  {
    id: 'playbook-auto-screen',
    title: 'Auto-Screen & Fast-Track Top Candidates in Minutes',
    subtitle:
      'Set up a hands-free pipeline where qualified candidates are automatically screened, notified, and booked for interviews — before you even open your inbox.',
    description:
      'Stop spending hours reviewing applications manually. Set up auto-screening that instantly advances qualified candidates and books their interviews.',
    personas: ['Recruiters'],
    setupTime: '10 min',
    features: ['Smart Move', 'Triggers', 'Smart Schedule'],
    demoAreaIds: ['ai'],
    automationFlow: [
      { icon: '📥', label: 'Stage', name: 'Application Received' },
      { icon: '⚡', label: 'Trigger', name: 'Smart Move (auto-screen)' },
      { icon: '✅', label: 'Stage', name: 'Screening Passed' },
      { icon: '⚡', label: 'Trigger', name: 'Send Message + Smart Schedule' },
      { icon: '📅', label: 'Result', name: 'Interview Booked Automatically' },
    ],
    beforeList: [
      'Manually review every application (30+ min/day)',
      'Copy-paste the same "moving forward" email',
      '5+ back-and-forth emails to schedule one interview',
      'Qualified candidates wait days for a response',
      'Top talent drops off to faster-moving competitors',
    ],
    afterList: [
      'Candidates auto-screened on application questions',
      'Qualified candidates notified instantly',
      'Interview self-booked via Smart Schedule link',
      'Zero recruiter touch-time until interview day',
      'Response time drops from days to seconds',
    ],
    needs: [
      { icon: '⚡', name: 'Smart Move', type: 'core' },
      { icon: '📨', name: 'Triggers (Send Message)', type: 'core' },
      { icon: '📅', name: 'Smart Schedule', type: 'core' },
      { icon: '📆', name: 'Google Calendar / Outlook', type: 'integration' },
    ],
    steps: [
      {
        navPath: 'Job → Pipeline → Edit Stages',
        title: 'Set up your screening questions',
        description:
          'Navigate to your job\'s application form and add the key qualifying questions — experience level, required skills, availability, location, etc. These answers will power your auto-screening.',
        proTip:
          'Use required multiple-choice questions for the criteria that matter most. Open-text questions are harder to auto-screen.',
      },
      {
        navPath: 'Job → Triggers → Add Trigger',
        title: 'Create a Smart Move trigger on the "New" stage',
        description:
          'Add a Smart Move trigger that fires when a candidate enters the "New" stage. Set your criteria: candidates who answer your screening questions correctly (e.g., "3+ years experience" = Yes) are automatically moved to the "Screened" stage. You can stack multiple criteria — candidates must match ALL conditions to advance.',
      },
      {
        navPath: 'Job → Triggers → "Screened" Stage',
        title: 'Add a Send Message trigger on "Screened"',
        description:
          'When a candidate passes auto-screening and lands in "Screened," trigger an automatic email: congratulate them on moving forward, set expectations for next steps, and include any prep materials. Use merge tags (candidate name, job title, company name) to personalize at scale.',
      },
      {
        navPath: 'Job → Triggers → "Interview" Stage',
        title: 'Add a Smart Schedule trigger on "Interview"',
        description:
          'Connect your team\'s calendars and add a Smart Schedule trigger on the "Interview" stage. When candidates are moved here (manually or via another trigger), they automatically receive a booking link that shows only slots where all required interviewers are available. Candidate picks their slot → interview confirmed → calendar invite sent to everyone. Zero email tennis.',
      },
      {
        title: 'Test the full flow with a sample application',
        description:
          'Submit a test application with answers that match your Smart Move criteria. Watch it auto-advance to "Screened," fire the message trigger, and (once moved to Interview) send the Smart Schedule link. The whole pipeline should run without you touching anything.',
      },
    ],
    spotlights: [
      {
        feature: 'Smart Move',
        description:
          'Smart Move automatically advances (or rejects) candidates based on their application answers, resume keywords, tags, or location. Think of it as an always-on screener that works instantly — even at 2 AM on a Sunday.',
      },
      {
        feature: 'Smart Schedule',
        description:
          'Smart Schedule syncs with your team\'s calendars and finds overlapping availability across all required participants. Candidates self-book from a branded scheduling page — no Calendly needed, no back-and-forth.',
      },
    ],
    results: {
      metrics: [
        { value: '58%', label: 'Less time spent on screening' },
        { value: '<5min', label: 'Average response to qualified candidates' },
        { value: '2.3x', label: 'More interviews booked per week' },
      ],
      caseStudy: {
        company: 'Real Result: Lotus cut time-to-hire from 55 to 23 days',
        result:
          'By implementing automation triggers, Smart Schedule, and structured interview workflows — eliminating manual handoffs that were adding weeks to every hire.',
      },
    },
  },

  // ──────────────────────────────────────────────
  // 2. Silver Medalist
  // ──────────────────────────────────────────────
  {
    id: 'playbook-silver-medalist',
    title: 'Never Lose a Silver Medalist Again',
    subtitle:
      'Your best runners-up vanish after rejection — only to resurface at competitors. Automatically tag, nurture, and re-engage top talent so they\'re ready when your next role opens.',
    description:
      'Great finalists who didn\'t get the offer disappear forever — and you re-source from scratch next time. Automatically nurture them back into your pipeline.',
    personas: ['TA Leaders', 'Recruiters'],
    setupTime: '15 min',
    features: ['Nurture Campaigns', 'Tags', 'Triggers'],
    demoAreaIds: ['candidate'],
    automationFlow: [
      { icon: '🥈', label: 'Stage', name: 'Rejected (Final Round)' },
      { icon: '⚡', label: 'Trigger', name: 'Tag "Silver Medalist"' },
      { icon: '⚡', label: 'Trigger', name: 'Add to Nurture Campaign' },
      { icon: '🔄', label: 'Result', name: 'Warm Pipeline On Demand' },
    ],
    beforeList: [
      'Final-round candidates get a rejection and disappear',
      'Next time you hire, you start from zero',
      'Sourcing costs repeat every single req',
      'Great talent goes to your competitors',
      'No system for staying in touch',
    ],
    afterList: [
      'Top runners-up tagged and tracked automatically',
      'Personalized nurture sequence keeps them warm',
      'They auto-exit nurture if they apply again',
      'Next hire? Check your Silver Medalists first',
      'Reduce sourcing costs by 30-50%',
    ],
    needs: [
      { icon: '🏷️', name: 'Tags', type: 'core' },
      { icon: '📧', name: 'Nurture Campaigns', type: 'core' },
      { icon: '⚡', name: 'Triggers', type: 'core' },
      { icon: '👥', name: 'Talent Pools', type: 'core' },
    ],
    steps: [
      {
        navPath: 'Settings → Tags → Create Tag',
        title: 'Create a "Silver Medalist" tag',
        description:
          'Go to Settings → Tags and create a new tag called "Silver Medalist" (or "Top Runner-Up"). This tag will be automatically applied to candidates who made it to the final round but weren\'t selected — creating a searchable, filterable talent pool.',
      },
      {
        navPath: 'Nurture → New Campaign',
        title: 'Build a 3-touch nurture campaign',
        description:
          'Create a nurture campaign with three personalized touchpoints designed to keep your Silver Medalists warm and engaged with your employer brand:',
      },
      {
        navPath: 'Nurture → Campaign Settings → Exit Conditions',
        title: 'Set smart exit conditions',
        description:
          'Configure the campaign to auto-remove candidates if they: (1) reply to any nurture email, or (2) apply for a new job. This prevents awkward messaging overlap and keeps the experience professional.',
      },
      {
        navPath: 'Job → Triggers → Rejection Stage',
        title: 'Add Tag + Nurture triggers on your rejection stage',
        description:
          'On your final-round rejection stage, add two triggers: (1) Tag as "Silver Medalist", and (2) Add to your nurture campaign. Now every strong candidate who doesn\'t get the offer is automatically enrolled — zero manual work.',
      },
      {
        navPath: 'Nurture → Dashboard',
        title: 'Monitor engagement in your nurture dashboard',
        description:
          'Track open rates, reply rates, and re-application rates. Your Silver Medalist pool becomes a living, warm talent pipeline that you can tap any time a new role opens — often filling positions in days instead of weeks.',
      },
    ],
    spotlights: [
      {
        feature: 'Nurture Campaigns',
        description:
          'Nurture Campaigns are automated, personalized email sequences with configurable wait times between touchpoints. The magic: candidates are auto-removed from the campaign if they reply or apply for a new job — so you never send an awkward follow-up to someone already in your pipeline.',
      },
    ],
    results: {
      metrics: [
        { value: '40%', label: 'Reduction in sourcing costs' },
        { value: '3x', label: 'Faster time-to-fill for repeat roles' },
        { value: '62%', label: 'Nurture email open rate (avg)' },
      ],
      caseStudy: {
        company: '',
        result: '',
      },
    },
  },

  // ──────────────────────────────────────────────
  // 3. Hiring Manager Collaboration
  // ──────────────────────────────────────────────
  {
    id: 'playbook-hiring-manager',
    title: 'Get Hiring Managers to Actually Review Candidates',
    subtitle:
      'Hiring managers are your biggest bottleneck. Automate candidate sharing, review reminders, and feedback deadlines so nothing sits in limbo.',
    description:
      'Hiring managers are bottlenecks — they don\'t review candidates on time and slow everything down. Automate sharing, reminders, and accountability.',
    personas: ['Recruiters', 'Hiring Managers'],
    setupTime: '8 min',
    features: ['Share Candidate', '@Mentions', 'To-Do Triggers'],
    demoAreaIds: ['manager'],
    automationFlow: [
      { icon: '📋', label: 'Stage', name: 'Candidate Shortlisted' },
      { icon: '⚡', label: 'Trigger', name: 'Share + @Mention + To-Do' },
      { icon: '✍️', label: 'Result', name: 'Feedback Within 48 Hours' },
    ],
    beforeList: [
      'Slack/email ping-pong to get HMs to review resumes',
      'Candidates wait 5-7 days for a shortlist decision',
      'HMs forget, recruiter chases, trust erodes',
      'No scorecard = subjective, inconsistent feedback',
      'Pipeline stalls at "waiting for hiring manager"',
    ],
    afterList: [
      'Candidate profile auto-shared when shortlisted',
      'HM gets @mentioned with a clear ask',
      'To-Do created with 48-hour deadline',
      'Scorecard attached for structured feedback',
      'Full visibility on who\'s reviewed and who hasn\'t',
    ],
    needs: [
      { icon: '🔗', name: 'Share Candidate', type: 'core' },
      { icon: '💬', name: '@Mentions / Comments', type: 'core' },
      { icon: '✅', name: 'To-Do Triggers', type: 'core' },
      { icon: '📊', name: 'Scorecards', type: 'core' },
    ],
    steps: [
      {
        navPath: 'Settings → Scorecards → Create',
        title: 'Create a Scorecard for the role',
        description:
          'Define the criteria hiring managers should evaluate: technical skills, culture fit, communication, experience level. Each criterion gets a rating scale. This standardizes feedback and eliminates vague "thumbs up / thumbs down" responses.',
      },
      {
        navPath: 'Job → Triggers → "Shortlisted" Stage',
        title: 'Add a Share Candidate trigger',
        description:
          'When a candidate is moved to "Shortlisted," automatically share their full profile with the hiring manager. They get an email with a direct link to the candidate card — no Teamtailor login required for external sharing.',
      },
      {
        navPath: 'Job → Triggers → "Shortlisted" Stage',
        title: 'Add a Comment trigger with @mention',
        description:
          'Create an automated comment that @mentions the hiring manager: "@[HiringManager] — New shortlisted candidate for review. Please complete the scorecard within 48 hours." This creates a notification in-app and via email.',
      },
      {
        navPath: 'Job → Triggers → "Shortlisted" Stage',
        title: 'Add a To-Do trigger with deadline',
        description:
          'Create a To-Do item assigned to the hiring manager: "Review candidate and complete scorecard." Set a 48-hour deadline. The To-Do appears in their dashboard and sends a reminder if incomplete — gentle accountability that keeps the pipeline moving.',
      },
      {
        title: 'Track completion in the activity feed',
        description:
          'Each candidate\'s activity tab shows you whether the HM has viewed the profile, completed the scorecard, and made a decision. No more guessing or chasing — you have full transparency.',
      },
    ],
    spotlights: [
      {
        feature: 'Candidate Cards',
        description:
          'The Candidate Card is a centralized view of everything about an applicant — resume, notes, chat history, interview feedback, scorecards, and activity timeline. When you share a card with a hiring manager, they see the full picture without needing to ask you for context.',
      },
    ],
    results: {
      metrics: [
        { value: '73%', label: 'Faster HM feedback turnaround' },
        { value: '48hr', label: 'Average time to scorecard completion' },
        { value: '0', label: 'Slack messages chasing HMs' },
      ],
      caseStudy: {
        company: 'Real Result: Actavo achieved full hiring manager adoption',
        result:
          'By making candidate review effortless with sharing, scorecards, and automated reminders — hiring managers went from disengaged to active participants in the hiring process.',
      },
    },
  },

  // ──────────────────────────────────────────────
  // 4. Automate Assessments
  // ──────────────────────────────────────────────
  {
    id: 'playbook-assessments',
    title: 'Automate Assessments Without Lifting a Finger',
    subtitle:
      'Build a zero-touch flow where passing a phone screen triggers an assessment, a passing score advances the candidate, and their interview is booked — all automatically.',
    description:
      'Stop manually sending assessment links and chasing completions. Create an end-to-end flow from phone screen to booked interview — zero touch.',
    personas: ['Recruiters', 'TA Leaders'],
    setupTime: '12 min',
    features: ['Marketplace', 'Partner Triggers', 'Smart Move'],
    demoAreaIds: ['ai', 'hiring'],
    automationFlow: [
      { icon: '📞', label: 'Stage', name: 'Phone Screen Passed' },
      { icon: '⚡', label: 'Trigger', name: 'Send Assessment' },
      { icon: '⚡', label: 'Trigger', name: 'Score > Threshold → Advance' },
      { icon: '⚡', label: 'Trigger', name: 'Smart Schedule' },
      { icon: '🎯', label: 'Result', name: 'Qualified & Booked' },
    ],
    beforeList: [
      'Manually send assessment links after every screen',
      'Chase candidates who haven\'t completed tests',
      'Manually check scores and decide who advances',
      'Then start the scheduling dance for interviews',
      'Each candidate = 20+ minutes of admin work',
    ],
    afterList: [
      'Assessment sent automatically when phone screen passes',
      'Scores evaluated automatically via Smart Move',
      'Passing candidates advanced to interview stage',
      'Interview booked via Smart Schedule — zero touch',
      'End-to-end: phone screen → booked interview, hands-free',
    ],
    needs: [
      { icon: '⚡', name: 'Triggers + Smart Move', type: 'core' },
      { icon: '📅', name: 'Smart Schedule', type: 'core' },
      { icon: '🧪', name: 'Assessment Partner (Marketplace)', type: 'integration' },
      { icon: '📆', name: 'Calendar Integration', type: 'integration' },
    ],
    steps: [
      {
        navPath: 'Marketplace → Integrations → Assessment',
        title: 'Connect your assessment partner',
        description:
          'Navigate to the Marketplace and connect your preferred assessment tool — skills tests, personality assessments, coding challenges, etc. The integration enables "Partner Triggers" — the ability to automatically send assessments when candidates reach specific stages.',
      },
      {
        navPath: 'Job → Triggers → "Phone Screen Passed" Stage',
        title: 'Add a Partner Trigger for the assessment',
        description:
          'On your "Phone Screen Passed" stage, add a Partner Trigger that sends the assessment invitation. The candidate receives a branded email with a link to complete the test — no manual send required.',
      },
      {
        navPath: 'Job → Triggers → Smart Move',
        title: 'Configure Smart Move based on assessment score',
        description:
          'Set up a Smart Move trigger that automatically advances candidates who score above your threshold. For example: candidates scoring 70%+ on the skills test are moved to "Interview." Below threshold? Moved to "Rejected — Assessment."',
      },
      {
        navPath: 'Job → Triggers → "Interview" Stage',
        title: 'Add Smart Schedule on the Interview stage',
        description:
          'When a candidate is auto-advanced to "Interview" by Smart Move, Smart Schedule fires and sends them a booking link. The entire chain — assessment sent → scored → advanced → interview booked — happens without a single click from you.',
      },
      {
        title: 'Review the assessment results before the interview',
        description:
          'Assessment scores and detailed reports are attached directly to the candidate card. Before the interview, you (and the hiring manager) can review the results — walking in prepared, with data-backed talking points.',
      },
    ],
    spotlights: [
      {
        feature: 'Marketplace Integrations',
        description:
          'Teamtailor\'s Marketplace connects 100+ tools — from assessment platforms to HRIS systems to e-signing. Many integrations support "Partner Triggers," meaning they can be fired automatically as part of your pipeline, not just used manually.',
      },
    ],
    results: {
      metrics: [
        { value: '20min', label: 'Saved per candidate on admin' },
        { value: '100%', label: 'Assessment completion visibility' },
        { value: '0', label: 'Manual steps from screen to interview' },
      ],
      caseStudy: {
        company: '',
        result: '',
      },
    },
  },

  // ──────────────────────────────────────────────
  // 5. Career Site
  // ──────────────────────────────────────────────
  {
    id: 'playbook-career-site',
    title: 'Build a Career Site That Sells the Job for You',
    subtitle:
      'Stop relying on generic job boards. Build a branded career experience that attracts quality talent, captures passive candidates, and cuts agency dependency.',
    description:
      'Generic job boards and boring career pages result in low-quality applicants. Build a branded experience that attracts top talent and cuts agency spend.',
    personas: ['TA Leaders', 'HR Managers'],
    setupTime: '20 min',
    features: ['Career Site', 'Video Presenter', 'Connect', 'Chat'],
    demoAreaIds: ['brand'],
    automationFlow: [],
    beforeList: [
      'Career page is a plain list of job postings',
      'No employer brand story or visual identity',
      'Passive candidates have no way to connect',
      'Candidates can\'t ask questions before applying',
      'Spending £130K+ annually on recruitment agencies',
    ],
    afterList: [
      'Branded career site that tells your story',
      'Video greetings from hiring managers on job ads',
      'Connect captures passive talent 24/7',
      'Live chat answers questions in real-time',
      'Direct applications replace agency dependency',
    ],
    needs: [
      { icon: '🎨', name: 'Career Site Builder', type: 'core' },
      { icon: '🎥', name: 'Video Presenter', type: 'core' },
      { icon: '🤝', name: 'Connect', type: 'core' },
      { icon: '💬', name: 'Candidate Chat', type: 'core' },
      { icon: '📝', name: 'Posts / Blog', type: 'core' },
    ],
    steps: [
      {
        navPath: 'Career Site → Design → Customize',
        title: 'Brand your career site',
        description:
          'Use the drag-and-drop editor to set your brand colors, fonts, logo, and hero imagery. Add department pages, team member spotlights, and company values sections. No developer needed — this is fully visual, fully customizable.',
      },
      {
        navPath: 'Jobs → Edit Job → Video Presenter',
        title: 'Add Video Presenter to key job ads',
        description:
          'Record a 30-second video greeting from the hiring manager for your highest-priority roles. It appears right on the job ad — adding a human touch that dramatically increases application rates. Candidates feel like they\'re already meeting the team.',
      },
      {
        navPath: 'Career Site → Settings → Connect',
        title: 'Enable Connect for passive candidates',
        description:
          'Connect lets visitors express interest in your company even when there\'s no suitable role open right now. They submit their info and join your talent pool — so when the right role opens, you already have a warm list of people who raised their hand.',
      },
      {
        navPath: 'Career Site → Settings → Chat',
        title: 'Enable Candidate Chat',
        description:
          'Turn on the live chat widget on your career site and job ads. Candidates can ask questions about roles, culture, benefits, and process in real-time. It reduces application friction and gives you a channel to convert hesitant visitors into applicants.',
      },
      {
        navPath: 'Career Site → Posts → Create',
        title: 'Publish culture content with Posts',
        description:
          'Share company updates, employee spotlights, event recaps, and behind-the-scenes content directly on your career site. This turns your career page from a static job board into a living employer brand destination that candidates bookmark and revisit.',
      },
    ],
    spotlights: [
      {
        feature: 'Video Presenter',
        description:
          'Video Presenter lets hiring managers record short video introductions that appear directly in job ads. It\'s the fastest way to humanize your job listings and give candidates a real sense of the team and culture — before they even apply.',
      },
    ],
    results: {
      metrics: [
        { value: '£130K+', label: 'Saved in agency fees (Footasylum)' },
        { value: '3x', label: 'More direct applications' },
        { value: '24/7', label: 'Passive talent capture via Connect' },
      ],
      caseStudy: {
        company: 'Real Result: Footasylum saved £130K+ in agency fees',
        result:
          'By building a compelling employer brand through their Teamtailor career site — shifting from agency dependency to direct applications.',
      },
    },
  },

  // ──────────────────────────────────────────────
  // 6. Job Templates
  // ──────────────────────────────────────────────
  {
    id: 'playbook-templates',
    title: 'Standardize Hiring Across Every Team With Job Templates',
    subtitle:
      'Every hiring manager runs a different process — inconsistent stages, random emails, no standards. Ship a hiring blueprint that every new job inherits automatically.',
    description:
      'Every manager runs a different process — inconsistent stages, random emails, no standards. Ship a complete hiring blueprint that every new job inherits.',
    personas: ['TA Leaders', 'HR Managers'],
    setupTime: '15 min',
    features: ['Job Templates', 'Global Triggers', 'Scorecards'],
    demoAreaIds: ['hiring'],
    automationFlow: [
      { icon: '📐', label: 'Stage', name: 'Design Template With Stages' },
      { icon: '⚡', label: 'Trigger', name: 'Add Triggers at Each Stage' },
      { icon: '📊', label: 'Trigger', name: 'Scorecards + Questions' },
      { icon: '🚀', label: 'Result', name: 'Every New Job = Best Practice' },
    ],
    beforeList: [
      'Each hiring manager invents their own process',
      'Different stages, emails, and evaluation criteria per job',
      'Impossible to benchmark or compare hiring data',
      'New recruiters build everything from scratch',
      'Quality of hire varies wildly across teams',
    ],
    afterList: [
      'Standard pipeline stages across all jobs',
      'Pre-configured triggers at every stage',
      'Consistent scorecards and screening questions',
      'New jobs inherit the full automation stack',
      'TA leaders get clean, comparable data',
    ],
    needs: [
      { icon: '📋', name: 'Job Templates', type: 'core' },
      { icon: '⚡', name: 'Triggers (Global)', type: 'core' },
      { icon: '📊', name: 'Scorecards', type: 'core' },
      { icon: '⚙️', name: 'Smart Move', type: 'core' },
    ],
    steps: [
      {
        navPath: 'Settings → Job Templates → Create New',
        title: 'Create a new Job Template',
        description:
          'Go to Settings → Job Templates and create a template for your most common hiring type (e.g., "Standard Hiring Process" or "Engineering Hiring"). Give it a clear name so recruiters know which to use.',
      },
      {
        title: 'Define your standard pipeline stages',
        description:
          'Set up the stages that every job should follow: Applied → Screened → Phone Interview → Assessment → On-Site → Offer → Hired. Having consistent stages means your analytics dashboards actually produce meaningful data across all roles.',
      },
      {
        title: 'Configure triggers at each stage',
        description:
          'This is where the magic happens. Add the full automation stack to your template:\n• Applied: Smart Move auto-screens based on screening questions\n• Screened: Auto-send "Moving forward" email\n• Phone Interview: Smart Schedule sends booking link\n• Shortlisted: Share with HM + create review To-Do\n• Offer: Trigger e-signing integration\n• Hired: NPS survey + HRIS sync',
      },
      {
        title: 'Attach Scorecards for evaluation consistency',
        description:
          'Add pre-built scorecards to the template so every interviewer evaluates candidates against the same criteria. This eliminates bias, standardizes feedback quality, and makes it easy to compare candidates across roles.',
      },
      {
        title: 'Set as default for departments',
        description:
          'Assign the template as the default for specific departments or make it company-wide. Now when any recruiter creates a new job, they start with a fully-configured pipeline — triggers, scorecards, questions, and all. Zero setup, maximum consistency.',
      },
    ],
    spotlights: [
      {
        feature: 'Job Templates',
        description:
          'Job Templates are your hiring playbook in a box. Every new job created from a template inherits the full configuration — stages, triggers, scorecards, screening questions, and settings. Build the perfect process once, then ship it to every team.',
      },
    ],
    results: {
      metrics: [
        { value: '38%', label: 'Faster time-to-hire (standardization)' },
        { value: '100%', label: 'Process consistency across teams' },
        { value: '5min', label: 'To spin up a new job (vs. 45min)' },
      ],
      caseStudy: {
        company: 'Real Result: Colonies cut time-to-hire from 45 to 28 days',
        result:
          'By standardizing their hiring workflow across all teams with templates and triggers — eliminating inconsistency and manual bottlenecks.',
      },
    },
  },

  // ──────────────────────────────────────────────
  // 7. ADP Hire-to-Onboard
  // ──────────────────────────────────────────────
  {
    id: 'playbook-adp-onboard',
    title: 'Hire-to-Onboard in One Click With ADP',
    subtitle:
      'When a candidate is marked "Hired" in Teamtailor, their employee record is automatically created in ADP Workforce Now — payroll group assigned, onboarding template triggered, Day 1 ready. Zero re-keying.',
    description:
      'Stop re-keying new hire data into your HRIS. When a candidate is hired in Teamtailor, their employee record is auto-created in ADP Workforce Now — payroll group, onboarding template, and all.',
    personas: ['HR Managers', 'TA Leaders'],
    setupTime: '12 min',
    features: ['ADP Integration', 'Triggers', 'E-Sign', 'Onboarding'],
    demoAreaIds: ['programs'],
    automationFlow: [
      { icon: '🎉', label: 'Stage', name: 'Offer Accepted' },
      { icon: '⚡', label: 'Trigger', name: 'E-Sign Offer Letter' },
      { icon: '✅', label: 'Stage', name: 'Hired' },
      { icon: '⚡', label: 'Trigger', name: 'Create Employee Record' },
      { icon: '🚀', label: 'Result', name: 'Payroll + Onboarding Ready' },
    ],
    beforeList: [
      'HR manually re-types candidate info into ADP',
      'Name, email, DOB, department — entered twice',
      '"Fat-finger" errors cause payroll issues on Day 1',
      '3-5 day delay between offer and ADP record creation',
      'New hires arrive with no system access or equipment',
    ],
    afterList: [
      'Candidate hired → ADP record auto-created',
      'All fields mapped: name, email, department, hire date',
      'Payroll group and onboarding template auto-assigned',
      'Zero manual data entry, zero transcription errors',
      'IT, facilities, and manager tasks triggered immediately',
    ],
    needs: [
      { icon: '🔗', name: 'ADP Workforce Now', type: 'integration' },
      { icon: '⚡', name: 'Triggers', type: 'core' },
      { icon: '✍️', name: 'E-Sign (Native or DocuSign)', type: 'core' },
      { icon: '📋', name: 'Onboarding Module', type: 'core' },
    ],
    steps: [
      {
        navPath: 'Settings → Integrations → Marketplace',
        title: 'Connect ADP Workforce Now',
        description:
          'Navigate to Settings → Integrations → Marketplace and search for "ADP." Follow the connection wizard: generate a Teamtailor API key with Admin read/write scope, paste it in the ADP Marketplace portal, and authorize the connection. Two deployment models are available: CORE (if you\'re a new ADP customer) and CONNECTOR (if you already use both platforms).',
      },
      {
        navPath: 'Job → Pipeline → Add Stage',
        title: 'Create a "Send to ADP" stage in your pipeline',
        description:
          'Add a dedicated stage after "Hired" called "Send to ADP" (or use your existing "Hired" stage). This is the trigger point — when a candidate enters this stage, the ADP integration fires. Having a separate stage gives you a final quality check before pushing data.',
      },
      {
        navPath: 'Job → Triggers → "Send to ADP" Stage',
        title: 'Configure the ADP Partner Trigger',
        description:
          'Add a Partner Trigger on the "Send to ADP" stage. Select ADP as the integration, then configure:\n• Field Mapping: First name, last name, email, date of birth, hire date\n• Onboarding Template: Select from your ADP templates (e.g., "New Employee — US Office")\n• Payroll Group: Choose the correct payroll group (pulled live from ADP)\n• Work Location: Map to the correct ADP work location',
      },
      {
        navPath: 'Job → Triggers → "Offer" Stage',
        title: 'Add E-Sign trigger for the offer letter',
        description:
          'Before the ADP push, make sure the offer is signed. Add an E-Sign trigger on the "Offer" stage — using Teamtailor\'s native e-sign or DocuSign/Oneflow. When the candidate signs, auto-advance them to "Hired" → "Send to ADP" for a seamless chain.',
      },
      {
        navPath: 'Onboarding → Templates',
        title: 'Set up onboarding tasks in Teamtailor',
        description:
          'While ADP handles the payroll/HR side, use Teamtailor\'s onboarding module for the experiential side: welcome messages, team introductions, first-day checklists, document collection. The dual system covers both administrative and cultural onboarding.',
      },
    ],
    spotlights: [
      {
        feature: 'ADP Workforce Now',
        description:
          'Teamtailor is an official ADP Marketplace partner (North America & Canada). The integration auto-pushes new hire data — name, email, DOB, job details, hire date, payroll group, and onboarding template — from Teamtailor into ADP. During trigger setup, you select the onboarding template and payroll group from values pulled live from your ADP account.',
      },
    ],
    results: {
      metrics: [
        { value: '0', label: 'Manual data entry for new hires' },
        { value: '3 days', label: 'Saved per hire on onboarding admin' },
        { value: '100%', label: 'Data accuracy (no transcription errors)' },
      ],
      caseStudy: {
        company: 'ADP Marketplace Partner',
        result:
          'Teamtailor is an official ADP Marketplace integration — trusted by thousands of companies running ADP Workforce Now who need a modern, full-featured ATS that syncs seamlessly with their HRIS.',
      },
    },
  },

  // ──────────────────────────────────────────────
  // 8. Zero-Touch Screening Pipeline
  // ──────────────────────────────────────────────
  {
    id: 'playbook-zero-touch',
    title: 'Zero-Touch Screening: Assessment → Background Check → Interview',
    subtitle:
      'Chain your marketplace integrations into one automated pipeline. Candidate passes phone screen → assessment auto-sent → score evaluated → background check initiated → interview booked. You don\'t click anything.',
    description:
      'Chain marketplace integrations together for end-to-end candidate evaluation. Assessment auto-sent, score evaluated, background check triggered, interview booked — all without you clicking a single button.',
    personas: ['Recruiters', 'TA Leaders'],
    setupTime: '15 min',
    features: ['TestGorilla', 'Checkr', 'Smart Move', 'Smart Schedule'],
    demoAreaIds: ['ai', 'hiring'],
    automationFlow: [
      { icon: '📞', label: 'Stage', name: 'Phone Screen Passed' },
      { icon: '⚡', label: 'Trigger', name: 'Send Assessment' },
      { icon: '⚡', label: 'Trigger', name: 'Score ≥ 70% → Advance' },
      { icon: '⚡', label: 'Trigger', name: 'Background Check' },
      { icon: '⚡', label: 'Trigger', name: 'Book Interview' },
      { icon: '🎯', label: 'Result', name: 'Fully Vetted + Scheduled' },
    ],
    beforeList: [
      'Log into TestGorilla, copy candidate email, send test',
      'Check back daily for assessment completion',
      'Manually review score, decide to advance',
      'Log into Checkr, re-enter candidate data, initiate check',
      'Wait for clearance, then start scheduling dance',
      '25+ minutes of admin per candidate',
    ],
    afterList: [
      'Assessment auto-sent when candidate passes phone screen',
      'Score auto-evaluated → advance or reject',
      'Background check auto-initiated on advancement',
      'Interview auto-booked via Smart Schedule',
      'All results attached to candidate card',
      '0 minutes of admin per candidate',
    ],
    needs: [
      { icon: '🧪', name: 'TestGorilla (or assessment partner)', type: 'integration' },
      { icon: '🔍', name: 'Checkr (or BGC partner)', type: 'integration' },
      { icon: '⚡', name: 'Smart Move + Triggers', type: 'core' },
      { icon: '📅', name: 'Smart Schedule', type: 'core' },
    ],
    steps: [
      {
        navPath: 'Marketplace → TestGorilla → Connect',
        title: 'Connect your assessment partner',
        description:
          'Go to Settings → Integrations → Marketplace and connect TestGorilla (or your preferred assessment tool: Bryq, AssessFirst, Criteria Corp, etc.). Authorize the integration and select the default test template for this role type.',
      },
      {
        navPath: 'Marketplace → Checkr → Connect',
        title: 'Connect your background check partner',
        description:
          'Connect Checkr (or your BGC provider). Configure the default check package — criminal history, employment verification, education verification, etc. Checkr will send candidates an authorization link directly.',
      },
      {
        navPath: 'Job → Pipeline → Stages',
        title: 'Set up your pipeline stages',
        description:
          'Create these stages in order: Phone Screen Passed → Assessment → Background Check → Interview. Each stage will host a different trigger, forming an unbroken automation chain.',
      },
      {
        navPath: 'Job → Triggers → Chain Setup',
        title: 'Wire up the trigger chain',
        description:
          'This is the heart of the playbook. Add triggers at each stage:\n• Phone Screen Passed: Partner Trigger → send TestGorilla assessment\n• Assessment: Smart Move → score ≥ 70% → advance to Background Check\n• Background Check: Partner Trigger → initiate Checkr screening\n• Background Check Complete: Smart Move → advance to Interview\n• Interview: Smart Schedule → send booking link',
      },
      {
        title: 'Test the full chain end-to-end',
        description:
          'Move a test candidate through "Phone Screen Passed" and verify: assessment is auto-sent, upon completion the score is evaluated, the candidate is advanced, background check is initiated, and upon completion the Smart Schedule link is sent. The entire chain should run hands-free.',
      },
    ],
    spotlights: [
      {
        feature: 'TestGorilla',
        description:
          'TestGorilla offers 400+ scientifically validated assessments — cognitive ability, programming, language proficiency, personality, and role-specific skills. When connected to Teamtailor, assessment invitations can be triggered automatically, and scores + reports sync back to the candidate card for the hiring team to review.',
      },
      {
        feature: 'Checkr',
        description:
          'Checkr automates background screening with real-time status updates synced back to Teamtailor. Candidate data (name, email, country) is sent to Checkr automatically — no copy-pasting. Status flows back: Requested → In Progress → Completed. Candidates can be auto-advanced upon completion.',
      },
    ],
    results: {
      metrics: [
        { value: '25min', label: 'Saved per candidate on admin' },
        { value: '4', label: 'Integrations working in harmony' },
        { value: '0', label: 'Manual steps from screen to interview' },
      ],
      caseStudy: {
        company: '',
        result: '',
      },
    },
  },

  // ──────────────────────────────────────────────
  // 9. Complete Hiring Stack
  // ──────────────────────────────────────────────
  {
    id: 'playbook-hiring-stack',
    title: 'Build the Complete Hiring Stack: ATS + HRIS + Assessments + E-Sign',
    subtitle:
      'Stop managing 7 disconnected tools with 7 logins, 7 dashboards, and zero data flow between them. Connect your entire recruitment tech stack through Teamtailor\'s marketplace and let triggers do the orchestration.',
    description:
      'Stop using 7 disconnected tools. Connect your entire HR tech stack through Teamtailor\'s marketplace — ADP for payroll, TestGorilla for assessments, Checkr for background checks, DocuSign for offers.',
    personas: ['TA Leaders', 'HR Managers'],
    setupTime: '25 min',
    features: ['ADP', 'TestGorilla', 'Checkr', 'DocuSign'],
    demoAreaIds: ['programs', 'ai'],
    automationFlow: [],
    beforeList: [
      '7 separate logins for 7 recruitment tools',
      'Copy-paste candidate data between systems',
      'No single source of truth for hiring data',
      'Manual handoffs at every stage transition',
      'Impossible to measure end-to-end efficiency',
    ],
    afterList: [
      'One dashboard, one login, one candidate record',
      'Data flows automatically between all tools',
      'Triggers orchestrate the entire pipeline',
      'Every action logged on the candidate timeline',
      'Full analytics: source → hire → time-to-fill',
    ],
    needs: [
      { icon: '🟢', name: 'Teamtailor (ATS)', type: 'core' },
      { icon: '🔗', name: 'ADP / BambooHR (HRIS)', type: 'integration' },
      { icon: '🧪', name: 'TestGorilla (Assessments)', type: 'integration' },
      { icon: '🔍', name: 'Checkr (Background Checks)', type: 'integration' },
      { icon: '✍️', name: 'DocuSign / Oneflow (E-Sign)', type: 'integration' },
      { icon: '💬', name: 'Slack (Notifications)', type: 'integration' },
    ],
    steps: [
      {
        navPath: 'Settings → Integrations → Marketplace',
        title: 'Connect all five integrations',
        description:
          'Navigate to the Marketplace and connect each partner: ADP/BambooHR, TestGorilla, Checkr, DocuSign/Oneflow, and Slack. Each takes 2-3 minutes. Once connected, they become available as Partner Trigger options on any pipeline stage.',
      },
      {
        navPath: 'Settings → Job Templates → Create',
        title: 'Build a Job Template with the full stack wired in',
        description:
          'Create a Job Template with these stages and their triggers pre-configured:\n\nNew → Smart Move (auto-screen) + Slack notification\nPhone Screen → Smart Schedule\nAssessment → TestGorilla Partner Trigger\nBackground Check → Checkr Partner Trigger\nInterview → Smart Schedule + Share with HM\nOffer → DocuSign/Oneflow e-sign trigger\nHired → ADP push + Onboarding tasks',
      },
      {
        navPath: 'Slack → Channels → #hiring',
        title: 'Configure Slack notifications',
        description:
          'Set up Slack to notify your team at key moments: new applications, assessment completions, background check clearances, and offer acceptances. Hiring managers stay informed without ever logging into the ATS — they review and approve directly from Slack.',
      },
      {
        title: 'Set this template as the department default',
        description:
          'Assign this template as the default for the relevant departments. Now every new job automatically inherits the full integration stack — no per-job configuration needed. A new recruiter can open a req and the entire automation pipeline is already wired up.',
      },
      {
        title: 'Monitor the full pipeline with analytics',
        description:
          'With all tools connected through Teamtailor, you finally have end-to-end visibility: time-to-hire, cost-per-hire, source effectiveness, stage conversion rates, assessment pass rates, and background check clearance times — all in one dashboard.',
      },
    ],
    spotlights: [
      {
        feature: 'The Operating System Concept',
        description:
          'Just like your computer\'s OS connects apps, files, and peripherals into one unified experience, Teamtailor connects your HR tools — job boards, assessments, background checks, e-signing, and HRIS — into one unified hiring workflow. Each integration does one thing brilliantly. Teamtailor orchestrates them all.',
      },
    ],
    results: {
      metrics: [
        { value: '450+', label: 'Available marketplace integrations' },
        { value: '1', label: 'Dashboard to manage everything' },
        { value: '38%', label: 'Faster time-to-hire (avg)' },
      ],
      caseStudy: {
        company: 'The mid-market growth stack',
        result:
          'For companies with 200-2,000 employees, the combination of Teamtailor + ADP + TestGorilla + Checkr + DocuSign provides enterprise-grade hiring automation at a fraction of the cost of legacy platforms.',
      },
    },
  },

  // ──────────────────────────────────────────────
  // 10. Kill the Spreadsheet: Real-Time Hiring Intelligence
  // ──────────────────────────────────────────────
  {
    id: 'playbook-hiring-intelligence',
    title: 'Kill the Spreadsheet: Real-Time Hiring Intelligence',
    subtitle:
      'Replace hours of manual Excel reporting with live dashboards that auto-calculate time-to-hire, source ROI, funnel conversion, DEI pipeline diversity, and recruiter KPIs — the CFO slide that justifies the investment.',
    description:
      'Stop building manual spreadsheets every week. Teamtailor auto-generates live dashboards with time-to-hire, source ROI, DEI metrics, and recruiter performance — data that\'s always current and always shareable.',
    personas: ['TA Leaders', 'HR Managers'],
    setupTime: '15 min',
    features: ['Analytics', 'Custom Reports', 'Source Tracking', 'NPS', 'DEI Analytics'],
    demoAreaIds: ['analytics', 'reports'],
    automationFlow: [
      { icon: '📢', label: 'Stage', name: 'Job Published' },
      { icon: '⚡', label: 'Trigger', name: 'Source Tracking Auto-Enabled' },
      { icon: '📊', label: 'Result', name: 'Pipeline Funnel Auto-Calculated' },
      { icon: '📧', label: 'Result', name: 'Weekly Digest Auto-Sent to Leadership' },
    ],
    beforeList: [
      'Hours every week building manual spreadsheets for leadership',
      'Data is stale by the time the report is presented',
      'No source ROI tracking — you can\'t tell which channels produce hires',
      'DEI reporting is guesswork cobbled from disparate data',
      'Leadership can\'t see pipeline health without asking you first',
    ],
    afterList: [
      'Real-time dashboards auto-update with every candidate action',
      'Weekly email digests auto-sent to leadership stakeholders',
      'Source ROI tracked per job, department, and company-wide',
      'DEI pipeline diversity tracked at every funnel stage',
      'Cost-per-hire visible to the CFO without a single spreadsheet',
    ],
    needs: [
      { icon: '📊', name: 'Analytics Dashboard', type: 'core' },
      { icon: '📈', name: 'Custom Reports', type: 'core' },
      { icon: '🔍', name: 'Source Tracking', type: 'core' },
      { icon: '🌍', name: 'DEI Analytics', type: 'core' },
    ],
    steps: [
      {
        navPath: 'Analytics → Dashboard',
        title: 'Enable analytics and explore the default dashboards',
        description:
          'Navigate to Analytics and review the pre-built dashboards: pipeline overview, time-to-hire trends, stage conversion rates, and recruiter activity. These update in real-time — no configuration needed to start getting value.',
      },
      {
        navPath: 'Analytics → Sources',
        title: 'Configure source tracking for every channel',
        description:
          'Ensure source tracking is enabled for all your recruitment channels — job boards, career site, referrals, social media, agencies, and direct sourcing. Teamtailor automatically tags every candidate with their acquisition source, giving you cost-per-hire and quality-per-source metrics.',
      },
      {
        navPath: 'Analytics → Reports → Create Custom Report',
        title: 'Set up custom reports for leadership',
        description:
          'Build custom reports that answer the questions your leadership team actually asks: time-to-hire by department, source effectiveness by role type, offer acceptance rates, and pipeline velocity. Save them for one-click access.',
      },
      {
        navPath: 'Analytics → Scheduled Reports → Create',
        title: 'Create scheduled email digests',
        description:
          'Set up weekly or monthly automated email digests that deliver your key metrics directly to leadership inboxes. No more "Can you pull the numbers?" requests — the data arrives before they even ask.',
        proTip:
          'Schedule digests to arrive Monday morning before the leadership meeting. Being the team that always has current data builds massive credibility.',
      },
      {
        navPath: 'Analytics → DEI',
        title: 'Configure the DEI analytics dashboard',
        description:
          'Enable DEI tracking to monitor candidate diversity at every pipeline stage — from application through hire. Identify where diverse candidates drop off, benchmark against targets, and generate compliance-ready reports for board presentations.',
      },
    ],
    spotlights: [
      {
        feature: 'The Insight Engine',
        description:
          'Teamtailor auto-calculates pipeline velocity, source effectiveness, stage bottlenecks, and cost-per-hire across every job and department. No formulas, no pivot tables — the data updates in real-time and can be shared with stakeholders via scheduled digests or live dashboard links.',
      },
    ],
    results: {
      metrics: [
        { value: '4hrs', label: 'Saved per week on reporting' },
        { value: '100%', label: 'Source attribution across all hires' },
        { value: '3x', label: 'Faster leadership decisions' },
      ],
      caseStudy: {
        company: 'Data-Driven TA Teams',
        result:
          'Companies replacing spreadsheet reporting see 4x faster response to pipeline bottlenecks and can justify ATS investment in board presentations within 30 days.',
      },
    },
  },

  // ──────────────────────────────────────────────
  // 11. Escape Your Dying ATS: The 30-Day Migration Blueprint
  // ──────────────────────────────────────────────
  {
    id: 'playbook-ats-migration',
    title: 'Escape Your Dying ATS: The 30-Day Migration Blueprint',
    subtitle:
      'Your current vendor hasn\'t shipped an update in years and support tickets go unanswered. Here\'s the step-by-step blueprint to migrate to Teamtailor in 30 days — with free data import, dedicated onboarding, and 2-min avg support response.',
    description:
      'Your ATS vendor has gone silent — no updates, no support, no roadmap. Migrate to Teamtailor in 30 days with free data import, a dedicated onboarding specialist, and a platform that ships weekly releases.',
    personas: ['TA Leaders', 'HR Managers'],
    setupTime: '30 days',
    features: ['Data Import', 'Marketplace', 'API', 'Onboarding Support', 'Integrations'],
    demoAreaIds: ['settings', 'integrations'],
    automationFlow: [
      { icon: '📤', label: 'Stage', name: 'Export From Legacy ATS' },
      { icon: '📥', label: 'Trigger', name: 'CSV Import to Teamtailor' },
      { icon: '🔌', label: 'Trigger', name: 'Integration Wiring' },
      { icon: '🚀', label: 'Result', name: 'Go-Live' },
    ],
    beforeList: [
      'Vendor hasn\'t shipped updates in 2+ years',
      'Support tickets go unanswered for weeks',
      'Critical features breaking with no fix timeline',
      'Stuck in an expensive contract with declining value',
      'Team losing confidence in the tool and working around it',
    ],
    afterList: [
      'Free data import — candidates, jobs, and history migrated',
      'Dedicated onboarding specialist for the first 30 days',
      '2-minute average support response time (24/5)',
      'Weekly product releases with a public roadmap',
      '450+ marketplace integrations and an active user community',
    ],
    needs: [
      { icon: '📥', name: 'Data Import Tool', type: 'core' },
      { icon: '👤', name: 'Dedicated Onboarding Specialist', type: 'core' },
      { icon: '🔌', name: 'Marketplace Integrations', type: 'core' },
      { icon: '🔑', name: 'API Access', type: 'core' },
    ],
    steps: [
      {
        navPath: 'Legacy ATS → Export → CSV',
        title: 'Export candidate data from your current ATS',
        description:
          'Export your candidate database, job history, and pipeline data from your current ATS as CSV files. Most systems support bulk export. If your vendor makes this difficult, Teamtailor\'s onboarding team can help you navigate the extraction process.',
      },
      {
        navPath: 'Settings → Data Import',
        title: 'Import via Teamtailor\'s data import tool',
        description:
          'Upload your CSV files into Teamtailor\'s data import tool. Map fields (name, email, phone, tags, notes, source) to Teamtailor\'s candidate schema. The tool validates data integrity before import and flags any issues for review.',
        proTip:
          'Clean your data before import — merge duplicates, remove test records, and standardize tags. A fresh start with clean data multiplies the value of every automation you build.',
      },
      {
        navPath: 'Settings → Job Templates',
        title: 'Configure job templates and workflows',
        description:
          'Build your standard hiring workflows as Job Templates — pipeline stages, triggers, scorecards, and screening questions. Your onboarding specialist will help you replicate your best processes from the old system while adding automation you never had.',
      },
      {
        navPath: 'Settings → Integrations → Marketplace',
        title: 'Connect integrations (ADP/BambooHR/Slack/etc)',
        description:
          'Wire up your HR tech stack through the Marketplace. Connect your HRIS (ADP, BambooHR), communication tools (Slack, Teams), job boards, assessment platforms, and background check providers. Each integration takes 2-5 minutes.',
      },
      {
        title: 'Parallel-run for 1 week, then go-live',
        description:
          'Run Teamtailor alongside your old ATS for one week to validate workflows, train the team, and catch any edge cases. Your onboarding specialist conducts daily check-ins during this period. Once validated, flip the switch and decommission the old system.',
      },
    ],
    spotlights: [
      {
        feature: 'Hypercare Onboarding',
        description:
          'A dedicated CS specialist runs parallel alongside your team for the first 30 days. Weekly check-ins, custom workflow configuration, and data validation included at no extra cost. They don\'t just set you up — they make sure you\'re getting measurable value before they hand off to ongoing support.',
      },
    ],
    results: {
      metrics: [
        { value: '30 days', label: 'Average migration timeline' },
        { value: '2 min', label: 'Average support response time' },
        { value: '99.9%', label: 'Uptime SLA' },
      ],
      caseStudy: {
        company: 'ATS Migration Success',
        result:
          'Teams that switch from unsupported ATS platforms typically see a 45% reduction in time-to-hire within 60 days, driven by automation features their previous vendor never shipped.',
      },
    },
  },

  // ──────────────────────────────────────────────
  // 12. From Agency Dependency to Direct Hiring Machine
  // ──────────────────────────────────────────────
  {
    id: 'playbook-agency-replacement',
    title: 'From Agency Dependency to Direct Hiring Machine',
    subtitle:
      'Replace $160K+ in annual agency fees by building your own talent acquisition engine. Agency cost-per-hire: $15-25K. Direct cost-per-hire with Teamtailor: $2-5K. Build the branded careers site, passive talent pools, and referral programs that make agencies optional.',
    description:
      'Stop paying $15-25K per hire through agencies. Build a direct hiring machine with a branded career site, passive talent pools via Connect, programmatic job advertising, and an employee referral engine — cutting cost-per-hire to $2-5K.',
    personas: ['TA Leaders', 'HR Managers'],
    setupTime: '20 min',
    features: ['Career Site', 'Connect', 'Promote', 'Nurture Campaigns', 'Job Boards', 'Referrals'],
    demoAreaIds: ['career-site', 'connect', 'promote'],
    automationFlow: [
      { icon: '🎨', label: 'Stage', name: 'Build Career Site' },
      { icon: '🤝', label: 'Trigger', name: 'Enable Connect for Passive Capture' },
      { icon: '📢', label: 'Trigger', name: 'Launch Promote Campaigns' },
      { icon: '💰', label: 'Result', name: 'Track Source ROI' },
    ],
    beforeList: [
      '$15-25K cost-per-hire through recruitment agencies',
      'No ownership of your candidate pipeline — agencies control it',
      'Can\'t compete on employer brand against direct competitors',
      'Zero visibility into agency sourcing quality or process',
      'Passive on sourcing — waiting for agencies to deliver candidates',
    ],
    afterList: [
      '$2-5K cost-per-hire through direct channels',
      'Branded careers destination that attracts top talent directly',
      'Always-warm talent pools through Connect — candidates come to you',
      '128 job board integrations for maximum reach',
      'Employee referral engine with tracking and full source ROI visibility',
    ],
    needs: [
      { icon: '🎨', name: 'Career Site Builder', type: 'core' },
      { icon: '🤝', name: 'Connect (Talent Community)', type: 'core' },
      { icon: '📢', name: 'Promote (Programmatic Ads)', type: 'core' },
      { icon: '👥', name: 'Referral Program', type: 'core' },
    ],
    steps: [
      {
        navPath: 'Career Site → Design → Pages',
        title: 'Build branded career site pages with Career Site Builder',
        description:
          'Use the drag-and-drop editor to create a compelling careers destination — hero sections with team photos, department pages, employee testimonials, benefits highlights, and culture content. No developer needed. This is the front door that replaces agency dependency.',
      },
      {
        navPath: 'Career Site → Settings → Connect',
        title: 'Enable Connect portal for passive candidate capture',
        description:
          'Turn on Connect so visitors can express interest in your company even when no current role matches. They upload their CV, select preferred departments, and join your talent pool. When a matching role opens, they\'re already warm and waiting.',
        proTip:
          'Promote your Connect page on LinkedIn and company social channels. Teams that actively drive traffic to Connect see 30% of hires come from this channel within 6 months.',
      },
      {
        navPath: 'Promote → Campaigns → Create',
        title: 'Configure Promote for programmatic job advertising',
        description:
          'Set up Promote campaigns to automatically distribute your jobs across the highest-performing channels — Google, Meta, Indeed, and niche job boards. Promote\'s algorithm optimizes spend in real-time, shifting budget to the sources that deliver the most qualified applicants.',
      },
      {
        navPath: 'Nurture → New Campaign',
        title: 'Launch nurture campaigns for warm talent pools',
        description:
          'Create automated email sequences for your Connect talent pool and past applicants. Keep them engaged with company news, new role alerts, and employer brand content. When you open a new req, your first candidates are already warm.',
      },
      {
        navPath: 'Settings → Referrals → Configure',
        title: 'Activate employee referral program with tracking',
        description:
          'Enable Teamtailor\'s built-in referral program. Employees can share jobs with a tracked link, see the status of their referrals, and earn rewards. Referral hires are typically faster, cheaper, and higher-retention than any other source.',
      },
    ],
    spotlights: [
      {
        feature: 'Connect',
        description:
          'Connect is your talent community that works while you sleep. Passive candidates can express interest, upload their CV, and get auto-matched to future roles. It\'s the always-on pipeline that agencies can\'t replicate — and the average team sees 30% of hires come from Connect within 6 months.',
      },
    ],
    results: {
      metrics: [
        { value: '£130K+', label: 'Average annual agency savings' },
        { value: '78%', label: 'Reduction in cost-per-hire' },
        { value: '30%', label: 'Of hires from Connect within 6 months' },
      ],
      caseStudy: {
        company: 'Real Result: Footasylum',
        result:
          'Footasylum saved £130K+ annually by replacing agency dependency with Teamtailor\'s career site + Connect + Promote combination, significantly reducing cost-per-hire.',
      },
    },
  },

  // ──────────────────────────────────────────────
  // 13. Multi-Brand Hiring Command Center
  // ──────────────────────────────────────────────
  {
    id: 'playbook-multi-brand',
    title: 'Multi-Brand Hiring Command Center',
    subtitle:
      'One platform powering N branded career sites with unified analytics. For multi-entity organizations running separate ATS per subsidiary — eliminate N separate license costs while maintaining brand-specific candidate experiences.',
    description:
      'Stop paying for a separate ATS for every subsidiary. Teamtailor\'s division architecture gives each brand its own career site, workflows, and permissions while leadership sees a single unified dashboard across the entire portfolio.',
    personas: ['TA Leaders', 'HR Managers'],
    setupTime: '25 min',
    features: ['Departments', 'Career Site', 'Analytics', 'Permissions', 'Job Templates'],
    demoAreaIds: ['settings', 'career-site', 'analytics'],
    automationFlow: [
      { icon: '🏢', label: 'Stage', name: 'Configure Brand Divisions' },
      { icon: '🎨', label: 'Trigger', name: 'Separate Career Pages Per Brand' },
      { icon: '📊', label: 'Trigger', name: 'Unified Analytics' },
      { icon: '📋', label: 'Result', name: 'Cross-Brand Reporting' },
    ],
    beforeList: [
      'Separate ATS per subsidiary — N separate license costs',
      'No unified reporting across brands or entities',
      'Inconsistent candidate experience across brands',
      'Compliance gaps from disconnected systems',
      'Duplicated admin work and configuration per subsidiary',
    ],
    afterList: [
      'One platform with N branded career sites',
      'Unified pipeline analytics across all brands',
      'Centralized compliance and GDPR management',
      'Consolidated licensing — one contract, one vendor',
      'Brand-specific workflows with shared talent pools across entities',
    ],
    needs: [
      { icon: '🏢', name: 'Departments / Divisions', type: 'core' },
      { icon: '🎨', name: 'Career Site Builder', type: 'core' },
      { icon: '🔐', name: 'Role-Based Permissions', type: 'core' },
      { icon: '📊', name: 'Cross-Brand Analytics', type: 'core' },
    ],
    steps: [
      {
        navPath: 'Settings → Departments → Create',
        title: 'Create department divisions for each brand/entity',
        description:
          'Set up your organizational structure with departments representing each brand or subsidiary. Each division operates independently with its own jobs, candidates, and team members — while rolling up into a unified company-level view for leadership.',
      },
      {
        navPath: 'Career Site → Design → Brand Pages',
        title: 'Build brand-specific career site pages with unique branding',
        description:
          'Create distinct career site experiences for each brand — unique logos, color palettes, hero imagery, team photos, and culture content. Candidates visiting each brand\'s career page see a fully branded experience, not a generic corporate portal.',
      },
      {
        navPath: 'Settings → Permissions → Roles',
        title: 'Configure role-based permissions per brand',
        description:
          'Set up permissions so each brand\'s recruiting team only sees their own jobs, candidates, and workflows. TA leaders and HR managers get cross-brand visibility, while local recruiters stay focused on their own pipeline without information overload.',
      },
      {
        navPath: 'Analytics → Dashboard → Cross-Brand',
        title: 'Set up cross-brand analytics dashboard',
        description:
          'Configure a leadership-level analytics dashboard that aggregates data across all brands: total pipeline, time-to-hire by entity, source effectiveness per brand, and consolidated DEI reporting. One login, complete oversight of the entire portfolio.',
        proTip:
          'Create scheduled weekly digests that show side-by-side brand performance. Leadership loves seeing which entity is hiring most efficiently — it drives healthy competition.',
      },
      {
        navPath: 'Settings → Job Templates → Create',
        title: 'Create shared job templates with brand-specific customization',
        description:
          'Build base job templates with your standard pipeline stages and triggers, then allow each brand to customize messaging, scorecards, and branding within the template. This ensures process consistency while respecting brand identity.',
      },
    ],
    spotlights: [
      {
        feature: 'Division Architecture',
        description:
          'Each brand gets its own career site, branding, workflows, and team permissions, but leadership sees a single unified dashboard across the entire portfolio. One login, complete oversight. No more juggling multiple vendor relationships, contracts, and data silos.',
      },
    ],
    results: {
      metrics: [
        { value: '60%', label: 'Cost reduction vs separate ATS licenses' },
        { value: '1', label: 'Unified dashboard for all brands' },
        { value: '100%', label: 'Brand consistency across entities' },
      ],
      caseStudy: {
        company: 'Multi-Entity Consolidation',
        result:
          'Multi-entity organizations using Teamtailor\'s division system eliminate an average of 3.2 redundant tools while giving each brand full creative control over their candidate experience.',
      },
    },
  },

  // ──────────────────────────────────────────────
  // 14. Candidate Communication Autopilot
  // ──────────────────────────────────────────────
  {
    id: 'playbook-communication-autopilot',
    title: 'Candidate Communication Autopilot',
    subtitle:
      'Build an always-on communication system where no candidate ever falls into a black hole. Every stage transition triggers a personalized message — from <60 second auto-acknowledgment to thoughtful rejection with feedback.',
    description:
      'Stop losing candidates to silence. Build an automated communication system where every stage transition triggers the right message at the right time — acknowledgment, updates, scheduling, and even rejection with feedback.',
    personas: ['Recruiters', 'Hiring Managers'],
    setupTime: '15 min',
    features: ['Triggers', 'Smart Schedule', 'Email Templates', 'Chat', 'NPS'],
    demoAreaIds: ['triggers', 'smart-schedule', 'templates'],
    automationFlow: [
      { icon: '📥', label: 'Stage', name: 'Application Received' },
      { icon: '⚡', label: 'Trigger', name: 'Auto-Acknowledge (<60 sec)' },
      { icon: '⚡', label: 'Trigger', name: 'Stage Change Auto-Update' },
      { icon: '📅', label: 'Trigger', name: 'Smart Schedule Auto-Books' },
      { icon: '💌', label: 'Result', name: 'Rejection With Feedback' },
    ],
    beforeList: [
      '5-7 day average response time to applications',
      'Candidates ghost from prolonged silence in the process',
      '80% dropout rate caused by communication delays',
      'Manual email copy-paste per candidate at every stage',
      'No rejection communication — candidates left in limbo, negative Glassdoor reviews',
    ],
    afterList: [
      '<60 second auto-acknowledgment on every application',
      'Every stage transition triggers a personalized update',
      'Automated interview scheduling via Smart Schedule self-booking',
      'Thoughtful rejection messages with personalized feedback',
      'Post-process NPS survey builds data and strengthens employer brand',
    ],
    needs: [
      { icon: '📧', name: 'Email Templates with Merge Tags', type: 'core' },
      { icon: '⚡', name: 'Stage-Based Triggers', type: 'core' },
      { icon: '📅', name: 'Smart Schedule', type: 'core' },
      { icon: '⭐', name: 'NPS Survey', type: 'core' },
    ],
    steps: [
      {
        navPath: 'Settings → Templates → Email → Create',
        title: 'Create email templates with merge tags for each pipeline stage',
        description:
          'Build personalized email templates for every candidate touchpoint: application acknowledgment, screening update, interview invitation, shortlist notification, and rejection. Use merge tags ({candidate_name}, {job_title}, {company_name}) to personalize at scale without manual editing.',
      },
      {
        navPath: 'Job → Triggers → Stage Transitions',
        title: 'Configure triggers to auto-send on stage transitions',
        description:
          'Set up a trigger on every pipeline stage that auto-sends the corresponding email template. Application received → acknowledgment. Moved to screening → update. Advanced to interview → scheduling link. Every candidate hears from you at every step — automatically.',
        proTip:
          'Add a 5-minute delay to auto-sends so it doesn\'t feel robotic. Candidates appreciate speed, but a 5-minute response feels human while a 2-second response feels automated.',
      },
      {
        navPath: 'Settings → Smart Schedule → Configure',
        title: 'Enable Smart Schedule for candidate self-booking',
        description:
          'Connect your team\'s calendars and configure Smart Schedule. When candidates reach the interview stage, they automatically receive a branded scheduling page showing available slots across all required interviewers. One click to book — zero email tennis.',
      },
      {
        navPath: 'Settings → Templates → Rejection',
        title: 'Set up rejection templates with personalized feedback',
        description:
          'Create thoughtful rejection templates that include personalized feedback based on the candidate\'s stage. A first-round rejection is different from a final-round rejection. Include encouragement, specific areas for growth, and an invitation to stay connected via your talent community.',
      },
      {
        navPath: 'Job → Triggers → "Rejected" / "Hired" Stage',
        title: 'Add NPS survey trigger post-process',
        description:
          'Add a trigger that sends a candidate NPS survey after the process concludes — for both hired and rejected candidates. This data reveals exactly how candidates experience your process, identifies communication gaps, and provides the metrics to prove your employer brand investment is working.',
      },
    ],
    spotlights: [
      {
        feature: 'Stage-Based Triggers',
        description:
          'Stage-Based Triggers are the backbone of candidate communication. Configure once, then every candidate automatically receives the right message at the right time. Acknowledgment on apply, updates on review, scheduling links on shortlist, and feedback on rejection. Zero manual effort after setup.',
      },
    ],
    results: {
      metrics: [
        { value: '<60s', label: 'Response time to every application' },
        { value: '80%', label: 'Reduction in candidate ghosting' },
        { value: '4.5/5', label: 'Average candidate NPS score' },
      ],
      caseStudy: {
        company: 'Communication-First Hiring',
        result:
          'Teams using Teamtailor\'s trigger-based communication report an 80% reduction in candidate drop-off and a 3x improvement in offer acceptance rates, driven by consistent, timely communication at every stage.',
      },
    },
  },

  // ──────────────────────────────────────────────
  // 15. Tame the Application Tsunami
  // ──────────────────────────────────────────────
  {
    id: 'playbook-application-tsunami',
    title: 'Tame the Application Tsunami',
    subtitle:
      'From 950 CVs to a ranked shortlist in seconds',
    description:
      'Application volumes have exploded 2-3x year-over-year as AI tools auto-apply for candidates. Enterprise teams are drowning — large retail groups process over 1M applications annually, QA receives 950 CVs over a single weekend, and Nebius went from 350K to 450K applications in one quarter. This playbook shows how to use AI screening criteria, knockout questions, and stack ranking to cut through the noise and surface qualified candidates instantly.',
    personas: ['TA Leaders', 'Recruiters', 'HR Managers'],
    setupTime: '15 min',
    features: ['AI Screening', 'Knockout Questions', 'Stack Ranking', 'Copilot', 'Candidate Comparison'],
    demoAreaIds: ['screening', 'candidates'],
    automationFlow: [
      { icon: '📩', label: 'Trigger', name: 'Applications flood in (hundreds per role)' },
      { icon: '🤖', label: 'Stage', name: 'AI screening criteria rank & score all candidates' },
      { icon: '❌', label: 'Stage', name: 'Knockout questions auto-disqualify unqualified' },
      { icon: '🏆', label: 'Result', name: 'Top 10% surfaced — recruiter reviews pre-sorted stack' },
    ],
    beforeList: [
      'Recruiters manually reading 150-950 CVs per role',
      'Store managers picking the first 10 alphabetically and ignoring the rest',
      '80% of applications are unqualified (wrong location, wrong experience)',
      'AI-generated applications indistinguishable from genuine candidates',
      'Top talent buried at the bottom of an unsorted pile',
    ],
    afterList: [
      'AI screens and ranks every applicant by up to 5 custom criteria',
      'Knockout questions auto-reject unqualified candidates before they enter the pipeline',
      'Copilot generates executive summaries of each candidate for quick review',
      'Side-by-side candidate comparison for final shortlisting',
      '89.3% accuracy across 5.2M+ candidates screened — bias detection built in',
    ],
    needs: [
      { icon: '🤖', name: 'AI Screening Criteria', type: 'core' },
      { icon: '❌', name: 'Knockout / Killer Questions', type: 'core' },
      { icon: '📊', name: 'Stack Ranking View', type: 'core' },
      { icon: '🧠', name: 'Copilot CV Summarizer', type: 'core' },
    ],
    steps: [
      {
        title: 'Define screening criteria per job template',
        description:
          'Set up to 5 screening criteria that match your ideal candidate profile — qualifications, years of experience, location, skills, and certifications. The AI will score and rank every applicant against these criteria automatically.',
        proTip:
          'Start with 3 criteria and refine after the first batch. The AI improves with feedback.',
      },
      {
        title: 'Configure knockout questions',
        description:
          'Add dealbreaker questions to your application form — right-to-work status, required certifications, minimum experience, willingness to relocate. Candidates who fail are auto-disqualified before entering your pipeline.',
      },
      {
        title: 'Enable Copilot CV summaries',
        description:
          'Turn on Copilot for the candidate view. Instead of reading full CVs, get an AI-generated executive summary highlighting key qualifications, experience gaps, and fit score for each candidate.',
      },
      {
        title: 'Set up bias detection alerts',
        description:
          'Enable screening criteria bias detection to ensure your AI ranking doesn\'t inadvertently discriminate. Teamtailor flags potentially biased criteria before they go live.',
      },
      {
        title: 'Review and refine with candidate comparison',
        description:
          'Use the side-by-side candidate comparison view to evaluate your top-ranked applicants. Compare qualifications, screening scores, and Copilot summaries in a single interface — no more tab-switching between CVs.',
      },
    ],
    spotlights: [
      {
        feature: 'The 89.3% Accuracy Engine',
        description:
          'Teamtailor\'s AI screening criteria has processed over 16 million candidates with 89.3% accuracy — verified against human recruiter decisions. Unlike black-box AI tools, every screening decision is explainable and adjustable. The system gets smarter as you hire, learning what "good" looks like for each role type. And with human-in-the-loop design, no candidate is ever auto-rejected without a recruiter\'s confirmation.',
      },
    ],
    results: {
      metrics: [
        { value: '89.3%', label: 'AI screening accuracy across 16M+ candidates' },
        { value: '90%', label: 'Reduction in manual screening time' },
        { value: '23x', label: 'Higher hire rate from AI-ranked vs unsorted pipeline' },
      ],
      caseStudy: {
        company: 'The Enterprise Volume Problem',
        result:
          'Large enterprise retail and hospitality teams routinely process over 1M applications annually. QA receives 950 CVs over a single weekend for apprenticeship roles. Without AI screening, recruiters either skim the top 10 alphabetically or burn out reading hundreds of unqualified CVs. AI screening criteria turns this from a 70-hour quarterly task into a 15-minute review of pre-ranked candidates.',
      },
    },
  },

  // ──────────────────────────────────────────────
  // 16. Solo Recruiter Survival Kit
  // ──────────────────────────────────────────────
  {
    id: 'playbook-solo-recruiter',
    title: 'The Solo Recruiter Survival Kit',
    subtitle:
      'You\'re a team of one doing the work of three. This playbook builds an always-on recruiting machine that screens, schedules, and communicates for you — so you can focus on the humans, not the admin.',
    description:
      'Stop drowning in admin. Build an automation layer that screens applications, auto-rejects unqualified candidates, books interviews, and sends every update — so one recruiter operates like a team of three.',
    personas: ['Recruiters', 'HR Managers'],
    setupTime: '12 min',
    features: ['AI Screening', 'Knockout Questions', 'Smart Schedule', 'Copilot', 'Triggers', 'Career Site'],
    demoAreaIds: ['ai', 'smart-schedule', 'triggers'],
    automationFlow: [
      { icon: '🎨', label: 'Stage', name: 'Career Site Attracts Candidates' },
      { icon: '❌', label: 'Trigger', name: 'Knockout Auto-Rejects Unqualified' },
      { icon: '🤖', label: 'Trigger', name: 'AI Ranks the Remaining 30%' },
      { icon: '📅', label: 'Trigger', name: 'Smart Schedule Auto-Books Interviews' },
      { icon: '🧠', label: 'Result', name: 'Copilot Preps You in 30 Seconds' },
    ],
    beforeList: [
      'Reading 70%+ unqualified CVs manually every morning',
      'Scheduling interviews via email tennis (3-5 back-and-forth per candidate)',
      'Copy-pasting rejection emails one by one',
      'No time for strategic work — 80% of your day is admin',
      'Candidate experience suffers because you\'re stretched too thin',
    ],
    afterList: [
      'Knockout questions auto-reject the 70% who don\'t qualify',
      'AI screening ranks the remaining 30% by fit — you review a sorted list',
      'Smart Schedule sends booking links automatically — zero email tennis',
      'Stage-based triggers handle all candidate communication',
      'Copilot gives you a 30-second briefing before every call',
    ],
    needs: [
      { icon: '🤖', name: 'AI Screening Criteria', type: 'core' },
      { icon: '❌', name: 'Knockout Questions', type: 'core' },
      { icon: '📅', name: 'Smart Schedule', type: 'core' },
      { icon: '🧠', name: 'Copilot', type: 'core' },
      { icon: '⚡', name: 'Stage-Based Triggers', type: 'core' },
    ],
    steps: [
      {
        navPath: 'Career Site → Design',
        title: 'Build a career page that sells for you 24/7',
        description:
          'As a solo recruiter, your career page IS your employer brand team. Use the drag-and-drop editor to create a compelling page with team photos, benefits, and culture content. It takes 15 minutes and replaces hours of sourcing outreach — candidates come to you.',
        proTip:
          'Add a Connect section so passive visitors can express interest even when no role matches. 30% of hires come from Connect talent pools within 6 months.',
      },
      {
        navPath: 'Job → Application Form → Knockout Questions',
        title: 'Add knockout questions to auto-reject the unqualified',
        description:
          'Add 2-3 dealbreaker questions to your application form: right-to-work status, required certifications, minimum experience. Candidates who fail are auto-disqualified before they enter your pipeline. This alone cuts your review pile by 40-70%.',
      },
      {
        navPath: 'Job → AI Screening → Configure',
        title: 'Set up AI screening criteria to rank who\'s left',
        description:
          'Define up to 5 screening criteria that match your ideal candidate profile. The AI scores and ranks every applicant who passes knockout questions. You open your inbox to a sorted list — best candidates first, not alphabetical.',
        proTip:
          'Start with 3 criteria and refine after the first batch. The AI improves with your feedback over time.',
      },
      {
        navPath: 'Settings → Smart Schedule → Configure',
        title: 'Enable Smart Schedule for one-click interview booking',
        description:
          'Connect your calendar and configure Smart Schedule. When candidates reach the interview stage, they receive a branded self-booking page with your available slots. One click to book, zero email coordination. You just show up.',
      },
      {
        navPath: 'Job → Triggers → Configure',
        title: 'Wire up triggers so candidates always hear from you',
        description:
          'Set up a trigger on every pipeline stage: auto-acknowledge on apply (<60 sec), update on screening, scheduling link on shortlist, rejection with feedback at the end. Every candidate hears from you at every step — automatically — while you focus on interviews.',
      },
    ],
    spotlights: [
      {
        feature: 'The Virtual Recruiting Team',
        description:
          'A solo recruiter with Teamtailor isn\'t really solo. Knockout questions are your first screener. AI screening criteria is your second screener. Smart Schedule is your coordinator. Triggers are your communications assistant. Copilot is your research analyst. Together, they give one person the output of a three-person team.',
      },
    ],
    results: {
      metrics: [
        { value: '3x', label: 'Capacity increase for solo recruiters' },
        { value: '70%', label: 'Reduction in manual CV screening' },
        { value: '0', label: 'Scheduling emails sent per interview' },
      ],
      caseStudy: {
        company: 'Real Pattern: Eagle Mountain Casino',
        result:
          '"I think we\'re reaching her limits right now." Eagle Mountain\'s solo recruiter Elvira was manually processing 70%+ unqualified applications. With AI screening + knockout questions, qualified candidates surface instantly — one person managing the entire pipeline.',
      },
    },
  },

  // ──────────────────────────────────────────────
  // 17. Zero to Live: Your First ATS in 7 Days
  // ──────────────────────────────────────────────
  {
    id: 'playbook-first-ats',
    title: 'Zero to Live: Your First ATS in 7 Days',
    subtitle:
      'You have no ATS, no career page, and maybe no digital hiring process at all. This is the step-by-step blueprint to go from paper applications and inbox chaos to a fully automated hiring system — in one week.',
    description:
      'No ATS. No career page. Maybe still using paper applications. This playbook takes you from zero digital infrastructure to a fully operational hiring system with a branded career site, online applications, automated screening, and pipeline tracking — in 7 days.',
    personas: ['HR Managers', 'TA Leaders'],
    setupTime: '20 min',
    features: ['Career Site', 'Application Forms', 'QR Codes', 'Knockout Questions', 'Pipeline', 'Connect', 'Job Boards'],
    demoAreaIds: ['career-site', 'candidates', 'settings'],
    automationFlow: [
      { icon: '🏗️', label: 'Stage', name: 'Build Career Page (Day 1-2)' },
      { icon: '📱', label: 'Trigger', name: 'QR Codes for Walk-Ins (Day 3)' },
      { icon: '📋', label: 'Trigger', name: 'Online Forms Replace Paper (Day 3)' },
      { icon: '🤖', label: 'Trigger', name: 'AI Screening Goes Live (Day 5)' },
      { icon: '🚀', label: 'Result', name: 'Full Pipeline Tracking (Day 7)' },
    ],
    beforeList: [
      'Paper applications or PDF forms emailed to candidates',
      'No career page — or the hosting provider shut it down',
      'Candidate data scattered across email, spreadsheets, and filing cabinets',
      'No way to track where you are with any candidate',
      'Every new hire starts with "let me dig through my inbox"',
    ],
    afterList: [
      'Branded career page live on your own domain — no developer needed',
      'Online application forms with mobile-first design',
      'QR codes for walk-in candidates at events, job fairs, and in-store',
      'Every candidate tracked in one pipeline with full activity history',
      'AI screening + knockout questions from day one',
    ],
    needs: [
      { icon: '🎨', name: 'Career Site Builder', type: 'core' },
      { icon: '📋', name: 'Application Forms', type: 'core' },
      { icon: '📱', name: 'QR Code Generator', type: 'core' },
      { icon: '❌', name: 'Knockout Questions', type: 'core' },
      { icon: '📊', name: 'Pipeline Tracking', type: 'core' },
      { icon: '📢', name: 'Job Board Integrations', type: 'integration' },
    ],
    steps: [
      {
        navPath: 'Career Site → Design → Pages',
        title: 'Day 1-2: Build your career page',
        description:
          'Use the drag-and-drop editor to create your careers destination. Add a hero section, team photos, department pages, and a benefits overview. No developer needed — it\'s live on your domain within hours. This replaces whatever you had before (or didn\'t have).',
        proTip:
          'If your previous careers page was shut down (like Iowa Colony\'s CivicPlus page), Teamtailor hosts your career site for you — no third-party hosting needed.',
      },
      {
        navPath: 'Job → Create → Application Form',
        title: 'Day 2-3: Create your first job with an online application form',
        description:
          'Create your first job posting with a structured application form — name, email, phone, resume upload, and custom questions. This replaces paper applications, PDFs, and "email your resume to hr@company.com" forever.',
      },
      {
        navPath: 'Settings → Job Boards → Connect',
        title: 'Day 3: Connect job boards for instant distribution',
        description:
          'Connect to Indeed, LinkedIn, Glassdoor, Google Jobs, and ZipRecruiter. When you publish a job, it automatically distributes to all connected boards. No more manually posting to each site individually.',
      },
      {
        navPath: 'Career Site → QR Code',
        title: 'Day 3-4: Generate QR codes for walk-in applicants',
        description:
          'Generate QR codes that link directly to specific job applications or your general career page. Print them for job fairs, in-store displays, break rooms, and event booths. Walk-in candidates scan and apply on their phone in under 2 minutes.',
      },
      {
        navPath: 'Job → Screening → Configure',
        title: 'Day 5: Enable knockout questions and AI screening',
        description:
          'Add knockout questions (right-to-work, certifications, location) to auto-reject unqualified applicants. Then set up AI screening criteria to rank the rest. You went from paper to intelligent automation in less than a week.',
      },
      {
        navPath: 'Career Site → Settings → Connect',
        title: 'Day 6-7: Enable Connect for passive talent capture',
        description:
          'Turn on Connect so visitors can express interest in your company even when no current role matches. They upload their CV, select preferred departments, and join your talent pool. When a new role opens, you already have warm candidates waiting.',
      },
    ],
    spotlights: [
      {
        feature: 'From Nothing to Everything',
        description:
          'Companies with no ATS aren\'t just missing a tool — they\'re missing the entire infrastructure. Teamtailor replaces paper applications, hosting providers, job board logins, email chains, and spreadsheet tracking with one system. The career page builder alone replaces a web developer. The application forms replace paper. The pipeline replaces your inbox. And it\'s all live in a week.',
      },
    ],
    results: {
      metrics: [
        { value: '7 days', label: 'From zero to fully operational' },
        { value: '128', label: 'Job boards connected instantly' },
        { value: '100%', label: 'Candidate tracking from day one' },
      ],
      caseStudy: {
        company: 'Real Pattern: City of Iowa Colony',
        result:
          '"We don\'t even have a way for people to apply really... literally I have nothing." — Kimberlei Brisbane, HR Manager. Iowa Colony went from zero HR technology — no ATS, no career page, no digital application process — to evaluating a complete hiring system. Paper-based municipal HR is a pattern we see across government, tribal, and small organizations.',
      },
    },
  },

  // ──────────────────────────────────────────────
  // 18. The CFO Business Case Builder
  // ──────────────────────────────────────────────
  {
    id: 'playbook-cfo-business-case',
    title: 'Build the Business Case: The CFO Pitch Kit',
    subtitle:
      'Your CFO needs data, not promises. This playbook gives you the exact stats, ROI framework, and co-authored proposal template to get budget sign-off — aligned to your fiscal year cycle.',
    description:
      'TA leaders need to justify ATS investment internally. This playbook provides the cost analysis framework, benchmark data, and ROI projections to build an airtight business case that gets the CFO to say yes.',
    personas: ['TA Leaders', 'HR Managers'],
    setupTime: '15 min',
    features: ['Analytics', 'ROI Calculator', 'Benchmarks', 'Custom Reports'],
    demoAreaIds: ['analytics', 'reports'],
    automationFlow: [
      { icon: '📊', label: 'Stage', name: 'Baseline Current Costs' },
      { icon: '💰', label: 'Trigger', name: 'Calculate Cost-per-Vacancy' },
      { icon: '🤖', label: 'Trigger', name: 'Project AI Screening ROI' },
      { icon: '📈', label: 'Trigger', name: 'Show Benchmark Improvements' },
      { icon: '📋', label: 'Result', name: 'Co-Author the Proposal' },
    ],
    beforeList: [
      'No concrete data to justify the investment to the CFO',
      'Can\'t calculate current cost-per-hire or cost-per-vacancy',
      'No benchmarks to show what "good" looks like',
      'Budget requests get deprioritized because they lack ROI evidence',
      'The business case is a PowerPoint with guesses, not data',
    ],
    afterList: [
      'Cost-per-vacancy calculated: £408/day average (industry benchmark)',
      'AI screening ROI: 5.4x more likely to hire candidates who hit all criteria',
      'Capacity data: 3x recruiter throughput with AI screening',
      'Platform-wide benchmarks: 6M+ applications analyzed, 89.3% accuracy',
      'Co-authored proposal document aligned to your budget cycle',
    ],
    needs: [
      { icon: '📊', name: 'Analytics Dashboard', type: 'core' },
      { icon: '💰', name: 'ROI Calculator', type: 'core' },
      { icon: '📈', name: 'Benchmark Data', type: 'core' },
      { icon: '📋', name: 'Proposal Template', type: 'core' },
    ],
    steps: [
      {
        title: 'Calculate the current cost of doing nothing',
        description:
          'Work with your prospect to baseline their current costs: recruiter hours spent on manual screening (hours × hourly rate), cost-per-vacancy per day (average £408/day across UK market), time-to-hire benchmarks, and agency spend. This is the "before" number the CFO will anchor on.',
        proTip:
          'Frame it as "the cost of the problem, not the cost of the solution." A £408/day vacancy cost on 20 open roles = £8,160/day = £163K/month the business is bleeding.',
      },
      {
        title: 'Deploy the AI screening ROI projection',
        description:
          'Show the data: across 16M+ candidates screened on Teamtailor, candidates who hit all AI screening criteria are 5.4x more likely to be hired. Recruiters using AI screening see a 3x capacity increase. 89.3% accuracy rate — verified against human decisions. These aren\'t projections, they\'re actuals from the platform.',
      },
      {
        title: 'Map improvements to their specific pain points',
        description:
          'Use their baseline metrics to project specific improvements: if their current time-to-hire is 45 days, benchmark data shows 30-58% reduction (Motorpoint: 58%, Lotus: 55→23 days). If screening takes 20 hrs/week, AI screening cuts that by 90%. Make it their numbers, not generic stats.',
      },
      {
        title: 'Align the proposal to their budget cycle',
        description:
          'Understand when their fiscal year starts and when budget requests need to be submitted. Build the timeline backward from that date. If budget sign-off is in September, the proposal needs to land in July with internal socialization in June.',
        proTip:
          'Offer to co-author the business case. Catherine at Shore Trust loved this: "An ATS is a fundamental tool that we need, so it\'s not like we\'re asking for something extra." Frame it as operational infrastructure, not discretionary spend.',
      },
      {
        title: 'Provide the proof-of-concept trial environment',
        description:
          'Offer a sandbox trial so the champion can show the CFO a live, working system — not slides. Seeing AI screening sort 100 real CVs in seconds is worth more than any ROI spreadsheet. Let the product sell itself during the internal pitch.',
      },
    ],
    spotlights: [
      {
        feature: 'The Data Arsenal',
        description:
          'Teamtailor has analyzed 16M+ candidates with 89.3% AI screening accuracy. The platform data tells the story: 5.4x hire rate multiplier, 3x recruiter capacity, 30-58% time-to-hire reduction. When your CFO asks "where did these numbers come from?" — they come from 16 million real candidates, not a vendor whitepaper.',
      },
    ],
    results: {
      metrics: [
        { value: '5.4x', label: 'Higher hire rate with AI screening' },
        { value: '£408', label: 'Average daily cost per open vacancy' },
        { value: '3x', label: 'Recruiter capacity increase with AI' },
      ],
      caseStudy: {
        company: 'Real Pattern: Shore Trust',
        result:
          'Catherine at Shore Trust was building a September budget cycle proposal. Ed co-authored the business case live on the call, deploying the 6M applications stat, the 5.4x multiplier, and the £408/day vacancy cost. Catherine\'s reaction: "An ATS is a fundamental tool that we need." The data reframed it from a nice-to-have to operational infrastructure.',
      },
    },
  },

  // ──────────────────────────────────────────────
  // 19. The Seasonal Hiring Machine
  // ──────────────────────────────────────────────
  {
    id: 'playbook-seasonal-hiring',
    title: 'The Seasonal Hiring Machine',
    subtitle:
      'Build a returning-talent engine that eliminates re-sourcing costs every season. Your best seasonal workers come back automatically — and new applicants are screened, scheduled, and onboarded at scale.',
    description:
      'Stop starting from zero every hiring season. Build a system where returning staff are automatically re-engaged, new applicants hit knockout screening, and mass onboarding runs itself — whether you\'re hiring 50 or 450.',
    personas: ['HR Managers', 'Recruiters', 'TA Leaders'],
    setupTime: '15 min',
    features: ['Connect', 'Nurture Campaigns', 'Job Templates', 'Knockout Questions', 'Smart Schedule', 'Triggers'],
    demoAreaIds: ['connect', 'triggers', 'templates'],
    automationFlow: [
      { icon: '🏷️', label: 'Stage', name: 'End-of-Season: Tag Staff in Connect' },
      { icon: '💌', label: 'Trigger', name: 'Off-Season: Nurture Sequence' },
      { icon: '📢', label: 'Trigger', name: 'Pre-Season: Returning Staff Notification' },
      { icon: '❌', label: 'Trigger', name: 'New Apps: Knockout + AI Screen' },
      { icon: '📅', label: 'Result', name: 'Mass Scheduling for Orientation' },
    ],
    beforeList: [
      'Starting from zero every season — re-sourcing the same roles annually',
      'No way to reach last year\'s best performers automatically',
      'Manually processing hundreds of seasonal applications in a 2-week window',
      'Orientation scheduling is a nightmare with 50-450 new hires',
      'Top returning staff get poached because you\'re too slow to reach out',
    ],
    afterList: [
      'All seasonal staff tagged and stored in Connect talent pool year-round',
      'Automated nurture emails keep returning staff warm in the off-season',
      'One-click "returning staff" notification when the season opens',
      'Returning staff skip screening — they\'re already proven',
      'New applicants hit knockout + AI screening automatically',
    ],
    needs: [
      { icon: '🤝', name: 'Connect (Talent Community)', type: 'core' },
      { icon: '💌', name: 'Nurture Campaigns', type: 'core' },
      { icon: '📋', name: 'Job Templates', type: 'core' },
      { icon: '❌', name: 'Knockout Questions', type: 'core' },
      { icon: '📅', name: 'Smart Schedule', type: 'core' },
    ],
    steps: [
      {
        title: 'Build the returning-talent pool in Connect',
        description:
          'At the end of each season, tag all seasonal staff in Connect with their department, role type, and performance rating (top performer / solid / do-not-rehire). This creates a persistent, searchable talent pool that carries over year after year.',
        proTip:
          'Tag top performers with a "VIP" label. When next season opens, they get a personal outreach before general applications open — first dibs on returning.',
      },
      {
        navPath: 'Nurture → New Campaign',
        title: 'Create off-season nurture sequences',
        description:
          'Build a 3-touch nurture campaign that fires during the off-season: a "thanks for a great season" email in October, a "what\'s coming next year" teaser in January, and a "we\'re hiring — come back" notification in March. Returning staff apply with one click.',
      },
      {
        navPath: 'Settings → Job Templates → Seasonal',
        title: 'Create seasonal job templates with pre-wired automation',
        description:
          'Build job templates for your recurring seasonal roles with knockout questions, AI screening criteria, and stage-based triggers already configured. Opening 20 seasonal roles becomes a 5-minute task — not a 2-hour setup.',
      },
      {
        title: 'Configure separate pipelines for returning vs. new',
        description:
          'Set up your pipeline so returning staff (tagged in Connect) skip the screening stage and go directly to orientation scheduling. New applicants go through the full knockout + AI screening pipeline. Two paths, one job posting, fully automated.',
      },
      {
        navPath: 'Smart Schedule → Mass Booking',
        title: 'Set up mass scheduling for orientation sessions',
        description:
          'Configure Smart Schedule for group orientation slots. Instead of booking 200 individual meetings, set up 10 orientation sessions and let candidates self-book into available slots. One calendar, 200 hires, zero scheduling emails.',
      },
    ],
    spotlights: [
      {
        feature: 'The Returning-Talent Flywheel',
        description:
          'Every season, your talent pool grows. Year 1: you hire 200, tag 150 as "rehire-worthy." Year 2: those 150 get a nurture sequence and 60% return — you only need to source 80 new hires instead of 200. By Year 3, returning staff are 50%+ of your seasonal workforce. Connect makes seasonality your competitive advantage, not your biggest headache.',
      },
    ],
    results: {
      metrics: [
        { value: '60%', label: 'Returning staff rate with nurture campaigns' },
        { value: '50%', label: 'Reduction in seasonal sourcing costs' },
        { value: '5 min', label: 'To open 20 pre-configured seasonal roles' },
      ],
      caseStudy: {
        company: 'Real Pattern: The Fresh Air Fund',
        result:
          '"We have about 450 seasonal staff that we hire from June through August. We pretty much hire 40% of our applications." — Cecelia. The Fresh Air Fund hires 450 seasonal camp counselors across 6 summer camps. Connect talent pools could eliminate re-sourcing entirely for returning staff, and knockout questions filter the 60% who don\'t qualify.',
      },
    },
  },

  // ──────────────────────────────────────────────
  // 20. Government & Public Sector Hiring
  // ──────────────────────────────────────────────
  {
    id: 'playbook-government',
    title: 'Government & Public Sector Hiring Playbook',
    subtitle:
      'Navigate the unique buying process of government, tribal, and public sector organizations — multi-level approvals, fiscal year budget cycles, IT security reviews, and compliance mandates that commercial ATS vendors never think about.',
    description:
      'Government and public sector hiring has unique requirements: fiscal year budget cycles, multi-level approval chains, IT security reviews, EEO/compliance reporting, and integration with public-sector payroll systems. This playbook addresses all of it.',
    personas: ['HR Managers', 'TA Leaders'],
    setupTime: '20 min',
    features: ['Career Site', 'GDPR/Compliance', 'ADP Integration', 'Analytics', 'Audit Trail', 'Connect'],
    demoAreaIds: ['career-site', 'settings', 'analytics'],
    automationFlow: [
      { icon: '🏛️', label: 'Stage', name: 'Budget Cycle Alignment' },
      { icon: '🔒', label: 'Trigger', name: 'IT Security Review' },
      { icon: '📋', label: 'Trigger', name: 'Multi-Level Approval Chain' },
      { icon: '🎨', label: 'Trigger', name: 'Career Page Replaces Defunct Site' },
      { icon: '📊', label: 'Result', name: 'EEO/Compliance Reporting Built In' },
    ],
    beforeList: [
      'Career page was shut down by the hosting provider',
      'Using PDF job descriptions emailed to applicants',
      'No digital application process — literally paper-based',
      'Multiple disconnected systems for payroll, benefits, and HR',
      'Buying process requires Director → GM → CFO → Board approval',
    ],
    afterList: [
      'Teamtailor-hosted career page — no third-party hosting needed',
      'Online application forms with EEO/compliance fields built in',
      'ADP/BambooHR integration for payroll and benefits',
      'Full audit trail for every candidate action (compliance-ready)',
      'Budget-friendly pricing that fits within government ceilings',
    ],
    needs: [
      { icon: '🎨', name: 'Career Site Builder', type: 'core' },
      { icon: '🔒', name: 'GDPR & Compliance Engine', type: 'core' },
      { icon: '📊', name: 'EEO Reporting', type: 'core' },
      { icon: '🔗', name: 'ADP / BambooHR', type: 'integration' },
      { icon: '📝', name: 'Audit Trail', type: 'core' },
    ],
    steps: [
      {
        title: 'Understand the budget cycle and approval chain',
        description:
          'Government procurement is different. Map the fiscal year (many start October 1), identify the budget request deadline, and understand the approval chain: typically Department Head → City Manager/GM → CFO → Board/Council. Start the conversation 3-6 months before the budget deadline.',
        proTip:
          'Ask about their budget ceiling early. Iowa Colony\'s City Manager gave a $10-12K ceiling for all HR (excluding payroll). Knowing the number lets you position the ATS as the anchor of their HR stack, with room for HRIS partners.',
      },
      {
        navPath: 'Career Site → Design',
        title: 'Replace the defunct government career page',
        description:
          'Many government websites use providers like CivicPlus who charge extra for features or shut down sections (Iowa Colony\'s career page was disabled over encryption costs). Teamtailor hosts your career page as part of the platform — no additional hosting fees, no IT dependency, HTTPS by default.',
      },
      {
        navPath: 'Settings → Compliance',
        title: 'Configure compliance and EEO reporting',
        description:
          'Enable EEO data collection fields, set up data retention policies for candidate information, and configure the audit trail. Government HR departments need to demonstrate compliance during audits — every action on every candidate is logged and exportable.',
      },
      {
        navPath: 'Settings → Integrations → Marketplace',
        title: 'Connect HRIS/payroll partner (ADP or BambooHR)',
        description:
          'Government organizations typically need both ATS and HRIS. Position Teamtailor as the recruiting front-end paired with ADP or BambooHR for payroll and benefits. Offer to facilitate partner introductions — Jack\'s playbook with Iowa Colony was researching ADP and BambooHR government capabilities.',
      },
      {
        title: 'Prepare for the IT security review',
        description:
          'Government IT teams will want to know about data residency, encryption, SSO/SAML, and SOC 2 compliance. Prepare the security documentation package before the IT review meeting. Proactively addressing security concerns prevents the 2-3 week delay of waiting for IT to ask questions.',
      },
    ],
    spotlights: [
      {
        feature: 'Government-Ready Infrastructure',
        description:
          'Teamtailor is GDPR-compliant, SOC 2 certified, and hosts career pages with HTTPS by default. The audit trail logs every candidate interaction for compliance reviews. EEO reporting is built in. And the pricing model ($2,800-$6,000/year) fits within typical government HR technology budgets — unlike enterprise platforms that start at $50K+.',
      },
    ],
    results: {
      metrics: [
        { value: '$4,125', label: 'Typical government ATS quote' },
        { value: '100%', label: 'Audit trail coverage for compliance' },
        { value: '7 days', label: 'Career page live after kickoff' },
      ],
      caseStudy: {
        company: 'Real Pattern: City of Iowa Colony',
        result:
          '"We don\'t even have a way for people to apply really... literally I have nothing." — Kimberlei Brisbane, HR Manager. A 35-employee Texas city government with zero HR technology. CivicPlus shut down their career page. Only FundView for payroll. Jack positioned TT as ATS ($4,125) paired with ADP or BambooHR for HRIS — fitting within the $10-12K budget ceiling set by the City Manager.',
      },
    },
  },

  // ──────────────────────────────────────────────
  // 21. The Lever Displacement Playbook
  // ──────────────────────────────────────────────
  {
    id: 'playbook-lever-displacement',
    title: 'The Lever Displacement Playbook',
    subtitle:
      'Lever users know what they\'re missing — analytics, scheduling automation, AI screening, and a real career page. This playbook exploits every gap with a structured demo flow and contract alignment strategy.',
    description:
      'Win the Lever displacement by targeting the 5 capabilities Lever doesn\'t have: real analytics, scheduling automation, AI screening, career page CMS, and interview kits. Align contract timing with Lever renewal for a seamless switch.',
    personas: ['Recruiters', 'TA Leaders'],
    setupTime: '10 min',
    features: ['Analytics', 'Smart Schedule', 'AI Screening', 'Career Site', 'Interview Kits'],
    demoAreaIds: ['analytics', 'smart-schedule', 'ai', 'career-site'],
    automationFlow: [
      { icon: '🔍', label: 'Stage', name: 'Expose the Analytics Gap' },
      { icon: '📅', label: 'Stage', name: 'Demo Smart Schedule vs. Email Tennis' },
      { icon: '🤖', label: 'Trigger', name: 'Show AI Screening (Lever Has None)' },
      { icon: '🎨', label: 'Trigger', name: 'Career Page Comparison' },
      { icon: '💰', label: 'Result', name: 'Price Anchor: More Value, Fair Price' },
    ],
    beforeList: [
      'No analytics — tracking pipeline metrics in Excel spreadsheets',
      'No scheduling automation — email tennis for every interview',
      'No AI screening — manually reading every CV',
      'Basic career page with no customization or CMS',
      'No interview kits — unstructured interviews with no consistency',
    ],
    afterList: [
      'Full analytics dashboard: time-to-hire, source ROI, conversion rates',
      'Smart Schedule: candidates self-book, panel interviews auto-coordinate',
      'AI screening criteria: rank and score every applicant automatically',
      'Full CMS career page with drag-and-drop editor and video support',
      'Interview kits with structured questions and AI auto-fill',
    ],
    needs: [
      { icon: '📊', name: 'Analytics Dashboard', type: 'core' },
      { icon: '📅', name: 'Smart Schedule', type: 'core' },
      { icon: '🤖', name: 'AI Screening Criteria', type: 'core' },
      { icon: '🎨', name: 'Career Site Builder', type: 'core' },
      { icon: '📝', name: 'Interview Kits', type: 'core' },
    ],
    steps: [
      {
        title: 'Open with the analytics question — it always lands',
        description:
          'Start discovery with: "How are you tracking pipeline metrics in Lever?" The answer is always some version of "we\'re using Excel." Lever\'s native reporting is extremely limited. This establishes the first gap and primes them for the analytics dashboard demo.',
        proTip:
          'Jack Reddington at Kaleidoscope said: "Lever doesn\'t really have anything like even remotely close to this. A lot of the time I\'m just putting in dates for when I screen people on an Excel sheet." Let the prospect discover the gap themselves.',
      },
      {
        navPath: 'Smart Schedule → Demo',
        title: 'Demo Smart Schedule against Lever\'s email scheduling',
        description:
          'Lever has no native scheduling automation. Show Smart Schedule with calendar integration: candidate receives a branded self-booking page, picks a slot, confirmation auto-sent, calendar auto-blocked. Compare this to their current process of 3-5 back-and-forth emails per interview.',
      },
      {
        navPath: 'AI Screening → Demo',
        title: 'Show AI screening — Lever\'s biggest missing capability',
        description:
          'Lever has no AI screening at all. Demo the screening criteria: define 3-5 requirements, AI scores and ranks every applicant, Copilot generates CV summaries. This is usually the biggest "wow" moment for Lever users who\'ve been reading every CV manually.',
      },
      {
        navPath: 'Career Site → Demo',
        title: 'Career page comparison — show what\'s possible',
        description:
          'Pull up a compelling career page example (Oatly, Kaleidoscope\'s Aldi packaging work). Lever career pages are functional but plain — no video, no blog, no custom layouts. The visual contrast sells itself.',
      },
      {
        title: 'Align contract timing with Lever renewal date',
        description:
          'Ask when their Lever contract renews. Offer free onboarding months to bridge the gap between signing and go-live, so they\'re not paying for two systems simultaneously. Kaleidoscope\'s Lever renewal was in July — Jamie offered free months to align.',
        proTip:
          'The pricing conversation: Teamtailor will likely be slightly more than Lever, but includes more. Frame it as Jack Reddington did: "It is more than what we\'re paying Lever now, but there\'s more included." Value, not price.',
      },
    ],
    spotlights: [
      {
        feature: 'The Lever Gap Analysis',
        description:
          'Lever was built as a sourcing-first CRM that added ATS features over time. It shows: limited analytics, no scheduling automation, no AI screening, basic career pages, and no interview kits. Teamtailor was built as a complete hiring platform from day one. Every feature Lever is missing is a native Teamtailor capability — not a bolt-on or integration.',
      },
    ],
    results: {
      metrics: [
        { value: '5', label: 'Major capability gaps vs. Lever' },
        { value: '0', label: 'Integration fees (Lever charges extra)' },
        { value: '∞', label: 'Unlimited users (Lever charges per seat)' },
      ],
      caseStudy: {
        company: 'Real Deal: Kaleidoscope',
        result:
          '"That was a fantastic demo. Arguably one of the coolest ones I\'ve seen yet." — Jack Reddington, after comparing Teamtailor to Lever. Kaleidoscope (60-person design agency, Chicago) was on Lever for 2 years. The analytics dashboard, Smart Schedule, and AI screening were the three decisive gaps. $6,000/year quote — "a fair price" per the prospect. Follow-up demo with decision-maker Ryan and sales manager Jamie confirmed the switch.',
      },
    },
  },

  // ──────────────────────────────────────────────
  // 22. The Staffing Agency Playbook
  // ──────────────────────────────────────────────
  {
    id: 'playbook-staffing-agency',
    title: 'The Staffing Agency Playbook',
    subtitle:
      'Staffing agencies don\'t hire for themselves — they place candidates for clients. This playbook configures Teamtailor for multi-client pipeline management, candidate sharing, rapid job distribution, and agency-specific workflows.',
    description:
      'Staffing and recruiting agencies use an ATS differently: multi-client pipelines, candidate reusability across roles, rapid job board distribution, and client-specific branding. This playbook sets up Teamtailor for agency operations from day one.',
    personas: ['Recruiters', 'TA Leaders'],
    setupTime: '15 min',
    features: ['Departments', 'Job Templates', 'Connect', 'Job Boards', 'API', 'Career Site'],
    demoAreaIds: ['settings', 'candidates', 'career-site'],
    automationFlow: [
      { icon: '🏢', label: 'Stage', name: 'Configure Client Departments' },
      { icon: '📋', label: 'Trigger', name: 'Client-Specific Job Templates' },
      { icon: '📢', label: 'Trigger', name: 'Multi-Board Job Distribution' },
      { icon: '🤝', label: 'Trigger', name: 'Candidate Pool Across Clients' },
      { icon: '📊', label: 'Result', name: 'Client-Level Reporting' },
    ],
    beforeList: [
      'Managing candidate pipelines for multiple clients in one cluttered workspace',
      'No way to share strong candidates across client engagements',
      'Posting to job boards manually for each client\'s roles',
      'Can\'t report on placement metrics per client',
      'Candidate database resets to zero for every new client engagement',
    ],
    afterList: [
      'Departments as client containers — each with its own pipeline and branding',
      'Connect talent pool: one candidate database searchable across all clients',
      'Bulk job board posting to 128+ boards with one click per role',
      'Client-level analytics: time-to-fill, source effectiveness, placement rates',
      'API access for custom integrations with your CRM or invoicing system',
    ],
    needs: [
      { icon: '🏢', name: 'Departments (Client Containers)', type: 'core' },
      { icon: '📋', name: 'Job Templates', type: 'core' },
      { icon: '🤝', name: 'Connect (Candidate Database)', type: 'core' },
      { icon: '📢', name: '128+ Job Board Integrations', type: 'core' },
      { icon: '🔑', name: 'Open API', type: 'core' },
    ],
    steps: [
      {
        navPath: 'Settings → Departments → Create',
        title: 'Create departments for each client engagement',
        description:
          'Use Teamtailor\'s department structure to create a container for each client. Each department gets its own jobs, pipeline, and permissions — so recruiters can filter by client without mixing candidate pools. Think of departments as your client folders.',
      },
      {
        navPath: 'Settings → Job Templates → Create',
        title: 'Build job templates per client or role type',
        description:
          'Create templates for your most common placement types: IT contractor, executive search, light industrial, etc. Pre-configure screening questions, pipeline stages, and auto-messaging so opening a new role for a client takes 2 minutes, not 20.',
      },
      {
        navPath: 'Career Site → Design',
        title: 'Build your agency career page for candidate attraction',
        description:
          'Your career page is your candidate-facing brand. Build a page that showcases the types of roles you place, industries you serve, and benefits of working with your agency. Candidates apply once and enter your talent pool for all future placements.',
      },
      {
        navPath: 'Connect → Talent Pool',
        title: 'Configure Connect as your cross-client candidate database',
        description:
          'Enable Connect so every candidate who applies or expresses interest joins your master talent pool. When a new client engagement starts, search Connect first — you may already have qualified candidates from a previous placement. This is the compounding advantage agencies need.',
        proTip:
          'Tag candidates by skill set, industry, and availability. When a client calls with an urgent req, search "Python + available + senior" and get results in 5 seconds instead of posting and waiting.',
      },
      {
        navPath: 'Settings → Integrations → Job Boards',
        title: 'Connect job boards for rapid multi-board distribution',
        description:
          'Connect Indeed, LinkedIn, Dice, ZipRecruiter, and niche industry boards. When a client gives you a role, publish it to all relevant boards simultaneously. Track which board delivers the best candidates per role type and optimize your spend.',
      },
    ],
    spotlights: [
      {
        feature: 'The Compounding Talent Pool',
        description:
          'Most agencies start from zero on every engagement. With Connect, every candidate from every placement stays in your searchable database. A developer who didn\'t fit Client A might be perfect for Client B next month. After 6 months, your talent pool is your biggest competitive advantage — it\'s why clients come back to you instead of going to competitors.',
      },
    ],
    results: {
      metrics: [
        { value: '128+', label: 'Job boards connected for instant distribution' },
        { value: '1', label: 'Unified candidate database across all clients' },
        { value: '2 min', label: 'To open a new role from a pre-built template' },
      ],
      caseStudy: {
        company: 'Real Pattern: Staffing Agencies',
        result:
          'Across 4 staffing agency calls (Asteryx Solutions, Bolt Talent, Hammed\'s recruiting firm, Kimbrell Agency), the same pattern emerged: agencies need multi-client pipeline management, a candidate database that compounds over time, and rapid job distribution. Teamtailor\'s departments + Connect + 128 job boards addresses all three — at a price point ($2,800-$3,200/year) that new agencies can afford.',
      },
    },
  },

  // ──────────────────────────────────────────────
  // 23. ATS Renewal Displacement Playbook
  // ──────────────────────────────────────────────
  {
    id: 'playbook-renewal-displacement',
    title: 'The ATS Renewal Displacement Playbook',
    subtitle:
      'Your ATS vendor just hit you with a 40-60% renewal price increase. This playbook times the switch to Teamtailor with your renewal event — avoiding double-payment, leveraging contract leverage, and landing a better platform at a fair price.',
    description:
      'When Greenhouse goes from $40K to $60K, or Workday locks you into a per-seat model that doubles every year, the renewal event is the window. This playbook provides the contract timing, competitive positioning, and internal sell strategy to execute a clean switch.',
    personas: ['TA Leaders', 'HR Managers', 'CFO'],
    setupTime: '10 min',
    features: ['Analytics', 'Career Site', 'AI Screening', 'Smart Schedule', 'Unlimited Users'],
    demoAreaIds: ['analytics', 'ai', 'career-site'],
    automationFlow: [
      { icon: '💸', label: 'Stage', name: 'Renewal Shock Event' },
      { icon: '📊', label: 'Trigger', name: 'Feature Gap Analysis' },
      { icon: '🔄', label: 'Trigger', name: 'Parallel Evaluation' },
      { icon: '📋', label: 'Trigger', name: 'Co-Author Business Case' },
      { icon: '✅', label: 'Result', name: 'Contract-Aligned Switch' },
    ],
    beforeList: [
      '40-60% renewal price increase with no new features',
      'Per-seat pricing model penalizes growth — hiring more costs more',
      'Locked into multi-year contract with data export fees',
      'Support quality declining while price increases',
      'Team using workarounds because core features are missing',
    ],
    afterList: [
      'Transparent pricing with unlimited users — growth doesn\'t cost more',
      '3-year price lock option for budget predictability',
      'Free data import and dedicated onboarding specialist',
      'Features that were "coming soon" for years are native in Teamtailor',
      'Contract timing aligned to avoid any double-payment period',
    ],
    needs: [
      { icon: '💰', name: 'Transparent Pricing', type: 'core' },
      { icon: '👥', name: 'Unlimited Users', type: 'core' },
      { icon: '📥', name: 'Free Data Import', type: 'core' },
      { icon: '📊', name: 'Full Analytics', type: 'core' },
      { icon: '🤖', name: 'AI Screening', type: 'core' },
    ],
    steps: [
      {
        title: 'Map the renewal timeline and contract terms',
        description:
          'Ask the prospect: When does your contract renew? Is there an auto-renewal clause? What is the cancellation notice period (typically 60-90 days)? What are the data export terms? Build the timeline backward from the renewal date to ensure enough runway for evaluation, sign-off, and migration.',
        proTip:
          'Many vendors have auto-renewal clauses with 60-day notice periods. If renewal is in 90 days, you have 30 days to get the deal done. Map this on the first call.',
      },
      {
        title: 'Build the feature-vs-price comparison',
        description:
          'Create a side-by-side comparison of what they\'re paying for vs. what they\'re actually getting. Common gaps in Greenhouse: no native scheduling, limited career site CMS, per-seat pricing. Common gaps in Workday: rigid workflows, terrible HM UX, no AI screening. Show that Teamtailor includes all of these at a lower total cost.',
      },
      {
        title: 'Quantify the cost of staying',
        description:
          'Frame the conversation around the total cost of staying — not just the license fee. Include: (1) The renewal price increase, (2) Additional tools they\'re paying for that TT includes (Calendly, career site host, analytics tools), (3) Recruiter hours wasted on workarounds, (4) Cost of missing features (no AI screening = manual screening hours). Make "staying" the expensive option.',
      },
      {
        title: 'Co-author the internal business case',
        description:
          'Help the champion build the CFO pitch: "We can get a better platform with more features for X% less." Provide case studies from similar companies who switched, benchmark data (time-to-hire improvement, screening automation), and a draft proposal they can present internally.',
        proTip:
          'Offer to join the internal presentation as a subject matter expert. Champions who feel supported close faster than those who pitch alone.',
      },
      {
        title: 'Offer bridge months to eliminate double-payment',
        description:
          'If the prospect is locked into their current contract for N months, offer N free onboarding months on Teamtailor so they can set up, migrate data, and go live without paying for two systems simultaneously. This removes the #1 financial objection to switching mid-contract.',
      },
    ],
    spotlights: [
      {
        feature: 'The Renewal Event Playbook',
        description:
          'Every ATS contract has a renewal date — and every renewal is a decision point. The vendors who win renewals by default are the ones who make switching feel impossible. Teamtailor makes switching easy: free data import, dedicated onboarding, bridge months to avoid double-payment, and unlimited users so growth doesn\'t trigger a price increase. The best time to switch is when the renewal bill arrives and the team is already frustrated.',
      },
    ],
    results: {
      metrics: [
        { value: '40-60%', label: 'Typical renewal price increase avoided' },
        { value: '$0', label: 'Per-seat fees (unlimited users)' },
        { value: '30 days', label: 'Average migration timeline' },
      ],
      caseStudy: {
        company: 'Real Pattern: Greenhouse & Workday Renewals',
        result:
          'Across multiple transcripts, prospects reported Greenhouse renewals jumping from $40K to $60K, Workday per-seat costs doubling with headcount growth, and SmartRecruiters post-acquisition pricing confusion. In every case, the renewal event was the trigger for evaluation — and the prospect\'s frustration with "paying more for the same thing" was the emotional driver. Teamtailor\'s unlimited-user model and transparent pricing directly neutralize this pain.',
      },
    },
  },

  // ──────────────────────────────────────────────
  // 24. Internal Mobility & Career Pathing Playbook
  // ──────────────────────────────────────────────
  {
    id: 'playbook-internal-mobility',
    title: 'Internal Mobility & Career Pathing',
    subtitle:
      'Your best candidates already work for you — but they can\'t see opportunities across brands, departments, or locations. Build an internal careers portal that reduces regrettable attrition and cuts external hiring costs by filling roles from within.',
    description:
      'Stop losing top performers to competitors because they didn\'t know about an internal opening. Build an internal careers experience where employees can browse opportunities across all brands and departments, express interest confidentially, and get matched to roles automatically.',
    personas: ['TA Leaders', 'HR Managers', 'CHRO'],
    setupTime: '15 min',
    features: ['Internal Job Board', 'Connect', 'Departments', 'Career Site', 'Permissions'],
    demoAreaIds: ['career-site', 'settings', 'candidates'],
    automationFlow: [
      { icon: '🏢', label: 'Stage', name: 'Configure Internal Career Portal' },
      { icon: '🔒', label: 'Trigger', name: 'Employee-Only Visibility Rules' },
      { icon: '🔔', label: 'Trigger', name: 'Auto-Notify Matching Employees' },
      { icon: '📊', label: 'Result', name: 'Track Internal Mobility Metrics' },
    ],
    beforeList: [
      'Employees leave because they didn\'t know about internal opportunities',
      'No internal job board — roles are only visible externally',
      'Managers hoard talent instead of supporting lateral moves',
      'No confidential expression of interest — employees fear retaliation',
      'Internal transfers require the same application process as external hires',
    ],
    afterList: [
      'Dedicated internal careers portal visible only to employees',
      'Connect captures internal interest by department, location, and role type',
      'Auto-notifications when matching internal roles open',
      'Confidential interest expressions — managers notified only when appropriate',
      'Simplified internal application flow with pre-populated employee data',
    ],
    needs: [
      { icon: '🏠', name: 'Internal Job Board', type: 'core' },
      { icon: '🤝', name: 'Connect (Internal Talent Pool)', type: 'core' },
      { icon: '🏢', name: 'Departments / Divisions', type: 'core' },
      { icon: '🔐', name: 'Role-Based Permissions', type: 'core' },
      { icon: '📊', name: 'Internal Mobility Analytics', type: 'core' },
    ],
    steps: [
      {
        navPath: 'Career Site → Settings → Internal',
        title: 'Enable the internal careers portal',
        description:
          'Configure a separate internal career page that\'s only accessible to authenticated employees (via SSO or direct link). This shows all internal openings across every department, brand, and location — giving employees full visibility into growth opportunities.',
      },
      {
        navPath: 'Career Site → Settings → Connect → Internal',
        title: 'Set up internal Connect for confidential interest',
        description:
          'Enable Connect for internal employees so they can express interest in departments, role types, or locations without applying formally. This creates a "raise your hand" mechanism that\'s confidential — managers are only notified when the employee chooses to proceed.',
        proTip:
          'Promote the internal Connect portal during town halls and in your company newsletter. Internal mobility programs only work when employees know they exist.',
      },
      {
        navPath: 'Settings → Departments → Internal Transfers',
        title: 'Configure cross-department visibility rules',
        description:
          'Set up visibility rules so employees can see roles across all departments and brands — not just their own. For multi-brand organizations, this means a marketing manager at Brand A can see an opening at Brand B. Configure permissions so hiring managers can view internal candidate profiles with employment history included.',
      },
      {
        navPath: 'Settings → Job Templates → Internal',
        title: 'Create internal-only job templates with simplified application',
        description:
          'Build job templates specifically for internal postings — shorter application forms (employee data is pre-populated from HRIS), internal-only pipeline stages (manager approval, HR review, transfer date), and different communication templates that reference internal processes.',
      },
      {
        navPath: 'Analytics → Internal Mobility',
        title: 'Track internal mobility metrics',
        description:
          'Monitor key metrics: internal fill rate (% of roles filled internally), internal application-to-hire conversion, average time-to-fill for internal vs. external, and regrettable attrition rate. These metrics prove the ROI of the internal mobility program and justify continued investment.',
      },
    ],
    spotlights: [
      {
        feature: 'The Retain-to-Hire Engine',
        description:
          'Every internal hire is an external hire you didn\'t have to make — no agency fees, no sourcing costs, no onboarding ramp-up. Companies with strong internal mobility programs see 41% lower turnover (LinkedIn data). Teamtailor\'s internal careers portal + Connect + cross-brand visibility gives employees a reason to stay and grow instead of leaving for a competitor.',
      },
    ],
    results: {
      metrics: [
        { value: '41%', label: 'Lower turnover with internal mobility (LinkedIn data)' },
        { value: '$0', label: 'Cost per internal hire vs $15-25K external' },
        { value: '2x', label: 'Faster time-to-productivity for internal moves' },
      ],
      caseStudy: {
        company: 'Real Pattern: Multi-Brand Organizations',
        result:
          'Across enterprise multi-brand organizations like JD Sports and Vopak, the same pattern emerged: employees leave because they don\'t know about internal opportunities across the portfolio. In multi-brand retail groups, staff at one brand can\'t see openings at sister brands — even though they\'re the same company. An internal careers portal eliminates this blind spot and turns every brand into a retention tool for every other brand.',
      },
    },
  },
];

// ============================================================
// Pain-to-Playbook Mapping
// Maps buyer pain points to the playbooks that address them.
// ============================================================
export const PLAYBOOK_PAIN_MAP: Record<string, string[]> = {
  'playbook-auto-screen': ['manual-screening', 'screening-bottleneck', 'slow-time-to-hire', 'recruiter-admin-heavy', 'recruiter-burnout', 'application-volume-explosion', 'ai-mass-apply-spam'],
  'playbook-silver-medalist': ['dead-nurture-pipeline', 'weak-talent-pools', 'high-cost-per-hire', 'manual-sourcing', 'weak-referrals', 'no-passive-pipeline'],
  'playbook-hiring-manager': ['locked-out-managers', 'feedback-chasing', 'scorecard-friction', 'no-mobile-feedback', 'interview-governance-gap', 'hm-handwritten-notes'],
  'playbook-assessments': ['assessment-integration-gap', 'manual-screening', 'inconsistent-interviews'],
  'playbook-career-site': ['outdated-career-site', 'poor-mobile-career', 'unmeasurable-brand-roi', 'no-content-hub', 'no-in-store-capture', 'mobile-retail-capture-gap', 'engineering-dependency', 'careers-page-ownership-conflict'],
  'playbook-templates': ['inconsistent-interviews', 'scorecard-friction', 'recruiter-admin-heavy', 'interview-governance-gap'],
  'playbook-adp-onboard': ['onboarding-handoff-gap', 'hris-ats-rigidity', 'recruiter-admin-heavy', 'onboarding-gaps', 'post-hire-data-gap'],
  'playbook-zero-touch': ['manual-screening', 'screening-bottleneck', 'assessment-integration-gap', 'interview-scheduling-manual', 'scheduling-chaos'],
  'playbook-hiring-stack': ['tool-sprawl-centralization', 'hris-ats-rigidity', 'onboarding-handoff-gap', 'post-hire-data-gap', 'high-cost-per-hire'],
  'playbook-hiring-intelligence': ['no-pipeline-visibility', 'reporting-analytics-blind', 'unmeasurable-brand-roi', 'dei-reporting-gaps', 'c-suite-budget-friction', 'hiring-forecast-gap'],
  'playbook-ats-migration': ['vendor-support-gap', 'hris-ats-rigidity', 'tool-sprawl-centralization', 'compliance-bottlenecks', 'gdpr-paper-risk', 'vendor-lock-in'],
  'playbook-agency-replacement': ['agency-spend', 'agency-to-in-house-transition', 'weak-talent-pools', 'outdated-career-site', 'no-passive-pipeline'],
  'playbook-multi-brand': ['fragmented-multi-brand', 'no-pipeline-visibility', 'tool-sprawl-centralization', 'outdated-career-site', 'multi-language-gaps', 'internal-mobility-gap'],
  'playbook-communication-autopilot': ['poor-candidate-communication', 'candidate-communication-black-hole', 'poor-candidate-experience', 'slow-time-to-hire', 'adoption-gap'],
  'playbook-application-tsunami': ['application-volume-explosion', 'manual-screening', 'screening-bottleneck', 'recruiter-burnout', 'ai-mass-apply-spam'],
  // ── New Playbooks (from 600+ call analysis) ──
  'playbook-solo-recruiter': ['recruiter-burnout', 'recruiter-admin-heavy', 'manual-screening', 'screening-bottleneck', 'interview-scheduling-manual', 'scheduling-chaos'],
  'playbook-first-ats': ['outdated-career-site', 'gdpr-paper-risk', 'poor-candidate-experience', 'no-in-store-capture', 'no-pipeline-visibility', 'mobile-retail-capture-gap'],
  'playbook-cfo-business-case': ['c-suite-budget-friction', 'high-cost-per-hire', 'no-pipeline-visibility', 'reporting-analytics-blind'],
  'playbook-seasonal-hiring': ['weak-talent-pools', 'dead-nurture-pipeline', 'manual-screening', 'screening-bottleneck', 'recruiter-burnout', 'seasonal-surge-chaos'],
  'playbook-government': ['compliance-bottlenecks', 'gdpr-paper-risk', 'outdated-career-site', 'vendor-support-gap', 'hris-ats-rigidity'],
  'playbook-lever-displacement': ['locked-out-managers', 'no-pipeline-visibility', 'interview-scheduling-manual', 'manual-screening', 'outdated-career-site'],
  'playbook-staffing-agency': ['weak-talent-pools', 'manual-sourcing', 'no-pipeline-visibility', 'recruiter-admin-heavy', 'dead-nurture-pipeline'],
  // ── Gap-closing playbooks (from pain-to-playbook audit) ──
  'playbook-renewal-displacement': ['ats-price-shock', 'vendor-lock-in', 'high-cost-per-hire', 'vendor-support-gap', 'tool-sprawl-centralization'],
  'playbook-internal-mobility': ['internal-mobility-gap', 'weak-talent-pools', 'no-passive-pipeline', 'fragmented-multi-brand', 'high-cost-per-hire'],
};
