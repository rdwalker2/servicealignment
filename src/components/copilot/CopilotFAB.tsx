// ============================================================
// Copilot FAB — Floating Action Button to open the copilot
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useCopilot } from '../../contexts/CopilotContext';
import * as Tooltip from '@radix-ui/react-tooltip';

export function CopilotFAB() {
  const { isOpen, toggle, stalledCount } = useCopilot() as any;
  const copilot = useCopilot();

  // Count stalled deals for the notification dot
  const hasNotification = copilot.copilotContext?.stalledDeals
    ? copilot.copilotContext.stalledDeals.length > 0
    : false;

  return (
    <AnimatePresence>
      {!copilot.isOpen && (
        <Tooltip.Provider delayDuration={200}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={copilot.toggle}
                className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-stone-900 hover:bg-stone-800 shadow-lg shadow-stone-900/25 flex items-center justify-center transition-colors group"
              >
                <Sparkles size={20} className="text-white group-hover:text-amber-200 transition-colors" />

                {/* Notification dot */}
                {hasNotification && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white"
                  />
                )}
              </motion.button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="left"
                sideOffset={8}
                className="z-50 bg-stone-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg"
              >
                Copilot
                <span className="text-white/40 ml-1.5">⌘J</span>
                <Tooltip.Arrow className="fill-stone-900" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      )}
    </AnimatePresence>
  );
}
