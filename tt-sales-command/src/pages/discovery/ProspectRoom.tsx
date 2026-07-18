// ============================================================
// ProspectRoom — Public, shareable Discovery Room for prospects
// URL: /room/:token
// No authentication required. Clean, branded, interactive experience.
// Renders the shared RoomSections component with prospect-specific chrome.
// ============================================================

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { decodeRoomToken, type RoomConfig } from '../../lib/shareableRoom';
import type { DiscoverySession, MAPMilestone } from '../../lib/discoveryDatabase';
import { getSession, computeDiagnosisOverrides, computeHeroMessage, computePainQuotes, computeParadigmQuotes } from '../../lib/discoveryDatabase';
import { getTopSocialProof } from '../../lib/customerProof';
import { RoomSections, DEFAULT_VISIBILITY, type RoomVisibility } from '../../components/discovery/RoomSections';
import { BusinessCaseDocument } from '../../components/discovery/BusinessCaseDocument';
import { EngagementTracker } from '../../lib/EngagementTracker';

// ── Invalid Token page ──
function InvalidRoom() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-4 max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-xl"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
          <Lock className="h-7 w-7 text-zinc-400" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-zinc-900">Room Not Found</h1>
        <p className="mb-6 text-sm leading-relaxed text-zinc-500">
          This Discovery Room link may have expired or been updated. Please ask your Teamtailor contact for a new link.
        </p>
        <div
          className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition-all opacity-80"
        >
          Contact your Teamtailor representative
        </div>
      </motion.div>
    </div>
  );
}

