// ============================================================
// AutoBridgeBanner.tsx — Smart notification banner showing
// how many room fields can be auto-populated from call data.
// Renders at the top of CMSWorkspace when bridge data is available.
// ============================================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { DiscoverySession } from '../../lib/discoveryDatabase';
import { computeBridge, applyBridge } from '../../lib/callToRoomBridge';

interface AutoBridgeBannerProps {
  session: DiscoverySession;
  onSessionChange: (session: DiscoverySession) => void;
}

export function AutoBridgeBanner({ session, onSessionChange }: AutoBridgeBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [applied, setApplied] = useState(false);

  const bridge = useMemo(() => computeBridge(session), [session]);

  // Don't show if nothing to bridge or already dismissed
  if (bridge.fieldsPopulated === 0 || dismissed) return null;

  const handleApply = () => {
    const updated = applyBridge(session, bridge);
    onSessionChange(updated);
    setApplied(true);
    // Auto-dismiss after 2s
    setTimeout(() => setDismissed(true), 2000);
  };

  if (applied) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="mx-4 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <Check size={14} className="text-emerald-600" />
          <span className="text-xs font-bold text-emerald-700">
            ✨ {bridge.fieldsPopulated} fields auto-populated from your call data
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="mx-4 mb-4 rounded-xl bg-gradient-to-r from-violet-50 to-sky-50 border border-violet-200/50 overflow-hidden"
      >
        {/* Main banner row */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
              <Sparkles size={14} className="text-violet-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-800">
                {bridge.fieldsPopulated} room field{bridge.fieldsPopulated !== 1 ? 's' : ''} ready to auto-fill
              </p>
              <p className="text-[10px] text-stone-500">
                From your Call Companion data → Room sections
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-stone-500 hover:bg-white/60 transition-colors"
            >
              Details {showDetails ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-colors shadow-sm"
            >
              <Sparkles size={12} /> Apply All
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg hover:bg-white/60 transition-colors"
            >
              <X size={12} className="text-stone-400" />
            </button>
          </div>
        </div>

        {/* Details panel */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3 space-y-1.5 border-t border-violet-100 pt-2.5">
                {bridge.summary.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <ArrowRight size={10} className="text-violet-400 shrink-0" />
                    <span className="text-[11px] text-stone-600">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

export default AutoBridgeBanner;
