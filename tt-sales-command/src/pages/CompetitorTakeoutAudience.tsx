import {
  Zap, Target, Users, Building2, BarChart3, ExternalLink,
  Filter, Eye, TrendingUp, TrendingDown, Minus, Activity,
  LayoutGrid, UserCircle, Briefcase, Database, MessageSquareShare,
  AlertTriangle, CheckCircle2, Search, Clock
} from 'lucide-react';
import AudienceShell from '../components/audience/AudienceShell';
import type { AudienceConfig } from '../components/audience/audienceTypes';
import { COMPETITOR_TAKEOUTS, getTakeoutStats, type CompetitorTakeout, type TakeoutSignalStatus } from '../data/competitorTakeoutData';
import { getLinkedInSizeRange } from '../lib/utils';

// ────────────────────────────────────────────
// Helper Components
// ────────────────────────────────────────────

function SignalStatusBadge({ status }: { status: TakeoutSignalStatus }) {
  const styles: Record<TakeoutSignalStatus, string> = {
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

function RiskBadge({ risk }: { risk: string }) {
  if (risk === 'High') return <span className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded text-[9px] font-bold bg-red-50 text-red-700 border border-red-200"><AlertTriangle size={10} /> HIGH RISK</span>;
  if (risk === 'Medium') return <span className="inline-flex items-center px-1.5 py-[1px] rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">MEDIUM RISK</span>;
  if (risk === 'Low') return <span className="inline-flex items-center px-1.5 py-[1px] rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">LOW RISK</span>;
  return <span className="text-[10px] text-stone-300">—</span>;
}

// ────────────────────────────────────────────
// Config
// ────────────────────────────────────────────

const takeoutConfig: AudienceConfig<CompetitorTakeout> = {
  title: (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
        <Target size={20} className="text-white" />
      </div>
      <div>
        <h1 className="text-[20px] font-bold text-stone-900 leading-tight">Rip & Replace Campaigns</h1>
        <p className="text-[11px] text-stone-500 font-medium">Target Audience — Displacing legacy and vulnerable ATS competitors</p>
      </div>
    </div>
  ),

  segments: [
    { id: 'all', name: 'All Targets', icon: 'LayoutGrid', category: 'all', filter: () => true },
    { id: 'hot', name: '🔥 Hot Signals', icon: 'Zap', category: 'status', filter: (m) => m.signalStatus === 'hot' },
    { id: 'high_risk', name: '⚠️ High Flight Risk', icon: 'AlertTriangle', category: 'status', filter: (m) => m.contractRisk === 'High' },
    { id: 'lever', name: 'Lever Targets', icon: 'Database', category: 'competitor', filter: (m) => m.currentAts === 'Lever' },
    { id: 'workday', name: 'Workday Targets', icon: 'Database', category: 'competitor', filter: (m) => m.currentAts === 'Workday' },
    { id: 'greenhouse', name: 'Greenhouse Targets', icon: 'Database', category: 'competitor', filter: (m) => m.currentAts === 'Greenhouse' },
  ],

  segmentCategories: [
    { key: 'all', label: '' },
    { key: 'status', label: '🎯 Intent & Risk' },
    { key: 'competitor', label: '🛡 Competitor ATS' },
  ],

  segmentIconMap: {
    LayoutGrid, Zap, Target, AlertTriangle, Database
  },

  stats: () => {
    const s = getTakeoutStats();
    return [
      { label: 'Total Targets', value: s.totalTargets, icon: Target, accent: 'bg-stone-100 text-stone-700' },
      { label: 'High Flight Risk', value: s.highRiskContracts, icon: AlertTriangle, accent: 'bg-rose-50 text-rose-600' },
      { label: 'Hot Signals', value: s.hotTargets, icon: Zap, accent: 'bg-red-50 text-red-600' },
      { label: 'Workday Accounts', value: s.workdayTargets, icon: Database, accent: 'bg-blue-50 text-blue-600' },
    ];
  },

  filters: (data) => {
    const atsList = [...new Set(data.map(a => a.currentAts))].sort();
    const sizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10001+'];
    
    return [
      {
        key: 'currentAts', label: 'Competitor ATS', icon: Database, showCount: false,
        options: [{ value: 'all', label: 'All ATS' }, ...atsList.map(a => ({ value: a, label: a }))],
      },
      {
        key: 'size', label: 'Company Size', icon: Users, showCount: false,
        options: [{ value: 'all', label: 'All Sizes' }, ...sizes.map(s => ({ value: s, label: s }))],
      },
      {
        key: 'risk', label: 'Contract Risk', icon: AlertTriangle,
        options: [
          { value: 'all', label: 'All Risks' },
          { value: 'High', label: 'High Risk' },
          { value: 'Medium', label: 'Medium Risk' },
          { value: 'Low', label: 'Low Risk' },
        ],
      },
    ];
  },

  applyFilters: (data, fv) => {
    let r = data;
    if (fv.currentAts && fv.currentAts !== 'all') r = r.filter(a => a.currentAts === fv.currentAts);
    if (fv.size && fv.size !== 'all') r = r.filter(a => getLinkedInSizeRange(a.employees) === fv.size);
    if (fv.risk && fv.risk !== 'all') r = r.filter(a => a.contractRisk === fv.risk);
    return r;
  },

  searchPlaceholder: 'Search company, domain, or ATS...',
  searchFn: (item, q) =>
    item.companyName.toLowerCase().includes(q) ||
    item.domain.toLowerCase().includes(q) ||
    item.currentAts.toLowerCase().includes(q),

  columns: [
    {
      key: 'companyName', label: 'Target Company', sortable: true,
      render: (m) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-[12px] border border-stone-200/60 font-bold text-stone-500 shrink-0">
            {m.companyName.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-[12px] text-stone-900 truncate leading-tight flex items-center gap-1.5">
              {m.companyName}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-stone-400 truncate">{m.domain}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'currentAts', label: 'Current ATS', sortable: true,
      render: (m) => (
        <span className="text-[11px] font-bold text-stone-700 bg-stone-100 px-2 py-1 rounded">{m.currentAts}</span>
      ),
    },
    { key: 'contractRisk', label: 'Flight Risk', sortable: true, render: (m) => <RiskBadge risk={m.contractRisk} /> },
    { key: 'monthsToRenewal', label: 'Est. Renewal', sortable: true, render: (m) => (
      <span className="text-[11px] font-medium text-stone-600 flex items-center gap-1"><Clock size={10} /> {m.monthsToRenewal} mo</span>
    )},
    { key: 'openRoles', label: 'Open Roles', sortable: true, render: (m) => (
      <div className="flex items-center gap-1">
        <span className={`text-[11px] font-semibold ${m.openRoles >= 50 ? 'text-indigo-600' : m.openRoles >= 20 ? 'text-blue-600' : 'text-stone-600'}`}>{m.openRoles}</span>
        <HiringTrendIcon trend={m.hiringTrend} />
      </div>
    ) },
    { key: 'employees', label: 'Size', sortable: true, render: (m) => (
      <span className="text-[11px] font-medium text-stone-700">{getLinkedInSizeRange(m.employees)}</span>
    ) },
    { key: 'signalStatus', label: 'Signal Status', render: (m) => <SignalStatusBadge status={m.signalStatus} /> },
  ],

  colWidths: ['25%', '13%', '12%', '12%', '10%', '10%', '15%'],
  defaultSort: { field: 'signalCount', dir: 'desc' },

  sortFn: (a, b, field) => {
    switch (field) {
      case 'companyName': return a.companyName.localeCompare(b.companyName);
      case 'currentAts': return a.currentAts.localeCompare(b.currentAts);
      case 'openRoles': return a.openRoles - b.openRoles;
      case 'employees': return a.employees - b.employees;
      case 'monthsToRenewal': return a.monthsToRenewal - b.monthsToRenewal;
      default: return 0;
    }
  },

  getItemId: (item) => item.id,
  itemLabel: 'targets',

  renderDrawer: (m) => {
    let battlecardTitle = "General Rip & Replace";
    let battlecardWeakness = "Legacy systems are slow, expensive, and lack modern employer branding.";
    let battlecardPitch = "Your hiring managers deserve a tool they actually want to use, and your candidate experience shouldn't suffer because of an outdated ATS.";

    if (m.currentAts === 'Workday') {
      battlecardTitle = "Workday Takeout";
      battlecardWeakness = "Workday Recruiting is universally disliked by candidates and hiring managers due to the rigid, click-heavy interface and terrible career site customization.";
      battlecardPitch = `"I know you use Workday for HRIS, but is Workday Recruiting actually delivering the candidate experience you need for these ${m.openRoles} open roles? Teamtailor can sit seamlessly alongside Workday core HR, acting as the high-conversion front-end engine for your talent acquisition team."`;
    } else if (m.currentAts === 'Lever') {
      battlecardTitle = "Lever Takeout";
      battlecardWeakness = "Lever's CRM functions are clunky, and their career sites are extremely basic. They also lack native visual analytics.";
      battlecardPitch = `"Lever was great a few years ago, but in today's market, relying on their basic career sites means you are leaking candidate conversions. Teamtailor provides enterprise-grade employer branding out-of-the-box, alongside a CRM that recruiters actually enjoy using."`;
    } else if (m.currentAts === 'Greenhouse') {
      battlecardTitle = "Greenhouse Takeout";
      battlecardWeakness = "Greenhouse requires heavy admin overhead to maintain, and their reporting is notoriously difficult to configure for non-technical users.";
      battlecardPitch = `"Greenhouse is powerful, but often requires a dedicated HRIS admin just to pull simple reports and maintain workflows. We find companies your size (${getLinkedInSizeRange(m.employees)}) switch to Teamtailor to empower their hiring managers directly, without sacrificing the enterprise analytics you need."`;
    } else if (m.currentAts === 'Taleo') {
      battlecardTitle = "Taleo Takeout";
      battlecardWeakness = "Taleo is a dinosaur. Their system is archaic, mobile support is weak, and it actively deters modern candidates from applying.";
      battlecardPitch = `"Taleo is costing you candidates. The drop-off rate on legacy Taleo applications is massive. If you want to fill these ${m.openRoles} roles quickly, you need a consumer-grade candidate experience."`;
    }

    return (
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2 pb-4 border-b border-stone-100">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-[18px] font-bold text-stone-900">{m.companyName}</h2>
            </div>
            <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-stone-500">
              <ExternalLink size={12} /> {m.domain} • {getLinkedInSizeRange(m.employees)} employees
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">Current ATS</div>
            <div className="text-[14px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">{m.currentAts}</div>
          </div>
        </div>

        {/* Dynamic Battlecard */}
        <div className="rounded-xl border border-rose-200/60 bg-gradient-to-br from-rose-50 to-red-50/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target size={16} className="text-rose-600" />
            <span className="text-[12px] font-bold uppercase tracking-wider text-rose-800">{battlecardTitle} Battlecard</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-1">Vulnerability</div>
              <p className="text-[12px] text-rose-950 font-medium leading-relaxed">{battlecardWeakness}</p>
            </div>
            <div className="pt-2 border-t border-rose-200/50">
              <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-1">Email / Call Pitch</div>
              <p className="text-[13px] text-rose-900 leading-relaxed italic">{battlecardPitch}</p>
            </div>
          </div>
        </div>

        {/* Contract & Signals Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-stone-200/60 p-4">
            <div className="text-[10px] font-bold text-stone-400 mb-3 uppercase tracking-wider">Contract Intel</div>
            <div className="space-y-2">
              <div><div className="text-[10px] text-stone-500">Flight Risk</div><div className="mt-1"><RiskBadge risk={m.contractRisk} /></div></div>
              <div><div className="text-[10px] text-stone-500">Est. Renewal</div><div className="text-[12px] font-bold text-stone-900">{m.monthsToRenewal} months away</div></div>
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

        {/* Contacts */}
        <div className="rounded-xl border border-stone-200/60 p-4">
          <div className="text-[10px] font-bold text-stone-400 mb-3 uppercase tracking-wider">Target Contacts ({m.contacts.length})</div>
          <div className="space-y-3">
            {m.contacts.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ backgroundColor: c.avatarColor }}>
                  {c.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-stone-900 truncate">{c.name}</div>
                  <div className="text-[11px] text-stone-500 truncate">{c.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  },

  data: COMPETITOR_TAKEOUTS,
  rowClassName: (item) => item.signalStatus === 'hot' ? 'bg-red-50/20' : '',
};

export default function CompetitorTakeoutAudience() {
  return <AudienceShell config={takeoutConfig} />;
}
