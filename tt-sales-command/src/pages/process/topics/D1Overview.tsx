import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function D1Overview() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        stage="D1"
        title="D1 Discovery Overview" 
        subtitle="Find the pain. Qualify the problem, not the prospect. Be the detective, not the pitcher." 
      />

      <DocSection title="The Purpose of D1">
        <p>
          The goal of Discovery is not to qualify the prospect for a demo — it is to <strong>qualify the problem</strong>. You must act as a detective to uncover the root cause of the buyer's broken process, and determine whether this problem is urgent enough for them to take action.
        </p>
        <p className="mt-3">
          D1 maps directly to <strong>Checkpoint 1: Do they need to act?</strong> This is the Urgency Test — the most important test you can run. It will help your prospects figure out whether this is a problem they should prioritize compared to all the other challenges they're dealing with.
        </p>
        <Callout type="rule" title="The 20/80 Rule">
          In D1, you should be talking 20% of the time and listening 80% of the time. If you find yourself pitching features, you have failed the Discovery stage.
        </Callout>
      </DocSection>

      <DocSection title="The Four Urgency Test Objectives">
        <p className="mb-4">These four steps can be repeated time and time again to get to the pain in each of your prospects — if that pain actually exists:</p>
        <div className="space-y-4">
          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">1. Their Objective</h4>
            <p className="text-[14px] text-stone-600">
              They scheduled and attended this meeting, spending time and energy with a stranger, for a reason. That is a huge tell. <em>What problem are they trying to solve or what goal are they trying to achieve?</em> This is the small domino that knocks down all the bigger dominoes.
            </p>
          </div>
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">2. Decision Makers</h4>
            <p className="text-[14px] text-stone-600">
              Who is responsible for solving this problem? Who owns it? Who has the authority to make decisions? Keep this question connected to their objective — think of it like a Venn diagram. If they stay connected, it works seamlessly every time.
            </p>
          </div>
          <div className="border-l-4 border-violet-400 pl-4 py-3 bg-violet-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">3. Current Reality</h4>
            <p className="text-[14px] text-stone-600">
              What have the main characters done to solve this problem so far, and why hasn't it worked at the level needed? If their efforts were working, they wouldn't still be experiencing the problem. This uncovers frustration and begins establishing the resource gap.
            </p>
          </div>
          <div className="border-l-4 border-rose-400 pl-4 py-3 bg-rose-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">4. Consequences &amp; Priority</h4>
            <p className="text-[14px] text-stone-600">
              What is the realistic worst-case scenario if they continue failing to solve this? Use the 1-10 priority scale to gut-check their stated pain against their urgency rating. Does the information match the number?
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Before the Four Objectives: Take Leadership">
        <p>
          Before diving into the four objectives, you must take leadership position at the top of the call. Sales calls can be a waste of time for prospects, and more and more will try to take control to ensure they get value.
        </p>
        <p className="mt-3">
          You cannot help them or lead them to outcomes they wouldn't normally achieve if you allow them to control the call. Set the agenda, assure them the call will be valuable, and get their confirmation.
        </p>
        <ScriptBlock label="Leadership Position Framework">
          1. Light rapport building (don't overdo it — too much feels manipulative)
          2. Set the agenda and explain the value they'll get
          3. Get confirmation: "Sound good?"
          4. Transition directly into Objective #1
        </ScriptBlock>
      </DocSection>

      <DocSection title="The Discovery Flow">
        <p>Each question must <strong>flow</strong> into the next. If these sound like separate, disconnected questions, you're not keeping the big picture together:</p>
        <div className="mt-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
          <ol className="space-y-2 text-[14px]">
            <li><strong>1.</strong> What problem are you trying to solve?</li>
            <li><strong>2.</strong> Who is responsible for solving that problem and who has the authority on how it gets solved?</li>
            <li><strong>3.</strong> What have those people already done to solve that problem and why hasn't it worked at the level needed?</li>
            <li><strong>4.</strong> If that trend continues and this problem doesn't get solved, realistically speaking, what's the worst thing that will happen?</li>
          </ol>
        </div>
        <Callout type="info" title="The Probing Rule">
          Probe at least 2-3 times on consequences! Use: "Tell me more about that...", "What did you mean when you said...?", or the Mirror technique — repeat back something they said, then shut up.
        </Callout>
      </DocSection>

      <DocSection title="What a GOOD vs BAD D1 Sounds Like at Teamtailor">
        <p className="mb-4">The difference between a deal that closes and one that stalls is usually decided in the first 25 minutes. Here's the contrast:</p>
        <div className="space-y-4">
          <div className="border-l-4 border-emerald-500 pl-4 py-3 bg-emerald-50/30 rounded-r-lg">
            <h4 className="font-bold text-emerald-800 mb-2">✅ A GOOD D1 — Rep Diagnoses the Problem</h4>
            <div className="text-[14px] text-stone-700 space-y-2">
              <p><strong>Rep:</strong> "When people take time to hop on these calls with me, there's usually a problem they're trying to solve or a goal they're trying to achieve. Which is it for you?"</p>
              <p><strong>Prospect:</strong> "We've been growing fast and we just can't keep up with hiring. We're losing candidates because our process is too slow."</p>
              <p><strong>Rep:</strong> "So the core issue is your hiring process can't keep pace with your growth and you're losing candidates along the way. Is that right?"</p>
              <p><strong>Prospect:</strong> "Yeah, exactly."</p>
              <p><strong>Rep:</strong> "Got it. Who's ultimately responsible for solving this hiring bottleneck?"</p>
              <p><strong>Prospect:</strong> "That's me — I report to our CFO and he's been on my case about unfilled roles."</p>
              <p><strong>Rep:</strong> "What have you done so far to try to speed things up?"</p>
              <p><strong>Prospect:</strong> "We've been using BambooHR's recruiting module, but it's basically a spreadsheet. We also tried posting on LinkedIn and Indeed manually, and we've used agencies for our senior roles."</p>
              <p><strong>Rep:</strong> "And if this trend continues — slow process, candidates dropping off, agency spend climbing — realistically what happens?"</p>
              <p><strong>Prospect:</strong> "We miss our growth targets. We're opening two new locations and if we can't staff them, we delay the launch. That's millions in revenue at risk."</p>
              <p className="mt-2 text-emerald-700 font-medium">Result: Clear problem, identified owner who reports to budget authority, failed attempts documented, quantified consequences. This deal advances.</p>
            </div>
          </div>

          <div className="border-l-4 border-rose-500 pl-4 py-3 bg-rose-50/30 rounded-r-lg">
            <h4 className="font-bold text-rose-800 mb-2">❌ A BAD D1 — Rep Pitches Instead of Diagnosing</h4>
            <div className="text-[14px] text-stone-700 space-y-2">
              <p><strong>Rep:</strong> "So let me tell you about Teamtailor — we're an all-in-one ATS with AI-powered screening, beautiful career sites, and we process over 6 million applications..."</p>
              <p><strong>Prospect:</strong> "That sounds interesting. Can you show me the career site builder?"</p>
              <p><strong>Rep:</strong> "Sure!" [Shares screen, demos for 20 minutes]</p>
              <p><strong>Prospect:</strong> "Cool, this looks nice. Let me talk to my team and get back to you."</p>
              <p className="mt-2 text-rose-700 font-medium">Result: No problem identified. No urgency established. No stakeholders mapped. No consequences surfaced. The prospect got a free demo and will ghost you. This deal is dead.</p>
            </div>
          </div>
        </div>
        <Callout type="warning" title="The Demo Trap">
          If a prospect asks to "see the product" during D1, that's them trying to take control. Respond: "Absolutely, and I want to show you exactly what's relevant to your situation. To do that well, I need to understand a few things first so I don't waste your time showing you features that don't matter. Fair enough?" Then continue Discovery.
        </Callout>
      </DocSection>

      <DocSection title="D1 Success Criteria Checklist">
        <p className="mb-4">Before ending D1 and advancing to D2, you must be able to answer <strong>all five</strong> of these. If you can't, you haven't finished Discovery:</p>
        <div className="space-y-2">
          <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-stone-400 mt-0.5 shrink-0">☐</span>
            <div>
              <p className="font-semibold text-stone-800">The Problem</p>
              <p className="text-[13px] text-stone-600">What specific hiring/recruiting problem are they trying to solve? Can you state it in one sentence?</p>
              <p className="text-[12px] text-stone-500 mt-1 italic">Example: "Their HRIS recruiting module can't handle volume and candidates drop off because there's no automation."</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-stone-400 mt-0.5 shrink-0">☐</span>
            <div>
              <p className="font-semibold text-stone-800">Who Owns It</p>
              <p className="text-[13px] text-stone-600">Who is responsible for solving this? Who do they report to? Who signs off on budget?</p>
              <p className="text-[12px] text-stone-500 mt-1 italic">Example: "Sarah, HR Director, owns it. Reports to CFO who is pressuring her on headcount costs."</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-stone-400 mt-0.5 shrink-0">☐</span>
            <div>
              <p className="font-semibold text-stone-800">What They've Tried</p>
              <p className="text-[13px] text-stone-600">What solutions, tools, or approaches have they used? Why didn't those work?</p>
              <p className="text-[12px] text-stone-500 mt-1 italic">Example: "Using ADP's recruiting module + manual Indeed postings. No automation, no employer brand, spending $8K/month on agencies."</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-stone-400 mt-0.5 shrink-0">☐</span>
            <div>
              <p className="font-semibold text-stone-800">Consequences of Inaction</p>
              <p className="text-[13px] text-stone-600">What happens if this doesn't get solved? Have they quantified the impact?</p>
              <p className="text-[12px] text-stone-500 mt-1 italic">Example: "They delay two store openings — each unfilled role costs ~$400-500/day in lost productivity. 10 open roles = $4-5K/day bleeding."</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-stone-400 mt-0.5 shrink-0">☐</span>
            <div>
              <p className="font-semibold text-stone-800">Timeline Pressure</p>
              <p className="text-[13px] text-stone-600">Is there a forcing event? A date by which this must be solved?</p>
              <p className="text-[12px] text-stone-500 mt-1 italic">Example: "New locations opening in Q3 — they need 50 hires in 90 days or they delay the launch."</p>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection title="How the D1 Discovery Flow Sounds in a TT Context">
        <p>The four objectives aren't standalone questions — they're a connected diagnostic conversation. Here's how they flow together in a typical Teamtailor deal (for full diagnostic questions, see the Date vs. Doctor topic):</p>
        <ScriptBlock label="D1 Flow Example: Mid-Market HR Director">
          OBJECTIVE: "When people take time to hop on these calls, there's usually a problem they're trying to solve or a goal they're trying to achieve. Which is it for you?"

          → "We're hiring 15 roles right now and our process is a mess. We're getting hundreds of applicants but it takes forever to screen them and our hiring managers are frustrated."

          DECISION MAKERS: "Who's ultimately responsible for solving this hiring bottleneck you're describing?"

          → "That falls on me. But our VP of Ops is the one pushing for it because he can't get his teams staffed."

          → "And who would ultimately make the decision on how this gets solved — in terms of approving a new system?"

          → "I'd make the recommendation, but our CFO would need to sign off on anything over $10K."

          CURRENT REALITY: "What have you and the VP of Ops done so far to try to fix this screening and speed issue?"

          → "We built a careers page on our website, but it looks terrible and barely gets traffic. We post on Indeed and LinkedIn manually. And for senior roles we just use agencies because we don't have time."

          → "And why hasn't that gotten you to where you need to be?"

          → "It's all manual. I'm spending 3 hours a day just reading resumes. And agencies cost us $20K per hire for the senior roles."

          CONSEQUENCES: "If this trend continues — manual screening eating your day, agencies burning budget, hiring managers waiting — realistically, what's the worst-case scenario?"

          → "We fall behind on our growth plan. We were supposed to open a new office in September but we can't do that if we can't staff it. And honestly, my VP of Ops is starting to lose patience with me."
        </ScriptBlock>
        <Callout type="info" title="Notice the Flow">
          Each answer naturally leads to the next question. The rep never breaks the thread. By the end, they know the problem (manual screening, slow process), who owns it (HR Director, VP Ops pushing, CFO approves budget), what's failed (manual posting, ugly career site, expensive agencies), and the consequences (delayed office opening, career risk). That's a complete D1.
        </Callout>
      </DocSection>

      <DocSection title="D1 → D2 Handoff: Setting Up the Gap Test">
        <p>
          Everything you learn in D1 becomes ammunition for D2. The Gap Test in D2 will diagnose <em>why</em> their current approach is failing and determine if they can solve it themselves. Here's what D1 intel feeds into D2:
        </p>
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <span className="font-bold text-blue-600 text-sm mt-0.5 shrink-0">D1:</span>
            <div>
              <p className="text-stone-700">"We're using BambooHR's recruiting module"</p>
              <p className="text-[13px] text-stone-500 mt-1"><strong>→ D2 Gap:</strong> Diagnose the specific limitations — no AI screening, no career site, no automation, no analytics. This becomes the Problem Diagnosis gap.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <span className="font-bold text-blue-600 text-sm mt-0.5 shrink-0">D1:</span>
            <div>
              <p className="text-stone-700">"We spend $8K/month on agencies for senior roles"</p>
              <p className="text-[13px] text-stone-500 mt-1"><strong>→ D2 Gap:</strong> Use this in Budget &amp; Timeline gap — $96K/year in agency fees is 6-8x what a Teamtailor subscription costs. The ROI case writes itself.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <span className="font-bold text-blue-600 text-sm mt-0.5 shrink-0">D1:</span>
            <div>
              <p className="text-stone-700">"CFO needs to sign off on anything over $10K"</p>
              <p className="text-[13px] text-stone-500 mt-1"><strong>→ D2 Gap:</strong> Feed this into Buying Process gap — you now know the approval threshold and the financial decision maker. Build the BAP with CFO-facing ROI language.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <span className="font-bold text-blue-600 text-sm mt-0.5 shrink-0">D1:</span>
            <div>
              <p className="text-stone-700">"New office opening in September — need 50 hires"</p>
              <p className="text-[13px] text-stone-500 mt-1"><strong>→ D2 Gap:</strong> This is the forcing event. Use it to establish timeline pressure in every subsequent conversation. "Given your September deadline, when would you need to have a solution in place to hit that target?"</p>
            </div>
          </div>
        </div>
        <Callout type="rule" title="The Handoff Rule">
          If you can't map at least 3 of these D1 findings to specific D2 Gap categories, you haven't dug deep enough. Go back and probe. A thin D1 creates a weak D2, which leads to a DOA proposal.
        </Callout>
      </DocSection>

      <DocSection title="Gating: Checkpoint 1 (Need &amp; Urgency)">
        <p>
          You cannot advance a deal to D2 without passing <strong>Checkpoint 1: The Urgency Test</strong>. After gathering all discovery information, share the BAP summary and establish the checkpoint clearly and directly.
        </p>
        <ScriptBlock label="Establishing the Checkpoint">
          "So [Name], essentially this is an urgent priority for you."
        </ScriptBlock>
        <ScriptBlock label="TT-Specific Checkpoint Example">
          "So Sarah, let me make sure I have this right. You're trying to fill 15 roles, your current process is entirely manual, your hiring managers are frustrated with how long it takes, you're spending $8K a month on agencies, and if this doesn't get solved by September you're going to delay your office opening. Essentially, this is an urgent priority for you — is that fair to say?"
        </ScriptBlock>
        <Callout type="warning" title="Checkpoint 1 Requirements">
          The prospect must explicitly acknowledge severe pain and the consequences of inaction. If they say "It would be nice to have," the deal dies here. This prevents the <strong>Timing</strong> and <strong>Competition</strong> fatalities from killing your deal later.
        </Callout>
        <p className="mt-3 text-stone-600 italic">
          Sales is leadership. We are here to lead our prospects to outcomes they wouldn't normally be able to achieve. That is what being a trusted advisor is all about. That is how important you are to the lives of your prospects.
        </p>
      </DocSection>
    </div>
  );
}
