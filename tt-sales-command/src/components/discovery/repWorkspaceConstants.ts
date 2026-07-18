// ── repWorkspaceConstants.ts ──
// Shared constants extracted from RepWorkspace.tsx
// Used by BAPCanvas, CheckpointGate, StageStepperHeader, PainModal, SettingsTab, MEDDPICCTab

import React from 'react';
import {
  Target, Search, Swords, Lightbulb, BookOpen,
  Award, DollarSign, ClipboardList, Shield, ShieldCheck, Sparkles,
} from 'lucide-react';
import type { SectionKey } from './ControlDrawer';
import type { MEDDPICCStatus } from '../../lib/discoveryDatabase';

// ── Phase question IDs (consistent across all persona sheets) ──

export const D1_IDS = ['q1', 'q1b', 'jk1', 'jk2', 'jk3', 'jk4', 'jk5', 'jk6', 'cs1', 'cs2', 'cs3', 'q2', 'q3', 'q4a', 'q4b', 'roi_hires', 'roi_agency', 'roi_ttf', 'roi_admin_hrs'];
export const D2_IDS = ['q5', 'q6', 'q6b', 'js1', 'js2', 'q7', 'q8', 'q8b', 'q8c'];
export const D3_IDS = ['q9', 'q10', 'cs4', 'q11', 'js3', 'q12'];

// ── Stage config ──

export const STAGES = [
  { id: 'qualifying',    label: 'Qualifying',    color: '#64748b', short: 'D1' }, // Stone
  { id: 'investigating', label: 'Investigating',  color: '#0ea5e9', short: 'D1' }, // Sky
  { id: 'evaluating',    label: 'Evaluating',     color: '#8b5cf6', short: 'D2' }, // Violet
  { id: 'negotiating',   label: 'Negotiating',    color: '#f59e0b', short: 'D3' }, // Amber
  { id: 'contracting',   label: 'Contracting',    color: '#f97316', short: 'D3' }, // Orange
  { id: 'signing',       label: 'Signing',        color: '#10b981', short: 'D4' }, // Emerald
] as const;

// ── Checkpoint config ──

export const CHECKPOINTS = [
  {
    num: 1 as const, cpKey: 'checkpoint1', dividerLabel: 'Investigating',
    label: 'CP1 · Urgency Test', description: 'Is there enough pain that this is an urgent priority?',
    color: '#0ea5e9', gateLabel: 'Evaluating',
  },
  {
    num: 2 as const, cpKey: 'checkpoint2', dividerLabel: 'Evaluating',
    label: 'CP2 · Gap Test', description: 'Are their current resources inadequate to solve this?',
    color: '#f59e0b', gateLabel: 'Negotiating',
  },
  {
    num: 3 as const, cpKey: 'checkpoint3', dividerLabel: 'Contracting',
    label: 'CP3 · Best Solution', description: 'Are we undeniably the best solution for them?',
    color: '#10b981', gateLabel: 'Signing',
  },
] as const;

export const MAX_CP_SCORE = 10;

// ── Room sections ──

