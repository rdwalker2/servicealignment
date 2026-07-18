// Google Calendar client — talks to our Express server's /api/google-calendar endpoints.
// Pattern mirrors src/lib/granolaClient.ts.

const GCAL_EVENTS_KEY = 'scc_gcal_events_v1';
const GCAL_LAST_SYNC_KEY = 'scc_gcal_last_sync';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GoogleCalendarEvent {
  id: string;
  title: string;
  start: string; // ISO datetime
  end: string;
  attendees: Array<{
    email: string;
    name: string;
    responseStatus: string;
    organizer: boolean;
  }>;
  externalAttendees: Array<{
    email: string;
    name: string;
    domain: string;
  }>;
  meetingLink: string | null;
  location: string | null;
  description: string | null;
  googleCalendarLink: string;
  isRecurring: boolean;
  source: 'google_calendar';
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

/**
 * Check whether Google Calendar is connected for the current user.
 */
export async function checkGCalConnection(): Promise<{ connected: boolean; email?: string }> {
  const response = await fetch('/api/google-calendar/status');
  if (!response.ok) {
    throw new Error(`GCal status check failed: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Open the Google OAuth authorization flow in a new window/tab.
 */
export function startGCalAuth(): void {
  window.open('/api/google-calendar/authorize', '_blank', 'width=600,height=700');
}

/**
 * Fetch calendar events from the server.
 * @param months Number of months of history to fetch (default 12).
 */
export async function fetchGCalEvents(months = 12): Promise<GoogleCalendarEvent[]> {
  const params = new URLSearchParams({
    months: String(months),
    internalDomains: 'teamtailor.com',
  });

  const response = await fetch(`/api/google-calendar/events?${params}`);
  if (!response.ok) {
    throw new Error(`GCal events fetch failed: ${response.statusText}`);
  }

  const data: { ok: boolean; count: number; events: GoogleCalendarEvent[] } =
    await response.json();

  return data.events;
}

/**
 * Disconnect the Google Calendar integration on the server and clear local cache.
 */
export async function disconnectGCal(): Promise<void> {
  const response = await fetch('/api/google-calendar/disconnect', { method: 'POST' });
  if (!response.ok) {
    throw new Error(`GCal disconnect failed: ${response.statusText}`);
  }
  clearGCalCache();
}

// ---------------------------------------------------------------------------
// Local storage helpers
// ---------------------------------------------------------------------------

export function getCachedGCalEvents(): GoogleCalendarEvent[] {
  try {
    const raw = localStorage.getItem(GCAL_EVENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GoogleCalendarEvent[];
  } catch {
    return [];
  }
}

export function setCachedGCalEvents(events: GoogleCalendarEvent[]): void {
  localStorage.setItem(GCAL_EVENTS_KEY, JSON.stringify(events));
  localStorage.setItem(GCAL_LAST_SYNC_KEY, new Date().toISOString());
}

export function getLastGCalSync(): string | null {
  return localStorage.getItem(GCAL_LAST_SYNC_KEY);
}

export function clearGCalCache(): void {
  localStorage.removeItem(GCAL_EVENTS_KEY);
  localStorage.removeItem(GCAL_LAST_SYNC_KEY);
}

// ---------------------------------------------------------------------------
// Session matching
// ---------------------------------------------------------------------------

/**
 * Match Google Calendar events to pipeline sessions by comparing external
 * attendee domains / emails against the session's company domain and contact
 * emails.
 *
 * Returns a Map of sessionId → matching events.
 */
export function matchEventsToSessions(
  events: GoogleCalendarEvent[],
  sessions: Array<{
    id: string;
    company_name: string;
    company_domain?: string;
    contacts?: Array<{ email?: string }>;
  }>,
): Map<string, GoogleCalendarEvent[]> {
  const result = new Map<string, GoogleCalendarEvent[]>();

  // Pre-build lookup structures per session
  const sessionMeta = sessions.map((s) => {
    const domain = s.company_domain?.toLowerCase().replace(/^www\./, '') ?? null;
    const contactEmails = new Set(
      (s.contacts ?? [])
        .map((c) => c.email?.toLowerCase())
        .filter(Boolean) as string[],
    );
    return { id: s.id, domain, contactEmails };
  });

  for (const event of events) {
    for (const meta of sessionMeta) {
      let matched = false;

      // 1. Domain match — any external attendee shares the company domain
      if (meta.domain) {
        for (const att of event.externalAttendees) {
          if (att.domain.toLowerCase() === meta.domain) {
            matched = true;
            break;
          }
        }
      }

      // 2. Direct email match — any attendee email matches a session contact
      if (!matched && meta.contactEmails.size > 0) {
        for (const att of event.attendees) {
          if (meta.contactEmails.has(att.email.toLowerCase())) {
            matched = true;
            break;
          }
        }
      }

      if (matched) {
        const existing = result.get(meta.id) ?? [];
        existing.push(event);
        result.set(meta.id, existing);
      }
    }
  }

  return result;
}
