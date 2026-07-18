// ════════════════════════════════════════════════════════════════
// MEDDPICC → Salesforce Tab (with Interactive Contact Mapping)
// ════════════════════════════════════════════════════════════════

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  Check, Copy, ClipboardCopy, UserPlus, X, ChevronDown, ExternalLink,
} from 'lucide-react';
import {
  type DiscoverySession,
  type Stakeholder,
  scoreMEDDPICC,
  generateMEDDPICCSummary,
  updateMEDDPICCField,
  updateSessionStakeholders,
} from '../../lib/discoveryDatabase';
import { MEDDPICC_FIELDS, STATUS_COLORS } from './repWorkspaceConstants';

// Salesforce Lightning URL
const SF_BASE = 'https://teamtailor.lightning.force.com';

// MEDDPICC roles that map to contacts
const MEDDPICC_ROLES = [
  { id: 'economic_buyer', letter: 'E', label: 'Economic Buyer', color: 'bg-violet-500', description: 'Who signs the check?' },
  { id: 'champion', letter: 'C', label: 'Champion', color: 'bg-emerald-500', description: 'Who is selling internally for you?' },
  { id: 'coach', letter: '🎯', label: 'Coach', color: 'bg-sky-500', description: 'Who gives you the inside scoop?' },
  { id: 'blocker', letter: '⚠', label: 'Blocker', color: 'bg-rose-400', description: 'Who might derail the deal?' },
] as const;

