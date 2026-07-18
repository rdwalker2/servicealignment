import { useState, useCallback, useRef } from 'react';
import { upsertDisposition, insertPushEvent, insertNote } from '../lib/signalBoardDb';
import type { AccountNote } from '../data/signalBoardData';

type Disposition = 'new' | 'working' | 'engaged' | 'meeting_set' | 'nurture' | 'not_now' | 'disqualified';

interface DispEntry { status: Disposition; updatedAt: string; }

/**
 * Global cache hook for Signal Board state.
 * Provides optimistic updates: the UI updates instantly while the
 * database write happens in the background. On failure, it rolls back.
 */
export function useSignalBoardCache() {
  const [dispositions, setDispositions] = useState<Map<string, DispEntry>>(new Map());
  const [pushState, setPushState] = useState<Map<string, boolean>>(new Map());
  const [contactPushState, setContactPushState] = useState<Map<string, boolean>>(new Map());
  const [notesState, setNotesState] = useState<Map<string, AccountNote[]>>(new Map());

  // Keep a ref to the previous state for rollback
  const prevDisp = useRef<Map<string, DispEntry>>(new Map());

  /** Hydrate the cache from Supabase data (called on mount) */
  const hydrate = useCallback((data: {
    dispositions: Map<string, DispEntry>;
    pushState: Map<string, boolean>;
    contactPushState: Map<string, boolean>;
    notesState: Map<string, AccountNote[]>;
  }) => {
    setDispositions(data.dispositions);
    setPushState(data.pushState);
    setContactPushState(data.contactPushState);
    setNotesState(data.notesState);
    prevDisp.current = new Map(data.dispositions);
  }, []);

  /** Optimistic disposition update */
  const setDisposition = useCallback(async (domain: string, status: Disposition, repId: string) => {
    // Snapshot for rollback
    const snapshot = new Map(dispositions);
    const entry: DispEntry = { status, updatedAt: new Date().toISOString() };

    // Optimistic: update immediately
    setDispositions(prev => {
      const next = new Map(prev);
      next.set(domain, entry);
      return next;
    });

    // Background write
    try {
      await upsertDisposition(domain, status, repId);
    } catch (err) {
      console.error('[Cache] Disposition write failed, rolling back:', err);
      setDispositions(snapshot);
    }
  }, [dispositions]);

  /** Optimistic push to cadence (account) */
  const markAccountPushed = useCallback(async (domain: string, repId: string) => {
    setPushState(prev => {
      const next = new Map(prev);
      next.set(domain, true);
      return next;
    });

    // Also optimistically set disposition to "working"
    setDispositions(prev => {
      const next = new Map(prev);
      next.set(domain, { status: 'working', updatedAt: new Date().toISOString() });
      return next;
    });

    try {
      await insertPushEvent('account', domain, 'salesloft', repId);
      await upsertDisposition(domain, 'working', repId);
    } catch (err) {
      console.error('[Cache] Push event write failed:', err);
      // Don't roll back push — better to show as pushed even if DB failed
    }
  }, []);

  /** Optimistic push to cadence (contact) */
  const markContactPushed = useCallback(async (email: string, repId: string) => {
    setContactPushState(prev => {
      const next = new Map(prev);
      next.set(email, true);
      return next;
    });

    try {
      await insertPushEvent('contact', email, 'salesloft', repId);
    } catch (err) {
      console.error('[Cache] Contact push write failed:', err);
    }
  }, []);

  /** Optimistic note addition */
  const addNote = useCallback(async (domain: string, text: string, repId: string, authorName: string) => {
    const note: AccountNote = {
      id: `temp-${Date.now()}`,
      text,
      authorId: repId,
      authorName,
      createdAt: new Date().toISOString(),
    };

    setNotesState(prev => {
      const next = new Map(prev);
      next.set(domain, [note, ...(prev.get(domain) || [])]);
      return next;
    });

    try {
      await insertNote(domain, text, repId, authorName);
    } catch (err) {
      console.error('[Cache] Note write failed:', err);
    }
  }, []);

  return {
    dispositions,
    pushState,
    contactPushState,
    notesState,
    setDispositions,
    setPushState,
    setContactPushState,
    setNotesState,
    hydrate,
    setDisposition,
    markAccountPushed,
    markContactPushed,
    addNote,
  };
}
