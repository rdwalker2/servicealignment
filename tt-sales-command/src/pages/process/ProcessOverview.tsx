// ============================================================
// ProcessOverview.tsx — Playbook Shell with sidebar navigation
// Renders PlaybookSidebar + dynamic content panel
// ============================================================

import { useState, useCallback, lazy, Suspense } from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';
import { PlaybookSidebar } from './PlaybookSidebar';

// Lazy load topic components
const CoreParadigm = lazy(() => import('./topics/CoreParadigm'));
const BuyerIntent = lazy(() => import('./topics/BuyerIntent'));
const PushVsPull = lazy(() => import('./topics/PushVsPull'));
const DateVsDoctor = lazy(() => import('./topics/DateVsDoctor'));
const FiveFatalities = lazy(() => import('./topics/FiveFatalities'));
const ThreeCheckpoints = lazy(() => import('./topics/ThreeCheckpoints'));
const BapFramework = lazy(() => import('./topics/BapFramework'));

const ProspectingOverview = lazy(() => import('./topics/ProspectingOverview'));
const ThreeWavesWave1 = lazy(() => import('./topics/ThreeWavesWave1'));
const ThreeWavesWave2 = lazy(() => import('./topics/ThreeWavesWave2'));
const ThreeWavesWave3 = lazy(() => import('./topics/ThreeWavesWave3'));
const ProvenScripts = lazy(() => import('./topics/ProvenScripts'));
const CallDecisionTrees = lazy(() => import('./topics/CallDecisionTrees'));
const HiringStackAudit = lazy(() => import('./topics/HiringStackAudit'));

const D1Overview = lazy(() => import('./topics/D1Overview'));
const UrgencyLeadership = lazy(() => import('./topics/UrgencyLeadership'));
const UrgencyObjective = lazy(() => import('./topics/UrgencyObjective'));
const UrgencyDecisionMakers = lazy(() => import('./topics/UrgencyDecisionMakers'));
const UrgencyCurrentReality = lazy(() => import('./topics/UrgencyCurrentReality'));
const UrgencyBusinessPain = lazy(() => import('./topics/UrgencyBusinessPain'));

const D2Overview = lazy(() => import('./topics/D2Overview'));
const GapOtherVendors = lazy(() => import('./topics/GapOtherVendors'));
const GapProblemDiagnosis = lazy(() => import('./topics/GapProblemDiagnosis'));
const GapBuyingProcess = lazy(() => import('./topics/GapBuyingProcess'));
const GapBudgetTimeline = lazy(() => import('./topics/GapBudgetTimeline'));

const D3Overview = lazy(() => import('./topics/D3Overview'));
const SolutionProvenResults = lazy(() => import('./topics/SolutionProvenResults'));
const SolutionClearSolution = lazy(() => import('./topics/SolutionClearSolution'));
const SolutionTimelinePrice = lazy(() => import('./topics/SolutionTimelinePrice'));

const D4Overview = lazy(() => import('./topics/D4Overview'));
const ConfirmationClose = lazy(() => import('./topics/ConfirmationClose'));
const DOAProposals = lazy(() => import('./topics/DOAProposals'));
const MasterScript = lazy(() => import('./topics/MasterScript'));

const TOPIC_MAP: Record<string, React.LazyExoticComponent<() => JSX.Element>> = {
  'overview': CoreParadigm,
  'buyer-intent': BuyerIntent,
  'push-vs-pull': PushVsPull,
  'date-vs-doctor': DateVsDoctor,
  'five-fatalities': FiveFatalities,
  'three-checkpoints': ThreeCheckpoints,
  'bap-framework': BapFramework,
  'prospecting-overview': ProspectingOverview,
  'wave1-existing': ThreeWavesWave1,
  'wave2-future': ThreeWavesWave2,
  'wave3-unknown': ThreeWavesWave3,
  'proven-scripts': ProvenScripts,
  'call-trees': CallDecisionTrees,
  'hiring-stack-audit': HiringStackAudit,
  'd1-overview': D1Overview,
  'urgency-leadership': UrgencyLeadership,
  'urgency-objective': UrgencyObjective,
  'urgency-decision-makers': UrgencyDecisionMakers,
  'urgency-current-reality': UrgencyCurrentReality,
  'urgency-business-pain': UrgencyBusinessPain,
  'd2-overview': D2Overview,
  'gap-other-vendors': GapOtherVendors,
  'gap-problem-diagnosis': GapProblemDiagnosis,
  'gap-buying-process': GapBuyingProcess,
  'gap-budget-timeline': GapBudgetTimeline,
  'd3-overview': D3Overview,
  'solution-proven-results': SolutionProvenResults,
  'solution-clear-solution': SolutionClearSolution,
  'solution-timeline-price': SolutionTimelinePrice,
  'd4-overview': D4Overview,
  'confirmation-close': ConfirmationClose,
  'doa-proposals': DOAProposals,
  'master-script': MasterScript,
};

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full" />
    </div>
  );
}

export default function ProcessOverview() {
  const [activeTopic, setActiveTopic] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleTopicChange = useCallback((topicId: string) => {
    setActiveTopic(topicId);
  }, []);

  const TopicComponent = TOPIC_MAP[activeTopic] || CoreParadigm;

  return (
    <div className="h-full flex bg-stone-50/50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <PlaybookSidebar
        activeTopic={activeTopic}
        onTopicChange={handleTopicChange}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-auto relative">
        {/* Show sidebar toggle when collapsed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute left-0 top-6 z-20 flex items-center gap-1.5 px-2 py-3 rounded-r-lg bg-white border border-l-0 border-stone-200 shadow-sm text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition-all"
          >
            <BookOpen size={12} />
            <ChevronRight size={12} />
          </button>
        )}

        {/* Topic content */}
        <Suspense fallback={<LoadingSpinner />}>
          <TopicComponent />
        </Suspense>
      </div>
    </div>
  );
}