function ContactPicker({
  stakeholders,
  role,
  assigned,
  onAssign,
  onClear,
}: {
  stakeholders: Stakeholder[];
  role: typeof MEDDPICC_ROLES[number];
  assigned: Stakeholder | undefined;
  onAssign: (roleId: string, stakeholder: Stakeholder) => void;
  onClear: (roleId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  if (assigned) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg border border-emerald-200/60 bg-emerald-50/30 min-h-[56px]">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white ${role.color}`}>
          {role.letter}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold text-stone-800 truncate">{assigned.name}</div>
          <div className="text-[9px] text-stone-400">{assigned.title || role.label}</div>
        </div>
        <button
          onClick={() => onClear(role.id)}
          className="p-1 rounded hover:bg-stone-200/50 text-stone-300 hover:text-stone-500 transition-colors"
          title="Remove assignment"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 p-3 rounded-lg border border-dashed border-stone-200 hover:border-stone-300 bg-stone-50/30 hover:bg-stone-50 transition-colors min-h-[56px] group"
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white/60 ${role.color} opacity-40 group-hover:opacity-70 transition-opacity`}>
          {role.letter}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[10px] font-medium text-stone-400">{role.label}</div>
          <div className="text-[9px] text-stone-300">{role.description}</div>
        </div>
        <ChevronDown size={12} className="text-stone-300 group-hover:text-stone-500 transition-colors" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
          {stakeholders.length === 0 ? (
            <div className="p-3 text-[11px] text-stone-400 text-center">No stakeholders added yet</div>
          ) : (
            stakeholders.map(s => (
              <button
                key={s.id}
                onClick={() => { onAssign(role.id, s); setIsOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-stone-50 transition-colors text-left border-b border-stone-50 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-stone-700">{s.name || 'Unnamed'}</div>
                  <div className="text-[9px] text-stone-400">{s.title || s.role || 'No title'}</div>
                </div>
                <Check size={10} className="text-stone-200" />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

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

  const stakeholders = session.stakeholders || [];

  // Build a map of role assignments from stakeholder roles
  const roleAssignments = useMemo(() => {
    const map = new Map<string, Stakeholder>();
    for (const s of stakeholders) {
      const role = s.role?.toLowerCase().replace(/\s+/g, '_');
      if (role === 'economic_buyer' || role === 'champion' || role === 'coach' || role === 'blocker') {
        map.set(role, s);
      }
    }
    return map;
  }, [stakeholders]);

  const handleAssign = useCallback((roleId: string, stakeholder: Stakeholder) => {
    // Update the stakeholder's role and persist
    const roleName = MEDDPICC_ROLES.find(r => r.id === roleId)?.label || roleId;
    const updated = stakeholders.map(s =>
      s.id === stakeholder.id ? { ...s, role: roleName } : s
    );
    // If a different stakeholder was already assigned to this role, clear it
    const prev = roleAssignments.get(roleId);
    const final = updated.map(s =>
      prev && s.id === prev.id && s.id !== stakeholder.id ? { ...s, role: '' } : s
    );
    updateSessionStakeholders(session.id, final);
    onSessionChange({ ...session, stakeholders: final });

    // Also update champion_name field when Champion is assigned
    if (roleId === 'champion') {
      updateMEDDPICCField(session.id, 'champion_name', stakeholder.name);
      onSessionChange(prev => ({ ...prev, champion_name: stakeholder.name }));
    }
  }, [stakeholders, roleAssignments, session, onSessionChange]);

  const handleClear = useCallback((roleId: string) => {
    const assigned = roleAssignments.get(roleId);
    if (!assigned) return;
    const updated = stakeholders.map(s =>
      s.id === assigned.id ? { ...s, role: '' } : s
    );
    updateSessionStakeholders(session.id, updated);
    onSessionChange({ ...session, stakeholders: updated });
  }, [stakeholders, roleAssignments, session, onSessionChange]);

  const getFieldValue = useCallback((field: typeof MEDDPICC_FIELDS[number]) => {
    if (field.key === 'champion') {
      return [session.champion_name, session.champion_validation_notes].filter(Boolean).join('\n');
    }
    return session[field.sessionField!] || '';
  }, [session]);

  const handleFieldChange = useCallback((field: typeof MEDDPICC_FIELDS[number], value: string) => {
    if (field.key === 'champion') {
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
    return {
      initialMeetingCompleted: !!(session.milestones?.discovery_held),
      nextStepScheduled: !!(session.next_meeting_date && session.next_action),
      partnerEngaged: stakeholders.length >= 2,
      champion: scores.champion !== 'red',
      competition: scores.competition !== 'red',
      decisionCriteria: scores.decision_criteria !== 'red',
      metrics: scores.metrics !== 'red',
      identifyPain: scores.identify_pain !== 'red',
      atsProvider: !!(session.current_ats),
      hriProvider: !!(session.hris || (session as any).handoff_current_hris),
      nextSteps: !!(session.next_action),
      primaryContact: stakeholders.length > 0,
    };
  }, [session, scores]);

  return (
    <div className="flex gap-6 p-6 h-full">
      {/* Main column */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-stone-800">MEDDPICC → Salesforce</h2>
            <div className="flex items-center gap-1.5">
              {scores.green > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {scores.green}
                </span>
              )}
              {scores.yellow > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {scores.yellow}
                </span>
              )}
              {scores.red > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> {scores.red}
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-stone-400">Fill in here, copy to Salesforce with one click</p>
        </div>

        {/* ── MEDDPICC Contact Mapping ── */}
        <div className="bg-white border border-stone-200/40 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Stakeholder Map</h3>
            <span className="text-[10px] text-stone-300">
              {roleAssignments.size}/{MEDDPICC_ROLES.length} mapped
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MEDDPICC_ROLES.map(role => (
              <ContactPicker
                key={role.id}
                stakeholders={stakeholders}
                role={role}
                assigned={roleAssignments.get(role.id)}
                onAssign={handleAssign}
                onClear={handleClear}
              />
            ))}
          </div>
        </div>

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
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold text-white ${
                  status === 'green' ? 'bg-emerald-500' : status === 'yellow' ? 'bg-amber-500' : 'bg-rose-400'
                }`}>
                  {field.letter}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-stone-800">{field.label}</span>
                    <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  </div>
                </div>
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
                  rows={3}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-700 resize-none focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300 leading-relaxed"
                />
              </div>
            </div>
          );
        })}

        {/* Copy All button */}
        <div className="pt-2 pb-6">
          <button
            onClick={handleCopyAll}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              copiedAll
                ? 'bg-emerald-500 text-white'
                : 'bg-stone-900 text-white hover:bg-stone-800'
            }`}
          >
            {copiedAll ? <Check size={15} /> : <ClipboardCopy size={15} />}
            {copiedAll ? 'Copied to Clipboard' : 'Copy All to Salesforce'}
          </button>
        </div>
      </div>

      {/* Sidebar — SF Readiness Checklist */}
      <div className="hidden xl:block w-64 shrink-0">
        <div className="sticky top-6 space-y-5">
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
                { label: 'ATS Provider', checked: readiness.atsProvider },
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
