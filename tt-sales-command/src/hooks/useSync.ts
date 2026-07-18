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

    // Create a unique channel for this room
    const channel = supabase.channel(`room-${sessionId}`, {
      config: {
        broadcast: { ack: false },
      },
    });

    channel
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

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      setIsConnected(false);
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
