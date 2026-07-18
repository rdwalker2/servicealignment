import { useState } from 'react';
import { MousePointerClick, Activity, Users, Globe, PlayCircle } from 'lucide-react';
import { ScriptBlock } from './DocComponents';

interface DemoTrack {
  id: string;
  icon: React.ReactNode;
  painLabel: string;
  painDescription: string;
  anchor: string;
  solution: string;
  proof: string;
}

const DEMO_TRACKS: DemoTrack[] = [
  {
    id: 'scheduling-chaos',
    icon: <PlayCircle size={18} />,
    painLabel: 'Scheduling Chaos',
    painDescription: 'Recruiters are wasting hours sending emails back and forth to schedule interviews.',
    anchor: 'You told me earlier that your recruiters are losing 15 hours a week just playing calendar tetris with candidates...',
    solution: 'Let me show you how Teamtailor completely eliminates that.\n\n1. Go to the Candidate Card.\n2. Click "Smart Schedule".\n3. Show how candidates receive a branded link to pick times based on real-time calendar availability.',
    proof: 'When [Similar Company] implemented this exact flow, they reclaimed 2 full days of recruiting time per week and dropped time-to-schedule from 3 days to 4 hours.'
  },
  {
    id: 'hiring-manager-disconnect',
    icon: <Users size={18} />,
    painLabel: 'Disconnected Managers',
    painDescription: 'Hiring managers hate logging into the ATS and take forever to leave interview feedback.',
    anchor: 'You mentioned that your hiring managers refuse to log into the ATS, forcing you to chase them down in Slack for interview feedback...',
    solution: 'Here is how we bring the ATS directly to where they already work.\n\n1. Open the Slack/Teams integration settings.\n2. Show the automated interview reminder.\n3. Show the embedded 1-click Scorecard that pops up immediately after the interview right inside Slack.',
    proof: 'By removing the login friction, [Similar Company] increased their scorecard completion rate from 40% to 95% within the first month.'
  },
  {
    id: 'weak-employer-brand',
    icon: <Globe size={18} />,
    painLabel: 'Weak Employer Brand',
    painDescription: 'Their career site looks outdated, requires IT to update, and fails to convert traffic.',
    anchor: 'When we looked at your current career site, you pointed out how rigid it feels and how you have to submit an IT ticket just to add a video...',
    solution: 'Let me show you how your talent team takes full control of the brand.\n\n1. Open the drag-and-drop Career Site Builder.\n2. Add a new "Day in the Life" video block in 3 seconds.\n3. Show how mobile-responsive it is by default.',
    proof: 'Companies that use our visual builder see a 3x increase in passive candidate conversion because they can actually tell their authentic story without waiting on IT.'
  },
  {
    id: 'sourcing-blackhole',
    icon: <Activity size={18} />,
    painLabel: 'Sourcing Blackhole',
    painDescription: 'They meet great candidates but lose track of them, relying on expensive job boards instead of nurturing a talent pool.',
    anchor: 'You shared that you are spending $50k a year on job boards because you have no way to re-engage the silver medalists from past roles...',
    solution: 'Here is how you turn your existing database into your best sourcing channel.\n\n1. Go to Connect/Talent Pool.\n2. Filter by "Engineers" who reached "Final Interview" last year.\n3. Trigger an automated Nurture Campaign with one click.',
    proof: 'By leveraging Connect campaigns, [Similar Company] reduced their external agency spend by $120k in the first year because they hired directly from their warm talent pool.'
  }
];

export default function PainToDemoMatrix() {
  const [selectedTrackId, setSelectedTrackId] = useState<string>(DEMO_TRACKS[0].id);

  const activeTrack = DEMO_TRACKS.find(t => t.id === selectedTrackId) || DEMO_TRACKS[0];

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row my-8">
      
      {/* Left Sidebar: The Pains */}
      <div className="w-full md:w-[300px] bg-stone-50 border-r border-stone-200 flex flex-col">
        <div className="p-4 border-b border-stone-200 bg-stone-100/50">
          <h3 className="text-[12px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-2">
            <MousePointerClick size={14} />
            1. Select The Pain
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {DEMO_TRACKS.map(track => {
            const isSelected = track.id === selectedTrackId;
            return (
              <button
                key={track.id}
                onClick={() => setSelectedTrackId(track.id)}
                className={`w-full text-left p-4 border-b border-stone-200 transition-all ${
                  isSelected 
                    ? 'bg-white border-l-4 border-l-[#FF2A7F]' 
                    : 'bg-transparent border-l-4 border-l-transparent hover:bg-stone-100/50'
                }`}
              >
                <div className={`font-bold flex items-center gap-2 mb-1 ${isSelected ? 'text-[#FF2A7F]' : 'text-stone-700'}`}>
                  {track.icon}
                  {track.painLabel}
                </div>
                <div className={`text-[12px] leading-snug ${isSelected ? 'text-stone-600' : 'text-stone-500'}`}>
                  {track.painDescription}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Side: The Demo Flow */}
      <div className="flex-1 bg-white p-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-stone-900 mb-2">The Perfect Demo Flow</h3>
          <p className="text-[13px] text-stone-500">
            If you identified <strong className="text-stone-700">{activeTrack.painLabel}</strong> during Discovery, you must show this exact flow and nothing else.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-bold">1</span>
              <h4 className="font-bold text-stone-800 text-[14px] uppercase tracking-wide">The Anchor</h4>
            </div>
            <ScriptBlock label="What you say">
              {activeTrack.anchor}
            </ScriptBlock>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-[#FF2A7F] text-white flex items-center justify-center text-[10px] font-bold">2</span>
              <h4 className="font-bold text-stone-800 text-[14px] uppercase tracking-wide">The Solution</h4>
            </div>
            <ScriptBlock label="What you click">
              {activeTrack.solution}
            </ScriptBlock>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">3</span>
              <h4 className="font-bold text-stone-800 text-[14px] uppercase tracking-wide">The Proof</h4>
            </div>
            <ScriptBlock label="The Case Study">
              {activeTrack.proof}
            </ScriptBlock>
          </div>
        </div>
      </div>

    </div>
  );
}
