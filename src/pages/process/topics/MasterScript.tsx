import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

// ─── Stage IDs ────────────────────────────────────────────────────

const STAGES = [
  { id: 'opener', label: 'Opener' },
  { id: 'd1', label: 'D1' },
  { id: 'd2', label: 'D2' },
  { id: 'd3', label: 'D3' },
  { id: 'd4', label: 'D4' },
] as const;

// ─── Main Component ───────────────────────────────────────────────

export default function MasterScript() {
  const ACCENT = {
    pre: '#a8a29e',     // stone
    d1: '#3b82f6',      // blue
    d2: '#14b8a6',      // teal
    d3: '#10b981',      // emerald
    d4: '#8b5cf6',      // violet
  };

  return (
    <div className="p-10 max-w-5xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader
        stage="MASTER"
        title="The Complete Service Alignment Script"
        subtitle="End-to-end discovery-to-close. Zero placeholders. Every word specific to what we sell and who we sell to."
      />

      {/* Intro */}
      <div className="mb-10">
        <p className="text-[14px] leading-relaxed text-stone-500">
          This is the <strong className="text-stone-700">full script</strong> for the Buyer's Action Plan — from opening to signed contract.
          Every talk track is written for Service Alignment, with real data points, real customer references, and real
          language that maps to our prospects' actual pain.
        </p>
      </div>

      {/* ═══════ PRE-CALL: THE OPENER ═══════ */}
      <DocSection title="Pre-Call: The Opener — Set the frame before anything else">
        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">1</span>
            <span className="font-semibold text-stone-800 text-[14px]">The Frame — First 60 Seconds</span>
          </h4>
          <ScriptBlock label="Opening — Set the Agenda">
{`"[Name], thanks for taking the time. Before we jump in, let me
set some quick expectations so we use this time well.

I'm going to ask you some questions about how recruiting works
at [company] today — what's working, what isn't, and where
things get stuck. Then I'll walk you through how we've helped
similar teams, and we can decide together if there's a fit.

If at any point this doesn't make sense for you, just tell me.
I'd rather be honest with you than waste your time. Fair?"`}
          </ScriptBlock>
          <Callout type="info" title="Why This Works">
            You've done three things: set yourself apart from every other vendor call they've had, given them permission to say no (which paradoxically makes them say yes more), and positioned yourself as a consultant — not a pitcher.
          </Callout>
        </div>
      </DocSection>

      {/* ═══════ D1: URGENCY TEST ═══════ */}
      <DocSection title="D1: Urgency Test — Do they need to act?">

        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">Q1</span>
            <span className="font-semibold text-stone-800 text-[14px]">What's the Strategic Initiative?</span>
          </h4>
          <ScriptBlock label="Uncover the Real Problem">
{`"So tell me — what prompted this conversation? Is there a
specific hiring challenge you're trying to solve, or is this
more of a long-term initiative?"

[If vague, push deeper:]

"Walk me through what happens when a new role opens at
[company]. From the req to the first interview — how many
steps is that, and where does it get stuck?"`}
          </ScriptBlock>
          <Callout type="info" title="Listen For">
            <ul className="mt-1">
              <li className="text-[13px] text-stone-600 mb-1">• We\'re drowning" / "I\'m at my wits end" — manual process pain (70% of deals)</li>
              <li className="text-[13px] text-stone-600 mb-1">• Our system sucks" / "It\'s an afterthought" — HRIS displacement play (40%)</li>
              <li className="text-[13px] text-stone-600 mb-1">• We don\'t have anything" — first-Provider, fastest close cycle</li>
              <li className="text-[13px] text-stone-600 mb-1">• We\'re growing fast" / "We can\'t keep up" — scaling trigger',</li>
            </ul>
          </Callout>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">Q1c</span>
            <span className="font-semibold text-stone-800 text-[14px]">Map the Process (Feeds CMS: jk1-jk6)</span>
          </h4>
          <ScriptBlock label="James Keating's Process Deep-Dive">
{`[Let them narrate — don't interrupt. Every manual step = pain.]

"Walk me through what happens from the moment a role opens
to the moment someone accepts an offer — start to finish."

[After they describe the process:]

"What's eating up most of your time in that process right now?"

[Then probe two critical gaps:]

"How are your hiring managers giving you feedback on
candidates? Through the system, or is it email and Slack?"

"And real quick — have you looked at your career page on
mobile recently? Pull it up right now if you can."

"When someone gets hired, does that info flow into your
payroll or HRIS automatically, or is someone re-entering
it manually?"

"And if you could wave a magic wand and fix ONE thing
about how hiring works today — what would it be?"`}
          </ScriptBlock>
          <Callout type="info" title="Listen For">
            <ul className="mt-1">
              <li className="text-[13px] text-stone-600 mb-1">• HM feedback via email/Slack = zero audit trail → TT scorecard + mobile app</li>
              <li className="text-[13px] text-stone-600 mb-1">• I haven\'t checked mobile" → pull up their career site live, visual contrast with TT</li>
              <li className="text-[13px] text-stone-600 mb-1">• We re-enter data" → TT onboarding module + HRIS webhook (ADP, Paylocity, etc.)</li>
              <li className="text-[13px] text-stone-600 mb-1">• Magic wand answer = centerpiece of your demo',</li>
            </ul>
          </Callout>
          <Callout type="info" title="Why These Feed the CMS">
            These 6 questions map to jk1–jk6 in the Granola template. The LLM extractor uses them to auto-populate the Call Sheet: process walkthrough, time sinks, HM feedback method, career page status, data handoff, and #1 frustration.
          </Callout>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">Q1b</span>
            <span className="font-semibold text-stone-800 text-[14px]">How Critical Is This?</span>
          </h4>
          <ScriptBlock label="Gauge Priority Level">
{`"On a scale of 1 to 10, how much of a priority is fixing
this for your team right now?"

[If 7+:] "What's driving that urgency?"
[If 4-6:] "What would need to happen for this to become a 9?"
[If 1-3:] "Sounds like the timing might not be right. What
          would change that?" (be willing to disqualify)`}
          </ScriptBlock>
          <Callout type="warning" title="Gate Check">
            If priority is 4 or below and they can't articulate what would change it — this deal is dead. Disqualify and move on. Prospects who rated pain ≤4 universally stalled in our data.
          </Callout>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">Q2</span>
            <span className="font-semibold text-stone-800 text-[14px]">Who Else Is Involved?</span>
          </h4>
          <ScriptBlock label="Map Stakeholders">
{`"When it comes to making a decision on something like this,
who else is typically part of that conversation?

Is there someone on the finance side, or an executive who
would need to sign off?"

[If they're the only one:] "Great — so if we found something
that made sense, you could move forward without waiting on
anyone else?"

[If others involved:] "Would it make sense to bring them
into our next conversation — even for just 15 minutes? That
way we're not playing telephone."`}
          </ScriptBlock>
          <Callout type="info" title="Listen For">
            <ul className="mt-1">
              <li className="text-[13px] text-stone-600 mb-1">• Solo decision maker = fastest close (Pedro: signed same day)</li>
              <li className="text-[13px] text-stone-600 mb-1">• I need to check with..." = identify the real buyer early</li>
              <li className="text-[13px] text-stone-600 mb-1">• Our HR Director / CFO / CEO would need to approve" = map the chain</li>
              <li className="text-[13px] text-stone-600 mb-1">• Show rate is the #1 team-wide problem — get decision makers in early',</li>
            </ul>
          </Callout>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">Q3</span>
            <span className="font-semibold text-stone-800 text-[14px]">What Infrastructure Exists Today?</span>
          </h4>
          <ScriptBlock label="Current State Discovery">
{`"What are you using for recruiting right now? Is it a
standalone system or part of your HRIS?"

[If HRIS — ADP, Paycom, Workday, UKG, Paycor, Dayforce:]
"Got it. And would you say the recruiting side gets the same
investment and attention as the payroll and benefits side?"

[If nothing:]
"So how are you tracking candidates right now — spreadsheets,
email, a shared drive?"

[If dedicated Provider:]
"How long have you been on it? And if you're being honest,
what does it NOT do that you wish it did?"

[ALWAYS follow up with:]
"How many separate tools or systems are involved in your
hiring process end-to-end? Provider, job boards, scheduling,
background checks — all of it."

"And how many locations, divisions, or brands need their
own hiring setup?"

"What HRIS or payroll system do you use? Does hired candidate
data need to flow into it?"`}
          </ScriptBlock>
          <Callout type="info" title="Listen For">
            <ul className="mt-1">
              <li className="text-[13px] text-stone-600 mb-1">• HRIS name = trigger the afterthought wedge ("recruiting is a checkbox")</li>
              <li className="text-[13px] text-stone-600 mb-1">• We have 10-15 systems" — fragmentation pain (El Cortez)</li>
              <li className="text-[13px] text-stone-600 mb-1">• Paper applications" — massive modernization opportunity</li>
              <li className="text-[13px] text-stone-600 mb-1">• It does the job but..." — they\'re settling</li>
              <li className="text-[13px] text-stone-600 mb-1">• 4+ systems = strong consolidation case (cs1 → CMS)</li>
              <li className="text-[13px] text-stone-600 mb-1">• 2+ locations = TT Divisions feature (js1 → CMS)</li>
              <li className="text-[13px] text-stone-600 mb-1">• HRIS name = integration play (js2 → CMS: ADP, Paylocity, Workday, BambooHR)',</li>
            </ul>
          </Callout>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">Q4</span>
            <span className="font-semibold text-stone-800 text-[14px]">The Cost of Inaction</span>
          </h4>
          <ScriptBlock label="Quantify What Doing Nothing Costs">
{`"Here's something I see a lot — teams know there's a
problem but they don't always quantify what it's costing
them. Let me ask you this:

How many open roles do you have right now?"

[Wait for number]

"And roughly, how long have those been open?"

[Wait]

"Industry data shows that every unfilled role costs
companies roughly $400-500 per day in lost productivity.
With [X] roles open for [Y] weeks, that's roughly
$[calculate] sitting on the table.

What happens to your team if those roles stay open
another 90 days?"`}
          </ScriptBlock>
          <Callout type="success" title="Ed Kennaway's Technique">
            Ed deployed "£408/day vacancy cost" on his Shore Trust call. Asking "What happens if you do nothing?" yields a <strong>3× higher win rate</strong>. Don't skip this. Make inaction feel expensive.
          </Callout>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">Q4b</span>
            <span className="font-semibold text-stone-800 text-[14px]">ROI Quantification (Feeds Calculator)</span>
          </h4>
          <ScriptBlock label="Get the Numbers — These Auto-Feed the ROI Calculator">
{`"Let me get a few quick numbers so I can show you the
ROI math later — I want it to be based on YOUR data,
not my assumptions.

How many total hires do you plan to make this year?
Even a ballpark helps."

[Note the number → roi_hires]

"Of those, how many are currently filled by agencies?"

[Note → roi_agency. Each = $15-25K in fees.]

"What's your average time-to-fill right now — in days?"

[Note → roi_ttf. Industry avg = 44 days. TT avg = 28.]

"And roughly how many hours per week does your team
spend on recruiting admin? Screening, scheduling,
chasing hiring managers for feedback?"

[Note → roi_admin_hrs. 15+ hrs/week = instant business case.]

"What percentage of applicants actually make it to a
first interview?"

[Note → cs2. If <10% or "we don't track this" = TT AI screening pitch.]`}
          </ScriptBlock>
          <Callout type="info" title="Why These Numbers Matter">
            These 5 data points auto-feed the ROI calculator and the Business Case Document. Agency displacement alone ($15-25K/hire) is often enough to justify the investment. Don't skip these — without them, the pricing conversation has no anchor.
          </Callout>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">✓</span>
            <span className="font-semibold text-stone-800 text-[14px]">D1 Confirmation Close</span>
          </h4>
          <ScriptBlock label="Lock the Urgency">
{`"So just to make sure I'm hearing you right — you've got
[X open roles], your team is [spending too much time on
manual work / struggling with your current system / growing
fast without the infrastructure], and this is costing you
roughly [$X per month] in productivity.

Is that a fair summary, or am I missing anything?"

[Wait for confirmation]

"And you said this is a [7-8-9] out of 10 priority.
So it sounds like this needs to get solved — the question
is just how. Let me dig into that."`}
          </ScriptBlock>
        </div>
      </DocSection>

      {/* ═══════ D2: GAP TEST ═══════ */}
      <DocSection title="D2: Gap Test — Do they need outside help?">

        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">Q5</span>
            <span className="font-semibold text-stone-800 text-[14px]">What Have You Tried Before?</span>
          </h4>
          <ScriptBlock label="Surface Past Failures + Competitive Landscape">
{`"Have you evaluated or invested in a solution like this
before?

[If yes — they've had an Provider:]
"What happened? What worked and what didn't?"

[If switching from HRIS Provider module:]
"What specifically about [ADP/Paycom/Workday]'s recruiting
side isn't working for you?"

[If no — first time:]
"What's held you back from putting something in place
until now?"

[ALWAYS ask — it's not awkward, it's respectful:]
"Are you looking at any other solutions right now? Who
else is in the mix? It actually helps me focus on what
matters most to you so I'm not wasting your time on
things that don't matter."

[If they say "just you":]
"That's flattering, but I'd recommend looking at 1-2
others — it'll make your business case stronger."
(Radical honesty builds trust.)`}
          </ScriptBlock>
          <Callout type="info" title="Listen For">
            <ul className="mt-1">
              <li className="text-[13px] text-stone-600 mb-1">• Paycom/ADP/Workday = win rates 78-91% — these are our best displacement targets</li>
              <li className="text-[13px] text-stone-600 mb-1">• Lever/Greenhouse = harder fight (55-72%) — need sharper differentiation</li>
              <li className="text-[13px] text-stone-600 mb-1">• We tried but it didn\'t work" — find out WHY and position TT as the fix</li>
              <li className="text-[13px] text-stone-600 mb-1">• Contract renews in [month]" — natural switching window, create timeline urgency</li>
              <li className="text-[13px] text-stone-600 mb-1">• Competitor name → activates Kill Page in CMS (cs3 → competitor_situation)',</li>
            </ul>
          </Callout>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">Q6</span>
            <span className="font-semibold text-stone-800 text-[14px]">Root Cause Diagnosis + Problem Reframe</span>
          </h4>
          <ScriptBlock label="Expose the Bigger Problem">
{`"So based on what you're telling me, here's what I'm
hearing — and tell me if I'm off base:

The surface issue is [their stated problem — e.g., 'your
Provider is clunky' or 'screening takes too long'].

But the bigger problem is that [reframe to TT's strength]:

→ If manual process pain: '...your recruiters are spending
  80% of their time on admin instead of actually talking to
  qualified candidates. That's not a tools problem — that's
  a capacity problem.'

→ If HRIS afterthought: '...your HRIS vendor built recruiting
  as a checkbox, not a product. So every time you need
  something recruiting-specific, you're working around a
  system that was never designed for it.'

→ If career page/brand gap: '...candidates are forming their
  first impression of [company] on a career page that doesn't
  represent who you actually are. And the ones who DO try to
  apply — how many drop off before finishing?'

→ If no visibility: '...you're making hiring decisions
  without any data. You don't know which sources produce
  actual hires, what your real cost-per-hire is, or where
  candidates are dropping off. That's flying blind.'

Does that resonate?"`}
          </ScriptBlock>
          <Callout type="info" title="Why the Reframe Matters">
            If you agree with their diagnosis ("yeah, your Provider is clunky"), any vendor can win. When you reframe to the BIGGER problem (capacity, candidate experience, data blindness), you position Service Alignment as the only solution that addresses the root cause.
          </Callout>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">Q6b</span>
            <span className="font-semibold text-stone-800 text-[14px]">The Most Important Question in the BAP</span>
          </h4>
          <ScriptBlock label="Confirm the Gap">
{`"Based on everything we've talked about — do you feel like
your team has the tools and bandwidth to solve this on
your own in the timeline you need?

Or is this something where you need a purpose-built system
to get there?"

[If they hedge:] "On a scale of 1 to 10, how capable is
your team of solving this alone?"

[If 8+:] "Then honestly — why are we talking? Something
brought you to this call."

[If 1-5:] "That's exactly what I was going to say. Let me
show you how we solve this."`}
          </ScriptBlock>
          <Callout type="warning" title="Do NOT Skip This">
            Pitching before confirming the gap → 80% loss rate to status quo. They must SAY they can't solve this alone. If they don't admit the gap, they'll default to "we'll just handle it internally" after the demo.
          </Callout>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">Q7</span>
            <span className="font-semibold text-stone-800 text-[14px]">How Do They Buy?</span>
          </h4>
          <ScriptBlock label="Map the Buying Process">
{`"If we found something that made sense, walk me through
what the process looks like on your end to get something
like this approved.

Is there a procurement process? Does it go to a board?
Or can you move forward independently?"

[If procurement:] "Got it. We're ISO 27001 and SOC2 ready.
Want me to send you the security questionnaire now so
that's not holding things up later?"

[If budget approval needed:] "Who approves the budget,
and what do they typically need to see? I can help you
build the internal case — I do this with teams all the
time."`}
          </ScriptBlock>
          <Callout type="info" title="Ed Kennaway's Move">
            Ed proactively asked for security questionnaires at Shore Trust and Zelis Group to prevent 3-6 month procurement delays. Get ahead of this in D2 — don't wait for it to surprise you in D3.
          </Callout>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">Q8</span>
            <span className="font-semibold text-stone-800 text-[14px]">Budget & Timeline</span>
          </h4>
          <ScriptBlock label="Budget Discovery — Service Alignment">
{`"When issues like this come up — the empty seats, the time
your team spends manually screening, the candidates you're
losing — how do you normally budget for solving them?

Do you have a set allocation for recruiting technology, or
is it more of a 'handle it when it becomes a problem'
situation?"

[Wait for answer]

"And when would you ideally want to be up and running? If
the goal is to be live before [their next hiring push /
fiscal year / contract renewal], implementation typically
takes about 3 weeks. Working backward, we'd need to have
the contract signed by [date].

Does that timeline work for you?"`}
          </ScriptBlock>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">Q8b</span>
            <span className="font-semibold text-stone-800 text-[14px]">Success Vision + Self-Assessment</span>
          </h4>
          <ScriptBlock label="Future State + Confidence Gap">
{`"Here's a big one — if we solve all of this, what does
your team look like in 12-18 months? Paint me that picture."

[Let them describe the ideal state. Don't interrupt.
The more vivid the vision, the stronger the deal.]

"Love that. Last question before we move on — on a scale
of 1 to 10, how capable is your team of getting there on
your own? Without bringing in a new platform?"

[If 7+:] "If your team could handle it, why hasn't it
been fixed already?"

[If 1-5:] "That's what I thought — and that's exactly
why we should keep talking."`}
          </ScriptBlock>
          <Callout type="info" title="Price Trinity Complete">
            You've now completed all 3 steps: (1) Bigger problem diagnosed in Q6, (2) ROI anchored in Q4b + Q8, (3) Confidence gap confirmed here in Q8b. Any price sensitivity should have surfaced by now. If it hasn't, you're in a strong position.
          </Callout>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">✓</span>
            <span className="font-semibold text-stone-800 text-[14px]">D2 Confirmation Close</span>
          </h4>
          <ScriptBlock label="Lock the Gap">
{`"OK so let me make sure I have this right:

You're currently [on ADP/manually tracking/using X] and
it's not solving the [reframed problem]. You've said your
team can't fix this alone in the timeline you need. Your
[boss/board/CFO] would need to approve, and you'd want
to be live by [date].

Is there anything I'm missing?

Great. What I'd like to do next is show you exactly how
we solve this — and I want to start by showing you why
we're in a position to help."`}
          </ScriptBlock>
        </div>
      </DocSection>

      {/* ═══════ D3: SOLUTION ═══════ */}
      <DocSection title="D3: Solution Presentation — Are we the best solution?">

        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">1</span>
            <span className="font-semibold text-stone-800 text-[14px]">Proven Results — Establish Credentials (3 min)</span>
          </h4>
          <ScriptBlock label="Why They Should Listen to You">
{`"Before I show you the platform, I want you to understand
why we're in a position to help.

Service Alignment was built because most Provider platforms were designed
for operations — tracking compliance, managing workflows.
But recruiting is a candidate-facing function. Your career
page, your employer brand, how fast you respond — that's
what determines whether top talent applies or bounces.

Here's what the data looks like:

We've had over 16 million candidates screened through our AI.
AI-screened candidates are 5.4 times more likely to get hired.
Recruiters using our platform see a 3x capacity increase —
they stop reading resumes and start talking to people.

Companies like Motorpoint cut time-to-hire by 58%. Lotus went
from 55 days to 23. Octavo hit 100% hiring manager adoption —
managers actually use the system, which I know is a problem
you mentioned.

So this isn't theoretical. It's what we see across thousands
of companies doing exactly what you're trying to do.

What questions do you have before I show you the platform?"`}
          </ScriptBlock>

          {/* Stat pills — subtle, inline */}
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { stat: '5.4×', label: 'AI hire rate' },
              { stat: '3×', label: 'Recruiter capacity' },
              { stat: '58%', label: 'TTH reduction' },
            ].map((d, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-200">
                <span className="text-[13px] font-bold text-stone-800">{d.stat}</span>
                <span className="text-[10px] text-stone-400">{d.label}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">2</span>
            <span className="font-semibold text-stone-800 text-[14px]">Clear Solution — The Treatment Plan (12 min)</span>
          </h4>
          <ScriptBlock label="Map Solution to Their Pain — Attract / Automate / Optimize">
{`"Based on what we uncovered — [restate their 2-3 diagnosed
problems] — let me show you how we solve each of these.

Service Alignment works across three pillars:"`}
          </ScriptBlock>

          <div className="mt-4 space-y-6">
            <div className="pt-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-0.5">Pillar 1</p>
              <p className="text-[14px] font-bold text-stone-800 mb-3">Attract</p>
              <ScriptBlock label="Career Site + Employer Brand + Job Distribution">
{`[Pull up their current career page — or lack of one]

"This is what candidates see right now when they look for
jobs at [company]. Now let me show you what it could look
like."

[Show a Service Alignment customer career site]

"This is a fully branded career site — mobile-first,
customizable, tells your employer brand story. Plus, every
job you post here automatically distributes to 128+ job
boards — Indeed, LinkedIn, Glassdoor, Google Jobs — for
free. No manual posting."`}
              </ScriptBlock>
            </div>

            <div className="pt-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-0.5">Pillar 2</p>
              <p className="text-[14px] font-bold text-stone-800 mb-3">Automate</p>
              <ScriptBlock label="AI Screening + Smart Schedule + Triggers">
{`"Now here's where it gets interesting. You mentioned
[screening takes forever / scheduling is back and forth /
unqualified applicants].

This is AI Copilot. When applications come in, it reads
every resume, scores candidates against your criteria, and
ranks them. Candidates who hit all your criteria are 5.4
times more likely to get hired.

For scheduling — Smart Schedule. The candidate picks a time
from your team's availability. No more email ping-pong.

And triggers — if a candidate sits in a stage too long,
the system automatically [sends a follow-up / flags the
hiring manager / moves them forward]. Nobody falls through
the cracks."`}
              </ScriptBlock>
            </div>

            <div className="pt-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-0.5">Pillar 3</p>
              <p className="text-[14px] font-bold text-stone-800 mb-3">Optimize</p>
              <ScriptBlock label="Analytics + Talent Pools + Continuous Improvement">
{`"And here's the part most teams don't have — visibility.

This dashboard shows you exactly where your hires come
from. Not applications — hires. So you can stop spending
money on job boards that aren't producing and double down
on what works.

And Connect — this is your talent pool. Every silver-
medalist candidate, every person who applied but wasn't
right for that role — they go into a pool you can search
and activate for future roles. One of our customers, Foot
Asylum, gets 17% of their hires from this pool alone.
That's hires you're not paying for on job boards or
through agencies."`}
              </ScriptBlock>
            </div>
          </div>

          <ScriptBlock label="Engagement Check After Each Pillar">
{`"What questions do you have about [this section]?"

NOT: "Do you have any questions?" (closed — invites 'no')

"What questions do you have?" (open — invites dialogue)

Ask after each pillar. Identify where they want depth.`}
          </ScriptBlock>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">3</span>
            <span className="font-semibold text-stone-800 text-[14px]">Timeline & Implementation (3 min)</span>
          </h4>
          <ScriptBlock label="Put Their Mind in the Future">
{`"Here's what the timeline looks like:

Week 1-2: We build out your career site, configure your
pipeline stages, set up integrations with your HRIS and
calendar, and migrate any existing candidate data.

Week 3: Your team gets trained — hands-on, not a recorded
webinar. We make sure every recruiter and hiring manager
knows how to use it.

By week 4, you're live and posting jobs.

Now — on your end, here's what we need for this to work:

1. A dedicated point of contact for implementation
2. Your job descriptions and any existing candidate data
3. 2-3 hours of your team's time for training

These are easy, but they're non-negotiable. The companies
that see the best results are the ones who invest those
first 3 weeks. Fair enough?"`}
          </ScriptBlock>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">3b</span>
            <span className="font-semibold text-stone-800 text-[14px]">Champion Enablement + Success Metrics</span>
          </h4>
          <ScriptBlock label="Arm the Champion (cs4) + Define Success (q11)">
{`"How can I help you build the internal case? What does
your [boss/CFO/board] typically need to see before they
approve something like this?"

[Listen for what they need — this shapes your follow-up:]
→ ROI calculation → build the cost-of-inaction calc together
→ Competitor comparison → send the battle card PDF
→ Reference call → connect them with a similar customer
→ Demo for decision-maker → schedule a focused 20-min exec demo
→ Security docs → send ISO 27001/SOC2 immediately

"And one more thing — how will you measure if this was
a success 6 months from now? What metrics matter most
to you?"

[Map their answers to TT capabilities:]
→ Time-to-fill → Analytics dashboard
→ Cost-per-hire → Source tracking
→ Candidate quality → AI screening + scorecards
→ Agency spend reduction → Connect talent pool
→ HM satisfaction → Mobile app + adoption metrics`}
          </ScriptBlock>
          <Callout type="info" title="Never Let the Champion Walk In Empty-Handed">
            The champion sells when you're not in the room. If they need ROI math, co-create it. If they need a deck, build it together. The less work they have to do, the more likely they are to sell internally.
          </Callout>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">4</span>
            <span className="font-semibold text-stone-800 text-[14px]">Price Presentation (2 min)</span>
          </h4>
          <ScriptBlock label="Pre-Price Technique">
{`"What questions do you have about how we solve your problems?"

[Let them ask, answer, then:]

"Great question. What OTHER questions do you have?"

[Sit in silence. Do NOT break it.]

[Keep asking until THEY ask:]

"How much does it cost?"

THAT is your signal. Their mind is working on how to
move forward. Now present price.`}
          </ScriptBlock>

          <ScriptBlock label="Presenting Price — Service Alignment">
{`"Our pricing is straightforward. It's a flat annual fee —
no per-seat charges, no per-user limits. Everyone on your
team can use it.

For a company your size, the investment is [$X] per year.
That breaks down to [$X/month].

Now remember — you told me you have [X] open roles, and
we talked about how each unfilled seat costs roughly
$400-500 per day. That means you're spending roughly
[$X,000] per month on vacancy costs alone. This investment
pays for itself in [X weeks] just on the time savings.

Are you clear on the pricing and how it breaks down?

[Wait for yes]

Great — let me walk you through the last part."`}
          </ScriptBlock>
        </div>
      </DocSection>

      {/* ═══════ D4: DECISION ═══════ */}
      <DocSection title="D4: Confirmation Close — No maybes allowed">

        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">Q12</span>
            <span className="font-semibold text-stone-800 text-[14px]">Trial Close — Confidence Check</span>
          </h4>
          <ScriptBlock label="The Most Important Number">
{`"Before I go into the formal alignment, I want to ask
you one question:

On a scale of 1 to 10, how confident are you that
Service Alignment is the right solution for [company]?"

[If 8+:] "Great — let's lock this in."

[If 5-7:] "What would need to be true for you to get
to an 8 or above? Let's address that right now."

[If 1-4:] "I appreciate the honesty. What's holding
you back? Because if this isn't a fit, I'd rather know
now than waste your time."`}
          </ScriptBlock>
          <Callout type="warning" title="This Is the Gate">
            If they can't get to an 8, you need more discovery — not more pitching. Go back to D2 and find the gap you missed. Pushing to close below 8 = DOA.
          </Callout>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">1</span>
            <span className="font-semibold text-stone-800 text-[14px]">The Alignment Checklist</span>
          </h4>
          <ScriptBlock label="Walk Through What Was Agreed">
{`"Before we wrap up, I want to make sure we're aligned.
Let me walk through what we've covered:

✅ Your team is currently [state the pain — 'manually
   screening, losing candidates, paying agencies, etc.']

✅ That's costing you roughly [$X per month] in
   productivity and vacancy costs

✅ You said your team can't solve this alone in the
   timeline you need

✅ Service Alignment solves this through [reference the 1-2
   pillars that resonated most]

✅ Implementation takes 3 weeks and you'd be live by
   [date]

✅ The investment is [$X/year], which pays for itself
   in [X weeks]

Does this all track?"`}
          </ScriptBlock>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">2</span>
            <span className="font-semibold text-stone-800 text-[14px]">The Close</span>
          </h4>
          <ScriptBlock label="Ask for the Business">
{`[If they confirm alignment:]

"Great. So what's the next step on your end to move
forward?"

[If they need approval:]

"Understood. How can I help you build the case? I've
helped teams put together the internal justification
dozens of times — I can co-author that with you so
when you walk into that conversation, you're armed
with the data."

[If they can decide now:]

"I can have the contract over to you within the hour.
If we get it signed by [date], we can start
implementation [next week] and have you live by
[target date].

Should I send it over?"`}
          </ScriptBlock>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">3</span>
            <span className="font-semibold text-stone-800 text-[14px]">Handling Final Resistance</span>
          </h4>
          <div className="space-y-4">
            <ScriptBlock label="'I need to think about it'">
{`"Totally fair. Can I ask — what specifically do you need
to think through? Is it the fit, the price, or the timing?

Because if it's fit — we can address that right now.
If it's price — let's talk about the ROI math.
If it's timing — let's find the right date and work
backward from there.

I just don't want this to be one of those things that
falls off your plate and the problem keeps costing you."`}
            </ScriptBlock>

            <ScriptBlock label="'It's too expensive'">
{`"I hear you. Let me ask this — what's the cost of NOT
solving this? You told me you have [X] open roles at
roughly $400-500/day each. That's [$X,000/month] in
vacancy costs.

Service Alignment is [$X/year]. So the system pays for itself
in [X weeks]. After that, it's saving you money every
single month.

Is it the total number that's the concern, or is it
more about the budget timing?"`}
            </ScriptBlock>

            <ScriptBlock label="'We're going with someone else'">
{`"Respect that. Can I ask — what tipped the scales?

Because here's what I see with teams that go with
[competitor]: [use battlecard knowledge — e.g., 'Lever
doesn't have a native career site builder' or 'ADP's
Provider is bolted onto payroll, it's not built for
recruiting'].

I'm not trying to change your mind — I just want to
make sure you're comparing apples to apples. If you've
looked at that and you're still confident, I respect it."`}
            </ScriptBlock>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-100 first:mt-0 first:pt-0 first:border-0">
          <h4 className="flex items-baseline gap-2.5 mb-3">
            <span className="text-[11px] font-mono font-bold text-stone-400 shrink-0">✓</span>
            <span className="font-semibold text-stone-800 text-[14px]">Post-Call: Lock the Next Step</span>
          </h4>
          <ScriptBlock label="Never End Without a Next Step">
{`"Before we hop off — let's get the next step locked in.

[If moving forward:] "I'll send the contract today. Can
we schedule a 15-minute call for [day] to walk through
it together?"

[If they need internal approval:] "Let's schedule a
follow-up for [date]. That gives you time to have the
conversation with [stakeholder]. I'll send you a
one-page summary you can forward to them."

[If evaluating others:] "When are you planning to make
a decision? Let's put a call on the calendar for right
after your last evaluation so I can answer any
comparison questions."`}
          </ScriptBlock>
          <Callout type="rule" title="Non-Negotiable Rule">
            EVERY call ends with a specific, scheduled next step. "I'll follow up next week" is not a next step. A calendar invite with a date, time, and agenda is a next step.
          </Callout>
        </div>
      </DocSection>

      {/* Quick Reference — clean stat pills */}
      <div className="mt-8 mb-16">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-4">Quick Reference — Data Points to Drop</p>
        <div className="flex flex-wrap gap-2">
          {[
            { stat: '5.4×', label: 'AI hire rate' },
            { stat: '3×', label: 'Recruiter capacity' },
            { stat: '16M+', label: 'Candidates screened' },
            { stat: '0.03%', label: 'AI criteria change' },
            { stat: '58%', label: 'TTH (Motorpoint)' },
            { stat: '55→23d', label: 'TTH (Lotus)' },
            { stat: '100%', label: 'HM adoption (Octavo)' },
            { stat: '17.1%', label: 'CRM hires (Foot Asylum)' },
            { stat: '$400+/d', label: 'Cost per vacancy' },
            { stat: '80%', label: 'Withdraw slow response' },
            { stat: '0.74%', label: 'App-to-hire rate' },
            { stat: '128+', label: 'Free job boards' },
          ].map((d, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-200">
              <span className="text-[12px] font-bold text-stone-700">{d.stat}</span>
              <span className="text-[9px] text-stone-400 uppercase">{d.label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
