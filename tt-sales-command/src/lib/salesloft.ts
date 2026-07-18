// ============================================================
// Salesloft API Client
// Handles all communication with Salesloft REST API v2
// SECURITY: API key is injected server-side by the Vite proxy.
// This client sends NO credentials — the proxy handles auth.
// ============================================================

const BASE = '/salesloft-api/v2';

// No auth headers here — the Vite proxy injects Authorization server-side
const headers = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

// ── Generic fetch helper ──
async function sl<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await slRaw(path, options);
  if (!res.ok) {
    const body = await res.text();
    console.error(`[Salesloft] ${res.status} ${path}:`, body);
    throw new Error(`Salesloft API error: ${res.status}`);
  }
  return res.json();
}

async function slRaw(path: string, options?: RequestInit): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...headers(), ...options?.headers },
  });
}

// ── Rate-limit-aware fetch ──
async function slWithRateLimit<T>(path: string, options?: RequestInit): Promise<{ data: T; remaining: number; retryAfter: number }> {
  const res = await slRaw(path, options);

  const remaining = parseInt(res.headers.get('x-ratelimit-remaining') || '600', 10);
  const retryAfter = parseInt(res.headers.get('retry-after') || '0', 10);

  if (res.status === 429) {
    // Rate limited — caller should wait and retry
    return { data: null as unknown as T, remaining: 0, retryAfter: Math.max(retryAfter, 5) };
  }

  if (!res.ok) {
    const body = await res.text();
    console.error(`[Salesloft] ${res.status} ${path}:`, body);
    throw new Error(`Salesloft API error: ${res.status}`);
  }
  return { data: await res.json(), remaining, retryAfter: 0 };
}

// ── App User Mapping ──
// Maps our internal rep IDs to SalesLoft User IDs and GUIDs
export const REP_SALESLOFT_MAPPING: Record<string, { id: number, guid: string }> = {
  'rep-jl': { id: 12457, guid: '5b01a11c-6e1b-4312-8487-55542a9f1578' },
  'rep-ma': { id: 12427, guid: '0a9c8f1e-31d7-40d6-84d9-d7b42531e07b' },
  'rep-th': { id: 12418, guid: 'd3e9a1f1-2c4b-4f8e-8d5a-9b7c3e1f2a4d' },
};

// ── Types ──

export interface SalesloftPerson {
  id: number;
  email_address: string;
  first_name: string;
  last_name: string;
  title?: string;
  counts: {
    emails_sent: number;
    emails_viewed: number;
    emails_replied_to: number;
    emails_bounced: number;
    calls: number;
  };
}

export interface SalesloftCadence {
  id: number;
  name: string;
  cadence_framework_id?: number;
  current_state?: string;
  counts?: {
    cadence_people?: number;
  };
}

export interface CadenceMembership {
  id: number;
  person_id: number;
  cadence_id: number;
}

export interface ActivitySummary {
  emails_sent: number;
  emails_viewed: number;
  emails_replied: number;
  calls: number;
  meetings_booked: number;
  meetings_held: number;
  total_touches: number;
  has_reply: boolean;
  has_meeting: boolean;
}

export interface TimelineEvent {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  title: string;
  description: string;
  timestamp: string;
  author: string;
}

/** List available cadences */
export async function listCadences(): Promise<SalesloftCadence[]> {
  if (import.meta.env.VITE_AUTH_MODE === 'dev') {
    return [
      { id: 1, name: '🎯 Tier 1 — Rippling Displacement', current_state: 'active' },
      { id: 2, name: '⚡ Tier 2 — General HR/ATS', current_state: 'active' },
      { id: 3, name: '🌊 K-12 Power Sequence', current_state: 'active' },
    ];
  }
  const data = await sl<{ data: SalesloftCadence[] }>('/cadences.json?per_page=100');
  return data.data;
}

/** Find a person by email */
export async function findPersonByEmail(email: string): Promise<SalesloftPerson | null> {
  const data = await sl<{ data: SalesloftPerson[] }>(`/people.json?email_addresses[]=${encodeURIComponent(email)}`);
  return data.data[0] || null;
}

/** Create a person */
export async function createPerson(person: {
  email_address: string;
  first_name: string;
  last_name: string;
  title?: string;
  phone?: string;
  company_name?: string;
}): Promise<SalesloftPerson> {
  const data = await sl<{ data: SalesloftPerson }>('/people.json', {
    method: 'POST',
    body: JSON.stringify(person),
  });
  return data.data;
}

