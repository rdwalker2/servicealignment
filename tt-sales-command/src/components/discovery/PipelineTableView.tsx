// ============================================================
// PipelineTableView — SFDC-style Pipeline Review Table
// Matches Brian McGarry's "Team Walker - Pipe Closing This Month" report
// 12 columns, grouped by Forecast Category → Stage, MEDDPICC expansion
// ============================================================

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Calendar,
  DollarSign,
  ChevronsUpDown,
  ChevronUp,
  ClipboardList,
} from 'lucide-react';
import type { DiscoverySession } from '../../lib/discoveryDatabase';
import { importFromSFDCExport } from '../../lib/discoveryDatabase';
import { REP_PROFILES } from '../../contexts/AuthContext';
import { fmtCurrency } from '../../lib/format';
import { STAGES } from './pipelineUtils';

// ── Props ──

export interface PipelineTableViewProps {
  sessions: DiscoverySession[];
  isAdmin: boolean; // true = can edit forecast_category (manager-only field)
  onSelect: (session: DiscoverySession) => void;
  onSessionUpdate: (session: DiscoverySession) => void;
}

// ── Constants ──

/** Forecast category display order and styling — Commit first (strongest conviction) */
const FORECAST_CATEGORIES = [
  { value: 'commit', label: 'Commit', color: '#10b981', bgClass: 'bg-emerald-100 text-emerald-700', badgeBg: 'bg-emerald-100' },
  { value: 'best_case', label: 'Best Case', color: '#0ea5e9', bgClass: 'bg-sky-100 text-sky-700', badgeBg: 'bg-sky-100' },
  { value: 'pipeline', label: 'Pipeline', color: '#64748b', bgClass: 'bg-stone-100 text-stone-600', badgeBg: 'bg-stone-200' },
  { value: 'upside', label: 'Upside', color: '#a855f7', bgClass: 'bg-violet-100 text-violet-700', badgeBg: 'bg-violet-100' },
  { value: 'omitted', label: 'Omitted', color: '#d1d5db', bgClass: 'bg-gray-100 text-gray-400', badgeBg: 'bg-gray-200' },
] as const;

/** SFDC Stage options */
const STAGE_OPTIONS = [
  { value: 'qualifying', label: 'Qualifying', color: '#64748b' },
  { value: 'investigating', label: 'Investigating', color: '#0ea5e9' },
  { value: 'evaluating', label: 'Evaluating', color: '#8b5cf6' },
  { value: 'negotiating', label: 'Negotiating', color: '#f59e0b' },
  { value: 'contracting', label: 'Contracting', color: '#f97316' },
  { value: 'signing', label: 'Signing', color: '#10b981' },
  { value: 'closed_won', label: 'Closed Won', color: '#059669' },
] as const;

/** Commission source options */
const SOURCE_OPTIONS = ['Inbound', 'Outbound'] as const;

/** Column definitions for sort + display — matches Brian's SFDC report exactly */
const COLUMNS = [
  { key: 'forecast_category', label: 'Forecast Category', width: 'w-[130px]' },
  { key: 'deal_stage', label: 'Stage', width: 'w-[110px]' },
  { key: 'rep_id', label: 'Owner', width: 'w-[120px]' },
  { key: 'company_name', label: 'Account Name', width: 'w-[150px]' },
  { key: 'opportunity_name', label: 'Opportunity Name', width: 'w-[160px]' },
  { key: 'lead_source', label: 'Source', width: 'w-[80px]' },
  { key: 'deal_value', label: 'Amount', width: 'w-[90px]' },
  { key: 'age', label: 'Age', width: 'w-[50px]' },
  { key: 'next_action', label: 'Next Steps', width: 'w-[220px]' },
  { key: 'most_recent_update', label: 'Most Recent Update', width: 'w-[200px]' },
  { key: 'close_date', label: 'Close Date', width: 'w-[100px]' },
  // MEDDPICC fields — Brian's exact column order from SFDC report
  { key: 'competitive_situation', label: 'Competition', width: 'w-[160px]' },
  { key: 'success_metrics_text', label: 'Metrics', width: 'w-[160px]' },
  { key: 'pain_narrative', label: 'Identify Pain', width: 'w-[160px]' },
  { key: 'champion_name', label: 'Champion', width: 'w-[140px]' },
  { key: 'decision_criteria', label: 'Decision Criteria', width: 'w-[160px]' },
  { key: 'economic_buyer_access', label: 'Economic Buyer', width: 'w-[140px]' },
  { key: 'decision_process', label: 'Decision Process', width: 'w-[160px]' },
  { key: 'paper_process', label: 'Paper Process', width: 'w-[160px]' },
  { key: 'compelling_event', label: 'Compelling Event', width: 'w-[160px]' },
] as const;

// ── MEDDPICC Field Definitions ──

