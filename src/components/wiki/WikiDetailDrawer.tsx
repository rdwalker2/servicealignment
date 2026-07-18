import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, XCircle, Clock, ExternalLink, Lightbulb, Settings, Ban, FileText, Tag, HelpCircle, ChevronDown, ListChecks } from 'lucide-react';
import type { WikiFeature } from '../../data/productWiki';

interface WikiDetailDrawerProps {
  feature: WikiFeature | null;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; label: string; border: string }> = {
  automation: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', label: 'Automation' },
  screening: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200', label: 'Screening & AI' },
  communication: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200', label: 'Communication' },
  scheduling: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', label: 'Scheduling' },
  'career-site': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', label: 'Career Site' },
  analytics: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', label: 'Analytics' },
  integrations: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', label: 'Integrations' },
  promotion: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', label: 'Promotion' },
  onboarding: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', label: 'Onboarding' },
  other: { bg: 'bg-stone-50', text: 'text-stone-600', border: 'border-stone-200', label: 'Other' }
};

function QAAccordion({ qa }: { qa: { q: string, a: string } }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full px-4 py-3 flex items-start justify-between text-left hover:bg-stone-50 transition-colors"
      >
        <span className="font-semibold text-[13px] text-stone-900 pr-4 leading-snug">{qa.q}</span>
        <ChevronDown size={16} className={`text-stone-400 shrink-0 transition-transform mt-0.5 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 text-[13px] text-stone-600 leading-relaxed border-t border-stone-100 pt-3"
          >
            {qa.a}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function WikiDetailDrawer({ feature, isOpen, onClose }: WikiDetailDrawerProps) {
  // Close on esc
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!feature) return null;

  const cat = CATEGORY_COLORS[feature.category] || CATEGORY_COLORS.other;

  // Render text with line breaks as bullet points
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 1) {
      return (
        <ul className="list-disc pl-4 space-y-1">
          {lines.map((line, i) => {
            const clean = line.replace(/^[-•*]\s*/, '');
            return <li key={i}>{clean}</li>;
          })}
        </ul>
      );
    }
    return <p>{text}</p>;
  };

  const renderSteps = (text: string) => {
    // If it contains newlines, split by newline first.
    let steps = text.includes('\n') 
      ? text.split('\n').map(s => s.trim()).filter(Boolean)
      : text.split(/(?<=[a-zA-Z])\.\s+/).filter(Boolean);

    if (steps.length > 1) {
      return (
        <div className="space-y-4 pt-2">
          {steps.map((step, i) => {
            // Strip any leading "1. " or "- "
            let cleanStep = step.replace(/^(\d+\.|[-•*])\s*/, '').trim();
            if (!cleanStep.endsWith('.') && !cleanStep.endsWith('?') && !cleanStep.endsWith('!')) {
              cleanStep += '.';
            }
            return (
              <div key={i} className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-stone-100 text-stone-500 border border-stone-200 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 shadow-sm">
                  {i + 1}
                </div>
                <p className="text-[13px] text-stone-700 leading-relaxed pt-0.5">{cleanStep}</p>
              </div>
            );
          })}
        </div>
      );
    }
    return <p>{text}</p>;
  };

  const renderBullets = (text: string) => {
    let bullets = text.includes('\n')
      ? text.split('\n').map(s => s.trim()).filter(Boolean)
      : text.split(/(?<=[a-zA-Z])\.\s+/).filter(Boolean);

    if (bullets.length > 1) {
      return (
        <ul className="space-y-2">
          {bullets.map((bullet, i) => {
            let cleanBullet = bullet.replace(/^(\d+\.|[-•*])\s*/, '').trim();
            if (!cleanBullet.endsWith('.') && !cleanBullet.endsWith('?') && !cleanBullet.endsWith('!')) {
              cleanBullet += '.';
            }
            return (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                <span>{cleanBullet}</span>
              </li>
            );
          })}
        </ul>
      );
    }
    return <p>{text}</p>;
  };

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
            className="fixed inset-0 bg-stone-900/20 backdrop-blur-[1px] z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col border-l border-stone-200"
          >
            {/* Header */}
            <div className="shrink-0 p-5 border-b border-stone-100 bg-stone-50/50 flex items-start gap-4">
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cat.bg} ${cat.text} ${cat.border} border`}>
                    {cat.label}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-stone-900 mb-1 leading-tight">{feature.title}</h2>
                {feature.subtitle && <p className="text-sm text-stone-500">{feature.subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {feature.whatItDoes && (
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-stone-900 mb-3 uppercase tracking-wider">
                    <Lightbulb size={16} className="text-[#FF2A7F]" />
                    What It Does
                  </h3>
                  <div className="text-[13px] text-stone-600 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-100">
                    {renderFormattedText(feature.whatItDoes)}
                  </div>
                </section>
              )}

              {feature.howItWorks && (
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-stone-900 mb-3 uppercase tracking-wider">
                    <ListChecks size={16} className="text-stone-400" />
                    How It Works
                  </h3>
                  <div className="text-[13px] text-stone-600 leading-relaxed bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
                    {renderSteps(feature.howItWorks)}
                  </div>
                </section>
              )}

              {/* Implementation Notes (often in CS Wiki) */}
              {feature.implementationNotes && (
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-700 mb-3 uppercase tracking-wider">
                    <Settings size={16} className="text-emerald-500" />
                    Implementation Notes
                  </h3>
                  <div className="text-[13px] text-emerald-900 leading-relaxed bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    {renderBullets(feature.implementationNotes)}
                  </div>
                </section>
              )}

              {feature.whatNotToSay && (
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-rose-600 mb-3 uppercase tracking-wider">
                    <Ban size={16} />
                    What NOT to Say
                  </h3>
                  <div className="text-[13px] text-rose-700 leading-relaxed bg-rose-50 p-4 rounded-xl border border-rose-100 font-medium">
                    {renderFormattedText(feature.whatNotToSay)}
                  </div>
                </section>
              )}

              {/* CS Wiki format sometimes uses doNotSay array */}
              {feature.doNotSay && feature.doNotSay.length > 0 && (
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-rose-600 mb-3 uppercase tracking-wider">
                    <Ban size={16} />
                    What NOT to Say
                  </h3>
                  <div className="text-[13px] text-rose-700 leading-relaxed bg-rose-50 p-4 rounded-xl border border-rose-100 font-medium">
                    <ul className="list-disc pl-4 space-y-1">
                      {feature.doNotSay.map((str, i) => <li key={i}>{str}</li>)}
                    </ul>
                  </div>
                </section>
              )}

              {/* Prospect Q&A */}
              {feature.prospectQA && feature.prospectQA.length > 0 && (
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-stone-900 mb-3 uppercase tracking-wider">
                    <HelpCircle size={16} className="text-blue-500" />
                    Prospect Q&A
                  </h3>
                  <div className="space-y-3">
                    {feature.prospectQA.map((qa, i) => (
                      <QAAccordion key={i} qa={qa} />
                    ))}
                  </div>
                </section>
              )}

              {feature.valueDrivers && feature.valueDrivers.length > 0 && (
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-700 mb-3 uppercase tracking-wider">
                    <Lightbulb size={16} className="text-emerald-500" />
                    Value Drivers
                  </h3>
                  <div className="text-[13px] text-emerald-900 leading-relaxed bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    <ul className="space-y-2">
                      {feature.valueDrivers.map((vd, i) => (
                        <li key={i} className="flex gap-2 items-start">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                          <span>{vd}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              {feature.discoveryQuestions && feature.discoveryQuestions.length > 0 && (
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-blue-700 mb-3 uppercase tracking-wider">
                    <HelpCircle size={16} className="text-blue-500" />
                    Discovery Questions
                  </h3>
                  <div className="text-[13px] text-blue-900 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <ul className="space-y-2">
                      {feature.discoveryQuestions.map((dq, i) => (
                        <li key={i} className="flex gap-2 items-start">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                          <span>{dq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              {feature.objections && feature.objections.length > 0 && (
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-rose-700 mb-3 uppercase tracking-wider">
                    <AlertTriangle size={16} className="text-rose-500" />
                    Traps & Objections
                  </h3>
                  <div className="space-y-3">
                    {feature.objections.map((obj, i) => (
                      <QAAccordion key={i} qa={{ q: "Trap: " + obj.q, a: obj.a }} />
                    ))}
                  </div>
                </section>
              )}

              {feature.competitiveTraps && feature.competitiveTraps.length > 0 && (
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-amber-700 mb-3 uppercase tracking-wider">
                    <AlertTriangle size={16} className="text-amber-500" />
                    Competitive Edge
                  </h3>
                  <div className="text-[13px] text-amber-900 leading-relaxed bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                    <ul className="space-y-2">
                      {feature.competitiveTraps.map((ct, i) => (
                        <li key={i} className="flex gap-2 items-start">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                          <span>{ct}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              <div className="flex gap-4 border-t border-stone-100 pt-6">
                {feature.supportDoc && (
                  <a
                    href={feature.supportDoc}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-stone-900 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <FileText size={16} /> Support Article <ExternalLink size={14} className="opacity-50" />
                  </a>
                )}
                {feature.apiEndpoint && (
                  <div className="flex-1 flex flex-col justify-center bg-stone-50 border border-stone-200 px-4 py-2 rounded-lg text-sm">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">API Endpoint</span>
                    <code className="text-xs font-mono text-stone-900">{feature.apiEndpoint}</code>
                  </div>
                )}
              </div>

              {feature.tags && feature.tags.length > 0 && (
                <section className="pt-2">
                  <h3 className="flex items-center gap-2 text-xs font-bold text-stone-400 mb-2 uppercase tracking-wider">
                    <Tag size={14} /> Tags
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {feature.tags.map(t => (
                      <span key={t} className="px-2 py-1 rounded-md bg-stone-100 text-stone-600 text-[11px] font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
