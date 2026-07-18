import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Check, PlayCircle, Clock, CheckCircle2, LayoutTemplate, Layers } from 'lucide-react';
import { PLAYBOOKS } from '../data/playbooks';

export default function OperationalPlaybooks() {
  const [activePlaybookId, setActivePlaybookId] = useState(PLAYBOOKS[0].id);

  const activePlaybook = PLAYBOOKS.find(pb => pb.id === activePlaybookId) || PLAYBOOKS[0];

  return (
    <div className="flex h-full bg-white relative">
      {/* ── INTERNAL SIDEBAR (List of Playbooks) ── */}
      <div className="w-64 border-r border-stone-200/60 flex flex-col h-full bg-stone-50/50 shrink-0">
        <div className="px-5 py-4 border-b border-stone-200/60 bg-white">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-md bg-violet-100 border border-violet-200 flex items-center justify-center">
              <Layers size={12} className="text-violet-600" />
            </div>
            <h2 className="text-[13px] font-black text-stone-900 uppercase tracking-wide">Workflows</h2>
          </div>
          <p className="text-[11px] text-stone-500 leading-snug">
            Tactical operational playbooks to solve specific customer pains in Teamtailor.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {PLAYBOOKS.map((pb) => {
            const isActive = pb.id === activePlaybookId;
            return (
              <button
                key={pb.id}
                onClick={() => setActivePlaybookId(pb.id)}
                className={`w-full flex flex-col text-left px-3 py-2.5 rounded-xl transition-all border ${
                  isActive
                    ? 'bg-white border-violet-200 shadow-sm'
                    : 'border-transparent hover:bg-white hover:border-stone-200/60'
                }`}
              >
                <div className={`text-[12px] font-bold mb-0.5 ${isActive ? 'text-violet-700' : 'text-stone-700'}`}>
                  {pb.title}
                </div>
                <div className="text-[10px] text-stone-500 font-medium truncate">
                  {pb.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CONTENT AREA ── */}
      <div className="flex-1 overflow-y-auto bg-stone-50/30">
        <div className="max-w-4xl mx-auto px-8 py-8">
          
          {/* HEADER */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="px-2.5 py-1 rounded-full border border-violet-200 bg-violet-50 text-violet-700 text-[10px] font-bold uppercase tracking-widest">
                Operational Playbook
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-500">
                <Clock size={12} />
                Setup time: {activePlaybook.setupTime}
              </div>
            </div>
            <h1 className="text-3xl font-black text-stone-900 mb-2">{activePlaybook.title}</h1>
            <h2 className="text-lg font-medium text-stone-600">{activePlaybook.subtitle}</h2>
            <p className="text-[14px] text-stone-500 mt-3 leading-relaxed max-w-2xl">
              {activePlaybook.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* BEFORE */}
            <div className="rounded-2xl border border-stone-200/60 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded bg-rose-50 flex items-center justify-center">
                  <span className="text-rose-500 font-bold text-[12px]">X</span>
                </div>
                <h3 className="text-[12px] font-black text-stone-800 uppercase tracking-widest">The Pain (Before)</h3>
              </div>
              <ul className="space-y-2">
                {activePlaybook.beforeList.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-stone-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-300 mt-1.5 shrink-0" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AFTER */}
            <div className="rounded-2xl border border-stone-200/60 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded bg-emerald-50 flex items-center justify-center">
                  <Check size={14} className="text-emerald-500" />
                </div>
                <h3 className="text-[12px] font-black text-stone-800 uppercase tracking-widest">The Fix (After)</h3>
              </div>
              <ul className="space-y-2">
                {activePlaybook.afterList.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-stone-600">
                    <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AUTOMATION FLOW */}
          {activePlaybook.automationFlow.length > 0 && (
            <div className="mb-8">
              <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-widest mb-4">Automation Flow</h3>
              <div className="flex items-center gap-2 p-5 rounded-2xl border border-stone-200/60 bg-white shadow-sm overflow-x-auto">
                {activePlaybook.automationFlow.map((flow, i) => (
                  <div key={i} className="flex items-center shrink-0">
                    <div className="flex flex-col items-center justify-center bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 min-w-[140px] text-center">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">{flow.label}</span>
                      <span className="text-xl mb-2">{flow.icon}</span>
                      <span className="text-[12px] font-bold text-stone-800">{flow.name}</span>
                    </div>
                    {i < activePlaybook.automationFlow.length - 1 && (
                      <div className="w-10 h-0.5 bg-stone-200 mx-2 relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 rounded-full bg-stone-300" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETUP STEPS */}
          <div className="mb-8">
            <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-widest mb-4">Operational Setup Walkthrough</h3>
            <div className="space-y-3">
              {activePlaybook.steps.map((step, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl border border-stone-200/60 bg-white shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0 border border-stone-200 font-black text-stone-400 text-[13px]">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-stone-900 mb-1">{step.title}</h4>
                    <p className="text-[13px] text-stone-600 mb-2 leading-relaxed">{step.description}</p>
                    {step.proTip && (
                      <div className="inline-flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200/50 mt-1">
                        <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest mt-0.5">Pro Tip</span>
                        <p className="text-[12px] text-amber-900 font-medium">{step.proTip}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