interface MEDDPICCField {
  letter: string;
  label: string;
  /** DiscoverySession field key(s) to read/write */
  fieldKey: keyof DiscoverySession;
  /** Optional secondary field for display (e.g. champion_validation_notes) */
  secondaryKey?: keyof DiscoverySession;
}

const MEDDPICC_FIELDS: MEDDPICCField[] = [
  { letter: 'M', label: 'Metrics', fieldKey: 'success_metrics_text' },
  { letter: 'E', label: 'Economic Buyer', fieldKey: 'economic_buyer_access' },
  { letter: 'D', label: 'Decision Criteria', fieldKey: 'decision_criteria' },
  { letter: 'D', label: 'Decision Process', fieldKey: 'decision_process' },
  { letter: 'P', label: 'Paper Process', fieldKey: 'paper_process' },
  { letter: 'I', label: 'Identify Pain', fieldKey: 'pain_narrative' },
  { letter: 'C', label: 'Champion', fieldKey: 'champion_name', secondaryKey: 'champion_validation_notes' },
  { letter: 'C', label: 'Competition', fieldKey: 'competitive_situation' },
  { letter: 'CE', label: 'Compelling Event', fieldKey: 'compelling_event' },
];

/**
 * MEDDPICC gate requirements per stage.
 * Fields listed here MUST be filled before the deal should progress past the stage.
 * Fields not listed are optional (gray badge if empty).
 */
const MEDDPICC_GATES: Record<string, string[]> = {
  qualifying: ['success_metrics_text', 'pain_narrative', 'champion_name'],      // M, I, C
  investigating: ['economic_buyer_access', 'decision_criteria', 'competitive_situation', 'compelling_event'],  // E, D, C, CE
  evaluating: ['decision_process', 'paper_process'],                            // D, P
  // negotiating+ requires ALL fields filled
};

/** Returns 'green' | 'red' | 'gray' for a MEDDPICC field badge based on fill status and stage gate */
function getMeddpiccBadgeStatus(
  session: DiscoverySession,
  field: MEDDPICCField
): 'green' | 'red' | 'gray' {
  const value = getMeddpiccValue(session, field);
  const isFilled = value.trim().length > 0;
  if (isFilled) return 'green';

  const stage = session.deal_stage ?? 'qualifying';
  const stageOrder = ['qualifying', 'investigating', 'evaluating', 'negotiating', 'contracting', 'signing', 'closed_won'];
  const currentIdx = stageOrder.indexOf(stage);

  // For negotiating+, all fields are required
  if (currentIdx >= 3) return 'red';

  // Check if this field is required at or before the current stage
  for (let i = 0; i <= currentIdx; i++) {
    const gateFields = MEDDPICC_GATES[stageOrder[i]];
    if (gateFields && gateFields.includes(field.fieldKey as string)) {
      return 'red';
    }
  }

  return 'gray';
}

// ── Helpers ──

/** Format a date string as "Jul 15, 2026" */
function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Compute days since created_at */
function computeAge(createdAt: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)));
}

/** Generate default opportunity name: "Company - IB/OB - created_date" */
function defaultOpportunityName(session: DiscoverySession): string {
  const source = session.lead_source
    ? /inbound/i.test(session.lead_source) ? 'IB' : /outbound/i.test(session.lead_source) ? 'OB' : 'IB'
    : 'IB';
  const dateStr = new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  return `${session.company_name} - ${source} - ${dateStr}`;
}

/** Get the MEDDPICC field value as string */
function getMeddpiccValue(session: DiscoverySession, field: MEDDPICCField): string {
  const primary = (session[field.fieldKey] as string) || '';
  if (field.secondaryKey) {
    const secondary = (session[field.secondaryKey] as string) || '';
    return [primary, secondary].filter(Boolean).join('\n');
  }
  return primary;
}

/** Determine source indicator for a MEDDPICC field */
function getSourceIndicator(session: DiscoverySession, field: MEDDPICCField): { label: string; icon: string } {
  const val = getMeddpiccValue(session, field);
  if (!val.trim()) return { label: 'Empty', icon: '⚪' };
  // Check if this field was likely populated from a Granola sync
  // Heuristic: if granola_notes exist and the field has content, it's likely from Granola
  if (session.granola_notes && session.granola_notes.length > 0 && val.trim()) {
    return { label: 'Granola', icon: '🟢' };
  }
  return { label: 'Manual', icon: '✏️' };
}

// ── Component ──

