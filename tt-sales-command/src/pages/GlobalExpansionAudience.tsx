import {
  Zap, Target, Users, Building2, Globe, BarChart3, ExternalLink,
  Filter, Eye, TrendingUp, TrendingDown, Minus, Activity,
  LayoutGrid, UserCircle, Briefcase, Heart, Network, MessageSquareShare
} from 'lucide-react';
import AudienceShell from '../components/audience/AudienceShell';
import type { AudienceConfig } from '../components/audience/audienceTypes';
import { GLOBAL_EXPANSION_MATCHES, getGlobalExpansionStats, type GlobalExpansionMatch, type SignalStatus } from '../data/globalExpansionData';
import CrossBorderOrgMap from '../components/shared/CrossBorderOrgMap';
import AIPitchGenerator, { type AIPitchContext } from '../components/shared/AIPitchGenerator';
import { getLinkedInSizeRange } from '../lib/utils';

// ────────────────────────────────────────────
// Helper Components (used in columns + drawer)
// ────────────────────────────────────────────

function SignalStatusBadge({ status }: { status: SignalStatus }) {
  const styles: Record<SignalStatus, string> = {
    hot: 'bg-red-50 text-red-700 border-red-200/60',
    warm: 'bg-amber-50 text-amber-700 border-amber-200/60',
    watch: 'bg-blue-50 text-blue-700 border-blue-200/60',
    none: 'bg-stone-100 text-stone-500 border-stone-200/60',
  };
  return (
    <span className={`inline-flex items-center px-2 py-[2px] rounded-full text-[9px] font-bold border ${styles[status]}`}>
      {status === 'none' ? 'No Signals' : status}
    </span>
  );
}

function HiringTrendIcon({ trend }: { trend: 'up' | 'flat' | 'down' }) {
  if (trend === 'up') return <TrendingUp size={12} className="text-emerald-600" />;
  if (trend === 'down') return <TrendingDown size={12} className="text-red-500" />;
  return <Minus size={12} className="text-stone-400" />;
}

function CadenceBadge({ status }: { status: string | null }) {
  if (status === 'enrolled') return <span className="inline-flex items-center px-1.5 py-[1px] rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">Enrolled</span>;
  if (status === 'completed') return <span className="inline-flex items-center px-1.5 py-[1px] rounded text-[9px] font-semibold bg-stone-100 text-stone-500 border border-stone-200/60">Completed</span>;
  if (status === 'not_started') return <span className="inline-flex items-center px-1.5 py-[1px] rounded text-[9px] font-semibold bg-amber-50 text-amber-600 border border-amber-200/60">Ready</span>;
  return <span className="text-[10px] text-stone-300">—</span>;
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '1d ago';
  return `${days}d ago`;
}

// ────────────────────────────────────────────
// Config
// ────────────────────────────────────────────

