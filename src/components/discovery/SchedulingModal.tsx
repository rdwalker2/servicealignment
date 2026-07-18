import React, { useState } from 'react';
import { X, CheckCircle, Calendar, Clock, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  propertyName?: string;
}

export function SchedulingModal({ 
  isOpen, 
  onClose, 
  propertyName 
}: Props) {
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
      // Reset after close animation
      setTimeout(() => setIsSubmitted(false), 500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col"
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
                onClick={() => {
                  onClose();
                  setTimeout(() => setIsSubmitted(false), 500);
                }}
                className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors rounded-full hover:bg-zinc-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 bg-zinc-50/50">
              {isSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-2">Audit Requested</h3>
                  <p className="text-zinc-500 max-w-sm mb-8">
                    Our dispatch team has received your request. An engineering specialist will call you within 15 minutes to confirm the drone flight time.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      setTimeout(() => setIsSubmitted(false), 500);
                    }}
                    className="px-6 py-2.5 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors"
                  >
                    Done
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">First Name</label>
                      <input required type="text" className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm" placeholder="John" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Last Name</label>
                      <input required type="text" className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm" placeholder="Doe" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Direct Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input required type="tel" className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm" placeholder="(555) 123-4567" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Preferred Call Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <select className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm appearance-none">
                        <option>As soon as possible</option>
                        <option>This morning</option>
                        <option>This afternoon</option>
                        <option>Tomorrow morning</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Calendar className="w-4 h-4" />
                          Request Drone Audit
                        </>
                      )}
                    </button>
                    <p className="text-center text-xs text-zinc-400 mt-3 flex items-center justify-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Our dispatch team is currently online
                    </p>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
