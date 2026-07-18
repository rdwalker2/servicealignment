import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { BookOpen, ChevronDown, Map, TrendingUp, BarChart3, BarChart2, CalendarDays, Database, LogOut, LayoutDashboard, Search, Trophy, Eye, EyeOff, Users, Target, Shield, Phone, FileText, Mail, Clock, PlusCircle, Crosshair, GraduationCap, ChevronsLeft, ChevronsRight, Kanban, Settings, Zap, Utensils, Home, Globe, Settings2, Briefcase, Calculator, CheckCircle2 } from 'lucide-react';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Page imports ──
import DiscoveryRoom from './pages/discovery/DiscoveryRoom';
import RoomBuilder from './pages/discovery/RoomBuilder';
import { CaseStudyPresentation } from './pages/CaseStudyPresentation';
import EnablementHub from './pages/EnablementHub';
import { lazy, Suspense } from 'react';
const GoalWizard = lazy(() => import('./pages/GoalWizard'));
const RepAnalytics = lazy(() => import('./pages/RepAnalytics'));
const OnboardingLaunchPad = lazy(() => import('./pages/OnboardingLaunchPad'));

import ProcessOverview from './pages/process/ProcessOverview';
import BapReference from './pages/process/BapReference';

import WikiLayout from './pages/wiki/WikiLayout';
import ProductWiki from './pages/wiki/ProductWiki';
import CSWiki from './pages/wiki/CSWiki';
import IntegrationsWiki from './pages/wiki/IntegrationsWiki';
import SecurityWiki from './pages/wiki/SecurityWiki';
import CommercialWiki from './pages/wiki/CommercialWiki';
import IndustryWiki from './pages/wiki/IndustryWiki';
import CompetitorWiki from './pages/wiki/CompetitorWiki';


// ── New Command Center imports ──
import RolesAndKPIs from './pages/RolesAndKPIs';
import StandardOperatingProcedures from './pages/StandardOperatingProcedures';
import EstimatingPlaybook from './pages/EstimatingPlaybook';

import { AuthProvider, useAuth, IMPERSONATABLE_PROFILES } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import { ToastProvider } from './components/ui/Toast';
import { Honeypot } from './components/shared/Honeypot';

import ManagerDashboard from './pages/ManagerDashboard';
import WeeklyTracker from './pages/WeeklyTracker';

import Leaderboard from './pages/Leaderboard';
import SalesRedemption from './pages/SalesRedemption';
import ProspectRoom from './pages/discovery/ProspectRoom';
import PortfolioMonitor from './pages/discovery/PortfolioMonitor';
import SignalBoard from './pages/SignalBoard';
import CustomerUniverse from './pages/CustomerUniverse';
const TerritoryMap = lazy(() => import('./pages/TerritoryMap'));
import SettingsPage from './pages/SettingsPage';
import BriefingPage from './pages/BriefingPage';
import CampaignCalendar from './pages/CampaignCalendar';
import GTMInfraWalkthrough from './pages/GTMInfraWalkthrough';
const DynamicAudiencePage = lazy(() => import('./pages/DynamicAudiencePage'));
const PingRoom = lazy(() => import('./pages/PingRoom'));
const DataEngineDashboard = lazy(() => import('./pages/admin/DataEngineDashboard'));

import { useShortcuts } from './hooks/useShortcuts';
import { CommandPalette } from './components/ui/CommandPalette';
import { SyncProvider } from './contexts/SyncContext';
import { loadSeedData } from './lib/seedData';
import { seedDealRooms } from './data/dealRoomSeeds';
import { seedClosedLostDeals } from './data/closedLostSeeds';

import { useAudienceRegistry } from './hooks/useAudienceRegistry';
import { TargetSignalIcon } from './components/signal-board/signalBoardAtoms';

