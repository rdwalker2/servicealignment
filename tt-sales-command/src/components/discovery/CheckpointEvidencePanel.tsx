// ============================================================
// CheckpointEvidencePanel — Evidence capture for CP1/CP2/CP3
// Shows which checkpoint was validated, when, and the proof
// ============================================================

import { useState } from 'react';
import type { CheckpointEvidence } from '../../lib/discoveryDatabase';

const CP_CONFIG = [
  { id: 'cp1' as const, label: 'CP1 — Urgency Test', question: 'Is there enough pain that this is an urgent priority?', color: 'blue' },
  { id: 'cp2' as const, label: 'CP2 — Gap Test', question: 'Are their current resources inadequate to solve this?', color: 'purple' },
  { id: 'cp3' as const, label: 'CP3 — Best Solution', question: 'Are we undeniably the best solution for them?', color: 'emerald' },
] as const;

type CPKey = 'cp1' | 'cp2' | 'cp3';

interface Props {
  evidence?: { cp1?: CheckpointEvidence; cp2?: CheckpointEvidence; cp3?: CheckpointEvidence };
  onChange: (evidence: { cp1?: CheckpointEvidence; cp2?: CheckpointEvidence; cp3?: CheckpointEvidence }) => void;
  stakeholderNames?: string[];
}

export function CheckpointEvidencePanel({ evidence = {}, onChange, stakeholderNames = [] }: Props) {
  const [editingCp, setEditingCp] = useState<CPKey | null>(null);

  const toggleValidated = (cpKey: CPKey) => {
    const current = evidence[cpKey];
    if (current?.validated) {
      // Un-validate
      onChange({ ...evidence, [cpKey]: { ...current, validated: false } });
    } else {
      // Validate + expand for evidence
      onChange({
        ...evidence,
        [cpKey]: {
          validated: true,
          validated_date: new Date().toISOString().split('T')[0],
          evidence: current?.evidence || '',
          validated_by: current?.validated_by || '',
        },
      });
      setEditingCp(cpKey);
    }
  };

  const updateEvidence = (cpKey: CPKey, updates: Partial<CheckpointEvidence>) => {
    onChange({
      ...evidence,
      [cpKey]: { ...evidence[cpKey], ...updates },
    });
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
      {CP_CONFIG.map(cp => {
        const cpEvidence = evidence[cp.id];
        const isValidated = cpEvidence?.validated || false;
        const isEditing = editingCp === cp.id;
        const colorMap = {
          blue: { ring: 'ring-blue-300', bg: 'bg-blue-500', bgLight: 'bg-blue-500/10', text: 'text-blue-600' },
          purple: { ring: 'ring-purple-300', bg: 'bg-purple-500', bgLight: 'bg-purple-500/10', text: 'text-purple-600' },
          emerald: { ring: 'ring-emerald-300', bg: 'bg-emerald-500', bgLight: 'bg-emerald-500/10', text: 'text-emerald-600' },
        }[cp.color];

        return (
          <div key={cp.id} className="px-4 py-3">
            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <button
                onClick={() => toggleValidated(cp.id)}
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                  isValidated
                    ? `${colorMap.bg} border-transparent`
                    : 'border-zinc-300 bg-white hover:border-zinc-400'
                }`}
              >
                {isValidated && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-white">
                    <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${isValidated ? colorMap.text : 'text-zinc-500'}`}>
                    {cp.label}
                  </span>
                  {isValidated && cpEvidence?.validated_date && (
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${colorMap.bgLight} ${colorMap.text}`}>
                      ✓ {cpEvidence.validated_date}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">{cp.question}</p>

                {/* Evidence fields */}
                {isValidated && (
                  <div className="mt-2 space-y-1.5">
                    <input
                      value={cpEvidence?.evidence || ''}
                      onChange={e => updateEvidence(cp.id, { evidence: e.target.value })}
                      placeholder="What did they say/do that confirmed this?"
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none"
                    />
                    {stakeholderNames.length > 0 && (
                      <select
                        value={cpEvidence?.validated_by || ''}
                        onChange={e => updateEvidence(cp.id, { validated_by: e.target.value })}
                        className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-700 focus:border-zinc-300 focus:outline-none"
                      >
                        <option value="">Confirmed by...</option>
                        {stakeholderNames.map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