/** Add person to cadence */
export async function addToCadence(personId: number, cadenceId: number): Promise<CadenceMembership> {
  const data = await sl<{ data: CadenceMembership }>('/cadence_memberships.json', {
    method: 'POST',
    body: JSON.stringify({ person_id: personId, cadence_id: cadenceId }),
  });
  return data.data;
}

/** Update a person's contact stage in SalesLoft (e.g., 'new' → 'working') */
export async function updatePersonStage(personId: number, stage: string): Promise<void> {
  try {
    await sl<{ data: SalesloftPerson }>(`/people/${personId}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ contact_stage_id: null, custom_fields: {}, person: { contact_stage: stage } }),
    });
    // Stage updated
  } catch (err) {
    // Try the alternative field name — SalesLoft API can be inconsistent
    try {
      await sl<{ data: unknown }>(`/people/${personId}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ stage }),
      });
      // Stage updated (alt)
    } catch (err2) {
      console.warn(`[Salesloft] Could not update person stage for ${personId}:`, err2);
      // Non-fatal — cadence enrollment still succeeded
    }
  }
}

/** Get booked meetings for a person */
export async function getBookedMeetings(personId: number): Promise<Array<{ id: number; start_time: string; status: string; title: string }>> {
  const data = await sl<{ data: Array<{ id: number; start_time: string; status: string; title: string }> }>(`/meetings.json?person_id=${personId}&per_page=25`);
  return data.data;
}

/** Get activity timeline for a contact */
export async function getContactActivityTimeline(email: string): Promise<TimelineEvent[]> {
  const person = await findPersonByEmail(email);
  if (!person) return [];

  const events: TimelineEvent[] = [];

  // Emails
  try {
    const emailData = await sl<{ data: Array<{ id: number; subject: string; status: string; sent_at: string; click_count: number; view_count: number }> }>(
      `/activities/emails.json?person_id=${person.id}&per_page=10&sort_by=sent_at&sort_direction=desc`
    );
    for (const e of emailData.data) {
      events.push({
        id: `email-${e.id}`,
        type: 'email',
        title: e.subject || 'Email',
        description: `Status: ${e.status} · ${e.view_count} views · ${e.click_count} clicks`,
        timestamp: e.sent_at,
        author: 'SalesLoft',
      });
    }
  } catch { /* ignore */ }

  // Calls
  try {
    const callData = await sl<{ data: Array<{ id: number; disposition: string; duration: number; created_at: string; sentiment: string }> }>(
      `/activities/calls.json?person_id=${person.id}&per_page=10&sort_by=created_at&sort_direction=desc`
    );
    for (const c of callData.data) {
      events.push({
        id: `call-${c.id}`,
        type: 'call',
        title: `Call — ${c.disposition || 'No disposition'}`,
        description: `Duration: ${Math.round(c.duration / 60)}m · Sentiment: ${c.sentiment || 'N/A'}`,
        timestamp: c.created_at,
        author: 'SalesLoft',
      });
    }
  } catch { /* ignore */ }

  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return events;
}

/** 
 * Get a full activity summary for a contact by email.
 * This is the main function the Signal Board uses — one call to get everything.
 */
export async function getContactActivitySummary(email: string): Promise<ActivitySummary | null> {
  const person = await findPersonByEmail(email);
  if (!person) return null;

  const counts = person.counts;
  
  // Check for booked meetings
  let meetings: Array<{ id: number; start_time: string; status: string; title: string }> = [];
  try {
    meetings = await getBookedMeetings(person.id);
  } catch { /* ignore */ }

  const meetingsBooked = meetings.length;
  const meetingsHeld = meetings.filter(m => new Date(m.start_time).getTime() < Date.now()).length;

  return {
    emails_sent: counts.emails_sent,
    emails_viewed: counts.emails_viewed,
    emails_replied: counts.emails_replied_to,
    calls: counts.calls,
    meetings_booked: meetingsBooked,
    meetings_held: meetingsHeld,
    total_touches: counts.emails_sent + counts.calls,
    has_reply: counts.emails_replied_to > 0,
    has_meeting: meetingsBooked > 0,
  };
}

/**
 * Batch fetch activity summaries for multiple contacts.
 * Uses a rate-limit-aware queue that processes in chunks,
 * reads x-ratelimit-remaining headers, and retries on 429.
 */
