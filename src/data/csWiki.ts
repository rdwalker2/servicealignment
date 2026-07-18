import type { WikiFeature } from './productWiki';

export const csWikiData: WikiFeature[] = [
  {
    "id": "onboarding-digital-tier",
    "title": "Digital Onboarding (Self-Serve)",
    "subtitle": "Automated onboarding for accounts under $3,751 ARR or ≤51 employees",
    "category": "onboarding",
    "status": "verified",
    "whatItDoes": "Self-serve onboarding path for smaller accounts. Customers get access to activation webinars, help center resources, and optional 1:1 meetings — no dedicated CSM assigned.",
    "howItWorks": "1. Customer receives welcome email with resource links after contract signing.\n2. Access to 3 Activation Phase Webinars (Provider Profile, Jobs & Automation, Career Site).\n3. Support chat available for questions.\n4. Optional 1:1 Digital meetings available via Calendly (onboarding, live, and Promote support).\n5. Recommend the TT support chat for ongoing help.",
    "doNotSay": [
      "Don't promise a 'dedicated CSM' — Digital tier customers do NOT get one",
      "Don't say 'unlimited training sessions' — they get webinars + optional 1:1 meetings only",
      "Don't imply Digital customers are ignored — they have access to the same platform resources"
    ],
    "implementationNotes": "Eligibility: Under $3,751 USD ARR AND ≤51 employees. Both conditions must be true. If either threshold is exceeded, they qualify for CSM tier. Digital 1:1 meeting Calendly links are region-specific (EU/NA time zones).",
    "prospectQA": [
      {
        "q": "What support do we get during setup?",
        "a": "You'll have access to our Activation Webinar series (3 sessions covering Provider setup, jobs & automation, and career site), plus our full help center and live support chat. You can also book optional 1:1 sessions with our Digital team for hands-on guidance."
      },
      {
        "q": "Do we get a dedicated point of contact?",
        "a": "With our standard onboarding, you'll have access to our Digital Success team for meetings and our support chat for real-time help. Dedicated CSM assignment is based on account size."
      }
    ],
    "tags": [
      "onboarding",
      "digital",
      "self-serve",
      "webinars",
      "setup"
    ],
    "searchAliases": [
      "self serve",
      "diy onboarding",
      "no csm",
      "small account setup"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "Notion — Onboarding Process doc",
    "addOn": false
  },
  {
    "id": "onboarding-csm-standard",
    "title": "Standard CSM Onboarding",
    "subtitle": "Dedicated CSM for accounts above $3,751 ARR or 51+ employees",
    "category": "onboarding",
    "status": "verified",
    "whatItDoes": "Dedicated Customer Success Manager assigned for hands-on onboarding. Includes kick-off call, personalized implementation plan, activation webinars, and user training webinars.",
    "howItWorks": "1. CSM assigned based on revenue AND headcount thresholds.\n2. Kick-off call to map current workflows, define roles, collect branding assets.\n3. CSM guides through system configuration, pipeline setup, career site build.\n4. Activation Phase Webinars (3 sessions) available in parallel.\n5. User training webinars for hiring managers.\n6. Go-live support and hypercare period.\n7. Formal handover to ongoing CSM relationship.",
    "doNotSay": [
      "Don't promise specific CSM response time SLAs — Service Alignment explicitly states 'we don't have any SLA' for CSM response times",
      "Don't promise the CSM will do the setup FOR them — CSM guides, customer executes",
      "Don't say the CSM is available 24/7 — CSMs have standard business hours"
    ],
    "implementationNotes": "Assignment rule: Revenue >$3,751 AND 51+ employees = CSM. If only one threshold is met, it's discretionary. CSM handles handover through Salesforce using Customer Success Planning. All handovers now go through Salesforce (not manual).",
    "prospectQA": [
      {
        "q": "How long does onboarding take?",
        "a": "Standard onboarding typically runs 3-5 weeks depending on complexity. Your CSM will build a custom timeline based on your specific needs — things like data migration, career site design, and integration setup can extend the timeline."
      },
      {
        "q": "Who will be our main point of contact?",
        "a": "You'll be assigned a dedicated Customer Success Manager who will guide you through the entire onboarding process and be your ongoing point of contact for strategic support."
      }
    ],
    "valueDrivers": [
      "Ensure high user adoption from day one with hands-on manager training.",
      "Reduce time-to-value by having an expert guide you through the setup."
    ],
    "discoveryQuestions": [
      "Who will be managing the implementation project on your side?",
      "Have you ever implemented an Provider before?"
    ],
    "objections": [
      { "q": "Do we have to pay for standard onboarding?", "a": "No, standard CSM onboarding is included in your subscription price for accounts that meet the threshold." }
    ],
    "competitiveTraps": [
      "Competitors often charge an 'implementation fee' for a dedicated CSM. Standard onboarding with a CSM is included at Service Alignment."
    ],
    "tags": [
      "onboarding",
      "csm",
      "dedicated",
      "standard",
      "kickoff"
    ],
    "searchAliases": [
      "csm onboarding",
      "dedicated csm",
      "standard onboarding",
      "kick off call"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "Notion — Onboarding Process doc",
    "addOn": false
  },
  {
    "id": "onboarding-enterprise",
    "title": "Enterprise Onboarding",
    "subtitle": "White-glove implementation for Enterprise segment with OS + CSM collaboration",
    "category": "onboarding",
    "status": "verified",
    "whatItDoes": "Premium onboarding for Enterprise segment customers. Onboarding Specialist (OS) and CSM work together in 1:1 sessions for full-touch implementation. Enterprise Custom adds additional complexity handling.",
    "howItWorks": "1. Enterprise Standard: OS + CSM work together in 1:1 sessions — included free.\n2. Enterprise Custom: Full implementation project for high-complexity accounts — starts at $5,500.\n3. 6-step OS process: Kickoff → Timeline → Check-ins → Guidance → Follow-up → Formal Handover.\n4. OS handles technical configuration while CSM manages strategic relationship.\n5. Formal handover from OS to CSM after go-live.",
    "doNotSay": [
      "Don't quote Enterprise Custom pricing without checking the Onboarding Calculator — it varies by complexity",
      "Don't promise Enterprise-level onboarding for non-Enterprise segment deals",
      "Don't say Enterprise Custom onboarding is free — Standard Enterprise is free, Custom starts at $5,500"
    ],
    "implementationNotes": "Enterprise Standard onboarding is FREE (included). Enterprise Custom starts at $5,500 minimum and is priced via the Onboarding Calculator in Notion. Important: if OS service is added, this MUST be highlighted in the sales-to-CS handover.",
    "prospectQA": [
      {
        "q": "What's included in Enterprise onboarding?",
        "a": "Enterprise Standard includes a dedicated Onboarding Specialist working alongside your CSM in 1:1 sessions — no additional cost. For complex implementations (multiple divisions, heavy integrations, data migrations), we offer Enterprise Custom with a full project management approach."
      },
      {
        "q": "How much does custom onboarding cost?",
        "a": "Enterprise Custom onboarding starts at $5,500 and is scoped based on your specific needs — number of divisions, integration complexity, data migration volume, etc. We'll scope this together during the sales process."
      }
    ],
    "tags": [
      "onboarding",
      "enterprise",
      "white-glove",
      "OS",
      "custom"
    ],
    "searchAliases": [
      "enterprise onboarding",
      "white glove",
      "onboarding specialist",
      "custom onboarding",
      "paid onboarding"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "Notion — Onboarding Process + OS Upsell Pilot",
    "addOn": false
  },
  {
    "id": "os-upsell-pilot",
    "title": "Paid Onboarding Specialist (OS Upsell Pilot)",
    "subtitle": "Paid OS service for CSM-segment customers who want enterprise-grade onboarding",
    "category": "onboarding",
    "status": "verified",
    "whatItDoes": "Pilot program offering paid Onboarding Specialist service to CSM-segment customers (UK & US) who want a more hands-on, enterprise-style onboarding experience. Priced via the Onboarding Calculator.",
    "howItWorks": "1. Eligibility: CSM-segment customers in UK & US markets.\n2. Pricing: Determined by Onboarding Calculator (Notion tool) — based on complexity.\n3. 6-Step Process: Kickoff → Timeline Set → Regular Check-ins → Configuration Guidance → Follow-up → Formal Handover.\n4. Success criteria: Customer activation rate, time-to-value, NPS score.\n5. Evaluation metrics tracked for pilot viability.",
    "doNotSay": [
      "Don't position this as 'required' — it's an optional upsell for customers who want extra support",
      "Don't quote a fixed price — pricing comes from the Onboarding Calculator",
      "Don't promise this is available in all markets — currently UK & US only (pilot)"
    ],
    "implementationNotes": "This is a PILOT program. Pricing is NOT fixed — use the Onboarding Calculator in Notion. Must be flagged in the sales-to-CS handover if sold. Track evaluation metrics for pilot assessment.",
    "prospectQA": [
      {
        "q": "Can we get extra onboarding support even though we're not Enterprise?",
        "a": "Absolutely — we offer a premium Onboarding Specialist service that gives you the same white-glove treatment our Enterprise customers receive. Your OS will work alongside your CSM to handle configuration, training, and go-live support."
      },
      {
        "q": "What does the paid onboarding include that free doesn't?",
        "a": "The key difference is dedicated 1:1 sessions with an Onboarding Specialist who will hands-on help with configuration, career site build, workflow setup, and team training. It's a much more guided experience vs. the self-directed standard path."
      }
    ],
    "tags": [
      "upsell",
      "OS",
      "pilot",
      "paid onboarding",
      "CSM segment"
    ],
    "searchAliases": [
      "paid onboarding",
      "os upsell",
      "onboarding specialist pilot",
      "extra support"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "Notion — OS Upsell Pilot doc",
    "addOn": true
  },
  {
    "id": "activation-webinars",
    "title": "Activation Phase Webinars",
    "subtitle": "3-session webinar series covering Provider setup, automation, and career site",
    "category": "training",
    "status": "verified",
    "whatItDoes": "Structured training webinar series available to all customers during onboarding. Three sessions cover core platform setup areas. Available in both EU and NA time zones with recorded versions.",
    "howItWorks": "Session 1: Provider Profile — Company settings, departments, locations, user permissions.\nSession 2: Jobs & Automation — Pipeline stages, triggers, email templates, screening.\nSession 3: Career Site — Design, custom pages, SEO, job list widgets.\n\nAll sessions are recorded and available on-demand after the live session.",
    "doNotSay": [
      "Don't say these replace CSM support — they complement it",
      "Don't promise custom webinar content — these are standardized sessions"
    ],
    "implementationNotes": "Webinars run on fixed EU and NA schedules. Recorded versions available for customers who miss live sessions. Digital-tier customers rely heavily on these — make sure they're aware of the schedule.",
    "prospectQA": [
      {
        "q": "Is there training included?",
        "a": "Yes — every customer gets access to our 3-part Activation Webinar series covering Provider profile setup, jobs & automation, and career site design. These run in both EU and NA time zones, and recorded versions are always available."
      }
    ],
    "tags": [
      "training",
      "webinars",
      "activation",
      "onboarding"
    ],
    "searchAliases": [
      "training webinars",
      "onboarding sessions",
      "activation webinars",
      "learning sessions"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "Notion — Onboarding Process doc",
    "addOn": false
  },
  {
    "id": "implementation-timeline",
    "title": "8-Week Implementation Timeline",
    "subtitle": "Standard deployment timeline from kickoff to go-live",
    "category": "implementation",
    "status": "verified",
    "whatItDoes": "Reference implementation timeline for standard-to-enterprise deployments. Covers the full journey from kickoff through hypercare.",
    "howItWorks": "Week 1-2: Kickoff & Discovery — Roles defined, current workflows mapped, branding assets collected, departments/locations configured.\nWeek 2-3: System Configuration — Career site built, pipeline stages configured, approval workflows set up, templates created.\nWeek 3-4: Career Site Design — Custom pages, SEO setup, domain configuration, job list widgets.\nWeek 5-6: Integration & UAT — Webhook testing, legacy data migration, hiring manager training, HRIS/payroll connections.\nWeek 7: Team Training & Go-Live — Admin training, hiring manager onboarding, live candidate flow testing.\nWeek 8+: Hypercare & Value Realization — Dedicated support window, performance monitoring, optimization recommendations.",
    "doNotSay": [
      "Don't promise go-live in under 3 weeks unless it's a very simple deployment with no integrations",
      "Don't say the timeline is 'guaranteed' — it depends on customer responsiveness and complexity",
      "Don't promise data migration will be instant — standard imports take 1-2 weeks, custom imports take 6-week cycles"
    ],
    "implementationNotes": "Timeline varies significantly by complexity: Standard (3 weeks), Mid-Market (5 weeks), Enterprise (8+ weeks). Key bottlenecks are usually: customer providing branding assets, legacy data export, and IT approving SSO/SCIM. Build in buffer for customer delays.",
    "prospectQA": [
      {
        "q": "How quickly can we go live?",
        "a": "For a standard deployment, you can be live in 3-5 weeks. Mid-market deals with integrations typically take 5 weeks, and enterprise deployments with data migration and multiple divisions run about 8 weeks. The biggest variable is usually how quickly your team can provide branding assets and approve configurations."
      },
      {
        "q": "What do we need to provide during implementation?",
        "a": "You'll need: company branding assets (logo, colors, fonts), organizational structure (departments, locations), hiring workflow documentation, and IT involvement if you need SSO or webhook integrations. Your CSM will give you a complete checklist during kickoff."
      }
    ],
    "tags": [
      "implementation",
      "timeline",
      "deployment",
      "go-live",
      "kickoff"
    ],
    "searchAliases": [
      "implementation timeline",
      "how long setup",
      "deployment schedule",
      "go live timeline"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "SE Intel + Feature-to-Pain Mapping",
    "addOn": false
  },
  {
    "id": "data-migration-standard",
    "title": "Standard Data Import (Free)",
    "subtitle": "Free bulk candidate import via CSV — self-service with documentation",
    "category": "data-migration",
    "status": "verified",
    "whatItDoes": "Free self-service data import for customers migrating candidate data from legacy Provider systems. Supports CSV upload with standard field mapping.",
    "howItWorks": "1. Customer exports data from legacy system (CSV format).\n2. Map fields to Service Alignment's schema (name, email, phone, job, stage, etc.).\n3. Upload via Service Alignment's import tool in Settings.\n4. System processes and creates candidate records.\n5. Verify data integrity post-import.",
    "doNotSay": [
      "Don't say 'everything transfers seamlessly' — scorecards and messages from legacy systems become flat notes, NOT structured data",
      "Don't promise custom field mapping is automatic — it requires manual configuration",
      "Don't claim resume attachments always transfer — depends on the export format from the legacy system"
    ],
    "implementationNotes": "Standard import is FREE and self-service. KEY GOTCHA: Scorecards and messages from legacy Provider systems are converted to plain text notes — they do NOT maintain their structured format. Resume attachments may or may not transfer depending on how the legacy system exports them. Import tool is in Settings > Import.",
    "prospectQA": [
      {
        "q": "Can we bring over our existing candidate data?",
        "a": "Absolutely. You can do a free self-service CSV import for basic candidate data. For more complex migrations with custom fields and attachments, we offer a managed Custom Import service."
      },
      {
        "q": "Will our interview scorecards transfer?",
        "a": "Candidate records, contact info, and application history will transfer. However, structured data like scorecards and internal messages from your current system will be converted to text notes in Service Alignment — they won't maintain their original format."
      }
    ],
    "tags": [
      "data migration",
      "import",
      "CSV",
      "free",
      "self-service"
    ],
    "searchAliases": [
      "data import",
      "migrate data",
      "csv upload",
      "transfer candidates",
      "bring data over"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "SE Intel — Data Transfer Section",
    "addOn": false
  },
  {
    "id": "data-migration-custom",
    "title": "Custom Data Import ($1,000)",
    "subtitle": "Managed migration service for complex data transfers — $1K + $0.03/candidate",
    "category": "data-migration",
    "status": "verified",
    "whatItDoes": "Managed data migration service handled by Service Alignment's imports team. Supports complex field mapping, attachments, and large volumes. Runs in 6-week cycles.",
    "howItWorks": "1. Customer contacts imports@servicealignment.com to initiate.\n2. Service Alignment team reviews data structure and creates custom mapping.\n3. Test import run with sample data.\n4. Full import executed in 6-week cycle.\n5. Post-import verification and cleanup.\n\nPricing: $1,000 flat fee + $0.03 per candidate record.",
    "doNotSay": [
      "Don't promise custom import will be done in 1-2 weeks — it runs in 6-week cycles",
      "Don't say it's just $1,000 — there's also a $0.03/candidate charge that can add up for large databases",
      "Don't promise the custom import will perfectly replicate all legacy system data structures"
    ],
    "implementationNotes": "Contact: imports@servicealignment.com. Pricing: $1,000 flat + $0.03/candidate. Timeline: 6-week cycles. This is a ONE-TIME SERVICE FEE — it does NOT count toward recurring deal value. Calculate total cost for customer: e.g., 50,000 candidates = $1,000 + $1,500 = $2,500 total.",
    "prospectQA": [
      {
        "q": "How much does managed data migration cost?",
        "a": "It's $1,000 for the managed migration service plus $0.03 per candidate record. So for example, if you have 50,000 candidates in your current system, the total would be about $2,500."
      },
      {
        "q": "How long does managed migration take?",
        "a": "Custom imports run in 6-week cycles. We do a test run first with sample data to verify the mapping, then execute the full import. We recommend starting this process early in your implementation."
      }
    ],
    "tags": [
      "data migration",
      "custom import",
      "managed",
      "paid"
    ],
    "searchAliases": [
      "custom import",
      "managed migration",
      "data migration cost",
      "imports team"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "SE Intel — Data Migration Section",
    "addOn": true
  },
  {
    "id": "sales-to-cs-handover",
    "title": "Sales-to-CS Handover Process",
    "subtitle": "Standardized handover from AE to Customer Success via Salesforce",
    "category": "handoff",
    "status": "verified",
    "whatItDoes": "Formal process for transitioning a won deal from the sales team to Customer Success. All handovers are now done through Salesforce using Customer Success Planning.",
    "howItWorks": "1. AE completes deal and marks as Closed Won in Salesforce.\n2. Handover Document created (Google Doc template available).\n3. Customer Success Planning fields populated in Salesforce.\n4. CSM assignment triggered based on revenue + headcount rules.\n5. CSM receives notification and reviews deal context.\n6. CSM initiates first contact with customer within SLA window.\n\nKey info to include: Deal size, pain points, decision criteria, champion details, integration needs, timeline expectations, any promises made during sales.",
    "doNotSay": [
      "Don't promise the CSM will reach out within 24 hours — there's no formal SLA on CSM response time",
      "Don't tell the customer 'your CSM is already up to speed' unless you've actually briefed them",
      "Don't skip the handover document — CSMs rely on it for context"
    ],
    "implementationNotes": "All handovers go through Salesforce Customer Success Planning. Google Doc template available for detailed handover notes. CRITICAL: If OS (Onboarding Specialist) service was sold, this MUST be highlighted in the handover. MEDDPICC fields to include: Pain Narrative, Decision Criteria, Decision Process, Paper Process, Champion Validation.",
    "prospectQA": [
      {
        "q": "What happens after we sign?",
        "a": "Once the deal is signed, your information is formally handed over to our Customer Success team. Your CSM will reach out to schedule a kickoff call where you'll map out your implementation timeline, define roles, and set expectations."
      },
      {
        "q": "Will I still have a point of contact from sales?",
        "a": "Your primary point of contact transitions to your Customer Success Manager after signing. However, your AE remains available for any commercial questions — renewals, expansions, or billing."
      }
    ],
    "tags": [
      "handoff",
      "handover",
      "sales to CS",
      "salesforce"
    ],
    "searchAliases": [
      "handover process",
      "sales handoff",
      "transition to CS",
      "after close",
      "post-sale handoff"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "Notion — Onboarding Process doc",
    "addOn": false
  },
  {
    "id": "csm-assignment-rules",
    "title": "CSM Assignment Rules",
    "subtitle": "Revenue + headcount thresholds that determine CSM vs Digital onboarding",
    "category": "handoff",
    "status": "verified",
    "whatItDoes": "Defines which customers get a dedicated CSM vs Digital (self-serve) onboarding based on two criteria: Annual Recurring Revenue and employee headcount.",
    "howItWorks": "Decision matrix:\n\n• Revenue > $3,751 USD ARR AND 51+ employees → CSM assigned\n• Revenue ≤ $3,751 AND ≤ 51 employees → Digital tier\n• One threshold met but not the other → Discretionary (manager decision)\n• Enterprise segment → Enterprise CSM + OS\n\nCSM vs Digital is NOT just about deal size — headcount matters too because it indicates platform usage complexity.",
    "doNotSay": [
      "Don't tell a small customer they'll 'definitely' get a CSM — they may fall into Digital tier",
      "Don't say the threshold is 'around $4K' — be specific: $3,751 AND 51 employees",
      "Don't promise CSM assignment for a deal that only meets ONE of the two criteria without confirming with CS leadership"
    ],
    "implementationNotes": "Both conditions must be met for guaranteed CSM assignment: >$3,751 ARR AND >51 employees. Edge cases (one threshold met) are decided by CS management on a case-by-case basis. Enterprise segment customers always get CSM regardless of revenue.",
    "prospectQA": [
      {
        "q": "Will we have a dedicated CSM?",
        "a": "CSM assignment is based on your account profile — specifically your plan size and team size. For accounts of your scale, you'd be assigned a dedicated CSM who'll guide your implementation and be your ongoing strategic partner."
      }
    ],
    "tags": [
      "CSM",
      "assignment",
      "digital",
      "tier",
      "threshold"
    ],
    "searchAliases": [
      "csm assignment",
      "who gets csm",
      "digital vs csm",
      "account tier"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "Notion — Onboarding Process doc",
    "addOn": false
  },
  {
    "id": "csm-tiers-comparison",
    "title": "CSM Tier Comparison (Digital / Standard / Enterprise)",
    "subtitle": "What each customer success tier includes and how they differ",
    "category": "csm-operations",
    "status": "verified",
    "whatItDoes": "Defines the three Customer Success tiers and what's included in each. Helps AEs set proper expectations during the sales process about post-sale support.",
    "howItWorks": "Digital Tier:\n• Webinars + help center + support chat\n• Optional 1:1 Digital meetings (Calendly)\n• No dedicated CSM\n\nCSM (Standard) Tier:\n• Dedicated CSM assigned\n• Kick-off call + activation webinars\n• User training webinars\n• Strategic guidance\n\nEnterprise Tier:\n• Dedicated CSM + Onboarding Specialist\n• 1:1 implementation sessions\n• Custom onboarding option ($5,500+)\n• Full project management approach",
    "doNotSay": [
      "Don't conflate 'support' with 'CSM' — ALL customers get support chat, CSM is strategic guidance",
      "Don't promise Digital tier customers will get 'the same experience' as Enterprise",
      "Don't say CSMs have response time SLAs — they explicitly don't"
    ],
    "implementationNotes": "All three tiers are FREE (included in subscription) for standard levels. Only Enterprise Custom onboarding is paid ($5,500+ min). The Scaled Success Manager role handles high-volume accounts that don't warrant full CSM but need more than Digital.",
    "prospectQA": [
      {
        "q": "What level of support do we get after implementation?",
        "a": "All customers get 24/7 access to our support chat and comprehensive help center. Your ongoing success tier is based on your account profile — ranging from our Digital Success program with self-service resources and optional 1:1 meetings, to dedicated CSM partnership for strategic accounts, to full Enterprise success with dedicated specialists."
      }
    ],
    "tags": [
      "CSM",
      "tiers",
      "digital",
      "enterprise",
      "support"
    ],
    "searchAliases": [
      "csm tiers",
      "support levels",
      "customer success tiers",
      "what support do i get"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "Notion — Onboarding Process doc",
    "addOn": false
  },
  {
    "id": "price-caps-policy",
    "title": "Price Caps & Discount Policy",
    "subtitle": "Maximum discount thresholds and approval requirements for deal pricing",
    "category": "pricing-negotiation",
    "status": "verified",
    "whatItDoes": "Defines the discount and pricing rules that AEs must follow when negotiating deals. Includes maximum discount caps, free months policy, and approval requirements.",
    "howItWorks": "Key rules:\n• Maximum discount cap applies per product/tier — check the Price Terms Negotiations Guide for exact figures.\n• Free months: Can offer up to X months free as incentive — requires manager approval above threshold.\n• Split payments: Available for annual contracts — customer can pay in 2 installments.\n• Ramp-off schedules: Discounts must ramp off over contract term (no permanent discounts).\n• Multi-year discounts: Available for 2+ year commitments.\n\nApproval chain: Standard discounts within cap = AE authority. Above cap = Manager approval. Exceptional deals = VP approval.",
    "doNotSay": [
      "Don't quote exact discount percentages to prospects — negotiate from list price",
      "Don't promise 'we can always match competitor pricing' — there are hard caps",
      "Don't offer permanent discounts — all discounts must ramp off"
    ],
    "implementationNotes": "Refer to the full Price Terms Negotiations Guide in Notion for exact caps, approval thresholds, and email templates. Key principle: all discounts ramp off — no permanent price reductions. Split payment is an operational convenience, not a discount.",
    "prospectQA": [
      {
        "q": "Can you offer any discount for a multi-year commitment?",
        "a": "We do offer multi-year commitment incentives. Let me put together a proposal that shows the value of a longer-term partnership — the specifics depend on the package and term length."
      },
      {
        "q": "Can we split the annual payment?",
        "a": "Yes, we can accommodate split payments on annual contracts — typically two installments. This is an administrative convenience and doesn't affect the contract terms."
      }
    ],
    "tags": [
      "pricing",
      "discount",
      "negotiation",
      "caps",
      "approval"
    ],
    "searchAliases": [
      "discount policy",
      "price caps",
      "max discount",
      "negotiation rules",
      "free months"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "Notion — Price Terms Negotiations Guide",
    "addOn": false
  },
  {
    "id": "free-months-policy",
    "title": "Free Months Policy",
    "subtitle": "Rules for offering free months as a deal incentive",
    "category": "pricing-negotiation",
    "status": "verified",
    "whatItDoes": "Governs when and how AEs can offer free months of Service Alignment service as a closing incentive. Includes approval thresholds and how free months affect contract start dates.",
    "howItWorks": "1. Free months can be offered to incentivize faster contract signing.\n2. Threshold for self-approval vs manager approval depends on deal value.\n3. Free months shift the billing start date but NOT the contract start date.\n4. Customer gets full platform access during free months.\n5. Must be documented in the contract and communicated during handover.",
    "doNotSay": [
      "Don't offer free months without understanding the approval threshold",
      "Don't say 'free trial extension' — position it as a 'ramp-up period' or 'implementation runway'",
      "Don't stack free months on top of discounts without manager approval"
    ],
    "implementationNotes": "Free months shift billing start, not contract start. This means the customer's renewal date is based on contract signing, not when billing begins. Important for CSM handover — make clear when billing actually starts.",
    "prospectQA": [
      {
        "q": "Can we get a free trial to test it out?",
        "a": "Rather than a trial, we can offer a ramp-up period where you have full platform access while your team is going through implementation — that way you're not paying while you're still in setup mode."
      }
    ],
    "tags": [
      "pricing",
      "free months",
      "incentive",
      "negotiation"
    ],
    "searchAliases": [
      "free months",
      "free trial",
      "ramp up period",
      "billing start"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "Notion — Price Terms Negotiations Guide",
    "addOn": false
  },
  {
    "id": "platform-architecture",
    "title": "Platform Architecture & Hosting",
    "subtitle": "Heroku-based hosting with EU/NA data residency and single-tenant option",
    "category": "implementation",
    "status": "verified",
    "whatItDoes": "Technical architecture overview for IT stakeholders. Covers hosting infrastructure, data residency options, uptime commitments, and single-tenant isolation.",
    "howItWorks": "Infrastructure:\n• Hosted on Heroku (AWS underneath)\n• Multi-tenant architecture by default\n• EU stack and NA stack available for data residency\n• Single-tenant option available as paid add-on ($12,300/yr)\n\nSecurity:\n• SSO/SAML — Free, included\n• 2FA — Free, included\n• Audit Log — First 30 days free, extended retention $60/mo\n• GDPR compliant with data processing agreement\n• SOC 2 Type II certified\n• 24/7 monitoring with auto-escalation (devs get pings → texts → phone calls)\n• Status page: status.servicealignment.com",
    "doNotSay": [
      "Don't say 'dedicated server' unless they're paying for Single Tenant ($12,300/yr)",
      "Don't claim 'AWS hosting' directly — it's Heroku on AWS, which is an important distinction for technical buyers",
      "Don't promise 100% uptime — SLA add-on guarantees 99.9%+"
    ],
    "implementationNotes": "Data residency: EU or NA stack — determined at account setup, cannot be changed after. Single Tenant add-on: $12,300/yr for completely isolated infrastructure. WAF (Web Application Firewall) protects all instances. Penetration testing available on request for enterprise deals.",
    "prospectQA": [
      {
        "q": "Where is our data stored?",
        "a": "We offer both EU and NA data residency. Your data will reside in the region you choose during setup. We're fully GDPR compliant with a Data Processing Agreement, and SOC 2 Type II certified."
      },
      {
        "q": "Is it multi-tenant?",
        "a": "By default, yes — our multi-tenant architecture provides strong isolation between customers with shared infrastructure. For organizations with strict compliance requirements, we offer a Single Tenant option with completely dedicated, isolated infrastructure."
      },
      {
        "q": "What's your uptime?",
        "a": "We have 24/7 monitoring with automated escalation. You can check our real-time status at status.servicealignment.com. For contractual uptime guarantees, we offer an SLA add-on that provides 99.9%+ guaranteed uptime."
      }
    ],
    "tags": [
      "architecture",
      "hosting",
      "security",
      "data residency",
      "infrastructure"
    ],
    "searchAliases": [
      "hosting",
      "where is data",
      "server location",
      "aws",
      "heroku",
      "single tenant",
      "data center"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "SE Intel — Platform Architecture Section",
    "addOn": false
  },
  {
    "id": "security-setup",
    "title": "Security Setup (SSO, SCIM, 2FA)",
    "subtitle": "Enterprise security configurations — all free, included in every plan",
    "category": "implementation",
    "status": "verified",
    "whatItDoes": "Security feature setup guide for IT teams. SSO/SAML, SCIM user provisioning, and 2FA are all included free on every plan — a major competitive differentiator.",
    "howItWorks": "SSO/SAML:\n• Free on all plans (competitors often charge $2-5K extra)\n• Supports all major IdPs: Okta, Azure AD, OneLogin, Google Workspace\n• SAML 2.0 protocol\n\nSCIM Provisioning:\n• Automated user lifecycle management\n• Create/update/deactivate users from IdP\n• Supports Okta, Azure AD\n\n2FA:\n• Free, can be enforced company-wide\n• TOTP-based (Google Authenticator, Authy, etc.)",
    "doNotSay": [
      "Don't skip mentioning SSO is free — this is a HUGE differentiator vs Greenhouse, Lever, etc. who charge extra",
      "Don't promise SCIM works with every IdP — confirm their specific IdP is supported",
      "Don't say '2FA is optional' if they have compliance requirements — recommend enforcing it company-wide"
    ],
    "implementationNotes": "SSO setup requires IT involvement from the customer side. Typical setup time: 1-2 days for SSO, 1 day for SCIM. Recommend setting up SSO before rolling out to hiring managers. 2FA can be enforced at the company level in Settings > Security. KEY SELLING POINT: All three are free on every plan — most competitors charge $2-5K+ for SSO alone.",
    "prospectQA": [
      {
        "q": "Does SSO cost extra?",
        "a": "No — SSO/SAML is included free on every plan. We also include SCIM user provisioning and 2FA at no additional cost. We believe security shouldn't be a premium feature."
      },
      {
        "q": "What identity providers do you support?",
        "a": "We support all major identity providers through SAML 2.0 — including Okta, Azure AD, OneLogin, and Google Workspace. SCIM provisioning is available for automated user management through Okta and Azure AD."
      }
    ],
    "tags": [
      "security",
      "SSO",
      "SCIM",
      "2FA",
      "SAML",
      "compliance"
    ],
    "searchAliases": [
      "sso setup",
      "single sign on",
      "scim",
      "2fa",
      "security configuration",
      "okta",
      "azure ad"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "SE Intel — Security Section",
    "addOn": false
  },
  {
    "id": "addon-activation-guide",
    "title": "Add-On Feature Activation Guide",
    "subtitle": "31-feature catalog with activation methods and pricing for each add-on",
    "category": "implementation",
    "status": "verified",
    "whatItDoes": "Master reference for all add-on features available in Service Alignment. Documents activation method (self-service vs admin-required), pricing, and what each add-on does.",
    "howItWorks": "Add-ons fall into three activation categories:\n\n1. **Self-Service**: Customer can enable in Settings (e.g., NPS, Surveys, Referrals)\n2. **Admin-Required**: Service Alignment admin must enable via TT-Admin (e.g., Divisions, API access, BI Connector)\n3. **Integration Partner**: Requires setup with external partner (e.g., LinkedIn RSC, Indeed Sponsored)\n\nFull catalog of 31 add-on features with pricing available in the Add-on Features List in Notion.",
    "doNotSay": [
      "Don't tell customers they can enable ALL features themselves — some require admin activation",
      "Don't quote add-on pricing from memory — always verify in the current catalog",
      "Don't say 'all integrations are free' — some partner integrations have separate costs"
    ],
    "implementationNotes": "Add-on activation is documented in Notion: 'Add-on features list and activation'. Some features require Slack workflow to request activation (triggers an internal process). BI Connector, Divisions, and Custom API access always require TT-Admin involvement. Keep the catalog bookmarked for quick reference during calls.",
    "prospectQA": [
      {
        "q": "Can we add features later?",
        "a": "Absolutely — Service Alignment has 30+ add-on features you can activate at any time. Some are self-service toggles you can enable instantly, and others we activate on the backend. Your CSM can walk you through what's available as your needs evolve."
      },
      {
        "q": "How do we enable new features?",
        "a": "Many features can be toggled on directly in your Settings. For features that require backend activation, just reach out to your CSM or our support team and we'll enable them — typically within the same business day."
      }
    ],
    "tags": [
      "add-ons",
      "activation",
      "features",
      "catalog",
      "pricing"
    ],
    "searchAliases": [
      "add on features",
      "enable feature",
      "activate feature",
      "feature catalog",
      "what add ons"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "Notion — Add-on Features List",
    "addOn": false
  },
  {
    "id": "onboarding-feature-setup",
    "title": "Onboarding Feature Module Setup",
    "subtitle": "Step-by-step guide to enabling and configuring the Onboarding feature in Service Alignment",
    "category": "implementation",
    "status": "verified",
    "whatItDoes": "The Onboarding feature in Service Alignment enables post-hire workflows — document collection, task assignments, and new hire onboarding sequences. This is a paid add-on feature.",
    "howItWorks": "1. Request activation via Slack workflow (internal process) or contact TT-Admin.\n2. Configure onboarding templates with tasks, documents, and checklists.\n3. Assign onboarding flows to hired candidates.\n4. Track completion of onboarding tasks.\n5. Collect e-signatures on documents if E-Sign is also enabled.",
    "doNotSay": [
      "Don't say 'onboarding is included' without specifying — the FEATURE called 'Onboarding' is a paid add-on",
      "Don't confuse customer onboarding (CS process) with the Onboarding FEATURE (product capability)",
      "Don't promise it replaces a full HRIS onboarding module — it handles the recruiting-to-hire handoff"
    ],
    "implementationNotes": "Activation requires TT-Admin. The Onboarding feature is distinct from the onboarding PROCESS (CS/CSM). Demo video available (933MB file). Pairs well with E-Signature feature for document collection. Slack workflow is the standard way to request internal activation.",
    "prospectQA": [
      {
        "q": "Can Service Alignment handle new hire onboarding?",
        "a": "Yes — our Onboarding module lets you create structured onboarding flows with tasks, document collection, and checklists. When a candidate is marked as hired, you can trigger an onboarding workflow to handle everything from offer letter signing to first-day logistics."
      },
      {
        "q": "Does it integrate with our HRIS?",
        "a": "The Onboarding module handles the recruiting-to-hire transition — getting documents signed, tasks completed, and information collected. For pushing hire data to your HRIS, we use webhooks that fire on the 'candidate hired' event to send data to systems like BambooHR, Workday, or Paylocity."
      }
    ],
    "tags": [
      "onboarding feature",
      "new hire",
      "post-hire",
      "tasks",
      "documents"
    ],
    "searchAliases": [
      "onboarding module",
      "new hire onboarding",
      "post hire workflow",
      "onboarding feature"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "Notion — Onboarding Feature doc",
    "addOn": true
  },
  {
    "id": "sla-addon-details",
    "title": "SLA Add-On",
    "subtitle": "Contractual uptime guarantee and priority support — $800/yr",
    "category": "csm-operations",
    "status": "verified",
    "whatItDoes": "Provides a contractual Service Level Agreement with guaranteed uptime commitment (99.9%+) and priority support response times. Typically requested by enterprise customers with IT procurement requirements.",
    "howItWorks": "What's included:\n• Guaranteed uptime commitment (99.9%+)\n• Priority support response times\n• Dedicated escalation path\n• Financial remedies for SLA breaches\n\nWhen to position:\n• Enterprise deals with IT/procurement involvement\n• Regulated industries requiring contractual guarantees\n• When prospect's security review requires written SLA",
    "doNotSay": [
      "Don't say Service Alignment has SLA 'by default' — it's a paid add-on",
      "Don't conflate SLA add-on with CSM response time — CSMs explicitly have NO SLA",
      "Don't say support is 'slow' without the SLA — all customers get responsive support"
    ],
    "implementationNotes": "Price: $800/yr. This is a contractual document add-on — doesn't change the underlying infrastructure. The 24/7 monitoring and auto-escalation applies to ALL customers regardless of SLA. SLA mainly provides the legal/contractual guarantee and priority routing.",
    "prospectQA": [
      {
        "q": "Do you have an SLA?",
        "a": "We offer an SLA add-on for $800/year that provides contractual uptime guarantees (99.9%+) and priority support response times. All customers benefit from our 24/7 monitoring and automated escalation — the SLA formalizes this into a contractual commitment."
      }
    ],
    "tags": [
      "SLA",
      "uptime",
      "support",
      "enterprise",
      "compliance"
    ],
    "searchAliases": [
      "sla",
      "uptime guarantee",
      "support sla",
      "response time"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "SE Intel + features.json",
    "addOn": true
  },
  {
    "id": "scaled-success-manager",
    "title": "Scaled Success Manager Role",
    "subtitle": "Hybrid role managing high-volume accounts between CSM and Digital tiers",
    "category": "csm-operations",
    "status": "needs-review",
    "whatItDoes": "A hybrid Customer Success role that manages a larger portfolio of accounts — more personalized than Digital but not fully dedicated like CSM tier. Handles mid-tier accounts that need some strategic guidance but not full 1:1 engagement.",
    "howItWorks": "1. Manages a larger book of business than traditional CSMs.\n2. Provides periodic strategic check-ins rather than ongoing 1:1 support.\n3. Leverages data-driven health scores to prioritize engagement.\n4. Escalates at-risk accounts to full CSM support when needed.\n5. Handles onboarding for accounts in the 'gray zone' between Digital and CSM thresholds.",
    "doNotSay": [
      "Don't promise a 'dedicated CSM' for accounts that will get a Scaled Success Manager",
      "Don't position Scaled as 'less than' CSM — it's a different engagement model optimized for their needs"
    ],
    "implementationNotes": "This role is briefly mentioned in the Onboarding Process FAQ. Details on exact responsibilities and account thresholds are limited in current documentation — may need to verify with CS leadership.",
    "prospectQA": [
      {
        "q": "What kind of ongoing support will we have?",
        "a": "Based on your account profile, you'll have a Success Manager who provides strategic guidance through periodic check-ins, quarterly reviews, and proactive recommendations based on your usage patterns. You'll also always have access to our support chat for day-to-day questions."
      }
    ],
    "tags": [
      "CSM",
      "scaled",
      "success manager",
      "mid-tier"
    ],
    "searchAliases": [
      "scaled csm",
      "scaled success",
      "mid tier support"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "Notion — Onboarding Process FAQ (limited detail)",
    "addOn": false
  },
  {
    "id": "quick-start-checklist",
    "title": "Quick Start Setup Checklist",
    "subtitle": "5-step initial configuration checklist for new Service Alignment accounts",
    "category": "implementation",
    "status": "verified",
    "whatItDoes": "Essential first steps that every new Service Alignment customer should complete during initial setup. Referenced in support documentation and used by both Digital and CSM-guided customers.",
    "howItWorks": "1. Add Departments — Define your organizational structure.\n2. Set Locations — Configure office locations for job posting.\n3. Create Templates — Email templates, rejection templates, pipeline stage templates.\n4. Configure Privacy Settings — GDPR consent, data retention, candidate communication preferences.\n5. Build Career Site — Design, custom domain, pages, branding.",
    "doNotSay": [
      "Don't say setup takes '5 minutes' — while these steps are straightforward, career site design alone can take days",
      "Don't skip privacy setup — GDPR compliance is critical and should be configured BEFORE going live"
    ],
    "implementationNotes": "This checklist is the minimum viable configuration. Career site design is usually the longest step. Privacy/GDPR settings MUST be configured before publishing the career site or receiving applications. Custom domain setup requires DNS configuration (IT involvement).",
    "prospectQA": [
      {
        "q": "What's the first thing we do after signing?",
        "a": "Your first step is setting up the foundation: departments, locations, and email templates. Then you'll configure your privacy settings for GDPR compliance, and finally design your career site. Your CSM (or our activation webinars) will guide you through each step."
      }
    ],
    "tags": [
      "setup",
      "checklist",
      "quick start",
      "configuration"
    ],
    "searchAliases": [
      "first steps",
      "getting started",
      "initial setup",
      "quick start"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "TT Support Site — Getting Started",
    "addOn": false
  },
  {
    "id": "digital-1-1-meetings",
    "title": "Digital 1:1 Meeting Booking",
    "subtitle": "Optional Calendly-based booking for Digital tier customers who need hands-on help",
    "category": "training",
    "status": "verified",
    "whatItDoes": "Self-service meeting booking for Digital tier customers who need more hands-on guidance than webinars provide. Three types of meetings available via Calendly links.",
    "howItWorks": "Three meeting types available:\n1. Onboarding 1:1 — Initial setup guidance and Q&A.\n2. Live 1:1 — Ongoing support for active users.\n3. Promote Support — Dedicated session for Promote feature setup.\n\nAvailable in EU and NA time zones. Calendly links are provided in the welcome email and onboarding resources.",
    "doNotSay": [
      "Don't say Digital customers get 'unlimited' meetings — these are available but not infinite",
      "Don't position these as a substitute for CSM support — they're targeted sessions, not ongoing partnership"
    ],
    "implementationNotes": "Calendly links are region-specific. Digital customers should be directed to these when they need more support than the help center and webinars provide. These meetings are a bridge between fully self-serve and CSM-level support.",
    "prospectQA": [
      {
        "q": "What if we get stuck during setup?",
        "a": "Even without a dedicated CSM, you can book 1:1 meetings with our Digital Success team whenever you need hands-on guidance. We have sessions available for onboarding, ongoing support, and specific features like Promote."
      }
    ],
    "tags": [
      "digital",
      "meetings",
      "calendly",
      "1:1",
      "support"
    ],
    "searchAliases": [
      "book a meeting",
      "calendly",
      "1 on 1 meeting",
      "digital meeting"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "Notion — Onboarding Process doc",
    "addOn": false
  },
  {
    "id": "confirmation-close-process",
    "title": "Sales Confirmation Close Process",
    "subtitle": "5-checkpoint alignment process before handover to ensure clean deal transfer",
    "category": "handoff",
    "status": "verified",
    "whatItDoes": "Pre-handover alignment framework that ensures the AE has confirmed all critical deal details before transitioning to Customer Success. Prevents mismatched expectations and scope creep during implementation.",
    "howItWorks": "5 Alignment Checkpoints:\n1. Pain Narrative — Confirmed understanding of their core problems and why they're switching.\n2. Decision Criteria — Verified what they're evaluating and that TT meets their must-haves.\n3. Decision Process — Mapped who needs to sign off, what the approval chain looks like.\n4. Paper Process — Confirmed procurement process, legal review requirements, timeline to signature.\n5. Champion Validation — Verified your champion can actually push this through internally.\n\nAll 5 must be documented before marking the deal as Closed Won.",
    "doNotSay": [
      "Don't skip confirmation close steps to rush a deal through — it creates CS problems downstream",
      "Don't hand over a deal without champion validation — the CSM needs to know who to work with"
    ],
    "implementationNotes": "Based on MEDDPICC framework. All 5 checkpoints should be captured in Salesforce opportunity record. The handover document template (Google Doc) includes fields for each checkpoint. Champion validation is especially critical — CSMs frequently cite 'unknown champion' as the #1 handover issue.",
    "prospectQA": [
      {
        "q": "What happens between us agreeing and the contract being signed?",
        "a": "We go through a structured confirmation process to make sure everything is aligned — your requirements, timeline, who's involved on your side, and the approval process. This ensures a smooth transition to your implementation team with no surprises."
      }
    ],
    "tags": [
      "handoff",
      "MEDDPICC",
      "confirmation",
      "close process"
    ],
    "searchAliases": [
      "confirmation close",
      "pre handover",
      "deal alignment",
      "close process"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "Feature-to-Pain Mapping doc",
    "addOn": false
  },
  {
    "id": "split-payment-policy",
    "title": "Split Payment Policy",
    "subtitle": "Rules for splitting annual contract payments into installments",
    "category": "pricing-negotiation",
    "status": "verified",
    "whatItDoes": "Policy allowing customers to split annual contract payments into installments. This is an administrative convenience, not a financing arrangement or discount.",
    "howItWorks": "1. Available on annual contracts only.\n2. Typically split into 2 equal installments.\n3. Does NOT change the contract value or terms.\n4. Does NOT constitute a discount.\n5. Both installments must be within the contract year.\n6. Requires manager awareness but usually doesn't need formal approval.",
    "doNotSay": [
      "Don't position split payment as a 'discount' or 'deal sweetener' — it's an admin convenience",
      "Don't offer quarterly payments — standard is semi-annual (2 payments)",
      "Don't promise split payment without confirming with finance team"
    ],
    "implementationNotes": "Split payment is documented in the Price Terms Negotiations Guide. It's a common ask from customers with quarterly budget cycles. Does NOT affect deal value or commission calculation.",
    "prospectQA": [
      {
        "q": "Can we pay quarterly instead of annually?",
        "a": "We typically offer annual billing with the option to split into two semi-annual payments. This gives you budget flexibility while keeping the administrative simplicity of an annual agreement."
      }
    ],
    "tags": [
      "pricing",
      "payment",
      "split",
      "billing",
      "installments"
    ],
    "searchAliases": [
      "split payment",
      "pay quarterly",
      "installment",
      "billing options"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "Notion — Price Terms Negotiations Guide",
    "addOn": false
  },
  {
    "id": "discount-ramp-off",
    "title": "Discount Ramp-Off Policy",
    "subtitle": "All discounts must decrease over contract term — no permanent price reductions",
    "category": "pricing-negotiation",
    "status": "verified",
    "whatItDoes": "Policy requiring that any discounts offered during sales must ramp off (decrease) over the contract term. Prevents permanent price erosion and ensures long-term revenue health.",
    "howItWorks": "Example ramp-off structure:\n• Year 1: 20% discount\n• Year 2: 10% discount\n• Year 3+: List price\n\nRules:\n• ALL discounts must have a ramp-off schedule.\n• No permanent discounts allowed.\n• Ramp-off schedule must be documented in the contract.\n• Multi-year deals should clearly state the price for each year.",
    "doNotSay": [
      "Don't promise a 'locked-in' discounted price forever",
      "Don't negotiate without a ramp-off plan — finance will reject it",
      "Don't tell the customer the discount 'might' renew at the same rate"
    ],
    "implementationNotes": "Ramp-off schedules must be clearly documented in the contract. Email templates for communicating ramp-off to prospects are available in the Price Terms Negotiations Guide. Common pushback: 'Why can't the discount stay?' Answer: 'As you realize more value from the platform, the investment aligns with the ROI you're achieving.'",
    "prospectQA": [
      {
        "q": "Will we keep the same price when we renew?",
        "a": "Our introductory pricing is designed to help you get started and realize value quickly. We structure our agreements so the price gradually aligns with the full value you're receiving from the platform — your CSM will work with you to ensure you're maximizing ROI throughout."
      }
    ],
    "tags": [
      "pricing",
      "discount",
      "ramp-off",
      "renewal",
      "contract"
    ],
    "searchAliases": [
      "ramp off",
      "discount schedule",
      "price increase",
      "renewal pricing"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "Notion — Price Terms Negotiations Guide",
    "addOn": false
  },
  {
    "id": "api-self-import",
    "title": "API-Based Self-Service Import",
    "subtitle": "Technical teams can build their own import pipeline using the Service Alignment API",
    "category": "data-migration",
    "status": "verified",
    "whatItDoes": "For technically capable prospects, Service Alignment's REST API allows building custom import pipelines. This is the DIY option for data migration — no cost, full control.",
    "howItWorks": "1. Generate API key in Settings > Integrations > API.\n2. Use the Candidates endpoint to create/update records.\n3. Batch imports possible with rate limit awareness.\n4. Can include: candidate data, resume URLs, custom field values, tags.\n5. Full API documentation at docs.servicealignment.com.",
    "doNotSay": [
      "Don't recommend API import for non-technical customers — it requires developer resources",
      "Don't promise unlimited API rate limits — there are throttling limits",
      "Don't say the API can import everything — some data types (like interview recordings) can't be imported via API"
    ],
    "implementationNotes": "API access is included on all plans. Rate limits apply — check current documentation for specifics. API is REST-based with JSON:API specification. Good option for prospects with internal dev teams who want full control over the migration process.",
    "prospectQA": [
      {
        "q": "Can our dev team build a custom import?",
        "a": "Absolutely — our REST API is fully documented and included on all plans. Your team can build a custom import pipeline to migrate candidate data exactly how you want it structured. Many technical teams prefer this approach for maximum control."
      }
    ],
    "tags": [
      "API",
      "import",
      "self-service",
      "developer",
      "migration"
    ],
    "searchAliases": [
      "api import",
      "developer import",
      "custom migration",
      "rest api",
      "build import"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "SE Intel — API Section",
    "addOn": false
  },
  {
    "id": "multi-year-commitment",
    "title": "Multi-Year Commitment Incentives",
    "subtitle": "Discount structures available for 2+ year contract commitments",
    "category": "pricing-negotiation",
    "status": "verified",
    "whatItDoes": "Framework for offering incentives on multi-year contracts. Longer commitments unlock better pricing while securing predictable revenue.",
    "howItWorks": "1. 2-year commitment: Additional discount tier available.\n2. 3-year commitment: Maximum discount tier.\n3. All multi-year discounts still follow ramp-off policy.\n4. Price lock available for multi-year terms (list price won't increase during term).\n5. Annual payment required — no monthly billing on multi-year deals.",
    "doNotSay": [
      "Don't promise exact multi-year discount percentages without checking current guidelines",
      "Don't say 'price is locked forever' — only locked for the contract term",
      "Don't offer multi-year at the same price as single-year — there should be meaningful incentive"
    ],
    "implementationNotes": "Multi-year deals are preferred by finance. They provide revenue predictability and lower churn risk. Use multi-year pricing as a negotiation tool: 'If you commit to 2 years, I can offer...' Always document the per-year pricing in the contract.",
    "prospectQA": [
      {
        "q": "What's the benefit of a longer commitment?",
        "a": "Multi-year commitments unlock additional pricing incentives and lock in your rate for the full term — protecting you from any future list price increases. Most of our customers find the 2-year option provides the best balance of savings and flexibility."
      }
    ],
    "tags": [
      "pricing",
      "multi-year",
      "commitment",
      "contract"
    ],
    "searchAliases": [
      "multi year deal",
      "2 year contract",
      "long term discount",
      "commitment pricing"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "Notion — Price Terms Negotiations Guide",
    "addOn": false
  },
  {
    "id": "single-tenant-hosting",
    "title": "Single Tenant Hosting",
    "subtitle": "Dedicated isolated infrastructure — $12,300/yr add-on",
    "category": "implementation",
    "status": "verified",
    "whatItDoes": "Completely isolated hosting environment where the customer's data and application instance run on dedicated infrastructure, separate from all other Service Alignment customers.",
    "howItWorks": "1. Customer's entire Service Alignment instance runs on dedicated servers.\n2. Complete data isolation from other tenants.\n3. Separate database, application server, and storage.\n4. Same feature set as multi-tenant — no feature limitations.\n5. Managed by Service Alignment's infrastructure team.",
    "doNotSay": [
      "Don't say multi-tenant has security issues to upsell single tenant — multi-tenant is equally secure for most use cases",
      "Don't promise custom infrastructure modifications — single tenant is still managed by TT",
      "Don't say it's 'on-premise' — it's still cloud-hosted, just isolated"
    ],
    "implementationNotes": "Price: $12,300/yr. Typically requested by: highly regulated industries (finance, healthcare, government), companies with strict infosec requirements, or when multi-tenant won't pass their security review. Setup time: usually 1-2 weeks for provisioning.",
    "prospectQA": [
      {
        "q": "Do you offer dedicated infrastructure?",
        "a": "Yes — our Single Tenant option provides a completely isolated hosting environment with dedicated servers, database, and storage. It's the same full-featured platform, just running on infrastructure that's exclusively yours. It's $12,300 per year."
      }
    ],
    "tags": [
      "hosting",
      "single tenant",
      "dedicated",
      "infrastructure",
      "security"
    ],
    "searchAliases": [
      "single tenant",
      "dedicated server",
      "isolated hosting",
      "private cloud"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "SE Intel — Platform Architecture",
    "addOn": true
  },
  {
    "id": "os-role-definition",
    "title": "Onboarding Specialist Role",
    "subtitle": "What an Onboarding Specialist does and how they differ from a CSM",
    "category": "csm-operations",
    "status": "verified",
    "whatItDoes": "Defines the Onboarding Specialist role — focused on activation phase implementation, distinct from the CSM role.",
    "howItWorks": "1. Primary purpose: efficiently onboard customers during the activation phase.\n2. Uses support, webinars, and 1:1 sessions for Enterprise/Pilot customers.\n3. Owns the Activation Phase webinars (since October 2024).\n4. Hands over customers to CSM once the customer is live.\n5. Must always be introduced as 'Onboarding Specialist' — NOT as a CSM.",
    "doNotSay": [
      "NEVER introduce an Onboarding Specialist as a CSM",
      "Don't imply the OS stays with the customer long-term — they hand over to CSM at go-live"
    ],
    "implementationNotes": "OS role started October 2024. They own the activation phase. Handover to CSM happens when the customer goes live.",
    "prospectQA": [
      {
        "q": "Who will help us during implementation?",
        "a": "An Onboarding Specialist guides you through the activation phase, then hands you over to your dedicated CSM once you're live."
      },
      {
        "q": "What's the difference between OS and CSM?",
        "a": "The OS focuses on getting you set up and live. Your CSM is your long-term strategic partner for ongoing success."
      }
    ],
    "tags": [
      "onboarding",
      "OS",
      "role definition",
      "activation"
    ],
    "searchAliases": [
      "onboarding specialist",
      "OS role",
      "who does onboarding"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "Notion — Onboarding Process doc",
    "addOn": false
  },
  {
    "id": "bi-connector-setup",
    "title": "BI Connector Setup & Qualification",
    "subtitle": "Paid BI Connector add-on — $1,700/yr — requires customer SQL expertise",
    "category": "implementation",
    "status": "verified",
    "whatItDoes": "SQL-based data connector for Power BI, Tableau, and other BI tools. Allows customers to build custom dashboards from Service Alignment data.",
    "howItWorks": "1. PAID add-on at $1,700/year.\n2. QUALIFICATION RULE: Before selling, confirm (a) customer has an existing BI tool, (b) they have someone who can write SQL queries.\n3. If no BI expertise → steer toward built-in Analytics and Co-pilot Reports.\n4. Supports Power BI on Windows (documented setup guide).\n5. TT does NOT provide setup support — fee covers infrastructure only.\n6. Activated by Support team.",
    "doNotSay": [
      "Don't sell BI Connector to customers without existing BI expertise — it will create support issues",
      "Don't promise TT will help set up dashboards — we provide documentation only",
      "Don't position it as 'analytics' — it's a raw data connector"
    ],
    "implementationNotes": "Fee: $1,700/year (counts toward ARR). Qualification: must have own BI system + SQL expertise. Activation by Support team. Power BI on Windows has documented setup guide.",
    "prospectQA": [
      {
        "q": "Can we connect to Power BI?",
        "a": "Yes — via our SQL connector at $1,700/year. Power BI on Windows has a documented setup guide. You'll need someone on your team comfortable with SQL queries."
      },
      {
        "q": "Will you help us build dashboards?",
        "a": "We provide comprehensive documentation, but dashboard creation requires your own BI expertise."
      }
    ],
    "tags": [
      "BI",
      "connector",
      "analytics",
      "paid",
      "SQL"
    ],
    "searchAliases": [
      "bi connector",
      "power bi",
      "tableau",
      "sql",
      "data export"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "SE Intel + Notion",
    "addOn": true
  },
  {
    "id": "copilot-ai-implementation",
    "title": "Co-pilot AI Configuration",
    "subtitle": "Free AI add-on with 8 features — critical gotchas for CS setup",
    "category": "implementation",
    "status": "verified",
    "whatItDoes": "Service Alignment's AI assistant with 8 features: Resume Summary, Draft Reject Email, Video Meeting Summary, Answer Interview Kit Qs, Draft Job Description, Suggest Skills & Traits, Suggest Interview Kit Qs, Suggest Existing Candidates.",
    "howItWorks": "1. FREE add-on — activated by Company Admin in Add-on Features.\n2. Individual feature toggles at Settings → Co-pilot. All enabled by default.\n3. Uses OpenAI API (GPT-4.1 and GPT-5 models).\n4. All AI outputs are in the company's default language regardless of input language.\n5. Video meeting AI features ONLY work with TT's own video meeting tool — NOT Zoom/Teams/Google Meet.\n6. Recordable Meetings must also be activated for video AI features.",
    "doNotSay": [
      "Don't say Co-pilot works with Zoom or Teams video calls — it ONLY works with TT's built-in video tool",
      "Don't promise AI outputs will match the candidate's language — outputs are in the company's default language",
      "Don't say 'AI makes hiring decisions' — it assists, doesn't decide"
    ],
    "implementationNotes": "Co-pilot is FREE. Key gotcha: Video AI only works with TT video, not Zoom/Teams/Meet. Language gotcha: outputs match company default language, not input language. Individual features can be toggled off. GDPR: AI processing uses standard OpenAI DPA.",
    "prospectQA": [
      {
        "q": "Is AI included or extra?",
        "a": "Co-pilot AI is completely free — included on every plan with 8 AI-powered features."
      },
      {
        "q": "Does it work with our Zoom/Teams calls?",
        "a": "The video meeting AI features work with Service Alignment's built-in video tool. For Zoom or Teams calls, you'd use those platforms' own AI features."
      },
      {
        "q": "What about GDPR and AI?",
        "a": "Co-pilot uses OpenAI's API with their standard Data Processing Agreement. All processing respects your data residency settings."
      }
    ],
    "tags": [
      "AI",
      "copilot",
      "free",
      "configuration",
      "GPT"
    ],
    "searchAliases": [
      "copilot setup",
      "ai configuration",
      "co-pilot",
      "gpt",
      "ai features"
    ],
    "lastVerified": "Jun 2026",
    "verifiedBy": "SE Intel + Notion",
    "addOn": false
  }
];
