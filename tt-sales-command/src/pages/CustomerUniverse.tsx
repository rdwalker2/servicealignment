import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Users, Building2, Globe, X, ArrowUpDown, ArrowUp, ArrowDown,
  Filter, ChevronLeft, ChevronRight, ExternalLink, MapPin, Briefcase,
  Database, Shield, ChevronDown, Crown, BarChart3, Zap, Clock,
  LayoutGrid, Target, Plus, Save, Trash2, Heart, Landmark, Stethoscope,
  Hotel, Code2, Factory, ChevronsLeft, ChevronsRight, Loader2
} from 'lucide-react';
import { CleanPage, CleanPageHeader, CleanPageToolbar, CleanCard, Reveal } from '../components/ui/CleanUI';
import {
  PHASE_CONFIG, SEGMENT_CONFIG, NPS_CONFIG,
  type Customer, type Phase, type Segment, type Region, type EmployeeRange, type NpsClassification,
  type CustomerStats, type FilterOptions
} from '../data/customerTypes';
import { fetchCustomers, fetchCustomerStats, fetchFilterOptions } from '../lib/customerDb';
import { logAudit } from '../lib/auditLog';

function LinkedinIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

// ────────────────────────────────────────────
// UI Atoms
// ────────────────────────────────────────────

function PhaseBadge({ phase }: { phase: Phase }) {
  const config = PHASE_CONFIG[phase] || PHASE_CONFIG.Unknown;
  return (
    <span className={`inline-flex items-center px-2 py-[3px] rounded-full text-[10px] font-bold ring-1 ${config.color} ${config.bg} ${config.ring}`}>
      {config.label}
    </span>
  );
}

function SegmentBadge({ segment }: { segment: Segment }) {
  const config = SEGMENT_CONFIG[segment] || SEGMENT_CONFIG.Unknown;
  if (segment === 'Enterprise') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-bold text-stone-700 bg-stone-100 ring-1 ring-stone-200/60">
        <Crown size={9} className="text-amber-500" />
        Enterprise
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center px-2 py-[3px] rounded-full text-[10px] font-bold ring-1 ${config.color} ${config.bg} ${config.ring}`}>
      {config.label}
    </span>
  );
}

function NpsBadge({ classification, score }: { classification: NpsClassification; score: number | null }) {
  if (!classification) return <span className="text-[10px] text-stone-300">—</span>;
  const config = NPS_CONFIG[classification];
  if (!config) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-bold ring-1 ${config.color} ${config.bg} ${config.ring}`} title={score !== null ? `NPS Score: ${score}` : undefined}>
      <span className="text-[9px]">{config.icon}</span>
      {config.label}
    </span>
  );
}

function ActivityDot({ dateStr }: { dateStr: string | null }) {
  if (!dateStr) return <span className="inline-flex rounded-full h-1.5 w-1.5 bg-stone-200 shrink-0" title="No activity data" />;
  const ageMs = Date.now() - new Date(dateStr).getTime();
  const days = ageMs / (24 * 60 * 60 * 1000);
  if (days < 30) return <span className="inline-flex rounded-full h-2 w-2 bg-emerald-400 shrink-0" title="Active (< 30 days)" />;
  if (days < 90) return <span className="inline-flex rounded-full h-1.5 w-1.5 bg-amber-300 shrink-0" title="Moderate (30-90 days)" />;
  return <span className="inline-flex rounded-full h-1.5 w-1.5 bg-stone-200 shrink-0" title="Dormant (> 90 days)" />;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '—';
  const ms = Date.now() - new Date(dateStr).getTime();
  if (ms < 0) return 'Recently';
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: React.ElementType; accent?: string }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-stone-200/60 px-4 py-3 shadow-sm">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent || 'bg-stone-100 text-stone-600'}`}>
        <Icon size={16} />
      </div>
      <div>
        <div className="text-lg font-black text-stone-900 tabular-nums leading-none">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mt-0.5">{label}</div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// Filter Dropdown
// ────────────────────────────────────────────

