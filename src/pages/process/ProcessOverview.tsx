// ============================================================
// ProcessOverview.tsx — Playbook Shell with sidebar navigation
// Renders PlaybookSidebar + dynamic content panel
// ============================================================

import { useState, useCallback, lazy, Suspense } from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';
import { PlaybookSidebar } from './PlaybookSidebar';

// Lazy load topic components
const CoreParadigm = lazy(() => import('./topics/CoreParadigm'));
const FunnelMath = lazy(() => import('./topics/FunnelMath'));
const BuyerIntent = lazy(() => import('./topics/BuyerIntent'));
const PushVsPull = lazy(() => import('./topics/PushVsPull'));
const DateVsDoctor = lazy(() => import('./topics/DateVsDoctor'));
const FiveFatalities = lazy(() => import('./topics/FiveFatalities'));
const ThreeCheckpoints = lazy(() => import('./topics/ThreeCheckpoints'));
const BapFramework = lazy(() => import('./topics/BapFramework'));
const SalesStages = lazy(() => import('./topics/SalesStages'));

const ProspectingOverview = lazy(() => import('./topics/ProspectingOverview'));
const ProvenScripts = lazy(() => import('./topics/ProvenScripts'));
const CallDecisionTrees = lazy(() => import('./topics/CallDecisionTrees'));
const HiringStackAudit = lazy(() => import('./topics/HiringStackAudit'));
const GoldenMinute = lazy(() => import('./topics/GoldenMinute'));
const SourcingWorkshop = lazy(() => import('./topics/SourcingWorkshop'));

const D1Overview = lazy(() => import('./topics/D1Overview'));
const UrgencyLeadership = lazy(() => import('./topics/UrgencyLeadership'));
const UrgencyObjective = lazy(() => import('./topics/UrgencyObjective'));
const UrgencyDecisionMakers = lazy(() => import('./topics/UrgencyDecisionMakers'));
const UrgencyCurrentReality = lazy(() => import('./topics/UrgencyCurrentReality'));
const UrgencyBusinessPain = lazy(() => import('./topics/UrgencyBusinessPain'));
const InvertedPyramid = lazy(() => import('./topics/InvertedPyramid'));
const Axnot = lazy(() => import('./topics/Axnot'));

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
const Bamfam = lazy(() => import('./topics/Bamfam'));

// New Foundation/Industry/Ops
const Meddpicc = lazy(() => import('./topics/Meddpicc'));
const UniqueSellingPoints = lazy(() => import('./topics/UniqueSellingPoints'));
const RecruitingBasics = lazy(() => import('./topics/RecruitingBasics'));
const CustomerTypes = lazy(() => import('./topics/CustomerTypes'));
const SalesTechstack = lazy(() => import('./topics/SalesTechstack'));
const TimeManagement = lazy(() => import('./topics/TimeManagement'));

// Cadences
const CadenceStrategy = lazy(() => import('./topics/CadenceStrategy'));

// Discovery Sheets
const DiscoverySheetVPHR = lazy(() => import('./topics/DiscoverySheetVPHR'));
const DiscoverySheetTADirector = lazy(() => import('./topics/DiscoverySheetTADirector'));
const DiscoverySheetPeopleOps = lazy(() => import('./topics/DiscoverySheetPeopleOps'));
const DiscoverySheetSMB = lazy(() => import('./topics/DiscoverySheetSMB'));

// New Toolkit Topics
const IcpPains = lazy(() => import('./topics/IcpPains'));
const ValueDrivers = lazy(() => import('./topics/ValueDrivers'));
const Prepco = lazy(() => import('./topics/Prepco'));
const FabFramework = lazy(() => import('./topics/FabFramework'));

export const TOPIC_MAP: Record<string, React.LazyExoticComponent<() => JSX.Element>> = {
  'overview': CoreParadigm,
  'buyer-intent': BuyerIntent,
  'push-vs-pull': PushVsPull,
  'date-vs-doctor': DateVsDoctor,
  'five-fatalities': FiveFatalities,
  'three-checkpoints': ThreeCheckpoints,
  'bap-framework': BapFramework,
  'sales-stages': SalesStages,
  'prospecting-overview': ProspectingOverview,
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
  // Cadences
  'cadence-strategy': CadenceStrategy,
  // Discovery Sheets
  'sheet-vphr': DiscoverySheetVPHR,
  'sheet-ta-director': DiscoverySheetTADirector,
  'sheet-people-ops': DiscoverySheetPeopleOps,
  'sheet-smb': DiscoverySheetSMB,
  'golden-minute': GoldenMinute,
  'sourcing-workshop': SourcingWorkshop,
  'inverted-pyramid': InvertedPyramid,
  'axnot': Axnot,
  'bamfam': Bamfam,
  'meddpicc': Meddpicc,
  'unique-selling-points': UniqueSellingPoints,
  'recruiting-basics': RecruitingBasics,
  'core-paradigm': CoreParadigm,
  'funnel-math': FunnelMath,
  'customer-types': CustomerTypes,
  'sales-techstack': SalesTechstack,
  'time-management': TimeManagement,
  'icp-pains': IcpPains,
  'value-drivers': ValueDrivers,
  'prepco': Prepco,
  'fab-framework': FabFramework,
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
