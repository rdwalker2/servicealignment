// ════════════════════════════════════════════════════════════════
// Question rendering components extracted from RepWorkspace.tsx
// QuestionCard, StakeholderQuestion, ScaleSlider, QuestionCardRenderer
// ════════════════════════════════════════════════════════════════

import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check, X, HelpCircle, Lightbulb,
} from 'lucide-react';
import type { DiscoveryQuestion } from '../../data/personaSheets';
import { ATS_COACHING_OVERRIDES, HRIS_COACHING_OVERRIDES } from '../../data/personaSheets';
import type { Stakeholder, StakeholderSentiment } from '../../lib/discoveryDatabase';
import { StakeholderSentimentBadge } from './StakeholderSentimentBadge';
import { EXPANDED_ROLES } from './repWorkspaceConstants';

// ════════════════════════════════════════════════════════════════
// Single question card — handles open / select / checkbox types
// ════════════════════════════════════════════════════════════════

export function QuestionCard({
  q, answer, onAnswer, phaseColor, selectedATS, answers,
}: {
  q: DiscoveryQuestion;
  answer: string | string[] | undefined;
  onAnswer: (id: string, val: string | string[]) => void;
  phaseColor: string;
  selectedATS?: string | null;
  answers?: Record<string, any>;
}) {
  const [coachOpen, setCoachOpen] = useState(false);
  const hasAnswer = Array.isArray(answer) ? answer.length > 0 : (!!answer && answer !== '');

  const handleSelect = (val: string) => onAnswer(q.id, val);
  const handleCheckbox = (val: string) => {
    const current = Array.isArray(answer) ? answer : [];
    const next = current.includes(val) ? current.filter(v => v !== val) : [...current, val];
    onAnswer(q.id, next);
  };
  const handleOpen = (val: string) => onAnswer(q.id, val);

  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${
      hasAnswer ? 'border-stone-200 bg-white' : 'border-stone-100 bg-stone-50/50 hover:border-stone-200 hover:bg-white'
    }`}>
      {/* Question header */}
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Status dot */}
        <div className={`w-4 h-4 rounded-full shrink-0 mt-0.5 flex items-center justify-center border-2 transition-all ${
          hasAnswer ? '' : 'border-stone-300 bg-transparent'
        }`} style={hasAnswer ? { backgroundColor: phaseColor, borderColor: phaseColor } : {}}>
          {hasAnswer && <Check size={8} className="text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-stone-800 leading-snug">{q.question}</p>
        </div>
        {/* Coaching toggle */}
        {q.coaching && (
          <button onClick={() => setCoachOpen(!coachOpen)} title={coachOpen || !hasAnswer ? 'Hide coaching' : 'Show coaching tip'}
            className={`shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-colors ${coachOpen || !hasAnswer ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-400 hover:text-amber-500'}`}>
            <HelpCircle size={11} />
          </button>
        )}
      </div>

      {/* Always-visible 1-line coaching hint */}
      {q.coaching && hasAnswer && !coachOpen && (
        <div className="px-4 -mt-1 mb-1">
          <p className="text-[9px] text-stone-400 italic leading-snug truncate">
            💡 {q.coaching.split(/[.!?]/)[0].trim()}
          </p>
        </div>
      )}

      {/* Coaching note — auto-shows on unanswered questions */}
      <AnimatePresence>
        {(coachOpen || !hasAnswer) && q.coaching && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
            <div className="mx-4 mb-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
              <p className="text-[10px] font-bold text-amber-700 mb-0.5 flex items-center gap-1"><span>💡</span> Coaching</p>
              <p className="text-[10px] text-amber-800 leading-relaxed whitespace-pre-line">{q.coaching}</p>
              {(() => {
                const atsOverride = selectedATS && ATS_COACHING_OVERRIDES[selectedATS]?.[q.id];
                if (!atsOverride) return null;
                return (
                  <div className="mt-2 rounded-lg bg-blue-50 border border-blue-200 p-2">
                    <p className="text-[11px] text-blue-800 leading-relaxed font-medium">{atsOverride}</p>
                  </div>
                );
              })()}
              {(() => {
                const hrisAnswer = (answers as any)?.['js2'];
                const hrisOverride = hrisAnswer && HRIS_COACHING_OVERRIDES[hrisAnswer]?.[q.id];
                if (!hrisOverride) return null;
                return (
                  <div className="mt-2 rounded-lg bg-purple-50 border border-purple-200 p-2">
                    <p className="text-[11px] text-purple-800 leading-relaxed font-medium">{hrisOverride}</p>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Answer area */}
      <div className="px-4 pb-4">
        {q.type === 'open' && (
          <textarea
            value={(answer as string) || ''}
            onChange={e => handleOpen(e.target.value)}
            placeholder={{
              'jk1': 'How do they get notified? → Screening? → Scheduling? → Offer?',
              'jk2': 'Manual screening? Scheduling back-and-forth? Chasing hiring managers?',
              'jk4': 'Their #1 frustration — this becomes your demo centerpiece',
              'q4b': '$ cost per quarter, agency spend, time lost to unfilled roles…',
              'q8b': 'Their 12-18 month vision — this is your proposal\'s opening paragraph',
            }[q.id] ?? 'Type your notes here…'}
            rows={2}
            className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-700 resize-none focus:outline-none focus:border-stone-400 focus:bg-white transition-colors placeholder:text-stone-300"
          />
        )}

        {q.type === 'select' && q.options && (
          <div className="flex flex-wrap gap-1.5">
            {q.options.map(opt => {
              const isSelected = answer === opt;
              return (
                <button key={opt} onClick={() => handleSelect(isSelected ? '' : opt)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                    isSelected
                      ? 'text-white border-transparent shadow-sm'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                  style={isSelected ? { backgroundColor: phaseColor, borderColor: phaseColor } : {}}>
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {q.type === 'checkbox' && q.options && (
          <div className="flex flex-wrap gap-1.5">
            {q.options.map(opt => {
              const checked = Array.isArray(answer) && answer.includes(opt);
              return (
                <button key={opt} onClick={() => handleCheckbox(opt)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                    checked
                      ? 'text-white border-transparent shadow-sm'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                  style={checked ? { backgroundColor: phaseColor, borderColor: phaseColor } : {}}>
                  {checked && <Check size={9} className="shrink-0" />}
                  {opt}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Stakeholder capture — replaces q2 checkbox
// ════════════════════════════════════════════════════════════════

export function StakeholderQuestion({
  question, stakeholders, phaseColor, onUpdate, sentimentMap, onSentimentChange,
}: {
  question: string;
  stakeholders: Stakeholder[];
  phaseColor: string;
  onUpdate: (updated: Stakeholder[]) => void;
  sentimentMap?: Record<string, StakeholderSentiment>;
  onSentimentChange?: (stakeholderId: string, sentiment: StakeholderSentiment) => void;
}) {
  const [role, setRole] = useState(EXPANDED_ROLES[0]);
  const [name, setName] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  const add = () => {
    if (!name.trim()) return;
    const newS: Stakeholder = { id: crypto.randomUUID(), role, name: name.trim(), title: role };
    onUpdate([...stakeholders, newS]);
    setName('');
    setRole(EXPANDED_ROLES[0]);
    nameRef.current?.focus();
  };

  const remove = (id: string) => onUpdate(stakeholders.filter(s => s.id !== id));

  return (
    <div className="space-y-3">
      {/* Existing stakeholders */}
      <div className="flex flex-wrap gap-2">
        {stakeholders.map(s => (
          <div key={s.id} className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2">
            <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full text-white`} style={{ backgroundColor: phaseColor }}>{s.role}</span>
            <span className="flex-1 text-[11px] font-bold text-stone-800">{s.name}</span>
            {onSentimentChange && (
              <StakeholderSentimentBadge
                stakeholderId={s.id}
                sentiment={sentimentMap?.[s.id]}
                onChange={onSentimentChange}
                compact
              />
            )}
            <button onClick={() => remove(s.id)} className="shrink-0 w-4 h-4 flex items-center justify-center rounded text-stone-300 hover:text-rose-500 transition-colors">
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Add row */}
      <div className="flex items-center gap-2">
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="shrink-0 rounded-xl border-2 border-stone-200 bg-white px-3 py-2 text-[11px] font-bold text-stone-700 focus:outline-none focus:border-stone-400 transition-colors cursor-pointer"
        >
          {EXPANDED_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <input
          ref={nameRef}
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Person's name…"
          className="flex-1 rounded-xl border-2 border-stone-200 bg-white px-3 py-2 text-[11px] font-bold text-stone-700 focus:outline-none focus:border-stone-400 transition-colors placeholder:text-stone-300"
        />
        <button
          onClick={add}
          disabled={!name.trim()}
          className="shrink-0 px-4 py-2 rounded-xl text-[11px] font-bold transition-all bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ADD
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Trial Close slider
// ════════════════════════════════════════════════════════════════

export function ScaleSlider({
  question, value, inverted = false, calloutText, onUpdate,
}: {
  question: string;
  value: number;        // 0 = unset, 1–10
  inverted?: boolean;   // true = low score is good (q8c)
  calloutText: string;
  onUpdate: (score: number) => void;
}) {
  const s = value;
  const color = inverted
    ? (s >= 8 ? '#ef4444' : s >= 4 ? '#f59e0b' : s >= 1 ? '#10b981' : '#a1a1aa')
    : (s >= 8 ? '#10b981' : s >= 5 ? '#f59e0b' : s >= 1 ? '#ef4444' : '#a1a1aa');

  const label = inverted
    ? (s >= 8  ? 'Walk-away signal' : s >= 4 ? 'Struggle without help' : s >= 1 ? 'Cannot solve alone' : 'Not yet answered')
    : (s >= 8  ? 'Critical urgency' : s >= 5 ? 'Important priority' : s >= 1 ? 'Low urgency' : 'Not yet answered');

  return (
    <div className="space-y-4">
      {/* Score + label */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-black tabular-nums transition-all" style={{ color: s > 0 ? color : '#d4d4d8' }}>
            {s > 0 ? s : '—'}
          </span>
          <span className="text-[11px] font-bold text-stone-400">/ 10</span>
        </div>
        <span className="text-[10px] font-bold px-3 py-1 rounded-full border" style={{ color, backgroundColor: color + '10', borderColor: color + '30' }}>
          {label}
        </span>
      </div>

      <input
        type="range" min="1" max="10"
        value={s || 5}
        onChange={(e) => onUpdate(parseInt(e.target.value))}
        className="w-full"
        style={{ accentColor: color }}
      />
      <div className="flex justify-between text-[9px] font-bold text-stone-400">
        <span>1 ({inverted ? 'Good' : 'Low'})</span>
        <span>10 ({inverted ? 'Bad' : 'High'})</span>
      </div>
      
      {s > 0 && (
        <div className="rounded-lg bg-stone-50 border border-stone-100 p-3 mt-2 flex items-start gap-2">
          <Lightbulb size={12} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] font-medium text-stone-600 leading-relaxed">{calloutText}</p>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// QuestionCard inline generic renderer
// ════════════════════════════════════════════════════════════════

export function QuestionCardRenderer({
  q, answer, onAnswer, phaseColor, selectedATS,
}: {
  q: DiscoveryQuestion;
  answer: any;
  onAnswer: (id: string, value: any) => void;
  phaseColor: string;
  selectedATS: string | null;
}) {
  const isCustom = !!answer && typeof answer === 'string' && q.options && !q.options.includes(answer);

  return (
    <div className="space-y-3">
      {q.type === 'select' && q.options && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {q.options.map((opt) => {
              const isSelected = answer === opt;
              return (
                <button
                  key={opt}
                  onClick={() => onAnswer(q.id, isSelected ? '' : opt)}
                  className={`text-[11px] px-3 py-2 rounded-xl border-2 font-bold transition-all ${
                    isSelected
                      ? `text-white border-transparent shadow-sm`
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  }`}
                  style={isSelected ? { backgroundColor: phaseColor } : {}}
                >
                  {opt}
                </button>
              );
            })}
            <button
              onClick={() => { if (!isCustom) onAnswer(q.id, ' '); }}
              className={`text-[11px] px-3 py-2 rounded-xl border-2 font-bold transition-all flex items-center gap-1 ${
                isCustom
                  ? `text-white border-transparent shadow-sm`
                  : 'border-dashed border-stone-300 bg-transparent text-stone-400 hover:border-stone-400 hover:text-stone-600'
              }`}
              style={isCustom ? { backgroundColor: phaseColor } : {}}
            >
              + Other
            </button>
          </div>
          {isCustom && (
            <input
              type="text"
              value={(answer as string).trim()}
              onChange={(e) => onAnswer(q.id, e.target.value)}
              placeholder="Type custom answer…"
              autoFocus
              className="w-full text-[12px] text-stone-800 bg-white border-2 border-stone-200 rounded-xl px-4 py-3 mt-2 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 font-medium"
            />
          )}
        </div>
      )}

      {q.type === 'checkbox' && q.options && (() => {
        const selected = Array.isArray(answer) ? answer : [];
        const customEntries = selected.filter(v => !q.options!.includes(v) && v.trim());
        return (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => {
                const isChecked = selected.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      const next = isChecked ? selected.filter(o => o !== opt) : [...selected, opt];
                      onAnswer(q.id, next);
                    }}
                    className={`text-[11px] px-3 py-2 rounded-xl border-2 font-bold transition-all flex items-center gap-2 ${
                      isChecked
                        ? `text-white border-transparent shadow-sm`
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                    }`}
                    style={isChecked ? { backgroundColor: phaseColor } : {}}
                  >
                    <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded ${isChecked ? 'bg-white' : 'border-2 border-stone-300 bg-white'}`} style={isChecked ? { color: phaseColor } : {}}>
                      {isChecked && <Check size={10} strokeWidth={4} />}
                    </div>
                    {opt}
                  </button>
                );
              })}
              {customEntries.map((custom) => (
                <button
                  key={custom}
                  onClick={() => {
                    onAnswer(q.id, selected.filter(o => o !== custom));
                  }}
                  className="text-[11px] px-3 py-2 rounded-xl border-2 font-bold transition-all flex items-center gap-2 text-white border-transparent shadow-sm"
                  style={{ backgroundColor: phaseColor }}
                >
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-white" style={{ color: phaseColor }}>
                    <Check size={10} strokeWidth={4} />
                  </div>
                  {custom}
                  <X size={12} className="ml-1 opacity-60 hover:opacity-100" />
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="+ Type and hit Enter to add other…"
              className="w-full text-[12px] text-stone-800 bg-transparent border-b-2 border-dashed border-stone-300 py-2 px-1 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 font-medium transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val && !selected.includes(val)) {
                    onAnswer(q.id, [...selected, val]);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
            />
          </div>
        );
      })()}

      {q.type === 'open' && (
        <textarea
          value={(answer as string) ?? ''}
          onChange={(e) => onAnswer(q.id, e.target.value)}
          placeholder="Capture their answer…"
          rows={3}
          className="w-full text-[13px] text-stone-800 bg-white border-2 border-stone-200 rounded-xl px-4 py-3 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 resize-none leading-relaxed font-medium transition-all"
        />
      )}

      {q.type === 'number' && (
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={(answer as string) ?? ''}
            onChange={(e) => onAnswer(q.id, e.target.value)}
            placeholder="0"
            min={0}
            className="w-32 text-[15px] font-bold text-stone-900 bg-white border-2 border-stone-200 rounded-xl px-4 py-3 placeholder:text-stone-400 focus:outline-none transition-all text-center tabular-nums"
            style={{ borderColor: answer ? phaseColor : undefined }}
          />
          {(q as any).numberUnit && (
            <span className="text-[12px] font-medium text-stone-500">{(q as any).numberUnit}</span>
          )}
        </div>
      )}
    </div>
  );
}