function FilterDropdown({ label, value, options, onChange, icon: Icon, showCount }: {
  label: string;
  value: string;
  options: { value: string; label: string; count?: number }[];
  onChange: (val: string) => void;
  icon?: React.ElementType;
  showCount?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  const isActive = value !== 'all';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-[6px] rounded-lg text-[11px] font-semibold transition-all border ${
          isActive
            ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
            : 'bg-white text-stone-600 border-stone-200/60 hover:bg-stone-50 hover:border-stone-300'
        }`}
      >
        {Icon && <Icon size={12} className={isActive ? 'text-stone-300' : 'text-stone-400'} />}
        <span className="truncate max-w-[100px]">{selected?.label || label}</span>
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''} ${isActive ? 'text-stone-300' : 'text-stone-400'}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.12 }}
              className="absolute left-0 top-full mt-1.5 z-40 w-56 max-h-72 overflow-y-auto bg-white rounded-xl shadow-xl ring-1 ring-stone-200 py-1"
            >
              {options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-[11px] font-medium transition-colors flex items-center justify-between ${
                    opt.value === value ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {showCount && opt.count !== undefined && (
                    <span className="text-[10px] text-stone-400 tabular-nums shrink-0 ml-2">{opt.count.toLocaleString()}</span>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ────────────────────────────────────────────
// Customer Detail Drawer
// ────────────────────────────────────────────

function CustomerDrawer({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const initial = customer.accountName.charAt(0).toUpperCase();

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="fixed inset-0 bg-black/15 z-40" onClick={onClose} />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 w-[480px] h-full bg-white border-l border-gray-200 z-50 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="shrink-0 border-b border-gray-100 px-6 pt-5 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex gap-3.5 min-w-0">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-[18px] font-black shrink-0 ${
                customer.segment === 'Enterprise' ? 'bg-stone-900' : customer.segment === 'Medium' ? 'bg-blue-600' : 'bg-stone-400'
              }`}>
                {initial}
              </div>
              <div className="min-w-0">
                <h2 className="text-[17px] font-bold text-[#1E293B] truncate leading-tight">{customer.accountName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <SegmentBadge segment={customer.segment as Segment} />
                  <PhaseBadge phase={customer.phase as Phase} />
                </div>
                {customer.industry && (
                  <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] mt-1.5">
                    <Briefcase size={10} />
                    <span>{customer.industry}</span>
                  </div>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-6">

            {/* Quick Facts Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-stone-100 p-3">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-stone-400 mb-1">Employees</div>
                <div className="flex items-center gap-1.5 text-[13px] font-bold text-stone-900">
                  <Users size={13} className="text-stone-400" />
                  {customer.employeeRange}
                </div>
              </div>
              <div className="rounded-xl border border-stone-100 p-3">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-stone-400 mb-1">Location</div>
                <div className="flex items-center gap-1.5 text-[13px] font-bold text-stone-900">
                  <span>{customer.countryFlag}</span>
                  <span className="truncate">{customer.billingCountry}</span>
                </div>
                {customer.billingState && (
                  <div className="text-[11px] text-stone-500 mt-0.5 ml-5">{customer.billingState}</div>
                )}
              </div>
              <div className="rounded-xl border border-stone-100 p-3">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-stone-400 mb-1">Region</div>
                <div className="text-[13px] font-bold text-stone-900">{customer.region}</div>
              </div>
              <div className="rounded-xl border border-stone-100 p-3">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-stone-400 mb-1">Won Opps</div>
                <div className="text-[13px] font-bold text-stone-900">{customer.wonOpportunities}</div>
              </div>
            </div>

            {/* NPS */}
            {customer.npsScore !== null && (
              <div className={`rounded-xl border p-4 ${customer.npsClassification === 'Promoter' ? 'bg-emerald-50/50 border-emerald-100' : customer.npsClassification === 'Detractor' ? 'bg-red-50/50 border-red-100' : 'bg-amber-50/50 border-amber-100'}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[13px]">{NPS_CONFIG[customer.npsClassification!]?.icon}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${NPS_CONFIG[customer.npsClassification!]?.color}`}>NPS Score</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-[22px] font-black text-stone-900">{customer.npsScore}</div>
                  <div>
                    <NpsBadge classification={customer.npsClassification} score={customer.npsScore} />
                    {customer.npsResponses > 1 && (
                      <div className="text-[10px] text-stone-500 mt-0.5">{customer.npsResponses} survey responses · Avg: {customer.npsAvgScore}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Previous ATS */}
            {customer.previousAts && (
              <div className="bg-amber-50/50 rounded-xl border border-amber-100 p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Database size={13} className="text-amber-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Previous ATS</span>
                </div>
                <div className="text-[14px] font-bold text-amber-900">{customer.previousAts}</div>
                <div className="text-[11px] text-amber-700/70 mt-1">
                  {customer.previousAts === 'No Previous ATS'
                    ? 'Teamtailor was their first ATS'
                    : 'Switched from this provider to Teamtailor'}
                </div>
              </div>
            )}

            {/* Last Activity */}
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8] mb-2">Activity</h3>
              <div className="flex items-center gap-2.5 text-[12px] text-[#1E293B]">
                <ActivityDot dateStr={customer.lastActive} />
                <span>Last active: <strong>{customer.lastActive ? timeAgo(customer.lastActive) : 'Unknown'}</strong></span>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8] mb-2">Links</h3>
              <div className="space-y-2">
                {customer.careerSite && (
                  <a href={customer.careerSite.startsWith('http') ? customer.careerSite : `https://${customer.careerSite}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[12px] text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <Globe size={13} className="shrink-0" />
                    <span className="truncate">{customer.careerSite}</span>
                    <ExternalLink size={10} className="shrink-0 text-blue-400" />
                  </a>
                )}
                {customer.website && (
                  <a href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[12px] text-stone-600 hover:text-stone-800 hover:underline"
                  >
                    <ExternalLink size={13} className="shrink-0 text-stone-400" />
                    <span className="truncate">{customer.website}</span>
                  </a>
                )}
                {customer.linkedinUrl && (
                  <a href={customer.linkedinUrl}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[12px] text-[#0077B5] hover:underline"
                  >
                    <LinkedinIcon size={13} className="shrink-0" />
                    <span className="truncate">LinkedIn Company Page</span>
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </>
  );
}


// ═══════════════════════════════════════════
// SEGMENTS
// ═══════════════════════════════════════════

interface SegmentPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  category?: 'all' | 'industry' | 'geo' | 'competitive' | 'health' | 'size';
  filters: {
    segment?: string;
    phase?: string;
    region?: string;
    industry?: string;
    previousAts?: string;
    employeeRange?: string;
    nps?: string;
    search?: string;
    billingCountry?: string;
  };
  talkingPoint?: string;
  isCustom?: boolean;
}

const DEFAULT_SEGMENTS: SegmentPreset[] = [
  // ── ALL ──
  {
    id: 'all',
    name: 'All Customers',
    icon: 'LayoutGrid',
    category: 'all',
    description: 'Full customer universe',
    filters: {},
  },

  // ── GEO / US MARKETS ──
  {
    id: 'us_all',
    name: 'US Customers',
    icon: 'Landmark',
    category: 'geo',
    description: 'All US-based customers',
    filters: { billingCountry: 'United States' },
    talkingPoint: '"We have [X] customers across the US — from healthcare systems to tech companies. Happy to connect you with someone in your market."',
  },
  {
    id: 'us_enterprise',
    name: 'US Enterprise',
    icon: 'Crown',
    category: 'geo',
    description: 'Enterprise accounts in the US',
    filters: { billingCountry: 'United States', segment: 'Enterprise' },
    talkingPoint: '"We work with [X] enterprise companies in the US — names you\'d recognize. Happy to connect you with any of them."',
  },
  {
    id: 'uk_ireland',
    name: 'UK & Ireland',
    icon: 'Landmark',
    category: 'geo',
    description: 'UK & Ireland customers',
    filters: { region: 'UK & Ireland' },
    talkingPoint: '"We serve [X] companies across the UK and Ireland, spanning healthcare, tech, financial services, and more."',
  },
  {
    id: 'dach',
    name: 'DACH Region',
    icon: 'Landmark',
    category: 'geo',
    description: 'Germany, Austria, Switzerland',
    filters: { region: 'DACH' },
    talkingPoint: '"We serve [X] companies in the DACH region. We understand German data privacy requirements and multilingual hiring."',
  },
  {
    id: 'nordic_all',
    name: 'Nordics',
    icon: 'Heart',
    category: 'geo',
    description: 'All Nordic customers',
    filters: { region: 'Nordics' },
    talkingPoint: '"We\'re the #1 ATS in the Nordics with [X] customers. We know the market inside and out."',
  },

  // ── INDUSTRY VERTICALS ──
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: 'Stethoscope',
    category: 'industry',
    description: 'Healthcare & hospital customers',
    filters: { industry: 'Hospital and Health Care' },
    talkingPoint: '"We serve [X] healthcare organizations. Healthcare teams love us for compliance-friendly workflows and high-volume clinical hiring."',
  },
  {
    id: 'tech_saas',
    name: 'Tech & SaaS',
    icon: 'Code2',
    category: 'industry',
    description: 'Software and IT companies',
    filters: { industry: 'Computer Software' },
    talkingPoint: '"[X] software companies use Teamtailor. Tech teams choose us for the modern UX, API flexibility, and career sites that match their brand."',
  },
  {
    id: 'staffing',
    name: 'Staffing & Recruiting',
    icon: 'Target',
    category: 'industry',
    description: 'Staffing firms and agencies',
    filters: { industry: 'Staffing and Recruiting' },
    talkingPoint: '"[X] staffing firms run on Teamtailor. Agencies love multi-brand career sites and the speed of our workflows."',
  },
  {
    id: 'financial_services',
    name: 'Financial Services',
    icon: 'Landmark',
    category: 'industry',
    description: 'Banking, insurance, fintech',
    filters: { industry: 'Financial Services' },
    talkingPoint: '"We work with [X] financial services companies. They chose us for compliance, security certifications, and polished employer branding."',
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: 'Factory',
    category: 'industry',
    description: 'Manufacturing & industrial',
    filters: { industry: 'Mechanical or Industrial Engineering' },
    talkingPoint: '"[X] manufacturing companies use Teamtailor. They value multi-location hiring, blue-collar workflow support, and branded career sites."',
  },
  {
    id: 'hospitality',
    name: 'Hospitality',
    icon: 'Hotel',
    category: 'industry',
    description: 'Hotels, restaurants, leisure',
    filters: { industry: 'Hospitality' },
    talkingPoint: '"We serve [X] hospitality companies. Our NPS in hospitality is +78 — one of the highest of any vertical."',
  },
  {
    id: 'retail',
    name: 'Retail',
    icon: 'Hotel',
    category: 'industry',
    description: 'Retail companies',
    filters: { industry: 'Retail' },
    talkingPoint: '"[X] retail companies hire with Teamtailor. High-volume seasonal hiring and multi-store career pages are our bread and butter."',
  },
  {
    id: 'construction',
    name: 'Construction',
    icon: 'Factory',
    category: 'industry',
    description: 'Construction and engineering',
    filters: { industry: 'Construction' },
    talkingPoint: '"[X] construction companies trust Teamtailor. Hiring tradespeople fast with mobile-first career sites is what we do."',
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'Landmark',
    category: 'industry',
    description: 'Education and training',
    filters: { industry: 'Education Management' },
    talkingPoint: '"[X] education organizations use Teamtailor for faculty, staff, and admin hiring across multiple campuses."',
  },

  // ── COMPETITIVE INTEL ──
  {
    id: 'greenhouse_wins',
    name: 'Greenhouse Wins',
    icon: 'Target',
    category: 'competitive',
    description: 'Switched from Greenhouse',
    filters: { previousAts: 'Greenhouse' },
    talkingPoint: '"We\'ve replaced Greenhouse at [X] companies. Most common reasons? Better candidate experience, simpler pricing, career sites that convert."',
  },
  {
    id: 'lever_wins',
    name: 'Lever Wins',
    icon: 'Target',
    category: 'competitive',
    description: 'Switched from Lever',
    filters: { previousAts: 'Lever' },
    talkingPoint: '"We\'ve replaced Lever at [X] companies. Customers switched for better employer branding, simpler workflows, and faster implementation."',
  },
  {
    id: 'workday_wins',
    name: 'Workday Wins',
    icon: 'Target',
    category: 'competitive',
    description: 'Switched from Workday',
    filters: { previousAts: 'Workday' },
    talkingPoint: '"[X] companies left Workday Recruiting for Teamtailor. They wanted a dedicated ATS, not a module buried in an ERP."',
  },
  {
    id: 'taleo_wins',
    name: 'Taleo/Oracle Wins',
    icon: 'Target',
    category: 'competitive',
    description: 'Switched from Taleo/Oracle',
    filters: { search: 'Taleo' },
    talkingPoint: '"[X] companies migrated off Taleo to Teamtailor. Night and day difference in UX and time-to-hire."',
  },
  {
    id: 'all_ats_wins',
    name: 'All ATS Wins',
    icon: 'Database',
    category: 'competitive',
    description: 'Every customer with a known previous ATS',
    filters: { previousAts: '__has_ats__' },
    talkingPoint: '"[X] of our customers switched from another ATS. We\'re not just winning new logos — we\'re replacing incumbents."',
  },

  // ── ACCOUNT HEALTH ──
  {
    id: 'enterprise_references',
    name: 'Enterprise References',
    icon: 'Crown',
    category: 'health',
    description: 'Enterprise in Success phase',
    filters: { segment: 'Enterprise', phase: 'Success' },
    talkingPoint: '"I can connect you with any of our [X] enterprise customers in Success phase. These are referenceable accounts."',
  },
  {
    id: 'nps_promoters',
    name: 'NPS Promoters',
    icon: 'Heart',
    category: 'health',
    description: '9-10 NPS — reference ready',
    filters: { nps: 'Promoter' },
    talkingPoint: '"[X] customers scored us 9 or 10 on NPS. These are our biggest fans — I can get you on a call with any of them."',
  },
  {
    id: 'nps_detractors',
    name: 'NPS Detractors',
    icon: 'Target',
    category: 'health',
    description: '0-6 NPS — avoid referencing',
    filters: { nps: 'Detractor' },
    talkingPoint: '⚠️ Internal only: Do NOT reference these accounts. Flag any you recognize to CS.',
  },

  // ── SIZE ──
  {
    id: 'enterprise_all',
    name: 'Enterprise Accounts',
    icon: 'Crown',
    category: 'size',
    description: 'All enterprise segment',
    filters: { segment: 'Enterprise' },
    talkingPoint: '"We serve [X] enterprise accounts globally. We understand the complexity of enterprise hiring."',
  },
  {
    id: 'mid_market',
    name: 'Mid-Market',
    icon: 'Zap',
    category: 'size',
    description: 'Medium segment accounts',
    filters: { segment: 'Medium' },
    talkingPoint: '"[X] mid-market companies use Teamtailor. Big enough to need structure, small enough to move fast — that\'s our sweet spot."',
  },
  {
    id: 'large_employers',
    name: '5,000+ Employees',
    icon: 'Crown',
    category: 'size',
    description: 'Largest employers',
    filters: { employeeRange: '5000+' },
    talkingPoint: '"[X] companies with 5,000+ employees use Teamtailor. We handle enterprise-scale hiring volume with ease."',
  },
];

const SEGMENT_ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutGrid, Target, Landmark, Stethoscope, Code2, Heart, Crown, Zap, Database, Hotel, Factory, Filter,
  SmilePlus: Heart, MapPin,
};

const SEGMENT_CATEGORIES: { key: string; label: string }[] = [
  { key: 'all', label: '' },
  { key: 'geo', label: 'Markets' },
  { key: 'industry', label: 'Industry Verticals' },
  { key: 'competitive', label: 'Competitive Intel' },
  { key: 'health', label: 'Account Health' },
  { key: 'size', label: 'Company Size' },
];

// ═══════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════

type SortField = 'accountName' | 'segment' | 'employeeRange' | 'phase' | 'billingCountry' | 'lastActive' | 'wonOpportunities' | 'industry' | 'npsScore';
type SortDir = 'asc' | 'desc';

const EMPLOYEE_RANGE_ORDER: Record<string, number> = {
  '5000+': 8, '2001-5000': 7, '1001-2000': 6, '501-1000': 5,
  '251-500': 4, '101-250': 3, '26-100': 2, '1-25': 1, 'Unknown': 0,
};

const SEGMENT_ORDER: Record<string, number> = {
  'Enterprise': 3, 'Medium': 2, 'Small': 1, 'Unknown': 0,
};

const PHASE_ORDER: Record<string, number> = {
  'Success': 9, 'Adoption': 8, 'Onboarding': 7, 'Preboarding': 6,
  'Redoption': 5, 'Passive': 4, 'On hold': 3, 'Offboarding': 2, 'Lost': 1, 'Unknown': 0,
};

const PAGE_SIZE = 50;

export default function CustomerUniverse() {
  // ── Auth / Password ──
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // ── Async data state ──
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [filterOpts, setFilterOpts] = useState<FilterOptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Segments ──
  const [segments, setSegments] = useState<SegmentPreset[]>(DEFAULT_SEGMENTS);
  const [activeSegmentId, setActiveSegmentId] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSaveSegment, setShowSaveSegment] = useState(false);
  const [segmentNameDraft, setSegmentNameDraft] = useState('');

  // ── Filters ──
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterSegment, setFilterSegment] = useState('all');
  const [filterPhase, setFilterPhase] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [filterPreviousAts, setFilterPreviousAts] = useState('all');
  const [filterEmployeeRange, setFilterEmployeeRange] = useState('all');
  const [filterNps, setFilterNps] = useState('all');
  const [filterBillingCountry, setFilterBillingCountry] = useState('all');

  // ── Sort ──
  const [sortField, setSortField] = useState<SortField>('segment');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // ── Pagination ──
  const [currentPage, setCurrentPage] = useState(1);

  // ── Selection ──
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // ── Debounced search (300ms) ──
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchQuery]);

  // ── Load stats + filter options on mount ──
  useEffect(() => {
    Promise.all([fetchCustomerStats(), fetchFilterOptions()]).then(([s, f]) => {
      setStats(s);
      setFilterOpts(f);
      logAudit({ user_id: 'system', action: 'view_signals' });
    });
  }, []);

  // ── Fetch customers when filters / sort / page change ──
  useEffect(() => {
    setIsLoading(true);
    fetchCustomers({
      search: debouncedSearch || undefined,
      phase: filterPhase !== 'all' ? [filterPhase] : undefined,
      segment: filterSegment !== 'all' ? [filterSegment] : undefined,
      region: filterRegion !== 'all' ? [filterRegion] : undefined,
      industry: filterIndustry !== 'all' ? [filterIndustry] : undefined,
      previousAts: filterPreviousAts !== 'all' ? [filterPreviousAts] : undefined,
      npsClassification: filterNps !== 'all' ? [filterNps] : undefined,
      employeeRange: filterEmployeeRange !== 'all' ? [filterEmployeeRange] : undefined,
      billingCountry: filterBillingCountry !== 'all' ? [filterBillingCountry] : undefined,
      page: currentPage,
      pageSize: PAGE_SIZE,
      sortBy: sortField,
      sortDir: sortDir,
    }).then(({ data, count }) => {
      setCustomers(data);
      setTotalCount(count);
      setIsLoading(false);
    }).catch(err => {
      console.error('Failed to fetch customers:', err);
      setIsLoading(false);
    });
  }, [debouncedSearch, filterSegment, filterPhase, filterRegion, filterIndustry, filterPreviousAts, filterEmployeeRange, filterNps, filterBillingCountry, currentPage, sortField, sortDir]);

  // ── Derived values (server already filtered/sorted/paginated) ──
  const paginatedCustomers = customers;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // ── Segment actions ──
  const applySegment = useCallback((seg: SegmentPreset) => {
    setActiveSegmentId(seg.id);
    setFilterSegment(seg.filters.segment || 'all');
    setFilterPhase(seg.filters.phase || 'all');
    setFilterRegion(seg.filters.region || 'all');
    setFilterIndustry(seg.filters.industry || 'all');
    setFilterPreviousAts(seg.filters.previousAts || 'all');
    setFilterEmployeeRange(seg.filters.employeeRange || 'all');
    setFilterNps(seg.filters.nps || 'all');
    setFilterBillingCountry(seg.filters.billingCountry || 'all');
    setSearchQuery(seg.filters.search || '');
    setCurrentPage(1);
  }, []);

  const saveCurrentAsSegment = useCallback(() => {
    if (!segmentNameDraft.trim()) return;
    const newSeg: SegmentPreset = {
      id: `custom_${Date.now()}`,
      name: segmentNameDraft.trim(),
      icon: 'Filter',
      description: 'Custom segment',
      isCustom: true,
      filters: {
        ...(filterSegment !== 'all' ? { segment: filterSegment } : {}),
        ...(filterPhase !== 'all' ? { phase: filterPhase } : {}),
        ...(filterRegion !== 'all' ? { region: filterRegion } : {}),
        ...(filterIndustry !== 'all' ? { industry: filterIndustry } : {}),
        ...(filterPreviousAts !== 'all' ? { previousAts: filterPreviousAts } : {}),
        ...(filterEmployeeRange !== 'all' ? { employeeRange: filterEmployeeRange } : {}),
        ...(filterNps !== 'all' ? { nps: filterNps } : {}),
        ...(filterBillingCountry !== 'all' ? { billingCountry: filterBillingCountry } : {}),
        ...(searchQuery ? { search: searchQuery } : {}),
      },
    };
    setSegments(prev => [...prev, newSeg]);
    setActiveSegmentId(newSeg.id);
    setSegmentNameDraft('');
    setShowSaveSegment(false);
  }, [segmentNameDraft, filterSegment, filterPhase, filterRegion, filterIndustry, filterPreviousAts, filterEmployeeRange, filterNps, filterBillingCountry, searchQuery]);

  const deleteSegment = useCallback((segId: string) => {
    setSegments(prev => prev.filter(s => s.id !== segId));
    if (activeSegmentId === segId) {
      setActiveSegmentId('all');
      applySegment(DEFAULT_SEGMENTS[0]);
    }
  }, [activeSegmentId, applySegment]);

  // Segment counts — use stats for the 'all' segment, show the active query count for the active segment
  const segmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const seg of segments) {
      if (Object.keys(seg.filters).length === 0) {
        counts[seg.id] = stats?.total ?? 0;
      } else if (seg.id === activeSegmentId) {
        // The currently active segment's count is the live totalCount from the query
        counts[seg.id] = totalCount;
      } else {
        // For inactive presets we can derive a few from stats, otherwise leave unknown
        const f = seg.filters;
        if (f.segment === 'Enterprise' && Object.keys(f).length === 1) counts[seg.id] = stats?.enterprise ?? 0;
        else if (f.segment === 'Medium' && Object.keys(f).length === 1) counts[seg.id] = stats?.medium ?? 0;
        else if (f.nps === 'Promoter' && Object.keys(f).length === 1) counts[seg.id] = stats?.npsPromoters ?? 0;
        else if (f.nps === 'Detractor' && Object.keys(f).length === 1) counts[seg.id] = stats?.npsDetractors ?? 0;
        else counts[seg.id] = -1; // -1 signals "unknown"
      }
    }
    return counts;
  }, [segments, stats, activeSegmentId, totalCount]);

  // (filtering, sorting, and pagination are now handled server-side)

  // Reset page when filters change
  const handleFilterChange = useCallback((setter: (val: string) => void) => {
    return (val: string) => {
      setter(val);
      setCurrentPage(1);
    };
  }, []);

  const handleSearch = useCallback((val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  }, []);

  // ── Sort handlers ──
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setCurrentPage(1);
  }, [sortField]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={10} className="text-stone-300 ml-0.5" />;
    return sortDir === 'desc'
      ? <ArrowDown size={10} className="text-stone-700 ml-0.5" />
      : <ArrowUp size={10} className="text-stone-700 ml-0.5" />;
  };

  // ── Selection ──
  const toggleCheck = (id: string) => {
    setCheckedIds(p => { 
      const n = new Set(p); 
      if (n.has(id)) { n.delete(id); } else { n.add(id); } 
      return n; 
    });
  };
  const toggleAll = () => {
    const ids = paginatedCustomers.map(c => c.id);
    setCheckedIds(checkedIds.size === ids.length ? new Set() : new Set(ids));
  };

  // ── Active filters count (for clear button) ──
  const activeFilterCount = [filterSegment, filterPhase, filterRegion, filterIndustry, filterPreviousAts, filterEmployeeRange, filterNps, filterBillingCountry]
    .filter(f => f !== 'all').length;

  const clearFilters = () => {
    setFilterSegment('all');
    setFilterPhase('all');
    setFilterRegion('all');
    setFilterIndustry('all');
    setFilterPreviousAts('all');
    setFilterEmployeeRange('all');
    setFilterNps('all');
    setFilterBillingCountry('all');
    setSearchQuery('');
    setCurrentPage(1);
    setActiveSegmentId('all');
  };

  // ── Build filter options (from async filterOpts + stats) ──
  const segmentOptions = [
    { value: 'all', label: 'All Segments', count: stats?.total ?? 0 },
    { value: 'Enterprise', label: 'Enterprise', count: stats?.enterprise ?? 0 },
    { value: 'Medium', label: 'Medium', count: stats?.medium ?? 0 },
    { value: 'Small', label: 'Small', count: stats?.small ?? 0 },
  ];

  const phaseOptions = [
    { value: 'all', label: 'All Phases', count: stats?.total ?? 0 },
    ...(filterOpts?.phases ?? [])
      .sort((a, b) => (PHASE_ORDER[b] || 0) - (PHASE_ORDER[a] || 0))
      .map(phase => ({ value: phase, label: PHASE_CONFIG[phase as Phase]?.label || phase })),
  ];

  const regionOptions = [
    { value: 'all', label: 'All Regions', count: stats?.total ?? 0 },
    ...(filterOpts?.regions ?? []).map(r => ({ value: r, label: r })),
  ];

  const industryOptions = [
    { value: 'all', label: 'All Industries', count: stats?.total ?? 0 },
    ...(filterOpts?.industries ?? []).slice(0, 30).map(i => ({ value: i, label: i })),
  ];

  const atsOptions = [
    { value: 'all', label: 'All' },
    { value: '__has_ats__', label: 'Has Previous ATS', count: stats?.withPreviousAts ?? 0 },
    ...(filterOpts?.previousAts ?? []).slice(0, 25).map(a => ({ value: a, label: a })),
  ];

  const empRangeOptions = [
    { value: 'all', label: 'All Sizes', count: stats?.total ?? 0 },
    ...(['5000+', '2001-5000', '1001-2000', '501-1000', '251-500', '101-250', '26-100', '1-25'] as const)
      .map(r => ({ value: r, label: `${r} employees` })),
  ];

  const npsOptions = [
    { value: 'all', label: 'All NPS', count: stats?.total ?? 0 },
    { value: '__has_nps__', label: 'Has NPS Data', count: stats?.withNpsData ?? 0 },
    { value: 'Promoter', label: '😊 Promoter (9-10)', count: stats?.npsPromoters ?? 0 },
    { value: 'Passive', label: '😐 Passive (7-8)', count: stats?.npsPassives ?? 0 },
    { value: 'Detractor', label: '😞 Detractor (0-6)', count: stats?.npsDetractors ?? 0 },
  ];

  // ── Has any active filter (for save segment button) ──
  const hasActiveFilters = activeFilterCount > 0 || searchQuery.length > 0;

  if (!isAuthenticated) {
    return (
      <div className="flex h-full items-center justify-center bg-stone-50">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-stone-200 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
            <Shield size={24} className="text-stone-400" />
          </div>
          <h2 className="text-lg font-bold text-stone-900 mb-2">Internal Access Only</h2>
          <p className="text-sm text-stone-500 mb-6">Please enter the admin password to access the Customer Universe data.</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (passwordInput === 'teamtailor2026') setIsAuthenticated(true);
            else alert('Incorrect password');
          }} className="flex flex-col gap-3">
            <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="Password" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF2A7F]/20 focus:border-[#FF2A7F]" autoFocus />
            <button type="submit" className="w-full bg-[#FF2A7F] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-[#E62572] transition-colors">Unlock</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-stone-50">
      {/* ── Segment Sidebar ── */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} shrink-0 border-r border-stone-200/60 bg-white flex flex-col transition-all duration-200 overflow-hidden`}>
        <div className="px-3 py-3 border-b border-stone-100 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Segments</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            title="Collapse"
          >
            <ChevronsLeft size={13} />
          </button>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          {SEGMENT_CATEGORIES.map(cat => {
            const catSegments = segments.filter(s => (s.category || 'all') === cat.key);
            if (catSegments.length === 0) return null;
            return (
              <div key={cat.key} className={cat.label ? 'mt-3 first:mt-0' : ''}>
                {cat.label && (
                  <div className="px-2.5 pt-1 pb-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">{cat.label}</span>
                  </div>
                )}
                <div className="space-y-0.5">
                  {catSegments.map(seg => {
                    const isActive = activeSegmentId === seg.id;
                    const Icon = SEGMENT_ICON_MAP[seg.icon] || LayoutGrid;
                    const count = segmentCounts[seg.id] ?? 0;
                    return (
                      <div key={seg.id} className="group relative">
                        <button
                          onClick={() => applySegment(seg)}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                            isActive
                              ? 'bg-stone-900 text-white shadow-sm'
                              : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                          }`}
                        >
                          <Icon size={13} className={isActive ? 'text-stone-300' : 'text-stone-400'} />
                          <span className="flex-1 text-left truncate">{seg.name}</span>
                          <span className={`text-[10px] tabular-nums font-semibold shrink-0 ${
                            isActive ? 'text-stone-400' : 'text-stone-400'
                          }`}>
                            {count === -1 ? '…' : count.toLocaleString()}
                          </span>
                        </button>
                        {seg.isCustom && (
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteSegment(seg.id); }}
                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded text-stone-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete segment"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Save Current Filters as Segment */}
        <div className="p-2 border-t border-stone-100">
          {showSaveSegment ? (
            <div className="space-y-1.5">
              <input
                type="text"
                value={segmentNameDraft}
                onChange={e => setSegmentNameDraft(e.target.value)}
                placeholder="Segment name..."
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') saveCurrentAsSegment(); if (e.key === 'Escape') setShowSaveSegment(false); }}
                className="w-full px-2.5 py-1.5 text-[11px] border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 placeholder-stone-400"
              />
              <div className="flex gap-1">
                <button
                  onClick={saveCurrentAsSegment}
                  disabled={!segmentNameDraft.trim()}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-40 transition-colors"
                >
                  <Save size={10} /> Save
                </button>
                <button
                  onClick={() => { setShowSaveSegment(false); setSegmentNameDraft(''); }}
                  className="px-2 py-1 rounded-lg text-[10px] font-medium text-stone-500 hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowSaveSegment(true)}
              disabled={!hasActiveFilters}
              className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-stone-500 hover:text-stone-700 hover:bg-stone-50 border border-dashed border-stone-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-stone-500 transition-colors"
            >
              <Plus size={12} /> Save as Segment
            </button>
          )}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <CleanPage className="flex-1 min-h-screen flex flex-col">
        {/* Sidebar toggle (when collapsed) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed left-14 top-3 z-20 p-1.5 rounded-lg bg-white border border-stone-200 shadow-sm text-stone-500 hover:text-stone-700 hover:bg-stone-50 transition-colors"
            title="Show segments"
          >
            <ChevronsRight size={14} />
          </button>
        )}
      <Reveal>
        <CleanPageHeader
          variant="hero"
          title="Customer Universe"
          subtitle="Every Teamtailor customer in one searchable table. Use this as your social proof engine, competitive intel source, and reference finder — mid-call, mid-email, or during prep."
          icon={<div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center mx-auto mb-2 shadow-sm"><Globe className="w-6 h-6" /></div>}
        />
      </Reveal>

      {/* Summary Stats */}
      <Reveal delay={0.1}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Total Customers" value={stats?.total ?? '—'} icon={Users} accent="bg-stone-900 text-white" />
          <StatCard label="Enterprise" value={stats?.enterprise ?? '—'} icon={Crown} accent="bg-amber-100 text-amber-700" />
          <StatCard label="Countries" value={stats?.countries ?? '—'} icon={Globe} accent="bg-blue-100 text-blue-700" />
          <StatCard label="Industries" value={stats?.industries ?? '—'} icon={Briefcase} accent="bg-violet-100 text-violet-700" />
          <StatCard label="In Success" value={stats?.successPhase ?? '—'} icon={Shield} accent="bg-emerald-100 text-emerald-700" />
          <StatCard label="With Prev. ATS" value={stats?.withPreviousAts ?? '—'} icon={Database} accent="bg-orange-100 text-orange-700" />
        </div>
      </Reveal>

      {/* Toolbar */}
      <CleanPageToolbar
        left={
          <div className="relative flex-1 w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={14} className="text-stone-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-8 pr-3 py-1.5 border border-stone-200/60 rounded-lg leading-5 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 sm:text-xs transition-all"
              placeholder="Search by name, industry, country, ATS, website..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        }
        right={
          <div className="flex flex-wrap items-center gap-2">
            <FilterDropdown label="Segment" value={filterSegment} options={segmentOptions} onChange={handleFilterChange(setFilterSegment)} icon={Crown} showCount />
            <FilterDropdown label="Phase" value={filterPhase} options={phaseOptions} onChange={handleFilterChange(setFilterPhase)} icon={Shield} showCount />
            <FilterDropdown label="Region" value={filterRegion} options={regionOptions} onChange={handleFilterChange(setFilterRegion)} icon={MapPin} showCount />
            <FilterDropdown label="Industry" value={filterIndustry} options={industryOptions} onChange={handleFilterChange(setFilterIndustry)} icon={Briefcase} showCount />
            <FilterDropdown label="Prev. ATS" value={filterPreviousAts} options={atsOptions} onChange={handleFilterChange(setFilterPreviousAts)} icon={Database} showCount />
            <FilterDropdown label="Size" value={filterEmployeeRange} options={empRangeOptions} onChange={handleFilterChange(setFilterEmployeeRange)} icon={Users} showCount />
            <FilterDropdown label="NPS" value={filterNps} options={npsOptions} onChange={handleFilterChange(setFilterNps)} icon={Heart} showCount />

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2 py-[6px] rounded-lg text-[11px] font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <X size={11} />
                Clear ({activeFilterCount})
              </button>
            )}
          </div>
        }
      />

      {/* Segment Insight Bar */}
      <AnimatePresence>
        {activeSegmentId !== 'all' && (() => {
          const activeSeg = segments.find(s => s.id === activeSegmentId);
          if (!activeSeg || !activeSeg.talkingPoint) return null;
          const count = totalCount;
          const talkingPoint = activeSeg.talkingPoint.replace(/\[X\]/g, count.toLocaleString());
          const isWarning = activeSeg.talkingPoint.startsWith('⚠️');
          const Icon = SEGMENT_ICON_MAP[activeSeg.icon] || LayoutGrid;

          return (
            <motion.div
              key={activeSegmentId}
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="mb-1"
            >
              <div className={`rounded-xl border px-5 py-4 ${
                isWarning
                  ? 'bg-red-50/80 border-red-200/60'
                  : 'bg-gradient-to-r from-stone-50 to-blue-50/40 border-stone-200/60'
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isWarning ? 'bg-red-100 text-red-600' : 'bg-stone-900 text-white'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[14px] font-bold text-stone-900">{activeSeg.name}</h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-900 text-white tabular-nums">
                        {count.toLocaleString()} {count === 1 ? 'account' : 'accounts'}
                      </span>
                    </div>
                    <p className={`text-[12px] leading-relaxed ${isWarning ? 'text-red-800 font-semibold' : 'text-stone-600'}`}>
                      {talkingPoint}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Results count */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] font-medium text-stone-500">
          Showing <strong className="text-stone-900">{totalCount.toLocaleString()}</strong> of {(stats?.total ?? 0).toLocaleString()} customers
          {searchQuery && <span> matching "<strong>{searchQuery}</strong>"</span>}
        </div>
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {checkedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="mb-3"
          >
            <div className="flex items-center gap-4 bg-stone-100 border border-stone-200/60 px-4 py-3 rounded-xl shadow-sm">
              <span className="text-sm font-semibold text-stone-800">
                {checkedIds.size} selected
              </span>
              <div className="h-4 w-px bg-stone-300" />
              <button className="text-sm font-bold text-stone-900 hover:text-stone-700 flex items-center gap-1.5 transition-colors">
                <Zap size={16} /> Export Selection
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PowerTable */}
      <CleanCard className="p-0 flex-1 flex flex-col overflow-hidden relative">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-stone-400" />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <colgroup>
              <col style={{ width: '40px' }} />
              <col style={{ width: '17%' }} />
              <col style={{ width: '7%' }} />
              <col style={{ width: '7%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '7%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '7%' }} />
              <col style={{ width: '14%' }} />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-stone-50 shadow-sm">
              <tr className="bg-stone-50 border-b border-stone-200/60 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                <th className="px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={paginatedCustomers.length > 0 && checkedIds.size === paginatedCustomers.length}
                    onChange={toggleAll}
                    className="rounded border-stone-300 text-stone-900 focus:ring-stone-900 w-3.5 h-3.5 cursor-pointer"
                  />
                </th>
                <th className="px-3 py-2.5 cursor-pointer select-none" onClick={() => handleSort('accountName')}>
                  <span className="flex items-center gap-1">Account {renderSortIcon('accountName')}</span>
                </th>
                <th className="px-3 py-2.5 cursor-pointer select-none hidden md:table-cell" onClick={() => handleSort('segment')}>
                  <span className="flex items-center gap-1">Segment {renderSortIcon('segment')}</span>
                </th>
                <th className="px-3 py-2.5 cursor-pointer select-none hidden lg:table-cell" onClick={() => handleSort('employeeRange')}>
                  <span className="flex items-center gap-1">Size {renderSortIcon('employeeRange')}</span>
                </th>
                <th className="px-3 py-2.5 cursor-pointer select-none hidden lg:table-cell" onClick={() => handleSort('industry')}>
                  <span className="flex items-center gap-1">Industry {renderSortIcon('industry')}</span>
                </th>
                <th className="px-3 py-2.5 cursor-pointer select-none hidden md:table-cell" onClick={() => handleSort('phase')}>
                  <span className="flex items-center gap-1">Phase {renderSortIcon('phase')}</span>
                </th>
                <th className="px-3 py-2.5 cursor-pointer select-none hidden md:table-cell" onClick={() => handleSort('npsScore')}>
                  <span className="flex items-center gap-1">NPS {renderSortIcon('npsScore')}</span>
                </th>
                <th className="px-3 py-2.5 cursor-pointer select-none hidden lg:table-cell" onClick={() => handleSort('billingCountry')}>
                  <span className="flex items-center gap-1">Location {renderSortIcon('billingCountry')}</span>
                </th>
                <th className="px-3 py-2.5 hidden xl:table-cell">
                  <span className="flex items-center gap-1">Previous ATS</span>
                </th>
                <th className="px-3 py-2.5 cursor-pointer select-none hidden lg:table-cell" onClick={() => handleSort('lastActive')}>
                  <span className="flex items-center gap-1">Active {renderSortIcon('lastActive')}</span>
                </th>
                <th className="px-3 py-2.5 hidden xl:table-cell">Career Site</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.map((customer) => {
                const isChecked = checkedIds.has(customer.id);
                const isEnterprise = customer.segment === 'Enterprise';

                return (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                    className={`group transition-all duration-200 cursor-pointer border-b border-stone-100 ${
                      isChecked ? 'bg-stone-50' : 'hover:bg-stone-50 hover:shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] hover:scale-[1.002] hover:z-10 relative'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-3 py-2.5" onClick={(e) => { e.stopPropagation(); toggleCheck(customer.id); }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="rounded border-stone-300 text-stone-900 focus:ring-stone-900 w-3.5 h-3.5 cursor-pointer"
                      />
                    </td>

                    {/* Account Name + Industry */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isEnterprise ? 'bg-stone-900 text-white shadow-sm' : 'bg-stone-100 text-stone-600'
                        }`}>
                          {customer.accountName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[12px] text-stone-900 truncate leading-tight flex items-center gap-1.5">
                            {customer.accountName}
                            {isEnterprise && (
                              <Crown size={10} className="text-amber-500 shrink-0" />
                            )}
                          </div>
                          {customer.industry && (
                            <div className="text-[10px] text-stone-500 truncate mt-0.5">{customer.industry}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Segment */}
                    <td className="px-3 py-2.5 hidden md:table-cell">
                      <SegmentBadge segment={customer.segment as Segment} />
                    </td>

                    {/* Employee Range */}
                    <td className="px-3 py-2.5 hidden lg:table-cell whitespace-nowrap">
                      <span className="text-[11px] font-medium text-stone-600">{customer.employeeRange}</span>
                    </td>

                    {/* Industry */}
                    <td className="px-3 py-2.5 hidden lg:table-cell">
                      <span className="text-[11px] text-stone-600 truncate block">{customer.industry || <span className="text-stone-300">—</span>}</span>
                    </td>

                    {/* Phase */}
                    <td className="px-3 py-2.5 hidden md:table-cell">
                      <PhaseBadge phase={customer.phase as Phase} />
                    </td>

                    {/* NPS */}
                    <td className="px-3 py-2.5 hidden md:table-cell">
                      <NpsBadge classification={customer.npsClassification} score={customer.npsScore} />
                    </td>

                    {/* Country + Region */}
                    <td className="px-3 py-2.5 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] shrink-0">{customer.countryFlag}</span>
                        <div className="min-w-0">
                          <div className="text-[11px] font-medium text-stone-700 truncate">{customer.billingCountry}</div>
                          <div className="text-[9px] text-stone-400 truncate">{customer.region}</div>
                        </div>
                      </div>
                    </td>

                    {/* Previous ATS */}
                    <td className="px-3 py-2.5 hidden xl:table-cell">
                      {customer.previousAts ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-[2px] rounded text-[10px] font-medium bg-amber-50 text-amber-700 ring-1 ring-amber-200/60 truncate max-w-full">
                          <Database size={9} className="shrink-0" />
                          <span className="truncate">{customer.previousAts}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-300">—</span>
                      )}
                    </td>

                    {/* Last Active */}
                    <td className="px-3 py-2.5 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <ActivityDot dateStr={customer.lastActive} />
                        <span className="text-[10px] text-stone-500">{timeAgo(customer.lastActive)}</span>
                      </div>
                    </td>

                    {/* Career Site */}
                    <td className="px-3 py-2.5 hidden xl:table-cell">
                      {customer.careerSite ? (
                        <a
                          href={customer.careerSite.startsWith('http') ? customer.careerSite : `https://${customer.careerSite}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 hover:underline truncate max-w-full"
                        >
                          <Globe size={9} className="shrink-0" />
                          <span className="truncate">{customer.careerSite.replace(/^https?:\/\//, '')}</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-stone-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {paginatedCustomers.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-6 py-16 text-center">
                    <div className="text-stone-400 space-y-2">
                      <Search size={24} className="mx-auto text-stone-300" />
                      <p className="text-sm font-medium">No customers found</p>
                      <p className="text-xs">Try adjusting your search or filters</p>
                      <button onClick={clearFilters} className="text-xs font-semibold text-stone-700 hover:text-stone-900 underline">
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-stone-200/60 bg-stone-50/50">
            <div className="text-[11px] text-stone-500">
              Page <strong>{currentPage}</strong> of <strong>{totalPages.toLocaleString()}</strong>
              <span className="hidden sm:inline"> · {totalCount.toLocaleString()} results</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 rounded text-[11px] font-medium text-stone-600 hover:bg-stone-100 disabled:text-stone-300 disabled:hover:bg-transparent transition-colors"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded text-stone-600 hover:bg-stone-100 disabled:text-stone-300 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft size={14} />
              </button>

              {/* Page numbers */}
              {(() => {
                const pages: number[] = [];
                const start = Math.max(1, currentPage - 2);
                const end = Math.min(totalPages, currentPage + 2);
                for (let i = start; i <= end; i++) pages.push(i);
                return pages.map(p => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-7 h-7 rounded text-[11px] font-semibold transition-colors ${
                      p === currentPage
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {p}
                  </button>
                ));
              })()}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded text-stone-600 hover:bg-stone-100 disabled:text-stone-300 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight size={14} />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 rounded text-[11px] font-medium text-stone-600 hover:bg-stone-100 disabled:text-stone-300 disabled:hover:bg-transparent transition-colors"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </CleanCard>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedCustomer && (
          <CustomerDrawer
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
          />
        )}
      </AnimatePresence>
      </CleanPage>
    </div>
  );
}
