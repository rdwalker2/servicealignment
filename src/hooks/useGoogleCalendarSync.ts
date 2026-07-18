import { useState, useEffect, useCallback } from 'react';
import {
  checkGCalConnection,
  fetchGCalEvents,
  getCachedGCalEvents,
  setCachedGCalEvents,
  getLastGCalSync,
} from '../lib/googleCalendarClient';
import type { GoogleCalendarEvent } from '../lib/googleCalendarClient';

export function useGoogleCalendarSync() {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check connection on mount
  useEffect(() => {
    checkGCalConnection()
      .then((status) => {
        setIsConnected(status.connected);
        if (status.connected) {
          // Load cached events immediately
          const cached = getCachedGCalEvents();
          if (cached.length > 0) setEvents(cached);
          setLastSync(getLastGCalSync());
        }
      })
      .catch(() => {});
  }, []);

  // Sync function
  const sync = useCallback(async (months = 12) => {
    setIsSyncing(true);
    setError(null);
    try {
      const freshEvents = await fetchGCalEvents(months);
      setEvents(freshEvents);
      setCachedGCalEvents(freshEvents);
      setLastSync(new Date().toISOString());
      setIsConnected(true);
    } catch (err: any) {
      setError(err.message || 'Failed to sync');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Refresh connection status (call after OAuth popup closes)
  const refreshConnection = useCallback(async () => {
    try {
      const status = await checkGCalConnection();
      setIsConnected(status.connected);
      if (status.connected) {
        await sync();
      }
    } catch {}
  }, [sync]);

  return {
    isConnected,
    events,
    isSyncing,
    lastSync,
    error,
    sync,
    refreshConnection,
  };
}
