// ════════════════════════════════════════════════════════════════
// MEDDPICC → Salesforce Tab
// Extracted from RepWorkspace.tsx
// ════════════════════════════════════════════════════════════════

import { useState, useCallback, useMemo } from 'react';
import {
  Check, Copy, ClipboardCopy, ExternalLink
} from 'lucide-react';
import {
  type DiscoverySession,
  scoreMEDDPICC,
  generateMEDDPICCSummary,
  updateMEDDPICCField,
} from '../../lib/discoveryDatabase';
import { MEDDPICC_FIELDS, STATUS_COLORS } from './repWorkspaceConstants';

export function MEDDPICCTab({
  session,
  onSessionChange,
  companyName,
}: {
  session: DiscoverySession;
  onSessionChange: (s: DiscoverySession) => void;
  companyName: string;
}) {
  const scores = useMemo(() => scoreMEDDPICC(session), [session]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const getFieldValue = useCallback((field: typeof MEDDPICC_FIELDS[number]) => {
    if (field.key === 'champion') {
      return [session.champion_name, session.champion_validation_notes].filter(Boolean).join('\n');
    }
    return session[field.sessionField!] || '';
  }, [session]);

  const handleFieldChange = useCallback((field: typeof MEDDPICC_FIELDS[number], value: string) => {
    if (field.key === 'champion') {
      // Split: first line = name, rest = validation notes
      const lines = value.split('\n');
      const name = lines[0] || '';
      const notes = lines.slice(1).join('\n');
      updateMEDDPICCField(session.id, 'champion_name', name);
      updateMEDDPICCField(session.id, 'champion_validation_notes', notes);
      onSessionChange({ ...session, champion_name: name, champion_validation_notes: notes });
    } else {
      updateMEDDPICCField(session.id, field.dbField!, value);
      onSessionChange({ ...session, [field.sessionField!]: value });
    }
  }, [session, onSessionChange]);

  const handleCopyField = useCallback(async (field: typeof MEDDPICC_FIELDS[number]) => {
    const text = getFieldValue(field);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field.key);
      setTimeout(() => setCopiedField(null), 2000);
    } catch { /* fallback */ }
  }, [getFieldValue]);

  const handleCopyAll = useCallback(async () => {
    const summary = generateMEDDPICCSummary(session);
    try {
      await navigator.clipboard.writeText(summary);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch { /* fallback */ }
  }, [session]);

  // SF Readiness checks
  const readiness = useMemo(() => {
    const cs = session.call_sheet_answers || {};
    const stakeholders = session.stakeholders || [];
    return {
      // Exit Criteria
      initialMeetingCompleted: !!(session.milestones?.discovery_held),
      nextStepScheduled: !!(session.next_meeting_date && session.next_action),
      partnerEngaged: stakeholders.length >= 2,
      // MEDDPICC fields
      champion: scores.champion !== 'red',
      competition: scores.competition !== 'red',
      decisionCriteria: scores.decision_criteria !== 'red',
      metrics: scores.metrics !== 'red',
      identifyPain: scores.identify_pain !== 'red',
      // Readiness
      atsProvider: !!(session.current_ats),
      hriProvider: !!(session.hris || (session as any).handoff_current_hris),
      nextSteps: !!(session.next_action),
      primaryContact: stakeholders.length > 0,
    };
  }, [session, scores]);

  return (
    <div className="flex gap-6 p-6 h-full">
      {/* Main column — 5 SF field cards */}
      <div className="flex-1 min-w-0 space-y-5 overflow-y-auto h-full pr-2">
        {/* Field cards */}
        {MEDDPICC_FIELDS.map(field => {
          const status = scores[field.key];
          const colors = STATUS_COLORS[status];
          const value = getFieldValue(field);
          const isCopied = copiedField === field.key;

          return (
            <div
              key={field.key}
              className="bg-white border border-stone-200/40 rounded-xl overflow-hidden"
            >
              {/* Card header */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Letter badge */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold text-white ${
                  status === 'green' ? 'bg-emerald-500' : status === 'yellow' ? 'bg-amber-500' : 'bg-rose-400'
                }`}>
                  {field.letter}
                </div>
                {/* Field name + status dot */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-stone-800">{field.label}</span>
                    <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  </div>
                </div>
                {/* Copy button */}
                <button
                  onClick={() => handleCopyField(field)}
                  disabled={!value}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    isCopied
                      ? 'bg-emerald-100 text-emerald-700'
                      : value
                        ? 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                        : 'bg-stone-50 text-stone-300 cursor-not-allowed'
                  }`}
                >
                  {isCopied ? <Check size={12} /> : <Copy size={12} />}
                  {isCopied ? 'Copied' : 'Copy'}
                </button>
              </div>

              {/* Coaching prompt */}
              <div className="px-4 pb-2">
                <p className="text-[10px] text-stone-400 leading-relaxed italic">{field.coaching}</p>
              </div>

              {/* Textarea */}
              <div className="px-4 pb-4">
                <textarea
                  value={value}
                  onChange={e => handleFieldChange(field, e.target.value)}
                  placeholder={field.placeholder}
                  style={{ fieldSizing: 'content' } as any}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-700 resize-none focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300 min-h-[3lh] max-h-[15lh] overflow-y-auto leading-relaxed"
                />
              </div>
            </div>
          );
        })}


      </div>

      {/* Sidebar — SF Readiness Checklist */}
      <div className="hidden xl:block w-64 shrink-0">
        <div className="sticky top-6 space-y-5">
          {/* Salesforce Link */}
          {session.sf_opportunity_id && (
            <a
              href={`https://servicealignment.lightning.force.com/lightning/r/Opportunity/${session.sf_opportunity_id}/view`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#00a1e0] hover:bg-[#0090c9] text-white py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-sm w-full"
            >
              <ExternalLink size={13} />
              Open Opportunity in SFDC
            </a>
          )}

          {/* Exit Criteria */}
          <div className="bg-white border border-stone-200/40 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-stone-700 mb-3">Exit Criteria</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Initial meeting completed', checked: readiness.initialMeetingCompleted },
                { label: 'Next step scheduled and accepted', checked: readiness.nextStepScheduled },
                { label: 'Partner engaged (where relevant)', checked: readiness.partnerEngaged },
              ].map(item => (
                <label key={item.label} className="flex items-start gap-2 group">
                  <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                    item.checked
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-stone-300 bg-white'
                  }`}>
                    {item.checked && <Check size={10} className="text-white" />}
                  </div>
                  <span className={`text-[11px] leading-snug ${item.checked ? 'text-stone-700' : 'text-stone-400'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* MEDDPICC Checklist */}
          <div className="bg-white border border-stone-200/40 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-stone-700 mb-3">MEDDPICC Checklist</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Champion', checked: readiness.champion },
                { label: 'Competition', checked: readiness.competition },
                { label: 'Decision Criteria', checked: readiness.decisionCriteria },
                { label: 'Metrics', checked: readiness.metrics },
                { label: 'Identify Pain', checked: readiness.identifyPain },
              ].map(item => (
                <label key={item.label} className="flex items-start gap-2 group">
                  <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                    item.checked
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-stone-300 bg-white'
                  }`}>
                    {item.checked && <Check size={10} className="text-white" />}
                  </div>
                  <span className={`text-[11px] leading-snug ${item.checked ? 'text-stone-700' : 'text-stone-400'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Readiness Checklist */}
          <div className="bg-white border border-stone-200/40 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-stone-700 mb-3">Readiness Checklist</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Provider Provider', checked: readiness.atsProvider },
                { label: 'HRI Provider', checked: readiness.hriProvider },
                { label: 'Next Steps', checked: readiness.nextSteps },
                { label: 'Primary Contact', checked: readiness.primaryContact },
                { label: 'Champion', checked: readiness.champion },
                { label: 'Competition', checked: readiness.competition },
                { label: 'Decision Criteria', checked: readiness.decisionCriteria },
                { label: 'Metrics', checked: readiness.metrics },
                { label: 'Identify Pain', checked: readiness.identifyPain },
              ].map((item, i) => (
                <label key={`${item.label}-${i}`} className="flex items-start gap-2 group">
                  <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                    item.checked
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-stone-300 bg-white'
                  }`}>
                    {item.checked && <Check size={10} className="text-white" />}
                  </div>
                  <span className={`text-[11px] leading-snug ${item.checked ? 'text-stone-700' : 'text-stone-400'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
