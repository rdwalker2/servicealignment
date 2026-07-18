// ── Phase question IDs (consistent across all persona sheets) ──

export const D1_IDS = ['q1', 'q1b', 'jk1', 'jk2', 'jk3', 'jk4', 'jk5', 'jk6', 'cs1', 'cs2', 'cs3', 'q2', 'q3', 'q4a', 'q4b'];
export const D2_IDS = ['q5', 'q6', 'q6b', 'js1', 'js2', 'q7', 'q8', 'q8b', 'q8c'];
export const D3_IDS = ['q9', 'q10', 'cs4', 'q11', 'js3', 'q12'];

// ── Role → persona mapping for primary contact ──
export const ROLE_TO_PERSONA: Record<string, string> = {
  'Champion': 'dir-eb',
  'Economic Buyer': 'ceo',
  'CEO / Founder': 'ceo',
  'CFO / Finance': 'cfo',
  'CHRO / CPO': 'chro',
  'VP of Talent Acquisition': 'vp-ta',
  'Dir. Employer Brand': 'dir-eb',
  'Hiring Manager': 'hiring-manager',
  'Recruiter': 'recruiter',
  'IT / Security': 'dir-eb',
  'Legal & Procurement': 'dir-eb',
  'Project Lead': 'dir-eb',
  'HR Director': 'dir-eb',
  'COO': 'ceo',
  'Board / Investor': 'ceo',
  'Other': 'dir-eb',
};