export const RAIL_SECTIONS: { key: SectionKey; label: string; icon: React.ElementType; hasConfig: boolean; stage: string }[] = [
  // Act 1 · What You Shared
  { key: 'hero',             label: 'Hero',               icon: Sparkles,      hasConfig: false, stage: 'act1' },
  { key: 'pains',            label: 'Priorities',         icon: Target,        hasConfig: false, stage: 'act1' },
  { key: 'diagnosis',        label: 'Root Cause',         icon: Search,        hasConfig: true,  stage: 'act1' },
  { key: 'problemCanvas',    label: 'Executive Brief',    icon: ClipboardList, hasConfig: false, stage: 'act1' },
  // Act 2 · How We Solve It
  { key: 'paradigmShift',    label: 'Paradigm Shift',     icon: Lightbulb,     hasConfig: true,  stage: 'act2' },
  { key: 'competitive',      label: 'Competitive',        icon: Swords,        hasConfig: true,  stage: 'act2' },
  { key: 'solution',         label: 'Solution',           icon: Lightbulb,     hasConfig: true,  stage: 'act2' },
  { key: 'playbooks',        label: 'Playbooks',          icon: BookOpen,      hasConfig: true,  stage: 'act2' },
  { key: 'socialProof',      label: 'Social Proof',       icon: Award,         hasConfig: true,  stage: 'act2' },
  // Act 3 · Your Path Forward
  { key: 'roi',              label: 'ROI',                icon: DollarSign,    hasConfig: true,  stage: 'act3' },
  { key: 'minimumStandards', label: 'Minimum Standards',  icon: ShieldCheck,   hasConfig: false, stage: 'act3' },
  { key: 'contractSecurity', label: 'Contract & Security', icon: Shield,       hasConfig: false, stage: 'act3' },
  { key: 'map',              label: 'Action Plan',        icon: ClipboardList, hasConfig: true,  stage: 'act3' },
  { key: 'pricing',          label: 'Proposal & Pricing', icon: DollarSign,    hasConfig: true,  stage: 'act3' },
  { key: 'proposal',         label: 'Next Steps',         icon: Shield,        hasConfig: true,  stage: 'act3' },
];

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

// ── Pain filter ──

export const PAIN_FILTER_TABS = [
  { id: 'all', label: 'All' }, { id: 'selected', label: '✓ Selected' },
  { id: 'dir-eb', label: 'Dir. EB' }, { id: 'vp-ta', label: 'VP TA' },
  { id: 'chro', label: 'CHRO' }, { id: 'cfo', label: 'CFO' },
  { id: 'recruiter', label: 'Recruiter' }, { id: 'hiring-manager', label: 'HM' },
] as const;

export const PERSONA_BADGE: Record<string, string> = {
  'dir-eb': 'bg-violet-100 text-violet-600', 'vp-ta': 'bg-cyan-100 text-cyan-600',
  'chro': 'bg-rose-100 text-rose-600', 'cfo': 'bg-emerald-100 text-emerald-600',
  'recruiter': 'bg-amber-100 text-amber-600', 'hiring-manager': 'bg-sky-100 text-sky-600',
};
export const PERSONA_SHORT: Record<string, string> = {
  'dir-eb': 'EB', 'vp-ta': 'TA', 'chro': 'C', 'cfo': '$', 'recruiter': 'R', 'hiring-manager': 'HM',
};

// ── Stakeholder expanded roles ──

export const EXPANDED_ROLES = [
  'Champion', 'Economic Buyer', 'CEO / Founder', 'CFO / Finance', 'CHRO / CPO',
  'VP of Talent Acquisition', 'Dir. Employer Brand', 'Hiring Manager', 'Recruiter',
  'IT / Security', 'Legal & Procurement', 'Project Lead', 'COO', 'Board / Investor', 'Other',
];

// ── BAP Canvas constants ──

export const COMPANY_SIZES = ['1-50', '51-200', '201-500', '501-1000', '1000+'];
export const INDUSTRIES = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Education', 'Professional Services', 'Other'];
export const ATS_PROVIDERS = [
  { id: 'none', name: 'None / No ATS' },
  { id: 'spreadsheets', name: 'Spreadsheets / Manual' },
  { id: 'ashby', name: 'Ashby' },
  { id: 'greenhouse', name: 'Greenhouse' },
  { id: 'lever', name: 'Lever' },
  { id: 'workday', name: 'Workday' },
  { id: 'icims', name: 'iCIMS' },
  { id: 'smartrecruiters', name: 'SmartRecruiters' },
  { id: 'breezy', name: 'BreezyHR' },
  { id: 'workable', name: 'Workable' },
  { id: 'jazzhr', name: 'JazzHR' },
  { id: 'other', name: 'Other' }
];

export const D1_COLOR = '#8b5cf6'; // purple-500
export const D2_COLOR = '#3b82f6'; // blue-500
export const D3_COLOR = '#f97316'; // orange-500
export const D4_COLOR = '#10b981'; // emerald-500

// ── Settings Tab constants ──

