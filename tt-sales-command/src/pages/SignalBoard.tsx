import React, { useState, useMemo, useCallback, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Users, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CleanPage, CleanModal } from '../components/ui/CleanUI';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useSignalBoardCache } from '../hooks/useSignalBoardCache';
import { useAuth, REP_PROFILES } from '../contexts/AuthContext';
import type { ClayRow, AccountView } from '../data/signalBoardData';
import { mergeBookAccounts } from '../data/signalBoardData';

import { fetchSignals, fetchDispositions, upsertDisposition, fetchPushEvents, fetchNotes, fetchAccountOwners, subscribeToNewSignals, fetchAllAccounts, fetchAllContacts } from '../lib/signalBoardDb';
import type { DbAccount, DbContact } from '../lib/signalBoardDb';
import ClaySetupPanel from '../components/ClaySetupPanel';
import { logAudit } from '../lib/auditLog';
import { createDiscoverySession, getActivePipelineByDomain, updateSessionPersona, updateSessionATS, updateSessionIndustry, updateSessionCompanySize, updateSessionPains } from '../lib/discoveryDatabase';
import { SmartRoomModal, type SmartRoomConfig } from '../components/discovery/SmartRoomModal';
import AccountDrawer from '../components/signal-board/AccountDrawer';
import ContactDrawer from '../components/signal-board/ContactDrawer';

import { useSignalFilters } from '../hooks/useSignalFilters';
import { useSalesloftIntegration } from '../hooks/useSalesloftIntegration';
import { SignalBoardHeader } from '../components/signal-board/SignalBoardHeader';
import { AccountList } from '../components/signal-board/AccountList';
import { ContactList } from '../components/signal-board/ContactList';
import { AdvancedSegmentModal } from '../components/signal-board/AdvancedSegmentModal';
const AudienceManager = lazy(() => import('../components/signal-board/AudienceManager'));

type ViewMode = 'accounts' | 'contacts';

