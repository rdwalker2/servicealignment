import type { WikiFeature } from './productWiki';

export const integrationsWikiData: WikiFeature[] = [
  {
    "id": "indeed-integration",
    "category": "integrations",
    "title": "Indeed Integration",
    "subtitle": "Organic and sponsored job posting on Indeed",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "support-docs",
    "whatItDoes": "Service Alignment integrates with Indeed for both organic and sponsored job postings. Jobs can be listed organically via XML feed and promoted with sponsored ads through the Promote tab. Indeed's organic visibility depends on their current posting policies.",
    "howItWorks": "Jobs posted in Service Alignment are automatically included in the XML feed for Indeed's organic listings. To sponsor a job, go to the job's Promote tab, select Indeed Sponsored, set a budget and date range, and activate the campaign. Sponsored billing is handled directly by Indeed.",
    "doNotSay": [
      "Don't claim free organic listings as guaranteed — Indeed changed XML feed policy March 2026. Say 'organic visibility depends on Indeed's current posting policies.'"
    ],
    "supportDocUrl": "https://support.servicealignment.com/en/articles/6193419-why-are-my-jobs-not-posted-on-indeed",
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
    "whatItDoes": "Criteria Corp is a native assessment integration that lets recruiters send pre-employment tests to candidates directly from Service Alignment. Assessments can be auto-triggered at specific pipeline stages, and results appear directly on the candidate's profile card.",
    "howItWorks": "Enable the Criteria Corp integration in your Service Alignment settings. Configure which assessments to use for each job. Set up a trigger at the desired pipeline stage to auto-send assessments when candidates arrive. Candidates receive and complete the assessment, and results are displayed on their candidate card in Service Alignment.",
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
    "whatItDoes": "LinkedIn integration connects Service Alignment with LinkedIn for job distribution and recruiter workflows. It enables posting jobs to LinkedIn and importing candidate profile data.",
    "howItWorks": "Connect your LinkedIn account in Service Alignment's integration settings. Jobs can be posted to LinkedIn through the Promote tab. LinkedIn profile data can be synced for candidates sourced via LinkedIn Recruiter.",
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
    "valueDrivers": [
      "Access the world's largest talent pool directly from the Provider.",
      "Reduce application drop-off rates with 1-click 'Apply with LinkedIn'."
    ],
    "discoveryQuestions": [
      "Are you currently using LinkedIn Recruiter?",
      "How do your recruiters handle candidate sourcing? Are they manually copy/pasting from LinkedIn?"
    ],
    "objections": [
      { "q": "Do we have to pay extra for this?", "a": "Service Alignment does not charge extra, but RSC features require an active LinkedIn Recruiter license on your end." }
    ],
    "competitiveTraps": [
      "Some Provider providers require third-party tools to scrape LinkedIn. Highlight our native RSC integration for a seamless, compliant workflow."
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
    "howItWorks": "Connect Slack in Service Alignment's integration settings. Choose which events trigger Slack notifications (e.g., new application, candidate moved, hire made). Select the target Slack channel for each notification type. Notifications are sent automatically when the configured events occur.",
    "doNotSay": [],
    "supportDocUrl": "https://support.servicealignment.com/en/articles/416095-slack-integration",
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
    "title": "HRIS Providers",
    "subtitle": "Connectors for HR information systems",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "support-docs",
    "whatItDoes": "HRIS integrations connect Service Alignment with HR information systems to sync employee and hiring data, creating a smooth handoff from candidate to employee.",
    "howItWorks": "When a candidate is marked as 'Hired', their data is automatically pushed via API to the connected HRIS to create an employee record.",
    "doNotSay": [],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": ["all"],
    "addOn": false,
    "tags": ["integrations", "hris", "hr", "hibob", "workday", "bamboohr"],
    "implementationNotes": "Supported heavy-hitters include: HiBob, Personio, BambooHR, Nmbrs, Flex HRM, Darwinbox, Skello, Workday, and SAP.",
    "prospectQA": [
      {
        "q": "Do you integrate with our HRIS?",
        "a": "We have dozens of HRIS marketplace connectors including HiBob, Personio, BambooHR, and Workday. Check the Marketplace in-app for the full list."
      }
    ],
    "valueDrivers": [
      "Eliminate manual dual data-entry between the Provider and HRIS.",
      "Reduce compliance risk and errors (e.g. typos in salary, SSN, start date).",
      "Ensure a smooth 'Day 1' onboarding experience for new hires."
    ],
    "discoveryQuestions": [
      "Once a candidate signs their offer, what happens next? How does their data get into your HR system?",
      "How much time is your team spending manually keying in new hire details?",
      "Have you ever had an issue where a new hire's data was entered incorrectly, delaying payroll or benefits?"
    ],
    "objections": [
      { "q": "What if we have custom fields in our HRIS?", "a": "Our webhooks and native connectors support custom field mapping for most major providers." }
    ],
    "competitiveTraps": [
      "Competitors often charge an extra module fee for HRIS integrations or require expensive middleware. Highlight our native marketplace connectors."
    ]
  },
  {
    "id": "background-checks",
    "category": "integrations",
    "title": "Background Checks",
    "subtitle": "Automated background screening providers",
    "status": "verified",
    "lastVerified": "2026-07-10",
    "verifiedBy": "integration-ops",
    "whatItDoes": "Allows recruiters to trigger background checks directly from a pipeline stage, with results syncing back to the Service Alignment candidate card.",
    "howItWorks": "Candidates reach a specific trigger stage, which automatically sends their info to the background check provider. The provider emails the candidate, and once completed, sends a 'Clear' or 'Review' status back to Service Alignment.",
    "doNotSay": [
      "Do not promise that the background check report itself is hosted in Service Alignment (it usually just links out to the provider for security reasons)."
    ],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": ["all"],
    "addOn": false,
    "tags": ["integrations", "background check", "screening", "checkr"],
    "implementationNotes": "Supported providers include: Checkr, Veritable Screening, DISA, Jig by Semac, and Zinc/Zincwork. All use the Partner API with webhooks.",
    "prospectQA": [
      {
        "q": "What background check providers do you support?",
        "a": "Checkr, Veritable Screening, DISA, Jig by Semac, and Zinc/Zincwork. All integrate via our Partner API with automated results syncing."
      }
    ]
  },
  {
    "id": "assessments-category",
    "category": "integrations",
    "title": "Assessment Tools",
    "subtitle": "Pre-employment testing and skill assessments",
    "status": "verified",
    "lastVerified": "2026-07-10",
    "verifiedBy": "integration-ops",
    "whatItDoes": "Trigger skill tests, cognitive assessments, or personality tests automatically during the hiring process.",
    "howItWorks": "When a candidate lands in the 'Assessment' stage, a test link is automatically sent to them. Once completed, the score is injected directly into their candidate profile in Service Alignment.",
    "doNotSay": [],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": ["all"],
    "addOn": false,
    "tags": ["integrations", "assessments", "testing", "alva", "testgorilla"],
    "implementationNotes": "We support 14+ assessment partners including: Alva, Clevry, TestGorilla, Predictive Index, Assessment Engine, E-stimate, Equalture, HI Assessments, Multitest, PerformanSe, Pipplet, Canditech, Aon, and Criteria Corp.",
    "prospectQA": [
      {
        "q": "What assessment tools do you integrate with?",
        "a": "14+ assessment partners including Alva, TestGorilla, Predictive Index, Clevry, Criteria Corp, and Canditech. Results sync directly to candidate profiles."
      }
    ]
  },
  {
    "id": "esigning-category",
    "category": "integrations",
    "title": "E-Signing Providers",
    "subtitle": "Digital contract signatures",
    "status": "verified",
    "lastVerified": "2026-07-10",
    "verifiedBy": "integration-ops",
    "whatItDoes": "Allows sending offer letters and employment contracts for digital signature directly from Service Alignment.",
    "howItWorks": "Integrated via the Partner API. A contract is generated and sent via the partner integration. Once signed by all parties, the completed document is synced back to the candidate's profile.",
    "doNotSay": [],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": ["all"],
    "addOn": false,
    "tags": ["integrations", "e-sign", "contracts", "scrive", "oneflow"],
    "implementationNotes": "Supported providers: Contractbook, Yousign, Oneflow, Scrive, and Signeasy."
  },
  {
    "id": "reference-checking",
    "category": "integrations",
    "title": "Reference Checking",
    "subtitle": "Automated digital reference collection",
    "status": "verified",
    "lastVerified": "2026-07-10",
    "verifiedBy": "integration-ops",
    "whatItDoes": "Automates the collection of candidate references via email/SMS rather than manual phone calls.",
    "howItWorks": "Triggered via a pipeline stage, the partner tool automatically reaches out to the candidate's provided references with a questionnaire. Results sync back to Service Alignment.",
    "doNotSay": [],
    "supportDocUrl": null,
    "apiEndpoint": null,
    "plans": ["all"],
    "addOn": false,
    "tags": ["integrations", "references", "refapp"],
    "implementationNotes": "Primary supported partner is Refapp."
  },
  {
    "id": "data-migration",
    "category": "integrations",
    "title": "Data Migration",
    "subtitle": "Provider migration and data import",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "support-docs",
    "whatItDoes": "Data migration tools help companies import existing recruitment data from other Provider platforms into Service Alignment. This includes candidate records, job history, and other recruitment data to ensure a smooth transition.",
    "howItWorks": "Work with Service Alignment's onboarding team to plan your data migration. Export data from your existing Provider. Service Alignment's migration tools import candidates, jobs, and associated data. Verify the imported data for completeness and accuracy.",
    "doNotSay": [],
    "supportDocUrl": "https://support.servicealignment.com/en/articles/8304568-import-existing-data-into-servicealignment",
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
    "implementationNotes": "Standard import: FREE. Custom import: $1,000. Bulk per-candidate: $0.03/candidate. Import requests are queued with estimated completion dates. Contact: imports@servicealignment.com. Import team runs on 6-week cycles. API supports self-import: POST /v1/candidates with merge:true prevents duplicates. Resume upload via PATCH with URL string — TT fetches the file.",
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
    "id": "linkedin-rsc",
    "category": "integrations",
    "title": "LinkedIn RSC",
    "subtitle": "LinkedIn Recruiter System Connect integration",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "LinkedIn RSC (Recruiter System Connect) provides a deep integration between Service Alignment and LinkedIn Recruiter. It syncs InMail history, shows LinkedIn profile data in Service Alignment, and enables 1-click candidate export from LinkedIn Recruiter to Service Alignment.",
    "howItWorks": "Enable the LinkedIn RSC add-on (requires an active LinkedIn Recruiter license). Connect via the integration settings. Once connected, InMail conversations sync to candidate profiles in Service Alignment, and you can push candidates from LinkedIn Recruiter directly into Service Alignment jobs.",
    "doNotSay": [
      "Do NOT say it works with LinkedIn free/Premium — requires LinkedIn Recruiter (separate paid product)",
      "Do NOT say you can send InMails from TT — you VIEW history, send from LinkedIn",
      "Do NOT say full profiles sync — basic profile info only"
    ],
    "supportDocUrl": "https://support.servicealignment.com/en/articles/4492408-partner-linkedin-rsc",
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
    "implementationNotes": "Requires Admin in BOTH TT and LinkedIn Recruiter. Setup: TT Marketplace → LinkedIn RSC → Activate → authorize via LinkedIn → configure in LinkedIn Recruiter → Product Settings → Provider tab. Benefits: view InMail history in TT, 'In-Provider' indicator in LinkedIn for existing candidates, export basic profile info.",
    "prospectQA": [
      {
        "q": "What does RSC actually do?",
        "a": "View InMail history in TT, see 'In-Provider' badge in LinkedIn for existing candidates, export basic profile data."
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
    "id": "webhooks",
    "category": "integrations",
    "title": "Webhooks",
    "subtitle": "Real-time event notifications to external systems",
    "status": "verified",
    "lastVerified": "2026-06-30",
    "verifiedBy": "notion-export",
    "whatItDoes": "Webhooks send real-time HTTP notifications to external systems when events occur in Service Alignment (e.g., new application, candidate moved, job published). They enable custom integrations without polling the API.",
    "howItWorks": "Enable the Webhooks add-on. Configure webhook endpoints in Settings > Webhooks. Specify which events should trigger notifications (candidate created, stage changed, job published, etc.). Service Alignment sends an HTTP POST to your endpoint with event data whenever the specified events occur.",
    "doNotSay": [
      "Do NOT say webhooks support any protocol — endpoints must be secure HTTPS",
      "Do NOT confuse Company Webhooks with Partner Webhooks — different systems",
      "Do NOT say setup requires no technical knowledge — needs endpoint configuration and HMAC verification"
    ],
    "supportDocUrl": "https://support.servicealignment.com/en/articles/8068954-company-webhooks",
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
    "id": "data-transfers",
    "category": "integrations",
    "title": "Data Transfers Between TT Accounts",
    "subtitle": "Move candidates, jobs, and data between Service Alignment accounts",
    "status": "verified",
    "lastVerified": "2026-07-01",
    "verifiedBy": "notion-export",
    "whatItDoes": "Transfers departments, roles, locations, users, jobs (including archived + templates), stages, applications, and candidates (with tags, notes, resumes, documents, reviews, scorecards, messages, answers, and partner results — converted to notes) between Service Alignment accounts. Can filter by specific candidates/jobs or by tag.",
    "howItWorks": "Contact Service Alignment support to initiate a transfer. Tag candidates with 'transfer_to_{subdomain}' to select specific records. After transfer, an 'import' tag is added to each candidate with a date note.",
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
    "id": "marketplace-integrations",
    "category": "integrations",
    "title": "Marketplace & Add-ons",
    "subtitle": "Connect your tech stack to Service Alignment",
    "status": "verified",
    "whatItDoes": "Provides native integrations with external platforms like DocuSign, Alva Labs, ADP, Personio, and hundreds of other HRIS, assessment, and background check tools.",
    "howItWorks": "Admins navigate to the Marketplace, find the required partner, and enable the integration (often just requiring an API key or OAuth). Some partners require a subscription on their end.",
    "plans": [
      "all"
    ],
    "tags": [
      "integrations",
      "marketplace",
      "hris"
    ]
  },

  {
    "id": "tt-api-webhooks",
    "category": "integrations",
    "title": "Partner APIs & Webhooks",
    "subtitle": "Developer resources for custom integrations",
    "status": "verified",
    "lastVerified": "2026-07-10",
    "verifiedBy": "integration-ops",
    "whatItDoes": "We offer extensive APIs and Webhooks to allow partners and customers to build custom integrations. We use the JSON API specification standard.",
    "howItWorks": "Our ecosystem consists of three main developer endpoints: the Partner API (for Tech Partners), the Job Board API (for Channel Partners), and Company Webhooks (for listening to real-time events in Service Alignment).",
    "doNotSay": [
      "Don't promise that our Integration Specialists will build custom API connections for customers."
    ],
    "supportDocUrl": "https://docs.servicealignment.com/",
    "apiEndpoint": "https://api.servicealignment.com/v1/",
    "plans": ["all"],
    "addOn": false,
    "tags": ["integrations", "api", "webhooks", "developer"],
    "implementationNotes": "Customers building custom integrations must use the public API docs and should request Sandbox access through the standard external request workflow if needed. The API is strictly JSON API compliant. Typical `users` payload contains: `created-at`, `hide-email`, `hide-phone`, `name`, `phone`, `role`, `title`, `visible`, and `email`.",
    "prospectQA": [
      {
        "q": "What data can we extract about candidates via API?",
        "a": "Practically everything. You can extract profiles, resumes, answers to custom questions, tags, and stage history."
      }
    ]
  },
  {
    "id": "cronofy",
    "category": "integrations",
    "title": "Meeting Rooms (Cronofy)",
    "subtitle": "Native calendar and meeting room scheduling",
    "status": "verified",
    "lastVerified": "2026-07-10",
    "verifiedBy": "integration-ops",
    "whatItDoes": "Cronofy handles calendar syncing and meeting room scheduling within Service Alignment interviews.",
    "howItWorks": "Connect Google Workspace or Office 365. Cronofy syncs availability for interviewers and physical meeting rooms.",
    "doNotSay": [],
    "supportDocUrl": "https://support.servicealignment.com/en/",
    "apiEndpoint": null,
    "plans": ["all"],
    "addOn": false,
    "tags": ["integrations", "scheduling", "cronofy"],
    "implementationNotes": "ESCALATION RULE: Do NOT send Cronofy issues to Integration Ops! Send Cronofy questions/issues directly to Support or Product Specialists."
  },
  {
    "id": "bi-connector",
    "category": "integrations",
    "title": "BI-Connector",
    "subtitle": "Export recruiting data to Business Intelligence tools",
    "status": "verified",
    "lastVerified": "2026-07-10",
    "verifiedBy": "integration-ops",
    "whatItDoes": "Allows customers to export raw Service Alignment data directly into BI tools like Tableau, PowerBI, or Looker.",
    "howItWorks": "Connect the BI tool directly to Service Alignment's data warehouse connector.",
    "doNotSay": [],
    "supportDocUrl": "https://support.servicealignment.com/en/",
    "apiEndpoint": null,
    "plans": ["enterprise"],
    "addOn": true,
    "tags": ["integrations", "bi", "data", "analytics"],
    "implementationNotes": "ESCALATION RULE: Do NOT send BI-Connector issues to Integration Ops. These go to Support and Product Specialists."
  },
  {
    "id": "whatsapp",
    "category": "integrations",
    "title": "WhatsApp Integration",
    "subtitle": "Communicate with candidates via WhatsApp",
    "status": "verified",
    "lastVerified": "2026-07-10",
    "verifiedBy": "integration-ops",
    "whatItDoes": "Allows recruiters to message candidates directly on WhatsApp from the Service Alignment candidate card.",
    "howItWorks": "Configure the integration in settings and authorize the WhatsApp Business account.",
    "doNotSay": [],
    "supportDocUrl": "https://support.servicealignment.com/en/",
    "apiEndpoint": null,
    "plans": ["all"],
    "addOn": false,
    "tags": ["integrations", "whatsapp", "communication"],
    "implementationNotes": "ESCALATION RULE: WhatsApp integration bugs must be reported via the bug report flow to Support/CS-Support, not Integration Ops."
  }
];