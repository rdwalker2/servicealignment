import { useState, useEffect, useCallback } from 'react';
import { fetchUpcomingCalendarEvents } from '../lib/salesloft';
import type { GoogleCalendarEvent } from '../lib/googleCalendarClient';
import { normalizeDomain } from '../lib/normalizeDomain';

const FREE_EMAIL_PROVIDERS = new Set(['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'live.com']);

// Maps Salesloft calendar events to the expected GoogleCalendarEvent interface
export function useSalesloftCalendarSync() {
  const [isConnected, setIsConnected] = useState(true); // Always true if Salesloft is connected
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sync = useCallback(async () => {
    setIsSyncing(true);
    setError(null);
    try {
      const slEvents = await fetchUpcomingCalendarEvents();
      
      const mappedEvents: GoogleCalendarEvent[] = slEvents.map(event => {
        // Parse guests for external attendees
        const attendees = event.guests.map(email => ({
          email,
          name: email.split('@')[0],
          responseStatus: 'accepted',
          organizer: false,
        }));
        
        // Add primary recipient if not in guests
        if (event.recipient_email && !event.guests.includes(event.recipient_email)) {
          attendees.push({
            email: event.recipient_email,
            name: event.recipient_email.split('@')[0],
            responseStatus: 'accepted',
            organizer: false,
          });
        }

        const externalAttendees = attendees
          .filter(a => !a.email.includes('servicealignment.com'))
          .map(a => {
            const domain = normalizeDomain(a.email.split('@')[1] || '');
            return {
              ...a,
              domain: FREE_EMAIL_PROVIDERS.has(domain) ? '' : domain // Clear domain for free providers to prevent matching
            };
          });

        return {
          id: `sl_${event.id}`,
          title: event.title || 'Meeting',
          start: event.start_time,
          end: event.end_time,
          attendees,
          externalAttendees,
          meetingLink: null,
          location: null,
          description: null,
          googleCalendarLink: '',
        };
      });

      setEvents(mappedEvents);
      setLastSync(new Date().toISOString());
    } catch (err: any) {
      setError(err.message || 'Failed to sync Salesloft calendar');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    sync();
  }, [sync]);

  return {
    isConnected,
    events,
    isSyncing,
    lastSync,
    error,
    sync,
    refreshConnection: sync,
  };
}
