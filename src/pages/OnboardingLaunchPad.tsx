// ============================================================
// OnboardingLaunchPad — 90-Day Ramp Tracker
// A premium onboarding experience for new Service Alignment AEs.
// Tracks task completion, phase progress, and manager gates
// with rich animations and localStorage persistence.
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ChevronDown,
  Clock,
  GraduationCap,
  Shield,
  ArrowRight,
  Calendar,
  Target,
  Zap,
  TrendingUp,
  Sparkles,
  Bot,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  ONBOARDING_PROGRAM,
  getTotalTaskCount,
  getAllTaskIds,
} from '../data/onboardingProgram';
import type {
  OnboardingPhase,
  OnboardingModule,
  OnboardingTask,
} from '../data/onboardingProgram';
import AiRolePlayModal from '../components/onboarding/AiRolePlayModal';
import OnboardingTaskDrawer from '../components/onboarding/OnboardingTaskDrawer';

// ── Helper: Format minutes → human-readable ────────────────
function formatMinutes(totalMin: number): string {
  if (totalMin < 60) return `${totalMin}m`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ── Helper: Days since a date ──────────────────────────────
function daysSince(dateStr: string): number {
  const start = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86_400_000));
}

// ════════════════════════════════════════════════════════════
// Progress Ring (SVG)
// ════════════════════════════════════════════════════════════
function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 6,
  color = '#FF2A7F',
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e7e5e4"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
        strokeDasharray={circumference}
      />
    </svg>
  );
}

// ════════════════════════════════════════════════════════════
// Task Checkbox (animated, custom-styled)
// ════════════════════════════════════════════════════════════
function TaskCheckbox({
  checked,
  onChange,
  color,
}: {
  checked: boolean;
  onChange: () => void;
  color: string;
}) {
  return (
    <motion.button
      onClick={onChange}
      whileTap={{ scale: 0.85 }}
      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ${
        checked
          ? 'border-transparent'
          : 'border-stone-300 hover:border-stone-400'
      }`}
      style={checked ? { backgroundColor: color } : {}}
    >
      {checked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          <Check size={12} className="text-white" />
        </motion.div>
      )}
    </motion.button>
  );
}

// ════════════════════════════════════════════════════════════
// Stat Card (top stats row)
// ════════════════════════════════════════════════════════════
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  subValue,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  subValue?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-1 min-w-[140px] bg-white/70 backdrop-blur-sm border border-stone-200/60 rounded-xl p-4 flex flex-col gap-1.5"
    >
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={14} style={{ color }} />
        </div>
        <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-lg font-bold text-stone-800">{value}</p>
      {subValue && <div>{subValue}</div>}
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════
// Mini Progress Bar
// ════════════════════════════════════════════════════════════
function MiniProgressBar({
  progress,
  color,
  height = 4,
}: {
  progress: number;
  color: string;
  height?: number;
}) {
  return (
    <div
      className="w-full rounded-full overflow-hidden bg-stone-100"
      style={{ height }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, progress)}%` }}
        transition={{ type: 'spring', stiffness: 80, damping: 20 }}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Task Row
