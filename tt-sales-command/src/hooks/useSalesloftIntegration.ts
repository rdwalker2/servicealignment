import { useState, useEffect, useCallback } from 'react';
import { listCadences, findOrCreateAndAddToCadence, batchGetActivitySummaries, testConnection } from '../lib/salesloft';
import type { SalesloftCadence, ActivitySummary } from '../lib/salesloft';
import type { ContactView, AccountView } from '../data/signalBoardData';
import { logAudit } from '../lib/auditLog';
import { useToast } from '../components/ui/Toast';

export function useSalesloftIntegration(
  isRyanMode: boolean,
  contactPushState: Map<string, boolean>,
  accounts: AccountView[],
  effectiveUser: any,
  markAccountPushed: (id: string, userId: string) => void,
  markContactPushed: (id: string, userId: string) => void
) {
  const { toast } = useToast();
  const [slCadences, setSlCadences] = useState<SalesloftCadence[]>([]);
  const [selectedCadenceId, setSelectedCadenceId] = useState<number | null>(() => {
    const saved = localStorage.getItem('scc_selected_cadence_id');
    return saved ? parseInt(saved) : null;
  });
  const [showCadencePicker, setShowCadencePicker] = useState(false);
  const [pendingPushTarget, setPendingPushTarget] = useState<{ type: 'account' | 'contact'; id: string; contact?: ContactView } | null>(null);
  const [slActivity, setSlActivity] = useState<Map<string, ActivitySummary>>(new Map());
  const [slConnected, setSlConnected] = useState<boolean | null>(null);
  const [pushingId, setPushingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadSalesloft() {
      try {
        const connected = await testConnection();
        if (!cancelled) setSlConnected(connected);
        if (connected) {
          const cadences = await listCadences();
          if (!cancelled) setSlCadences(cadences.filter(c => c.current_state === 'active'));
        }
      } catch {
        if (!cancelled) setSlConnected(false);
      }
    }
    if (!isRyanMode) loadSalesloft();
    return () => { cancelled = true; };
  }, [isRyanMode]);

  useEffect(() => {
    if (isRyanMode || contactPushState.size === 0) return;
    let cancelled = false;
    async function fetchActivity() {
      const pushedEmails = Array.from(contactPushState.keys());
      if (pushedEmails.length === 0) return;
      try {
        const summaries = await batchGetActivitySummaries(pushedEmails);
        if (!cancelled) setSlActivity(summaries);
      } catch (err) {
        console.warn('[Salesloft] Activity fetch failed:', err);
      }
    }
    fetchActivity();
    return () => { cancelled = true; };
  }, [contactPushState, isRyanMode]);

  const executeCadencePush = useCallback(async (type: 'account' | 'contact', id: string, contact?: ContactView) => {
    if (!selectedCadenceId) {
      setPendingPushTarget({ type, id, contact });
      setShowCadencePicker(true);
      return;
    }

    setPushingId(id);
    const contactName = contact?.name || (type === 'contact' ? id : 'contact');
    let pushSucceeded = true;

    if (!isRyanMode) {
      try {
        const c = contact || accounts.flatMap(a => a.contacts).find(c => c.email === id);
        if (c) {
          const [firstName, ...lastParts] = c.name.split(' ');
          await findOrCreateAndAddToCadence(
            { email: c.email, firstName, lastName: lastParts.join(' ') || firstName, title: c.title, companyName: c.companyName },
            selectedCadenceId
          );
        }
      } catch (err) {
        console.error('[Salesloft] Push failed:', err);
        pushSucceeded = false;
        toast(`Couldn't add ${contactName} — check Salesloft connection`, 'error');
      }
    }

    if (pushSucceeded) {
      if (type === 'account') {
        markAccountPushed(id, effectiveUser?.id || 'unknown');
      } else {
        markContactPushed(id, effectiveUser?.id || 'unknown');
      }
      toast(
        isRyanMode
          ? `${contactName} added to Instantly`
          : `${contactName} added to cadence`,
        'success'
      );
    }

    setPushingId(null);
  }, [isRyanMode, effectiveUser, selectedCadenceId, accounts, markAccountPushed, markContactPushed, toast]);


  const handleAddToCadence = useCallback((domain: string) => {
    const acct = accounts.find(a => a.companyDomain === domain);
    const primaryContact = acct?.contacts[0];
    logAudit({ user_id: effectiveUser?.id || 'unknown', action: 'push_to_cadence', target_type: 'account', target_id: domain, metadata: { contact_email: primaryContact?.email } });
    executeCadencePush('account', domain, primaryContact);
  }, [executeCadencePush, accounts, effectiveUser]);

  const handleContactAddToCadence = useCallback((email: string) => {
    const contact = accounts.flatMap(a => a.contacts).find(c => c.email === email);
    logAudit({ user_id: effectiveUser?.id || 'unknown', action: 'push_to_cadence', target_type: 'contact', target_id: email });
    executeCadencePush('contact', email, contact);
  }, [executeCadencePush, accounts, effectiveUser]);

  return {
    slCadences, setSlCadences,
    selectedCadenceId, setSelectedCadenceId,
    showCadencePicker, setShowCadencePicker,
    pendingPushTarget, setPendingPushTarget,
    slActivity, setSlActivity,
    slConnected, setSlConnected,
    pushingId, setPushingId,
    executeCadencePush,
    handleAddToCadence,
    handleContactAddToCadence
  };
}
