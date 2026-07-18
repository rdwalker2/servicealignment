import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function ThreeWavesWave3() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader
        stage="WAVE 3"
        title="Expose the Unknown"
        subtitle="They said no twice. Now expose what they don't know about their own situation. This is the power question."
      />

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

      <DocSection title="Teamtailor Wave 3 Arsenal">
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
                <p className="text-[12px] text-amber-700 mt-1">Only 3% of organizations use their ATS to its full extent. 1 in 4 are actively looking to replace theirs. <span className="text-amber-500">(Aptitude Research, 2025)</span></p>
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

          {/* 10 - ATS Utilization */}
          <div className="rounded-xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Wave 3 — #10</span>
                <p className="text-[14px] font-bold text-stone-800 mt-0.5">The "Are You Getting What You Pay For?"</p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded bg-stone-100 text-stone-500 font-semibold">Any persona with an ATS</span>
            </div>
            <div className="p-5 space-y-3">
              <ScriptBlock label="The Question">
{`"Here's something interesting — Aptitude Research found that only 3%
of companies use their ATS to its full extent, and 82% report
significant functionality gaps. When was the last time you looked at
what features you're actually using vs what you're paying for?"`}
              </ScriptBlock>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-[12px] font-bold text-amber-800">📊 The Stat That Makes It Land</p>
                <p className="text-[12px] text-amber-700 mt-1">Only 3% utilize ATS fully. 82% report significant functionality gaps. Only 28% express satisfaction with their current ATS. 1 in 4 are actively looking to replace. <span className="text-amber-500">(Aptitude Research, 2025)</span></p>
              </div>
              <p className="text-[12px] text-stone-500 italic">This works especially well when they say "we already have an ATS." Great — are you getting what you're paying for?</p>
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
              <tr className="border-b border-stone-100"><td className="py-2 px-3 font-semibold">Already has ATS</td><td className="py-2 px-3">#10 (Are You Getting What You Pay For?)</td><td className="py-2 px-3">Challenges their assumption that having = using</td></tr>
              <tr><td className="py-2 px-3 font-semibold">Growth-stage / Hiring fast</td><td className="py-2 px-3">#8 (Employer Brand) or #3 (Mobile)</td><td className="py-2 px-3">Competing for talent = brand and experience matter most</td></tr>
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection title="Adaptation Examples by Prospect Type">
        <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
          <div className="space-y-2 text-[13px] text-stone-600">
            <p><strong>Using HRIS for recruiting:</strong> "When was the last time you actually evaluated whether your HRIS's recruiting module is keeping up with dedicated ATS platforms?"</p>
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

        <ScriptBlock label="The Value Close — Teamtailor (Benchmark)">
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
