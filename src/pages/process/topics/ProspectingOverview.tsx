import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function ProspectingOverview() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader
        stage="PROSPECTING"
        title="The Three Waves Strategy"
        subtitle="A layered questioning framework that anticipates objections and systematically opens the door to a qualified meeting."
      />

      <DocSection title="The Core Rule">
        <Callout type="rule" title="No Problem or Goal = No Meeting">
          A solution is not needed if there's no problem. A solution is not needed if there's no goal they want to achieve. And if a solution is not needed, then a quote's not needed. Every meeting must be predicated on a real problem or a real goal — otherwise you're setting meetings that will never convert.
        </Callout>
        <p>
          It's very easy to set a meeting and say <em>"Hey, I'd love to meet with you and tell you more about what we do."</em> That meeting will go nowhere. They'll listen to your spiel, ask for a brochure, and you'll never hear from them again. <strong>That crap doesn't work.</strong>
        </p>
        <p>
          We have to set meetings that put us in position to get a quote — meetings anchored to a real problem the prospect needs help with, or a real goal they're trying to achieve.
        </p>
      </DocSection>

      <DocSection title="The Dual Track: Problems & Goals">
        <p>
          Every wave in the Three Waves framework asks about <strong>two dimensions</strong>. These are not interchangeable — they're distinct:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="border border-rose-200 p-5 rounded-lg bg-rose-50/30">
            <h4 className="font-bold text-rose-900 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-xs font-black">P</span>
              Problems They Need Help With
            </h4>
            <p className="text-[13px] text-rose-800">
              Existing issues, pain points, things breaking, things not working as expected. The stuff that's costing them money, time, or peace of mind <em>right now</em>.
            </p>
          </div>
          <div className="border border-sky-200 p-5 rounded-lg bg-sky-50/30">
            <h4 className="font-bold text-sky-900 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 text-xs font-black">G</span>
              Goals They Need to Achieve
            </h4>
            <p className="text-[13px] text-sky-800">
              Outcomes they're trying to reach, initiatives they're working toward, benchmarks they haven't been able to hit. Where they want to go but can't get there on their own.
            </p>
          </div>
        </div>
        <Callout type="info" title="Both Dimensions, Every Wave">
          Always ask about both. Some prospects don't think they have "problems" but absolutely have "goals." Others have problems but never frame them as goals. By asking both, you double your surface area for opening a conversation.
        </Callout>
      </DocSection>

      <DocSection title="The Three Waves Overview">
        <p className="mb-4">Each wave goes one layer deeper. We already know what they're going to say — the key is having our response locked and loaded before they even answer.</p>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Wave 1 — Existing Problems & Goals</h4>
            <p className="text-[14px] text-stone-600">
              "Do you have any <strong>existing problems</strong> you need help with, or any <strong>existing goals</strong> you're trying to achieve?"
            </p>
            <p className="text-[12px] text-stone-400 mt-2">~90% will say "Nope, we're good." → Move to Wave 2</p>
          </div>
          <div className="border-l-4 border-violet-400 pl-4 py-3 bg-violet-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Wave 2 — Future Problems & Goals</h4>
            <p className="text-[14px] text-stone-600">
              "<em>Really?</em> So there aren't any <strong>future problems</strong> you're worried about, or <strong>long-term goals</strong> you're trying to achieve?"
            </p>
            <p className="text-[12px] text-stone-400 mt-2">The pause: "Uh, I'm not sure…" → 2-3 more will open up → If still no, Wave 3</p>
          </div>
          <div className="border-l-4 border-rose-400 pl-4 py-3 bg-rose-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Wave 3 — Expose the Unknown</h4>
            <p className="text-[14px] text-stone-600">
              "When was the last time you actually <strong>[checked / evaluated / looked at]</strong> [the thing]?"
            </p>
            <p className="text-[12px] text-stone-400 mt-2">The "oh crap" moment — they haven't checked. Close with a value offer.</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Why It Works: Anticipate, Don't Improvise">
        <p>
          We're sales professionals. Based on the responses that we can already predict, we know how we're gonna respond. We don't sound confused. We don't sound surprised. And we ultimately don't sound like we don't know what we're doing.
        </p>
        <Callout type="success" title="Trusted Advisor Positioning">
          People want trusted advisors — people that they know can lead them to new outcomes. When you sound surprised by their answers, it shows them you don't have the right level of authority to help them. The Three Waves removes all improvisation — every response is pre-mapped.
        </Callout>
        <div className="mt-4 p-5 bg-stone-50 rounded-lg border border-stone-200">
          <p className="text-[13px] font-bold text-stone-700 mb-3">The Anticipation Loop</p>
          <ol className="space-y-2 text-[14px]">
            <li><strong>1.</strong> We ask the question (already knowing the likely answer)</li>
            <li><strong>2.</strong> They respond (almost always a "no" on Waves 1 & 2)</li>
            <li><strong>3.</strong> We have our next question pre-loaded (no hesitation, no confusion)</li>
            <li><strong>4.</strong> They sense our confidence and authority → trust builds</li>
          </ol>
        </div>
      </DocSection>

      <DocSection title="The Conversion Funnel">
        <p>Remember — this is all about the conversion goals through our funnel. The Three Waves sits right at the bridge between reaching a point of contact and generating a qualified meeting.</p>
        <div className="flex flex-col items-center gap-2 mt-4">
          {[
            { label: '📞  400 Activities', width: 'w-full' },
            { label: '🗣️  Point of Contact Reached', width: 'w-5/6' },
            { label: '🌊  Three Waves Conversation', width: 'w-4/6', highlight: true },
            { label: '📋  Quote Generated', width: 'w-3/6' },
            { label: '🤝  Sale Closed', width: 'w-2/6' },
          ].map((step, i) => (
            <div
              key={i}
              className={`${step.width} py-3 rounded-lg text-center text-[13px] font-semibold ${
                step.highlight
                  ? 'bg-[#FF2A7F]/10 border-2 border-[#FF2A7F]/30 text-[#FF2A7F]'
                  : 'bg-stone-100 border border-stone-200 text-stone-700'
              }`}
            >
              {step.label}
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection title="TT Prospecting Funnel: Realistic Conversion Metrics">
        <p>Here's what the Service Alignment prospecting funnel looks like with realistic conversion rates at each stage:</p>
        <div className="flex flex-col items-center gap-2 mt-4">
          {[
            { label: '📞  400 Dials / Week', width: 'w-full', sub: '100%', color: 'bg-stone-100 border border-stone-200 text-stone-700' },
            { label: '🗣️  80 Connects', width: 'w-5/6', sub: '20% connect rate', color: 'bg-blue-50 border border-blue-200 text-blue-800' },
            { label: '💬  16 Conversations', width: 'w-4/6', sub: '20% engage rate', color: 'bg-violet-50 border border-violet-200 text-violet-800' },
            { label: '📅  4 Meetings Set', width: 'w-3/6', sub: '25% meeting rate', color: 'bg-[#FF2A7F]/10 border-2 border-[#FF2A7F]/30 text-[#FF2A7F]' },
            { label: '✅  2 Qualified Opps', width: 'w-2/6', sub: '50% qualification rate', color: 'bg-emerald-50 border border-emerald-200 text-emerald-800' },
            { label: '🤝  1 Close', width: 'w-1/6', sub: '50% close rate', color: 'bg-emerald-100 border-2 border-emerald-300 text-emerald-900' },
          ].map((step, i) => (
            <div
              key={i}
              className={`${step.width} py-3 rounded-lg text-center ${step.color}`}
            >
              <p className="text-[13px] font-semibold">{step.label}</p>
              <p className="text-[11px] opacity-70 mt-0.5">{step.sub}</p>
            </div>
          ))}
        </div>
        <Callout type="info" title="The Math Works Backwards">
          If you need 4 closes/month, you need 16 meetings/month, which means 64 conversations, 320 connects, and 1,600 dials. That's 400 dials/week — the activity number isn't arbitrary, it's mathematical.
        </Callout>
      </DocSection>

      <DocSection title="TT Trigger Events: When a Prospect Is Ready">
        <p>Not every prospect is ready right now. These trigger events signal that a company is primed for a Service Alignment conversation:</p>
        <div className="space-y-3 mt-4">
          <div className="border-l-4 border-[#FF2A7F] pl-4 py-2 bg-[#FF2A7F]/5 rounded-r-lg">
            <h4 className="font-bold text-stone-900 text-[14px]">🚀 Just posted 10+ jobs on Indeed/LinkedIn</h4>
            <p className="text-[13px] text-stone-500 mt-1">Signal: They're scaling. They need a system built for volume, not one-off posts. Ask: "How are you managing all those applicants across platforms?"</p>
          </div>
          <div className="border-l-4 border-[#FF2A7F] pl-4 py-2 bg-[#FF2A7F]/5 rounded-r-lg">
            <h4 className="font-bold text-stone-900 text-[14px]">👤 New VP HR / TA Manager just hired</h4>
            <p className="text-[13px] text-stone-500 mt-1">Signal: They have a mandate to professionalize recruiting. New leaders want quick wins. Ask: "What's the first thing on your plate as you get up to speed?"</p>
          </div>
          <div className="border-l-4 border-[#FF2A7F] pl-4 py-2 bg-[#FF2A7F]/5 rounded-r-lg">
            <h4 className="font-bold text-stone-900 text-[14px]">💰 Company raised funding / opened new location</h4>
            <p className="text-[13px] text-stone-500 mt-1">Signal: Growth = hiring. New offices need full teams fast. Ask: "How are you planning to staff the new [office/market]?"</p>
          </div>
          <div className="border-l-4 border-[#FF2A7F] pl-4 py-2 bg-[#FF2A7F]/5 rounded-r-lg">
            <h4 className="font-bold text-stone-900 text-[14px]">⭐ Negative Glassdoor reviews mentioning hiring process</h4>
            <p className="text-[13px] text-stone-500 mt-1">Signal: Employer brand is suffering. Candidates are talking. Ask: "Have you seen what candidates are saying about your hiring experience online?"</p>
          </div>
          <div className="border-l-4 border-[#FF2A7F] pl-4 py-2 bg-[#FF2A7F]/5 rounded-r-lg">
            <h4 className="font-bold text-stone-900 text-[14px]">🔧 Currently using HRIS Provider module (BambooHR, ADP, Paycom)</h4>
            <p className="text-[13px] text-stone-500 mt-1">Signal: Ready to graduate from a payroll tool to a purpose-built recruiting platform. Ask: "How's the recruiting module working for you — are hiring managers actually using it?"</p>
          </div>
          <div className="border-l-4 border-[#FF2A7F] pl-4 py-2 bg-[#FF2A7F]/5 rounded-r-lg">
            <h4 className="font-bold text-stone-900 text-[14px]">💸 Agency spend spiking in LinkedIn job postings</h4>
            <p className="text-[13px] text-stone-500 mt-1">Signal: They're paying agencies 15-25% per hire because their internal process can't keep up. Ask: "What percentage of your hires are coming through agencies vs. direct?"</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="The Value-Add Meeting Offer: Hiring Stack Audit">
        <p>Don't ask for a "demo." Don't ask for "15 minutes to tell you about Service Alignment." Offer something they actually want:</p>
        <ScriptBlock label="The Hiring Stack Audit Offer">
{"Here's what I'd suggest — we do a quick Hiring Stack Audit. We'll pull up your career page live, walk through your candidate flow, and benchmark you against companies your size in your industry. Takes 20 minutes, no commitment, and you'll walk away with a clear picture of where you stand. Even if we're not the right fit, you'll have actionable data. Worth a look?"}
        </ScriptBlock>
        <Callout type="success" title="Why This Works">
          You're not selling — you're offering value. The audit gives them something tangible regardless of outcome. It also gives YOU a natural bridge into discovery: once you're reviewing their career page and candidate flow live, the pains surface themselves.
        </Callout>
        <div className="mt-4 p-5 bg-stone-50 rounded-lg border border-stone-200">
          <p className="text-[13px] font-bold text-stone-700 mb-3">What You'll Cover in the Hiring Stack Audit</p>
          <ul className="space-y-2 text-[14px] text-stone-600">
            <li>• <strong>Career Page Review:</strong> Mobile experience, employer brand, application flow, conversion signals</li>
            <li>• <strong>Candidate Flow Analysis:</strong> Where applicants come from, where they drop off, time-to-hire benchmarks</li>
            <li>• <strong>Tech Stack Assessment:</strong> Current tools vs. purpose-built Provider capabilities (AI screening, collaborative hiring, analytics)</li>
            <li>• <strong>Competitive Benchmark:</strong> How they compare to peers — TT processes 6M+ applications, AI-screens 16M+ candidates, achieves 5.4x hire rate</li>
          </ul>
        </div>
      </DocSection>

      {/* --- WAVE 1 --- */}
      <DocSection title="The Dual-Track Ask">
        <p>
          Wave 1 is your foundational question. You've gotten to the point of contact — the facility manager, the HR director, the person who owns the process. Now ask about <strong>both dimensions</strong>:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="border border-rose-200 p-4 rounded-lg bg-rose-50/30">
            <h4 className="font-bold text-rose-900 mb-1 text-[14px]">🔴 Problems Track</h4>
            <p className="text-[13px] text-rose-800 italic">
              "Any existing problems you need help with?"
            </p>
          </div>
          <div className="border border-sky-200 p-4 rounded-lg bg-sky-50/30">
            <h4 className="font-bold text-sky-900 mb-1 text-[14px]">🔵 Goals Track</h4>
            <p className="text-[13px] text-sky-800 italic">
              "Any existing goals you haven't been able to achieve?"
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="The Universal Framework">
        <p>This framework works for <strong>any product or service</strong>. Adapt the subject matter but keep the dual-track structure identical:</p>

        <ScriptBlock label="Generic Framework">
{`"Do you have a couple of minutes to sit down and talk about [the asset/system/process]?
Any existing goals or problems you have?"`}
        </ScriptBlock>

        <Callout type="info" title="For Service Alignment">
          Replace [the asset/system/process] with: your hiring process, your recruiting stack, your Provider, your candidate experience, your career page. The dual-track structure (problems + goals) stays the same every time.
        </Callout>
      </DocSection>

      <DocSection title="Service Alignment-Specific Talk Track — By Persona">
        <p>Here's how Wave 1 sounds when selling Service Alignment's Provider, broken down by who you're calling:</p>

        <ScriptBlock label="Wave 1 — HR Director">
{`"Wanted to see if you're dealing with any hiring bottlenecks that are keeping you
from hitting your headcount goals — or if you have any big talent initiatives
coming up this quarter..."`}
        </ScriptBlock>

        <ScriptBlock label="Wave 1 — TA Manager">
{`"Wanted to see if your recruiting team is dealing with any bottlenecks slowing
down time-to-fill — or if you have any goals around improving your process or
candidate experience..."`}
        </ScriptBlock>

        <ScriptBlock label="Wave 1 — CEO / Founder (SMB)">
{`"Wanted to see if hiring is keeping you from growing as fast as you want to —
are there any open roles right now that are slowing your team down or holding
back a key initiative?"`}
        </ScriptBlock>

        <ScriptBlock label="Wave 1 — Ops / Office Manager">
{`"Wanted to see if you're dealing with any headaches around coordinating the
hiring process — like keeping track of candidates, getting feedback from
managers, or just keeping things organized when you're filling multiple roles..."`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="The Two Camps Framing">
        <p>
          Instead of generically asking about problems or goals, you <strong>paint a vivid picture</strong> so the prospect immediately recognizes themselves. People respond to specific, human language — not sales jargon. The Two Camps framing gives them two concrete doors to walk through, and almost everyone will self-select into one.
        </p>

        <Callout type="rule" title="Never Say 'Problems or Goals'">
          The generic ask ("any problems or goals?") gives them nothing to latch onto. Instead, describe what problems and goals actually LOOK like for people in their role. Make it visceral — name the agency spend, the CEO pressure, the spreadsheets, the 90-day open reqs. When they hear their own reality described back to them, they can't say "nope, we're good."
        </Callout>

        <ScriptBlock label="Two Camps — HR Director">
{`"When I talk to HR Directors, they usually fall into one of two camps. Either they're dealing with something that's costing them money, time, or peace of mind right now — like roles sitting open for months, agencies eating through their budget, or the CEO asking why headcount targets aren't being hit. Or they've got an outcome they're trying to reach but can't quite get there — like cutting time-to-hire in half, building a real employer brand, or getting their team off spreadsheets. Which camp are you in?"`}
        </ScriptBlock>

        <ScriptBlock label="Two Camps — TA Director">
{`"Most TA Directors I talk to are in one of two camps. Either they're drowning in something that's broken right now — like 50 open reqs, hiring managers who won't give feedback, or an Provider that creates more work than it saves. Or they've been given a mandate to level up the recruiting function — build a real pipeline, reduce agency dependency, professionalize the candidate experience. Which one resonates more with you?"`}
        </ScriptBlock>

        <ScriptBlock label="Two Camps — CEO / Founder (SMB)">
{`"When I talk to founders and CEOs, it usually boils down to one of two things. Either hiring is actively holding back growth right now — key roles are open, you're losing candidates to faster-moving companies, or you're spending $25K per agency hire. Or you've got a big growth milestone coming — new funding, new market, new locations — and you need a recruiting engine that can actually scale with you. Which one sounds closer to your situation?"`}
        </ScriptBlock>

        <ScriptBlock label="Two Camps — People Ops / Office Manager">
{`"For People Ops teams, it's usually one of two things. Either something in the current stack is creating friction right now — data isn't clean, tools don't talk to each other, the Provider is more work than it's worth. Or there's an initiative on the roadmap — consolidating vendors, building out a proper recruiting workflow, or just getting to a place where hiring doesn't eat up half your week. Where does your team sit?"`}
        </ScriptBlock>

        <p className="italic text-stone-500 text-[13px] mt-4">
          Notice the pattern: each version uses the same structure (problems costing money/time/peace of mind + goals they can't reach on their own) but with persona-specific examples pulled directly from the objectives we actually hear on calls.
        </p>
      </DocSection>

      <DocSection title="Persona × Objective Quick Reference">
        <p>
          Use this matrix as a pre-call cheat sheet. Before you dial, identify the persona and scan their typical problems and goals — then weave them into your Two Camps framing or Wave 1 ask.
        </p>

        <div className="space-y-4 mt-4">
          <div className="border-l-4 border-rose-400 pl-4 py-3 bg-rose-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">HR Director</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-1">Problems You'll Hear</p>
                <ul className="text-[13px] text-stone-600 space-y-1">
                  <li>• Time-to-fill too long (45+ days)</li>
                  <li>• Manual screening overload</li>
                  <li>• Agency spend out of control</li>
                  <li>• CEO/board pressure on headcount</li>
                  <li>• Career page is embarrassing</li>
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-bold text-sky-600 uppercase tracking-wider mb-1">Goals You'll Hear</p>
                <ul className="text-[13px] text-stone-600 space-y-1">
                  <li>• Cut TTF from 45 → 25 days</li>
                  <li>• Build employer brand</li>
                  <li>• Reduce agency dependency by 50%</li>
                  <li>• 3x recruiter capacity via AI screening</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-violet-400 pl-4 py-3 bg-violet-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">TA Director</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-1">Problems You'll Hear</p>
                <ul className="text-[13px] text-stone-600 space-y-1">
                  <li>• Drowning in open reqs</li>
                  <li>• Provider is clunky/slow</li>
                  <li>• Hiring managers won't adopt the process</li>
                  <li>• No pipeline visibility</li>
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-bold text-sky-600 uppercase tracking-wider mb-1">Goals You'll Hear</p>
                <ul className="text-[13px] text-stone-600 space-y-1">
                  <li>• Professionalize the recruiting function</li>
                  <li>• Build direct candidate pipeline</li>
                  <li>• Improve candidate experience</li>
                  <li>• Get off spreadsheets</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">CEO / Founder (SMB)</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-1">Problems You'll Hear</p>
                <ul className="text-[13px] text-stone-600 space-y-1">
                  <li>• Key roles open 90+ days</li>
                  <li>• Losing talent to competitors</li>
                  <li>• $25K+ per agency hire</li>
                  <li>• Hiring blocking revenue</li>
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-bold text-sky-600 uppercase tracking-wider mb-1">Goals You'll Hear</p>
                <ul className="text-[13px] text-stone-600 space-y-1">
                  <li>• Double headcount post-funding</li>
                  <li>• Hire 50 people in 90 days</li>
                  <li>• Scale hiring without scaling HR team</li>
                  <li>• Reduce cost-per-hire</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-emerald-400 pl-4 py-3 bg-emerald-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">People Ops / Office Manager</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-1">Problems You'll Hear</p>
                <ul className="text-[13px] text-stone-600 space-y-1">
                  <li>• HR tech stack is fragmented</li>
                  <li>• Provider admin eating hours/week</li>
                  <li>• Data quality issues</li>
                  <li>• No integration with HRIS</li>
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-bold text-sky-600 uppercase tracking-wider mb-1">Goals You'll Hear</p>
                <ul className="text-[13px] text-stone-600 space-y-1">
                  <li>• Consolidate tools</li>
                  <li>• Simplify hiring workflow</li>
                  <li>• Build reporting/analytics</li>
                  <li>• Get hiring under 5 hrs/week of their time</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection title="Expected Response">
        <div className="flex gap-3 flex-wrap">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            ⚡ ~90% will say "Nope, we're good"
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            🎯 ~5-10% will say "Actually, yeah…"
          </span>
        </div>

        <Callout type="warning" title="We Already Know They'll Say No">
          If they had a problem, they probably would've already called somebody. If they had a goal they needed help with, they'd be working on it. We're gonna get maybe 1 out of 10 or 1 out of 20 to say "yeah, actually we do." The vast majority will say "Nope, I'm good." That's fine — we expect this. We have Wave 2 ready to go.
        </Callout>
      </DocSection>

      <DocSection title="If They Bite on Wave 1">
        <Callout type="success" title="Stop the Waves — You're In">
          If someone actually says "yeah, we do have something" — stop the wave framework immediately. You've found pain or a goal. Transition into a real conversation. Ask: "Tell me more about that…" Stay curious. Don't rush to pitch.
        </Callout>
      </DocSection>

      {/* --- WAVE 2 --- */}
      <DocSection title="The Surprise Pivot">
        <p>
          They said "Nope, we're good." Most reps give up here. <strong>Not us.</strong> Now we act <em>slightly</em> surprised — not dramatically, not sarcastically — and shift the conversation from <strong>current state</strong> to <strong>future state</strong>.
        </p>
        <Callout type="warning" title="Subtle Act — Not Genuine Surprise">
          The surprise in Wave 2 is a <strong>subtle act</strong>. If you sound truly caught off guard, you lose authority and trust. You're a professional who's done this hundreds of times — you expected something different based on your experience, and you're gently expressing that. Think "curious disbelief" not "shock."
        </Callout>
      </DocSection>

      <DocSection title="The Dual-Track Shift">
        <p>Same two dimensions — problems and goals — but now we're asking about the <strong>future</strong>:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="border border-rose-200 p-4 rounded-lg bg-rose-50/30">
            <h4 className="font-bold text-rose-900 mb-1 text-[14px]">🔴 Future Problems</h4>
            <p className="text-[13px] text-rose-800 italic">
              "Any future problems you're worried about?"
            </p>
          </div>
          <div className="border border-sky-200 p-4 rounded-lg bg-sky-50/30">
            <h4 className="font-bold text-sky-900 mb-1 text-[14px]">🔵 Long-Term Goals</h4>
            <p className="text-[13px] text-sky-800 italic">
              "Any long-term goals you're trying to achieve?"
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="The Universal Framework">
        <ScriptBlock label="Generic Framework">
{`"Really? So there aren't any future problems you're worried about
with [the asset/system/process], or long-term goals you're trying
to achieve with it?"`}
        </ScriptBlock>

        <Callout type="info" title="The Key Word: 'Really?'">
          The word "Really?" is doing heavy lifting. Said with genuine curiosity, it signals that their answer surprises you based on what you see across the market. This forces them to reconsider rather than reflexively brush you off.
        </Callout>
      </DocSection>

      <DocSection title="Service Alignment-Specific Talk Track — By Persona">
        <p>Here's how Wave 2 sounds after they've brushed off your Wave 1. Each is tuned to the persona you're calling:</p>

        <ScriptBlock label="Wave 2 — Standard Provider (Any Persona)">
{`"Really? So you're not running into anything around show rates being lower
than you'd like, or hiring managers not reviewing candidates quickly enough?
Because those are the two things I hear about most from teams your size."`}
        </ScriptBlock>
        <p className="text-[12px] text-stone-500 italic">Two specific pain points → forces them to actually think about it rather than just reflexively say "we're good."</p>

        <ScriptBlock label="Wave 2 — Competitive Angle (when you know their Provider)">
{`"Interesting. So you're on [Competitor] and you're not finding the candidate
experience — like the career page or mobile apply flow — to be a bottleneck?
Most teams I work with on [Competitor] eventually hit a wall there."`}
        </ScriptBlock>
        <p className="text-[12px] text-stone-500 italic">Name the competitor if you know it. Specificity creates credibility.</p>

        <ScriptBlock label="Wave 2 — Future Risk (CEO / Growth Companies)">
{`"Got it. No concerns about scaling the hiring process as you grow, or getting
better data on where candidates are dropping off in the funnel? That's where
I usually see teams realize they need something more purpose-built."`}
        </ScriptBlock>
        <p className="text-[12px] text-stone-500 italic">"As you grow" plants the seed even if they're not growing today.</p>
      </DocSection>

      <DocSection title="Persona × Pain Probes">
        <p>
          Wave 2's power comes from naming <strong>SPECIFIC pains</strong> the prospect hasn't thought about yet. Generic "show rates" doesn't hit as hard as persona-specific probes. The more precisely you describe their world, the harder it is to dismiss you.
        </p>

        <Callout type="rule" title="Why Specificity Wins">
          When you say "show rates are lower than you'd like," they can shrug. When you say "your hiring managers aren't giving feedback within 24 hours," they picture exactly which manager you're talking about. That's the difference between a brush-off and a pause.
        </Callout>

        <ScriptBlock label="Wave 2 — HR Director (Process Pain)">
{`"Really? So candidates aren't dropping off halfway through your application? Your hiring managers are giving feedback within 24 hours? And your career page — if I pulled it up right now on my phone — it would look like a company top candidates would want to work for?"`}
        </ScriptBlock>
        <p className="text-[12px] text-stone-500 italic">Psychology: Three rapid-fire specifics create a "checklist effect." They might deflect one — but three in a row forces honest self-assessment. The career page question is especially effective because they know the answer before they say it.</p>

        <ScriptBlock label="Wave 2 — TA Director (Capacity Pain)">
{`"Interesting. So your recruiters aren't spending hours manually screening resumes that an AI could sort in seconds? You've got full visibility into where every candidate sits in the pipeline? And you're not losing any candidates because your process is slower than the company down the street?"`}
        </ScriptBlock>
        <p className="text-[12px] text-stone-500 italic">Psychology: TA Directors live in the operational weeds. Naming "hours manually screening" and "slower than the company down the street" hits their daily frustrations. The AI reference plants a seed of what's possible without them having to ask.</p>

        <ScriptBlock label="Wave 2 — CEO (Growth Pain)">
{`"Got it. So every open role is getting filled within 30 days? You're not paying agencies $20-30K per hire? And when you double headcount next year, your current process can handle that volume without breaking?"`}
        </ScriptBlock>
        <p className="text-[12px] text-stone-500 italic">Psychology: CEOs think in dollars and scale. "30 days," "$20-30K per hire," and "double headcount" are the three metrics that keep them up at night. The future-pacing ("when you double headcount next year") assumes growth they want to believe in — making it hard to dismiss.</p>

        <ScriptBlock label="Wave 2 — People Ops (Stack Pain)">
{`"Really? So your Provider integrates perfectly with your HRIS? You're not spending hours each week on admin and manual data entry? And your hiring managers actually use the system instead of going rogue with their own spreadsheets?"`}
        </ScriptBlock>
        <p className="text-[12px] text-stone-500 italic">Psychology: People Ops teams are the ones doing the duct-taping. "Going rogue with their own spreadsheets" is so universally true that it usually gets a laugh — and a laugh means they've dropped their guard. Integration pain is their #1 unspoken frustration.</p>
      </DocSection>

      <DocSection title="The Pause Is Gold">
        <p>
          This is where you start to hear them go: <em>"Um… I'm not sure."</em> That <strong>pause</strong> — that's because they're not used to getting that second wave. They're not trained on how to respond to it.
        </p>
        <div className="mt-4 p-5 bg-violet-50 rounded-lg border border-violet-200">
          <p className="text-[13px] font-bold text-violet-900 mb-3">What the Pause Means</p>
          <div className="space-y-2 text-[14px] text-violet-800">
            <p>• They already answered "no" once — now they have to think harder</p>
            <p>• Their initial response was a reflex, not a decision</p>
            <p>• They're actually considering it for the first time in the conversation</p>
            <p>• <strong>2-3 more prospects will open up here</strong> compared to Wave 1 alone</p>
          </div>
        </div>

        <Callout type="success" title="If They Open Up">
          The moment you hear hesitation or a real concern surface — stop the waves. You're now in a discovery conversation. Ask "Tell me more about that…" and stay curious. Don't rush to pitch.
        </Callout>
      </DocSection>

      <DocSection title="Cumulative Impact">
        <p>Let's say you call 20 prospects:</p>
        <div className="mt-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
          <div className="space-y-2 text-[14px]">
            <div className="flex items-center gap-3">
              <span className="w-20 text-right font-bold text-blue-600">Wave 1:</span>
              <span>~1 person bites (existing problem/goal)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-20 text-right font-bold text-violet-600">Wave 2:</span>
              <span>~2-3 more open up (future concerns/goals)</span>
            </div>
            <div className="flex items-center gap-3 border-t border-stone-200 pt-2 mt-2">
              <span className="w-20 text-right font-bold text-stone-800">Running:</span>
              <span><strong>3-4 out of 20</strong> — but we still have Wave 3 for the rest</span>
            </div>
          </div>
        </div>
      </DocSection>

      {/* --- WAVE 3 --- */}
      <DocSection title="The Power Question">
        <p>
          They said no to existing problems and goals. They said no to future problems and goals. Most reps would give up here. <strong>But we have Wave 3.</strong>
        </p>
        <p>
          Wave 3 doesn't ask about problems or goals at all. It asks a question that <strong>reveals whether they have enough information</strong> to hold the positions they just took.
        </p>

        <ScriptBlock label="Generic Framework">
{`"Oh ok... when was the last time you actually
[checked / evaluated / looked at] [the thing]?"`}
        </ScriptBlock>

        <Callout type="rule" title="The 'Oh Crap' Moment">
          Most of the time, they have NOT checked in a while. They have no idea what's actually going on. And we just exposed all of it. That moment of realization — "oh crap, it's been a while" — is your opening.
        </Callout>
      </DocSection>

      <DocSection title="Service Alignment Wave 3 Arsenal">
        <p>Each Wave 3 question follows the same formula: <strong>Authority reference → "When was the last time…" → Oh crap moment → Value close.</strong> Pick the one that fits the persona and conversation.</p>

        <div className="space-y-6 mt-4">

          {/* 1 - Candidate Experience Audit */}
          <div className="rounded-xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Wave 3 — #1</span>
                <p className="text-[14px] font-bold text-stone-800 mt-0.5">The Candidate Experience Audit</p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded bg-stone-100 text-stone-500 font-semibold">Any persona</span>
            </div>
            <div className="p-5 space-y-3">
              <ScriptBlock label="The Question">
{`"Out of curiosity — when was the last time you actually walked through
your own application process as a candidate, from the job post to the
confirmation email?"`}
              </ScriptBlock>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-[12px] font-bold text-amber-800">📊 The Stat That Makes It Land</p>
                <p className="text-[12px] text-amber-700 mt-1">60% of candidates abandon applications due to length or complexity. If your process takes more than 15 minutes, completion drops to 3.6%. <span className="text-amber-500">(AIHR / Appcast, 2024)</span></p>
              </div>
              <p className="text-[12px] text-stone-500 italic">They've never done it. The answer is always "not recently" or "never." That's your opening.</p>
            </div>
          </div>

          {/* 2 - SHRM Tech Stack Evaluation */}
          <div className="rounded-xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Wave 3 — #2</span>
                <p className="text-[14px] font-bold text-stone-800 mt-0.5">The SHRM Tech Evaluation</p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded bg-stone-100 text-stone-500 font-semibold">HR Director / TA Manager</span>
            </div>
            <div className="p-5 space-y-3">
              <ScriptBlock label="The Question">
{`"SHRM actually recommends continuous auditing of your talent tech stack
— not just reviewing it when a contract comes up. When was the last time
you actually benchmarked what's out there against what you're using?"`}
              </ScriptBlock>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-[12px] font-bold text-amber-800">📊 The Stat That Makes It Land</p>
                <p className="text-[12px] text-amber-700 mt-1">Only 3% of organizations use their Provider to its full extent. 1 in 4 are actively looking to replace theirs. <span className="text-amber-500">(Aptitude Research, 2025)</span></p>
              </div>
              <p className="text-[12px] text-stone-500 italic">SHRM as the authority makes this feel like industry best practice, not a sales pitch. They can't argue with SHRM.</p>
            </div>
          </div>

          {/* 3 - Mobile Career Site */}
          <div className="rounded-xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Wave 3 — #3</span>
                <p className="text-[14px] font-bold text-stone-800 mt-0.5">The Mobile Career Site Test</p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded bg-stone-100 text-stone-500 font-semibold">Any persona</span>
            </div>
            <div className="p-5 space-y-3">
              <ScriptBlock label="The Question">
{`"Quick question — when was the last time you pulled up your career page
on your phone and actually tried to apply to one of your own roles?"`}
              </ScriptBlock>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-[12px] font-bold text-amber-800">📊 The Stat That Makes It Land</p>
                <p className="text-[12px] text-amber-700 mt-1">67% of job applications are now submitted via mobile — but mobile applicants complete 53% fewer applications than desktop. Mobile-incompatible forms see 2x the drop-off. <span className="text-amber-500">(ATSonDemand / Industry Research, 2024)</span></p>
              </div>
              <p className="text-[12px] text-stone-500 italic">If they have, their site probably looked terrible. If they haven't — that's the point. Either way, you win.</p>
            </div>
          </div>

          {/* 4 - Application Drop-Off */}
          <div className="rounded-xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Wave 3 — #4</span>
                <p className="text-[14px] font-bold text-stone-800 mt-0.5">The Application Drop-Off Reveal</p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded bg-stone-100 text-stone-500 font-semibold">TA Manager / Ops</span>
            </div>
            <div className="p-5 space-y-3">
              <ScriptBlock label="The Question">
{`"Do you know what percentage of candidates actually start your
application but never finish it? Most teams I work with have no
idea — and the number is usually pretty eye-opening."`}
              </ScriptBlock>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-[12px] font-bold text-amber-800">📊 The Stat That Makes It Land</p>
                <p className="text-[12px] text-amber-700 mt-1">Average application completion rate is only 10.6%. For white-collar roles, it's 10-20%. Applications with 50+ screening questions drop to 5.7%. <span className="text-amber-500">(AIHR, 2024)</span></p>
              </div>
              <p className="text-[12px] text-stone-500 italic">They don't know this number. When you tell them the industry average, they realize they're probably losing most of their pipeline before it even starts.</p>
            </div>
          </div>

          {/* 5 - Source of Hire ROI */}
          <div className="rounded-xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Wave 3 — #5</span>
                <p className="text-[14px] font-bold text-stone-800 mt-0.5">The Job Board ROI Question</p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded bg-stone-100 text-stone-500 font-semibold">TA Manager / CEO</span>
            </div>
            <div className="p-5 space-y-3">
              <ScriptBlock label="The Question">
{`"When was the last time you looked at which of your sourcing channels
are actually producing hires — not just applications, but actual
hires? There's usually a massive gap between the two."`}
              </ScriptBlock>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-[12px] font-bold text-amber-800">📊 The Stat That Makes It Land</p>
                <p className="text-[12px] text-amber-700 mt-1">Job boards generate 49-61% of applications but only 25-42% of hires. Career site applicants are 4x more likely to be hired. Referrals are 10x more likely to be hired. <span className="text-amber-500">(Gem / StaffingHub, 2024)</span></p>
              </div>
              <p className="text-[12px] text-stone-500 italic">They're probably spending thousands on job boards that produce volume but not quality. This question exposes the waste.</p>
            </div>
          </div>

          {/* 6 - Cost-Per-Hire */}
          <div className="rounded-xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Wave 3 — #6</span>
                <p className="text-[14px] font-bold text-stone-800 mt-0.5">The Hidden Cost-Per-Hire</p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded bg-stone-100 text-stone-500 font-semibold">CEO / HR Director</span>
            </div>
            <div className="p-5 space-y-3">
              <ScriptBlock label="The Question">
{`"Do you know your actual cost-per-hire right now? SHRM's latest
benchmark shows the average is $5,475 — up from $4,700 just two
years ago. Most teams I talk to haven't calculated it recently."`}
              </ScriptBlock>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-[12px] font-bold text-amber-800">📊 The Stat That Makes It Land</p>
                <p className="text-[12px] text-amber-700 mt-1">Average cost-per-hire: $5,475 (non-executive), $35,879 (executive). LinkedIn found a strong employer brand reduces cost-per-hire by up to 50%. <span className="text-amber-500">(SHRM Benchmarking, 2025 / LinkedIn)</span></p>
              </div>
              <p className="text-[12px] text-stone-500 italic">Nobody tracks the full number. When you give them SHRM's number, they either don't know theirs (exposed) or realize theirs is higher (pain).</p>
            </div>
          </div>

          {/* 7 - Candidate Resentment */}
          <div className="rounded-xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Wave 3 — #7</span>
                <p className="text-[14px] font-bold text-stone-800 mt-0.5">The Candidate Ghost-Back</p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded bg-stone-100 text-stone-500 font-semibold">HR Director / TA Manager</span>
            </div>
            <div className="p-5 space-y-3">
              <ScriptBlock label="The Question">
{`"When was the last time you checked how quickly candidates hear back
after they apply? The Talent Board found that 75% of applicants
never hear back at all — and 72% share that experience publicly.
When's the last time you audited your response times?"`}
              </ScriptBlock>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-[12px] font-bold text-amber-800">📊 The Stat That Makes It Land</p>
                <p className="text-[12px] text-amber-700 mt-1">75% of applicants never hear back. 72% share negative experiences online. 50-64% of candidates would stop buying from a company after poor candidate experience. <span className="text-amber-500">(Talent Board / HCI, 2024)</span></p>
              </div>
              <p className="text-[12px] text-stone-500 italic">This one hits hard because it connects recruiting failure to BRAND damage — something leadership cares about.</p>
            </div>
          </div>

          {/* 8 - Employer Brand / Glassdoor */}
          <div className="rounded-xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Wave 3 — #8</span>
                <p className="text-[14px] font-bold text-stone-800 mt-0.5">The Employer Brand Blind Spot</p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded bg-stone-100 text-stone-500 font-semibold">CEO / HR Director</span>
            </div>
            <div className="p-5 space-y-3">
              <ScriptBlock label="The Question">
{`"When was the last time you actually Googled your company from a
candidate's perspective — checked your Glassdoor, your career page,
what comes up? 88% of candidates research you before they even
consider applying."`}
              </ScriptBlock>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-[12px] font-bold text-amber-800">📊 The Stat That Makes It Land</p>
                <p className="text-[12px] text-amber-700 mt-1">88% of job seekers research company reviews before applying. 50% would refuse a job at a bad-reputation company even for higher pay. Gen Z spends 4.2 hours researching an employer before applying. <span className="text-amber-500">(Glassdoor, 2024)</span></p>
              </div>
              <p className="text-[12px] text-stone-500 italic">CEOs especially have no idea what candidates see when they search the company. This creates instant curiosity.</p>
            </div>
          </div>

          {/* 9 - AI Compliance */}
          <div className="rounded-xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Wave 3 — #9</span>
                <p className="text-[14px] font-bold text-stone-800 mt-0.5">The AI Compliance Wake-Up Call</p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded bg-stone-100 text-stone-500 font-semibold">HR Director / Legal-aware</span>
            </div>
            <div className="p-5 space-y-3">
              <ScriptBlock label="The Question">
{`"With the new AI hiring regulations — NYC already requires annual
bias audits of AI hiring tools, and the EU AI Act kicks in August
2026 — when was the last time you looked at whether your current
system is compliant?"`}
              </ScriptBlock>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-[12px] font-bold text-amber-800">📊 The Stat That Makes It Land</p>
                <p className="text-[12px] text-amber-700 mt-1">NYC Local Law 144 requires annual independent bias audits of AI hiring tools. EU AI Act classifies employment AI as "high-risk" (effective Aug 2026). EEOC has identified AI as a strategic enforcement priority. <span className="text-amber-500">(NYC.gov / EU AI Act / EEOC, 2024-2026)</span></p>
              </div>
              <p className="text-[12px] text-stone-500 italic">Compliance = fear. Nobody wants to be the company that gets caught. Use sparingly but it's devastating with HR Directors who think about risk.</p>
            </div>
          </div>

          {/* 10 - Provider Utilization */}
          <div className="rounded-xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Wave 3 — #10</span>
                <p className="text-[14px] font-bold text-stone-800 mt-0.5">The "Are You Getting What You Pay For?"</p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded bg-stone-100 text-stone-500 font-semibold">Any persona with an Provider</span>
            </div>
            <div className="p-5 space-y-3">
              <ScriptBlock label="The Question">
{`"Here's something interesting — Aptitude Research found that only 3%
of companies use their Provider to its full extent, and 82% report
significant functionality gaps. When was the last time you looked at
what features you're actually using vs what you're paying for?"`}
              </ScriptBlock>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-[12px] font-bold text-amber-800">📊 The Stat That Makes It Land</p>
                <p className="text-[12px] text-amber-700 mt-1">Only 3% utilize Provider fully. 82% report significant functionality gaps. Only 28% express satisfaction with their current Provider. 1 in 4 are actively looking to replace. <span className="text-amber-500">(Aptitude Research, 2025)</span></p>
              </div>
              <p className="text-[12px] text-stone-500 italic">This works especially well when they say "we already have an Provider." Great — are you getting what you're paying for?</p>
            </div>
          </div>

          {/* 11 - HRIS Displacement Test */}
          <div className="rounded-xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Wave 3 — #11</span>
                <p className="text-[14px] font-bold text-stone-800 mt-0.5">The HRIS Displacement Test</p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded bg-stone-100 text-stone-500 font-semibold">HRIS users (Rippling, Dayforce, ADP)</span>
            </div>
            <div className="p-5 space-y-3">
              <ScriptBlock label="The Question">
{`"When was the last time you actually compared what [Rippling/Dayforce]'s recruiting module can do versus a purpose-built Provider? Not what they told you during the sales process — but what your team actually uses day-to-day?"`}
              </ScriptBlock>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-[12px] font-bold text-amber-800">📊 The Stat That Makes It Land</p>
                <p className="text-[12px] text-amber-700 mt-1">Only 3% of organizations use their Provider to its full extent. Among HRIS-bundled Provider users, that number drops even further — because the recruiting module was designed as an add-on, not the core product. <span className="text-amber-500">(Aptitude Research, 2025)</span></p>
              </div>
              <p className="text-[12px] text-stone-500 italic">This is your displacement wedge. Most HRIS users were told "we do recruiting too" during the HRIS sale and never questioned it. They've been living with a compromised Provider because they didn't know better.</p>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection title="How to Pick the Right Wave 3">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b-2 border-stone-300">
                <th className="text-left py-2 px-3 font-bold text-stone-700">If They're A…</th>
                <th className="text-left py-2 px-3 font-bold text-stone-700">Lead With</th>
                <th className="text-left py-2 px-3 font-bold text-stone-700">Why</th>
              </tr>
            </thead>
            <tbody className="text-stone-600">
              <tr className="border-b border-stone-100"><td className="py-2 px-3 font-semibold">CEO / Founder</td><td className="py-2 px-3">#1 (Candidate Experience) or #6 (Cost-Per-Hire)</td><td className="py-2 px-3">They care about money and first impressions</td></tr>
              <tr className="border-b border-stone-100"><td className="py-2 px-3 font-semibold">HR Director</td><td className="py-2 px-3">#2 (SHRM) or #7 (Candidate Ghost-Back)</td><td className="py-2 px-3">They respect industry authority and own the brand risk</td></tr>
              <tr className="border-b border-stone-100"><td className="py-2 px-3 font-semibold">TA Manager</td><td className="py-2 px-3">#4 (Drop-Off) or #5 (Source ROI)</td><td className="py-2 px-3">They live in the data — hit them with data they don't have</td></tr>
              <tr className="border-b border-stone-100"><td className="py-2 px-3 font-semibold">Ops / Office Mgr</td><td className="py-2 px-3">#3 (Mobile) or #1 (Candidate Experience)</td><td className="py-2 px-3">Practical, easy to visualize, doesn't require data knowledge</td></tr>
              <tr className="border-b border-stone-100"><td className="py-2 px-3 font-semibold">Already has Provider</td><td className="py-2 px-3">#10 (Are You Getting What You Pay For?)</td><td className="py-2 px-3">Challenges their assumption that having = using</td></tr>
              <tr><td className="py-2 px-3 font-semibold">Growth-stage / Hiring fast</td><td className="py-2 px-3">#8 (Employer Brand) or #3 (Mobile)</td><td className="py-2 px-3">Competing for talent = brand and experience matter most</td></tr>
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection title="Adaptation Examples by Prospect Type">
        <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
          <div className="space-y-2 text-[13px] text-stone-600">
            <p><strong>Using HRIS for recruiting:</strong> "When was the last time you actually evaluated whether your HRIS's recruiting module is keeping up with dedicated Provider platforms?"</p>
            <p><strong>High-turnover (hospitality/retail):</strong> "When was the last time you timed how long it takes a candidate to go from finding your job to submitting an application?"</p>
            <p><strong>Staffing agency:</strong> "When was the last time you audited how many qualified candidates you're losing because they drop off before completing the apply?"</p>
            <p><strong>Growing company:</strong> "When was the last time you looked at where your actual hires are coming from — not applications, hires?"</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="The Close: Value Offer, Not a Pitch">
        <p>
          Once they admit it's been a while, you close with a <strong>value offer</strong> — not a pitch about your company. You're offering to solve the uncertainty you just surfaced.
        </p>

        <ScriptBlock label="The Value Close — Generic">
{`"Understood. Would it be valuable if we [did X] so you know the
current state of [the thing]?"`}
        </ScriptBlock>

        <ScriptBlock label="The Value Close — Service Alignment (Benchmark)">
{`"What we typically do for teams in your situation is a quick
20-minute benchmark — we look at your career site, time-to-hire,
and candidate experience against companies your size. Worst case
you confirm everything's great. Best case you find something worth
fixing. Worth a look?"`}
        </ScriptBlock>

        <Callout type="success" title="Value Exchange, Not a Pitch">
          Notice the framing: "Would it be <em>valuable</em> for you if we…" This positions the meeting as something you're doing <em>for them</em>, not as a sales pitch. A free inspection, a benchmark report, an audit — these are value offers that make it easy to say yes.
        </Callout>
      </DocSection>

      <DocSection title="The Trusted Advisor Principle">
        <div className="bg-stone-900 text-white p-6 rounded-xl">
          <p className="text-[15px] leading-relaxed italic">
            "We should already know the answers. We're sales professionals. Based on the responses that we can already predict — how are we gonna respond? So we don't sound confused, we don't sound surprised, and we ultimately don't sound like we don't know what we're doing."
          </p>
          <p className="text-[15px] leading-relaxed italic mt-4">
            "People want trusted advisors and people that they know can lead them to new outcomes. And when you sound surprised by that stuff, it just shows them that you don't have the right level of authority to be able to do that."
          </p>
          <p className="text-[12px] text-stone-400 mt-4 uppercase tracking-widest font-bold">
            — Sales Ignition Kit, Strategy 3
          </p>
        </div>
      </DocSection>

      <DocSection title="The Complete Three Waves Flow">
        <p>Here's the entire sequence in one view:</p>
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-4 p-4 rounded-lg border border-blue-200 bg-blue-50/30">
            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-black shrink-0">1</span>
            <div>
              <p className="font-bold text-stone-800 text-[14px]">Existing Problems & Goals</p>
              <p className="text-[12px] text-stone-500 mt-1">They say no → Expected. Move to Wave 2.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg border border-violet-200 bg-violet-50/30">
            <span className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-sm font-black shrink-0">2</span>
            <div>
              <p className="font-bold text-stone-800 text-[14px]">Future Problems & Goals</p>
              <p className="text-[12px] text-stone-500 mt-1">Act surprised. The pause = thinking. 2-3 more open up. If still no → Wave 3.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg border border-rose-200 bg-rose-50/30">
            <span className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 text-sm font-black shrink-0">3</span>
            <div>
              <p className="font-bold text-stone-800 text-[14px]">Expose the Unknown</p>
              <p className="text-[12px] text-stone-500 mt-1">"When was the last time you checked?" → "Oh crap" moment → Value offer close.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg border border-emerald-200 bg-emerald-50/30">
            <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-black shrink-0">✓</span>
            <div>
              <p className="font-bold text-stone-800 text-[14px]">Close with Value Offer</p>
              <p className="text-[12px] text-stone-500 mt-1">"Would it be valuable if we…" → Meeting is set with purpose. Path to quote is clear.</p>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection title="If They Still Say No">
        <Callout type="info" title="Graceful Exit — Stay Warm">
          If they make it through all three waves and genuinely have no interest, exit gracefully. "Totally fair. Let me send you one thing — we did an analysis of the top 5 things companies like yours are missing. It's a 2-minute read. I'll include my number if anything ever comes up." Stay warm for the future.
        </Callout>
      </DocSection>

    </div>
  );
}
