export type Company = {
  id: string;
  name: string;
  industry: 'Food & Beverage' | 'Retail' | 'Hospitality' | 'Tech & Software' | 'Automotive' | 'Consumer Brands' | 'Fitness & Wellness';
  employeeCount: number;
  openRoles: number;
  hiringVelocityScore: number; // 1-100
  currentAts: 'Greenhouse' | 'Lever' | 'Workday' | 'Workable' | 'None' | 'Unknown' | 'Taleo' | 'BambooHR' | 'JazzHR';
  employerBrandScore: number; // 1-100 (lower means they desperately need Service Alignment)
  lastFundingRound?: string;
  hq: string;
  notes: string;
  painPoint?: string;
};

export const mockDatabase: Company[] = [
  // RETAIL & APPAREL
  {
    id: 'c_001', name: 'Allbirds', industry: 'Retail', employeeCount: 1200, openRoles: 45, hiringVelocityScore: 82, currentAts: 'Greenhouse', employerBrandScore: 75, hq: 'San Francisco, CA', notes: 'Sustainable footwear, high retail associate turnover.', painPoint: 'High retail associate turnover requires constant pipeline. Need SMS recruiting and mobile-first flows.'
  },
  {
    id: 'c_002', name: 'Vuori', industry: 'Retail', employeeCount: 850, openRoles: 110, hiringVelocityScore: 95, currentAts: 'Workable', employerBrandScore: 60, hq: 'Encinitas, CA', notes: 'Massive retail expansion ongoing.', painPoint: 'Store managers need autonomy to hire without requiring HR bottleneck.'
  },
  {
    id: 'c_003', name: 'Everlane', industry: 'Retail', employeeCount: 150, openRoles: 8, hiringVelocityScore: 65, currentAts: 'BambooHR', employerBrandScore: 80, hq: 'San Francisco, CA', notes: 'Transparent pricing DTC brand. Lean team, selective hiring for retail and e-commerce roles.', painPoint: 'BambooHR lacks career page customization. Cannot showcase brand story to attract mission-aligned applicants.'
  },
  {
    id: 'c_004', name: 'UNTUCKit', industry: 'Retail', employeeCount: 600, openRoles: 40, hiringVelocityScore: 70, currentAts: 'Workday', employerBrandScore: 50, hq: 'New York, NY', notes: '80+ retail locations.', painPoint: 'Stuck in an expensive Enterprise Provider contract that is overkill for retail store hiring.'
  },
  {
    id: 'c_005', name: 'Glossier', industry: 'Consumer Brands', employeeCount: 1100, openRoles: 25, hiringVelocityScore: 60, currentAts: 'Greenhouse', employerBrandScore: 85, hq: 'New York, NY', notes: 'Cult-favorite beauty brand.', painPoint: 'Need better passive talent nurturing CRM to leverage their massive consumer fanbase.'
  },
  {
    id: 'c_006', name: 'Alo Yoga', industry: 'Retail', employeeCount: 2500, openRoles: 180, hiringVelocityScore: 98, currentAts: 'Taleo', employerBrandScore: 45, hq: 'Los Angeles, CA', notes: 'Rapid studio & retail expansion globally.', painPoint: 'Using Taleo for fast-paced retail hiring leads to massive candidate drop-off on mobile.'
  },
  {
    id: 'c_007', name: 'Warby Parker', industry: 'Retail', employeeCount: 3000, openRoles: 120, hiringVelocityScore: 85, currentAts: 'Greenhouse', employerBrandScore: 78, hq: 'New York, NY', notes: 'Omnichannel eyewear.', painPoint: 'Optometrist hiring is highly competitive; requires targeted outbound CRM sequences.'
  },
  {
    id: 'c_008', name: 'Rothy\'s', industry: 'Retail', employeeCount: 500, openRoles: 35, hiringVelocityScore: 75, currentAts: 'Lever', employerBrandScore: 65, hq: 'San Francisco, CA', notes: 'Sustainable fashion.', painPoint: 'Need to lower agency spend by converting more consumer traffic into applicants.'
  },

  // FOOD & HOSPITALITY
  {
    id: 'c_009', name: 'Sweetgreen', industry: 'Food & Beverage', employeeCount: 6000, openRoles: 350, hiringVelocityScore: 99, currentAts: 'Workday', employerBrandScore: 60, hq: 'Los Angeles, CA', notes: 'High volume QSR hiring.', painPoint: 'Complex Provider creates friction for entry-level workers. Need no-login, mobile applications.'
  },
  {
    id: 'c_010', name: 'CAVA', industry: 'Food & Beverage', employeeCount: 8000, openRoles: 410, hiringVelocityScore: 100, currentAts: 'Unknown', employerBrandScore: 55, hq: 'Washington, DC', notes: 'Post-IPO massive expansion.', painPoint: 'Need automated screening triggers to weed out unqualified applicants before managers review.'
  },
  {
    id: 'c_011', name: 'Shake Shack', industry: 'Food & Beverage', employeeCount: 12000, openRoles: 500, hiringVelocityScore: 95, currentAts: 'Workday', employerBrandScore: 70, hq: 'New York, NY', notes: 'Global burger chain.', painPoint: 'Store managers need a dedicated app to handle walk-in applicants instantly.'
  },
  {
    id: 'c_012', name: 'Mendocino Farms', industry: 'Food & Beverage', employeeCount: 180, openRoles: 18, hiringVelocityScore: 88, currentAts: 'JazzHR', employerBrandScore: 45, hq: 'El Segundo, CA', notes: 'Upscale sandwich/salad chain, ~35 locations. Growing fast in SoCal.', painPoint: 'JazzHR is too basic for multi-location hiring. GMs email resumes to each other. No centralized pipeline.'
  },
  {
    id: 'c_013', name: 'Dutch Bros Coffee', industry: 'Food & Beverage', employeeCount: 15000, openRoles: 600, hiringVelocityScore: 100, currentAts: 'Taleo', employerBrandScore: 50, hq: 'Grants Pass, OR', notes: 'Drive-thru coffee chain.', painPoint: 'Hiring Gen Z workers but using a legacy application process. Massive candidate drop-off.'
  },
  {
    id: 'c_014', name: 'Velvet Taco', industry: 'Food & Beverage', employeeCount: 120, openRoles: 14, hiringVelocityScore: 85, currentAts: 'None', employerBrandScore: 40, hq: 'Dallas, TX', notes: 'Late-night premium tacos, ~40 locations. No HR tech stack at all.', painPoint: 'Zero Provider. GMs collect paper applications and text candidates from personal phones. No compliance trail.'
  },
  {
    id: 'c_015', name: 'First Watch', industry: 'Food & Beverage', employeeCount: 10000, openRoles: 220, hiringVelocityScore: 90, currentAts: 'Workday', employerBrandScore: 55, hq: 'Bradenton, FL', notes: 'Daytime cafe.', painPoint: 'Per-seat licensing costs mean shift supervisors cannot access the Provider to review resumes.'
  },
  {
    id: 'c_016', name: 'Dig Inn', industry: 'Food & Beverage', employeeCount: 95, openRoles: 12, hiringVelocityScore: 80, currentAts: 'BambooHR', employerBrandScore: 60, hq: 'New York, NY', notes: 'Farm-to-table fast casual, ~15 locations in NYC metro. Outgrowing basic HR tools.', painPoint: 'BambooHR recruiting add-on is clunky. Need a real career page for each neighborhood location to attract local talent.'
  },

  // FITNESS & WELLNESS
  {
    id: 'c_017', name: 'Barry\'s', industry: 'Fitness & Wellness', employeeCount: 160, openRoles: 15, hiringVelocityScore: 85, currentAts: 'JazzHR', employerBrandScore: 75, hq: 'Los Angeles, CA', notes: 'Boutique HIIT studios, ~80 locations. Instructor-dependent business model.', painPoint: 'JazzHR cannot handle referral tracking. Instructor hiring is 90% word-of-mouth with zero attribution data.'
  },
  {
    id: 'c_018', name: '[solidcore]', industry: 'Fitness & Wellness', employeeCount: 140, openRoles: 16, hiringVelocityScore: 92, currentAts: 'None', employerBrandScore: 50, hq: 'Washington, DC', notes: 'Pilates-inspired fitness, ~100 studios. Using spreadsheets and email for all hiring.', painPoint: 'No Provider at all. Studio managers post to Indeed individually with no coordination. Duplicate candidate outreach is constant.'
  },
  {
    id: 'c_019', name: 'CorePower Yoga', industry: 'Fitness & Wellness', employeeCount: 3000, openRoles: 150, hiringVelocityScore: 88, currentAts: 'Workday', employerBrandScore: 65, hq: 'Denver, CO', notes: 'Largest US yoga chain.', painPoint: 'Studio managers are locked out of the Provider due to licensing costs.'
  },
  {
    id: 'c_020', name: 'Orangetheory', industry: 'Fitness & Wellness', employeeCount: 5000, openRoles: 280, hiringVelocityScore: 96, currentAts: 'Taleo', employerBrandScore: 35, hq: 'Boca Raton, FL', notes: 'Franchise fitness.', painPoint: 'Franchisees need an easy-to-use system, but corporate mandates an outdated enterprise Provider.'
  },
  {
    id: 'c_021', name: 'F45 Training', industry: 'Fitness & Wellness', employeeCount: 4000, openRoles: 200, hiringVelocityScore: 90, currentAts: 'Workable', employerBrandScore: 45, hq: 'Austin, TX', notes: 'Global fitness franchise.', painPoint: 'Inconsistent employer branding across hundreds of franchise locations.'
  },
  {
    id: 'c_022', name: 'SoulCycle', industry: 'Fitness & Wellness', employeeCount: 1500, openRoles: 45, hiringVelocityScore: 70, currentAts: 'Greenhouse', employerBrandScore: 80, hq: 'New York, NY', notes: 'Indoor cycling.', painPoint: 'Need to nurture passive candidates (riders) into future instructors via CRM.'
  },
  {
    id: 'c_023', name: 'Equinox', industry: 'Fitness & Wellness', employeeCount: 10000, openRoles: 320, hiringVelocityScore: 85, currentAts: 'Workday', employerBrandScore: 70, hq: 'New York, NY', notes: 'Luxury fitness clubs.', painPoint: 'High turnover in sales and front desk roles requires automated SMS screening.'
  },

  // ADDITIONAL RETAIL & APPAREL
  {
    id: 'c_026', name: 'Lululemon', industry: 'Retail', employeeCount: 34000, openRoles: 1200, hiringVelocityScore: 98, currentAts: 'Workday', employerBrandScore: 70, hq: 'Vancouver, BC', notes: 'Massive global retail presence.', painPoint: 'Educator (retail associate) hiring requires intense volume but local store manager control.'
  },
  {
    id: 'c_027', name: 'Patagonia', industry: 'Retail', employeeCount: 3000, openRoles: 150, hiringVelocityScore: 70, currentAts: 'Greenhouse', employerBrandScore: 95, hq: 'Ventura, CA', notes: 'Elite employer branding.', painPoint: 'High volume of unqualified applicants due to brand prestige. Needs automated filtering.'
  },
  {
    id: 'c_028', name: 'Madewell', industry: 'Retail', employeeCount: 2500, openRoles: 210, hiringVelocityScore: 85, currentAts: 'Taleo', employerBrandScore: 60, hq: 'New York, NY', notes: 'J.Crew spin-off.', painPoint: 'Legacy Taleo system causes 60% drop-off rate for mobile applicants.'
  },
  {
    id: 'c_029', name: 'Bonobos', industry: 'Retail', employeeCount: 130, openRoles: 10, hiringVelocityScore: 80, currentAts: 'Workable', employerBrandScore: 65, hq: 'New York, NY', notes: 'Menswear DTC brand, ~60 Guideshops. Post-acquisition, lean HR team rebuilding.', painPoint: 'Workable plan is too expensive per-seat for Guideshop managers. Only HQ recruiters can access the system.'
  },
  {
    id: 'c_030', name: 'Reformation', industry: 'Retail', employeeCount: 1000, openRoles: 90, hiringVelocityScore: 88, currentAts: 'Greenhouse', employerBrandScore: 80, hq: 'Los Angeles, CA', notes: 'Fast-growth sustainable fashion.', painPoint: 'Warehouse and retail hiring are disconnected in current Provider setup.'
  },
  {
    id: 'c_031', name: 'Aritzia', industry: 'Retail', employeeCount: 5000, openRoles: 400, hiringVelocityScore: 95, currentAts: 'Workday', employerBrandScore: 65, hq: 'Vancouver, BC', notes: 'High-end retail expansion in US.', painPoint: 'Workday is too complex for store managers to use independently.'
  },
  {
    id: 'c_032', name: 'Sephora', industry: 'Retail', employeeCount: 30000, openRoles: 1500, hiringVelocityScore: 99, currentAts: 'Taleo', employerBrandScore: 75, hq: 'San Francisco, CA', notes: 'LVMH owned.', painPoint: 'Massive seasonal hiring spikes crash their legacy Provider workflows.'
  },
  {
    id: 'c_033', name: 'Ulta Beauty', industry: 'Retail', employeeCount: 45000, openRoles: 2000, hiringVelocityScore: 100, currentAts: 'Workable', employerBrandScore: 60, hq: 'Bolingbrook, IL', notes: 'Expanding salon services within stores.', painPoint: 'Sourcing licensed cosmetologists requires specialized outbound CRM pipelines.'
  },

  // ADDITIONAL FOOD & HOSPITALITY
  {
    id: 'c_034', name: 'Chipotle', industry: 'Food & Beverage', employeeCount: 100000, openRoles: 5000, hiringVelocityScore: 100, currentAts: 'Taleo', employerBrandScore: 50, hq: 'Newport Beach, CA', notes: 'High turnover QSR.', painPoint: 'Need SMS text-to-apply capabilities on every burrito bag to capture local talent.'
  },
  {
    id: 'c_035', name: 'Panera Bread', industry: 'Food & Beverage', employeeCount: 50000, openRoles: 2500, hiringVelocityScore: 95, currentAts: 'Workday', employerBrandScore: 55, hq: 'St. Louis, MO', notes: 'Transitioning to digital-first stores.', painPoint: 'Franchise vs Corporate hiring creates fragmented candidate data pools.'
  },
  {
    id: 'c_036', name: 'Peet\'s Coffee', industry: 'Food & Beverage', employeeCount: 5000, openRoles: 300, hiringVelocityScore: 85, currentAts: 'Greenhouse', employerBrandScore: 65, hq: 'Emeryville, CA', notes: 'Premium coffee competitor.', painPoint: 'Barista hiring requires heavy personality screening before interviews.'
  },
  {
    id: 'c_037', name: 'In-N-Out Burger', industry: 'Food & Beverage', employeeCount: 27000, openRoles: 800, hiringVelocityScore: 88, currentAts: 'Unknown', employerBrandScore: 90, hq: 'Irvine, CA', notes: 'Iconic brand, low turnover.', painPoint: 'Strict hiring standards mean they need better interview scorecard analytics.'
  },
  {
    id: 'c_038', name: 'Tender Greens', industry: 'Food & Beverage', employeeCount: 85, openRoles: 10, hiringVelocityScore: 80, currentAts: 'None', employerBrandScore: 50, hq: 'Los Angeles, CA', notes: 'Chef-driven fast casual, ~30 locations. Executive chefs double as hiring managers.', painPoint: 'No Provider. Chefs forward resumes via personal email. Ownership has zero visibility into hiring pipeline or time-to-fill.'
  },
  {
    id: 'c_039', name: 'True Food Kitchen', industry: 'Food & Beverage', employeeCount: 175, openRoles: 20, hiringVelocityScore: 82, currentAts: 'BambooHR', employerBrandScore: 60, hq: 'Phoenix, AZ', notes: 'Health-focused dining, ~45 locations. Growing nationally but HR team is only 3 people.', painPoint: 'BambooHR recruiting module is an afterthought. GMs skip it entirely and post to Craigslist directly for BOH roles.'
  },
  {
    id: 'c_040', name: 'Nando\'s', industry: 'Food & Beverage', employeeCount: 8000, openRoles: 400, hiringVelocityScore: 90, currentAts: 'Workday', employerBrandScore: 65, hq: 'Washington, DC', notes: 'Global chicken chain expanding in US.', painPoint: 'Need better employer brand localized for US markets.'
  },
  {
    id: 'c_041', name: 'Wawa', industry: 'Retail', employeeCount: 37000, openRoles: 1800, hiringVelocityScore: 98, currentAts: 'Taleo', employerBrandScore: 70, hq: 'Wawa, PA', notes: 'Cult-favorite convenience stores.', painPoint: 'High volume seasonal hiring for summer shore locations is completely broken.'
  },

  // ADDITIONAL FITNESS & WELLNESS
  {
    id: 'c_042', name: 'Planet Fitness', industry: 'Fitness & Wellness', employeeCount: 20000, openRoles: 1200, hiringVelocityScore: 95, currentAts: 'Workday', employerBrandScore: 40, hq: 'Hampton, NH', notes: 'High volume franchise model.', painPoint: 'Franchisees refuse to pay per-seat licenses for Workday, so they hire off-platform.'
  },
  {
    id: 'c_043', name: 'Anytime Fitness', industry: 'Fitness & Wellness', employeeCount: 15000, openRoles: 800, hiringVelocityScore: 90, currentAts: 'None', employerBrandScore: 45, hq: 'Woodbury, MN', notes: '24/7 gym model.', painPoint: 'No centralized system for franchisees to share personal trainer talent pools.'
  },
  {
    id: 'c_044', name: 'Crunch Fitness', industry: 'Fitness & Wellness', employeeCount: 10000, openRoles: 600, hiringVelocityScore: 92, currentAts: 'Taleo', employerBrandScore: 50, hq: 'New York, NY', notes: 'HVLP gym competitor.', painPoint: 'Front desk turnover is 150% annually; need automated re-engagement campaigns.'
  },
  {
    id: 'c_045', name: 'Pure Barre', industry: 'Fitness & Wellness', employeeCount: 110, openRoles: 14, hiringVelocityScore: 85, currentAts: 'JazzHR', employerBrandScore: 60, hq: 'Irvine, CA', notes: 'Xponential Fitness brand, boutique barre studios. Franchisees handle own hiring.', painPoint: 'JazzHR cannot support audition-based hiring workflows. Franchise owners track instructor tryouts in Google Sheets.'
  },
  {
    id: 'c_046', name: 'Club Pilates', industry: 'Fitness & Wellness', employeeCount: 145, openRoles: 18, hiringVelocityScore: 88, currentAts: 'BambooHR', employerBrandScore: 65, hq: 'Irvine, CA', notes: 'Largest Pilates franchise, ~750 studios. Corporate team is lean, franchisees hire independently.', painPoint: 'BambooHR career page is generic. Each franchise location needs its own branded career page to attract local instructors.'
  },
  {
    id: 'c_047', name: 'Row House', industry: 'Fitness & Wellness', employeeCount: 65, openRoles: 8, hiringVelocityScore: 75, currentAts: 'None', employerBrandScore: 55, hq: 'New York, NY', notes: 'Boutique rowing studios, ~100 locations. Niche fitness concept with tiny corporate team.', painPoint: 'No Provider. Studio owners post to Instagram and pray. Zero structured hiring process for certified rowing coaches.'
  },

  // CONTROL GROUP (Software/B2B to show ICP exclusion)
  {
    id: 'c_024', name: 'Databricks', industry: 'Tech & Software', employeeCount: 5000, openRoles: 400, hiringVelocityScore: 90, currentAts: 'Greenhouse', employerBrandScore: 95, hq: 'San Francisco, CA', notes: 'Enterprise AI Data company.', painPoint: 'Need highly technical API integrations, not an ICP for Service Alignment retail pitch.'
  },
  {
    id: 'c_025', name: 'Palo Alto Networks', industry: 'Tech & Software', employeeCount: 12000, openRoles: 250, hiringVelocityScore: 70, currentAts: 'Workday', employerBrandScore: 88, hq: 'Santa Clara, CA', notes: 'Enterprise cybersecurity.', painPoint: 'FedRAMP compliance is priority #1 over user experience.'
  }
];

// Calculate derived metrics
export const getTargetingScore = (company: Company) => {
  // Service Alignment wins when Hiring Velocity is High and Employer Brand Score is Low
  // We apply a massive penalty for Tech/Software companies as they aren't the primary ICP
  
  if (company.industry === 'Tech & Software') {
    return Math.round(company.hiringVelocityScore * 0.2); // Artificial penalty
  }

  const brandDeficit = 100 - company.employerBrandScore;
  const rawScore = (company.hiringVelocityScore * 0.6) + (brandDeficit * 0.4);
  
  return Math.round(rawScore);
};
