import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useActualStore } from '../lib/stores/actualStore';
import { useGoalStore } from '../lib/stores/goalStore';
import { useCycleStore } from '../lib/stores/cycleStore';
import { useSIPStore } from '../lib/stores/sipStore';
import { useHistoricalStore } from '../lib/stores/historicalStore';

const DISCOVERY_KEY = 'scc_discovery_sessions_v3';

export function useRealtimeSync() {
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    let mounted = true;
    let isActive = true;

    async function init() {
      // Check for an active auth session before touching Supabase.
      // Without auth, the anon key can't read/write due to RLS policies,
      // which would return 0 rows and corrupt localStorage with empty data.
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Authenticated — sync with Supabase
        await autoMigrateToTables();
        await pullFromTables();

        if (isActive) {
          setupSubscriptions();
        }
      } else {
        console.log('[RealtimeSync] No auth session — relying on local seed data from ensureSeedData().');
      }

      if (mounted) {
        setIsSynced(true);
      }
    }

    init();

    // Also listen for auth state changes — when user signs in, re-sync
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' && mounted) {
        console.log('[RealtimeSync] User signed in — syncing with Supabase...');
        await pullFromTables();
        if (isActive) {
          setupSubscriptions();
        }
      }
    });

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        isActive = true;
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await pullFromTables();
          if (mounted && isActive) {
            setupSubscriptions();
          }
        }
      } else {
        isActive = false;
        supabase.removeAllChannels();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      isActive = false;
      authSub.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeAllChannels();
    };
  }, []);

  return isSynced;
}

async function autoMigrateToTables() {
  try {
    const { count } = await supabase.from('discovery_sessions').select('*', { count: 'exact', head: true });
    if (count !== null && count > 0) {
      return; // Already migrated
    }

    console.log('[RealtimeSync] Performing auto-migration to Supabase tables...');

    // Migrate Discovery Sessions
    const sessionsStr = localStorage.getItem(DISCOVERY_KEY);
    if (sessionsStr) {
      try {
        const sessions = JSON.parse(sessionsStr);
        if (Array.isArray(sessions) && sessions.length > 0) {
          const payload = sessions.map((s: any) => ({
            id: s.id,
            rep_id: s.rep_id || 'unassigned',
            data: s,
            created_at: s.created_at || new Date().toISOString(),
            updated_at: s.completed_at || new Date().toISOString()
          }));
          await supabase.from('discovery_sessions').upsert(payload);
        }
      } catch (err) {
        console.error('Migration failed for discovery sessions', err);
      }
    }

    // Migrate Actuals
    const actualsStr = localStorage.getItem('scc_weekly_actuals');
    if (actualsStr) {
      try {
        const state = JSON.parse(actualsStr).state;
        if (state && state.actuals) {
          const payload = Object.values(state.actuals).map((a: any) => ({
            id: a.id || `${a.rep_id}_${a.week_start}`,
            rep_id: a.rep_id,
            week_start: a.week_start,
            data: a
          }));
          if (payload.length > 0) await supabase.from('weekly_actuals').upsert(payload);
        }
      } catch (err) {}
    }

    // Goal Store
    const goalsStr = localStorage.getItem('scc_monthly_goals');
    if (goalsStr) {
      try {
        const state = JSON.parse(goalsStr).state;
        if (state && state.goals) {
          const payload = Object.values(state.goals).map((g: any) => ({
            id: g.id || `${g.rep_id}_${g.month_prefix}`,
            rep_id: g.rep_id,
            month_prefix: g.month_prefix,
            data: g
          }));
          if (payload.length > 0) await supabase.from('monthly_goals').upsert(payload);
        }
      } catch (err) {}
    }

    // Historical Overrides
    const histStr = localStorage.getItem('scc_historical_overrides');
    if (histStr) {
      try {
        const state = JSON.parse(histStr).state;
        if (state && state.overrides) {
          const payload: any[] = [];
          for (const [repId, monthsArr] of Object.entries(state.overrides)) {
            (monthsArr as any[]).forEach(h => {
              payload.push({
                id: `${repId}_${h.month}`,
                rep_id: repId,
                month_prefix: h.month,
                data: h
              });
            });
          }
          if (payload.length > 0) await supabase.from('historical_overrides').upsert(payload);
        }
      } catch (err) {}
    }

    // Cycle Plans
    const cycleStr = localStorage.getItem('scc_cycle_plans');
    if (cycleStr) {
      try {
        const state = JSON.parse(cycleStr).state;
        if (state && state.plans) {
          const payload = Object.values(state.plans).map((p: any) => ({
            id: p.id,
            rep_id: p.rep_id,
            cycle_id: p.cycle_id,
            data: p
          }));
          if (payload.length > 0) await supabase.from('cycle_plans').upsert(payload);
        }
      } catch (err) {}
    }

    // SIP Strategies
    const sipStr = localStorage.getItem('scc_sip_strategies');
    if (sipStr) {
      try {
        const state = JSON.parse(sipStr).state;
        if (state && state.strategies) {
          const payload = Object.values(state.strategies).map((s: any) => ({
            id: s.id,
            rep_id: s.rep_id,
            data: s
          }));
          if (payload.length > 0) await supabase.from('sip_strategies').upsert(payload);
        }
      } catch (err) {}
    }

  } catch (err) {
    console.error('[RealtimeSync] Auto-migration check failed:', err);
  }
}

