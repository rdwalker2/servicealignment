import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BATTLECARDS } from '../data/battlecards';
import { DocsNav } from '../components/ui/DocsNav';
import Battlecards from './Battlecards';
import SettingTheMeeting from './SettingTheMeeting';
import OutreachCadence from './OutreachCadence';
import DiscoveryCallSheets from './DiscoveryCallSheets';
import ColdCallPlaybook from './ColdCallPlaybook';
import RepWorkbook from './RepWorkbook';
import OperationalPlaybooks from './OperationalPlaybooks';
import PipelineDoctor from './PipelineDoctor';

type Tab = 'battlecards' | 'setting-the-meeting' | 'outreach-cadence' | 'discovery-sheets' | 'cold-call-playbook' | 'rep-workbook' | 'operational-playbooks' | 'pipeline-doctor';

function getInitialTab(pathname: string): Tab {
  if (pathname.includes('pipeline-doctor'))      return 'pipeline-doctor';
  if (pathname.includes('cold-call-playbook'))   return 'cold-call-playbook';
  if (pathname.includes('rep-workbook'))         return 'rep-workbook';
  if (pathname.includes('operational-playbooks')) return 'operational-playbooks';
  if (pathname.includes('setting-the-meeting'))  return 'setting-the-meeting';
  if (pathname.includes('outreach-cadence'))     return 'outreach-cadence';
  if (pathname.includes('discovery-sheets'))     return 'discovery-sheets';
  return 'battlecards';
}

export default function EnablementHub() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>(getInitialTab(location.pathname));
  const [activeBattlecardId, setActiveBattlecardId] = useState(BATTLECARDS[0].id);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    navigate(`/enablement/${tab}`, { replace: true });
  };

  const handleBattlecardChange = (id: string) => {
    setActiveBattlecardId(id);
    setActiveTab('battlecards');
    navigate('/enablement/battlecards', { replace: true });
  };

  return (
    <div className="flex h-full overflow-hidden bg-stone-50">
      {/* ── Docs Left Nav ── */}
      <DocsNav
        activeTab={activeTab}
        activeBattlecardId={activeBattlecardId}
        onTabChange={handleTabChange}
        onBattlecardChange={handleBattlecardChange}
      />

      {/* ── Content Area ── */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'pipeline-doctor'     && <PipelineDoctor onNavigate={handleTabChange} />}
        {activeTab === 'cold-call-playbook'  && <ColdCallPlaybook />}
        {activeTab === 'rep-workbook'         && <RepWorkbook />}
        {activeTab === 'operational-playbooks' && <OperationalPlaybooks />}
        {activeTab === 'battlecards'          && <Battlecards activeBattlecardId={activeBattlecardId} />}
        {activeTab === 'setting-the-meeting'  && <SettingTheMeeting />}
        {activeTab === 'outreach-cadence'     && <OutreachCadence />}
        {activeTab === 'discovery-sheets'     && <DiscoveryCallSheets />}
      </div>
    </div>
  );
}
