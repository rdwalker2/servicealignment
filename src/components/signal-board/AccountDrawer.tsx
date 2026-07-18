import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Mail, MapPin, Users, Building2, Sparkles, Check, Activity,
  AlertCircle, Target, Loader2, Copy, ChevronDown
} from 'lucide-react';
import { ScoreBadge, TierDot, LinkedinIcon } from './signalBoardAtoms';
import type { AccountView, ContactView, SignalEvent, AccountNote } from '../../data/signalBoardData';
import { getSignalIcon, timeAgo, getPersonaLabel, getPersonaTier } from '../../data/signalBoardData';
import BuyingCommitteeHeatmap from '../shared/BuyingCommitteeHeatmap';
import { generateLinkedInDraft } from '../../lib/aiPersonalization';
import { getAccountInsights } from '../../hooks/useInsights';
import { supabase } from '../../lib/supabase';
import { groupByAccount } from '../../data/signalBoardData';

type DrawerTab = 'why_now' | 'intel' | 'people' | 'outreach';

const TABS: { key: DrawerTab; label: string }[] = [
  { key: 'why_now', label: 'Why Now' },
  { key: 'intel', label: 'Intel' },
  { key: 'people', label: 'Contacts' },
  { key: 'outreach', label: 'Outreach' },
];

