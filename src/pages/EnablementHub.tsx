import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DocsNav } from '../components/ui/DocsNav';
import SettingTheMeeting from './SettingTheMeeting';
import OutreachCadence from './OutreachCadence';
import DiscoveryCallSheets from './DiscoveryCallSheets';
import ColdCallPlaybook from './ColdCallPlaybook';
import OperationalPlaybooks from './OperationalPlaybooks';
import PipelineDoctor from './PipelineDoctor';

type Tab = 'setting-the-meeting' | 'outreach-cadence' | 'discovery-sheets' | 'cold-call-playbook' | 'operational-playbooks' | 'pipeline-doctor';

function getInitialTab(pathname: string): Tab {
  if (pathname.includes('pipeline-doctor'))      return 'pipeline-doctor';
  if (pathname.includes('cold-call-playbook'))   return 'cold-call-playbook';
  if (pathname.includes('operational-playbooks')) return 'operational-playbooks';
  if (pathname.includes('setting-the-meeting'))  return 'setting-the-meeting';
  if (pathname.includes('outreach-cadence'))     return 'outreach-cadence';
  if (pathname.includes('discovery-sheets'))     return 'discovery-sheets';
  return 'pipeline-doctor';
}

export default function EnablementHub() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>(getInitialTab(location.pathname));

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    navigate(`/enablement/${tab}`, { replace: true });
  };

  return (
    <div className="flex h-full overflow-hidden bg-stone-50">
      {/* ── Docs Left Nav ── */}
      <DocsNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* ── Content Area ── */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'pipeline-doctor'     && <PipelineDoctor onNavigate={handleTabChange} />}
        {activeTab === 'cold-call-playbook'  && <ColdCallPlaybook />}
        {activeTab === 'operational-playbooks' && <OperationalPlaybooks />}
        {activeTab === 'setting-the-meeting'  && <SettingTheMeeting />}
        {activeTab === 'outreach-cadence'     && <OutreachCadence />}
        {activeTab === 'discovery-sheets'     && <DiscoveryCallSheets />}
      </div>
    </div>
  );
}
