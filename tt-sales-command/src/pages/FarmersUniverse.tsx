import { motion } from 'framer-motion';
import {
  MapPin, Phone, ExternalLink, Shield,
  LayoutGrid, Map, Building2, Users, Filter, Zap, Target,
  UserCircle, Briefcase
} from 'lucide-react';
import AudienceShell from '../components/audience/AudienceShell';
import type { AudienceConfig } from '../components/audience/audienceTypes';
import { FARMERS_LOCATIONS, getFarmersStats, type FarmersLocation, type FarmersType } from '../data/farmersData';

// ────────────────────────────────────────────
// Helper Component (used in columns + drawer)
// ────────────────────────────────────────────

function TypeBadge({ type }: { type: FarmersType }) {
  const styles: Record<FarmersType, string> = {
    'District Manager': 'bg-red-50 text-red-700 ring-red-200/60',
    'Recruiter': 'bg-blue-50 text-blue-700 ring-blue-200/60',
    'District Office': 'bg-stone-100 text-stone-600 ring-stone-200/60',
  };
  return (
    <span className={`inline-flex items-center px-2 py-[2px] rounded-full text-[9px] font-bold ring-1 whitespace-nowrap ${styles[type] || styles['District Office']}`}>
      {type}
    </span>
  );
}

// ────────────────────────────────────────────
// Config
// ────────────────────────────────────────────

