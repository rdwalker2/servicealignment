import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { DealPostMortem } from './DealPostMortem';
import type { DiscoverySession } from '../../lib/discoveryDatabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  session: DiscoverySession;
  onSave: (symptoms: string[], analysis: any) => void;
}

export function DealPostMortemModal({ isOpen, onClose, session, onSave }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-zinc-50 shadow-2xl relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 z-10 rounded-lg p-2 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 transition-colors bg-white shadow-sm border border-zinc-100">
              <X size={20} />
            </button>
            <div className="p-6">
              <DealPostMortem 
                session={session} 
                onSave={(symptoms, analysis) => {
                  onSave(symptoms, analysis);
                  onClose();
                }} 
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
