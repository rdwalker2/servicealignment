// ============================================================
// ProspectRoom — Public, shareable Discovery Room for prospects
// URL: /prospector/:token
// No authentication required. Clean, branded, interactive experience.
// Renders the shared RoomSections component with prospect-specific chrome.
// ============================================================

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Sparkles, Zap } from 'lucide-react';
import { decodeRoomToken, type RoomConfig } from '../../lib/shareableRoom';
import type { DiscoverySession, MAPMilestone } from '../../lib/discoveryDatabase';
import { getSession, computeDiagnosisOverrides, computeHeroMessage, computePainQuotes, computeParadigmQuotes } from '../../lib/discoveryDatabase';
import { getTopSocialProof } from '../../lib/customerProof';
import { RoomSections, DEFAULT_VISIBILITY, type RoomVisibility } from '../../components/discovery/RoomSections';
import { BusinessCaseDocument } from '../../components/discovery/BusinessCaseDocument';
import { EngagementTracker } from '../../lib/EngagementTracker';
import { LiveWeatherAlert } from '../../components/discovery/LiveWeatherAlert';
import { SchedulingModal } from '../../components/discovery/SchedulingModal';

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
          This Discovery Room link may have expired or been updated. Please ask your Service Alignment contact for a new link.
        </p>
        <div
          className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition-all opacity-80"
        >
          Contact your Service Alignment representative
        </div>
      </motion.div>
    </div>
  );
}

// ── Loading skeleton shown while token is being decoded ──
function LoadingRoom() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-950 px-4" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, #27272a 25%, #3f3f46 37%, #27272a 63%);
          background-size: 800px 100%;
          animation: shimmer 1.6s ease-in-out infinite;
        }
      `}</style>
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="text-3xl font-black tracking-tighter text-white uppercase">Paramount</div>
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
  const [predictiveData, setPredictiveData] = useState<any>(null);
  const [proofCustomerIds, setProofCustomerIds] = useState<string[] | undefined>(undefined);
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);

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

  useEffect(() => {
    if (token) {
      const decoded = decodeRoomToken(token);
      if (decoded) {
        setConfig(decoded);
        setLoadingState('ready');
        
        if (decoded.sessionId) {
          const liveSession = getSession(decoded.sessionId);
          if (liveSession) {
            setLocalSession(liveSession);
            if ((liveSession as any).room_visibility) {
              setVisibility((liveSession as any).room_visibility);
            }
          }
        }

        import('../../lib/predictiveEngineDb').then(({ getPredictiveDataByCompany }) => {
          getPredictiveDataByCompany(decoded.company).then(data => {
            if (data) setPredictiveData(data);
          });
        });
      } else {
        import('../../lib/predictiveEngineDb').then(({ getPredictiveDataByToken }) => {
          getPredictiveDataByToken(token).then(data => {
            if (data && data.properties.length > 0) {
              const companyName = data.properties[0].property?.property_name?.split('-')[0]?.trim() || 'Your Company';
              const fauxConfig = {
                company: companyName,
                accent: '#ef4444'
              };
              setConfig(fauxConfig);
              setPredictiveData(data);
              setLoadingState('ready');

              const score = data.properties[0].healthScore?.health_score ?? 68;
              const signals = data.properties[0].signals || [];
              setLocalSession(prev => ({
                ...prev,
                roof_health_score: score,
                roof_signals: signals,
                roi_total: 250000
              } as any));
            } else {
              setLoadingState('error');
            }
          }).catch(() => {
            setLoadingState('error');
          });
        });
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
        className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-20 md:h-24 max-w-[1200px] items-center justify-between px-6 md:px-10">
          <div className="flex items-center gap-6">
            <div className="text-xl md:text-2xl font-black tracking-tighter text-zinc-900 uppercase">
              Paramount
            </div>
            <span className="font-light text-zinc-300 px-2">×</span>
            {companyName.includes('C&W') || companyName.includes('Cushman') ? (
              <img src="/cushman-logo.svg" alt="Cushman & Wakefield" className="h-8 md:h-10 w-auto object-contain grayscale opacity-90" />
            ) : (
              <span className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">{companyName}</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 xs:flex items-center gap-2">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live Monitor
            </div>
            <button 
              onClick={() => setIsHeaderModalOpen(true)}
              className="hidden text-[11px] font-bold tracking-[0.1em] uppercase text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 px-5 py-2.5 rounded-full sm:block transition-all border border-zinc-200 bg-white"
            >
              Book a Call
            </button>
            <button 
              onClick={() => setIsHeaderModalOpen(true)}
              className="hidden text-[11px] font-bold tracking-[0.1em] uppercase text-white bg-zinc-900 hover:bg-black px-5 py-2.5 rounded-full sm:block transition-all shadow-md shadow-zinc-900/10"
            >
              Dispatch Drone Audit
            </button>
          </div>
        </div>
      </motion.header>

      <SchedulingModal 
        isOpen={isHeaderModalOpen} 
        onClose={() => setIsHeaderModalOpen(false)} 
        propertyName="Your Entire Portfolio"
      />

      {/* Global Alerts */}
      <LiveWeatherAlert />

      {/* ── Main Content Area ── */}
      <RoomErrorBoundary>
          <BusinessCaseDocument
            companyName={companyName}
            themeColor={brand}
            selectedPains={config.pains || []}
            session={localSession}
            predictiveData={predictiveData}
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
      <footer className="py-8 bg-white border-t border-zinc-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Lock size={12} className="text-zinc-400" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Confidential — Prepared exclusively for {companyName}</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400">
            Powered by <strong className="text-zinc-900">Service Alignment Predictive Engine</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}
