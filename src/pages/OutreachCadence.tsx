import { useState } from 'react';
import { Mail, Phone, CheckCircle2, Circle, Clock, ArrowRight, Copy, Check, Globe } from 'lucide-react';
import { CleanPage, CleanCard, CleanPageHeader, Reveal } from '../components/ui/CleanUI';

interface TouchPoint {
  day: number;
  channel: 'call' | 'email' | 'linkedin' | 'break';
  action: string;
  template?: string;
  subject?: string;
}

const CADENCE: TouchPoint[] = [
  { day: 1, channel: 'call', action: 'Initial Call', template: 'Use the persona-specific "Setting the Meeting" opener. Leave a voicemail if no answer.' },
  { day: 1, channel: 'email', action: 'Introduction Email', subject: 'Quick question about your hiring process', template: 'Hi [First Name],\n\nI noticed [Company] is hiring for [X roles]; congrats on the growth.\n\nI work with [similar companies] who were dealing with [common pain: slow time-to-fill / losing candidates / manual processes]. We helped them [specific result].\n\nWould you be open to a quick 15-minute conversation to see if we can help?\n\nBest,\n[Your Name]' },
  { day: 3, channel: 'call', action: 'Follow-up Call #1', template: 'Reference the email sent on Day 1. "Hi [Name], following up on the email I sent. I wanted to see if you had a chance to look at it."' },
  { day: 4, channel: 'linkedin', action: 'LinkedIn Connection', template: 'Send a personalized connection request. Do NOT pitch in the request. Just connect.\n\n"Hi [Name], I saw we both work in the talent acquisition space. Would love to connect."' },
  { day: 7, channel: 'email', action: 'Value-Add Email', subject: 'Thought you\'d find this useful', template: 'Hi [First Name],\n\nI came across this [article / benchmark / case study] about [topic relevant to their industry] and thought of your team.\n\n[Link or insight]\n\nHappy to chat about how other [industry] companies are approaching this. No pressure at all.\n\nBest,\n[Your Name]' },
  { day: 9, channel: 'call', action: 'Follow-up Call #2', template: 'More direct: "I\'ve reached out a couple of times; I know you\'re busy. The reason I\'m persistent is that I genuinely think there\'s something here that could help with [specific pain]. Worth 10 minutes?"' },
  { day: 10, channel: 'linkedin', action: 'LinkedIn Engagement', template: 'Engage with their content by liking or commenting on a recent post. If they haven\'t posted, share a relevant article and tag them.\n\nThis keeps you visible without being pushy.' },
  { day: 12, channel: 'email', action: 'Case Study Email', subject: 'How [Similar Company] cut time-to-fill by 40%', template: 'Hi [First Name],\n\nWanted to share a quick example of how [Similar Company] solved a challenge that sounds a lot like what [Company] might be facing.\n\nThey were [specific problem]. After implementing Service Alignment, they [specific result with metrics].\n\nWould it be helpful to walk through how they did it?\n\nBest,\n[Your Name]' },
  { day: 14, channel: 'call', action: 'Follow-up Call #3', template: 'Final push before the break: "I don\'t want to be a pest, but I also don\'t want you to miss out on something that could genuinely help. One quick call — if it\'s not relevant, I\'ll stop reaching out."' },
  { day: 14, channel: 'break', action: '5-Day Cooling Period', template: 'No outreach from Day 15–19. Let the prospect breathe. The gap creates curiosity and prevents fatigue.' },
  { day: 20, channel: 'email', action: 'Final Outreach', subject: 'Should I close your file?', template: 'Hi [First Name],\n\nI\'ve reached out a few times and haven\'t heard back, so I want to be respectful of your time.\n\nIf the timing isn\'t right, I completely understand. But if hiring challenges come up in the future, I\'d love to be a resource.\n\nWould it make sense to reconnect in [timeframe]?\n\nBest,\n[Your Name]' },
  { day: 21, channel: 'call', action: 'Goodbye Call', template: '"I\'m closing out my notes on [Company]. I\'d hate for you to miss out, but I respect that the timing might not be right. If things change, I\'m a phone call away."' },
];

const channelConfig = {
  call: { icon: Phone, color: '#78716c', bg: 'bg-stone-100', label: 'Call' },
  email: { icon: Mail, color: '#0891B2', bg: 'bg-cyan-50', label: 'Email' },
  linkedin: { icon: Globe, color: '#0A66C2', bg: 'bg-blue-50', label: 'LinkedIn' },
  break: { icon: Clock, color: '#8B5CF6', bg: 'bg-purple-50', label: 'Break' },
};

