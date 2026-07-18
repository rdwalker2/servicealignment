export interface TalkTrack {
  displacementAngle: string;
  discoveryQuestions: [string, string, string];
  objections: Array<{ objection: string; rebuttal: string }>;
  nameDrop: string;
}

export const COMPETITOR_TALK_TRACKS: Record<string, TalkTrack> = {
  greenhouse: {
    displacementAngle:
      'Lead with employer brand ROI — Greenhouse charges extra for the thing Teamtailor does natively.',
    discoveryQuestions: [
      'Your careers site — is it built inside Greenhouse or are you stitching together a separate CMS on top of it?',
      'When a candidate drops off mid-application, do you know exactly where in the funnel they left and why?',
      'How much time does your team spend every week just formatting job ads and updating brand assets across all your open roles?',
    ],
    objections: [
      {
        objection: 'We\'ve heavily customised Greenhouse — switching feels risky.',
        rebuttal:
          'Customisation debt is real, but you\'re paying to maintain someone else\'s architecture. Teamtailor\'s no-code career site builder replaces 80% of what your devs built in Greenhouse Connect — we migrate you in 4 weeks with zero downtime on live roles.',
      },
      {
        objection: 'Greenhouse has a much larger integration marketplace.',
        rebuttal:
          'True — but you\'re likely using 4–6 integrations, not 400. Tell me which ones are critical; we\'ve natively built 95% of them and have a REST API for the rest. Most customers find they actually use fewer tools after switching.',
      },
      {
        objection: 'Our hiring managers are trained on Greenhouse already.',
        rebuttal:
          'Greenhouse takes an average of 3 weeks to onboard a new hiring manager. Teamtailor\'s average is 2 days — hiring managers interact through a streamlined review panel, not a full ATS. Re-training friction is lower than you think.',
      },
    ],
    nameDrop:
      'Klarna moved 400 hiring managers off Greenhouse onto Teamtailor in 6 weeks and cut their time-to-publish-a-job from 4 days to 45 minutes.',
  },

  workday: {
    displacementAngle:
      'Position Teamtailor as the talent acquisition layer Workday Recruiting was never designed to be.',
    discoveryQuestions: [
      'Honest question — when did your talent team last request a change to the careers site, and how long did it actually take to go live?',
      'What percentage of your open roles get more than 20 qualified applicants? Because if sourcing is the bottleneck, we should talk about that specifically.',
      'Is your Workday Recruiting config managed internally or through a consulting partner, and what\'s the annual cost of that support?',
    ],
    objections: [
      {
        objection: 'We\'re already in the Workday ecosystem — it\'s simpler to keep recruiting there.',
        rebuttal:
          'Workday\'s strength is HCM — payroll, comp, workforce planning. Recruiting was bolted on. You\'re essentially running Formula 1 logistics in a cargo van. Teamtailor connects to Workday HCM via standard API so your single source of truth stays intact — you just get a world-class hiring front-end.',
      },
      {
        objection: 'Our CHRO doesn\'t want another vendor to manage.',
        rebuttal:
          'That\'s exactly what Workday wants you to believe. But right now you have Workday + a consulting firm managing it. With Teamtailor, your TA team owns the platform — no tickets to IT, no implementation partner. You reduce vendors, you don\'t add one.',
      },
    ],
    nameDrop:
      'Polestar kept Workday for HCM and layered Teamtailor on top — their application-to-offer cycle dropped from 38 days to 21 days within the first quarter.',
  },

  lever: {
    displacementAngle:
      'Lever is a good ATS; Teamtailor is a hiring platform — challenge them to think bigger than pipeline management.',
    discoveryQuestions: [
      'Your current careers site — is it hosted on Lever or somewhere else, and who actually owns updates to it?',
      'Do candidates engaging with your brand on social media land on a branded careers page or a generic Lever apply link?',
      'How are you currently capturing silver-medallist candidates and nurturing them for future roles?',
    ],
    objections: [
      {
        objection: 'We love Lever\'s candidate relationship management features.',
        rebuttal:
          'Lever\'s CRM is solid for tracking — Teamtailor\'s Nurture is built for activating. You can segment your talent pool, trigger automated campaigns when roles open, and see engagement analytics. Most Lever customers are sitting on a goldmine of past candidates they never re-engage.',
      },
      {
        objection: 'Lever\'s pricing is more predictable for our headcount.',
        rebuttal:
          'Lever\'s per-seat model scales against you as you hire. Teamtailor prices by company size, not by seat, so a hiring surge doesn\'t double your ATS bill. For a company of your size, you\'re almost certainly in a cheaper bracket with us.',
      },
    ],
    nameDrop:
      'Factorial migrated from Lever to Teamtailor and saw a 3x increase in direct applications within 90 days by launching a careers site that actually matched their employer brand.',
  },

  bamboohr: {
    displacementAngle:
      'BambooHR built its recruiting module to check a box — you deserve a product built from the ground up for hiring.',
    discoveryQuestions: [
      'When you post a role in BambooHR, what does the candidate experience look like on mobile — have you applied to one of your own jobs recently?',
      'Are your recruiters using BambooHR\'s recruiting module, or have they gone rogue and started tracking things in spreadsheets or Notion on the side?',
      'What\'s your current source-of-hire breakdown, and how much of it is inbound through your careers site versus paid job boards?',
    ],
    objections: [
      {
        objection: 'We like having HR and recruiting in one system.',
        rebuttal:
          'That\'s a fair goal, but BambooHR\'s recruiting module was acquired and never fully rebuilt. The seam between HR records and recruiting pipeline is exactly where data falls through. Teamtailor integrates with BambooHR for onboarding handoff via API — you keep the unified HR vision, you just stop sacrificing recruiting quality to get it.',
      },
      {
        objection: 'Switching now would disrupt our current open roles.',
        rebuttal:
          'We run parallel migration — your live roles stay open in BambooHR until they close naturally. New roles launch in Teamtailor. Most customers are fully transitioned within one hiring cycle, which is usually 6–8 weeks.',
      },
    ],
    nameDrop:
      'Cure Media replaced BambooHR Recruiting with Teamtailor and halved their average time-to-fill from 52 days to 26 days in their first two quarters.',
  },

  ashby: {
    displacementAngle:
      'Ashby wins on analytics — meet them there, then show that Teamtailor gives you great data AND a careers site that actually converts.',
    discoveryQuestions: [
      'You\'re clearly data-driven — what\'s the single metric in your recruiting funnel right now that you most want to move, and what\'s blocking it?',
      'How much of your inbound pipeline comes through your branded careers site versus third-party job boards, and is that ratio improving?',
      'When you present hiring data to leadership, are you telling a conversion story or just a time-and-volume story?',
    ],
    objections: [
      {
        objection: 'Ashby\'s analytics are best-in-class and our team is hooked on them.',
        rebuttal:
          'Ashby\'s reporting is genuinely strong — we respect it. Teamtailor\'s analytics cover the full funnel including pre-apply career site behavior, which Ashby doesn\'t touch. You\'d see where candidates drop off before they even submit — that\'s the conversion data Ashby can\'t give you.',
      },
      {
        objection: 'We just implemented Ashby six months ago.',
        rebuttal:
          'That\'s actually great timing — you\'ve now lived inside Ashby long enough to know exactly what it does and doesn\'t do. Most customers who come to us at the 6-month mark have a clear list of gaps. What\'s yours?',
      },
    ],
    nameDrop:
      'Mentimeter switched from Ashby to Teamtailor and used the careers site conversion data to reduce job board spend by 40% in six months by understanding where top candidates actually came from.',
  },

  icims: {
    displacementAngle:
      'iCIMS is enterprise complexity without enterprise outcomes — frame Teamtailor as the antidote to ATS overhead.',
    discoveryQuestions: [
      'How many FTEs — inside TA and in IT — touch your iCIMS configuration today, and what\'s the annual cost of that overhead?',
      'When a hiring manager complains about the ATS, what\'s the specific thing they say — and how often does that complaint reach you?',
      'If I told you your time-to-publish a new role is 2.5x the industry benchmark, where in your iCIMS workflow would you expect the delay to be?',
    ],
    objections: [
      {
        objection: 'iCIMS meets our enterprise compliance requirements.',
        rebuttal:
          'Teamtailor is SOC 2 Type II, GDPR-compliant with built-in consent management, and ISO 27001 certified. We\'re used by publicly listed companies across Europe. Tell me which specific compliance requirements are on your checklist — I\'m confident we can walk through each one.',
      },
      {
        objection: 'We have a multi-year contract with iCIMS.',
        rebuttal:
          'Contract length is a procurement problem, not a product problem. We\'ve helped dozens of companies build the business case for an early exit — iCIMS\'s renewal discount often doesn\'t offset the productivity cost your team absorbs every month. What does your contract renewal date look like?',
      },
      {
        objection: 'Our volume of requisitions requires enterprise-grade workflow automation.',
        rebuttal:
          'Teamtailor\'s trigger and automation engine handles multi-stage workflows, conditional logic, and multi-department approvals at scale. We have customers managing 500+ concurrent requisitions. The difference is your TA team can actually configure it themselves — no IT ticket required.',
      },
    ],
    nameDrop:
      'Schibsted replaced iCIMS across 15 markets and cut their average cost-per-hire by 28% in year one, primarily through the reduction in external sourcing spend driven by a better inbound careers site.',
  },

  smartrecruiters: {
    displacementAngle:
      'SmartRecruiters oversells the marketplace — win by showing how Teamtailor delivers hiring velocity without the integration sprawl.',
    discoveryQuestions: [
      'You\'re on SmartRecruiters — how many of the marketplace integrations are you actually using, and which ones are genuinely driving outcomes versus just turned on?',
      'What does your apply completion rate look like on mobile right now — do you know that number off the top of your head?',
      'When a great candidate comes in through a referral, what\'s the actual experience like for the employee who made the referral?',
    ],
    objections: [
      {
        objection: 'SmartRecruiters has a much larger ecosystem of job board integrations.',
        rebuttal:
          'Wider isn\'t better if you\'re only using 5 of them. Teamtailor has native integrations with LinkedIn, Indeed, Glassdoor, and 30+ regional job boards, plus a multi-post API for anything else. You\'ll spend less time managing integrations and more time reviewing candidates.',
      },
      {
        objection: 'We use SmartRecruit\'s AI screening features heavily.',
        rebuttal:
          'Teamtailor\'s AI features are embedded at every touchpoint — auto-screening questions, AI-generated job descriptions, and intelligent candidate matching. The key difference is our AI is designed to keep candidates in the funnel with a great experience, not just filter them out faster.',
      },
    ],
    nameDrop:
      'Proximus Group moved from SmartRecruiters to Teamtailor and saw mobile application completion rates jump from 34% to 71% within 60 days of launch — purely from UX improvements.',
  },

  workable: {
    displacementAngle:
      'Workable users are ready to graduate — they\'ve outgrown it and just need permission to move on.',
    discoveryQuestions: [
      'You\'re on Workable — at what point did you realise your careers site was holding back the brand your marketing team has worked so hard to build?',
      'How many roles are you typically running concurrently right now, and does Workable\'s interface start to feel noisy or slow when pipelines get busy?',
      'What\'s your recruiter-to-hiring manager communication like inside Workable — are you staying in the tool or falling back to email and Slack?',
    ],
    objections: [
      {
        objection: 'Workable is affordable and does what we need.',
        rebuttal:
          'Workable is a great starter ATS — the question is whether you\'re still a starter-ATS company. The cost of a platform that can\'t scale with your hiring ambitions shows up in recruiter hours, failed searches, and candidate drop-off — not your SaaS bill. Teamtailor\'s pricing for your size is probably closer than you think.',
      },
      {
        objection: 'We don\'t have the bandwidth to migrate right now.',
        rebuttal:
          'That\'s the most common thing we hear — and it\'s usually a sign that the current tool is creating too much work to free up bandwidth for a better one. Our implementation team handles the full migration in 3 weeks, and your team\'s involvement is less than 4 hours total.',
      },
    ],
    nameDrop:
      'GetAccept outgrew Workable and switched to Teamtailor in a three-week migration — without pausing a single active role — and their employer brand NPS went from 32 to 67 within two months.',
  },

  taleo: {
    displacementAngle:
      'Taleo is legacy infrastructure masquerading as an ATS — this is a rescue operation, not a feature comparison.',
    discoveryQuestions: [
      'How many of your best candidates have you lost because the Taleo application process was simply too painful to complete — and how would you even know?',
      'What does it cost your IT team annually to maintain Taleo configuration, patches, and integrations — is that number in your budget or buried in IT overhead?',
      'When was the last time Taleo shipped a feature that genuinely changed how your team recruits — can you give me a specific example?',
    ],
    objections: [
      {
        objection: 'Taleo is deeply embedded in our Oracle infrastructure.',
        rebuttal:
          "That is the most common objection, and it is also the most solvable. Teamtailor has a pre-built Oracle HCM connector — we sit on top of your existing Oracle stack for headcount, org structure, and onboarding handoff. You modernise your hiring front-end without touching Oracle core.",
      },
      {
        objection: 'A migration project of this scale requires 12+ months.',
        rebuttal:
          "That is a Taleo migration. We are not migrating Taleo — we are replacing it. Teamtailor implementations average 6 weeks for companies of your size. We have moved companies off Taleo with 3,000+ employees in under 8 weeks. The timeline you are imagining is based on ERP logic, not ATS logic.",
      },
      {
        objection: "Leadership will not approve spend when we are already paying for Taleo.",
        rebuttal:
          "You are paying for Taleo to exist, but you are also paying for its consequences — recruiter overtime, job board dependency, agency fees to compensate for weak inbound. We will help you build a business case that quantifies that hidden cost. Most customers find the ROI case writes itself within a 30-minute cost analysis.",
      },
    ],
    nameDrop:
      "KPMG Nordic division replaced Taleo across 4 countries in 8 weeks — their time-to-hire dropped by 31% in the first half-year and they reduced agency dependency by over 400K EUR annually.",
  },

  adp: {
    displacementAngle:
      'ADP\'s ATS is a bolted-on afterthought inside a payroll/HRIS system. It was never designed to be a standalone ATS — position Teamtailor as the best-in-breed liberation from HRIS-bundled recruiting.',
    discoveryQuestions: [
      'When you applied for a role on ADP\'s careers page from your phone — how was that experience?',
      'How much of your recruiters\' time is spent working around ADP\'s limitations vs. actually recruiting?',
      'If ADP released a major ATS update tomorrow, would you trust it to be recruiting-first — or payroll-first?',
    ],
    objections: [
      {
        objection: 'We already pay for ADP — the ATS is included',
        rebuttal:
          'The ATS being \'free\' is the most expensive thing about it. Calculate recruiter hours lost to manual screening, candidates lost to poor mobile experience, and hires delayed by lack of automation. That\'s the real cost.',
      },
      {
        objection: 'Switching ATS means switching HRIS',
        rebuttal:
          'Not at all. Teamtailor integrates with ADP\'s HRIS via API. You keep ADP for payroll and HR — you just liberate your recruiting from a tool that was never built for it.',
      },
    ],
    nameDrop:
      'Multiple organizations have moved their recruiting from ADP\'s bundled module to Teamtailor while keeping ADP for HRIS — including manufacturing and professional services companies.',
  },

  dayforce: {
    displacementAngle:
      'Dayforce is enterprise legacy — \'archaic and crap\' in the words of one prospect. It can\'t distinguish retail vs. head office workflows, forces one template for all roles, and has no automation triggers.',
    discoveryQuestions: [
      'Does Dayforce let you create different application workflows for retail vs. head office roles — or is it one-size-fits-all?',
      'How many clicks does it take a candidate to complete an application through Dayforce today?',
      'When a candidate applies in-store, how do you capture that digitally — or are you still taking paper CVs?',
    ],
    objections: [
      {
        objection: 'We\'ve invested heavily in the Ceridian ecosystem',
        rebuttal:
          'We\'re not asking you to rip out Dayforce for HCM. Teamtailor sits as the recruiting front-end — the candidate-facing layer that Dayforce was never designed to be. Your data flows back to Dayforce via integration.',
      },
      {
        objection: 'Dayforce has AI features now too',
        rebuttal:
          'Ask yourself: did Dayforce build AI for recruiting, or did they bolt it onto a payroll platform? We\'ve screened 60 million candidates through our AI — it\'s native, not an add-on.',
      },
    ],
    nameDrop:
      'JD Sports Group — one of Europe\'s largest sports fashion retailers — evaluated Teamtailor specifically to replace Dayforce for recruiting across their multi-brand portfolio.',
  },

  eplay: {
    displacementAngle:
      'ePloy is a UK legacy ATS with no AI, limited reporting, and manual-heavy processes. Process audits have revealed 28-stage manual intervention workflows in ePloy customers.',
    discoveryQuestions: [
      'If I mapped out every manual step your recruiters take from application to offer — how many stages would that be?',
      'Does ePloy give you AI-powered candidate screening, or is every CV still reviewed one-by-one?',
      'When leadership asks for a group-level TA report, how long does it take to pull that together from ePloy?',
    ],
    objections: [
      {
        objection: 'ePloy works fine for us',
        rebuttal:
          '\'Works fine\' and \'drives competitive advantage\' are very different. With 900 applications per role, can ePloy surface your top 10% instantly? Can it auto-schedule interviews across 3 panellists? Can it reduce your time-to-hire by 58% like we did for Motorpoint?',
      },
      {
        objection: 'We\'re worried about migration complexity',
        rebuttal:
          'We migrated Hôtel de Vin/Malmaison off ePloy — including replacing a 28-stage manual process. Average enterprise implementation is 63 days. We\'ve done this before.',
      },
    ],
    nameDrop:
      'Hôtel de Vin/Malmaison moved from ePloy to Teamtailor, replacing a 28-stage manual intervention process with automated triggers.',
  },

  kalidus: {
    displacementAngle:
      'Kalidus is an LMS company that built a basic ATS as an afterthought. They haven\'t invested in recruiting technology — no AI, no automation, clunky reporting. Prospects say it\'s \'done them well\' but they\'ve outgrown it.',
    discoveryQuestions: [
      'When was the last time Kalidus shipped a major ATS feature update — not LMS, specifically ATS?',
      'If you could wave a magic wand, what would you want your ATS to do that Kalidus simply can\'t?',
      'How are you currently shortlisting candidates — is there any AI screening, or is it all manual review?',
    ],
    objections: [
      {
        objection: 'We have a contract with Kalidus until next year',
        rebuttal:
          'Perfect — that gives us time to plan properly. The best implementations happen when there\'s no rush. Let\'s map your requirements now, do a trial, and be ready to go live the day your contract ends.',
      },
      {
        objection: 'Kalidus does ATS and LMS in one platform',
        rebuttal:
          'That\'s exactly the problem — they do both, but recruiting is clearly not their focus. When did they last innovate on the ATS side? Meanwhile, we have 13,000 customers, 60 million AI-screened candidates, and 8-week development sprint cycles shipping new recruiting features constantly.',
      },
    ],
    nameDrop:
      'Shore Trust — a financial services organization — evaluated Teamtailor to replace Kalidus Recruit after recognizing the platform had stopped investing in recruiting capabilities.',
  },

  paylocity: {
    displacementAngle:
      'Paylocity\'s biggest failure isn\'t functionality — it\'s communication and partnership. Prospects say \'the functionality might be there, we just don\'t know it.\' No proactive support, no roadmap visibility, no partnership model.',
    discoveryQuestions: [
      'When was the last time Paylocity proactively reached out to show you new features or best practices?',
      'If Paylocity has the functionality you need, why are we having this conversation? What\'s actually broken?',
      'What does your ideal vendor partnership look like — and how does Paylocity measure up today?',
    ],
    objections: [
      {
        objection: 'Paylocity has an ATS module — maybe we just need better training',
        rebuttal:
          'If after years on the platform you still don\'t know what it can do, that IS the problem. A great tool that no one understands is worse than no tool at all. Partnership means someone ensuring you get full value — not leaving you to figure it out alone.',
      },
      {
        objection: 'We\'d have to manage two vendor relationships',
        rebuttal:
          'You already manage multiple vendors — job boards, assessments, background checks. The question is: do you want a recruiting partner who treats you like a priority, or a payroll vendor who treats recruiting as an add-on?',
      },
    ],
    nameDrop:
      'Krispy Krunchy Chicken evaluated Teamtailor specifically because Paylocity\'s communication and support left them feeling abandoned — \'just to know we\'re partners is probably number one on the list.\'',
  },

  paycom: {
    displacementAngle:
      'Paycom is double the cost of a standard HRIS, and its ATS is extremely basic. It gets the job done for employee self-service payroll, but it adds up quickly and fails at sourcing and talent communities.',
    discoveryQuestions: [
      'Your HR team went back to Paycom because of payroll simplicity, but what is the exact monthly cost you\'re paying for their ATS module?',
      'How are you currently managing candidate pipeline communication — does Paycom have automated stage triggers?',
      'Does Paycom help you build a visual, branded careers page, or is it just a basic, text-only job list?',
    ],
    objections: [
      {
        objection: 'Our HR team went back to Paycom because of payroll simplicity and the employee portal.',
        rebuttal:
          'We understand that payroll simplicity is key, but you\'re paying a massive premium (twice the standard cost) for a system whose recruiting module is a basic afterthought. Layering Teamtailor on top of Paycom via API keeps payroll simple while giving recruiters a world-class candidate pipeline.',
      },
      {
        objection: 'We want all employee records in one place.',
        rebuttal:
          'You keep all active employee records in Paycom. Teamtailor simply manages the candidate journey from first impression to the offer letter. Once hired, candidate profiles are exported directly to Paycom for payroll onboarding.',
      },
    ],
    nameDrop:
      'Eagle Mountain Casino evaluated Teamtailor to escape Paycom\'s high cost and basic recruiting functionality, recognizing that simplicity for payroll shouldn\'t compromise candidate experience.',
  },

  paycor: {
    displacementAngle:
      'Paycor is a generic HRIS with a limited, clunky candidate experience. It lacks the modern triggers, automated scheduling, and CRM talent pools that recruiters need to remain competitive.',
    discoveryQuestions: [
      'When a candidate applies in Paycor, how many clicks does it take them to complete the application, and what is your current mobile drop-off rate?',
      'Does Paycor allow hiring managers to easily review candidates and leave feedback via a mobile-optimized panel, or do they find the portal clunky?',
      'How are you handling automated candidate rejections — does Paycor help you template and automate this, or are you sitting on candidate pools manually?',
    ],
    objections: [
      {
        objection: 'Paycor works fine for our HR compliance.',
        rebuttal:
          'HR compliance is important, but a compliant ATS that candidates ghost is a failed system. Teamtailor is fully GDPR/SOC2 compliant and offers a candidate-centric UX that doubles apply rates.',
      },
      {
        objection: 'It\'s easier to keep the recruiting module in Paycor.',
        rebuttal:
          'Recruiters and hiring managers spend hours working around Paycor\'s clunky interface. The time wasted on manual scheduling, spreadsheets on the side, and chasing feedback offsets any single-sign-on convenience.',
      },
    ],
    nameDrop:
      'El Cortez Casino & Hotel moved their recruiting workflow off Paycor to Teamtailor to modernise their hiring manager engagement and streamline their high-volume candidate pipelines.',
  },

  hirebridge: {
    displacementAngle:
      'HireBridge is a dead platform — 1987 interface, 3-5 minute load times, 5 months no support response. This is a rescue mission.',
    discoveryQuestions: [
      'When was the last time HireBridge shipped a feature update that changed how your team recruits?',
      'If a top candidate applied on their phone right now, what would their experience look like on HireBridge?',
      'How long have you been waiting for a response from HireBridge support on your last request?',
    ],
    objections: [
      {
        objection: 'We\'ve been on HireBridge for years — switching feels risky.',
        rebuttal:
          'If HireBridge hasn\'t responded to your support request in 5 months, who is taking the bigger risk? Every day on a system with 3-5 minute load times is a day your best candidates bounce. We migrate companies off legacy ATS platforms every week — average go-live is 2-3 weeks.',
      },
      {
        objection: 'Our data is trapped in HireBridge.',
        rebuttal:
          'Data migration is our specialty. We\'ve built automated tooling for legacy ATS extraction. Your active candidates, job history, and pipeline data come over cleanly. The question isn\'t whether migration is hard — it\'s whether staying on a dead platform is harder.',
      },
    ],
    nameDrop:
      'Outform moved from HireBridge to Teamtailor after 5 months without a single support response — their career site went from "looking like 1987" to a branded, mobile-first experience in under 3 weeks.',
  },

  edjoin: {
    displacementAngle:
      'EdJoin is a state-mandated job board, not an ATS. Position Teamtailor as the recruiting engine that sits on top.',
    discoveryQuestions: [
      'How many of your last 900 applicants on EdJoin were actually qualified for the role?',
      'What does your district\'s careers page look like compared to a tech company competing for the same math teacher?',
      'How many hours per week does your HR team spend manually reviewing EdJoin applications with zero filtering tools?',
    ],
    objections: [
      {
        objection: 'EdJoin is free — we can\'t justify paying for an ATS.',
        rebuttal:
          'EdJoin is free to use, but what does it cost you in recruiter time? If your team is manually reviewing 900+ applications with zero filtering, that\'s dozens of hours per hire. Teamtailor\'s AI screens every applicant instantly — the ROI pays for itself in the first month.',
      },
      {
        objection: 'We\'re required to post on EdJoin by state mandate.',
        rebuttal:
          'Keep posting on EdJoin. Teamtailor sits on top as your recruiting command center — AI screening, branded career site, automation, and pipeline management. EdJoin feeds candidates in; Teamtailor helps you find the best ones.',
      },
    ],
    nameDrop:
      'San Jacinto USD evaluated Teamtailor to sit on top of EdJoin — giving their HR team AI-powered screening to handle 900+ applications per role that EdJoin simply dumps into their inbox.',
  },

  loxo: {
    displacementAngle:
      'Loxo is a sourcing tool for agencies — for in-house teams, it\'s a square peg in a round hole.',
    discoveryQuestions: [
      'What does a candidate experience when they visit your careers page today?',
      'How do you screen and rank the 200+ inbound applicants you get per role?',
      'Is your team primarily sourcing outbound, or do you also need to manage inbound applications and employer brand?',
    ],
    objections: [
      {
        objection: 'Loxo\'s auto-stage-move on email reply is useful.',
        rebuttal:
          'Great efficiency feature for outbound sequences. Teamtailor\'s trigger system does the same — and extends far beyond email. Auto-move candidates based on screening scores, interview feedback, assessment completion, or time-in-stage. Full pipeline automation, not just outbound email.',
      },
      {
        objection: 'We use Loxo for executive search — we need sourcing power.',
        rebuttal:
          'If your primary use case is outbound exec search, Loxo may fit. But if you also hire non-exec roles, need a branded career site, or want a talent pipeline, you need both tools. Teamtailor gives you sourcing plus everything else in one platform.',
      },
    ],
    nameDrop:
      'Taurean evaluated Teamtailor to replace Loxo after realizing the platform lacked experience-level filtering, interview transcription, and career site capabilities their growing in-house team needed.',
  },

  breezyhr: {
    displacementAngle:
      'Breezy HR users are ready to graduate — broken keyword search, no AI, basic career pages. They\'ve hit the ceiling.',
    discoveryQuestions: [
      'Try searching for a specific skill in your Breezy candidate database — how accurate are the results?',
      'What happens to great candidates who weren\'t selected for a role — can you re-engage them for the next opening?',
      'When you post a new role, does your career page look like a competitive employer or a basic job listing?',
    ],
    objections: [
      {
        objection: 'Breezy is much cheaper than Teamtailor.',
        rebuttal:
          'Breezy\'s price looks attractive, but what\'s the cost of a broken search function? If recruiters can\'t find qualified candidates in their own database, you\'re paying twice. Teamtailor\'s AI, Career Site Builder, and unlimited users deliver 10x the value.',
      },
      {
        objection: 'Breezy does everything we need.',
        rebuttal:
          'That may be true today. But as volume grows, can broken keyword search keep up? Can it build a branded career site? Can it nurture passive candidates? These capabilities separate companies that hire well from those that struggle.',
      },
    ],
    nameDrop:
      'GACC Midwest switched from Breezy HR to Teamtailor after discovering that Breezy\'s keyword search couldn\'t even find "UKG Ready" in uploaded resumes — a fundamental search failure that was costing them qualified candidates.',
  },

  bullhorn: {
    displacementAngle:
      'Bullhorn is a staffing agency CRM, not an in-house recruiting platform. If they\'re building a corporate TA function, Bullhorn can\'t deliver.',
    discoveryQuestions: [
      'When a candidate visits your careers page, what experience do they get before they even apply?',
      'How do your hiring managers interact with candidates in Bullhorn today?',
      'Is your primary use case staffing/agency placement, or are you building an in-house recruiting function?',
    ],
    objections: [
      {
        objection: 'We\'re already on Bullhorn and our team knows it.',
        rebuttal:
          'Bullhorn is excellent for staffing operations. But for in-house recruiting, you need career site, employer branding, AI screening, and candidate experience. Teamtailor integrates with your stack and gives your TA team tools Bullhorn was never designed to provide.',
      },
      {
        objection: 'Bullhorn has a large integration marketplace.',
        rebuttal:
          'Bullhorn\'s integrations are for staffing — VMS, client billing, temp tracking. For corporate TA, Teamtailor has 450+ integrations including LinkedIn RSC, HRIS, assessments, and background checks. Everything a corporate TA team needs.',
      },
    ],
    nameDrop:
      'A national professional services firm switched their in-house recruiting from Bullhorn to Teamtailor, recognizing that Bullhorn\'s agency-first CRM couldn\'t deliver the employer branding and candidate experience their corporate TA team needed.',
  },

  rippling: {
    displacementAngle:
      'Rippling\'s ATS is a side dish to their HRIS entrée — position Teamtailor as the purpose-built recruiting engine that integrates with Rippling.',
    discoveryQuestions: [
      'What does your Rippling career site look like when a top candidate finds you on Google?',
      'How is Rippling using AI to help you screen and rank the candidates you receive?',
      'If you could separate your HRIS needs from your recruiting needs, would you choose the same tool for both?',
    ],
    objections: [
      {
        objection: 'We\'re already on Rippling for HRIS — easier to keep recruiting there.',
        rebuttal:
          'Rippling is excellent for HRIS and payroll. But their ATS is a module, not a mission. Teamtailor integrates via API — employee data stays in sync. Keep Rippling for HR admin, add a world-class recruiting front-end. And save 70% on ATS costs.',
      },
      {
        objection: 'Rippling\'s headcount planning is valuable to us.',
        rebuttal:
          'Headcount Planning is genuinely Rippling\'s strongest differentiator. But planning tells you who to hire. Teamtailor tells you how. Keep Rippling for planning, add Teamtailor for the recruiting engine that fills those plans with quality talent.',
      },
    ],
    nameDrop:
      'A fast-growing SaaS company kept Rippling for HRIS and layered Teamtailor on top for recruiting — their cost per hire dropped 35% and time-to-fill went from 42 days to 19 days within the first quarter.',
  },

  jobvite: {
    displacementAngle:
      'Jobvite is enterprise complexity from the Employ Inc. portfolio — same parent as Lever. Challenge them on innovation velocity and simplicity.',
    discoveryQuestions: [
      'How long did your Jobvite implementation take from contract to first hire?',
      'What\'s your annual Jobvite cost, and how much has it increased at each renewal?',
      'How many of Jobvite\'s 300+ integrations is your team actually using — and which ones drive real outcomes?',
    ],
    objections: [
      {
        objection: 'Jobvite has a stronger CRM and social recruiting suite.',
        rebuttal:
          'Jobvite\'s CRM is strong for enterprise social recruiting. But does your team need that complexity? Teamtailor\'s CRM with Connect and Nurture Campaigns covers 90% of what Jobvite offers in a package your whole team uses from day one.',
      },
      {
        objection: 'Jobvite just launched an AI Companion.',
        rebuttal:
          'They did — promising. But Teamtailor has shipped AI for years, not months. Our Co-pilot has screened 60M+ candidates. Do you want to be an early adopter of a new AI product, or deploy proven AI already delivering results for 13,000 customers?',
      },
    ],
    nameDrop:
      'A mid-market technology company replaced Jobvite with Teamtailor — cutting their implementation time from 8 weeks to 3 weeks and saving 40% annually while gaining AI screening capabilities Jobvite didn\'t offer.',
  },

  isolved: {
    displacementAngle:
      'isolved is an HCM platform that bolted on an ATS — the same pattern as BambooHR and Paylocity. Recruiting is not their focus.',
    discoveryQuestions: [
      'What does your isolved career page look like compared to companies you\'re competing for talent with?',
      'How much of isolved\'s AI is specifically built for recruiting vs. general HR automation?',
      'When you need a recruiting-specific feature, how quickly does isolved ship it vs. their payroll and HCM updates?',
    ],
    objections: [
      {
        objection: 'We want everything in one platform — isolved gives us HCM + ATS.',
        rebuttal:
          'Fair goal. But isolved\'s ATS is an add-on to payroll — not where they innovate. Teamtailor integrates via API, payroll stays in sync. Keep isolved for HCM, add a purpose-built recruiting engine with AI, career site, and CRM.',
      },
      {
        objection: 'isolved has AI features now too.',
        rebuttal:
          'isolved is investing in AI — great. But their AI is growing, not mature. Teamtailor has screened 60M+ candidates. Our Co-pilot is across the entire recruiting workflow, not just screening.',
      },
    ],
    nameDrop:
      'A healthcare services company with 400 employees replaced isolved\'s recruiting module with Teamtailor — their career site conversion rate tripled and time-to-fill dropped by 40% in the first six months.',
  },
};

