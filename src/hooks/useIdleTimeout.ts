// ============================================================
// useIdleTimeout — Tracks user idle time and triggers session timeout
// SECURITY: Implements 30-minute idle session timeout per Service Alignment
// internal security policies. Shows warning modal at 25 minutes.
// ============================================================
import { useEffect, useRef, useCallback, useState } from 'react';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;    // 30 minutes
const WARNING_THRESHOLD_MS = 25 * 60 * 1000; // 25 minutes (5 min before timeout)

const ACTIVITY_EVENTS: (keyof DocumentEventMap)[] = [
  'mousemove',
  'keydown',
  'click',
  'scroll',
];

// Throttle interval for activity events to avoid excessive timer resets
const THROTTLE_MS = 5_000;

interface UseIdleTimeoutOptions {
  /** Whether the timeout is enabled (only when user is logged in) */
  enabled: boolean;
  /** Called when the session times out */
  onTimeout: () => void;
}

interface UseIdleTimeoutReturn {
  /** True when the warning modal should be shown */
  showWarning: boolean;
  /** Remaining seconds until timeout (only meaningful when showWarning is true) */
  remainingSeconds: number;
  /** Call this to dismiss the warning and reset the idle timer */
  extendSession: () => void;
}

export function useIdleTimeout({ enabled, onTimeout }: UseIdleTimeoutOptions): UseIdleTimeoutReturn {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(300); // 5 min = 300s

  const lastActivityRef = useRef(Date.now());
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const throttleRef = useRef(0);

  // Stable reference for onTimeout
  const onTimeoutRef = useRef(onTimeout);
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const clearAllTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const startTimers = useCallback(() => {
    clearAllTimers();

    const now = Date.now();
    lastActivityRef.current = now;

    // Timer to show warning at 25 minutes
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setRemainingSeconds(Math.round((IDLE_TIMEOUT_MS - WARNING_THRESHOLD_MS) / 1000));

      // Start countdown
      countdownRef.current = setInterval(() => {
        const elapsed = Date.now() - lastActivityRef.current;
        const remaining = Math.max(0, Math.round((IDLE_TIMEOUT_MS - elapsed) / 1000));
        setRemainingSeconds(remaining);

        if (remaining <= 0) {
          if (countdownRef.current) clearInterval(countdownRef.current);
        }
      }, 1000);
    }, WARNING_THRESHOLD_MS);

    // Timer to actually sign out at 30 minutes
    timeoutTimerRef.current = setTimeout(() => {
      clearAllTimers();
      setShowWarning(false);
      onTimeoutRef.current();
    }, IDLE_TIMEOUT_MS);
  }, [clearAllTimers]);

  const resetActivity = useCallback(() => {
    // Throttle resets to avoid unnecessary timer churn
    const now = Date.now();
    if (now - throttleRef.current < THROTTLE_MS) return;
    throttleRef.current = now;

    setShowWarning(false);
    startTimers();
  }, [startTimers]);

  const extendSession = useCallback(() => {
    setShowWarning(false);
    startTimers();
  }, [startTimers]);

  useEffect(() => {
    if (!enabled) {
      clearAllTimers();
      setShowWarning(false);
      return;
    }

    // Start initial timers
    startTimers();

    // Attach activity listeners
    const handler = () => resetActivity();
    ACTIVITY_EVENTS.forEach((event) => {
      document.addEventListener(event, handler, { passive: true });
    });

    return () => {
      clearAllTimers();
      ACTIVITY_EVENTS.forEach((event) => {
        document.removeEventListener(event, handler);
      });
    };
  }, [enabled, startTimers, resetActivity, clearAllTimers]);

  return { showWarning, remainingSeconds, extendSession };
}
