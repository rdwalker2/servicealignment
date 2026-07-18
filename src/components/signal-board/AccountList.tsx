import React, { useRef } from 'react';
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
}

const SkeletonRow = ({ visibleColumns }: { visibleColumns: Set<string> }) => (
  <tr className="border-b border-stone-100/40 opacity-70 animate-pulse">
    <td className="px-3 py-3"><div className="w-3.5 h-3.5 rounded bg-stone-200" /></td>
    <td className="px-1 text-center"><div className="w-2 h-2 rounded-full bg-stone-200 mx-auto" /></td>
    <td className="px-3">
      <div className="flex items-center gap-2">
        <div className="w-32 h-4 bg-stone-200 rounded" />
        <div className="w-12 h-3 bg-stone-100 rounded" />
      </div>
    </td>
    {visibleColumns.has('score') && <td className="px-2"><div className="w-8 h-5 bg-stone-200 rounded-full" /></td>}
    {visibleColumns.has('signals') && (
      <td className="px-3 space-y-1.5">
        <div className="w-48 h-3 bg-stone-200 rounded" />
        <div className="flex gap-1"><div className="w-16 h-3 bg-stone-100 rounded" /><div className="w-20 h-3 bg-stone-100 rounded" /></div>
      </td>
    )}
    {visibleColumns.has('primary') && (
      <td className="px-3 flex items-center gap-2 mt-2">
        <div className="w-6 h-6 rounded-full bg-stone-200" />
        <div className="space-y-1.5"><div className="w-24 h-3 bg-stone-200 rounded" /><div className="w-16 h-2 bg-stone-100 rounded" /></div>
      </td>
    )}
    {visibleColumns.has('employees') && <td className="px-2"><div className="w-16 h-3 bg-stone-200 rounded" /></td>}
    {visibleColumns.has('openRoles') && <td className="px-2"><div className="w-8 h-3 bg-stone-200 rounded" /></td>}
    {visibleColumns.has('currentAts') && <td className="px-2"><div className="w-16 h-4 bg-stone-200 rounded" /></td>}
    {visibleColumns.has('accountOwner') && <td className="px-2"><div className="w-20 h-4 bg-stone-200 rounded" /></td>}
    {visibleColumns.has('lastSignal') && <td className="px-2"><div className="w-12 h-3 bg-stone-200 rounded" /></td>}
    {visibleColumns.has('contactCount') && <td className="px-2"><div className="w-4 h-3 bg-stone-200 rounded" /></td>}
    {visibleColumns.has('activity') && <td className="px-2"><div className="w-12 h-3 bg-stone-200 rounded" /></td>}
    <td className="px-3"><div className="w-24 h-6 bg-stone-200 rounded border border-stone-200" /></td>
    {visibleColumns.has('status') && <td className="px-2"><div className="w-8 h-4 bg-stone-200 rounded" /></td>}
  </tr>
);

