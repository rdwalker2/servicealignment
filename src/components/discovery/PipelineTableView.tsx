// ============================================================
// PipelineTableView — SFDC-style Pipeline Review Table
// Matches Brian McGarry's "Team Walker - Pipe Closing This Month" report
// 12 columns, grouped by Forecast Category → Stage, MEDDPICC expansion
// ============================================================

function computeAge(dateStr?: string | null): number {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

import { useState, useMemo, useCallback, useRef, useEffect, Fragment } from 'react';
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

/** Column definitions */
const COLUMNS = [
  { key: 'close_date', label: 'Close Date', width: 'w-[100px]' },
  { key: 'deal_value', label: 'Amount', width: 'w-[110px]' },
  { key: 'company_name', label: 'Account Name', width: 'w-[200px]' },
  { key: 'roof_health_score', label: 'Health Score', width: 'w-[90px]' },
  { key: 'rep_id', label: 'Opportunity Owner', width: 'w-[130px]' },
  { key: 'next_action', label: 'Next Steps', width: 'w-[260px]' },
  { key: 'most_recent_update', label: 'Most Recent Update', width: 'w-[240px]' },
  { key: 'metrics', label: 'Metrics', width: 'w-[200px]' },
  { key: 'economic_buyer', label: 'Economic Buyer', width: 'w-[200px]' },
  { key: 'decision_criteria', label: 'Decision Criteria', width: 'w-[200px]' },
  { key: 'decision_process', label: 'Decision Process', width: 'w-[200px]' },
  { key: 'paper_process', label: 'Paper Process', width: 'w-[200px]' },
  { key: 'identify_pain', label: 'Identify Pain', width: 'w-[200px]' },
  { key: 'champion', label: 'Champion', width: 'w-[200px]' },
  { key: 'competition', label: 'Competition', width: 'w-[200px]' },
  { key: 'compelling_event', label: 'Compelling Event', width: 'w-[200px]' },
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

/** Format a date string as "Jul 15, 2026" */
function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Generate default opportunity name: "Company - IB/OB - created_date" */
function defaultOpportunityName(session: DiscoverySession): string {
  const source = session.lead_source
    ? /inbound/i.test(session.lead_source) ? 'IB' : /outbound/i.test(session.lead_source) ? 'OB' : 'IB'
    : 'IB';
  const dateStr = new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  return `${session.company_name} - ${source} - ${dateStr}`;
}

// ── Component ──

export function PipelineTableView({
  sessions,
  isAdmin,
  onSelect,
  onSessionUpdate,
}: PipelineTableViewProps) {
  // ── Local State ──
  const [sortCol, setSortCol] = useState<string>('deal_value');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editingText, setEditingText] = useState('');
  const [copiedCell, setCopiedCell] = useState<string | null>(null); // "sessionId:field" for copy feedback

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
    
    // Optimistic update wrapper
    onSessionUpdate({ ...session, [field]: value });
    setEditingCell(null);
  }, [sessions, onSessionUpdate]);

  // ── Bulk Actions ──
  const handleCopyRow = useCallback((s: DiscoverySession) => {
    const who = s.next_steps_who || 'TBD';
    const what = s.next_steps_what || 'TBD';
    const when = s.next_steps_when || 'TBD';
    const nextSteps = `Who: ${who}\nWhat: ${what}\nWhen: ${when}`;
    const mru = s.most_recent_update || 'No recent updates.';
    const text = `=== ${s.company_name} ===\nNEXT STEPS:\n${nextSteps}\n\nMOST RECENT UPDATE:\n${mru}\n`;
    handleCopy(text, `${s.id}:row`);
  }, [handleCopy]);


  // ── Sorting ──
  const sortedSessions = useMemo(() => {
    const arr = [...sessions];
    arr.sort((a, b) => {
      let valA: any = a[sortCol as keyof DiscoverySession];
      let valB: any = b[sortCol as keyof DiscoverySession];

      if (sortCol === 'company_name') {
        valA = a.company_name?.toLowerCase();
        valB = b.company_name?.toLowerCase();
      } else if (sortCol === 'opportunity_name') {
        valA = (a.opportunity_name || defaultOpportunityName(a)).toLowerCase();
        valB = (b.opportunity_name || defaultOpportunityName(b)).toLowerCase();
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [sessions, sortCol, sortDir]);

  // ── Derived Totals ──
  const grandTotal = useMemo(() => {
    return {
      count: sessions.length,
      amount: sessions.reduce((sum, s) => sum + (s.deal_value || 0), 0)
    };
  }, [sessions]);

  const inputCls = "bg-white border border-stone-300 rounded px-2 py-1 text-[11px] text-stone-700 outline-none focus:border-stone-500 shadow-sm w-full";
  const selectCls = "bg-white border border-stone-300 rounded px-1.5 py-1 text-[10px] text-stone-700 outline-none focus:border-stone-500 shadow-sm min-w-[90px]";
  const cellBtnCls = "w-full text-left cursor-pointer hover:bg-white rounded px-1.5 py-1 transition-colors min-h-[24px] group flex flex-col justify-center";

  // ── Check if a specific cell is being edited ──
  const isEditing = useCallback((sessionId: string, field: string) =>
    editingCell?.id === sessionId && editingCell?.field === field
  , [editingCell]);

  return (
    <div className="flex-1 overflow-auto bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── Deal Count Banner ── */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-2 bg-white border-b border-stone-200/60">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-stone-400">{sessions.length} deals</span>
          <span className="text-stone-300">•</span>
          <span className="text-[11px] text-stone-400">{fmtCurrency(grandTotal.amount)}</span>
        </div>
      </div>

      <table className="w-full min-w-[2400px]">
        {/* ── Table Header ── */}
        <thead className="sticky top-0 z-10">
          <tr className="bg-white border-b border-stone-200/60">
            {/* Row Number */}
            <th className="w-8 py-2.5 px-3 text-[10px] font-medium text-stone-300 select-none text-right border-r border-stone-100">#</th>
            {/* Expand chevron column */}
            <th className="w-6 py-2.5 px-1" />
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
           {sortedSessions.map((s, idx) => {
            const age = computeAge(s.created_at);
            const rep = REP_PROFILES.find(r => r.id === s.rep_id);
            const oppName = s.opportunity_name || defaultOpportunityName(s);
            const isExpanded = expandedRows.has(s.id);
            const closeDate = s.implementation_timeline ?? null;

            // Source display
            const source = s.lead_source ?? '';
            const isInbound = /inbound/i.test(source);
            const isOutbound = /outbound/i.test(source);

            return (
              <Fragment key={s.id}>
                {/* ── Deal Data Row ── */}
                <tr
                  className="border-b border-stone-100/40 hover:bg-stone-50/60 transition-colors group/row"
                >
                  {/* Row Number */}
                  <td className="py-2 px-3 text-right text-[10px] font-mono text-stone-400 border-r border-stone-100 bg-stone-50/30">
                    {175 + idx}
                  </td>
                  {/* Copy Row */}
                  <td className="py-2 px-1 text-center">
                    <button
                      onClick={() => handleCopyRow(s)}
                      className="p-0.5 rounded hover:bg-emerald-100 transition-colors opacity-0 group-hover/row:opacity-100"
                      title="Copy Next Steps + MRU for SFDC"
                    >
                      {copiedCell === `${s.id}:row`
                        ? <Check size={11} className="text-emerald-500" />
                        : <ClipboardList size={11} className="text-stone-400" />}
                    </button>
                  </td>

                  {/* 1. Close Date */}
                  <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                    {isEditing(s.id, 'close_date') ? (
                      <input
                        type="date"
                        autoFocus
                        value={closeDate || ''}
                        onChange={e => saveEdit(s.id, 'implementation_timeline', e.target.value)}
                        onBlur={() => setEditingCell(null)}
                        className={inputCls}
                      />
                    ) : (
                      <button
                        onClick={() => setEditingCell({ id: s.id, field: 'close_date' })}
                        className="cursor-pointer hover:text-stone-900 transition-colors"
                      >
                        {closeDate ? (
                          <span className="text-[11px] text-stone-600 tabular-nums font-mono">{fmtDate(closeDate)}</span>
                        ) : (
                          <span className="text-[10px] text-stone-300">—</span>
                        )}
                      </button>
                    )}
                  </td>

                  {/* 2. Amount */}
                  <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                    {isEditing(s.id, 'deal_value') ? (
                      <input
                        type="number"
                        autoFocus
                        value={s.deal_value || ''}
                        onChange={e => saveEdit(s.id, 'deal_value', parseInt(e.target.value, 10))}
                        onBlur={() => setEditingCell(null)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                          if (e.key === 'Escape') setEditingCell(null);
                        }}
                        className={inputCls + ' w-[80px]'}
                      />
                    ) : (
                      <button
                        onClick={() => setEditingCell({ id: s.id, field: 'deal_value' })}
                        className="text-[11px] font-medium text-stone-600 hover:text-stone-900 transition-colors tabular-nums cursor-pointer"
                      >
                        {s.deal_value ? `USD ${s.deal_value.toLocaleString()}` : '—'}
                      </button>
                    )}
                  </td>

                  {/* 3. Account Name */}
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelect(s)}
                        className="text-[11px] text-[#C1272D] hover:text-red-700 truncate max-w-[130px] inline-block transition-colors cursor-pointer text-left font-medium"
                        title={s.company_name}
                      >
                        {s.company_name}
                      </button>
                      {s.company_id && (
                        <a
                          href={`https://servicealignment.lightning.force.com/lightning/r/Account/${s.company_id}/view`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opacity-40 hover:opacity-100 transition-opacity shrink-0"
                          title="Open Account in Salesforce"
                        >
                          <img src="https://cdn.iconscout.com/icon/free/png-256/free-salesforce-282298.png" alt="SF" className="w-3 h-3 object-contain" />
                        </a>
                      )}
                      {s.sf_opportunity_id && (
                        <a
                          href={`https://servicealignment.lightning.force.com/lightning/r/Opportunity/${s.sf_opportunity_id}/view`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opacity-40 hover:opacity-100 transition-opacity shrink-0 ml-1"
                          title="Open Opportunity in Salesforce"
                        >
                          <span className="text-[10px] bg-stone-100 px-1 py-0.5 rounded text-stone-500 hover:bg-stone-200">Opp</span>
                        </a>
                      )}
                    </div>
                  </td>

                  {/* 4. Roof Health Score */}
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1.5">
                      {s.roof_health_score !== undefined ? (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          s.roof_health_score < 50 ? 'bg-red-100 text-red-700' : 
                          s.roof_health_score < 80 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {s.roof_health_score}
                        </span>
                      ) : <span className="text-[10px] text-stone-300">—</span>}
                    </div>
                  </td>

                  {/* 5. Opportunity Owner */}
                  <td className="py-2 px-3">
                    <span className="text-[11px] font-medium text-[#C1272D] truncate">
                      {rep?.full_name ?? '—'}
                    </span>
                  </td>

                  {/* 6. Next Steps */}
                  <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                    {isEditing(s.id, 'next_action') ? (
                      <div className="space-y-1 p-1 bg-stone-50 rounded border border-stone-200">
                        <input autoFocus type="text" placeholder="Who…" value={editingText.split('|')[0] || ''} onChange={e => setEditingText(`${e.target.value}|${editingText.split('|')[1] || ''}|${editingText.split('|')[2] || ''}`)} className={inputCls} />
                        <textarea placeholder="What…" rows={2} value={editingText.split('|')[1] || ''} onChange={e => setEditingText(`${editingText.split('|')[0] || ''}|${e.target.value}|${editingText.split('|')[2] || ''}`)} className={inputCls} />
                        <input type="text" placeholder="When…" value={editingText.split('|')[2] || ''} onChange={e => setEditingText(`${editingText.split('|')[0] || ''}|${editingText.split('|')[1] || ''}|${e.target.value}`)} className={inputCls} />
                        <div className="flex justify-end gap-1 mt-1">
                          <button onClick={() => setEditingCell(null)} className="px-2 py-0.5 text-[9px] text-stone-500 hover:bg-stone-200 rounded">Cancel</button>
                          <button onClick={() => {
                            const [who, what, when] = editingText.split('|');
                            const updated = { ...s, next_steps_who: who, next_steps_what: what, next_steps_when: when };
                            onSessionUpdate(updated);
                            setEditingCell(null);
                          }} className="px-2 py-0.5 text-[9px] bg-stone-900 text-white rounded">Save</button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingCell({ id: s.id, field: 'next_action' });
                          setEditingText(`${s.next_steps_who || ''}|${s.next_steps_what || ''}|${s.next_steps_when || ''}`);
                        }}
                        className={cellBtnCls}
                      >
                        <div className="space-y-0.5">
                          <div className="flex gap-1.5 leading-snug">
                            <span className="text-[10px] font-semibold text-stone-600 w-8 shrink-0">Who:</span>
                            <span className="text-[10px] text-stone-600">{s.next_steps_who || <span className="text-stone-300 italic">TBD</span>}</span>
                          </div>
                          <div className="flex gap-1.5 leading-snug">
                            <span className="text-[10px] font-semibold text-stone-600 w-8 shrink-0">What:</span>
                            <span className="text-[10px] text-stone-600 line-clamp-2" title={s.next_steps_what}>{s.next_steps_what || <span className="text-stone-300 italic">Click to edit what...</span>}</span>
                          </div>
                          <div className="flex gap-1.5 leading-snug">
                            <span className="text-[10px] font-semibold text-stone-600 w-8 shrink-0">When:</span>
                            <span className="text-[10px] text-stone-600">{s.next_steps_when || <span className="text-stone-300 italic">TBD</span>}</span>
                          </div>
                        </div>
                      </button>
                    )}
                  </td>

                  {/* 7. Most Recent Update */}
                  <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                    {isEditing(s.id, 'most_recent_update') ? (
                      <textarea
                        autoFocus
                        value={editingText}
                        onChange={e => setEditingText(e.target.value)}
                        onBlur={() => saveEdit(s.id, 'most_recent_update', editingText.trim() || undefined)}
                        rows={3}
                        className={inputCls + ' resize-none'}
                        placeholder="Latest update…"
                      />
                    ) : (
                      <button
                        onClick={() => {
                          setEditingCell({ id: s.id, field: 'most_recent_update' });
                          setEditingText(s.most_recent_update || '');
                        }}
                        className={cellBtnCls}
                      >
                        {s.most_recent_update ? (
                          <span className="text-[10px] text-stone-700 leading-snug line-clamp-4">{s.most_recent_update}</span>
                        ) : (
                          <span className="text-[10px] text-stone-300 italic">Click to add update…</span>
                        )}
                      </button>
                    )}
                  </td>

                  {/* 11. Sales Source removed */}

                  {/* 8. Metrics */}
                  <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                    {isEditing(s.id, 'metrics') ? (
                      <textarea
                        autoFocus
                        value={editingText}
                        onChange={e => setEditingText(e.target.value)}
                        onBlur={() => saveEdit(s.id, 'success_metrics_text', editingText.trim() || undefined)}
                        rows={4}
                        className={inputCls + ' resize-none'}
                        placeholder="Enter metrics…"
                      />
                    ) : (
                      <button
                        onClick={() => {
                          setEditingCell({ id: s.id, field: 'metrics' });
                          setEditingText(s.success_metrics_text || '');
                        }}
                        className={cellBtnCls}
                      >
                        {s.success_metrics_text ? (
                          <span className="text-[10px] text-stone-700 leading-snug line-clamp-4 whitespace-pre-wrap">{s.success_metrics_text}</span>
                        ) : (
                          <span className="text-[10px] text-stone-300 italic">Click to add metrics…</span>
                        )}
                      </button>
                    )}
                  </td>
                  {/* Economic Buyer */}
                  <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                    {isEditing(s.id, 'economic_buyer') ? (
                      <textarea autoFocus value={editingText} onChange={e => setEditingText(e.target.value)} onBlur={() => saveEdit(s.id, 'economic_buyer_access', editingText.trim() || undefined)} rows={4} className={inputCls + ' resize-none'} placeholder="Enter economic buyer..." />
                    ) : (
                      <button onClick={() => { setEditingCell({ id: s.id, field: 'economic_buyer' }); setEditingText(s.economic_buyer_access || ''); }} className={cellBtnCls}>
                        {s.economic_buyer_access ? <span className="text-[10px] text-stone-700 leading-snug line-clamp-4 whitespace-pre-wrap">{s.economic_buyer_access}</span> : <span className="text-[10px] text-stone-300 italic">Click to add economic buyer...</span>}
                      </button>
                    )}
                  </td>
                  {/* Decision Criteria */}
                  <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                    {isEditing(s.id, 'decision_criteria') ? (
                      <textarea autoFocus value={editingText} onChange={e => setEditingText(e.target.value)} onBlur={() => saveEdit(s.id, 'decision_criteria', editingText.trim() || undefined)} rows={4} className={inputCls + ' resize-none'} placeholder="Enter decision criteria..." />
                    ) : (
                      <button onClick={() => { setEditingCell({ id: s.id, field: 'decision_criteria' }); setEditingText(s.decision_criteria || ''); }} className={cellBtnCls}>
                        {s.decision_criteria ? <span className="text-[10px] text-stone-700 leading-snug line-clamp-4 whitespace-pre-wrap">{s.decision_criteria}</span> : <span className="text-[10px] text-stone-300 italic">Click to add criteria...</span>}
                      </button>
                    )}
                  </td>
                  {/* Decision Process */}
                  <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                    {isEditing(s.id, 'decision_process') ? (
                      <textarea autoFocus value={editingText} onChange={e => setEditingText(e.target.value)} onBlur={() => saveEdit(s.id, 'decision_process', editingText.trim() || undefined)} rows={4} className={inputCls + ' resize-none'} placeholder="Enter decision process..." />
                    ) : (
                      <button onClick={() => { setEditingCell({ id: s.id, field: 'decision_process' }); setEditingText(s.decision_process || ''); }} className={cellBtnCls}>
                        {s.decision_process ? <span className="text-[10px] text-stone-700 leading-snug line-clamp-4 whitespace-pre-wrap">{s.decision_process}</span> : <span className="text-[10px] text-stone-300 italic">Click to add process...</span>}
                      </button>
                    )}
                  </td>
                  {/* Paper Process */}
                  <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                    {isEditing(s.id, 'paper_process') ? (
                      <textarea autoFocus value={editingText} onChange={e => setEditingText(e.target.value)} onBlur={() => saveEdit(s.id, 'paper_process', editingText.trim() || undefined)} rows={4} className={inputCls + ' resize-none'} placeholder="Enter paper process..." />
                    ) : (
                      <button onClick={() => { setEditingCell({ id: s.id, field: 'paper_process' }); setEditingText(s.paper_process || ''); }} className={cellBtnCls}>
                        {s.paper_process ? <span className="text-[10px] text-stone-700 leading-snug line-clamp-4 whitespace-pre-wrap">{s.paper_process}</span> : <span className="text-[10px] text-stone-300 italic">Click to add paper process...</span>}
                      </button>
                    )}
                  </td>
                  {/* Identify Pain */}
                  <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                    {isEditing(s.id, 'identify_pain') ? (
                      <textarea autoFocus value={editingText} onChange={e => setEditingText(e.target.value)} onBlur={() => saveEdit(s.id, 'pain_narrative', editingText.trim() || undefined)} rows={4} className={inputCls + ' resize-none'} placeholder="Enter pain..." />
                    ) : (
                      <button onClick={() => { setEditingCell({ id: s.id, field: 'identify_pain' }); setEditingText(s.pain_narrative || ''); }} className={cellBtnCls}>
                        {s.pain_narrative ? <span className="text-[10px] text-stone-700 leading-snug line-clamp-4 whitespace-pre-wrap">{s.pain_narrative}</span> : <span className="text-[10px] text-stone-300 italic">Click to add pain...</span>}
                      </button>
                    )}
                  </td>
                  {/* Champion */}
                  <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                    {isEditing(s.id, 'champion') ? (
                      <textarea autoFocus value={editingText} onChange={e => setEditingText(e.target.value)} onBlur={() => saveEdit(s.id, 'champion_name', editingText.trim() || undefined)} rows={4} className={inputCls + ' resize-none'} placeholder="Enter champion..." />
                    ) : (
                      <button onClick={() => { setEditingCell({ id: s.id, field: 'champion' }); setEditingText(s.champion_name || ''); }} className={cellBtnCls}>
                        {s.champion_name ? <span className="text-[10px] text-stone-700 leading-snug line-clamp-4 whitespace-pre-wrap">{s.champion_name}</span> : <span className="text-[10px] text-stone-300 italic">Click to add champion...</span>}
                      </button>
                    )}
                  </td>
                  {/* Competition */}
                  <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                    {isEditing(s.id, 'competition') ? (
                      <textarea autoFocus value={editingText} onChange={e => setEditingText(e.target.value)} onBlur={() => saveEdit(s.id, 'competitive_situation', editingText.trim() || undefined)} rows={4} className={inputCls + ' resize-none'} placeholder="Enter competition..." />
                    ) : (
                      <button onClick={() => { setEditingCell({ id: s.id, field: 'competition' }); setEditingText(s.competitive_situation || ''); }} className={cellBtnCls}>
                        {s.competitive_situation ? <span className="text-[10px] text-stone-700 leading-snug line-clamp-4 whitespace-pre-wrap">{s.competitive_situation}</span> : <span className="text-[10px] text-stone-300 italic">Click to add competition...</span>}
                      </button>
                    )}
                  </td>
                  {/* Compelling Event */}
                  <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                    {isEditing(s.id, 'compelling_event') ? (
                      <textarea autoFocus value={editingText} onChange={e => setEditingText(e.target.value)} onBlur={() => saveEdit(s.id, 'compelling_event', editingText.trim() || undefined)} rows={4} className={inputCls + ' resize-none'} placeholder="Enter compelling event..." />
                    ) : (
                      <button onClick={() => { setEditingCell({ id: s.id, field: 'compelling_event' }); setEditingText(s.compelling_event || ''); }} className={cellBtnCls}>
                        {s.compelling_event ? <span className="text-[10px] text-stone-700 leading-snug line-clamp-4 whitespace-pre-wrap">{s.compelling_event}</span> : <span className="text-[10px] text-stone-300 italic">Click to add event...</span>}
                      </button>
                    )}
                  </td>
                </tr>
              </Fragment>
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
            <td colSpan={8} />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
