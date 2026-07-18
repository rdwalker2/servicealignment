// ============================================================
// Closed Lost Seeds — Auto-generated from SFDC CL/DQ export
// 106 deals across Jan–Jun 2026 for JL, MA, TH
// Feeds the Closed Lost Audit (Redemption) page
// ============================================================

// No imports needed — we read/write localStorage directly for reliable bulk seeding

// ── Seed Interface ──

export interface ClosedLostSeed {
  repId: string;          // rep-jl | rep-ma | rep-th
  company: string;        // Account Name
  amount: number;         // Deal value ($)
  closeDate: string;      // MM/DD/YYYY — actual close date
  source: string;         // Inbound | Outbound
  industry: string;       // SFDC industry
  lossPrimary: string;    // budget | competitor | no-decision | timing | champion-left | internal-solution | other
  lossNotes: string;      // Free-text loss context
  sfLostReason: string;   // SFDC Closed Lost reason picklist
  sfDqReason: string;     // SFDC Disqualified reason picklist
}

// ── Closed Lost Seed Records ──
// Grouped by rep, then chronologically by close date

export const CLOSED_LOST_SEEDS: ClosedLostSeed[] = [

  // ════════════════════════════════════════════════════════════════
  // REP-JL — 42 deals
  // ════════════════════════════════════════════════════════════════

  // JL — January 2026
  { repId: 'rep-jl', company: 'Eagle Mountain Casino', amount: 19000, closeDate: '1/7/2026', source: 'Outbound', industry: 'Entertainment', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'Gottlieb & Greenspan', amount: 8000, closeDate: '1/12/2026', source: 'Inbound', industry: 'Law Practice', lossPrimary: 'timing', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'Resolvium Mediation Group', amount: 0, closeDate: '1/12/2026', source: 'Inbound', industry: 'Legal Services', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'Resoursa Group', amount: 3500, closeDate: '1/20/2026', source: 'Outbound', industry: 'Recruitment Firm', lossPrimary: 'budget', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'Whitestone', amount: 0, closeDate: '1/22/2026', source: 'Outbound', industry: 'Marketing and Advertising', lossPrimary: 'other', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'Creed Medical Group', amount: 3025, closeDate: '1/27/2026', source: 'Inbound', industry: 'Hospital and Health Care', lossPrimary: 'other', lossNotes: '', sfLostReason: '', sfDqReason: '' },

  // JL — February 2026
  { repId: 'rep-jl', company: 'Neighborhood Recovery Community Development Corporation', amount: 4200, closeDate: '2/3/2026', source: 'Inbound', industry: 'Non-profit Organization Management', lossPrimary: 'other', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'SciVida', amount: 4125, closeDate: '2/4/2026', source: 'Inbound', industry: 'Business Services', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'San Lorenzo Unified School District', amount: 0, closeDate: '2/16/2026', source: 'Outbound', industry: 'Primary/Secondary Education', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'City of Iowa Colony', amount: 4125, closeDate: '2/16/2026', source: 'Outbound', industry: 'Government', lossPrimary: 'internal-solution', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'Tru Heritage Life', amount: 0, closeDate: '2/16/2026', source: 'Inbound', industry: 'Insurance', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'Enterprise Knowledge', amount: 6000, closeDate: '2/16/2026', source: 'Inbound', industry: 'Information Technology and Services', lossPrimary: 'other', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'Safemobile', amount: 0, closeDate: '2/24/2026', source: 'Inbound', industry: 'software', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },

  // JL — March 2026
  { repId: 'rep-jl', company: 'Index Search', amount: 4100, closeDate: '3/2/2026', source: 'Inbound', industry: 'Recruitment Firm', lossPrimary: 'other', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'Bipartisan Policy Center', amount: 6000, closeDate: '3/2/2026', source: 'Outbound', industry: 'Think Tanks', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'BranchlyHR', amount: 0, closeDate: '3/2/2026', source: 'Inbound', industry: 'Information Technology and Services', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'Picture Pros', amount: 4125, closeDate: '3/23/2026', source: 'Inbound', industry: 'Business Services', lossPrimary: 'other', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'Noetic', amount: 4300, closeDate: '3/23/2026', source: 'Inbound', industry: 'Information Technology and Services', lossPrimary: 'budget', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'HUM', amount: 4100, closeDate: '3/24/2026', source: 'Inbound', industry: 'Individual and Family Services', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'Equity Smith', amount: 0, closeDate: '3/30/2026', source: 'Inbound', industry: 'Investment Management', lossPrimary: 'internal-solution', lossNotes: '', sfLostReason: '', sfDqReason: '' },

  // JL — April 2026
  { repId: 'rep-jl', company: 'Corporate Risk Solutions', amount: 3500, closeDate: '4/7/2026', source: 'Inbound', industry: 'Insurance', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'Konnect Agency', amount: 4600, closeDate: '4/16/2026', source: 'Inbound', industry: 'Marketing and Advertising', lossPrimary: 'other', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'Foundation Escrow', amount: 0, closeDate: '4/20/2026', source: 'Outbound', industry: 'Investment banking', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'TPI Global Solutions', amount: 0, closeDate: '4/20/2026', source: 'Outbound', industry: 'Staffing and Recruiting', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'Thrive Homes LLC', amount: 0, closeDate: '4/20/2026', source: 'Inbound', industry: 'Real Estate', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'Disrupt Life', amount: 0, closeDate: '4/21/2026', source: 'Outbound', industry: 'Internet', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'HangoutwithJo', amount: 0, closeDate: '4/29/2026', source: 'Inbound', industry: 'Media Production', lossPrimary: 'no-decision', lossNotes: 'her use case was not something that we handle.', sfLostReason: '', sfDqReason: 'No Identified Pain' },
  { repId: 'rep-jl', company: 'Callibrity Solutions, LLC', amount: 10000, closeDate: '4/30/2026', source: 'Outbound', industry: 'Information Technology and Services', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'Justice Federal Credit Union', amount: 0, closeDate: '4/30/2026', source: 'Outbound', industry: 'Banking', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },

  // JL — May 2026
  { repId: 'rep-jl', company: 'New Bloom Solutions', amount: 0, closeDate: '5/5/2026', source: 'Inbound', industry: 'Business Services', lossPrimary: 'no-decision', lossNotes: 'No showed 2 calls and let me know it\'s just not a priority for them right now ahead of today\'s call.', sfLostReason: '', sfDqReason: 'Pain Not Strong Enough / Low Urgency' },
  { repId: 'rep-jl', company: 'Academy of the Pacific Rim Charter School', amount: 4100, closeDate: '5/15/2026', source: 'Inbound', industry: 'Education', lossPrimary: 'budget', lossNotes: 'Kelly went from expecting budget to increase to it being cut in almost half. She has to let go of people on her team and even with a price match from us she can\'t justify the transition to a new syste', sfLostReason: 'Budget Constraints', sfDqReason: '' },
  { repId: 'rep-jl', company: 'Wigglitz', amount: 8200, closeDate: '5/15/2026', source: 'Inbound', industry: 'Retail', lossPrimary: 'timing', lossNotes: 'No showed first 2 calls and then became unresponsive, following SSR intro', sfLostReason: '', sfDqReason: 'No Show / Meeting Cancelled' },
  { repId: 'rep-jl', company: 'Textbook Painting', amount: 7780, closeDate: '5/15/2026', source: 'Inbound', industry: 'Business Services', lossPrimary: 'internal-solution', lossNotes: 'No longer moving forward following intial disco and narrowed down to different comp', sfLostReason: 'Internal Decision / Stakeholder Block', sfDqReason: '' },
  { repId: 'rep-jl', company: 'Agricruit', amount: 4000, closeDate: '5/29/2026', source: 'Inbound', industry: 'Staffing & Recruiting', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'Ticketure', amount: 7150, closeDate: '5/29/2026', source: 'Inbound', industry: 'Computer Software', lossPrimary: 'no-decision', lossNotes: 'Fraud detection / spam filter signals. Going with Ashby for "stronger" fraud detection tools which is a big concern for them. Ashby can track signals related to type of Device, IP location v location ', sfLostReason: 'Missing Feature', sfDqReason: '' },
  { repId: 'rep-jl', company: 'Sierra Air Conditioning & Plumbing', amount: 13000, closeDate: '5/31/2026', source: 'Outbound', industry: 'Construction', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'Zawyer Sports & Entertainment', amount: 10500, closeDate: '5/31/2026', source: 'Outbound', industry: 'Performing Arts', lossPrimary: 'timing', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'Digital BGA', amount: 4125, closeDate: '5/31/2026', source: 'Inbound', industry: 'Insurance', lossPrimary: 'no-decision', lossNotes: 'they were "seeing what is out there". I\'ve stayed in touch with Melissa who let me know that they\'d be building their own in house solution', sfLostReason: '', sfDqReason: 'Pain Not Strong Enough / Low Urgency' },
  { repId: 'rep-jl', company: 'Scout Clinical', amount: 0, closeDate: '5/31/2026', source: 'Inbound', industry: 'Research', lossPrimary: 'other', lossNotes: 'duplicate of first opp', sfLostReason: '', sfDqReason: 'Other' },

  // JL — June 2026
  { repId: 'rep-jl', company: '3MG Roofing & Solar', amount: 0, closeDate: '6/1/2026', source: 'Outbound', industry: 'Construction', lossPrimary: 'timing', lossNotes: 'cancel and then no show', sfLostReason: '', sfDqReason: 'No Show / Meeting Cancelled' },
  { repId: 'rep-jl', company: 'Counslr', amount: 0, closeDate: '6/9/2026', source: 'Outbound', industry: 'Mental Health Care', lossPrimary: 'no-decision', lossNotes: 'Low urgency, no answer to follow up calls', sfLostReason: '', sfDqReason: 'Pain Not Strong Enough / Low Urgency' },
  { repId: 'rep-jl', company: 'El Cortez Hotel & Casino', amount: 0, closeDate: '6/30/2026', source: 'Outbound', industry: 'Entertainment', lossPrimary: 'other', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-jl', company: 'Mayersohn Law Group', amount: 3025, closeDate: '6/30/2026', source: 'Inbound', industry: 'Law Practice', lossPrimary: 'champion-left', lossNotes: 'Champion, Ryan, has taken a new job', sfLostReason: '', sfDqReason: 'No Champion' },
  { repId: 'rep-jl', company: 'TorHoerman Law', amount: 6000, closeDate: '6/30/2026', source: 'Outbound', industry: 'Law Firms & Legal Services', lossPrimary: 'champion-left', lossNotes: 'Champion, Ryan, has taken a new role.', sfLostReason: '', sfDqReason: 'No Champion' },
  { repId: 'rep-jl', company: 'Bolt Talent', amount: 4160, closeDate: '6/30/2026', source: 'Inbound', industry: 'Recruitment Firm', lossPrimary: 'timing', lossNotes: 'was looking at TT as a future ATS and wanted to use for specific project in Ireland. She has gone quiet since, close/lost but add to agressive nurture cadence', sfLostReason: 'No Decision Made/ No Change', sfDqReason: '' },
  { repId: 'rep-jl', company: 'Fidencor', amount: 0, closeDate: '6/30/2026', source: 'Inbound', industry: 'Information Technology and Services', lossPrimary: 'timing', lossNotes: 'no first call', sfLostReason: '', sfDqReason: 'No Show / Meeting Cancelled' },
  { repId: 'rep-jl', company: 'Farmers Insurance - Kaysville', amount: 5500, closeDate: '6/30/2026', source: 'Inbound', industry: 'Insurance', lossPrimary: 'budget', lossNotes: 'firm budget of 1800. Wouldn\'t take larger call unless we could guarantee that the price would get this low...', sfLostReason: 'Price / Budget Constraints', sfDqReason: '' },

  // ════════════════════════════════════════════════════════════════
  // REP-MA — 28 deals
  // ════════════════════════════════════════════════════════════════

  // MA — January 2026
  { repId: 'rep-ma', company: 'HireLatam', amount: 4125, closeDate: '1/6/2026', source: 'Outbound', industry: 'Staffing and Recruiting', lossPrimary: 'other', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-ma', company: 'Cure Home Health', amount: 0, closeDate: '1/6/2026', source: 'Inbound', industry: 'Hospital and Health Care', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-ma', company: 'Protective Industrial Polymers, Inc.', amount: 3025, closeDate: '1/6/2026', source: 'Inbound', industry: 'Building Materials', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-ma', company: 'McCurtain County', amount: 8000, closeDate: '1/6/2026', source: 'Inbound', industry: 'Public Safety', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-ma', company: 'The Agency Fund', amount: 2000, closeDate: '1/6/2026', source: 'Inbound', industry: 'NonProfit Organization Management', lossPrimary: 'budget', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-ma', company: 'ProwlerPro, Inc.', amount: 0, closeDate: '1/20/2026', source: 'Inbound', industry: 'Computer and Network Security', lossPrimary: 'budget', lossNotes: '', sfLostReason: '', sfDqReason: '' },

  // MA — February 2026
  { repId: 'rep-ma', company: 'Young Automotive, Inc', amount: 2500, closeDate: '2/10/2026', source: 'Inbound', industry: 'Automotive', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-ma', company: 'Alpha 3 Logistics', amount: 1250, closeDate: '2/10/2026', source: 'Outbound', industry: 'Logistics and Supply Chain', lossPrimary: 'timing', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-ma', company: 'drautorepair.com', amount: 0, closeDate: '2/20/2026', source: 'Outbound', industry: 'Automotive', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },

  // MA — March 2026
  { repId: 'rep-ma', company: 'Moran Family of Brands', amount: 3025, closeDate: '3/10/2026', source: 'Outbound', industry: 'Automotive', lossPrimary: 'budget', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-ma', company: 'BiVACOR', amount: 3025, closeDate: '3/11/2026', source: 'Inbound', industry: 'Medical Devices', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-ma', company: 'Resetting the Table', amount: 3025, closeDate: '3/23/2026', source: 'Inbound', industry: 'Membership Organizations', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-ma', company: 'Hospitality Restaurant Group', amount: 12000, closeDate: '3/27/2026', source: 'Outbound', industry: 'Restaurants', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-ma', company: 'Institute for Law & AI (LawAI)', amount: 4125, closeDate: '3/27/2026', source: 'Inbound', industry: 'Research', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-ma', company: 'DryFork Diesel & Auto Repair', amount: 0, closeDate: '3/30/2026', source: 'Outbound', industry: 'Transportation/Trucking/Railroad', lossPrimary: 'timing', lossNotes: '', sfLostReason: '', sfDqReason: '' },

  // MA — April 2026
  { repId: 'rep-ma', company: 'Littlefield Unified School District', amount: 6000, closeDate: '4/1/2026', source: 'Outbound', industry: 'Primary/Secondary Education', lossPrimary: 'other', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-ma', company: 'Realtracs', amount: 1250, closeDate: '4/2/2026', source: 'Inbound', industry: 'Real Estate', lossPrimary: 'budget', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-ma', company: 'Glocap', amount: 0, closeDate: '4/2/2026', source: 'Inbound', industry: 'HR & Staffing', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-ma', company: 'kineticapps.ai', amount: 0, closeDate: '4/2/2026', source: 'Inbound', industry: 'Business Services', lossPrimary: 'budget', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-ma', company: 'Augusto Digital', amount: 4125, closeDate: '4/13/2026', source: 'Inbound', industry: 'Finance', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-ma', company: 'Flowz Staffing', amount: 0, closeDate: '4/13/2026', source: 'Inbound', industry: 'Recruitment Firm', lossPrimary: 'timing', lossNotes: '', sfLostReason: '', sfDqReason: '' },

  // MA — May 2026
  { repId: 'rep-ma', company: 'Pattern Bioscience', amount: 9500, closeDate: '5/30/2026', source: 'Inbound', industry: 'Biotechnology', lossPrimary: 'competitor', lossNotes: 'Dont want to go through the whole training process. GH came in and matched us for renewal. The team wants to stay with familiarity', sfLostReason: 'Chose Existing Vendor', sfDqReason: '' },
  { repId: 'rep-ma', company: 'Valentis', amount: 9000, closeDate: '5/31/2026', source: 'Inbound', industry: 'Security & Investigations', lossPrimary: 'other', lossNotes: 'Other', sfLostReason: 'Other', sfDqReason: '' },

  // MA — June 2026
  { repId: 'rep-ma', company: 'Career Developers, Inc.', amount: 4100, closeDate: '6/30/2026', source: 'Outbound', industry: 'Staffing and Recruiting', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-ma', company: 'Neuropath Behavioral Healthcare', amount: 4125, closeDate: '6/30/2026', source: 'Inbound', industry: 'Hospitals & Physicians Clinics', lossPrimary: 'no-decision', lossNotes: 'Wants an ai product that can source and evaluate', sfLostReason: '', sfDqReason: 'Product Gap' },
  { repId: 'rep-ma', company: 'Titan Ridget Talent', amount: 0, closeDate: '6/30/2026', source: 'Inbound', industry: 'Recruitment Firm', lossPrimary: 'no-decision', lossNotes: 'Wants a recruitment focused ATS that can handle not only source but the sales side of recruitment', sfLostReason: '', sfDqReason: 'Product Gap' },
  { repId: 'rep-ma', company: 'WestCode Ai', amount: 0, closeDate: '6/30/2026', source: 'Inbound', industry: 'Business Services', lossPrimary: 'timing', lossNotes: 'API has been very buggy during testing', sfLostReason: 'No Decision Made/ No Change', sfDqReason: '' },

  // ════════════════════════════════════════════════════════════════
  // REP-TH — 36 deals
  // ════════════════════════════════════════════════════════════════

  // TH — January 2026
  { repId: 'rep-th', company: 'Phira Ventures', amount: 5875, closeDate: '1/6/2026', source: 'Inbound', industry: 'Venture Capital and Private Equity', lossPrimary: 'other', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-th', company: 'Chicago Sport and Social Club', amount: 0, closeDate: '1/13/2026', source: 'Outbound', industry: 'Sports', lossPrimary: 'other', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-th', company: 'Envestnet Yodlee', amount: 0, closeDate: '1/13/2026', source: 'Outbound', industry: 'Computer Software', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-th', company: 'Vinamae Manaois Agency', amount: 2800, closeDate: '1/13/2026', source: 'Outbound', industry: 'Insurance', lossPrimary: 'internal-solution', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-th', company: 'Xavvi', amount: 0, closeDate: '1/20/2026', source: 'Inbound', industry: 'Information Technology and Services', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-th', company: 'Reality Based Group', amount: 0, closeDate: '1/21/2026', source: 'Inbound', industry: 'Business Services', lossPrimary: 'budget', lossNotes: 'They were not able to come up in budget to get to our 50% discount.', sfLostReason: 'Price / Budget Constraints', sfDqReason: '' },

  // TH — February 2026
  { repId: 'rep-th', company: 'Carter & Sloope', amount: 8000, closeDate: '2/2/2026', source: 'Inbound', industry: 'Engineering and Design', lossPrimary: 'budget', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-th', company: 'Iris Aero', amount: 1250, closeDate: '2/17/2026', source: 'Inbound', industry: 'Airlines/Aviation', lossPrimary: 'other', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-th', company: 'RFG Advisory', amount: 7200, closeDate: '2/24/2026', source: 'Inbound', industry: 'Financial Services', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-th', company: 'e-m.world', amount: 1250, closeDate: '2/27/2026', source: 'Outbound', industry: 'Non-profit Organization Management', lossPrimary: 'other', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-th', company: 'Community Builders of Kansas City', amount: 3025, closeDate: '2/27/2026', source: 'Outbound', industry: 'Construction', lossPrimary: 'other', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-th', company: 'Porchlight', amount: 0, closeDate: '2/27/2026', source: 'Outbound', industry: 'Organizations', lossPrimary: 'other', lossNotes: '', sfLostReason: '', sfDqReason: '' },

  // TH — March 2026
  { repId: 'rep-th', company: 'Energy Elites TX', amount: 0, closeDate: '3/4/2026', source: 'Inbound', industry: 'Staffing and Recruiting', lossPrimary: 'other', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-th', company: 'My Brand Force', amount: 5600, closeDate: '3/17/2026', source: 'Inbound', industry: 'Business Services', lossPrimary: 'budget', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-th', company: 'Iowa Falls State Bank', amount: 0, closeDate: '3/18/2026', source: 'Inbound', industry: 'Banking', lossPrimary: 'budget', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-th', company: 'Flight Services International, LLC', amount: 12000, closeDate: '3/25/2026', source: 'Outbound', industry: 'Airlines/Aviation', lossPrimary: 'internal-solution', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-th', company: 'Aloysius Butler & Clark', amount: 10500, closeDate: '3/25/2026', source: 'Outbound', industry: 'Computer Software', lossPrimary: 'other', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-th', company: 'McMahon Services', amount: 4125, closeDate: '3/25/2026', source: 'Outbound', industry: 'Consumer Services', lossPrimary: 'other', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-th', company: 'Smart Soda', amount: 4125, closeDate: '3/27/2026', source: 'Outbound', industry: 'Food and Beverages', lossPrimary: 'other', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-th', company: 'Switchboard Hiring', amount: 0, closeDate: '3/30/2026', source: 'Inbound', industry: 'Staffing and Recruiting', lossPrimary: 'other', lossNotes: '', sfLostReason: '', sfDqReason: '' },

  // TH — April 2026
  { repId: 'rep-th', company: 'HNM Systems', amount: 11250, closeDate: '4/7/2026', source: 'Inbound', industry: 'Wireless', lossPrimary: 'no-decision', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-th', company: 'Tilda Research', amount: 0, closeDate: '4/23/2026', source: 'Outbound', industry: 'Biotechnology', lossPrimary: 'other', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-th', company: 'Top Dev Crew', amount: 0, closeDate: '4/27/2026', source: 'Inbound', industry: 'Staffing and Recruiting', lossPrimary: 'other', lossNotes: '', sfLostReason: '', sfDqReason: '' },

  // TH — May 2026
  { repId: 'rep-th', company: 'FocusedSoft LLC', amount: 600, closeDate: '5/5/2026', source: '', industry: 'Computer Software', lossPrimary: 'other', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-th', company: 'Shadeform AI', amount: 0, closeDate: '5/7/2026', source: 'Inbound', industry: 'Business Services', lossPrimary: 'timing', lossNotes: 'Did not show and is not responding to rescheduling outreach', sfLostReason: '', sfDqReason: 'No Show / Meeting Cancelled' },
  { repId: 'rep-th', company: 'Encore Leadership Advisors', amount: 0, closeDate: '5/29/2026', source: 'Inbound', industry: 'Staffing and Recruiting', lossPrimary: 'no-decision', lossNotes: 'They wanted a sourcing tool first and have yet to decide on when is right to add an ATS', sfLostReason: '', sfDqReason: 'Exploring Market / Research Only' },
  { repId: 'rep-th', company: 'Sola Insurance', amount: 3200, closeDate: '5/29/2026', source: 'Inbound', industry: 'Insurance', lossPrimary: 'competitor', lossNotes: 'Chose Existing Vendor', sfLostReason: 'Chose Existing Vendor', sfDqReason: '' },
  { repId: 'rep-th', company: 'American Valve', amount: 0, closeDate: '5/29/2026', source: 'Outbound', industry: 'Business Supplies and Equipment', lossPrimary: 'no-decision', lossNotes: 'ATS was not needed', sfLostReason: '', sfDqReason: 'Pain Not Strong Enough / Low Urgency' },
  { repId: 'rep-th', company: 'Elixium Health', amount: 0, closeDate: '5/29/2026', source: 'Inbound', industry: 'Health, Wellness and Fitness', lossPrimary: 'timing', lossNotes: 'Moving to another company no calls', sfLostReason: '', sfDqReason: 'No Show / Meeting Cancelled' },

  // TH — June 2026
  { repId: 'rep-th', company: 'Revecore', amount: 0, closeDate: '6/1/2026', source: 'Outbound', industry: 'Hospital and Health Care', lossPrimary: 'timing', lossNotes: 'No longer wants to meet', sfLostReason: '', sfDqReason: 'No next steps (not priority)' },
  { repId: 'rep-th', company: 'Zoot Enterprises', amount: 0, closeDate: '6/30/2026', source: 'Outbound', industry: 'Computer Software', lossPrimary: 'other', lossNotes: '', sfLostReason: '', sfDqReason: '' },
  { repId: 'rep-th', company: 'Frontera Health', amount: 0, closeDate: '6/30/2026', source: 'Outbound', industry: 'Computer Software', lossPrimary: 'no-decision', lossNotes: 'We did not have fraud detection, monthly payment terms, email functionality to email from their actual emails', sfLostReason: 'Missing Feature', sfDqReason: '' },
];

// ── Date Helpers ──

/**
 * Parse a M/D/YYYY date string into an ISO string.
 * Returns current time ISO if the date is unparseable.
 */
function parseCloseDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

/**
 * Subtract N days from a date string and return ISO.
 * Used to derive created_at (close_date - 30 days).
 */
function subtractDays(dateStr: string, days: number): string {
  if (!dateStr) return new Date().toISOString();
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return new Date().toISOString();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

// ── Seed Function ──

const STORAGE_KEY = 'scc_discovery_sessions_v3';

/**
 * Seeds closed lost / disqualified deals into localStorage.
 * Called from ensureSeedData() which handles version gating.
 * Uses a single bulk write for reliability.
 * Returns the number of sessions created.
 *
 * Sessions are created with `post_mortem_completed: false` so they
 * surface as "Needs Autopsy" in the Closed Lost Audit (Redemption) page.
 */
export function seedClosedLostDeals(): number {

  // Read existing sessions directly from localStorage
  let existing: any[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) existing = JSON.parse(raw);
  } catch { /* empty */ }

  const existingCompanies = new Set(existing.map((s: any) => (s.company_name || '').toLowerCase()));

  const newSessions: any[] = [];

  for (const deal of CLOSED_LOST_SEEDS) {
    // Skip if a session already exists for this company (case-insensitive)
    if (existingCompanies.has(deal.company.toLowerCase())) continue;

    const companySanitized = deal.company.replace(/\W+/g, '_').toLowerCase();
    const closedAtIso = parseCloseDate(deal.closeDate);
    const createdAtIso = subtractDays(deal.closeDate, 30);

    const session = {
      id: `ds_cl_${companySanitized}_${Date.now() + newSessions.length}`,
      rep_id: deal.repId,
      company_name: deal.company,
      company_id: null,
      persona: null,
      current_ats: null,
      industry: deal.industry.toLowerCase().replace(/[&,]/g, '').replace(/\s+/g, '-'),
      company_size: null,
      use_case: null,
      stakeholders: [],
      selected_pains: [],
      roi_inputs: { hiringManagers: 250, totalHires: 400, agencyHires: 50, timeToHire: 45 },
      roi_total: 0,
      alignment_checks: { urgent_priority: false, resources_insufficient: false, problems_solutions: false, roi_sufficient: false, right_solution: false },
      mutual_commitments: { executive_sponsor: false, dedicated_admin: false, training_completion: false },
      blueprint_approved: false,
      bap_answers: {},
      bap_notes: {},
      budget_confirmed: false,
      implementation_timeline: null,
      deal_value: deal.amount,
      deal_stage: 'closed_lost',
      next_action: '',
      next_meeting_date: null,
      qa_completed: false,
      buyer_intent_validated: false,
      status: 'completed',
      created_at: createdAtIso,
      completed_at: closedAtIso,

      // Loss analysis fields — post_mortem_completed is false so they show as "Needs Autopsy"
      loss_reason: {
        primary: deal.lossPrimary,
        secondary: deal.sfLostReason || deal.sfDqReason,
        notes: deal.lossNotes,
        winback_potential: false,
      },
      post_mortem_completed: false,

      // MEDDPICC / narrative fields — empty defaults
      pain_narrative: '', success_metrics_text: '', decision_criteria: '', decision_process: '',
      paper_process: '', champion_name: '', champion_validation_notes: '', competitive_situation: '',
      economic_buyer_access: '', roi_summary_text: '',
      call_sheet_answers: {}, call_sheet_checkpoints: {}, call_sheet_checkpoint_reasons: {},
      call_sheet_persona: null, call_sheet_cost_of_problem: '', call_sheet_target_date: '',
      handoff_current_hris: '', handoff_calendar_system: '', handoff_sso_provider: '',
      handoff_sso_required: false, handoff_infosec_review_required: false,
      handoff_current_career_site_url: '', handoff_custom_domain: '', handoff_brand_maturity: '',
      handoff_department_count: 0, handoff_location_count: 0, handoff_active_hiring_managers: 0,
      handoff_active_recruiters: 0, handoff_active_jobs_count: 0, handoff_candidate_count_estimate: 0,
      handoff_data_migration_notes: '', handoff_job_boards: [], handoff_hris_integration: '',
      handoff_other_integrations: [], handoff_target_go_live_date: '', handoff_launch_type: '',
      handoff_go_live_notes: '', handoff_users_to_train: 0, handoff_training_format: '',
      handoff_training_notes: '', handoff_primary_contact_email: '', handoff_it_contact_email: '',
      handoff_preferred_comm_channel: '', handoff_target_time_to_hire: 0, handoff_target_cost_per_hire: 0,
      handoff_target_adoption_rate: 0, handoff_success_review_date: '', handoff_prework_items: [],
      handoff_prework_notes: '', handoff_gdpr_applicable: false, handoff_data_retention_months: 0,
      handoff_dpa_required: false, handoff_compliance_notes: '',
      contract_end_date: '', competing_priorities: '', competitors_identified: '',
      competitors_count: 0, sentiment_score: 0, sentiment_gap: '',
      existing_tt_customer: false, budget_ballpark_requested: false,
      demo_prep_checklist: {}, enabled_playbook_ids: undefined,
      granola_notes: [], rep_forecast: 50,
      open_roles_count: 0, lead_source: (deal.source || 'outbound').toLowerCase(),
      system_count: 0, division_count: 0, evaluation_stage: null,
      pricing_region: 'us', pricing_vertical: 'non-staffing', pricing_employee_count: 0,
      pricing_base_price: 0, pricing_override: false, pricing_contract_term: 1,
      pricing_discount_pct: 0, pricing_add_ons: [], pricing_notes: '',
      pricing_price_cap_pct: undefined, pricing_promo_free_months: undefined,
      pricing_promo_label: undefined,
      objections: [],
    };

    newSessions.push(session);
  }

  // Bulk write all sessions at once
  if (newSessions.length > 0) {
    // Re-read in case other seeds were just written
    let current: any[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) current = JSON.parse(raw);
    } catch { /* empty */ }

    const allSessions = [...current, ...newSessions];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allSessions));
  }

  return newSessions.length;
}
