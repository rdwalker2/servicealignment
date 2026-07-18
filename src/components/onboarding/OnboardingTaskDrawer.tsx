import React, { useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CheckCircle2, ArrowRight, PlayCircle, BookOpen, ExternalLink, Lightbulb } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { OnboardingTask } from '../../data/onboardingProgram';
import { TOPIC_MAP } from '../../pages/process/ProcessOverview';
import { productWikiData } from '../../data/productWiki';
import { csWikiData } from '../../data/csWiki';
import { integrationsWikiData } from '../../data/integrationsWiki';

interface OnboardingTaskDrawerProps {
  task: OnboardingTask | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (taskId: string) => void;
  isCompleted: boolean;
}

export default function OnboardingTaskDrawer({ 
  task, 
  isOpen, 
  onClose, 
  onComplete,
  isCompleted 
}: OnboardingTaskDrawerProps) {
  const navigate = useNavigate();
  
  const TopicComponent = task?.topicId ? TOPIC_MAP[task.topicId] : null;
  
  // Close on esc
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!task) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/20 backdrop-blur-[2px] z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col border-l border-stone-200"
          >
            {/* Header */}
            <div className="shrink-0 p-6 border-b border-stone-100 bg-stone-50/80 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">
                    {task.type || 'Reading'}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-stone-500">
                    <Clock size={12} /> {task.estimatedMinutes} min
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-stone-900 mb-1 leading-tight">{task.title}</h2>
                <p className="text-sm text-stone-500">{task.description}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-stone-400 hover:bg-white hover:shadow-sm hover:text-stone-700 transition-all border border-transparent hover:border-stone-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto bg-white p-8">
              {/* Rich Content Area */}
              <div className="max-w-prose mx-auto">
                {task.type === 'quiz' && task.externalUrl ? (
                  <div className="w-full aspect-[4/3] bg-stone-100 rounded-xl overflow-hidden shadow-lg border border-stone-200 mb-8">
                    <iframe 
                      src={task.externalUrl} 
                      className="w-full h-full border-0" 
                      title="Interactive Quiz"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : task.type === 'interactive' ? (
                  <div className="relative w-full aspect-video bg-stone-900 rounded-xl overflow-hidden mb-8 shadow-lg group cursor-pointer">
                    <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2940&auto=format&fit=crop" alt="Video thumbnail" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#FF2A7F] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <PlayCircle size={32} className="text-white ml-1" />
                      </div>
                    </div>
                  </div>
                ) : TopicComponent ? (
                  <div className="mb-8 border border-stone-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                    <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center gap-2">
                      <BookOpen size={16} className="text-stone-400" />
                      <span className="text-sm font-bold text-stone-700">Playbook Excerpt</span>
                    </div>
                    <div className="p-6 prose prose-stone prose-sm max-w-none">
                      <Suspense fallback={
                        <div className="flex items-center justify-center h-32">
                          <div className="animate-spin w-5 h-5 border-2 border-stone-300 border-t-indigo-600 rounded-full" />
                        </div>
                      }>
                        <TopicComponent />
                      </Suspense>
                    </div>
                  </div>
                ) : task.wikiIds && task.wikiIds.length > 0 ? (
                  <div className="mb-8 space-y-4">
                    {task.wikiIds.map(wikiId => {
                      const feature = productWikiData.find(w => w.id === wikiId) || csWikiData.find(w => w.id === wikiId) || integrationsWikiData.find(w => w.id === wikiId);
                      if (!feature) return null;
                      return (
                        <div key={wikiId} className="border border-stone-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                          <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{feature.category}</span>
                            <span className="text-sm font-bold text-stone-800">{feature.title}</span>
                          </div>
                          <div className="p-5 text-sm">
                            {feature.whatItDoes && (
                              <div className="mb-4">
                                <h4 className="font-bold text-stone-900 mb-2">What it does</h4>
                                <p className="text-stone-600 leading-relaxed">{feature.whatItDoes}</p>
                              </div>
                            )}
                            {feature.howItWorks && (
                              <div className="mb-4">
                                <h4 className="font-bold text-stone-900 mb-2">How it works</h4>
                                {(() => {
                                  let steps = feature.howItWorks.includes('\n') 
                                    ? feature.howItWorks.split('\n').map(s => s.trim()).filter(Boolean)
                                    : feature.howItWorks.split(/(?<=[a-zA-Z])\.\s+/).filter(Boolean);
                                  
                                  if (steps.length > 1) {
                                    return (
                                      <div className="space-y-3 pt-1">
                                        {steps.map((step, i) => {
                                          let cleanStep = step.replace(/^(\d+\.|[-•*])\s*/, '').trim();
                                          if (!cleanStep.endsWith('.') && !cleanStep.endsWith('?') && !cleanStep.endsWith('!')) {
                                            cleanStep += '.';
                                          }
                                          return (
                                            <div key={i} className="flex gap-2">
                                              <div className="w-4 h-4 rounded-full bg-stone-100 text-stone-500 border border-stone-200 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5 shadow-sm">
                                                {i + 1}
                                              </div>
                                              <p className="text-[13px] text-stone-600 leading-relaxed">{cleanStep}</p>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    );
                                  }
                                  return <p className="text-stone-600 leading-relaxed">{feature.howItWorks}</p>;
                                })()}
                              </div>
                            )}
                            {feature.prospectQA && feature.prospectQA.length > 0 && (
                              <div className="mb-4">
                                <h4 className="font-bold text-stone-900 mb-2">Common Q&A</h4>
                                <div className="space-y-3">
                                  {feature.prospectQA.map((qa, i) => (
                                    <div key={i} className="bg-stone-50 rounded-lg p-3 border border-stone-100">
                                      <p className="font-bold text-stone-800 mb-1 text-xs">Q: {qa.q}</p>
                                      <p className="text-stone-600 text-xs">{qa.a}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {feature.valueDrivers && feature.valueDrivers.length > 0 && (
                              <div className="mb-4">
                                <h4 className="font-bold text-emerald-700 mb-2">Value Drivers</h4>
                                <ul className="space-y-2">
                                  {feature.valueDrivers.map((vd, i) => (
                                    <li key={i} className="flex gap-2 items-start">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                      <span className="text-sm text-stone-600">{vd}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {feature.discoveryQuestions && feature.discoveryQuestions.length > 0 && (
                              <div className="mb-4">
                                <h4 className="font-bold text-blue-700 mb-2">Discovery Questions</h4>
                                <ul className="space-y-2">
                                  {feature.discoveryQuestions.map((dq, i) => (
                                    <li key={i} className="flex gap-2 items-start">
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                      <span className="text-sm text-stone-600">{dq}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {feature.objections && feature.objections.length > 0 && (
                              <div className="mb-4">
                                <h4 className="font-bold text-rose-700 mb-2">Traps & Objections</h4>
                                <div className="space-y-3">
                                  {feature.objections.map((obj, i) => (
                                    <div key={i} className="bg-rose-50/50 rounded-lg p-3 border border-rose-100">
                                      <p className="font-bold text-rose-900 mb-1 text-xs">Trap: {obj.q}</p>
                                      <p className="text-rose-700 text-xs">{obj.a}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {feature.competitiveTraps && feature.competitiveTraps.length > 0 && (
                              <div className="mb-4">
                                <h4 className="font-bold text-amber-700 mb-2">Competitive Edge</h4>
                                <ul className="space-y-2">
                                  {feature.competitiveTraps.map((ct, i) => (
                                    <li key={i} className="flex gap-2 items-start">
                                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                      <span className="text-sm text-stone-600">{ct}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-indigo-50/50 border border-indigo-100 rounded-2xl mb-8 text-center">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-500 mb-4">
                      <BookOpen size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-indigo-900 mb-2">Read the Playbook</h3>
                    <p className="text-sm text-indigo-700/80 max-w-md mx-auto mb-6">
                      The core content for "{task.title}" is located in the playbook. Jump over to study the full module before completing this task.
                    </p>
                    {task.route && (
                      <button
                        onClick={() => {
                          const route = task.topicId ? `${task.route}?topic=${task.topicId}` : task.route;
                          navigate(route!);
                          onClose();
                        }}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all"
                      >
                        Go to Playbook Module <ExternalLink size={16} />
                      </button>
                    )}
                  </div>
                )}

                {task.type !== 'quiz' && (
                  <>
                    <h3 className="text-lg font-bold text-stone-900 mb-4">Module Objectives</h3>
                    <ul className="space-y-4 mb-8">
                      <li className="flex gap-3">
                        <div className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                          <Lightbulb size={12} />
                        </div>
                        <span className="text-sm text-stone-600 leading-relaxed font-medium">
                          Understand how "{task.title}" impacts the overall sales cycle.
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <div className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                          <CheckCircle2 size={12} />
                        </div>
                        <span className="text-sm text-stone-600 leading-relaxed font-medium">
                          Master the key concepts and be able to explain them to a manager during your certification.
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <div className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-sm">
                          <PlayCircle size={12} />
                        </div>
                        <span className="text-sm text-stone-600 leading-relaxed font-medium">
                          Apply these principles to your upcoming mock discovery calls.
                        </span>
                      </li>
                    </ul>
                  </>
                )}

                {/* Hide deep dive for quizzes, we handled it above */}
                {task.route && task.type !== 'quiz' && task.type === 'interactive' && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-8">
                    <h4 className="font-bold text-indigo-900 mb-2">Deep Dive</h4>
                    <p className="text-sm text-indigo-700/80 mb-4">Want to learn more? Check out the full documentation for this topic.</p>
                    <button 
                      onClick={() => {
                        const route = task.topicId ? `${task.route}?topic=${task.topicId}` : task.route;
                        navigate(route!);
                        onClose();
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-bold border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-colors"
                    >
                      Open Full Documentation <ExternalLink size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 p-6 border-t border-stone-100 bg-white flex items-center justify-between">
              <button 
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-bold text-stone-600 hover:text-stone-900 transition-colors"
              >
                Save for Later
              </button>
              
              <button
                onClick={() => {
                  onComplete(task.id);
                  onClose();
                }}
                disabled={isCompleted}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isCompleted 
                    ? 'bg-emerald-100 text-emerald-700 opacity-80 cursor-not-allowed'
                    : 'bg-[#FF2A7F] text-white hover:bg-[#e0196a] shadow-md hover:shadow-lg'
                }`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 size={16} /> Completed
                  </>
                ) : (
                  <>
                    Mark as Complete <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