export default function SignalBoard() {
  const { effectiveUser, isAdmin, isImpersonating } = useAuth();
  const navigate = useNavigate();
  
  const [clayRows, setClayRows] = useState<ClayRow[]>([]);
  const [dbLoaded, setDbLoaded] = useState(false);
  const [accountOwners, setAccountOwners] = useState<Map<string, { owner: string; companyType: string }>>(new Map());
  const [crmAccounts, setCrmAccounts] = useState<DbAccount[]>([]);
  const [crmContacts, setCrmContacts] = useState<DbContact[]>([]);

  const [viewMode, setViewMode] = useState<ViewMode>('accounts');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedContactEmail, setSelectedContactEmail] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [hoverScoreId, setHoverScoreId] = useState<string | null>(null);
  const [hoverScoreEl, setHoverScoreEl] = useState<HTMLElement | null>(null);
  const [showClaySetup, setShowClaySetup] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAudienceBuilder, setShowAudienceBuilder] = useState(false);
  const [realtimeToast, setRealtimeToast] = useState<{ company: string; source: string } | null>(null);
  
  // Pipeline bridge state
  const [pipelineStages, setPipelineStages] = useState<Map<string, { stage: string; sessionId: string }>>(new Map());
  const [showSmartModal, setShowSmartModal] = useState(false);
  const [createOppAccount, setCreateOppAccount] = useState<AccountView | null>(null);
  
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(['score', 'signals', 'primary', 'activity', 'status', 'webActivity', 'organization', 'employees', 'currentAts', 'accountOwner']));
  const toggleColumn = (col: string) => {
    setVisibleColumns(prev => {
      const n = new Set(prev);
      if (n.has(col)) { n.delete(col); } else { n.add(col); }
      return n;
    });
  };

  const isRyanMode = effectiveUser?.id === 'admin-ryan' && !isImpersonating;
  const {
    dispositions, pushState, contactPushState, notesState,
    setDispositions, setPushState, setContactPushState, setNotesState,
    setDisposition: optimisticSetDisposition,
    markAccountPushed, markContactPushed, addNote: optimisticAddNote,
  } = useSignalBoardCache();

  const filters = useSignalFilters(clayRows, effectiveUser, isAdmin, isImpersonating, dispositions, pushState, notesState, sortDir, crmAccounts, crmContacts);
  const sl = useSalesloftIntegration(isRyanMode, contactPushState, filters.accounts, effectiveUser, markAccountPushed, markContactPushed);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const currentAccounts = filters.accounts;
      const currentContacts = filters.contacts;

      // / to focus search
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
        return;
      }

      // j/k or arrow keys to navigate accounts
      if (viewMode === 'accounts' && (e.key === 'j' || e.key === 'ArrowDown')) {
        e.preventDefault();
        const idx = selectedDomain ? currentAccounts.findIndex(a => a.companyDomain === selectedDomain) : -1;
        const next = Math.min(idx + 1, currentAccounts.length - 1);
        if (currentAccounts[next]) setSelectedDomain(currentAccounts[next].companyDomain);
        return;
      }
      if (viewMode === 'accounts' && (e.key === 'k' || e.key === 'ArrowUp')) {
        e.preventDefault();
        const idx = selectedDomain ? currentAccounts.findIndex(a => a.companyDomain === selectedDomain) : 1;
        const prev = Math.max(idx - 1, 0);
        if (currentAccounts[prev]) setSelectedDomain(currentAccounts[prev].companyDomain);
        return;
      }

      // Enter to open drawer for selected account
      if (e.key === 'Enter' && selectedDomain && viewMode === 'accounts') {
        // Drawer is already open when selectedDomain is set via AccountList click
        return;
      }

      // Escape to close drawer
      if (e.key === 'Escape') {
        if (selectedDomain) { setSelectedDomain(null); return; }
        if (selectedContactEmail) { setSelectedContactEmail(null); return; }
        filters.setIsAdvancedModalOpen(false);
        return;
      }

      // 1/2 to switch views
      if (e.key === '1') { setViewMode('accounts'); return; }
      if (e.key === '2') { setViewMode('contacts'); return; }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, selectedDomain, selectedContactEmail, filters.accounts, filters.contacts, filters, setViewMode]);

  useEffect(() => {
    let cancelled = false;
    async function loadFromSupabase() {
      try {
        const signals = await fetchSignals();
        if (!cancelled) {
          if (signals.length > 0) setClayRows(signals);
          // No auto-seed — clay_signals should only contain real data from Clay webhooks
        }

        const disps = await fetchDispositions();
        if (!cancelled) {
          const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;
          const now = Date.now();
          for (const [domain, entry] of disps) {
            if (entry.status === 'working' && (now - new Date(entry.updatedAt).getTime()) > SIXTY_DAYS_MS) {
              disps.set(domain, { status: 'nurture', updatedAt: new Date().toISOString() });
              upsertDisposition(domain, 'nurture', 'system-auto-decay');
            }
          }
          setDispositions(disps as any);
        }

        const pushEvents = await fetchPushEvents();
        if (!cancelled) {
          const acctMap = new Map<string, boolean>();
          for (const [k, v] of pushEvents.accounts) { if (v.outreach) acctMap.set(k, true); }
          setPushState(acctMap);
          const contactMap = new Map<string, boolean>();
          for (const [k, v] of pushEvents.contacts) { if (v.outreach) contactMap.set(k, true); }
          setContactPushState(contactMap);
        }

        const notesMap = await fetchNotes();
        if (!cancelled) {
          const converted = new Map<string, any[]>();
          for (const [domain, notes] of notesMap) {
            converted.set(domain, notes.map(n => ({ id: n.id, text: n.note_text, createdAt: n.created_at, authorName: n.author_name })));
          }
          setNotesState(converted);
        }

        const ownerMap = await fetchAccountOwners();
        if (!cancelled) {
          setAccountOwners(ownerMap);
          // Enrich clay rows with owner data from Salesloft/SFDC sync
          if (signals.length > 0) {
            const enriched = signals.map(s => {
              const ownerInfo = ownerMap.get(s.company_domain);
              if (ownerInfo && !s.sf_account_owner) {
                return { ...s, sf_account_owner: ownerInfo.owner };
              }
              return s;
            });
            setClayRows(enriched);
          }
        }

        // Fetch full CRM account + contact lists for book-of-business view
        const [allAccts, allContacts] = await Promise.all([
          fetchAllAccounts(),
          fetchAllContacts(),
        ]);
        if (!cancelled) {
          setCrmAccounts(allAccts);
          setCrmContacts(allContacts);
        }

        if (!cancelled) {
          setDbLoaded(true);
          logAudit({ user_id: effectiveUser?.id || 'unknown', action: 'view_signals', metadata: { signal_count: signals.length } });
        }
      } catch (err) {
        console.error('Failed to load from Supabase:', err);
        if (!cancelled) setDbLoaded(true);
      }
    }
    loadFromSupabase();
    return () => { cancelled = true; };
  }, [effectiveUser, setContactPushState, setDispositions, setNotesState, setPushState]);

  // ── Realtime: auto-update when new signals arrive ──
  useEffect(() => {
    if (!dbLoaded) return;
    const unsubscribe = subscribeToNewSignals((newSignal) => {
      setClayRows(prev => {
        // Deduplicate by email + detected_at
        if (prev.some(r => r.email === newSignal.email && r.detected_at === newSignal.detected_at)) return prev;
        return [newSignal, ...prev];
      });
      // Show toast
      setRealtimeToast({ company: newSignal.company_name, source: newSignal.signal_source });
      setTimeout(() => setRealtimeToast(null), 4000);
    });
    return unsubscribe;
  }, [dbLoaded]);

  const ALL_REPS = useMemo(() => [{ id: 'admin-ryan', initials: 'RW', full_name: 'Ryan Walker', avatar_color: '#78716c' }, ...REP_PROFILES.map(r => ({ id: r.id, initials: r.initials, full_name: r.full_name, avatar_color: r.avatar_color }))], []);
  const getRepInfo = (repId: string) => ALL_REPS.find(r => r.id === repId);

  const uniqueOwners = useMemo(() => {
    const owners = new Set<string>();
    for (const [, info] of accountOwners) {
      if (info.owner) owners.add(info.owner);
    }
    return [...owners].sort();
  }, [accountOwners]);

  const handleAddNote = useCallback((domain: string, text: string) => {
    const authorName = effectiveUser?.full_name || 'Unknown';
    const authorId = effectiveUser?.id || 'unknown';
    optimisticAddNote(domain, text, authorId, authorName);
    logAudit({ user_id: authorId, action: 'add_note', target_type: 'account', target_id: domain, metadata: { text } });
  }, [effectiveUser, optimisticAddNote]);

  const handleSetDisposition = useCallback((domain: string, status: any) => {
    optimisticSetDisposition(domain, status, effectiveUser?.id || 'unknown');
    logAudit({ user_id: effectiveUser?.id || 'unknown', action: 'change_disposition', target_type: 'account', target_id: domain, metadata: { status } });
  }, [effectiveUser, optimisticSetDisposition]);

  // Pipeline bridge: build stage map on mount and listen for updates
  useEffect(() => {
    const refreshPipeline = () => setPipelineStages(getActivePipelineByDomain());
    refreshPipeline();
    window.addEventListener('scc_discovery_updated', refreshPipeline);
    return () => window.removeEventListener('scc_discovery_updated', refreshPipeline);
  }, []);

  const handleCreateOpp = useCallback((account: AccountView) => {
    setCreateOppAccount(account);
    setShowSmartModal(true);
  }, []);

  const handleOppCreated = useCallback((config: SmartRoomConfig) => {
    const repId = effectiveUser?.id || null;
    if (!repId) return;
    const session = createDiscoverySession(repId, config.companyName, null, config.companyDomain);
    // Apply smart defaults from the modal
    if (config.persona) updateSessionPersona(session.id, config.persona);
    if (config.currentATS) updateSessionATS(session.id, config.currentATS);
    if (config.industry) updateSessionIndustry(session.id, config.industry);
    if (config.companySize) updateSessionCompanySize(session.id, config.companySize);
    if (config.selectedPains.length > 0) updateSessionPains(session.id, config.selectedPains);
    // Refresh pipeline stages and navigate to the new deal
    setPipelineStages(getActivePipelineByDomain());
    setCreateOppAccount(null);
    setSelectedDomain(null);
    navigate(`/team/pipeline/${session.id}`);
  }, [effectiveUser, navigate]);

  const toggleCheck = (id: string) => { setCheckedIds(p => { const n = new Set(p); if (n.has(id)) { n.delete(id); } else { n.add(id); } return n; }); };
  const toggleAll = () => {
    const ids = viewMode === 'accounts' ? filters.accounts.map(a => a.companyDomain) : filters.contacts.map(c => c.email);
    setCheckedIds(checkedIds.size === ids.length ? new Set() : new Set(ids));
  };

  const handleApplyFilters = () => {
    const customSeg = { id: 'custom', name: 'Custom Filter', icon: 'Filter', conditions: [...filters.draftQuery] };
    filters.setSegments(prev => [...prev.filter(s => s.id !== 'custom'), customSeg]);
    filters.setActiveSegmentId('custom');
    filters.setIsAdvancedModalOpen(false);
  };

  const handleSaveAsSegment = () => {
    if (!filters.segmentNameDraft.trim()) return;
    const newSeg = { id: `seg_${Date.now()}`, name: filters.segmentNameDraft.trim(), icon: 'Target', conditions: [...filters.draftQuery] };
    filters.saveSegment(newSeg);
    filters.setActiveSegmentId(newSeg.id);
    filters.setIsAdvancedModalOpen(false);
    filters.setIsSavingSegment(false);
    filters.setSegmentNameDraft('');
  };

  return (
    <div className="min-h-screen bg-stone-50/50">
      {/* Realtime toast */}
      <AnimatePresence>
        {realtimeToast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-lg"
          >
            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span className="text-[13px] font-semibold">New signal: {realtimeToast.company}</span>
            <span className="text-[11px] opacity-70">via {realtimeToast.source}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <CleanPage className="min-h-screen flex flex-col h-full">
        <SignalBoardHeader
          viewMode={viewMode} setViewMode={setViewMode}
          accountsCount={filters.accounts.length} contactsCount={filters.contacts.length}
          setCheckedIds={setCheckedIds}
          filterTier={filters.filterTier} setFilterTier={filters.setFilterTier}
          t1={filters.t1} t2={filters.t2} t3={filters.t3} wi={filters.wi}
          searchQuery={filters.searchQuery} setSearchQuery={filters.setSearchQuery}
          filterTimeframe={filters.filterTimeframe} setFilterTimeframe={filters.setFilterTimeframe}
          segments={filters.segments} activeSegmentId={filters.activeSegmentId} setActiveSegmentId={filters.setActiveSegmentId} segmentCounts={filters.segmentCounts}
          handleOpenAdvancedModal={() => { filters.setDraftQuery(filters.segments.find(s => s.id === filters.activeSegmentId)?.conditions.map(c => ({...c})) || []); filters.setIsAdvancedModalOpen(true); }}
          showAnalytics={showAnalytics} setShowAnalytics={setShowAnalytics}
          isRyanMode={isRyanMode} slConnected={sl.slConnected} setShowCadencePicker={sl.setShowCadencePicker}
          accounts={filters.accounts} dispositions={dispositions}
          visibleColumns={visibleColumns} toggleColumn={toggleColumn}
          isAdmin={isAdmin} effectiveUser={effectiveUser} setShowClaySetup={setShowClaySetup} logAudit={logAudit}
          filterRep={filters.filterRep} setFilterRep={filters.setFilterRep}
          filterMarket={filters.filterMarket} setFilterMarket={filters.setFilterMarket}
          filterFirmographicTier={filters.filterFirmographicTier} setFilterFirmographicTier={filters.setFilterFirmographicTier}
          filterAudience={filters.filterAudience} setFilterAudience={filters.setFilterAudience}
          filterSignalSource={filters.filterSignalSource} setFilterSignalSource={filters.setFilterSignalSource}
          showAudienceBuilder={showAudienceBuilder} setShowAudienceBuilder={setShowAudienceBuilder}
          audienceSources={[...new Set(clayRows.map(r => r.audience_source).filter(Boolean))].sort()}
          signalSources={[...new Set(clayRows.map(r => r.signal_source).filter(Boolean))].sort()}
          accountOwners={uniqueOwners}
          deleteSegment={filters.deleteSegment}
        />

        <AnimatePresence>
          {checkedIds.size > 0 && (
            <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} className="mb-4">
              <div className="flex items-center justify-between bg-stone-100/80 border border-stone-200/60 px-4 py-2 rounded-lg">
                <span className="text-[12px] font-medium text-stone-700">{checkedIds.size} {viewMode === 'accounts' ? 'accounts' : 'contacts'} selected</span>
                <div className="flex items-center gap-2">
                  {viewMode === 'accounts' ? (
                    <button onClick={() => { setViewMode('contacts'); setCheckedIds(new Set()); }} className="px-3 py-1.5 bg-gray-900 text-white text-[11px] font-semibold rounded-lg hover:bg-gray-800 flex items-center gap-1.5"><Users size={12} /> View Contacts to Enroll</button>
                  ) : (
                    <button onClick={() => { checkedIds.forEach(id => sl.handleContactAddToCadence(id)); }} className="px-3 py-1.5 bg-gray-900 text-white text-[11px] font-semibold rounded-lg hover:bg-gray-800 flex items-center gap-1.5"><Mail size={12} /> {isRyanMode ? 'Add to Instantly' : 'Add to Cadence'}</button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Audience Builder Panel (admin only) */}
        <AnimatePresence>
          {showAudienceBuilder && isAdmin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-white border border-stone-200/60 rounded-xl p-5">
                <Suspense fallback={<div className="flex items-center justify-center py-8"><Loader2 size={16} className="animate-spin text-stone-400" /></div>}>
                  <AudienceManager />
                </Suspense>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col overflow-hidden">
          {viewMode === 'accounts' && (
            <AccountList
              accounts={filters.accounts} checkedIds={checkedIds} toggleAll={toggleAll} toggleCheck={toggleCheck}
              sortDir={sortDir} setSortDir={setSortDir} visibleColumns={visibleColumns} selectedDomain={selectedDomain} setSelectedDomain={setSelectedDomain}
              dispositions={dispositions} pushState={pushState} pushingId={sl.pushingId} slActivity={sl.slActivity}
              isAdmin={isAdmin} isImpersonating={isImpersonating} getRepInfo={getRepInfo} handleSetDisposition={handleSetDisposition} isRyanMode={isRyanMode}
              hoverScoreId={hoverScoreId} setHoverScoreId={setHoverScoreId} hoverScoreEl={hoverScoreEl} setHoverScoreEl={setHoverScoreEl}
              dbLoaded={dbLoaded}
              pipelineStages={pipelineStages}
            />
          )}
          {viewMode === 'contacts' && (
            <ContactList
              contacts={filters.contacts} checkedIds={checkedIds} toggleAll={toggleAll} toggleCheck={toggleCheck}
              visibleColumns={visibleColumns} setSelectedContactEmail={setSelectedContactEmail}
              onAddToCadence={sl.handleContactAddToCadence}
              isPushedFn={(email) => contactPushState.get(email) || false}
              pushingContactId={sl.pushingId}
              isRyanMode={isRyanMode}
              hoverScoreId={hoverScoreId} setHoverScoreId={setHoverScoreId} hoverScoreEl={hoverScoreEl} setHoverScoreEl={setHoverScoreEl}
            />
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-1.5 border-t border-stone-100/60 bg-white/50">
          <span className="text-[10px] text-stone-400">
            {viewMode === 'accounts' ? `${filters.accounts.length} account(s)` : `${filters.contacts.length} contact(s)`}
            {(filters.filterTier || filters.filterTimeframe !== 'all' || filters.searchQuery || filters.activeSegmentId !== 'all') && ' (filtered)'}
          </span>
          <span className="text-[10px] text-stone-300">j/k navigate · / search · 1 accounts · 2 people · esc close</span>
        </div>
      </CleanPage>

      <AnimatePresence>
        {selectedDomain && <AccountDrawer account={filters.accounts.find(a => a.companyDomain === selectedDomain)!} onClose={() => setSelectedDomain(null)} onAddToCadence={sl.handleAddToCadence} onContactAddToCadence={sl.handleContactAddToCadence} contactPushState={contactPushState} onAddNote={handleAddNote} isRyanMode={isRyanMode} onCreateOpp={handleCreateOpp} pipelineInfo={pipelineStages.get(selectedDomain) || null} />}
        {selectedContactEmail && <ContactDrawer contact={filters.contacts.find(c => c.email === selectedContactEmail)!} account={filters.accounts.find(a => a.companyDomain === filters.contacts.find(c => c.email === selectedContactEmail)?.companyDomain)} onClose={() => setSelectedContactEmail(null)} onAddToCadence={sl.handleContactAddToCadence} isPushed={contactPushState.get(selectedContactEmail) || false} isRyanMode={isRyanMode} />}
      </AnimatePresence>

      <AnimatePresence>
        {showClaySetup && <ClaySetupPanel onClose={() => setShowClaySetup(false)} />}
      </AnimatePresence>

      <CleanModal
        isOpen={sl.showCadencePicker}
        onClose={() => { sl.setShowCadencePicker(false); sl.setPendingPushTarget(null); }}
        title="Select Cadence"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => { sl.setShowCadencePicker(false); sl.setPendingPushTarget(null); }} className="px-4 py-2 text-sm text-stone-500 hover:text-stone-700">Cancel</button>
            <button
              disabled={!sl.selectedCadenceId}
              onClick={() => {
                if (sl.selectedCadenceId) {
                  localStorage.setItem('scc_selected_cadence_id', String(sl.selectedCadenceId));
                  sl.setShowCadencePicker(false);
                  if (sl.pendingPushTarget) {
                    sl.executeCadencePush(sl.pendingPushTarget.type, sl.pendingPushTarget.id, sl.pendingPushTarget.contact);
                    sl.setPendingPushTarget(null);
                  }
                }
              }}
              className={`px-4 py-2 text-sm font-semibold rounded-lg ${sl.selectedCadenceId ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-400'}`}
            >Select & Push</button>
          </div>
        }
      >
        <div className="space-y-2">
          <p className="text-[13px] text-stone-500 mb-3">Choose which Salesloft cadence to add contacts to.</p>
          {sl.slConnected === false && <div className="p-3 bg-red-50 text-red-700 text-[12px] rounded-lg"><AlertCircle size={14} className="inline mr-1"/> Connection failed</div>}
          {sl.slCadences.length === 0 && sl.slConnected !== false && <div className="py-8 text-center"><Loader2 size={20} className="animate-spin inline text-stone-400"/> Loading...</div>}
          {sl.slCadences.map(c => (
            <button key={c.id} onClick={() => sl.setSelectedCadenceId(c.id)} className={`w-full text-left px-3 py-2.5 rounded-lg border ${sl.selectedCadenceId === c.id ? 'bg-stone-900 text-white' : 'bg-white text-stone-700 hover:bg-stone-50'}`}>
              <div className="text-[13px] font-semibold">{c.name}</div>
              <div className="text-[10px] mt-0.5 opacity-60">{c.team_cadence ? 'Team cadence' : 'Personal'} · ID: {c.id}</div>
            </button>
          ))}
        </div>
      </CleanModal>

      <AdvancedSegmentModal
        isOpen={filters.isAdvancedModalOpen}
        onClose={() => filters.setIsAdvancedModalOpen(false)}
        isSavingSegment={filters.isSavingSegment} setIsSavingSegment={filters.setIsSavingSegment}
        segmentNameDraft={filters.segmentNameDraft} setSegmentNameDraft={filters.setSegmentNameDraft}
        handleSaveAsSegment={handleSaveAsSegment} handleApplyFilters={handleApplyFilters}
        draftQuery={filters.draftQuery} handleUpdateCondition={(id, u) => filters.setDraftQuery(p => p.map(c => c.id === id ? {...c, ...u} : c))}
        handleRemoveCondition={id => filters.setDraftQuery(p => p.filter(c => c.id !== id))}
        handleAddCondition={() => filters.setDraftQuery(p => [...p, { id: String(Date.now()), field: 'company_name', operator: 'contains', value: '' }])}
      />

      {/* Smart Room Modal for creating opps from Prospecting */}
      <SmartRoomModal
        open={showSmartModal}
        onClose={() => { setShowSmartModal(false); setCreateOppAccount(null); }}
        onCreate={handleOppCreated}
        initialValues={createOppAccount ? {
          companyName: createOppAccount.companyName,
          currentATS: createOppAccount.currentAts || undefined,
          companyDomain: createOppAccount.companyDomain,
        } : undefined}
      />
    </div>
  );
}