export default function OutreachCadence() {
  const [completed, setCompleted] = useState<Record<number, boolean>>({});
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const toggleComplete = (idx: number) => {
    setCompleted(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const completedCount = Object.values(completed).filter(Boolean).length;
  const progress = Math.round((completedCount / CADENCE.length) * 100);

  const copyTemplate = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <CleanPage className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        <Reveal>
          <CleanPageHeader
            variant="hero"
            title="21-Day Outreach Cadence"
            subtitle="A structured multi-channel prospecting sequence designed to turn cold accounts into booked meetings. Each touchpoint has a specific purpose, channel, and ready-to-use template."
            icon={<div className="w-12 h-12 rounded-2xl bg-stone-900/10 text-stone-900 flex items-center justify-center mx-auto mb-2 shadow-sm"><Mail className="w-6 h-6" /></div>}
          />
        </Reveal>

        {/* Progress Bar */}
        <Reveal delay={0.1}>
          <CleanCard className="p-0 overflow-hidden">
            <div className="p-5 flex items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-stone-800">Cadence Progress</p>
                  <span className="text-sm font-bold text-stone-900 tabular-nums">{completedCount}/{CADENCE.length} touches</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-stone-900 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="flex gap-4 text-xs">
                {Object.entries(channelConfig).map(([key, config]) => (
                  <span key={key} className="flex items-center gap-1.5">
                    <config.icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                    <span className="text-stone-500">{config.label}</span>
                  </span>
                ))}
              </div>
            </div>
          </CleanCard>
        </Reveal>

        {/* Timeline */}
        <Reveal delay={0.15}>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[39px] top-0 bottom-0 w-px bg-stone-200" />

            <div className="space-y-2">
              {CADENCE.map((touch, idx) => {
                const config = channelConfig[touch.channel];
                const isComplete = completed[idx];
                const isExpanded = expandedIdx === idx;
                const showDayGap = idx > 0 && touch.day !== CADENCE[idx - 1].day;

                return (
                  <div key={idx}>
                    {/* Day separator */}
                    {showDayGap && (
                      <div className="flex items-center gap-3 py-2 pl-[26px]">
                        <div className="w-[28px] h-px bg-stone-200" />
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Day {touch.day}</span>
                      </div>
                    )}
                    {idx === 0 && (
                      <div className="flex items-center gap-3 py-2 pl-[26px]">
                        <div className="w-[28px] h-px bg-stone-200" />
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Day {touch.day}</span>
                      </div>
                    )}

                    <div className={`flex items-start gap-4 px-4 py-3 rounded-xl transition-all ${isExpanded ? 'bg-white shadow-sm border border-stone-200/60' : 'hover:bg-white/50'}`}>
                      {/* Completion toggle */}
                      <button onClick={() => toggleComplete(idx)} className="mt-0.5 shrink-0 z-10">
                        {isComplete ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-stone-300 hover:text-stone-400" />
                        )}
                      </button>

                      {/* Channel icon */}
                      <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0 z-10`}>
                        <config.icon className="w-4 h-4" style={{ color: config.color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <button onClick={() => setExpandedIdx(isExpanded ? null : idx)} className="w-full text-left">
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold text-sm ${isComplete ? 'text-stone-400 line-through' : 'text-stone-800'}`}>{touch.action}</p>
                            {touch.subject && <span className="text-xs text-stone-400">- "{touch.subject}"</span>}
                          </div>
                        </button>

                        {isExpanded && touch.template && (
                          <div className="mt-3 space-y-2">
                            <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 relative">
                              <pre className="text-sm text-stone-700 whitespace-pre-wrap font-sans leading-relaxed">{touch.template}</pre>
                              {(touch.channel === 'email' || touch.channel === 'linkedin') && (
                                <button
                                  onClick={() => copyTemplate(touch.template!, idx)}
                                  className="absolute top-3 right-3 text-xs font-medium px-2 py-1 rounded bg-white border border-stone-200/60 text-stone-500 hover:text-stone-800 hover:border-stone-300 transition-colors flex items-center gap-1"
                                >
                                  {copiedIdx === idx ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Channel tag */}
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${config.bg}`} style={{ color: config.color }}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* Key Principles */}
        <Reveal delay={0.2}>
          <CleanCard>
            <h3 className="font-bold text-stone-800 text-lg mb-4">Cadence Principles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Multi-Channel', desc: 'Never rely on just one channel. Alternate between calls, emails, and LinkedIn to maximize visibility.' },
                { title: 'Value First', desc: 'Every touch should provide value: an insight, a case study, a relevant data point. Never send a "just checking in" email.' },
                { title: 'Respect the Break', desc: 'The 5-day cooling period (Day 15–19) is intentional. It prevents prospect fatigue and creates natural curiosity.' },
                { title: 'Clean Exit', desc: 'The Day 20-21 goodbye creates a professional close. Many prospects respond to the breakup email because it removes pressure.' },
              ].map((p, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200/60">
                  <ArrowRight className="w-4 h-4 text-stone-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">{p.title}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CleanCard>
        </Reveal>
      </div>
    </CleanPage>
  );
}