export async function batchGetActivitySummaries(
  emails: string[]
): Promise<Map<string, ActivitySummary>> {
  const results = new Map<string, ActivitySummary>();
  const CHUNK_SIZE = 20;
  const BASE_DELAY_MS = 120;
  const MAX_RETRIES = 3;

  for (let i = 0; i < emails.length; i += CHUNK_SIZE) {
    const chunk = emails.slice(i, i + CHUNK_SIZE);

    for (const email of chunk) {
      let retries = 0;
      let success = false;

      while (!success && retries < MAX_RETRIES) {
        try {
          const summary = await getContactActivitySummary(email);
          if (summary) {
            results.set(email, summary);
          }
          success = true;
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          if (errMsg.includes('429') || errMsg.includes('rate')) {
            retries++;
            const backoff = BASE_DELAY_MS * Math.pow(2, retries);
            console.warn(`[Salesloft] Rate limited on ${email}, retry ${retries}/${MAX_RETRIES} in ${backoff}ms`);
            await new Promise(r => setTimeout(r, backoff));
          } else {
            console.warn(`[Salesloft] Failed to fetch activity for ${email}:`, err);
            break; // Non-rate-limit error, skip this email
          }
        }
      }

      // Small delay between each request to stay under 600/min
      await new Promise(r => setTimeout(r, BASE_DELAY_MS));
    }

    // Pause between chunks to let the rate limit breathe
    if (i + CHUNK_SIZE < emails.length) {
      // Pause between chunks
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  return results;
}

/**
 * Find or create a person, then add to cadence.
 * Returns the cadence membership.
 */
export async function findOrCreateAndAddToCadence(
  contact: { email: string; firstName: string; lastName: string; title?: string; phone?: string; companyName?: string },
  cadenceId: number
): Promise<{ person: SalesloftPerson; membership: CadenceMembership }> {
  // Find or create
  let person = await findPersonByEmail(contact.email);
  if (!person) {
    person = await createPerson({
      email_address: contact.email,
      first_name: contact.firstName,
      last_name: contact.lastName,
      title: contact.title,
      phone: contact.phone,
      company_name: contact.companyName,
    });
  }

  // Add to cadence
  const membership = await addToCadence(person.id, cadenceId);

  // Sync contact status to 'working' in SalesLoft so native reporting reflects the change
  await updatePersonStage(person.id, 'Working');

  return { person, membership };
}

/** Quick connectivity test — fetches first page of people */
export async function testConnection(): Promise<boolean> {
  if (import.meta.env.VITE_AUTH_MODE === 'dev') return true;
  try {
    await sl<{ data: unknown[] }>('/people.json?per_page=1');
    return true;
  } catch {
    return false;
  }
}

/** 
 * Pull Dials, Emails Sent, and Phone Conversations (>= 2m) for a rep for a specific week.
 * This powers the WeeklyTracker auto-sync.
 */
export async function getRepActivityForWeek(
  repId: string,
  weekStartStr: string
): Promise<{ dials: number; conversations: number; emails_sent: number } | null> {
  const slUser = REP_SALESLOFT_MAPPING[repId];
  if (!slUser) return null;

  try {
    // Determine the date range for the week (Monday -> next Monday)
    const start = new Date(weekStartStr + 'T00:00:00');
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    
    // Format to ISO with microsecond precision for SalesLoft API
    const startIso = start.toISOString().replace(/\.\d+Z$/, '.000000Z');
    const endIso = end.toISOString().replace(/\.\d+Z$/, '.000000Z');
    
    // Helper to fetch all pages
    const fetchAllPages = async (endpoint: string) => {
      let allData: any[] = [];
      let page = 1;
      while (true) {
        const res = await sl<{ data: any[] }>(`${endpoint}&page=${page}&per_page=100`);
        if (!res.data || res.data.length === 0) break;
        allData = allData.concat(res.data);
        if (res.data.length < 100) break;
        page++;
      }
      return allData;
    };

    // Fetch calls (MUST use user_guid)
    const calls = await fetchAllPages(`/activities/calls.json?user_guid[]=${slUser.guid}&created_at[gte]=${startIso}&created_at[lt]=${endIso}`);
    
    // Fetch emails (MUST use user_id)
    const emails = await fetchAllPages(`/activities/emails.json?user_id[]=${slUser.id}&sent_at[gte]=${startIso}&sent_at[lt]=${endIso}`);
    
    // Calculate metrics
    const dials = calls.length;
    // Phone conversations: duration >= 120 seconds
    const conversations = calls.filter(c => (c.duration || 0) >= 120).length;
    
    // Emails sent: exclude bounces. Salesloft email status can be null or 'sent'
    const emailsSent = emails.filter(e => !e.bounced).length;
    
    return {
      dials,
      conversations,
      emails_sent: emailsSent
    };
  } catch (err) {
    console.error(`[Salesloft] Failed to fetch week activity for ${repId}:`, err);
    return null;
  }
}
