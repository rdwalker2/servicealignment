// ── useAudienceRegistry ──
// Single source of truth for which audiences exist.
// Reads from audience_seeds (seed lists) and clay_signals (enriched data).
// Sidebar, routes, and pages all read from this hook.

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface AudienceEntry {
  id: string;              // audience_source tag (e.g., "rippling", "adp")
  label: string;           // Display name (e.g., "Rippling", "ADP Migration")
  seedCount: number;       // Accounts in audience_seeds
  enrichedCount: number;   // Accounts in clay_signals with this tag
  market: string;          // Primary market ("us", "ca")
  status: 'pending' | 'in_clay' | 'enriched' | 'mixed';
  createdAt: string;
}

// ── Display labels for audience IDs that don't auto-format well ──
const DISPLAY_LABELS: Record<string, string> = {
  k12: 'School Districts',
  rippling: 'Rippling',
  dayforce: 'Dayforce',
  hibob: 'HiBob',
  adp: 'ADP',
};

function formatLabel(id: string): string {
  if (DISPLAY_LABELS[id]) return DISPLAY_LABELS[id];
  return id
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function useAudienceRegistry() {
  const [audiences, setAudiences] = useState<AudienceEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // Paginated fetch — Supabase server caps at 1000 rows per request
      const PAGE = 1000;
      const seeds: { audience_source: string; market: string; status: string; created_at: string }[] = [];
      let offset = 0;
      while (true) {
        const { data } = await supabase
          .from('audience_seeds')
          .select('audience_source, market, status, created_at')
          .range(offset, offset + PAGE - 1);
        if (!data || data.length === 0) break;
        seeds.push(...data);
        if (data.length < PAGE) break;
        offset += PAGE;
      }

      // Signals (empty for now since Clay isn't connected, but paginate for future)
      const signals: { audience_source: string }[] = [];
      offset = 0;
      while (true) {
        const { data } = await supabase
          .from('clay_signals')
          .select('audience_source')
          .range(offset, offset + PAGE - 1);
        if (!data || data.length === 0) break;
        signals.push(...data);
        if (data.length < PAGE) break;
        offset += PAGE;
      }

      // Build seed map
      const seedMap = new Map<string, { count: number; market: string; statuses: Set<string>; createdAt: string }>();
      for (const row of seeds || []) {
        if (!row.audience_source) continue;
        const existing = seedMap.get(row.audience_source);
        if (existing) {
          existing.count++;
          existing.statuses.add(row.status);
          if (row.created_at < existing.createdAt) existing.createdAt = row.created_at;
        } else {
          seedMap.set(row.audience_source, {
            count: 1,
            market: row.market || 'us',
            statuses: new Set([row.status]),
            createdAt: row.created_at,
          });
        }
      }

      // Build signal count map
      const signalMap = new Map<string, number>();
      for (const row of signals || []) {
        if (!row.audience_source) continue;
        signalMap.set(row.audience_source, (signalMap.get(row.audience_source) || 0) + 1);
      }

      // Merge into unified list
      const allSources = new Set([...seedMap.keys(), ...signalMap.keys()]);
      const entries: AudienceEntry[] = [];

      for (const source of allSources) {
        const seed = seedMap.get(source);
        const enrichedCount = signalMap.get(source) || 0;
        const seedCount = seed?.count || 0;

        let status: AudienceEntry['status'] = 'pending';
        if (enrichedCount > 0 && seedCount > 0) {
          status = 'mixed';
        } else if (enrichedCount > 0) {
          status = 'enriched';
        } else if (seed?.statuses.has('sent_to_clay')) {
          status = 'in_clay';
        }

        entries.push({
          id: source,
          label: formatLabel(source),
          seedCount,
          enrichedCount,
          market: seed?.market || 'us',
          status,
          createdAt: seed?.createdAt || new Date().toISOString(),
        });
      }

      // Sort by creation date (newest first)
      entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setAudiences(entries);
    } catch (err) {
      console.error('Failed to load audience registry:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Subscribe to real-time changes
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const connect = () => {
      if (channel) return;
      channel = supabase
        .channel('audience-registry')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'audience_seeds' }, () => refresh())
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'clay_signals' }, () => refresh())
        .subscribe();
    };

    const disconnect = () => {
      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
    };

    if (document.visibilityState === 'visible') {
      connect();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refresh(); // Refresh data on returning
        connect();
      } else {
        disconnect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      disconnect();
    };
  }, [refresh]);

  return { audiences, loading, refresh };
}
