// ============================================================
// RepWorkspace — Unified BAP Operating System
// v8: One flow. The call sheet IS the BAP.
//
// Flow:  Deal Context → Opening Line → Kill Flags
//     →  D1 Questions (persona-specific) → CP1 Gate
//     →  D2 Questions → CP2 Gate
//     →  D3 Questions → CP3 Gate
//
// Checkpoint scoring auto-computes from call sheet answers.
// Personas determine which questions + coaching are shown.
// Room Settings + Deal Intelligence live in the right sidebar.
// The prospect's room is at the share link — not shown here.
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  type SectionKey,
} from './ControlDrawer';
import { type RoomVisibility } from './RoomSections';

import {
  type DiscoverySession,
} from '../../lib/discoveryDatabase';
import { GranolaSettingsDrawer } from './GranolaSettingsDrawer';
import { GranolaSyncModal } from './GranolaSyncModal';
import { PostCallDebriefModal } from './PostCallDebriefModal';
import { FollowUpEmailDraft } from './FollowUpEmailDraft';
import { RoomBuilder } from './RoomBuilder';
import { EngagementDashboard } from './EngagementDashboard';
import { DealPostMortemModal } from '../sales/DealPostMortemModal';

import { getTopSocialProof, getIndustryCustomerCount } from '../../lib/customerProof';

import { BAPCanvas } from './BAPCanvas';
import { PainModal } from './PainModal';
import { MEDDPICCTab } from './MEDDPICCTab';

// ── Props ──

interface RepWorkspaceProps {
  session: DiscoverySession;
  visibility: RoomVisibility;
  onVisibilityChange: (vis: RoomVisibility) => void;
  onSessionChange: (session: DiscoverySession) => void;
  selectedPains: string[];
  onPainChange: (pains: string[]) => void;
  selectedPersona: string | null;
  onPersonaChange: (persona: string) => void;
  selectedATS: string | null;
  onATSChange: (ats: string) => void;
  onIndustryChange: (industry: string) => void;
  onCompanySizeChange: (size: string) => void;
  onUseCaseChange: (useCase: string) => void;
  companyName: string;
  themeColor: string;
  broadcastState: (s: DiscoverySession) => void;
  flashSave: () => void;
  activeTab: 'bap' | 'meddpicc' | 'settings' | 'analytics';
  onTabChange: (tab: 'bap' | 'meddpicc' | 'settings' | 'analytics') => void;
}

// ════════════════════════════════════════════════════════════════
// Main Component
// ════════════════════════════════════════════════════════════════

