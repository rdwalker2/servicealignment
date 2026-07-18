export interface WikiFeature {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  status: 'verified' | 'needs-review' | 'unverified';
  whatItDoes?: string;
  howItWorks?: string;
  whatNotToSay?: string;
  doNotSay?: string[]; // CS wiki format
  supportDoc?: string;
  supportDocUrl?: string;
  apiEndpoint?: string;
  apiNotes?: string;
  tags?: string[];
  lastVerified?: string;
  verifiedBy?: string;
  implementationNotes?: string;
  prospectQA?: { q: string; a: string }[];
  plans?: string[];
  addOn?: boolean;
  searchAliases?: string[];
}

export const productWikiData: WikiFeature[] = [
  {
    "id": "triggers",
    "category": "automation",
    "title": "Triggers",
    "subtitle": "Stage-entry actions for pipeline automation",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "support-docs",
    "whatItDoes": "Triggers fire automated actions when a candidate enters a specific pipeline stage. They enable recruiters to build hands-free workflows that execute consistently for every candidate who reaches a given step.",
    "howItWorks": "Open a job's pipeline view. Click on a stage and select 'Add trigger.' Choose an action type (e.g., Send Message, Smart Schedule, Move candidate). Configure the action details and save. The trigger fires automatically each time a candidate enters that stage.",
    "doNotSay": [
      "Don't say triggers can create to-dos directly. Use Send Message for notifications instead."
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/1475768-triggers",
    "apiEndpoint": "/v1/triggers",
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "automation",
      "triggers",
      "pipeline"
    ],
    "implementationNotes": "Trigger actions: Send Email, Send SMS, Add Note, Add Tag, Smart Move, Smart Schedule. Sourced candidates can be included/excluded via toggle. Pending triggers visible on candidate card with manual cancel option. Cannot create to-dos directly — use Send Message workaround. Not configurable via API — UI only.",
    "apiNotes": "NOT available via API. Triggers can only be configured through the UI. No endpoints exist for creating, reading, or managing triggers programmatically."
  },
  {
    "id": "delayed-triggers",
    "category": "automation",
    "title": "Delayed Triggers",
    "subtitle": "Time-based automation on pipeline stages",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "Delayed triggers add a time-based wait before a trigger action fires. Recruiters can set delays in minutes, hours, or days so that actions like follow-up emails or status changes happen on a schedule rather than instantly.",
    "howItWorks": "When adding or editing a trigger on a pipeline stage, enable the delay option. Choose the delay unit (minutes, hours, or days) and specify the amount. Optionally toggle weekend exclusion so delays skip Saturdays and Sundays. Save the trigger — it will wait the configured duration after a candidate enters the stage before firing.",
    "doNotSay": [
      "Don't say triggers can create to-dos (use Send Message instead).",
      "Don't say a 3-day delay on Friday fires Wednesday (behavior not explicit — just say weekends are skipped).",
      "Do NOT say delayed triggers survive stage changes — moving a candidate cancels pending triggers",
      "Do NOT claim triggers work retroactively — they fire when a candidate enters a stage",
      "Do NOT promise multi-step workflow chains — each trigger is a single action on a single stage"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/1475768-triggers",
    "apiEndpoint": "/v1/triggers",
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "automation",
      "triggers",
      "delays",
      "scheduling"
    ],
    "implementationNotes": "Set up on any stage: hover → ⋮ → Triggers. Add delay via 'Additional options' (minutes, hours, days). Visible on candidate card. Can cancel or force-run. IMPORTANT: If candidate moves to different stage before trigger fires, it's automatically canceled. Smart Move triggers can auto-advance based on question answers, offer status, resume keywords, or tags.",
    "prospectQA": [
      {
        "q": "Can we automate follow-up emails after a delay?",
        "a": "Yes — 'Send message' trigger with a delay (minutes/hours/days). Auto-sends when time elapses."
      },
      {
        "q": "What if we move the candidate before it fires?",
        "a": "The pending trigger auto-cancels, preventing outdated actions."
      }
    ],
    "searchAliases": [
      "automation",
      "workflow automation",
      "delayed email",
      "scheduled messages",
      "smart move"
    ]
  },
  {
    "id": "smart-move",
    "category": "automation",
    "title": "Smart Move",
    "subtitle": "Auto-advance candidates based on criteria",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "Smart Move automatically advances or moves candidates between pipeline stages when they match defined criteria. It removes manual sorting by evaluating candidate data and routing them through the pipeline based on rules the recruiter sets.",
    "howItWorks": "Add a Smart Move trigger to a pipeline stage. Define the matching criteria from the available options: question answers, resume keywords, location, referral status, tags, or questionnaire completion. When a candidate enters the stage and matches the criteria, they are automatically moved to the designated next stage.",
    "doNotSay": [],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/1475768-triggers",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "automation",
      "triggers",
      "screening",
      "pipeline"
    ]
  },
  {
    "id": "auto-cancel",
    "category": "automation",
    "title": "Auto-Cancel Triggers",
    "subtitle": "Triggers cancel when candidates move stages",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "Delayed triggers automatically cancel their pending action if the candidate moves to a different stage before the delay period expires. This prevents outdated or irrelevant actions from firing after a candidate's status has changed.",
    "howItWorks": "This behavior is built in and requires no configuration. When a delayed trigger is active and the candidate is moved (manually or via another trigger) out of the stage before the delay elapses, the pending action is cancelled automatically.",
    "doNotSay": [],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/1475768-triggers",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "automation",
      "triggers"
    ]
  },
  {
    "id": "weekend-exclusion",
    "category": "automation",
    "title": "Weekend Exclusion",
    "subtitle": "Skip weekends in delayed trigger countdowns",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "Weekend exclusion is a toggle on delayed triggers that skips Saturdays and Sundays when counting delay days. This ensures automated actions like follow-up emails only fire on business days.",
    "howItWorks": "When configuring a delayed trigger with a day-based delay, toggle on the 'Exclude weekends' option. The countdown will then skip Saturday and Sunday, only counting business days toward the delay total.",
    "doNotSay": [
      "Don't specify exact day calculations (e.g., Friday+3=Wednesday). Just say weekends are skipped.",
      "Do NOT say you can exclude custom holidays — only weekends (Sat/Sun) are excluded",
      "Do NOT claim custom business hours — weekend exclusion pushes to Monday, no hour control"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/1475768-triggers",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "automation",
      "triggers",
      "scheduling"
    ],
    "implementationNotes": "In trigger setup, under 'Additional options' select 'Don't run on weekends'. If trigger falls on Saturday/Sunday, it's held until Monday. Applies to any delayed trigger. No separate activation needed — it's a config option within trigger setup.",
    "prospectQA": [
      {
        "q": "Can we prevent auto-emails on weekends?",
        "a": "Yes — enable weekend exclusion in trigger options. Triggers held until Monday if they'd fire on Sat/Sun."
      }
    ],
    "searchAliases": [
      "business hours",
      "no weekend emails",
      "working days only",
      "business days"
    ]
  },
  {
    "id": "trigger-send-message",
    "category": "automation",
    "title": "Send Message Trigger",
    "subtitle": "Automated email and SMS via triggers",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "The Send Message trigger action automatically sends a message to a candidate when they enter a pipeline stage. It supports both email and SMS channels, enabling multi-channel automated communication.",
    "howItWorks": "Add a trigger to a pipeline stage and select 'Send Message' as the action. Choose the channel (email or SMS). Select or compose a message template. Save the trigger. When a candidate enters the stage, the message is sent automatically via the selected channel.",
    "doNotSay": [],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/1475768-triggers",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "automation",
      "triggers",
      "communication",
      "email",
      "sms"
    ]
  },
  {
    "id": "trigger-smart-schedule",
    "category": "automation",
    "title": "Smart Schedule Trigger",
    "subtitle": "Auto-send scheduling links via triggers",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "Smart Schedule can be sent automatically as a trigger action. When a candidate enters a pipeline stage, they receive a self-booking link to schedule an interview from real-time calendar availability.",
    "howItWorks": "Add a trigger to a pipeline stage and select 'Smart Schedule' as the action. Configure the scheduling settings (interviewers, duration, etc.). Save the trigger. Candidates entering the stage automatically receive a scheduling link.",
    "doNotSay": [],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/1475768-triggers",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "automation",
      "triggers",
      "scheduling"
    ]
  },
  {
    "id": "copilot-screening",
    "category": "screening-ai",
    "title": "Co-pilot Screening",
    "subtitle": "AI-powered candidate evaluation against your criteria",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "support-docs",
    "whatItDoes": "Co-pilot Screening lets recruiters define screening criteria in plain English, and the AI evaluates each candidate automatically. It generates a resume summary and evaluates candidates against the defined criteria with match indicators, helping recruiters quickly identify strong fits.",
    "howItWorks": "In a job's settings, navigate to the Co-pilot Screening section. Write your screening criteria in natural language (e.g., '3+ years Python experience, familiarity with AWS'). Co-pilot will automatically evaluate incoming candidates against these criteria, generating a resume summary and match indicators on each candidate's profile card. Co-pilot uses OpenAI (GPT-4.1 and GPT-5 models). Individual features can be toggled on/off in Settings → Co-pilot. All summaries are generated in the company's default language regardless of source language.",
    "doNotSay": [
      "Don't say Copilot surfaces license status 'at the top of the card' as a dedicated field. It generates a resume summary and evaluates against criteria with match indicators."
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/10209597-co-pilot-candidate-screening",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "ai",
      "screening",
      "copilot"
    ],
    "implementationNotes": "Uses OpenAI GPT-4.1/GPT-5. Free add-on. Individual features toggled at Settings → Co-pilot. All outputs in company default language. 👍/👎 feedback UI on every output. EU AI Act readiness work in progress (May 2026). Copilot Bias Evaluation Framework exists.",
    "prospectQA": [
      {
        "q": "Does your AI work with Zoom/Teams?",
        "a": "No — Co-pilot's video meeting features require TT's own video meeting tool. Recording/transcription won't work with external meeting apps."
      },
      {
        "q": "Can I control which AI features my team sees?",
        "a": "Yes — granular per-feature toggles at Settings → Co-pilot."
      },
      {
        "q": "Is it an additional cost?",
        "a": "No, Co-pilot is completely FREE."
      },
      {
        "q": "How do you handle AI bias?",
        "a": "We have a Copilot Bias Evaluation Framework and EU AI Act readiness assessment."
      }
    ],
    "apiNotes": "No dedicated Co-pilot API endpoints. AI features are internal to the platform and not accessible via the public API."
  },
  {
    "id": "ask-copilot",
    "category": "screening-ai",
    "title": "Ask Co-pilot",
    "subtitle": "Natural language questions about candidates",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "Ask Co-pilot allows recruiters to ask natural language questions about individual candidates. The AI analyzes the candidate's profile, resume, and application data to provide relevant answers, saving time on manual profile review.",
    "howItWorks": "Open a candidate's profile card and locate the Ask Co-pilot feature. Type a question in natural language (e.g., 'Does this candidate have management experience?' or 'What programming languages do they know?'). Co-pilot analyzes the candidate's data and returns an answer.",
    "doNotSay": [],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/10209597-co-pilot-candidate-screening",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "ai",
      "copilot",
      "candidates"
    ]
  },
  {
    "id": "copilot-resume-summary",
    "category": "screening-ai",
    "title": "Co-pilot Resume Summary",
    "subtitle": "PII-anonymized 5-point resume overview",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "support-docs",
    "whatItDoes": "Co-pilot Resume Summary generates a concise, PII-anonymized five-point summary of a candidate's resume. Information is always anonymized (no name, gender). Generated in company default language regardless of source. Old resumes get a manual 'generate summary' button. Summaries are editable by recruiters.",
    "howItWorks": "The resume summary is generated automatically when a candidate applies or when their resume is parsed. View it on the candidate's profile card. The five-point summary covers key qualifications, experience highlights, and relevant skills — all with personal identifying information removed.",
    "doNotSay": [
      "Do NOT claim AI makes hiring decisions — it assists, humans override",
      "Do NOT say summaries include all candidate details — personal info deliberately excluded for bias reduction",
      "Do NOT promise 100% accuracy — evaluations are assistive, not authoritative"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/10209597-co-pilot-candidate-screening",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "ai",
      "copilot",
      "resume",
      "screening"
    ],
    "implementationNotes": "Activate Co-pilot in Add-on feature center. Toggle individual features at Settings → Recruitment → Co-pilot. Auto-generates 5-point bulleted summary EXCLUDING personal details (name, email, gender) for bias reduction. Candidate screening: set criteria per job (manual or AI-suggested). 'Ask Co-pilot' chat lets you query resume and interview data conversationally. Powered by OpenAI GPT models.",
    "prospectQA": [
      {
        "q": "Will it summarize our existing candidate database?",
        "a": "Existing resumes require a manual click to generate. Only new uploads auto-summarize."
      },
      {
        "q": "How does AI resume summary work?",
        "a": "Auto-generates 5-point bulleted summary excluding personal info (name, email, gender) for bias-free screening."
      },
      {
        "q": "Can we set custom screening criteria?",
        "a": "Yes — define manually or let Co-pilot suggest based on job description. Each candidate evaluated with reasoning shown, and you can override."
      }
    ],
    "searchAliases": [
      "AI screening",
      "resume parsing",
      "automated screening",
      "AI candidate evaluation",
      "co-pilot"
    ]
  },
  {
    "id": "copilot-meeting-insights",
    "category": "screening-ai",
    "title": "Co-pilot Meeting Insights",
    "subtitle": "Interview recording, transcription, and analysis",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "support-docs-audit",
    "whatItDoes": "AI-generated meeting summaries, action items, and searchable transcripts from recorded interviews. Works with TT's built-in video meetings AND external services (Microsoft Teams, Google Meet, Zoom) via a recording bot that joins the call.",
    "howItWorks": "When 'Meeting Insights' Co-pilot feature is activated AND your calendar is connected, TT can record meetings. For external services (Teams, Meet, Zoom), a recording bot joins the call automatically. Generates: full transcript, summary, key topics, action items, candidate sentiment analysis.",
    "doNotSay": [
      "Don't forget: Recordable Meetings add-on must be enabled first."
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/10756850-co-pilot-meeting-insights",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "ai",
      "copilot",
      "interviews",
      "meetings"
    ],
    "implementationNotes": "REQUIRES both Recordable Meetings add-on (free) AND TT's own video meeting tool. Candidates must join via TT 'Join' button — not external links. Consent prompt shown to candidate before recording. Recording + transcript available ~10 min after meeting.",
    "prospectQA": [
      {
        "q": "Does the candidate know they're being recorded?",
        "a": "Yes — a consent prompt appears before recording starts."
      },
      {
        "q": "Does recording work with Zoom/Teams/Meet?",
        "a": "Yes! A recording bot joins your Teams, Meet, or Zoom call automatically when Meeting Insights is activated and your calendar is connected."
      }
    ]
  },
  {
    "id": "copilot-reports",
    "category": "screening-ai",
    "title": "Co-pilot Reports",
    "subtitle": "Natural language report generation",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "Co-pilot Reports lets users build recruitment reports by describing what they want in plain English. The AI generates charts, tables, and data visualizations from Teamtailor's analytics data. This feature is live and shipped as of May 2026.",
    "howItWorks": "Navigate to the Reports section. Use the Co-pilot report builder to describe the report you want in natural language (e.g., 'Show me hires per department over the last quarter'). Co-pilot generates the appropriate chart or data visualization. Reports can be saved and shared.",
    "doNotSay": [
      "Don't call this a roadmap item — it's live and shipped as of May 2026.",
      "Do NOT say Co-pilot replaces the analytics module — it assists with report building on top of existing infrastructure",
      "Do NOT claim predictive analytics or forecasting — it explores existing data"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/10209597-co-pilot-candidate-screening",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "ai",
      "copilot",
      "reports",
      "analytics"
    ],
    "implementationNotes": "Part of Co-pilot suite. Assists with 'Chart block builder' to explore and visualize recruitment data. Enhances existing analytics with AI-assisted report creation. Also assists with: job descriptions, application questions, interview kit questions, video meeting summaries.",
    "prospectQA": [
      {
        "q": "Can AI help us build reports?",
        "a": "Yes — Co-pilot assists with the Chart block builder to explore data and create hiring metric visualizations."
      }
    ],
    "searchAliases": [
      "AI reports",
      "chart builder",
      "hiring metrics",
      "AI analytics"
    ]
  },
  {
    "id": "screening-questions",
    "category": "screening-ai",
    "title": "Screening Questions",
    "subtitle": "8 question types embedded in the application flow",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "Screening questions let recruiters add structured questions directly into the job application form. Teamtailor supports 8 question types: Choice, Yes/No, Text, Number, Date, Range, File, and Video. Candidate responses are captured at the time of application and available for review and automation.",
    "howItWorks": "In a job's settings, go to the Questions section. Add questions by selecting from the 8 available types: Choice, Yes/No, Text, Number, Date, Range, File, or Video. Configure each question (required/optional, options for choice questions, etc.). Questions appear in the candidate's application form. Responses are stored on the candidate's profile and can be used as criteria in Smart Move triggers.",
    "doNotSay": [
      "Don't say questions can 'block' applications. Teamtailor doesn't have knockout questions — screening happens after submission via Smart Move.",
      "Don't claim screening questions use AI scoring — they are rule-based (knockout) only",
      "Don't promise video screening in questions — that is a separate Video Questions feature",
      "Do NOT say TT has traditional knockout auto-reject — Co-pilot screens and flags, rejection is manual/triggered",
      "Do NOT claim screening replaces assessment tools — it evaluates application responses, not psychometric tests",
      "Do NOT say screening works without Co-pilot — AI screening relies on Co-pilot"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "screening",
      "questions",
      "application"
    ],
    "apiNotes": "POST /v1/questions to create. Types: Choice, Textarea, Text. Choice questions include alternatives array. POST /v1/picked-questions to assign questions to jobs.",
    "implementationNotes": "Set screening criteria per job: Job Inbox stage → ⋮ → Screening criteria. Co-pilot evaluates candidate responses against criteria. Manage questions at Settings → Recruitment → Questions, add to job applications or interview kits. Supports conditional logic on Yes/No or Choice questions. Note: NOT traditional auto-reject knockout — system flags candidates for review. Co-pilot includes discrimination detection to flag biased questions. Best practice: only use knockout-style filters for absolute minimums (work authorization, licenses).",
    "prospectQA": [
      {
        "q": "Can we auto-reject based on answers?",
        "a": "Yes — knockout questions automatically disqualify candidates who give the wrong answer. You define the disqualifying answer."
      },
      {
        "q": "Can we customize questions per job?",
        "a": "Yes, each job can have unique questions. You can also save question templates to reuse across jobs."
      },
      {
        "q": "What question types are supported?",
        "a": "Text, multiple choice, yes/no, dropdown, file upload, and GDPR consent."
      },
      {
        "q": "Does TT support knockout screening questions?",
        "a": "Co-pilot evaluates responses against your criteria and flags non-qualifying candidates. Conditional logic supported. Rejection is via manual action or Triggers, not instant auto-reject."
      },
      {
        "q": "Does it help prevent discriminatory questions?",
        "a": "Yes — Co-pilot includes discrimination detection that flags potentially biased questions before publishing."
      }
    ],
    "searchAliases": [
      "knockout questions",
      "application form",
      "pre-screening",
      "qualifying questions",
      "application questions",
      "screening criteria",
      "disqualification",
      "candidate filtering",
      "conditional questions"
    ]
  },
  {
    "id": "sms",
    "category": "communication",
    "title": "SMS",
    "subtitle": "Native two-way SMS messaging via Twilio",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "notion-export + support-docs",
    "whatItDoes": "Teamtailor's native SMS add-on enables two-way text messaging with candidates directly from the platform. The SMS feature toggle is FREE to activate by any company admin. However, sending messages requires purchasing SMS credit bundles ($100 for 1,000 msgs, $200 for 2,500 msgs, $600 for 10,000 msgs). SMS can also be sent automatically via triggers.",
    "howItWorks": "Enable the SMS add-on in your Teamtailor account settings. Purchase SMS credits (usage-based billing). Send messages from a candidate's profile or set up Send Message triggers with SMS as the channel. Candidates can reply, and their responses appear in the candidate's message thread.",
    "doNotSay": [
      "Don't say SMS is entirely free — the feature activation is free but message credits cost money ($100-$600 depending on volume)."
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/1735329-text-your-candidates-via-sms",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "communication",
      "sms",
      "messaging",
      "twilio"
    ],
    "implementationNotes": "Credit tiers: 1,000 msgs/$100 | 2,500 msgs/$200 (10% discount) | 10,000 msgs/$600 (25% discount). Low-credit and renewal notifications built in. Two-way messaging. Auto-send via Triggers supported.",
    "prospectQA": [
      {
        "q": "How much does SMS cost?",
        "a": "The feature activation is free. Messages are credit-based: $100 for 1,000 msgs, $200 for 2,500, $600 for 10,000."
      },
      {
        "q": "Can candidates reply?",
        "a": "Yes — two-way messaging. Replies sync back to the candidate profile."
      }
    ],
    "apiNotes": "No dedicated SMS API endpoint. SMS is triggered through the platform UI or via Triggers automation. Credits are managed in the UI."
  },
  {
    "id": "email-templates",
    "category": "communication",
    "title": "Email Templates",
    "subtitle": "Reusable email templates for candidate communication",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "Email templates let recruiters create and reuse standardized email messages for candidate communication. Templates support merge fields for personalization and can be used in manual emails or automated triggers.",
    "howItWorks": "Navigate to Settings > Email Templates. Create a new template with subject line and body content. Use merge fields (e.g., candidate name, job title) for personalization. Templates are available when composing emails from a candidate's profile or when configuring Send Message triggers.",
    "doNotSay": [
      "Don't claim templates support conditional logic or branching — they are static templates with merge fields",
      "Do NOT say any user can create templates — Recruitment/Company Admins only",
      "Do NOT confuse message templates with job offer templates — separate sections",
      "Do NOT say Nurture Campaigns are part of email templates — Nurture is a separate tool"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "communication",
      "email",
      "templates"
    ],
    "implementationNotes": "Settings → Templates → Messages. Only Recruitment/Company Admins can access. Create templates with subject, body, images, GIFs, smart links, attachments. Placeholders: {first-name}, {full-name}, {job-title}. Separate template sections for Job Offers (Settings → Templates → Job offers) and Connect welcome emails. Personal email signatures configured at Your account → Email signature (basic HTML supported).",
    "prospectQA": [
      {
        "q": "Can we customize email templates?",
        "a": "Yes — fully customizable with merge fields, HTML formatting, and company branding. Both shared and personal templates supported."
      },
      {
        "q": "Do templates work with automation?",
        "a": "Yes — Triggers can auto-send any email template when a candidate reaches a specific stage."
      },
      {
        "q": "Can we create reusable email templates?",
        "a": "Yes — with subject lines, body, images, GIFs, attachments, and placeholders like {first-name} and {job-title}. Admins create at Settings → Templates → Messages."
      },
      {
        "q": "Can we personalize emails automatically?",
        "a": "Yes — placeholders like {first-name}, {full-name}, {job-title} auto-pull candidate and job data."
      }
    ],
    "searchAliases": [
      "email template",
      "message template",
      "canned response",
      "email automation",
      "message templates",
      "email drafts",
      "canned responses",
      "email placeholders",
      "recruitment emails",
      "bulk email"
    ]
  },
  {
    "id": "deferred-rejection",
    "category": "communication",
    "title": "Deferred Rejection",
    "subtitle": "Send rejection emails on a delay",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "Deferred rejection lets recruiters reject candidates immediately in the system while delaying the rejection email notification. This allows teams to make fast internal decisions without sending abrupt notifications, giving a more respectful candidate experience.",
    "howItWorks": "When rejecting a candidate, choose the option to defer the rejection email. Set the delay period (e.g., hours or days). The candidate is marked as rejected internally right away, but the rejection notification is sent after the delay period. This can be configured at the account or per-rejection level.",
    "doNotSay": [],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/119041-reject-a-candidate-s-job-application",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "communication",
      "email",
      "rejections"
    ]
  },
  {
    "id": "candidate-messaging",
    "category": "communication",
    "title": "Candidate Messaging",
    "subtitle": "In-app messaging with candidates",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "Candidate messaging provides a built-in communication channel for recruiters to exchange messages with candidates directly within Teamtailor. All messages are logged on the candidate's profile for a complete communication history.",
    "howItWorks": "Open a candidate's profile and navigate to the Messages tab. Compose and send messages directly. Candidates receive notifications and can reply. The full conversation thread is maintained on the candidate's profile for team visibility.",
    "doNotSay": [
      "Don't claim real-time chat with candidates — messages are asynchronous (email-based), not live chat",
      "Don't promise SMS/WhatsApp without confirming credits are purchased",
      "Do NOT say SMS and WhatsApp are included by default — they are add-ons",
      "Do NOT say Candidate Chat widget is auto-enabled — it needs setup",
      "Do NOT promise real-time live chat — response times depend on recruiter availability"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "communication",
      "messaging",
      "candidates"
    ],
    "implementationNotes": "Centralized Message Inbox at top right (next to notification bell). Two views: 'My messages' and 'Team messages'. Filter by All, Unread, Unanswered, Archived. Archiving moves to Archived tab; candidate replies auto-reappear. Quick actions: view card, invite to meetings, reassign, add team members. Aggregates Email, Candidate Chat (career site widget), SMS (add-on), and WhatsApp (add-on).",
    "prospectQA": [
      {
        "q": "Can we message candidates directly from the ATS?",
        "a": "Yes — built-in messaging with full thread history on each candidate card. Supports email, SMS, and WhatsApp."
      },
      {
        "q": "Are messages tracked?",
        "a": "Yes — every message (sent and received) is logged on the candidate profile with timestamps."
      },
      {
        "q": "Is there a unified inbox?",
        "a": "Yes — centralizes Email, Candidate Chat, and optionally SMS and WhatsApp into one inbox. Filter by My/Team messages, Unread, Unanswered."
      },
      {
        "q": "Can multiple people collaborate on conversations?",
        "a": "Yes — reassign conversations, add team members, and 'Team messages' view shows all conversations for your assigned jobs."
      }
    ],
    "searchAliases": [
      "inbox",
      "messaging",
      "candidate email",
      "communication",
      "chat",
      "message inbox",
      "candidate chat",
      "unified inbox",
      "recruiter messaging",
      "team inbox",
      "chat widget"
    ]
  },
  {
    "id": "whatsapp",
    "category": "communication",
    "title": "WhatsApp Integration",
    "subtitle": "WhatsApp messaging channel for candidates",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "support-docs-audit",
    "whatItDoes": "WhatsApp integration via Click-to-Chat links and third-party marketplace partners. NOT a native messaging channel like SMS. Click-to-Chat opens the desktop WhatsApp app but no messages sync back to Teamtailor.",
    "howItWorks": "Click-to-Chat: Opens a WhatsApp conversation with the candidate on your desktop — but messages do NOT sync to TT. For automated WhatsApp messaging, use the 'Sirius Growth WhatsApp' marketplace integration which provides templates and automation.",
    "doNotSay": [
      "Don't say WhatsApp works like SMS in Teamtailor — it does NOT. Messages don't sync back.",
      "Don't imply candidates can reply via WhatsApp and it shows up in TT — it doesn't.",
      "Don't position it as a built-in messaging channel. It's Click-to-Chat or third-party marketplace integration only.",
      "Do NOT say WhatsApp messages are tracked inside TT — they go through the user's personal WhatsApp app",
      "Do NOT say WhatsApp uses TT messaging credits — only SMS uses credits",
      "Do NOT say SMS is included — it has per-use costs",
      "Do NOT say SMS setup is instant — Twilio approval can delay"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/15644623-messaging-credits-for-sms-and-whatsapp",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "communication",
      "whatsapp",
      "messaging"
    ],
    "implementationNotes": "Company Admin activates SMS in Add-on feature center. Select a country to generate a phone number (Twilio approval may take time). Credits purchased via Stripe (Settings → Billing). Free credits provided on first activation. IMPORTANT: WhatsApp messaging opens the user's WhatsApp desktop app — messages are NOT stored in Teamtailor.",
    "prospectQA": [
      {
        "q": "Can we WhatsApp candidates from TT?",
        "a": "TT provides a quick-launch shortcut that opens WhatsApp desktop. Messages go through your WhatsApp app and aren't logged in TT."
      },
      {
        "q": "How does SMS pricing work?",
        "a": "Per-use credits purchased via Stripe. Small number of free credits on first activation. Manage in Settings → Billing."
      }
    ],
    "searchAliases": [
      "SMS",
      "text messaging",
      "WhatsApp",
      "Twilio",
      "messaging credits",
      "text candidates"
    ]
  },
  {
    "id": "smart-schedule",
    "category": "scheduling",
    "title": "Smart Schedule",
    "subtitle": "Self-booking from real-time calendar availability",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "Smart Schedule lets candidates self-book interview slots from recruiters' real-time calendar availability. Powered by Cronofy, it syncs with major calendar providers and eliminates the back-and-forth of manual scheduling.",
    "howItWorks": "Connect your calendar via Cronofy (Google Calendar, Outlook, or Office 365). Configure availability preferences and interview duration. Send a Smart Schedule link to a candidate manually or via a trigger. The candidate sees available time slots and books directly. The interview is confirmed and added to both calendars automatically.",
    "doNotSay": [
      "Don't claim Smart Schedule works without a connected calendar — it requires Google or Outlook calendar integration"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "scheduling",
      "calendar",
      "interviews",
      "cronofy"
    ],
    "apiNotes": "No meeting scheduling API. Interview/meeting scheduling is UI-only. Calendar integration is configured in Settings.",
    "implementationNotes": "Requires calendar integration (Google Calendar or Outlook). Candidates self-book from available time slots. Automatic timezone detection. Sends calendar invites to both parties. Supports buffer time between meetings. Works with both in-person and video meetings.",
    "prospectQA": [
      {
        "q": "Can candidates self-schedule interviews?",
        "a": "Yes — Smart Schedule shows your available slots and candidates pick a time. Automatic timezone detection included."
      },
      {
        "q": "Does it work with our calendar?",
        "a": "Supports Google Calendar and Outlook/Office 365. Calendar must be connected in Settings."
      }
    ],
    "searchAliases": [
      "self-scheduling",
      "interview scheduling",
      "booking",
      "calendar booking",
      "meeting scheduler"
    ]
  },
  {
    "id": "calendar-sync",
    "category": "scheduling",
    "title": "Calendar Sync",
    "subtitle": "Google, Outlook, and Office 365 calendar integration",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "Calendar sync connects Teamtailor to Google Calendar, Outlook, or Office 365 so interview events and availability are kept in sync. It ensures Smart Schedule shows accurate availability and that booked interviews appear on recruiters' calendars.",
    "howItWorks": "Go to your personal settings in Teamtailor and connect your calendar provider (Google, Outlook, or Office 365). Authorize access. Your calendar availability is now visible to Smart Schedule, and events created in Teamtailor automatically sync to your connected calendar.",
    "doNotSay": [],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/1782830-connect-your-calendar-and-video-services-for-meetings-in-teamtailor",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "scheduling",
      "calendar",
      "integrations"
    ]
  },
  {
    "id": "group-meetings",
    "category": "scheduling",
    "title": "Group Meetings",
    "subtitle": "Group interview scheduling with multiple interviewers",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "Group meetings enable scheduling interviews with multiple interviewers or panel-style interviews. The feature coordinates availability across several team members to find mutually available slots.",
    "howItWorks": "When scheduling an interview, add multiple interviewers to the meeting. The system checks combined availability and presents slots where all participants are free. Candidates can self-book via Smart Schedule if configured.",
    "doNotSay": [
      "Don't claim specific group meeting functionality without verifying — feature has not been fully audited.",
      "Don't claim Group Meetings replaces dedicated panel scheduling tools — it's basic multi-interviewer scheduling"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "scheduling",
      "interviews",
      "meetings"
    ],
    "implementationNotes": "FREE add-on. Activated by Company Admin in Add-on Features. Allows multiple interviewers to join the same meeting slot. Integrates with Smart Schedule for panel interviews. Each interviewer needs their own calendar connected.",
    "prospectQA": [
      {
        "q": "Can we do panel interviews?",
        "a": "Yes — Group Meetings lets multiple interviewers join. Each interviewer gets their own calendar invite."
      },
      {
        "q": "Is this included free?",
        "a": "Yes — Group Meetings is a free add-on activated by a Company Admin."
      }
    ],
    "searchAliases": [
      "panel interview",
      "multi-interviewer",
      "group interview",
      "panel scheduling"
    ]
  },
  {
    "id": "career-site-builder",
    "category": "career-site",
    "title": "Career Site Builder",
    "subtitle": "Drag-and-drop career site editor",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "The career site builder is a drag-and-drop editor that lets companies create branded career pages without code. It includes customizable sections, themes, and content blocks to showcase company culture, open positions, and employer branding.",
    "howItWorks": "Navigate to the Career Site section in Teamtailor. Use the visual editor to add, remove, and rearrange content blocks. Customize colors, fonts, and imagery to match your brand. Preview the site and publish. The career site automatically displays your open jobs and accepts applications.",
    "doNotSay": [
      "Don't promise full CMS-level flexibility — the builder uses pre-defined section types, not freeform layout",
      "Don't claim it replaces a company website — it's specifically for the career/jobs section"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "career-site",
      "branding",
      "editor"
    ],
    "apiNotes": "NOT available via API. Career site pages, content, and design cannot be managed programmatically. All career site editing is UI-only.",
    "implementationNotes": "Drag-and-drop page builder with pre-built sections (hero, text, image, video, testimonial, team, job list, FAQ, custom HTML). Supports custom CSS and custom domains. Mobile-responsive by default. Sections can be reordered and configured without code. Custom pages can be created beyond the default career site.",
    "prospectQA": [
      {
        "q": "Do we need a developer to set up the career site?",
        "a": "No — it's a drag-and-drop builder. Anyone can configure it. Custom CSS is available for advanced styling."
      },
      {
        "q": "Can we match our brand?",
        "a": "Yes — custom colors, fonts, logos, custom domain, and custom CSS. Most customers achieve a seamless brand match."
      }
    ],
    "searchAliases": [
      "career page",
      "employer branding",
      "career website",
      "jobs page",
      "landing page"
    ]
  },
  {
    "id": "connect-widget",
    "category": "career-site",
    "title": "Connect Widget",
    "subtitle": "Passive talent capture for career sites",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "The Connect widget lets visitors express interest in your company even when there are no open positions that match. It captures passive candidates into a talent pool, building a pipeline of interested people for future roles.",
    "howItWorks": "Enable the Connect widget in your career site settings. The widget appears on your career site, inviting visitors to submit their profile and express general interest. Collected candidates are stored in a Connect candidate pool for future outreach and job matching.",
    "doNotSay": [],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/129677-integrate-a-job-list-widget",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "career-site",
      "talent-pool",
      "passive-candidates"
    ]
  },
  {
    "id": "multi-location",
    "category": "career-site",
    "title": "Multi-Location Pages",
    "subtitle": "Auto-generated location-specific career pages",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "Multi-location pages automatically generate dedicated career site pages for each office location. Each page shows jobs specific to that location along with location-relevant content, making it easier for candidates to find roles near them.",
    "howItWorks": "Add your office locations in Teamtailor's settings. The career site automatically generates a dedicated page for each location. Jobs tagged with a location appear on the corresponding page. Customize location page content as needed through the career site editor.",
    "doNotSay": [
      "Don't claim each location gets a completely independent career site — they are pages within one career site",
      "Do NOT say location pages provide separate branded career sites — for that, use Divisions",
      "Do NOT say each location needs its own job posting — single job links to multiple locations",
      "Do NOT promise location pages have independent domains — they're sub-pages of the main career site"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "career-site",
      "locations",
      "multi-location"
    ],
    "implementationNotes": "Add locations at Settings → Company → Locations. A career site page auto-creates for each location. Edit in Career site editor → Locations sidebar. Customize with content blocks plus specialized blocks: Departments list, Jobs (auto-filtered to location), People (team at that office). Organize locations into regions. A single job can link to multiple locations (no duplicates needed). Toggle 'Do not show on career site' to hide offices. For separate branded sites by business unit, use Divisions (separate feature).",
    "prospectQA": [
      {
        "q": "Can each office have its own career page?",
        "a": "Yes — Multi-Location Pages create dedicated pages per office with location-specific content and filtered job listings."
      },
      {
        "q": "How do jobs appear on location pages?",
        "a": "Jobs tagged with a location automatically appear on that location's career page."
      },
      {
        "q": "Do we need to post jobs multiple times for different locations?",
        "a": "No — link one job to multiple locations and it appears on each location page automatically."
      }
    ],
    "searchAliases": [
      "location pages",
      "office pages",
      "regional career site",
      "multi-office",
      "regional career pages",
      "divisions",
      "multi-brand"
    ]
  },
  {
    "id": "custom-pages",
    "category": "career-site",
    "title": "Custom Pages",
    "subtitle": "Custom career site pages for any content",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "Custom pages let you create additional pages on your career site beyond the default job listings and company pages. Use them for department spotlights, culture content, benefits overviews, or any employer branding content.",
    "howItWorks": "In the Career Site editor, create a new custom page. Add content blocks, images, videos, and text. Set the page URL slug and navigation placement. Publish the page to make it live on your career site.",
    "doNotSay": [
      "Do NOT say custom pages support arbitrary HTML/CSS — block-based editor",
      "Do NOT say Lead Pages capture formal applications — they invite conversations",
      "Do NOT promise unlimited page types — Custom, Campaign, and Lead only"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "career-site",
      "pages",
      "branding"
    ],
    "implementationNotes": "In Career site editor, click + at top of left sidebar. Page types: Custom Pages (general), Campaign Pages (hiring initiatives), Lead Pages (passive talent engagement via chat). Drag-and-drop content blocks. 'Show in navigation' toggle for header links. Default pages (Home, Jobs, Departments, Locations) also customizable. AI Co-pilot can suggest content. SEO settings available per page.",
    "prospectQA": [
      {
        "q": "Can we create pages beyond the jobs listing?",
        "a": "Yes — Custom Pages lets you build department pages, culture pages, benefits pages, etc. using the drag-and-drop builder."
      },
      {
        "q": "Can we create custom landing pages?",
        "a": "Yes — Custom Pages, Campaign Pages, and Lead Pages, all with drag-and-drop blocks. Add to site navigation when ready."
      },
      {
        "q": "Can AI help write content?",
        "a": "Yes — Co-pilot can suggest and draft text for your page blocks."
      }
    ],
    "searchAliases": [
      "landing page",
      "department page",
      "culture page",
      "benefits page",
      "career site pages",
      "landing pages",
      "campaign pages",
      "lead pages",
      "page builder",
      "employer branding pages"
    ]
  },
  {
    "id": "stock-photos",
    "category": "career-site",
    "title": "Stock Photos",
    "subtitle": "Unsplash integration for free stock imagery",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "Stock photos integration brings Unsplash's library of free, high-quality images directly into the Teamtailor career site editor. Teams can browse and insert professional photography without leaving the platform or purchasing separate stock photo subscriptions.",
    "howItWorks": "In the career site editor, when adding an image to any content block, select the stock photos option. Browse or search the Unsplash library. Select an image to insert it directly into your career site. Images are free to use and properly attributed.",
    "doNotSay": [],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "career-site",
      "images",
      "unsplash"
    ],
    "implementationNotes": "Built-in stock photo library powered by Unsplash. Available directly in the career site builder image selectors. Free to use, no licensing issues. Searchable by keyword.",
    "prospectQA": [
      {
        "q": "Do we need to buy stock photos?",
        "a": "No — TT includes a built-in free stock photo library (powered by Unsplash) accessible directly in the career site builder."
      }
    ],
    "searchAliases": [
      "images",
      "photos",
      "unsplash",
      "stock images"
    ]
  },
  {
    "id": "traffic-sources",
    "category": "analytics",
    "title": "Traffic Sources",
    "subtitle": "Job board traffic source reporting",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "Traffic source reporting shows where your career site visitors and job applicants are coming from. It tracks referral sources including job boards, social media, direct traffic, and campaign links so teams can measure which channels drive the most candidates.",
    "howItWorks": "Navigate to the Reports section and select Traffic Sources. View breakdowns of visitor origins by channel, job board, or campaign. Filter by date range, department, or job. Use the data to optimize your sourcing strategy and job board spending.",
    "doNotSay": [
      "Don't claim this replaces Google Analytics — it's recruitment-specific traffic tracking, not full web analytics"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "analytics",
      "reports",
      "traffic",
      "sourcing"
    ],
    "implementationNotes": "Analytics feature that tracks where career site visitors and applicants come from (direct, organic search, social media, job boards, referrals). Available under Analytics → Traffic Sources. UTM parameters supported for campaign tracking.",
    "prospectQA": [
      {
        "q": "Can we see which job boards perform best?",
        "a": "Yes — Traffic Sources shows application volume and conversion rates by source (job boards, social, organic, direct, referral)."
      }
    ],
    "searchAliases": [
      "source tracking",
      "UTM tracking",
      "channel analytics",
      "where candidates come from"
    ]
  },
  {
    "id": "conversion-reports",
    "category": "analytics",
    "title": "Conversion Reports",
    "subtitle": "Per-job-ad conversion rate tracking",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "Conversion reports track the rate at which job ad viewers become applicants for each individual job posting. They help recruiters identify which job ads are performing well and which need optimization.",
    "howItWorks": "Navigate to the Reports section and view conversion metrics. See per-job breakdowns of views to applications. Compare conversion rates across jobs, departments, or time periods to identify trends and optimize underperforming postings.",
    "doNotSay": [],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "analytics",
      "reports",
      "conversion"
    ],
    "implementationNotes": "Shows the candidate funnel conversion rates between hiring stages. Available under Analytics. Filterable by job, department, time period. Shows drop-off rates at each stage to identify bottlenecks.",
    "prospectQA": [
      {
        "q": "Can we see our hiring funnel?",
        "a": "Yes — Conversion Reports show stage-by-stage drop-off rates so you can identify where candidates fall out of the process."
      }
    ],
    "searchAliases": [
      "funnel report",
      "stage conversion",
      "hiring funnel",
      "drop-off analysis",
      "pipeline conversion"
    ]
  },
  {
    "id": "recruiter-activity",
    "category": "analytics",
    "title": "Recruiter Activity",
    "subtitle": "Track moves, rejections, and hires per user",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "Recruiter activity reports track individual team member performance including candidate moves, rejections, and hires. This gives hiring managers visibility into team workload and recruiter productivity.",
    "howItWorks": "Navigate to the Reports section and select Recruiter Activity. View per-user metrics including number of candidate moves, rejections processed, and hires completed. Filter by date range to track trends over time.",
    "doNotSay": [
      "Don't position this as a surveillance tool — frame it as workload visibility and coaching data"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "analytics",
      "reports",
      "recruiter",
      "activity"
    ],
    "implementationNotes": "Activity report showing recruiter actions: messages sent, candidates moved, reviews completed, time-in-stage metrics. Available under Analytics. Helps managers track team productivity and workload distribution.",
    "prospectQA": [
      {
        "q": "Can managers see recruiter activity?",
        "a": "Yes — activity reports show messages sent, candidates processed, and time-in-stage metrics per recruiter for coaching and workload balancing."
      }
    ],
    "searchAliases": [
      "recruiter productivity",
      "team activity",
      "user activity",
      "hiring manager activity"
    ]
  },
  {
    "id": "copilot-report-builder",
    "category": "analytics",
    "title": "Co-pilot Report Builder",
    "subtitle": "Natural language chart and report generation",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "The Co-pilot Report Builder lets users describe the analytics they want in plain English and generates charts and visualizations automatically. It's the same feature as Co-pilot Reports, accessible from the analytics section. This feature is live and shipped.",
    "howItWorks": "In the Reports section, use the Co-pilot builder to describe your desired report in natural language. The AI interprets your request and generates the appropriate chart, table, or data visualization. Refine your query to adjust the output. Save reports for future reference.",
    "doNotSay": [
      "Don't call this a roadmap or upcoming feature — it's live and shipped as of May 2026.",
      "Don't claim it replaces BI Connector for complex analytics — it handles standard recruiting metrics, not custom SQL queries"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "analytics",
      "copilot",
      "ai",
      "reports"
    ],
    "implementationNotes": "Natural language report builder — ask a question and Co-pilot generates a report. Part of the free Co-pilot add-on suite. Outputs charts and data tables. Can answer questions like \"how many applications did we get last month?\" or \"what's our average time to hire?\"",
    "prospectQA": [
      {
        "q": "Can AI generate reports for us?",
        "a": "Yes — Co-pilot Report Builder lets you ask questions in plain English and get charts/data. Completely free."
      },
      {
        "q": "What kind of reports can it generate?",
        "a": "Application volumes, time-to-hire, source effectiveness, stage conversion rates, and more — all from natural language questions."
      }
    ],
    "searchAliases": [
      "AI reports",
      "natural language reporting",
      "ask copilot",
      "report generator"
    ]
  },
  {
    "id": "indeed-integration",
    "category": "integrations",
    "title": "Indeed Integration",
    "subtitle": "Organic and sponsored job posting on Indeed",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "support-docs",
    "whatItDoes": "Teamtailor integrates with Indeed for both organic and sponsored job postings. Jobs can be listed organically via XML feed and promoted with sponsored ads through the Promote tab. Indeed's organic visibility depends on their current posting policies.",
    "howItWorks": "Jobs posted in Teamtailor are automatically included in the XML feed for Indeed's organic listings. To sponsor a job, go to the job's Promote tab, select Indeed Sponsored, set a budget and date range, and activate the campaign. Sponsored billing is handled directly by Indeed.",
    "doNotSay": [
      "Don't claim free organic listings as guaranteed — Indeed changed XML feed policy March 2026. Say 'organic visibility depends on Indeed's current posting policies.'"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/6193419-why-are-my-jobs-not-posted-on-indeed",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "integrations",
      "indeed",
      "job-boards"
    ],
    "implementationNotes": "Indeed changed XML feed policy in March 2026 — organic visibility is no longer guaranteed. Sponsored ads managed from Promote tab. Performance prediction shown before confirming purchase. Source attribution is automatic for Indeed applicants.",
    "apiNotes": "Job board integrations use a separate XML feed API, not the main v1 REST API. Indeed posting is managed through the Promote tab in the UI."
  },
  {
    "id": "criteria-corp",
    "category": "integrations",
    "title": "Criteria Corp",
    "subtitle": "Native pre-employment assessment integration",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "Criteria Corp is a native assessment integration that lets recruiters send pre-employment tests to candidates directly from Teamtailor. Assessments can be auto-triggered at specific pipeline stages, and results appear directly on the candidate's profile card.",
    "howItWorks": "Enable the Criteria Corp integration in your Teamtailor settings. Configure which assessments to use for each job. Set up a trigger at the desired pipeline stage to auto-send assessments when candidates arrive. Candidates receive and complete the assessment, and results are displayed on their candidate card in Teamtailor.",
    "doNotSay": [
      "Don't claim Criteria Corp is included — it requires a separate subscription with Criteria Corp"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "integrations",
      "assessments",
      "criteria-corp"
    ],
    "implementationNotes": "Assessment integration partner. Candidates receive assessment links during the hiring process. Results sync back to the candidate profile in TT. Requires separate Criteria Corp subscription. Configured in Settings → Integrations → Assessment Partners.",
    "prospectQA": [
      {
        "q": "Do you integrate with assessment tools?",
        "a": "Yes — we integrate with Criteria Corp and 30+ other assessment partners. Results sync directly to candidate profiles."
      }
    ],
    "searchAliases": [
      "assessment",
      "testing",
      "aptitude test",
      "skills assessment",
      "pre-employment testing"
    ]
  },
  {
    "id": "linkedin",
    "category": "integrations",
    "title": "LinkedIn Integration",
    "subtitle": "LinkedIn Recruiter and job posting integration",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "LinkedIn integration connects Teamtailor with LinkedIn for job distribution and recruiter workflows. It enables posting jobs to LinkedIn and importing candidate profile data.",
    "howItWorks": "Connect your LinkedIn account in Teamtailor's integration settings. Jobs can be posted to LinkedIn through the Promote tab. LinkedIn profile data can be synced for candidates sourced via LinkedIn Recruiter.",
    "doNotSay": [
      "Don't claim free LinkedIn job posting — LinkedIn charges separately for job slots and Recruiter seats",
      "Don't promise automatic LinkedIn profile enrichment — RSC syncs specific data fields, not full profiles"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "integrations",
      "linkedin",
      "social"
    ],
    "implementationNotes": "LinkedIn RSC (Recruiter System Connect) integration syncs candidate data between LinkedIn Recruiter and TT. Also supports Apply with LinkedIn for one-click applications. LinkedIn job posting available through the Promote dashboard. Requires LinkedIn Recruiter seat for RSC features.",
    "prospectQA": [
      {
        "q": "Does TT integrate with LinkedIn?",
        "a": "Yes — three ways: RSC (Recruiter System Connect), Apply with LinkedIn, and job posting via Promote. RSC requires a LinkedIn Recruiter seat."
      },
      {
        "q": "Can candidates apply with their LinkedIn profile?",
        "a": "Yes — Apply with LinkedIn lets candidates apply with one click using their LinkedIn data."
      }
    ],
    "searchAliases": [
      "linkedin integration",
      "linkedin recruiter",
      "RSC",
      "recruiter system connect"
    ]
  },
  {
    "id": "slack",
    "category": "integrations",
    "title": "Slack Integration",
    "subtitle": "Recruitment notifications in Slack",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "The Slack integration sends recruitment notifications directly to Slack channels. Teams stay informed about new applications, candidate stage changes, and other hiring events without leaving their communication tool.",
    "howItWorks": "Connect Slack in Teamtailor's integration settings. Choose which events trigger Slack notifications (e.g., new application, candidate moved, hire made). Select the target Slack channel for each notification type. Notifications are sent automatically when the configured events occur.",
    "doNotSay": [],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/416095-slack-integration",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "integrations",
      "slack",
      "notifications"
    ]
  },
  {
    "id": "hris-integrations",
    "category": "integrations",
    "title": "HRIS Integrations",
    "subtitle": "Connectors for HR information systems",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "HRIS integrations connect Teamtailor with HR information systems to sync employee and hiring data. This bridges the gap between recruitment and HR operations, enabling smooth handoffs from candidate to employee.",
    "howItWorks": "Browse available HRIS connectors in Teamtailor's Marketplace or integration settings. Connect your HRIS provider and configure the data sync settings. Hired candidate data can be automatically pushed to your HRIS to create employee records.",
    "doNotSay": [],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "integrations",
      "hris",
      "hr"
    ],
    "searchAliases": [
      "background check",
      "Checkr",
      "BambooHR",
      "Personio",
      "HiBob",
      "Workday",
      "SAP",
      "ADP",
      "assessment",
      "HRIS",
      "HCM"
    ],
    "implementationNotes": "TT marketplace has 150+ partner integrations including: HRIS (HiBob, Personio, BambooHR, Nmbrs, Flex HRM, Darwinbox, Skello), Background Checks (Checkr, Veritable Screening, DISA, Jig by Semac, Zinc/Zincwork), Assessments (Alva, Clevry, TestGorilla, Predictive Index, Assessment Engine, E-stimate, Equalture, HI Assessments, Multitest, PerformanSe, Pipplet, Canditech, Aon, Criteria Corp), E-signing (Contractbook, Yousign, Oneflow, Scrive, Signeasy), Reference Checking (Refapp). All partner integrations use the Partner API with webhook callbacks.",
    "prospectQA": [
      {
        "q": "Do you integrate with our HRIS?",
        "a": "We have 150+ marketplace integrations including HiBob, Personio, BambooHR, Workday connectors, and more. Check the Marketplace in-app for the full list."
      },
      {
        "q": "What background check providers do you support?",
        "a": "Checkr, Veritable Screening, DISA, Jig by Semac, and Zinc/Zincwork. All integrate via our Partner API with automated results syncing."
      },
      {
        "q": "What assessment tools do you integrate with?",
        "a": "14+ assessment partners including Alva, TestGorilla, Predictive Index, Clevry, Criteria Corp, Canditech, and more. Results sync directly to candidate profiles."
      }
    ]
  },
  {
    "id": "data-migration",
    "category": "integrations",
    "title": "Data Migration",
    "subtitle": "ATS migration and data import",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "support-docs",
    "whatItDoes": "Data migration tools help companies import existing recruitment data from other ATS platforms into Teamtailor. This includes candidate records, job history, and other recruitment data to ensure a smooth transition.",
    "howItWorks": "Work with Teamtailor's onboarding team to plan your data migration. Export data from your existing ATS. Teamtailor's migration tools import candidates, jobs, and associated data. Verify the imported data for completeness and accuracy.",
    "doNotSay": [],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/8304568-import-existing-data-into-teamtailor",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "integrations",
      "migration",
      "import"
    ],
    "implementationNotes": "Standard import: FREE. Custom import: $1,000. Bulk per-candidate: $0.03/candidate. Import requests are queued with estimated completion dates. Contact: imports@teamtailor.com. Import team runs on 6-week cycles. API supports self-import: POST /v1/candidates with merge:true prevents duplicates. Resume upload via PATCH with URL string — TT fetches the file.",
    "prospectQA": [
      {
        "q": "How much does migration cost?",
        "a": "Standard data import is free. Custom import is $1,000. Bulk import is $0.03/candidate."
      },
      {
        "q": "How long does migration take?",
        "a": "Requests are queued with estimated completion dates based on submission. The imports team operates on 6-week cycles."
      }
    ],
    "apiNotes": "Full CRUD API available. POST /v1/candidates with merge:true for dedup. Resume upload via URL string on candidate PATCH. Standard import: $0.03/candidate for bulk. Custom field values linkable. Rate limit: 50 req/10 sec."
  },
  {
    "id": "indeed-sponsored-ads",
    "category": "promotion",
    "title": "Indeed Sponsored Ads",
    "subtitle": "Budget-based sponsored job promotion on Indeed",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "Indeed Sponsored Ads let recruiters promote job postings with paid placement on Indeed. Set a budget and date range, and Teamtailor provides performance predictions. Billing is handled directly by Indeed, not through Teamtailor.",
    "howItWorks": "Open a job's Promote tab. Select Indeed Sponsored. Set your daily or total budget and the campaign date range. Review the performance prediction (estimated clicks/applies). Activate the campaign. Monitor performance in the Promote dashboard. Indeed handles billing directly.",
    "doNotSay": [
      "Do NOT say Teamtailor replaces your Indeed account — you need an existing Indeed account with billing set up",
      "Do NOT claim all jobs auto-appear on Indeed for free — 'Sponsored only' accounts and one-source policy can block organic listings",
      "Do NOT say fully remote jobs will always show on Indeed — they may not be eligible for organic visibility",
      "Do NOT imply this works without the base 'Indeed + Glassdoor Job Posting' integration — it's a prerequisite"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/6200102-publish-jobs-as-indeed-sponsored-ads",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "promotion",
      "indeed",
      "sponsored",
      "advertising"
    ],
    "implementationNotes": "Go to Marketplace → Channels → activate 'Indeed Sponsored Ads'. The 'Indeed + Glassdoor Job Posting' integration MUST be activated first (prerequisite). Enter the business email for your Indeed account; billing must be on file. To sponsor a job: Job → Promote tab → 'Indeed Sponsored Ads' → set dates/budget → review prediction → Purchase. GOTCHAS: 'Sponsored only' Indeed accounts won't get free/organic postings — contact Indeed rep. Indeed's one-source policy may block jobs if posted directly before — Teamtailor must be primary source. Fully remote roles may not be eligible for free Indeed visibility.",
    "prospectQA": [
      {
        "q": "Do we need an existing Indeed account?",
        "a": "Yes — you need an Indeed account with billing on file. Teamtailor connects to it, doesn't create one."
      },
      {
        "q": "Can we control the budget?",
        "a": "Yes — set start/end dates and budget limit. TT shows a performance prediction before you confirm."
      },
      {
        "q": "Why aren't our jobs appearing on Indeed?",
        "a": "Common causes: missing location on job, 'Sponsored only' account flags, or Indeed's one-source policy. Contact your Indeed rep."
      }
    ],
    "searchAliases": [
      "indeed integration",
      "indeed ads",
      "sponsored jobs",
      "indeed campaign",
      "job board advertising",
      "pay-per-click jobs"
    ]
  },
  {
    "id": "business-network-boost",
    "category": "promotion",
    "title": "Business Network Boost",
    "subtitle": "LinkedIn and Meta advertising bundle",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "Business Network Boost bundles LinkedIn and Meta (Facebook/Instagram) advertising into a single promotion option. It enables recruiters to reach professional audiences across both platforms from one interface within Teamtailor.",
    "howItWorks": "Open a job's Promote tab. Select Business Network Boost. Configure your campaign budget and targeting. The system distributes your ad spend across LinkedIn and Meta. Monitor performance through the Promote dashboard.",
    "doNotSay": [
      "Do NOT say employees can run paid campaigns — they share organically via the Employee Dashboard",
      "Do NOT claim this is a full referral management system with rewards — it's a sharing tool"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/6025203-promote-team",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "promotion",
      "linkedin",
      "meta",
      "advertising"
    ],
    "implementationNotes": "Part of Promote suite. Employee Dashboard lets employees share open roles to personal social networks. No separate activation beyond Promote. For best results: grant TT access to your company's Facebook/Instagram pages so ads appear from your brand. Contact promote@teamtailor.com for free consultation.",
    "prospectQA": [
      {
        "q": "How do employees share job openings?",
        "a": "Via the Employee Dashboard — browse open roles and share to personal social networks with one click."
      },
      {
        "q": "Does it cost extra?",
        "a": "Employee Dashboard sharing is included. Paid social ad campaigns through the Promote team are separate."
      }
    ],
    "searchAliases": [
      "employee sharing",
      "social sharing",
      "employee advocacy",
      "network referrals"
    ]
  },
  {
    "id": "social-media-boost",
    "category": "promotion",
    "title": "Social Media Boost",
    "subtitle": "Meta and Snapchat advertising bundle",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "Social Media Boost bundles Meta (Facebook/Instagram) and Snapchat advertising into a single promotion option. It targets candidates on social media platforms where they spend time outside of professional networks.",
    "howItWorks": "Open a job's Promote tab. Select Social Media Boost. Configure your campaign budget and targeting. The system distributes your ad spend across Meta and Snapchat. Monitor performance through the Promote dashboard.",
    "doNotSay": [
      "Do NOT say customers self-serve social ads — TT's Promote team manages campaigns",
      "Do NOT claim it includes LinkedIn ads — LinkedIn Premium Job Posts are separate",
      "Do NOT say it's free — social boost campaigns are purchased services"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/6025203-promote-team",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "promotion",
      "meta",
      "snapchat",
      "social-media",
      "advertising"
    ],
    "implementationNotes": "Managed by the Promote team (promote@teamtailor.com). TT runs targeted campaigns on Facebook, Instagram, and Snapchat on your behalf. Provide access to your company's FB/IG pages for branded ads. This is a managed service, not self-service. Follow the 3-second rule — use authentic team photos, not stock images. Ensure your application process is mobile-friendly.",
    "prospectQA": [
      {
        "q": "Which social platforms are supported?",
        "a": "Facebook, Instagram, and Snapchat via TT's Promote team. LinkedIn Premium Job Posts are separate."
      },
      {
        "q": "How do we get started?",
        "a": "Contact promote@teamtailor.com for a free consultation. Their digital marketing specialists manage everything."
      }
    ],
    "searchAliases": [
      "social media ads",
      "facebook ads",
      "instagram ads",
      "paid social",
      "recruitment marketing"
    ]
  },
  {
    "id": "promote-dashboard",
    "category": "promotion",
    "title": "Promote Dashboard",
    "subtitle": "Central promotion campaign management",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "The Promote dashboard provides a centralized view of all active and past job promotion campaigns across channels. It aggregates performance metrics from Indeed Sponsored, Business Network Boost, and Social Media Boost in one place.",
    "howItWorks": "Navigate to the Promote section in Teamtailor. View all active campaigns with their status, budget, spend, and performance metrics. Drill into individual campaigns for detailed analytics. Manage, pause, or adjust campaigns directly from the dashboard.",
    "doNotSay": [
      "Do NOT say all users see all promotions — visibility scoped to hiring team unless Company Admin",
      "Do NOT claim it provides ROI or cost-per-hire — shows views, applications, spend but not hire attribution"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/6025203-promote-team",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "promotion",
      "dashboard",
      "analytics"
    ],
    "implementationNotes": "Access via Promotions tab in main menu. Shows all purchased promotions across jobs. Hiring team sees only their jobs; Company Admins see all. Per-job view: price, time remaining, views, applications. Aggregate stats: total spending, views, applications. Filters: 'My jobs', hide expired, channel selection.",
    "prospectQA": [
      {
        "q": "Can we see all ad spend in one place?",
        "a": "Yes — Promote Dashboard shows total spending, views, and applications per job plus individual promotion details."
      },
      {
        "q": "Who can access it?",
        "a": "Hiring team members see their own jobs. Company Admins see everything company-wide."
      }
    ],
    "searchAliases": [
      "promotion overview",
      "campaign dashboard",
      "ad spend tracking",
      "promote tab"
    ]
  },
  {
    "id": "referral-tracking",
    "category": "other",
    "title": "Referral Tracking",
    "subtitle": "Employee referral system with leaderboards",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "Referral tracking enables a structured employee referral program within Teamtailor. Employees can refer candidates for open positions, and the system tracks referral sources, statuses, and results. Leaderboards gamify the program by ranking top referrers.",
    "howItWorks": "Enable the referral program in Teamtailor settings. Employees access a referral portal where they can browse open jobs and submit referrals. Each referral is tracked and attributed to the referring employee. Leaderboards show top referrers, and referral status is visible throughout the hiring process.",
    "doNotSay": [
      "Do NOT conflate Referrals with References — Referrals are employee recommendations; References are feedback from former colleagues",
      "Do NOT say it's enabled by default — must be activated in Add-on feature center"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/3518886-referrals",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "referrals",
      "employees",
      "leaderboards"
    ],
    "apiNotes": "Referral data accessible as candidate relationships/attributes. No dedicated referrals endpoint.",
    "implementationNotes": "Activate Referrals in Add-on feature center. Employees access via Employee Dashboard. They can view open jobs, share links, submit referrals. Track status: Inbox, In Process, Hired, Rejected via 'My Referrals' widget. Admins see analytics under Analytics → Team → Referrals. Do NOT confuse with References (structured feedback from former colleagues).",
    "prospectQA": [
      {
        "q": "Can employees track their referral status?",
        "a": "Yes — 'My Referrals' widget shows status (Inbox, In Process, Hired, Rejected) on their Employee Dashboard."
      },
      {
        "q": "Can we see referral analytics?",
        "a": "Yes — Analytics → Team → Referrals shows referrals per user and overall trends."
      }
    ],
    "searchAliases": [
      "employee referrals",
      "referral program",
      "refer a friend",
      "referral analytics"
    ]
  },
  {
    "id": "requisitions",
    "category": "other",
    "title": "Job Approvals (formerly Requisitions)",
    "subtitle": "Headcount approval workflows — replacing Requisitions ($1,400/year)",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "notion-export (Project Hiring Harmony)",
    "whatItDoes": "Job Approvals is replacing the legacy Requisitions system as of Cycle #53 (May-Jun 2026). Jobs become the single object for managing hiring needs — no more separate 'requisition → job' flow. Job Approvals work like Job Offer Approvals with transparent status tracking. Approved salary ranges, locations, and details automatically populate into offers.",
    "howItWorks": "Configure the requisition workflow in settings, defining approval chains. Hiring managers create a requisition specifying the role, department, headcount, and justification. The requisition routes through the approval chain. Once approved, a job can be created from the requisition. Track requisition status via the dashboard or API.",
    "doNotSay": [
      "Don't say 'Requisitions' as if it's the current system — it's being sunset and replaced by Job Approvals.",
      "Don't say it's free — Job Approvals is a paid enterprise add-on at $1,400/year.",
      "Do NOT say it's on all plans — premium add-on",
      "Do NOT confuse with Offer Approvals — Requisitions = headcount, Offers = compensation"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/2784895-use-our-requisitions-feature",
    "apiEndpoint": "/v1/requisitions",
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "requisitions",
      "approvals",
      "headcount"
    ],
    "apiNotes": "GET /v1/requisitions confirmed available. Read-only access to formal headcount requests. Being replaced by Job Approvals (Project Hiring Harmony).",
    "implementationNotes": "Premium add-on — contact TT to enable. Configure forms at Settings → Recruitment → Requisitions. Access via Jobs tab toggle. Approval flows (Default/Custom). Denied requisitions editable and resubmittable. Once approved, job auto-created with data pre-filled. Includes Hiring Plan visualization. Dashboard widget available.",
    "prospectQA": [
      {
        "q": "What's the Hiring Plan feature?",
        "a": "Visual roadmap showing start/end dates, expected hires, and progress — helps leadership track headcount planning."
      },
      {
        "q": "What happens after approval?",
        "a": "A new job is auto-created with requisition data pre-filled, ensuring consistency."
      }
    ],
    "searchAliases": [
      "job requisition",
      "headcount approval",
      "position request",
      "hiring plan"
    ]
  },
  {
    "id": "scorecards",
    "category": "other",
    "title": "Scorecards",
    "subtitle": "Structured interview evaluation criteria",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "api-docs",
    "whatItDoes": "Scorecards provide structured evaluation criteria for interviews. Interviewers rate candidates on predefined competencies and skills, ensuring consistent and comparable assessments across all candidates for a role.",
    "howItWorks": "Create a scorecard template with evaluation criteria (competencies, skills, cultural fit dimensions). Assign the scorecard to a job or interview stage. After interviews, team members fill out the scorecard rating each criterion. Scores are aggregated on the candidate profile for side-by-side comparison.",
    "doNotSay": [
      "Do NOT say the scale is customizable — it's a fixed 1-5 scale",
      "Do NOT say all evaluations become competencies — only scores ≥3"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/2564412-job-scorecards",
    "apiEndpoint": "/v1/scorecards",
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "interviews",
      "evaluation",
      "scorecards"
    ],
    "implementationNotes": "Define skills (blue) and traits (yellow) with weighted importance in job Evaluation section. Team evaluates on 1-5 scale with optional comments. Scores ≥3 auto-saved as competencies. Job Match Score calculated from weighted evaluations. Manage skills/traits at Settings → Recruitment. Customize rating definitions at Settings → Recruitment → Ratings.",
    "apiNotes": "API resources available: scorecard-criteria (definitions), scorecard-picks (criteria assigned to jobs), scorecard-scores (individual scores). Read access confirmed.",
    "prospectQA": [
      {
        "q": "How does Job Match Score work?",
        "a": "Calculated from team evaluations weighted by importance assigned to each skill/trait."
      },
      {
        "q": "Can we define what each rating means?",
        "a": "Yes — customize rating definitions at Settings → Recruitment → Ratings."
      }
    ],
    "searchAliases": [
      "evaluation criteria",
      "candidate scoring",
      "job match score",
      "structured evaluation"
    ]
  },
  {
    "id": "onboarding-module",
    "category": "other",
    "title": "Onboarding Module",
    "subtitle": "Post-hire onboarding workflows",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "notion-export",
    "whatItDoes": "The Onboarding module extends Teamtailor from 'first impression to first day.' It's a paid add-on priced at 20% of annual list price (beta pricing). E-signing is included in the onboarding price. Activation requires contacting support via #support Slack channel or TT-admin backend.",
    "howItWorks": "Enable the Onboarding module in your Teamtailor account. Create onboarding templates with tasks, documents, and milestones. When a candidate is hired, transition them into the onboarding workflow. Assign tasks to new hires and team members, track completion, and manage the entire onboarding process within Teamtailor.",
    "doNotSay": [
      "Don't say Onboarding is free — it's a paid add-on at 20% of annual list price.",
      "Don't quote the 20% as final pricing — it was marked as 'beta pricing' that 'will most likely change.'"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/10264836-start-the-onboarding-of-your-new-hires-in-teamtailor",
    "apiEndpoint": "/v1/onboarding",
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "onboarding",
      "post-hire",
      "workflows"
    ],
    "implementationNotes": "20% of list price, can offer free first year as deal sweetener. Templates at Settings → Templates → Onboardings. Placeholders: {first-name}, {last-name}, {job-title}. Tasks assignable to different teams (HR, IT, Hiring Managers). To-do templates at Settings → Templates → To-dos. Dashboard widget for active tracking. Initiated via 'Start Onboarding' in job process or 'Onboard' on candidate card. Requires contacting support to activate.",
    "prospectQA": [
      {
        "q": "How much is Onboarding?",
        "a": "20% of your annual list price. We can discuss offering the first year free to help you get started."
      },
      {
        "q": "Is e-signing included?",
        "a": "Yes, e-signing is included in the Onboarding module price."
      }
    ],
    "apiNotes": "No native onboarding API endpoints. Onboarding data flows to HRIS integrations at the 'hired' stage. The onboarding module is UI-only."
  },
  {
    "id": "sourcing-extension",
    "category": "screening-ai",
    "title": "Sourcing Extension",
    "subtitle": "Chrome extension for sourcing candidates from LinkedIn and the web",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "The Sourcing Extension is a free Chrome browser extension that lets recruiters add candidates directly from LinkedIn profiles, GitHub, or any web page into Teamtailor with one click. It captures profile data and adds the candidate to your talent pool.",
    "howItWorks": "Install the Teamtailor Sourcing Extension from the Chrome Web Store. When you find a promising candidate on LinkedIn or another site, click the extension icon. It pre-fills the candidate's information and lets you add them directly to a specific job or talent pool in Teamtailor.",
    "doNotSay": [
      "Do NOT say it only works on Chrome — also supports Edge, Vivaldi, Firefox",
      "Do NOT claim bulk import — works one profile at a time",
      "Do NOT say it costs extra — included free by default"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/14413492-video-sourcing-extension",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "sourcing",
      "chrome-extension",
      "linkedin"
    ],
    "implementationNotes": "Install 'Teamtailor sourcing' browser extension from Chrome Web Store (also Edge, Vivaldi, Firefox). Must be logged into TT. Click extension on any webpage (e.g., LinkedIn profile) to add a candidate. Auto-captures source URL. Parse resume info, add ratings and notes in the popup. FREE — included and active by default.",
    "prospectQA": [
      {
        "q": "Does it work with LinkedIn?",
        "a": "Yes — click the extension while viewing any LinkedIn profile to add the candidate to TT. Source URL auto-captured."
      },
      {
        "q": "Is there an extra cost?",
        "a": "No — included free and active by default for all accounts."
      }
    ],
    "searchAliases": [
      "chrome extension",
      "browser extension",
      "linkedin sourcing",
      "sourcing plugin",
      "talent sourcing"
    ]
  },
  {
    "id": "interview-kit",
    "category": "screening-ai",
    "title": "Interview Kit",
    "subtitle": "Structured interview guides with scorecards",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "notion-export",
    "whatItDoes": "Interview Kits provide structured interview guides with predefined questions and evaluation criteria. They help standardize the interview process across hiring teams and ensure consistent candidate assessment.",
    "howItWorks": "Create an Interview Kit in your Teamtailor settings. Add questions, evaluation criteria, and scoring guidelines. Assign the kit to specific pipeline stages. Interviewers use the kit during interviews to evaluate candidates consistently and submit scores.",
    "doNotSay": [
      "Do NOT say kits replace scorecards — they work together",
      "Do NOT say AI generates questions automatically — questions are pre-defined (though Co-pilot can suggest)"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/3421442-interview-kits",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "interviews",
      "scorecards",
      "evaluation"
    ],
    "implementationNotes": "User research shows adoption is mixed — some recruiters prefer external tools (Google Docs, Word) due to auto-save uncertainty. Co-pilot can suggest questions and auto-answer from video transcripts. Star ratings stick with candidate (not per-job), which can cause confusion.",
    "apiNotes": "Scorecard-related API resources available (scorecard-criteria, scorecard-picks, scorecard-scores). Interview Kit questions linked via picked-questions endpoint.",
    "prospectQA": [
      {
        "q": "What's in an interview kit?",
        "a": "Three components: Interview Instructions, Essential Questions (standardized), and Scorecards (rating against skills/traits)."
      },
      {
        "q": "Can we have different kits per stage?",
        "a": "Yes — create kits for phone screen vs. final interview and assign to specific stages."
      }
    ],
    "searchAliases": [
      "structured interviews",
      "interview guides",
      "interview templates",
      "standardized interviews"
    ]
  },
  {
    "id": "references",
    "category": "screening-ai",
    "title": "References",
    "subtitle": "Automated reference checking workflows",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "References enables automated reference checking by sending questionnaires to candidates' references. The system collects and organizes reference feedback directly within the candidate's profile.",
    "howItWorks": "Enable the References add-on. When ready to check references, send a reference request from the candidate's profile. The system emails the reference with a questionnaire. Completed responses are collected and displayed on the candidate's profile for team review.",
    "doNotSay": [
      "Don't claim AI-powered reference analysis — references are collected via questionnaire, not analyzed by AI"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "references",
      "screening",
      "automation"
    ],
    "implementationNotes": "FREE add-on. Automated reference check requests sent to referees via email. Custom questionnaires for referees. Responses appear directly on the candidate profile. Supports multiple referees per candidate. Referee identity verified.",
    "prospectQA": [
      {
        "q": "Can we automate reference checks?",
        "a": "Yes — send automated reference questionnaires to referees. Responses appear on the candidate profile. Free add-on."
      },
      {
        "q": "Can we customize the reference questions?",
        "a": "Yes — create custom questionnaires with your own questions for referees to answer."
      }
    ],
    "searchAliases": [
      "reference check",
      "background reference",
      "referee",
      "reference questionnaire"
    ]
  },
  {
    "id": "restricted-access",
    "category": "other",
    "title": "Restricted Access",
    "subtitle": "Confidential job postings with limited visibility",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "Restricted Access limits who can view and manage specific jobs within Teamtailor. It's used for confidential hires where only designated team members should have access to the job and its candidates.",
    "howItWorks": "Enable the Restricted Access add-on. When creating or editing a job, toggle restricted access and select which team members can view and manage the job. Only those users will see the job, its candidates, and activity in their Teamtailor dashboard.",
    "doNotSay": [
      "Do NOT say it's available on all plans — it's an add-on feature",
      "Do NOT claim per-field data restrictions — it restricts candidate and stage visibility, not individual fields"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/5772858-restricted-access",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "security",
      "confidential",
      "access-control"
    ],
    "implementationNotes": "Two approaches: (1) Restrict individual candidates via Candidate Card → ⋮ → toggle 'Restrict access'. (2) Restrict recruitment stages — configure user permissions to control which stages a user can see. Use Groups for access management at scale. Activated by Company Admin in Add-on feature center.",
    "prospectQA": [
      {
        "q": "Can hiring managers only see their interview stage?",
        "a": "Yes — configure which stages each user can see. They only see stages and candidates you've granted access to."
      },
      {
        "q": "How do we handle confidential executive searches?",
        "a": "Toggle restricted access on individual candidate cards — only authorized users can then view that candidate."
      }
    ],
    "searchAliases": [
      "access control",
      "permissions",
      "confidential hiring",
      "role-based access",
      "data privacy"
    ]
  },
  {
    "id": "external-recruiters",
    "category": "other",
    "title": "External Recruiters",
    "subtitle": "Managed portal for agency recruiters",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "External Recruiters provides a dedicated portal for staffing agencies and external recruiters to submit candidates to your open positions. Each agency gets limited access to submit candidates without seeing your full pipeline.",
    "howItWorks": "Enable the External Recruiters add-on. Invite agency recruiters by email. They receive a login to a limited portal where they can view assigned jobs and submit candidates. Submitted candidates appear in your pipeline with the agency source tracked.",
    "doNotSay": [
      "Do NOT say they have full ATS access — very limited, scoped to their candidates/jobs",
      "Do NOT say they can see all candidates — only their own + agency colleagues'",
      "Do NOT say this works without agency association — each recruiter must be linked to a firm"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/3992866-work-with-external-recruiters",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "agencies",
      "external",
      "portal"
    ],
    "apiNotes": "External recruiters are managed as users with restricted roles. Partner API provides webhook callbacks for assessment/screening results.",
    "implementationNotes": "Activate in Add-on feature center. Manage at Settings → Recruitment → External recruiters. Each recruiter linked to an agency. Limited access: only see candidates they/their agency added, only for invited jobs. Candidates tagged 'Sourced externally'. Collaborate with internal team via Comments tab.",
    "prospectQA": [
      {
        "q": "What can external recruiters see?",
        "a": "Only candidates they or their agency added, only for jobs they're invited to. They can add/manage candidates and collaborate via Comments."
      },
      {
        "q": "How are agency candidates identified?",
        "a": "Automatically tagged 'Sourced externally' for easy tracking."
      }
    ],
    "searchAliases": [
      "agency recruiters",
      "staffing agency",
      "recruitment agency",
      "RPO",
      "vendor management"
    ]
  },
  {
    "id": "surveys",
    "category": "analytics",
    "title": "Surveys",
    "subtitle": "Candidate experience surveys",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "Surveys let you collect feedback from candidates about their recruitment experience. Send surveys at any point in the process to measure candidate satisfaction and identify areas for improvement.",
    "howItWorks": "Enable the Surveys add-on. Create survey templates with your questions. Configure when surveys are sent (e.g., after rejection, after hire). Candidates receive the survey via email and responses are collected in Teamtailor's analytics.",
    "doNotSay": [
      "Do NOT say surveys are available out of the box — must be activated as add-on",
      "Do NOT claim enterprise-grade survey analytics — for advanced use, integrate with Starred"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/4744134-surveys",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "surveys",
      "feedback",
      "candidate-experience"
    ],
    "implementationNotes": "Activate in Add-on feature center. Question types: short text, long text, multiple choice, single choice. Send manually or automate via Triggers. Built-in NPS for candidate satisfaction. Quality of Hire survey available (trigger at Hired stage). For advanced analytics, integrates with Starred.",
    "prospectQA": [
      {
        "q": "Can we automate candidate experience surveys?",
        "a": "Yes — use Triggers to auto-send surveys when candidates reach specific stages (e.g., rejection, hired)."
      },
      {
        "q": "What survey types are supported?",
        "a": "Custom surveys (text, multiple choice), built-in NPS, and Quality of Hire survey with specific triggers."
      }
    ],
    "searchAliases": [
      "candidate feedback",
      "candidate experience survey",
      "quality of hire",
      "satisfaction survey"
    ]
  },
  {
    "id": "multiple-languages",
    "category": "career-site",
    "title": "Multiple Languages",
    "subtitle": "Multi-language career site and candidate communication",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "notion-export",
    "whatItDoes": "Multiple Languages enables your career site (39 languages: Arabic through Welsh) and ATS (13 languages: Danish, English, Estonian, Finnish, French, German, Italian, Latvian, Lithuanian, Norwegian, Portuguese, Spanish, Swedish) to be displayed in multiple languages. Translation timeline: career site ~1-2 months, ATS ~2-3 months. Uses Crowdin translation management system.",
    "howItWorks": "Enable the Multiple Languages add-on. Add languages in your career site settings. Create translated versions of career site content and job postings. Candidates see a language switcher on your career site and can browse in their preferred language.",
    "doNotSay": [
      "Do NOT say TT auto-translates all content — only system text is auto-translated; your content needs manual translation",
      "Do NOT say each language stays synced — they're independent sites managed separately"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/5119291-career-sites-in-multiple-languages",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "career-site",
      "languages",
      "localization"
    ],
    "implementationNotes": "Activate in Add-on feature center. Add languages at Settings → Content → Career sites → click + button. Can clone existing site or start blank. Each language is a fully independent site — you manage content independently. Only system text auto-translated; manual content needs your own translation. Co-pilot can help translate application questions.",
    "prospectQA": [
      {
        "q": "Is the ATS available in [X language]?",
        "a": "Check: only 13 languages for ATS (Danish, English, Estonian, Finnish, French, German, Italian, Latvian, Lithuanian, Norwegian, Portuguese, Spanish, Swedish). Career site supports 38 languages."
      },
      {
        "q": "How long to add our language?",
        "a": "1-2 months for career site, 2-3 months for ATS."
      },
      {
        "q": "Does TT auto-translate our career site?",
        "a": "System text (buttons, labels) yes. Your content (job descriptions, custom pages) needs manual translation. Co-pilot can help with application questions."
      },
      {
        "q": "Can we have different content per market?",
        "a": "Yes — each language version is fully independent. Translate your main site or create unique content per market."
      }
    ],
    "searchAliases": [
      "multilingual",
      "career site translation",
      "localization",
      "international career site"
    ]
  },
  {
    "id": "additional-candidate-info",
    "category": "screening-ai",
    "title": "Additional Candidate Info",
    "subtitle": "Custom fields on candidate profiles",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "Additional Candidate Info lets you add custom fields to candidate profiles to capture data specific to your hiring process. Fields can be used for filtering and reporting.",
    "howItWorks": "Enable the add-on in your admin settings. Go to Settings > Additional Candidate Information. Create custom fields (text, dropdown, date, etc.). These fields appear on candidate profiles for recruiters to fill in, and can be used in filters and reports.",
    "doNotSay": [],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "candidates",
      "custom-fields",
      "data"
    ],
    "implementationNotes": "FREE add-on. Adds extra data fields to candidate profiles beyond the default fields. Configured in Settings. Fields appear on the candidate card and can be used in filters and exports.",
    "prospectQA": [
      {
        "q": "Can we add custom fields to candidate profiles?",
        "a": "Yes — Additional Candidate Info adds extra data fields. For fully custom fields, see the Custom Fields feature."
      }
    ],
    "searchAliases": [
      "extra fields",
      "candidate data",
      "profile fields",
      "additional data"
    ]
  },
  {
    "id": "custom-reject-reasons",
    "category": "other",
    "title": "Custom Reject Reasons",
    "subtitle": "Configurable rejection reason categories",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "Custom Reject Reasons lets you define your own rejection reason categories beyond the defaults. This improves data quality in rejection analytics and ensures consistent rejection tracking.",
    "howItWorks": "Enable the add-on. Go to Settings > Reject Reasons. Create custom reasons (e.g., 'No MI License', 'Out of Territory', 'Overqualified'). When rejecting candidates, recruiters select from your custom list. Rejection reasons appear in analytics and reports.",
    "doNotSay": [
      "Do NOT say reasons are only for company rejections — also tracks candidate withdrawals"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/3339416-reject-reasons",
    "apiEndpoint": "/v1/reject-reasons",
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "rejections",
      "analytics",
      "custom"
    ],
    "apiNotes": "POST /v1/reject-reasons to create. Attributes: reason (text), rejected-by-company (boolean — distinguishes company rejection vs candidate withdrawal).",
    "implementationNotes": "Configure at Settings → Recruitment → Reject reasons. Two categories: 'Rejected by us' and 'Rejected by the candidate'. Default reasons provided plus custom additions. Rejection emails can be automated via Message templates. Co-pilot can draft personalized rejection emails. Analytics under Analytics → Recruitment.",
    "prospectQA": [
      {
        "q": "Can we track why candidates withdraw?",
        "a": "Yes — two categories: 'Rejected by us' and 'Rejected by the candidate'. Both feed into analytics for trend spotting."
      },
      {
        "q": "Can we report on rejection data?",
        "a": "Yes — Analytics → Recruitment and per-job breakdowns in Jobs report."
      }
    ],
    "searchAliases": [
      "rejection reasons",
      "decline reasons",
      "candidate withdrawal",
      "disqualification"
    ]
  },
  {
    "id": "job-offers",
    "category": "other",
    "title": "Job Offers",
    "subtitle": "Digital offer letter creation and tracking",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "Job Offers enables creating and sending digital offer letters to candidates directly from Teamtailor. Track offer status (sent, viewed, accepted, declined) and maintain a record of all offers.",
    "howItWorks": "Enable the Job Offers add-on. When ready to extend an offer, create it from the candidate's profile. Use templates or build custom offers. Send the offer digitally. Track when the candidate views, accepts, or declines. The offer history is maintained on the candidate's profile.",
    "doNotSay": [
      "Do NOT say e-signing is included by default — must be enabled",
      "Do NOT say offer approvals are on all plans — enterprise add-on",
      "Do NOT say TT is a full contract management system — integrates with Oneflow for that"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/6056388-send-job-offers-to-candidates",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "offers",
      "hiring",
      "digital"
    ],
    "apiNotes": "GET /v1/job-offers/{id} available. Includes salary, status, timestamps. Accessible as candidate/job-application relationship data.",
    "implementationNotes": "Create from candidate card: ⋮ → 'Create job offer'. If Approval Flows enabled, approvers listed at bottom. E-signing available for candidate signature on offer page. Control which team members can view offer details (default: recruiter + Company Admin). Integrates with Oneflow for contract management. Approval Flows are enterprise add-on.",
    "prospectQA": [
      {
        "q": "Can candidates e-sign offers?",
        "a": "Yes — when e-signing is enabled, candidates sign directly on the job offer page via email link."
      },
      {
        "q": "Who sees offer details?",
        "a": "You control access. Default: job recruiter and Company Admins only — keeping salary data confidential."
      }
    ],
    "searchAliases": [
      "offer letters",
      "offer management",
      "e-signing",
      "digital signatures",
      "Oneflow"
    ]
  },
  {
    "id": "e-signature",
    "category": "other",
    "title": "E-signature",
    "subtitle": "Electronic signatures for offer letters and documents",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "E-signature enables electronic signing of offer letters and other recruitment documents. Candidates can sign digitally without printing, scanning, or mailing. Also included free with the paid Onboarding add-on.",
    "howItWorks": "Enable the E-signature add-on (free). When sending a job offer or document, include the e-signature option. The candidate receives the document with a signing prompt. They review and sign electronically. The signed document is stored on the candidate's profile.",
    "doNotSay": [
      "Don't confuse with the paid Onboarding add-on — E-signature itself is free. It's also bundled with Onboarding if that add-on is purchased.",
      "Don't claim it meets advanced or qualified e-signature standards — it's Simple Electronic Signatures per eIDAS only.",
      "Do NOT say native e-signature is a full contract management platform — it's for job offers and onboarding documents only",
      "Do NOT claim it replaces DocuSign for complex multi-party signing workflows",
      "Do NOT say third-party e-sign integrations are included — they require Marketplace activation and separate subscriptions"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/11290403-enable-e-signing-for-documents-in-teamtailor",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "e-signature",
      "offers",
      "documents"
    ],
    "implementationNotes": "Company Admin activates native e-signature in Add-on feature center. When creating a job offer, toggle 'Make job offer signable' (enabled by default). For onboarding, add signable documents (NDAs, policies) to new hire's onboarding dashboard. Signed documents auto-stored on candidate card. Third-party integrations available via Marketplace: DocuSign, Signaturit, Assently, Penneo, Signeasy, Scrive. Stage-based Triggers can auto-send documents when candidates reach specific stages.",
    "prospectQA": [
      {
        "q": "Does TT have built-in e-signatures?",
        "a": "Yes — native e-signature for job offers and onboarding docs. Also integrates with DocuSign, Signaturit, Scrive, and others via the Marketplace."
      },
      {
        "q": "Can we auto-send documents at a specific stage?",
        "a": "Yes — set up Triggers tied to recruitment stages to auto-send documents for signature."
      },
      {
        "q": "Where are signed documents stored?",
        "a": "Automatically stored on the candidate's card in Teamtailor."
      }
    ],
    "searchAliases": [
      "e-sign",
      "electronic signature",
      "digital signature",
      "document signing",
      "DocuSign",
      "Scrive",
      "signable offers",
      "contract signing"
    ]
  },
  {
    "id": "nps",
    "category": "analytics",
    "title": "NPS",
    "subtitle": "Net Promoter Score surveys for candidates",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "NPS (Net Promoter Score) measures candidate satisfaction with your recruitment process. Automated surveys ask candidates how likely they are to recommend your company, providing a standardized satisfaction metric.",
    "howItWorks": "Enable the NPS add-on. Configure when NPS surveys are sent (e.g., after application, after interview, after rejection). Candidates receive a simple 0-10 rating question. Results are aggregated into an NPS score visible in your analytics dashboard.",
    "doNotSay": [
      "Do NOT say NPS is enabled by default — requires activation",
      "Do NOT say it auto-sends out of the box — need to set up Triggers for automation",
      "Do NOT say it provides full CSAT surveys — it's specifically the standard NPS methodology"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/2636869-track-and-improve-your-candidate-experience-with-nps",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "analytics",
      "nps",
      "candidate-experience",
      "surveys"
    ],
    "apiNotes": "Limited API access. NPS responses may be accessible via activity/audit endpoints but there's no dedicated NPS API.",
    "implementationNotes": "Activate in Add-on feature center. Send manually (candidate → ⋮ → Send NPS survey), in bulk, or automatically via Triggers. For multi-application candidates, choose which job to associate. Responses on candidate profile under 'Net Promoter Score'. Aggregated data in Analytics and Jobs report (NPS Score & Comments section).",
    "prospectQA": [
      {
        "q": "Can we automate NPS delivery?",
        "a": "Yes — set up Triggers on pipeline stages to auto-send when candidates reach specific stages (e.g., rejection, hired)."
      },
      {
        "q": "How do we analyze results?",
        "a": "On individual candidate profiles and aggregated in Analytics. Jobs report has NPS Score & Comments section."
      }
    ],
    "searchAliases": [
      "Net Promoter Score",
      "candidate experience",
      "candidate satisfaction",
      "candidate feedback"
    ]
  },
  {
    "id": "candidate-interaction",
    "category": "analytics",
    "title": "Candidate Interaction",
    "subtitle": "Track candidate engagement with emails and career site",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "Candidate Interaction tracks how candidates engage with your emails and career site. See when candidates open emails, click links, and visit your career pages — giving recruiters insights into candidate interest levels.",
    "howItWorks": "Enable the add-on. Email open/click tracking is automatic for messages sent through Teamtailor. Career site visit data is captured when candidates browse your pages. Interaction data appears on individual candidate profiles and in aggregate analytics.",
    "doNotSay": [
      "Don't claim real-time tracking — there may be slight delays in interaction logging"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "analytics",
      "engagement",
      "tracking",
      "email"
    ],
    "implementationNotes": "FREE add-on. Tracks all candidate interactions (page views, email opens, link clicks) and displays engagement timeline on the candidate profile. Helps recruiters gauge candidate interest level.",
    "prospectQA": [
      {
        "q": "Can we see if a candidate opened our email?",
        "a": "Yes — Candidate Interaction tracks email opens, link clicks, and career site page views on each candidate's profile."
      }
    ],
    "searchAliases": [
      "email tracking",
      "candidate engagement",
      "open tracking",
      "interaction history"
    ]
  },
  {
    "id": "nurture-campaigns",
    "category": "communication",
    "title": "Nurture (Email Campaigns)",
    "subtitle": "Automated email sequences for talent pool engagement",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "Nurture enables automated email campaign sequences to engage candidates in your talent pool over time. Keep passive candidates warm with scheduled, personalized email drips until the right role opens.",
    "howItWorks": "Enable the Nurture add-on. Create email campaign sequences with multiple touchpoints. Define the target audience from your candidate database. Set timing between emails. The system automatically sends the sequence and tracks opens, clicks, and replies.",
    "doNotSay": [
      "Do NOT say campaigns support SMS/WhatsApp — email-only sequences",
      "Do NOT say it's available to all user roles — only Company/Recruitment Admins",
      "Do NOT promise A/B testing or lead scoring — it's a straightforward drip sequence builder"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/3439466-set-up-email-campaigns-with-nurture",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "communication",
      "email",
      "campaigns",
      "talent-pool"
    ],
    "apiNotes": "NOT available via API. No endpoints for campaign management or enrollment. Nurture is UI-only.",
    "implementationNotes": "Enable at Settings → Nurture (toggle ON). Create campaigns with email touchpoints and wait times (drag-and-drop). Each email: subject, sender (any user), body, type (plain text or branded), send time (account timezone). Automate enrollment via Triggers: stage → Triggers → 'Add to nurture campaign'. Only Company/Recruitment Admins see the Nurture tab.",
    "prospectQA": [
      {
        "q": "Can we auto-enroll candidates?",
        "a": "Yes — set up Triggers so candidates auto-enroll in a nurture campaign when they reach a specific stage."
      },
      {
        "q": "Can emails be branded?",
        "a": "Yes — each email can be 'Branded' (company logo/colors) or 'Plain text' for a personal feel."
      }
    ],
    "searchAliases": [
      "drip campaigns",
      "email sequences",
      "candidate nurturing",
      "email automation",
      "talent CRM"
    ]
  },
  {
    "id": "team-stories",
    "category": "career-site",
    "title": "Team Stories",
    "subtitle": "Employee-generated content for career site",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "Team Stories lets employees create and share their own stories, photos, and videos directly on your career site. It builds authentic employer branding by showcasing real employee voices and experiences.",
    "howItWorks": "Enable the Team Stories add-on. Invite employees to contribute via their Teamtailor login. Employees write stories, upload photos, or record short videos. Content is moderated by admins before publishing. Published stories appear on your career site in a dedicated section.",
    "doNotSay": [
      "Do NOT say it works from desktop — employees must use the TT mobile app to create stories",
      "Do NOT say stories are auto-moderated — admins manually manage content",
      "Do NOT confuse Team Stories with Testimonials — Stories are mobile-first/informal, Testimonials are curated career site blocks"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/7176287-team-stories",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "career-site",
      "branding",
      "employee-content"
    ],
    "implementationNotes": "Activate in Add-on feature center. Employees use the TT mobile app to capture photos/short videos, add caption, and publish. Displayed on career site and/or internal Connect dashboard. Admins manage/edit/delete content. Separate from 'Testimonial' content blocks in the career site editor.",
    "prospectQA": [
      {
        "q": "How do employees create stories?",
        "a": "Via the TT mobile app — capture photos/videos, add captions, publish. Shows on your career site."
      },
      {
        "q": "Can we control what gets published?",
        "a": "Yes — admins can manage, edit, or delete any story and control where it's displayed."
      }
    ],
    "searchAliases": [
      "employee stories",
      "employer branding",
      "culture content",
      "employee testimonials"
    ]
  },
  {
    "id": "transparent-recruiting",
    "category": "career-site",
    "title": "Transparent Recruiting",
    "subtitle": "Show candidates your hiring process steps",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "Transparent Recruiting displays your hiring process steps publicly on job postings so candidates know exactly what to expect. It builds trust and reduces drop-off by setting clear expectations upfront.",
    "howItWorks": "Enable the add-on. Configure the hiring process steps you want to display (e.g., Application → Phone Screen → Interview → Offer). These steps appear on your career site job listings, giving candidates visibility into where they are in the process.",
    "doNotSay": [
      "Do NOT say candidates see specific stage names — they only see generic status",
      "Do NOT say it retroactively applies to existing jobs — must be manually enabled",
      "Do NOT promise real-time notifications — candidates must log in to check"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/4967420-transparent-recruitment",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "career-site",
      "transparency",
      "candidate-experience"
    ],
    "implementationNotes": "Activate in Add-on feature center. Auto-applies to ALL new jobs. Candidates see simplified statuses: 'In progress', 'Hired', or 'Rejected' — NOT specific stage names. For pre-existing jobs, manually enable via heart icon. If delayed reject email is configured, 'Rejected' not shown until email sent.",
    "prospectQA": [
      {
        "q": "What can candidates see?",
        "a": "Three simplified statuses: 'In progress', 'Hired', or 'Rejected'. No internal pipeline details visible."
      },
      {
        "q": "Can we turn it off for specific jobs?",
        "a": "Yes — disable per-job by unchecking the heart icon in job settings."
      }
    ],
    "searchAliases": [
      "application tracking",
      "candidate portal",
      "status updates",
      "candidate transparency"
    ]
  },
  {
    "id": "career-site-widgets",
    "category": "career-site",
    "title": "Career Site Widgets",
    "subtitle": "Embeddable job listing widgets for external sites",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "Career Site Widgets let you embed job listings on your main company website or other web properties. Visitors can browse and apply to jobs without leaving your corporate site.",
    "howItWorks": "Enable the add-on. Go to Settings > Career Site Widgets. Configure the widget appearance and which jobs to display. Copy the embed code. Paste it into your company website's HTML. The widget displays your live job listings and links to application forms.",
    "doNotSay": [
      "Do NOT say TT installs the widget — customer's web team handles the embed",
      "Do NOT claim deep visual customization — for that, use the API"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/129677-integrate-a-job-list-widget",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "career-site",
      "widgets",
      "embed"
    ],
    "implementationNotes": "Settings → Integrations → Widgets → 'Job list widget'. Configure job feed, filters (department, location, language), pagination. Copy generated <script> tag and paste into your external website HTML. Also available: Career Button Widget (floating button) and Hiring Widget (badge/banner). Customer's web team handles installation.",
    "prospectQA": [
      {
        "q": "Can we show TT jobs on our existing website?",
        "a": "Yes — paste the generated script tag into your site's HTML. Configure which jobs show, filters, and pagination."
      },
      {
        "q": "What if we need a custom design?",
        "a": "Use the Teamtailor API for fully custom job listing experiences on your site."
      }
    ],
    "searchAliases": [
      "job widget",
      "embed jobs",
      "website integration",
      "hiring widget",
      "career button"
    ]
  },
  {
    "id": "sso",
    "category": "other",
    "title": "SSO (Single Sign-On)",
    "subtitle": "SAML-based single sign-on authentication",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "notion-export",
    "whatItDoes": "SSO enables SAML-based single sign-on so team members can log into Teamtailor using their organization's identity provider (Okta, Azure AD, Google Workspace, etc.). Reduces password fatigue and improves security.",
    "howItWorks": "Enable the SSO add-on. Configure your identity provider's SAML settings in Teamtailor admin. Set up the SAML connection (entity ID, SSO URL, certificate). Team members can then log in using their corporate credentials. Supports multi-SSO for organizations with multiple identity providers.",
    "doNotSay": [
      "Do NOT say SSO is one-click — requires metadata exchange and Name-ID format configuration",
      "Do NOT claim any auth protocol — TT supports SAML 2.0 specifically",
      "Do NOT say multi-domain SSO is self-service — requires CSM involvement",
      "Do NOT promise SSO auto-provisions accounts — that requires SCIM separately"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "security",
      "sso",
      "authentication",
      "saml"
    ],
    "implementationNotes": "Settings → Security → Single sign-on. Copy Entity ID and ACS URL into your IdP. From IdP, get Sign-in URL and Signing Certificate (Base64). Upload metadata file or enter metadata URL. Name-ID format: persistent. Tested with: Microsoft Entra ID, Okta, Google Apps, OneLogin. For multiple domains or child accounts, contact CSM. Always test with a test user first. Service accounts (e.g., Drata) may need SSO exclusion for API access.",
    "prospectQA": [
      {
        "q": "Can we use multiple identity providers?",
        "a": "Yes — supports multiple SSOs on a single company or Group."
      },
      {
        "q": "Do all users have to use SSO?",
        "a": "No — individual users can be excluded from the SSO requirement."
      },
      {
        "q": "Does TT support SSO?",
        "a": "Yes — SAML 2.0 SSO with guides for Entra ID, Okta, Google Apps, and OneLogin. Any SAML 2.0 IdP should work."
      },
      {
        "q": "Does SSO handle user provisioning too?",
        "a": "No — SSO handles authentication only. For auto-provisioning/deprovisioning, configure SCIM separately."
      }
    ],
    "apiNotes": "SSO configuration is UI-only. No API endpoints for SAML/SSO setup. Supports multiple SSOs per company/Group.",
    "searchAliases": [
      "SSO",
      "single sign-on",
      "SAML",
      "federated login",
      "Azure AD",
      "Okta login",
      "Google SSO",
      "OneLogin",
      "enterprise login"
    ]
  },
  {
    "id": "two-factor-auth",
    "category": "other",
    "title": "Two-Factor Authentication",
    "subtitle": "2FA for enhanced account security",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "Two-Factor Authentication adds an extra layer of security to Teamtailor logins. Users must provide a second verification factor (authenticator app code) in addition to their password.",
    "howItWorks": "Enable the 2FA add-on at the account level. Individual users set up 2FA in their profile settings by scanning a QR code with an authenticator app. On each login, they enter their password plus the time-based code from their authenticator.",
    "doNotSay": [],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "security",
      "2fa",
      "authentication"
    ],
    "implementationNotes": "FREE feature (not even an add-on). Per-user activation in user settings. Supports authenticator apps (Google Authenticator, Authy, etc.). Company Admins can enforce 2FA for all users via Settings.",
    "prospectQA": [
      {
        "q": "Do you support MFA/2FA?",
        "a": "Yes — 2FA is free and supports authenticator apps. Admins can enforce it company-wide."
      }
    ],
    "searchAliases": [
      "MFA",
      "multi-factor",
      "two-step",
      "authenticator",
      "2FA"
    ]
  },
  {
    "id": "audit-log",
    "category": "other",
    "title": "Audit Log",
    "subtitle": "Activity tracking for compliance and security",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "notion-export",
    "whatItDoes": "Audit Log records all user actions in Teamtailor for compliance and security review. 30 days of history is included free. Extended retention (beyond 30 days) is available as a paid add-on at $60/month.",
    "howItWorks": "The Audit Log is available in your admin settings. View a chronological record of all actions taken by users (logins, data changes, exports, etc.). Filter by user, action type, or date range. 30 days of data is retained by default; extended retention requires the paid upgrade.",
    "doNotSay": [
      "Don't say Audit Log is entirely free — 30 days is free, but extended retention costs $60/month."
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/2668826-audit-log",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "security",
      "audit",
      "compliance",
      "gdpr"
    ],
    "implementationNotes": "30 days FREE. Extended beyond 30 days: $60/month. Tracks all user actions: logins, data changes, exports, etc.",
    "apiNotes": "GET /v1/audit-events available. System-level change logs tracking who did what. 30 days free, extended at $60/month."
  },
  {
    "id": "location-data-privacy",
    "category": "other",
    "title": "Location-based Data & Privacy",
    "subtitle": "Region-specific data handling and consent",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "Location-based Data & Privacy provides region-specific data handling rules and consent management. It ensures candidate data is processed according to local regulations (GDPR, CCPA, etc.) based on the candidate's or company's location.",
    "howItWorks": "Enable the add-on in admin settings. Configure data handling rules for different regions. The system automatically applies the appropriate consent forms, data retention policies, and privacy notices based on location. Ensures compliance with regional data protection regulations.",
    "doNotSay": [
      "Don't claim this handles all global compliance requirements — it manages consent periods and data retention per location"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "security",
      "privacy",
      "gdpr",
      "compliance"
    ],
    "implementationNotes": "Privacy Managers designated at Settings → Company → General. Automatic Data Deletion rules: Settings → Data & Privacy → Automatic data deletion. Criteria: inactive, rejected, removal request, no storage permission. One-week grace period before permanent deletion. Candidate self-service: data copy request, deletion request, permission management via career site. GDPR-compliant by default in EU regions.",
    "prospectQA": [
      {
        "q": "Can we set different privacy rules per country?",
        "a": "Yes — Location-based Data & Privacy lets you configure consent periods and data retention rules per location/jurisdiction."
      }
    ],
    "searchAliases": [
      "GDPR",
      "data privacy",
      "consent management",
      "data retention",
      "privacy rules"
    ]
  },
  {
    "id": "linkedin-rsc",
    "category": "integrations",
    "title": "LinkedIn RSC",
    "subtitle": "LinkedIn Recruiter System Connect integration",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "LinkedIn RSC (Recruiter System Connect) provides a deep integration between Teamtailor and LinkedIn Recruiter. It syncs InMail history, shows LinkedIn profile data in Teamtailor, and enables 1-click candidate export from LinkedIn Recruiter to Teamtailor.",
    "howItWorks": "Enable the LinkedIn RSC add-on (requires an active LinkedIn Recruiter license). Connect via the integration settings. Once connected, InMail conversations sync to candidate profiles in Teamtailor, and you can push candidates from LinkedIn Recruiter directly into Teamtailor jobs.",
    "doNotSay": [
      "Do NOT say it works with LinkedIn free/Premium — requires LinkedIn Recruiter (separate paid product)",
      "Do NOT say you can send InMails from TT — you VIEW history, send from LinkedIn",
      "Do NOT say full profiles sync — basic profile info only"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/4492408-partner-linkedin-rsc",
    "apiEndpoint": null,
    "plans": [
      "enterprise"
    ],
    "addOn": true,
    "tags": [
      "integrations",
      "linkedin",
      "recruiter"
    ],
    "apiNotes": "Partner integration — uses separate Partner API with webhook callbacks. Not part of the main v1 REST API.",
    "implementationNotes": "Requires Admin in BOTH TT and LinkedIn Recruiter. Setup: TT Marketplace → LinkedIn RSC → Activate → authorize via LinkedIn → configure in LinkedIn Recruiter → Product Settings → ATS tab. Benefits: view InMail history in TT, 'In-ATS' indicator in LinkedIn for existing candidates, export basic profile info.",
    "prospectQA": [
      {
        "q": "What does RSC actually do?",
        "a": "View InMail history in TT, see 'In-ATS' badge in LinkedIn for existing candidates, export basic profile data."
      },
      {
        "q": "Do we need LinkedIn Recruiter?",
        "a": "Yes — RSC requires LinkedIn Recruiter. Doesn't work with free/Premium/Sales Navigator."
      }
    ],
    "searchAliases": [
      "LinkedIn Recruiter",
      "Recruiter System Connect",
      "InMail",
      "LinkedIn sourcing"
    ]
  },
  {
    "id": "internal-recruitment",
    "category": "other",
    "title": "Internal Recruitment",
    "subtitle": "Internal job board for current employees",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "Internal Recruitment creates a separate internal job board visible only to current employees. It enables internal mobility by letting employees browse and apply for open positions before they're posted externally.",
    "howItWorks": "Enable the add-on. When creating a job, mark it as 'internal' to restrict visibility to employees only. Employees access the internal job board via a separate login or SSO. Internal applications are tracked separately in the pipeline. Jobs can later be opened externally if needed.",
    "doNotSay": [
      "Do NOT say there's a separate internal portal — internal jobs shared via link and Employee Dashboard",
      "Do NOT claim auto-detection is 100% — some candidates may need manual labeling"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/1575132-manage-internal-recruitment",
    "apiEndpoint": null,
    "plans": [
      "enterprise"
    ],
    "addOn": true,
    "tags": [
      "internal",
      "mobility",
      "employees"
    ],
    "implementationNotes": "Toggle house icon when creating/editing a job to publish internally only. TT auto-detects internal candidates if they: apply via Employee Dashboard, use email matching Auto-join domain, or apply through internal link. Can also manually label candidates as internal. Analytics available for internal hiring.",
    "prospectQA": [
      {
        "q": "Can we post jobs visible only to employees?",
        "a": "Yes — toggle the house icon for internal-only posting. Share via Employee Dashboard or direct link."
      },
      {
        "q": "Can we track internal hiring separately?",
        "a": "Yes — TT provides analytics specifically for internal recruitment."
      }
    ],
    "searchAliases": [
      "internal jobs",
      "internal posting",
      "internal mobility",
      "employee-only jobs"
    ]
  },
  {
    "id": "webhooks",
    "category": "integrations",
    "title": "Webhooks",
    "subtitle": "Real-time event notifications to external systems",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "Webhooks send real-time HTTP notifications to external systems when events occur in Teamtailor (e.g., new application, candidate moved, job published). They enable custom integrations without polling the API.",
    "howItWorks": "Enable the Webhooks add-on. Configure webhook endpoints in Settings > Webhooks. Specify which events should trigger notifications (candidate created, stage changed, job published, etc.). Teamtailor sends an HTTP POST to your endpoint with event data whenever the specified events occur.",
    "doNotSay": [
      "Do NOT say webhooks support any protocol — endpoints must be secure HTTPS",
      "Do NOT confuse Company Webhooks with Partner Webhooks — different systems",
      "Do NOT say setup requires no technical knowledge — needs endpoint configuration and HMAC verification"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/8068954-company-webhooks",
    "apiEndpoint": "/v1/webhooks",
    "plans": [
      "enterprise"
    ],
    "addOn": true,
    "tags": [
      "integrations",
      "webhooks",
      "api",
      "automation"
    ],
    "apiNotes": "Configured in UI only (Settings → Integrations → Webhooks). Event pattern: resource_name.action (e.g. candidate.create, candidate.update). Supported resources: Candidates, Jobs, Job Applications, Audit Events. Signature key provided for payload verification.",
    "implementationNotes": "Activate Company Webhooks in Add-on feature center. Settings → Webhooks → New Webhook. Provide label, secure HTTPS endpoint URL, select event types (candidate updates, application creations, audit events). TT generates Webhook ID and Signature Key. Verify payloads via HMAC SHA256. Company Webhooks are for internal integrations; Partner Webhooks use separate Partner API process.",
    "prospectQA": [
      {
        "q": "Can TT send real-time notifications to our systems?",
        "a": "Yes — Company Webhooks send HTTPS POST payloads for events like candidate updates and new applications. Each includes a signature key for HMAC SHA256 verification."
      },
      {
        "q": "What events can we subscribe to?",
        "a": "Candidate updates, job application creations, audit events, and more. Select specific events during webhook configuration."
      }
    ],
    "searchAliases": [
      "webhook",
      "API callback",
      "event notifications",
      "real-time integration",
      "HTTP callback",
      "payload notifications"
    ]
  },
  {
    "id": "bi-connector",
    "category": "analytics",
    "title": "BI Connector",
    "subtitle": "Business intelligence data export ($1,700/year)",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "notion-export",
    "whatItDoes": "The BI Connector exports Teamtailor recruitment data to external business intelligence tools (Tableau, Power BI, Looker, etc.). It enables advanced analytics, custom dashboards, and cross-system reporting beyond what's available natively.",
    "howItWorks": "Request BI Connector activation through your CSM (paid add-on at $1,700/year). Once enabled, configure the data connection to your BI tool. Recruitment data is available for querying and visualization in your BI platform.",
    "doNotSay": [
      "Don't say it's free — BI Connector is a paid enterprise add-on at $1,700/year.",
      "Don't promise setup support — TT cannot assist with technical setup or customization. The fee covers development/maintenance only.",
      "Only recommend to customers who ALREADY have a BI system AND someone who knows how to use it.",
      "Don't say data is real-time — it refreshes nightly between 01:00-08:00 UTC only.",
      "Don't promise TT will help build reports — customer needs own BI expertise."
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/4261798-bi-connector-overview",
    "apiEndpoint": null,
    "plans": [
      "enterprise"
    ],
    "addOn": true,
    "tags": [
      "analytics",
      "bi",
      "data-export",
      "enterprise"
    ],
    "implementationNotes": "$1,700/yr. PostgreSQL-based read-only analytical database. Data refreshed NIGHTLY only (01:00-08:00 UTC). Customer MUST have their own BI tool (Power BI, Tableau, Looker) + SQL expertise. Third-party alternatives: Coupler.io, BI Book (pre-built Power BI connector with templates).",
    "prospectQA": [
      {
        "q": "Can we connect to Power BI/Tableau?",
        "a": "Yes via SQL connector. Power BI on Windows has documented setup."
      },
      {
        "q": "Will you help us set it up?",
        "a": "We provide documentation but setup requires your own BI expertise. The fee covers maintaining the connector infrastructure."
      },
      {
        "q": "Do we need technical staff?",
        "a": "Yes — this is designed for teams with existing BI capability. If you don't have that, our built-in Analytics and Co-pilot Reports may be a better fit."
      }
    ],
    "apiNotes": "Separate from the REST API. BI Connector uses SQL access to a read-only analytical database. Requires own BI tool (Power BI, Tableau, etc.)."
  },
  {
    "id": "enterprise-calendar",
    "category": "scheduling",
    "title": "Enterprise Calendar",
    "subtitle": "Advanced calendar management ($1,400/year)",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "Enterprise Calendar provides advanced calendar management features beyond the standard calendar sync. It includes features like room booking, multi-interviewer coordination, and enterprise-grade calendar integrations.",
    "howItWorks": "Request activation through your CSM (paid add-on at $1,400/year). Once enabled, configure advanced calendar settings including room resources, multi-interviewer scheduling rules, and enterprise calendar provider connections.",
    "doNotSay": [
      "Don't say it's free — Enterprise Calendar is a paid add-on at $1,400/year.",
      "Do NOT say it's included — paid add-on",
      "Do NOT say standard sync and Enterprise Calendar are the same — standard is individual, Enterprise is org-wide admin-managed",
      "Do NOT say users manage their own connection — centrally admin-controlled"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/5355272-enterprise-calendar",
    "apiEndpoint": null,
    "plans": [
      "enterprise"
    ],
    "addOn": true,
    "tags": [
      "scheduling",
      "calendar",
      "enterprise"
    ],
    "implementationNotes": "PAID add-on. Powered by Cronofy. Lets Company Admins centrally connect all users' calendars at once. Supports Office 365/Exchange (Microsoft Graph API or EWS) and Google Workspace. When enabled, individual users can't disconnect — admin-controlled. Different from standard calendar sync (individual setup).",
    "prospectQA": [
      {
        "q": "How is it different from standard calendar?",
        "a": "Standard requires each user to connect individually. Enterprise Calendar lets an admin connect all users at once via service account — centrally managed."
      },
      {
        "q": "Does it need IT involvement?",
        "a": "Typically yes — IT may need to set up Azure AD authorization or install the Cronofy app in Google Workspace."
      }
    ],
    "searchAliases": [
      "calendar sync",
      "Cronofy",
      "Office 365 calendar",
      "centralized calendar"
    ]
  },
  {
    "id": "job-offer-approvals",
    "category": "other",
    "title": "Job Offer Approvals",
    "subtitle": "Approval workflows for offer letters ($1,400/year)",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "Job Offer Approvals adds an approval workflow to the offer process. Before an offer letter is sent to a candidate, it must be reviewed and approved by designated approvers (e.g., HR director, VP, compensation team).",
    "howItWorks": "Request activation through your CSM (paid add-on at $1,400/year). Configure approval chains in settings. When a recruiter creates an offer, it's routed to the designated approvers. Approvers review and approve or reject. Only approved offers can be sent to candidates.",
    "doNotSay": [
      "Don't say it's free — Job Offer Approvals is a paid add-on at $1,400/year.",
      "Do NOT say it's on all plans — enterprise add-on",
      "Do NOT confuse with Requisitions — those approve job creation, this approves offer sending"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/6514059-job-offer-approval-flows",
    "apiEndpoint": null,
    "plans": [
      "enterprise"
    ],
    "addOn": true,
    "tags": [
      "offers",
      "approvals",
      "enterprise"
    ],
    "implementationNotes": "Enterprise add-on. Settings → Recruitment → Job offer approvals → toggle ON. Set Default flows or Custom flows (by department/role/location). Approval steps: require 'All' or 'Any' member. Approvers notified, can approve/reject with feedback. Once approved, offer auto-sends to candidate. Don't confuse with Requisitions (pre-job approval) — this is pre-offer approval.",
    "prospectQA": [
      {
        "q": "Can we set different approval flows per department?",
        "a": "Yes — custom flows by department, role, or location, plus a default fallback flow."
      },
      {
        "q": "How does this differ from Requisitions?",
        "a": "Requisitions approve job creation (headcount). Offer Approvals approve offer sending (compensation/terms)."
      }
    ],
    "searchAliases": [
      "offer approval workflow",
      "approval chain",
      "compensation approval",
      "manager approval"
    ]
  },
  {
    "id": "group-analytics",
    "category": "analytics",
    "title": "Group Analytics",
    "subtitle": "Cross-company analytics for multi-entity organizations",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "Group Analytics provides aggregated reporting across multiple Teamtailor company accounts. Organizations with multiple entities, subsidiaries, or brands can view consolidated recruitment metrics in a single dashboard.",
    "howItWorks": "Activated by your CSM for organizations with multiple Teamtailor accounts. Once enabled, a group-level analytics dashboard provides aggregated metrics across all connected accounts. View consolidated hiring data, pipeline metrics, and performance comparisons between entities.",
    "doNotSay": [
      "Don't say this is available to single-account customers — it requires multiple Teamtailor company accounts.",
      "Don't quote a specific price — Group Analytics pricing is handled by CSM and varies by Group size"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "enterprise"
    ],
    "addOn": true,
    "tags": [
      "analytics",
      "enterprise",
      "multi-entity",
      "group"
    ],
    "implementationNotes": "PAID add-on (pricing via CSM). Provides analytics across multiple TT accounts in a Group structure (multi-brand or multi-entity companies). Aggregates hiring metrics across all child accounts.",
    "prospectQA": [
      {
        "q": "Can we see analytics across all our brands/entities?",
        "a": "Yes — Group Analytics aggregates hiring data across multiple TT accounts for consolidated reporting."
      }
    ],
    "searchAliases": [
      "multi-account analytics",
      "consolidated reporting",
      "group reporting",
      "enterprise analytics"
    ]
  },
  {
    "id": "divisions",
    "category": "other",
    "title": "Divisions",
    "subtitle": "Segment your account by business unit or brand",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "Divisions lets you segment a single Teamtailor account into separate business units, brands, or divisions. Each division can have its own career site, branding, and user permissions while sharing one account.",
    "howItWorks": "Activated by your CSM. Create divisions representing your business units or brands. Assign jobs, users, and career site content to specific divisions. Each division operates semi-independently with its own branding and permissions, but data is shared at the account level for reporting.",
    "doNotSay": [
      "Don't confuse with Group Analytics (multi-account) — Divisions segments within a single account."
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/10942490-work-with-our-divisions-feature",
    "apiEndpoint": null,
    "plans": [
      "enterprise"
    ],
    "addOn": true,
    "tags": [
      "enterprise",
      "organization",
      "multi-brand"
    ],
    "apiNotes": "Mapped to departments in the API. Divisions is a UI-level feature that groups departments. Use GET/POST /v1/departments.",
    "implementationNotes": "Functions as a layer ABOVE Departments. Supports Division Admin role for per-division settings management. Shared across divisions: candidate database, templates, integrations, data/privacy settings. Separate per division: career site, branding, recruitment workflows. Important distinction: Divisions = single account segmented. Group = multiple independent accounts linked for cross-account reporting."
  },
  {
    "id": "recordable-meetings",
    "category": "screening-ai",
    "title": "Recordable Meetings",
    "subtitle": "Video meeting recording within Teamtailor",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "notion-export",
    "whatItDoes": "Recordable Meetings enables recording video meetings held in Teamtailor's own video meeting solution. Required for Co-pilot Meeting Insights features (Video Meeting Summary and Answer Interview Kit Questions). Recording + transcript available ~10 minutes after meeting ends.",
    "howItWorks": "Enable the free add-on in admin settings. When hosting a meeting, participants join via Teamtailor's 'Join' button (not external links). The candidate receives a consent prompt before recording starts. After the meeting, recording and transcript are available within ~10 minutes.",
    "doNotSay": [
      "Candidates MUST join via Teamtailor's 'Join' button — external meeting links won't record.",
      "This add-on must be enabled before Co-pilot Meeting Insights will work.",
      "Don't forget: Recordable Meetings works with BOTH TT video AND external services (Zoom/Teams/Meet) via recording bot",
      "Don't claim instant transcription — recording + transcript takes ~10 minutes after the meeting ends"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": true,
    "tags": [
      "meetings",
      "video",
      "recording",
      "copilot"
    ],
    "implementationNotes": "FREE add-on. REQUIRES TT's built-in video meeting tool. For external services (Teams, Meet, Zoom), a recording bot joins the call automatically when Meeting Insights is activated AND calendar is connected. Generates: transcript, summary, key topics, action items, candidate sentiment. Recording + transcript available ~10 min after meeting.",
    "prospectQA": [
      {
        "q": "Does recording work with Zoom/Teams/Meet?",
        "a": "Yes! A recording bot joins your Teams, Meet, or Zoom call automatically when Meeting Insights is activated and your calendar is connected."
      },
      {
        "q": "Does the candidate know they're being recorded?",
        "a": "Yes — a consent prompt appears before recording starts."
      },
      {
        "q": "What outputs do we get?",
        "a": "Full transcript, AI-generated summary, key topics, action items, and candidate sentiment analysis."
      }
    ],
    "searchAliases": [
      "interview recording",
      "meeting recording",
      "video recording",
      "transcription",
      "meeting notes"
    ]
  },
  {
    "id": "copilot-draft-job",
    "category": "screening-ai",
    "title": "Co-pilot Draft Job Description",
    "subtitle": "AI-generated job descriptions from just a title",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "notion-export",
    "whatItDoes": "Co-pilot drafts complete job descriptions from just a job title. It matches the style of your previous job descriptions, mentions relevant skills/traits from the Evaluation step, and writes in the selected language or company default. Includes a 'Stop' button during drafting.",
    "howItWorks": "When creating or editing a job, click the Co-pilot draft button. Enter a job title. Co-pilot generates a full description matching your company's writing style. Edit as needed. Works in any language configured for your account.",
    "doNotSay": [
      "Don't claim it writes perfect job descriptions — it generates drafts that need human review and editing"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "ai",
      "copilot",
      "job-description",
      "content"
    ],
    "implementationNotes": "Part of the free Co-pilot add-on. Drafts job descriptions using previous JDs for style matching. Incorporates skills/traits from the Evaluation step. Has a \"Stop\" button during drafting. Output is editable.",
    "prospectQA": [
      {
        "q": "Can AI write our job descriptions?",
        "a": "Yes — Co-pilot drafts JDs using your company's style from previous postings. Always review and edit before publishing."
      }
    ],
    "searchAliases": [
      "AI job description",
      "auto-generate JD",
      "job ad writer",
      "job posting generator"
    ]
  },
  {
    "id": "copilot-suggest-skills",
    "category": "screening-ai",
    "title": "Co-pilot Suggest Skills & Traits",
    "subtitle": "AI-suggested evaluation criteria with weights",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "notion-export",
    "whatItDoes": "Co-pilot suggests 5 skills + 5 traits based on the job description, along with recommended weights for each. Requires the Interview Kit add-on. Created in the job ad language.",
    "howItWorks": "When setting up a job's evaluation criteria, click the Co-pilot suggest button. It analyzes the job description and recommends 5 skills and 5 traits with weights. Review and adjust as needed.",
    "doNotSay": [
      "Requires Interview Kit add-on to be enabled.",
      "Don't claim this works without Interview Kit — it requires the Interview Kit add-on to be activated"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "ai",
      "copilot",
      "skills",
      "evaluation",
      "interview-kit"
    ],
    "implementationNotes": "Part of the free Co-pilot add-on. Requires Interview Kit add-on to be active. Suggests 5 skills + 5 traits with recommended weights based on the job description. Output is in the job ad language.",
    "prospectQA": [
      {
        "q": "Can AI suggest what skills to evaluate?",
        "a": "Yes — Co-pilot analyzes the job description and suggests 5 skills + 5 traits with recommended evaluation weights."
      }
    ],
    "searchAliases": [
      "skill suggestion",
      "trait suggestion",
      "competency suggestion",
      "evaluation criteria"
    ]
  },
  {
    "id": "copilot-draft-rejection",
    "category": "screening-ai",
    "title": "Co-pilot Draft Reject Email",
    "subtitle": "AI-personalized rejection messages",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "notion-export",
    "whatItDoes": "Co-pilot drafts personalized rejection messages using: candidate name, job title, previous messages, reject reason, scores, interviews, and stage. Writes in the same language and tone as previous messages. References relative strengths/weaknesses without mentioning actual scores.",
    "howItWorks": "When rejecting a candidate, click the Co-pilot draft button. It generates a personalized rejection email based on all available context. Review and send.",
    "doNotSay": [
      "Co-pilot won't mention actual scorecard scores in rejections — it references relative strengths/weaknesses instead.",
      "Don't claim it auto-sends rejections — it drafts the email for recruiter review before sending"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "ai",
      "copilot",
      "rejection",
      "communication"
    ],
    "implementationNotes": "Part of the free Co-pilot add-on. Drafts rejection emails using candidate name, job title, previous message history (matches language & tone), reject reason, and scores. Won't mention actual score numbers but references relative strengths/weaknesses.",
    "prospectQA": [
      {
        "q": "Can AI write rejection emails?",
        "a": "Yes — Co-pilot drafts personalized rejection emails that reference the candidate's strengths while being empathetic. Always reviewed before sending."
      }
    ],
    "searchAliases": [
      "rejection email",
      "decline email",
      "reject candidate",
      "rejection template"
    ]
  },
  {
    "id": "copilot-suggest-candidates",
    "category": "screening-ai",
    "title": "Co-pilot Suggest Existing Candidates",
    "subtitle": "AI matches existing talent pool to open jobs",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "notion-export",
    "whatItDoes": "Co-pilot scans your existing candidate database and suggests matches for open jobs. Has consent handling considerations built in. Currently in beta with feedback collection for suggestion quality.",
    "howItWorks": "When viewing a job, Co-pilot surfaces candidates from your database who match the role. Review suggestions and add promising candidates to the pipeline.",
    "doNotSay": [
      "Feature is in beta — suggestion quality may vary. Feedback mechanism exists for bad suggestions.",
      "Don't promise production-ready reliability — this feature is still in BETA",
      "Don't claim it bypasses GDPR consent — only candidates with valid consent are surfaced"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "ai",
      "copilot",
      "talent-pool",
      "matching"
    ],
    "implementationNotes": "Part of the free Co-pilot add-on. Currently in BETA. Matches new jobs against existing candidate database. Has GDPR/consent considerations — only surfaces candidates with valid consent. Uses resume data and previous application history for matching.",
    "prospectQA": [
      {
        "q": "Can AI find candidates already in our database?",
        "a": "Yes — Co-pilot Suggest Existing Candidates matches new jobs against your candidate database. Currently in beta. Only surfaces candidates with valid GDPR consent."
      }
    ],
    "searchAliases": [
      "candidate matching",
      "talent rediscovery",
      "database matching",
      "candidate suggestion"
    ]
  },
  {
    "id": "data-transfers",
    "category": "integrations",
    "title": "Data Transfers Between TT Accounts",
    "subtitle": "Move candidates, jobs, and data between Teamtailor accounts",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "notion-export",
    "whatItDoes": "Transfers departments, roles, locations, users, jobs (including archived + templates), stages, applications, and candidates (with tags, notes, resumes, documents, reviews, scorecards, messages, answers, and partner results — converted to notes) between Teamtailor accounts. Can filter by specific candidates/jobs or by tag.",
    "howItWorks": "Contact Teamtailor support to initiate a transfer. Tag candidates with 'transfer_to_{subdomain}' to select specific records. After transfer, an 'import' tag is added to each candidate with a date note.",
    "doNotSay": [
      "Scorecards, messages, answers, and partner results are converted to notes during transfer — they don't maintain their original format.",
      "Don't say all data transfers perfectly — scorecards, messages, answers, and partner results all convert to NOTES and lose their structured format.",
      "Do NOT say TT supports one-click migration between accounts — no native transfer feature",
      "Do NOT claim the API has no rate limits — 50 requests per 10 seconds",
      "Do NOT promise all data transfers perfectly via CSV — complex data requires custom import or API",
      "Do NOT say data can be recovered after termination — purged after 30 days"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "integrations",
      "migration",
      "transfer",
      "data"
    ],
    "implementationNotes": "No native one-click transfer between TT accounts. Methods: (1) Standard CSV Import using TT's import template. (2) Custom Import for complex data — contact CSM ($1,000). (3) Self-Import via Public API (rate limit: 50 req/10 sec). Imported candidates added as 'Sourced' status. Export data before account termination — accounts locked on termination, data purged after 30 days. Group Solution aggregates analytics across accounts but does NOT move candidate profiles.",
    "prospectQA": [
      {
        "q": "Can we merge two TT accounts?",
        "a": "Yes via transfer — export from source, import to target. Tags and notes track what was transferred."
      },
      {
        "q": "What data comes over intact?",
        "a": "Jobs, candidates, applications, notes, resumes, documents, reviews. Scorecards and messages convert to notes (lose original format)."
      },
      {
        "q": "Can we transfer data between TT accounts?",
        "a": "No native transfer. Export as CSV and use Standard Import Template, contact CSM for custom import ($1K), or use the Public API."
      },
      {
        "q": "What happens to data if we close an account?",
        "a": "Account locked on termination, data purged after 30 days. Export everything before contract ends."
      }
    ],
    "searchAliases": [
      "data migration",
      "data export",
      "account migration",
      "CSV import",
      "account transfer",
      "bulk import",
      "candidate import"
    ]
  },
  {
    "id": "sla-addon",
    "category": "other",
    "title": "SLA",
    "subtitle": "Service Level Agreement add-on ($800/year)",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "notion-export",
    "whatItDoes": "Paid SLA add-on that provides guaranteed response times and uptime commitments for enterprise customers.",
    "howItWorks": "Request SLA activation through your CSM. Priced at $800/year.",
    "doNotSay": [
      "Don't say SLA is included — it's a paid add-on at $800/year.",
      "Don't promise specific uptime percentages without checking the current SLA terms"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "enterprise"
    ],
    "addOn": true,
    "tags": [
      "enterprise",
      "sla",
      "support"
    ],
    "implementationNotes": "PAID add-on at $800/year. Provides defined SLA terms for platform uptime and support response times. Activated by Support team. Typically requested by enterprise customers for procurement compliance.",
    "prospectQA": [
      {
        "q": "Do you offer an SLA?",
        "a": "Yes — $800/year for defined uptime and support response time guarantees. Standard monitoring (24/7 with auto-escalation) is free for all customers."
      }
    ],
    "searchAliases": [
      "service level agreement",
      "uptime guarantee",
      "support SLA",
      "enterprise SLA"
    ]
  },
  {
    "id": "custom-fields",
    "category": "other",
    "title": "Custom Fields",
    "subtitle": "Create custom data fields on candidates and jobs",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "api-exploration",
    "whatItDoes": "Custom Fields let you add structured data to candidates and jobs beyond the default fields. Supports text, date, select (dropdown), checkbox, number, email, and multi-select field types. Select fields support predefined options lists.",
    "howItWorks": "Create custom fields via Settings or API (POST /v1/custom-fields). Assign values via Custom Field Values resource. Fields can be marked as API-only (hidden from UI). Available on candidates, jobs, and job applications.",
    "doNotSay": [
      "Do NOT say custom fields sync with HRIS automatically — requires API or webhook setup",
      "Do NOT say all users see private fields — restricted to Recruitment Lead/Admin",
      "Do NOT promise unlimited custom fields without verifying plan"
    ],
    "supportDocUrl": null,
    "apiEndpoint": "POST /v1/custom-fields",
    "apiNotes": "Full API support. POST /v1/custom-fields with name, field-type, options (for Select). Values set via /v1/custom-field-values linked to candidates/jobs. Field types: Text, Date, Select, Checkbox, Number, Email, MultiSelect.",
    "implementationNotes": "Settings → Recruitment → Custom Fields. Separate tabs for Candidates and Jobs. Candidate fields: connect to application form questions for auto-population; appear on candidate card; usable for filtering/searching; can be set 'private' (Recruitment Lead/Admin only). Job fields: enable preset standard fields (Salary, Remote, Employment Type/Level) or create custom; control visibility to candidates in ads; set as required. Use 'Customize columns' icon to show/hide in list views.",
    "prospectQA": [
      {
        "q": "Can we add custom fields to track our own data?",
        "a": "Yes — 7 field types including dropdowns, multi-select, date, text, etc. Fully available via API and UI."
      },
      {
        "q": "Can integrations write to custom fields?",
        "a": "Yes — custom fields support an 'api-only' mode specifically for integration data that doesn't need to show in the UI."
      },
      {
        "q": "Can we add custom fields to candidates and jobs?",
        "a": "Yes — Settings → Recruitment → Custom Fields. Candidate fields auto-populate from application questions and are searchable/filterable."
      },
      {
        "q": "Can we make fields private?",
        "a": "Yes — candidate custom fields can be set 'private', visible only to Recruitment Lead/Admin roles."
      }
    ],
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "custom-fields",
      "configuration",
      "api",
      "data"
    ],
    "searchAliases": [
      "custom fields",
      "custom attributes",
      "candidate fields",
      "job fields",
      "metadata",
      "profile fields"
    ]
  },
  {
    "id": "team-memberships",
    "category": "other",
    "title": "Hiring Team Management",
    "subtitle": "Assign team members to jobs as hiring managers or reviewers",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "api-exploration",
    "whatItDoes": "Assign users to specific jobs as hiring team members. Controls who can see and interact with candidates for each role. Supports recruiter assignment and collaborative hiring workflows.",
    "howItWorks": "Add team members via the job settings UI or POST /v1/team-memberships (linking a user to a job). The job's primary recruiter is set via the user relationship on the job itself.",
    "doNotSay": [
      "Don't claim Hiring Managers can publish jobs — they can create ads but need higher permissions to publish"
    ],
    "supportDocUrl": null,
    "apiEndpoint": "POST /v1/team-memberships",
    "apiNotes": "POST /v1/team-memberships to add users to job hiring teams. Relationships: user + job. Job's primary recruiter set via PATCH /v1/jobs/{id} with user relationship.",
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "hiring-team",
      "collaboration",
      "permissions"
    ],
    "implementationNotes": "Manage who is on each job's hiring team. Roles include Recruiter, Hiring Manager, and Team Members. Each role has different permission levels (Hiring Managers can create ads but NOT publish). Hiring team members get notifications for their assigned jobs.",
    "prospectQA": [
      {
        "q": "Can hiring managers only see their own jobs?",
        "a": "Yes — combine Hiring Team Management with User Roles to restrict managers to only their assigned jobs."
      },
      {
        "q": "What can hiring managers do vs. recruiters?",
        "a": "6 role levels from No Access to Company Admin. Hiring Managers can create ads but NOT publish — great for governance."
      }
    ],
    "searchAliases": [
      "hiring team",
      "team management",
      "job permissions",
      "hiring manager access"
    ]
  },
  {
    "id": "candidate-notes",
    "category": "communication",
    "title": "Candidate Notes",
    "subtitle": "Add internal notes and activity tracking on candidates",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "api-exploration",
    "whatItDoes": "Add internal notes to candidate profiles for team collaboration. Notes are visible to the hiring team and provide an audit trail of interactions, feedback, and decisions.",
    "howItWorks": "Add notes via the candidate profile UI or POST /v1/notes (linking to a candidate). Activities are read-only via GET /v1/activities and provide a full history of all actions taken on a candidate.",
    "doNotSay": [],
    "supportDocUrl": null,
    "apiEndpoint": "POST /v1/notes",
    "apiNotes": "POST /v1/notes with body text + candidate relationship. Activities (read-only) via GET /v1/activities provide full candidate history. Include activities via candidate relationship includes.",
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "notes",
      "collaboration",
      "activity",
      "communication"
    ],
    "implementationNotes": "Free built-in feature. Notes appear on the candidate profile timeline. Supports @mentions to notify team members. Notes can be marked as internal (hidden from candidate-facing views). Supports rich text formatting.",
    "prospectQA": [
      {
        "q": "Can we leave notes on candidate profiles?",
        "a": "Yes — notes support @mentions, rich text, and can be marked internal. Full activity timeline on each candidate."
      }
    ],
    "searchAliases": [
      "candidate comments",
      "internal notes",
      "profile notes",
      "team notes"
    ]
  },
  {
    "id": "todos",
    "category": "other",
    "title": "Todos / Task Management",
    "subtitle": "Built-in task tracking for hiring teams",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "api-exploration",
    "whatItDoes": "Built-in task management within the platform. Create and track tasks related to hiring activities.",
    "howItWorks": "Manage todos via the platform UI. API access available at /v1/todos.",
    "doNotSay": [],
    "supportDocUrl": null,
    "apiEndpoint": "/v1/todos",
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "tasks",
      "productivity",
      "collaboration"
    ],
    "implementationNotes": "Built-in task management for recruiters. Assign to-dos to yourself or team members. Linked to specific candidates or jobs. Due dates and completion tracking. Available on the dashboard.",
    "prospectQA": [
      {
        "q": "Is there task management built in?",
        "a": "Yes — Todos let you create, assign, and track tasks linked to specific candidates or jobs with due dates."
      }
    ],
    "searchAliases": [
      "tasks",
      "to-do list",
      "task management",
      "reminders",
      "follow-up tasks"
    ]
  },
  {
    "id": "anonymous-mode",
    "category": "screening-ai",
    "title": "Anonymous Mode / Blind Recruitment",
    "subtitle": "Remove bias with pseudonymous candidate profiles",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "support-docs-audit",
    "whatItDoes": "Masks candidate names and photos with color+animal pseudonyms (e.g., 'Green Bear') to reduce unconscious bias. Can be enabled per-stage in the pipeline. Auto-redacts PII from resumes and cover letters.",
    "howItWorks": "Enable on specific pipeline stages. When a candidate is in an anonymous stage, their real identity is hidden. When they move to a non-anonymous stage, identity is revealed. Candidates are notified their application is handled anonymously on Inbox stage.",
    "doNotSay": [
      "Do NOT say it applies to the whole process — per-stage toggle only",
      "Do NOT say resume masking is 100% perfect — auto-masking 'attempts' to remove identifying info",
      "Do NOT confuse with Restricted Access — Anonymous is for bias reduction, Restricted controls data visibility"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/4967420-transparent-recruitment",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "dei",
      "bias",
      "anonymouse",
      "blind-recruitment",
      "diversity"
    ],
    "prospectQA": [
      {
        "q": "Do you support blind/anonymous hiring?",
        "a": "Yes — Anonymous Mode masks names, photos, and PII with animal pseudonyms per pipeline stage. Great for DEI initiatives."
      },
      {
        "q": "Is there a way to reduce unconscious bias?",
        "a": "Yes — our Anonymous Mode auto-redacts PII from resumes and replaces names with pseudonyms like 'Green Bear'. Enable it per stage."
      },
      {
        "q": "How does it reduce bias?",
        "a": "Masks names, emails, photos with animal names/avatars. Resumes auto-processed to remove identifying info."
      },
      {
        "q": "Can we use it for only certain stages?",
        "a": "Yes — toggle per stage. Enable for screening, disable for interviews where identity is needed."
      }
    ],
    "implementationNotes": "Enable per pipeline stage: ⋮ or cog on stage → toggle Anonymous mode. Names/emails/photos replaced with animal names/avatars. Resumes auto-masked (names/photos removed). On Inbox stage, candidates informed via application form. Real identity revealed when moving to non-anonymous stage. Separate from Restricted Access add-on.",
    "searchAliases": [
      "blind recruitment",
      "anonymous hiring",
      "bias-free screening",
      "DEI hiring"
    ]
  },
  {
    "id": "apply-with-linkedin",
    "category": "career-site",
    "title": "Apply with LinkedIn",
    "subtitle": "One-click application from LinkedIn profiles",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "support-docs-audit",
    "whatItDoes": "Candidates can pre-fill job applications from their LinkedIn profile data with one click. Reduces application friction and increases conversion.",
    "howItWorks": "Setup: Marketplace → 'Apply with LinkedIn' → Settings → Recruitment → Apply with. Requires minimum 1 LinkedIn Recruiter seat or paid job slot. LinkedIn profile data accessible to recruiters after application.",
    "doNotSay": [
      "Don't say it's free — requires at least 1 LinkedIn Recruiter seat or paid job slot.",
      "Don't confuse with LinkedIn RSC — Apply with LinkedIn is for candidates, RSC is for recruiters",
      "Do NOT confuse with LinkedIn Easy Apply — Apply with LinkedIn pre-fills YOUR TT form, Easy Apply is LinkedIn's native flow",
      "Do NOT say it's free/included — requires qualifying LinkedIn agreement",
      "Do NOT say it imports full LinkedIn profiles — pre-fills application fields only"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "linkedin",
      "apply",
      "one-click",
      "career-site",
      "conversion"
    ],
    "implementationNotes": "Requires qualifying LinkedIn agreement (Recruiter Seat or Paid Job Slot). Marketplace → 'Apply with LinkedIn' → Activate. Configure at Settings → Recruitment → Apply with. 'Apply with LinkedIn' button appears on job postings. Pre-fills application form with LinkedIn data (work experience, education). Candidate can review/edit before submitting. LinkedIn profile link viewable on candidate card. NOT the same as LinkedIn Easy Apply — candidates apply on YOUR career site.",
    "prospectQA": [
      {
        "q": "Can candidates apply with their LinkedIn?",
        "a": "Yes — one-click apply that pre-fills the application with LinkedIn profile data. Free, no LinkedIn Recruiter seat needed."
      },
      {
        "q": "Does TT support Apply with LinkedIn?",
        "a": "Yes — one-click button that pre-fills your application form with LinkedIn data. Requires qualifying LinkedIn agreement."
      },
      {
        "q": "Is it the same as LinkedIn Easy Apply?",
        "a": "No — Apply with LinkedIn pre-fills YOUR TT application form on your career site. Easy Apply is LinkedIn's native flow on linkedin.com."
      }
    ],
    "searchAliases": [
      "LinkedIn apply",
      "one-click apply",
      "easy apply",
      "social apply",
      "LinkedIn profile import",
      "LinkedIn application"
    ]
  },
  {
    "id": "eeo-reporting",
    "category": "analytics",
    "title": "EEO/Diversity Reporting",
    "subtitle": "EEOC-compliant diversity surveys and reporting",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "support-docs-audit",
    "whatItDoes": "Built-in EEO survey templates (US and UK versions) that attach to the application flow. Supports Confidential or Open modes. Data persists even after candidate profile deletion for compliance.",
    "howItWorks": "Configure EEO surveys in Settings. Attach to application flow per job. Admin can export data by date range (sent via email). Marketplace integration with 'Develop Diverse' for bias-free job ad language.",
    "doNotSay": [
      "Do NOT say EEO report is instant download — it's generated async and emailed",
      "Do NOT say all users can access reports — Company Admins only",
      "Do NOT promise it covers all global compliance — predefined templates are US and UK only"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/5322982-eeo-survey-reporting",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "eeo",
      "eeoc",
      "diversity",
      "dei",
      "compliance",
      "reporting"
    ],
    "searchAliases": [
      "EEOC",
      "equal employment opportunity",
      "diversity survey",
      "affirmative action",
      "EEO",
      "DEI survey",
      "compliance survey",
      "OFCCP"
    ],
    "prospectQA": [
      {
        "q": "Do you support EEO/EEOC reporting?",
        "a": "Yes — built-in EEO survey templates for US and UK. Attaches to application flow. Data persists for compliance even after profile deletion."
      },
      {
        "q": "How do you help with diversity hiring?",
        "a": "EEO surveys, Anonymous Mode for blind hiring, and Develop Diverse integration for bias-free job ad language."
      },
      {
        "q": "Does TT support EEO/diversity reporting?",
        "a": "Yes — predefined EEO templates for US and UK. Surveys attached to applications, with exportable reports. Confidential mode auto-hides results with <10 responses."
      },
      {
        "q": "How does it protect candidate anonymity?",
        "a": "Confidential mode hides question results with <10 responses and stage-level results with <5 responses."
      }
    ],
    "implementationNotes": "Activate Surveys in Add-on feature center. Use predefined EEO templates (US or UK) or create custom surveys. Configure as 'Confidential' (auto-hides results if <10 responses per question) or 'Open'. Assign to job postings — displayed at end of application. Export: survey page → 'Download EEO report' → date range → emailed to admin. Export includes candidate name, email, application date, job title, stage/status, answers, employment type, salary, recruiter. Only Company Admins can export."
  },
  {
    "id": "scim-provisioning",
    "category": "other",
    "title": "SCIM User Provisioning",
    "subtitle": "Automated user management via Azure AD or Okta",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "support-docs-audit",
    "whatItDoes": "Supports SCIM 2.0 for automated user provisioning and deprovisioning. Compatible with Microsoft Entra ID (Azure AD) and Okta. User objects only — no group provisioning.",
    "howItWorks": "Maps standard SCIM attributes (userName, displayName, emails). active=false sets role to 'no_access', true reactivates as 'user'. Can provision Department ID and Division ID via custom attributes. Requires contacting support/CSM to enable.",
    "doNotSay": [
      "Don't say it supports group provisioning — it's user objects only.",
      "Don't say it's self-service to enable — requires contacting support/CSM.",
      "Don't claim SCIM handles role assignments — it provisions/deprovisions users but roles are set in TT",
      "Do NOT say SCIM supports group provisioning — User objects only",
      "Do NOT claim it works with any IdP — Entra ID and Okta officially tested",
      "Do NOT say SCIM sets up SSO — they're configured independently",
      "Do NOT promise self-service custom attribute mapping — requires contacting Support"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "scim",
      "sso",
      "azure-ad",
      "okta",
      "provisioning",
      "enterprise",
      "security"
    ],
    "searchAliases": [
      "Azure AD",
      "Entra ID",
      "Okta",
      "user provisioning",
      "auto-provisioning",
      "identity provider",
      "SCIM",
      "Okta provisioning",
      "directory sync",
      "identity management"
    ],
    "implementationNotes": "Settings → Security → SCIM. Generate SCIM endpoint URL and API token. In your IdP (Microsoft Entra ID/Okta tested, others may work), create enterprise app, set Provisioning to Automatic, input URL + token. Map: userName, emails, phoneNumbers, title, displayName, active. Setting 'active'=false sets role to 'no_access'. Only User objects — Group provisioning NOT supported. SCIM is independent of SSO. Custom attribute mapping (Department ID, Division ID) requires contacting Support.",
    "prospectQA": [
      {
        "q": "Can user accounts sync from our identity provider?",
        "a": "Yes — SCIM 2.0 auto-provisions and deprovisions users from Okta, Azure AD, OneLogin, etc. Requires SSO configured first."
      },
      {
        "q": "What happens when someone leaves?",
        "a": "If removed from the TT group in your IdP, their TT account is automatically deactivated via SCIM."
      },
      {
        "q": "Does TT support SCIM?",
        "a": "Yes — SCIM 2.0 with Entra ID and Okta tested. Generate endpoint URL and API token in Settings → Security."
      },
      {
        "q": "Can we auto-deactivate users?",
        "a": "Yes — setting 'active' to false via SCIM sets their TT role to 'no_access', effectively deactivating."
      },
      {
        "q": "Does SCIM sync groups?",
        "a": "No — User objects only. Group/team membership managed within TT."
      }
    ]
  },
  {
    "id": "user-roles",
    "category": "other",
    "title": "User Roles & Permissions",
    "subtitle": "6-level role hierarchy for access control",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "support-docs-audit",
    "whatItDoes": "Six predefined roles controlling access: Company Admin (full access), Recruitment Admin (all recruitment, no company settings), Recruitment Lead (core management), Hiring Manager (create/edit ads, can't publish), Default User (assigned jobs only), No Access (career site presence only).",
    "howItWorks": "Assign roles per user in Settings → Users. Hiring Managers can create and edit job ads but mark them 'Ready to publish' — they cannot publish directly. This is a common friction point in demos. No Access users appear on the career site and get email notifications but can't log in.",
    "doNotSay": [
      "Don't say Hiring Managers can publish jobs — they can only mark 'Ready to publish' for Leads/Admins to approve."
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/113627-teamtailor-user-roles",
    "apiEndpoint": "GET /v1/roles",
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "roles",
      "permissions",
      "access-control",
      "admin",
      "security"
    ],
    "searchAliases": [
      "permissions",
      "access levels",
      "admin roles",
      "who can publish"
    ],
    "prospectQA": [
      {
        "q": "Can we control what hiring managers see and do?",
        "a": "Yes — 6 role levels from No Access to Company Admin. Hiring Managers can create ads but NOT publish them — great for governance."
      },
      {
        "q": "Can we restrict access to sensitive candidate data?",
        "a": "Yes — combine User Roles with Restricted Access feature. Default Users only see candidates on their assigned jobs."
      }
    ]
  },
  {
    "id": "job-templates",
    "category": "other",
    "title": "Job Templates & Protected Templates",
    "subtitle": "Reusable templates with optional admin-locked settings",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "support-docs-audit",
    "whatItDoes": "Create reusable job templates with pre-configured stages, triggers, application forms, and ad layouts. 'Protected' templates lock stages/triggers/application form from non-admin editing — ensuring process consistency.",
    "howItWorks": "Settings → Templates → Job templates. Save any existing job as a template. Protected templates: admins lock specific sections so Leads/Hiring Managers can use them but not modify the process. Job Ad Templates (visual layout) via Career Site editor.",
    "doNotSay": [],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "templates",
      "governance",
      "process",
      "standardization"
    ],
    "prospectQA": [
      {
        "q": "Can we standardize our hiring process across teams?",
        "a": "Yes — Protected Templates let admins lock stages, triggers, and forms. Teams use the template but can't change the process."
      },
      {
        "q": "Can we standardize our job setup?",
        "a": "Yes — Job Templates pre-configure stages, questions, team, and description. Protected Templates enforce consistency that users can't override."
      },
      {
        "q": "What's a Protected Template?",
        "a": "An admin-locked template that users can create jobs from but can't modify. Ensures process consistency across the org."
      }
    ],
    "implementationNotes": "Create reusable job templates with pre-configured stages, hiring team, screening questions, and job description. Protected Templates can only be edited by admins — regular users can create jobs from them but can't modify the template itself. Huge time-saver for high-volume hiring.",
    "searchAliases": [
      "job template",
      "protected template",
      "reusable job",
      "job blueprint",
      "hiring template"
    ]
  },
  {
    "id": "custom-domain",
    "category": "career-site",
    "title": "Custom Domain & SEO",
    "subtitle": "Use your own domain for the career site with auto SSL",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "support-docs-audit",
    "whatItDoes": "Host your career site on your own domain (e.g., careers.yourcompany.com) with automatic SSL certificates. Includes mobile optimization and semantic HTML structure for Google for Jobs and SEO.",
    "howItWorks": "Settings → Content → Domain & SSL. Requires CNAME + TXT DNS records. Auto SSL via 'Certainly' certificate provider — CAA records may need to allow 'Certainly'. Google for Jobs structured data auto-generated. RSS feed available at careers-url.rss.",
    "doNotSay": [
      "Don't forget to mention CAA records may need updating for SSL to work.",
      "Do NOT say you can use root/apex domains — only subdomains are supported",
      "Do NOT claim DNS changes are instant — propagation can take hours",
      "Do NOT say TT support handles DNS — DNS configuration is customer's responsibility"
    ],
    "supportDocUrl": "https://support.teamtailor.com/en/articles/113671-use-a-custom-domain-for-your-career-site",
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "domain",
      "ssl",
      "seo",
      "google-for-jobs",
      "career-site"
    ],
    "searchAliases": [
      "custom domain",
      "SSL",
      "Google for Jobs",
      "SEO",
      "DNS",
      "custom URL",
      "career site domain",
      "branded URL",
      "CNAME",
      "DNS setup",
      "vanity URL"
    ],
    "implementationNotes": "Settings → Content → Domain and SSL to get unique CNAME entry. In your DNS provider, add CNAME record with Host = subdomain (e.g., 'careers') and Value = TT-provided CNAME. DNS propagation may take time. Back in TT, enter full domain and save. IMPORTANT: Only subdomains supported (e.g., careers.yourcompany.com), NOT root/apex domains. Optional: set up web forwarding from root domain.",
    "prospectQA": [
      {
        "q": "Can we use our own domain?",
        "a": "Yes — use a subdomain like careers.yourcompany.com. Add a CNAME record in your DNS pointing to TT's provided entry."
      },
      {
        "q": "Can we use our root domain?",
        "a": "No — subdomains only. You can set up a redirect from your root domain to the career subdomain via your DNS provider."
      }
    ]
  },
  {
    "id": "candidate-bank",
    "category": "other",
    "title": "Candidate Bank & Segments",
    "subtitle": "Central candidate database with saved search segments",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "support-docs-audit",
    "whatItDoes": "Central candidate database with advanced filtering across all jobs. Save filter combinations as 'Segments' for quick access. Search covers: names, email, phone, LinkedIn, tags, pitch, resume content, comments.",
    "howItWorks": "Access via the Candidates tab. Filter by tags, departments, locations, application status, dates, and more. Save any filter combination as a named Segment. Applications View provides Board and List views for cross-job oversight. Customizable columns.",
    "doNotSay": [
      "Don't claim unlimited candidate storage without clarifying GDPR consent rules — candidates with expired consent are flagged"
    ],
    "supportDocUrl": null,
    "apiEndpoint": "GET /v1/candidates",
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "candidate-database",
      "search",
      "segments",
      "filters",
      "talent-pool"
    ],
    "implementationNotes": "Central candidate database with powerful search and segmentation. Create saved segments using filters (location, skills, tags, source, etc.). Candidates persist across jobs — rejected candidates can be reconsidered for future roles. Supports bulk actions (tag, message, move).",
    "prospectQA": [
      {
        "q": "Can we build a talent pool?",
        "a": "Yes — Candidate Bank stores all candidates with search, segments, and tags. Candidates persist across jobs for future matching."
      },
      {
        "q": "Can we segment candidates?",
        "a": "Yes — create saved segments using filters like location, skills, tags, source, job history, and more."
      }
    ],
    "searchAliases": [
      "talent pool",
      "candidate database",
      "talent bank",
      "candidate segments",
      "talent pipeline"
    ]
  },
  {
    "id": "video-questions",
    "category": "screening-ai",
    "title": "Video Questions (Async)",
    "subtitle": "Candidates record video responses in applications",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "support-docs-audit",
    "whatItDoes": "Add video response questions to job applications. Candidates record and submit video answers asynchronously — distinct from live video interviews.",
    "howItWorks": "Add video questions via the job's application form builder. Candidates record responses on their device during the application process. Videos stored and reviewable by the hiring team.",
    "doNotSay": [
      "Don't claim real-time video interviews — Video Questions is asynchronous (recorded), not live",
      "Don't promise AI analysis of video answers — they are for human review"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "video",
      "screening",
      "application",
      "async"
    ],
    "implementationNotes": "Async video interview feature. Candidates record video answers to pre-set questions on their own time. Configurable time limits and number of retakes. Videos stored on candidate profile. Great for screening high-volume roles before live interviews.",
    "prospectQA": [
      {
        "q": "Can candidates record video answers?",
        "a": "Yes — Video Questions lets candidates record answers to your questions asynchronously, on their own time."
      },
      {
        "q": "Can we limit recording time?",
        "a": "Yes — set time limits per question and configure how many retakes candidates get."
      }
    ],
    "searchAliases": [
      "video interview",
      "async video",
      "one-way video",
      "recorded interview",
      "video screening"
    ]
  },
  {
    "id": "google-for-jobs",
    "category": "promotion",
    "title": "Google for Jobs & Free Job Boards",
    "subtitle": "Automatic distribution to Google, Adzuna, Jobrapido, and more",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "support-docs-audit",
    "whatItDoes": "Auto-generates structured data for Google for Jobs. 'Always Included' free distribution to boards like Adzuna, Jobrapido, and others. Custom/Premium XML feeds for specific paid boards. RSS feed available.",
    "howItWorks": "Structured data auto-generated when jobs are published. Free boards included by default (24-72 hour delay for initial appearance). Custom XML feeds configurable for premium boards. RSS feed: add .rss to your careers page URL.",
    "doNotSay": [
      "Don't promise jobs appear instantly on external boards — 24-72 hour delay is normal.",
      "Don't confuse free organic distribution with paid Indeed Sponsored Ads.",
      "Don't claim guaranteed Google for Jobs placement — Google decides indexing based on their own algorithm",
      "Do NOT say it works immediately — 24-72 hours for indexing",
      "Do NOT guarantee Google placement — Google controls the algorithm",
      "Do NOT say jobs without a location will appear — location is a hard requirement",
      "Do NOT say it works with all domain configs — redirect setups may break it"
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": [
      "all"
    ],
    "addOn": false,
    "tags": [
      "google-for-jobs",
      "job-boards",
      "distribution",
      "xml-feed",
      "rss",
      "seo"
    ],
    "searchAliases": [
      "Google for Jobs",
      "job posting",
      "job boards",
      "Adzuna",
      "XML feed",
      "google jobs",
      "free job posting",
      "job board distribution",
      "structured data",
      "SEO",
      "Google job search",
      "job indexing",
      "organic job distribution"
    ],
    "implementationNotes": "Automatic — no setup required. Published public jobs with locations auto-included in Google for Jobs feed via structured data. Prerequisites: account set to 'Live' status, every job must have a location, jobs must be 'Public'. Jobs appear within 24-72 hours. GOTCHA: Custom domain redirect setups may break the integration — if using redirect, may need to disable in Marketplace Activations.",
    "prospectQA": [
      {
        "q": "Do our jobs appear on Google?",
        "a": "Yes — TT automatically adds structured data so your jobs appear in Google for Jobs search results. No extra setup needed."
      },
      {
        "q": "Which free job boards do we appear on?",
        "a": "Any board that scrapes Google structured data. Common ones include Google for Jobs, Jooble, and Adzuna."
      },
      {
        "q": "We use a custom domain redirect — will it work?",
        "a": "Redirect setups (vs CNAME) may break the auto-integration. You may need to disable it in Marketplace Activations and handle it separately."
      }
    ]
  }
];
