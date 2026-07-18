export interface JobOpportunity {
  id: number;
  company: string;
  industry: string;
  role: string;
  growthSignal: string;
  potentialFit: string;
  url: string;
  tags: string[];
}

export const jobOpportunities: JobOpportunity[] = [
  {
    id: 1,
    company: "Linqia",
    industry: "Marketing / AdTech",
    role: "Director / VP Sales",
    growthSignal: "Actively hiring on Greenhouse",
    potentialFit: "Requires CPG relationships (perfect fit with your Bel & MillerCoors background). Consultative sales to Fortune 1000 brands.",
    url: "https://boards.greenhouse.io/linqia",
    tags: ["Sales", "CPG", "High-Growth"]
  },
  {
    id: 2,
    company: "Unlock Health",
    industry: "Healthcare Marketing",
    role: "Senior Director, Integrated Media",
    growthSignal: "Expanding in Chicago / Remote",
    potentialFit: "Strategic leadership role focused on integrated media. Great step if you want to broaden your CPG marketing experience into healthcare.",
    url: "https://boards.greenhouse.io/unlockhealth",
    tags: ["Marketing", "High-Growth", "Chicago"]
  },
  {
    id: 3,
    company: "Braze",
    industry: "SaaS / MarTech",
    role: "Senior Director, Commercial",
    growthSignal: "Rapid GTM scaling across North America",
    potentialFit: "Requires cross-functional collaboration with Marketing, Sales, and CS. Strong leverage of your commercial leadership background.",
    url: "https://jobs.lever.co/braze",
    tags: ["Sales", "SaaS", "Remote"]
  },
  {
    id: 4,
    company: "Olo",
    industry: "SaaS / Restaurant Tech",
    role: "VP of Enterprise Sales",
    growthSignal: "Expanding enterprise dining footprint",
    potentialFit: "Leverages your Food/Beverage network. Selling B2B SaaS directly to restaurant chains and food brands.",
    url: "https://www.olo.com/careers",
    tags: ["Sales", "SaaS", "Food/Bev"]
  },
  {
    id: 5,
    company: "Mondelēz International",
    industry: "CPG / Food & Beverage",
    role: "VP, Global Brand Strategy",
    growthSignal: "Headquartered in Chicago, heavy R&D focus",
    potentialFit: "Directly in your wheelhouse. Leading global brand initiatives for massive food portfolios.",
    url: "https://careers.mondelezinternational.com/",
    tags: ["Marketing", "CPG", "Chicago"]
  },
  {
    id: 6,
    company: "ActiveCampaign",
    industry: "SaaS / MarTech",
    role: "VP of Product Marketing",
    growthSignal: "Chicago HQ, continuous aggressive hiring",
    potentialFit: "Combines your marketing leadership with B2B SaaS. They value diverse commercial backgrounds for GTM strategy.",
    url: "https://www.activecampaign.com/about/careers",
    tags: ["Marketing", "SaaS", "Chicago"]
  },
  {
    id: 7,
    company: "Kraft Heinz",
    industry: "CPG",
    role: "Senior Director, Omnichannel Sales",
    growthSignal: "Digital transformation of retail sales",
    potentialFit: "Chicago-based giant. Fits your Bel/MillerCoors background perfectly with a modern e-commerce spin.",
    url: "https://careers.kraftheinz.com/",
    tags: ["Sales", "CPG", "Chicago"]
  },
  {
    id: 8,
    company: "Sprout Social",
    industry: "SaaS / Social Media",
    role: "VP of Revenue Marketing",
    growthSignal: "Strong Q3 earnings, scaling enterprise GTM",
    potentialFit: "Chicago tech darling. You would own demand generation and pipe creation, leveraging your commercial ops experience.",
    url: "https://sproutsocial.com/careers/",
    tags: ["Marketing", "SaaS", "Chicago"]
  },
  {
    id: 9,
    company: "Chomps",
    industry: "Food & Beverage",
    role: "VP of Sales Strategy & Operations",
    growthSignal: "High-growth CPG startup, recent funding",
    potentialFit: "Agile, high-growth environment in the Food/Bev space. Perfect if you want to build processes from the ground up.",
    url: "https://chomps.com/pages/careers",
    tags: ["Sales", "Food/Bev", "Startup"]
  },
  {
    id: 10,
    company: "G2",
    industry: "SaaS / B2B Marketplace",
    role: "Senior Director, Strategic Accounts",
    growthSignal: "Chicago HQ, pushing upmarket",
    potentialFit: "Heavy commercial leadership role. Managing the teams that sell to enterprise software vendors.",
    url: "https://company.g2.com/careers",
    tags: ["Sales", "SaaS", "Chicago"]
  },
  {
    id: 11,
    company: "Deel",
    industry: "SaaS / HR Tech",
    role: "Senior Director, Global Expansion Marketing",
    growthSignal: "Aggressive hyper-growth, expanding product lines",
    potentialFit: "Warm intro available! Ryan has multiple 1st-degree connections here (Erik Johansen, Josh Goldberg, Sheriff Shahen). Highly strategic marketing role.",
    url: "https://www.deel.com/careers",
    tags: ["Marketing", "SaaS", "Warm Intro"]
  },
  {
    id: 12,
    company: "Rippling",
    industry: "SaaS / HR Tech",
    role: "VP of Mid-Market Sales",
    growthSignal: "Massive funding, expanding upmarket",
    potentialFit: "Warm intro available via Ryan's connection (Jaime Rivera). Excellent fit for a process-driven sales leader scaling a commercial team.",
    url: "https://www.rippling.com/careers",
    tags: ["Sales", "SaaS", "Warm Intro"]
  },
  {
    id: 13,
    company: "Gusto",
    industry: "SaaS / HR Tech",
    role: "VP, Partner Marketing",
    growthSignal: "Expanding channel partnerships globally",
    potentialFit: "Warm intro available via Ryan's connection (James Kong). A great pivot to leverage your B2B partnership and CPG distribution knowledge in SaaS.",
    url: "https://gusto.com/about/careers",
    tags: ["Marketing", "SaaS", "Warm Intro"]
  },
  {
    id: 14,
    company: "LinkedIn",
    industry: "SaaS / Talent Solutions",
    role: "Director of Enterprise Sales",
    growthSignal: "Continuous expansion of Talent/Sales Navigator",
    potentialFit: "Warm intro available! Ryan is highly connected here (Audrey Lindner, Adam Simon, etc.). Great opportunity for enterprise relationship building.",
    url: "https://careers.linkedin.com/",
    tags: ["Sales", "SaaS", "Warm Intro"]
  },
  {
    id: 15,
    company: "C.H. Robinson",
    industry: "Logistics / Supply Chain",
    role: "Vice President, Sales - North America Surface Transportation (NAST)",
    growthSignal: "Actively hiring for $12B division (Job ID: R43775)",
    potentialFit: "Directly from your Apollo target list! Highly strategic role driving commercial strategies and new customer development. Chicago is listed as a primary/secondary location.",
    url: "https://www.chrobinson.com/en-us/careers/",
    tags: ["Sales", "Logistics", "Chicago"]
  },
  {
    id: 16,
    company: "ProAmpac",
    industry: "Manufacturing / Packaging",
    role: "Senior Director, Global Sales Enablement",
    growthSignal: "Expanding global commercial capabilities",
    potentialFit: "Directly from your Apollo target list! Based in Chicago. Focuses on building scalable commercial capabilities and enhancing sales productivity.",
    url: "https://careers.proampac.com",
    tags: ["Sales", "Manufacturing", "Chicago"]
  },
  {
    id: 17,
    company: "Redwood Logistics",
    industry: "Logistics / Supply Chain",
    role: "Vice President of Marketing & Growth Engine",
    growthSignal: "Building a data-driven marketing engine",
    potentialFit: "Directly from your Apollo target list! Leads the entire marketing strategy and brand narrative to drive revenue. Remote / Chicago.",
    url: "https://www.redwoodlogistics.com/company/careers/",
    tags: ["Marketing", "Logistics", "Chicago"]
  },
  {
    id: 18,
    company: "Curtiss-Wright Corporation",
    industry: "Aerospace / Defense",
    role: "Senior Director of Sales and Marketing (I&C)",
    growthSignal: "Actively hiring for I&C segment",
    potentialFit: "Directly from your Apollo target list! Leadership role overseeing Sales and Marketing for the I&C segment. Remote US.",
    url: "https://remoterocketship.com",
    tags: ["Sales", "Marketing", "Remote"]
  },
  {
    id: 19,
    company: "EnterpriseDB (EDB)",
    industry: "SaaS / Database",
    role: "VP, Product Marketing-GTM Enablement & Training",
    growthSignal: "Expanding GTM Enablement team",
    potentialFit: "Directly from your Apollo target list! Leading product marketing, go-to-market enablement, and training strategies. Remote / Chicago.",
    url: "https://indeed.com",
    tags: ["Marketing", "SaaS", "Remote", "Chicago"]
  },
  {
    id: 20,
    company: "ECG Management Consultants",
    industry: "Consulting / Healthcare",
    role: "Vice President of Marketing",
    growthSignal: "Targeting growth-oriented brand architecture",
    potentialFit: "Directly from your Apollo target list! Executive role focused on growth-oriented marketing strategy and brand architecture. Hybrid / Remote flexibility.",
    url: "https://ziprecruiter.com",
    tags: ["Marketing", "Consulting", "Remote"]
  },
  {
    id: 21,
    company: "PwC",
    industry: "Consulting / Professional Services",
    role: "Senior Director, Go-to-Market Strategy",
    growthSignal: "Expanding Advisory Practice",
    potentialFit: "Directly from your Apollo target list! Highly strategic commercial role leading GTM for their growing advisory practice. Chicago, IL.",
    url: "https://jobs.pwc.com",
    tags: ["Marketing", "Consulting", "Chicago"]
  },
  {
    id: 22,
    company: "Intercom",
    industry: "SaaS / Customer Service",
    role: "VP of Sales, North America",
    growthSignal: "Scaling enterprise go-to-market",
    potentialFit: "Directly from your Apollo target list! Massive opportunity to lead North American commercial strategy for a top-tier SaaS company. Chicago / Remote.",
    url: "https://www.intercom.com/careers",
    tags: ["Sales", "SaaS", "Chicago"]
  },
  {
    id: 23,
    company: "Alvarez & Marsal",
    industry: "Consulting / Restructuring",
    role: "Senior Director of Marketing, Private Equity Services",
    growthSignal: "Aggressive growth in PE practice",
    potentialFit: "Directly from your Apollo target list! Demands high-level strategic marketing aligned with complex private equity client needs. Chicago, IL.",
    url: "https://www.alvarezandmarsal.com/careers",
    tags: ["Marketing", "Consulting", "Chicago"]
  },
  {
    id: 24,
    company: "Publicis Groupe",
    industry: "Marketing / Advertising",
    role: "VP of Revenue Marketing",
    growthSignal: "Global transformation initiatives",
    potentialFit: "Directly from your Apollo target list! Perfect overlap with your agency and integrated media background. Remote.",
    url: "https://careers.publicisgroupe.com/",
    tags: ["Marketing", "Advertising", "Remote"]
  }
];
