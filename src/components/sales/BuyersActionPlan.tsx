import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, ShieldCheck, Save, Loader2, Link as LinkIcon, Info, Lock } from 'lucide-react';
import { CleanCard } from '../ui/CleanUI';
import { supabase } from '../../lib/supabase';

export type AnswerType = 'yes' | 'no' | 'maybe' | null;

interface Question {
  id: string;
  checkpoint: 1 | 2 | 3;
  title: string;
  question: string;
  tooltip: string;
}

const ACTION_PLAN_QUESTIONS: Question[] = [
  // Checkpoint 1: Do They Need to Act?
  { id: 'q1', checkpoint: 1, title: 'The Core Problem', question: 'What is the exact problem they are trying to solve?', tooltip: 'If you cannot clearly state their problem, you cannot solve it. No problem means no deal.' },
  { id: 'q2', checkpoint: 1, title: 'Stakeholder Map', question: 'Who actually owns this problem and makes the decision?', tooltip: 'Selling to someone who cannot buy is a waste of time. Find the person with the pen.' },
  { id: 'q3', checkpoint: 1, title: 'Cost of Indecision', question: 'What happens if they do nothing?', tooltip: 'Pain drives action. If doing nothing is acceptable, they will do nothing.' },
  { id: 'q4', checkpoint: 1, title: 'Priority Level', question: 'Is fixing this a top priority for them right now?', tooltip: 'Urgency creates deals. If this is not a top priority, the deal will stall.' },
  
  // Checkpoint 2: Do They Need Outside Help?
  { id: 'q5', checkpoint: 2, title: 'Current Approach', question: 'What are they currently doing to try and fix this?', tooltip: 'Understand their baseline. You must prove why what they are doing is not enough.' },
  { id: 'q6', checkpoint: 2, title: 'Capability Gap', question: 'Why have their current efforts failed?', tooltip: 'This is where you establish that they cannot fix the problem on their own. They need outside expertise.' },
  { id: 'q7', checkpoint: 2, title: 'Buying Process', question: 'How exactly do they buy things like this?', tooltip: 'Knowing their process prevents late-stage surprises with legal or procurement.' },
  { id: 'q8', checkpoint: 2, title: 'Readiness', question: 'Are they actually capable of implementing a solution now?', tooltip: 'Even if they want it, can they absorb it? Check their bandwidth.' },
  
  // Checkpoint 3: Are We the Best Solution?
  { id: 'q9', checkpoint: 3, title: 'Proven Results', question: 'Have we proven we can solve this specific problem?', tooltip: 'Confidence closes deals. Use case studies to eliminate their risk.' },
  { id: 'q10', checkpoint: 3, title: 'Solution Map', question: 'Is it completely clear how our product fixes their problem?', tooltip: 'Connect the dots. Do not assume they see the value—spell it out.' },
  { id: 'q11', checkpoint: 3, title: 'Success Metrics', question: 'How will they measure if this was a success?', tooltip: 'Agree on the finish line before you start the race. Set clear ROI expectations.' }
];

