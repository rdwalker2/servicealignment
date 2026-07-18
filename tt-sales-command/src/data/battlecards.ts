export type Battlecard = {
  id: string;
  competitorName: string;
  logoText: string;
  winRate: number;
  pricingIntelligence: string;
  whenWeWin: string[];
  whenWeLose: string[];
  competitorStrengths: string[];
  ourDifferentiators: { claim: string; proof: string; ttFeature: string }[];
  objections: { question: string; script: string }[];
  trapQuestions: { question: string; painHighlighted: string }[];
};

export const BATTLECARDS: Battlecard[] = [
  {
    id: 'bc_greenhouse',
    competitorName: 'Greenhouse',
    logoText: 'G',
    winRate: 64,
    pricingIntelligence: 'Tiers: Essential → Expert. Quote-based, not published publicly. Est. ~$7K–$12K/yr at 50 employees, scaling to ~$15K–$25K/yr at 145 employees. $1K–$15K one-time implementation fee. 8–15% annual renewal increases typical. Headcount-based pricing model — costs scale with total employee count, not just recruiter seats.',
    whenWeWin: [
      'The buyer cares deeply about employer branding and candidate conversion rates.',
      'The TA team is tired of relying on Engineering/Marketing to update the career site.',
      'Hiring managers complain that the ATS is clunky or too "data-heavy" to use quickly.',
      'They want AI-powered resume screening and job ad generation without buying add-ons.'
    ],
    whenWeLose: [
      'The buyer is a strictly procurement-led IT team looking for massive ERP integrations.',
      'The company values rigid, overly complex compliance reporting above candidate experience.'
    ],
    competitorStrengths: [
      'Extensive integration marketplace (1,000+ partners).',
      'Strong structured interviewing and bias-reduction capabilities.',
      'Recognized market leader brand name in North America.',
      'AI candidate scoring and JD generator (growing AI capabilities).',
      'Strong DEI reporting and structured hiring methodology.'
    ],
    ourDifferentiators: [
      {
        claim: 'AI Co-pilot Built-In (No Add-Ons)',
        proof: 'Co-pilot drafts job ads in seconds, summarizes resumes with weighted skill ranking, generates interview questions from job descriptions, and transcribes video interviews, all included in the base price. Greenhouse has added some AI to higher tiers (Scorecard Summaries, Keyword Suggestions), but advanced AI features still require tier upgrades — Teamtailor includes all AI capabilities in every plan.',
        ttFeature: 'AI Co-pilot'
      },
      {
        claim: 'No-Code Career Site Builder',
        proof: 'Deploy highly customized, branded landing pages in minutes using our drag-and-drop builder with custom fonts, team stories, and content blocks (zero dev resources required). Greenhouse launched Design Studio for no-code career page customization, but Teamtailor\'s builder offers deeper flexibility with drag-and-drop content blocks, dynamic department pages, blog integration, and team stories — a full marketing-grade experience, not just page styling.',
        ttFeature: 'Career Site Builder'
      },
      {
        claim: 'Unlimited Users, Flat-Rate Pricing',
        proof: 'Every hiring manager, recruiter, and stakeholder gets full access at no additional cost. Greenhouse per-seat pricing penalizes companies that want to decentralize hiring.',
        ttFeature: 'Unlimited User Model'
      },
      {
        claim: 'Native Candidate CRM & Nurture Campaigns',
        proof: 'Build persistent talent pools with Connect and engage silver-medalist candidates through automated Nurture email campaigns. Greenhouse offers CRM functionality through Engage/Nurture Campaigns with talent pools and a Chrome sourcing extension, but Teamtailor\'s CRM is more deeply integrated into the hiring workflow — Connect talent pools and Nurture Campaigns are natively embedded, not a separate module, enabling seamless candidate re-engagement without context-switching.',
        ttFeature: 'Connect + Nurture Campaigns'
      },
      {
        claim: 'Consumer-Grade Hiring Manager App',
        proof: 'Our iOS/Android app means hiring managers actually log in, reducing TA follow-up time by 5 hours per week. Greenhouse\'s mobile experience is an afterthought.',
        ttFeature: 'Mobile App'
      },
      {
        claim: 'No Salary Visibility Leaks',
        proof: 'Greenhouse trigger emails can expose salary info to hiring managers who shouldn\'t see it — discovered during prospect evaluation. Teamtailor\'s permission system ensures data stays where it belongs.',
        ttFeature: 'Permission Controls'
      },
      {
        claim: 'Superior Analytics & Reporting',
        proof: 'Analysis across thousands of sales calls (Nooks Intelligence) reveals a consistent complaint from Greenhouse users: "reporting is not straightforward" and "analytics on ratios (resume to interview) are lacking." Teamtailor provides visual, out-of-the-box analytics that track pipeline velocity without requiring a data scientist.',
        ttFeature: 'Analytics Dashboard'
      }
    ],
    objections: [
      {
        question: 'We are already locked into a Greenhouse contract for another 18 months.',
        script: '"I completely understand. Many of our best customers transitioned mid-contract because the increased candidate conversion and reduced agency spend more than paid for the overlap. Knauf unified 43,500 employees on Teamtailor and saw a 50%+ jump in applicant volume. If we could show you a 30% reduction in cost-per-hire, would you be open to exploring a parallel pilot?"'
      },
      {
        question: 'Greenhouse has all the integrations we need.',
        script: '"Greenhouse definitely has a massive app store. But Teamtailor has 500+ integrations including LinkedIn RSC, Zapier, and every major HRIS. And features like native AI Co-pilot, robust CRM with Nurture Campaigns, and a full Career Site Builder are built-in, saving you from buying 3 additional tools to bolt onto Greenhouse."'
      },
      {
        question: 'Greenhouse has strong structured interviewing; we need that.',
        script: '"Absolutely, structured interviewing is critical. Teamtailor\'s Interview Kits provide the same structured scorecards and standardized evaluation. Plus, our AI Co-pilot automatically suggests role-specific questions based on the job description and summarizes video interview transcripts in real-time. That\'s a capability Greenhouse charges extra for."'
      },
      {
        question: 'Once we post ads in Greenhouse, they automatically get posted to platforms like Indeed and LinkedIn.',
        script: '"That is standard table stakes. Teamtailor posts to 300+ job boards with one click, including all the ones you mentioned. But the difference is, our visual reporting actually shows you which of those sources brings in the highest-converting candidates, without wrestling with complicated spreadsheets."'
      }
    ],
    trapQuestions: [
      {
        question: 'How long does it take your team to spin up a new, branded landing page for a specific hard-to-fill role or campus event?',
        painHighlighted: 'Highlights their reliance on IT/Marketing for basic recruiting tasks; Teamtailor\'s Career Site Builder does this in minutes.'
      },
      {
        question: 'What percentage of your candidates drop off when they hit the mobile application screen?',
        painHighlighted: 'Exposes Greenhouse\'s poor mobile application UX vs. Teamtailor\'s mobile-first, no-account-required flow.'
      },
      {
        question: 'How much time do your recruiters spend manually screening resumes before the first interview?',
        painHighlighted: 'Opens the door for AI Co-pilot\'s one-click resume summarization and candidate ranking.'
      },
      {
        question: 'How easy is it to pull straightforward reporting and pipeline conversion ratios (like resume-to-interview) out of Greenhouse today?',
        painHighlighted: 'Surfaces a recurring frustration found in Nooks call data: Greenhouse analytics are notoriously difficult to configure for basic funnel metrics.'
      }
    ]
  },
  {
    id: 'bc_lever',
    competitorName: 'Lever',
    logoText: 'L',
    winRate: 72,
    pricingIntelligence: 'PEPM pricing model (~$9.60–$12 PEPM). ~$7,348/yr at 50 employees. Scales to ~$17K–$21K at 145 employees. Advanced Automation is a paid add-on ($800.95/yr). No implementation fee. Now owned by Employ Inc. — shipped AI Companions and UX updates in 2025-2026, but product roadmap clarity remains a concern under the multi-brand Employ portfolio.',
    whenWeWin: [
      'The company is scaling past 500 employees and needs more robust career site customization.',
      'The TA team is shifting from outbound sourcing to inbound employer branding.',
      'They want AI-powered recruiting automation that Lever doesn\'t offer natively.',
      'The company wants clarity on product roadmap and innovation — Employ Inc. acquisition raises concerns.',
      'They need employer branding capabilities Lever doesn\'t offer.'
    ],
    whenWeLose: [
      'The buyer is hyper-focused *only* on outbound sourcing pipeline analytics and doesn\'t care about employer brand.'
    ],
    competitorStrengths: [
      'Strong initial CRM and sourcing extension capabilities.',
      'Unified pipeline view for active and passive candidates.',
      'LeverTRM — native Talent Relationship Management built into base plan.'
    ],
    ourDifferentiators: [
      {
        claim: 'AI Co-pilot Maturity vs. Bolt-On AI Companions',
        proof: 'Teamtailor\'s Co-pilot generates interview questions from job descriptions, summarizes resumes with weighted skill ranking, drafts candidate communications with interview notes, and transcribes video meetings — natively embedded across the full workflow. Lever launched AI Companions in 2025 (Interview, Screening, Sourcing), rebranded as Employ Interview Intelligence in May 2026, but these are bolt-on features focused on specific stages rather than a unified AI layer across the entire hiring lifecycle.',
        ttFeature: 'AI Co-pilot'
      },
      {
        claim: 'True Employer Branding Engine',
        proof: 'Lever offers basic job boards. Teamtailor provides a full marketing suite with Career Site Builder, employee testimonials, blog integration, custom content blocks, and dynamic department pages: the #1 reason companies choose Teamtailor.',
        ttFeature: 'Career Site Builder + Employer Branding'
      },
      {
        claim: 'Nurture Campaigns & Connect Talent Pools',
        proof: 'Native automated Nurture email campaigns drop passive talent into branded engagement sequences. Lever\'s CRM requires manual outreach (no automated nurture workflows).',
        ttFeature: 'Nurture Campaigns + Connect'
      },
      {
        claim: 'Seamless Onboarding Module',
        proof: 'Teamtailor extends beyond hiring into pre-boarding with document collection, welcome tasks, and team introductions, all from the same platform. Lever stops at the offer letter.',
        ttFeature: 'Onboarding'
      }
    ],
    objections: [
      {
        question: 'We like Lever\'s CRM and sourcing tools.',
        script: '"Lever does have a solid sourcing extension. But what happens *after* you source them? Sourced candidates are passive and need to be sold on your brand. Teamtailor\'s CRM seamlessly drops passive talent into beautiful, branded Nurture Campaigns that actually convert. Plus, our AI Co-pilot summarizes their resume and generates personalized outreach — something Lever can\'t do natively."'
      },
      {
        question: 'Lever is cheaper for our team size.',
        script: '"That\'s true at small scale. But Teamtailor\'s unlimited user model means as you grow, your cost stays flat. Lever\'s per-seat pricing means every new recruiter and hiring manager adds to your bill. At 500+ employees, Teamtailor is typically 30-40% cheaper while including AI Co-pilot, Career Site Builder, and Onboarding, features Lever doesn\'t have at any price."'
      }
    ],
    trapQuestions: [
      {
        question: 'When a passive candidate visits your current Lever job board, what is compelling them to stay if they aren\'t ready to apply today?',
        painHighlighted: 'Highlights Lever\'s lack of Career Site marketing engagement features vs. Teamtailor\'s full employer branding suite.'
      },
      {
        question: 'How are you using AI in your recruiting process today — across screening, sourcing, content, AND interviews?',
        painHighlighted: 'Lever\'s AI Companions cover specific stages (interview, screening, sourcing) but lack a unified AI layer. Opens the door for Co-pilot demo showing AI across the full lifecycle.'
      }
    ]
  },
  {
    id: 'bc_workday',
    competitorName: 'Workday Recruiting',
    logoText: 'W',
    winRate: 85,
    pricingIntelligence: 'Workday is incredibly expensive and usually bundled into the HRIS. However, you can position Teamtailor as a "front-end" overlay. Teamtailor captures talent with a beautiful experience and pushes hired candidate data into Workday via API integration.',
    whenWeWin: [
      'The CHRO realizes "Workday Fatigue" is causing elite candidates to abandon applications.',
      'Recruiters are spending 50% of their time fighting the system instead of recruiting.',
      'They want AI-powered hiring without waiting for Workday\'s slow HCM update cycle.'
    ],
    whenWeLose: [
      'IT mandates that absolutely everything must live in one single database, regardless of UX.'
    ],
    competitorStrengths: [
      'Complete ecosystem integration (HRIS, Payroll, Finance).',
      'Unmatched enterprise security and compliance certifications.'
    ],
    ourDifferentiators: [
      {
        claim: 'AI Co-pilot vs. Expensive HCM Add-Ons',
        proof: 'Teamtailor\'s Co-pilot provides AI resume summarization, candidate ranking, and job ad drafting included in the base price. Workday\'s AI requires expensive HCM module add-ons and lengthy implementation cycles.',
        ttFeature: 'AI Co-pilot'
      },
      {
        claim: 'Eradicate "Workday Fatigue"',
        proof: 'Teamtailor replaces the mandatory login/password creation step that kills up to 60% of applications in Workday. Our mobile-first, no-account-required flow converts passive visitors into applicants.',
        ttFeature: 'Candidate Experience + Career Site'
      },
      {
        claim: 'Deploy in Weeks, Not Years',
        proof: 'Teamtailor deploys in weeks with dedicated migration support. You get continuous product innovation (like AI Co-pilot and Nurture Campaigns) instead of waiting for massive annual ERP updates.',
        ttFeature: 'Rapid Deployment'
      },
      {
        claim: 'Seamless Workday Integration',
        proof: 'Teamtailor integrates directly with Workday via API, capturing talent through a beautiful front-end and pushing hired candidate data into Workday for HRIS/Payroll. 500+ integrations ensure the rest of your tech stack stays connected.',
        ttFeature: '500+ Integrations'
      }
    ],
    objections: [
      {
        question: 'Our CIO mandates that we only use Workday for all HR functions.',
        script: '"We hear this often. The good news is you don\'t have to rip out Workday. Many enterprise clients (including companies like Knauf with 43,500 employees) use Teamtailor as their \'Recruitment Marketing Front-End.\' We capture the talent with a beautiful, fast experience powered by AI Co-pilot, and seamlessly push the hired candidate data into Workday via our API for HRIS/Payroll. Your CIO keeps their single source of truth."'
      },
      {
        question: 'Workday is working on their own AI features.',
        script: '"They are. But Workday AI requires expensive add-on modules and takes 6-12 months to implement. Teamtailor\'s AI Co-pilot is live today, included in the base price, and already summarizing resumes, drafting job ads, generating interview questions, and transcribing video meetings. The question is: can you afford to wait a year for AI while your competitors are using it now?"'
      }
    ],
    trapQuestions: [
      {
        question: 'Have you personally tried applying for one of your open roles from your smartphone?',
        painHighlighted: 'Forces them to confront the miserable Workday candidate experience vs. Teamtailor\'s 60-second mobile apply.'
      },
      {
        question: 'How quickly can your team get a new AI feature deployed in Workday?',
        painHighlighted: 'Exposes Workday\'s slow update cycle; Teamtailor ships AI improvements continuously.'
      }
    ]
  },
  {
    id: 'bc_taleo',
    competitorName: 'Oracle Taleo',
    logoText: 'T',
    winRate: 91,
    pricingIntelligence: 'Taleo is legacy. Pricing is often sunk cost. The real cost is the massive talent drain and agency fees required to fill roles because the ATS actively repels applicants with its 2005-era interface.',
    whenWeWin: [
      'Literally anytime we get a demo with a TA leader who has budget.',
      'Companies undergoing digital transformation or brand refreshes.',
      'Any organization that wants AI-powered recruiting: Taleo has none.'
    ],
    whenWeLose: [
      'Extreme enterprise inertia where no one wants to take on the migration project.'
    ],
    competitorStrengths: [
      'Deeply entrenched in massive, old-school enterprises.',
      'Extensive compliance and background check workflows built over decades.'
    ],
    ourDifferentiators: [
      {
        claim: 'AI Co-pilot vs. Keyword Matching',
        proof: 'Teamtailor\'s generative AI Co-pilot summarizes resumes, drafts job ads, generates interview questions, ranks candidates by weighted skills, and transcribes video meetings. Taleo\'s "AI" is keyword matching from 2005; it doesn\'t understand context, skills, or nuance.',
        ttFeature: 'AI Co-pilot'
      },
      {
        claim: 'Modern Candidate Experience',
        proof: 'Taleo looks like it was built in 2005 because it was. Teamtailor reflects the modern web with mobile-first applications, no-account-required flows, and branded Career Sites that actually attract talent instead of repelling it.',
        ttFeature: 'Career Site Builder + Candidate Experience'
      },
      {
        claim: 'Active CRM vs. Passive Filing Cabinet',
        proof: 'Taleo is a passive database. Teamtailor is an active marketing engine with Candidate CRM, Connect talent pools, automated Nurture Campaigns, and Smart Move triggers that engage talent proactively.',
        ttFeature: 'Candidate CRM + Nurture Campaigns'
      },
      {
        claim: '500+ Modern Integrations',
        proof: 'Teamtailor integrates with LinkedIn RSC, Zapier, modern HRIS platforms, background check providers, assessment tools, and free job board distribution. Taleo\'s integration model is outdated and expensive to maintain.',
        ttFeature: '500+ Integrations'
      }
    ],
    objections: [
      {
        question: 'Migrating off Taleo is going to be a nightmare. We have 10 years of data.',
        script: '"I completely understand the hesitation. Our dedicated migration team handles Taleo migrations every single week. We\'ve developed automated tooling specifically for Taleo data extraction. The real question is: what is the cost of keeping Taleo for another 3 years? Between agency fees from repelled applicants, lost hiring manager adoption, and zero AI capability, most Taleo customers calculate the cost of indecision at $200K+ per year."'
      },
      {
        question: 'Oracle is giving us a big discount to stay.',
        script: '"Oracle discounts are a retention tactic: they\'re admitting the product can\'t compete on value. But a cheaper version of a 2005 ATS is still a 2005 ATS. Your candidates don\'t care about your software discount - they care about applying in 60 seconds from their phone and getting AI-powered personalized communications. That\'s what wins talent in 2026."'
      }
    ],
    trapQuestions: [
      {
        question: 'What is your current candidate drop-off rate, and how much of your annual budget goes to external agencies because of it?',
        painHighlighted: 'Highlights that Taleo is actively costing them money by repelling organic applicants. Teamtailor\'s Career Site converts them.'
      },
      {
        question: 'How are you leveraging AI in your recruiting workflow today?',
        painHighlighted: 'Exposes that Taleo has zero AI capability. This opens the door for a Co-pilot demo that will blow their mind.'
      }
    ]
  },
  {
    id: 'bc_workable',
    competitorName: 'Workable',
    logoText: 'Wk',
    winRate: 68,
    pricingIntelligence: 'Workable has transparent pricing starting at $299/mo. They\'re our most direct SMB competitor. Strong general-purpose ATS but weaker on employer branding and career site sophistication.',
    whenWeWin: [
      'Buyer cares about employer brand and career site as a hiring differentiator.',
      'Company wants AI-powered screening built into the workflow, not bolted on.',
      'They need a career site that doubles as a marketing asset.',
      'Hiring managers want a consumer-grade mobile experience.'
    ],
    whenWeLose: [
      'Budget-first buyer who only compares on sticker price.',
      'They need hyper-specific niche job board sourcing integrations.'
    ],
    competitorStrengths: [
      'Transparent, simple pricing model.',
      'Strong general-purpose SMB ATS with broad market familiarity.',
      'Good AI-powered candidate sourcing tools.',
      'Expanded assessment library in 2025.'
    ],
    ourDifferentiators: [
      {
        claim: 'Career Site Builder vs. Generic Career Pages',
        proof: 'Workable now offers a drag-and-drop careers page builder, a significant improvement over their previous basic templates. However, Teamtailor\'s Career Site Builder goes further with dynamic department pages, blog integration, team stories, custom content blocks, and SEO optimization — a full marketing-grade employer branding engine, not just a customizable job listing page.',
        ttFeature: 'Career Site Builder'
      },
      {
        claim: 'Full-Workflow AI Co-pilot vs. Sourcing-Only AI',
        proof: 'Teamtailor\'s AI Co-pilot is included in the base price and powers the entire workflow: resume summarization, job ad drafting, interview question generation, and video transcription. Workable has invested heavily in AI — launching Workable Agent (autonomous AI recruiter), Workable Assistant, an MCP Server, and AI content generation. However, Teamtailor\'s AI is natively woven into every workflow step by default, while Workable\'s AI capabilities are spread across separate tools and features that must be individually adopted.',
        ttFeature: 'AI Co-pilot'
      },
      {
        claim: 'Employer Branding Suite vs. Basic Job Board',
        proof: 'Teamtailor includes blog integration, team stories, custom content blocks, and dynamic department pages — a full employer branding engine. Workable offers a basic job board with limited customization.',
        ttFeature: 'Employer Branding Suite'
      },
      {
        claim: 'Native Nurture Campaigns vs. No Talent Nurture',
        proof: 'Teamtailor\'s Nurture Campaigns automatically engage silver-medalist and passive candidates through branded email sequences. Workable has no native talent nurture capability — candidates either apply or disappear.',
        ttFeature: 'Nurture Campaigns'
      }
    ],
    objections: [
      {
        question: 'Workable is cheaper than Teamtailor.',
        script: '"Workable\'s sticker price looks lower, but let\'s talk total value. Teamtailor includes a full Career Site Builder that replaces your need for a separate careers page tool, AI Co-pilot across the entire workflow (not just sourcing), and unlimited users — no per-seat surprises. When you factor in the tools you\'d need to bolt onto Workable to match Teamtailor\'s native capabilities, the total cost of ownership often favors us."'
      },
      {
        question: 'Workable has good AI features.',
        script: '"Workable\'s AI is solid for sourcing — finding candidates. But Teamtailor\'s AI Co-pilot powers the *entire* workflow: drafting job ads, summarizing resumes with weighted skill ranking, generating interview questions from job descriptions, and transcribing video interviews. It\'s the difference between AI that finds people and AI that helps you hire them."'
      }
    ],
    trapQuestions: [
      {
        question: 'How do candidates learn about your company culture before they click \'Apply\'?',
        painHighlighted: 'Exposes Workable\'s basic career page that shows job listings but offers no employer branding, team stories, or culture content. Opens the door for Teamtailor\'s Career Site Builder.'
      },
      {
        question: 'What happens to silver-medalist candidates after you pass on them for a role?',
        painHighlighted: 'Exposes that Workable has no native talent nurture — great candidates are lost forever. Teamtailor\'s Nurture Campaigns keep them engaged for future roles.'
      }
    ]
  },
  {
    id: 'bc_bamboohr',
    competitorName: 'BambooHR',
    logoText: 'B',
    winRate: 78,
    pricingIntelligence: 'BambooHR is bundled HRIS+ATS. Often bought for HR admin first, recruiting second. ATS capabilities are basic compared to dedicated recruiting platforms.',
    whenWeWin: [
      'Company outgrows BambooHR\'s ATS and needs real recruiting depth.',
      'They want better career site and employer brand tools than BambooHR offers.',
      'Need AI-powered screening, not just applicant tracking.',
      'Want CRM and nurture capabilities for passive talent engagement.'
    ],
    whenWeLose: [
      'Very small company (<25 employees) that wants one system for all HR functions.'
    ],
    competitorStrengths: [
      'Broader HR suite (payroll, time-off, performance management).',
      'Good for very small companies wanting a single vendor for all HR.',
      'Simple onboarding and easy initial setup.'
    ],
    ourDifferentiators: [
      {
        claim: 'Purpose-Built Recruiting Depth vs. HRIS Add-On',
        proof: 'BambooHR\'s ATS is a lightweight add-on to their HRIS — basic applicant tracking bolted onto an HR admin tool. Teamtailor is a purpose-built recruiting platform with advanced pipeline management, structured interviewing, and collaborative hiring workflows.',
        ttFeature: 'Full ATS Platform'
      },
      {
        claim: 'Career Site Builder vs. Generic Job Listings',
        proof: 'BambooHR career pages are generic, template-based job listings with minimal branding. Teamtailor\'s drag-and-drop Career Site Builder creates fully branded, conversion-optimized career sites that showcase your employer brand.',
        ttFeature: 'Career Site Builder'
      },
      {
        claim: 'AI Co-pilot vs. No AI',
        proof: 'Teamtailor\'s AI Co-pilot drafts job ads, summarizes resumes, generates interview questions, and transcribes video interviews — all included in the base price. BambooHR has introduced AI features like Ask BambooHR (an AI assistant), AI-powered compensation benchmarking, and feedback summarization, but these are primarily HR administration tools — not purpose-built recruiting AI. Teamtailor\'s Co-pilot is designed specifically for talent acquisition workflows from screening to hire.',
        ttFeature: 'AI Co-pilot'
      },
      {
        claim: 'Candidate CRM + Nurture vs. No Passive Talent Engagement',
        proof: 'Teamtailor\'s CRM and Nurture Campaigns let you build talent pools and engage passive candidates with automated, branded email sequences. BambooHR has no CRM and no way to engage candidates who aren\'t ready to apply today.',
        ttFeature: 'Connect + Nurture Campaigns'
      }
    ],
    objections: [
      {
        question: 'We already use BambooHR for everything — why add another tool?',
        script: '"BambooHR is great for HR admin. But as your hiring scales, you\'ll hit the ceiling of what a bolted-on ATS can do. Teamtailor integrates seamlessly with BambooHR via API — you keep BambooHR for HRIS and add a purpose-built recruiting engine that gives you AI-powered screening, a branded career site, and candidate nurture. Companies that make this move typically see a 30-40% increase in quality applicants."'
      },
      {
        question: 'BambooHR is simpler and we don\'t need a complex ATS.',
        script: '"Teamtailor is actually designed to be just as easy to use — our hiring managers love the consumer-grade mobile app. The difference is you get simplicity *plus* power: AI Co-pilot, a Career Site Builder, and Nurture Campaigns that BambooHR simply can\'t offer. You don\'t have to choose between easy and effective."'
      }
    ],
    trapQuestions: [
      {
        question: 'What does your career site look like when a candidate opens it on their phone?',
        painHighlighted: 'Exposes BambooHR\'s generic, template-based career pages that lack mobile optimization and employer branding. Opens the door for Teamtailor\'s mobile-first Career Site Builder.'
      },
      {
        question: 'How do you engage candidates who aren\'t ready to apply today but might be perfect in 6 months?',
        painHighlighted: 'Exposes that BambooHR has no CRM or nurture capability — passive talent is completely lost. Teamtailor\'s Connect and Nurture Campaigns solve this.'
      }
    ]
  },
  {
    id: 'bc_ashby',
    competitorName: 'Ashby',
    logoText: 'A',
    winRate: 55,
    pricingIntelligence: 'Per-seat model at ~$750-800/seat/yr. ~$16K/yr typical mid-market cost. Transparent flat rate — $21,465/yr for 27 seats. Cost stays fixed as headcount grows (only increases with paid user count). No implementation fee. 200 free email lookups/month. Credit-based AI features add hidden costs. "The most annoying part of their product is the seats." Best-in-class analytics but premium pricing ($9K-25K/yr).',
    whenWeWin: [
      'Buyer wants simplicity without sacrificing quality.',
      'Team is lean and doesn\'t have recruiting ops specialists to configure complex workflows.',
      'Employer brand and candidate experience matter more than recruiting analytics.',
      'They want faster time-to-value (weeks not months of setup).'
    ],
    whenWeLose: [
      'Buyer is a data-obsessed recruiting ops team that wants deep analytics as their primary requirement.',
      'Tech startup with engineering-led hiring process that values workflow complexity.'
    ],
    competitorStrengths: [
      'Best-in-class analytics and reporting dashboards.',
      'Strong workflow automation and customization.',
      'Modern, clean UX designed for power users.',
      'Fast-moving product team shipping frequent updates.',
      'AI-powered interview note summaries and scorecards (credit-based — usage costs extra).',
      'AI Notetaker + Feedback Summaries built into platform.',
      'Explicit responsible AI policy with human-in-loop and third-party bias audits.'
    ],
    ourDifferentiators: [
      {
        claim: 'Simpler Adoption for Lean Teams',
        proof: 'Ashby is powerful but requires recruiting ops expertise to configure properly — setup can take months. Teamtailor deploys in weeks with an intuitive interface that hiring managers actually use daily, not just dedicated recruiters.',
        ttFeature: 'Rapid Deployment + Intuitive UX'
      },
      {
        claim: 'Superior Employer Branding & Career Site',
        proof: 'Ashby focuses on internal recruiting operations but offers minimal employer branding tools. Teamtailor\'s Career Site Builder, blog integration, team stories, and content blocks create a candidate-facing experience that actually attracts talent.',
        ttFeature: 'Career Site Builder + Employer Branding'
      },
      {
        claim: 'Approachable Without Sacrificing Capability',
        proof: 'Teamtailor gives you AI Co-pilot, structured interviewing, pipeline management, and candidate CRM in a package that doesn\'t require a recruiting ops specialist to manage. Ashby\'s depth often means only power users get full value.',
        ttFeature: 'AI Co-pilot + Full Platform'
      },
      {
        claim: 'Unlimited Users vs. Premium Per-Seat Pricing',
        proof: 'Teamtailor includes unlimited users at no extra cost — every hiring manager, recruiter, and stakeholder gets full access. Ashby\'s per-seat pricing ($750-800/seat) penalizes companies that want collaborative, decentralized hiring. Plaid is spending $100K+ on Ashby — that\'s the enterprise pricing ceiling.',
        ttFeature: 'Unlimited User Model'
      },
      {
        claim: 'Enterprise Reliability vs. Performance Issues at Scale',
        proof: 'Ashby users report system crashes at scale: "system performance has not been very reliable... it just loads and loads and crashes." Teamtailor is built for 13,000+ customers with enterprise-grade infrastructure.',
        ttFeature: 'Platform Reliability'
      },
      {
        claim: 'Unified AI Workflow vs. Modular AI Features',
        proof: 'Ashby has expanded its AI significantly — launching AI Talent Rediscovery (May 2026), AI-Assisted Application Review, and Ashby Assistant with Custom Agents. These are strong individual features, but they operate as separate modules with credit-based pricing. Teamtailor\'s AI Co-pilot provides a unified AI layer across the entire hiring workflow — screening, job ads, interview prep, and video transcription — all included in the base price with no credit limits.',
        ttFeature: 'AI Co-pilot'
      }
    ],
    objections: [
      {
        question: 'Ashby has better analytics than Teamtailor.',
        script: '"Ashby\'s analytics are impressive — no argument there. But the question is: does your team have dedicated recruiting ops to build and maintain those dashboards? Most SMB teams need actionable insights out of the box, not a BI tool inside their ATS. Teamtailor gives you the reporting you need to make decisions, plus a Career Site Builder, AI Co-pilot, and Nurture Campaigns that Ashby doesn\'t match."'
      },
      {
        question: 'Ashby\'s automation is more advanced.',
        script: '"Ashby\'s automation is deep, but deep can mean complex. Our customers tell us they want automation that works on day one without a two-month configuration project. Teamtailor\'s workflows are powerful enough for sophisticated hiring processes but intuitive enough that your whole team — not just ops — can use them effectively."'
      },
      {
        question: 'Ashby\'s per-seat pricing is transparent and fair.',
        script: '"Transparent, yes. Fair? Let\'s do the math. At $750-800 per seat, a team of 20 users costs $16K/yr — and that\'s before credit-based AI charges. One Ashby customer told us the most annoying part of the product is the seats. Teamtailor includes unlimited users at no extra cost. Every hiring manager, interviewer, and stakeholder gets full access. No seat math, no AI credits, no surprises."'
      }
    ],
    trapQuestions: [
      {
        question: 'How many hours did it take to configure your current ATS workflows from scratch?',
        painHighlighted: 'Exposes Ashby\'s complex setup process that requires recruiting ops expertise. Teamtailor deploys in weeks with intuitive, ready-to-use workflows.'
      },
      {
        question: 'Do your hiring managers actually log in and use the ATS daily, or is it recruiter-only?',
        painHighlighted: 'Exposes that Ashby\'s power-user design often means hiring managers don\'t engage. Teamtailor\'s consumer-grade mobile app drives daily hiring manager adoption.'
      },
      {
        question: 'How much is Ashby actually costing you when you add up seats plus AI credits?',
        painHighlighted: 'Exposes hidden per-seat and credit-based costs. "If you\'re smart enough, Ashby is a really good solution. If you\'re an HR manager... Ashby is probably a really difficult product." Teamtailor is powerful AND accessible.'
      }
    ]
  },
  {
    id: 'bc_jazzhr',
    competitorName: 'JazzHR',
    logoText: 'J',
    winRate: 82,
    pricingIntelligence: 'JazzHR is budget-friendly but dated. Low monthly cost but you get what you pay for — limited AI, basic career pages, weak automation.',
    whenWeWin: [
      'Company is scaling and outgrowing JazzHR\'s capabilities.',
      'They want modern AI-powered recruiting, not just applicant tracking.',
      'Need a career site that actually converts candidates, not a basic job board.',
      'Want to look professional and premium to candidates — employer brand matters.'
    ],
    whenWeLose: [
      'Absolute lowest-cost buyer who only cares about basic applicant tracking functionality.'
    ],
    competitorStrengths: [
      'Very affordable entry-level pricing.',
      'Simple to use for basic hiring needs.',
      'Good for companies with minimal recruiting complexity.'
    ],
    ourDifferentiators: [
      {
        claim: 'Modern UX vs. Dated Interface',
        proof: 'JazzHR\'s interface feels outdated — clunky navigation, poor mobile experience, and a design language stuck in 2018. Teamtailor\'s modern, consumer-grade UX delights both recruiters and candidates, driving higher adoption and better candidate experience.',
        ttFeature: 'Modern UX + Mobile App'
      },
      {
        claim: 'Full-Workflow AI Co-pilot vs. Basic AI Screening',
        proof: 'Teamtailor\'s AI Co-pilot drafts job ads, summarizes resumes with weighted skill ranking, generates interview questions, and transcribes video interviews — all included in the base price. JazzHR introduced Talent Fit for AI-powered candidate screening and ranking, but it\'s limited to Plus and Pro plans and focuses narrowly on screening. Teamtailor\'s AI spans the entire hiring lifecycle — from job ad creation to interview transcription.',
        ttFeature: 'AI Co-pilot'
      },
      {
        claim: 'Career Site Builder vs. Basic Job Board',
        proof: 'JazzHR offers a basic, unbranded job board. Teamtailor\'s Career Site Builder creates fully branded, conversion-optimized career sites with drag-and-drop customization, team stories, blog integration, and dynamic content blocks.',
        ttFeature: 'Career Site Builder'
      },
      {
        claim: 'Nurture Campaigns vs. Manual Follow-Up',
        proof: 'Teamtailor\'s Nurture Campaigns automatically engage passive and silver-medalist candidates through branded email sequences. JazzHR requires manual follow-up for every candidate interaction — nothing is automated beyond basic status notifications.',
        ttFeature: 'Nurture Campaigns'
      }
    ],
    objections: [
      {
        question: 'JazzHR is much cheaper — we can\'t justify the price difference.',
        script: '"JazzHR is affordable, but what is the cost of a dated candidate experience? If your career page looks like it was built in 2018, top candidates bounce to competitors with modern, branded career sites. Teamtailor\'s Career Site Builder, AI Co-pilot, and unlimited users mean you\'re investing in quality-of-hire, not just tracking applicants. Companies that switch from JazzHR typically see a 40%+ increase in quality applicants."'
      },
      {
        question: 'JazzHR does everything we need right now.',
        script: '"That\'s fair for today. But what about next quarter when you\'re hiring 3x more? JazzHR doesn\'t scale — no AI, no CRM, no talent nurture, and a career page that won\'t impress the senior candidates you\'ll need to attract. Teamtailor grows with you: AI Co-pilot, branded career site, Nurture Campaigns, and unlimited users mean you won\'t have to migrate again in 18 months."'
      }
    ],
    trapQuestions: [
      {
        question: 'Have you tried applying to one of your own open jobs from your phone recently?',
        painHighlighted: 'Exposes JazzHR\'s poor mobile application experience — clunky, unresponsive, and dated. Teamtailor\'s mobile-first, no-account-required flow converts in 60 seconds.'
      },
      {
        question: 'How would your best candidates describe their application experience with your company?',
        painHighlighted: 'Forces them to confront that JazzHR\'s dated UX creates a poor first impression. Top candidates judge companies by their hiring experience — Teamtailor makes it premium.'
      }
    ]
  },
  {
    id: 'bc_hirebridge',
    competitorName: 'HireBridge',
    logoText: 'HB',
    winRate: 90,
    pricingIntelligence: 'Unknown public pricing. Legacy ATS with catastrophic support — one prospect reported 5 months with zero response to a feature request. Interface described as "looking like 1987" with 3-5 minute page load times and no mobile app.',
    whenWeWin: [
      'Literally always — HireBridge is legacy tech with no innovation, no AI, no mobile support.',
      'Prospect is frustrated by vendor abandonment (5+ months no support response).',
      'Career site looks visually outdated — the "1987" contrast is devastatingly effective.',
      'Hiring managers need mobile access and HireBridge has zero mobile capability.'
    ],
    whenWeLose: [
      'Extreme inertia where no one wants to own the migration project.'
    ],
    competitorStrengths: [
      'Deeply embedded in long-term customers through legacy contracts.',
      'Low switching urgency if hiring volume is very low.'
    ],
    ourDifferentiators: [
      { claim: 'Modern Platform vs. 1987 Interface', proof: 'HireBridge prospects describe 3-5 minute page load times and an interface that "looks like 1987." Teamtailor\'s modern, drag-and-drop Career Site Builder launches a fully branded careers page in 15 minutes.', ttFeature: 'Career Site Builder' },
      { claim: 'AI Co-pilot vs. Zero AI', proof: 'HireBridge has zero AI capabilities. Teamtailor\'s AI Co-pilot screens resumes, drafts job ads, generates interview questions, and transcribes video interviews — all included.', ttFeature: 'AI Co-pilot' },
      { claim: 'Full Mobile App vs. No Mobile', proof: 'HireBridge has no mobile app. Teamtailor\'s iOS/Android app lets hiring managers review candidates, approve offers, and leave feedback from anywhere.', ttFeature: 'Mobile App' },
      { claim: 'Dedicated Support vs. Vendor Abandonment', proof: 'One HireBridge customer waited 5 months for a support response. Teamtailor provides dedicated CSM support with 40-second avg response time and 97% customer retention.', ttFeature: 'Customer Success' }
    ],
    objections: [
      { question: 'We\'ve been on HireBridge for years — switching feels risky.', script: '"I understand. But if HireBridge hasn\'t responded to your support request in 5 months, who is taking the bigger risk? Every day on a system with 3-5 minute load times is a day your best candidates bounce. We migrate companies off legacy ATS platforms every week — average go-live is 2-3 weeks."' },
      { question: 'Our data is trapped in HireBridge.', script: '"Data migration is our specialty. We\'ve built automated tooling for legacy ATS extraction. Your active candidates, job history, and pipeline data come over cleanly. The question isn\'t whether migration is hard — it\'s whether staying on a dead platform is harder."' }
    ],
    trapQuestions: [
      { question: 'When was the last time HireBridge shipped a feature update that changed how you recruit?', painHighlighted: 'Forces them to confront that HireBridge is a dead platform. Teamtailor ships weekly product updates with 14+ AI features.' },
      { question: 'If a top candidate applied on their phone right now, what would their experience look like?', painHighlighted: 'Exposes HireBridge\'s complete lack of mobile capability. Teamtailor\'s mobile-first apply flow converts in 60 seconds.' }
    ]
  },
  {
    id: 'bc_edjoin',
    competitorName: 'EdJoin',
    logoText: 'EJ',
    winRate: 85,
    pricingIntelligence: 'State-mandated platform for K-12 education in California. Free to use but extremely outdated with zero customization. Mass-apply bots flood listings with unqualified candidates and there is no filtering capability.',
    whenWeWin: [
      'K-12 district wants to stand out from generic EdJoin listings that all look identical.',
      'District is overwhelmed by mass-apply bot spam with no way to filter quality candidates.',
      'HR team needs AI screening to handle volume (900+ applications per role reported).',
      'District wants branded careers page to compete for talent against private sector.'
    ],
    whenWeLose: [
      'District is mandated by state policy to use EdJoin exclusively with no budget for additional tools.',
      'Very small district with minimal hiring volume.'
    ],
    competitorStrengths: [
      'Free, state-mandated platform — zero cost to the district.',
      'All California K-12 candidates are already on EdJoin.',
      'Standard compliance workflows for education hiring.'
    ],
    ourDifferentiators: [
      { claim: 'Branded Careers vs. Generic Listings', proof: 'Every EdJoin listing looks identical — zero employer branding. Teamtailor\'s Career Site Builder lets districts create branded, compelling careers pages that stand out.', ttFeature: 'Career Site Builder' },
      { claim: 'AI Screening vs. Manual Review of 900+ Apps', proof: 'EdJoin has zero filtering. Districts report 900+ applications per role. Teamtailor\'s AI Co-pilot screens and ranks every applicant instantly.', ttFeature: 'AI Co-pilot' },
      { claim: 'Bot Protection vs. Mass-Apply Spam', proof: 'EdJoin is flooded by mass-apply bots. Teamtailor\'s knockout questions and AI screening filter out spam before it reaches recruiters.', ttFeature: 'Smart Application Forms' },
      { claim: 'Automation vs. 100% Manual Process', proof: 'EdJoin is entirely manual. Teamtailor automates the entire pipeline from application to offer.', ttFeature: 'Workflow Automation' }
    ],
    objections: [
      { question: 'EdJoin is free — we can\'t justify paying for an ATS.', script: '"EdJoin is free to use, but what does it cost you in recruiter time? If your team is manually reviewing 900+ applications per role with zero filtering, that\'s dozens of hours per hire. Teamtailor\'s AI screens every applicant instantly — the ROI pays for itself in the first month."' },
      { question: 'We\'re required to post on EdJoin by state mandate.', script: '"Absolutely — keep posting on EdJoin. Teamtailor sits on top as your recruiting command center — AI screening, branded career site, automation, and pipeline management. EdJoin feeds candidates in; Teamtailor helps you find the best ones."' }
    ],
    trapQuestions: [
      { question: 'How many of your last 900 applicants were actually qualified for the role?', painHighlighted: 'Exposes EdJoin\'s mass-apply bot problem and zero filtering. Teamtailor\'s AI screening surfaces the top 10% instantly.' },
      { question: 'What does your district\'s careers page look like compared to a tech company competing for the same math teacher?', painHighlighted: 'EdJoin\'s generic listings can\'t compete with private sector employer branding. Teamtailor levels the playing field.' }
    ]
  },
  {
    id: 'bc_loxo',
    competitorName: 'Loxo',
    logoText: 'Lx',
    winRate: 70,
    pricingIntelligence: 'Pricing not publicly available. Positioned as AI-powered talent intelligence platform for staffing agencies and exec search. Strong sourcing but weak on in-house recruiting, employer branding, and career site.',
    whenWeWin: [
      'Buyer is an in-house recruiting team, not a staffing agency.',
      'Company needs employer branding and a branded career site.',
      'Prospect needs experience-level filtering and structured interview workflows.',
      'Team wants AI screening across the full pipeline, not just sourcing automation.'
    ],
    whenWeLose: [
      'Buyer is a staffing agency or exec search firm primarily sourcing passive candidates.',
      'Use case is purely outbound recruiting with minimal inbound pipeline needs.'
    ],
    competitorStrengths: [
      'Strong outbound sourcing and candidate intelligence capabilities.',
      'Auto-stage-move on email reply — useful for high-volume agency outreach.',
      'AI-powered candidate matching for executive search use cases.'
    ],
    ourDifferentiators: [
      { claim: 'Full Recruiting Platform vs. Sourcing Tool', proof: 'Loxo is built for staffing agencies doing outbound sourcing. Teamtailor is a complete in-house platform with career site, ATS, CRM, AI screening, and onboarding.', ttFeature: 'All-in-One Platform' },
      { claim: 'Career Site Builder vs. No Employer Brand', proof: 'Loxo has no career site builder or employer branding. Teamtailor\'s drag-and-drop Career Site Builder creates fully branded, conversion-optimized career pages.', ttFeature: 'Career Site Builder' },
      { claim: 'AI Screening Across Full Pipeline', proof: 'Loxo\'s AI is focused on finding candidates externally. Teamtailor\'s AI Co-pilot screens every applicant, summarizes resumes, generates interview questions, and transcribes video interviews.', ttFeature: 'AI Co-pilot' },
      { claim: 'Structured Interviews vs. No Interview Tools', proof: 'Prospects report Loxo lacks experience-level filtering and interview transcription. Teamtailor provides Interview Kits with structured scorecards and AI transcription.', ttFeature: 'Interview Kits' }
    ],
    objections: [
      { question: 'Loxo\'s auto-stage-move on email reply is useful for our workflow.', script: '"Great efficiency feature. Teamtailor\'s trigger system does the same — and extends beyond email. Auto-move candidates based on screening scores, interview feedback, assessment completion, or time-in-stage. Full pipeline automation, not just outbound email."' },
      { question: 'We use Loxo for executive search.', script: '"If your primary use case is outbound exec search, Loxo may fit. But if you also hire non-exec roles, need a branded career site, or want a talent pipeline, you\'ll need both tools. Teamtailor gives you sourcing plus everything else in one platform."' }
    ],
    trapQuestions: [
      { question: 'What does a candidate experience when they visit your careers page today?', painHighlighted: 'Exposes Loxo\'s complete lack of career site and employer branding. For in-house teams, inbound talent attraction is critical.' },
      { question: 'How do you screen and rank the 200+ inbound applicants you get per role?', painHighlighted: 'Loxo\'s AI is sourcing-focused, not screening-focused. Teamtailor\'s AI screens every applicant with weighted scoring.' }
    ]
  },
  {
    id: 'bc_breezyhr',
    competitorName: 'Breezy HR',
    logoText: 'Bz',
    winRate: 78,
    pricingIntelligence: 'Budget-friendly at ~$2,091/year for small teams. Keyword search reported as broken. Limited automation, no AI screening, basic career pages.',
    whenWeWin: [
      'Company is scaling and Breezy\'s limitations become blocking (broken search, no AI).',
      'Prospect needs a career site that brands their company and converts candidates.',
      'Hiring managers need mobile app and consumer-grade experience.',
      'Team wants AI-powered screening to handle growing application volume.'
    ],
    whenWeLose: [
      'Absolute lowest-cost buyer with minimal recruiting complexity.',
      'Very small team (<10 employees) that only needs basic job posting.'
    ],
    competitorStrengths: [
      'Very affordable entry-level pricing (~$2,091/year).',
      'Simple drag-and-drop pipeline management.',
      'Quick to set up for basic hiring needs.'
    ],
    ourDifferentiators: [
      { claim: 'Working Search vs. Broken Keywords', proof: 'Breezy\'s keyword search reportedly can\'t find "UKG Ready" in resumes. Teamtailor\'s AI Co-pilot understands context and skills — not just keywords.', ttFeature: 'AI Co-pilot' },
      { claim: 'Career Site Builder vs. Basic Job Board', proof: 'Breezy offers basic career pages with minimal customization. Teamtailor\'s Career Site Builder creates fully branded career sites with team stories, blog, and dynamic content.', ttFeature: 'Career Site Builder' },
      { claim: 'Full Automation vs. Limited Triggers', proof: 'Breezy\'s automation is limited. Teamtailor\'s trigger system automates stage transitions, communications, scheduling, and follow-ups.', ttFeature: 'Workflow Automation' },
      { claim: 'Nurture Campaigns vs. No Talent Engagement', proof: 'Breezy has no native talent nurture. Teamtailor\'s Nurture Campaigns engage silver-medalist and passive candidates through branded email sequences.', ttFeature: 'Nurture Campaigns' }
    ],
    objections: [
      { question: 'Breezy is much cheaper than Teamtailor.', script: '"Breezy\'s price looks attractive, but what\'s the cost of a broken search function? If recruiters can\'t find qualified candidates in their own database, you\'re paying twice — once for Breezy and again in wasted hours. Teamtailor\'s AI, Career Site Builder, and unlimited users deliver 10x the value."' },
      { question: 'Breezy does everything we need.', script: '"That may be true today. But as volume grows, can broken keyword search keep up? Can it build a branded career site? Can it nurture passive candidates? These capabilities separate companies that hire well from those that struggle."' }
    ],
    trapQuestions: [
      { question: 'Try searching for a specific skill in your Breezy candidate database — how accurate are the results?', painHighlighted: 'Exposes broken keyword search. Teamtailor\'s AI understands skills and context, not just keywords.' },
      { question: 'What happens to great candidates who weren\'t selected — can you re-engage them?', painHighlighted: 'Breezy has no talent nurture. Silver-medalist candidates are lost. Teamtailor\'s Nurture Campaigns keep them warm.' }
    ]
  },
  {
    id: 'bc_bullhorn',
    competitorName: 'Bullhorn',
    logoText: 'Bh',
    winRate: 72,
    pricingIntelligence: 'Enterprise pricing, not publicly available. Primarily a staffing/recruiting agency CRM. Known for clunky UI, expensive licensing, and poor candidate experience on the employer brand side.',
    whenWeWin: [
      'Buyer is an in-house corporate TA team, not a staffing agency.',
      'Prospect cares about candidate experience and employer branding.',
      'Company wants modern, consumer-grade UX for recruiters and hiring managers.',
      'Team needs AI-powered screening and career site capabilities.'
    ],
    whenWeLose: [
      'Buyer is a staffing agency deeply embedded in Bullhorn\'s ecosystem.',
      'Use case is primarily temp placement or contract staffing workflows.'
    ],
    competitorStrengths: [
      'Dominant platform in staffing/agency recruiting market.',
      'Strong CRM capabilities for managing client relationships.',
      'Deep integration ecosystem for staffing-specific workflows.'
    ],
    ourDifferentiators: [
      { claim: 'Corporate TA Platform vs. Agency CRM', proof: 'Bullhorn is built for staffing agencies managing client relationships. Teamtailor is built for in-house recruiting with career site, employer branding, AI screening, and onboarding.', ttFeature: 'All-in-One Platform' },
      { claim: 'Modern UX vs. Clunky Interface', proof: 'Bullhorn\'s UI is widely described as clunky and dated. Teamtailor\'s modern interface drives adoption — hiring managers actually log in daily.', ttFeature: 'Intuitive UX + Mobile App' },
      { claim: 'Career Site Builder vs. No Employer Brand', proof: 'Bullhorn has minimal employer branding for in-house use. Teamtailor\'s Career Site Builder creates branded career sites that convert visitors into applicants.', ttFeature: 'Career Site Builder' },
      { claim: 'AI Co-pilot vs. Basic Automation', proof: 'Teamtailor\'s AI Co-pilot screens resumes, drafts job ads, generates interview questions, and transcribes video interviews. Bullhorn\'s AI is staffing-focused.', ttFeature: 'AI Co-pilot' }
    ],
    objections: [
      { question: 'We\'re already on Bullhorn and our team knows it.', script: '"Bullhorn is excellent for staffing. But for in-house recruiting, you need career site, employer branding, AI screening, and candidate experience. Teamtailor integrates with your stack and gives your TA team tools Bullhorn was never designed to provide."' },
      { question: 'Bullhorn has a large integration marketplace.', script: '"Bullhorn\'s integrations are for staffing — VMS, client billing, temp tracking. For corporate TA, Teamtailor has 450+ integrations including LinkedIn RSC, major HRIS, assessments, and background checks."' }
    ],
    trapQuestions: [
      { question: 'When a candidate visits your careers page, what experience do they get before they apply?', painHighlighted: 'Exposes Bullhorn\'s lack of career site and employer branding for in-house use.' },
      { question: 'How do your hiring managers interact with candidates in Bullhorn today?', painHighlighted: 'Exposes Bullhorn\'s clunky agency-first interface that corporate hiring managers refuse to use.' }
    ]
  },
  {
    id: 'bc_rippling',
    competitorName: 'Rippling',
    logoText: 'Rp',
    winRate: 68,
    pricingIntelligence: 'PEPM model at ~$9.60 PEPM. All employees counted. ~$29,840 Year 1 at 145 employees ($27,840 recurring + $1,999 implementation). Scales aggressively. Strongest value is native HRIS/payroll — ATS is a module, not standalone.',
    whenWeWin: [
      'Buyer evaluates ATS independently from HRIS — Rippling\'s ATS is secondary.',
      'Prospect needs employer branding and career site capabilities.',
      'Company wants AI-powered recruiting beyond basic applicant tracking.',
      'Team needs CRM/nurture and talent pool management.'
    ],
    whenWeLose: [
      'Company is deeply embedded in Rippling\'s full HRIS/payroll/IT ecosystem.',
      'Buyer prioritizes headcount planning module over standalone ATS.'
    ],
    competitorStrengths: [
      'Native HRIS/payroll/IT integration — seamless data flow.',
      'Dedicated Headcount Planning module aligning HR, Finance, and Recruiting.',
      'Consistent UX across all Rippling platform apps.',
      'Real-time headcount + recruiting progress analytics.'
    ],
    ourDifferentiators: [
      { claim: 'Purpose-Built ATS vs. HRIS Module', proof: 'Rippling\'s ATS is a module within their HR platform — it lacks AI depth, career site tools, and CRM of a dedicated recruiting solution. Teamtailor is purpose-built with 14+ AI features.', ttFeature: 'Full ATS Platform' },
      { claim: 'Career Site Builder vs. Basic Career Page', proof: 'Rippling offers basic career site. Teamtailor\'s drag-and-drop Career Site Builder creates fully branded, conversion-optimized career sites.', ttFeature: 'Career Site Builder' },
      { claim: '70% Lower Cost at Scale', proof: 'Rippling costs ~$29,840/yr at 145 employees. Teamtailor costs ~$5K–$7K — 70%+ cheaper with all features included.', ttFeature: 'Headcount-Based Pricing' },
      { claim: 'Recruiting-Specialist AI vs. Platform-Wide AI', proof: 'Rippling has added AI recruiting features including AI Job Posting, AI Application Review, Interview Assistant, Smart Scheduling, and AI Video Screens. However, Rippling\'s AI is spread across a massive platform (HRIS, IT, Finance) — recruiting is one of many priorities. Teamtailor\'s AI Co-pilot is 100% focused on talent acquisition, with 60M+ candidates screened and purpose-built workflows for the full hiring lifecycle.', ttFeature: 'AI Co-pilot' }
    ],
    objections: [
      { question: 'We\'re already on Rippling for HRIS.', script: '"Rippling is excellent for HRIS and payroll. But their ATS is a module, not a mission. Teamtailor integrates via API — employee data stays in sync. Keep Rippling for HR admin, add a world-class recruiting front-end. And save 70% compared to Rippling\'s ATS pricing."' },
      { question: 'Rippling\'s headcount planning is valuable to us.', script: '"Headcount Planning is genuinely Rippling\'s strongest differentiator. But planning tells you who to hire. Teamtailor tells you how. Keep Rippling for planning, add Teamtailor for the recruiting engine that fills those plans with quality talent."' }
    ],
    trapQuestions: [
      { question: 'What does your Rippling career site look like when a top candidate finds you on Google?', painHighlighted: 'Exposes basic career page lacking employer branding depth.' },
      { question: 'How is Rippling using AI to help you screen and rank candidates?', painHighlighted: 'Exposes that Rippling doesn\'t highlight AI as a recruiting capability.' }
    ]
  },
  {
    id: 'bc_jobvite',
    competitorName: 'Jobvite',
    logoText: 'Jv',
    winRate: 70,
    pricingIntelligence: 'Quote-based enterprise pricing. Est. $8K–$12K/yr at 50 employees, scaling to $15K–$22K at 145. $1K–$10K implementation fee. Part of Employ Inc. (same parent as Lever). AI Companion launched 2025 with IBM watsonx.',
    whenWeWin: [
      'Buyer is SMB/mid-market and Jobvite\'s enterprise complexity is overkill.',
      'Company wants simplicity + speed over enterprise feature depth.',
      'Prospect cares about career site conversion — Jobvite\'s pages feel dated.',
      'Team wants transparent, predictable pricing vs. opaque enterprise quotes.'
    ],
    whenWeLose: [
      'Enterprise buyer (500+) needing complex CRM + ATS + recruitment marketing.',
      'Heavy social recruiting use case where Jobvite\'s strength matters.'
    ],
    competitorStrengths: [
      'Strong native CRM with talent pools, multi-touch campaigns, and candidate nurturing.',
      'AI Companion (2025) with IBM watsonx — screening, JD grader, bias blocker.',
      '300+ integrations including ADP, Workday, Oracle, LinkedIn Apply Connect.',
      '60+ pre-built reporting dashboards with DE&I tracking.',
      'Social recruiting capabilities with deep LinkedIn/Indeed integration.'
    ],
    ourDifferentiators: [
      { claim: 'Simplicity + Speed vs. Enterprise Complexity', proof: 'Jobvite is built for 500+ enterprises. Teamtailor delivers same power in a package that deploys in 2-4 weeks and every hiring manager uses.', ttFeature: 'Rapid Deployment + Intuitive UX' },
      { claim: 'Career Site Builder vs. Dated Career Pages', proof: 'Jobvite\'s career pages feel functional but dated. Teamtailor\'s Career Site Builder is the best in market — drag-and-drop, branded, mobile-optimized.', ttFeature: 'Career Site Builder' },
      { claim: 'Transparent Pricing vs. Opaque Quotes', proof: 'Jobvite requires custom quotes that scale unpredictably. Teamtailor\'s headcount-based pricing is transparent — all features included, no per-seat charges.', ttFeature: 'Headcount-Based Pricing' },
      { claim: 'Same Parent, Different Innovation', proof: 'Jobvite shares parent (Employ Inc.) with Lever. Innovation has slowed. Teamtailor is independent, shipping weekly updates.', ttFeature: 'Product Innovation' }
    ],
    objections: [
      { question: 'Jobvite has a stronger CRM and social recruiting suite.', script: '"Jobvite\'s CRM is strong for enterprise social recruiting. But does your team need that complexity? Teamtailor\'s CRM with Connect and Nurture Campaigns covers 90% in a package your whole team uses from day one."' },
      { question: 'Jobvite just launched an AI Companion with IBM watsonx.', script: '"They did — promising. But Teamtailor has shipped AI for years. Our Co-pilot has screened 60M+ candidates. Do you want to be an early adopter of a new AI product, or deploy proven AI for 13,000 customers?"' }
    ],
    trapQuestions: [
      { question: 'How long did your Jobvite implementation take from contract to first hire?', painHighlighted: 'Exposes Jobvite\'s 4-8 week enterprise implementation. Teamtailor deploys in 2-4 weeks.' },
      { question: 'What\'s your annual Jobvite cost, and how much has it increased at each renewal?', painHighlighted: 'Exposes opaque pricing and renewal increases. Teamtailor\'s headcount pricing is predictable.' }
    ]
  },
  {
    id: 'bc_isolved',
    competitorName: 'isolved',
    logoText: 'iS',
    winRate: 75,
    pricingIntelligence: 'PEPM bundled HCM model at $9–$25 PEPM. ATS is an add-on to isolved People Cloud. ~$5K–$9K/yr at 50 employees, scaling to $15K–$40K/yr at 145 employees. Implementation fee ~10–25% of annual cost.',
    whenWeWin: [
      'Buyer evaluates ATS independently — isolved\'s recruiting is secondary to HCM.',
      'Prospect needs employer branding and career site beyond basic HRIS listings.',
      'Company wants deeper AI than isolved\'s growing but basic offering.',
      'Team needs dedicated CRM and talent nurture.'
    ],
    whenWeLose: [
      'Company wants to consolidate HCM + payroll + ATS into one platform.',
      'Very compliance-focused buyer valuing native payroll sync above all.'
    ],
    competitorStrengths: [
      'Native payroll and HCM integration — zero sync required.',
      'AI-assisted screening and resume parsing built into ATS module.',
      '30+ out-of-box compliance reports plus DEI tracking.',
      'Good for SMB/MM wanting all-in-one HCM.'
    ],
    ourDifferentiators: [
      { claim: 'Recruiting Depth vs. HCM Add-On', proof: 'isolved\'s ATS is an add-on to People Cloud HCM. Teamtailor is purpose-built for talent acquisition with full recruiting depth.', ttFeature: 'Full ATS Platform' },
      { claim: 'Career Site Builder vs. Basic Job Listings', proof: 'isolved offers standard career pages with less branding. Teamtailor\'s Career Site Builder creates the best candidate experience in market.', ttFeature: 'Career Site Builder' },
      { claim: 'Advanced AI vs. Basic Screening', proof: 'isolved has growing AI but not platform-wide. Teamtailor\'s AI Co-pilot spans the entire workflow: screening, job ads, interview questions, video transcription.', ttFeature: 'AI Co-pilot' },
      { claim: 'Predictable Pricing vs. PEPM Escalation', proof: 'isolved PEPM ($9–$25/employee/month) can reach $40K/yr at 145 employees. Teamtailor stays at $5K–$7K with all features.', ttFeature: 'Headcount-Based Pricing' }
    ],
    objections: [
      { question: 'We want everything in one platform.', script: '"Fair goal. But isolved\'s ATS is an add-on to payroll — not where they innovate. Teamtailor integrates via API, payroll stays in sync. Keep isolved for HCM, add a purpose-built recruiting engine with AI, career site, and CRM."' },
      { question: 'isolved has AI features now too.', script: '"isolved is investing in AI — great. But their AI is growing, not mature. Teamtailor has screened 60M+ candidates. Our Co-pilot is across the entire workflow, not just screening."' }
    ],
    trapQuestions: [
      { question: 'What does your isolved career page look like vs. companies you compete for talent with?', painHighlighted: 'Exposes basic career pages vs. Teamtailor\'s market-leading Career Site Builder.' },
      { question: 'How much of isolved\'s AI is specifically for recruiting vs. general HR?', painHighlighted: 'isolved\'s AI is general HCM-focused, not recruiting-specialist.' }
    ]
  },
  {
    id: 'bc_adp',
    competitorName: 'ADP Workforce Now',
    logoText: 'ADP',
    winRate: 80,
    pricingIntelligence: 'Bundled HRIS+Payroll+Recruiting. Recruiting module is add-on to Workforce Now platform. Quote-based enterprise pricing — typically $5-15 PEPM depending on modules. ATS is an afterthought in a payroll bundle. Integration back to ADP for hired candidates is NON-NEGOTIABLE for many US prospects.',
    whenWeWin: [
      'Prospect is frustrated with rigid, outdated recruiting workflows inside ADP.',
      'Recruiter or HR manager describes ADP as "not user-friendly" or "stuck in the 80s."',
      'Team needs deep AI-powered recruiting — ADP\'s AI is basic and HR-focused.',
      'They want a real career site, not a generic job listing page.',
      'Hiring managers need mobile access and ADP has no native recruiting mobile app.',
      'Analytics require manually entering data into ADP backend.'
    ],
    whenWeLose: [
      'IT/Procurement mandates everything must live in a single ADP ecosystem with zero external tools.',
      'Company has minimal hiring volume and ADP\'s basic module is "good enough."'
    ],
    competitorStrengths: [
      'Massive installed base — ADP is the default US HRIS/payroll platform.',
      'Deep payroll, benefits, and compliance capabilities.',
      'Single-vendor simplicity for companies that want one platform for everything.',
      'Strong brand trust with CFOs and finance teams.'
    ],
    ourDifferentiators: [
      {
        claim: 'Modern UX vs. 1980s Interface',
        proof: 'ADP prospect quote: "ADP keeps you in the \'80s in a box around what you can do around communications, automation, collaboration." Teamtailor\'s modern interface is intuitive from day one — no training required.',
        ttFeature: 'Intuitive UX + Mobile App'
      },
      {
        claim: 'Purpose-Built Recruiting AI vs. General HR AI',
        proof: 'ADP has introduced AI capabilities including Candidate Relevancy (AI matching), AI-Powered Natural Language Search, and ADP Assist agents for HR workflows. However, these are general-purpose HR AI tools — not purpose-built for talent acquisition. Teamtailor\'s AI Co-pilot is designed specifically for recruiting: screening and scoring candidates, drafting optimized job ads, generating interview questions from job descriptions, and transcribing video interviews — all included in the base price.',
        ttFeature: 'AI Co-pilot'
      },
      {
        claim: 'Career Site Builder vs. No Career Site',
        proof: 'ADP offers no career site builder. Teamtailor\'s drag-and-drop Career Site Builder creates fully branded career sites with video, culture content, team profiles, and blog integration.',
        ttFeature: 'Career Site Builder'
      },
      {
        claim: 'Seamless ADP Integration',
        proof: 'Teamtailor integrates with ADP via webhook — hired candidate data pushes directly into ADP Workforce Now. Keep ADP for payroll and HRIS; Teamtailor handles recruiting. Zero re-entry.',
        ttFeature: 'ADP Integration (Webhook)'
      },
      {
        claim: 'Real-Time Analytics vs. Manual Backend Entry',
        proof: 'ADP prospect quote: "I have to go in the backend and put in all the data into ADP to use their analytics." Teamtailor\'s analytics are real-time, automatic, and built-in — source ROI, pipeline velocity, time-to-hire.',
        ttFeature: 'Analytics Dashboard'
      }
    ],
    objections: [
      {
        question: 'We need to keep ADP — it\'s our HRIS and payroll.',
        script: '"Absolutely — keep ADP for what it\'s best at: payroll and HR admin. Teamtailor integrates directly with ADP via webhook. When a candidate is hired in Teamtailor, their data pushes into ADP automatically. No re-entry, no duplicate work. You get a world-class recruiting front-end and ADP stays your system of record."'
      },
      {
        question: 'ADP just updated their recruiting dashboard.',
        script: '"They did — and their own users report getting no training on the changes. One ADP customer told us they feel like ADP "is not super user-friendly" and the dashboard change came with zero notice. Teamtailor ships updates continuously with in-app guidance. You\'ll never be surprised by a change you weren\'t trained on."'
      },
      {
        question: 'Switching is too risky — we\'re deeply embedded in ADP.',
        script: '"You\'re not switching ADP — you\'re adding a recruiting layer on top. Think of Teamtailor as the candidate-facing front-end that feeds hired data into ADP. We deploy in weeks, and your payroll and HRIS stay exactly as they are."'
      }
    ],
    trapQuestions: [
      {
        question: 'How much time does your team spend manually entering data into ADP\'s backend to get recruiting analytics?',
        painHighlighted: 'Exposes ADP\'s manual analytics workflow. Teamtailor\'s real-time dashboards require zero manual data entry.'
      },
      {
        question: 'When ADP last updated their recruiting dashboard, how much training did you receive?',
        painHighlighted: 'Exposes ADP\'s pattern of shipping changes with no training. "We got no previous training" — Teamtailor\'s intuitive UX means no training needed.'
      },
      {
        question: 'What does a candidate see when they visit your careers page on their phone?',
        painHighlighted: 'Exposes ADP\'s lack of career site and mobile experience. Teamtailor\'s mobile-first Career Site Builder creates stunning branded experiences.'
      }
    ]
  },
  {
    id: 'bc_paylocity',
    competitorName: 'Paylocity',
    logoText: 'PL',
    winRate: 76,
    pricingIntelligence: 'Bundled HRIS+Payroll+Recruiting. PEPM model — typically $6-12 PEPM. Recruiting module is add-on to Paylocity platform. Positioned as mid-market HCM but recruiting is basic ATS functionality, not a talent attraction platform.',
    whenWeWin: [
      'Prospect describes Paylocity as "just an applicant tracking system" — not a talent attraction platform.',
      'Team needs mobile access and Paylocity has none for recruiting.',
      'They want employer branding and a career site — Paylocity has no branding tools.',
      'Recruiter is frustrated that the platform isn\'t intuitive or candidate-forward.',
      'They want deep, recruiting-specific AI — Paylocity\'s AI is still maturing.',
      'Prospect mentions performance management pain (Paylocity is weak here too).'
    ],
    whenWeLose: [
      'Company has very low hiring volume and Paylocity\'s basic tracking is sufficient.',
      'IT mandates everything in one HCM ecosystem with zero external recruiting tools.'
    ],
    competitorStrengths: [
      'Solid mid-market HRIS and payroll platform.',
      'Modern-looking HCM interface (better than ADP/Paycor).',
      'Strong employee engagement and community features.',
      'Growing LMS and learning management capabilities.'
    ],
    ourDifferentiators: [
      {
        claim: 'Talent Attraction vs. Applicant Tracking',
        proof: 'Paylocity prospect quote: "Paylocity is what it is. It\'s just an applicant tracking system. It is not a people attraction system." Teamtailor is built to attract, engage, and convert talent — not just track them.',
        ttFeature: 'Career Site Builder + Employer Branding'
      },
      {
        claim: 'Recruiting-First Mobile App vs. Generic HCM Mobile',
        proof: 'Paylocity has invested in mobile-first capabilities and AI on mobile for their broader HCM platform. However, their recruiting-specific mobile experience remains limited — prospect feedback indicates frustration with on-the-go recruiting workflows. Teamtailor\'s iOS/Android app is purpose-built for recruiting: review candidates, approve offers, leave feedback, and collaborate with hiring managers from anywhere.',
        ttFeature: 'Mobile App'
      },
      {
        claim: 'Recruiting-Native AI vs. Emerging AI',
        proof: 'Paylocity has been investing in AI — they acquired Grayscale (April 2026), launched an AI Assistant, and introduced AI Assist for Recruiting. These are promising steps, but Paylocity\'s AI is still maturing within their HCM-first platform. Teamtailor\'s AI Co-pilot has screened 60M+ candidates and is purpose-built for the full recruiting workflow: resume screening, job ad drafting, interview question generation, and video transcription — all included from day one.',
        ttFeature: 'AI Co-pilot'
      },
      {
        claim: 'Nurture Campaigns vs. Dead-End Pipeline',
        proof: 'Paylocity has no CRM or nurture capability. Teamtailor\'s Nurture Campaigns and Connect talent pools re-engage silver-medalist and passive candidates automatically.',
        ttFeature: 'Nurture Campaigns + Connect'
      },
      {
        claim: 'Candidate-Forward Design vs. Admin-First UX',
        proof: 'Paylocity prospect quote: "It\'s not intuitive and it\'s not tech forward and it\'s not candidate forward." Teamtailor is designed candidate-first with mobile apply, branded communications, and sub-4-minute application times.',
        ttFeature: 'Candidate Experience'
      },
      {
        claim: 'Email Deliverability vs. Gmail Spam',
        proof: 'Paylocity funnels Gmail addresses into spam and junk — candidates with Gmail never receive communications. Teamtailor uses enterprise-grade email with SPF/DKIM/DMARC for reliable delivery.',
        ttFeature: 'Email Deliverability'
      }
    ],
    objections: [
      {
        question: 'We already use Paylocity for HRIS and payroll.',
        script: '"Keep Paylocity for what it does well — payroll and HR admin. Teamtailor integrates via API to push hired candidate data into Paylocity. You get a purpose-built recruiting engine with AI, career site, and mobile app while keeping your HRIS intact. No disruption."'
      },
      {
        question: 'Paylocity is adding recruiting features.',
        script: '"They are — but their own users describe it as "just an applicant tracking system, not a people attraction system." Adding features to a payroll platform doesn\'t make it a recruiting engine. Teamtailor has 13,000+ customers and 14+ AI features purpose-built for talent acquisition."'
      },
      {
        question: 'We don\'t want to manage another vendor.',
        script: '"I get it. But right now you\'re managing frustration instead of a vendor. Your team can\'t work on mobile, candidates see a process that isn\'t candidate-forward, and there\'s no AI screening. Teamtailor deploys in weeks, integrates with Paylocity, and pays for itself in recruiter time savings within the first month."'
      }
    ],
    trapQuestions: [
      {
        question: 'Can your team review candidates, schedule interviews, or approve offers from their phone right now?',
        painHighlighted: 'Exposes Paylocity\'s complete lack of mobile recruiting. "We cannot do anything on the go" — Teamtailor\'s mobile app solves this instantly.'
      },
      {
        question: 'How does Paylocity help you attract talent — beyond just listing open jobs?',
        painHighlighted: 'Exposes that Paylocity is an ATS, not a talent attraction platform. No career site, no branding, no nurture. Teamtailor is the complete employer branding + recruiting engine.'
      },
      {
        question: 'What feedback do candidates give you about their application experience?',
        painHighlighted: 'Exposes the poor candidate experience. "Not intuitive, not tech forward, not candidate forward" — Teamtailor\'s mobile-first, branded experience is the opposite.'
      },
      {
        question: 'Do candidates with Gmail addresses consistently receive your emails from Paylocity?',
        painHighlighted: 'Exposes the Gmail spam bug. "Any Gmail email addresses, the Paylocity system funnels that into spam and junk." Devastating for candidate communication — Teamtailor\'s deliverability is enterprise-grade.'
      }
    ]
  }
];