export const ROI_CATEGORIES_LIST = [
  { key: 'seatSavings',      label: 'ATS Seat Savings',       desc: 'Eliminating legacy ATS per-seat costs' },
  { key: 'agencySavings',    label: 'Agency Fee Reduction',   desc: 'In-house hiring via careers + CRM' },
  { key: 'vacancySavings',   label: 'Vacancy Cost Savings',   desc: 'Faster fill = less days unfilled' },
  { key: 'jobBoardSavings',  label: 'Job Board Savings',      desc: 'Organic traffic reduces paid spend' },
  { key: 'adminTimeSavings', label: 'Admin Time Savings',     desc: 'Automation reduces recruiter hours' },
  { key: 'costOfIndecision', label: 'Cost of Indecision',     desc: 'Urgency — what delay costs per month' },
];

export const SECTION_DESCRIPTIONS: Partial<Record<SectionKey, string>> = {
  hero:        'Opening branded section — company name, theme',
  pains:       'Pain points & objectives shown to the prospect',
  diagnosis:   'Root cause reframe — auto-generated from selected pains',
  competitive: 'ATS teardown, competitor sheet & sentiment tracking',
  solution:    'Demo focus areas + playbooks — both auto-derive from pains',
  playbooks:   'Auto-matched from pains — configure via Solution above',
  socialProof: 'Case studies & customer stats — curate which appear',
  roi:         'ROI calculator — customize inputs & enabled categories',
  map:         'Mutual Action Plan — shared milestones & go-live timeline',
  pricing:     'Build your proposal with pricing, add-ons & terms',
  proposal:    'Timeline, budget & commitments',
};

// ── MEDDPICC constants ──

export const MEDDPICC_FIELDS = [
  {
    key: 'metrics' as const,
    letter: 'M',
    label: 'Metrics',
    sessionField: 'success_metrics_text' as const,
    dbField: 'success_metrics_text' as const,
    coaching: 'Prospect can articulate a quantifiable business problem. Level 3 = the board/CFO would repeat this in their own words.',
    placeholder: 'e.g. "We need to reduce time-to-fill from 45 days to 25 days, saving $2.3M in lost productivity annually…"',
  },
  {
    key: 'identify_pain' as const,
    letter: 'I',
    label: 'Identify Pain',
    sessionField: 'pain_narrative' as const,
    dbField: 'pain_narrative' as const,
    coaching: 'Prospect acknowledges current state causes a tangible problem. Level 3 (Implicate) = business consequences and urgency the VP would share with their CEO.',
    placeholder: 'e.g. "Losing candidates in the pipeline due to slow scheduling. Hiring managers are frustrated and going around recruiting…"',
  },
  {
    key: 'champion' as const,
    letter: 'C',
    label: 'Champion',
    sessionField: null, // composite: champion_name + champion_validation_notes
    dbField: null,
    coaching: 'Owns or is directly impacted by the problem — and can help drive the project internally. Red flag: "they said they\'ll follow up with their manager"',
    placeholder: 'e.g. "Sarah Chen, Dir. TA — owns the ATS evaluation. Has executive sponsor in CHRO. Presented our business case to leadership…"',
  },
  {
    key: 'competition' as const,
    letter: 'C',
    label: 'Competition',
    sessionField: 'competitive_situation' as const,
    dbField: 'competitive_situation' as const,
    coaching: 'Who else are they evaluating? What\'s the current ATS? What\'s our displacement strategy?',
    placeholder: 'e.g. "Currently on Greenhouse (contract ends Dec). Also evaluating Ashby. Our advantage: employer brand + career site…"',
  },
  {
    key: 'decision_criteria' as const,
    letter: 'D',
    label: 'Decision Criteria',
    sessionField: 'decision_criteria' as const,
    dbField: 'decision_criteria' as const,
    coaching: 'What criteria will they use to choose a vendor? Technical, commercial, strategic?',
    placeholder: 'e.g. "Must integrate with Workday HRIS, support SSO via Okta, career site customization, mobile-first candidate experience…"',
  },
] as const;

export const STATUS_COLORS: Record<MEDDPICCStatus, { dot: string; bg: string; text: string }> = {
  green: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  yellow: { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  red: { dot: 'bg-rose-400', bg: 'bg-rose-50', text: 'text-rose-600' },
};
