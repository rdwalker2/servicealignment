import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function CadenceStrategy() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader
        stage="CADENCES"
        title="Cadence Architecture"
        subtitle="The three categories of cadences every rep needs — and when to deploy each one."
      />

      {/* ── Philosophy ── */}
      <DocSection title="Why Cadences Win">
        <p className="text-[13px] text-stone-600 leading-relaxed mb-4">
          Every rep has the same number of hours in a day. The difference between
          top performers and everyone else is <strong>structured persistence</strong>.
          A cadence removes the guesswork from follow-up, ensures no prospect
          slips through the cracks, and lets you run multiple plays simultaneously
          without cognitive overload.
        </p>
        <p className="text-[13px] text-stone-600 leading-relaxed">
          At Service Alignment, we organise every outbound and deal-progression motion
          into one of three cadence categories. Each has a distinct purpose,
          trigger, and tempo. Master all three and you'll never wonder
          "what do I do next?"
        </p>
      </DocSection>

      {/* ── Category Overview Table ── */}
      <DocSection title="The Three Cadence Categories">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border border-stone-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-stone-100 text-left">
                <th className="px-4 py-3 font-bold text-stone-700 border-b border-stone-200">Category</th>
                <th className="px-4 py-3 font-bold text-stone-700 border-b border-stone-200">Purpose</th>
                <th className="px-4 py-3 font-bold text-stone-700 border-b border-stone-200">Trigger</th>
                <th className="px-4 py-3 font-bold text-stone-700 border-b border-stone-200">Tempo</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-stone-100">
                <td className="px-4 py-3 font-semibold text-emerald-700">Pipeline Creation</td>
                <td className="px-4 py-3 text-stone-600">Get first meeting booked</td>
                <td className="px-4 py-3 text-stone-600">New contact discovered via ICP research, inbound lead, or trigger event</td>
                <td className="px-4 py-3 text-stone-600">14–21 days, 8–12 touches</td>
              </tr>
              <tr className="border-b border-stone-100 bg-stone-50/50">
                <td className="px-4 py-3 font-semibold text-blue-700">Pipeline Progression</td>
                <td className="px-4 py-3 text-stone-600">Move deals D1 → D4 through the funnel</td>
                <td className="px-4 py-3 text-stone-600">Deal enters a new stage or stalls beyond expected velocity</td>
                <td className="px-4 py-3 text-stone-600">3–7 day spacing between touches</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-amber-700">Pipeline Recovery</td>
                <td className="px-4 py-3 text-stone-600">Re-engage ghosted or stalled deals</td>
                <td className="px-4 py-3 text-stone-600">No response for X days past expected reply window</td>
                <td className="px-4 py-3 text-stone-600">7–14 day spacing between touches</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocSection>

      {/* ── Pipeline Creation Detail ── */}
      <DocSection title="1. Pipeline Creation Cadences">
        <p className="text-[13px] text-stone-600 leading-relaxed mb-3">
          These are your outbound prospecting sequences. The goal is simple:
          <strong> book the first meeting</strong>. You're introducing Service Alignment,
          referencing a relevant pain point, and earning 20 minutes of their time.
        </p>
        <ul className="space-y-2 text-[13px] text-stone-600 list-disc pl-5">
          <li><strong>Displacement Play</strong> — 21-day cadence targeting companies on legacy HRIS platforms (Rippling, Dayforce, Workday) where recruiting is an afterthought.</li>
          <li><strong>Inbound Fast-Follow</strong> — 7-day cadence for inbound demo requests or content downloads. Speed-to-lead is everything.</li>
          <li><strong>Trigger Event Play</strong> — 14-day cadence fired when a prospect posts a job, raises funding, or makes a key hire.</li>
        </ul>
      </DocSection>

      {/* ── Pipeline Progression Detail ── */}
      <DocSection title="2. Pipeline Progression Cadences">
        <p className="text-[13px] text-stone-600 leading-relaxed mb-3">
          Once a deal enters the funnel, these cadences keep it moving. They are
          stage-specific and designed to prevent the five deal fatalities.
        </p>
        <ul className="space-y-2 text-[13px] text-stone-600 list-disc pl-5">
          <li><strong>Post-D1 Nurture</strong> — 10-day cadence after Discovery to prevent Fatality #1 (Timing). Reinforces urgency and pain.</li>
          <li><strong>Demo Follow-Up</strong> — 5-day cadence after D2 to drive technical validation and multi-thread into the buying committee.</li>
          <li><strong>Proposal Chase</strong> — 7-day cadence after D3 pricing is sent. Anchors value, handles objections, creates urgency.</li>
        </ul>
      </DocSection>

      {/* ── Pipeline Recovery Detail ── */}
      <DocSection title="3. Pipeline Recovery Cadences">
        <p className="text-[13px] text-stone-600 leading-relaxed mb-3">
          Deals go dark. It's not a matter of <em>if</em> but <em>when</em>.
          Recovery cadences give you a systematic way to re-engage without
          sounding desperate.
        </p>
        <ul className="space-y-2 text-[13px] text-stone-600 list-disc pl-5">
          <li><strong>Ghost Buster</strong> — 14-day recovery cadence for deals that go silent mid-cycle. Multi-channel, ends with a breakup email.</li>
          <li><strong>Closed-Lost Resurrect</strong> — 90-day nurture for deals marked closed-lost. Trigger event monitoring + quarterly value drops.</li>
        </ul>
      </DocSection>

      {/* ── 6 Key Rules ── */}
      <DocSection title="The 6 Rules of Cadence Execution">
        <div className="space-y-4">
          <div className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-stone-900 text-white text-[12px] font-bold flex items-center justify-center">1</span>
            <div>
              <h4 className="font-bold text-stone-900 text-[13px] mb-1">Multi-Channel is Non-Negotiable</h4>
              <p className="text-[13px] text-stone-600">Every cadence must span at least phone + email + LinkedIn. Single-channel cadences get ignored. The average B2B buyer needs 8+ touches across 3+ channels before engaging.</p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-stone-900 text-white text-[12px] font-bold flex items-center justify-center">2</span>
            <div>
              <h4 className="font-bold text-stone-900 text-[13px] mb-1">Personalize the First and Last Touch</h4>
              <p className="text-[13px] text-stone-600">At minimum, Day 1 and the breakup email should reference something specific to the prospect — their tech stack, a recent hire, a company initiative. The middle can be more templated.</p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-stone-900 text-white text-[12px] font-bold flex items-center justify-center">3</span>
            <div>
              <h4 className="font-bold text-stone-900 text-[13px] mb-1">Never Stack Same-Channel Touches Back-to-Back</h4>
              <p className="text-[13px] text-stone-600">Sending three emails in a row feels spammy. Alternate channels: Email → Phone → LinkedIn → Email. This also increases the odds of catching them where they're most active.</p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-stone-900 text-white text-[12px] font-bold flex items-center justify-center">4</span>
            <div>
              <h4 className="font-bold text-stone-900 text-[13px] mb-1">Every Touch Must Deliver Value</h4>
              <p className="text-[13px] text-stone-600">"Just checking in" is not a cadence step. Every touch should share data, a case study, a benchmark, or a provocative insight. You're building a case, not nagging.</p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-stone-900 text-white text-[12px] font-bold flex items-center justify-center">5</span>
            <div>
              <h4 className="font-bold text-stone-900 text-[13px] mb-1">Respect the Breakup</h4>
              <p className="text-[13px] text-stone-600">When you send a breakup email, mean it. Don't send another email three days later. The breakup creates urgency <em>because</em> it's final. If they don't respond, move them to a long-term nurture track.</p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-stone-900 text-white text-[12px] font-bold flex items-center justify-center">6</span>
            <div>
              <h4 className="font-bold text-stone-900 text-[13px] mb-1">Log Every Touch in Salesforce</h4>
              <p className="text-[13px] text-stone-600">If it's not logged, it didn't happen. Every call, email, and LinkedIn message gets logged as an activity. This feeds your analytics, protects you in deal reviews, and helps the next rep if the account recycles.</p>
            </div>
          </div>
        </div>
      </DocSection>

      {/* ── Callout ── */}
      <Callout type="tip" title="Cadence ≠ Automation">
        A cadence is a <strong>framework</strong>, not an autopilot. The best reps
        use the cadence as a backbone and inject live personalisation at every
        step. If you find yourself copy-pasting every email without edits,
        you're doing it wrong.
      </Callout>

      {/* ── Metrics ── */}
      <DocSection title="Cadence Performance Benchmarks">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border border-stone-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-stone-100 text-left">
                <th className="px-4 py-3 font-bold text-stone-700 border-b border-stone-200">Metric</th>
                <th className="px-4 py-3 font-bold text-stone-700 border-b border-stone-200">Pipeline Creation</th>
                <th className="px-4 py-3 font-bold text-stone-700 border-b border-stone-200">Pipeline Progression</th>
                <th className="px-4 py-3 font-bold text-stone-700 border-b border-stone-200">Pipeline Recovery</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-stone-100">
                <td className="px-4 py-3 font-medium text-stone-700">Open Rate</td>
                <td className="px-4 py-3 text-stone-600">45–55%</td>
                <td className="px-4 py-3 text-stone-600">65–80%</td>
                <td className="px-4 py-3 text-stone-600">50–60%</td>
              </tr>
              <tr className="border-b border-stone-100 bg-stone-50/50">
                <td className="px-4 py-3 font-medium text-stone-700">Reply Rate</td>
                <td className="px-4 py-3 text-stone-600">8–15%</td>
                <td className="px-4 py-3 text-stone-600">25–40%</td>
                <td className="px-4 py-3 text-stone-600">15–25%</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="px-4 py-3 font-medium text-stone-700">Meeting/Conversion Rate</td>
                <td className="px-4 py-3 text-stone-600">3–8%</td>
                <td className="px-4 py-3 text-stone-600">60–75%</td>
                <td className="px-4 py-3 text-stone-600">20–35%</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-stone-700">Avg. Touches to Convert</td>
                <td className="px-4 py-3 text-stone-600">6–9</td>
                <td className="px-4 py-3 text-stone-600">3–5</td>
                <td className="px-4 py-3 text-stone-600">4–6</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocSection>

      {/* --- DISPLACEMENT PLAY --- */}
      {/* ── Context ── */}
      <DocSection title="When to Deploy">
        <p className="text-[13px] text-stone-600 leading-relaxed mb-3">
          Use this cadence when you've identified a company running recruiting
          through a legacy HRIS platform — Rippling, Dayforce, Workday, BambooHR,
          or similar. These companies are your highest-probability displacement
          targets because they're experiencing the pain of recruiting as an
          afterthought inside a system built for payroll and compliance.
        </p>
        <Callout type="info" title="Pre-Cadence Research (Required)">
          Before Step 1, confirm: (1) which HRIS they use, (2) their headcount
          and open roles, (3) at least one specific pain signal — job postings
          older than 60 days, Glassdoor reviews mentioning hiring, or a recent
          TA hire signaling investment. This cadence only works with real
          personalisation.
        </Callout>
      </DocSection>

      {/* ── Cadence Timeline ── */}
      <DocSection title="The 21-Day Cadence">
        <div className="space-y-4">

          {/* ── Day 1 · Phone ── */}
          <div className="border-l-4 border-emerald-400 pl-4 py-3 bg-emerald-50/30 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-emerald-600 uppercase">Day 1 · Phone</span>
            </div>
            <h4 className="font-bold text-stone-900 mb-1">Cold Call — Quick Intro</h4>
            <ScriptBlock label="Call Script">
              {`"Hey {{first_name}}, this is [Rep] with Service Alignment. I noticed {{company}} is using [Rippling/Dayforce] — and from what I've seen, most TA leaders in your space are spending more time fighting their HRIS for recruiting data than actually hiring. 

Is that fair, or am I off base?

[If yes / curious]: We work with companies like Savills — 15,000 employees — who moved their recruiting off their HRIS and onto a purpose-built Provider. They cut time-to-hire by 40-58% in the first six months.

I'd love 20 minutes to see if we could do something similar for {{company}}. Would [day] or [day] work?

[If no]: Totally fair. Quick question before I let you go — if recruiting speed and candidate experience aren't a pain point, what's keeping you up at night on the TA side?"`}
            </ScriptBlock>
            <ScriptBlock label="Voicemail Script">
              {`"{{first_name}}, [Rep] with Service Alignment. I'm reaching out because I've been working with companies using [Rippling/Dayforce] for recruiting, and there's a pattern I keep seeing — I think it'd be worth 2 minutes of your time. I'll shoot you an email with some data. My number is [number]."`}
            </ScriptBlock>
            <p className="text-[12px] text-stone-500 italic mt-2">
              <strong>Coaching:</strong> The goal is NOT to pitch. It's to validate the pain hypothesis. If they push back, pivot to curiosity — ask what <em>is</em> a priority. A "no, but here's what matters" is still valuable intel for email personalisation.
            </p>
          </div>

          {/* ── Day 1 · Email ── */}
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-blue-600 uppercase">Day 1 · Email</span>
            </div>
            <h4 className="font-bold text-stone-900 mb-1">Subject: {"{{company}}"}'s recruiting stack</h4>
            <p className="text-[13px] text-stone-600 leading-relaxed">
              Hi {"{{first_name}}"},
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              Most HR leaders I talk to who run recruiting inside [Rippling/Dayforce] tell me the same thing: <em>it technically works, but it wasn't built for this.</em>
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              The result? Candidate experience suffers, hiring managers lose visibility, and TA teams spend hours on workarounds that a purpose-built Provider handles natively.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              We recently helped Savills (15,000 employees) move their recruiting off their HRIS. The results: <strong>40–58% reduction in time-to-hire</strong> and a career site that actually converts.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              Would it be worth 20 minutes to see if {"{{company}}"} is leaving similar gains on the table?
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              — [Rep]
            </p>
            <p className="text-[12px] text-stone-500 italic mt-2">
              <strong>Coaching:</strong> Keep the first email short — under 120 words. Lead with empathy ("it technically works"), not product features. The Savills proof point earns credibility. One CTA, one question mark.
            </p>
          </div>

          {/* ── Day 3 · Email ── */}
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-blue-600 uppercase">Day 3 · Email</span>
            </div>
            <h4 className="font-bold text-stone-900 mb-1">Subject: Re: {"{{company}}"}'s recruiting stack</h4>
            <p className="text-[13px] text-stone-600 leading-relaxed">
              {"{{first_name}}"} — wanted to put some numbers behind my last note.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              When recruiting lives inside an HRIS, we consistently see three things:
            </p>
            <ul className="text-[13px] text-stone-600 list-disc pl-5 mt-2 space-y-1">
              <li><strong>$400/day per open role</strong> in fully-loaded vacancy cost (salary + lost productivity + recruiter time)</li>
              <li><strong>2.3x more candidate drop-off</strong> vs. a native Provider application flow</li>
              <li><strong>35% longer time-to-fill</strong> due to manual workflows and limited automation</li>
            </ul>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              For a company with {"{{company}}"}'s hiring volume, that gap compounds fast.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              Happy to walk through how these benchmarks compare to your actuals — no pitch, just data. Worth a look?
            </p>
            <p className="text-[12px] text-stone-500 italic mt-2">
              <strong>Coaching:</strong> This email uses the "reply thread" technique — same subject line with "Re:" to boost open rates by 20–30%. Lead with hard numbers. The "$400/day" stat is an anchor that makes the cost of inaction tangible.
            </p>
          </div>

          {/* ── Day 4 · LinkedIn ── */}
          <div className="border-l-4 border-violet-400 pl-4 py-3 bg-violet-50/30 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-violet-600 uppercase">Day 4 · LinkedIn</span>
            </div>
            <h4 className="font-bold text-stone-900 mb-1">Silent Connect Request</h4>
            <p className="text-[13px] text-stone-600 leading-relaxed">
              Send a connection request with <strong>no message</strong>. Just connect.
            </p>
            <p className="text-[12px] text-stone-500 italic mt-2">
              <strong>Coaching:</strong> The silent connect is intentional. Adding a sales pitch to a LinkedIn request tanks acceptance rates from ~40% to ~15%. Connect silently now — you'll use LinkedIn DM on Day 12. The goal here is to get into their feed so they see your activity and recognise your name when the next email lands.
            </p>
          </div>

          {/* ── Day 5 · Phone ── */}
          <div className="border-l-4 border-emerald-400 pl-4 py-3 bg-emerald-50/30 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-emerald-600 uppercase">Day 5 · Phone</span>
            </div>
            <h4 className="font-bold text-stone-900 mb-1">Follow-Up Call</h4>
            <ScriptBlock label="Voicemail Script">
              {`"{{first_name}}, [Rep] again from Service Alignment. I sent over some data earlier this week on what we're seeing with companies that run recruiting inside their HRIS — the cost numbers are pretty eye-opening. 

Take a look when you get a chance, and if anything resonates, I'd love to compare notes. [number] or just reply to my email. Talk soon."`}
            </ScriptBlock>
            <p className="text-[12px] text-stone-500 italic mt-2">
              <strong>Coaching:</strong> Keep the voicemail under 30 seconds. Reference "the data I sent" — this creates continuity and a reason to open your email. Don't re-pitch; create curiosity.
            </p>
          </div>

          {/* ── Day 5 · Email ── */}
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-blue-600 uppercase">Day 5 · Email</span>
            </div>
            <h4 className="font-bold text-stone-900 mb-1">Subject: Built this for {"{{company}}"}</h4>
            <p className="text-[13px] text-stone-600 leading-relaxed">
              {"{{first_name}}"} — I put together a quick hiring benchmark report for {"{{company}}"} based on your industry, headcount, and the roles I see open right now.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              It compares your estimated time-to-fill and cost-per-hire against companies of similar size who've moved to a dedicated Provider. No call needed to get it — just reply <strong>"send it"</strong> and I'll drop it in your inbox.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              — [Rep]
            </p>
            <p className="text-[12px] text-stone-500 italic mt-2">
              <strong>Coaching:</strong> The "reply 'send it'" CTA is a micro-commitment technique. It's low-friction (no calendar invite, no meeting) and gets them to engage. Once they reply, you've opened a conversation. Have the benchmark ready to send within 2 hours.
            </p>
          </div>

          {/* ── Day 8 · Email ── */}
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-blue-600 uppercase">Day 8 · Email</span>
            </div>
            <h4 className="font-bold text-stone-900 mb-1">Subject: Before it becomes a fire drill</h4>
            <p className="text-[13px] text-stone-600 leading-relaxed">
              {"{{first_name}}"} — here's the pattern I see play out every quarter:
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              A company knows their recruiting process has gaps. Open roles sit for 60+ days. Hiring managers get frustrated. Candidates ghost because the apply experience is clunky. But it's "not urgent enough" to fix — until a critical role blows past 90 days and leadership starts asking questions.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              The companies that win aren't the ones that react to the fire drill. They're the ones that fix the plumbing <em>before</em> the pipe bursts.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              I'd love 15 minutes to show you what that looks like at {"{{company}}"}. Open to it?
            </p>
            <p className="text-[12px] text-stone-500 italic mt-2">
              <strong>Coaching:</strong> This email shifts from data to narrative. You're telling a story they've lived. The "fire drill" framing creates urgency without being pushy. It positions taking the meeting as the proactive, strategic choice.
            </p>
          </div>

          {/* ── Day 12 · LinkedIn DM ── */}
          <div className="border-l-4 border-violet-400 pl-4 py-3 bg-violet-50/30 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-violet-600 uppercase">Day 12 · LinkedIn DM</span>
            </div>
            <h4 className="font-bold text-stone-900 mb-1">POC Identification</h4>
            <p className="text-[13px] text-stone-600 leading-relaxed">
              "Hey {"{{first_name}}"} — quick question. Do you handle the recruiting tech decisions at {"{{company}}"}, or is there a better person for me to connect with? Either way, happy to share what we're seeing in [their industry]. No pitch, just patterns."
            </p>
            <p className="text-[12px] text-stone-500 italic mt-2">
              <strong>Coaching:</strong> This serves two purposes: (1) if they're the right person, they'll often engage just to correct you or confirm, and (2) if they're not, you get a referral. The "no pitch, just patterns" language lowers the guard. LinkedIn DMs have a 3x higher response rate than email for short questions like this.
            </p>
          </div>

          {/* ── Day 16 · Email ── */}
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-blue-600 uppercase">Day 16 · Email</span>
            </div>
            <h4 className="font-bold text-stone-900 mb-1">Subject: Free career page audit</h4>
            <p className="text-[13px] text-stone-600 leading-relaxed">
              {"{{first_name}}"} — no meeting, no sales call, no strings.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              I recorded a quick Loom walkthrough of {"{{company}}"}'s current careers page — what's working, what's costing you candidates, and three quick fixes I'd make if I were on your team.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              Want me to send it over? Takes 4 minutes to watch.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              — [Rep]
            </p>
            <p className="text-[12px] text-stone-500 italic mt-2">
              <strong>Coaching:</strong> This is your highest-value touch. You've actually done the work — recorded a Loom reviewing their career page. This takes 5–10 minutes per prospect but converts at 3–5x the rate of a generic email. <strong>Do the Loom before you send this email.</strong> If they say yes, the Loom sells the meeting for you.
            </p>
          </div>

          {/* ── Day 21 · Email ── */}
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-blue-600 uppercase">Day 21 · Email</span>
            </div>
            <h4 className="font-bold text-stone-900 mb-1">Subject: Assuming you're not the right person</h4>
            <p className="text-[13px] text-stone-600 leading-relaxed">
              {"{{first_name}}"} — I've reached out a few times and haven't heard back, so I'm going to assume one of two things:
            </p>
            <ol className="text-[13px] text-stone-600 list-decimal pl-5 mt-2 space-y-1">
              <li>Recruiting tech isn't your area, and I've been barking up the wrong tree.</li>
              <li>The timing just isn't right, and this is sitting in the "maybe later" pile.</li>
            </ol>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              Either way, no hard feelings. If there's someone else at {"{{company}}"} who owns recruiting tech decisions, I'd appreciate the redirect. And if this lands in your lap down the road, my door's open.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              Thanks for your time, {"{{first_name}}"}. Closing your file for now.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              — [Rep]
            </p>
            <p className="text-[12px] text-stone-500 italic mt-2">
              <strong>Coaching:</strong> The breakup email is the highest-converting email in the cadence. "Closing your file" creates loss aversion. "Assuming you're not the right person" triggers a correction reflex — people hate being mislabeled. Don't follow up after this. If they don't respond, move to the Closed-Lost Resurrect nurture track.
            </p>
          </div>

        </div>
      </DocSection>

      {/* ── Summary Callout ── */}
      <Callout type="tip" title="Cadence Summary">
        10 touches over 21 days across 3 channels. If executed with real
        personalisation, expect a <strong>12–18% meeting-book rate</strong> on
        qualified ICP accounts. The Loom audit (Day 16) is your secret weapon
        — invest the 10 minutes.
      </Callout>

      {/* --- POST-D1 NURTURE --- */}
      {/* ── Fatality Prevention Callout ── */}
      <Callout type="important" title="This Cadence Directly Prevents Fatality #1 (Timing)">
        The #1 reason deals die is <strong>timing</strong> — the prospect loses urgency
        between meetings, other priorities take over, and the evaluation stalls. This
        10-day cadence keeps the heat on after Discovery by reinforcing pain, delivering
        proof, and making the cost of inaction impossible to ignore. If you run this
        cadence consistently, you will see a measurable increase in D1 → D2 conversion.
      </Callout>

      {/* ── Context ── */}
      <DocSection title="When to Deploy">
        <p className="text-[13px] text-stone-600 leading-relaxed mb-3">
          Launch this cadence <strong>within 2 hours of completing a Discovery call
          (D1)</strong>. The first email should land while the conversation is still
          fresh in their mind. Every day you wait reduces your recap's impact by
          roughly 20%.
        </p>
        <p className="text-[13px] text-stone-600 leading-relaxed">
          This cadence runs parallel to your normal deal progression activities —
          it's the background "air cover" that keeps you top-of-mind and builds
          the business case between meetings. By Day 10, you should have your D2
          demo scheduled. If you don't, transition to the Ghost Buster cadence.
        </p>
      </DocSection>

      {/* ── The Cadence ── */}
      <DocSection title="The 10-Day Cadence">
        <div className="space-y-4">

          {/* ── Day 1 · Email ── */}
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-blue-600 uppercase">Day 1 · Email</span>
            </div>
            <h4 className="font-bold text-stone-900 mb-1">Subject: Great talking today — recap + next steps</h4>
            <p className="text-[13px] text-stone-600 leading-relaxed">
              {"{{first_name}}"} — thanks for the time today. Really enjoyed the conversation.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              Here's what I took away as your top priorities:
            </p>
            <ul className="text-[13px] text-stone-600 list-disc pl-5 mt-2 space-y-1">
              <li><strong>[Pain #1 in their words]</strong> — e.g., "Time-to-hire is too long, especially for engineering roles, and it's creating tension with hiring managers."</li>
              <li><strong>[Pain #2 in their words]</strong> — e.g., "Your career page doesn't reflect the brand you've built, and you're losing candidates to competitors with better digital experiences."</li>
              <li><strong>[Pain #3 in their words]</strong> — e.g., "The team is spending too much time on manual tasks — screening, scheduling, updating hiring managers — instead of strategic recruiting."</li>
            </ul>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              Did I capture that right? Anything I missed?
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              <strong>Next step:</strong> I'd love to show you exactly how Service Alignment addresses each of these. I'm thinking a focused 30-minute demo on [date]. Does that work, or is [alternative date] better?
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              — [Rep]
            </p>
            <p className="text-[12px] text-stone-500 italic mt-2">
              <strong>Coaching:</strong> This is the most important email you'll send in the entire deal cycle. Two things matter: (1) restate their pain <em>in their words</em>, not yours, and (2) propose a specific next step with specific dates. "Let me know when works" is a conversion killer. Also — send this within 2 hours of the call. Same-day recaps get 3x more replies than next-day recaps.
            </p>
          </div>

          {/* ── Day 3 · Email ── */}
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-blue-600 uppercase">Day 3 · Email</span>
            </div>
            <h4 className="font-bold text-stone-900 mb-1">Subject: How [similar company] solved this</h4>
            <p className="text-[13px] text-stone-600 leading-relaxed">
              {"{{first_name}}"} — following up on our conversation. Thought you'd find this relevant.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              [Similar Company] was dealing with the same challenge you described — [restate their primary pain in one sentence]. Here's what happened after they moved to Service Alignment:
            </p>
            <ul className="text-[13px] text-stone-600 list-disc pl-5 mt-2 space-y-1">
              <li><strong>Time-to-hire dropped by [X]%</strong> — from [old] days to [new] days</li>
              <li><strong>Candidate application completion rate increased by [X]%</strong> — their career page went from a dead end to a conversion engine</li>
              <li><strong>Hiring manager satisfaction scores went from [X] to [Y]</strong> — because they finally had real-time visibility into the pipeline</li>
            </ul>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              I'm not saying your situation is identical, but the parallels are worth exploring. Happy to walk through the full case study during our demo.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              — [Rep]
            </p>
            <p className="text-[12px] text-stone-500 italic mt-2">
              <strong>Coaching:</strong> Social proof is your most powerful tool at this stage. Pick a case study that matches their industry, company size, or specific pain. The "I'm not saying your situation is identical" caveat builds credibility — you're not overselling, you're presenting evidence. If you don't have a perfect case study, use anonymised benchmarks from similar customers.
            </p>
          </div>

          {/* ── Day 5 · Phone ── */}
          <div className="border-l-4 border-emerald-400 pl-4 py-3 bg-emerald-50/30 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-emerald-600 uppercase">Day 5 · Phone</span>
            </div>
            <h4 className="font-bold text-stone-900 mb-1">Quick Check-In Call</h4>
            <ScriptBlock label="Call Script (Live Answer)">
              {`"Hey {{first_name}}, it's [Rep] from Service Alignment. Quick call — just wanted to check in after our conversation earlier this week. 

Did you get a chance to look at the case study I sent? [Listen]

Also — I want to make sure our demo is focused on the right things. When we meet on [date], are there specific features or workflows you'd want to see, or should I build it around the three priorities we discussed?

[Listen, take notes, confirm demo date]

Perfect. I'll build the demo around that. Talk to you [day]."`}
            </ScriptBlock>
            <ScriptBlock label="Voicemail Script">
              {`"{{first_name}}, it's [Rep] from Service Alignment. Just a quick check-in after our conversation this week. I sent over a case study that I think is really relevant to what you're dealing with — take a look when you get a chance.

Also, I want to make sure our next meeting is focused on exactly what matters to you. If there's anything specific you'd want to see, shoot me a quick reply. Talk soon. [number]."`}
            </ScriptBlock>
            <p className="text-[12px] text-stone-500 italic mt-2">
              <strong>Coaching:</strong> The Day 5 call serves two purposes: (1) confirm the demo is still on the calendar, and (2) gather intel for demo customisation. If you get a live answer, use the call to co-build the demo agenda — this gives them ownership of the next meeting, which increases show rates by 30–40%. If you get voicemail, keep it under 25 seconds and reference the case study.
            </p>
          </div>

          {/* ── Day 7 · Email ── */}
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-blue-600 uppercase">Day 7 · Email</span>
            </div>
            <h4 className="font-bold text-stone-900 mb-1">Subject: The math on waiting</h4>
            <p className="text-[13px] text-stone-600 leading-relaxed">
              {"{{first_name}}"} — wanted to share a quick framework I use with a lot of our customers.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              <strong>The Cost-of-Inaction Formula:</strong>
            </p>
            <div className="bg-stone-100 rounded-lg p-4 mt-2 mb-3">
              <p className="text-[13px] text-stone-800 font-mono text-center">
                $400/day × [open roles] × [avg days to fill] = total vacancy cost
              </p>
            </div>
            <p className="text-[13px] text-stone-600 leading-relaxed">
              Let's say {"{{company}}"} has 15 open roles averaging 60 days to fill:
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-2 mb-3">
              <p className="text-[14px] text-amber-900 font-bold text-center">
                $400 × 15 roles × 60 days = $360,000 in vacancy cost per quarter
              </p>
            </div>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              If Service Alignment cuts your time-to-fill by even 30% (which is conservative based on what we see), that's <strong>$108,000 back in your pocket every quarter</strong>.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              I'm not trying to create false urgency. But the longer the current process runs, the more this number compounds. Happy to run the actual math with your numbers during our demo.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              — [Rep]
            </p>
            <p className="text-[12px] text-stone-500 italic mt-2">
              <strong>Coaching:</strong> This is the urgency email. The $400/day figure is a well-documented industry benchmark (SHRM, Josh Bersin). Plug in their actual numbers if you have them from discovery. The formula makes the cost tangible and hard to ignore. <strong>Customize the role count and TTF</strong> — use what they told you in D1. Generic math doesn't land; their math does.
            </p>
          </div>

          {/* ── Day 10 · Email ── */}
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-blue-600 uppercase">Day 10 · Email</span>
            </div>
            <h4 className="font-bold text-stone-900 mb-1">Subject: Two times that work</h4>
            <p className="text-[13px] text-stone-600 leading-relaxed">
              {"{{first_name}}"} — I know calendars fill up fast, so I wanted to lock in our demo before the week gets away from us.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              I've got two slots open:
            </p>
            <ul className="text-[13px] text-stone-600 list-disc pl-5 mt-2 space-y-1">
              <li><strong>[Day, Date] at [Time]</strong></li>
              <li><strong>[Day, Date] at [Time]</strong></li>
            </ul>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              I'll keep it focused — 30 minutes, built around the three priorities you shared: [pain 1], [pain 2], and [pain 3]. No generic demo deck, just your use case.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              Which works better?
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              — [Rep]
            </p>
            <p className="text-[12px] text-stone-500 italic mt-2">
              <strong>Coaching:</strong> The "two times" technique is a classic commitment device. Instead of asking "when are you free?" (which invites delay), you're offering a binary choice. Re-referencing their three priorities from D1 reminds them this isn't a generic pitch — it's their meeting. If they don't respond to this email and you still don't have a D2 booked, transition to the Ghost Buster cadence starting on Day 12.
            </p>
          </div>

        </div>
      </DocSection>

      {/* ── Transition Logic ── */}
      <DocSection title="What Happens After Day 10?">
        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold flex items-center justify-center">✓</span>
            <div>
              <h4 className="font-bold text-stone-900 text-[13px]">D2 Booked → Exit cadence</h4>
              <p className="text-[13px] text-stone-600">Success. Transition to your D2 demo prep workflow. Send a calendar invite with a clear agenda tied to their stated priorities.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold flex items-center justify-center">⚠</span>
            <div>
              <h4 className="font-bold text-stone-900 text-[13px]">Engaged but not booked → Extend 5 days</h4>
              <p className="text-[13px] text-stone-600">If they're replying but haven't committed to a date, add 2 more touches — a LinkedIn DM and one more email with a different proof point. Don't exceed 15 total days.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-700 text-[11px] font-bold flex items-center justify-center">✗</span>
            <div>
              <h4 className="font-bold text-stone-900 text-[13px]">No response → Ghost Buster</h4>
              <p className="text-[13px] text-stone-600">If you've had zero engagement across all 5 touches, transition to the Ghost Buster cadence starting on Day 12 (2 days after this cadence ends).</p>
            </div>
          </div>
        </div>
      </DocSection>

      {/* ── Key Principles ── */}
      <DocSection title="Key Principles for Post-D1 Nurture">
        <ul className="space-y-2 text-[13px] text-stone-600 list-disc pl-5">
          <li><strong>Speed matters.</strong> Day 1 email within 2 hours. Every day of delay reduces conversion by ~20%.</li>
          <li><strong>Their words, not yours.</strong> Restate pain exactly as they described it. If they said "it's a nightmare," write "the nightmare you described." Mirror their language.</li>
          <li><strong>Build the business case for them.</strong> By Day 10, they should have received a recap, a case study, and a cost-of-inaction analysis. You're giving them the ammunition to sell internally.</li>
          <li><strong>One CTA per email.</strong> Don't ask them to read a case study AND book a meeting AND forward to their boss. One action, one email.</li>
          <li><strong>Propose, don't ask.</strong> "Does Tuesday at 2pm work?" beats "When are you free?" every time.</li>
        </ul>
      </DocSection>

      {/* ── Metrics ── */}
      <Callout type="tip" title="Expected Performance">
        When executed consistently, the Post-D1 Nurture cadence drives a{' '}
        <strong>65–75% D1 → D2 conversion rate</strong>. The biggest lever is
        the Day 1 recap email — get it out fast, get the pain right, and
        propose a specific date. Everything else is reinforcement.
      </Callout>

      {/* --- GHOST BUSTER --- */}
      {/* ── Context ── */}
      <DocSection title="When to Deploy">
        <p className="text-[13px] text-stone-600 leading-relaxed mb-3">
          Deploy this cadence when a deal that was previously engaged — they
          attended a discovery call, responded to emails, or were actively
          evaluating — suddenly goes silent. The trigger is simple:{' '}
          <strong>no response for 5+ business days past the expected reply window.</strong>
        </p>
        <p className="text-[13px] text-stone-600 leading-relaxed mb-3">
          Ghost Buster is not for cold prospects who never engaged. It's for warm
          deals that went dark. The psychology is different: these people already
          know who you are and what Service Alignment does. They're avoiding you for a
          reason — and your job is to give them a <em>new</em> reason to
          re-engage.
        </p>
        <Callout type="warning" title="Don't Start Ghost Buster Too Early">
          Wait at least 5 business days of silence before launching this cadence.
          People get busy. If you fire a recovery sequence after 2 days of no
          response, you look desperate — not helpful. Patience is part of the
          strategy.
        </Callout>
      </DocSection>

      {/* ── The Cadence ── */}
      <DocSection title="The 14-Day Cadence">
        <div className="space-y-4">

          {/* ── Day 1 · Email ── */}
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-blue-600 uppercase">Day 1 · Email</span>
            </div>
            <h4 className="font-bold text-stone-900 mb-1">Subject: Did I lose you?</h4>
            <p className="text-[13px] text-stone-600 leading-relaxed">
              {"{{first_name}}"} — I noticed we lost momentum after our last conversation, and I want to be upfront about it rather than pretend nothing happened.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              A few possibilities:
            </p>
            <ol className="text-[13px] text-stone-600 list-decimal pl-5 mt-2 space-y-1">
              <li>You got pulled into something more urgent (happens to everyone).</li>
              <li>Something I said didn't land, and the priority shifted.</li>
              <li>You've decided to go a different direction and just haven't told me yet.</li>
            </ol>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              Any of those are totally fine. But I'd rather know where things stand than keep following up into the void. A one-line reply — even "not now" — would be really helpful.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              — [Rep]
            </p>
            <p className="text-[12px] text-stone-500 italic mt-2">
              <strong>Coaching:</strong> This email works because it acknowledges the silence head-on. The three-option framework makes it easy to reply — they just have to pick a number. Notice there's no pitch, no CTA for a meeting. You're asking for honesty, not a commitment. This converts at 20–25%.
            </p>
          </div>

          {/* ── Day 3 · LinkedIn DM ── */}
          <div className="border-l-4 border-violet-400 pl-4 py-3 bg-violet-50/30 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-violet-600 uppercase">Day 3 · LinkedIn DM</span>
            </div>
            <h4 className="font-bold text-stone-900 mb-1">Channel Switch — Share Value</h4>
            <p className="text-[13px] text-stone-600 leading-relaxed">
              "Hey {"{{first_name}}"} — saw this and thought of your team. [Link to relevant article, case study, or industry report]. No agenda, just thought it was relevant given what you mentioned about [specific pain from discovery]. Hope things are good on your end."
            </p>
            <p className="text-[12px] text-stone-500 italic mt-2">
              <strong>Coaching:</strong> The channel switch is critical. If they're ignoring email, meet them where they're active. The key is to share something genuinely useful — not a Service Alignment blog post, but a third-party resource relevant to their stated pain. This positions you as a peer, not a salesperson. Reference something specific from your previous conversation to show you were listening.
            </p>
          </div>

          {/* ── Day 5 · Phone ── */}
          <div className="border-l-4 border-emerald-400 pl-4 py-3 bg-emerald-50/30 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-emerald-600 uppercase">Day 5 · Phone</span>
            </div>
            <h4 className="font-bold text-stone-900 mb-1">Voicemail with Time-Bound Ask</h4>
            <ScriptBlock label="Voicemail Script">
              {`"{{first_name}}, it's [Rep] from Service Alignment. I know you're busy, so I'll keep this to 15 seconds. 

We left things in a good spot after our last conversation, and I just want to make sure nothing fell off your radar. If the timing's changed, totally fine — just let me know and I'll stop reaching out. 

Either way, I'm around this week. [number]. Hope to hear from you."`}
            </ScriptBlock>
            <p className="text-[12px] text-stone-500 italic mt-2">
              <strong>Coaching:</strong> The "I'll stop reaching out" line is powerful. It gives them an easy out, which paradoxically makes them more likely to respond. People hate being chased but they also hate ghosting someone who's being reasonable. Keep it under 25 seconds. Warm tone, not frustrated.
            </p>
          </div>

          {/* ── Day 7 · Email ── */}
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-blue-600 uppercase">Day 7 · Email</span>
            </div>
            <h4 className="font-bold text-stone-900 mb-1">Subject: New intel on [their pain area]</h4>
            <p className="text-[13px] text-stone-600 leading-relaxed">
              {"{{first_name}}"} — came across something I thought you'd find useful, regardless of where things stand with us.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              [Insert relevant data point, benchmark, or insight. Examples:]
            </p>
            <ul className="text-[13px] text-stone-600 list-disc pl-5 mt-2 space-y-1">
              <li>"Companies in [their industry] are seeing a 22% increase in candidate ghosting this quarter — here's what the ones with low drop-off rates are doing differently."</li>
              <li>"New data from LinkedIn shows that career pages with video get 34% more qualified applicants. Thought of your team immediately."</li>
              <li>"Just helped a company your size reduce time-to-hire from 47 days to 19. Happy to share the playbook if useful."</li>
            </ul>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              No ask here — just wanted to pass it along.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              — [Rep]
            </p>
            <p className="text-[12px] text-stone-500 italic mt-2">
              <strong>Coaching:</strong> This is the "give without asking" touch. No meeting request, no CTA. Pure value. This works because it breaks the pattern of "sales rep wanting something." When they see value with no strings, it rebuilds trust. Pick ONE insight — don't overwhelm them.
            </p>
          </div>

          {/* ── Day 10 · Email ── */}
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-blue-600 uppercase">Day 10 · Email</span>
            </div>
            <h4 className="font-bold text-stone-900 mb-1">Subject: Looping in [stakeholder name/title]</h4>
            <p className="text-[13px] text-stone-600 leading-relaxed">
              {"{{first_name}}"} — I know things have been quiet on your end, and I completely respect that priorities shift.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              I'm going to reach out to [other stakeholder name/title] to see if this is still on {"{{company}}"}'s radar from their side. If you'd prefer I go through you, just let me know — happy to keep the conversation here.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              Either way, I appreciate the time you've given me so far.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              — [Rep]
            </p>
            <p className="text-[12px] text-stone-500 italic mt-2">
              <strong>Coaching:</strong> Multi-threading is one of the most effective ghost-busting tactics. Telling your contact you're going to reach out to someone else above or beside them triggers one of two responses: (1) they jump back in to protect their ownership of the evaluation, or (2) they confirm the deal is dead, which saves you time. <strong>Actually follow through</strong> — send the email to the other stakeholder. Don't use this as an empty threat.
            </p>
          </div>

          {/* ── Day 14 · Email ── */}
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-blue-600 uppercase">Day 14 · Email</span>
            </div>
            <h4 className="font-bold text-stone-900 mb-1">Subject: Closing your file</h4>
            <p className="text-[13px] text-stone-600 leading-relaxed">
              {"{{first_name}}"} — I've reached out several times and haven't heard back, so I'm going to close out your file on my end.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              No hard feelings at all. If the timing or situation changes down the road, you know where to find me. I'll keep an eye on {"{{company}}"} from afar and will reach back out if I see something relevant.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              Wishing you and the team all the best.
            </p>
            <p className="text-[13px] text-stone-600 leading-relaxed mt-2">
              — [Rep]
            </p>
            <p className="text-[12px] text-stone-500 italic mt-2">
              <strong>Coaching:</strong> The breakup. "Closing your file" is the magic phrase — it triggers loss aversion. This email consistently gets the highest response rate in the entire cadence (30–40%). When they respond, don't immediately jump back into selling. Acknowledge, ask what changed, and let them set the pace.
            </p>
          </div>

        </div>
      </DocSection>

      {/* ── Response Rate Callout ── */}
      <Callout type="important" title="Breakup Emails Convert at 30–40%">
        The breakup email (Day 14) is consistently the highest-converting email
        in any recovery cadence. The psychology is simple: <strong>loss aversion</strong>.
        When you signal that you're walking away, the prospect feels the loss of
        the option — even if they weren't actively pursuing it. Don't dilute this
        by following up again after the breakup. If they don't respond, move
        them to a 90-day Closed-Lost Resurrect nurture and move on.
      </Callout>

      {/* ── After the Cadence ── */}
      <DocSection title="After the Cadence Ends">
        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold flex items-center justify-center">✓</span>
            <div>
              <h4 className="font-bold text-stone-900 text-[13px]">If they re-engage</h4>
              <p className="text-[13px] text-stone-600">Don't pitch immediately. Ask: "What changed?" and "Where does this sit in your priorities now?" Re-qualify before re-entering the pipeline.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold flex items-center justify-center">→</span>
            <div>
              <h4 className="font-bold text-stone-900 text-[13px]">If they stay silent</h4>
              <p className="text-[13px] text-stone-600">Move to Closed-Lost Resurrect track. Set a 90-day reminder. Monitor for trigger events (new hires, funding, leadership changes) that might re-open the conversation.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-700 text-[11px] font-bold flex items-center justify-center">✗</span>
            <div>
              <h4 className="font-bold text-stone-900 text-[13px]">If they say "not interested"</h4>
              <p className="text-[13px] text-stone-600">Respect it. Thank them, ask if you can check back in 6 months, and log the reason in Salesforce. A graceful exit today is a door left open for tomorrow.</p>
            </div>
          </div>
        </div>
      </DocSection>

      {/* ── Common Mistakes ── */}
      <DocSection title="Common Mistakes to Avoid">
        <ul className="space-y-2 text-[13px] text-stone-600 list-disc pl-5">
          <li><strong>"Just checking in"</strong> — Never use these words. Every touch must deliver value or a new angle. "Checking in" signals you have nothing to offer.</li>
          <li><strong>Increasing frequency</strong> — Don't send more emails when they go silent. That's the opposite of what works. Space your touches further apart, not closer.</li>
          <li><strong>Sending the same message twice</strong> — Each touch in this cadence has a different angle: honesty, value, multi-thread, breakup. Don't repeat yourself.</li>
          <li><strong>Skipping the phone</strong> — The voicemail on Day 5 is essential. It adds a human element that email and LinkedIn can't replicate. Your voice builds trust faster than text.</li>
          <li><strong>Following up after the breakup</strong> — If you send another email after "closing the file," you've destroyed your credibility. Mean what you say.</li>
        </ul>
      </DocSection>

    </div>
  );
}
