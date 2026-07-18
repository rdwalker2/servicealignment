import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { DiscoverySession } from '../lib/discoveryDatabase';

export function useSync(sessionId: string | null, onStateReceived: (newState: DiscoverySession) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const callbackRef = useRef(onStateReceived);

  // Keep callback ref up-to-date without re-subscribing the channel
  useEffect(() => {
    callbackRef.current = onStateReceived;
  }, [onStateReceived]);

  useEffect(() => {
    if (!sessionId) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    const connectChannel = () => {
      if (channel) return;

      const newChannel = supabase.channel(`room-${sessionId}`, {
        config: {
          broadcast: { ack: false },
        },
      });

      newChannel
        .on(
          'broadcast',
          { event: 'STATE_UPDATE' },
          (payload) => {
            if (payload.payload && payload.payload.session) {
              callbackRef.current(payload.payload.session as DiscoverySession);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
          } else {
            setIsConnected(false);
          }
        });

      channel = newChannel;
      channelRef.current = newChannel;
    };

    const disconnectChannel = () => {
      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
        channelRef.current = null;
        setIsConnected(false);
      }
    };

    // Connect initially if visible
    if (document.visibilityState === 'visible') {
      connectChannel();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        connectChannel();
      } else {
        disconnectChannel();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      disconnectChannel();
    };
   
  }, [sessionId]);

  const broadcastState = useCallback((session: DiscoverySession) => {
    if (channelRef.current && isConnected) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'STATE_UPDATE',
        payload: { session },
      });
    }
  }, [isConnected]);

  return { isConnected, broadcastState };
}
