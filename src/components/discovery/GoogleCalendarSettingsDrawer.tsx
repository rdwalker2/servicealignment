import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Unplug,
} from 'lucide-react';
import { startGCalAuth, disconnectGCal, clearGCalCache } from '../../lib/googleCalendarClient';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface GoogleCalendarSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  isSyncing: boolean;
  lastSync: string | null;
  eventCount: number;
  onConnect: () => void; // triggers OAuth
  onSync: () => void;
  onDisconnect: () => void;
  onRefreshConnection: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GoogleCalendarSettingsDrawer({
  isOpen,
  onClose,
  isConnected,
  isSyncing,
  lastSync,
  eventCount,
  onConnect,
  onSync,
  onDisconnect,
  onRefreshConnection,
}: GoogleCalendarSettingsDrawerProps) {
  const [disconnecting, setDisconnecting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up polling on unmount or close
  useEffect(() => {
    if (!isOpen && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isOpen]);

  // Stop polling once we detect a connection
  useEffect(() => {
    if (isConnected && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, [isConnected]);

  if (!isOpen) return null;

  // ── Handlers ──

  const handleConnect = () => {
    onConnect();
    // Poll for connection status every 2 s after popup opens
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      onRefreshConnection();
    }, 2000);

    // Stop polling after 5 minutes max
    setTimeout(() => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }, 5 * 60 * 1000);
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await disconnectGCal();
      onDisconnect();
    } catch {
      // best-effort
    } finally {
      setDisconnecting(false);
    }
  };

  const formatLastSync = (iso: string | null): string => {
    if (!iso) return 'Never';
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  // ── Render ──

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed inset-y-0 right-0 w-[400px] bg-white shadow-2xl z-[110] flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4285F4]/10 text-[#4285F4]">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Google Calendar</h2>
              <p className="text-sm text-stone-500">Sync your external meetings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ── Connection Status ── */}
          {isConnected ? (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-100">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <p>Google Calendar connected</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-700 text-sm rounded-lg border border-amber-100">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>Google Calendar not connected</p>
            </div>
          )}

          {/* ── Connect / Status Section ── */}
          {!isConnected ? (
            <>
              {/* Instructions */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-stone-900 mb-2">
                  Connect your Google Calendar
                </h3>
                <ol className="list-decimal list-inside text-sm text-stone-600 space-y-1.5">
                  <li>Click the button below to authorize with Google</li>
                  <li>Sign in and grant calendar read access</li>
                  <li>Your external meetings will sync automatically</li>
                </ol>
                <p className="text-xs text-stone-400 mt-3 leading-relaxed">
                  We only read your calendar events — we never create, modify, or
                  delete anything on your calendar.
                </p>
              </div>

              {/* Connect button — Google brand style */}
              <button
                onClick={handleConnect}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-[#4285F4] hover:bg-[#3367D6] text-white text-sm font-medium rounded-lg transition-all shadow-sm"
              >
                {/* Google Calendar icon (inline SVG) */}
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M3 9h18" stroke="currentColor" strokeWidth="2" />
                  <path d="M9 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M15 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <rect x="7" y="12" width="3" height="3" rx="0.5" fill="currentColor" />
                  <rect x="14" y="12" width="3" height="3" rx="0.5" fill="currentColor" />
                  <rect x="7" y="17" width="3" height="3" rx="0.5" fill="currentColor" />
                </svg>
                Connect Google Calendar
              </button>
            </>
          ) : (
            <>
              {/* Sync stats */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-stone-900 mb-1">Sync Status</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg border border-stone-200 p-3">
                    <p className="text-xs text-stone-500">Events Synced</p>
                    <p className="text-lg font-bold text-stone-900">{eventCount}</p>
                  </div>
                  <div className="bg-white rounded-lg border border-stone-200 p-3">
                    <p className="text-xs text-stone-500">Last Sync</p>
                    <p className="text-sm font-semibold text-stone-900">
                      {formatLastSync(lastSync)}
                    </p>
                  </div>
                </div>

                {/* Sync Now */}
                <button
                  onClick={onSync}
                  disabled={isSyncing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4285F4] hover:bg-[#3367D6] text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Syncing…
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Sync Now
                    </>
                  )}
                </button>
              </div>

              {/* ── Divider ── */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-xs font-medium text-stone-400">What gets synced</span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>

              {/* Explanation */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-stone-900 mb-2">
                  How calendar sync works
                </h3>
                <ul className="text-sm text-stone-600 space-y-1.5 list-disc list-inside">
                  <li>Imports external meetings from the past 12 months</li>
                  <li>
                    Matches meetings to your pipeline by comparing attendee
                    domains to company domains
                  </li>
                  <li>Shows meeting history on each deal card</li>
                  <li>Only reads events — nothing is ever modified</li>
                </ul>
              </div>

              {/* ── Divider ── */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-xs font-medium text-stone-400">Danger Zone</span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>

              {/* Disconnect */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                    <Unplug className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900">Disconnect</h3>
                    <p className="text-xs text-stone-500">
                      Remove Google Calendar access
                    </p>
                  </div>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed">
                  This will revoke calendar access and clear all cached events.
                  You can reconnect at any time.
                </p>
                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-rose-50 text-rose-600 text-sm font-medium rounded-lg border border-rose-200 hover:border-rose-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {disconnecting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Disconnecting…
                    </>
                  ) : (
                    <>
                      <Unplug className="h-4 w-4" />
                      Disconnect Google Calendar
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-stone-100 bg-stone-50/50">
          <a
            href="https://support.google.com/calendar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-700 transition-colors"
          >
            Google Calendar Help <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </>
  );
}