// ── Module-level seed data flag (runs exactly once) ──
const SEED_VERSION_KEY = 'scc_seed_version';
const CURRENT_SEED_VERSION = 'v23_roofing_cushman';
let _seedDataLoaded = false;
function ensureSeedData() {
  if (!_seedDataLoaded) {
    _seedDataLoaded = true;
    const currentVersion = localStorage.getItem(SEED_VERSION_KEY);
    if (currentVersion !== CURRENT_SEED_VERSION) {
      // Clear old fake sessions and load Acquire2Win
      loadSeedData();
      localStorage.setItem(SEED_VERSION_KEY, CURRENT_SEED_VERSION);
      // We also need to clear old fake deals from localStorage to show real SFDC deals!
      // But loadSeedData() clears DISCOVERY_KEY!
    }
  }
}
ensureSeedData();

// ── Sidebar collapse persistence ──
const SIDEBAR_KEY = 'scc_sidebar_collapsed';
function getInitialCollapsed(): boolean {
  try { return localStorage.getItem(SIDEBAR_KEY) === 'true'; } catch { return false; }
}

// ── Light sidebar link ──
function SidebarLink({ to, icon: Icon, label, end, collapsed, badge }: { to: string; icon: React.ElementType; label: string; end?: boolean; collapsed?: boolean; badge?: number }) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150 ${
          isActive
            ? 'bg-[#FF2A7F]/10 text-[#FF2A7F]'
            : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
        } ${collapsed ? 'justify-center px-0' : ''}`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={16} className={`shrink-0 ${isActive ? 'text-[#FF2A7F]' : 'text-stone-400'}`} />
          {!collapsed && <span className="flex-1">{label}</span>}
          {!collapsed && badge != null && badge > 0 && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
              isActive ? 'bg-[#FF2A7F]/20 text-[#FF2A7F]' : 'bg-stone-100 text-stone-400'
            }`}>{badge}</span>
          )}
        </>
      )}
    </NavLink>
  );
}

function SidebarSection({ label, first, collapsed }: { label: string; first?: boolean; collapsed?: boolean }) {
  if (collapsed) {
    return !first ? <div className="border-t border-stone-200/60 mt-3 mb-2" /> : null;
  }
  return (
    <>
      {!first && <div className="border-t border-stone-200/60 mt-3 mb-2" />}
      <p className="text-[11px] font-bold text-stone-400 px-3 py-1 mb-1">{label}</p>
    </>
  );
}

// ── Shared Sidebar Component ──
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

// ── Dynamic Audience Sidebar Links ──
// Reads from audience registry and renders nav items for each dynamic audience
function DynamicAudienceLinks({ collapsed, isAdmin }: { collapsed: boolean; isAdmin: boolean }) {
  const { audiences, loading } = useAudienceRegistry();

  if (loading || audiences.length === 0) return null;

  return (
    <>
      {audiences.map(aud => (
        <SidebarLink
          key={aud.id}
          to={`/team/audience/${aud.id}`}
          icon={Zap}
          label={aud.label}
          collapsed={collapsed}
          badge={aud.enrichedCount > 0 ? aud.enrichedCount : aud.seedCount}
        />
      ))}
    </>
  );
}

