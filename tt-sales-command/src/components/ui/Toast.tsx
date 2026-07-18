/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export interface ToastItem { id: string; message: string; type: ToastType; }

const ToastContext = createContext<(msg: string, type?: ToastType, duration?: number) => void>(() => {});

export function useToast() {
  const addToast = useContext(ToastContext);
  return { toast: addToast };
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'success', duration = 2500) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const icons = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info };
  const styles = {
    success: 'bg-emerald-950 border-emerald-800/60 text-emerald-200',
    error: 'bg-rose-950 border-rose-800/60 text-rose-200',
    warning: 'bg-amber-950 border-amber-800/60 text-amber-200',
    info: 'bg-zinc-900 border-zinc-700/60 text-zinc-200',
  };
  const iconColors = { success: 'text-emerald-400', error: 'text-rose-400', warning: 'text-amber-400', info: 'text-zinc-400' };

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => {
            const Icon = icons[t.type];
            return (
              <motion.div key={t.id}
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium min-w-[220px] max-w-[360px] cursor-pointer ${styles[t.type]}`}
                onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              >
                <Icon size={16} className={iconColors[t.type]} />
                <span className="flex-1">{t.message}</span>
                <X size={13} className="opacity-50" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