export default function AccountDrawer({ account, onClose, onAddToCadence, onContactAddToCadence, contactPushState, onAddNote, isRyanMode }: {
  account: AccountView;
  onClose: () => void;
  onAddToCadence: (domain: string) => void;
  onContactAddToCadence: (email: string) => void;
  contactPushState: Map<string, boolean>;
  onAddNote: (domain: string, text: string) => void;
  isRyanMode: boolean;
}) {
  const [tab, setTab] = useState<DrawerTab>('why_now');
  const [noteText, setNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  // AI LinkedIn Draft State
  const [draftMessage, setDraftMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Lazy load full account data (signals and contacts) if only summary is passed
  const [fullAccount, setFullAccount] = useState<AccountView | null>(
    account.signals.length > 0 ? account : null
  );

  useEffect(() => {
    let active = true;
    async function load() {
      // Fetch raw signals for just this domain
      const { data: signals } = await supabase.from('clay_signals')
        .select('*')
        .eq('company_domain', account.companyDomain);
        
      // Fetch contacts for just this domain from the new contacts table
      const { data: contacts } = await supabase.from('contacts')
        .select('*')
        .eq('domain', account.companyDomain);
        
      if (active) {
        // We still use groupByAccount to shape the AccountView for signals
        const [grouped] = groupByAccount(signals || []);
        
        // Map the new relational contacts to ContactView format
        const mappedContacts: ContactView[] = (contacts || []).map(c => ({
          name: c.name,
          email: c.email,
          title: c.title || '',
          linkedinUrl: c.linkedin_url || '',
          phone: c.phone || '',
          avatarColor: 'bg-stone-200 text-stone-600', // standard fallback
          isPrimary: c.is_primary || false,
          contactPersona: c.persona as any,
          companyName: grouped?.companyName || account.companyName,
          companyDomain: grouped?.companyDomain || account.companyDomain,
          companyLocation: grouped?.companyLocation || account.companyLocation,
          companyTier: grouped?.tier || account.tier,
          employeeCount: grouped?.employeeCount || account.employeeCount,
          signals: grouped ? grouped.signals.filter(s => s.contactEmail === c.email) : [],
          contactScore: grouped ? grouped.signals.filter(s => s.contactEmail === c.email).reduce((sum, s) => sum + s.score, 0) : 0,
          lastSignalAt: grouped ? (grouped.signals.filter(s => s.contactEmail === c.email).sort((a, b) => b.detectedAt.localeCompare(a.detectedAt))[0]?.detectedAt || '') : '',
          webVisitCount: grouped ? grouped.signals.filter(s => s.contactEmail === c.email && s.source === 'rb2b').length : 0,
          assignedRepId: grouped?.assignedRepId || account.assignedRepId,
          sfContactId: c.sf_contact_id
        }));
        
        if (grouped) {
          grouped.contacts = mappedContacts;
          setFullAccount(grouped);
        } else {
          setFullAccount({
            ...account,
            contacts: mappedContacts,
            signals: []
          });
        }
      }
    }
    load();
    return () => { active = false; };
  }, [account.companyDomain]);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['isp', 'account_intel']));
  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const Section = ({ id, title, icon, children }: { id: string; title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) => (
    <div>
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between py-1.5 group"
      >
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
          {icon}
          {title}
        </h3>
        <ChevronDown size={12} className={`text-stone-300 transition-transform ${expandedSections.has(id) ? '' : '-rotate-90'}`} />
      </button>
      {expandedSections.has(id) && children}
    </div>
  );

  const handleGenerateLinkedIn = async () => {
    if (!fullAccount) return;
    setIsGenerating(true);
    try {
      const draft = await generateLinkedInDraft(fullAccount, fullAccount.signals.map(s => ({
        id: s.detectedAt,
        type: 'note',
        title: s.name,
        description: s.description,
        timestamp: s.detectedAt,
        author: s.source
      })));
      setDraftMessage(draft);
    } catch (err) {
      console.error('Failed to generate LinkedIn draft:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draftMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const groupedSignals = useMemo(() => {
    if (!fullAccount) return { today: [], thisWeek: [], older: [] };
    const now = new Date();
    const today: SignalEvent[] = [];
    const thisWeek: SignalEvent[] = [];
    const older: SignalEvent[] = [];
    fullAccount.signals.forEach(s => {
      const d = new Date(s.detectedAt);
      const diffDays = (now.getTime() - d.getTime()) / 86400000;
      if (diffDays < 1) today.push(s);
      else if (diffDays < 7) thisWeek.push(s);
      else older.push(s);
    });
    return { today, thisWeek, older };
  }, [fullAccount]);

  const insights = fullAccount ? getAccountInsights(fullAccount) : null;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="fixed inset-0 bg-black/15 z-40" onClick={onClose} />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 w-[550px] h-full bg-white border-l border-gray-200 z-50 flex flex-col shadow-2xl"
      >
        {!fullAccount ? (
          <div className="flex-1 flex flex-col items-center justify-center text-stone-400 gap-3">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-[13px] font-medium">Loading Account Details...</p>
          </div>
        ) : (
          <>
            <div className="shrink-0 border-b border-gray-100 px-5 pt-4 pb-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <TierDot tier={fullAccount.tier} />
                    <h2 className="text-[14px] font-semibold text-[#1E293B] truncate">{fullAccount.companyName}</h2>
                    <ScoreBadge score={fullAccount.score} />
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] text-[#64748B]">
                    <span className="flex items-center gap-0.5"><MapPin size={10} />{fullAccount.companyLocation}</span>
                    <span>·</span>
                    <span>{fullAccount.employeeCount.toLocaleString()} emp</span>
                    <span>·</span>
                    <span>{fullAccount.openRoles} roles</span>
                  </div>
                </div>
                <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"><X size={15} /></button>
              </div>
            </div>

            <div className="shrink-0 bg-stone-50 px-5 py-1.5 flex items-center gap-1 border-b border-stone-100">
              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    tab === t.key
                      ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-200/60'
                      : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === 'why_now' && (
            <div className="space-y-5">
              <div className="rounded-xl bg-gradient-to-br from-stone-900 to-stone-800 text-white p-4 -mx-1">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-white truncate pr-4">{fullAccount.companyName}</div>
                    <div className="text-[11px] text-stone-300 mt-0.5 truncate pr-4">{fullAccount.companyDomain}</div>
                  </div>
                  <TierDot tier={fullAccount.tier} />
                </div>
                <div className="mt-3 flex items-center gap-4 text-[10px] text-stone-300">
                  {fullAccount.companyLocation && <span className="flex items-center gap-1"><MapPin size={10} className="shrink-0" /><span className="truncate">{fullAccount.companyLocation}</span></span>}
                  {fullAccount.employeeCount > 0 && <span className="flex items-center gap-1"><Users size={10} className="shrink-0" />{fullAccount.employeeCount} emp</span>}
                  {fullAccount.currentAts && <span className="flex items-center gap-1 text-white/80">{fullAccount.currentAts}</span>}
                </div>
                {fullAccount.signals.length > 0 && (
                  <div className="bg-white/10 rounded-lg px-3 py-2 mt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px]">{getSignalIcon(fullAccount.signals[0].source, fullAccount.signals[0].name)}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-medium text-white">{fullAccount.signals[0].name}</span>
                      </div>
                      <span className="text-[9px] text-stone-400 shrink-0">{timeAgo(fullAccount.signals[0].detectedAt)}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {fullAccount.aiResearchBrief && (
                <div className="rounded-lg bg-stone-50 border border-stone-100 p-3.5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles size={11} className="text-stone-500" />
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-stone-500">AI Research Brief</h3>
                  </div>
                  <p className="text-[12px] leading-relaxed text-stone-700">{fullAccount.aiResearchBrief}</p>
                </div>
              )}

              <div>
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Why This Matters</h3>
                <div className="space-y-1.5">
                  {insights?.map((insight, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-stone-600">
                      <span className="text-stone-400 mt-0.5 shrink-0">•</span>
                      <span className="leading-snug">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {fullAccount.signals.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Activity Timeline</h3>
                  <div className="space-y-0.5 ml-2 border-l border-stone-100 pl-3">
                    {fullAccount.signals.slice(0, 6).map((s, i) => (
                      <div key={s.name + s.detectedAt + i} className="flex items-center gap-2 py-1 relative">
                        <div className="absolute -left-[13.5px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-stone-300" />
                        <span className="text-[11px] shrink-0">{getSignalIcon(s.source, s.name)}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] font-medium text-stone-700 truncate block">{s.name}</span>
                        </div>
                        <span className="text-[9px] text-stone-400 shrink-0">{timeAgo(s.detectedAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'intel' && (
            <div className="space-y-5">
              {(fullAccount.ispScore != null || fullAccount.ispExplanation) && (
                <Section id="isp" title="Intent Signal Processing" icon={<Activity size={11} />}>
                  <div className="rounded-lg border border-violet-200/60 bg-gradient-to-br from-violet-50/80 to-white p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-violet-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${fullAccount.ispScore >= 60 ? 'bg-red-500' : fullAccount.ispScore >= 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(fullAccount.ispScore ?? 0, 100)}%` }} />
                        </div>
                        <span className={`text-sm font-bold ${fullAccount.ispScore >= 60 ? 'text-red-600' : fullAccount.ispScore >= 40 ? 'text-amber-600' : 'text-emerald-600'}`}>{fullAccount.ispScore}</span>
                      </div>
                    </div>
                    {fullAccount.ispExplanation && <p className="text-[11px] leading-relaxed text-violet-800/80">{fullAccount.ispExplanation}</p>}
                  </div>
                </Section>
              )}
              <Section id="salesforce" title="Salesforce CRM" icon={<Building2 size={11} />}>
                <div className="rounded-lg border border-blue-100 bg-blue-50/30 p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Sync Status</span>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                      fullAccount.sfSyncStatus === 'synced' ? 'bg-emerald-100 text-emerald-700' :
                      fullAccount.sfSyncStatus === 'created' ? 'bg-blue-100 text-blue-700' :
                      fullAccount.sfSyncStatus === 'not_in_sfdc' ? 'bg-amber-100 text-amber-700' :
                      fullAccount.sfSyncStatus === 'error' ? 'bg-red-100 text-red-700' :
                      'bg-stone-100 text-stone-500'
                    }`}>
                      {fullAccount.sfSyncStatus === 'synced' ? '✅ Synced' :
                       fullAccount.sfSyncStatus === 'created' ? '🆕 Created' :
                       fullAccount.sfSyncStatus === 'not_in_sfdc' ? '⚠️ Not in SFDC' :
                       fullAccount.sfSyncStatus === 'error' ? '❌ Error' :
                       '⏳ Pending'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <span className="text-blue-400 block mb-0.5">Account ID</span>
                      {fullAccount.sfAccountId ? (
                        <a href={`https://servicealignment.lightning.force.com/lightning/r/Account/${fullAccount.sfAccountId}/view`}
                          target="_blank" rel="noopener noreferrer"
                          className="font-mono text-[10px] text-blue-600 hover:underline">{fullAccount.sfAccountId}</a>
                      ) : <span className="text-stone-400">—</span>}
                    </div>
                    <div>
                      <span className="text-blue-400 block mb-0.5">Account Owner</span>
                      <span className="font-medium text-stone-800">{fullAccount.sfAccountOwner || '—'}</span>
                    </div>
                    <div>
                      <span className="text-blue-400 block mb-0.5">Last Synced</span>
                      <span className="text-stone-600">{fullAccount.sfLastSyncedAt ? timeAgo(fullAccount.sfLastSyncedAt) : 'Never'}</span>
                    </div>
                    <div>
                      <span className="text-blue-400 block mb-0.5">Contacts in SFDC</span>
                      <span className="text-stone-600">{fullAccount.contacts.filter(c => c.sfContactId).length} / {fullAccount.contacts.length}</span>
                    </div>
                  </div>
                </div>
              </Section>
              <Section id="account_details" title="Account Details" icon={<Building2 size={11} />}>
                <div className="grid grid-cols-2 gap-4 text-[11px]">
                  <div><span className="text-stone-400 block mb-0.5">Current Provider</span><span className="font-medium text-stone-800">{fullAccount.currentAts || '—'}</span></div>
                  <div><span className="text-stone-400 block mb-0.5">Employee Count (Raw)</span><span className="font-medium text-stone-800">{fullAccount.employeeCount ? fullAccount.employeeCount.toLocaleString() : '—'}</span></div>
                  <div><span className="text-stone-400 block mb-0.5">Company Size (LinkedIn)</span><span className="font-medium text-stone-800">{fullAccount.companySizeLinkedin || '—'}</span></div>
                  <div><span className="text-stone-400 block mb-0.5">Open Roles</span><span className="font-medium text-stone-800">{fullAccount.openRoles > 0 ? fullAccount.openRoles : '—'}</span></div>
                  <div><span className="text-stone-400 block mb-0.5">Market</span><span className="font-medium text-stone-800">{fullAccount.market ? fullAccount.market.toUpperCase() : '—'}</span></div>
                  <div><span className="text-stone-400 block mb-0.5">Tier</span><span className="font-medium text-stone-800">{fullAccount.firmographicTier ? fullAccount.firmographicTier.replace('_', ' ') : '—'}</span></div>
                </div>
              </Section>
              {fullAccount.accountIntel && fullAccount.accountIntel.length > 0 && (
                <Section id="account_intel" title="Account Intelligence" icon={<Building2 size={11} />}>
                  <div className="space-y-1.5">
                    {fullAccount.accountIntel.map((intel, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-stone-600">
                        <span className="text-blue-400 mt-0.5 shrink-0 text-[8px]">●</span>
                        <span className="leading-snug">{intel}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          )}

          {tab === 'people' && (
            <div className="space-y-5">
              <BuyingCommitteeHeatmap account={fullAccount} />
              <div>
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Contacts ({fullAccount.contacts.length})</h3>
                <div className="space-y-1.5">
                  {fullAccount.contacts.map(c => {
                    const ini = c.name.split(' ').map(n => n[0]).join('');
                    const isPushed = contactPushState.get(c.email) || false;
                    return (
                      <div key={c.email} className="flex items-center gap-2 p-2 rounded-lg border border-stone-100 hover:border-stone-200 transition-colors">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0" style={{ backgroundColor: c.avatarColor }}>{ini}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-stone-800">{c.name}</span>
                            {c.sfContactId && (
                              <a
                                href={`https://servicealignment.lightning.force.com/lightning/r/Contact/${c.sfContactId}/view`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="opacity-45 hover:opacity-100 transition-opacity shrink-0"
                                title="Open Contact in Salesforce"
                              >
                                <img src="https://cdn.iconscout.com/icon/free/png-256/free-salesforce-282298.png" alt="SF" className="w-3 h-3 object-contain" />
                              </a>
                            )}
                          </div>
                          <div className="text-[10px] text-stone-500 truncate">{c.title}</div>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button onClick={() => onContactAddToCadence(c.email)} disabled={isPushed} className={`px-2 py-1 rounded text-[9px] font-semibold ${isPushed ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-900 text-white'}`}>
                            {isPushed ? <Check size={10} /> : <Mail size={10} />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === 'outreach' && (
            <div className="space-y-5">
              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">AI LinkedIn Message</h4>
                  {draftMessage && (
                    <button onClick={handleCopy} className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1">
                      {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />} {copied ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>
                {!draftMessage ? (
                  <button onClick={handleGenerateLinkedIn} disabled={isGenerating} className="w-full flex items-center justify-center gap-2 p-3 rounded border border-violet-200 bg-violet-50 text-violet-700 font-bold text-xs">
                    {isGenerating ? <Loader2 size={14} className="animate-spin" /> : 'Generate Request'}
                  </button>
                ) : (
                  <textarea value={draftMessage} onChange={(e) => setDraftMessage(e.target.value)} className="w-full h-24 p-3 text-[11px] bg-slate-50 border border-slate-200 rounded resize-none" />
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Notes</h3>
                  <button onClick={() => setShowNoteInput(!showNoteInput)} className="text-[11px] font-medium text-stone-500">+ Add</button>
                </div>
                {fullAccount.notes.map(n => (
                  <div key={n.id} className="py-2.5 border-b border-stone-50">
                    <p className="text-[12px] text-stone-700">{n.text}</p>
                    <p className="text-[10px] text-stone-400 mt-1">{n.authorName} · {timeAgo(n.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </>
        )}
      </motion.div>
    </>
  );
}
