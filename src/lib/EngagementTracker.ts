// ============================================================
// EngagementTracker — Section-level engagement tracking
// Tracks which sections a prospect visited, for how long,
// interaction events, visit count, and page-level metrics.
// Written by ProspectRoom, read back by EngagementDashboard.
// ============================================================

import { supabase } from './supabase';

export interface SectionEngagement {
  sectionId: string;
  label: string;
  firstSeenAt: string;    // ISO timestamp
  lastSeenAt: string;     // ISO timestamp
  totalSeconds: number;
  viewCount: number;       // how many times section entered viewport
}

export interface EngagementEvent {
  type: 'page_view' | 'section_view' | 'interaction' | 'share_forward';
  sectionId?: string;
  label?: string;
  timestamp: string;
  detail?: string;        // e.g., "Clicked ROI slider", "Toggled MAP milestone"
}

export interface RoomEngagementData {
  token: string;
  company: string;
  sessionId?: string;      // Link back to DiscoverySession
  firstVisitAt: string;    // First time room was opened
  lastActiveAt: string;    // Most recent activity
  totalPageViews: number;  // Number of distinct page loads
  totalTimeSeconds: number; // Cumulative time across all visits
  currentVisitStart?: string; // Start of current visit (null if not active)
  sections: Record<string, SectionEngagement>;
  events: EngagementEvent[];
  scrollDepth: number;     // 0-100, deepest scroll position
}

const STORAGE_KEY_PREFIX = 'tt_engagement_';
const MAX_EVENTS = 100; // Cap event log

export class EngagementTracker {
  private token: string;
  private company: string;
  private sessionId?: string;
  private timers: Record<string, number> = { /* noop */ };
  private globalTimer: number | null = null;
  private supabaseSyncTimer: number | null = null;

  constructor(token: string, company: string, sessionId?: string) {
    this.token = token;
    this.company = company;
    this.sessionId = sessionId;

    // Record page view
    const data = this.load();
    data.totalPageViews += 1;
    data.currentVisitStart = new Date().toISOString();
    if (sessionId) data.sessionId = sessionId;
    this.addEvent(data, { type: 'page_view', timestamp: new Date().toISOString(), detail: 'Room opened' });
    this.save(data);

    // Track total time on page
    this.globalTimer = window.setInterval(() => {
      const d = this.load();
      d.totalTimeSeconds += 1;
      this.save(d);
    }, 1000);

    // Track scroll depth
    this.handleScroll = this.handleScroll.bind(this);
    window.addEventListener('scroll', this.handleScroll, { passive: true });

    // Sync to Supabase periodically
    this.supabaseSyncTimer = window.setInterval(() => this.syncToSupabase(), 30_000);
    setTimeout(() => this.syncToSupabase(), 3000);
  }

