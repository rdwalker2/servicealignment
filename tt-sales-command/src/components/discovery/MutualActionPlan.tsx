import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle2, Circle, Calendar, User, ChevronRight, Sparkles, Check, ClipboardCheck } from 'lucide-react';

import type { DiscoverySession, MAPMilestone } from '../../lib/discoveryDatabase';

interface MutualActionPlanProps {
  session: DiscoverySession;
  themeColor: string;
  onChange?: (map: MAPMilestone[]) => void;
  onContractReadinessChange?: (data: Record<string, string>) => void;
  hideHeader?: boolean;
}

const CONTRACT_FIELDS = [
  { id: 'legal-entity', label: 'Legal Entity Name', hint: 'As it appears on official documents' },
  { id: 'company-address', label: 'Registered Company Address' },
  { id: 'invoice-email', label: 'Invoice Email Address' },
  { id: 'reg-number', label: 'Companies House / Registration Number' },
  { id: 'signer-name', label: 'Primary Contract Signer — Full Name' },
  { id: 'signer-title', label: 'Primary Contract Signer — Job Title' },
  { id: 'signer-email', label: 'Primary Contract Signer — Email Address' },
  { id: 'contract-visibility', label: 'Anyone Else Needing Contract Visibility', hint: 'Legal, procurement, or finance contacts' },
] as const;

const DEFAULT_MILESTONES: MAPMilestone[] = [
  { id: '1', label: 'Intro Call', owner: '', dueDate: '', done: false },
  { id: '2', label: 'Tailored Demo', owner: 'Teamtailor', dueDate: '', done: false },
  { id: '3', label: 'Business Case Review', owner: '', dueDate: '', done: false },
  { id: '4', label: 'Commercial Proposal', owner: 'Teamtailor', dueDate: '', done: false },
  { id: '5', label: 'Contract Sign Off', owner: '', dueDate: '', done: false },
  { id: '6', label: 'Onboarding', owner: 'Teamtailor', dueDate: '', done: false },
];

const STEPPER_LABELS = ['Intro Call', 'Demo', 'Business Case', 'Proposal', 'Contract', 'Onboarding'];

