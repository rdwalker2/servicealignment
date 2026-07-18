import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function UrgencyCurrentReality() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        stage="D1"
        title="Urgency Test: Current Reality" 
        subtitle="Unpack what they've already tried, why it failed, and start building the case that they need outside help." 
      />

      <DocSection title="Purpose of This Step">
        <p>
          At this point in the process, we have the problem they're trying to solve and we know the main characters. Next, we want to identify what those main characters have done to try to solve this problem up until now — and <strong>why those actions haven't worked at the level needed</strong>.
        </p>
        <p className="mt-3">
          Because if those efforts were working, they wouldn't still be experiencing the problem. They wouldn't be on this call.
        </p>
      </DocSection>

      <DocSection title="Three Things This Question Unlocks">
        <ol className="list-decimal pl-5 space-y-3 mt-3 text-stone-700">
          <li>
            <strong>Uncovers pain through frustration:</strong> As you tap into their frustration with past efforts and their sense of helplessness, you surface real emotional pain that drives action.
          </li>
          <li>
            <strong>Seeds the Diagnosis phase:</strong> Their answers start to reveal what the real problem is — the one you'll diagnose in D2. You're gathering intel for problem discovery.
          </li>
          <li>
            <strong>Begins building the case for outside help:</strong> This is the start of them coming to terms with their low ability to solve this on their own — if that is in fact the case. This sets up Checkpoint 2.
          </li>
        </ol>
      </DocSection>

      <DocSection title="The Core Question">
        <ScriptBlock label="Current Reality Question">{`
          "I know we've talked about a couple of things already, but what else have you guys done — or what are you currently doing — to solve this [specific problem]? And why isn't it working at the level needed?"
        `}</ScriptBlock>
        <Callout type="info" title="Flow is Everything">
          This question should flow naturally from the Decision Makers step. The sequence is: What's the problem → Who owns it → What have they already done about it? Each question is the logical next step.
        </Callout>
      </DocSection>

      <DocSection title="The Five Provider/Hiring Response Patterns">
        <p className="mb-4">In Provider and hiring conversations, prospects almost always describe their current reality using one of these five patterns. Each one requires a specific follow-up to expose the gap:</p>
        
        <div className="space-y-5">
          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">Pattern 1: "We added a careers page to our website"</h4>
            <p className="text-sm text-stone-600 mb-3">They built a static page on WordPress, Squarespace, or their company site. It lists jobs but does nothing to attract, engage, or convert candidates.</p>
            <ScriptBlock label="Follow-Up Script">{`
              "Walk me through what happens after someone lands on that careers page. Can they apply directly? Does the application go into a system, or does it hit someone's inbox?"

              (They'll usually say it goes to an email inbox or a shared folder.)

              "So when you have 200 applicants for a role, someone is manually reading through all of those emails to find the right 10 to interview?"

              (Pause — let them feel the weight of that.)

              "How many hours a week would you say that consumes?"
            `}</ScriptBlock>
            <Callout type="info" title="What You're Exposing">
              No employer brand, no SEO, no conversion optimization, no applicant tracking. Their "careers page" is a dead end that forces manual work. Companies like Motorpoint saw a 58% reduction in time-to-hire by replacing this approach with an integrated career site and Provider.
            </Callout>
          </div>

          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">Pattern 2: "We've been using our HRIS's Provider module"</h4>
            <p className="text-sm text-stone-600 mb-3">They're on ADP, Paycom, BambooHR, or similar — and using the recruiting add-on that was never built to be a real Provider.</p>
            <ScriptBlock label="Follow-Up Script">{`
              "A lot of the people I talk to are in the same situation — using the recruiting piece that came with their payroll or HR system. Can I ask, when a new application comes in, does that system automatically screen or rank the candidate for you, or are you reviewing each one manually?"

              (Almost always manual.)

              "And what about your hiring managers — are they logging into that system to review candidates and leave feedback, or does that happen over email and Slack?"

              (Usually email/Slack — fragmented.)

              "So you're essentially running two parallel processes — one in the system for compliance and one outside the system to actually get work done?"
            `}</ScriptBlock>
            <Callout type="info" title="What You're Exposing">
              HRIS recruiting modules are checkbox features — they exist so the vendor can say "we do recruiting" but they lack AI screening, workflow automation, career site builders, and hiring manager collaboration. The prospect is maintaining a system of record that doesn't help them actually recruit.
            </Callout>
          </div>

          <div className="border-l-4 border-violet-400 pl-4 py-3 bg-violet-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">Pattern 3: "We post on Indeed/LinkedIn manually"</h4>
            <p className="text-sm text-stone-600 mb-3">They're logging into job boards one at a time, copying and pasting job descriptions, and managing responses across multiple platforms.</p>
            <ScriptBlock label="Follow-Up Script">{`
              "How many job boards are you posting to? And when applications come in from Indeed vs. LinkedIn vs. your website — do those all land in one place or are you checking multiple inboxes?"

              (Multiple inboxes, almost always.)

              "So if your CEO asks 'how many total applicants do we have for the VP of Sales role,' can you answer that in under 60 seconds right now?"

              (No — they'd have to check 3-4 different places.)

              "How confident are you that no qualified candidates have slipped through the cracks in that process?"
            `}</ScriptBlock>
            <Callout type="info" title="What You're Exposing">
              No centralized pipeline, no source tracking, no analytics on which channels actually produce hires. They're spending money on job boards with zero visibility into ROI. When 80% of candidates withdraw from slow communication processes, fragmented systems accelerate candidate drop-off.
            </Callout>
          </div>

          <div className="border-l-4 border-emerald-400 pl-4 py-3 bg-emerald-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">Pattern 4: "We hired a recruiter"</h4>
            <p className="text-sm text-stone-600 mb-3">They added headcount to solve a process problem — throwing a person at a broken system instead of fixing the system.</p>
            <ScriptBlock label="Follow-Up Script">{`
              "That's great that you invested in dedicated recruiting support. What tools is that recruiter using day-to-day to manage candidates and communicate with hiring managers?"

              (Often: spreadsheets, email, maybe the HRIS module.)

              "So you added a person, but they're working with the same tools and process that wasn't working before. Has the recruiter been able to get you to the hiring velocity you need?"

              (Usually: helped, but not enough — they're overwhelmed.)

              "If you could give that recruiter a system that automated the screening, managed the pipeline, and gave hiring managers self-serve access — how much more capacity would that free up?"
            `}</ScriptBlock>
            <Callout type="info" title="What You're Exposing">
              The recruiter is a band-aid on a process problem. Without the right technology, one recruiter can handle ~15-20 open roles. With AI screening and automation, that same recruiter can handle 3x that capacity. The issue isn't headcount — it's infrastructure.
            </Callout>
          </div>

          <div className="border-l-4 border-rose-400 pl-4 py-3 bg-rose-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">Pattern 5: "We use agencies"</h4>
            <p className="text-sm text-stone-600 mb-3">They've outsourced recruiting entirely or for hard-to-fill roles. This is often the most expensive "current reality" and the easiest ROI case.</p>
            <ScriptBlock label="Follow-Up Script">{`
              "How many hires did you make through agencies last year, and roughly what did that cost?"

              (Listen carefully — this is your ROI anchor.)

              "At $15-25K per hire through an agency, that's a significant investment. If you could make even half of those hires directly — through your own career site, your own employer brand, your own pipeline — what would that save you annually?"

              (Let them do the math out loud.)

              "What's preventing you from building that direct hiring capability today?"
            `}</ScriptBlock>
            <Callout type="info" title="What You're Exposing">
              Agency dependency is a symptom of not having the infrastructure to attract and engage candidates directly. Companies like Foot Asylum reduced agency dependency by building their employer brand and direct application pipeline — 17.1% of their hires now come through their own CRM and nurture campaigns. The agency fee conversation often becomes the single strongest ROI argument in the deal.
            </Callout>
          </div>
        </div>
      </DocSection>

      <DocSection title="Current Reality Diagnostic Checklist">
        <p className="mb-4">After they describe their current approach, use this checklist to map their hiring infrastructure. This isn't about diagnosing root causes yet (that's D2) — it's about documenting the <strong>current state</strong> so you have a complete picture:</p>
        <div className="space-y-2">
          <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-stone-400 mt-0.5 shrink-0">☐</span>
            <div>
              <p className="font-semibold text-stone-800">Career Site</p>
              <p className="text-[13px] text-stone-600">Do they have one? Is it branded? Is it a standalone page or embedded in their HRIS? Do candidates actually apply through it?</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-stone-400 mt-0.5 shrink-0">☐</span>
            <div>
              <p className="font-semibold text-stone-800">Application Flow</p>
              <p className="text-[13px] text-stone-600">Where do applications land? One system or multiple inboxes? How long does it take to get an applicant from "applied" to "first response"?</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-stone-400 mt-0.5 shrink-0">☐</span>
            <div>
              <p className="font-semibold text-stone-800">Screening Process</p>
              <p className="text-[13px] text-stone-600">Manual or automated? Who screens? How long does it take per candidate? Are they using any AI or scoring?</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-stone-400 mt-0.5 shrink-0">☐</span>
            <div>
              <p className="font-semibold text-stone-800">Hiring Manager Involvement</p>
              <p className="text-[13px] text-stone-600">How do hiring managers review candidates? Do they log into a system or get email forwards? How do they provide feedback?</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-stone-400 mt-0.5 shrink-0">☐</span>
            <div>
              <p className="font-semibold text-stone-800">Source Channels</p>
              <p className="text-[13px] text-stone-600">Where do candidates come from? Job boards, agencies, referrals, career site, social? Do they know which sources produce the best hires?</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-stone-400 mt-0.5 shrink-0">☐</span>
            <div>
              <p className="font-semibold text-stone-800">Existing Technology</p>
              <p className="text-[13px] text-stone-600">What's their current tech stack? HRIS with recruiting add-on, standalone Provider, spreadsheets? Are they locked into a contract?</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-stone-400 mt-0.5 shrink-0">☐</span>
            <div>
              <p className="font-semibold text-stone-800">Agency Dependency</p>
              <p className="text-[13px] text-stone-600">Do they use agencies? For what roles? How many hires per year? What's the per-hire cost? What percentage of total hires come from agencies?</p>
            </div>
          </div>
        </div>
        <Callout type="rule" title="Document, Don't Diagnose">
          At this stage you're building a map of their current state — not prescribing a solution. Save the diagnosis for D2. Your goal here is to make them <em>feel</em> how fragmented and manual their process is by walking through it step by step.
        </Callout>
      </DocSection>

      <DocSection title="The Vendor/Competitor Wedge">
        <p>
          Once you get their initial answer, probe deeper into their existing resources:
        </p>
        <ScriptBlock label="Follow-Up: Past Purchases">{`
          "Have you guys ever purchased something like this before?"

          If NO: "Why not? Has there been a specific reason you haven't looked at outside solutions before?"

          If YES: "What worked well with those solutions, and what didn't work well?"
        `}</ScriptBlock>
        <p className="mt-4">
          This is where you start driving a wedge — not by badmouthing competitors, but by connecting the dots for your prospect:
        </p>
        <Callout type="rule" title="The Wedge Principle">
          "If your existing resources could have solved this, they would have already. But the problem still exists — so what are we going to do about it?" This realization is key to getting them to reconsider their current approach. For specific competitive wedge scripts by vendor, see the Gap: Other Vendors topic in D2.
        </Callout>
      </DocSection>

      <DocSection title="The Three Response Patterns">
        <p className="mb-4">When you consistently ask these questions, you'll consistently get one of three responses:</p>
        <div className="space-y-3">
          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">1. They've been trying to fix it internally</h4>
            <p className="text-sm text-stone-600">They've been attempting self-repairs or using internal resources. <strong>Probe:</strong> "Why hasn't that gotten you to where you need to be?" This exposes the gap in their internal capabilities.</p>
          </div>
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">2. They've been using another vendor</h4>
            <p className="text-sm text-stone-600">They have an existing provider. <strong>Probe:</strong> "You've been using them — why do you think this issue hasn't been fully resolved yet?" Forces them to verbalize doubts they already have.</p>
          </div>
          <div className="border-l-4 border-emerald-400 pl-4 py-3 bg-emerald-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">3. They haven't tried anything yet</h4>
            <p className="text-sm text-stone-600">It's a new problem or they've been ignoring it. <strong>Probe:</strong> "Is this really not painful enough to have done anything about yet? Or has the pain come on suddenly?" This helps you gauge real urgency.</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Why 'They Like Their Current Vendor' Isn't a Dead End">
        <p>
          If they tell you their current vendor is doing a great job, don't force the conversation. Instead:
        </p>
        <ScriptBlock label="When They Praise Their Current Vendor">{`
          "If your current [vendor/provider] is doing a great job, why are you looking at other solutions or taking the time to meet with me?"
        `}</ScriptBlock>
        <p className="mt-3">This reveals one of two things:</p>
        <ol className="list-decimal pl-5 space-y-2 mt-2 text-stone-700">
          <li><strong>Compliance requirement:</strong> They just need multiple bids. Now you know your chances are lower and can decide how to invest your time.</li>
          <li><strong>Hidden concerns:</strong> They actually have doubts about their current provider but haven't admitted them yet. This question cracks that open.</li>
        </ol>
        <Callout type="warning" title="Pipeline Hygiene">
          This isn't about converting everyone. It's about cleaning your pipeline so you only spend time on winnable opportunities. As you focus on the right deals, your close rate increases dramatically.
        </Callout>
      </DocSection>

      <DocSection title="Probing Techniques">
        <div className="space-y-2 mt-2">
          <div className="flex items-start gap-3 py-2">
            <span className="font-bold text-blue-600 text-sm mt-0.5 shrink-0">EXPAND:</span>
            <span className="text-stone-700">"Tell me more about that..."</span>
          </div>
          <div className="flex items-start gap-3 py-2">
            <span className="font-bold text-blue-600 text-sm mt-0.5 shrink-0">CLARIFY:</span>
            <span className="text-stone-700">"What did you mean when you said [X]?"</span>
          </div>
          <div className="flex items-start gap-3 py-2">
            <span className="font-bold text-blue-600 text-sm mt-0.5 shrink-0">MIRROR:</span>
            <span className="text-stone-700">Repeat back something they said, then stop talking. Let them fill the silence.</span>
          </div>
          <div className="flex items-start gap-3 py-2">
            <span className="font-bold text-blue-600 text-sm mt-0.5 shrink-0">CONTRAST:</span>
            <span className="text-stone-700">"You mentioned [vendor] has been helping — but the problem is still here. What's missing?"</span>
          </div>
        </div>
      </DocSection>
    </div>
  );
}
