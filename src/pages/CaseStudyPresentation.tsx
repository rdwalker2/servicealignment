import { ArrowRight, Presentation, CheckCircle2, LayoutGrid, Target, Zap, ShieldCheck, CalendarCheck, BookOpen, PhoneCall, ClipboardCheck, Mail, Swords, Activity, Search, TrendingUp } from 'lucide-react';
import { CleanPage, CleanPageHeader, Reveal } from '../components/ui/CleanUI';

interface CaseStudyPresentationProps {
    setActiveTab: (tab: string) => void;
}

const platformSurfaces = [
    { icon: Target, label: 'Target Account Universe', desc: 'Signal-ranked ICP accounts with hiring velocity & tech stack intent scoring', tab: 'targeting' },
    { icon: Zap, label: 'Autonomous Sourcing Engine', desc: 'Verified contact drops & one-click cadence enrollment', tab: 'sourcing' },
    { icon: Search, label: 'Discovery Hub', desc: 'Structured call frameworks with the 3-Wave discovery methodology', tab: 'discovery' },
    { icon: ShieldCheck, label: 'Opportunity Overview', desc: 'Halftime Review coaching, Validated Forecast & Risk Radar', tab: 'pipeline' },
    { icon: Activity, label: 'Strategic Sales Plan', desc: 'Reverse funnel math, pipeline cascade planner & weekly tracker', tab: 'ssp' },
    { icon: CalendarCheck, label: 'Operating Rhythm', desc: 'Daily operating rhythm, SLAs & the 10-and-10 execution standard', tab: 'perfectWeek' },
    { icon: BookOpen, label: 'The Sales Playbook', desc: 'Full methodology framework, Buyer\'s Action Plan & call scripts', tab: 'playbook' },
    { icon: PhoneCall, label: 'Setting the Meeting', desc: 'Objection handling, voicemail scripts & gatekeeper navigation', tab: 'settingMeeting' },
    { icon: ClipboardCheck, label: 'Discovery Call Sheets', desc: 'Pre-call research templates & structured qualification guides', tab: 'discoverySheets' },
    { icon: Mail, label: 'Outreach Cadence', desc: 'Multi-touch sequence builder with email, call & social touchpoints', tab: 'outreach' },
    { icon: Swords, label: 'Battlecards', desc: 'Competitive positioning against Greenhouse, Lever, Workday & iCIMS', tab: 'battlecards' },
];

