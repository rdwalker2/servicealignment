import React, { useState } from 'react';
import {
  Building2, Users, Search, Clock, ArrowDown, Target, Activity, Mail,
  Download, Columns3, Eye, EyeOff, Settings, Filter, Plus, Globe, X
} from 'lucide-react';
import type { Segment } from '../../hooks/useSignalFilters';
import { DEFAULT_SEGMENTS } from '../../hooks/useSignalFilters';

interface SignalBoardHeaderProps {
  viewMode: 'accounts' | 'contacts';
  setViewMode: (mode: 'accounts' | 'contacts') => void;
  accountsCount: number;
  contactsCount: number;
  setCheckedIds: (ids: Set<string>) => void;
  filterTier: string;
  setFilterTier: (tier: '' | 'hot' | 'warm' | 'watch') => void;
  t1: number; t2: number; t3: number; wi: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterTimeframe: string;
  setFilterTimeframe: (tf: 'all' | '24h' | '7d' | '30d') => void;
  segments: Segment[];
  activeSegmentId: string;
  setActiveSegmentId: (id: string) => void;
  segmentCounts: Record<string, number>;
  handleOpenAdvancedModal: () => void;
  showAnalytics: boolean;
  setShowAnalytics: (show: boolean) => void;
  isRyanMode: boolean;
  slConnected: boolean | null;
  setShowCadencePicker: (show: boolean) => void;
  accounts: any[];
  dispositions: Map<string, any>;
  visibleColumns: Set<string>;
  toggleColumn: (col: string) => void;
  isAdmin: boolean;
  effectiveUser: any;
  setShowClaySetup: (show: boolean) => void;
  logAudit: any;
  filterRep: string;
  setFilterRep: (rep: string) => void;
  filterMarket: string;
  setFilterMarket: (market: string) => void;
  filterFirmographicTier: string;
  setFilterFirmographicTier: (tier: string) => void;
  filterAudience: string;
  setFilterAudience: (audience: string) => void;
  filterSignalSource: string;
  setFilterSignalSource: (source: string) => void;
  showAudienceBuilder: boolean;
  setShowAudienceBuilder: (show: boolean) => void;
  audienceSources: string[];
  signalSources: string[];
  accountOwners?: string[];
  deleteSegment?: (segmentId: string) => void;
}

