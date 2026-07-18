import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import { Users, Mail, Globe, Loader2, Check } from 'lucide-react';
import type { ContactView } from '../../data/signalBoardData';
import { getSignalIcon, timeAgo, getWebIntentLine } from '../../data/signalBoardData';
import { ScoreBadge, TierDot, SignalTag, TrendArrow, FreshnessDot, LinkedinIcon } from './signalBoardAtoms';

interface ContactListProps {
  contacts: ContactView[];
  checkedIds: Set<string>;
  toggleAll: () => void;
  toggleCheck: (id: string) => void;
  visibleColumns: Set<string>;
  setSelectedContactEmail: (email: string) => void;
  onAddToCadence: (email: string) => void;
  onAddToAimfox?: (contactId: string, contact: any) => void;
  isPushedFn: (email: string) => boolean;
  pushingContactId: string | null;
  pushingAimfoxId?: string | null;
  isRyanMode: boolean;
  hoverScoreId: string | null;
  setHoverScoreId: (id: string | null) => void;
  hoverScoreEl: HTMLElement | null;
  setHoverScoreEl: (el: HTMLElement | null) => void;
}

export function ContactList({
  contacts, checkedIds, toggleAll, toggleCheck, visibleColumns,
  setSelectedContactEmail, onAddToCadence, onAddToAimfox, isPushedFn, pushingContactId, pushingAimfoxId, isRyanMode,
  hoverScoreId, setHoverScoreId, hoverScoreEl, setHoverScoreEl
}: ContactListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const contactVirtualizer = useVirtualizer({
    count: contacts.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 52,
    overscan: 10,
  });
  const contactVirtualItems = contactVirtualizer.getVirtualItems();

  const rowOpacity = (lastActivity: string) => {
    const age = Date.now() - new Date(lastActivity).getTime();
    const week = 7 * 24 * 60 * 60 * 1000;
    if (age < 24 * 60 * 60 * 1000) return '';
    if (age < week) return '';
    if (age < week * 2) return 'opacity-70';
    return 'opacity-50';
  };

  return (
    <div ref={scrollContainerRef} className="overflow-auto flex-1" style={{ maxHeight: 'calc(100vh - 120px)' }}>
      <table className="w-full table-fixed">
        <colgroup>
          <col style={{ width: 40 }} />
          <col style={{ width: '25%' }} />
          <col style={{ width: '20%' }} />
          <col />
          <col style={{ width: 90 }} />
          <col style={{ width: 120 }} />
          <col style={{ width: 90 }} />
        </colgroup>
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="border-b border-stone-200/40 text-[11px] font-medium text-stone-400">
            <th className="px-3 py-2 w-10 text-left"><input type="checkbox" checked={checkedIds.size === contacts.length && contacts.length > 0} onChange={toggleAll} className="w-3.5 h-3.5 rounded border-stone-300 text-stone-900 focus:ring-0 cursor-pointer" /></th>
            <th className="px-3 py-2 text-left">Contact</th>
            {visibleColumns.has('organization') && <th className="px-3 py-2 text-left">Organization</th>}
            <th className="px-3 py-2 text-left">SFDC ID</th>
            {visibleColumns.has('signals') && <th className="px-3 py-2 text-left">Signals</th>}
            {visibleColumns.has('score') && <th className="px-2 py-2 text-left">Score</th>}
            {visibleColumns.has('webActivity') && <th className="px-3 py-2 text-left">Web Activity</th>}
            <th className="px-3 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.length === 0 ? (
            <tr><td colSpan={7} className="text-center py-16"><Users size={32} className="mx-auto text-gray-300 mb-2" /><p className="text-[13px] text-stone-500 font-medium">No contacts match your filters</p></td></tr>
          ) : contactVirtualItems.map(virtualRow => {
            const c = contacts[virtualRow.index];
            const ini = c.name.split(' ').map(n => n[0]).join('');
            const hasWeb = !!c.lastPageVisited;
            return (
              <tr key={c.email} onClick={() => setSelectedContactEmail(c.email)}
                className={`group transition-all duration-300 cursor-pointer border-b border-stone-100/60 border-l-[3px] border-l-transparent hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:-translate-y-[1px] hover:bg-white hover:border-l-stone-300 relative z-0 hover:z-10 ${hasWeb ? 'bg-violet-50/10 hover:border-l-violet-400' : ''} ${checkedIds.has(c.email) ? 'bg-stone-50/60' : ''} ${rowOpacity(c.lastSignalAt)}`}
              >
                <td className="px-3 py-3" onClick={e => e.stopPropagation()}><input type="checkbox" checked={checkedIds.has(c.email)} onChange={() => toggleCheck(c.email)} className="w-3.5 h-3.5 rounded border-stone-300 text-stone-900 focus:ring-0 cursor-pointer" /></td>
                <td className="px-3 py-3 overflow-hidden flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: c.avatarColor }}>{ini}</div>
                  <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-semibold text-stone-800 truncate">{c.name}</span>
                    {c.isPrimary && <span className="shrink-0 text-[8px] bg-stone-100 text-stone-500 px-1 py-0.5 rounded font-semibold">Primary</span>}
                  </div>
                  <div className="text-[11px] text-stone-400 truncate mt-0.5">{c.title}</div>
                  </div>
                </td>
                {visibleColumns.has('organization') && (
                <td className="px-3 overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <TierDot tier={c.companyTier} />
                    <div className="min-w-0">
                      <div className="text-[12px] font-medium text-stone-700 truncate">{c.companyName}</div>
                      <div className="text-[10px] text-stone-400 truncate">{c.companyLocation}</div>
                    </div>
                  </div>
                </td>
                )}
                <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                  {c.sfContactId ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-stone-500">{c.sfContactId}</span>
                      <a
                        href={`https://servicealignment.lightning.force.com/lightning/r/Contact/${c.sfContactId}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-40 hover:opacity-100 transition-opacity shrink-0"
                        title="Open Contact in Salesforce"
                      >
                        <img src="https://cdn.iconscout.com/icon/free/png-256/free-salesforce-282298.png" alt="SF" className="w-3.5 h-3.5 object-contain" />
                      </a>
                    </div>
                  ) : (
                    <span className="text-[10px] text-stone-300">—</span>
                  )}
                </td>
                {visibleColumns.has('signals') && (
                <td className="px-3 overflow-hidden">
                  {(() => {
                    const webLine = getWebIntentLine(c.signals);
                    const otherSignals = c.signals.filter(s => s.source !== 'vector');
                    return (
                      <div className="space-y-1">
                        {webLine && (
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] shrink-0">🌐</span>
                            <span className="text-[11px] text-violet-700 font-medium leading-snug truncate" title={webLine}>{webLine}</span>
                          </div>
                        )}
                        {otherSignals.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {otherSignals.slice(0, webLine ? 1 : 2).map((s, i) => <SignalTag key={s.name + i} signal={s} />)}
                            {otherSignals.length > (webLine ? 1 : 2) && (
                              <span className="inline-flex items-center px-1.5 py-[1px] rounded text-[10px] font-medium text-stone-400 bg-stone-100/60">+{otherSignals.length - (webLine ? 1 : 2)}</span>
                            )}
                          </div>
                        )}
                        {!webLine && c.signals.length === 0 && (
                          <span className="text-[11px] text-stone-300 italic">No signals</span>
                        )}
                      </div>
                    );
                  })()}
                </td>
                )}
                {visibleColumns.has('score') && (
                <td className="px-2" onMouseEnter={(e) => { setHoverScoreId(c.email); setHoverScoreEl(e.currentTarget); }} onMouseLeave={() => { setHoverScoreId(null); setHoverScoreEl(null); }}>
                  {c.contactScore > 0 ? (
                    <div className="flex items-center gap-1">
                      <ScoreBadge score={c.contactScore} />
                      <TrendArrow signals={c.signals} />
                    </div>
                  ) : <span className="text-[11px] text-stone-300">—</span>}
                  {hoverScoreId === c.email && c.contactScore > 0 && hoverScoreEl && ReactDOM.createPortal(
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}
                      style={{ position: 'fixed', top: hoverScoreEl.getBoundingClientRect().bottom + 8, left: Math.max(8, hoverScoreEl.getBoundingClientRect().left - 80), zIndex: 9999 }}
                    >
                      <div className="w-64 bg-white rounded-xl shadow-xl border border-stone-200 p-3.5 text-left pointer-events-none">
                        <div className="text-[11px] font-bold text-stone-900 mb-2">Contact Score: {c.contactScore}</div>
                        <div className="space-y-1">
                          {c.signals.map((s, i) => (
                            <div key={s.name + i} className="flex items-center justify-between text-[10px]">
                              <div className="flex items-center gap-1.5 text-stone-600 truncate flex-1">
                                <span className="shrink-0">{getSignalIcon(s.source, s.name)}</span>
                                <span className="truncate">{s.name}</span>
                              </div>
                              <span className="text-stone-500 font-semibold ml-2 shrink-0">+{s.score}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-stone-100 text-[9px] text-stone-400">
                          {c.signals.length} signal{c.signals.length !== 1 ? 's' : ''} · {c.webVisitCount} web visit{c.webVisitCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </motion.div>,
                    document.body
                  )}
                </td>
                )}
                {visibleColumns.has('webActivity') && (
                <td className="px-3">
                  {c.webVisitCount > 0 ? (
                    <div>
                      <div className="flex items-center gap-1 text-[11px] font-medium text-stone-600">
                        <FreshnessDot dateStr={c.lastSignalAt} />
                        <Globe size={10} className="shrink-0" />
                        <span className="truncate">{c.webVisitCount} {c.webVisitCount === 1 ? 'visit' : 'visits'}</span>
                      </div>
                      {c.lastPageVisited && <div className="text-[10px] text-stone-400 mt-0.5 truncate" title={c.lastPageVisited}>{c.lastPageVisited}</div>}
                      <div className="text-[9px] text-stone-400 mt-0.5">{timeAgo(c.lastSignalAt)}</div>
                    </div>
                  ) : <span className="text-[11px] text-gray-300">—</span>}
                </td>
                )}
                <td className="px-3" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-0.5">
                    {isPushedFn(c.email) ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-[2px] rounded text-[9px] font-semibold bg-emerald-600 text-white">
                        <Check size={8} />{isRyanMode ? 'In Instantly' : 'In Cadence'}
                      </span>
                    ) : pushingContactId === c.email ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-[2px] rounded text-[9px] font-semibold bg-stone-200 text-stone-500">
                        <Loader2 size={8} className="animate-spin" />Enrolling...
                      </span>
                    ) : (
                      <button
                        onClick={() => onAddToCadence(c.email)}
                        className="inline-flex items-center gap-1 px-2 py-[3px] rounded text-[9px] font-semibold bg-stone-900 text-white opacity-0 group-hover:opacity-100 hover:bg-stone-700 transition-all"
                        title={isRyanMode ? 'Add to Instantly' : 'Add to cadence'}
                      >
                        <Mail size={8} />{isRyanMode ? 'Add' : 'Enroll'}
                      </button>
                    )}
                    {pushingAimfoxId === c.email ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-[2px] rounded text-[9px] font-semibold bg-blue-100 text-blue-700">
                        <Loader2 size={8} className="animate-spin" />Aimfox...
                      </span>
                    ) : onAddToAimfox && (
                      <button
                        onClick={() => onAddToAimfox(c.email, c)}
                        className="inline-flex items-center gap-1 px-2 py-[3px] rounded text-[9px] font-semibold bg-blue-600 text-white opacity-0 group-hover:opacity-100 hover:bg-blue-700 transition-all"
                        title="Add to Aimfox Campaign"
                      >
                        Aimfox
                      </button>
                    )}
                    <a href={c.linkedinUrl} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 text-gray-400 hover:text-[#0077B5] hover:bg-blue-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                      onClick={e => e.stopPropagation()}
                    ><LinkedinIcon size={11} /></a>
                  </div>
                </td>
              </tr>
            );
          })}
          {contacts.length > 0 && (
            <tr style={{ height: `${contactVirtualizer.getTotalSize() - (contactVirtualItems.length > 0 ? contactVirtualItems[contactVirtualItems.length - 1].end : 0)}px` }}>
              <td colSpan={7} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
