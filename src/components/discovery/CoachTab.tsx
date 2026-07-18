import { useState, useEffect, useMemo } from 'react';
import {
  Eye, EyeOff, ChevronDown, BookOpen, HelpCircle, Copy, Check,
  Wand2, DollarSign, Activity, AlertTriangle, Database,
  Star as StarIcon, Send, Zap, CheckCircle2, CheckSquare, Clock,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Toast';
import { EmailGenerator } from '../../lib/intelligence/EmailGenerator';
import { copyToClipboard } from '../../lib/shareableRoom';
import { EngagementTracker, type RoomEngagementData } from '../../lib/EngagementTracker';
import { COMPETITOR_TALK_TRACKS } from '../../data/competitorTalkTracks';
import { generateFollowUpSequence, type FollowUpEmail } from '../../lib/followUpSequence';
import type { DiscoverySession } from '../../lib/discoveryDatabase';
import { computeDealHealth } from '../../lib/dealHealth';
import { DEMO_AREAS } from './FeatureWalkthrough';
import {
  computeDealKillFlags,
  CONTEXTUAL_DISCOVERY_QUESTIONS,
  POWER_QUESTIONS,
  DATA_ARSENAL,
} from '../../data/controlDrawerData';

function CoachAccordion({ id, title, icon: Icon, statusBadge, children, isOpen, onToggle }: {
  id: string; title: string; icon: any; statusBadge?: React.ReactNode; children: React.ReactNode;
  isOpen: boolean; onToggle: () => void;
}) {
  return (
    <div className="border-b border-stone-100">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-stone-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-stone-800 flex items-center justify-center">
            <Icon size={10} className="text-white" />
          </div>
          <span className="text-[11px] font-bold text-stone-700">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {statusBadge}
          <ChevronDown size={12} className={`text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CoachTab({
  session,
  onSessionChange,
  prospectToken,
  tabFilter = 'all',
}: {
  session: DiscoverySession;
  onSessionChange: (s: DiscoverySession) => void;
  prospectToken?: string;
  tabFilter?: 'all' | 'coach' | 'deal' | 'room';
}) {
  const { effectiveUser } = useAuth();
  const { toast } = useToast();
  const [ttOpenDiscovery, setTtOpenDiscovery] = useState(false);
  const [ttOpenObjections, setTtOpenObjections] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [emailCopied, setEmailCopied] = useState(false);
  const [engagement, setEngagement] = useState<RoomEngagementData | null>(null);
  const [followUpSequence, setFollowUpSequence] = useState<FollowUpEmail[] | null>(null);
  const [expandedEmail, setExpandedEmail] = useState<number | null>(null);
  const [agencyChecklist, setAgencyChecklist] = useState<Record<string, boolean>>({
    spend: false,
    volume: false,
    owner: false,
    adoption: false,
    timeline: false,
  });
  // Item 8: Accordion state — only one section expanded at a time
  const [expandedCoach, setExpandedCoach] = useState<string | null>('talkTracks');

  // Poll engagement data every 10s if prospectToken is provided
  useEffect(() => {
    if (!prospectToken) return;
    const load = () => setEngagement(EngagementTracker.readEngagement(prospectToken));
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [prospectToken]);

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

  const handleOverrideToggle = (pillarId: string) => {
    const current = session.overridden_pillars || [];
    const updated = current.includes(pillarId)
      ? current.filter(id => id !== pillarId)
      : [...current, pillarId];
    onSessionChange({ ...session, overridden_pillars: updated });
  };


  // ── Pre-compute status data for badges ──
  const killFlags = useMemo(() => computeDealKillFlags(session), [session]);
  const health = useMemo(() => computeDealHealth(session), [session]);
  const hasEngagement = engagement && Object.keys(engagement.sections).length > 0;
  const ats = session.current_ats?.toLowerCase();
  const hasTalkTrack = ats && ats !== 'none' && ats !== 'other' && !!COMPETITOR_TALK_TRACKS[ats];

  return (
    <div className="flex flex-col pb-4">
      {/* ─── 1. COMPETITIVE TALK TRACKS ─── */}
      {(tabFilter === 'all' || tabFilter === 'coach') && hasTalkTrack && (() => {
        const track = COMPETITOR_TALK_TRACKS[ats!];
        return (
          <CoachAccordion
            id="talkTracks" isOpen={expandedCoach === 'talkTracks'} onToggle={() => setExpandedCoach(expandedCoach === 'talkTracks' ? null : 'talkTracks')}
            title={`Talk Tracks — ${ats!.charAt(0).toUpperCase() + ats!.slice(1)}`}
            icon={BookOpen}
            statusBadge={
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-600 border border-amber-200">
                {ats!.charAt(0).toUpperCase() + ats!.slice(1)}
              </span>
            }
          >
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
                  {track.discoveryQuestions.map((q: string, i: number) => (
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
                  {track.objections.map((obj: { objection: string; rebuttal: string }, i: number) => (
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
          </CoachAccordion>
        );
      })()}

      {/* ─── 2. CONTEXTUAL DISCOVERY QUESTIONS ─── */}
      {(() => {
        const persona = session.persona;
        const useCase = session.use_case;
        if (!persona || persona === 'all') return null;

        const personaQuestions = CONTEXTUAL_DISCOVERY_QUESTIONS[persona];
        if (!personaQuestions) return null;

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
          <CoachAccordion
            id="contextualQuestions" isOpen={expandedCoach === 'contextualQuestions'} onToggle={() => setExpandedCoach(expandedCoach === 'contextualQuestions' ? null : 'contextualQuestions')}
            title="Discovery Questions"
            icon={HelpCircle}
            statusBadge={
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-sky-100 text-sky-600 border border-sky-200">
                {personaLabels[persona] || persona}
              </span>
            }
          >
            <ol className="space-y-2">
              {questions.map((q, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-[9px] font-bold text-sky-600">{i + 1}</span>
                  <div className="flex-1 flex items-start justify-between gap-1">
                    <p className="text-[11px] text-sky-800 leading-snug">{q}</p>
                    <button
                      onClick={async () => { await navigator.clipboard.writeText(q); toast('Copied!', 'success'); }}
                      className="shrink-0 p-1 rounded text-sky-400 hover:text-sky-600 transition-colors"
                    >
                      <Copy size={10} />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          </CoachAccordion>
        );
      })()}

      {/* ─── 3. DATA ARSENAL ─── */}
      {(() => {
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
          <CoachAccordion
            id="dataArsenal" isOpen={expandedCoach === 'dataArsenal'} onToggle={() => setExpandedCoach(expandedCoach === 'dataArsenal' ? null : 'dataArsenal')}
            title="Data Arsenal"
            icon={Database}
            statusBadge={
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-600 border border-emerald-200">
                {relevantStats.length} stats
              </span>
            }
          >
            <div className="space-y-2">
              {relevantStats.map((s, i) => (
                <div key={i} className="flex items-start gap-2 group">
                  <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-[9px] font-bold text-emerald-600">{i + 1}</span>
                  <div className="flex-1 flex items-start justify-between gap-1">
                    <div>
                      <p className="text-[11px] text-emerald-800 leading-snug font-medium">{s.stat}</p>
                      <p className="text-[9px] text-emerald-500 mt-0.5">{s.source}</p>
                    </div>
                    <button
                      onClick={async () => { await navigator.clipboard.writeText(s.stat); toast('Stat copied!', 'success'); }}
                      className="shrink-0 p-1 rounded text-emerald-400 hover:text-emerald-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Copy size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CoachAccordion>
        );
      })()}

      {/* ─── 4. POWER QUESTIONS ─── */}
      {(tabFilter === 'all' || tabFilter === 'coach') && (
        <CoachAccordion
          id="powerQuestions" isOpen={expandedCoach === 'powerQuestions'} onToggle={() => setExpandedCoach(expandedCoach === 'powerQuestions' ? null : 'powerQuestions')}
          title="Power Questions"
          icon={StarIcon}
          statusBadge={
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-violet-100 text-violet-600 border border-violet-200">
              {POWER_QUESTIONS.length}
            </span>
          }
        >
          <div className="space-y-2">
            {POWER_QUESTIONS.map((pq, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 hover:bg-stone-100 transition-colors">
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold text-violet-700">{pq.label}</span>
                  <button
                    onClick={async () => { await navigator.clipboard.writeText(pq.question); toast('Copied!', 'success'); }}
                    className="shrink-0 p-1 rounded text-violet-400 hover:text-violet-600 transition-colors"
                  >
                    <Copy size={10} />
                  </button>
                </div>
                <p className="text-[11px] text-stone-700 leading-snug mb-1.5">&ldquo;{pq.question}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] text-stone-500">When: {pq.when}</span>
                  <span className="text-[9px] text-stone-400">→ {pq.advances}</span>
                </div>
              </div>
            ))}
          </div>
        </CoachAccordion>
      )}

      {/* ─── 4B. PRICE OBJECTION PLAYBOOK (Trinity) ─── */}
      {(tabFilter === 'all' || tabFilter === 'coach') && (
        <CoachAccordion
          id="pricePlaybook" isOpen={expandedCoach === 'pricePlaybook'} onToggle={() => setExpandedCoach(expandedCoach === 'pricePlaybook' ? null : 'pricePlaybook')}
          title="Price Objection Playbook"
          icon={DollarSign}
          statusBadge={
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-600 border border-amber-200">
              Trinity
            </span>
          }
        >
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
              <span className="text-sm">🔺</span>
              <p className="text-[10px] font-bold text-amber-800">
                Price Objections Trinity — Diagnose which step was missed before discounting
              </p>
            </div>

            {/* Objection 1: Too expensive */}
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3">
              <p className="text-[11px] font-bold text-rose-700 mb-2">❝ "It's too expensive"</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="shrink-0 w-4 h-4 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-[9px] font-bold text-amber-600 mt-0.5">1</span>
                  <p className="text-[10px] text-stone-700 leading-snug">
                    <span className="font-bold">Did you diagnose the bigger problem?</span> If not, go back to D2. They're comparing your price to a simple Provider, not the full platform they need.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="shrink-0 w-4 h-4 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-[9px] font-bold text-amber-600 mt-0.5">2</span>
                  <p className="text-[10px] text-stone-700 leading-snug">
                    <span className="font-bold">Did you anchor ROI?</span> If not, calculate the value stack now. <span className="italic">"Based on what we discussed, the cost of indecision is $X/year. Our solution is a fraction of that."</span>
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="shrink-0 w-4 h-4 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-[9px] font-bold text-amber-600 mt-0.5">3</span>
                  <p className="text-[10px] text-stone-700 leading-snug">
                    <span className="font-bold">Did you ask for budget range?</span> If not, ask now using the ROI multiple: <span className="italic">"What kind of ROI do you typically expect — 3x, 5x?"</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Objection 2: Need to think about it */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
              <p className="text-[11px] font-bold text-amber-700 mb-2">❝ "We need to think about it"</p>
              <p className="text-[10px] text-stone-700 leading-snug mb-1.5">
                This is usually <span className="font-bold">price anxiety disguised as timing</span>. Ask directly:
              </p>
              <p className="text-[10px] italic text-amber-800 leading-snug">
                "Is it the investment that's giving you pause?"
              </p>
              <div className="mt-2 flex gap-2">
                <span className="px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[9px] font-bold text-emerald-700">
                  If yes → Go to ROI anchor
                </span>
                <span className="px-2 py-1 rounded-md bg-sky-50 border border-sky-200 text-[9px] font-bold text-sky-700">
                  If no → Back to CP1 (urgency)
                </span>
              </div>
            </div>

            {/* Objection 3: Can you do better on price */}
            <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-3">
              <p className="text-[11px] font-bold text-violet-700 mb-2">❝ "Can you do better on price?"</p>
              <p className="text-[10px] text-stone-700 leading-snug mb-2">
                <span className="font-bold">Before discounting:</span> <span className="italic">"Let me make sure we're aligned on the ROI first."</span>
              </p>
              <p className="text-[10px] text-stone-700 leading-snug">
                Restate the value stack. If the ROI is 8x+, say:
              </p>
              <p className="text-[10px] italic text-violet-800 leading-snug mt-1">
                "At an 8x return, this is already conservative. What would change your mind at this investment level?"
              </p>
            </div>

            {/* Trinity diagnostic footer */}
            <div className="rounded-lg bg-stone-900 p-3">
              <p className="text-[9px] font-bold text-amber-400 mb-1">Trinity Diagnostic</p>
              <p className="text-[10px] text-stone-400 leading-snug">
                Every price objection maps to a missing Trinity step. <span className="text-white font-semibold">Step 1</span> (bigger problem) → <span className="text-white font-semibold">Step 2</span> (price anchoring) → <span className="text-white font-semibold">Step 3</span> (confidence check). Diagnose which step was skipped before offering a discount.
              </p>
            </div>
          </div>
        </CoachAccordion>
      )}

      {/* ─── 5. DEAL HEALTH ─── */}
      {(tabFilter === 'all' || tabFilter === 'deal') && (
        <CoachAccordion
          id="dealHealth" isOpen={expandedCoach === 'dealHealth'} onToggle={() => setExpandedCoach(expandedCoach === 'dealHealth' ? null : 'dealHealth')}
          title="Deal Health"
          icon={Activity}
          statusBadge={(() => {
            const statusConfig = {
              healthy:  { label: 'Healthy',  emoji: '🟢', badgeCls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
              at_risk:  { label: 'At Risk',  emoji: '🟡', badgeCls: 'bg-amber-50 text-amber-700 border-amber-200' },
              critical: { label: 'Critical', emoji: '🔴', badgeCls: 'bg-rose-50 text-rose-700 border-rose-200' },
            }[health.status];
            return (
              <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${statusConfig.badgeCls}`}>
                {statusConfig.emoji} {statusConfig.label}
              </span>
            );
          })()}
        >
          {(() => {
            const statusConfig = {
              healthy:  { bar: 'bg-emerald-500' },
              at_risk:  { bar: 'bg-amber-400' },
              critical: { bar: 'bg-rose-500' },
            }[health.status];
            const nudgeBorder = {
              error:   'border-l-rose-500 bg-rose-50 text-rose-800',
              warning: 'border-l-amber-400 bg-amber-50 text-amber-800',
              info:    'border-l-sky-400 bg-sky-50 text-sky-800',
            };
            return (
              <>
                {health.isStale && (
                  <span className="mb-2 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-600 border border-rose-200">
                    Stale Deal
                  </span>
                )}

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
              </>
            );
          })()}
        </CoachAccordion>
      )}

      {/* ─── 6. DEAL KILL FLAGS ─── */}
      {(tabFilter === 'all' || tabFilter === 'deal') && (
        <CoachAccordion
          id="killFlags" isOpen={expandedCoach === 'killFlags'} onToggle={() => setExpandedCoach(expandedCoach === 'killFlags' ? null : 'killFlags')}
          title="Deal Diagnostics"
          icon={AlertTriangle}
          statusBadge={
            killFlags.length > 0 ? (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            ) : (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle2 size={8} /> Clear
              </span>
            )
          }
        >
          {killFlags.length === 0 ? (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700">No critical flags — deal looks healthy</span>
            </div>
          ) : (
            <div className="space-y-2">
              {killFlags.map(flag => (
                <div
                  key={flag.id}
                  className={`p-3 rounded-xl border ${
 flag.severity === 'critical'
 ? 'bg-rose-50 border-rose-200'
 : 'bg-amber-50 border-amber-200'
 }`}
                >
                  <div className="flex items-start gap-2 mb-1.5">
                    <span className="text-base leading-none mt-0.5">{flag.severity === 'critical' ? '☠️' : '⚠️'}</span>
                    <div className="flex-1">
                      <p className={`text-xs font-bold mb-0.5 ${
 flag.severity === 'critical' ? 'text-rose-700' : 'text-amber-700'
 }`}>{flag.label}</p>
                      <p className="text-[11px] text-stone-500 leading-snug mb-2">{flag.reason}</p>
                      <div className={`rounded-lg px-2.5 py-1.5 ${
 flag.severity === 'critical' ? 'bg-rose-100' : 'bg-amber-100'
 }`}>
                        <p className={`text-[11px] leading-snug italic ${
 flag.severity === 'critical' ? 'text-rose-700' : 'text-amber-700'
 }`}>{flag.fix}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CoachAccordion>
      )}

      {/* ─── 7. MACRO ROI ─── */}
      {(tabFilter === 'all' || tabFilter === 'room') && (
        <CoachAccordion
          id="macroRoi" isOpen={expandedCoach === 'macroRoi'} onToggle={() => setExpandedCoach(expandedCoach === 'macroRoi' ? null : 'macroRoi')}
          title="Macro ROI & Cost"
          icon={DollarSign}
        >
          <div className="space-y-4">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
              <h4 className="text-[11px] font-bold text-emerald-700 mb-1">Agency Displacement</h4>
              <p className="text-[10px] text-stone-600 mb-2 leading-relaxed">
                External agencies charge 15-20% of first-year salary. If Service Alignment helps bring even 2 roles in-house per quarter (saving ~$30K total), the platform pays for itself instantly.
              </p>
              <p className="text-[11px] text-emerald-600 italic font-medium">"Are you actively tracking what you spend on headhunters today?"</p>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
              <h4 className="text-[11px] font-bold text-emerald-700 mb-1">The Sourcing Tax (LinkedIn)</h4>
              <p className="text-[10px] text-stone-600 mb-2 leading-relaxed">
                Most companies pay for expensive LinkedIn Recruiter seats year-round even during hiring freezes. Service Alignment's 'Connect' builds a free talent pool that replaces this dependency.
              </p>
              <p className="text-[11px] text-emerald-600 italic font-medium">"How much of your budget is tied up in job board subscriptions?"</p>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
              <h4 className="text-[11px] font-bold text-emerald-700 mb-1">Compliance & Visibility</h4>
              <p className="text-[10px] text-stone-600 mb-2 leading-relaxed">
                Spreadsheet recruiting creates major GDPR and bias risks. The C-Suite needs a command center that provides automated retention policies and structured scorecards for high-stakes roles.
              </p>
              <p className="text-[11px] text-emerald-600 italic font-medium">"If the board asked for your diversity funnel metrics tomorrow, could you pull them?"</p>
            </div>
          </div>
        </CoachAccordion>
      )}

      {/* ─── 8. FOLLOW-UP EMAILS ─── */}
      <CoachAccordion
        id="followUp" isOpen={expandedCoach === 'followUp'} onToggle={() => setExpandedCoach(expandedCoach === 'followUp' ? null : 'followUp')}
        title="Follow-Up Emails"
        icon={Send}
      >
        <div className="space-y-3">
          {/* Sequence */}
          <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-3">
            <span className="text-[10px] font-bold text-violet-700 mb-2 block">3-Touch Sequence</span>
            {!followUpSequence ? (
              <button
                onClick={() => setFollowUpSequence(generateFollowUpSequence(session, session.company_name))}
                className="w-full py-2.5 rounded-xl bg-violet-100 border border-violet-200 text-violet-700 text-xs font-semibold hover:bg-violet-200 transition-colors"
              >
                Generate 3-Touch Sequence →
              </button>
            ) : (
              <div className="space-y-2">
                {followUpSequence.map((email, idx) => {
                  const isExpEmailOpen = expandedEmail === idx;
                  const dayBadgeColors = [
                    'bg-violet-100 text-violet-700 border-violet-200',
                    'bg-indigo-100 text-indigo-700 border-indigo-200',
                    'bg-purple-100 text-purple-700 border-purple-200',
                  ];
                  const dayLabel = email.day === 0 ? 'Day 0' : `Day +${email.day}`;
                  const bodyPreview = email.body.replace(/\n/g, ' ').slice(0, 80);

                  return (
                    <div key={idx} className="rounded-lg border border-stone-200 bg-white overflow-hidden">
                      <button
                        onClick={() => setExpandedEmail(isExpEmailOpen ? null : idx)}
                        className="w-full text-left px-3 py-2.5 flex items-start gap-2.5 hover:bg-stone-50 transition-colors"
                      >
                        <span className={`mt-0.5 shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border ${dayBadgeColors[idx]}`}>
                          {dayLabel}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold text-violet-500 mb-0.5">{email.purpose}</p>
                          <p className="text-xs font-bold text-stone-800 leading-tight truncate">{email.subject}</p>
                          {!isExpEmailOpen && (
                            <p className="text-[10px] text-stone-400 mt-1 leading-snug">
                              {bodyPreview}{email.body.replace(/\n/g, ' ').length > 80 ? '…' : ''}
                            </p>
                          )}
                        </div>
                        <ChevronDown
                          size={13}
                          className={`shrink-0 mt-1 text-violet-400 transition-transform duration-200 ${isExpEmailOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isExpEmailOpen && (
                        <div className="px-3 pb-3 space-y-2">
                          <pre className="text-[11px] text-stone-600 whitespace-pre-wrap leading-relaxed font-sans bg-stone-50 rounded-lg px-3 py-2.5 max-h-52 overflow-y-auto">
                            {email.body}
                          </pre>
                          <p className="text-[10px] text-violet-500 italic leading-snug">CTA: {email.cta}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => { await navigator.clipboard.writeText(email.subject); toast('Subject copied!', 'success'); }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-violet-100 border border-violet-200 text-violet-700 text-[11px] font-semibold hover:bg-violet-200 transition-colors"
                            >
                              <Copy size={11} /> Copy Subject
                            </button>
                            <button
                              onClick={async () => { await navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`); toast('Email copied!', 'success'); }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-violet-100 border border-violet-200 text-violet-700 text-[11px] font-semibold hover:bg-violet-200 transition-colors"
                            >
                              <Copy size={11} /> Copy Email
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <button
                  onClick={() => { setFollowUpSequence(generateFollowUpSequence(session, session.company_name)); setExpandedEmail(null); }}
                  className="w-full py-1.5 rounded-lg text-[10px] font-semibold text-violet-500 hover:text-violet-700 transition-colors"
                >
                  ↺ Regenerate
                </button>
              </div>
            )}
          </div>

          {/* AI Draft */}
          <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-indigo-700">AI Follow-Up Draft</span>
              <button
                onClick={handleGenerateEmail}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-70"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Drafting...</span>
                ) : (
                  <><Wand2 size={11} /> Draft Email</>
                )}
              </button>
            </div>

            {generatedEmail && (
              <div className="relative">
                <textarea
                  value={generatedEmail}
                  onChange={(e) => setGeneratedEmail(e.target.value)}
                  className="w-full h-48 text-[11px] text-stone-700 bg-white border border-indigo-200 rounded-lg p-3 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-y leading-relaxed shadow-inner"
                />
                <button
                  onClick={handleCopyEmail}
                  className={`absolute top-2 right-2 p-1.5 rounded-md border text-[10px] font-bold transition-colors ${emailCopied ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                >
                  {emailCopied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </CoachAccordion>

      {/* ─── 9. PROSPECT ENGAGEMENT ─── */}
      {hasEngagement && (
        <CoachAccordion
          id="engagement" isOpen={expandedCoach === 'engagement'} onToggle={() => setExpandedCoach(expandedCoach === 'engagement' ? null : 'engagement')}
          title="Prospect Engagement"
          icon={Eye}
          statusBadge={
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle2 size={8} /> Live
            </span>
          }
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] text-sky-600">{engagement!.company} has visited these sections:</p>
            <span className="text-[10px] text-sky-400">Last: {new Date(engagement!.lastActiveAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="space-y-1.5">
            {EngagementTracker.topSections(engagement!).map(sec => (
              <div key={sec.sectionId} className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-stone-700">{sec.label}</span>
                <div className="flex items-center gap-1.5">
                  <Clock size={10} className="text-sky-400" />
                  <span className="text-[10px] font-bold text-sky-600">{EngagementTracker.formatTime(sec.totalSeconds)}</span>
                </div>
              </div>
            ))}
          </div>
        </CoachAccordion>
      )}

      {/* ─── 10. AGENCY DISPLACEMENT CHECKLIST ─── */}
      {(tabFilter === 'all' || tabFilter === 'coach') && (
        <CoachAccordion
          id="agencyChecklist" isOpen={expandedCoach === 'agencyChecklist'} onToggle={() => setExpandedCoach(expandedCoach === 'agencyChecklist' ? null : 'agencyChecklist')}
        title="Agency Displacement"
        icon={CheckSquare}
        statusBadge={
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-stone-100 text-stone-500 border border-stone-200 tabular-nums">
            {Object.values(agencyChecklist).filter(Boolean).length}/5
          </span>
        }
      >
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
 ? 'bg-indigo-100 border-indigo-300 text-indigo-800'
 : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
 }`}
            >
              <span>{item.label}</span>
              <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${
 agencyChecklist[item.key] ? 'bg-indigo-500 border-indigo-600' : 'bg-stone-100 border-stone-300'
 }`}>
                {agencyChecklist[item.key] && <Check size={10} className="text-white" strokeWidth={3} />}
              </div>
            </button>
          ))}
        </div>
        </CoachAccordion>
      )}

      {/* ─── 11. WALKTHROUGH OVERRIDES ─── */}
      {(tabFilter === 'all' || tabFilter === 'coach') && (
        <CoachAccordion
          id="overrides" isOpen={expandedCoach === 'overrides'} onToggle={() => setExpandedCoach(expandedCoach === 'overrides' ? null : 'overrides')}
        title="Walkthrough Overrides"
        icon={Zap}
        statusBadge={
          (session.overridden_pillars ?? []).length > 0 ? (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-stone-100 text-stone-600 border border-stone-200 tabular-nums">
              {(session.overridden_pillars ?? []).length} forced
            </span>
          ) : undefined
        }
      >
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
 ? 'bg-stone-100 border-stone-300 text-stone-800'
 : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
 }`}
              >
                <Icon size={12} />
                {area.title}
              </button>
            );
          })}
        </div>
      </CoachAccordion>
      )}
    </div>
  );
}