// ── Loading skeleton shown while token is being decoded ──
function LoadingRoom() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, #f4f4f5 25%, #e4e4e7 37%, #f4f4f5 63%);
          background-size: 800px 100%;
          animation: shimmer 1.6s ease-in-out infinite;
        }
      `}</style>
      <div className="mx-4 w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <img src="/lg.svg" alt="Teamtailor" className="h-8 w-auto object-contain opacity-60" />
        </div>
        <p className="mb-8 text-sm font-medium text-zinc-400">Loading your Discovery Room…</p>
        <div className="space-y-4">
          <div className="shimmer mx-auto h-4 w-3/4 rounded" />
          <div className="shimmer mx-auto h-4 w-1/2 rounded" />
          <div className="shimmer mx-auto h-4 w-2/3 rounded" />
          <div className="shimmer mx-auto mt-6 h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ── Error Boundary — prevents a single section from crashing the room ──
class RoomErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError)
      return (
        <div className="p-8 text-center">
          <p className="text-zinc-400">Something went wrong loading this section.</p>
        </div>
      );
    return this.props.children;
  }
}

// ── Main Prospect Room ──
export default function ProspectRoom() {
  const { token } = useParams<{ token: string }>();
  
  const [config, setConfig] = useState<RoomConfig | null>(null);
  const [loadingState, setLoadingState] = useState<'loading' | 'ready' | 'error'>('loading');
  // Removed redundant state for selectedPains, selectedPersona, selectedATS
  const [proofCustomerIds, setProofCustomerIds] = useState<string[] | undefined>(undefined);

  const [localSession, setLocalSession] = useState<DiscoverySession>({
    id: 'public-room',
    stakeholders: [],
    mutual_action_plan: undefined,
  } as unknown as DiscoverySession);

  const engagementRef = useRef<EngagementTracker | null>(null);

  // Build visibility from session data (rep controls what prospect sees)
  const [visibility, setVisibility] = useState<RoomVisibility>(DEFAULT_VISIBILITY);

  const handleMAPChange = (map: MAPMilestone[]) => {
    setLocalSession(prev => ({ ...prev, mutual_action_plan: map }));
  };

  const handleContractReadinessChange = (data: Record<string, string>) => {
    setLocalSession(prev => ({ ...prev, contract_readiness: data }));
  };

  // Decode token on mount
  useEffect(() => {
    if (token) {
      const decoded = decodeRoomToken(token);
      if (decoded) {
        setConfig(decoded);
        setLoadingState('ready');
        
        // If we have a sessionId, try to load live data (for deep sync)
        if (decoded.sessionId) {
          const liveSession = getSession(decoded.sessionId);
          if (liveSession) {
            setLocalSession(liveSession);
            // Load visibility overrides from session if stored
            if ((liveSession as any).room_visibility) {
              setVisibility((liveSession as any).room_visibility);
            }
          }
        }
      } else {
        setLoadingState('error');
      }
    } else {
      setLoadingState('error');
    }
  }, [token]);

  // Start engagement tracking once config is known
  useEffect(() => {
    if (config && token) {
      const tracker = new EngagementTracker(token, config.company, config.sessionId);
      engagementRef.current = tracker;

      const SECTIONS = [
        { id: 'hero', label: 'Hero / Goals' },
        { id: 'pain-discovery', label: 'Challenges' },
        { id: 'diagnosis', label: 'Root Cause' },
        { id: 'ats-kill', label: 'Competitive Analysis' },
        { id: 'paradigm-shift', label: 'Paradigm Shift' },
        { id: 'walkthrough', label: 'Solution Demo' },
        { id: 'playbooks', label: 'Playbooks' },
        { id: 'social-proof', label: 'Results & Proof' },
        { id: 'problem-canvas', label: 'Executive Brief' },
        { id: 'roi', label: 'ROI Calculator' },
        { id: 'contract-security', label: 'Contract & Security' },
        { id: 'map', label: 'Mutual Action Plan' },
        { id: 'minimum-standards', label: 'Minimum Standards' },
        { id: 'proposal', label: 'Next Steps' },
      ];

      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const sec = SECTIONS.find(s => s.id === entry.target.id);
          if (!sec) continue;
          if (entry.isIntersecting) tracker.onSectionVisible(sec.id, sec.label);
          else tracker.onSectionHidden(sec.id);
        }
      }, { threshold: 0.2 });

      SECTIONS.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });

      return () => { observer.disconnect(); tracker.destroy(); };
    }
  }, [config, token]);

  // Removed redundant useEffect that copied config state to local state

  // Load social proof asynchronously
  useEffect(() => {
    if (localSession && !localSession.enabled_proof_customers) {
      getTopSocialProof(localSession, 6).then(candidates => {
        setProofCustomerIds(candidates.map(c => c.customer.id));
      });
    }
  }, [localSession?.industry, localSession?.current_ats]);

  if (loadingState === 'loading') return <LoadingRoom />;
  if (loadingState === 'error' || !config) return <InvalidRoom />;

  const brand = config.accent || '#1c1917';
  const companyName = config.company;

  // Extract call sheet answers for passing to RoomSections
  const answers = localSession?.call_sheet_answers || {};

  const diagnosisComputed = localSession ? computeDiagnosisOverrides(localSession) : null;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Branded Header — Prospect-facing, clean */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{ background: `linear-gradient(135deg, ${brand}ee, ${brand}cc)`, borderColor: `${brand}30` }}
      >
        {/* NOTE: Ensure <meta name="viewport" content="width=device-width, initial-scale=1" /> is in the HTML <head> */}
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <img src="/lg.svg" alt="Teamtailor" className="h-5 w-auto object-contain brightness-0 invert" />
            <span className="font-light text-white/40">×</span>
            <span className="font-semibold text-white">{companyName}</span>
          </div>
          <div className="flex items-center gap-3">
            {config.repName && (
              <span className="hidden text-xs text-white/60 sm:block">
                Prepared by <strong className="text-white/90">{config.repName}</strong>
              </span>
            )}
            <div className="hidden rounded border border-white/20 bg-white/10 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-white/90 xs:block sm:block">
              Discovery Room
            </div>
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          </div>
        </div>
      </motion.header>

      {/* ── Main Content Area ── */}
      <RoomErrorBoundary>
          <BusinessCaseDocument
            companyName={companyName}
            themeColor={brand}
            selectedPains={config.pains || []}
            session={localSession}
            visibility={visibility}
            isRepPreview={false}
            currentApproach={diagnosisComputed?.currentApproach || answers['q5'] as string}
            rootCause={diagnosisComputed?.rootCause || answers['q6'] as string}
            biggerProblemOverride={diagnosisComputed?.biggerProblem}
            problemStatement={answers['q1'] as string}
            businessImpact={answers['q4a'] as string}
            urgencyReason={answers['q4b'] as string}
            customMessage={config.customMessage || (localSession ? computeHeroMessage(localSession) : undefined)}
            repName={config.repName}
            showPricing={config.showPricing !== false}
            enabledProofCustomers={localSession?.enabled_proof_customers || proofCustomerIds}
            enabledPlaybookIds={(config as any)?.enabledPlaybookIds ?? localSession?.enabled_playbook_ids}
            onMAPChange={handleMAPChange}
            onContractReadinessChange={handleContractReadinessChange}
          />
      </RoomErrorBoundary>

      {/* Confidentiality Footer */}
      <footer className="border-t border-zinc-100 py-8" style={{ background: `linear-gradient(180deg, white, ${brand}05)` }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <Lock size={12} className="text-zinc-400" />
            <span className="text-xs font-medium text-zinc-400 break-words">Confidential — Prepared exclusively for {companyName}</span>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-zinc-400">
            <span>Powered by <strong className="text-zinc-600">Teamtailor</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
