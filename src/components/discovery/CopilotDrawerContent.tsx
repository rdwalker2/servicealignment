import { Check, X, HelpCircle, ShieldCheck, MessageSquare, DollarSign, CalendarDays, Wand2, Copy, Mail, Eye, Clock, Activity, BookOpen, ChevronDown, Zap, CheckSquare, Wrench, Send, CheckCircle2, AlertTriangle, Database, Star as StarIcon } from 'lucide-react';
import { BAP_QUESTIONS, computeBAPAnswers, getCheckpointScore, type DiscoverySession, type BAPAnswer } from '../../lib/discoveryDatabase';
import { generateFollowUpSequence, type FollowUpEmail } from '../../lib/followUpSequence';
import { computeDealHealth } from '../../lib/dealHealth';
import { DEMO_AREAS } from './FeatureWalkthrough';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { EmailGenerator } from '../../lib/intelligence/EmailGenerator';
import { copyToClipboard } from '../../lib/shareableRoom';
import { EngagementTracker, type RoomEngagementData } from '../../lib/EngagementTracker';
import { COMPETITOR_TALK_TRACKS } from '../../data/competitorTalkTracks';
import { useToast } from '../ui/Toast';

import { CONTEXTUAL_DISCOVERY_QUESTIONS, POWER_QUESTIONS } from './copilotQuestions';
import { DATA_ARSENAL } from './dataArsenal';

// ── Deal-Kill Warning Flags ──

interface DealKillFlag {
  id: string;
  severity: 'critical' | 'warning';
  label: string;
  reason: string;
  fix: string;
}

function computeDealKillFlags(session: DiscoverySession): DealKillFlag[] {
  const flags: DealKillFlag[] = [];
  // Use computeBAPAnswers to get the merged (auto + manual) effective answers
  const answers = computeBAPAnswers(session);

  // Determine effective checkpoint level from BAP scores
  const c1Score = getCheckpointScore(answers, 1);
  const c2Score = getCheckpointScore(answers, 2);
  const checkpoint = c1Score >= 5 ? (c2Score >= 5 ? 2 : 1) : 0;

  // CRITICAL: No pain quantified after checkpoint 1
  if (checkpoint >= 1 && !answers['q1']) {
    flags.push({
      id: 'no-pain-quantified',
      severity: 'critical',
      label: 'Pain not quantified',
      reason: 'Q1 (Quantified Pain) is unanswered. You cannot advance past CP1 without a number on the pain.',
      fix: 'Ask: "If you had to put a dollar figure on what this costs you — in time, missed hires, and agency spend — what would you say?"'
    });
  }

  // CRITICAL: No decision maker identified
  if (checkpoint >= 1 && !answers['q2']) {
    flags.push({
      id: 'no-dm',
      severity: 'critical',
      label: 'Decision maker unknown',
      reason: 'Q2 (Stakeholder Map) is unanswered. Deals without a mapped decision maker close at <20%.',
      fix: 'Ask: "Who else in the organization feels this problem — and who ultimately signs off on a decision like this?"'
    });
  }

  // CRITICAL: No budget confirmed at CP2
  if (checkpoint >= 2 && !answers['q8']) {
    flags.push({
      id: 'no-budget',
      severity: 'critical',
      label: 'Budget unconfirmed',
      reason: 'Q8 (Budget) is unanswered. Do not send a proposal without budget confirmation.',
      fix: 'Ask: "Have you set aside budget for a solution like this, or is this coming from a discretionary pool?"'
    });
  }

  // WARNING: No urgency / cost of indecision
  if (!answers['q3']) {
    flags.push({
      id: 'no-urgency',
      severity: 'warning',
      label: 'Cost of inaction unclear',
      reason: 'Q3 (Cost of Indecision) is unanswered. Without urgency, deals stall.',
      fix: 'Ask: "What happens to the business if this stays exactly as it is for the next 12 months?"'
    });
  }

  // WARNING: No champion — only executive sponsor (CHRO persona without stakeholder mapped)
  if (session.persona === 'chro' && !answers['q2']) {
    flags.push({
      id: 'no-champion',
      severity: 'warning',
      label: 'Champion not identified',
      reason: 'CHRO-only deals without a TA champion have high stall risk — the champion drives internal momentum.',
      fix: 'Ask: "Who on your team would own the day-to-day relationship with us — and are they in the loop on this conversation?"'
    });
  }

  // WARNING: Reactive buyer — Q5 explicitly set to 'no' (nothing tried)
  if (answers['q5'] === 'no') {
    flags.push({
      id: 'reactive-buyer',
      severity: 'warning',
      label: 'Reactive buyer pattern',
      reason: 'Prospect has not proactively tried to solve this. May not have urgency to act now.',
      fix: 'Ask: "Is there a specific event — a hiring plan, a board mandate, a renewal — that\'s driving you to solve this now rather than later?"'
    });
  }

  // WARNING: No priority confirmation
  if (checkpoint >= 1 && !answers['q4']) {
    flags.push({
      id: 'not-top-priority',
      severity: 'warning',
      label: 'Priority level unknown',
      reason: 'Q4 (Priority) is unanswered. If this isn\'t in their top 3, it will get deprioritized.',
      fix: 'Ask: "Is solving this in your top 3 priorities right now, or is there something above it on the list?"'
    });
  }

  return flags;
}

interface Props {
  session: DiscoverySession;
  onChange: (updatedSession: DiscoverySession) => void;
  prospectToken?: string; // when set, live engagement data is loaded from localStorage
}

