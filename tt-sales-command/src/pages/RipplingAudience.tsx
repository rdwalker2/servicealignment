import {
  Zap, Target, Users, Building2, Globe, BarChart3, ExternalLink,
  Filter, Eye, TrendingUp, TrendingDown, Minus, Activity,
  LayoutGrid, UserCircle, Briefcase,
} from 'lucide-react';
import AudienceShell from '../components/audience/AudienceShell';
import type { AudienceConfig } from '../components/audience/audienceTypes';
import { RIPPLING_ACCOUNTS, getRipplingStats, type RipplingAccount, type SignalStatus, type Segment } from '../data/ripplingAudienceData';
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

function SegmentBadge({ segment }: { segment: Segment }) {
  const styles: Record<Segment, string> = {
    Enterprise: 'bg-violet-50 text-violet-700 border-violet-200/60',
    'Mid-Market': 'bg-blue-50 text-blue-700 border-blue-200/60',
    SMB: 'bg-stone-100 text-stone-600 border-stone-200/60',
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-[1px] rounded text-[9px] font-semibold border ${styles[segment]}`}>
      {segment}
    </span>
  );
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

const ripplingConfig: AudienceConfig<RipplingAccount> = {
  // ── Title ──
  title: (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
        <Zap size={20} className="text-white" />
      </div>
      <div>
        <h1 className="text-[20px] font-bold text-stone-900 leading-tight">Rippling</h1>
        <p className="text-[11px] text-stone-500 font-medium">Target Audience — Companies currently using Rippling as their HR/ATS platform</p>
      </div>
    </div>
  ),

  // ── Segments ──
  segments: [
    { id: 'all', name: 'All Companies', icon: 'LayoutGrid', category: 'all', filter: () => true },
    { id: 'hot', name: '🔥 Hot', icon: 'Zap', category: 'status', filter: (a: RipplingAccount) => a.signalStatus === 'hot' },
    { id: 'warm', name: '🟠 Warm', icon: 'Target', category: 'status', filter: (a: RipplingAccount) => a.signalStatus === 'warm' },
    { id: 'watch', name: '👁 Watch', icon: 'Eye', category: 'status', filter: (a: RipplingAccount) => a.signalStatus === 'watch' },
    { id: 'none', name: 'No Signals', icon: 'Minus', category: 'status', filter: (a: RipplingAccount) => a.signalStatus === 'none' },
    { id: 'enterprise', name: 'Enterprise', icon: 'Building2', category: 'segment', filter: (a: RipplingAccount) => a.segment === 'Enterprise' },
    { id: 'midmarket', name: 'Mid-Market', icon: 'Building2', category: 'segment', filter: (a: RipplingAccount) => a.segment === 'Mid-Market' },
    { id: 'smb', name: 'SMB', icon: 'Building2', category: 'segment', filter: (a: RipplingAccount) => a.segment === 'SMB' },
    { id: 'jack', name: 'Jack Luther', icon: 'UserCircle', category: 'rep', filter: (a: RipplingAccount) => a.assignedRep === 'Jack Luther' },
    { id: 'moe', name: 'Moe Aqel', icon: 'UserCircle', category: 'rep', filter: (a: RipplingAccount) => a.assignedRep === 'Moe Aqel' },
    { id: 'tyler', name: 'Tyler Hanson', icon: 'UserCircle', category: 'rep', filter: (a: RipplingAccount) => a.assignedRep === 'Tyler Hanson' },
    { id: 'unassigned', name: 'Unassigned', icon: 'UserCircle', category: 'rep', filter: (a: RipplingAccount) => !a.assignedRep },
  ],

  segmentCategories: [
    { key: 'all', label: '' },
    { key: 'status', label: '🎯 Signal Status' },
    { key: 'segment', label: '📊 Segment' },
    { key: 'rep', label: '👤 Assigned Rep' },
  ],

  segmentIconMap: {
    LayoutGrid, Zap, Target, Eye, Minus, Building2, UserCircle, Briefcase, Filter, Users,
  },

  // ── Stats ──
  stats: (all) => {
    const s = getRipplingStats();
    return [
      { label: 'Total Companies', value: s.totalCompanies, icon: Building2, accent: 'bg-violet-50 text-violet-600' },
      { label: 'In Signal Board', value: s.inSignalBoard, icon: Activity, accent: 'bg-blue-50 text-blue-600' },
      { label: 'Hot Accounts', value: s.hotAccounts ?? s.hotCount, icon: Zap, accent: 'bg-red-50 text-red-600' },
      { label: 'Contacts Mapped', value: s.totalContacts, icon: Users, accent: 'bg-emerald-50 text-emerald-600' },
      { label: 'Website Visits', value: s.totalWebsiteVisits.toLocaleString(), icon: Eye, accent: 'bg-amber-50 text-amber-600' },
    ];
  },

  // ── Filters ──
  filters: (data) => {
    const industries = [...new Set(data.map(a => a.industry))].sort();
    return [
      {
        key: 'industry', label: 'Industry', icon: Building2, showCount: false,
        options: [{ value: 'all', label: 'All Industries' }, ...industries.map(i => ({ value: i, label: i }))],
      },
      {
        key: 'segment', label: 'Segment', icon: Filter,
        options: [
          { value: 'all', label: 'All Segments' },
          { value: 'Enterprise', label: 'Enterprise' },
          { value: 'Mid-Market', label: 'Mid-Market' },
          { value: 'SMB', label: 'SMB' },
        ],
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
    if (fv.industry && fv.industry !== 'all') r = r.filter(a => a.industry === fv.industry);
    if (fv.segment && fv.segment !== 'all') r = r.filter(a => a.segment === fv.segment);
    if (fv.status && fv.status !== 'all') r = r.filter(a => a.signalStatus === fv.status);
    return r;
  },

  // ── Search ──
  searchPlaceholder: 'Search by name, domain, industry…',
  searchFn: (item, q) =>
    item.companyName.toLowerCase().includes(q) ||
    item.domain.toLowerCase().includes(q) ||
    item.industry.toLowerCase().includes(q) ||
    item.location.toLowerCase().includes(q) ||
    (item.notes ? item.notes.toLowerCase().includes(q) : false),

  // ── Columns ──
  columns: [
    {
      key: 'companyName', label: 'Company', sortable: true,
      render: (a) => (
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${
            a.signalStatus === 'hot' ? 'bg-red-500' :
            a.signalStatus === 'warm' ? 'bg-amber-500' :
            a.signalStatus === 'watch' ? 'bg-blue-500' : 'bg-stone-400'
          }`}>{a.companyName.charAt(0)}</div>
          <div className="min-w-0">
            <div className="font-bold text-[12px] text-stone-900 truncate leading-tight">{a.companyName}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-stone-400 truncate">{a.domain}</span>
              <SegmentBadge segment={a.segment} />
            </div>
          </div>
        </div>
      ),
    },
    { key: 'employees', label: 'Size', sortable: true, render: (a) => <span className="text-[11px] font-medium text-stone-700">{getLinkedInSizeRange(a.employees)}</span> },
    {
      key: 'openRoles', label: 'Roles', sortable: true,
      render: (a) => (
        <div className="flex items-center gap-1">
          <span className={`text-[11px] font-semibold ${a.openRoles >= 30 ? 'text-red-600' : a.openRoles >= 15 ? 'text-amber-600' : 'text-stone-600'}`}>{a.openRoles}</span>
          <HiringTrendIcon trend={a.hiringTrend} />
        </div>
      ),
    },
    { key: 'signalStatus', label: 'Status', render: (a) => <SignalStatusBadge status={a.signalStatus} /> },
    { key: 'signalCount', label: 'Signals', sortable: true, render: (a) => <span className="text-[11px] font-semibold text-stone-700">{a.signalCount || '—'}</span> },
    {
      key: 'websiteVisits', label: 'Web', sortable: true,
      render: (a) => a.websiteVisits > 0
        ? <div className="flex items-center gap-1"><Globe size={10} className="text-violet-500" /><span className="text-[11px] font-semibold text-violet-700">{a.websiteVisits}</span></div>
        : <span className="text-[10px] text-stone-300">—</span>,
    },
    { key: 'adImpressions', label: 'Ad Imp.', sortable: true, render: (a) => <span className="text-[11px] text-stone-600">{a.adImpressions > 0 ? a.adImpressions.toLocaleString() : '—'}</span> },
    { key: 'contacts', label: 'Contacts', sortable: true, render: (a) => <span className="text-[11px] font-medium text-stone-700">{a.contacts || '—'}</span> },
    { key: 'assignedRep', label: 'Rep', render: (a) => a.assignedRep ? <span className="text-[10px] font-medium text-stone-600">{a.assignedRep.split(' ')[0]}</span> : <span className="text-[10px] text-stone-300">—</span> },
    { key: 'cadenceStatus', label: 'Cadence', render: (a) => <CadenceBadge status={a.cadenceStatus} /> },
    { key: 'lastSignalDate', label: 'Last Signal', render: (a) => <span className="text-[10px] text-stone-500">{timeAgo(a.lastSignalDate)}</span> },
  ],

  colWidths: ['20%', '8%', '8%', '9%', '7%', '8%', '9%', '7%', '10%', '8%', '6%'],
  defaultSort: { field: 'signalCount', dir: 'desc' },

  sortFn: (a, b, field) => {
    switch (field) {
      case 'companyName': return a.companyName.localeCompare(b.companyName);
      case 'employees': return a.employees - b.employees;
      case 'openRoles': return a.openRoles - b.openRoles;
      case 'signalCount': return a.signalCount - b.signalCount;
      case 'websiteVisits': return a.websiteVisits - b.websiteVisits;
      case 'adImpressions': return a.adImpressions - b.adImpressions;
      case 'contacts': return a.contacts - b.contacts;
      default: return 0;
    }
  },

  getItemId: (item) => item.id,
  itemLabel: 'companies',

  // ── Drawer ──
  renderDrawer: (acct) => (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
          acct.signalStatus === 'hot' ? 'bg-red-500' :
          acct.signalStatus === 'warm' ? 'bg-amber-500' :
          acct.signalStatus === 'watch' ? 'bg-blue-500' : 'bg-stone-400'
        }`}>{acct.companyName.charAt(0)}</div>
        <div>
          <h2 className="text-[15px] font-bold text-stone-900">{acct.companyName}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <SignalStatusBadge status={acct.signalStatus} />
            <SegmentBadge segment={acct.segment} />
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="rounded-xl border border-stone-200/60 p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><div className="text-[10px] font-bold text-stone-400">Domain</div><div className="text-[12px] font-medium text-stone-900">{acct.domain}</div></div>
          <div><div className="text-[10px] font-bold text-stone-400">Industry</div><div className="text-[12px] font-medium text-stone-900">{acct.industry}</div></div>
          <div><div className="text-[10px] font-bold text-stone-400">Location</div><div className="text-[12px] font-medium text-stone-900">{acct.location}</div></div>
          <div><div className="text-[10px] font-bold text-stone-400">Size</div><div className="text-[12px] font-medium text-stone-900">{getLinkedInSizeRange(acct.employees)}</div></div>
          <div><div className="text-[10px] font-bold text-stone-400">Current ATS</div><div className="text-[12px] font-semibold text-rose-700">Rippling</div></div>
          <div><div className="text-[10px] font-bold text-stone-400">Open Roles</div><div className="text-[12px] font-medium text-stone-900 flex items-center gap-1">{acct.openRoles} <HiringTrendIcon trend={acct.hiringTrend} /></div></div>
        </div>
      </div>

      {/* Signal Board Status */}
      <div className="rounded-xl border border-stone-200/60 p-4">
        <div className="text-[10px] font-bold text-stone-400 mb-3">Signal Board Status</div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 rounded-lg bg-stone-50">
            <div className="text-lg font-bold text-stone-900">{acct.signalCount}</div>
            <div className="text-[9px] text-stone-400">Signals</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-stone-50">
            <div className="text-lg font-bold text-violet-600">{acct.websiteVisits}</div>
            <div className="text-[9px] text-stone-400">Web Visits</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-stone-50">
            <div className="text-lg font-bold text-stone-900">{acct.contacts}</div>
            <div className="text-[9px] text-stone-400">Contacts</div>
          </div>
        </div>
      </div>

      {/* Ad Performance */}
      <div className="rounded-xl border border-stone-200/60 p-4">
        <div className="text-[10px] font-bold text-stone-400 mb-3">Ad Performance</div>
        <div className="flex items-center justify-between">
          <div><div className="text-[10px] text-stone-400">Impressions</div><div className="text-lg font-bold text-amber-600">{acct.adImpressions.toLocaleString()}</div></div>
          <div className="text-right"><div className="text-[10px] text-stone-400">Last Signal</div><div className="text-[12px] font-medium text-stone-700">{timeAgo(acct.lastSignalDate)}</div></div>
        </div>
      </div>

      {/* Assignment */}
      <div className="rounded-xl border border-stone-200/60 p-4">
        <div className="text-[10px] font-bold text-stone-400 mb-3">Assignment</div>
        <div className="grid grid-cols-2 gap-3">
          <div><div className="text-[10px] text-stone-400">Rep</div><div className="text-[12px] font-semibold text-stone-900">{acct.assignedRep || 'Unassigned'}</div></div>
          <div><div className="text-[10px] text-stone-400">Cadence</div><CadenceBadge status={acct.cadenceStatus} /></div>
        </div>
      </div>

      {/* Notes */}
      {acct.notes && (
        <div className="rounded-xl border border-stone-200/60 p-4">
          <div className="text-[10px] font-bold text-stone-400 mb-2">Notes</div>
          <p className="text-[12px] text-stone-700 leading-relaxed">{acct.notes}</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        {acct.signalStatus !== 'none' && (
          <a href="/team/signals" className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-stone-900 text-white text-[11px] font-semibold hover:bg-stone-800 transition-colors">
            <BarChart3 size={12} /> Open in Signals
          </a>
        )}
        <a href={acct.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-stone-200 text-stone-700 text-[11px] font-semibold hover:bg-stone-50 transition-colors">
          <ExternalLink size={12} /> LinkedIn
        </a>
      </div>
    </div>
  ),

  // ── Sidebar Footer (Flywheel) ──
  sidebarFooter: (
    <div className="p-3 border-t border-stone-100">
      <div className="text-[9px] font-medium text-stone-400 mb-2">🔄 Flywheel</div>
      <div className="space-y-1">
        {['Audience List → Clay', 'Clay → Signal Board', 'Signal Board → Salesloft', 'Salesloft → Nooks', 'Ads → More Signals'].map((step, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[10px] text-stone-500">
            <span className="w-3.5 h-3.5 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-[8px] font-bold shrink-0">{i + 1}</span>
            {step}
          </div>
        ))}
      </div>
    </div>
  ),

  // ── Above Table (Flywheel Strip) ──
  aboveTable: (
    <div className="mb-4 rounded-xl border border-violet-200/60 bg-gradient-to-r from-violet-50/60 to-purple-50/40 px-5 py-3">
      <div className="flex items-center gap-1 text-[11px] font-semibold">
        {[
          { icon: '📋', label: 'Audience List' },
          { icon: '🔬', label: 'Clay Enrichment' },
          { icon: '📊', label: 'Signal Board' },
          { icon: '📧', label: 'Salesloft Cadences' },
          { icon: '📞', label: 'Nooks Dialing' },
          { icon: '🎯', label: 'Ad Retargeting' },
        ].map((step, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-violet-400 mx-1">→</span>}
            <span className="text-violet-700">{step.icon}</span>
            <span className="text-stone-600">{step.label}</span>
          </span>
        ))}
        <span className="text-violet-400 mx-1">↩</span>
      </div>
    </div>
  ),

  renderInsightBar: undefined,

  // ── Data ──
  data: RIPPLING_ACCOUNTS,
  rowClassName: (item) => item.signalStatus === 'hot' ? 'bg-red-50/20' : '',
};

// ────────────────────────────────────────────
// Page Component
// ────────────────────────────────────────────

export default function RipplingAudience() {
  return <AudienceShell config={ripplingConfig} />;
}