export function MutualActionPlan({ session, themeColor, onChange, onContractReadinessChange, hideHeader }: MutualActionPlanProps) {
  const [localMilestones, setLocalMilestones] = useState<MAPMilestone[]>(() =>
    session.mutual_action_plan || DEFAULT_MILESTONES.map(m => ({ ...m, owner: m.owner || session.company_name }))
  );

  const [contractData, setContractData] = useState<Record<string, string>>(() =>
    session.contract_readiness ?? {}
  );

  const milestones = session.mutual_action_plan || localMilestones;

  const contractFilledCount = CONTRACT_FIELDS.filter(f => (contractData[f.id] ?? '').trim().length > 0).length;
  const contractProgress = Math.round((contractFilledCount / CONTRACT_FIELDS.length) * 100);

  const updateContractField = (fieldId: string, value: string) => {
    const next = { ...contractData, [fieldId]: value };
    setContractData(next);
    onContractReadinessChange?.(next);
  };

  const completedCount = milestones.filter(m => m.done).length;
  const progress = Math.round((completedCount / milestones.length) * 100);

  const update = (id: string, field: keyof MAPMilestone, value: string | boolean) => {
    const next = milestones.map(m => m.id === id ? { ...m, [field]: value } : m);
    setLocalMilestones(next);
    onChange?.(next);
  };

  const addMilestone = () => {
    const next = [...milestones, {
      id: Math.random().toString(36).substr(2, 6),
      label: '',
      owner: '',
      dueDate: '',
      done: false,
    }];
    setLocalMilestones(next);
    onChange?.(next);
  };

  const removeMilestone = (id: string) => {
    const next = milestones.filter(m => m.id !== id);
    setLocalMilestones(next);
    onChange?.(next);
  };

  return (
    <div className="w-full">
      {/* Header */}
      {!hideHeader && (
        <div className="mb-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
            style={{ borderColor: `${themeColor}30`, backgroundColor: `${themeColor}08` }}
          >
            <Sparkles size={13} style={{ color: themeColor }} />
            <span className="text-xs font-bold" style={{ color: themeColor }}>Mutual Action Plan</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-3 text-3xl font-bold tracking-tight text-stone-900"
          >
            Our Path to Go-Live
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mx-auto max-w-xl text-stone-500"
          >
            A shared checklist for {session.company_name} and Teamtailor to reach launch day together. Edit any step, add owners, and set target dates.
          </motion.p>
        </div>
      )}

      {/* ── Horizontal Stepper Roadmap ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="mb-10 overflow-x-auto"
      >
        <div className="flex items-center justify-between min-w-[560px] px-2">
          {STEPPER_LABELS.map((label, i) => {
            const milestone = milestones[i];
            const isDone = milestone?.done ?? false;
            // "In-progress" = first uncompleted step
            const firstIncompleteIdx = milestones.findIndex(m => !m.done);
            const isInProgress = !isDone && i === firstIncompleteIdx;

            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                {/* Node */}
                <div className="flex flex-col items-center">
                  <motion.div
                    className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors"
                    style={{
                      borderColor: isDone ? '#10b981' : isInProgress ? themeColor : '#d4d4d8',
                      backgroundColor: isDone ? '#10b981' : 'transparent',
                    }}
                    animate={
                      isInProgress
                        ? { boxShadow: [`0 0 0 0px ${themeColor}40`, `0 0 0 8px ${themeColor}00`] }
                        : {}
                    }
                    transition={
                      isInProgress
                        ? { duration: 1.5, repeat: Infinity, ease: 'easeOut' }
                        : {}
                    }
                  >
                    {isDone ? (
                      <Check size={16} className="text-white" strokeWidth={3} />
                    ) : (
                      <span
                        className="text-xs font-bold"
                        style={{ color: isInProgress ? themeColor : '#a1a1aa' }}
                      >
                        {i + 1}
                      </span>
                    )}
                  </motion.div>
                  <span
                    className={`mt-2 text-[11px] font-semibold text-center leading-tight w-20 ${
 isDone ? 'text-emerald-600' : isInProgress ? 'text-stone-900' : 'text-stone-400'
 }`}
                  >
                    {label}
                  </span>
                </div>

                {/* Connector line (not after last item) */}
                {i < STEPPER_LABELS.length - 1 && (
                  <div className="flex-1 mx-1 h-0.5 rounded-full overflow-hidden bg-stone-200 relative">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ backgroundColor: '#10b981' }}
                      initial={{ width: '0%' }}
                      animate={{ width: isDone ? '100%' : '0%' }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8 flex items-center gap-4"
      >
        <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: themeColor }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-bold text-stone-500 shrink-0">
          {completedCount} / {milestones.length} complete
        </span>
      </motion.div>

      {/* Milestone List */}
      <div className="space-y-3 mb-6">
        <AnimatePresence>
          {milestones.map((m, i) => (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`group relative flex items-start gap-4 rounded-2xl border p-4 transition-all ${
 m.done
 ? 'border-emerald-200 bg-emerald-50/50'
 : 'border-stone-200 bg-white hover:border-stone-300 hover:'
 }`}
            >
              {/* Step number + check */}
              <button
                onClick={() => update(m.id, 'done', !m.done)}
                className="mt-0.5 shrink-0 transition-transform hover:scale-110"
              >
                {m.done
                  ? <CheckCircle2 size={22} className="text-emerald-500" />
                  : <Circle size={22} className="text-stone-300 hover:text-stone-400" />
                }
              </button>

              {/* Step number badge */}
              <div
                className="mt-0.5 shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: m.done ? '#10b981' : themeColor }}
              >
                {i + 1}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={m.label}
                  onChange={e => update(m.id, 'label', e.target.value)}
                  placeholder="Milestone description…"
                  className={`col-span-1 sm:col-span-1 bg-transparent text-sm font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none border-b border-transparent focus:border-stone-300 py-0.5 ${m.done ? 'line-through text-stone-400' : ''}`}
                />
                <div className="flex items-center gap-1.5">
                  <User size={12} className="text-stone-300 shrink-0" />
                  <input
                    type="text"
                    value={m.owner}
                    onChange={e => update(m.id, 'owner', e.target.value)}
                    placeholder="Owner…"
                    className="flex-1 bg-transparent text-xs text-stone-500 placeholder:text-stone-300 focus:outline-none border-b border-transparent focus:border-stone-300 py-0.5"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-stone-300 shrink-0" />
                  <input
                    type="text"
                    value={m.dueDate}
                    onChange={e => update(m.id, 'dueDate', e.target.value)}
                    placeholder="Target date…"
                    className="flex-1 bg-transparent text-xs text-stone-500 placeholder:text-stone-300 focus:outline-none border-b border-transparent focus:border-stone-300 py-0.5"
                  />
                </div>
              </div>

              {/* Arrow connector */}
              {i < milestones.length - 1 && (
                <div className="absolute -bottom-2.5 left-[2.1rem] z-10">
                  <ChevronRight size={12} className="rotate-90 text-stone-300" />
                </div>
              )}

              {/* Delete */}
              <button
                onClick={() => removeMilestone(m.id)}
                className="shrink-0 opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-rose-400 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add milestone */}
      <button
        onClick={addMilestone}
        className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-stone-300 py-3.5 text-sm font-medium text-stone-400 hover:border-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-all"
      >
        <Plus size={16} /> Add Milestone
      </button>

      {/* ── Divider ── */}
      <div className="relative my-10">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-stone-50 px-4 text-xs font-bold text-stone-400">Contract Details</span>
        </div>
      </div>

      {/* ── Contract Readiness Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-stone-200 bg-white overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-stone-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${themeColor}15` }}
              >
                <ClipboardCheck size={18} style={{ color: themeColor }} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">What We Need From You</h3>
                <p className="text-sm text-stone-500">
                  Fill in your contract details so we can get your agreement ready
                </p>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 rounded-full bg-stone-100 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: contractProgress === 100 ? '#10b981' : themeColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${contractProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-sm font-bold text-stone-500 tabular-nums shrink-0">
                {contractFilledCount} / {CONTRACT_FIELDS.length} complete
              </span>
              {contractProgress === 100 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-emerald-500"
                >
                  <Sparkles size={16} />
                </motion.span>
              )}
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="divide-y divide-stone-50">
          {CONTRACT_FIELDS.map((field, i) => {
            const value = contractData[field.id] ?? '';
            const isFilled = value.trim().length > 0;
            return (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-4 px-6 py-3.5 transition-all ${
 isFilled ? 'bg-emerald-50/50' : 'hover:bg-stone-50/80'
 }`}
              >
                {/* Checkmark */}
                <div className="shrink-0">
                  {isFilled ? (
                    <CheckCircle2 size={20} className="text-emerald-500" />
                  ) : (
                    <Circle size={20} className="text-stone-300" />
                  )}
                </div>

                {/* Label + Input */}
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <div className="sm:w-64 shrink-0">
                    <span className={`text-sm font-medium transition-colors ${
 isFilled ? 'text-stone-400' : 'text-stone-700'
 }`}>
                      {field.label}
                    </span>
                    {'hint' in field && field.hint && !isFilled && (
                      <p className="text-xs text-stone-400 mt-0.5">{field.hint}</p>
                    )}
                  </div>
                  <input
                    type="text"
                    value={value}
                    onChange={e => updateContractField(field.id, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}…`}
                    className="flex-1 bg-transparent text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none border-b border-stone-200 focus:border-stone-400 py-1 transition-colors"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Completion celebration */}
        <AnimatePresence>
          {contractProgress === 100 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-t border-emerald-100"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <Sparkles size={14} />
                All details collected — we can prepare your agreement!
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