export function CaseStudyPresentation({ setActiveTab }: CaseStudyPresentationProps) {
    return (
        <CleanPage className="pb-32">
            <Reveal>
                <CleanPageHeader 
                    variant="hero"
                    title="Executive Overview"
                    subtitle="A functional, interactive prototype demonstrating how we systemize success, eliminate guesswork, and guarantee revenue targets are met next quarter."
                    icon={<div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center mx-auto mb-2 shadow-sm"><Presentation className="w-6 h-6" /></div>}
                />
            </Reveal>

            <div className="max-w-3xl mx-auto mt-12 space-y-16">
                
                {/* The Mandate */}
                <Reveal delay={0.1}>
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-stone-900 border-b border-stone-200/60 pb-2">1. The Mandate</h2>
                        <div className="text-stone-600 leading-relaxed space-y-4">
                            <p className="text-lg">
                                The direct team is missing revenue targets. Sales reps have identified three core bottlenecks stopping them from hitting quota:
                            </p>
                            <ul className="space-y-3 mt-4">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-stone-700 mt-0.5 shrink-0" />
                                    <span>AEs are spending too much time on lead generation. <strong className="text-stone-900">&quot;Goal: Reduce this time by 2/3.&quot;</strong></span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-stone-700 mt-0.5 shrink-0" />
                                    <span>AEs can sell to any company that hires, causing <strong className="text-stone-900">paralysis by analysis</strong> over who to approach.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-stone-700 mt-0.5 shrink-0" />
                                    <span>Forecasting lacks rigor and differs from what actually closes. <strong className="text-stone-900">&quot;Goal: Introduce rigor to the pipeline review.&quot;</strong></span>
                                </li>
                            </ul>
                            
                            <div className="mt-8 p-6 bg-stone-50 border border-stone-200/60 rounded-xl">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-700 mb-2">The Ultimate Task</p>
                                <p className="text-stone-900 font-medium italic">
                                    &quot;Ensure the team's revenue targets are met in the next quarter. Which steps/strategy would you follow to ensure targets are met?&quot;
                                </p>
                            </div>
                        </div>
                    </section>
                </Reveal>

                {/* Challenge 1: Paralysis by Analysis */}
                <Reveal delay={0.15}>
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-stone-900 border-b border-stone-200/60 pb-2">2. Solving &quot;Paralysis by Analysis&quot;</h2>
                        <div className="text-stone-600 leading-relaxed space-y-4">
                            <p>
                                When an Account Executive can sell to anyone, they often overthink who to approach. We eliminate guessing by replacing an infinite Total Addressable Market (TAM) with a mathematically prioritized <strong className="text-stone-900">Target Account Universe</strong>. 
                            </p>
                            <p>
                                Reps no longer decide who to call; the system surfaces accounts based on active hiring signals and firmographic fit, utilizing two primary indicators:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 mt-4 text-stone-700">
                                <li><strong className="text-stone-900">Hiring Velocity Score:</strong> Aggregates live job postings to identify exactly which companies are actively expanding their headcount right now.</li>
                                <li><strong className="text-stone-900">Tech Stack Intent:</strong> Automatically identifies companies using outdated Provider platforms (e.g., Workday, Greenhouse) that are ripe for displacement.</li>
                            </ul>
                            
                            <div className="pt-2">
                                <button 
                                    onClick={() => setActiveTab('targeting')}
                                    className="inline-flex items-center gap-2 text-stone-700 hover:text-stone-900 font-semibold transition-colors"
                                >
                                    View Target Account Universe <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </section>
                </Reveal>

                {/* Challenge 2: Lead Generation Time Drain */}
                <Reveal delay={0.2}>
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-stone-900 border-b border-stone-200/60 pb-2">3. Eradicating the Lead Gen Time Drain</h2>
                        <div className="text-stone-600 leading-relaxed space-y-4">
                            <p>
                                The prompt dictates reducing lead generation time by 2/3. Reps shouldn't be hunting for email addresses on LinkedIn or jumping between 5 different browser tabs.
                            </p>
                            <p>
                                By integrating an <strong className="text-stone-900">Autonomous Sourcing Engine</strong> directly into the Command Center, we allow reps to act on verified data immediately:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 mt-4 text-stone-700">
                                <li><strong className="text-stone-900">Verified Data Drops:</strong> The system automatically surfaces the VP of HR / Talent Acquisition with verified, bounce-free contact info.</li>
                                <li><strong className="text-stone-900">One-Click Cadence:</strong> Instead of copy-pasting, reps click &quot;Enroll in Sequence&quot; and immediately move to the next account, achieving massive efficiency gains.</li>
                            </ul>

                            <div className="pt-2">
                                <button 
                                    onClick={() => setActiveTab('sourcing')}
                                    className="inline-flex items-center gap-2 text-stone-700 hover:text-stone-900 font-semibold transition-colors"
                                >
                                    Explore the Sourcing Engine <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </section>
                </Reveal>

                {/* Challenge 3: Lack of Forecasting Rigor */}
                <Reveal delay={0.25}>
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-stone-900 border-b border-stone-200/60 pb-2">4. Introducing Rigor to the Pipeline</h2>
                        <div className="text-stone-600 leading-relaxed space-y-4">
                            <p>
                                Forecasting is often flawed because reps operate with &quot;Happy Ears,&quot; projecting deals that aren't actually qualified. We attack this from two angles:
                            </p>
                            
                            <div className="mt-4 p-5 bg-stone-50 border border-stone-200/60 rounded-xl space-y-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-700">Angle 1: Qualification Methodology</p>
                                <p className="text-stone-700 text-sm">
                                    We hardcode methodology directly into the software via the <strong className="text-stone-900">Buyer&apos;s Action Plan</strong>. Deals cannot progress unless the rep explicitly validates urgency, need, and decision-maker access through a strict 3-Checkpoint system:
                                </p>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-stone-700">
                                    <li><strong className="text-stone-900">Checkpoint 1: Real Urgency:</strong> Is there a quantified pain forcing them to act now?</li>
                                    <li><strong className="text-stone-900">Checkpoint 2: Outside Help:</strong> Do they acknowledge they can&apos;t fix this internally?</li>
                                    <li><strong className="text-stone-900">Checkpoint 3: The Best Solution:</strong> Have we mapped our solution to their exact buying criteria?</li>
                                </ul>
                            </div>

                            <div className="mt-2 p-5 bg-stone-50 border border-stone-200/60 rounded-xl space-y-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-700">Angle 2: Manager Coaching Cadence</p>
                                <p className="text-stone-700 text-sm">
                                    The <strong className="text-stone-900">Opportunity Overview</strong> replaces subjective pipeline reviews with a data-driven coaching surface. Managers use the <strong className="text-stone-900">Halftime Review</strong> to diagnose at-risk deals through a structured interview protocol, and the <strong className="text-stone-900">Validated Forecast</strong> automatically penalizes deals that are missing critical checkpoints — eliminating &quot;happy ears&quot; from the commit number.
                                </p>
                            </div>

                            <div className="flex gap-4 pt-2 flex-wrap">
                                <button 
                                    onClick={() => setActiveTab('actionPlan')}
                                    className="inline-flex items-center gap-2 text-stone-700 hover:text-stone-900 font-semibold transition-colors"
                                >
                                    Review the Buyer&apos;s Action Plan <ArrowRight className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => setActiveTab('pipeline')}
                                    className="inline-flex items-center gap-2 text-stone-700 hover:text-stone-900 font-semibold transition-colors"
                                >
                                    Explore Opportunity Overview <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </section>
                </Reveal>

                {/* NEW: Discovery & Enablement */}
                <Reveal delay={0.28}>
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-stone-900 border-b border-stone-200/60 pb-2">5. Arming the Team (Discovery &amp; Enablement)</h2>
                        <div className="text-stone-600 leading-relaxed space-y-4">
                            <p>
                                Knowing <em>who</em> to call and <em>when</em> to call them is only half the battle. Reps also need to know <em>what to say</em> and <em>how to run the deal</em>. We&apos;ve built a complete enablement stack that eliminates ramp time and enforces best practices across every customer interaction:
                            </p>
                            
                            <ul className="space-y-3 mt-4">
                                <li className="flex items-start gap-3">
                                    <Search className="w-5 h-5 text-stone-700 mt-0.5 shrink-0" />
                                    <span><strong className="text-stone-900">Discovery Hub:</strong> Structured call frameworks using the 3-Wave Discovery methodology — reps follow a guided script that uncovers real pain, challenges assumptions, and quantifies the cost of indecision, turning &quot;no need&quot; into urgency.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <PhoneCall className="w-5 h-5 text-stone-700 mt-0.5 shrink-0" />
                                    <span><strong className="text-stone-900">Setting the Meeting:</strong> Objection handling frameworks, voicemail scripts, and gatekeeper navigation techniques that increase connect rates. This directly supports the 2/3 time reduction mandate by making every dial count.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-stone-700 mt-0.5 shrink-0" />
                                    <span><strong className="text-stone-900">Outreach Cadence:</strong> Pre-built multi-touch sequences (email, call, LinkedIn) with tested messaging templates. Reps don&apos;t write emails from scratch; they execute a proven sequence.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Swords className="w-5 h-5 text-stone-700 mt-0.5 shrink-0" />
                                    <span><strong className="text-stone-900">Battlecards:</strong> Head-to-head competitive positioning against Greenhouse, Lever, Workday, and iCIMS, featuring specific &quot;trap&quot; questions reps can ask to expose competitor weaknesses.</span>
                                </li>
                            </ul>

                            <div className="flex gap-4 pt-2 flex-wrap">
                                <button 
                                    onClick={() => setActiveTab('discovery')}
                                    className="inline-flex items-center gap-2 text-stone-700 hover:text-stone-900 font-semibold transition-colors"
                                >
                                    Explore Discovery Hub <ArrowRight className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => setActiveTab('playbook')}
                                    className="inline-flex items-center gap-2 text-stone-700 hover:text-stone-900 font-semibold transition-colors"
                                >
                                    View Sales Playbook <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </section>
                </Reveal>

                {/* The Execution Plan */}
                <Reveal delay={0.3}>
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-stone-900 border-b border-stone-200/60 pb-2">6. The Execution Plan (Guaranteeing the Number)</h2>
                        <div className="text-stone-600 leading-relaxed space-y-4">
                            <p>
                                Hope is not a strategy. We ensure targets are met by working backwards from the revenue goal using a mathematical cascade within the <strong className="text-stone-900">Strategic Sales Plan (SSP)</strong>.
                            </p>
                            <p>
                                If a rep needs to close $100k, the SSP tells them exactly how many dials they need to make <em>today</em> based on their historical conversion rates. This creates unarguable manager accountability and turns subjective feelings into objective numbers.
                            </p>
                            <p>
                                The <strong className="text-stone-900">Operating Rhythm</strong> then translates these numbers into a daily operating rhythm — time-blocked calendar templates and non-negotiable SLAs that ensure reps are prospecting, discovering, and closing in the right ratios every single week. No more &quot;I was busy but nothing moved.&quot;
                            </p>

                            <div className="flex gap-4 pt-2 flex-wrap">
                                <button 
                                    onClick={() => setActiveTab('ssp')}
                                    className="inline-flex items-center gap-2 text-stone-700 hover:text-stone-900 font-semibold transition-colors"
                                >
                                    View Strategic Sales Plan <ArrowRight className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => setActiveTab('perfectWeek')}
                                    className="inline-flex items-center gap-2 text-stone-700 hover:text-stone-900 font-semibold transition-colors"
                                >
                                    View Operating Rhythm <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </section>
                </Reveal>

                {/* Platform Map */}
                <Reveal delay={0.35}>
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-stone-900 border-b border-stone-200/60 pb-2">
                            <span className="flex items-center gap-3"><LayoutGrid className="w-6 h-6 text-stone-700" /> 7. The Full Case Study — 10 Interactive Surfaces</span>
                        </h2>
                        <p className="text-stone-600">
                            Every surface below is fully functional and interactive. Click any tile to explore.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                            {platformSurfaces.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveTab(s.tab)}
                                    className="group text-left p-4 rounded-xl border border-stone-200/60 bg-white hover:border-stone-400 hover:bg-stone-50 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center shrink-0 mt-0.5">
                                            <s.icon className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-stone-900 group-hover:text-stone-700 transition-colors">{s.label}</p>
                                            <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{s.desc}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>
                </Reveal>

                {/* Why This Works / Closing */}
                <Reveal delay={0.4}>
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-stone-900 border-b border-stone-200/60 pb-2">
                            <span className="flex items-center gap-3"><TrendingUp className="w-6 h-6 text-stone-700" /> 8. Why This Guarantees the Number</span>
                        </h2>
                        <div className="text-stone-600 leading-relaxed space-y-4">
                            <p>
                                Most sales teams fail not because of a single issue, but because bottlenecks compound. A rep who doesn&apos;t know who to call wastes time researching. A rep who gets a meeting but can&apos;t run discovery loses the deal at proposal. A manager who can&apos;t see the real pipeline forecasts incorrectly and misallocates resources.
                            </p>
                            <p>
                                This platform eliminates every link in that chain:
                            </p>

                            <div className="mt-4 space-y-3">
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-stone-100/80 to-transparent border border-stone-200/60">
                                    <span className="text-lg font-black text-stone-900 shrink-0 w-6">1</span>
                                    <p className="text-sm text-stone-700"><strong className="text-stone-900">Signal → Target:</strong> Hiring velocity and tech stack data eliminate the infinite TAM and give reps a ranked, finite list of accounts to pursue.</p>
                                </div>
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-stone-100/80 to-transparent border border-stone-200/60">
                                    <span className="text-lg font-black text-stone-900 shrink-0 w-6">2</span>
                                    <p className="text-sm text-stone-700"><strong className="text-stone-900">Target → Meeting:</strong> Verified contacts + pre-built cadences + objection-handling playbooks reduce lead gen time by 2/3 and increase connect rates.</p>
                                </div>
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-stone-100/80 to-transparent border border-stone-200/60">
                                    <span className="text-lg font-black text-stone-900 shrink-0 w-6">3</span>
                                    <p className="text-sm text-stone-700"><strong className="text-stone-900">Meeting → Qualified Opp:</strong> Structured discovery frameworks and the Buyer&apos;s Action Plan ensure only real deals enter the pipeline. No more &quot;happy ears.&quot;</p>
                                </div>
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-stone-100/80 to-transparent border border-stone-200/60">
                                    <span className="text-lg font-black text-stone-900 shrink-0 w-6">4</span>
                                    <p className="text-sm text-stone-700"><strong className="text-stone-900">Qualified Opp → Closed Won:</strong> Battlecards, competitive positioning, and structured closing methodology protect win rates against displacement.</p>
                                </div>
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-stone-100/80 to-transparent border border-stone-200/60">
                                    <span className="text-lg font-black text-stone-900 shrink-0 w-6">5</span>
                                    <p className="text-sm text-stone-700"><strong className="text-stone-900">Closed Won → Repeated:</strong> The SSP + Operating Rhythm creates a daily execution cadence that sustains performance for 90 days, not just one good week.</p>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-stone-100 border border-stone-200/60 rounded-xl">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-700 mb-3">The Bottom Line</p>
                                <p className="text-stone-900 font-medium text-lg leading-relaxed">
                                    We don&apos;t hope the team hits target. We engineer the exact number of conversations, meetings, and proposals required — then give them every tool to convert at each stage. The math either works or it tells us exactly where to intervene.
                                </p>
                            </div>
                        </div>
                    </section>
                </Reveal>

            </div>
        </CleanPage>
    );
}
