import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ArrowDown, ArrowUp, Check, Loader2, Mail, Phone, MessageSquare, Zap, Users, Clock } from 'lucide-react';
import { 
  ScoreBadge, TierDot, SignalTag, TrendArrow, FreshnessDot, 
  ScorePopover, DispositionDropdown, TargetSignalIcon 
} from './signalBoardAtoms';
import type { AccountView } from '../../data/signalBoardData';
import { getSignalIcon, timeAgo, getWebIntentLine, getWhyNowLine, getUrgencyTier } from '../../data/signalBoardData';
import { getLinkedInSizeRange } from '../../lib/utils';

interface AccountListProps {
  accounts: AccountView[];
  checkedIds: Set<string>;
  toggleAll: () => void;
  toggleCheck: (id: string) => void;
  sortDir: 'desc' | 'asc';
  setSortDir: React.Dispatch<React.SetStateAction<'desc' | 'asc'>>;
  visibleColumns: Set<string>;
  selectedDomain: string | null;
  setSelectedDomain: (domain: string) => void;
  dispositions: Map<string, any>;
  pushState: Map<string, boolean>;
  pushingId: string | null;
  slActivity: Map<string, any>;
  isAdmin: boolean;
  isImpersonating: boolean;
  getRepInfo: (id: string) => any;
  handleSetDisposition: (domain: string, status: any) => void;
  isRyanMode: boolean;
  hoverScoreId: string | null;
  setHoverScoreId: (id: string | null) => void;
  hoverScoreEl: HTMLElement | null;
  setHoverScoreEl: (el: HTMLElement | null) => void;
  dbLoaded?: boolean;
  pipelineStages?: Map<string, { stage: string; sessionId: string }>;
}

const SkeletonRow = ({ visibleColumns }: { visibleColumns: Set<string> }) => (
  <tr className="border-b border-stone-100/40 animate-pulse">
    <td className="px-3 py-2.5"><div className="w-3.5 h-3.5 rounded bg-stone-200" /></td>
    <td className="px-3">
      <div className="space-y-1.5">
        <div className="w-32 h-4 bg-stone-200 rounded" />
        <div className="w-20 h-3 bg-stone-100 rounded" />
      </div>
    </td>
    {visibleColumns.has('score') && <td className="px-2"><div className="w-8 h-5 bg-stone-200 rounded-full" /></td>}
    {visibleColumns.has('signals') && <td className="px-2"><div className="w-6 h-4 bg-stone-100 rounded" /></td>}
    {visibleColumns.has('primary') && (
      <td className="px-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-stone-200" />
          <div className="space-y-1"><div className="w-20 h-3 bg-stone-200 rounded" /><div className="w-14 h-2 bg-stone-100 rounded" /></div>
        </div>
      </td>
    )}
    {visibleColumns.has('employees') && <td className="px-2"><div className="w-14 h-3 bg-stone-200 rounded" /></td>}
    {visibleColumns.has('openRoles') && <td className="px-2"><div className="w-6 h-3 bg-stone-200 rounded" /></td>}
    {visibleColumns.has('currentAts') && <td className="px-2"><div className="w-14 h-4 bg-stone-200 rounded" /></td>}
    {visibleColumns.has('accountOwner') && <td className="px-2"><div className="w-20 h-4 bg-stone-200 rounded" /></td>}
    {visibleColumns.has('lastSignal') && <td className="px-2"><div className="w-10 h-3 bg-stone-200 rounded" /></td>}
    {visibleColumns.has('contactCount') && <td className="px-2"><div className="w-4 h-3 bg-stone-200 rounded" /></td>}
    {visibleColumns.has('activity') && <td className="px-2"><div className="w-10 h-3 bg-stone-200 rounded" /></td>}
    <td className="px-3"><div className="w-16 h-6 bg-stone-200 rounded" /></td>
    {visibleColumns.has('status') && <td className="px-2"><div className="w-8 h-4 bg-stone-200 rounded" /></td>}
  </tr>
);