async function pullFromTables() {
  // Discovery Sessions — merge with local data to preserve milestones
  const { data: sessions } = await supabase.from('discovery_sessions').select('data');
  if (sessions && sessions.length > 0) {
    // Read existing local sessions to preserve milestones that Supabase may not have
    const localRaw = localStorage.getItem(DISCOVERY_KEY);
    const localSessions: any[] = localRaw ? JSON.parse(localRaw) : [];
    const localById = new Map(localSessions.map((s: any) => [s.id, s]));
    
    const arr = sessions.map(row => {
      const remote = row.data;
      const local = localById.get(remote.id);
      // Preserve milestones from local if remote doesn't have them
      if (local?.milestones && (!remote.milestones || Object.keys(remote.milestones).length === 0)) {
        remote.milestones = local.milestones;
      }
      return remote;
    });
    
    // OVERWRITE local storage completely to remove deleted/fake deals
    localStorage.setItem(DISCOVERY_KEY, JSON.stringify(arr));
  }

  // Actuals
  const { data: actuals } = await supabase.from('weekly_actuals').select('data');
  if (actuals) {
    const record: any = {};
    actuals.forEach(row => {
      const a = row.data;
      record[`${a.rep_id}_${a.week_start}`] = a;
    });
    useActualStore.setState({ actuals: record });
  }

  // Goals
  const { data: goals } = await supabase.from('monthly_goals').select('data');
  if (goals) {
    const record: any = {};
    goals.forEach(row => {
      const g = row.data;
      record[`${g.rep_id}_${g.month_prefix}`] = g;
    });
    useGoalStore.setState({ goals: record });
  }

  // Historical
  const { data: historical } = await supabase.from('historical_overrides').select('rep_id, month_prefix, data');
  if (historical) {
    const record: Record<string, any[]> = {};
    historical.forEach(row => {
      const repId = row.rep_id;
      if (!record[repId]) record[repId] = [];
      record[repId].push(row.data);
    });
    useHistoricalStore.setState({ overrides: record });
  }

  // Cycle Plans
  const { data: cycles } = await supabase.from('cycle_plans').select('data');
  if (cycles) {
    const record: any = {};
    cycles.forEach(row => {
      const c = row.data;
      record[c.id] = c;
    });
    useCycleStore.setState({ plans: record });
  }

  // SIP
  const { data: sips } = await supabase.from('sip_strategies').select('data');
  if (sips) {
    const record: any = {};
    sips.forEach(row => {
      const s = row.data;
      record[s.id] = s;
    });
    useSIPStore.setState({ strategies: record });
  }
}

