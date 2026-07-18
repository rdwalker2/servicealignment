import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export interface WorkspaceShellProps {
  children: {
    bap: React.ReactNode;
    settings: React.ReactNode;
  };
}

const TABS = [
  { id: 'bap' as const,      label: 'Buyer Action Plan' },
  { id: 'settings' as const, label: 'Room Settings'     },
];

export function WorkspaceShell({ children }: WorkspaceShellProps) {
  const [activeTab, setActiveTab] = useState<'bap' | 'settings' | 'analytics'>('bap');

  return (
    <>
      {/* ── Tab bar ── */}
      <div className="shrink-0 flex items-center gap-1 px-6 py-2 bg-white border-b border-zinc-100">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="flex flex-1 min-h-0">
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === 'bap' && (
            <motion.div key="bap" className="flex-1 min-h-0 flex"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}>
              {children.bap}
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div key="settings" className="flex-1 min-h-0 flex"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}>
              {children.settings}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
