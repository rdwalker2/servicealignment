import { useState } from 'react';
import { ArrowRight, Shield, ChevronRight, CheckCircle2, PhoneCall, RotateCcw } from 'lucide-react';
import { CleanPage, CleanCard, CleanPageHeader, Reveal } from '../components/ui/CleanUI';

// ── Types ──────────────────────────────────────────────────────────────────
interface Choice {
  text: string;
  coaching?: string;
  next: string | null;
}

interface DecisionNode {
  id: string;
  label: string;
  choices: Choice[];
}

interface Persona {
  id: string;
  label: string;
  emoji: string;
  role: string;
  color: string;
  opener: string;
  nodes: DecisionNode[];
}

// ── Personas ───────────────────────────────────────────────────────────────
const PERSONAS: Persona[] = [
  {
    id: 'property-manager',
    label: 'Property Manager',
    emoji: '🏢',
    role: 'Focuses on tenant satisfaction, OPEX budgets, and keeping the building occupied.',
    color: '#a855f7',
    opener:
      '"Hey [Name], I\'m calling because your roof at [Address] just pinged our system. Are you currently experiencing any leaks, or are we catching this early?"',
    nodes: [
      {
        id: 'start',
        label: 'Their Opening Response',
        choices: [
          { text: '"What do you mean my roof pinged you?"', coaching: 'The data drop — establish authority.', next: 'explain-ping' },
          { text: '"We don\'t have any leaks right now."', coaching: 'Predictive pivot — this is exactly why we called.', next: 'no-leaks' },
          { text: '"We already have a roofer we use."', coaching: 'Competitor wedge — differentiate predictive vs reactive.', next: 'have-roofer' },
          { text: '"I\'m too busy to talk right now."', coaching: 'Respect time, earn the meeting.', next: 'too-busy' },
        ],
      },
      {
        id: 'explain-ping',
        label: 'Handle: What is a ping?',
        choices: [
          { text: '"Our predictive engine tracks NOAA weather data against the age of commercial roofs. The recent hail event dropped your Roof Health Score into the risk zone. Have the tenants complained yet?"', coaching: 'Pivot to tenant pain.', next: 'pain-close' },
        ],
      },
      {
        id: 'no-leaks',
        label: 'Handle: No Leaks',
        choices: [
          { text: '"That\'s exactly why I reached out. By the time you see the leak inside, the insulation has been wet for months. Are you planning any capital expenditures for that roof this year?"', coaching: 'Introduce financial risk of the status quo.', next: 'pain-close' },
        ],
      },
      {
        id: 'have-roofer',
        label: 'Handle: Have a Roofer',
        choices: [
          { text: '"That\'s great. When you call them for a leak, do they just caulk it, or do they provide a full predictive diagnostic to show you what will fail next month?"', coaching: 'Surfaces the reactive nature of their current roofer.', next: 'pain-close' },
        ],
      },
      {
        id: 'too-busy',
        label: 'Handle: Too Busy',
        choices: [
          { text: '"Understood. I just wanted to give you a heads-up on the alert. When is a better time to spend 5 minutes reviewing the risk profile for that building?"', coaching: 'Validate and reschedule.', next: 'schedule' },
        ],
      },
      {
        id: 'pain-close',
        label: 'Pain Surfaced → Close for Diagnosis',
        choices: [
          { text: '"Given the risk score on that property, I\'d like to send our tech out to do a quick non-invasive drone scan. It takes 30 minutes, doesn\'t disrupt tenants, and gives you a baseline. Does Tuesday work?"', coaching: 'Low commitment, high value. Book the 4D Diagnosis.', next: null },
        ],
      },
      {
        id: 'schedule',
        label: 'Schedule the Follow-up',
        choices: [
          { text: '"Sounds good. I\'ll send a calendar invite over — talk then."', coaching: 'Send the invite immediately. Don\'t wait.', next: null },
        ],
      },
    ],
  },
  {
    id: 'facility-manager',
    label: 'Facility Manager',
    emoji: '👷',
    role: 'Focuses on operational continuity, safety, and preventing downtime.',
    color: '#3b82f6',
    opener:
      '"Hey [Name], we received a predictive alert regarding potential roof damage at your facility. How is this impacting your daily operations right now?"',
    nodes: [
      {
        id: 'start',
        label: 'Their Opening Response',
        choices: [
          { text: '"We just patch it ourselves / in-house team."', coaching: 'Introduce warranty risk.', next: 'in-house' },
          { text: '"We aren\'t experiencing any issues."', coaching: 'Challenge the invisible water intrusion.', next: 'no-leaks' },
          { text: '"We use [National Provider]."', coaching: 'Highlight dispatch speed and quality.', next: 'national-provider' },
        ],
      },
      {
        id: 'in-house',
        label: 'Handle: In-House Team',
        choices: [
          { text: '"Makes sense for everyday fixes. But commercial membranes require specific heat-welding. If your guy uses the wrong caulk, it voids the manufacturer\'s warranty. Has he been documenting repairs to spec?"', coaching: 'Introduce fear of voided warranties.', next: 'pain-close' },
        ],
      },
      {
        id: 'no-leaks',
        label: 'Handle: No Leaks',
        choices: [
          { text: '"Glad to hear it hasn\'t hit the floor yet. Are you aware that a saturated roof deck can cause a total roof collapse if left unchecked after a severe storm?"', coaching: 'Elevate the risk to safety/operations.', next: 'pain-close' },
        ],
      },
      {
        id: 'national-provider',
        label: 'Handle: National Provider',
        choices: [
          { text: '"They are convenient for billing. But when it\'s raining, how fast do they actually dispatch a qualified technician to your site?"', coaching: 'Highlight the speed gap in broker models.', next: 'pain-close' },
        ],
      },
      {
        id: 'pain-close',
        label: 'Pain Surfaced → Close for Diagnosis',
        choices: [
          { text: '"Let me send our drone out to do a quick thermal scan. We\'ll map out any wet insulation before it disrupts operations. Are you free Thursday to review the findings?"', coaching: 'Sell the non-invasive drone scan.', next: null },
        ],
      },
    ],
  },
  {
    id: 'owner',
    label: 'Asset Owner',
    emoji: '📈',
    role: 'Focuses on Net Operating Income (NOI), capital expenditure, and asset valuation.',
    color: '#ef4444',
    opener:
      '"Hey [Name], our predictive engine indicates your asset at [Address] has dropped into the risk zone. Are you planning capital expenditures for this roof soon, or trying to squeeze another few years out of it?"',
    nodes: [
      {
        id: 'start',
        label: 'Their Opening Response',
        choices: [
          { text: '"We don\'t have the budget for a new roof."', coaching: 'Reframe around Preventative Maintenance and NOI.', next: 'no-budget' },
          { text: '"I leave that to my property manager."', coaching: 'Ensure the PM is aligned with the Owner\'s financial goals.', next: 'delegate' },
          { text: '"We are selling the building next year."', coaching: 'Align the solution with the exit strategy.', next: 'selling' },
        ],
      },
      {
        id: 'no-budget',
        label: 'Handle: No Budget',
        choices: [
          { text: '"I\'m not calling to sell you a roof. I\'m calling because the cheapest way to avoid a $150k replacement next year is a $2k preventative maintenance plan today to protect your NOI. Have you done a baseline diagnostic?"', coaching: 'Position yourself as protecting their NOI, not spending it.', next: 'pain-close' },
        ],
      },
      {
        id: 'delegate',
        label: 'Handle: Property Manager Handles It',
        choices: [
          { text: '"Makes sense. Is your PM just reactively patching leaks, or do they have a predictable capital expenditure forecast for that roof over the next 5 years?"', coaching: 'Make the owner question if the PM is protecting their asset value.', next: 'pain-close' },
        ],
      },
      {
        id: 'selling',
        label: 'Handle: Selling the Building',
        choices: [
          { text: '"Got it. In that case, you definitely don\'t want to replace it, but a documented Preventative Maintenance plan will prevent a buyer\'s inspector from demanding a massive price reduction. Let\'s get a baseline."', coaching: 'Align with their goal (maximizing exit valuation).', next: 'pain-close' },
        ],
      },
      {
        id: 'pain-close',
        label: 'Pain Surfaced → Close for Diagnosis',
        choices: [
          { text: '"Why don\'t I put together a quick look at the risk profile for that building? 20 minutes — if the roof is fine, I\'ll be the first to tell you. Deal?"', coaching: 'Low commitment, high value.', next: null },
        ],
      },
    ],
  }
];

