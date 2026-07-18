import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageSquare, CheckCircle2, ChevronRight } from 'lucide-react';
import { ScriptBlock } from './DocComponents';

interface TreePath {
  objection: string;
  validate: string;
  reframe: string;
  microYes: string;
  close: string;
  closeType: 'meeting' | 'wave3' | 'callback';
}

interface PersonaTree {
  id: string;
  persona: string;
  subtitle: string;
  opener: string;
  openerNote: string;
  paths: TreePath[];
}

export function InteractiveCallTree({ tree }: { tree: PersonaTree }) {
  const [selectedPathIndex, setSelectedPathIndex] = useState<number | null>(null);

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  const activePath = selectedPathIndex !== null ? tree.paths[selectedPathIndex] : null;

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden h-[600px] flex flex-col relative">
      {/* Header bar */}
      <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FF2A7F]/10 flex items-center justify-center text-[#FF2A7F]">
            <MessageSquare size={16} />
          </div>
          <div>
            <h3 className="font-bold text-stone-800 text-[15px]">Interactive Call Simulator</h3>
            <p className="text-stone-500 text-[12px]">Persona: {tree.persona}</p>
          </div>
        </div>
        
        {/* Back button */}
        <AnimatePresence>
          {selectedPathIndex !== null && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setSelectedPathIndex(null)}
              className="flex items-center gap-2 text-[13px] font-semibold text-stone-600 bg-white border border-stone-200 px-3 py-1.5 rounded-lg hover:bg-stone-50 transition-colors"
            >
              <ArrowLeft size={14} />
              Start Over
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 relative overflow-hidden bg-white">
        <AnimatePresence mode="wait" custom={selectedPathIndex !== null ? 1 : -1}>
          
          {/* STEP 1: OPENER & OPTIONS */}
          {selectedPathIndex === null ? (
            <motion.div
              key="opener"
              custom={-1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="max-w-2xl mx-auto space-y-8 absolute inset-0 p-8 overflow-y-auto"
            >
              <div>
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">1. Deliver the Opener</p>
                <ScriptBlock label={`${tree.persona} Opener`}>{tree.opener}</ScriptBlock>
                <p className="text-[13px] text-stone-500 italic mt-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                  {tree.openerNote}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-4">2. How did they respond?</p>
                <div className="grid grid-cols-1 gap-3">
                  {tree.paths.map((path, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPathIndex(idx)}
                      className="group flex items-center justify-between p-4 bg-white border-2 border-stone-100 rounded-xl hover:border-blue-400 hover:shadow-md transition-all text-left"
                    >
                      <span className="font-medium text-stone-700 text-[14.5px] group-hover:text-blue-700">
                        {path.objection}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <ChevronRight size={16} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            
            /* STEP 2: OBJECTION HANDLING PATH */
            <motion.div
              key="path"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="max-w-3xl mx-auto absolute inset-0 p-8 overflow-y-auto"
            >
              <div className="mb-8 p-4 bg-stone-50 rounded-xl border border-stone-200">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1">They Said:</p>
                <p className="text-[15px] font-semibold text-stone-800">{activePath?.objection}</p>
              </div>

              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-200 before:to-transparent">
                
                {/* Validate */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-emerald-100 text-emerald-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                    <span className="text-[12px] font-black">1</span>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-stone-200 bg-white shadow-sm">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Validate</p>
                    <p className="text-[14px] text-stone-700 font-medium">{activePath?.validate}</p>
                  </div>
                </div>

                {/* Reframe */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-amber-100 text-amber-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                    <span className="text-[12px] font-black">2</span>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-stone-200 bg-white shadow-sm">
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Reframe</p>
                    <p className="text-[14px] text-stone-700 font-medium">{activePath?.reframe}</p>
                  </div>
                </div>

                {/* Micro-Yes */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-blue-100 text-blue-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                    <span className="text-[12px] font-black">3</span>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-stone-200 bg-white shadow-sm">
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Micro-Yes</p>
                    <p className="text-[14px] text-stone-700 font-medium">{activePath?.microYes}</p>
                  </div>
                </div>

                {/* Close */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-indigo-100 text-indigo-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                    <CheckCircle2 size={14} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border-2 border-indigo-100 bg-indigo-50/30 shadow-sm">
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">The Close</p>
                    <p className="text-[14px] text-stone-800 font-semibold">{activePath?.close}</p>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
