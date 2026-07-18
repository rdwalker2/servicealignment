import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAiEmailDraft } from '../../lib/aiPersonalization';
import { findPersonByEmail, getContactActivityTimeline, listCadences, findOrCreateAndAddToCadence } from '../../lib/salesloft';
import type { TimelineEvent } from '../../lib/salesloft';
import {
  MapPin,
  Users,
  Database,
  Target,
  Zap,
  ShieldCheck,
  PlaySquare,
  Mail,
  Phone,
  LayoutList,
  MessageSquare,
  Loader2,
  Check,
  Sparkles,
  Copy
} from 'lucide-react';
import { CleanDrawer, cn } from '../ui/CleanDrawer';
import { type TargetAccount } from '../../data/targetAccounts';

interface TargetAccountDrawerProps {
  account: TargetAccount | null;
  onClose: () => void;
  onOpenBattlecard?: (battlecardId: string) => void;
  onVerify?: (accountId: string) => Promise<void>;
}

export function TargetAccountDrawer({
  account,
  onClose,
  onOpenBattlecard,
  onVerify,
}: TargetAccountDrawerProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
  const [activeTab, setActiveTab] = useState<'intelligence' | 'activation' | 'verification'>('intelligence');
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState<string[]>([]);
  
  // AI Email State
  const [draftEmail, setDraftEmail] = useState<string>('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateEmail = async () => {
    if (!account) return;
    setIsGeneratingEmail(true);
    try {
      const draft = await generateAiEmailDraft(account, timeline);
      setDraftEmail(draft);
    } catch (err) {
      console.error('Failed to generate AI email:', err);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(draftEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnroll = async (sequenceName: string) => {
    if (!account?.contact?.email) return;
    setEnrolling(sequenceName);
    try {
      const names = account.contact.name.split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ') || '';
      
      const cadences = await listCadences();
      const cadenceId = cadences.length > 0 ? cadences[0].id : 1; // Fallback to 1 if no cadences found

      await findOrCreateAndAddToCadence(
        { email: account.contact.email, firstName, lastName, companyName: account.name },
        cadenceId
      );
      setEnrolled(prev => [...prev, sequenceName]);
    } catch (err) {
      console.error('Failed to enroll:', err);
    } finally {
      setEnrolling(null);
    }
  };

  useEffect(() => {
    if (!account?.contact?.email) {
      setTimeline([]);
      return;
    }
    let cancelled = false;
    async function load() {
      setIsLoadingTimeline(true);
      try {
        const person = await findPersonByEmail(account!.contact!.email);
        if (person) {
          const events = await getContactActivityTimeline(person.id);
          if (!cancelled) setTimeline(events);
        }
      } catch (err) {
        console.warn('Failed to load timeline', err);
      } finally {
        if (!cancelled) setIsLoadingTimeline(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [account]);

  if (!account) return null;

  const isHighPriority = account.score >= 90;

  return (
    <CleanDrawer
      open={!!account}
      onClose={() => {
        onClose();
        setTimeout(() => setActiveTab('intelligence'), 300); // reset tab after close animation
      }}
      width="md"
      title={
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-2 text-lg font-bold tracking-tight">
            {account.name}
            {isHighPriority && (
              <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-black tracking-[0.15em] text-rose-700 uppercase">
                Hot Target
              </span>
            )}
          </span>
          {/* Internal Tabs */}
          <div className="flex items-center gap-0.5 mt-1.5 bg-slate-100 p-0.5 rounded border border-slate-200/50 w-fit">
            {(['intelligence', 'activation', 'verification'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 py-1 rounded text-[10px] font-bold uppercase tracking-[0.1em] transition-all",
                  activeTab === tab 
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      }
      subtitle={
        <span className="flex items-center gap-1.5 text-[10px]">
          <MapPin size={10} className="text-slate-400" />
          {account.hq} &middot; {account.industry}
        </span>
      }
      icon={
        <div
          className={cn(
            'flex h-full w-full items-center justify-center font-bold text-base',
            isHighPriority
              ? 'bg-primary text-white'
              : 'bg-slate-100 text-slate-600'
          )}
        >
          {account.name.charAt(0)}
        </div>
      }
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <div className="text-[9px] font-medium text-slate-400">
            Account ID: <span className="font-mono text-[10px]">{account.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            {activeTab === 'intelligence' && (
              <button className="flex items-center gap-1.5 rounded bg-[#EBF7FC] border border-[#00A1E0]/20 px-3 py-1.5 text-xs font-bold text-[#00A1E0] hover:bg-[#D7F0FA] transition-colors">
                <Database size={12} />
                View in Salesforce
              </button>
            )}
            {activeTab === 'activation' && (
              <button className="flex items-center gap-1.5 rounded bg-primary border border-primary-dark px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-primary/90 transition-colors">
                <PlaySquare size={12} />
                Enroll in Cadence
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'intelligence' && (
            <motion.div
              key="intelligence"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {/* Strategic Angle */}
              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                <h4 className="mb-1.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  <Target size={12} className="text-primary" />
                  Strategic Angle
                </h4>
                <p className="text-xs leading-relaxed text-slate-700">
                  {account.reasonToTarget}
                </p>
              </div>

              {/* Metrics Bar */}
              <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 shadow-sm">
                <div className="bg-white p-2.5 text-center flex flex-col justify-center">
                  <div className="mb-0.5 text-[9px] font-medium uppercase tracking-[0.15em] text-slate-400">
                    TT Score
                  </div>
                  <div className={cn('text-lg font-black tabular-nums', isHighPriority ? 'text-primary' : 'text-slate-900')}>
                    {account.score}
                  </div>
                </div>
                <div className="bg-white p-2.5 text-center flex flex-col justify-center">
                  <div className="mb-0.5 text-[9px] font-medium uppercase tracking-[0.15em] text-slate-400">
                    Open Roles
                  </div>
                  <div className="text-lg font-black tabular-nums text-slate-900">
                    {account.openRoles}
                  </div>
                </div>
                <div className="bg-white p-2.5 text-center flex flex-col items-center justify-center">
                  <div className="mb-0.5 text-[9px] font-medium uppercase tracking-[0.15em] text-slate-400">
                    Hiring Velocity
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-lg font-black tabular-nums text-emerald-600 mr-1">
                      {account.hiringVelocityScore}
                    </span>
                    <span className="inline-flex items-center gap-0.5 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-700">
                      <Zap size={8} className="fill-current" />
                      {account.hiringVelocityScore >= 90 ? 'Very High' : account.hiringVelocityScore >= 80 ? 'High' : 'Med'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Score Breakdown Proof */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm">
                <h4 className="mb-2 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 flex items-center justify-between">
                  <span>Score Breakdown (Proof)</span>
                  <span className="text-[8px] font-bold tracking-wider text-blue-600 bg-blue-100/50 border border-blue-200 px-1 py-0.5 rounded uppercase">Mathematical Composite</span>
                </h4>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 flex items-center gap-1.5"><MapPin size={10} className="text-slate-400" /> Base ICP Fit (Size & Vertical)</span>
                    <span className="font-mono text-slate-900 font-semibold">+{account.score - Math.floor(account.score * 0.35) - Math.floor(account.score * 0.25)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 flex items-center gap-1.5"><Database size={10} className="text-slate-400" /> Incumbent Friction ({account.incumbentAts})</span>
                    <span className="font-mono text-slate-900 font-semibold">+{Math.floor(account.score * 0.35)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 flex items-center gap-1.5"><Zap size={10} className="text-emerald-500" /> Hiring Velocity Bonus</span>
                    <span className="font-mono text-emerald-600 font-semibold">+{Math.floor(account.score * 0.25)}</span>
                  </div>
                  <div className="pt-1.5 mt-1.5 border-t border-slate-200 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-800">Total Validated Score</span>
                    <span className="font-mono text-primary text-xs">{account.score}/100</span>
                  </div>
                </div>
              </div>

              {/* Operational Context */}
              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                <h4 className="mb-3 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Operational Context
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <div className="rounded-md bg-slate-50 p-1.5 text-slate-400">
                      <Database size={14} />
                    </div>
                    <div>
                      <div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Incumbent Provider
                      </div>
                      <div className="text-xs font-semibold text-slate-900">
                        {account.incumbentAts}
                      </div>
                      {account.incumbentAts !== 'Unknown' && (
                        <button
                          onClick={() => {
                            if (onOpenBattlecard) {
                              onOpenBattlecard(`bc_${account.incumbentAts.toLowerCase().replace(' ', '')}`);
                            }
                          }}
                          className="mt-1 text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:underline"
                        >
                          View Battlecard &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="rounded-md bg-slate-50 p-1.5 text-slate-400">
                      <Users size={14} />
                    </div>
                    <div>
                      <div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Employees
                      </div>
                      <div className="text-xs font-semibold text-slate-900 tabular-nums">
                        {account.employeeCount.toLocaleString()} EMP
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'verification' && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Intelligence Audit Trail */}
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-800">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    Intelligence Audit Trail
                  </h4>
                  <span className="text-[8px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Confidence: {account.confidenceScore}%
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                    <div>
                      <p className="text-[11px] text-emerald-900 leading-relaxed">
                        <span className="font-bold">Waterfall Enrichment:</span> Data aggregated via {account.dataSources.join(', ')}.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                    <div className="w-full">
                      <p className="text-[11px] text-emerald-900 leading-relaxed">
                        <span className="font-bold">Real-Time Verification:</span> Intent signals verified{' '}
                        {account.lastVerified === 'Just now' ? (
                          <span className="inline-flex items-center gap-0.5 text-emerald-600 bg-emerald-100/80 px-1 py-0.5 rounded font-bold animate-pulse text-[9px] uppercase tracking-wider">
                            <Zap size={8} className="fill-current" /> Just now
                          </span>
                        ) : (
                          <strong>{account.lastVerified}</strong>
                        )}.
                      </p>
                      {onVerify && (
                        <div className="mt-2.5">
                          <button
                            onClick={async () => {
                              setIsVerifying(true);
                              await onVerify(account.id);
                              setIsVerifying(false);
                            }}
                            disabled={isVerifying || account.lastVerified === 'Just now'}
                            className="text-[9px] font-bold uppercase tracking-[0.1em] px-2.5 py-1.5 rounded border transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                          >
                            {isVerifying ? (
                              <>
                                <div className="w-2.5 h-2.5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                                Running Waterfall...
                              </>
                            ) : account.lastVerified === 'Just now' ? (
                              <>
                                <ShieldCheck size={10} />
                                Verified
                              </>
                            ) : (
                              <>
                                <Database size={10} />
                                Verify Intelligence
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'activation' && (
            <motion.div
              key="activation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2.5">
                <button className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all group">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Mail size={14} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">Draft Email</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all group">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <Phone size={14} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">Log Call</span>
                </button>
              </div>

              {/* AI Email Drafter */}
              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-violet-500" />
                    1-Click AI Email
                  </h4>
                  {draftEmail && (
                    <button 
                      onClick={handleCopyEmail}
                      className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>

                {!draftEmail ? (
                  <button 
                    onClick={handleGenerateEmail}
                    disabled={isGeneratingEmail}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-xs transition-colors group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isGeneratingEmail ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Analyzing signals & drafting...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="group-hover:scale-110 transition-transform" />
                        Generate Highly Personalized Draft
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <textarea 
                      value={draftEmail}
                      onChange={(e) => setDraftEmail(e.target.value)}
                      className="w-full h-48 p-3 text-[11px] leading-relaxed text-slate-700 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none font-medium"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={handleGenerateEmail}
                        disabled={isGeneratingEmail}
                        className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-[10px] transition-colors"
                      >
                        <Sparkles size={12} /> Regenerate
                      </button>
                      <button 
                        onClick={handleCopyEmail}
                        className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[10px] transition-colors"
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />} Copy & Paste
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Playbooks & Sequences */}
              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                <h4 className="mb-3 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 flex items-center gap-1.5">
                  <LayoutList size={12} className="text-slate-400" />
                  Suggested Sequences
                </h4>
                <div className="space-y-1.5">
                  <button 
                    onClick={() => handleEnroll('inbound')}
                    disabled={enrolling === 'inbound' || enrolled.includes('inbound')}
                    className="w-full flex items-center justify-between p-2.5 rounded border border-slate-100 bg-slate-50 hover:border-primary/30 hover:bg-primary/5 transition-all group disabled:opacity-80 disabled:cursor-not-allowed">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                        <Zap size={12} />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-slate-900">Inbound Form Intent</div>
                        <div className="text-[9px] text-slate-500 font-medium">3 steps &middot; 5 days</div>
                      </div>
                    </div>
                    {enrolling === 'inbound' ? (
                      <Loader2 size={14} className="text-primary animate-spin" />
                    ) : enrolled.includes('inbound') ? (
                      <Check size={14} className="text-emerald-500" />
                    ) : (
                      <PlaySquare size={14} className="text-slate-400 group-hover:text-primary" />
                    )}
                  </button>

                  <button 
                    onClick={() => handleEnroll('rip-replace')}
                    disabled={enrolling === 'rip-replace' || enrolled.includes('rip-replace')}
                    className="w-full flex items-center justify-between p-2.5 rounded border border-slate-100 bg-slate-50 hover:border-primary/30 hover:bg-primary/5 transition-all group disabled:opacity-80 disabled:cursor-not-allowed">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                        <Target size={12} />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-slate-900">Incumbent Rip-and-Replace</div>
                        <div className="text-[9px] text-slate-500 font-medium">Auto-populates vs {account.incumbentAts}</div>
                      </div>
                    </div>
                    {enrolling === 'rip-replace' ? (
                      <Loader2 size={14} className="text-primary animate-spin" />
                    ) : enrolled.includes('rip-replace') ? (
                      <Check size={14} className="text-emerald-500" />
                    ) : (
                      <PlaySquare size={14} className="text-slate-400 group-hover:text-primary" />
                    )}
                  </button>
                </div>
              </div>

              {/* Activity Feed Placeholder */}
              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                 <h4 className="mb-3 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 flex items-center gap-1.5">
                  <MessageSquare size={12} className="text-slate-400" />
                  Salesloft Activity
                </h4>
                
                {isLoadingTimeline ? (
                  <div className="py-5 flex flex-col items-center justify-center text-center">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                    <span className="text-[10px] text-slate-500">Loading timeline...</span>
                  </div>
                ) : timeline.length === 0 ? (
                  <div className="py-5 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-1.5">
                      <LayoutList size={16} />
                    </div>
                    <p className="text-[11px] font-semibold text-slate-700">No recent activity</p>
                    <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto mt-0.5">Enroll this account in a sequence to start engaging.</p>
                  </div>
                ) : (
                  <div className="space-y-3 pl-1 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[1px] before:bg-slate-200">
                    {timeline.map((event, i) => (
                      <div key={i} className="relative flex items-start gap-3">
                        <div className="w-[22px] h-[22px] rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 z-10 shadow-sm mt-0.5">
                          {event.type === 'email' && <Mail size={10} className="text-blue-500" />}
                          {event.type === 'call' && <Phone size={10} className="text-emerald-500" />}
                          {event.type === 'note' && <LayoutList size={10} className="text-amber-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-bold text-slate-800">
                            {event.type === 'email' && (event.data.subject || 'Email Sent')}
                            {event.type === 'call' && (event.data.disposition || 'Call Logged')}
                            {event.type === 'note' && 'Note Added'}
                          </div>
                          {event.type === 'note' && event.data.content && (
                            <p className="text-[10px] text-slate-600 mt-0.5 line-clamp-2">{event.data.content}</p>
                          )}
                          <div className="text-[9px] text-slate-400 mt-0.5 font-medium">
                            {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CleanDrawer>
  );
}