export function BuyersActionPlan({ defaultRoomId = '' }: { defaultRoomId?: string }) {
  const [roomId, setRoomId] = useState(defaultRoomId);
  const [linkedRoomId, setLinkedRoomId] = useState(defaultRoomId);
  const [answers, setAnswers] = useState<Record<string, AnswerType>>({});
  const [expandedContext, setExpandedContext] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const toggleContext = (id: string) => {
    setExpandedContext(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Load latest state from Supabase when linkedRoomId changes
  useEffect(() => {
    if (!linkedRoomId) return;
    
    let isMounted = true;
    const fetchLatestState = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('discovery_room_events')
          .select('metadata, created_at')
          .eq('room_id', linkedRoomId)
          .eq('event_type', 'HUMAN_DIAGNOSTIC_UPDATE')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching diagnostic state:', error);
        }

        if (isMounted && data && data.metadata && data.metadata.answers) {
          setAnswers(data.metadata.answers);
          setLastSaved(new Date(data.created_at));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLatestState();
    return () => { isMounted = false; };
  }, [linkedRoomId]);

  // Save to Supabase
  const saveToSupabase = useCallback(async (newAnswers: Record<string, AnswerType>) => {
    if (!linkedRoomId) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('discovery_room_events')
        .insert({
          room_id: linkedRoomId,
          event_type: 'HUMAN_DIAGNOSTIC_UPDATE',
          session_id: `sales_command_${Date.now()}`,
          metadata: {
            answers: newAnswers,
            source: 'BuyersActionPlan'
          }
        });

      if (error) throw error;
      setLastSaved(new Date());
    } catch (err) {
      console.error('Failed to save to Supabase:', err);
    } finally {
      setIsSaving(false);
    }
  }, [linkedRoomId]);

  const handleAnswer = (id: string, answer: AnswerType) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      if (answer === 'yes' || answer === 'maybe') {
        navigator.vibrate(10); // Subtle success
      } else if (answer === 'no') {
        navigator.vibrate([30, 50, 30]); // Error thud
      }
    }

    const newAnswers = { ...answers, [id]: answer };
    setAnswers(newAnswers);
    
    // Auto-save if linked
    if (linkedRoomId) {
      saveToSupabase(newAnswers);
    }
  };

  const handleLinkRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      setLinkedRoomId(roomId.trim());
    }
  };

  // Calculate scores (YES = 2.5, MAYBE = 1.25, NO = 0)
  const getCheckpointScore = (c: 1 | 2 | 3) => {
    const cpQs = ACTION_PLAN_QUESTIONS.filter(q => q.checkpoint === c);
    return cpQs.reduce((score, q) => {
      if (answers[q.id] === 'yes') return score + 2.5;
      if (answers[q.id] === 'maybe') return score + 1.25;
      return score;
    }, 0);
  };

  const c1Score = getCheckpointScore(1);
  const c2Score = getCheckpointScore(2);
  const c3Score = getCheckpointScore(3);

  const getCheckpointStatus = (score: number, maxScore: number) => {
    if (score >= maxScore - 1) return { label: 'PASSED', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (score >= maxScore / 2) return { label: 'AT RISK', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'FAILED', color: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  const c1Status = getCheckpointStatus(c1Score, 10);
  const c2Status = getCheckpointStatus(c2Score, 10);
  const c3Status = getCheckpointStatus(c3Score, 7.5);

  const totalYesCount = Object.values(answers).filter(a => a === 'yes').length;

  const getCheckpointTitle = (c: 1 | 2 | 3) => {
    if (c === 1) return 'Checkpoint 1: Do They Need to Act?';
    if (c === 2) return 'Checkpoint 2: Do They Need Outside Help?';
    return 'Checkpoint 3: Are We the Best Solution?';
  };

  return (
    <div className="space-y-6">
      
      {/* ─────────────────────────────────────────────────────────────────
          ROOM LINKING HEADER (The Flywheel Connection)
          ───────────────────────────────────────────────────────────────── */}
      <CleanCard className="p-4 bg-stone-900 border-stone-800 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              AI Intelligence Sync
            </h3>
            <p className="text-sm text-stone-400 mt-1">
              Link this action plan to a Discovery Room ID to provide Ground Truth data to the ARO Agent.
            </p>
          </div>
          
          <form onSubmit={handleLinkRoom} className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Enter Room ID..."
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="bg-stone-800 border border-stone-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-emerald-500 w-48 transition-colors"
            />
            <button 
              type="submit"
              disabled={!roomId.trim() || roomId === linkedRoomId}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <LinkIcon className="w-4 h-4" />
              {linkedRoomId === roomId && linkedRoomId ? 'Linked' : 'Link Deal'}
            </button>
          </form>
        </div>

        {linkedRoomId && (
          <div className="mt-4 pt-4 border-t border-stone-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-time sync active for Room: <span className="font-mono">{linkedRoomId}</span></span>
            </div>
            
            <div className="flex items-center gap-2 text-stone-400">
              {isSaving ? (
                <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</>
              ) : lastSaved ? (
                <><Save className="w-3 h-3" /> Last saved {lastSaved.toLocaleTimeString()}</>
              ) : null}
            </div>
          </div>
        )}
      </CleanCard>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: The Questions */}
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map((cpNum) => {
              const questions = ACTION_PLAN_QUESTIONS.filter(q => q.checkpoint === cpNum);
              
              // Progressive Disclosure Logic
              let isLocked = false;
              if (cpNum === 2 && c1Status.label !== 'PASSED') isLocked = true;
              if (cpNum === 3 && (c1Status.label !== 'PASSED' || c2Status.label !== 'PASSED')) isLocked = true;

              return (
                <CleanCard key={cpNum} className={`p-0 overflow-hidden !h-auto transition-all duration-500 ${isLocked ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                  <div className="bg-stone-50 border-b border-stone-100 px-6 py-3 font-bold text-stone-800 text-sm flex justify-between items-center">
                    <span>{getCheckpointTitle(cpNum as 1 | 2 | 3)}</span>
                    {isLocked && (
                      <span className="text-xs text-stone-500 font-medium flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        Complete previous checkpoint
                      </span>
                    )}
                  </div>
                  <div className="divide-y divide-stone-100">
                    {questions.map((q) => (
                      <div key={q.id} className="p-6 hover:bg-stone-50/50 transition-colors flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div 
                            className="flex-1 cursor-pointer select-none" 
                            onClick={() => toggleContext(q.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && toggleContext(q.id)}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-bold text-primary">{q.title}</h4>
                              <Info className={`w-4 h-4 transition-colors ${expandedContext[q.id] ? 'text-primary' : 'text-stone-400 hover:text-stone-600'}`} />
                            </div>
                            <p className="text-sm text-stone-600 font-medium pr-4">{q.question}</p>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0 bg-white border border-stone-200 rounded-xl p-1">
                            <button
                              onClick={() => handleAnswer(q.id, 'yes')}
                              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${answers[q.id] === 'yes' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'text-stone-500 hover:bg-stone-100 border border-transparent'}`}
                            >
                              YES
                            </button>
                            <button
                              onClick={() => handleAnswer(q.id, 'maybe')}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${answers[q.id] === 'maybe' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'text-stone-500 hover:bg-stone-100 border border-transparent'}`}
                            >
                              MAYBE
                            </button>
                            <button
                              onClick={() => handleAnswer(q.id, 'no')}
                              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${answers[q.id] === 'no' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'text-stone-500 hover:bg-stone-100 border border-transparent'}`}
                            >
                              NO
                            </button>
                          </div>
                        </div>

                        {/* Expandable "Why This Matters" Context */}
                        {expandedContext[q.id] && (
                          <div className="bg-primary/[0.04] border border-primary/10 rounded-lg p-4 text-sm text-stone-700 animate-in fade-in slide-in-from-top-2 duration-200 mt-2">
                            <span className="font-bold text-primary block mb-1">Why this matters:</span>
                            {q.tooltip}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CleanCard>
              );
            })}
          </div>
          {/* Right Column: Checkpoints */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-6 space-y-6">
              <CleanCard className="p-6 relative overflow-hidden border-primary/20 border-l-4 border-l-primary bg-gradient-to-br from-primary/[0.08] to-primary/[0.02]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-stone-900">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Diagnostic Scoring
                </h3>
                {isSaving ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-stone-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Syncing...
                  </span>
                ) : (
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    Live
                  </span>
                )}
              </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-stone-500">Confirmed 'Yes'</span>
                      <span className="text-lg font-bold text-primary">{totalYesCount} / 11</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(totalYesCount / 11) * 100}%` }} />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-200/60 space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-stone-500">Checkpoint 1</span>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-stone-700">Need to Act?</span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${c1Status.color}`}>{c1Status.label}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-stone-500">Checkpoint 2</span>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-stone-700">Need Outside Help?</span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${c2Status.color}`}>{c2Status.label}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-stone-500">Checkpoint 3</span>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-stone-700">Best Solution?</span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${c3Status.color}`}>{c3Status.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CleanCard>
              
              <CleanCard className="p-6 bg-primary/5 border-primary/20">
                <h4 className="text-primary font-bold text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Checkpoint Discipline
                </h4>
                <p className="text-sm text-stone-700 leading-relaxed">
                  Do not advance to Checkpoint 2 unless Checkpoint 1 is solid.
                  Skipping steps creates "happy ears" and leads to stalled deals. Uncover the missing truth before pitching.
                </p>
              </CleanCard>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}