export function RepWorkspace({
  session, visibility, onVisibilityChange, onSessionChange,
  selectedPains, onPainChange, selectedPersona, onPersonaChange,
  selectedATS, onATSChange, onIndustryChange, onCompanySizeChange,
  onUseCaseChange, companyName, themeColor, broadcastState, flashSave,
  activeTab, onTabChange,
}: RepWorkspaceProps) {
  const [showPainModal, setShowPainModal] = useState(false);
  const [showGranolaSettings, setShowGranolaSettings] = useState(false);
  const [showGranolaSync, setShowGranolaSync] = useState(false);
  const [showLossReason, setShowLossReason] = useState(false);
  const [showDebrief, setShowDebrief] = useState(false);
  const [debriefFieldCount, setDebriefFieldCount] = useState(0);
  const [showFollowUpEmail, setShowFollowUpEmail] = useState(false);

  // Async social proof state
  const [proofCandidates, setProofCandidates] = useState<Awaited<ReturnType<typeof getTopSocialProof>>>([]);
  const [industryCount, setIndustryCount] = useState(0);

  // Load social proof data when session changes
  useEffect(() => {
    let cancelled = false;
    getTopSocialProof(session, 20).then(candidates => { if (!cancelled) setProofCandidates(candidates); });
    if (session.industry) {
      getIndustryCustomerCount(session.industry).then(count => { if (!cancelled) setIndustryCount(count); });
    } else {
      setIndustryCount(0);
    }
    return () => { cancelled = true; };
  }, [session.industry, session.current_ats, session.company_size, session.pricing_region]);

  const toggleVisibility = useCallback((key: SectionKey) => {
    onVisibilityChange({ ...visibility, [key]: !visibility[key] });
  }, [visibility, onVisibilityChange]);

  const togglePain = useCallback((id: string) => {
    onPainChange(selectedPains.includes(id) ? selectedPains.filter(p => p !== id) : [...selectedPains, id]);
  }, [selectedPains, onPainChange]);

  const handleStageChange = useCallback((stage: string) => {
    onSessionChange({ ...session, deal_stage: stage });
    if (stage === 'closed_lost') {
      if (!session.post_mortem_completed) {
        setShowLossReason(true); // Re-using this state for the PostMortemModal
      }
    }
  }, [session, onSessionChange]);

  const handleSessionChange = useCallback((s: DiscoverySession) => {
    onSessionChange(s); broadcastState(s); flashSave();
  }, [onSessionChange, broadcastState, flashSave]);


  return (
    <>
      <div className="flex flex-1 min-h-0">
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === 'bap' && (
            <motion.div key="bap" className="flex-1 min-h-0 flex"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}>
              <BAPCanvas
                session={session}
                onSessionChange={handleSessionChange}
                selectedPains={selectedPains}
                selectedPersona={selectedPersona}
                selectedATS={selectedATS}
                onPersonaChange={onPersonaChange}
                onATSChange={onATSChange}
                onIndustryChange={onIndustryChange}
                onCompanySizeChange={onCompanySizeChange}
                onOpenPainModal={() => setShowPainModal(true)}
                onOpenGranolaSync={() => setShowGranolaSync(true)}
                companyName={companyName}
                onPainToggle={togglePain}
              />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div key="settings" className="flex-1 min-h-0 flex"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}>
              <RoomBuilder
                session={session}
                onSessionChange={handleSessionChange}
                visibility={visibility}
                onToggleVisibility={toggleVisibility}
                selectedPains={selectedPains}
                onOpenPainModal={() => setShowPainModal(true)}
                companyName={companyName}
                themeColor={themeColor}
              />
            </motion.div>
          )}
          {activeTab === 'analytics' && (
            <motion.div key="analytics" className="flex-1 min-h-0 flex"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}>
              <EngagementDashboard sessionId={session.id} companyName={companyName} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PainModal open={showPainModal} onClose={() => setShowPainModal(false)} selectedPains={selectedPains} onToggle={togglePain} />
      <GranolaSettingsDrawer isOpen={showGranolaSettings} onClose={() => setShowGranolaSettings(false)} />
      <GranolaSyncModal
        isOpen={showGranolaSync}
        onClose={() => setShowGranolaSync(false)}
        sessionId={session.id}
        session={session}
        onFieldsMerged={(fieldCount?: number) => {
          onSessionChange({ ...session });
          // Trigger post-call debrief
          setDebriefFieldCount(fieldCount || 0);
          setShowDebrief(true);
        }}
      />
      <PostCallDebriefModal
        isOpen={showDebrief}
        onClose={() => setShowDebrief(false)}
        companyName={companyName}
        fieldsExtracted={debriefFieldCount}
        currentNextAction={session.next_action}
        currentNextMeeting={session.next_meeting_date}
        currentGutFeel={session.gut_feel}
        onSave={(data) => {
          handleSessionChange({
            ...session,
            gut_feel: data.gut_feel,
            gut_feel_note: data.gut_feel_note,
            next_action: data.next_action,
            next_meeting_date: data.next_meeting_date,
            last_call_date: new Date().toISOString().split('T')[0],
          });
          setShowDebrief(false);
          // Offer follow-up email draft after debrief
          setShowFollowUpEmail(true);
        }}
      />
      <FollowUpEmailDraft
        isOpen={showFollowUpEmail}
        onClose={() => setShowFollowUpEmail(false)}
        session={session}
      />
      <DealPostMortemModal
        isOpen={showLossReason}
        onClose={() => setShowLossReason(false)}
        session={session}
        onSave={(symptoms, analysis) => {
          handleSessionChange({
            ...session,
            post_mortem_completed: true,
            post_mortem_symptoms: symptoms,
            post_mortem_fatality: analysis.type,
            post_mortem_pathway: analysis.description,
          });
          setShowLossReason(false);
        }}
      />
    </>
  );
}
