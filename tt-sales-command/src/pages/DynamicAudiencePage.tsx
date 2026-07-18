// ── DynamicAudiencePage ──
// Universal audience page for any Clay-backed audience.
// Reads from audience_seeds (pending) + clay_signals (enriched).
// Used for all dynamic audiences created via Audience Builder or Antigravity chat.

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Download, Upload, ArrowUpDown, ArrowDown, ArrowUp,
  Building2, MapPin, Users, Zap, Clock, Loader2, Globe,
  ChevronRight, Mail, X, AlertCircle, Sparkles, Target, FileSpreadsheet,
  CheckSquare, Square, ArrowRightLeft, Copy, Filter, UserCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fetchAudienceSeeds, generateClayCSV, type AudienceSeed } from '../lib/audienceDb';
import { groupByAccount, groupByContact, type AccountView, type ContactView } from '../data/signalBoardData';
import { TierDot, ScoreBadge } from '../components/signal-board/signalBoardAtoms';
import { ContactList } from '../components/signal-board/ContactList';
import AccountDrawer from '../components/signal-board/AccountDrawer';
import { AdvancedSegmentModal } from '../components/signal-board/AdvancedSegmentModal';
import type { FilterCondition } from '../hooks/useSignalFilters';
import { DEFAULT_SEGMENTS, type Segment } from '../hooks/useSignalFilters';
import { useAuth } from '../contexts/AuthContext';
import { REP_ID_TO_INITIALS, REP_PROFILES } from '../contexts/AuthContext';
import { timeAgo, getPersonaLabel } from '../data/signalBoardData';

type ViewMode = 'accounts' | 'contacts';
type SortKey = 'company' | 'employees' | 'score' | 'signals' | 'status' | 'lastActivity' | 'contacts';
type SortDir = 'asc' | 'desc';
type ViewFilter = 'all' | 'pending' | 'enriched';

interface MergedAccount {
  id: string;
  companyName: string;
  companyDomain: string;
  companyLocation: string;
  employeeCount: number;
  currentAts: string;
  industry: string;
  audienceSource: string;
  contactCount: number;
  status: 'pending' | 'sent_to_clay' | 'enriched';
  // Enriched fields (from clay_signals via groupByAccount)
  enriched?: AccountView;
  seedId?: string;
}

