import { motion } from 'framer-motion';
import { ArrowRight, Layers, Workflow, BarChart2 } from 'lucide-react';

interface Props {
  themeColor: string;
}

export function InterconnectedPlatform({ themeColor }: Props) {
  return (
    <div className="mt-16 text-center">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">
        The Platform Advantage
      </p>
      <h3 className="mb-10 text-2xl font-bold text-zinc-900">
        Why an All-in-One System Wins
      </h3>

      <div className="relative mx-auto max-w-4xl">
        {/* Connecting Line (Background) */}
        <div className="absolute left-[15%] right-[15%] top-1/2 h-1 -translate-y-1/2 rounded-full bg-zinc-100 hidden md:block" />
        
        <div className="relative grid gap-8 md:grid-cols-3">
          
          {/* Step 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative flex flex-col items-center"
          >
            <div className="z-10 mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-xl shadow-zinc-200/50 ring-1 ring-zinc-200">
              <Layers className="h-8 w-8 text-zinc-700" />
            </div>
            <h4 className="mb-2 text-base font-bold text-zinc-900">1. Attract & Convert</h4>
            <p className="text-sm text-zinc-500 max-w-[240px]">
              A beautiful career site captures candidate data structurally from day one, not as messy PDFs.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative flex flex-col items-center"
          >
            <div className="absolute -left-4 top-10 -translate-y-1/2 rounded-full bg-white p-1 text-zinc-300 hidden md:block z-20 shadow-sm border border-zinc-100">
              <ArrowRight size={16} />
            </div>
            
            <div className="z-10 mb-6 flex h-20 w-20 items-center justify-center rounded-2xl shadow-xl ring-1" style={{ backgroundColor: `${themeColor}10`, boxShadow: `0 20px 25px -5px ${themeColor}20`, borderColor: `${themeColor}30` }}>
              <Workflow className="h-8 w-8" style={{ color: themeColor }} />
            </div>
            <h4 className="mb-2 text-base font-bold text-zinc-900">2. Automate & AI</h4>
            <p className="text-sm text-zinc-500 max-w-[240px]">
              Because data is structured, AI can instantly screen, rank, and trigger automated workflows.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="relative flex flex-col items-center"
          >
            <div className="absolute -left-4 top-10 -translate-y-1/2 rounded-full bg-white p-1 text-zinc-300 hidden md:block z-20 shadow-sm border border-zinc-100">
              <ArrowRight size={16} />
            </div>
            
            <div className="z-10 mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-900 shadow-xl shadow-zinc-900/20 ring-1 ring-zinc-800">
              <BarChart2 className="h-8 w-8 text-white" />
            </div>
            <h4 className="mb-2 text-base font-bold text-zinc-900">3. Measure & Optimize</h4>
            <p className="text-sm text-zinc-500 max-w-[240px]">
              Every action feeds a live, central dashboard. No data silos. No exporting to Excel.
            </p>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