export function AccountList({
  accounts, checkedIds, toggleAll, toggleCheck, sortDir, setSortDir, visibleColumns,
  selectedDomain, setSelectedDomain, dispositions, pushState, pushingId, slActivity,
  isAdmin, isImpersonating, getRepInfo, handleSetDisposition, isRyanMode,
  hoverScoreId, setHoverScoreId, hoverScoreEl, setHoverScoreEl, dbLoaded = true, pipelineStages
}: AccountListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const accountVirtualizer = useVirtualizer({
    count: accounts.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 52,
    overscan: 10,
  });
  const accountVirtualItems = accountVirtualizer.getVirtualItems();

  const rowOpacity = (lastActivity: string) => {
    if (!lastActivity) return '';
    const age = Date.now() - new Date(lastActivity).getTime();
    const week = 7 * 24 * 60 * 60 * 1000;
    if (age < week * 2) return '';
    return 'opacity-60';
  };

  return (
    <div ref={scrollContainerRef} className="overflow-auto flex-1" style={{ maxHeight: 'calc(100vh - 120px)' }}>
      <table className="w-full table-fixed">
        <colgroup>
          <col style={{ width: 40 }} />
          <col />
          {visibleColumns.has('score') && <col style={{ width: 65 }} />}
          {visibleColumns.has('signals') && <col style={{ width: 100 }} />}
          {visibleColumns.has('primary') && <col style={{ width: '15%' }} />}
          {visibleColumns.has('employees') && <col style={{ width: 80 }} />}
          {visibleColumns.has('openRoles') && <col style={{ width: 60 }} />}
          {visibleColumns.has('currentAts') && <col style={{ width: 90 }} />}
          {visibleColumns.has('accountOwner') && <col style={{ width: 120 }} />}
          {visibleColumns.has('lastSignal') && <col style={{ width: 80 }} />}
          {visibleColumns.has('contactCount') && <col style={{ width: 60 }} />}
          {visibleColumns.has('activity') && <col style={{ width: 110 }} />}
          <col style={{ width: 90 }} />
          {visibleColumns.has('status') && <col style={{ width: 55 }} />}
        </colgroup>
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="border-b border-stone-200/40 text-[11px] font-medium text-stone-400 uppercase tracking-wide">
            <th className="px-3 py-2 w-10 text-left"><input type="checkbox" checked={checkedIds.size === accounts.length && accounts.length > 0} onChange={toggleAll} className="w-3.5 h-3.5 rounded border-stone-300 text-stone-900 focus:ring-0 cursor-pointer" /></th>
            <th className="px-3 py-2 text-left cursor-pointer select-none" onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}>Account {sortDir === 'desc' ? <ArrowDown size={10} className="inline text-stone-400 ml-0.5" /> : <ArrowUp size={10} className="inline text-stone-400 ml-0.5" />}</th>
            {visibleColumns.has('score') && <th className="px-2 py-2 text-left">Score</th>}
            {visibleColumns.has('signals') && <th className="px-3 py-2 text-left">Signals</th>}
            {visibleColumns.has('primary') && <th className="px-3 py-2 text-left">Primary Contact</th>}
            {visibleColumns.has('employees') && <th className="px-2 py-2 text-left">Employees</th>}
            {visibleColumns.has('openRoles') && <th className="px-2 py-2 text-left">Roles</th>}
            {visibleColumns.has('currentAts') && <th className="px-2 py-2 text-left">ATS</th>}
            {visibleColumns.has('accountOwner') && <th className="px-2 py-2 text-left">SF Owner</th>}
            {visibleColumns.has('lastSignal') && <th className="px-2 py-2 text-left">Last Signal</th>}
            {visibleColumns.has('contactCount') && <th className="px-2 py-2 text-left">Contacts</th>}
            {visibleColumns.has('activity') && <th className="px-2 py-2 text-left">Outreach</th>}
            <th className="px-3 py-2 text-left">Stage</th>
            {visibleColumns.has('status') && <th className="px-3 py-2 text-left">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {!dbLoaded ? (
            <>
              {Array.from({ length: 15 }).map((_, i) => (
                <SkeletonRow key={`skel-${i}`} visibleColumns={visibleColumns} />
              ))}
            </>
          ) : accounts.length === 0 ? (
            <tr><td colSpan={8} className="text-center py-16"><Activity size={32} className="mx-auto text-gray-300 mb-2" /><p className="text-[13px] text-stone-500 font-medium">No accounts match your filters</p></td></tr>
          ) : (<>
          {accountVirtualItems.length > 0 && (
            <tr style={{ height: `${accountVirtualItems[0].start}px` }}><td colSpan={8} /></tr>
          )}
          {accountVirtualItems.map(virtualRow => {
            const acct = accounts[virtualRow.index];
            if (!acct) return null;
            const pc = acct.contacts[0];
            const ini = pc ? pc.name.split(' ').map(n => n[0]).join('') : '?';

            return (
              <tr key={acct.companyDomain} onClick={() => setSelectedDomain(acct.companyDomain)}
                className={`group transition-colors cursor-pointer border-b border-stone-100/60 hover:bg-stone-50/60 ${virtualRow.index % 2 === 1 ? 'bg-stone-50/30' : ''} ${selectedDomain === acct.companyDomain ? 'bg-blue-50/40' : ''} ${checkedIds.has(acct.companyDomain) ? 'bg-blue-50/30' : ''} ${dispositions.get(acct.companyDomain)?.status === 'disqualified' ? 'opacity-30' : rowOpacity(acct.lastActivity)}`}
              >
                <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}><input type="checkbox" checked={checkedIds.has(acct.companyDomain)} onChange={() => toggleCheck(acct.companyDomain)} className="w-3.5 h-3.5 rounded border-stone-300 text-stone-900 focus:ring-0 cursor-pointer" /></td>
                <td className="px-3 overflow-hidden">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-semibold text-stone-800 truncate">{acct.companyName}</span>
                      {acct.firmographicTier && (
                        <span className={`inline-flex items-center px-1.5 py-[1px] rounded text-[8px] font-bold shrink-0 ${
                          acct.firmographicTier === 'tier_1' ? 'bg-amber-50 text-amber-700' :
                          acct.firmographicTier === 'tier_2' ? 'bg-blue-50 text-blue-600' :
                          'bg-stone-50 text-stone-400'
                        }`}>{acct.firmographicTier === 'tier_1' ? 'T1' : acct.firmographicTier === 'tier_2' ? 'T2' : 'T3'}</span>
                      )}
                      {/* Pipeline stage badge */}
                      {(() => {
                        const pInfo = pipelineStages?.get(acct.companyDomain);
                        if (!pInfo) return null;
                        const stageLabel = pInfo.stage === 'qualifying' || pInfo.stage === 'investigating' ? 'D1' :
                          pInfo.stage === 'evaluating' ? 'D2' :
                          pInfo.stage === 'negotiating' || pInfo.stage === 'contracting' ? 'D3' :
                          pInfo.stage === 'signing' ? 'D4' : pInfo.stage;
                        return (
                          <span
                            className="inline-flex items-center px-1.5 py-[1px] rounded text-[8px] font-bold bg-emerald-50 text-emerald-700 cursor-pointer hover:bg-emerald-100 transition-colors shrink-0"
                            title={`Pipeline: ${pInfo.stage}`}
                            onClick={(e) => { e.stopPropagation(); navigate(`/team/pipeline/${pInfo.sessionId}`); }}
                          >
                            {stageLabel}
                          </span>
                        );
                      })()}
                      {isAdmin && !isImpersonating && (() => {
                        const rep = getRepInfo(acct.assignedRepId);
                        return rep ? (
                          <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[6px] font-bold shrink-0" style={{ backgroundColor: rep.avatar_color }} title={rep.full_name}>{rep.initials}</div>
                        ) : null;
                      })()}
                    </div>
                    {acct.sfAccountOwner && (
                      <div className="text-[10px] text-stone-400 truncate">{acct.sfAccountOwner}</div>
                    )}
                  </div>
                </td>
                {visibleColumns.has('score') && (
                <td className="px-2" onMouseEnter={(e) => { setHoverScoreId(acct.companyDomain); setHoverScoreEl(e.currentTarget); }} onMouseLeave={() => { setHoverScoreId(null); setHoverScoreEl(null); }}>
                  {acct.score > 0 ? (
                    <div className="flex items-center gap-1">
                      <ScoreBadge score={acct.score} fitScore={acct.fitScore} intentScore={acct.intentScore} />
                      <TrendArrow signals={acct.signals} />
                    </div>
                  ) : (
                    <span className="text-[11px] text-stone-300">—</span>
                  )}
                  <AnimatePresence>
                    {hoverScoreId === acct.companyDomain && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
                        <ScorePopover account={acct} anchorRef={{ current: hoverScoreEl }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </td>
                )}
                {visibleColumns.has('signals') && (
                <td className="px-2">
                  {acct.signals.length > 0 ? (
                    <span className="text-[11px] font-medium text-stone-600">{acct.signals.length}</span>
                  ) : (
                    <span className="text-[11px] text-stone-300">—</span>
                  )}
                </td>
                )}
                {visibleColumns.has('primary') && (
                <td className="px-3 overflow-hidden">
                  {pc && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0" style={{ backgroundColor: pc.avatarColor }}>{ini}</div>
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium text-stone-800 truncate">{pc.name}</div>
                        <div className="text-[10px] text-stone-400 truncate">{pc.title}</div>
                      </div>
                    </div>
                  )}
                </td>
                )}
                {visibleColumns.has('employees') && (
                <td className="px-2">
                  <span className="text-[11px] text-stone-600 font-medium">{acct.employeeSizeRange || (acct.employeeCount > 0 ? getLinkedInSizeRange(acct.employeeCount) : '—')}</span>
                </td>
                )}
                {visibleColumns.has('openRoles') && (
                <td className="px-2">
                  {acct.openRoles > 0 ? (
                    <span className={`text-[11px] font-semibold ${acct.openRoles >= 30 ? 'text-red-600' : acct.openRoles >= 15 ? 'text-amber-600' : 'text-stone-500'}`}>{acct.openRoles}</span>
                  ) : <span className="text-[11px] text-stone-300">—</span>}
                </td>
                )}
                {visibleColumns.has('currentAts') && (
                <td className="px-2 overflow-hidden">
                  {acct.currentAts ? (
                    <span className="inline-flex items-center px-1.5 py-[2px] rounded text-[9px] font-semibold bg-stone-100 text-stone-600 truncate max-w-full">{acct.currentAts}</span>
                  ) : <span className="text-[11px] text-stone-300">—</span>}
                </td>
                )}
                {visibleColumns.has('accountOwner') && (
                <td className="px-2 overflow-hidden">
                  {acct.sfAccountOwner === undefined ? (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-[2px] rounded text-[9px] font-medium bg-stone-50 text-stone-400 border border-stone-200/60">Not in CRM</span>
                  ) : acct.sfAccountOwner === '' ? (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-[2px] rounded text-[9px] font-semibold bg-amber-50 text-amber-600 border border-amber-200/60">⚠ Unassigned</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0"><Check size={8} className="text-emerald-600" /></div>
                      <span className="text-[11px] font-medium text-stone-700 truncate">{acct.sfAccountOwner}</span>
                    </div>
                  )}
                </td>
                )}
                {visibleColumns.has('lastSignal') && (
                <td className="px-2">
                  <div className="flex items-center gap-1">
                    <FreshnessDot dateStr={acct.lastActivity} />
                    <span className="text-[10px] text-stone-500">{timeAgo(acct.lastActivity)}</span>
                  </div>
                </td>
                )}
                {visibleColumns.has('contactCount') && (
                <td className="px-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-stone-600 font-medium">{acct.contactCount ?? acct.contacts.length}</span>
                    {acct.committeeRoles.size > 0 ? (
                      <div className="flex items-center gap-[2px]" title={`Committee: ${Array.from(acct.committeeRoles).join(', ')}`}>
                        {(['champion', 'decision_maker', 'economic_buyer', 'technical_buyer'] as const).map(role => (
                          <span key={role} className={`w-[5px] h-[5px] rounded-full ${
                            acct.committeeRoles.has(role)
                              ? role === 'champion' ? 'bg-violet-500' : role === 'decision_maker' ? 'bg-blue-500' : 'bg-stone-400'
                              : 'bg-stone-200'
                          }`} title={role.replace('_', ' ')} />
                        ))}
                      </div>
                    ) : (acct.contactCount ?? acct.contacts.length) >= 5 ? (
                      <span className="inline-flex items-center gap-0.5 px-1 py-[1px] rounded text-[8px] font-bold bg-emerald-100 text-emerald-700" title={`${acct.contactCount ?? acct.contacts.length} unique contacts`}>
                        <Check size={8} />MULTI
                      </span>
                    ) : (acct.contactCount ?? acct.contacts.length) >= 3 ? (
                      <span className="inline-flex items-center gap-0.5 px-1 py-[1px] rounded text-[8px] font-bold bg-violet-100 text-violet-700" title={`${acct.contactCount ?? acct.contacts.length} unique contacts`}>
                        <Users size={8} />GOOD
                      </span>
                    ) : null}
                  </div>
                </td>
                )}
                {visibleColumns.has('activity') && (
                <td className="px-2">
                  {(() => {
                    // Aggregate engagement across all contacts on this account
                    let totalEmailsSent = 0, totalOpened = 0, totalClicked = 0, totalReplied = 0;
                    let totalCalls = 0, totalConnected = 0;
                    let hasCadence = false;
                    let cadenceName = '';

                    for (const contact of acct.contacts) {
                      totalEmailsSent += contact.emailsSent || 0;
                      totalOpened += contact.emailsOpened || 0;
                      totalClicked += contact.emailsClicked || 0;
                      totalReplied += contact.emailsReplied || 0;
                      totalCalls += contact.callsTotal || 0;
                      totalConnected += contact.callsConnected || 0;
                      if (contact.inActiveCadence && !hasCadence) {
                        hasCadence = true;
                        cadenceName = contact.cadenceName || 'Cadence';
                      }
                    }

                    const hasEngagement = totalEmailsSent > 0 || totalCalls > 0 || hasCadence;

                    if (!hasEngagement) {
                      // Fallback: check old slActivity data
                      const pcActivity = pc ? slActivity.get(pc.email) : undefined;
                      if (pcActivity && pcActivity.total_touches > 0) {
                        return (
                          <div className="flex items-center gap-1">
                            <span className="inline-flex items-center gap-0.5 px-1 py-[1px] rounded text-[9px] font-semibold bg-blue-50 text-blue-600" title="Emails sent"><Mail size={8} />{pcActivity.emails_sent}</span>
                            {pcActivity.calls > 0 && <span className="inline-flex items-center gap-0.5 px-1 py-[1px] rounded text-[9px] font-semibold bg-stone-50 text-stone-600" title="Calls"><Phone size={8} />{pcActivity.calls}</span>}
                          </div>
                        );
                      }
                      return <span className="text-[11px] text-stone-300">—</span>;
                    }

                    return (
                      <div className="flex flex-col gap-0.5">
                        {/* Email + Call row */}
                        <div className="flex items-center gap-1">
                          {totalEmailsSent > 0 && (
                            <span className={`inline-flex items-center gap-0.5 px-1 py-[1px] rounded text-[9px] font-semibold ${totalReplied > 0 ? 'bg-emerald-50 text-emerald-700' : totalOpened > 0 ? 'bg-blue-50 text-blue-600' : 'bg-stone-50 text-stone-500'}`} title={`${totalEmailsSent} sent · ${totalOpened} opened · ${totalClicked} clicked · ${totalReplied} replied`}>
                              <Mail size={8} />{totalEmailsSent}
                              {totalReplied > 0 && <span className="ml-0.5">✓</span>}
                            </span>
                          )}
                          {totalCalls > 0 && (
                            <span className={`inline-flex items-center gap-0.5 px-1 py-[1px] rounded text-[9px] font-semibold ${totalConnected > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-50 text-stone-500'}`} title={`${totalCalls} calls · ${totalConnected} connected`}>
                              <Phone size={8} />{totalCalls}
                            </span>
                          )}
                        </div>
                        {/* Cadence badge */}
                        {hasCadence && (
                          <span className="inline-flex items-center gap-0.5 px-1 py-[1px] rounded text-[8px] font-semibold bg-violet-50 text-violet-700 w-fit" title={`In cadence: ${cadenceName}`}>
                            <Zap size={7} />{cadenceName.length > 14 ? cadenceName.slice(0, 12) + '…' : cadenceName}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </td>
                )}
                <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                  <DispositionDropdown
                    domain={acct.companyDomain}
                    current={(dispositions.get(acct.companyDomain)?.status || 'new') as any}
                    onChange={handleSetDisposition}
                  />
                </td>
                {visibleColumns.has('status') && (
                <td className="px-2 py-2" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    {(pushState.get(acct.companyDomain) || acct.pushedToCadence) ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-[2px] rounded text-[9px] font-semibold bg-emerald-600 text-white"><Check size={8} />{isRyanMode ? 'IN' : 'SL'}</span>
                    ) : pushingId === acct.companyDomain ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-[2px] rounded text-[9px] font-semibold bg-stone-200 text-stone-500"><Loader2 size={8} className="animate-spin" />...</span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-[2px] rounded text-[9px] font-medium text-stone-300" title="Switch to Contacts tab to enroll">—</span>
                    )}
                  </div>
                </td>
                )}
              </tr>
            );
          })}
          {accountVirtualItems.length > 0 && (
            <tr style={{ height: `${accountVirtualizer.getTotalSize() - (accountVirtualItems[accountVirtualItems.length - 1].end)}px` }}>
              <td colSpan={8} />
            </tr>
          )}
          </>)}
        </tbody>
      </table>

      {/* Footer */}
      {dbLoaded && accounts.length > 0 && (
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-stone-200/60 px-4 py-2 flex items-center justify-between">
          <span className="text-[11px] text-stone-400">
            {accounts.length} account{accounts.length !== 1 ? 's' : ''}
            {checkedIds.size > 0 && <span className="ml-2 text-stone-600 font-medium">· {checkedIds.size} selected</span>}
          </span>
          <span className="text-[10px] text-stone-300">Scroll for more</span>
        </div>
      )}
    </div>
  );
}
