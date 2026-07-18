import { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap, MapPin, Monitor, Globe, Users, Building2,
  TrendingUp, Target, Navigation, Phone, ExternalLink,
  Copy, Briefcase, Mail, LayoutGrid, Loader2, Filter, Flame,
  Star, FileText,
} from 'lucide-react';
import AudienceShell from '../components/audience/AudienceShell';
import type { AudienceConfig, AudienceSegment } from '../components/audience/audienceTypes';
import {
  loadK12Data, getContacts, generateSalesBrief,
  exportAccountsCSV, exportContactsCSV,
  classifyAts, NO_ATS_VALUES, JOBBOARD_ATS, LEGACY_ATS, MODERN_ATS,
  type K12District, type K12Contact, type AtsCategory,
} from '../data/k12Data';

// ─── Helper: format number ──────────────────────────────────────────────────

function fmt(n: number | undefined | null): string {
  if (n == null) return '—';
  return n.toLocaleString();
}

function fmtDollars(n: number | undefined | null): string {
  if (n == null || n === 0) return '—';
  return '$' + Math.round(n).toLocaleString();
}

function fmtPct(n: number | undefined | null): string {
  if (n == null) return '—';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}%`;
}

// ─── ATS Badge Colors ───────────────────────────────────────────────────────

const ATS_BADGE: Record<AtsCategory, string> = {
  paper: 'bg-orange-50 text-orange-700 border-orange-200',
  none: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  jobboard: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  legacy: 'bg-amber-50 text-amber-700 border-amber-200',
  modern: 'bg-red-50 text-red-700 border-red-200',
  teamtailor: 'bg-violet-50 text-violet-700 border-violet-200',
  unknown: 'bg-stone-50 text-stone-500 border-stone-200',
};

// ─── Locale Badge Colors ────────────────────────────────────────────────────

const LOCALE_BADGE: Record<string, string> = {
  City: 'bg-blue-50 text-blue-700 border-blue-200',
  Suburb: 'bg-violet-50 text-violet-700 border-violet-200',
  Town: 'bg-amber-50 text-amber-700 border-amber-200',
  Rural: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

// ─── ICP Badge Colors ───────────────────────────────────────────────────────

const ICP_BADGE: Record<string, string> = {
  A: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  B: 'bg-blue-50 text-blue-700 border-blue-200',
  C: 'bg-amber-50 text-amber-700 border-amber-200',
  D: 'bg-stone-100 text-stone-500 border-stone-200',
};

// ─── Role Badge Colors ──────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  decision_maker: 'bg-red-50 text-red-700 border-red-200',
  champion: 'bg-blue-50 text-blue-700 border-blue-200',
  gatekeeper: 'bg-amber-50 text-amber-700 border-amber-200',
  contact: 'bg-stone-100 text-stone-500 border-stone-200',
};

const ROLE_LABELS: Record<string, string> = {
  decision_maker: 'Decision Maker',
  champion: 'Champion',
  gatekeeper: 'Gatekeeper',
  contact: 'Contact',
};

// ─── Trend Color ────────────────────────────────────────────────────────────

function TrendValue({ value }: { value: number | undefined | null }) {
  if (value == null) return <span className="text-[11px] text-stone-300">—</span>;
  const color = value > 0 ? 'text-emerald-600' : value < 0 ? 'text-red-600' : 'text-stone-400';
  return <span className={`text-[11px] font-medium tabular-nums ${color}`}>{fmtPct(value)}</span>;
}

// ─── Build Config ───────────────────────────────────────────────────────────

function buildK12Config(data: K12District[]): AudienceConfig<K12District> {
  return {
    // ── Title ──
    title: (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
          <GraduationCap size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-[20px] font-semibold text-stone-900 leading-tight">K-12 District Power Table</h1>
          <p className="text-[11px] text-stone-500 font-medium">NCES 2024-25 · {data.length.toLocaleString()} Districts</p>
        </div>
      </div>
    ),

    // ── Segments ──
    segments: [
      { id: 'all', name: 'All Districts', icon: 'LayoutGrid', category: 'all', filter: () => true },
      { id: 'hot-leads', name: '🎯 Hot Leads', icon: 'Flame', category: 'priority', filter: (d: K12District) => d.priority_score >= 60 },
      { id: 'paper-manual', name: '📋 Paper/Manual ATS', icon: 'FileText', category: 'ats', filter: (d: K12District) => d.current_ats === 'Paper/Manual' },
      { id: 'no-ats', name: '🟢 No ATS', icon: 'Monitor', category: 'ats', filter: (d: K12District) => NO_ATS_VALUES.has(d.current_ats) || JOBBOARD_ATS.has(d.current_ats) },
      { id: 'legacy-ats', name: '🟡 Legacy ATS', icon: 'Monitor', category: 'ats', filter: (d: K12District) => LEGACY_ATS.has(d.current_ats) },
      { id: 'customers', name: '⭐ Customers', icon: 'Star', category: 'proximity', filter: (d: K12District) => d.is_customer },
      { id: 'near-customer', name: '📍 Near Customer', icon: 'Navigation', category: 'proximity', filter: (d: K12District) => d.near_customer },
      { id: 'fast-growing', name: '🚀 Fast Growing', icon: 'TrendingUp', category: 'growth', filter: (d: K12District) => d.staff_trend_pct > 5 },
      { id: 'icp-a', name: 'ICP A', icon: 'Target', category: 'growth', filter: (d: K12District) => d.icp_label === 'A' },
      { id: 'icp-b', name: 'ICP B', icon: 'Target', category: 'growth', filter: (d: K12District) => d.icp_label === 'B' },
    ] as AudienceSegment[],

    segmentCategories: [
      { key: 'all', label: '' },
      { key: 'priority', label: 'Priority' },
      { key: 'ats', label: 'ATS Status' },
      { key: 'proximity', label: 'Proximity' },
      { key: 'growth', label: 'Growth & ICP' },
    ],

    segmentIconMap: {
      LayoutGrid, Flame, FileText, Monitor, Star, Navigation, TrendingUp, Target, Filter,
    },

    // ── Stats ──
    stats: (all, filtered) => {
      const hotLeads = all.filter(d => d.priority_score >= 60).length;
      const avgStaff = all.length > 0
        ? Math.round(all.reduce((s, d) => s + (d.total_staff_2025 || 0), 0) / all.length)
        : 0;
      const customers = all.filter(d => d.is_customer).length;
      return [
        { label: 'Total Districts', value: all.length, icon: Building2, accent: 'bg-blue-50 text-blue-600' },
        { label: 'Hot Leads', value: hotLeads, icon: Flame, accent: 'bg-orange-50 text-orange-600' },
        { label: 'Avg Staff', value: avgStaff, icon: Users, accent: 'bg-emerald-50 text-emerald-600' },
        { label: 'Customers', value: customers, icon: Star, accent: 'bg-violet-50 text-violet-600' },
        { label: 'Showing', value: filtered.length, icon: Filter, accent: 'bg-stone-100 text-stone-600' },
      ];
    },

    // ── Filters ──
    filters: (allData) => {
      const states = [...new Set(allData.map(d => d.state))].sort();
      const atsValues = [...new Set(allData.map(d => d.current_ats))].sort();
      const cmsValues = [...new Set(allData.map(d => d.website_platform).filter(Boolean))].sort();
      const hrsisValues = [...new Set(allData.map(d => d.hr_sis_platform).filter(Boolean))].sort();

      return [
        {
          key: 'state', label: 'State', icon: MapPin, showCount: true,
          options: [
            { value: 'all', label: 'All States', count: allData.length },
            ...states.map(s => ({ value: s, label: s, count: allData.filter(d => d.state === s).length })),
          ],
        },
        {
          key: 'ats', label: 'ATS', icon: Monitor, showCount: true,
          options: [
            { value: 'all', label: 'All ATS', count: allData.length },
            { value: 'no_ats', label: 'No ATS/Unknown', count: allData.filter(d => NO_ATS_VALUES.has(d.current_ats) || JOBBOARD_ATS.has(d.current_ats)).length },
            { value: 'legacy', label: 'Legacy ATS', count: allData.filter(d => LEGACY_ATS.has(d.current_ats)).length },
            { value: 'modern', label: 'Modern ATS', count: allData.filter(d => MODERN_ATS.has(d.current_ats)).length },
            ...atsValues.map(a => ({ value: `specific:${a}`, label: a, count: allData.filter(d => d.current_ats === a).length })),
          ],
        },
        {
          key: 'cms', label: 'CMS', icon: Globe, showCount: true,
          options: [
            { value: 'all', label: 'All CMS', count: allData.length },
            { value: 'has_cms', label: 'Has CMS', count: allData.filter(d => d.website_platform && d.website_platform !== '').length },
            { value: 'no_cms', label: 'No CMS', count: allData.filter(d => !d.website_platform || d.website_platform === '').length },
            ...cmsValues.map(c => ({ value: `specific:${c}`, label: c, count: allData.filter(d => d.website_platform === c).length })),
          ],
        },
        {
          key: 'hrsis', label: 'HR/SIS', icon: Users, showCount: true,
          options: [
            { value: 'all', label: 'All HR/SIS', count: allData.length },
            { value: 'has_hrsis', label: 'Has HR/SIS', count: allData.filter(d => d.hr_sis_platform && d.hr_sis_platform !== '').length },
            { value: 'no_hrsis', label: 'No HR/SIS', count: allData.filter(d => !d.hr_sis_platform || d.hr_sis_platform === '').length },
            ...hrsisValues.map(h => ({ value: `specific:${h}`, label: h, count: allData.filter(d => d.hr_sis_platform === h).length })),
          ],
        },
        {
          key: 'locale', label: 'Locale', icon: Building2,
          options: [
            { value: 'all', label: 'All Locales' },
            { value: 'City', label: 'City' },
            { value: 'Suburb', label: 'Suburb' },
            { value: 'Town', label: 'Town' },
            { value: 'Rural', label: 'Rural' },
          ],
        },
        {
          key: 'growth', label: 'Growth', icon: TrendingUp,
          options: [
            { value: 'all', label: 'All Growth' },
            { value: 'fast', label: 'Fast Growing (>5%)' },
            { value: 'growing', label: 'Growing (>0%)' },
            { value: 'stable', label: 'Stable (0%)' },
            { value: 'declining', label: 'Declining' },
          ],
        },
        {
          key: 'icp', label: 'ICP Fit', icon: Target,
          options: [
            { value: 'all', label: 'All ICP' },
            { value: 'A', label: 'A — Best Fit' },
            { value: 'B', label: 'B — Good Fit' },
            { value: 'C', label: 'C — Possible' },
            { value: 'D', label: 'D — Poor Fit' },
          ],
        },
        {
          key: 'proximity', label: 'Proximity', icon: Navigation,
          options: [
            { value: 'all', label: 'All' },
            { value: 'near', label: 'Near Customer' },
            { value: 'customer', label: 'Customers Only' },
          ],
        },
      ];
    },

    // ── Apply Filters ──
    applyFilters: (results, fv) => {
      if (fv.state && fv.state !== 'all') {
        results = results.filter(d => d.state === fv.state);
      }
      if (fv.ats && fv.ats !== 'all') {
        if (fv.ats === 'no_ats') results = results.filter(d => NO_ATS_VALUES.has(d.current_ats) || JOBBOARD_ATS.has(d.current_ats));
        else if (fv.ats === 'legacy') results = results.filter(d => LEGACY_ATS.has(d.current_ats));
        else if (fv.ats === 'modern') results = results.filter(d => MODERN_ATS.has(d.current_ats));
        else if (fv.ats.startsWith('specific:')) results = results.filter(d => d.current_ats === fv.ats.replace('specific:', ''));
      }
      if (fv.cms && fv.cms !== 'all') {
        if (fv.cms === 'has_cms') results = results.filter(d => d.website_platform && d.website_platform !== '');
        else if (fv.cms === 'no_cms') results = results.filter(d => !d.website_platform || d.website_platform === '');
        else if (fv.cms.startsWith('specific:')) results = results.filter(d => d.website_platform === fv.cms.replace('specific:', ''));
      }
      if (fv.hrsis && fv.hrsis !== 'all') {
        if (fv.hrsis === 'has_hrsis') results = results.filter(d => d.hr_sis_platform && d.hr_sis_platform !== '');
        else if (fv.hrsis === 'no_hrsis') results = results.filter(d => !d.hr_sis_platform || d.hr_sis_platform === '');
        else if (fv.hrsis.startsWith('specific:')) results = results.filter(d => d.hr_sis_platform === fv.hrsis.replace('specific:', ''));
      }
      if (fv.locale && fv.locale !== 'all') {
        results = results.filter(d => d.locale_type === fv.locale);
      }
      if (fv.growth && fv.growth !== 'all') {
        if (fv.growth === 'fast') results = results.filter(d => d.staff_trend_pct > 5);
        else if (fv.growth === 'growing') results = results.filter(d => d.staff_trend_pct > 0);
        else if (fv.growth === 'stable') results = results.filter(d => d.staff_trend_pct === 0);
        else if (fv.growth === 'declining') results = results.filter(d => d.staff_trend_pct < 0);
      }
      if (fv.icp && fv.icp !== 'all') {
        results = results.filter(d => d.icp_label === fv.icp);
      }
      if (fv.proximity && fv.proximity !== 'all') {
        if (fv.proximity === 'near') results = results.filter(d => d.near_customer);
        else if (fv.proximity === 'customer') results = results.filter(d => d.is_customer);
      }
      return results;
    },

    // ── Search ──
    searchPlaceholder: 'Search districts…',
    searchFn: (d, q) => d.name.toLowerCase().includes(q),

    // ── Columns ──
    columns: [
      {
        key: 'priority_score', label: 'Priority', sortable: true,
        render: (d) => {
          if (d.is_customer) return <span className="inline-flex items-center px-2 py-[2px] rounded-full text-[9px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">⭐ {d.priority_score}</span>;
          if (d.priority_score >= 60) return <span className="inline-flex items-center px-2 py-[2px] rounded-full text-[9px] font-semibold bg-red-50 text-red-700 border border-red-200">🎯 {d.priority_score}</span>;
          if (d.priority_score >= 40) return <span className="inline-flex items-center px-2 py-[2px] rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">{d.priority_score}</span>;
          if (d.priority_score >= 25) return <span className="inline-flex items-center px-2 py-[2px] rounded-full text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">{d.priority_score}</span>;
          return <span className="inline-flex items-center px-2 py-[2px] rounded-full text-[9px] font-semibold bg-stone-100 text-stone-500 border border-stone-200">{d.priority_score}</span>;
        },
      },
      {
        key: 'name', label: 'District Name', sortable: true,
        render: (d) => (
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {d.website ? (
                <a href={d.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="font-semibold text-[12px] text-stone-900 truncate hover:text-blue-600 transition-colors leading-tight">{d.name}</a>
              ) : (
                <span className="font-semibold text-[12px] text-stone-900 truncate leading-tight">{d.name}</span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {d.is_customer && <span className="inline-flex items-center px-1.5 py-[1px] rounded text-[8px] font-semibold bg-violet-100 text-violet-700">CUSTOMER</span>}
              {d.near_customer && d.nearest_customer_dist != null && (
                <span className="inline-flex items-center px-1.5 py-[1px] rounded text-[8px] font-medium bg-blue-50 text-blue-600">
                  📍 {Math.round(d.nearest_customer_dist)}mi from {(d.nearest_customer_name || '').replace(/ (UNIFIED|ELEMENTARY|SCHOOL DISTRICT|UNION FREE|PUBLIC SCHOOLS|DISTRICT)/gi, '').trim().slice(0, 20)}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        key: 'location', label: 'Location', sortable: true,
        render: (d) => <span className="text-[11px] text-stone-600">{d.city ? `${d.city}, ${d.state}` : d.state}</span>,
      },
      {
        key: 'locale_type', label: 'Locale', sortable: true,
        render: (d) => (
          <span className={`inline-flex items-center px-2 py-[2px] rounded-full text-[9px] font-semibold border ${LOCALE_BADGE[d.locale_type] || 'bg-stone-100 text-stone-500 border-stone-200'}`}>
            {d.locale_type}
          </span>
        ),
      },
      {
        key: 'current_ats', label: 'Current ATS', sortable: true,
        render: (d) => {
          const cat = classifyAts(d.current_ats);
          return (
            <span className={`inline-flex items-center px-2 py-[2px] rounded-full text-[9px] font-semibold border ${ATS_BADGE[cat]}`}>
              {d.current_ats || 'Unknown'}
            </span>
          );
        },
      },
      {
        key: 'website_platform', label: 'Website CMS', sortable: true, hideBelow: 'lg' as const,
        render: (d) => d.website_platform
          ? <span className="inline-flex items-center px-2 py-[2px] rounded-full text-[9px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">{d.website_platform}</span>
          : <span className="text-[10px] text-stone-300">—</span>,
      },
      {
        key: 'hr_sis_platform', label: 'HR/SIS', sortable: true, hideBelow: 'lg' as const,
        render: (d) => d.hr_sis_platform
          ? <span className="inline-flex items-center px-2 py-[2px] rounded-full text-[9px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">{d.hr_sis_platform}</span>
          : <span className="text-[10px] text-stone-300">—</span>,
      },
      {
        key: 'total_staff_2025', label: 'Total Staff', sortable: true, hideBelow: 'lg' as const,
        render: (d) => <span className="text-[11px] font-medium text-stone-700 tabular-nums">{fmt(d.total_staff_2025)}</span>,
      },
      {
        key: 'staff_trend_pct', label: 'Staff Trend', sortable: true, hideBelow: 'lg' as const,
        render: (d) => <TrendValue value={d.staff_trend_pct} />,
      },
      {
        key: 'students_2025', label: 'Students', sortable: true, hideBelow: 'lg' as const,
        render: (d) => <span className="text-[11px] font-medium text-stone-700 tabular-nums">{fmt(d.students_2025)}</span>,
      },
      {
        key: 'enrollment_trend_pct', label: 'Enroll Trend', sortable: true, hideBelow: 'lg' as const,
        render: (d) => <TrendValue value={d.enrollment_trend_pct} />,
      },
      {
        key: 'total_schools', label: 'Schools', sortable: true, hideBelow: 'lg' as const,
        render: (d) => <span className="text-[11px] font-medium text-stone-700 tabular-nums">{fmt(d.total_schools)}</span>,
      },
      {
        key: 'total_revenue_per_pupil', label: 'Rev/Pupil', sortable: true, hideBelow: 'lg' as const,
        render: (d) => <span className="text-[11px] font-medium text-stone-700 tabular-nums">{fmtDollars(d.total_revenue_per_pupil)}</span>,
      },
      {
        key: 'target_persona', label: 'Who to Call', sortable: true, hideBelow: 'lg' as const,
        render: (d) => <span className="text-[10px] text-stone-500 truncate block">{d.target_persona || '—'}</span>,
      },
      {
        key: 'icp_label', label: 'ICP Fit', sortable: true,
        render: (d) => (
          <span className={`inline-flex items-center px-2 py-[2px] rounded-full text-[9px] font-semibold border ${ICP_BADGE[d.icp_label] || ICP_BADGE.D}`}>
            {d.icp_label}
          </span>
        ),
      },
    ],

    colWidths: ['85px', '240px', '140px', '80px', '150px', '120px', '130px', '90px', '90px', '85px', '95px', '65px', '95px', '160px', '70px'],
    defaultSort: { field: 'priority_score', dir: 'desc' },

    sortFn: (a, b, field) => {
      const numericFields = new Set([
        'priority_score', 'total_staff_2025', 'staff_trend_pct',
        'students_2025', 'enrollment_trend_pct', 'total_schools',
        'total_revenue_per_pupil', 'icp_score',
      ]);
      if (numericFields.has(field)) {
        const av = (a as any)[field] ?? 0;
        const bv = (b as any)[field] ?? 0;
        return av - bv;
      }
      const av = String((a as any)[field] ?? '');
      const bv = String((b as any)[field] ?? '');
      return av.localeCompare(bv);
    },

    rowClassName: (d) => d.is_customer ? 'bg-violet-50/30' : '',
    getItemId: (d) => d.nces_id,
    itemLabel: 'districts',

    // ── Drawer ──
    renderDrawer: (d, onClose) => {
      const contacts = getContacts(d);
      const atsCat = classifyAts(d.current_ats);
      const custShort = (d.nearest_customer_name || '').replace(/ (UNIFIED|ELEMENTARY|SCHOOL DISTRICT|UNION FREE|PUBLIC SCHOOLS|DISTRICT)/gi, '').trim();

      return (
        <div className="flex flex-col h-full p-5">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-[16px] font-semibold text-stone-900 leading-tight">{d.name}</h2>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500">
              <MapPin size={12} className="text-stone-400" />
              <span>{d.city ? `${d.city}, ${d.state}` : d.state}</span>
              <span>·</span>
              <span>{d.locale_type}</span>
              <span>·</span>
              <span>{d.total_schools} schools</span>
            </div>
          </div>

          {/* Badge Row */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {d.is_customer && <span className="inline-flex items-center px-2 py-[2px] rounded-full text-[9px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">⭐ Customer</span>}
            <span className={`inline-flex items-center px-2 py-[2px] rounded-full text-[9px] font-semibold border ${ATS_BADGE[atsCat]}`}>{d.current_ats || 'No ATS'}</span>
            {d.website_platform && <span className="inline-flex items-center px-2 py-[2px] rounded-full text-[9px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">{d.website_platform}</span>}
            {d.near_customer && <span className="inline-flex items-center px-2 py-[2px] rounded-full text-[9px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">📍 Near Customer</span>}
            <span className={`inline-flex items-center px-2 py-[2px] rounded-full text-[9px] font-semibold border ${ICP_BADGE[d.icp_label] || ICP_BADGE.D}`}>ICP {d.icp_label}</span>
          </div>

          {/* 3-stat row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-xl border border-stone-200/60 p-3 text-center">
              <div className="text-[15px] font-semibold text-stone-900 tabular-nums">{fmt(d.total_staff_2025)}</div>
              <div className="text-[9px] font-medium text-stone-400 mt-0.5">Staff</div>
            </div>
            <div className="rounded-xl border border-stone-200/60 p-3 text-center">
              <div className="text-[15px] font-semibold text-stone-900 tabular-nums">{fmt(d.students_2025)}</div>
              <div className="text-[9px] font-medium text-stone-400 mt-0.5">Students</div>
            </div>
            <div className="rounded-xl border border-stone-200/60 p-3 text-center">
              <div className="text-[15px] font-semibold text-stone-900 tabular-nums">{fmtDollars(d.total_revenue_per_pupil)}</div>
              <div className="text-[9px] font-medium text-stone-400 mt-0.5">Rev/Pupil</div>
            </div>
          </div>

          {/* Contacts */}
          {contacts.length > 0 && (
            <div className="rounded-xl border border-stone-200/60 p-4 mb-4">
              <div className="text-[10px] font-semibold text-stone-400 mb-3">Contacts</div>
              <div className="space-y-3">
                {contacts.map((c, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <span className={`inline-flex items-center px-1.5 py-[1px] rounded text-[8px] font-semibold border ${ROLE_COLORS[c.role] || ROLE_COLORS.contact}`}>
                        {ROLE_LABELS[c.role] || c.role}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-semibold text-stone-900">{c.name}</span>
                        {c.linkedin_url && (
                          <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-blue-600 hover:text-blue-800">
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                      {c.title && <div className="text-[10px] text-stone-500 mt-0.5">{c.title}</div>}
                      <div className="flex items-center gap-3 mt-1">
                        {c.email && (
                          <a href={`mailto:${c.email}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 text-[10px] text-blue-600 hover:underline">
                            <Mail size={10} /> {c.email}
                          </a>
                        )}
                        {c.phone && (
                          <a href={`tel:${c.phone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 text-[10px] text-blue-600 hover:underline">
                            <Phone size={10} /> {c.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Openings */}
          {(d.active_jobs_count || d.careers_url) && (
            <div className="rounded-xl border border-stone-200/60 p-4 mb-4">
              <div className="text-[10px] font-semibold text-stone-400 mb-2">Active Openings</div>
              {d.active_jobs_count ? (
                <div className="text-[12px] font-semibold text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                  🔥 {d.active_jobs_count} active job postings
                </div>
              ) : d.careers_url ? (
                <a href={d.careers_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] text-blue-600 hover:underline">
                  <ExternalLink size={11} /> Careers page
                </a>
              ) : null}
            </div>
          )}

          {/* Intel */}
          <div className="rounded-xl border border-stone-200/60 p-4 mb-4">
            <div className="text-[10px] font-semibold text-stone-400 mb-2">Intel</div>
            <div className="space-y-2 text-[11px]">
              {d.tech_ecosystem && <div className="flex justify-between"><span className="text-stone-500">Tech Ecosystem</span><span className="font-medium text-stone-700">{d.tech_ecosystem}</span></div>}
              {d.hr_sis_platform && <div className="flex justify-between"><span className="text-stone-500">HR/SIS</span><span className="font-medium text-stone-700">{d.hr_sis_platform}</span></div>}
              <div className="flex justify-between"><span className="text-stone-500">Staff Trend</span><TrendValue value={d.staff_trend_pct} /></div>
              <div className="flex justify-between"><span className="text-stone-500">Enrollment Trend</span><TrendValue value={d.enrollment_trend_pct} /></div>
              {d.salary_pct_of_total != null && <div className="flex justify-between"><span className="text-stone-500">Salary %</span><span className="font-medium text-stone-700">{(d.salary_pct_of_total * 100).toFixed(0)}%</span></div>}
              {d.county && <div className="flex justify-between"><span className="text-stone-500">County</span><span className="font-medium text-stone-700">{d.county}</span></div>}
              <div className="flex justify-between"><span className="text-stone-500">NCES ID</span><span className="font-medium text-stone-700 tabular-nums">{d.nces_id}</span></div>
              {d.linkedin_url && (
                <div className="flex justify-between">
                  <span className="text-stone-500">LinkedIn</span>
                  <a href={d.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">View →</a>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-auto pt-2">
            {d.phone_formatted && (
              <a href={`tel:${d.phone_formatted}`} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-200 text-[11px] font-semibold text-stone-700 hover:bg-stone-50 transition-colors">
                <Phone size={12} /> Call
              </a>
            )}
            {d.website && (
              <a href={d.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-200 text-[11px] font-semibold text-stone-700 hover:bg-stone-50 transition-colors">
                <ExternalLink size={12} /> Website
              </a>
            )}
            <button
              onClick={() => {
                const brief = generateSalesBrief(d);
                navigator.clipboard.writeText(brief);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-200 text-[11px] font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <Copy size={12} /> Copy Brief
            </button>
          </div>
        </div>
      );
    },

    // ── Sidebar Footer ──
    // TODO: Add export buttons here when AudienceShell supports passing filtered data to sidebarFooter
    sidebarFooter: (
      <div className="p-3 border-t border-stone-100">
        <div className="text-[9px] text-stone-400 px-1">
          NCES 2024-25 data · Priority scored by ATS, growth, locale, revenue
        </div>
      </div>
    ),

    // ── Slots ──
    // TODO: Add state heat map as aboveTable when AudienceShell supports interactive aboveTable
    aboveTable: undefined,
    renderInsightBar: undefined,

    data,
  };
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default function K12Universe() {
  const [data, setData] = useState<K12District[] | null>(null);

  useEffect(() => {
    loadK12Data().then(setData);
  }, []);

  const config = useMemo(() => {
    if (!data) return null;
    return buildK12Config(data);
  }, [data]);

  if (!config) {
    return (
      <div className="flex items-center justify-center h-screen bg-stone-50/50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-blue-500 animate-spin" />
          <span className="text-[13px] font-medium text-stone-500">Loading K-12 districts…</span>
        </div>
      </div>
    );
  }

  return <AudienceShell config={config} />;
}