// ════════════════════════════════════════════════════════════
function TaskRow({
  task,
  isComplete,
  onToggle,
  color,
  index,
  onOpenTask,
}: {
  task: OnboardingTask;
  isComplete: boolean;
  onToggle: () => void;
  color: string;
  index: number;
  onOpenTask: (task: OnboardingTask) => void;
}) {
  const navigate = useNavigate();

  const handleGo = () => {
    onOpenTask(task);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-stone-50/80 ${
        isComplete ? 'opacity-60' : ''
      }`}
    >
      <TaskCheckbox checked={isComplete} onChange={onToggle} color={color} />

      <span
        onClick={handleGo}
        className={`flex-1 text-sm text-stone-700 transition-all cursor-pointer hover:text-indigo-600 ${
          isComplete ? 'line-through text-stone-400' : ''
        }`}
      >
        {task.title}
      </span>

      {task.estimatedMinutes && (
        <span
          className="text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0"
          style={{
            backgroundColor: `${color}10`,
            color: color,
          }}
        >
          {task.estimatedMinutes} min
        </span>
      )}

      {task.route && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGo}
          className="text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          style={{
            backgroundColor: `${color}15`,
            color: color,
          }}
        >
          Go <ArrowRight size={10} />
        </motion.button>
      )}
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════
// Module Section
// ════════════════════════════════════════════════════════════
function ModuleSection({
  module,
  completedIds,
  onToggleTask,
  onOpenTask,
  color,
}: {
  module: OnboardingModule;
  completedIds: Set<string>;
  onToggleTask: (taskId: string) => void;
  onOpenTask: (task: OnboardingTask) => void;
  color: string;
}) {
  const completedCount = module.tasks.filter((t) =>
    completedIds.has(t.id)
  ).length;
  const totalCount = module.tasks.length;

  return (
    <div className="mb-5">
      {/* Module header */}
      <div className="flex items-center gap-3 mb-2 px-3">
        <span className="text-sm font-bold uppercase tracking-wide text-stone-500">
          {module.title}
        </span>
        <span className="text-[10px] font-mono text-stone-400">
          {completedCount}/{totalCount}
        </span>
        <div className="flex-1">
          <MiniProgressBar
            progress={totalCount ? (completedCount / totalCount) * 100 : 0}
            color={color}
            height={3}
          />
        </div>
      </div>
      {module.description && (
        <p className="text-xs text-stone-400 px-3 mb-2">{module.description}</p>
      )}

      {/* Task list */}
      <div className="flex flex-col">
        {module.tasks.map((task, i) => (
          <TaskRow
            key={task.id}
            task={task}
            isComplete={completedIds.has(task.id)}
            onToggle={() => onToggleTask(task.id)}
            onOpenTask={onOpenTask}
            color={color}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Manager Gate Card
// ════════════════════════════════════════════════════════════
function ManagerGateCard({
  gate,
  isComplete,
  onToggle,
  onLaunch,
  color,
}: {
  gate: OnboardingPhase['gate'];
  isComplete: boolean;
  onToggle: () => void;
  onLaunch: () => void;
  color: string;
}) {
  if (!gate) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative mt-4 rounded-xl border-2 border-dashed p-5 transition-colors ${
        isComplete
          ? 'border-emerald-300 bg-emerald-50/60'
          : 'border-stone-300 bg-stone-50/60'
      }`}
    >
      {/* Confetti dots when complete */}
      {isComplete && (
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: ['#FF2A7F', '#10b981', '#f59e0b', '#6366f1', '#06b6d4'][i % 5],
                left: `${8 + Math.random() * 84}%`,
                top: `${8 + Math.random() * 84}%`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 0.8], opacity: [0, 1, 0.6] }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
            />
          ))}
        </div>
      )}

      <div className="flex items-start gap-4 relative z-10">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            isComplete ? 'bg-emerald-500' : 'bg-stone-200'
          }`}
        >
          {isComplete ? (
            <Sparkles size={18} className="text-white" />
          ) : (
            <Shield size={18} className="text-stone-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4
            className={`text-sm font-bold mb-1 ${
              isComplete ? 'text-emerald-700' : 'text-stone-700'
            }`}
          >
            {gate.title}
          </h4>
          <p className="text-xs text-stone-400 leading-relaxed">
            {gate.description}
          </p>
        </div>

        {isComplete ? (
          <TaskCheckbox
            checked={true}
            onChange={onToggle} // allow unchecking if they want
            color="#10b981"
          />
        ) : (
          <button
            onClick={onLaunch}
            className="text-xs font-bold px-4 py-2 rounded-lg text-white shadow-sm hover:scale-105 active:scale-95 transition-transform shrink-0 flex items-center gap-1.5"
            style={{ backgroundColor: color }}
          >
            <Bot size={14} /> Launch AI
          </button>
        )}
      </div>

      <p className="text-[10px] font-medium uppercase tracking-wider mt-3 relative z-10"
        style={{ color: isComplete ? '#10b981' : '#a8a29e' }}
      >
        {isComplete ? '✓ Manager Sign-Off Complete' : '🔒 Manager Sign-Off Required'}
      </p>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════
// Phase Card (expandable timeline card)
// ════════════════════════════════════════════════════════════
function PhaseCard({
  phase,
  phaseIndex,
  isExpanded,
  onToggleExpand,
  completedIds,
  gateCompleted,
  onToggleTask,
  onToggleGate,
  onLaunchGate,
  onOpenTask,
}: {
  phase: OnboardingPhase;
  phaseIndex: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  completedIds: Set<string>;
  gateCompleted: boolean;
  onToggleTask: (taskId: string) => void;
  onToggleGate: () => void;
  onLaunchGate: () => void;
  onOpenTask: (task: OnboardingTask) => void;
}) {
  // Count tasks in this phase
  const phaseTasks = phase.modules.flatMap((m) => m.tasks);
  const phaseCompleted = phaseTasks.filter((t) => completedIds.has(t.id)).length;
  const phaseTotal = phaseTasks.length;
  const phaseProgress = phaseTotal > 0 ? (phaseCompleted / phaseTotal) * 100 : 0;
  const isPhaseComplete = phaseCompleted === phaseTotal && gateCompleted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: phaseIndex * 0.1, duration: 0.4 }}
      className="relative"
    >
      {/* Timeline connector line */}
      {phaseIndex < ONBOARDING_PROGRAM.phases.length - 1 && (
        <div
          className="absolute left-6 top-[72px] w-0.5 bg-gradient-to-b opacity-30"
          style={{
            height: 'calc(100% - 40px)',
            backgroundImage: `linear-gradient(to bottom, ${phase.color}, transparent)`,
          }}
        />
      )}

      {/* Phase header (always visible) */}
      <motion.button
        onClick={onToggleExpand}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.998 }}
        className="w-full text-left"
      >
        <div
          className={`relative rounded-xl border bg-white/80 backdrop-blur-sm overflow-hidden transition-all ${
            isExpanded
              ? 'shadow-lg border-stone-200'
              : 'shadow-sm border-stone-100 hover:shadow-md hover:border-stone-200'
          }`}
        >
          {/* Color accent left border */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
            style={{ backgroundColor: phase.color }}
          />

          {/* Completion overlay */}
          {isPhaseComplete && (
            <div className="absolute right-4 top-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center"
              >
                <Check size={14} className="text-white" />
              </motion.div>
            </div>
          )}

          <div className="px-5 py-4 pl-6">
            <div className="flex items-center gap-3 mb-1.5">
              <span className="text-xl">{phase.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${phase.color}12`,
                      color: phase.color,
                    }}
                  >
                    Phase {phaseIndex + 1}
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium">
                    {phase.timeline}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-stone-800 mt-0.5">
                  {phase.title}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">{phase.subtitle}</p>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={18} className="text-stone-400" />
              </motion.div>
            </div>

            {/* Phase progress bar */}
            <div className="flex items-center gap-3 mt-3">
              <MiniProgressBar progress={phaseProgress} color={phase.color} height={5} />
              <span className="text-[11px] font-semibold text-stone-500 shrink-0">
                {phaseCompleted}/{phaseTotal}
              </span>
            </div>
          </div>
        </div>
      </motion.button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3 pb-2 px-2">
              <div className="bg-white/60 backdrop-blur-sm border border-stone-100 rounded-xl p-4">
                {phase.modules.map((module) => (
                  <ModuleSection
                    key={module.id}
                    module={module}
                    completedIds={completedIds}
                    onToggleTask={onToggleTask}
                    onOpenTask={onOpenTask}
                    color={phase.color}
                  />
                ))}

                {/* Manager gate */}
                {phase.gate && (
                  <ManagerGateCard
                    gate={phase.gate}
                    isComplete={gateCompleted}
                    onToggle={onToggleGate}
                    onLaunch={onLaunchGate}
                    color={phase.color}
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════
export default function OnboardingLaunchPad() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userId = user?.id ?? 'unknown';
  const firstName = user?.full_name?.split(' ')[0] ?? 'there';

  // ── localStorage keys ──
  const progressKey = `onboarding_progress_${userId}`;
  const startDateKey = `onboarding_start_${userId}`;
  const gatesKey = `onboarding_gates_${userId}`;

  // ── State ──
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(progressKey);
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });

  const [completedGates, setCompletedGates] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(gatesKey);
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });

  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
  
  const [activeGate, setActiveGate] = useState<{ gate: OnboardingPhase['gate']; phaseId: string } | null>(null);
  const [selectedTask, setSelectedTask] = useState<OnboardingTask | null>(null);

  const [startDate] = useState<string>(() => {
    const stored = localStorage.getItem(startDateKey);
    if (stored) return stored;
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(startDateKey, today);
    return today;
  });

  // ── Auto-expand first incomplete phase ──
  useEffect(() => {
    const firstIncomplete = ONBOARDING_PROGRAM.phases.findIndex((phase) => {
      const allTasks = phase.modules.flatMap((m) => m.tasks);
      const allDone = allTasks.every((t) => completedIds.has(t.id));
      const gateDone = !phase.gate || completedGates.has(phase.id);
      return !(allDone && gateDone);
    });
    setExpandedPhase(firstIncomplete >= 0 ? firstIncomplete : null);
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Task toggle ──
  const toggleTask = useCallback(
    (taskId: string) => {
      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (next.has(taskId)) {
          next.delete(taskId);
        } else {
          next.add(taskId);
        }
        localStorage.setItem(progressKey, JSON.stringify([...next]));
        return next;
      });
    },
    [progressKey]
  );

  // ── Gate toggle ──
  const toggleGate = useCallback(
    (phaseId: string) => {
      setCompletedGates((prev) => {
        const next = new Set(prev);
        if (next.has(phaseId)) {
          next.delete(phaseId);
        } else {
          next.add(phaseId);
        }
        localStorage.setItem(gatesKey, JSON.stringify([...next]));
        return next;
      });
    },
    [gatesKey]
  );

  // ── Computed stats ──
  const totalTasks = useMemo(() => getTotalTaskCount(), []);
  const completedCount = completedIds.size;
  const overallProgress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const currentPhase = useMemo(() => {
    const idx = ONBOARDING_PROGRAM.phases.findIndex((phase) => {
      const allTasks = phase.modules.flatMap((m) => m.tasks);
      return !allTasks.every((t) => completedIds.has(t.id));
    });
    return idx >= 0 ? ONBOARDING_PROGRAM.phases[idx] : ONBOARDING_PROGRAM.phases[ONBOARDING_PROGRAM.phases.length - 1];
  }, [completedIds]);

  const timeInvested = useMemo(() => {
    let total = 0;
    for (const phase of ONBOARDING_PROGRAM.phases) {
      for (const mod of phase.modules) {
        for (const task of mod.tasks) {
          if (completedIds.has(task.id) && task.estimatedMinutes) {
            total += task.estimatedMinutes;
          }
        }
      }
    }
    return total;
  }, [completedIds]);

  const daysOnRamp = daysSince(startDate);

  // ── Find the Next Actionable Task / Gate ──
  const nextActionInfo = useMemo(() => {
    for (let pIdx = 0; pIdx < ONBOARDING_PROGRAM.phases.length; pIdx++) {
      const phase = ONBOARDING_PROGRAM.phases[pIdx];
      for (const mod of phase.modules) {
        for (const task of mod.tasks) {
          if (!completedIds.has(task.id)) {
            return { type: 'task' as const, phase, task, phaseIndex: pIdx };
          }
        }
      }
      // If all tasks in phase are done, check gate
      if (phase.gate && !completedGates.has(phase.id)) {
        return { type: 'gate' as const, phase, phaseIndex: pIdx };
      }
    }
    return null;
  }, [completedIds, completedGates]);

  // ── Handler for Go / Launch ──
  const handleGoNext = useCallback(() => {
    if (!nextActionInfo) return;
    if (nextActionInfo.type === 'task' && nextActionInfo.task.route) {
      navigate(nextActionInfo.task.route);
    } else if (nextActionInfo.type === 'gate') {
      // Expand the phase so they can click the gate
      setExpandedPhase(nextActionInfo.phaseIndex);
      // scroll to phase
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  }, [nextActionInfo, navigate]);

  // ════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <div className="h-full overflow-y-auto pb-32 bg-gradient-to-br from-stone-50 via-white to-stone-50">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* ── Welcome Header ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-start gap-6 mb-8"
        >
          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap size={22} className="text-pink-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-pink-500">
                90-Day Launch Pad
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-stone-800 leading-tight mb-2">
              Welcome to Service Alignment, {firstName}! 🎓
            </h1>
            <p className="text-sm text-stone-400 leading-relaxed max-w-lg">
              Your 90-Day Launch Pad — everything you need to ramp into a top performer.
            </p>
          </div>

          {/* Progress Ring */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative">
              <ProgressRing progress={overallProgress} size={88} strokeWidth={7} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-extrabold text-stone-800">
                  {overallProgress}%
                </span>
              </div>
            </div>
            <span className="text-[10px] font-medium text-stone-400 mt-1.5">
              {completedCount} of {totalTasks} tasks
            </span>
          </div>
        </motion.div>

        {/* ── Stat Cards Row ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex gap-3 mb-10 flex-wrap"
        >
          <StatCard
            icon={Target}
            label="Tasks Complete"
            value={`${completedCount} / ${totalTasks}`}
            color="#FF2A7F"
            subValue={
              <MiniProgressBar
                progress={overallProgress}
                color="#FF2A7F"
                height={3}
              />
            }
          />
          <StatCard
            icon={Zap}
            label="Current Phase"
            value={`${currentPhase.emoji} ${currentPhase.title}`}
            color={currentPhase.color}
          />
          <StatCard
            icon={Clock}
            label="Time Invested"
            value={formatMinutes(timeInvested)}
            color="#6366f1"
          />
          <StatCard
            icon={Calendar}
            label="Days on Ramp"
            value={`${daysOnRamp}`}
            color="#06b6d4"
          />
        </motion.div>


        {/* ── Phase Timeline ──────────────────────────────── */}
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={16} className="text-stone-400" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-stone-400">
            Your Onboarding Journey
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {ONBOARDING_PROGRAM.phases.map((phase, i) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              phaseIndex={i}
              isExpanded={expandedPhase === i}
              onToggleExpand={() =>
                setExpandedPhase((prev) => (prev === i ? null : i))
              }
              completedIds={completedIds}
              gateCompleted={completedGates.has(phase.id)}
              onToggleTask={toggleTask}
              onToggleGate={() => toggleGate(phase.id)}
              onLaunchGate={() => {
                if (phase.gate) setActiveGate({ gate: phase.gate, phaseId: phase.id });
              }}
              onOpenTask={(task) => setSelectedTask(task)}
            />
          ))}
        </div>

        {/* ── Footer ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-stone-300">
            Built with 💖 for Service Alignment's next top performers
          </p>
        </motion.div>
      </div>

      {/* ── AI Role Play Modal ──────────────────────────── */}
      {activeGate && (
        <AiRolePlayModal
          isOpen={!!activeGate}
          onClose={() => setActiveGate(null)}
          onSuccess={() => {
            if (activeGate) {
              setCompletedGates((prev) => {
                const next = new Set(prev);
                next.add(activeGate.phaseId);
                localStorage.setItem(gatesKey, JSON.stringify([...next]));
                return next;
              });
              setActiveGate(null);
            }
          }}
          gateDetails={activeGate.gate}
        />
      )}

      {/* Task Drawer */}
      <OnboardingTaskDrawer
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onComplete={(taskId) => {
          if (!completedIds.has(taskId)) {
            toggleTask(taskId);
          }
        }}
        isCompleted={selectedTask ? completedIds.has(selectedTask.id) : false}
      />
    </div>
  );
}