function setupSubscriptions() {
  // Prevent duplicate subscriptions across hot reloads
  supabase.removeAllChannels();

  const channel = supabase.channel('scc_realtime_sync');

  // Discovery Sessions
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'discovery_sessions' }, (payload) => {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      const row = payload.new as any;
      const arr = JSON.parse(localStorage.getItem(DISCOVERY_KEY) || '[]');
      const idx = arr.findIndex((s: any) => s.id === row.id);
      if (idx >= 0) arr[idx] = row.data;
      else arr.push(row.data);
      localStorage.setItem(DISCOVERY_KEY, JSON.stringify(arr));
      // Dispatch event so React components can re-render
      window.dispatchEvent(new CustomEvent('scc_discovery_updated'));
    } else if (payload.eventType === 'DELETE') {
      const row = payload.old as any;
      const arr = JSON.parse(localStorage.getItem(DISCOVERY_KEY) || '[]');
      const filtered = arr.filter((s: any) => s.id !== row.id);
      localStorage.setItem(DISCOVERY_KEY, JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent('scc_discovery_updated'));
    }
  });

  // Actuals
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'weekly_actuals' }, (payload) => {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      const row = payload.new as any;
      const data = row.data;
      useActualStore.setState(state => ({
        actuals: { ...state.actuals, [`${data.rep_id}_${data.week_start}`]: data }
      }));
    }
  });

  // Goals
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'monthly_goals' }, (payload) => {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      const row = payload.new as any;
      const data = row.data;
      useGoalStore.setState(state => ({
        goals: { ...state.goals, [`${data.rep_id}_${data.month_prefix}`]: data }
      }));
    }
  });

  // Historical
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'historical_overrides' }, (payload) => {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      const row = payload.new as any;
      const repId = row.rep_id;
      const data = row.data;
      useHistoricalStore.setState(state => {
        const repArr = state.overrides[repId] || [];
        const idx = repArr.findIndex((m: any) => m.month === data.month);
        const newArr = idx >= 0 ? repArr.map((m: any, i) => i === idx ? data : m) : [...repArr, data];
        return { overrides: { ...state.overrides, [repId]: newArr } };
      });
    }
  });

  // Cycle Plans
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'cycle_plans' }, (payload) => {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      const row = payload.new as any;
      const data = row.data;
      useCycleStore.setState(state => ({
        plans: { ...state.plans, [data.id]: data }
      }));
    }
  });

  // SIP Strategies
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'sip_strategies' }, (payload) => {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      const row = payload.new as any;
      const data = row.data;
      useSIPStore.setState(state => ({
        strategies: { ...state.strategies, [data.id]: data }
      }));
    }
  });

  // (Moved channel.subscribe() to the end of the function)

  // -------------------------------------------------------------------------
  // 4. Outbound Sync: Zustand -> Supabase (Diff and Push)
  // -------------------------------------------------------------------------

  useActualStore.subscribe((state, prevState) => {
    const changed = Object.values(state.actuals).filter(a => JSON.stringify(a) !== JSON.stringify(prevState.actuals[`${a.rep_id}_${a.week_start}`]));
    if (changed.length > 0) {
      const payload = changed.map((a: any) => ({ id: a.id || `${a.rep_id}_${a.week_start}`, rep_id: a.rep_id, week_start: a.week_start, data: a }));
      supabase.from('weekly_actuals').upsert(payload).then(res => { if (res.error) console.error(res.error); });
    }
  });

  useGoalStore.subscribe((state, prevState) => {
    const changed = Object.values(state.goals).filter(g => JSON.stringify(g) !== JSON.stringify(prevState.goals[`${g.rep_id}_${g.month_prefix}`]));
    if (changed.length > 0) {
      const payload = changed.map((g: any) => ({ id: g.id || `${g.rep_id}_${g.month_prefix}`, rep_id: g.rep_id, month_prefix: g.month_prefix, data: g }));
      supabase.from('monthly_goals').upsert(payload).then(res => { if (res.error) console.error(res.error); });
    }
  });

  useHistoricalStore.subscribe((state, prevState) => {
    const payload: any[] = [];
    for (const [repId, monthsArr] of Object.entries(state.overrides)) {
      const prevArr = prevState.overrides[repId] || [];
      monthsArr.forEach((h: any) => {
        const prevH = prevArr.find((m: any) => m.month === h.month);
        if (JSON.stringify(h) !== JSON.stringify(prevH)) {
          payload.push({
            id: `${repId}_${h.month}`,
            rep_id: repId,
            month_prefix: h.month,
            data: h
          });
        }
      });
    }
    if (payload.length > 0) {
      supabase.from('historical_overrides').upsert(payload).then(res => { if (res.error) console.error(res.error); });
    }
  });

  useCycleStore.subscribe((state, prevState) => {
    const changed = Object.values(state.plans).filter(p => JSON.stringify(p) !== JSON.stringify(prevState.plans[p.id]));
    if (changed.length > 0) {
      const payload = changed.map((p: any) => ({ id: p.id, rep_id: p.rep_id, cycle_id: p.cycle_id, data: p }));
      supabase.from('cycle_plans').upsert(payload).then(res => { if (res.error) console.error(res.error); });
    }
  });

  useSIPStore.subscribe((state, prevState) => {
    const changed = Object.values(state.strategies).filter(s => JSON.stringify(s) !== JSON.stringify(prevState.strategies[s.id]));
    if (changed.length > 0) {
      const payload = changed.map((s: any) => ({ id: s.id, rep_id: s.rep_id, data: s }));
      supabase.from('sip_strategies').upsert(payload).then(res => { if (res.error) console.error(res.error); });
    }
  });

  // Finally subscribe after all listeners are attached
  channel.subscribe((status, err) => {
    if (err) console.error('[RealtimeSync] Subscription error:', err);
  });
}