export function PipelineTableView({
  sessions,
  isAdmin,
  onSelect,
  onSessionUpdate,
}: PipelineTableViewProps) {
  // ── One-time SFDC import (seeds Opp IDs + MEDDPICC from export) ──
  useEffect(() => {
    const importKey = 'sfdc_import_v7_done';
    if (localStorage.getItem(importKey)) return;
    // Fetch the import data from the bundled JSON
    fetch('/sfdc_pipeline_import.json')
      .then(r => r.ok ? r.json() : Promise.reject('no file'))
      .then(deals => {
        if (Array.isArray(deals) && deals.length > 0) {
          const result = importFromSFDCExport(deals);
          console.log('[PipelineTableView] SFDC auto-import:', result);
          localStorage.setItem(importKey, new Date().toISOString());
          // Reload to show imported data
          window.location.reload();
        }
      })
      .catch(() => { /* no import file available */ });
  }, []);

  // ── Table state ──
  const [sortCol, setSortCol] = useState<string>('deal_value');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editingText, setEditingText] = useState('');
  const [copiedCell, setCopiedCell] = useState<string | null>(null); // "sessionId:field" for copy feedback
  const [editingMeddpicc, setEditingMeddpicc] = useState<{ id: string; fieldKey: string } | null>(null);
  const [meddpiccText, setMeddpiccText] = useState('');

  // ── Sort Toggle ──
  const toggleSort = useCallback((col: string) => {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  }, [sortCol]);

  // ── Sort Icon ──
  const SortIcon = useCallback(({ col }: { col: string }) => {
    if (sortCol !== col) return <ChevronsUpDown size={10} className="text-stone-300 ml-0.5" />;
    return sortDir === 'asc'
      ? <ChevronUp size={10} className="text-stone-600 ml-0.5" />
      : <ChevronDown size={10} className="text-stone-600 ml-0.5" />;
  }, [sortCol, sortDir]);

  // ── Row Expand/Collapse ──
  const toggleExpand = useCallback((sessionId: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(sessionId)) next.delete(sessionId);
      else next.add(sessionId);
      return next;
    });
  }, []);

  // ── Copy to Clipboard ──
  const handleCopy = useCallback(async (text: string, cellKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCell(cellKey);
      setTimeout(() => setCopiedCell(null), 1500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedCell(cellKey);
      setTimeout(() => setCopiedCell(null), 1500);
    }
  }, []);

  // ── Save inline edit ──
  const saveEdit = useCallback((sessionId: string, field: string, value: any) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    const updated = { ...session, [field]: value };
    onSessionUpdate(updated);
    setEditingCell(null);
  }, [sessions, onSessionUpdate]);

  // ── Save MEDDPICC edit ──
  const saveMeddpiccEdit = useCallback((sessionId: string, fieldKey: string, value: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    const updated = { ...session, [fieldKey]: value };
    onSessionUpdate(updated);
    setEditingMeddpicc(null);
  }, [sessions, onSessionUpdate]);

  // ── Grouped & Sorted Data ──
  const sortedSessions = useMemo(() => {
    // Sort sessions within each group
    const sorted = [...sessions].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const STAGE_ORDER: Record<string, number> = {
        qualifying: 0, investigating: 1, evaluating: 2,
        negotiating: 3, contracting: 4, signing: 5, closed_won: 6,
      };

      switch (sortCol) {
        case 'forecast_category': {
          const catOrder: Record<string, number> = { commit: 0, best_case: 1, pipeline: 2, upside: 3, omitted: 4 };
          return dir * ((catOrder[a.forecast_category ?? 'pipeline'] ?? 2) - (catOrder[b.forecast_category ?? 'pipeline'] ?? 2));
        }
        case 'deal_stage':
          return dir * ((STAGE_ORDER[a.deal_stage ?? 'qualifying'] ?? 0) - (STAGE_ORDER[b.deal_stage ?? 'qualifying'] ?? 0));
        case 'rep_id': {
          const ra = REP_PROFILES.find(r => r.id === a.rep_id)?.full_name || '';
          const rb = REP_PROFILES.find(r => r.id === b.rep_id)?.full_name || '';
          return dir * ra.localeCompare(rb);
        }
        case 'company_name':
          return dir * (a.company_name || '').localeCompare(b.company_name || '');
        case 'opportunity_name': {
          const na = a.opportunity_name || defaultOpportunityName(a);
          const nb = b.opportunity_name || defaultOpportunityName(b);
          return dir * na.localeCompare(nb);
        }
        case 'lead_source':
          return dir * (a.lead_source || '').localeCompare(b.lead_source || '');
        case 'deal_value':
          return dir * ((a.deal_value || 0) - (b.deal_value || 0));
        case 'age':
          return dir * (computeAge(a.created_at) - computeAge(b.created_at));
        case 'next_action':
          return dir * (a.next_action || '').localeCompare(b.next_action || '');
        case 'most_recent_update':
          return dir * (a.most_recent_update || '').localeCompare(b.most_recent_update || '');
        case 'close_date': {
          const da = a.implementation_timeline ? new Date(a.implementation_timeline).getTime() : 0;
          const db = b.implementation_timeline ? new Date(b.implementation_timeline).getTime() : 0;
          return dir * (da - db);
        }
        default: {
          // MEDDPICC and other string fields — generic sort
          const aVal = String((a as any)[sortCol] || '');
          const bVal = String((b as any)[sortCol] || '');
          return dir * aVal.localeCompare(bVal);
        }
      }
    });

    return sorted;
  }, [sessions, sortCol, sortDir]);

  // ── Grand total ──
  const grandTotal = useMemo(() => ({
    amount: sessions.reduce((sum, s) => sum + (s.deal_value || 0), 0),
    count: sessions.length,
  }), [sessions]);

  // ── Shared styles ──
  const selectCls = 'rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-[11px] font-medium text-stone-700 focus:outline-none focus:border-stone-400 cursor-pointer appearance-none';
  const inputCls = 'rounded border border-stone-200 bg-stone-50 px-2 py-0.5 text-[12px] font-medium text-stone-700 focus:outline-none focus:border-stone-400';

  // ── Check if a specific cell is being edited ──
  const isEditing = useCallback((sessionId: string, field: string) =>
    editingCell?.id === sessionId && editingCell?.field === field
  , [editingCell]);

  // ── Format a single deal for SFDC paste ──
  const formatDealForSFDC = useCallback((s: DiscoverySession) => {
    const rep = REP_PROFILES.find(r => r.id === s.rep_id);
    const who = s.next_steps_who || '';
    const what = s.next_steps_what || '';
    const when = s.next_steps_when || '';
    const hasStructured = who || what || when;
    const ns = hasStructured
      ? [who && `Who: ${who}`, what && `What: ${what}`, when && `When: ${when}`].filter(Boolean).join('\n')
      : s.next_action || '';
    const mru = s.most_recent_update || '';
    return { rep: rep?.full_name ?? '', company: s.company_name, ns, mru };
  }, []);

  // ── Copy entire table for SFDC ──
  const [copiedAll, setCopiedAll] = useState(false);
  const handleCopyAll = useCallback(async () => {
    const lines = sessions.map(s => {
      const { company, ns, mru } = formatDealForSFDC(s);
      const rep = REP_PROFILES.find(r => r.id === s.rep_id)?.full_name ?? '';
      return `=== ${company} (${rep}) ===\nNext Steps:\n${ns || '(empty)'}\n\nMost Recent Update:\n${mru || '(empty)'}\n`;
    });
    const text = lines.join('\n');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    }
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }, [sessions, formatDealForSFDC]);

  // ── Copy single row NS + MRU ──
  const handleCopyRow = useCallback(async (s: DiscoverySession) => {
    const { ns, mru } = formatDealForSFDC(s);
    const text = `Next Steps:\n${ns || '(empty)'}\n\nMost Recent Update:\n${mru || '(empty)'}`;
    handleCopy(text, `${s.id}:row`);
  }, [formatDealForSFDC, handleCopy]);

  return (
    <div className="flex-1 overflow-auto bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── Copy All Banner ── */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-2 bg-white border-b border-stone-200/60">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-stone-400">{sessions.length} deals</span>
          <span className="text-[11px] text-stone-300">·</span>
          <span className="text-[11px] text-stone-400">{fmtCurrency(grandTotal.amount)}</span>
        </div>
        <button
          onClick={handleCopyAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors"
        >
          {copiedAll ? <Check size={13} className="text-emerald-400" /> : <ClipboardList size={13} />}
          {copiedAll ? 'Copied All!' : 'Copy All for SFDC'}
        </button>
      </div>

      <table className="w-full min-w-[3200px]">
        {/* ── Table Header ── */}
        <thead className="sticky top-0 z-10">
          <tr className="bg-white border-b border-stone-200/60">
            {/* Expand chevron column */}
            <th className="w-8 py-2.5 px-1" />
            {COLUMNS.map(col => (
              <th
                key={col.key}
                onClick={() => toggleSort(col.key)}
                className={`text-left py-2.5 px-3 text-[11px] font-medium text-stone-400 cursor-pointer hover:text-stone-600 select-none transition-colors ${col.width}`}
              >
                <span className="inline-flex items-center whitespace-nowrap">
                  {col.label}
                  <SortIcon col={col.key} />
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {groupedData.map(group => (
            <>
              {/* ═══ Forecast Category Group Header ═══ */}
              <tr key={`cat-${group.category.value}`} className="bg-stone-50/80 border-b border-stone-200/40">
                <td colSpan={22} className="py-2.5 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px]">📊</span>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${group.category.bgClass}`}
                    >
                      {group.category.label}
                    </span>
                    <span className="text-[12px] font-semibold text-stone-600">
                      {fmtCurrency(group.totalAmount)}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      · {group.dealCount} deal{group.dealCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {/* Stage breakdown */}
                  <div className="flex items-center gap-1 mt-1 ml-6 text-[10px] text-stone-400">
                    {group.stages.map((sg, i) => (
                      <span key={sg.stage.value} className="inline-flex items-center gap-0.5">
                        {i > 0 && <span className="mx-1">·</span>}
                        <span style={{ color: sg.stage.color }} className="font-medium">{sg.stage.label}</span>
                        <span>({sg.count})</span>
                        <span className="text-stone-500">{fmtCurrency(sg.amount)}</span>
                      </span>
                    ))}
                  </div>
                </td>
              </tr>

              {/* ═══ Deal Rows within each stage ═══ */}
              {group.stages.map(sg => (
                <>
                  {sg.sessions.map(s => {
                    const age = computeAge(s.created_at);
                    const rep = REP_PROFILES.find(r => r.id === s.rep_id);
                    const oppName = s.opportunity_name || defaultOpportunityName(s);
                    const isExpanded = expandedRows.has(s.id);
                    const closeDate = s.implementation_timeline ?? null;
                    const catConfig = FORECAST_CATEGORIES.find(c => c.value === (s.forecast_category ?? 'pipeline')) || FORECAST_CATEGORIES[1];
                    const stageConfig = STAGE_OPTIONS.find(st => st.value === (s.deal_stage ?? 'qualifying')) || STAGE_OPTIONS[0];

                    // Source display
                    const source = s.lead_source ?? '';
                    const isInbound = /inbound/i.test(source);
                    const isOutbound = /outbound/i.test(source);

                    return (
                      <>
                        {/* ── Deal Data Row ── */}
                        <tr
                          key={s.id}
                          className="border-b border-stone-100/40 hover:bg-stone-50/60 transition-colors group/row"
                        >
                          {/* Copy Row */}
                          <td className="py-2 px-1 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <button
                                onClick={() => handleCopyRow(s)}
                                className="p-0.5 rounded hover:bg-emerald-100 transition-colors opacity-0 group-hover/row:opacity-100"
                                title="Copy Next Steps + MRU for SFDC"
                              >
                                {copiedCell === `${s.id}:row`
                                  ? <Check size={11} className="text-emerald-500" />
                                  : <ClipboardList size={11} className="text-stone-400" />}
                              </button>
                            </div>
                          </td>

                          {/* 1. Forecast Category — dropdown, admin-only editable */}
                          <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                            {isAdmin && isEditing(s.id, 'forecast_category') ? (
                              <select
                                autoFocus
                                className={selectCls}
                                value={s.forecast_category ?? 'pipeline'}
                                onChange={e => saveEdit(s.id, 'forecast_category', e.target.value)}
                                onBlur={() => setEditingCell(null)}
                              >
                                {FORECAST_CATEGORIES.map(fc => (
                                  <option key={fc.value} value={fc.value}>{fc.label}</option>
                                ))}
                              </select>
                            ) : (
                              <button
                                onClick={() => {
                                  if (isAdmin) setEditingCell({ id: s.id, field: 'forecast_category' });
                                }}
                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ${catConfig.bgClass} ${isAdmin ? 'cursor-pointer hover:opacity-80' : 'cursor-default'} transition-opacity`}
                              >
                                {catConfig.label}
                              </button>
                            )}
                          </td>

                          {/* 2. Stage — dropdown */}
                          <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                            {isEditing(s.id, 'deal_stage') ? (
                              <select
                                autoFocus
                                className={selectCls}
                                value={s.deal_stage ?? 'qualifying'}
                                onChange={e => saveEdit(s.id, 'deal_stage', e.target.value)}
                                onBlur={() => setEditingCell(null)}
                              >
                                {STAGE_OPTIONS.map(st => (
                                  <option key={st.value} value={st.value}>{st.label}</option>
                                ))}
                              </select>
                            ) : (
                              <button
                                onClick={() => setEditingCell({ id: s.id, field: 'deal_stage' })}
                                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium text-white hover:opacity-80 transition-opacity cursor-pointer"
                                style={{ backgroundColor: stageConfig.color }}
                              >
                                {stageConfig.label}
                              </button>
                            )}
                          </td>

                          {/* 3. Owner — read-only, avatar + name */}
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1.5">
                              {rep && (
                                <div
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                                  style={{ backgroundColor: rep.avatar_color }}
                                >
                                  {rep.initials}
                                </div>
                              )}
                              <span className="text-[11px] font-medium text-stone-600 truncate">
                                {rep?.full_name ?? '—'}
                              </span>
                            </div>
                          </td>

                          {/* 4. Account Name — read-only, click opens deal */}
                          <td className="py-2 px-3">
                            <button
                              onClick={() => onSelect(s)}
                              className="text-[12px] font-semibold text-stone-800 hover:text-blue-600 truncate max-w-[150px] inline-block transition-colors cursor-pointer text-left"
                              title={s.company_name}
                            >
                              {s.company_name}
                            </button>
                          </td>

                          {/* 5. Opportunity Name — editable text */}
                          <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                            {isEditing(s.id, 'opportunity_name') ? (
                              <input
                                type="text"
                                autoFocus
                                value={editingText}
                                onChange={e => setEditingText(e.target.value)}
                                onBlur={() => saveEdit(s.id, 'opportunity_name', editingText.trim() || undefined)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                className={inputCls + ' w-[170px]'}
                              />
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingCell({ id: s.id, field: 'opportunity_name' });
                                  setEditingText(oppName);
                                }}
                                className="text-[11px] text-stone-500 truncate max-w-[170px] inline-block hover:text-stone-700 transition-colors cursor-pointer text-left"
                                title={oppName}
                              >
                                {oppName.length > 35 ? oppName.slice(0, 35) + '…' : oppName}
                              </button>
                            )}
                          </td>

                          {/* 6. Sales Commission Source — dropdown */}
                          <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                            {isEditing(s.id, 'lead_source') ? (
                              <select
                                autoFocus
                                className={selectCls}
                                value={isInbound ? 'Inbound' : isOutbound ? 'Outbound' : ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  saveEdit(s.id, 'lead_source', val ? val.toLowerCase() : null);
                                }}
                                onBlur={() => setEditingCell(null)}
                              >
                                <option value="">—</option>
                                {SOURCE_OPTIONS.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : (
                              <button
                                onClick={() => setEditingCell({ id: s.id, field: 'lead_source' })}
                                className="cursor-pointer hover:opacity-70 transition-opacity"
                              >
                                {isInbound ? (
                                  <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold bg-sky-100 text-sky-700">IB</span>
                                ) : isOutbound ? (
                                  <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold bg-violet-100 text-violet-700">OB</span>
                                ) : (
                                  <span className="text-[10px] text-stone-300">—</span>
                                )}
                              </button>
                            )}
                          </td>

                          {/* 7. Amount — editable currency */}
                          <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                            {isEditing(s.id, 'deal_value') ? (
                              <input
                                type="text"
                                autoFocus
                                value={editingText}
                                onChange={e => setEditingText(e.target.value)}
                                onBlur={() => {
                                  const num = parseInt(editingText.replace(/[^0-9]/g, ''), 10) || 0;
                                  saveEdit(s.id, 'deal_value', num);
                                }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                className={inputCls + ' w-24'}
                              />
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingCell({ id: s.id, field: 'deal_value' });
                                  setEditingText(String(s.deal_value || 0));
                                }}
                                className="text-[12px] font-medium text-stone-600 hover:text-stone-900 tabular-nums transition-colors cursor-pointer"
                              >
                                {s.deal_value > 0 ? fmtCurrency(s.deal_value) : '—'}
                              </button>
                            )}
                          </td>

                          {/* 8. Age — read-only computed, color coded */}
                          <td className="py-2 px-3">
                            <span className={`text-[12px] font-medium tabular-nums ${
                              age > 45 ? 'text-rose-500' : age > 21 ? 'text-amber-500' : 'text-stone-500'
                            }`}>
                              {age}d
                            </span>
                          </td>

                          {/* 9. Next Steps — single open text field matching Salesforce */}
                          <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                            {(() => {
                              const who = s.next_steps_who || '';
                              const what = s.next_steps_what || '';
                              const when = s.next_steps_when || '';
                              const hasStructured = who || what || when;

                              // Build the display/edit text — matches SFDC's single text field
                              const fullText = hasStructured
                                ? [who && `Who: ${who}`, what && `What: ${what}`, when && `When: ${when}`].filter(Boolean).join('\n')
                                : s.next_action || '';

                              // Check if the "When" date is overdue
                              const isOverdue = (() => {
                                if (!when) return false;
                                const parsed = new Date(when);
                                if (!isNaN(parsed.getTime())) {
                                  const today = new Date(); today.setHours(0, 0, 0, 0);
                                  return parsed < today;
                                }
                                const mdMatch = when.match(/(\d{1,2})\/(\d{1,2})/);
                                if (mdMatch) {
                                  const now = new Date();
                                  const d = new Date(now.getFullYear(), parseInt(mdMatch[1]) - 1, parseInt(mdMatch[2]));
                                  d.setHours(0, 0, 0, 0);
                                  return d < new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                }
                                return false;
                              })();

                              return (
                                <div className="flex items-start gap-1 group/cell">
                                  <div className="flex-1 min-w-0">
                                    {isEditing(s.id, 'next_steps_full') ? (
                                      <textarea
                                        autoFocus
                                        value={editingText}
                                        onChange={e => setEditingText(e.target.value)}
                                        onBlur={() => {
                                          const text = editingText.trim();
                                          // Parse who/what/when from the free-text block
                                          const whoMatch = text.match(/^Who:\s*(.+)$/im);
                                          const whatMatch = text.match(/^What:\s*(.+(?:\n(?!Who:|When:).+)*)$/im);
                                          const whenMatch = text.match(/^When:\s*(.+)$/im);
                                          const newWho = whoMatch ? whoMatch[1].trim() : '';
                                          const newWhat = whatMatch ? whatMatch[1].trim() : '';
                                          const newWhen = whenMatch ? whenMatch[1].trim() : '';
                                          const hasAny = newWho || newWhat || newWhen;
                                          const session = sessions.find(x => x.id === s.id);
                                          if (session) {
                                            onSessionUpdate({
                                              ...session,
                                              next_steps_who: newWho,
                                              next_steps_what: newWhat,
                                              next_steps_when: newWhen,
                                              next_action: hasAny ? text : text, // store full text either way
                                            });
                                          }
                                          setEditingCell(null);
                                        }}
                                        onKeyDown={e => {
                                          if (e.key === 'Escape') setEditingCell(null);
                                        }}
                                        rows={4}
                                        className={inputCls + ' w-full text-[11px] resize-y min-h-[80px]'}
                                        placeholder={"Who: Name\nWhat: Specific action\nWhen: Date"}
                                      />
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setEditingCell({ id: s.id, field: 'next_steps_full' });
                                          setEditingText(fullText);
                                        }}
                                        className="w-full text-left cursor-pointer hover:bg-stone-50 rounded px-0.5 py-0.5 transition-colors"
                                      >
                                        {fullText ? (
                                          <span className={`text-[11px] whitespace-pre-line leading-relaxed ${isOverdue ? 'text-rose-600' : 'text-stone-600'}`}>
                                            {isOverdue && <span className="mr-0.5">🔴</span>}
                                            {fullText}
                                          </span>
                                        ) : (
                                          <span className="text-[10px] text-amber-400 font-medium">⚠ No next step</span>
                                        )}
                                      </button>
                                    )}
                                  </div>

                                  {/* Copy button */}
                                  {fullText && (
                                    <button
                                      onClick={() => handleCopy(fullText, `${s.id}:next_action`)}
                                      className="opacity-0 group-hover/cell:opacity-100 transition-opacity p-0.5 rounded hover:bg-stone-100 shrink-0 mt-1"
                                      title="Copy for SFDC"
                                    >
                                      {copiedCell === `${s.id}:next_action`
                                        ? <Check size={12} className="text-emerald-500" />
                                        : <Copy size={12} className="text-stone-400" />
                                      }
                                    </button>
                                  )}
                                </div>
                              );
                            })()}
                          </td>

                          {/* 10. Most Recent Update — open text field matching Salesforce */}
                          <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                            <div className="flex items-start gap-1 group/cell">
                              <div className="flex-1 min-w-0">
                                {isEditing(s.id, 'most_recent_update') ? (
                                  <textarea
                                    autoFocus
                                    value={editingText}
                                    onChange={e => setEditingText(e.target.value)}
                                    onBlur={() => {
                                      const trimmed = editingText.trim();
                                      const updates: Partial<DiscoverySession> = {
                                        most_recent_update: trimmed,
                                        most_recent_update_source: 'manual' as const,
                                        most_recent_update_at: new Date().toISOString(),
                                      };
                                      const session = sessions.find(x => x.id === s.id);
                                      if (session) onSessionUpdate({ ...session, ...updates });
                                      setEditingCell(null);
                                    }}
                                    onKeyDown={e => {
                                      if (e.key === 'Escape') setEditingCell(null);
                                    }}
                                    rows={3}
                                    className={inputCls + ' w-full text-[11px] resize-y min-h-[60px]'}
                                    placeholder="Date — what happened on the last call/meeting…"
                                  />
                                ) : (
                                  <button
                                    onClick={() => {
                                      setEditingCell({ id: s.id, field: 'most_recent_update' });
                                      setEditingText(s.most_recent_update || '');
                                    }}
                                    className="w-full text-left cursor-pointer hover:bg-stone-50 rounded px-0.5 py-0.5 transition-colors"
                                  >
                                    {s.most_recent_update ? (
                                      <span className="flex items-start gap-1">
                                        {s.most_recent_update_source === 'granola' && (
                                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" title="From Granola" />
                                        )}
                                        <span className="text-[11px] text-stone-600 whitespace-pre-line leading-relaxed">
                                          {s.most_recent_update}
                                        </span>
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-stone-300">—</span>
                                    )}
                                  </button>
                                )}
                              </div>

                              {/* Copy button */}
                              {s.most_recent_update && (
                                <button
                                  onClick={() => handleCopy(s.most_recent_update || '', `${s.id}:most_recent_update`)}
                                  className="opacity-0 group-hover/cell:opacity-100 transition-opacity p-0.5 rounded hover:bg-stone-100 shrink-0 mt-1"
                                  title="Copy for SFDC"
                                >
                                  {copiedCell === `${s.id}:most_recent_update`
                                    ? <Check size={12} className="text-emerald-500" />
                                    : <Copy size={12} className="text-stone-400" />
                                  }
                                </button>
                              )}
                            </div>
                          </td>

                          {/* 11. Close Date — editable date picker */}
                          <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                            {isEditing(s.id, 'close_date') ? (
                              <input
                                type="date"
                                autoFocus
                                className={inputCls + ' w-[130px]'}
                                value={(() => {
                                  if (!closeDate) return '';
                                  const d = new Date(closeDate);
                                  if (isNaN(d.getTime())) return '';
                                  return d.toISOString().split('T')[0];
                                })()}
                                onChange={e => {
                                  const val = e.target.value;
                                  if (val) {
                                    const d = new Date(val + 'T00:00:00');
                                    const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                    saveEdit(s.id, 'implementation_timeline', formatted);
                                  } else {
                                    saveEdit(s.id, 'implementation_timeline', null);
                                  }
                                }}
                                onBlur={() => setEditingCell(null)}
                              />
                            ) : (
                              <button
                                onClick={() => setEditingCell({ id: s.id, field: 'close_date' })}
                                className="cursor-pointer hover:text-stone-900 transition-colors"
                              >
                                {closeDate ? (
                                  <span className="text-[11px] text-stone-600 tabular-nums">{fmtDate(closeDate)}</span>
                                ) : (
                                  <span className="text-[10px] text-stone-300">—</span>
                                )}
                              </button>
                            )}
                          </td>

                          {/* 12-20. MEDDPICC inline fields — editable textareas matching SFDC */}
                          {([
                            { key: 'competitive_situation', label: 'Competition' },
                            { key: 'success_metrics_text', label: 'Metrics' },
                            { key: 'pain_narrative', label: 'Identify Pain' },
                            { key: 'champion_name', label: 'Champion' },
                            { key: 'decision_criteria', label: 'Decision Criteria' },
                            { key: 'economic_buyer_access', label: 'Economic Buyer' },
                            { key: 'decision_process', label: 'Decision Process' },
                            { key: 'paper_process', label: 'Paper Process' },
                            { key: 'compelling_event', label: 'Compelling Event' },
                          ] as const).map(mf => {
                            const val = (s as any)[mf.key] || '';
                            const cellKey = `${s.id}:${mf.key}`;
                            const mfField = MEDDPICC_FIELDS.find(f => f.fieldKey === mf.key);
                            const badgeStatus = mfField ? getMeddpiccBadgeStatus(s, mfField) : 'gray';
                            const badgeColor = badgeStatus === 'green' ? 'bg-emerald-500' : badgeStatus === 'red' ? 'bg-rose-500' : 'bg-stone-300';

                            return (
                              <td key={mf.key} className="py-2 px-3" onClick={e => e.stopPropagation()}>
                                <div className="flex items-start gap-1 group/cell">
                                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${badgeColor} shrink-0 mt-1.5`} title={badgeStatus} />
                                  <div className="flex-1 min-w-0">
                                    {isEditing(s.id, mf.key) ? (
                                      <textarea
                                        autoFocus
                                        value={editingText}
                                        onChange={e => setEditingText(e.target.value)}
                                        onBlur={() => {
                                          saveEdit(s.id, mf.key, editingText.trim());
                                        }}
                                        onKeyDown={e => {
                                          if (e.key === 'Escape') setEditingCell(null);
                                        }}
                                        rows={3}
                                        className={inputCls + ' w-full text-[11px] resize-y min-h-[60px]'}
                                        placeholder={mf.label + '…'}
                                      />
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setEditingCell({ id: s.id, field: mf.key });
                                          setEditingText(val);
                                        }}
                                        className="w-full text-left cursor-pointer hover:bg-stone-50 rounded px-0.5 py-0.5 transition-colors"
                                      >
                                        {val ? (
                                          <span className="text-[11px] text-stone-600 whitespace-pre-line leading-relaxed line-clamp-3">
                                            {val}
                                          </span>
                                        ) : (
                                          <span className="text-[10px] text-stone-300">—</span>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                  {val && (
                                    <button
                                      onClick={() => handleCopy(val, cellKey)}
                                      className="opacity-0 group-hover/cell:opacity-100 transition-opacity p-0.5 rounded hover:bg-stone-100 shrink-0 mt-1"
                                      title={`Copy ${mf.label}`}
                                    >
                                      {copiedCell === cellKey
                                        ? <Check size={12} className="text-emerald-500" />
                                        : <Copy size={12} className="text-stone-400" />}
                                    </button>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>

                    );
          })}

          {/* ═══ Grand Total Row ═══ */}
          <tr className="bg-stone-900 text-white">
            <td />
            <td className="py-3 px-3" colSpan={5}>
              <span className="text-[12px] font-bold uppercase tracking-wider">Grand Total</span>
            </td>
            <td className="py-3 px-3" />
            <td className="py-3 px-3 text-right">
              <span className="text-[13px] font-bold tabular-nums">{fmtCurrency(grandTotal.amount)}</span>
            </td>
            <td className="py-3 px-3">
              <span className="text-[11px] font-semibold">{grandTotal.count} deal{grandTotal.count !== 1 ? 's' : ''}</span>
            </td>
            <td colSpan={4} />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
