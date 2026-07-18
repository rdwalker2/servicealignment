import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  propertyName?: string;
  calLink?: string;
}

export function SchedulingModal({ 
  isOpen, 
  onClose, 
  propertyName, 
  calLink = 'https://cal.com/service-alignment/discovery' 
}: Props) {
  
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
            style={{ maxHeight: '90vh' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-zinc-100 shrink-0">
              <div>
                <div className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase mb-2 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Priority Dispatch
                </div>
                <h2 className="text-2xl font-black text-zinc-900 tracking-tight leading-none mb-1">
                  Schedule Drone Audit
                </h2>
                <p className="text-sm text-zinc-500 font-medium">
                  {propertyName ? `For ${propertyName}` : 'Secure your assets with a proactive inspection.'}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors rounded-full hover:bg-zinc-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body - Cal.com Embed */}
            <div className="w-full bg-zinc-50 flex-1 overflow-hidden" style={{ minHeight: '600px' }}>
              <iframe
                src={`${calLink}?embed=true&theme=light`}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Schedule Audit"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
