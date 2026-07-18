// ============================================================
// Session Timeout Warning Modal
// Shows when user has been idle for 25 minutes, giving them
// 5 minutes to extend before automatic sign-out.
// ============================================================
import { Clock } from 'lucide-react';

interface SessionTimeoutWarningProps {
  remainingSeconds: number;
  onExtend: () => void;
  onLogout: () => void;
}

export function SessionTimeoutWarning({
  remainingSeconds,
  onExtend,
  onLogout,
}: SessionTimeoutWarningProps) {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const isUrgent = remainingSeconds <= 60;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[200] transition-opacity" />

      {/* Modal */}
      <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-[fadeScaleIn_0.25s_ease-out]">
          {/* Icon + Timer */}
          <div className="p-6 pb-2 flex flex-col items-center text-center">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl mb-4 transition-colors ${
              isUrgent
                ? 'bg-red-50 text-red-500'
                : 'bg-amber-50 text-amber-500'
            }`}>
              <Clock className="h-7 w-7" />
            </div>

            <h2 className="text-base font-bold text-zinc-900 leading-tight">
              Session Expiring Soon
            </h2>
            <p className="text-sm text-zinc-500 mt-1.5">
              You've been inactive. Your session will end in:
            </p>

            {/* Countdown */}
            <div className={`mt-4 text-4xl font-bold tabular-nums tracking-tight transition-colors ${
              isUrgent ? 'text-red-600' : 'text-amber-600'
            }`}>
              {timeDisplay}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {isUrgent ? 'Signing out very soon…' : 'minutes remaining'}
            </p>
          </div>

          {/* Actions */}
          <div className="p-6 pt-4 space-y-2">
            <button
              onClick={onExtend}
              id="session-timeout-extend-btn"
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              I'm Still Here — Extend Session
            </button>
            <button
              onClick={onLogout}
              id="session-timeout-logout-btn"
              className="w-full py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              Sign Out Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
