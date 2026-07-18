// ============================================================
// GranolaAutoSyncBadge — Realtime badge for pending auto-syncs
// Subscribes to granola_sync_queue via Supabase realtime,
// shows a pulsing count pill when items need review.
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ── Types ──────────────────────────────────────────────────────

interface GranolaAutoSyncBadgeProps {
  sessionIds: string[];
  onClick: () => void;
}

interface SyncQueueItem {
  id: string;
  session_id: string;
  status: string;
}

// ── Keyframe injection (once) ──────────────────────────────────

let stylesInjected = false;
function injectKeyframes() {
  if (stylesInjected) return;
  stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes granolaAutoSyncPulse {
      0%   { box-shadow: 0 0 0 0 rgba(240, 90, 40, 0.45); }
      70%  { box-shadow: 0 0 0 8px rgba(240, 90, 40, 0); }
      100% { box-shadow: 0 0 0 0 rgba(240, 90, 40, 0); }
    }
    @keyframes granolaAutoSyncBounce {
      0%, 100% { transform: scale(1); }
      50%      { transform: scale(1.08); }
    }
  `;
  document.head.appendChild(style);
}

// ── Component ──────────────────────────────────────────────────

export function GranolaAutoSyncBadge({ sessionIds, onClick }: GranolaAutoSyncBadgeProps) {
  const [pendingItems, setPendingItems] = useState<SyncQueueItem[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const sessionIdsRef = useRef(sessionIds);

  // Keep ref in sync for use inside subscription callbacks
  useEffect(() => {
    sessionIdsRef.current = sessionIds;
  }, [sessionIds]);

  // Inject keyframe animations on mount
  useEffect(() => {
    injectKeyframes();
  }, []);

  // Fetch initial pending items
  const fetchPending = useCallback(async () => {
    if (!sessionIds.length) {
      setPendingItems([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('granola_sync_queue')
        .select('id, session_id, status')
        .eq('status', 'pending')
        .in('session_id', sessionIds);

      if (error) {
        console.error('[GranolaAutoSyncBadge] fetch error:', error);
        return;
      }
      setPendingItems(data ?? []);
    } catch (err) {
      console.error('[GranolaAutoSyncBadge] fetch exception:', err);
    }
  }, [sessionIds]);

  // Initial fetch
  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  // Realtime subscription
  useEffect(() => {
    if (!sessionIds.length) return;

    const channel = supabase
      .channel('granola-sync-badge')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'granola_sync_queue',
          filter: `status=eq.pending`,
        },
        (payload) => {
          const record = payload.new as SyncQueueItem | undefined;
          const oldRecord = payload.old as SyncQueueItem | undefined;

          // Only care about session IDs we're tracking
          const relevantSessionIds = sessionIdsRef.current;

          if (payload.eventType === 'INSERT' && record && relevantSessionIds.includes(record.session_id)) {
            setPendingItems(prev => [...prev, record]);
          } else if (payload.eventType === 'UPDATE') {
            // Item status changed away from 'pending' — remove it
            if (oldRecord && relevantSessionIds.includes(oldRecord.session_id)) {
              if (record && record.status !== 'pending') {
                setPendingItems(prev => prev.filter(item => item.id !== record.id));
              }
            }
            // Item status changed TO 'pending' — add it
            if (record && record.status === 'pending' && relevantSessionIds.includes(record.session_id)) {
              setPendingItems(prev => {
                if (prev.some(item => item.id === record.id)) return prev;
                return [...prev, record];
              });
            }
          } else if (payload.eventType === 'DELETE' && oldRecord) {
            setPendingItems(prev => prev.filter(item => item.id !== oldRecord.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionIds]);

  // ── Render nothing when empty ──

  const count = pendingItems.length;
  if (count === 0) return null;

  // ── Styles ──

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '20px',
    backgroundColor: isHovered ? '#e04e20' : '#F05A28',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    lineHeight: 1,
    letterSpacing: '-0.01em',
    transition: 'background-color 0.2s ease, transform 0.15s ease',
    animation: 'granolaAutoSyncPulse 2s ease-in-out infinite, granolaAutoSyncBounce 3s ease-in-out infinite',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    transform: isHovered ? 'scale(1.04)' : undefined,
  };

  const iconStyle: React.CSSProperties = {
    width: '14px',
    height: '14px',
    flexShrink: 0,
    animation: count > 0 ? 'spin 3s linear infinite' : undefined,
  };

  const countBubbleStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '18px',
    height: '18px',
    borderRadius: '9px',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    color: '#fff',
    fontSize: '11px',
    fontWeight: 700,
    padding: '0 5px',
  };

  const label = count === 1 ? '1 sync pending review' : `${count} syncs pending review`;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={badgeStyle}
      title={label}
      aria-label={label}
    >
      <RefreshCw style={iconStyle} />
      <span style={countBubbleStyle}>{count}</span>
      <span>{count === 1 ? 'sync pending' : 'syncs pending'}</span>
    </button>
  );
}
