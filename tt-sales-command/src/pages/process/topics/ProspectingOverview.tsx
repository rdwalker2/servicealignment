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
        <p>Here's what the Teamtailor prospecting funnel looks like with realistic conversion rates at each stage:</p>
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
        <p>Not every prospect is ready right now. These trigger events signal that a company is primed for a Teamtailor conversation:</p>
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
            <h4 className="font-bold text-stone-900 text-[14px]">🔧 Currently using HRIS ATS module (BambooHR, ADP, Paycom)</h4>
            <p className="text-[13px] text-stone-500 mt-1">Signal: Ready to graduate from a payroll tool to a purpose-built recruiting platform. Ask: "How's the recruiting module working for you — are hiring managers actually using it?"</p>
          </div>
          <div className="border-l-4 border-[#FF2A7F] pl-4 py-2 bg-[#FF2A7F]/5 rounded-r-lg">
            <h4 className="font-bold text-stone-900 text-[14px]">💸 Agency spend spiking in LinkedIn job postings</h4>
            <p className="text-[13px] text-stone-500 mt-1">Signal: They're paying agencies 15-25% per hire because their internal process can't keep up. Ask: "What percentage of your hires are coming through agencies vs. direct?"</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="The Value-Add Meeting Offer: Hiring Stack Audit">
        <p>Don't ask for a "demo." Don't ask for "15 minutes to tell you about Teamtailor." Offer something they actually want:</p>
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
            <li>• <strong>Tech Stack Assessment:</strong> Current tools vs. purpose-built ATS capabilities (AI screening, collaborative hiring, analytics)</li>
            <li>• <strong>Competitive Benchmark:</strong> How they compare to peers — TT processes 6M+ applications, AI-screens 16M+ candidates, achieves 5.4x hire rate</li>
          </ul>
        </div>
      </DocSection>
    </div>
  );
}
