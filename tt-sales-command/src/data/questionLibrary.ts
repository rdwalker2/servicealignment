export interface LibraryQuestion {
  id: string;
  category: string;
  phase: 'd1' | 'd2' | 'd3' | 'd4';
  question: string;
  coaching?: string;
  type: 'open' | 'select' | 'checkbox';
  options?: string[];
}

export const QUESTION_LIBRARY: LibraryQuestion[] = [
  // ── D1 / DISCOVERY: PAIN & PROCESS ──
  {
    id: 'lib_d1_01',
    category: 'Deep Dive: Pain',
    phase: 'd1',
    question: 'How long has this been an issue, and why hasn\'t it been solved yet?',
    type: 'open',
    coaching: 'Finds out if this is a chronic organizational failure or a new acute problem. If chronic, what makes this time different?',
  },
  {
    id: 'lib_d1_02',
    category: 'Deep Dive: Pain',
    phase: 'd1',
    question: 'Can you give me a specific example of the last time this problem occurred?',
    type: 'open',
    coaching: 'Forces them out of abstract thinking into concrete pain. Let them tell the story of the failure.',
  },
  {
    id: 'lib_d1_03',
    category: 'Process & Tools',
    phase: 'd1',
    question: 'Where do candidates most frequently drop out of your current process?',
    type: 'select',
    options: ['Before applying (career site)', 'After applying, before interview', 'Between interview stages', 'At the offer stage', 'We don\'t have visibility into this'],
    coaching: 'Identifies the exact bottleneck. If they don\'t have visibility, sell them on Teamtailor analytics.',
  },
  {
    id: 'lib_d1_04',
    category: 'Process & Tools',
    phase: 'd1',
    question: 'How do you currently track employee referrals?',
    type: 'select',
    options: ['We don\'t', 'Spreadsheets', 'Email forwards', 'It is built into our current ATS', 'Third-party tool'],
    coaching: 'Employee referrals are the highest ROI hire. If they use spreadsheets or emails, they are losing money.',
  },

  // ── D2 / DIAGNOSIS: IMPACT & ALIGNMENT ──
  {
    id: 'lib_d2_01',
    category: 'Business Impact',
    phase: 'd2',
    question: 'How does this recruiting challenge affect the broader company goals this year?',
    type: 'open',
    coaching: 'Elevate the problem from HR to the C-Suite. Connect hiring to revenue, product launches, or expansion.',
  },
  {
    id: 'lib_d2_02',
    category: 'Business Impact',
    phase: 'd2',
    question: 'What is the cost to the business for every month a critical role goes unfilled?',
    type: 'open',
    coaching: 'Quantify the pain. Get them to say a dollar amount out loud.',
  },
  {
    id: 'lib_d2_03',
    category: 'Stakeholder Alignment',
    phase: 'd2',
    question: 'How aligned is your executive team on the need to fix this?',
    type: 'select',
    options: ['Fully aligned (budget approved)', 'Mostly aligned (need to see options)', 'Divided (some pushback)', 'Not aligned yet'],
    coaching: 'Identifies political risk in the deal. If they are divided, you need to arm your champion.',
  },
  {
    id: 'lib_d2_04',
    category: 'Status Quo',
    phase: 'd2',
    question: 'What happens if leadership decides to stick with the current system for another year?',
    type: 'open',
    coaching: 'The "Cost of Doing Nothing" question. Make them articulate the pain of the status quo.',
  },

  // ── D3 / DEMONSTRATE: CLOSING & LOGISTICS ──
  {
    id: 'lib_d3_01',
    category: 'Evaluation & Criteria',
    phase: 'd3',
    question: 'What are the top 3 must-have criteria for you to choose a new partner?',
    type: 'open',
    coaching: 'Get their grading rubric. Then tailor the rest of the evaluation to hit these exact three points.',
  },
  {
    id: 'lib_d3_02',
    category: 'Evaluation & Criteria',
    phase: 'd3',
    question: 'What was the deciding factor the last time your company bought software?',
    type: 'open',
    coaching: 'Uncovers their buying psychology. Was it price, usability, security, or executive relationship?',
  },
  {
    id: 'lib_d3_03',
    category: 'Logistics & Legal',
    phase: 'd3',
    question: 'What does your legal and security review process entail?',
    type: 'select',
    options: ['Simple terms agreement', 'Standard security questionnaire', 'Extensive InfoSec/IT review', 'We don\'t have one'],
    coaching: 'Identify procurement blockers early. If extensive, send SOC2 and security docs today.',
  },
  {
    id: 'lib_d3_04',
    category: 'Closing',
    phase: 'd3',
    question: 'If we align on price and capability, is there anything stopping us from partnering this month?',
    type: 'select',
    options: ['No, we are ready', 'Yes, competing priorities', 'Yes, executive approval', 'Yes, existing contract'],
    coaching: 'The ultimate trial close. Flushes out hidden objections.',
  }
];