export default function DynamicAudiencePage() {
  const { audienceId } = useParams<{ audienceId: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [seeds, setSeeds] = useState<AudienceSeed[]>([]);
  const [enrichedAccounts, setEnrichedAccounts] = useState<AccountView[]>([]);
  const [contactCounts, setContactCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('accounts');
  const [audienceFilter, setAudienceFilter] = useState<string>('all');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedContactEmail, setSelectedContactEmail] = useState<string | null>(null);
  const [checkedDomains, setCheckedDomains] = useState<Set<string>>(new Set());
  const [checkedContactIds, setCheckedContactIds] = useState<Set<string>>(new Set());
  const [hoverScoreId, setHoverScoreId] = useState<string | null>(null);
  const [hoverScoreEl, setHoverScoreEl] = useState<HTMLElement | null>(null);
  const [editingAudience, setEditingAudience] = useState<string | null>(null);
  const [movingDomains, setMovingDomains] = useState<Set<string>>(new Set());
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Saved segments (shared with Signal Board)
  const [segments, setSegments] = useState<Segment[]>(DEFAULT_SEGMENTS);
  const [activeSegmentId, setActiveSegmentId] = useState<string>('all');
  const [showSegmentDropdown, setShowSegmentDropdown] = useState(false);

  // Load persisted segments on mount
  useEffect(() => {
    const loadSegments = async () => {
      const { data } = await supabase.from('saved_segments').select('*');
      if (data && data.length > 0) {
        const persisted: Segment[] = data.map((d: any) => ({
          id: d.segment_id,
          name: d.name,
          icon: d.icon,
          conditions: d.conditions as FilterCondition[],
        }));
        const defaultIds = new Set(DEFAULT_SEGMENTS.map(s => s.id));
        setSegments([...DEFAULT_SEGMENTS, ...persisted.filter(s => !defaultIds.has(s.id))]);
      }
    };
    loadSegments();
  }, []);

  const isAllMode = audienceId === 'all';
  // Display labels for audience IDs that don't auto-format well
  const DISPLAY_LABELS: Record<string, string> = {
    k12: 'School Districts', rippling: 'Rippling', dayforce: 'Dayforce', hibob: 'HiBob', adp: 'ADP',
  };
  const audienceLabel = useMemo(() =>
    isAllMode ? 'All Accounts' : (DISPLAY_LABELS[audienceId || ''] || (audienceId || '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')),
  [audienceId, isAllMode]);

  const loadData = useCallback(async () => {
    if (!audienceId) return;
    setLoading(true);

    // Fetch seeds (all or filtered) to populate the CSV exporter using our backward-compatible fetcher
    const seedData = isAllMode
      ? await fetchAudienceSeeds()
      : await fetchAudienceSeeds(audienceId);
    setSeeds(seedData);

    let viewQuery = supabase.from('clay_accounts_view').select('*');
    if (!isAllMode) viewQuery = viewQuery.eq('audience_source', audienceId);
    
    const { data: viewData, error: viewError } = await viewQuery;
    
    if (!viewError && viewData) {
      const domains = viewData.map(v => v.company_domain);
      
      // Fetch all contacts for these domains in batches
      const allContactsMap = new Map<string, ContactView[]>();
      
      // Supabase has a limit on IN clauses, so we fetch all contacts and filter, or fetch in chunks
      // Since our DB is small, fetching all contacts or chunking is fine. Let's do chunking just in case.
      for (let i = 0; i < domains.length; i += 200) {
        const chunk = domains.slice(i, i + 200);
        const { data: contactsData } = await supabase.from('contacts').select('*').in('domain', chunk);
        if (contactsData) {
          for (const c of contactsData) {
            if (!allContactsMap.has(c.domain)) allContactsMap.set(c.domain, []);
            allContactsMap.get(c.domain)!.push({
              name: c.name,
              email: c.email,
              title: c.title || '',
              linkedinUrl: c.linkedin_url || '',
              phone: c.phone || '',
              avatarColor: 'bg-stone-200 text-stone-600', // standard fallback
              isPrimary: c.is_primary || false,
              contactPersona: c.persona as any,
              companyName: '', // Filled in below
              companyDomain: c.domain,
              companyLocation: '',
              companyTier: 'watch',
              employeeCount: 0,
              signals: [], // Signals remain lazy loaded for performance
              contactScore: 0,
              lastSignalAt: '',
              webVisitCount: 0,
              assignedRepId: '',
              sfContactId: c.sf_contact_id
            });
          }
        }
      }

      // Map aggregated view rows to lightweight AccountViews
      const grouped: AccountView[] = viewData.map(v => {
        const acctContacts = allContactsMap.get(v.company_domain) || [];
        // Fill in account details for the contacts
        acctContacts.forEach(c => {
          c.companyName = v.company_name;
          c.companyLocation = v.company_location || '';
          c.companyTier = (v.icp_tier || 'watch') as any;
          c.employeeCount = v.employee_count || 0;
          c.assignedRepId = v.assigned_rep_id || '';
        });

        return {
          companyName: v.company_name,
          companyDomain: v.company_domain,
          companyLocation: v.company_location || '',
          employeeCount: v.employee_count || 0,
          companySizeLinkedin: v.company_size_linkedin,
          openRoles: v.open_roles || 0,
          currentAts: v.current_ats || '',
          audienceSource: v.audience_source,
          tier: (v.icp_tier || 'watch') as any,
          score: v.total_score || 0,
          fitScore: 0,
          intentScore: 0,
          signals: [], // Lazy loaded
          signalCount: v.signal_count,
          contacts: acctContacts,
          contactCount: v.contact_count,
          lastActivity: v.last_activity,
          webVisits: v.web_visits || 0,
          assignedRepId: v.assigned_rep_id || '',
          aiResearchBrief: v.ai_research_brief,
          ispScore: v.isp_score,
          ispExplanation: v.isp_explanation,
          g2Score: v.g2_score,
          indeedScore: v.indeed_score,
          glassdoorScore: v.glassdoor_score,
          negativeReviews: v.negative_reviews,
          signalCategory: v.signal_category,
          hiringSignals: v.hiring_signals,
          sfAccountOwner: undefined,
          sfAccountId: undefined,
          market: undefined,
          firmographicTier: undefined,
          isExistingCustomer: false,
          committeeRoles: new Set(),
          personasCovered: new Set(),
          pushedToCadence: false,
          notes: []
        };
      });
      setEnrichedAccounts(grouped);
      
      // Update contact counts for the stats bar
      const counts = new Map<string, number>();
      grouped.forEach(a => counts.set(a.companyDomain, a.contacts.length));
      setContactCounts(counts);
      
    } else {
      console.error('Failed to load accounts view', viewError);
      setEnrichedAccounts([]);
    }

    setLoading(false);
  }, [audienceId, isAllMode]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Inline audience edit ──
  const handleMoveToAudience = useCallback(async (domains: string[], newAudience: string) => {
    setMovingDomains(new Set(domains));
    try {
      // Update audience_seeds
      for (const domain of domains) {
        await supabase.from('audience_seeds')
          .update({ audience_source: newAudience })
          .eq('company_domain', domain);
        // Also update clay_signals so they move in Signal Board
        await supabase.from('clay_signals')
          .update({ audience_source: newAudience })
          .eq('company_domain', domain);
      }
      // Reload data
      await loadData();
      setCheckedDomains(new Set());
      setEditingAudience(null);
    } finally {
      setMovingDomains(new Set());
    }
  }, [loadData]);

  // Merge seeds + enriched into one list
  const mergedAccounts = useMemo(() => {
    return enrichedAccounts.map(acct => ({
      id: acct.companyDomain,
      companyName: acct.companyName,
      companyDomain: acct.companyDomain,
      companyLocation: acct.companyLocation,
      employeeCount: acct.employeeCount,
      currentAts: acct.currentAts,
      industry: '',
      audienceSource: acct.audienceSource || '',
      contactCount: acct.contactCount || 0,
      status: (acct.signalCount || 0) > 0 ? 'enriched' : 'pending',
      enriched: acct,
    })) as MergedAccount[];
  }, [enrichedAccounts]);

  // Detect duplicate domains (in multiple audiences)
  const duplicateDomains = useMemo(() => {
    const domainAudiences = new Map<string, Set<string>>();
    for (const seed of seeds) {
      if (!domainAudiences.has(seed.company_domain)) {
        domainAudiences.set(seed.company_domain, new Set());
      }
      domainAudiences.get(seed.company_domain)!.add(seed.audience_source);
    }
    const dupes = new Map<string, string[]>();
    for (const [domain, audiences] of domainAudiences) {
      if (audiences.size > 1) dupes.set(domain, [...audiences]);
    }
    return dupes;
  }, [seeds]);

  // Filter + search + sort
  const filteredAccounts = useMemo(() => {
    let result = mergedAccounts;

    // View filter
    if (viewFilter === 'pending') result = result.filter(a => a.status !== 'enriched');
    if (viewFilter === 'enriched') result = result.filter(a => a.status === 'enriched');

    // Audience filter (All mode only)
    if (isAllMode && audienceFilter !== 'all') {
      result = result.filter(a => a.audienceSource === audienceFilter);
    }

    // Saved segment filter (cross-cutting)
    const activeSegment = segments.find(s => s.id === activeSegmentId);
    if (activeSegment && activeSegment.conditions.length > 0) {
      result = result.filter(acct => {
        if (!acct.enriched) return false;
        return activeSegment.conditions.every(cond => {
          if (!cond.value.trim()) return true;
          let val: string | number | undefined;
          switch (cond.field) {
            case 'company_name': val = acct.companyName; break;
            case 'company_location': val = acct.companyLocation; break;
            case 'employee_count': val = acct.employeeCount; break;
            case 'current_ats': val = acct.currentAts; break;
            case 'open_roles': val = acct.enriched!.openRoles; break;
            case 'signal_score': val = acct.enriched!.score; break;
            case 'icp_tier': val = acct.enriched!.tier; break;
            case 'page_visited': {
              const signals = acct.enriched!.signals || [];
              return signals.some((s: any) => s.name?.toLowerCase().includes(cond.value.toLowerCase()));
            }
            default: val = undefined;
          }
          if (val === undefined || val === null) return false;
          const sVal = String(val).toLowerCase();
          const qVal = cond.value.toLowerCase();
          const numVal = typeof val === 'number' ? val : parseFloat(sVal);
          const qNum = parseFloat(qVal);
          switch (cond.operator) {
            case 'contains': return sVal.includes(qVal);
            case 'not_contains': return !sVal.includes(qVal);
            case 'equals': return sVal === qVal;
            case 'not_equals': return sVal !== qVal;
            case 'gt': return !isNaN(numVal) && !isNaN(qNum) && numVal > qNum;
            case 'lt': return !isNaN(numVal) && !isNaN(qNum) && numVal < qNum;
            default: return true;
          }
        });
      });
    }

    // Advanced filters
    if (activeFilterCount > 0 && filterConditions.length > 0) {
      result = result.filter(acct => {
        if (!acct.enriched) return false; // Only filter enriched accounts

        // Evaluate a single condition against this account
        const evalCond = (cond: FilterCondition): boolean => {
          if (!cond.value.trim()) return true;
          let val: string | number | undefined;
          switch (cond.field) {
            case 'company_name': val = acct.companyName; break;
            case 'company_location': val = acct.companyLocation; break;
            case 'employee_count': val = acct.employeeCount; break;
            case 'current_ats': val = acct.currentAts; break;
            case 'open_roles': val = acct.enriched!.openRoles; break;
            case 'signal_score': val = acct.enriched!.score; break;
            case 'icp_tier': val = acct.enriched!.tier; break;
            default: val = undefined;
          }
          if (val === undefined || val === null) return false;
          const sVal = String(val).toLowerCase();
          const qVal = cond.value.toLowerCase();
          const numVal = typeof val === 'number' ? val : parseFloat(sVal);
          const qNum = parseFloat(qVal);
          switch (cond.operator) {
            case 'contains': return sVal.includes(qVal);
            case 'not_contains': return !sVal.includes(qVal);
            case 'equals': return sVal === qVal;
            case 'not_equals': return sVal !== qVal;
            case 'gt': return !isNaN(numVal) && !isNaN(qNum) && numVal > qNum;
            case 'lt': return !isNaN(numVal) && !isNaN(qNum) && numVal < qNum;
            default: return true;
          }
        };

        // Group conditions into OR-groups: AND conditions form a group, OR starts a new group
        const groups: FilterCondition[][] = [[]];
        for (const cond of filterConditions) {
          if (cond.logic === 'or' && groups[groups.length - 1].length > 0) {
            groups.push([]);
          }
          groups[groups.length - 1].push(cond);
        }

        // A row passes if ANY group matches (all conditions in that group are true)
        return groups.some(group => group.every(c => evalCond(c)));
      });
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.companyName.toLowerCase().includes(q) ||
        a.companyDomain.toLowerCase().includes(q) ||
        a.companyLocation.toLowerCase().includes(q) ||
        a.currentAts.toLowerCase().includes(q)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'company': cmp = a.companyName.localeCompare(b.companyName); break;
        case 'employees': cmp = a.employeeCount - b.employeeCount; break;
        case 'score': cmp = (a.enriched?.score || 0) - (b.enriched?.score || 0); break;
        case 'signals': cmp = (a.enriched?.signals.length || 0) - (b.enriched?.signals.length || 0); break;
        case 'contacts': cmp = a.contactCount - b.contactCount; break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
        case 'lastActivity': cmp = new Date(a.enriched?.lastActivity || 0).getTime() - new Date(b.enriched?.lastActivity || 0).getTime(); break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [mergedAccounts, viewFilter, audienceFilter, isAllMode, searchQuery, sortKey, sortDir, activeFilterCount, filterConditions, activeSegmentId, segments]);

  const selectedAccount = selectedDomain
    ? enrichedAccounts.find(a => a.companyDomain === selectedDomain)
    : selectedContactEmail
      ? enrichedAccounts.find(a => a.contacts.some(c => c.email === selectedContactEmail))
      : null;

  // Flatten contacts from enriched accounts for People view
  const allContacts = useMemo(() => {
    const contacts: ContactView[] = [];
    for (const acct of enrichedAccounts) {
      for (const c of acct.contacts) contacts.push(c);
    }
    // Apply search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return contacts.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.companyName.toLowerCase().includes(q)
      );
    }
    return contacts;
  }, [enrichedAccounts, searchQuery]);

  const stats = useMemo(() => ({
    total: mergedAccounts.length,
    pending: mergedAccounts.filter(a => a.status === 'pending').length,
    inClay: mergedAccounts.filter(a => a.status === 'sent_to_clay').length,
    enriched: mergedAccounts.filter(a => a.status === 'enriched').length,
    totalContacts: Array.from(contactCounts.values()).reduce((s, c) => s + c, 0),
    avgScore: enrichedAccounts.length > 0
      ? Math.round(enrichedAccounts.reduce((s, a) => s + a.score, 0) / enrichedAccounts.length)
      : 0,
    hot: enrichedAccounts.filter(a => a.tier === 'hot').length,
    warm: enrichedAccounts.filter(a => a.tier === 'warm').length,
  }), [mergedAccounts, enrichedAccounts, contactCounts]);

  // Get distinct audience sources for filter dropdown
  const audienceSources = useMemo(() => {
    const sources = new Set(mergedAccounts.map(a => a.audienceSource).filter(Boolean));
    return [...sources].sort();
  }, [mergedAccounts]);

  const handleExportCSV = () => {
    if (seeds.length > 0) {
      const csv = generateClayCSV(seeds);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${audienceId}-for-clay-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const handleAddCondition = () => {
    setFilterConditions(prev => [...prev, {
      id: crypto.randomUUID(),
      field: 'company_name',
      operator: 'contains',
      value: '',
    }]);
  };

  const handleUpdateCondition = (id: string, updates: Partial<FilterCondition>) => {
    setFilterConditions(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleRemoveCondition = (id: string) => {
    setFilterConditions(prev => prev.filter(c => c.id !== id));
  };

  const handleApplyFilters = () => {
    setActiveFilterCount(filterConditions.filter(c => c.value.trim()).length);
    setIsFilterModalOpen(false);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={9} className="text-stone-300" />;
    return sortDir === 'desc' ? <ArrowDown size={9} className="text-stone-600" /> : <ArrowUp size={9} className="text-stone-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={20} className="animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-stone-50/50">
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-stone-200/60 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-[16px] font-bold text-stone-900">{audienceLabel}</h1>
            <p className="text-[11px] text-stone-400 mt-0.5">
              {stats.total} accounts · {stats.totalContacts} contacts · {stats.enriched} enriched · {stats.pending} pending
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && seeds.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white text-[11px] font-semibold rounded-lg hover:bg-stone-800 transition-colors"
              >
                <Download size={12} /> Export for Clay
              </button>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 text-[10px]">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-stone-500">{stats.pending} pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-stone-500">{stats.inClay} in Clay</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-stone-500">{stats.enriched} enriched</span>
            </div>
          </div>
          <div className="w-px h-4 bg-stone-200" />
          {stats.enriched > 0 && (
            <div className="flex items-center gap-4 text-[10px]">
              <span className="text-stone-400">Avg Score: <strong className="text-stone-700">{stats.avgScore}</strong></span>
              <span className="text-rose-500 font-semibold">{stats.hot} hot</span>
              <span className="text-amber-500 font-semibold">{stats.warm} warm</span>
            </div>
          )}
          <div className="flex-1" />

          {/* Audience filter (All mode) */}
          {isAllMode && audienceSources.length > 1 && (
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-stone-400 font-semibold">Audience:</span>
              <select
                value={audienceFilter}
                onChange={e => setAudienceFilter(e.target.value)}
                className="text-[10px] font-semibold bg-white border border-stone-200/60 rounded-lg px-2 py-1 text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-900"
              >
                <option value="all">All ({mergedAccounts.length})</option>
                {audienceSources.map(s => (
                  <option key={s} value={s}>
                    {s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} ({mergedAccounts.filter(a => a.audienceSource === s).length})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Accounts / Contacts toggle */}
          <div className="flex items-center gap-0.5 bg-stone-100 rounded-lg p-0.5 shrink-0">
            <button
              onClick={() => { setViewMode('accounts'); setCheckedContactIds(new Set()); }}
              className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all flex items-center gap-1 ${viewMode === 'accounts' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              <Building2 size={11} /> Accounts
              <span className={`px-1 py-0.5 rounded-full text-[8px] font-bold ${viewMode === 'accounts' ? 'bg-stone-100 text-stone-700' : 'bg-stone-200/60 text-stone-400'}`}>{filteredAccounts.length}</span>
            </button>
            <button
              onClick={() => { setViewMode('contacts'); setCheckedDomains(new Set()); }}
              className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all flex items-center gap-1 ${viewMode === 'contacts' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              <Users size={11} /> Contacts
              <span className={`px-1 py-0.5 rounded-full text-[8px] font-bold ${viewMode === 'contacts' ? 'bg-stone-100 text-stone-700' : 'bg-stone-200/60 text-stone-400'}`}>{allContacts.length}</span>
            </button>
          </div>

          {/* View filter (accounts mode only) */}
          {viewMode === 'accounts' && (
          <div className="flex items-center gap-0.5 bg-stone-100 rounded-lg p-0.5">
            {(['all', 'enriched', 'pending'] as const).map(f => (
              <button
                key={f}
                onClick={() => setViewFilter(f)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
                  viewFilter === f ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                {f === 'all' ? 'All' : f === 'enriched' ? 'Enriched' : 'Pending'}
              </button>
            ))}
          </div>
          )}

          {/* Saved Segments */}
          <div className="relative">
            <button
              onClick={() => setShowSegmentDropdown(!showSegmentDropdown)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
                activeSegmentId !== 'all' ? 'bg-violet-100 text-violet-800 border-violet-200/60' : 'bg-white text-stone-500 border-stone-200/60 hover:bg-stone-50'
              }`}
            >
              <Target size={10} />
              {activeSegmentId !== 'all' ? segments.find(s => s.id === activeSegmentId)?.name || 'Segments' : 'Segments'}
              <ArrowDown size={8} />
            </button>
            {showSegmentDropdown && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowSegmentDropdown(false)} />
                <div className="absolute left-0 top-full mt-1 z-30 w-56 bg-white rounded-lg shadow-lg border border-stone-200 p-1.5">
                  {segments.map(seg => (
                    <button
                      key={seg.id}
                      onClick={() => { setActiveSegmentId(seg.id); setShowSegmentDropdown(false); }}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                        seg.id === activeSegmentId ? 'bg-violet-50 text-violet-800' : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <span className="flex-1 text-left truncate">{seg.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Advanced Filters */}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
              activeFilterCount > 0
                ? 'bg-violet-50 text-violet-700 border-violet-200'
                : 'bg-white text-stone-500 border-stone-200/60 hover:text-stone-700 hover:border-stone-300'
            }`}
          >
            <Filter size={10} />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-0.5 w-4 h-4 rounded-full bg-violet-600 text-white text-[8px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Search */}
          <div className="relative w-40">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <Search size={12} className="text-stone-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-7 pr-2 py-1.5 border border-stone-200/60 rounded-lg bg-stone-50/50 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 text-[10px]"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'accounts' ? (
        <>
        {/* Bulk action bar */}
        <AnimatePresence>
          {checkedDomains.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-0"
            >
              <div className="flex items-center justify-between bg-stone-100/80 border border-stone-200/60 px-4 py-2 rounded-t-lg">
                <span className="text-[11px] font-medium text-stone-700">{checkedDomains.size} account{checkedDomains.size > 1 ? 's' : ''} selected</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setViewMode('contacts'); setCheckedDomains(new Set()); }} className="px-3 py-1.5 bg-gray-900 text-white text-[11px] font-semibold rounded-lg hover:bg-gray-800 flex items-center gap-1.5"><Users size={12} /> View Contacts to Enroll</button>
                  <div className="relative">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleMoveToAudience([...checkedDomains], e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="text-[10px] font-semibold bg-white border border-stone-200/60 rounded-lg px-2 py-1 text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-900"
                      defaultValue=""
                    >
                      <option value="" disabled>Move to...</option>
                      {audienceSources.map(s => (
                        <option key={s} value={s}>
                          {s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </option>
                      ))}
                      <option value="inbound">Inbound</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setCheckedDomains(new Set())}
                    className="text-[10px] font-semibold text-stone-400 hover:text-stone-600"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <table className="w-full text-[11px]">
          <thead className="sticky top-0 z-10 bg-stone-50 border-b border-stone-200/60">
            <tr>
              {isAdmin && (
                <th className="w-8 px-2 py-2">
                  <button
                    onClick={() => {
                      if (checkedDomains.size === filteredAccounts.length) setCheckedDomains(new Set());
                      else setCheckedDomains(new Set(filteredAccounts.map(a => a.companyDomain)));
                    }}
                    className="text-stone-400 hover:text-stone-600"
                  >
                    {checkedDomains.size === filteredAccounts.length && filteredAccounts.length > 0
                      ? <CheckSquare size={12} />
                      : <Square size={12} />}
                  </button>
                </th>
              )}
              <th className="text-left px-4 py-2 font-semibold text-stone-500 cursor-pointer select-none" onClick={() => handleSort('company')}>
                <span className="flex items-center gap-1">Company <SortIcon col="company" /></span>
              </th>
              <th className="text-left px-3 py-2 font-semibold text-stone-500">Location</th>
              <th className="text-right px-3 py-2 font-semibold text-stone-500 cursor-pointer select-none" onClick={() => handleSort('employees')}>
                <span className="flex items-center justify-end gap-1">Employees <SortIcon col="employees" /></span>
              </th>
              <th className="text-left px-3 py-2 font-semibold text-stone-500">ATS</th>
              <th className="text-left px-3 py-2 font-semibold text-stone-500">SFDC ID</th>
              {isAllMode && <th className="text-left px-3 py-2 font-semibold text-stone-500">Audience</th>}
              <th className="text-center px-3 py-2 font-semibold text-stone-500 cursor-pointer select-none" onClick={() => handleSort('contacts')}>
                <span className="flex items-center justify-center gap-1">Contacts <SortIcon col="contacts" /></span>
              </th>
              <th className="text-center px-3 py-2 font-semibold text-stone-500">Owner</th>
              <th className="text-center px-3 py-2 font-semibold text-stone-500 cursor-pointer select-none" onClick={() => handleSort('status')}>
                <span className="flex items-center justify-center gap-1">Status <SortIcon col="status" /></span>
              </th>
              <th className="text-center px-3 py-2 font-semibold text-stone-500 cursor-pointer select-none" onClick={() => handleSort('score')}>
                <span className="flex items-center justify-center gap-1">Score <SortIcon col="score" /></span>
              </th>
              <th className="text-center px-3 py-2 font-semibold text-stone-500 cursor-pointer select-none" onClick={() => handleSort('signals')}>
                <span className="flex items-center justify-center gap-1">Signals <SortIcon col="signals" /></span>
              </th>
              <th className="text-left px-3 py-2 font-semibold text-stone-500">Contact</th>
              <th className="text-right px-3 py-2 font-semibold text-stone-500 cursor-pointer select-none" onClick={() => handleSort('lastActivity')}>
                <span className="flex items-center justify-end gap-1">Last Activity <SortIcon col="lastActivity" /></span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 11 : 10} className="text-center py-12 text-stone-400">
                  {searchQuery ? 'No accounts match your search' : 'No accounts in this audience yet'}
                </td>
              </tr>
            ) : (
              filteredAccounts.map(acct => {
                const isDupe = duplicateDomains.has(acct.companyDomain);
                const isMoving = movingDomains.has(acct.companyDomain);
                return (
                <tr
                  key={acct.id}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('.no-drawer')) return;
                    if (acct.enriched) setSelectedDomain(acct.companyDomain);
                  }}
                  className={`border-b border-stone-100/40 transition-all ${
                    acct.enriched ? 'cursor-pointer hover:bg-stone-50/60' : 'opacity-60'
                  } ${selectedDomain === acct.companyDomain ? 'bg-stone-50/80' : ''}
                  ${isMoving ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  {isAdmin && (
                    <td className="w-8 px-2 py-3 no-drawer">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = new Set(checkedDomains);
                          if (next.has(acct.companyDomain)) next.delete(acct.companyDomain);
                          else next.add(acct.companyDomain);
                          setCheckedDomains(next);
                        }}
                        className="text-stone-400 hover:text-stone-600"
                      >
                        {checkedDomains.has(acct.companyDomain)
                          ? <CheckSquare size={12} className="text-stone-700" />
                          : <Square size={12} />}
                      </button>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {acct.enriched && <TierDot tier={acct.enriched.tier} />}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-stone-800">{acct.companyName}</span>
                          {isDupe && (
                            <span title={`In multiple audiences: ${duplicateDomains.get(acct.companyDomain)!.join(', ')}`}
                              className="inline-flex items-center gap-0.5 px-1 py-0 rounded text-[8px] font-bold bg-amber-100 text-amber-700">
                              <Copy size={7} /> Dupe
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] text-stone-400">{acct.companyDomain}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-stone-500">{acct.companyLocation || '—'}</td>
                  <td className="px-3 py-3 text-right text-stone-500">{acct.employeeCount ? acct.employeeCount.toLocaleString() : '—'}</td>
                  <td className="px-3 py-3 text-stone-500">{acct.currentAts || '—'}</td>
                  <td className="px-3 py-3 text-stone-500 font-mono text-[9px]">{acct.enriched?.sfAccountId || '—'}</td>
                  {isAllMode && (
                    <td className="px-3 py-3 no-drawer">
                      {isAdmin ? (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAudience(editingAudience === acct.companyDomain ? null : acct.companyDomain);
                            }}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700 transition-colors cursor-pointer"
                          >
                            {acct.audienceSource || '—'}
                            <ArrowRightLeft size={7} />
                          </button>
                          {editingAudience === acct.companyDomain && (
                            <>
                              <div className="fixed inset-0 z-20" onClick={() => setEditingAudience(null)} />
                              <div className="absolute left-0 top-full mt-1 z-30 w-36 bg-white rounded-lg shadow-lg border border-stone-200 p-1">
                                {audienceSources.filter(s => s !== acct.audienceSource).map(s => (
                                  <button
                                    key={s}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveToAudience([acct.companyDomain], s);
                                    }}
                                    className="w-full text-left px-2 py-1.5 rounded text-[10px] font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                                  >
                                    {s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                  </button>
                                ))}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveToAudience([acct.companyDomain], 'inbound');
                                  }}
                                  className="w-full text-left px-2 py-1.5 rounded text-[10px] font-medium text-stone-400 hover:bg-stone-50 transition-colors"
                                >
                                  Inbound (untagged)
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-stone-100 text-stone-500">
                          {acct.audienceSource || '—'}
                        </span>
                      )}
                    </td>
                  )}
                  <td className="px-3 py-3 text-center">
                    {acct.contactCount > 0 ? (
                      <span className="flex items-center justify-center gap-1 text-stone-600">
                        <Users size={10} className="text-stone-400" />
                        {acct.contactCount}
                      </span>
                    ) : <span className="text-stone-300">—</span>}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {(() => {
                      const repId = acct.enriched?.assignedRepId;
                      const initials = repId ? REP_ID_TO_INITIALS[repId] : null;
                      const repProfile = repId ? REP_PROFILES.find(r => r.id === repId) : null;
                      if (!initials) return <span className="text-stone-300 text-[10px]">—</span>;
                      return (
                        <div className="relative group">
                          <span
                            title={repProfile?.full_name || repId}
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[9px] font-bold cursor-default"
                            style={{ backgroundColor: repProfile?.avatar_color || '#78716c' }}
                          >{initials}</span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                        acct.status === 'enriched' ? 'bg-emerald-100 text-emerald-700' :
                        acct.status === 'sent_to_clay' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {acct.status === 'enriched' ? 'Enriched' : acct.status === 'sent_to_clay' ? 'In Clay' : 'Pending'}
                      </span>
                      {acct.enriched && (
                        <span title={`SFDC: ${acct.enriched.sfSyncStatus || 'pending'}${acct.enriched.sfAccountId ? ' • ' + acct.enriched.sfAccountId : ''}`}
                          className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[8px] ${
                            acct.enriched.sfSyncStatus === 'synced' ? 'bg-blue-100 text-blue-600' :
                            acct.enriched.sfSyncStatus === 'created' ? 'bg-blue-100 text-blue-600' :
                            acct.enriched.sfSyncStatus === 'not_in_sfdc' ? 'bg-amber-100 text-amber-600' :
                            acct.enriched.sfSyncStatus === 'error' ? 'bg-red-100 text-red-600' :
                            'bg-stone-100 text-stone-400'
                          }`}>
                          ☁
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {acct.enriched ? <ScoreBadge score={acct.enriched.score} fitScore={acct.enriched.fitScore} intentScore={acct.enriched.intentScore} /> : <span className="text-stone-300">—</span>}
                  </td>
                  <td className="px-3 py-3 text-center text-stone-500">
                    {acct.enriched ? (
                      <span className="flex items-center justify-center gap-1">
                        <Zap size={10} className="text-amber-500" />
                        {acct.enriched.signals.length}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-3 py-3 text-stone-500">
                    {acct.enriched && acct.enriched.contacts[0] ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[7px] font-bold" style={{ backgroundColor: acct.enriched.contacts[0].avatarColor }}>
                          {acct.enriched.contacts[0].name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-[10px] font-medium text-stone-700 truncate max-w-[120px]">{acct.enriched.contacts[0].name}</div>
                          <div className="text-[8px] text-stone-400 truncate max-w-[120px]">{acct.enriched.contacts[0].title}</div>
                        </div>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-3 py-3 text-right text-[10px] text-stone-400">
                    {acct.enriched ? timeAgo(acct.enriched.lastActivity) : '—'}
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
        </>
        ) : (
          /* ═══ CONTACTS VIEW ═══ */
          <ContactList
            contacts={allContacts}
            checkedIds={checkedContactIds}
            toggleAll={() => {
              if (checkedContactIds.size === allContacts.length) setCheckedContactIds(new Set());
              else setCheckedContactIds(new Set(allContacts.map(c => c.email)));
            }}
            toggleCheck={(id) => {
              const next = new Set(checkedContactIds);
              if (next.has(id)) next.delete(id); else next.add(id);
              setCheckedContactIds(next);
            }}
            visibleColumns={new Set(['organization', 'signals', 'score', 'webActivity'])}
            setSelectedContactEmail={(email) => { setSelectedContactEmail(email); setSelectedDomain(null); }}
            onAddToCadence={() => {}}
            isPushedFn={() => false}
            pushingContactId={null}
            isRyanMode={false}
            hoverScoreId={hoverScoreId}
            setHoverScoreId={setHoverScoreId}
            hoverScoreEl={hoverScoreEl}
            setHoverScoreEl={setHoverScoreEl}
          />
        )}
      </div>

      {/* Account Drawer */}
      <AnimatePresence>
        {selectedAccount && (
          <AccountDrawer
            account={selectedAccount}
            onClose={() => setSelectedDomain(null)}
            onAddToCadence={() => {}}
            onAddNote={() => {}}
            isRyanMode={false}
          />
        )}
      </AnimatePresence>

      <AdvancedSegmentModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        isSavingSegment={false}
        setIsSavingSegment={() => {}}
        segmentNameDraft=""
        setSegmentNameDraft={() => {}}
        handleSaveAsSegment={() => {}}
        handleApplyFilters={handleApplyFilters}
        draftQuery={filterConditions}
        handleUpdateCondition={handleUpdateCondition}
        handleRemoveCondition={handleRemoveCondition}
        handleAddCondition={handleAddCondition}
      />
    </div>
  );
}