  private handleScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const depth = Math.round((scrollTop / docHeight) * 100);
    const data = this.load();
    if (depth > data.scrollDepth) {
      data.scrollDepth = depth;
      this.save(data);
    }
  }

  private storageKey(): string {
    return `${STORAGE_KEY_PREFIX}${this.token}`;
  }

  private load(): RoomEngagementData {
    try {
      const raw = localStorage.getItem(this.storageKey());
      if (raw) {
        const parsed = JSON.parse(raw) as RoomEngagementData;
        // Migrate old data
        if (!parsed.events) parsed.events = [];
        if (!parsed.totalPageViews) parsed.totalPageViews = 1;
        if (!parsed.totalTimeSeconds) parsed.totalTimeSeconds = 0;
        if (!parsed.scrollDepth) parsed.scrollDepth = 0;
        if (!parsed.firstVisitAt) parsed.firstVisitAt = parsed.lastActiveAt;
        return parsed;
      }
    } catch { /* noop */ }
    return {
      token: this.token,
      company: this.company,
      sessionId: this.sessionId,
      firstVisitAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      totalPageViews: 0,
      totalTimeSeconds: 0,
      sections: { /* noop */ },
      events: [],
      scrollDepth: 0,
    };
  }

  private save(data: RoomEngagementData) {
    try {
      data.lastActiveAt = new Date().toISOString();
      localStorage.setItem(this.storageKey(), JSON.stringify(data));
    } catch { /* noop */ }
  }

  private addEvent(data: RoomEngagementData, event: EngagementEvent) {
    data.events.push(event);
    if (data.events.length > MAX_EVENTS) {
      data.events = data.events.slice(-MAX_EVENTS);
    }
  }

  /** Called when a section enters the viewport */
  onSectionVisible(sectionId: string, label: string) {
    const data = this.load();

    if (!data.sections[sectionId]) {
      data.sections[sectionId] = {
        sectionId,
        label,
        firstSeenAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
        totalSeconds: 0,
        viewCount: 1,
      };
      this.addEvent(data, {
        type: 'section_view', sectionId, label,
        timestamp: new Date().toISOString(),
        detail: `First view of ${label}`,
      });
    } else {
      data.sections[sectionId].viewCount += 1;
      data.sections[sectionId].lastSeenAt = new Date().toISOString();
    }
    this.save(data);

    // Start a timer for this section
    if (this.timers[sectionId] === undefined) {
      this.timers[sectionId] = window.setInterval(() => {
        const d = this.load();
        if (d.sections[sectionId]) {
          d.sections[sectionId].totalSeconds += 1;
          this.save(d);
        }
      }, 1000);
    }
  }

  /** Called when a section leaves the viewport */
  onSectionHidden(sectionId: string) {
    if (this.timers[sectionId] !== undefined) {
      clearInterval(this.timers[sectionId]);
      delete this.timers[sectionId];
    }
  }

  /** Track an interaction event (e.g., clicking ROI slider) */
  trackInteraction(sectionId: string, detail: string) {
    const data = this.load();
    this.addEvent(data, {
      type: 'interaction', sectionId,
      timestamp: new Date().toISOString(),
      detail,
    });
    this.save(data);
  }

  /** Stop all timers */
  destroy() {
    Object.values(this.timers).forEach(clearInterval);
    this.timers = { /* noop */ };
    if (this.globalTimer !== null) {
      clearInterval(this.globalTimer);
      this.globalTimer = null;
    }
    if (this.supabaseSyncTimer !== null) {
      clearInterval(this.supabaseSyncTimer);
      this.supabaseSyncTimer = null;
    }
    window.removeEventListener('scroll', this.handleScroll);
    this.syncToSupabase();
  }

  /** Sync current engagement data to Supabase */
  private async syncToSupabase() {
    if (!this.sessionId) return;
    try {
      const data = this.load();
      const engagementPayload: Omit<RoomEngagementData, 'currentVisitStart'> & { currentVisitStart?: string } = { ...data };
      delete engagementPayload.currentVisitStart;

      const { data: row } = await supabase
        .from('discovery_sessions')
        .select('data')
        .eq('id', this.sessionId)
        .single();

      if (!row) return;

      const merged = { ...(row.data as Record<string, unknown>), room_engagement: engagementPayload };

      await supabase
        .from('discovery_sessions')
        .update({ data: merged, updated_at: new Date().toISOString() })
        .eq('id', this.sessionId);
    } catch (err) {
      console.warn('[EngagementTracker] Supabase sync failed:', err);
    }
  }

  // ── Static Helpers (used by dashboard) ──

  /** Read engagement data for a given token */
  static readEngagement(token: string): RoomEngagementData | null {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${token}`);
      if (raw) return JSON.parse(raw) as RoomEngagementData;
    } catch { /* noop */ }
    return null;
  }

  /** Find engagement data by sessionId (scans all keys) */
  static findBySessionId(sessionId: string): RoomEngagementData | null {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key?.startsWith(STORAGE_KEY_PREFIX)) continue;
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const data = JSON.parse(raw) as RoomEngagementData;
        if (data.sessionId === sessionId) return data;
      }
    } catch { /* noop */ }
    return null;
  }

  /** Get all engagement data entries */
  static getAll(): RoomEngagementData[] {
    const results: RoomEngagementData[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key?.startsWith(STORAGE_KEY_PREFIX)) continue;
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        results.push(JSON.parse(raw) as RoomEngagementData);
      }
    } catch { /* noop */ }
    return results;
  }

  /** Format seconds into a human-readable string */
  static formatTime(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }

  /** Get ordered list of sections by time spent */
  static topSections(data: RoomEngagementData, limit = 5): SectionEngagement[] {
    return Object.values(data.sections)
      .sort((a, b) => b.totalSeconds - a.totalSeconds)
      .slice(0, limit);
  }

  /** Compute "time since last active" label */
  static timeSinceActive(data: RoomEngagementData): string {
    const diff = Date.now() - new Date(data.lastActiveAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Active now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  /** Read engagement data from Supabase (cross-browser) */
  static async readFromSupabase(sessionId: string): Promise<RoomEngagementData | null> {
    try {
      const { data: row } = await supabase
        .from('discovery_sessions')
        .select('data')
        .eq('id', sessionId)
        .single();
      return (row?.data as Record<string, unknown>)?.room_engagement as RoomEngagementData ?? null;
    } catch {
      return null;
    }
  }
}
