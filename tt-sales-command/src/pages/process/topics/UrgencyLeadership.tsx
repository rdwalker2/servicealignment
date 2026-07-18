import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function UrgencyLeadership() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        stage="D1"
        title="Taking Leadership Position" 
        subtitle="The first 2 minutes of the call determine everything. Set the frame, set the agenda, take control." 
      />

      <DocSection title="Why Leadership Position Matters">
        <p>
          As soon as the call starts, you must ensure you don't lose control. Sales calls can be a waste of time for prospects, so more and more of them will jump in trying to take control so they can get the value they're looking for.
        </p>
        <p className="mt-3">
          <strong>You cannot help them. You cannot lead them to outcomes they wouldn't normally achieve if you allow them to control the call.</strong> Whoever is asking the most questions is actually leading the conversation — because they're causing the other person to talk.
        </p>
        <Callout type="rule" title="The Control Principle">
          If the prospect is asking all the questions, they're leading the call. If you're answering all the questions, you've lost. Take leadership position immediately by setting the agenda and getting confirmation.
        </Callout>
      </DocSection>

      <DocSection title="The Three-Step Leadership Framework">
        <div className="space-y-4 mt-2">
          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Step 1: Light Rapport Building</h4>
            <p className="text-[14px] text-stone-600">
              Don't be all business — but don't try to become their best friend either. Keep it brief and genuine. A comment about their city, the weather, or something visible in their background is enough.
            </p>
            <Callout type="warning" title="The Rapport Trap">
              Too much rapport building comes off as manipulative. It signals courtship, not competence. Remember: doctor's visit, not a date.
            </Callout>
          </div>

          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Step 2: Set the Agenda</h4>
            <p className="text-[14px] text-stone-600">
              Assure them that this call is going to be valuable to them and tell them exactly how you're going to make that happen. Frame yourself as someone who is there to help them build a plan — not to pitch your product.
            </p>
          </div>

          <div className="border-l-4 border-violet-400 pl-4 py-3 bg-violet-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Step 3: Get the Confirmation</h4>
            <p className="text-[14px] text-stone-600">
              Ask them to agree to the agenda. This micro-commitment gives you explicit permission to lead. Once they confirm, transition immediately into Objective #1.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="The Talk Track">
        <ScriptBlock label="Full Leadership Position Script">
          "Hello [prospect name]! How are you?

          So you're located in [city name]? How's the weather treating you all right now?

          Great. So are you ready to hop into the call?

          Ok, well this is how these calls go…

          I'll start off by asking you some questions to get an understanding of what's going on. Ultimately though, this time is for you, and the goal is that you come out of this conversation with a plan of action… even if that plan doesn't include us working together.

          I'm not here to just pitch you our stuff. We want to support you in reaching the outcomes you want to reach.

          If it does sound like we can help, and if we're a good fit together, I'll explain the system and platform we've got to offer and how they will help you, and exactly what you will receive.

          Then you can ask me any questions you may have, and at the end you can make a decision whether you want to be a part of it or not.

          Sound good?"
        </ScriptBlock>
      </DocSection>

      <DocSection title="Breaking Down the Script">
        <p>Every line in that script is intentional. Here's what each piece accomplishes:</p>
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg">
            <span className="text-lg mt-0.5">🤝</span>
            <div>
              <p className="font-medium text-stone-900">"How's the weather treating you?"</p>
              <p className="text-[13px] text-stone-500">Light rapport — not overdone, not skipped. Human without being manipulative.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg">
            <span className="text-lg mt-0.5">🗺️</span>
            <div>
              <p className="font-medium text-stone-900">"This is how these calls go…"</p>
              <p className="text-[13px] text-stone-500">Establishes you as the authority. You've done this before. You know the path. This creates trust instantly.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg">
            <span className="text-lg mt-0.5">🎯</span>
            <div>
              <p className="font-medium text-stone-900">"…a plan of action, even if that plan doesn't include us"</p>
              <p className="text-[13px] text-stone-500">This is push psychology. You're signaling willingness to walk away, which makes them pull you in. It sets the doctor's visit frame.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg">
            <span className="text-lg mt-0.5">🚪</span>
            <div>
              <p className="font-medium text-stone-900">"…you can make a decision whether you want to be a part of it or not"</p>
              <p className="text-[13px] text-stone-500">Establishes the expectation that a decision will be made on this call. You're pre-framing the close without being pushy.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg">
            <span className="text-lg mt-0.5">✅</span>
            <div>
              <p className="font-medium text-stone-900">"Sound good?"</p>
              <p className="text-[13px] text-stone-500">Gets the micro-commitment. Once they say yes, you have permission to lead. Transition immediately into the first objective.</p>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection title="Personal Stakes: The Emotional Layer">
        <p>
          Beyond the business problem, every buyer has <strong>personal stakes</strong> tied to solving (or failing to solve) this problem. This is the emotional layer that separates a "nice to have" evaluation from an "I need this solved" deal. The rational layer (data, cost-of-inaction, ROI) is covered elsewhere — this section is about what's at stake <em>for them personally</em>.
        </p>
        <Callout type="rule" title="Why Personal Stakes Matter">
          People buy emotionally and justify rationally. If you only surface the business case, you'll get "let me think about it." When you surface what's at stake for THEM — their credibility, their career, their reputation — you get urgency.
        </Callout>
      </DocSection>

      <DocSection title="Personal Stakes by Persona">
        <div className="space-y-5">
          <div className="border-l-4 border-rose-400 pl-4 py-3 bg-rose-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">HR Director Reporting to CFO</h4>
            <p className="text-sm text-stone-600 mb-2">Their credibility is tied to headcount targets and cost control. Every month they miss hiring targets, the CFO questions their department's effectiveness.</p>
            <ScriptBlock label="Personal Stakes Probe">
              "You mentioned the CFO is pressuring you on unfilled roles. If you continue with the current process and those roles stay open — what does that mean for you and your team? How does that conversation with the CFO go in the next quarterly review?"

              (Let them answer — they'll often reveal fear of budget cuts, loss of headcount, or being replaced.)

              "So your ability to show the CFO that you can hire efficiently and at lower cost than agencies — that's really about demonstrating the value of your team, isn't it?"
            </ScriptBlock>
          </div>

          <div className="border-l-4 border-violet-400 pl-4 py-3 bg-violet-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">TA Manager Reporting to VP of HR</h4>
            <p className="text-sm text-stone-600 mb-2">They were hired to professionalize recruiting. If the process is still broken 6 months in, their VP starts wondering if they made the right hire.</p>
            <ScriptBlock label="Personal Stakes Probe">
              "You said you were brought in to fix recruiting. When your VP of HR hired you, what did she expect to see by now? And are you where you need to be?"

              (This is personal — they'll either admit they're behind or get defensive. Either way, the urgency surfaces.)

              "What happens if you don't have the right infrastructure in place by year-end? Does the VP start looking at other options, or does the whole recruiting strategy get reconsidered?"
            </ScriptBlock>
          </div>

          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">CEO at a Growing Startup/Scale-Up</h4>
            <p className="text-sm text-stone-600 mb-2">Their ability to scale depends entirely on hiring velocity. Investors are watching. Board members are asking about headcount progress. Every unfilled role delays revenue.</p>
            <ScriptBlock label="Personal Stakes Probe">
              "You mentioned you raised your Series B and need to double headcount. When your board asks next quarter how hiring is tracking against plan — what do you want that answer to be?"

              (CEOs think in outcomes and board-level optics.)

              "If hiring falls behind and you miss your growth targets, how does that affect the next fundraise? Your valuation?"
            </ScriptBlock>
          </div>

          <div className="border-l-4 border-emerald-400 pl-4 py-3 bg-emerald-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">Office/Ops Manager Wearing Multiple Hats</h4>
            <p className="text-sm text-stone-600 mb-2">They handle HR, office management, onboarding, and recruiting all at once. Recruiting is the most painful because it's the least predictable and most time-consuming.</p>
            <ScriptBlock label="Personal Stakes Probe">
              "You're juggling a lot — HR, operations, recruiting. If the recruiting side continues to eat 10-15 hours of your week, what's the impact on everything else you're responsible for?"

              (They'll talk about balls being dropped, burnout, or asking for help.)

              "So this isn't just a recruiting problem — it's a quality-of-life problem for you. The more time recruiting consumes, the worse everything else gets. Is that a fair characterization?"
            </ScriptBlock>
          </div>
        </div>
      </DocSection>

      <DocSection title="The 'What's at Stake Personally' Framework">
        <p className="mb-3">Use this three-question framework to surface personal stakes without making the prospect feel interrogated. It works because each question naturally builds on the previous answer:</p>
        <ScriptBlock label="Three-Question Personal Stakes Flow">
          Question 1 — The Reporting Line:
          "Who are you reporting on this to? Who's watching whether this gets solved?"

          Question 2 — The Expectation Gap:
          "What does that person expect to see in the next [3/6/12] months? And where are you relative to that expectation?"

          Question 3 — The Consequence:
          "If that gap between where you are and where they expect you to be doesn't close — what happens? For the business, but also for you?"
        </ScriptBlock>
        <Callout type="warning" title="Handle With Care">
          Personal stakes probing requires trust. Don't lead with this — it comes AFTER you've established the business problem and they've given you the objective. If you jump to personal stakes too early, it feels manipulative. If you ask it at the right time, it feels like genuine concern.
        </Callout>
      </DocSection>

      <DocSection title="When the Prospect Opens Up: How to Respond">
        <p className="mb-3">When you successfully surface personal stakes, the prospect may become vulnerable. Here's how to handle each response pattern:</p>
        <div className="space-y-3">
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">"Honestly, my job might be on the line."</h4>
            <p className="text-sm text-stone-600"><strong>Respond:</strong> "I appreciate you sharing that. That's exactly why I want to make sure whatever plan we build actually solves this — because the stakes are real and I take that seriously." Then continue Discovery. Don't dwell on it, but reference it later when establishing urgency: "Given what's at stake for you personally..."</p>
          </div>
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">"It's frustrating but it's not career-threatening."</h4>
            <p className="text-sm text-stone-600"><strong>Respond:</strong> "Fair enough. But the frustration is real — and if it's consuming your time and energy, that has a compounding effect on everything else you're trying to accomplish, doesn't it?" Redirect to opportunity cost rather than fear.</p>
          </div>
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">"I'd rather not get into that."</h4>
            <p className="text-sm text-stone-600"><strong>Respond:</strong> "Totally fair. Let me ask it differently — if this problem were solved, what would that free you up to focus on? What would your day look like?" This gets to personal stakes through a positive frame instead of a fear frame.</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="What to Do After Confirmation">
        <p>
          Once they confirm the agenda, move directly into the first objective — their reason for being on the call. Do not pause, do not add more rapport, do not offer them a chance to take control back.
        </p>
        <ScriptBlock label="The Immediate Transition">
          Prospect: "Yeah, sounds good."

          You: "Great. So when people take time to hop on these calls with me, there's usually a problem they're trying to solve or a goal they're trying to achieve. Which is it for you?"
        </ScriptBlock>
        <Callout type="info" title="The Seamless Transition">
          Notice the flow: rapport → agenda → confirmation → first question. No gaps, no awkward pauses, no opportunity for the prospect to hijack the call. This is how a doctor operates — focused, professional, in control.
        </Callout>
      </DocSection>
    </div>
  );
}