// Gap Test questions that support free-text notes
const NOTE_QUESTIONS = new Set(['q5', 'q6', 'q7']);

export function CopilotDrawerContent({ session, onChange, prospectToken }: Props) {
  const { effectiveUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'coach' | 'bap' | 'macro-roi' | 'tools'>('coach');
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  const [ttOpenDiscovery, setTtOpenDiscovery] = useState(false);
  const [ttOpenObjections, setTtOpenObjections] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [emailCopied, setEmailCopied] = useState(false);
  const [engagement, setEngagement] = useState<RoomEngagementData | null>(null);
  const [followUpSequence, setFollowUpSequence] = useState<FollowUpEmail[] | null>(null);
  const [expandedEmail, setExpandedEmail] = useState<number | null>(null);
  const [quickLog, setQuickLog] = useState({ pain: false, budget: false, timeline: false, champion: false, nextStep: false });
  const [agencyChecklist, setAgencyChecklist] = useState<Record<string, boolean>>({
    spend: false,
    volume: false,
    owner: false,
    adoption: false,
    timeline: false,
  });

  // Poll engagement data every 10s if prospectToken is provided
  useEffect(() => {
    if (!prospectToken) return;
    const load = () => setEngagement(EngagementTracker.readEngagement(prospectToken));
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [prospectToken]);

  // Initialise quick log from session answers
  useEffect(() => {
    const answers = computeBAPAnswers(session) as Record<string, unknown>;
    setQuickLog({
      pain: !!answers['q1'],
      budget: !!answers['q8'],
      timeline: !!answers['q9'],
      champion: !!answers['q2'],
      nextStep: !!session.next_action,
    });
  }, [session.id]);

  const handleGenerateEmail = async () => {
    setIsGenerating(true);
    setGeneratedEmail('');
    const repName = effectiveUser?.full_name?.split(' ')[0] || 'Service Alignment';
    try {
      const email = await EmailGenerator.generateFollowUp(session, repName);
      setGeneratedEmail(email);
      toast('Email generated', 'success');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyEmail = async () => {
    if (generatedEmail) {
      await copyToClipboard(generatedEmail);
      setEmailCopied(true);
      toast('Copied!', 'success');
      setTimeout(() => setEmailCopied(false), 2000);
    }
  };
  
  // BAP answers are now auto-computed — no manual handler needed

  const handleNoteChange = (id: string, text: string) => {
    onChange({
      ...session,
      bap_notes: { ...session.bap_notes, [id]: text }
    });
  };

  const handleAlignmentChange = (key: keyof typeof session.alignment_checks) => {
    onChange({
      ...session,
      alignment_checks: {
        ...session.alignment_checks,
        [key]: !session.alignment_checks[key]
      }
    });
  };

  const handleOverrideToggle = (pillarId: string) => {
    const current = session.overridden_pillars || [];
    const updated = current.includes(pillarId)
      ? current.filter(id => id !== pillarId)
      : [...current, pillarId];
    onChange({ ...session, overridden_pillars: updated });
  };

  return (
    <div className="p-5 text-sm">
      {/* Tab Navigation */}
      <div className="flex gap-1 bg-stone-900 rounded-xl p-1 mb-5 sticky top-0 z-10">
        {(['coach', 'bap', 'macro-roi', 'tools'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
 activeTab === tab ? 'bg-stone-700 text-stone-100' : 'text-stone-500 hover:text-stone-300'
 }`}
          >
            {tab === 'coach' && <Zap size={11} />}
            {tab === 'bap' && <CheckSquare size={11} />}
            {tab === 'macro-roi' && <DollarSign size={11} />}
            {tab === 'tools' && <Wrench size={11} />}
            {tab === 'coach' ? 'Coach' : tab === 'bap' ? 'BAP' : tab === 'macro-roi' ? 'Macro ROI' : 'Tools'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {/* ─── COACH TAB ─── */}
        {activeTab === 'coach' && (
          <>
            {/* ─── LIVE COMPETITIVE TALK TRACKS ─── */}
            {(() => {
              const ats = session.current_ats?.toLowerCase();
              if (!ats || ats === 'none' || ats === 'other') return null;
              const track = COMPETITOR_TALK_TRACKS[ats];
              if (!track) return null;
              return (
                <section className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                  {/* Header */}
                  <div className="mb-3 flex items-center gap-2">
                    <div className="p-1.5 bg-amber-100 rounded-md text-amber-600">
                      <BookOpen size={14} />
                    </div>
                    <h3 className="text-sm font-bold tracking-tight text-amber-900">Talk Tracks — {ats.charAt(0).toUpperCase() + ats.slice(1)}</h3>
                  </div>

                  {/* Displacement angle */}
                  <p className="text-xs font-bold text-amber-800 mb-3 leading-snug">{track.displacementAngle}</p>

                  {/* Discovery Questions accordion */}
                  <div className="mb-2 rounded-lg border border-amber-200 overflow-hidden">
                    <button
                      onClick={() => setTtOpenDiscovery(v => !v)}
                      className="w-full flex items-center justify-between px-3 py-2.5 bg-white/70 hover:bg-white/90 transition-colors text-left"
                    >
                      <span className="text-xs font-semibold text-amber-800">Discovery Questions</span>
                      <ChevronDown
                        size={14}
                        className={`text-amber-500 transition-transform duration-200 ${ttOpenDiscovery ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {ttOpenDiscovery && (
                      <ol className="px-4 py-3 space-y-2 bg-white/50 list-decimal list-inside">
                        {track.discoveryQuestions.map((q, i) => (
                          <li key={i} className="text-[11px] text-amber-900 leading-snug">{q}</li>
                        ))}
                      </ol>
                    )}
                  </div>

                  {/* Objection Handling accordion */}
                  <div className="mb-3 rounded-lg border border-amber-200 overflow-hidden">
                    <button
                      onClick={() => setTtOpenObjections(v => !v)}
                      className="w-full flex items-center justify-between px-3 py-2.5 bg-white/70 hover:bg-white/90 transition-colors text-left"
                    >
                      <span className="text-xs font-semibold text-amber-800">Objection Handling</span>
                      <ChevronDown
                        size={14}
                        className={`text-amber-500 transition-transform duration-200 ${ttOpenObjections ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {ttOpenObjections && (
                      <div className="divide-y divide-amber-100 bg-white/50">
                        {track.objections.map((obj, i) => (
                          <div key={i} className="px-4 py-3 space-y-1.5">
                            <p className="text-[11px] font-bold text-rose-700 leading-snug">❝ {obj.objection}</p>
                            <p className="text-[11px] text-amber-900 leading-snug">{obj.rebuttal}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Name drop */}
                  <p className="text-[10px] text-amber-700 italic border-l-2 border-amber-300 pl-2.5 leading-relaxed">{track.nameDrop}</p>
                </section>
              );
            })()}

            {/* ─── CONTEXTUAL DISCOVERY QUESTIONS ─── */}
            {(() => {
              const persona = session.persona;
              const useCase = session.use_case;
              if (!persona || persona === 'all') return null;

              const personaQuestions = CONTEXTUAL_DISCOVERY_QUESTIONS[persona];
              if (!personaQuestions) return null;

              // Prefer use-case specific questions, fall back to default
              const questions = (useCase && personaQuestions[useCase])
                ? personaQuestions[useCase]
                : personaQuestions.default;
              if (!questions || questions.length === 0) return null;

              const personaLabels: Record<string, string> = {
                'dir-eb': 'Dir. Employer Brand',
                'vp-ta': 'VP of TA',
                'chro': 'CHRO',
                'hiring-manager': 'Hiring Manager',
                'cfo': 'CFO / Finance',
                'recruiter': 'Recruiter',
              };

              return (
                <section className="p-4 bg-gradient-to-br from-sky-950/40 to-cyan-950/30 rounded-xl border border-sky-800/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-sky-500/10 border border-sky-500/20 rounded-md text-sky-400">
                      <HelpCircle size={13} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold tracking-tight text-sky-300">Discovery Questions</h3>
                      <p className="text-[10px] text-sky-500/70">{personaLabels[persona] || persona}{useCase && personaQuestions[useCase] ? ` · ${useCase.replace(/-/g, ' ')}` : ''}</p>
                    </div>
                  </div>
                  <ol className="space-y-2">
                    {questions.map((q, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-[9px] font-bold text-sky-400">{i + 1}</span>
                        <div className="flex-1 flex items-start justify-between gap-1">
                          <p className="text-[11px] text-sky-100/80 leading-snug">{q}</p>
                          <button
                            onClick={async () => { await navigator.clipboard.writeText(q); toast('Copied!', 'success'); }}
                            className="shrink-0 p-1 rounded text-sky-600 hover:text-sky-400 transition-colors"
                          >
                            <Copy size={10} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              );
            })()}

            {/* ─── DATA ARSENAL ─── */}
            {(() => {
              // Gather stats relevant to the session's selected pains
              const pains = session.selected_pains || [];
              const relevantStats: { stat: string; source: string; painId: string }[] = [];
              const seenStats = new Set<string>();
              pains.forEach(painId => {
                const entries = DATA_ARSENAL[painId];
                if (entries) {
                  entries.forEach(e => {
                    if (!seenStats.has(e.stat)) {
                      seenStats.add(e.stat);
                      relevantStats.push({ ...e, painId });
                    }
                  });
                }
              });
              if (relevantStats.length === 0) return null;

              return (
                <section className="p-4 bg-gradient-to-br from-emerald-950/40 to-teal-950/30 rounded-xl border border-emerald-800/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-400">
                      <Database size={13} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold tracking-tight text-emerald-300">Data Arsenal</h3>
                      <p className="text-[10px] text-emerald-500/70">{relevantStats.length} stats matched to selected pains</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {relevantStats.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 group">
                        <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[9px] font-bold text-emerald-400">{i + 1}</span>
                        <div className="flex-1 flex items-start justify-between gap-1">
                          <div>
                            <p className="text-[11px] text-emerald-100/90 leading-snug font-medium">{s.stat}</p>
                            <p className="text-[9px] text-emerald-500/60 mt-0.5">{s.source}</p>
                          </div>
                          <button
                            onClick={async () => { await navigator.clipboard.writeText(s.stat); toast('Stat copied!', 'success'); }}
                            className="shrink-0 p-1 rounded text-emerald-600 hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Copy size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })()}

            {/* ─── POWER QUESTIONS ─── */}
            <section className="p-4 bg-gradient-to-br from-violet-950/40 to-purple-950/30 rounded-xl border border-violet-800/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-violet-500/10 border border-violet-500/20 rounded-md text-violet-400">
                  <StarIcon size={13} />
                </div>
                <div>
                  <h3 className="text-xs font-bold tracking-tight text-violet-300">Power Questions</h3>
                  <p className="text-[10px] text-violet-500/70">Battle-tested questions that advance deals</p>
                </div>
              </div>
              <div className="space-y-2">
                {POWER_QUESTIONS.map((pq, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold text-violet-300">{pq.label}</span>
                      <button
                        onClick={async () => { await navigator.clipboard.writeText(pq.question); toast('Copied!', 'success'); }}
                        className="shrink-0 p-1 rounded text-violet-600 hover:text-violet-400 transition-colors"
                      >
                        <Copy size={10} />
                      </button>
                    </div>
                    <p className="text-[11px] text-violet-100/80 leading-snug mb-1.5">&ldquo;{pq.question}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] text-violet-500/60">When: {pq.when}</span>
                      <span className="text-[9px] text-violet-400/50">→ {pq.advances}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ─── DEAL HEALTH ─── */}
            {(() => {
              const health = computeDealHealth(session);
              const statusConfig = {
                healthy:  { label: 'Healthy',  emoji: '🟢', bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                at_risk:  { label: 'At Risk',  emoji: '🟡', bar: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 border-amber-200' },
                critical: { label: 'Critical', emoji: '🔴', bar: 'bg-rose-500',    badge: 'bg-rose-50 text-rose-700 border-rose-200' },
              }[health.status];
              const nudgeBorder = {
                error:   'border-l-rose-500 bg-rose-50 text-rose-800',
                warning: 'border-l-amber-400 bg-amber-50 text-amber-800',
                info:    'border-l-sky-400 bg-sky-50 text-sky-800',
              };
              return (
                <section>
                  <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-2">
                    <div className="flex items-center gap-2">
                      <Activity size={14} className="text-stone-500" />
                      <h3 className="text-sm font-bold tracking-tight text-stone-900">Deal Health</h3>
                      {health.isStale && (
                        <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-600 border border-rose-200">
                          Stale Deal
                        </span>
                      )}
                    </div>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusConfig.badge}`}>
                      {statusConfig.emoji} {statusConfig.label}
                    </span>
                  </div>

                  {/* Score bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-stone-400 font-medium">BAP Score</span>
                      <span className="text-xs font-bold text-stone-700">{health.score}/100</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${statusConfig.bar}`}
                        style={{ width: `${health.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Nudges */}
                  {health.nudges.length > 0 && (
                    <div className="space-y-2">
                      {health.nudges.map((nudge, i) => (
                        <div
                          key={i}
                          className={`flex items-start gap-2 px-3 py-2.5 rounded-md border-l-4 text-[11px] leading-snug font-medium ${nudgeBorder[nudge.severity]}`}
                        >
                          <span className="shrink-0 mt-px">
                            {nudge.severity === 'error' ? '🚨' : nudge.severity === 'warning' ? '⚠️' : 'ℹ️'}
                          </span>
                          <span>{nudge.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })()}

            {/* ─── DEAL HEALTH DIAGNOSTICS ─── */}
            {(() => {
              const flags = computeDealKillFlags(session);
              if (flags.length === 0) {
                return (
                  <section className="p-4 bg-emerald-950/30 rounded-xl border border-emerald-800/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-300 tracking-tight">Deal Health Diagnostics</span>
                      <span className="ml-auto text-[10px] text-emerald-500/70">No critical flags</span>
                    </div>
                  </section>
                );
              }

              const criticals = flags.filter(f => f.severity === 'critical');
              const warnings = flags.filter(f => f.severity === 'warning');

              return (
                <section className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <AlertTriangle size={13} className="text-rose-400" />
                    <span className="text-xs font-bold text-stone-300 tracking-tight">Deal Health Diagnostics</span>
                    {criticals.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold">{criticals.length} critical</span>
                    )}
                    {warnings.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">{warnings.length} warning</span>
                    )}
                  </div>

                  {flags.map(flag => (
                    <div
                      key={flag.id}
                      className={`p-3 rounded-xl border ${
 flag.severity === 'critical'
 ? 'bg-rose-950/40 border-rose-800/40'
 : 'bg-amber-950/30 border-amber-800/30'
 }`}
                    >
                      <div className="flex items-start gap-2 mb-1.5">
                        <span className="text-base leading-none mt-0.5">{flag.severity === 'critical' ? '☠️' : '⚠️'}</span>
                        <div className="flex-1">
                          <p className={`text-xs font-bold mb-0.5 ${
 flag.severity === 'critical' ? 'text-rose-300' : 'text-amber-300'
 }`}>{flag.label}</p>
                          <p className="text-[11px] text-stone-400 leading-snug mb-2">{flag.reason}</p>
                          <div className={`rounded-lg px-2.5 py-1.5 ${
 flag.severity === 'critical' ? 'bg-rose-900/30' : 'bg-amber-900/20'
 }`}>
                            <p className={`text-[11px] leading-snug italic ${
 flag.severity === 'critical' ? 'text-rose-200/80' : 'text-amber-200/70'
 }`}>{flag.fix}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              );
            })()}
          </>
        )}

        {/* ─── BAP TAB ─── */}
        {activeTab === 'bap' && (
          <>
            {/* Next Best Question — Stage-Aware */}
            {(() => {
              const answers = computeBAPAnswers(session);
              const unanswered = BAP_QUESTIONS.filter(q => !answers[q.id as keyof typeof answers]);

              if (unanswered.length === 0) return (
                <div className="mb-3 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-300">All questions answered — push for Blueprint approval</span>
                </div>
              );

              // Stage-aware prioritization: D3+ → CP3 first, D2 → CP2 first, D1 → CP1 first
              const stage = session.deal_stage;
              let priorityOrder: number[];
              if (stage === 'negotiating' || stage === 'contracting' || stage === 'signing') {
                priorityOrder = [3, 2, 1]; // CP3 first for demo/decision stage
              } else if (stage === 'evaluating') {
                priorityOrder = [2, 1, 3]; // CP2 first for evaluating stage
              } else {
                priorityOrder = [1, 2, 3]; // CP1 first for discovery stage (default)
              }

              // Pick the first unanswered question in priority order
              let nextQ = null;
              for (const cp of priorityOrder) {
                nextQ = unanswered.find(q => q.checkpoint === cp);
                if (nextQ) break;
              }
              if (!nextQ) nextQ = unanswered[0]; // fallback

              const cpLabel = nextQ.checkpoint === 1 ? 'Urgency Test' : nextQ.checkpoint === 2 ? 'Gap Test' : 'Best Solution';
              const cpColor = nextQ.checkpoint === 1 ? 'text-rose-400' : nextQ.checkpoint === 2 ? 'text-amber-400' : 'text-emerald-400';

              // Open objections warning
              const openObjCount = (session.objections ?? []).filter(o => o.status === 'open').length;

              return (
                <>
                  <div className="mb-4 rounded-xl border-2 border-stone-300/30 bg-gradient-to-br from-pink-950/50 to-rose-950/40 p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-stone-900 animate-pulse" />
                      <span className="text-[10px] font-bold text-stone-800">Ask This Now</span>
                      <span className={`ml-auto text-[9px] font-bold ${cpColor}`}>
                        CP{nextQ.checkpoint}: {cpLabel}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-stone-100 leading-snug mb-2">&ldquo;{nextQ.question}&rdquo;</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-stone-500">{unanswered.length} question{unanswered.length !== 1 ? 's' : ''} remaining</span>
                      <button
                        onClick={async () => { await navigator.clipboard.writeText(nextQ!.question); toast('Question copied!', 'success'); }}
                        className="flex items-center gap-1 text-[10px] text-stone-400 hover:text-stone-200 transition-colors"
                      >
                        <Copy size={10} /> Copy
                      </button>
                    </div>
                  </div>
                  {openObjCount > 0 && (
                    <div className="mb-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2">
                      <AlertTriangle size={12} className="text-amber-500 shrink-0" />
                      <span className="text-[11px] font-semibold text-amber-800">
                        {openObjCount} open objection{openObjCount !== 1 ? 's' : ''} — address before trial close
                      </span>
                    </div>
                  )}
                </>
              );
            })()}

            {/* ─── DEMO INTEL (Reactions + Objections Summary) ─── */}
            {(session.demo_reactions || (session.objections?.length ?? 0) > 0) && (
              <section className="mb-4">
                <div className="mb-2 flex items-center justify-between border-b border-stone-200 pb-1.5">
                  <h3 className="text-[11px] font-bold tracking-tight text-stone-700">Demo Intel</h3>
                  <Eye size={12} className="text-stone-400" />
                </div>
                <div className="space-y-2">
                  {/* Aha Moment */}
                  {session.demo_reactions?.aha_moment && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Zap size={10} className="text-amber-500" />
                        <span className="text-[9px] font-bold text-amber-600">Aha Moment</span>
                      </div>
                      <p className="text-[11px] text-amber-800 italic leading-relaxed">
                        &ldquo;{session.demo_reactions.aha_moment}&rdquo;
                      </p>
                    </div>
                  )}
                  {/* Reactions Summary Row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {(session.demo_reactions?.positive_reactions?.length ?? 0) > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
                        ✓ {session.demo_reactions!.positive_reactions.length} positive
                      </span>
                    )}
                    {(session.demo_reactions?.concerns?.length ?? 0) > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700">
                        ⚠ {session.demo_reactions!.concerns.length} concern{session.demo_reactions!.concerns.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {(session.objections?.length ?? 0) > 0 && (() => {
                      const total = session.objections!.length;
                      const handled = session.objections!.filter(o => o.status === 'resolved' || o.status === 'handled').length;
                      const open = total - handled;
                      return (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-bold ${
 open === 0
 ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
 : 'bg-rose-50 border-rose-200 text-rose-700'
 }`}>
                          🛡 {handled}/{total} objections handled
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </section>
            )}

            {/* ─── BUYER'S ACTION PLAN (Auto-Derived Scorecard) ─── */}
            <section>
              <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-2">
                <h3 className="text-sm font-bold tracking-tight text-stone-900">BAP Score</h3>
                <span className="text-[10px] text-stone-400 font-medium">Auto-derived from discovery</span>
              </div>

              <div className="space-y-6">
                {[1, 2, 3].map((checkpoint) => {
                  const qs = BAP_QUESTIONS.filter(q => q.checkpoint === checkpoint);
                  const cpLabel = checkpoint === 1 ? 'Urgency Test' : checkpoint === 2 ? 'Gap Test' : 'Best Solution';
                  const computedAnswers = computeBAPAnswers(session);
                  return (
                    <div key={`cp-${checkpoint}`} className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-xs font-bold text-stone-500">Checkpoint {checkpoint}</div>
                        <span className="text-[10px] font-semibold text-stone-800/70 bg-stone-900/5 px-1.5 py-0.5 rounded">{cpLabel}</span>
                      </div>
                      {qs.map((q) => {
                        const ans = computedAnswers[q.id];
                        const hasNote = NOTE_QUESTIONS.has(q.id);
                        const noteText = session.bap_notes?.[q.id] || '';
                        const isNoteExpanded = expandedNote === q.id;

                        const badgeConfig = ans === 'yes'
                          ? { bg: 'bg-emerald-500', border: 'border-emerald-600', text: 'text-white', label: 'YES' }
                          : ans === 'maybe'
                            ? { bg: 'bg-amber-500', border: 'border-amber-600', text: 'text-white', label: 'MAYBE' }
                            : ans === 'no'
                              ? { bg: 'bg-rose-500', border: 'border-rose-600', text: 'text-white', label: 'NO' }
                              : { bg: 'bg-stone-100', border: 'border-stone-200', text: 'text-stone-400', label: '—' };

                        return (
                          <div key={q.id} className="flex flex-col gap-1.5 p-3 rounded-lg border border-stone-200 bg-white transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-stone-800">{q.title}</span>
                                {hasNote && (
                                  <button
                                    onClick={() => setExpandedNote(isNoteExpanded ? null : q.id)}
                                    className={`p-0.5 rounded transition-colors ${noteText ? 'text-sky-500' : 'text-stone-300 hover:text-stone-500'}`}
                                    title="Add discovery notes"
                                  >
                                    <MessageSquare size={11} />
                                  </button>
                                )}
                              </div>
                              <span
                                className={`px-2.5 py-1 rounded-md border text-[10px] font-bold ${badgeConfig.bg} ${badgeConfig.border} ${badgeConfig.text}`}
                              >
                                {badgeConfig.label}
                              </span>
                            </div>
                            <p className="text-[10px] text-stone-500 leading-tight">{q.question}</p>
                            
                            {/* Expandable note field for Gap Test questions */}
                            {hasNote && isNoteExpanded && (
                              <div className="mt-1">
                                <textarea
                                  value={noteText}
                                  onChange={(e) => handleNoteChange(q.id, e.target.value)}
                                  placeholder="Capture what the prospect said…"
                                  rows={3}
                                  className="w-full text-[11px] text-stone-700 bg-sky-50 border border-sky-200 rounded-md px-2.5 py-2 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-sky-400 resize-none leading-relaxed"
                                />
                              </div>
                            )}
                            {/* Show note preview when collapsed */}
                            {hasNote && !isNoteExpanded && noteText && (
                              <button
                                onClick={() => setExpandedNote(q.id)}
                                className="text-[10px] text-sky-600 bg-sky-50 rounded px-2 py-1 text-left truncate hover:bg-sky-100 transition-colors"
                              >
                                📝 {noteText.slice(0, 60)}{noteText.length > 60 ? '…' : ''}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ─── ALIGNMENT CHECKS ─── */}
            <section>
              <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-2">
                <h3 className="text-sm font-bold tracking-tight text-stone-900">Alignment Checks</h3>
                <ShieldCheck size={14} className="text-stone-400" />
              </div>
              
              <div className="space-y-2">
                {[
                  { key: 'urgent_priority', label: 'Urgent Priority?' },
                  { key: 'resources_insufficient', label: 'Resources Insufficient?' },
                  { key: 'problems_solutions', label: 'Aligned on Problems/Solutions?' },
                  { key: 'roi_sufficient', label: 'ROI Sufficient?' },
                  { key: 'right_solution', label: 'Are we the right solution?' }
                ].map(({ key, label }) => {
                  const checked = session.alignment_checks[key as keyof typeof session.alignment_checks];
                  return (
                    <button
                      key={key}
                      onClick={() => handleAlignmentChange(key as keyof typeof session.alignment_checks)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs font-semibold transition-colors ${
 checked 
 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
 : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300'
 }`}
                    >
                      {label}
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${checked ? 'bg-emerald-500 border-emerald-600' : 'bg-stone-100 border-stone-300'}`}>
                        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* ─── MACRO ROI TAB ─── */}
        {activeTab === 'macro-roi' && (
          <section className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-emerald-950/40 to-teal-950/30 rounded-xl border border-emerald-800/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-400">
                  <DollarSign size={13} />
                </div>
                <div>
                  <h3 className="text-xs font-bold tracking-tight text-emerald-300">Macro ROI & Cost Consolidation</h3>
                  <p className="text-[10px] text-emerald-500/70">Talking points for the C-Suite</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <h4 className="text-[11px] font-bold text-emerald-300 mb-1">Agency Displacement</h4>
                  <p className="text-[10px] text-emerald-100/80 mb-2 leading-relaxed">
                    External agencies charge 15-20% of first-year salary. If Service Alignment helps bring even 2 roles in-house per quarter (saving ~$30K total), the platform pays for itself instantly.
                  </p>
                  <p className="text-[11px] text-emerald-400 italic font-medium">"Are you actively tracking what you spend on headhunters today?"</p>
                </div>

                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <h4 className="text-[11px] font-bold text-emerald-300 mb-1">The Sourcing Tax (LinkedIn)</h4>
                  <p className="text-[10px] text-emerald-100/80 mb-2 leading-relaxed">
                    Most companies pay for expensive LinkedIn Recruiter seats year-round even during hiring freezes. Service Alignment's 'Connect' builds a free talent pool that replaces this dependency.
                  </p>
                  <p className="text-[11px] text-emerald-400 italic font-medium">"How much of your budget is tied up in job board subscriptions?"</p>
                </div>

                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <h4 className="text-[11px] font-bold text-emerald-300 mb-1">Compliance & Visibility</h4>
                  <p className="text-[10px] text-emerald-100/80 mb-2 leading-relaxed">
                    Spreadsheet recruiting creates major GDPR and bias risks. The C-Suite needs a command center that provides automated retention policies and structured scorecards for high-stakes roles.
                  </p>
                  <p className="text-[11px] text-emerald-400 italic font-medium">"If the board asked for your diversity funnel metrics tomorrow, could you pull them?"</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─── TOOLS TAB ─── */}
        {activeTab === 'tools' && (
          <>
            {/* ─── FOLLOW-UP SEQUENCE GENERATOR ─── */}
            <div className="rounded-xl border border-violet-800/40 bg-gradient-to-br from-violet-950/40 to-indigo-950/40 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
                  <Send size={12} className="text-violet-400" />
                </div>
                <span className="text-xs font-bold text-violet-300">Follow-Up Sequence</span>
              </div>

              {!followUpSequence ? (
                <button
                  onClick={() => setFollowUpSequence(generateFollowUpSequence(session, session.company_name))}
                  className="w-full py-2.5 rounded-xl bg-violet-600/20 border border-violet-600/30 text-violet-300 text-xs font-semibold hover:bg-violet-600/30 transition-colors"
                >
                  Generate 3-Touch Sequence →
                </button>
              ) : (
                <div className="space-y-2">
                  {followUpSequence.map((email, idx) => {
                    const isExpanded = expandedEmail === idx;
                    const dayBadgeColors = [
                      'bg-violet-500/20 text-violet-300 border-violet-500/30',
                      'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
                      'bg-purple-500/20 text-purple-300 border-purple-500/30',
                    ];
                    const dayLabel = email.day === 0 ? 'Day 0' : `Day +${email.day}`;
                    const bodyPreview = email.body.replace(/\n/g, ' ').slice(0, 80);

                    return (
                      <div
                        key={idx}
                        className="rounded-lg border border-white/10 bg-white/5 overflow-hidden"
                      >
                        {/* Card header — always visible */}
                        <button
                          onClick={() => setExpandedEmail(isExpanded ? null : idx)}
                          className="w-full text-left px-3 py-2.5 flex items-start gap-2.5 hover:bg-white/5 transition-colors"
                        >
                          <span
                            className={`mt-0.5 shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border ${dayBadgeColors[idx]}`}
                          >
                            {dayLabel}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-semibold text-violet-400/80 mb-0.5">{email.purpose}</p>
                            <p className="text-xs font-bold text-white/90 leading-tight truncate">{email.subject}</p>
                            {!isExpanded && (
                              <p className="text-[10px] text-white/40 mt-1 leading-snug">
                                {bodyPreview}{email.body.replace(/\n/g, ' ').length > 80 ? '…' : ''}
                              </p>
                            )}
                          </div>
                          <ChevronDown
                            size={13}
                            className={`shrink-0 mt-1 text-violet-400/60 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {/* Expanded body */}
                        {isExpanded && (
                          <div className="px-3 pb-3 space-y-2">
                            <pre className="text-[11px] text-white/70 whitespace-pre-wrap leading-relaxed font-sans bg-black/20 rounded-lg px-3 py-2.5 max-h-52 overflow-y-auto">
                              {email.body}
                            </pre>
                            <p className="text-[10px] text-violet-300/70 italic leading-snug">
                              CTA: {email.cta}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  await navigator.clipboard.writeText(email.subject);
                                  toast('Subject copied!', 'success');
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-violet-600/20 border border-violet-600/30 text-violet-300 text-[11px] font-semibold hover:bg-violet-600/30 transition-colors"
                              >
                                <Copy size={11} /> Copy Subject
                              </button>
                              <button
                                onClick={async () => {
                                  await navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`);
                                  toast('Email copied!', 'success');
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-violet-600/20 border border-violet-600/30 text-violet-300 text-[11px] font-semibold hover:bg-violet-600/30 transition-colors"
                              >
                                <Copy size={11} /> Copy Email
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Regenerate */}
                  <button
                    onClick={() => {
                      setFollowUpSequence(generateFollowUpSequence(session, session.company_name));
                      setExpandedEmail(null);
                    }}
                    className="w-full py-1.5 rounded-lg text-[10px] font-semibold text-violet-500 hover:text-violet-300 transition-colors"
                  >
                    ↺ Regenerate
                  </button>
                </div>
              )}
            </div>

            {/* ─── AI FOLLOW-UP EMAIL ─── */}
            <section className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 rounded-md text-indigo-600">
                    <Mail size={14} />
                  </div>
                  <h3 className="text-sm font-bold tracking-tight text-indigo-900">AI Follow-Up</h3>
                </div>
                <button
                  onClick={handleGenerateEmail}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-70"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Drafting...</span>
                  ) : (
                    <><Wand2 size={12} /> Draft Email</>
                  )}
                </button>
              </div>
              
              {generatedEmail && (
                <div className="mt-3 relative">
                  <textarea
                    value={generatedEmail}
                    onChange={(e) => setGeneratedEmail(e.target.value)}
                    className="w-full h-56 text-[11px] text-stone-700 bg-white border border-indigo-200 rounded-lg p-3 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-y leading-relaxed shadow-inner"
                  />
                  <button
                    onClick={handleCopyEmail}
                    className={`absolute top-2 right-2 p-1.5 rounded-md border text-[10px] font-bold transition-colors ${emailCopied ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                  >
                    {emailCopied ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              )}
            </section>

            {/* ─── PROSPECT ENGAGEMENT ─── */}
            {engagement && Object.keys(engagement.sections).length > 0 && (
              <section className="p-4 bg-gradient-to-br from-sky-50 to-cyan-50 rounded-xl border border-sky-100">
                <div className="mb-3 flex items-center justify-between border-b border-sky-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Eye size={13} className="text-sky-500" />
                    <h3 className="text-sm font-bold tracking-tight text-sky-900">Prospect Engagement</h3>
                  </div>
                  <span className="text-[10px] text-sky-400">Last seen: {new Date(engagement.lastActiveAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="mb-3 text-[10px] text-sky-600">{engagement.company} has visited these sections:</p>
                <div className="space-y-1.5">
                  {EngagementTracker.topSections(engagement).map(sec => (
                    <div key={sec.sectionId} className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-stone-700">{sec.label}</span>
                      <div className="flex items-center gap-1.5">
                        <Clock size={10} className="text-sky-400" />
                        <span className="text-[10px] font-bold text-sky-600">{EngagementTracker.formatTime(sec.totalSeconds)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ─── AGENCY-TO-IN-HOUSE TRANSITION CHECKLIST WIDGET ─── */}
            <section className="p-4 bg-gradient-to-br from-indigo-950/40 to-purple-950/30 rounded-xl border border-indigo-850/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-indigo-400">
                  <CheckSquare size={13} />
                </div>
                <div>
                  <h3 className="text-xs font-bold tracking-tight text-indigo-300">Agency displacement checklist</h3>
                  <p className="text-[10px] text-indigo-500/70">Verify key deal milestones for agency displacement</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { key: 'spend', label: 'Quantified annual agency spend?' },
                  { key: 'volume', label: 'Mapped hiring volume (next 12 months)?' },
                  { key: 'owner', label: 'Confirmed career site editor & IT dependencies?' },
                  { key: 'adoption', label: 'Addressed hiring manager adoption risks?' },
                  { key: 'timeline', label: 'Aligned on migration timeline (63-day benchmark)?' },
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => setAgencyChecklist(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
 agencyChecklist[item.key]
 ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-200'
 : 'bg-white/5 border-white/10 text-stone-400 hover:bg-white/10'
 }`}
                  >
                    <span>{item.label}</span>
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${
 agencyChecklist[item.key] ? 'bg-indigo-500 border-indigo-600' : 'bg-transparent border-white/20'
 }`}>
                      {agencyChecklist[item.key] && <Check size={10} className="text-white" strokeWidth={3} />}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* ─── BUDGET & TIMELINE ─── */}
            <section>
              <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-2">
                <h3 className="text-sm font-bold tracking-tight text-stone-900">Budget & Timeline</h3>
              </div>
              <div className="space-y-3">
                {/* Budget Confirmed */}
                <button
                  onClick={() => onChange({ ...session, budget_confirmed: !session.budget_confirmed })}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs font-semibold transition-colors ${
 session.budget_confirmed 
 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
 : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300'
 }`}
                >
                  <div className="flex items-center gap-2">
                    <DollarSign size={13} />
                    Budget Allocated?
                  </div>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${session.budget_confirmed ? 'bg-emerald-500 border-emerald-600' : 'bg-stone-100 border-stone-300'}`}>
                    {session.budget_confirmed && <Check size={10} className="text-white" strokeWidth={3} />}
                  </div>
                </button>

                {/* Implementation Timeline */}
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-stone-200 bg-white">
                  <CalendarDays size={13} className="text-stone-400 shrink-0" />
                  <input
                    type="text"
                    value={session.implementation_timeline || ''}
                    onChange={(e) => onChange({ ...session, implementation_timeline: e.target.value || null })}
                    placeholder="e.g. 30 days, Q3 2026, ASAP…"
                    className="flex-1 text-xs text-stone-700 placeholder:text-stone-400 focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            </section>

            {/* ─── FEATURE OVERRIDES ─── */}
            <section>
              <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-2">
                <h3 className="text-sm font-bold tracking-tight text-stone-900">Walkthrough Overrides</h3>
                <span className="text-[10px] text-stone-400 font-medium">Force Pillars</span>
              </div>
              <p className="text-[11px] text-stone-500 mb-3">Select pillars to force them to appear in the D3 Demo Walkthrough regardless of chosen pains.</p>
              
              <div className="flex flex-wrap gap-2">
                {DEMO_AREAS.map(area => {
                  const isSelected = session.overridden_pillars?.includes(area.id);
                  const Icon = area.icon;
                  return (
                    <button
                      key={area.id}
                      onClick={() => handleOverrideToggle(area.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[11px] font-semibold transition-all ${
 isSelected 
 ? 'bg-stone-900/10 border-stone-300 text-stone-800' 
 : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
 }`}
                    >
                      <Icon size={12} />
                      {area.title}
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>

      {/* ─── Quick Log Strip ─── */}
      <div className="sticky bottom-0 left-0 right-0 bg-stone-950/95 backdrop-blur border-t border-stone-800 px-3 py-2.5 -mx-5 mt-6">
        <p className="text-[9px] font-bold text-stone-600 mb-2">Quick Log</p>
        <div className="flex gap-1.5">
          {([
            { key: 'pain' as const, label: 'Pain', icon: '🎯' },
            { key: 'budget' as const, label: 'Budget', icon: '💰' },
            { key: 'timeline' as const, label: 'Timeline', icon: '📅' },
            { key: 'champion' as const, label: 'Champion', icon: '🤝' },
            { key: 'nextStep' as const, label: 'Next Step', icon: '✅' },
          ]).map(({ key, label, icon }) => {
            const checked = quickLog[key];
            return (
              <button
                key={key}
                onClick={() => {
                  setQuickLog(prev => ({ ...prev, [key]: !prev[key] }));
                  if (!checked) toast(`${label} logged!`, 'success');
                }}
                className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg border text-[10px] font-semibold transition-all ${
 checked
 ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
 : 'bg-stone-800/60 border-stone-700/50 text-stone-500 hover:border-stone-600 hover:text-stone-400'
 }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
                {checked && <span className="text-[8px] text-emerald-500">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