export default function SettingTheMeeting() {
  const [activePersona, setActivePersona] = useState<Persona>(PERSONAS[0]);
  const [currentNodeId, setCurrentNodeId] = useState<string>('start');

  const currentNode = activePersona.nodes.find((n) => n.id === currentNodeId) || activePersona.nodes[0];

  const handlePersonaChange = (p: Persona) => {
    setActivePersona(p);
    setCurrentNodeId('start');
  };

  return (
    <CleanPage>
      <CleanPageHeader 
        title="Setting The Meeting" 
        subtitle="Master the 4D Discovery call. Use predictive signals to pivot from a cold call into a trusted Diagnosis meeting."
      />

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Col: Persona Selector & Context */}
        <div className="w-full lg:w-1/3 space-y-4">
          <h3 className="text-[12px] font-bold text-stone-400 uppercase tracking-widest mb-2 px-1">Select Persona</h3>
          <div className="space-y-2">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePersonaChange(p)}
                className={`w-full flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                  activePersona.id === p.id 
                    ? 'border-stone-900 bg-stone-900 text-white shadow-md scale-[1.02]' 
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{p.emoji}</span>
                  <span className="font-bold text-[14px]">{p.label}</span>
                </div>
                <span className={`text-[12px] leading-relaxed ${activePersona.id === p.id ? 'text-stone-300' : 'text-stone-500'}`}>
                  {p.role}
                </span>
              </button>
            ))}
          </div>

          <Reveal delay={100}>
            <div className="mt-8 p-5 bg-blue-50 border border-blue-100 rounded-xl">
              <h4 className="text-[12px] font-bold text-blue-800 uppercase tracking-widest mb-2">The Goal</h4>
              <p className="text-[13px] text-blue-900 leading-relaxed">
                You are not selling a roof. You are selling a <strong>Diagnosis</strong> (a non-invasive drone or physical inspection). Establish the gap between their reactive patching and our predictive tech.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Right Col: Interactive Simulator */}
        <div className="w-full lg:w-2/3">
          <CleanCard className="h-full min-h-[500px] flex flex-col">
            
            {/* Opener */}
            <div className="p-6 md:p-8 border-b border-stone-100 bg-stone-50/50">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-stone-200 text-stone-600 mb-4">
                <PhoneCall size={12} /> The Ping (Opener)
              </span>
              <p className="text-[18px] md:text-[22px] font-medium text-stone-800 leading-snug">
                {activePersona.opener}
              </p>
            </div>

            {/* Interactive Flow */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
              <div className="max-w-xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500" key={currentNode.id}>
                
                <h4 className="text-[13px] font-bold text-stone-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Shield size={14} className="text-stone-400" />
                  {currentNode.label}
                </h4>

                <div className="space-y-3">
                  {currentNode.choices.map((choice, idx) => (
                    <button
                      key={idx}
                      onClick={() => choice.next && setCurrentNodeId(choice.next)}
                      disabled={!choice.next}
                      className={`w-full group relative text-left p-4 rounded-xl border transition-all ${
                        choice.next 
                          ? 'border-stone-200 hover:border-stone-400 bg-white hover:shadow-md' 
                          : 'border-emerald-200 bg-emerald-50 cursor-default'
                      }`}
                    >
                      <p className={`text-[14px] font-semibold leading-relaxed pr-8 ${choice.next ? 'text-stone-800' : 'text-emerald-900'}`}>
                        {choice.text}
                      </p>
                      
                      {choice.coaching && (
                        <p className={`text-[12px] mt-2 ${choice.next ? 'text-stone-500' : 'text-emerald-700'}`}>
                          <span className="font-semibold uppercase tracking-wider text-[10px] opacity-70 mr-2">Coach:</span>
                          {choice.coaching}
                        </p>
                      )}

                      {choice.next ? (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight size={12} className="text-stone-600" />
                        </div>
                      ) : (
                        <div className="absolute right-4 top-4">
                          <CheckCircle2 size={18} className="text-emerald-500" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {currentNodeId !== 'start' && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={() => setCurrentNodeId('start')}
                      className="inline-flex items-center gap-2 px-4 py-2 text-[12px] font-semibold text-stone-500 hover:text-stone-800 transition-colors"
                    >
                      <RotateCcw size={14} /> Start Over
                    </button>
                  </div>
                )}
              </div>
            </div>
            
          </CleanCard>
        </div>
      </div>
    </CleanPage>
  );
}
