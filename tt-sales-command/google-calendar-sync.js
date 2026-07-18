// Google Calendar Sync — fetch, filter, and transform calendar events
import { getAccessToken } from './google-calendar-auth.js';

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

const EVENT_FIELDS = [
  'items(id,summary,description,start,end,attendees,organizer,creator,',
  'conferenceData,hangoutLink,htmlLink,status,location,recurringEventId),',
  'nextPageToken',
].join('');

/**
 * Fetch a single page of events from a Google Calendar.
 */
export async function fetchEvents({
  timeMin,
  timeMax,
  calendarId = 'primary',
  pageToken,
} = {}) {
  const accessToken = await getAccessToken();

  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
    fields: EVENT_FIELDS,
  });

  if (timeMin) params.set('timeMin', timeMin);
  if (timeMax) params.set('timeMax', timeMax);
  if (pageToken) params.set('pageToken', pageToken);

  const url = `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Calendar API error: ${res.status} — ${body}`);
  }

  return res.json();
}

/**
 * Paginate through ALL events for the past N months.
 */
export async function fetchAllEvents({ months = 12 } = {}) {
  const now = new Date();
  const timeMax = now.toISOString();
  const timeMin = new Date(now.getFullYear(), now.getMonth() - months, now.getDate()).toISOString();

  const allEvents = [];
  let pageToken = undefined;
  let page = 0;

  do {
    page++;
    console.log(`[GCal Sync] Fetching page ${page}...`);

    const data = await fetchEvents({ timeMin, timeMax, pageToken });
    const items = data.items || [];
    allEvents.push(...items);
    pageToken = data.nextPageToken;

    console.log(`[GCal Sync] Page ${page}: ${items.length} events (total: ${allEvents.length})`);
  } while (pageToken);

  console.log(`[GCal Sync] Fetched ${allEvents.length} total events over ${months} months`);
  return allEvents;
}

/**
 * Filter to only meetings that have at least one external attendee.
 * Skips all-day events and cancelled events.
 */
export function filterExternalMeetings(events, internalDomains = ['teamtailor.com']) {
  const internalSet = new Set(internalDomains.map(d => d.toLowerCase()));

  return events.filter(event => {
    // Skip cancelled events
    if (event.status === 'cancelled') return false;

    // Skip all-day events (they have a 'date' field instead of 'dateTime')
    if (event.start?.date && !event.start?.dateTime) return false;

    // Must have attendees
    if (!event.attendees || event.attendees.length === 0) return false;

    // At least one attendee must be external
    const hasExternal = event.attendees.some(att => {
      if (!att.email) return false;
      const domain = att.email.split('@')[1]?.toLowerCase();
      if (!domain) return false;
      return !internalSet.has(domain);
    });

    return hasExternal;
  });
}

/**
 * Transform raw Google Calendar events into a simpler, normalized format.
 */
export function transformToCalendarEvents(googleEvents) {
  return googleEvents.map(event => {
    const attendees = (event.attendees || []).map(att => ({
      email: att.email,
      name: att.displayName || null,
      responseStatus: att.responseStatus || null,
      organizer: att.organizer || false,
    }));

    const externalAttendees = attendees
      .filter(att => {
        if (!att.email) return false;
        const domain = att.email.split('@')[1]?.toLowerCase();
        return domain && domain !== 'teamtailor.com';
      })
      .map(att => ({
        email: att.email,
        name: att.name,
        domain: att.email.split('@')[1]?.toLowerCase(),
      }));

    // Prefer conferenceData entry points, fall back to hangoutLink
    let meetingLink = null;
    if (event.conferenceData?.entryPoints) {
      const videoEntry = event.conferenceData.entryPoints.find(ep => ep.entryPointType === 'video');
      if (videoEntry) meetingLink = videoEntry.uri;
    }
    if (!meetingLink && event.hangoutLink) {
      meetingLink = event.hangoutLink;
    }

    return {
      id: event.id,
      title: event.summary || '(No title)',
      start: event.start?.dateTime || event.start?.date || null,
      end: event.end?.dateTime || event.end?.date || null,
      attendees,
      externalAttendees,
      meetingLink,
      location: event.location || null,
      description: event.description || null,
      googleCalendarLink: event.htmlLink || null,
      isRecurring: !!event.recurringEventId,
      source: 'google_calendar',
    };
  });
}