// Reusable dropdown filter pill
function FilterPill({ label, active, activeLabel, color, children, icon: Icon }: {
  label: string; active: boolean; activeLabel?: string; color: string;
  children: React.ReactNode; icon: React.ElementType;
}) {
  const [open, setOpen] = useState(false);
  const colorMap: Record<string, { bg: string; text: string; border: string; activeBg: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200/60', activeBg: 'bg-blue-50' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200/60', activeBg: 'bg-indigo-50' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200/60', activeBg: 'bg-emerald-50' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200/60', activeBg: 'bg-orange-50' },
    cyan: { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200/60', activeBg: 'bg-cyan-50' },
    violet: { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-200/60', activeBg: 'bg-violet-50' },
    stone: { bg: 'bg-stone-900', text: 'text-white', border: 'border-stone-900', activeBg: 'bg-stone-50' },
  };
  const c = colorMap[color] || colorMap.stone;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
          active ? `${c.bg} ${c.text} ${c.border}` : 'bg-white text-stone-500 border-stone-200/60 hover:bg-stone-50'
        }`}
      >
        <Icon size={10} />
        {active ? (activeLabel || label) : label}
        <ArrowDown size={8} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-30 min-w-[140px] bg-white rounded-lg shadow-lg border border-stone-200 p-1">
            {React.Children.map(children, child =>
              React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>, { onClose: () => setOpen(false) }) : child
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function SignalBoardHeader({
  viewMode, setViewMode, accountsCount, contactsCount, setCheckedIds,
  filterTier, setFilterTier, t1, t2, t3, wi,
  searchQuery, setSearchQuery,
  filterTimeframe, setFilterTimeframe,
  segments, activeSegmentId, setActiveSegmentId, segmentCounts,
  handleOpenAdvancedModal,
  showAnalytics, setShowAnalytics,
  isRyanMode, slConnected, setShowCadencePicker,
  accounts, dispositions,
  visibleColumns, toggleColumn,
  isAdmin, effectiveUser, setShowClaySetup, logAudit,
  filterRep, setFilterRep,
  filterMarket, setFilterMarket,
  filterFirmographicTier, setFilterFirmographicTier,
  filterAudience, setFilterAudience,
  filterSignalSource, setFilterSignalSource,
  showAudienceBuilder, setShowAudienceBuilder,
  audienceSources, signalSources,
  accountOwners,
  deleteSegment
}: SignalBoardHeaderProps) {
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);
  const [showSegmentDropdown, setShowSegmentDropdown] = useState(false);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [showMarketDropdown, setShowMarketDropdown] = useState(false);
  const [showFirmoDropdown, setShowFirmoDropdown] = useState(false);
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [ownerSearch, setOwnerSearch] = useState('');

  const activeSegment = segments.find(s => s.id === activeSegmentId);
  const hasActiveFilters = filterTier || filterTimeframe !== 'all' || searchQuery || filterRep || filterMarket || filterFirmographicTier || filterAudience || filterSignalSource || activeSegmentId !== 'all';

  return (
    <div className="bg-white border-b border-stone-200/60 rounded-t-xl">
      {/* ── Row 1: Title + View Toggle + Search + Actions ── */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        {/* Title */}
        <h1 className="text-[15px] font-bold text-stone-900 shrink-0">Prospecting</h1>

        {/* View Toggle */}
        <div className="flex items-center gap-0.5 bg-stone-100 rounded-lg p-0.5 shrink-0">
          <button
            onClick={() => { setViewMode('accounts'); setCheckedIds(new Set()); }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 ${viewMode === 'accounts' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            <Building2 size={12} /> Accounts
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${viewMode === 'accounts' ? 'bg-stone-100 text-stone-600' : 'bg-stone-200/60 text-stone-400'}`}>{accountsCount}</span>
          </button>
          <button
            onClick={() => { setViewMode('contacts'); setCheckedIds(new Set()); }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 ${viewMode === 'contacts' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            <Users size={12} /> Contacts
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${viewMode === 'contacts' ? 'bg-stone-100 text-stone-600' : 'bg-stone-200/60 text-stone-400'}`}>{contactsCount}</span>
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <div className="relative w-48 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Search size={13} className="text-stone-400" />
          </div>
          <input
            id="signal-search"
            type="text"
            className="block w-full pl-8 pr-3 py-1.5 border border-stone-200/60 rounded-lg bg-stone-50/50 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 text-[11px] transition-all"
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-0.5 shrink-0">
          {!isRyanMode && (
            <button
              onClick={() => setShowCadencePicker(true)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all relative" title={`Salesloft${slConnected === true ? ' · Connected' : ''}`}
            >
              <Mail size={14} />
              <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${slConnected === true ? 'bg-emerald-500' : slConnected === false ? 'bg-red-400' : 'bg-stone-300 animate-pulse'}`} />
            </button>
          )}
          <button
            onClick={() => {
              const headers = ['Company','Domain','Tier','Firmographic Tier','Market','Audience','Score','Signals','Contacts','Stage','In Cadence','Assigned Rep','SF Account Owner','Last Activity'];
              const rows = accounts.map(a => [
                a.companyName, a.companyDomain, a.tier, a.firmographicTier || '', a.market || '', a.audienceSource || '',
                a.score, a.signals.length,
                a.contacts.length, dispositions.get(a.companyDomain)?.status || 'new',
                a.pushedToCadence ? 'Yes' : 'No', a.assignedRepId,
                a.sfAccountOwner === undefined ? 'Not in CRM' : a.sfAccountOwner === '' ? 'Unassigned' : a.sfAccountOwner,
                new Date(a.lastActivity).toLocaleDateString(),
              ]);
              const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = `prospecting-export-${new Date().toISOString().slice(0,10)}.csv`; a.click();
              URL.revokeObjectURL(url);
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all" title="Export CSV"
          >
            <Download size={14} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowColumnPicker(!showColumnPicker)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all" title="Columns"
            >
              <Columns3 size={14} />
            </button>
            {showColumnPicker && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowColumnPicker(false)} />
                <div className="absolute right-0 top-full mt-1 z-30 w-48 bg-white rounded-lg shadow-lg border border-stone-200 p-2 space-y-0.5">
                  {(viewMode === 'accounts' ? [
                    { key: 'score', label: 'Score' },
                    { key: 'signals', label: 'Signals' },
                    { key: 'primary', label: 'Primary Contact' },
                    { key: 'employees', label: 'Employees' },
                    { key: 'openRoles', label: 'Open Roles' },
                    { key: 'currentAts', label: 'Current ATS' },
                    { key: 'accountOwner', label: 'SF Owner' },
                    { key: 'lastSignal', label: 'Last Signal' },
                    { key: 'contactCount', label: 'Contacts' },
                    { key: 'activity', label: 'Outreach' },
                    { key: 'status', label: 'Actions' },
                  ] : [
                    { key: 'organization', label: 'Organization' },
                    { key: 'signals', label: 'Signals' },
                    { key: 'score', label: 'Score' },
                    { key: 'webActivity', label: 'Web Activity' },
                  ]).map(col => (
                    <button
                      key={col.key}
                      onClick={() => toggleColumn(col.key)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      {visibleColumns.has(col.key) ? <Eye size={12} className="text-stone-500" /> : <EyeOff size={12} className="text-stone-300" />}
                      <span className={visibleColumns.has(col.key) ? '' : 'text-stone-400'}>{col.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          {isAdmin && (
            <button
              onClick={() => { setShowClaySetup(true); logAudit({ user_id: effectiveUser?.id || 'unknown', action: 'open_clay_setup' }); }}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all" title="Clay Setup"
            >
              <Settings size={14} />
            </button>
          )}
          <button
            onClick={handleOpenAdvancedModal}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all" title="Advanced Filters"
          >
            <Filter size={14} />
          </button>
        </div>
      </div>

      {/* ── Row 2: Filter pills (compact) ── */}
      <div className="flex items-center gap-1.5 px-4 py-1.5 border-t border-stone-100 overflow-x-auto">
        {/* Timeframe */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowTimeframeDropdown(!showTimeframeDropdown)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
              filterTimeframe !== 'all' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-500 border-stone-200/60 hover:bg-stone-50'
            }`}
          >
            <Clock size={10} />
            {filterTimeframe === 'all' ? 'All Time' : filterTimeframe === '24h' ? '24h' : filterTimeframe === '7d' ? '7d' : '30d'}
            <ArrowDown size={8} />
          </button>
          {showTimeframeDropdown && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowTimeframeDropdown(false)} />
              <div className="absolute left-0 top-full mt-1 z-30 w-36 bg-white rounded-lg shadow-lg border border-stone-200 p-1">
                {([['all', 'All Activity'], ['24h', 'Last 24h'], ['7d', 'Last 7 Days'], ['30d', 'Last 30 Days']] as const).map(([k, l]) => (
                  <button
                    key={k}
                    onClick={() => { setFilterTimeframe(k); setShowTimeframeDropdown(false); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors ${
                      filterTimeframe === k ? 'bg-stone-50 text-stone-900' : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Segments */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowSegmentDropdown(!showSegmentDropdown)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
              activeSegmentId !== 'all' ? 'bg-violet-100 text-violet-800 border-violet-200/60' : 'bg-white text-stone-500 border-stone-200/60 hover:bg-stone-50'
            }`}
          >
            <Target size={10} />
            {activeSegment && activeSegmentId !== 'all' ? activeSegment.name : 'Segments'}
            <ArrowDown size={8} />
          </button>
          {showSegmentDropdown && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowSegmentDropdown(false)} />
              <div className="absolute left-0 top-full mt-1 z-30 w-56 bg-white rounded-lg shadow-lg border border-stone-200 p-1.5">
                {segments.map(seg => {
                  const count = segmentCounts[seg.id] ?? 0;
                  const isDefault = DEFAULT_SEGMENTS.some(d => d.id === seg.id);
                  return (
                    <button
                      key={seg.id}
                      onClick={() => { setActiveSegmentId(seg.id); setShowSegmentDropdown(false); }}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                        seg.id === activeSegmentId ? 'bg-violet-50 text-violet-800' : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <span className="flex-1 text-left truncate">{seg.name}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        seg.id === activeSegmentId ? 'bg-violet-100 text-violet-700' : 'bg-stone-100 text-stone-400'
                      }`}>{count}</span>
                      {!isDefault && deleteSegment && (
                        <span
                          role="button"
                          onClick={(e) => { e.stopPropagation(); deleteSegment(seg.id); }}
                          className="p-0.5 rounded hover:bg-red-100 text-stone-400 hover:text-red-500 transition-colors"
                          title="Delete segment"
                        >
                          <X size={10} />
                        </span>
                      )}
                    </button>
                  );
                })}
                <div className="border-t border-stone-100 mt-1 pt-1">
                  <button
                    onClick={() => { setShowSegmentDropdown(false); handleOpenAdvancedModal(); }}
                    className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-semibold text-violet-600 hover:bg-violet-50 transition-colors"
                  >
                    <Plus size={10} /> New Segment
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Admin-only filters */}
        {isAdmin && (
          <>
            {/* Market */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowMarketDropdown(!showMarketDropdown)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
                  filterMarket ? 'bg-blue-100 text-blue-800 border-blue-200/60' : 'bg-white text-stone-500 border-stone-200/60 hover:bg-stone-50'
                }`}
              >
                <Globe size={10} />
                {filterMarket ? filterMarket.toUpperCase() : 'Market'}
                <ArrowDown size={8} />
              </button>
              {showMarketDropdown && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowMarketDropdown(false)} />
                  <div className="absolute left-0 top-full mt-1 z-30 w-32 bg-white rounded-lg shadow-lg border border-stone-200 p-1">
                    {([['', 'All Markets'], ['us', '🇺🇸 US'], ['ca', '🇨🇦 Canada']] as const).map(([k, l]) => (
                      <button
                        key={k}
                        onClick={() => { setFilterMarket(k); setShowMarketDropdown(false); }}
                        className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors ${
                          filterMarket === k ? 'bg-blue-50 text-blue-800' : 'text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* ICP Fit */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowFirmoDropdown(!showFirmoDropdown)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
                  filterFirmographicTier ? 'bg-indigo-100 text-indigo-800 border-indigo-200/60' : 'bg-white text-stone-500 border-stone-200/60 hover:bg-stone-50'
                }`}
              >
                <Building2 size={10} />
                {filterFirmographicTier ? filterFirmographicTier.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'ICP Fit'}
                <ArrowDown size={8} />
              </button>
              {showFirmoDropdown && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowFirmoDropdown(false)} />
                  <div className="absolute left-0 top-full mt-1 z-30 w-36 bg-white rounded-lg shadow-lg border border-stone-200 p-1">
                    {([['', 'All Tiers'], ['tier_1', '⭐ Tier 1'], ['tier_2', 'Tier 2'], ['tier_3', 'Tier 3']] as const).map(([k, l]) => (
                      <button
                        key={k}
                        onClick={() => { setFilterFirmographicTier(k); setShowFirmoDropdown(false); }}
                        className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors ${
                          filterFirmographicTier === k ? 'bg-indigo-50 text-indigo-800' : 'text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Audience */}
            {audienceSources.length > 0 && (
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowAudienceDropdown(!showAudienceDropdown)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
                    filterAudience ? 'bg-emerald-100 text-emerald-800 border-emerald-200/60' : 'bg-white text-stone-500 border-stone-200/60 hover:bg-stone-50'
                  }`}
                >
                  <Target size={10} />
                  {filterAudience ? filterAudience.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Audience'}
                  <ArrowDown size={8} />
                </button>
                {showAudienceDropdown && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowAudienceDropdown(false)} />
                    <div className="absolute left-0 top-full mt-1 z-30 w-40 bg-white rounded-lg shadow-lg border border-stone-200 p-1">
                      <button
                        onClick={() => { setFilterAudience(''); setShowAudienceDropdown(false); }}
                        className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors ${
                          !filterAudience ? 'bg-emerald-50 text-emerald-800' : 'text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        All Audiences
                      </button>
                      {audienceSources.map(s => (
                        <button
                          key={s}
                          onClick={() => { setFilterAudience(s); setShowAudienceDropdown(false); }}
                          className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors ${
                            filterAudience === s ? 'bg-emerald-50 text-emerald-800' : 'text-stone-600 hover:bg-stone-50'
                          }`}
                        >
                          {s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Source */}
            {signalSources.length > 0 && (
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowSourceDropdown(!showSourceDropdown)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
                    filterSignalSource ? 'bg-orange-100 text-orange-800 border-orange-200/60' : 'bg-white text-stone-500 border-stone-200/60 hover:bg-stone-50'
                  }`}
                >
                  <Activity size={10} />
                  {filterSignalSource ? filterSignalSource.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Source'}
                  <ArrowDown size={8} />
                </button>
                {showSourceDropdown && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowSourceDropdown(false)} />
                    <div className="absolute left-0 top-full mt-1 z-30 w-40 bg-white rounded-lg shadow-lg border border-stone-200 p-1">
                      <button
                        onClick={() => { setFilterSignalSource(''); setShowSourceDropdown(false); }}
                        className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors ${
                          !filterSignalSource ? 'bg-orange-50 text-orange-800' : 'text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        All Sources
                      </button>
                      {signalSources.map(s => (
                        <button
                          key={s}
                          onClick={() => { setFilterSignalSource(s); setShowSourceDropdown(false); }}
                          className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors ${
                            filterSignalSource === s ? 'bg-orange-50 text-orange-800' : 'text-stone-600 hover:bg-stone-50'
                          }`}
                        >
                          {s === 'rb2b' ? '🌐 RB2B (Web Intent)' : s === 'clay' ? '🧱 Clay (Enrichment)' : s === 'linkedin' ? '💼 LinkedIn' : s === 'job_board' ? '📋 Job Board' : s}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Owner */}
            {accountOwners && accountOwners.length > 0 && (
              <div className="relative shrink-0">
                <button
                  onClick={() => { setShowOwnerDropdown(!showOwnerDropdown); setOwnerSearch(''); }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
                    filterRep && accountOwners.includes(filterRep) ? 'bg-cyan-100 text-cyan-800 border-cyan-200/60' : 'bg-white text-stone-500 border-stone-200/60 hover:bg-stone-50'
                  }`}
                >
                  <Users size={10} />
                  {filterRep && accountOwners.includes(filterRep) ? filterRep.split(' ').map(w => w[0]).join('') : 'Owner'}
                  <ArrowDown size={8} />
                </button>
                {showOwnerDropdown && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowOwnerDropdown(false)} />
                    <div className="absolute left-0 top-full mt-1 z-30 w-52 bg-white rounded-lg shadow-lg border border-stone-200 p-1">
                      <div className="px-2 py-1">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-stone-200 rounded text-[11px] placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
                          placeholder="Search owners..."
                          value={ownerSearch}
                          onChange={(e) => setOwnerSearch(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        <button
                          onClick={() => { setFilterRep(''); setShowOwnerDropdown(false); }}
                          className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors ${
                            !filterRep ? 'bg-cyan-50 text-cyan-800' : 'text-stone-600 hover:bg-stone-50'
                          }`}
                        >
                          All Owners
                        </button>
                        {accountOwners
                          .filter(o => o.toLowerCase().includes(ownerSearch.toLowerCase()))
                          .map(owner => (
                          <button
                            key={owner}
                            onClick={() => { setFilterRep(owner); setShowOwnerDropdown(false); }}
                            className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors ${
                              filterRep === owner ? 'bg-cyan-50 text-cyan-800' : 'text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            {owner}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* Analytics toggle */}
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all border shrink-0 ${
            showAnalytics ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-500 border-stone-200/60 hover:bg-stone-50'
          }`}
        >
          <Activity size={10} />
          Analytics
        </button>

        {/* Audiences toggle (admin) */}
        {isAdmin && (
          <button
            onClick={() => setShowAudienceBuilder(!showAudienceBuilder)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all border shrink-0 ${
              showAudienceBuilder ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-stone-500 border-stone-200/60 hover:bg-stone-50'
            }`}
          >
            <Users size={10} />
            Audiences
          </button>
        )}

        {/* Clear all filters */}
        {hasActiveFilters && (
          <button
            onClick={() => { setFilterTier(''); setFilterTimeframe('all'); setSearchQuery(''); setFilterRep(''); setFilterMarket(''); setFilterFirmographicTier(''); setFilterAudience(''); setFilterSignalSource(''); setActiveSegmentId('all'); }}
            className="text-[10px] font-semibold text-rose-500 hover:text-rose-700 transition-colors shrink-0 ml-1"
          >
            ✕ Clear
          </button>
        )}
      </div>
    </div>
  );
}
