import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Mail, MapPin, Building2, Globe, Sparkles, Phone,
  Check, Loader2, Copy,
} from 'lucide-react';
import CallModal from './CallModal';
import { ScoreBadge, TrendArrow, FreshnessDot, LinkedinIcon } from './signalBoardAtoms';
import type { ContactView, AccountView, SignalEvent } from '../../data/signalBoardData';
import { getSignalIcon, timeAgo } from '../../data/signalBoardData';
import { generateLinkedInDraft } from '../../lib/aiPersonalization';
import { getContactInsights } from '../../hooks/useInsights';

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

interface ContactDrawerProps {
  contact: ContactView;
  account?: AccountView;
  onClose: () => void;
  onAddToCadence: (email: string) => void;
  isPushed: boolean;
  isRyanMode: boolean;
}

type ContactDrawerTab = 'why_now' | 'outreach';

// ────────────────────────────────────────────
// ContactDrawer
// ────────────────────────────────────────────

function ContactDrawer({ contact, account, onClose, onAddToCadence, isPushed, isRyanMode }: ContactDrawerProps) {
  const [tab, setTab] = useState<ContactDrawerTab>('why_now');
  const [showCallModal, setShowCallModal] = useState(false);

  // AI LinkedIn Draft State
  const [draftMessage, setDraftMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateLinkedIn = async () => {
    setIsGenerating(true);
    try {
      // Pass the account if available, otherwise fallback to contact wrapped as AccountView
      const aiAccount = account || {
        companyName: contact.companyName,
        contacts: [contact],
      };
      const draft = await generateLinkedInDraft(aiAccount, contact.signals.map(s => ({
        id: s.detectedAt,
        type: 'note',
        title: s.name,
        description: s.description,
        timestamp: s.detectedAt,
        author: s.source,
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

  const ini = contact.name.split(' ').map(n => n[0]).join('');

  const tabs: { key: ContactDrawerTab; label: string }[] = [
    { key: 'why_now', label: 'Why Now' },
    { key: 'outreach', label: 'Outreach' },
  ];

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 bg-black/15 z-40"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 w-[440px] h-full bg-white border-l border-gray-200 z-50 flex flex-col shadow-2xl"
      >
        {/* ── Persistent Header ── */}
        <div className="shrink-0 border-b border-gray-100 px-5 pt-4 pb-3">
          {/* Row 1: Avatar + Name + Primary badge + Close */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0 mt-0.5"
                style={{ backgroundColor: contact.avatarColor }}
              >
                {ini}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-[16px] font-semibold text-[#1E293B] truncate">{contact.name}</h2>
                  {contact.isPrimary && (
                    <span className="text-[9px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                      Primary
                    </span>
                  )}
                </div>
                {/* Row 2: Title */}
                <div className="text-[13px] text-[#64748B] truncate mt-0.5">{contact.title}</div>
                {/* Row 3: Company */}
                <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] mt-1">
                  <Building2 size={10} />
                  <span className="truncate">{contact.companyName}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Row 4: CTA buttons */}
          <div className="flex gap-2 mb-1">
            <button
              onClick={() => onAddToCadence(contact.email)}
              disabled={isPushed}
              className={`flex-1 flex items-center justify-center gap-1.5 py-[8px] rounded-lg text-[11px] font-semibold transition-all
                ${isPushed ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
            >
              {isPushed ? <Check size={12} /> : <Mail size={12} />}
              {isPushed
                ? (isRyanMode ? 'In Instantly' : 'In Cadence')
                : (isRyanMode ? 'Add to Instantly' : 'Add to Cadence')}
            </button>
            {contact.phone && (
              <button
                onClick={() => setShowCallModal(true)}
                className="flex items-center justify-center gap-1.5 px-4 py-[8px] rounded-lg text-[11px] font-semibold transition-all bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
              >
                <Phone size={12} />
                Call
              </button>
            )}
          </div>

          {/* Row 5: Subtitle text */}
          <div className="text-[9px] text-stone-400 mb-2">
            {isPushed
              ? 'Activity syncs to Salesforce automatically'
              : (isRyanMode ? 'Sends via Aimfox' : 'Syncs to Salesforce via Salesloft')}
          </div>

          {/* Row 6: Score badge + TrendArrow + signal count */}
          <div className="flex gap-0.5 mb-3">
            <div className="flex items-center gap-1.5">
              <ScoreBadge score={contact.contactScore} />
              <TrendArrow signals={contact.signals} />
              <span className="text-[10px] text-stone-400">
                {contact.signals.length} signal{contact.signals.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="flex items-center gap-1 p-1 bg-stone-50 rounded-lg">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all
                  ${tab === t.key
                    ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-200/60'
                    : 'text-stone-500 hover:text-stone-700'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === 'why_now' && <WhyNowTab contact={contact} />}
          {tab === 'outreach' && (
            <OutreachTab
              draftMessage={draftMessage}
              setDraftMessage={setDraftMessage}
              isGenerating={isGenerating}
              copied={copied}
              onGenerate={handleGenerateLinkedIn}
              onCopy={handleCopy}
            />
          )}
        </div>
      </motion.div>

      {/* Call Modal */}
      <CallModal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
        contact={{
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          title: contact.title,
          companyName: contact.companyName,
          companyDomain: contact.companyDomain,
        }}
      />
    </>
  );
}

// ────────────────────────────────────────────
// Tab: Why Now
// ────────────────────────────────────────────

function WhyNowTab({ contact }: { contact: ContactView }) {
  const insights = getContactInsights(contact);

  return (
    <div className="space-y-5">
      {/* Why this matters */}
      {contact.signals.length > 0 && (
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">
            Why This Matters
          </h3>
          <div className="space-y-1.5">
            {insights.slice(0, 4).map((insight, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] text-stone-600">
                <span className="text-stone-400 mt-0.5 shrink-0">•</span>
                <span className="leading-snug">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent web activity */}
      {contact.lastPageVisited && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-50 border border-stone-100">
          <FreshnessDot dateStr={contact.lastSignalAt} />
          <Globe size={11} className="text-stone-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium text-stone-700 truncate">{contact.lastPageVisited}</div>
            <div className="text-[10px] text-stone-400">{timeAgo(contact.lastSignalAt)}</div>
          </div>
        </div>
      )}

      {/* Activity Timeline (last 6 signals) */}
      {contact.signals.length > 0 && (
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">
            Activity Timeline
          </h3>
          <div className="space-y-0.5 ml-2 border-l border-stone-100 pl-3">
            {contact.signals.slice(0, 6).map((s, i) => (
              <div key={s.name + s.detectedAt + i} className="flex items-center gap-2 py-1 relative">
                <div className="absolute -left-[13.5px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-stone-300" />
                <span className="text-[11px] shrink-0">{getSignalIcon(s.source, s.name)}</span>
                <span className="text-[11px] font-medium text-stone-700 truncate flex-1">{s.name}</span>
                <span className="text-[9px] text-stone-400 shrink-0">{timeAgo(s.detectedAt)}</span>
              </div>
            ))}
            {contact.signals.length > 6 && (
              <div className="text-[10px] text-stone-400 pl-1 pt-1">
                +{contact.signals.length - 6} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact details */}
      <div>
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Contact</h3>
        <div className="space-y-1.5 text-[11px] text-stone-600">
          <div className="flex items-center gap-2">
            <Mail size={11} className="text-stone-400 shrink-0" />
            <a href={`mailto:${contact.email}`} className="hover:text-stone-900 truncate">{contact.email}</a>
          </div>
          {contact.phone && (
            <div className="flex items-center gap-2">
              <Phone size={11} className="text-emerald-500 shrink-0" />
              <a href={`tel:${contact.phone}`} className="hover:text-emerald-700 font-medium text-emerald-600">{contact.phone}</a>
              <button
                onClick={() => setShowCallModal(true)}
                className="text-[9px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-bold hover:bg-emerald-100 transition"
              >
                Call
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <LinkedinIcon size={11} className="text-stone-400 shrink-0" />
            <a href={contact.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-stone-900">
              LinkedIn Profile
            </a>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={11} className="text-stone-400 shrink-0" />
            {contact.companyLocation}
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// Tab: Outreach
// ────────────────────────────────────────────

interface OutreachTabProps {
  draftMessage: string;
  setDraftMessage: (msg: string) => void;
  isGenerating: boolean;
  copied: boolean;
  onGenerate: () => void;
  onCopy: () => void;
}

function OutreachTab({ draftMessage, setDraftMessage, isGenerating, copied, onGenerate, onCopy }: OutreachTabProps) {
  return (
    <div className="space-y-5">
      {/* AI LinkedIn Message Drafter */}
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 flex items-center gap-1.5">
            <Sparkles size={12} className="text-violet-500" />
            AI LinkedIn Message
          </h4>
          {draftMessage && (
            <button
              onClick={onCopy}
              className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>

        {!draftMessage ? (
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 p-3 rounded border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-xs transition-colors group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Analyzing signals & drafting...
              </>
            ) : (
              <>
                <Sparkles size={14} className="group-hover:scale-110 transition-transform" />
                Generate LinkedIn Connection Request
              </>
            )}
          </button>
        ) : (
          <div className="space-y-2">
            <textarea
              value={draftMessage}
              onChange={(e) => setDraftMessage(e.target.value)}
              className="w-full h-24 p-3 text-[11px] leading-relaxed text-slate-700 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none font-medium"
            />
            <div
              className="text-[9px] text-right"
              style={{ color: draftMessage.length > 300 ? '#ef4444' : '#94a3b8' }}
            >
              {draftMessage.length}/300
            </div>
            <div className="flex gap-2">
              <button
                onClick={onGenerate}
                disabled={isGenerating}
                className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-[10px] transition-colors"
              >
                <Sparkles size={12} /> Regenerate
              </button>
              <button
                onClick={onCopy}
                className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[10px] transition-colors"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />} Copy & Paste
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { CallModal };
export default ContactDrawer;
