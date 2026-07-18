// ============================================================
// PublicBusinessCase — Public, no-auth business case page
// URLs: /:slug/business-case  OR  /cms-preview/:slug/business-case
// Looks up session by company name slug, renders BusinessCaseDocument
// ============================================================

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, FileText } from 'lucide-react';
import type { DiscoverySession, MAPMilestone } from '../../lib/discoveryDatabase';
import { getAllDiscoverySessions, computeDiagnosisOverrides, computeHeroMessage } from '../../lib/discoveryDatabase';
import { getTopSocialProof } from '../../lib/customerProof';
import { DEFAULT_VISIBILITY, type RoomVisibility } from '../../components/discovery/RoomSections';
import { BusinessCaseDocument } from '../../components/discovery/BusinessCaseDocument';

/** Slugify a company name the same way CMSWorkspace does */
function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ── Not Found ──
function NotFound({ slug }: { slug?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-4 max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-xl"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
          <FileText className="h-7 w-7 text-zinc-400" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-zinc-900">Business Case Not Found</h1>
        <p className="mb-6 text-sm leading-relaxed text-zinc-500">
          We couldn't find a business case for "{slug}". Please contact your Teamtailor representative for an updated link.
        </p>
      </motion.div>
    </div>
  );
}

// ── Loading ──
function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="mx-4 w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <img src="/lg.svg" alt="Teamtailor" className="h-8 w-auto object-contain opacity-60" />
        </div>
        <p className="mb-8 text-sm font-medium text-zinc-400">Loading your business case…</p>
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}

// ── Error Boundary ──
class DocErrorBoundary extends React.Component<
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
          <p className="text-zinc-400">Something went wrong loading this document.</p>
        </div>
      );
    return this.props.children;
  }
}

// ── Main Component ──
export default function PublicBusinessCase() {
  const { slug } = useParams<{ slug: string }>();

  const [session, setSession] = useState<DiscoverySession | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'notfound'>('loading');
  const [proofCustomerIds, setProofCustomerIds] = useState<string[] | undefined>(undefined);

  // Local MAP state (prospect can check milestones)
  const handleMAPChange = (map: MAPMilestone[]) => {
    if (session) setSession(prev => prev ? { ...prev, mutual_action_plan: map } : prev);
  };

  const handleContractReadinessChange = (data: Record<string, string>) => {
    if (session) setSession(prev => prev ? { ...prev, contract_readiness: data } : prev);
  };

  // On mount: find session by slug
  useEffect(() => {
    if (!slug) {
      setLoadState('notfound');
      return;
    }

    const allSessions = getAllDiscoverySessions();
    const matched = allSessions.find(s => slugify(s.company_name) === slug);

    if (matched) {
      setSession(matched);
      setLoadState('ready');
    } else {
      setLoadState('notfound');
    }
  }, [slug]);

  // Load social proof
  useEffect(() => {
    if (session && !session.enabled_proof_customers) {
      getTopSocialProof(session, 6).then(candidates => {
        setProofCustomerIds(candidates.map(c => c.customer.id));
      });
    }
  }, [session?.industry, session?.current_ats]);

  if (loadState === 'loading') return <Loading />;
  if (loadState === 'notfound' || !session) return <NotFound slug={slug} />;

  // Build theme & data
  const companyName = session.company_name;
  const themeColor = (session as any).cms_accent || '#1c1917';
  const selectedPains = session.selected_pains || [];
  const visibility: RoomVisibility = {
    ...DEFAULT_VISIBILITY,
    ...((session as any).room_visibility || {}),
  };
  const answers = session.call_sheet_answers || {};
  const diagnosisComputed = computeDiagnosisOverrides(session);
  const repName = (session as any).cms_prepared_by || 'Teamtailor';

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Branded Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{ background: `linear-gradient(135deg, ${themeColor}ee, ${themeColor}cc)`, borderColor: `${themeColor}30` }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <img src="/lg.svg" alt="Teamtailor" className="h-5 w-auto object-contain brightness-0 invert" />
            <span className="font-light text-white/40">×</span>
            <span className="font-semibold text-white">{companyName}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-white/60 sm:block">
              Prepared by <strong className="text-white/90">{repName}</strong>
            </span>
            <div className="hidden rounded border border-white/20 bg-white/10 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-white/90 xs:block sm:block">
              Business Case
            </div>
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          </div>
        </div>
      </motion.header>

      {/* Document */}
      <DocErrorBoundary>
        <BusinessCaseDocument
          companyName={companyName}
          themeColor={themeColor}
          selectedPains={selectedPains}
          session={session}
          visibility={visibility}
          isRepPreview={false}
          currentApproach={diagnosisComputed?.currentApproach || answers['q5'] as string}
          rootCause={diagnosisComputed?.rootCause || answers['q6'] as string}
          biggerProblemOverride={diagnosisComputed?.biggerProblem}
          problemStatement={answers['q1'] as string}
          businessImpact={answers['q4a'] as string}
          urgencyReason={answers['q4b'] as string}
          customMessage={computeHeroMessage(session)}
          repName={repName}
          showPricing={true}
          enabledProofCustomers={session.enabled_proof_customers || proofCustomerIds}
          enabledPlaybookIds={session.enabled_playbook_ids}
          onMAPChange={handleMAPChange}
          onContractReadinessChange={handleContractReadinessChange}
        />
      </DocErrorBoundary>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-8" style={{ background: `linear-gradient(180deg, white, ${themeColor}05)` }}>
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