const farmersConfig: AudienceConfig<FarmersLocation> = {
  // ── Title ──
  title: (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-sm">
        <Shield size={20} className="text-white" />
      </div>
      <div>
        <h1 className="text-[20px] font-black text-stone-900 leading-tight">Farmer's Insurance</h1>
        <p className="text-[11px] text-stone-500 font-medium">District Managers & Recruiter Universe</p>
      </div>
    </div>
  ),

  // ── Segments ──
  segments: [
    { id: 'all', name: 'All Contacts', icon: 'LayoutGrid', category: 'all', description: "Every Farmer's Insurance district manager & recruiter", filters: {} },
    // Priority
    { id: 'utah', name: '🔥 Utah (Inbound)', icon: 'Zap', category: 'priority', description: 'Kaysville inbound — sunsetting internal tool', filters: { state: 'Utah' }, talkingPoint: '"We just had an inbound from your Kaysville district — they\'re sunsetting an internal tool. [X] contacts in Utah could benefit from the same conversation."' },
    { id: 'district-managers', name: 'District Managers', icon: 'UserCircle', category: 'priority', description: 'Decision-makers who oversee multiple agencies', filters: { type: 'District Manager' }, talkingPoint: '"[X] District Managers nationwide — these are the people who make tool decisions for entire districts of agents. One DM win = 10-50 agency locations."' },
    // Regions
    { id: 'west', name: 'West Coast', icon: 'Map', category: 'region', description: 'CA, OR, WA, NV', filters: { region: 'West' }, talkingPoint: '"[X] contacts across the West Coast. California alone is Farmer\'s biggest market."' },
    { id: 'mountain', name: 'Mountain', icon: 'Map', category: 'region', description: 'CO, UT, ID, MT, AZ, NM', filters: { region: 'Mountain' }, talkingPoint: '"[X] contacts in the Mountain region — including the Utah district that just came inbound."' },
    { id: 'midwest', name: 'Midwest', icon: 'Map', category: 'region', description: 'IL, IN, IA, KS, MI, MN, MO, etc.', filters: { region: 'Midwest' }, talkingPoint: '"[X] Midwest contacts across 12 states. High-volume recruiting markets."' },
    { id: 'south', name: 'South', icon: 'Map', category: 'region', description: 'TX, GA, AL, AR, TN, etc.', filters: { region: 'South' }, talkingPoint: '"[X] contacts across the South — Texas alone is one of Farmer\'s largest recruiting markets."' },
    { id: 'northeast', name: 'Northeast', icon: 'Map', category: 'region', description: 'NY, NJ, PA, MA, CT, etc.', filters: { region: 'Northeast' }, talkingPoint: '"[X] contacts spanning the Northeast/I-95 corridor."' },
    // Top States
    { id: 'california', name: 'California', icon: 'Building2', category: 'state', description: "Largest Farmer's state", filters: { state: 'California' }, talkingPoint: '"California is Farmer\'s biggest market with [X] contacts. A win here sets the template for the entire org."' },
    { id: 'texas', name: 'Texas', icon: 'Building2', category: 'state', description: 'Major recruiting market', filters: { state: 'Texas' }, talkingPoint: '"[X] Texas contacts — one of the highest-volume recruiting markets in the Farmer\'s network."' },
    { id: 'colorado', name: 'Colorado', icon: 'Building2', category: 'state', description: '11 locations', filters: { state: 'Colorado' } },
    { id: 'washington', name: 'Washington', icon: 'Building2', category: 'state', description: '10 locations', filters: { state: 'Washington' } },
  ],

  segmentCategories: [
    { key: 'all', label: '' },
    { key: 'priority', label: '🔥 Priority' },
    { key: 'region', label: 'Regions' },
    { key: 'state', label: 'Key States' },
  ],

  segmentIconMap: { LayoutGrid, Map, Building2, Zap, Target, Filter, Users, Shield, UserCircle, Briefcase },

  // ── Stats ──
  stats: (_all, filtered) => {
    const s = getFarmersStats();
    return [
      { label: 'Total Contacts', value: s.total, icon: Users, accent: 'bg-red-50 text-red-600' },
      { label: 'Districts', value: s.districts, icon: Building2, accent: 'bg-amber-50 text-amber-600' },
      { label: 'States', value: s.states, icon: Map, accent: 'bg-blue-50 text-blue-600' },
      { label: 'With Phone', value: s.withPhone, icon: Phone, accent: 'bg-emerald-50 text-emerald-600' },
      { label: 'Showing', value: filtered.length, icon: Filter, accent: 'bg-stone-100 text-stone-600' },
    ];
  },

  // ── Filters ──
  filters: (data) => {
    const states = [...new Set(data.map(l => l.state))].sort();
    const regions = [...new Set(data.map(l => l.region))].sort();
    const types = [...new Set(data.map(l => l.type))].sort();
    return [
      { key: 'type', label: 'Type', icon: UserCircle, showCount: true, options: [{ value: 'all', label: 'All Types', count: data.length }, ...types.map(t => ({ value: t, label: t, count: data.filter(l => l.type === t).length }))] },
      { key: 'state', label: 'State', icon: MapPin, showCount: true, options: [{ value: 'all', label: 'All States', count: data.length }, ...states.map(s => ({ value: s, label: s, count: data.filter(l => l.state === s).length }))] },
      { key: 'region', label: 'Region', icon: Map, showCount: true, options: [{ value: 'all', label: 'All Regions', count: data.length }, ...regions.map(r => ({ value: r, label: r, count: data.filter(l => l.region === r).length }))] },
    ];
  },

  applyFilters: (data, fv) => {
    let results = data;
    if (fv.type && fv.type !== 'all') results = results.filter(l => l.type === fv.type);
    if (fv.state && fv.state !== 'all') results = results.filter(l => l.state === fv.state);
    if (fv.region && fv.region !== 'all') results = results.filter(l => l.region === fv.region);
    return results;
  },

  // ── Search ──
  searchPlaceholder: 'Search by name, city, district, zip…',
  searchFn: (l, q) =>
    l.name.toLowerCase().includes(q) ||
    l.city.toLowerCase().includes(q) ||
    l.state.toLowerCase().includes(q) ||
    l.address.toLowerCase().includes(q) ||
    l.district.toLowerCase().includes(q) ||
    l.districts.some(d => d.toLowerCase().includes(q)) ||
    (l.zip ? l.zip.includes(q) : false),

  // ── Columns ──
  columns: [
    {
      key: 'name', label: 'Name', sortable: true,
      render: (l) => (
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${l.type === 'District Manager' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
            {l.type === 'District Manager' ? <Shield size={12} /> : <UserCircle size={12} />}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-[12px] text-stone-900 truncate leading-tight">{l.name}</div>
          </div>
        </div>
      ),
    },
    { key: 'type', label: 'Type', sortable: true, render: (l) => <TypeBadge type={l.type} /> },
    {
      key: 'district', label: 'District', sortable: true,
      render: (l) => (
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-medium text-stone-700">{l.district}</span>
          {l.districts.length > 1 && <span className="text-[9px] font-bold text-stone-400 bg-stone-100 px-1.5 py-[1px] rounded-full">+{l.districts.length - 1}</span>}
        </div>
      ),
    },
    { key: 'state', label: 'State', sortable: true, render: (l) => <span className="text-[11px] font-medium text-stone-700">{l.stateCode}</span> },
    {
      key: 'region', label: 'Region', sortable: true,
      render: (l) => <span className="inline-flex items-center px-2 py-[2px] rounded-full text-[10px] font-bold ring-1 text-stone-600 bg-stone-50 ring-stone-200/60">{l.region}</span>,
    },
    { key: 'address', label: 'Address', hideBelow: 'lg' as const, render: (l) => <span className="text-[11px] text-stone-500 truncate block">{l.address || '—'}</span> },
    {
      key: 'phone', label: 'Phone', hideBelow: 'md' as const,
      render: (l) => l.phone
        ? <a href={`tel:${l.phone}`} onClick={(e) => e.stopPropagation()} className="text-[11px] text-blue-600 hover:underline">{l.phone}</a>
        : <span className="text-[10px] text-stone-300">—</span>,
    },
    {
      key: 'link', label: '', hideBelow: 'md' as const,
      render: (l) => (
        <a href={l.profileUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-blue-600 hover:text-blue-800">
          <ExternalLink size={12} />
        </a>
      ),
    },
  ],

  colWidths: ['22%', '12%', '12%', '10%', '9%', '17%', '12%', '6%'],
  defaultSort: { field: 'state', dir: 'asc' },

  sortFn: (a, b, field) => {
    const av = (a as any)[field] ?? '';
    const bv = (b as any)[field] ?? '';
    return String(av).localeCompare(String(bv));
  },

  // ── Identity ──
  getItemId: (l) => l.id,
  itemLabel: 'contacts',

  // ── Drawer ──
  renderDrawer: (item, onClose) => {
    const districtPeers = FARMERS_LOCATIONS.filter(
      l => l.district === item.district && l.stateCode === item.stateCode && l.id !== item.id
    );

    return (
      <div className="flex flex-col h-full p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${item.type === 'District Manager' ? 'bg-red-600' : 'bg-blue-600'}`}>
            {item.type === 'District Manager' ? <Shield size={18} /> : <UserCircle size={18} />}
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-stone-900">{item.name}</h2>
            <div className="flex items-center gap-2 mt-0.5"><TypeBadge type={item.type} /></div>
          </div>
        </div>

        {/* Location Info */}
        <div className="rounded-xl border border-stone-200/60 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Building2 size={14} className="text-stone-400" />
            <div>
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">District{item.districts.length > 1 ? 's' : ''}</div>
              {item.districts.length === 1 ? (
                <div className="text-[12px] font-bold text-stone-900">{item.district}, {item.stateCode}</div>
              ) : (
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {item.districts.map(d => (
                    <span key={d} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">{d}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {item.address && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-stone-400" />
              <div>
                <div className="text-[12px] font-medium text-stone-900">{item.address}</div>
                <div className="text-[11px] text-stone-500">{item.city}, {item.state} {item.zip}</div>
              </div>
            </div>
          )}

          {item.phone && (
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-stone-400" />
              <a href={`tel:${item.phone}`} className="text-[12px] font-medium text-blue-600 hover:underline">{item.phone}</a>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Map size={14} className="text-stone-400" />
            <span className="text-[12px] font-medium text-stone-700">{item.region} Region</span>
          </div>
        </div>

        {/* Profile Link */}
        <a
          href={item.profileUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-red-600 text-white text-[12px] font-bold hover:bg-red-700 transition-colors mt-4"
        >
          <ExternalLink size={14} />
          View Farmers Profile
        </a>

        {/* District Peers */}
        {districtPeers.length > 0 && (
          <div className="rounded-xl border border-stone-200/60 p-4 mt-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-3">
              Same District ({districtPeers.length} other{districtPeers.length > 1 ? 's' : ''})
            </div>
            <div className="space-y-2">
              {districtPeers.map(peer => (
                <div key={peer.id} className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-stone-50 transition-colors text-left">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-white text-[8px] font-bold shrink-0 ${peer.type === 'District Manager' ? 'bg-red-500' : 'bg-blue-500'}`}>
                    {peer.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold text-stone-900 truncate">{peer.name}</div>
                    <div className="text-[9px] text-stone-400">{peer.type}</div>
                  </div>
                  {peer.phone && <Phone size={10} className="text-stone-300 shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outreach Context */}
        <div className="bg-amber-50/50 rounded-xl border border-amber-100 p-4 mt-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-2">📋 Outreach Context</div>
          <ul className="text-[11px] text-stone-600 space-y-1.5">
            <li>• Kaysville, UT location came inbound — sunsetting internal tool</li>
            <li>• Jack had the first call (farmers.wav on desktop)</li>
            <li>• <strong>DMs oversee 10-50 agent locations</strong> — win the DM, win the district</li>
            <li>• Farmers uses IdealTraits for hiring — Teamtailor replaces both the ATS + the job board</li>
            <li>• Districts share tools — one win can cascade across locations</li>
          </ul>
        </div>

        {/* IdealTraits Link */}
        <a
          href="https://insurancejobs.idealtraits.com/search?utm_source=farmers#"
          target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-stone-200 text-stone-700 text-[11px] font-bold hover:bg-stone-50 transition-colors mt-4"
        >
          <Briefcase size={13} />
          Check Open Roles on IdealTraits
        </a>
      </div>
    );
  },

  // ── Sidebar Footer ──
  sidebarFooter: (
    <div className="p-3 border-t border-stone-100">
      <a
        href="https://insurancejobs.idealtraits.com/search?utm_source=farmers#"
        target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors text-[10px] font-bold"
      >
        <Briefcase size={12} />
        <span>IdealTraits Job Board →</span>
      </a>
      <p className="text-[9px] text-stone-400 mt-1 px-1">Open positions posted by agents & DMs</p>
    </div>
  ),

  // ── Insight Bar ──
  renderInsightBar: (segmentId, segments, filteredCount) => {
    const seg = segments.find(s => s.id === segmentId);
    if (!seg?.talkingPoint) return null;
    const talkingPoint = seg.talkingPoint.replace(/\[X\]/g, filteredCount.toLocaleString());
    const Icon = ({ LayoutGrid, Map, Building2, Zap, Target, Filter, Users, Shield, UserCircle, Briefcase } as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[seg.icon] || LayoutGrid;
    return (
      <motion.div
        key={segmentId}
        initial={{ opacity: 0, y: -8, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -8, height: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="mb-1"
      >
        <div className="rounded-xl border bg-gradient-to-r from-red-50/60 to-stone-50 border-red-200/40 px-5 py-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-red-600 text-white">
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-[14px] font-bold text-stone-900">{seg.name}</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-600 text-white tabular-nums">
                  {filteredCount.toLocaleString()} {filteredCount === 1 ? 'contact' : 'contacts'}
                </span>
              </div>
              <p className="text-[12px] leading-relaxed text-stone-600">{talkingPoint}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  },

  // ── Slots ──
  aboveTable: undefined,
  data: FARMERS_LOCATIONS,
};

// ────────────────────────────────────────────
// Page Component
// ────────────────────────────────────────────

export default function FarmersUniverse() {
  return <AudienceShell config={farmersConfig} />;
}
