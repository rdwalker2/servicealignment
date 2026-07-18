import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ClayRow, AccountView, ContactView } from '../data/signalBoardData';
import { groupByAccount, groupByContact, mergeBookAccounts } from '../data/signalBoardData';
import type { DbAccount, DbContact } from '../lib/signalBoardDb';
import { useDebounce } from './useDebounce';

export interface FilterCondition {
  id: string;
  field: string;
  operator: 'contains' | 'not_contains' | 'equals' | 'not_equals' | 'gt' | 'lt';
  value: string;
  logic?: 'and' | 'or'; // How this condition joins with the PREVIOUS one. Default 'and'.
}

export interface Segment {
  id: string;
  name: string;
  icon: string;
  conditions: FilterCondition[];
}

export const DEFAULT_SEGMENTS: Segment[] = [
  { id: 'all', name: 'All Signals', icon: 'LayoutGrid', conditions: [] },
  { 
    id: 'high_intent_enterprise', 
    name: 'High Intent Enterprise', 
    icon: 'Target', 
    conditions: [
      { id: '1', field: 'employee_count', operator: 'gt', value: '10000' },
      { id: '2', field: 'page_visited', operator: 'contains', value: '/pricing' }
    ] 
  },
  {
    id: 'legacy_ats_vuln',
    name: 'Legacy Provider Vulnerability',
    icon: 'AlertCircle',
    conditions: [
      { id: '1', field: 'current_ats', operator: 'contains', value: 'Frontline' },
      { id: '2', field: 'open_roles', operator: 'gt', value: '20' }
    ]
  },
  {
    id: 'stale_alerts',
    name: 'Stale Accounts (3+ Days)',
    icon: 'Clock',
    conditions: [
      { id: '1', field: 'stale_account', operator: 'equals', value: 'true' }
    ]
  },
  {
    id: 'priority_call_list',
    name: "Today's Priority Call List",
    icon: 'Phone',
    conditions: [
      { id: '1', field: 'is_priority', operator: 'equals', value: 'true' }
    ]
  }
];

// Evaluate a single filter condition against a row
function evaluateSingleCondition(cond: FilterCondition, r: ClayRow, dispositions?: Map<string, any>): boolean {
  if (cond.field === 'stale_account') {
    const isStale = (Date.now() - new Date(r.detected_at).getTime()) > 3 * 24 * 60 * 60 * 1000;
    const wantsStale = cond.value === 'true';
    return isStale === wantsStale;
  }
  if (cond.field === 'is_priority') {
    const ageMs = Date.now() - new Date(r.detected_at).getTime();
    const isFresh = ageMs <= 48 * 60 * 60 * 1000;
    const hasHighIntent = r.signal_score >= 10 || r.icp_tier === 'hot';
    const disp = dispositions?.get(r.company_domain)?.status;
    const isActionable = disp !== 'disqualified' && disp !== 'working' && disp !== 'meeting_set' && disp !== 'nurture';
    const isPriority = isFresh && hasHighIntent && isActionable;
    return isPriority === (cond.value === 'true');
  }

  const val = r[cond.field as keyof ClayRow];
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
}

// Group conditions into OR-groups: conditions connected by AND form a group,
// OR creates a new group. A row passes if ANY group's conditions ALL pass.
function evaluateConditions(conditions: FilterCondition[], r: ClayRow, dispositions?: Map<string, any>): boolean {
  if (!conditions || !Array.isArray(conditions) || conditions.length === 0) return true;

  // Split into groups by OR boundaries
  const groups: FilterCondition[][] = [[]];
  for (const cond of conditions) {
    if (cond.logic === 'or' && groups[groups.length - 1].length > 0) {
      groups.push([]);
    }
    groups[groups.length - 1].push(cond);
  }

  // A row passes if ANY group matches (all conditions in that group are true)
  return groups.some(group => group.every(c => evaluateSingleCondition(c, r, dispositions)));
}