function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, effectiveUser, isManager, isAdmin, isImpersonating, impersonatingRep, logout, startImpersonation, stopImpersonation } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayUser = isImpersonating && impersonatingRep ? impersonatingRep : user;

  return (
    <aside
      className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r border-stone-200/60 flex flex-col z-10 shrink-0 transition-all duration-200`}
    >
      {/* Header */}
      <div className={`px-3 py-3 flex items-center border-b border-stone-200/60 ${collapsed ? 'justify-center' : 'gap-2'}`}>
        {!collapsed && (
          <>
            <div className="flex items-center gap-2 font-bold text-stone-800 text-[13px] uppercase tracking-wide">
              Service Alignment
            </div>
            <div className="border-l border-stone-300 pl-2.5 h-4 flex items-center">
              <p className="text-[9px] text-[#FF2A7F] font-bold tracking-wide mt-0.5">GTM</p>
            </div>
          </>
        )}
        <button
          onClick={onToggle}
          className={`p-1 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors ${collapsed ? '' : 'ml-auto'}`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {/* ── HOME + GOALS — daily/monthly performance pair ── */}
        {user.role !== 'exec' && (
          <>
            <SidebarSection label="Onboarding" first={true} collapsed={collapsed} />
            <SidebarLink to="/team/onboarding" icon={GraduationCap} label="Launch Pad" collapsed={collapsed} />
            <SidebarSection label="Performance" collapsed={collapsed} />
            <SidebarLink to="/team/tracker" icon={Home} label="Home" end collapsed={collapsed} />
            <SidebarLink to="/team/goals" icon={Crosshair} label="Goals" collapsed={collapsed} />
            <SidebarLink to="/team/analytics" icon={BarChart2} label="Analytics" collapsed={collapsed} />
          </>
        )}

        {/* ── SIGNALS — for everyone ── */}
        <SidebarSection label="Signals" first={user.role === 'exec'} collapsed={collapsed} />
        <SidebarLink to="/team/signals" icon={TargetSignalIcon} label="Signal Board" collapsed={collapsed} />
        <SidebarLink to="/team/territory-map" icon={Map} label="Territory Map" collapsed={collapsed} />

        {/* ── AUDIENCES — dynamic from registry (Admin only for now) ── */}
        {isAdmin && (
          <>
            <SidebarSection label="Audiences" collapsed={collapsed} />
            <SidebarLink to="/team/audience/all" icon={Database} label="All Accounts" collapsed={collapsed} />
            <DynamicAudienceLinks collapsed={collapsed} isAdmin={isAdmin} />
          </>
        )}

        {/* ── PIPELINE — hidden from exec ── */}
        {user.role !== 'exec' && (
          <>
            <SidebarSection label="Pipeline" collapsed={collapsed} />
            <SidebarLink to="/team/pipeline" icon={Kanban} label="Pipeline" end collapsed={collapsed} />
            <SidebarLink to="/team/lost" icon={GraduationCap} label="Closed Lost Audit" collapsed={collapsed} />
          </>
        )}


        {/* ── PLAYBOOK & WIKIS ── */}
        {user.role !== 'exec' && (
          <>
            <SidebarSection label="Process" collapsed={collapsed} />
            <SidebarLink to="/team/process/overview" icon={BookOpen} label="Playbook" collapsed={collapsed} />
            <SidebarLink to="/team/wiki/product" icon={FileText} label="Wikis" collapsed={collapsed} />
          </>
        )}

        {/* ── OPERATIONS & SERVICE ── */}
        {user.role !== 'exec' && (
          <>
            <SidebarSection label="Operations" collapsed={collapsed} />
            <SidebarLink to="/team/ops/roles" icon={Users} label="Roles & KPIs" collapsed={collapsed} />
            <SidebarLink to="/team/ops/sops" icon={CheckCircle2} label="SOPs & Checklists" collapsed={collapsed} />
            <SidebarLink to="/team/ops/estimating" icon={Calculator} label="Estimating & Upsells" collapsed={collapsed} />
          </>
        )}

        {/* Admin Rep Switcher — hidden from exec */}
        {isAdmin && user.role !== 'exec' && (
          <>
            <SidebarSection label="Admin" collapsed={collapsed} />
            <SidebarLink to="/team/data-engine" icon={Database} label="Data Engine" collapsed={collapsed} />
            <button
              onClick={stopImpersonation}
              title={collapsed ? 'Admin View' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                !isImpersonating
                  ? 'bg-[#FF2A7F]/10 text-[#FF2A7F]'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              } ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <Users size={16} className={`shrink-0 ${!isImpersonating ? 'text-[#FF2A7F]' : 'text-stone-400'}`} />
              {!collapsed && <span>Admin View</span>}
            </button>
            {IMPERSONATABLE_PROFILES.map((rep) => (
              <button
                key={rep.id}
                onClick={() => startImpersonation(rep.id)}
                title={collapsed ? rep.full_name : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                  isImpersonating && impersonatingRep?.id === rep.id
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                } ${collapsed ? 'justify-center px-0' : ''}`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 border ${
                    isImpersonating && impersonatingRep?.id === rep.id
                      ? 'border-amber-400'
                      : 'border-stone-300/60'
                  }`}
                  style={{ backgroundColor: rep.avatar_color }}
                >
                  {rep.initials}
                </div>
                {!collapsed && (
                  <>
                    {rep.full_name}
                    {isImpersonating && impersonatingRep?.id === rep.id && (
                      <Eye size={12} className="ml-auto text-amber-500" />
                    )}
                  </>
                )}
              </button>
            ))}
          </>
        )}
      </nav>

      {/* Sidebar User Info */}
      <div className="p-2 border-t border-stone-200/60">
        <div className={`flex items-center gap-2 px-2 py-1.5 ${collapsed ? 'justify-center px-0' : ''}`}>
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${
              isImpersonating ? 'ring-2 ring-amber-400' : ''
            }`}
            style={{ backgroundColor: displayUser.avatar_color }}
            title={collapsed ? displayUser.full_name : undefined}
          >
            {displayUser.initials}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-stone-900 truncate">{displayUser.full_name}</div>
                {isImpersonating ? (
                  <div className="text-[10px] text-amber-600 font-medium">viewing as {impersonatingRep?.full_name?.split(' ')[0]}</div>
                ) : (
                  <div className="text-[10px] text-stone-400 font-medium">{isAdmin ? 'admin' : user.role}</div>
                )}
                {isImpersonating && (
                  <div className="text-[9px] text-stone-400 truncate">{user.full_name}</div>
                )}
              </div>
            </>
          )}
        </div>
        {/* Settings + Logout row */}
        {!collapsed ? (
          <div className="flex items-center gap-1 px-2 pb-1">
            {(user.role === 'admin' || user.role === 'exec') && (
              <NavLink
                to="/team/settings"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    isActive
                      ? 'text-[#FF2A7F] bg-[#FF2A7F]/10'
                      : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
                  }`
                }
              >
                <Settings size={13} />
                <span>Settings</span>
              </NavLink>
            )}
            <button onClick={handleLogout} className="ml-auto p-1 text-stone-400 hover:text-stone-600 transition-colors" title="Logout">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 pb-1">
            {(user.role === 'admin' || user.role === 'exec') && (
              <NavLink
                to="/team/settings"
                title="Settings"
                className={({ isActive }) =>
                  `p-1 rounded-md transition-colors ${
                    isActive ? 'text-[#FF2A7F]' : 'text-stone-400 hover:text-stone-600'
                  }`
                }
              >
                <Settings size={14} />
              </NavLink>
            )}
            <button onClick={handleLogout} className="p-1 text-stone-400 hover:text-stone-600 transition-colors" title="Logout">
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

// ── Impersonation Banner (light) ──
function ImpersonationBanner() {
  const { isImpersonating, impersonatingRep, stopImpersonation } = useAuth();
  return (
    <AnimatePresence>
      {isImpersonating && impersonatingRep && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-700 text-xs font-medium">
              <Eye size={14} />
              <span>Viewing as <strong>{impersonatingRep.full_name}</strong></span>
            </div>
            <button
              onClick={stopImpersonation}
              className="flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-md transition-colors"
            >
              <EyeOff size={12} />
              Exit Impersonation
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Router-aware Case Study Wrapper ──
function CaseStudyWrapper() {
  const navigate = useNavigate();
  const setActiveTab = (tab: string) => {
    const routeMap: Record<string, string> = {
      targeting: '/execution/target-accounts',
      sourcing: '/execution/target-accounts',
      pipeline: '/team/pipeline',
      discovery: '/team/pipeline',
      ssp: '/team/ssp',
      perfectWeek: '/strategy/operations',
      playbook: '/team/playbook',
      actionPlan: '/team/playbook',
      settingMeeting: '/enablement/setting-the-meeting',
      discoverySheets: '/enablement/discovery-sheets',
      outreach: '/enablement/outreach-cadence',
    };
    navigate(routeMap[tab] || '/team');
  };
  return <CaseStudyPresentation setActiveTab={setActiveTab as any} />;
}

// ── Router-aware TAU Wrapper ──
function TAUWrapper() {
  return <Navigate to="/enablement/pipeline-doctor" replace />;
}

// ── Authenticated Discovery Room Wrapper ──
function DiscoveryRoomAuth() {
  const { effectiveUser } = useAuth();
  const { companyId } = useParams<{ companyId?: string }>();
  return <DiscoveryRoom companyId={companyId} repId={effectiveUser?.id} />;
}

// ── Keyed GoalWizard Wrapper — forces remount on impersonation switch ──
function GoalWizardAuth() {
  const { effectiveUser } = useAuth();
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading...</div>}>
      <GoalWizard key={effectiveUser?.id ?? 'default'} />
    </Suspense>
  );
}

// ── Keyed WeeklyTracker Wrapper — forces remount on impersonation switch ──
function WeeklyTrackerAuth() {
  const { effectiveUser, isAdmin, isImpersonating } = useAuth();
  if (isAdmin && !isImpersonating) {
    return <ManagerDashboard key="admin" />;
  }
  return <WeeklyTracker key={effectiveUser?.id ?? 'default'} />;
}

// ── Unified Layout (light) ──
function UnifiedLayout() {
  const { user, isManager, isAdmin, isImpersonating } = useAuth();
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);

  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR_KEY, String(next)); } catch { /* noop */ }
      return next;
    });
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-stone-50 text-stone-900 font-sans selection:bg-[#FF2A7F]/20 selection:text-[#FF2A7F]">
      <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <ImpersonationBanner />

        <Routes>
          {/* ── Default landing: exec → Signal Board, reps → Home (tracker) ── */}
          <Route index element={<Navigate to={user.role === 'exec' ? '/team/signals' : '/team/tracker'} replace />} />

          {/* ── Routes restricted from exec (redirects to signals) ── */}
          <Route path="onboarding" element={user.role === 'exec' ? <Navigate to="/team/signals" replace /> : <Suspense fallback={<div className="flex items-center justify-center h-full text-stone-400 text-sm">Loading...</div>}><OnboardingLaunchPad /></Suspense>} />
          <Route path="tracker" element={user.role === 'exec' ? <Navigate to="/team/signals" replace /> : <WeeklyTrackerAuth />} />
          <Route path="analytics" element={user.role === 'exec' ? <Navigate to="/team/signals" replace /> : <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading...</div>}><RepAnalytics /></Suspense>} />
          <Route path="leaderboard" element={user.role === 'exec' ? <Navigate to="/team/signals" replace /> : <Leaderboard />} />
          <Route path="calendar" element={isAdmin ? <CampaignCalendar /> : <Navigate to="/team" replace />} />
          <Route path="goals" element={user.role === 'exec' ? <Navigate to="/team/signals" replace /> : <GoalWizardAuth />} />
          <Route path="lost" element={user.role === 'exec' ? <Navigate to="/team/signals" replace /> : <SalesRedemption />} />
          <Route path="redemption" element={<Navigate to="/team/lost" replace />} />
          <Route path="pipeline" element={user.role === 'exec' ? <Navigate to="/team/signals" replace /> : <DiscoveryRoomAuth />} />
          <Route path="pipeline/:companyId" element={user.role === 'exec' ? <Navigate to="/team/signals" replace /> : <DiscoveryRoomAuth />} />

          {/* ── Process routes ── */}
          <Route path="process/overview" element={<ProcessOverview />} />
          <Route path="process/bap" element={<BapReference />} />

          {/* ── Operations routes ── */}
          <Route path="ops/roles" element={<RolesAndKPIs />} />
          <Route path="ops/sops" element={<StandardOperatingProcedures />} />
          <Route path="ops/estimating" element={<EstimatingPlaybook />} />

          {/* ── Wiki routes ── */}
          <Route path="wiki" element={<WikiLayout />}>
            <Route index element={<Navigate to="product" replace />} />
            <Route path="product" element={<ProductWiki />} />
            <Route path="cs" element={<CSWiki />} />
            <Route path="integrations" element={<IntegrationsWiki />} />
            <Route path="security" element={<SecurityWiki />} />
            <Route path="commercial" element={<CommercialWiki />} />
            <Route path="industry" element={<IndustryWiki />} />
            <Route path="competitors" element={<CompetitorWiki />} />
          </Route>

          {/* ── Prospecting routes — available to all roles (except Customer Universe) ── */}
          <Route path="signals" element={<SignalBoard />} />
          <Route path="territory-map" element={<Suspense fallback={<div className="flex items-center justify-center h-full text-stone-400 text-sm">Loading map...</div>}><TerritoryMap /></Suspense>} />
          <Route path="customers" element={isAdmin ? <CustomerUniverse /> : <Navigate to="/team/signals" replace />} />

          {/* ── Dynamic audiences ── */}
          <Route path="audience/:audienceId" element={
            <Suspense fallback={<div className="flex items-center justify-center h-full text-stone-400 text-sm">Loading...</div>}>
              <DynamicAudiencePage />
            </Suspense>
          } />

          {/* ── Settings placeholder — admin + exec ── */}
          <Route path="settings" element={(user.role === 'admin' || user.role === 'exec') ? <SettingsPage /> : <Navigate to="/team" replace />} />

          {/* ── Admin Dashboard ── */}
          <Route path="data-engine" element={(user.role === 'admin' || user.role === 'exec') ? <Suspense fallback={<div className="flex items-center justify-center h-full text-stone-400 text-sm">Loading...</div>}><DataEngineDashboard /></Suspense> : <Navigate to="/team" replace />} />

          {/* ── Catch-all ── */}
          <Route path="*" element={<Navigate to="/team" replace />} />
        </Routes>
      </main>
    </div>
  );
}

// ── Root App ──
export default function App() {
  return (
    <AuthProvider>
      <SyncProvider>
        <ToastProvider>
          <BrowserRouter>
            <CommandPalette />
            <AppRouter />
          </BrowserRouter>
        </ToastProvider>
      </SyncProvider>
    </AuthProvider>
  );
}

// ── Auth-protected wrapper for legacy routes inside the sidebar ──
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// ── Legacy route content that renders inside sidebar layout ──
// These routes live outside /team/* so they need their own auth guard + the sidebar wrapper.
function LegacyRouteLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);

  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR_KEY, String(next)); } catch { /* noop */ }
      return next;
    });
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-stone-50 text-stone-900 font-sans selection:bg-[#FF2A7F]/20 selection:text-[#FF2A7F]">
      <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} />

      <main className="flex-1 overflow-auto relative">
        {children}
      </main>
    </div>
  );
}

function AppRouter() {
  const location = useLocation();
  useShortcuts();

  const isLoginRoute = location.pathname === '/login';
  const isDemoRoute = location.pathname.toLowerCase().startsWith('/demo');
  const isProspectorRoute = location.pathname.startsWith('/prospector/');
  const isPingRoute = location.pathname.startsWith('/ping/');
  const isTeamRoute = location.pathname.startsWith('/team');
  const isGTMInfra = location.pathname === '/gtm-infra' || location.pathname === '/briefing' || location.pathname === '/briefing/';
  const isCmsPreview = location.pathname.startsWith('/cms-preview/');
  const isHoneypotRoute = ['/wp-admin', '/admin', '/.env', '/config.php', '/phpinfo.php', '/phpmyadmin'].includes(location.pathname);

  // ── Honeypot Routes (Tarpit) ──
  if (isHoneypotRoute) {
    return (
      <Routes>
        <Route path="*" element={<Honeypot />} />
      </Routes>
    );
  }

  // ── Login (no sidebar, no auth) ──
  if (isLoginRoute) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    );
  }

  // ── GTM Infrastructure Walkthrough (no sidebar, no auth) ──
  if (isGTMInfra) {
    return (
      <Routes>
        <Route path="/gtm-infra" element={<GTMInfraWalkthrough />} />
        <Route path="/briefing" element={<BriefingPage />} />
        <Route path="/briefing/" element={<BriefingPage />} />
      </Routes>
    );
  }

  // ── Demo Briefing (no sidebar, custom auth) ──
  if (isDemoRoute) {
    return (
      <Routes>
        <Route path="/demo/*" element={<BriefingPage />} />
      </Routes>
    );
  }

  // ── Public Prospector Experience — no auth, no sidebar ──
  if (isProspectorRoute || isCmsPreview || isPingRoute) {
    return (
      <Routes>
        <Route path="/prospector/:token" element={<ProspectRoom />} />
        <Route path="/ping/:id" element={<Suspense fallback={<div className="flex h-screen items-center justify-center bg-stone-950"><div className="w-8 h-8 rounded-full border-t-2 border-[#FF2A7F] animate-spin" /></div>}><PingRoom /></Suspense>} />
      </Routes>
    );
  }

  // ── /team/* routes — unified layout ──
  if (isTeamRoute) {
    return (
      <Routes>
        <Route path="/team/*" element={<UnifiedLayout />} />
      </Routes>
    );
  }

  // ── Enablement routes + legacy redirects ──
  return (
    <Routes>
      {/* Leadership */}
      <Route path="/leadership/overview" element={
        <LegacyRouteLayout><CaseStudyWrapper /></LegacyRouteLayout>
      } />

      {/* Enablement — all render inside one tabbed hub */}
      <Route path="/enablement/setting-the-meeting" element={
        <LegacyRouteLayout><EnablementHub /></LegacyRouteLayout>
      } />
      <Route path="/enablement/outreach-cadence" element={
        <LegacyRouteLayout><EnablementHub /></LegacyRouteLayout>
      } />
      <Route path="/enablement/discovery-sheets" element={
        <LegacyRouteLayout><EnablementHub /></LegacyRouteLayout>
      } />
      <Route path="/enablement/cold-call-playbook" element={
        <LegacyRouteLayout><EnablementHub /></LegacyRouteLayout>
      } />
      <Route path="/enablement/operational-playbooks" element={
        <LegacyRouteLayout><EnablementHub /></LegacyRouteLayout>
      } />
      <Route path="/enablement/pipeline-doctor" element={
        <LegacyRouteLayout><EnablementHub /></LegacyRouteLayout>
      } />

      {/* Legacy redirects */}
      <Route path="/strategy/ssp" element={<Navigate to="/team" replace />} />
      <Route path="/strategy/operations" element={<Navigate to="/team" replace />} />
      <Route path="/execution/target-accounts" element={<Navigate to="/enablement/pipeline-doctor" replace />} />
      <Route path="/execution/discovery" element={<Navigate to="/team/pipeline" replace />} />
      <Route path="/enablement/playbook" element={<Navigate to="/team/pipeline" replace />} />

      {/* Catch-all: redirect to /team */}
      <Route path="*" element={<Navigate to="/team" replace />} />
    </Routes>
  );
}