const globalExpansionConfig: AudienceConfig<GlobalExpansionMatch> = {
  // ── Title ──
  title: (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
        <Network size={20} className="text-white" />
      </div>
      <div>
        <h1 className="text-[20px] font-bold text-stone-900 leading-tight">Global Expansion</h1>
        <p className="text-[11px] text-stone-500 font-medium">Target Audience — US Branches of Rest of World (ROW) Customers</p>
      </div>
    </div>
  ),

  // ── Segments ──
  segments: [
    { id: 'all', name: 'All Matches', icon: 'LayoutGrid', category: 'all', filter: () => true },
    { id: 'hot', name: '🔥 Hot Signals', icon: 'Zap', category: 'status', filter: (m) => m.signalStatus === 'hot' },
    { id: 'warm', name: '🟠 Warm Signals', icon: 'Target', category: 'status', filter: (m) => m.signalStatus === 'warm' },
    { id: 'watch', name: '👁 Watch', icon: 'Eye', category: 'status', filter: (m) => m.signalStatus === 'watch' },
    { id: 'high_nps', name: 'High ROW NPS (9-10)', icon: 'Heart', category: 'segment', filter: (m) => m.rowNps >= 9 },
    { id: 'enterprise', name: 'US Enterprise', icon: 'Building2', category: 'segment', filter: (m) => m.usEmployees >= 1000 },
    { id: 'nordic', name: 'Nordic Parents', icon: 'Globe', category: 'region', filter: (m) => m.rowRegion === 'Nordics' },
    { id: 'dach', name: 'DACH Parents', icon: 'Globe', category: 'region', filter: (m) => m.rowRegion === 'DACH' },
    { id: 'uk', name: 'UK & IRE Parents', icon: 'Globe', category: 'region', filter: (m) => m.rowRegion === 'UK & Ireland' },
    { id: 'jack', name: 'Jack Luther', icon: 'UserCircle', category: 'rep', filter: (m) => m.assignedRep === 'Jack Luther' },
    { id: 'moe', name: 'Moe Aqel', icon: 'UserCircle', category: 'rep', filter: (m) => m.assignedRep === 'Moe Aqel' },
    { id: 'tyler', name: 'Tyler Hanson', icon: 'UserCircle', category: 'rep', filter: (m) => m.assignedRep === 'Tyler Hanson' },
  ],

  segmentCategories: [
    { key: 'all', label: '' },
    { key: 'status', label: '🎯 Signal Status' },
    { key: 'segment', label: '📊 Account Health & Size' },
    { key: 'region', label: '🌍 Parent Region' },
    { key: 'rep', label: '👤 Assigned Rep' },
  ],

  segmentIconMap: {
    LayoutGrid, Zap, Target, Eye, Minus, Building2, UserCircle, Briefcase, Filter, Users, Heart, Globe
  },

  // ── Stats ──
  stats: (all) => {
    const s = getGlobalExpansionStats();
    return [
      { label: 'Total Matches', value: s.totalMatches, icon: Network, accent: 'bg-blue-50 text-blue-600' },
      { label: 'High NPS Accounts', value: s.highNpsMatches, icon: Heart, accent: 'bg-emerald-50 text-emerald-600' },
      { label: 'Hot Signals', value: s.hotMatches, icon: Zap, accent: 'bg-red-50 text-red-600' },
      { label: 'US Contacts Identified', value: s.totalUsContacts, icon: Users, accent: 'bg-indigo-50 text-indigo-600' },
    ];
  },

  // ── Filters ──
  filters: (data) => {
    const regions = [...new Set(data.map(a => a.rowRegion))].sort();
    const ats = [...new Set(data.map(a => a.usCurrentAts))].sort();
    const sizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10001+'];
    
    return [
      {
        key: 'rowRegion', label: 'Parent Region', icon: Globe, showCount: false,
        options: [{ value: 'all', label: 'All Regions' }, ...regions.map(r => ({ value: r, label: r }))],
      },
      {
        key: 'usCurrentAts', label: 'US Current ATS', icon: Database, showCount: false,
        options: [{ value: 'all', label: 'All ATS' }, ...ats.map(a => ({ value: a, label: a }))],
      },
      {
        key: 'usSize', label: 'Company Size', icon: Users, showCount: false,
        options: [{ value: 'all', label: 'All Sizes' }, ...sizes.map(s => ({ value: s, label: s }))],
      },
      {
        key: 'status', label: 'Status', icon: Activity,
        options: [
          { value: 'all', label: 'All Statuses' },
          { value: 'hot', label: '🔥 Hot' },
          { value: 'warm', label: '🟠 Warm' },
          { value: 'watch', label: '👁 Watch' },
          { value: 'none', label: 'No Signals' },
        ],
      },
    ];
  },

  applyFilters: (data, fv) => {
    let r = data;
    if (fv.rowRegion && fv.rowRegion !== 'all') r = r.filter(a => a.rowRegion === fv.rowRegion);
    if (fv.usCurrentAts && fv.usCurrentAts !== 'all') r = r.filter(a => a.usCurrentAts === fv.usCurrentAts);
    if (fv.usSize && fv.usSize !== 'all') r = r.filter(a => getLinkedInSizeRange(a.usEmployees) === fv.usSize);
    if (fv.status && fv.status !== 'all') r = r.filter(a => a.signalStatus === fv.status);
    return r;
  },

  // ── Search ──
  searchPlaceholder: 'Search US company, ROW company, domain...',
  searchFn: (item, q) =>
    item.usCompanyName.toLowerCase().includes(q) ||
    item.rowCompanyName.toLowerCase().includes(q) ||
    item.usDomain.toLowerCase().includes(q) ||
    (item.notes ? item.notes.toLowerCase().includes(q) : false),

  // ── Columns ──
  columns: [
    {
      key: 'rowCompanyName', label: 'ROW Parent Customer', sortable: true,
      render: (m) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-[12px] border border-stone-200/60 shrink-0">
            {m.rowCountryFlag}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-[12px] text-stone-900 truncate leading-tight flex items-center gap-1.5">
              {m.rowCompanyName}
              {m.rowNps >= 9 && <Heart size={10} className="text-emerald-500 shrink-0" fill="currentColor" />}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-stone-400 truncate">{m.rowRegion}</span>
              <span className="text-[9px] font-semibold px-1.5 py-[1px] bg-emerald-50 text-emerald-700 rounded-sm">NPS {m.rowNps}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'usCompanyName', label: 'US Target Subsidiary', sortable: true,
      render: (m) => (
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${
            m.signalStatus === 'hot' ? 'bg-red-500' :
            m.signalStatus === 'warm' ? 'bg-amber-500' :
            m.signalStatus === 'watch' ? 'bg-blue-500' : 'bg-indigo-400'
          }`}>{m.usCompanyName.charAt(0)}</div>
          <div className="min-w-0">
            <div className="font-bold text-[12px] text-stone-900 truncate leading-tight flex items-center gap-1">
              🇺🇸 {m.usCompanyName}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-stone-400 truncate">{m.usDomain}</span>
              <span className="text-[10px] text-stone-400">|</span>
              <span className="text-[10px] text-stone-500 font-medium">{m.usCurrentAts}</span>
            </div>
          </div>
        </div>
      ),
    },
    { key: 'usOpenRoles', label: 'US Roles', sortable: true, render: (m) => (
      <div className="flex items-center gap-1">
        <span className={`text-[11px] font-semibold ${m.usOpenRoles >= 50 ? 'text-indigo-600' : m.usOpenRoles >= 20 ? 'text-blue-600' : 'text-stone-600'}`}>{m.usOpenRoles}</span>
        <HiringTrendIcon trend={m.usHiringTrend} />
      </div>
    ) },
    { key: 'usEmployees', label: 'US Size', sortable: true, render: (m) => (
      <span className="text-[11px] font-medium text-stone-700">{getLinkedInSizeRange(m.usEmployees)}</span>
    ) },
    { key: 'signalStatus', label: 'Signal Status', render: (m) => <SignalStatusBadge status={m.signalStatus} /> },
    { key: 'usContacts', label: 'US Contacts', sortable: true, render: (m) => <span className="text-[11px] font-medium text-stone-700">{m.usContacts || '—'}</span> },
    { key: 'assignedRep', label: 'Rep', render: (m) => m.assignedRep ? <span className="text-[10px] font-medium text-stone-600">{m.assignedRep.split(' ')[0]}</span> : <span className="text-[10px] text-stone-300">—</span> },
    { key: 'cadenceStatus', label: 'Cadence', render: (m) => <CadenceBadge status={m.cadenceStatus} /> },
  ],

  colWidths: ['25%', '24%', '9%', '9%', '9%', '9%', '7%', '8%'],
  defaultSort: { field: 'signalCount', dir: 'desc' },

  sortFn: (a, b, field) => {
    switch (field) {
      case 'rowCompanyName': return a.rowCompanyName.localeCompare(b.rowCompanyName);
      case 'usCompanyName': return a.usCompanyName.localeCompare(b.usCompanyName);
      case 'usOpenRoles': return a.usOpenRoles - b.usOpenRoles;
      case 'usContacts': return a.usContacts - b.usContacts;
      default: return 0;
    }
  },

  getItemId: (item) => item.id,
  itemLabel: 'matches',

  // ── Drawer ──
  renderDrawer: (m) => (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2 pb-4 border-b border-stone-100">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[14px]">{m.rowCountryFlag}</span>
            <h2 className="text-[15px] font-bold text-stone-900">{m.rowCompanyName}</h2>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Parent Customer</span>
            <span className="text-[10px] font-medium px-1.5 py-[2px] bg-emerald-50 text-emerald-700 rounded border border-emerald-200/50">NPS {m.rowNps}</span>
          </div>
        </div>
        
        <div className="text-stone-300">
          <ExternalLink size={16} />
        </div>
        
        <div className="flex-1 text-right">
          <div className="flex items-center justify-end gap-2 mb-1">
            <h2 className="text-[15px] font-bold text-indigo-900">{m.usCompanyName}</h2>
            <span className="text-[14px]">🇺🇸</span>
          </div>
          <div className="flex items-center justify-end gap-1.5 mt-1">
            <span className="text-[10px] font-medium px-1.5 py-[2px] bg-indigo-50 text-indigo-700 rounded border border-indigo-200/50">{m.usCurrentAts}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">US Target</span>
          </div>
        </div>
      </div>

      {/* Battlecard / Pitch Generator */}
      <AIPitchGenerator context={{
        targetCompany: m.usCompanyName,
        contactName: m.usContacts ? "Contact" : undefined,
        openRoles: m.usOpenRoles,
        currentAts: m.usCurrentAts,
        parentCompany: m.rowCompanyName,
        parentNps: m.rowNps,
        decisionStructure: m.decisionStructure
      }} />

      <CrossBorderOrgMap match={m} />

      {/* Match Confidence & Signals Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-stone-200/60 p-4">
          <div className="text-[10px] font-bold text-stone-400 mb-3 uppercase tracking-wider">Entity Match</div>
          <div className="space-y-2">
            <div><div className="text-[10px] text-stone-500">Confidence</div><div className="text-[12px] font-bold text-emerald-600">{m.matchConfidence}</div></div>
            <div><div className="text-[10px] text-stone-500">Reason</div><div className="text-[12px] font-medium text-stone-900">{m.matchReason}</div></div>
          </div>
        </div>

        <div className="rounded-xl border border-stone-200/60 p-4">
          <div className="text-[10px] font-bold text-stone-400 mb-3 uppercase tracking-wider">US Signals</div>
          <div className="space-y-2">
            <div><div className="text-[10px] text-stone-500">Status</div><div className="mt-1"><SignalStatusBadge status={m.signalStatus} /></div></div>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-stone-100">
              <div><div className="text-[10px] text-stone-500">Web Visits</div><div className="text-[12px] font-bold text-stone-900">{m.websiteVisits}</div></div>
              <div><div className="text-[10px] text-stone-500">Ad Impr.</div><div className="text-[12px] font-bold text-stone-900">{m.adImpressions}</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment */}
      <div className="rounded-xl border border-stone-200/60 p-4">
        <div className="text-[10px] font-bold text-stone-400 mb-3 uppercase tracking-wider">Assignment</div>
        <div className="grid grid-cols-2 gap-3">
          <div><div className="text-[10px] text-stone-500">Rep</div><div className="text-[12px] font-semibold text-stone-900">{m.assignedRep || 'Unassigned'}</div></div>
          <div><div className="text-[10px] text-stone-500">Salesloft Cadence</div><div className="mt-0.5"><CadenceBadge status={m.cadenceStatus} /></div></div>
        </div>
      </div>

      {/* Notes */}
      {m.notes && (
        <div className="rounded-xl border border-stone-200/60 p-4">
          <div className="text-[10px] font-bold text-stone-400 mb-2 uppercase tracking-wider">Notes</div>
          <p className="text-[12px] text-stone-700 leading-relaxed">{m.notes}</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <button className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-stone-900 text-white text-[11px] font-semibold hover:bg-stone-800 transition-colors">
          <BarChart3 size={12} /> Open US Signals
        </button>
        <button className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-stone-200 text-stone-700 text-[11px] font-semibold hover:bg-stone-50 transition-colors">
          <ExternalLink size={12} /> View Parent Account
        </button>
      </div>
    </div>
  ),

  // ── Above Table (Flywheel Strip) ──
  aboveTable: (
    <div className="mb-4 rounded-xl border border-blue-200/60 bg-gradient-to-r from-blue-50/60 to-indigo-50/40 px-5 py-3">
      <div className="flex items-center gap-1 text-[11px] font-semibold">
        {[
          { icon: '🌍', label: 'ROW Customers' },
          { icon: '🔬', label: 'Clay Mapping' },
          { icon: '🇺🇸', label: 'US Targets' },
          { icon: '📊', label: 'Signal Board' },
          { icon: '💬', label: 'Land & Expand Pitch' },
        ].map((step, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-blue-400 mx-1">→</span>}
            <span className="text-blue-700">{step.icon}</span>
            <span className="text-stone-600">{step.label}</span>
          </span>
        ))}
      </div>
    </div>
  ),

  renderInsightBar: undefined,

  // ── Data ──
  data: GLOBAL_EXPANSION_MATCHES,
  rowClassName: (item) => item.signalStatus === 'hot' ? 'bg-red-50/20' : '',
};

// ────────────────────────────────────────────
// Page Component
// ────────────────────────────────────────────

// Need to define Database here since we import it from lucide-react but missed it up top
import { Database } from 'lucide-react';

export default function GlobalExpansionAudience() {
  return <AudienceShell config={globalExpansionConfig} />;
}