export function AccountList({
  accounts, checkedIds, toggleAll, toggleCheck, sortDir, setSortDir, visibleColumns,
  selectedDomain, setSelectedDomain, dispositions, pushState, pushingId, slActivity,
  isAdmin, isImpersonating, getRepInfo, handleSetDisposition, isRyanMode,
  hoverScoreId, setHoverScoreId, hoverScoreEl, setHoverScoreEl, dbLoaded = true
}: AccountListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const accountVirtualizer = useVirtualizer({
    count: accounts.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 52,
    overscan: 10,
  });
  const accountVirtualItems = accountVirtualizer.getVirtualItems();

  const rowOpacity = (lastActivity: string) => {
    const age = Date.now() - new Date(lastActivity).getTime();
    const week = 7 * 24 * 60 * 60 * 1000;
    if (age < 24 * 60 * 60 * 1000) return '';
    if (age < week) return '';
    if (age < week * 2) return 'opacity-70';
    return 'opacity-50';
  };

  // Visual heat: score + recency → background tint intensity
  const getHeatStyle = (score: number, lastActivity: string): { bg: string; nameClass: string; fresh: boolean } => {
    const ageMs = Date.now() - new Date(lastActivity).getTime();
    const isRecent = ageMs < 24 * 60 * 60 * 1000; // < 24h
    const isVeryRecent = ageMs < 4 * 60 * 60 * 1000; // < 4h

    if (score >= 40 && isVeryRecent) return {
      bg: 'bg-gradient-to-r from-rose-50/60 to-transparent',
      nameClass: 'text-[12px] font-bold text-stone-900',
      fresh: true,
    };
    if (score >= 40 && isRecent) return {
      bg: 'bg-gradient-to-r from-amber-50/40 to-transparent',
      nameClass: 'text-[12px] font-bold text-stone-900',
      fresh: true,
    };
    if (score >= 25) return {
      bg: '',
      nameClass: 'text-[12px] font-semibold text-stone-800',
      fresh: isRecent,
    };
    return {
      bg: '',
      nameClass: 'text-[12px] font-semibold text-stone-800',
      fresh: false,
    };
  };

  return (
    <div ref={scrollContainerRef} className="overflow-auto flex-1" style={{ maxHeight: 'calc(100vh - 120px)' }}>
      <table className="w-full table-fixed">
        <colgroup>
          <col style={{ width: 40 }} />
          <col style={{ width: 28 }} />
          <col />
          {visibleColumns.has('score') && <col style={{ width: 70 }} />}
          {visibleColumns.has('signals') && <col style={{ width: '22%' }} />}
          {visibleColumns.has('primary') && <col style={{ width: '15%' }} />}
          {visibleColumns.has('employees') && <col style={{ width: 80 }} />}
          {visibleColumns.has('openRoles') && <col style={{ width: 65 }} />}
          {visibleColumns.has('currentAts') && <col style={{ width: 90 }} />}
          {visibleColumns.has('accountOwner') && <col style={{ width: 120 }} />}
          {visibleColumns.has('lastSignal') && <col style={{ width: 85 }} />}
          {visibleColumns.has('contactCount') && <col style={{ width: 65 }} />}
          {visibleColumns.has('activity') && <col style={{ width: 90 }} />}
          <col style={{ width: 90 }} />
          {visibleColumns.has('status') && <col style={{ width: 60 }} />}
        </colgroup>
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="border-b border-stone-200/40 text-[11px] font-medium text-stone-400">
            <th className="px-3 py-2 w-10 text-left"><input type="checkbox" checked={checkedIds.size === accounts.length && accounts.length > 0} onChange={toggleAll} className="w-3.5 h-3.5 rounded border-stone-300 text-stone-900 focus:ring-0 cursor-pointer" /></th>
            <th className="px-1 py-2 w-8" />
            <th className="px-3 py-2 text-left cursor-pointer select-none" onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}>Account {sortDir === 'desc' ? <ArrowDown size={10} className="inline text-stone-400 ml-0.5" /> : <ArrowUp size={10} className="inline text-stone-400 ml-0.5" />}</th>
            {visibleColumns.has('score') && <th className="px-2 py-2 text-left">Score</th>}
            {visibleColumns.has('signals') && <th className="px-3 py-2 text-left">Signals</th>}
            {visibleColumns.has('primary') && <th className="px-3 py-2 text-left">Primary Contact</th>}
            {visibleColumns.has('employees') && <th className="px-2 py-2 text-left">Employees</th>}
            {visibleColumns.has('openRoles') && <th className="px-2 py-2 text-left">Roles</th>}
            {visibleColumns.has('currentAts') && <th className="px-2 py-2 text-left">Provider</th>}
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
            const urgency = getUrgencyTier(acct);
            const urgencyBorder = urgency === 'act_now' ? 'border-l-red-500' : urgency === 'high' ? 'border-l-amber-400' : '';
            const heat = getHeatStyle(acct.score, acct.lastActivity);

            return (
              <tr key={acct.companyDomain} onClick={() => setSelectedDomain(acct.companyDomain)}
                className={`group transition-all duration-300 cursor-pointer border-b border-stone-100/60 border-l-[3px] hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:-translate-y-[1px] hover:bg-white relative z-0 hover:z-10 ${urgencyBorder || (selectedDomain === acct.companyDomain ? `${{ hot: 'border-l-rose-500', warm: 'border-l-amber-400', watch: 'border-l-emerald-400' }[acct.tier]}` : `border-l-transparent hover:bg-stone-50/40 ${{ hot: 'hover:border-l-rose-400', warm: 'hover:border-l-amber-300', watch: 'hover:border-l-emerald-300' }[acct.tier]}`)} ${selectedDomain === acct.companyDomain ? 'bg-stone-50/80' : heat.bg} ${checkedIds.has(acct.companyDomain) ? 'bg-stone-50/60' : ''} ${urgency === 'act_now' ? 'bg-red-50/30' : ''} ${dispositions.get(acct.companyDomain)?.status === 'disqualified' ? 'opacity-30' : rowOpacity(acct.lastActivity)}`}
              >
                <td className="px-3 py-3" onClick={e => e.stopPropagation()}><input type="checkbox" checked={checkedIds.has(acct.companyDomain)} onChange={() => toggleCheck(acct.companyDomain)} className="w-3.5 h-3.5 rounded border-stone-300 text-stone-900 focus:ring-0 cursor-pointer" /></td>
                <td className="px-1 text-center"><TierDot tier={acct.tier} /></td>
                <td className="px-3 overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`${heat.nameClass} truncate`}>{acct.companyName}</span>
                        {heat.fresh && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Active today" />}
                        {acct.audienceSource && (
                          <span className="inline-flex items-center px-1.5 py-[1px] rounded text-[8px] font-semibold shrink-0 bg-stone-100 text-stone-400">{acct.audienceSource}</span>
                        )}
                        {acct.firmographicTier && (
                          <span className={`inline-flex items-center px-1.5 py-[1px] rounded text-[8px] font-bold shrink-0 ${
                            acct.firmographicTier === 'tier_1' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60' :
                            acct.firmographicTier === 'tier_2' ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200/60' :
                            'bg-stone-50 text-stone-400 ring-1 ring-stone-200/60'
                          }`}>{acct.firmographicTier === 'tier_1' ? '⭐ T1' : acct.firmographicTier === 'tier_2' ? 'T2' : 'T3'}</span>
                        )}
                        {(() => {
                          const d = dispositions.get(acct.companyDomain)?.status || 'new';
                          const isStale = d === 'new' && (Date.now() - new Date(acct.lastSignalAt).getTime()) > 3 * 24 * 60 * 60 * 1000;
                          if (isStale) return <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] font-semibold bg-stone-200 text-stone-500">Stale</span>;
                          return null;
                        })()}
                        {isAdmin && !isImpersonating && (() => {
                          const rep = getRepInfo(acct.assignedRepId);
                          return rep ? (
                            <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[6px] font-bold shrink-0" style={{ backgroundColor: rep.avatar_color }} title={rep.full_name}>{rep.initials}</div>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  </div>
                </td>
                {visibleColumns.has('score') && (
                <td className="px-2" onMouseEnter={(e) => { setHoverScoreId(acct.companyDomain); setHoverScoreEl(e.currentTarget); }} onMouseLeave={() => { setHoverScoreId(null); setHoverScoreEl(null); }}>
                  <div className="flex items-center gap-1">
                    <ScoreBadge score={acct.score} fitScore={acct.fitScore} intentScore={acct.intentScore} />
                    <TrendArrow signals={acct.signals} />
                  </div>
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
                <td className="px-3 overflow-hidden">
                  {(() => {
                    const whyNow = getWhyNowLine(acct);
                    const urgency = getUrgencyTier(acct);
                    const webCount = acct.signals.filter(s => s.source === 'rb2b').length;
                    return (
                      <div className="space-y-0.5">
                        {whyNow ? (
                          <div className="flex items-start gap-1.5">
                            <span className="text-[10px] shrink-0 mt-0.5">
                              {urgency === 'act_now' ? '🔴' : urgency === 'high' ? '🟡' : '💡'}
                            </span>
                            <span className={`text-[11px] font-medium leading-snug line-clamp-2 ${
                              urgency === 'act_now' ? 'text-red-700' : urgency === 'high' ? 'text-amber-700' : 'text-stone-700'
                            }`} title={whyNow}>{whyNow}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-stone-300 italic">No signals</span>
                        )}
                        {(acct.signalCount ?? acct.signals.length) > 0 && (
                          <div className="flex items-center gap-2 pl-5">
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-stone-500 font-medium">
                              <TargetSignalIcon size={10} />{acct.signalCount ?? acct.signals.length} signal{(acct.signalCount ?? acct.signals.length) !== 1 ? 's' : ''}
                            </span>
                            {webCount > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] text-violet-500 font-medium">
                                🌐 {webCount} web
                              </span>
                            )}
                            {(acct.contactCount ?? acct.contacts.length) > 1 && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-500 font-medium">
                                <Users size={8} />{acct.contactCount ?? acct.contacts.length}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
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
                  <span className="text-[11px] text-stone-600 font-medium">{acct.employeeCount > 0 ? getLinkedInSizeRange(acct.employeeCount) : '—'}</span>
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
                    const pcActivity = pc ? slActivity.get(pc.email) : undefined;
                    if (pcActivity && pcActivity.total_touches > 0) {
                      return (
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center gap-0.5 px-1 py-[1px] rounded text-[9px] font-semibold bg-blue-50 text-blue-600" title="Emails sent"><Mail size={8} />{pcActivity.emails_sent}</span>
                          {pcActivity.calls > 0 && <span className="inline-flex items-center gap-0.5 px-1 py-[1px] rounded text-[9px] font-semibold bg-stone-50 text-stone-600" title="Calls"><Phone size={8} />{pcActivity.calls}</span>}
                          {pcActivity.has_reply && <span className="inline-flex items-center gap-0.5 px-1 py-[1px] rounded text-[9px] font-bold bg-violet-50 text-violet-700" title="Replied"><MessageSquare size={8} />✓</span>}
                          {pcActivity.has_meeting && <span className="inline-flex items-center gap-0.5 px-1 py-[1px] rounded text-[9px] font-bold bg-emerald-50 text-emerald-700" title="Meeting booked">📅</span>}
                        </div>
                      );
                    }
                    return (
                      <div className="flex items-center gap-1.5">
                        <FreshnessDot dateStr={acct.lastActivity} />
                        <span className="text-[11px] text-stone-400">{timeAgo(acct.lastActivity)}</span>
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
    </div>
  );
}