export function useSignalFilters(
  clayRows: ClayRow[], 
  effectiveUser: any, 
  isAdmin: boolean, 
  isImpersonating: boolean, 
  dispositions: Map<string, any>, 
  pushState: Map<string, boolean>, 
  notesState: Map<string, any[]>,
  sortDir: 'desc' | 'asc',
  crmAccounts: DbAccount[] = [],
  crmContacts: DbContact[] = []
) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [filterTimeframe, setFilterTimeframe] = useState<'all' | '24h' | '7d' | '30d'>('all');
  const [filterTier, setFilterTier] = useState<'' | 'hot' | 'warm' | 'watch'>('');
  const [filterRep, setFilterRep] = useState<string>('');
  const [filterMarket, setFilterMarket] = useState<string>('');
  const [filterFirmographicTier, setFilterFirmographicTier] = useState<string>('');
  const [filterAudience, setFilterAudience] = useState<string>('');
  const [filterSignalSource, setFilterSignalSource] = useState<string>('');

  const [segments, setSegments] = useState<Segment[]>(DEFAULT_SEGMENTS);
  const [activeSegmentId, setActiveSegmentId] = useState<string>('all');
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [draftQuery, setDraftQuery] = useState<FilterCondition[]>([]);
  const [isSavingSegment, setIsSavingSegment] = useState(false);
  const [segmentNameDraft, setSegmentNameDraft] = useState('');

  // On mount, load persisted segments from Supabase
  useEffect(() => {
    const loadSegments = async () => {
      const { data } = await supabase.from('saved_segments').select('*');
      if (data && data.length > 0) {
        const persisted: Segment[] = data.map(d => {
          let conds = d.conditions;
          if (typeof conds === 'string') {
            try { conds = JSON.parse(conds); } catch (e) { conds = []; }
          }
          if (!Array.isArray(conds)) conds = [];
          
          return {
            id: d.segment_id,
            name: d.name,
            icon: d.icon,
            conditions: conds,
          };
        });
        // Merge: defaults first, then persisted (skip duplicates)
        const defaultIds = new Set(DEFAULT_SEGMENTS.map(s => s.id));
        const merged = [...DEFAULT_SEGMENTS, ...persisted.filter(s => !defaultIds.has(s.id))];
        setSegments(merged);
      }
    };
    loadSegments();
  }, []);

  // Save segment to Supabase
  const saveSegment = async (segment: Segment) => {
    await supabase.from('saved_segments').upsert({
      segment_id: segment.id,
      name: segment.name,
      icon: segment.icon,
      conditions: segment.conditions,
    }, { onConflict: 'segment_id' });
    setSegments(prev => {
      const exists = prev.find(s => s.id === segment.id);
      if (exists) return prev.map(s => s.id === segment.id ? segment : s);
      return [...prev, segment];
    });
  };

  // Delete segment from Supabase
  const deleteSegment = async (segmentId: string) => {
    if (DEFAULT_SEGMENTS.some(s => s.id === segmentId)) return; // can't delete defaults
    await supabase.from('saved_segments').delete().eq('segment_id', segmentId);
    setSegments(prev => prev.filter(s => s.id !== segmentId));
    if (activeSegmentId === segmentId) setActiveSegmentId('all');
  };

  const filteredRows = useMemo(() => {
    let rows = clayRows;
    if ((!isAdmin && effectiveUser?.role !== 'exec') || isImpersonating) {
      rows = rows.filter(r => r.assigned_rep_id === effectiveUser?.id);
    }
    
    if (filterTimeframe !== 'all') {
      const now = Date.now();
      let cutoff = 0;
      if (filterTimeframe === '24h') cutoff = now - (24 * 60 * 60 * 1000);
      else if (filterTimeframe === '7d') cutoff = now - (7 * 24 * 60 * 60 * 1000);
      else if (filterTimeframe === '30d') cutoff = now - (30 * 24 * 60 * 60 * 1000);
      
      rows = rows.filter(r => new Date(r.detected_at).getTime() >= cutoff);
    }
    
    if (filterRep) {
      rows = rows.filter(r => r.assigned_rep_id === filterRep || r.sf_account_owner === filterRep);
    }
    
    const activeSegment = segments.find(s => s.id === activeSegmentId);
    if (activeSegment && activeSegment.conditions.length > 0) {
      rows = rows.filter(r => evaluateConditions(activeSegment.conditions, r, dispositions));
    }

    if (filterTier) rows = rows.filter(r => r.icp_tier === filterTier);
    if (filterMarket) rows = rows.filter(r => r.market === filterMarket);
    if (filterFirmographicTier) rows = rows.filter(r => r.firmographic_tier === filterFirmographicTier);
    if (filterAudience) rows = rows.filter(r => r.audience_source === filterAudience);
    if (filterSignalSource) rows = rows.filter(r => r.signal_source === filterSignalSource);
    if (debouncedSearchQuery) {
      const q = debouncedSearchQuery.toLowerCase();
      rows = rows.filter(r =>
        r.company_name.toLowerCase().includes(q) ||
        r.full_name.toLowerCase().includes(q) ||
        r.signal_name.toLowerCase().includes(q) ||
        r.company_location.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [clayRows, effectiveUser, isAdmin, isImpersonating, filterTimeframe, filterTier, filterMarket, filterFirmographicTier, filterAudience, filterSignalSource, debouncedSearchQuery, activeSegmentId, segments, dispositions, filterRep]);

  const accounts = useMemo(() => {
    const signaledAccts = groupByAccount(filteredRows);
    // Merge with full CRM account list (book-of-business)
    const allAccts = crmAccounts.length > 0
      ? mergeBookAccounts(signaledAccts, crmAccounts, crmContacts)
      : signaledAccts;
    // Apply owner filter to non-signaled accounts too
    let filtered = allAccts;
    if ((!isAdmin && effectiveUser?.role !== 'exec') || isImpersonating) {
      const userName = effectiveUser?.full_name || '';
      filtered = filtered.filter(a => 
        a.assignedRepId === effectiveUser?.id || 
        a.sfAccountOwner === userName
      );
    }
    if (filterRep) {
      filtered = filtered.filter(a => 
        a.assignedRepId === filterRep || 
        a.sfAccountOwner === filterRep
      );
    }
    // Apply search to non-signaled accounts
    if (debouncedSearchQuery) {
      const q = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.companyName.toLowerCase().includes(q) ||
        a.companyDomain.toLowerCase().includes(q) ||
        (a.currentAts || '').toLowerCase().includes(q) ||
        (a.sfAccountOwner || '').toLowerCase().includes(q)
      );
    }
    for (const a of filtered) {
      a.pushedToCadence = pushState.get(a.companyDomain) || false;
      a.notes = notesState.get(a.companyDomain) || [];
    }
    return sortDir === 'asc' ? [...filtered].reverse() : filtered;
  }, [filteredRows, pushState, notesState, sortDir, crmAccounts, crmContacts, isAdmin, isImpersonating, effectiveUser, filterRep, debouncedSearchQuery]);

  const contacts = useMemo(() => {
    const all = groupByContact(filteredRows);
    return sortDir === 'asc' ? [...all].reverse() : all;
  }, [filteredRows, sortDir]);

  return {
    searchQuery, setSearchQuery,
    filterTimeframe, setFilterTimeframe,
    filterTier, setFilterTier,
    filterRep, setFilterRep,
    filterMarket, setFilterMarket,
    filterFirmographicTier, setFilterFirmographicTier,
    filterAudience, setFilterAudience,
    filterSignalSource, setFilterSignalSource,
    segments, setSegments,
    activeSegmentId, setActiveSegmentId,
    isAdvancedModalOpen, setIsAdvancedModalOpen,
    draftQuery, setDraftQuery,
    isSavingSegment, setIsSavingSegment,
    segmentNameDraft, setSegmentNameDraft,
    saveSegment,
    deleteSegment,
    filteredRows,
    accounts,
    contacts,
    t1: accounts.filter(a => a.tier === 'hot').length,
    t2: accounts.filter(a => a.tier === 'warm').length,
    t3: accounts.filter(a => a.tier === 'watch').length,
    wi: contacts.filter(c => c.lastPageVisited).length,
    segmentCounts: segments.reduce((acc, seg) => {
      if (seg.conditions.length === 0) acc[seg.id] = accounts.length;
      else acc[seg.id] = clayRows.filter(r => evaluateConditions(seg.conditions, r)).length;
      return acc;
    }, {} as Record<string, number>)
  };
}
