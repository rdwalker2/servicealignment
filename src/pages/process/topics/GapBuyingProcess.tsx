import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function GapBuyingProcess() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        stage="D2"
        title="Gap Test: Buying Process" 
        subtitle="Map their internal approval workflow, classify the buyer type, and create natural deadlines that serve them." 
      />

      <DocSection title="Where We Are in the Process">
        <p>So far in the Gap Test, we've:</p>
        <ol className="list-decimal pl-5 space-y-2 mt-3 text-stone-700">
          <li>Figured out if they're using other vendors and what they believe the problem is with their existing solutions.</li>
          <li>Reframed the problem by showing them the bigger issue that aligns with our solution's special sauce.</li>
        </ol>
        <p className="mt-3">
          At this point, they should be realizing: <em>{`"If we don't choose this company, we're not going to actually solve the real problem or achieve the outcomes we want."`}</em>
        </p>
        <p className="mt-3">
          Now it's time to understand <strong>how they make buying decisions</strong> — so you can align your strategy with their internal process and avoid deals getting stuck in approval limbo.
        </p>
      </DocSection>

      <DocSection title="Why This Step Is Critical">
        <div className="space-y-3 mt-2">
          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">💰 Money Loves Speed</h4>
            <p className="text-sm text-stone-600">If you don't understand their process and timeline, you can't align your strategy to make it easier for them to approve and move forward quickly.</p>
          </div>
          <div className="border-l-4 border-rose-400 pl-4 py-3 bg-rose-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">⏳ Time Kills All Deals</h4>
            <p className="text-sm text-stone-600">If you can help them navigate their internal approval process faster, you increase the chances of getting the deal closed before it gets delayed, lost in red tape, or forgotten about.</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="TT Buying Process Map by Company Size">
        <p className="mb-4">The buying process looks very different depending on company size. Know which pattern you're in so you can set accurate expectations and run the right plays:</p>
        <div className="space-y-4">
          <div className="border-l-4 border-cyan-400 pl-4 py-3 bg-cyan-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">SMB (50–200 FTE) — 1-2 Week Cycle</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-stone-700">
              <li><strong>Decision Maker:</strong> HR Director or Office/Ops Manager</li>
              <li><strong>Budget Approver:</strong> CEO/CFO (often the same person)</li>
              <li><strong>IT Review:</strong> Minimal — SSO/security check only</li>
              <li><strong>Typical Process:</strong> HR Director finds TT → gets CEO buy-in on a 30-min demo → signs within 1-2 weeks</li>
            </ul>
            <ScriptBlock label="SMB Process Discovery">
              {`"It sounds like you're the one driving this evaluation. Is there anyone else who would need to sign off on a new recruiting platform, or is this your call?

Usually with companies your size, the HR lead runs the evaluation and the CEO or CFO gives the final approval. Is that how it works for you?

If so, would it make sense to get them on the next call so we can address any questions they have and keep this moving?"`}
            </ScriptBlock>
          </div>

          <div className="border-l-4 border-violet-400 pl-4 py-3 bg-violet-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">Mid-Market (200–1000 FTE) — 4-6 Week Cycle</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-stone-700">
              <li><strong>Champion:</strong> TA Manager or HR Director</li>
              <li><strong>Sponsor:</strong> VP HR or CHRO</li>
              <li><strong>Additional Stakeholders:</strong> Procurement reviews contract, IT does security assessment</li>
              <li><strong>Typical Process:</strong> TA Manager champions → VP HR sponsors → Procurement negotiates → IT reviews → signed in 4-6 weeks</li>
            </ul>
            <ScriptBlock label="Mid-Market Process Discovery">
              {`"In a company your size, these decisions usually involve a few people. Help me understand — who else beyond you would need to weigh in?

Specifically: does this go through procurement? Will IT need to do a security review? And who actually signs the contract — is that your VP of HR or does it go higher?

The reason I ask is so we can get ahead of those steps. I've seen deals like this stall for weeks when IT or procurement gets involved late. If we loop them in now, we can run those reviews in parallel."`}
            </ScriptBlock>
          </div>

          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">Enterprise (1000+ FTE) — 8-12 Week Cycle</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-stone-700">
              <li><strong>Sponsor:</strong> TA Director, VP HR, or CHRO</li>
              <li><strong>Process:</strong> Procurement runs RFP, IT does full security review, Legal reviews DPA/GDPR</li>
              <li><strong>Example:</strong> Savills (15K employees) — required full procurement cycle, IT security assessment, Legal DPA review, GDPR compliance verification</li>
            </ul>
            <ScriptBlock label="Enterprise Process Discovery">
              {`"With an organization your size, I know there's usually a formal procurement process. Can you walk me through what that looks like?

Specifically — will this go through an RFP? Does your IT team need to complete a security questionnaire? And given you're processing candidate data, will Legal need to review a Data Processing Agreement?

The reason I ask is so we can get ahead of those steps. We have a pre-built security questionnaire, SOC 2 documentation, and a GDPR-compliant DPA ready to go — so we can run those reviews in parallel rather than sequentially. That's how companies like Savills, with 15,000 employees, moved through procurement without it becoming a 6-month process."`}
            </ScriptBlock>
          </div>
        </div>
      </DocSection>

      <DocSection title="Identifying the Buying Process">
        <p>
          Earlier in the Urgency Test (Decision Makers step), we identified who cares about the issue. Now we go deeper — understanding the mechanics of how purchases actually get approved.
        </p>
        <ScriptBlock label="Buying Process Questions">
          {`"What is your process for purchasing a solution like this?"

"Who does this purchase have to go through?"

"How many people need to approve it?"

"What does your internal process look like from approval to signing?"`}
        </ScriptBlock>
        <Callout type="warning" title="If You Don't Ask, You're Flying Blind">
          This is how you take control of the process rather than waiting around, wondering why things are stuck. Without this information, you'll send a proposal and then hear crickets for weeks.
        </Callout>
      </DocSection>

      <DocSection title="Reactive vs. Proactive Buyers">
        <p className="mb-4">Apply this label to every prospect in your pipeline — it fundamentally shapes how you engage them:</p>
        <div className="space-y-3">
          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Reactive Buyer</h4>
            <p className="text-sm text-stone-600">Only takes action when a major issue forces them to. They respond to crises. They don't plan ahead.</p>
            <p className="text-sm text-stone-500 mt-1"><strong>What this means for you:</strong> Urgency is high but they may not have budget allocated. Decision-making may be fast but chaotic.</p>
          </div>
          <div className="border-l-4 border-emerald-400 pl-4 py-3 bg-emerald-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Proactive Buyer</h4>
            <p className="text-sm text-stone-600">Plans ahead and budgets for maintenance or improvements before things become critical. They think long-term.</p>
            <p className="text-sm text-stone-500 mt-1"><strong>What this means for you:</strong> They likely have budget, a defined process, and may already be comparing vendors. Higher long-term value as a customer.</p>
          </div>
        </div>
        <ScriptBlock label="Classifying the Buyer">
          {`"Do you normally have budget allocated for solutions like this, or is this something that comes up and you handle it when it arises?"

"Would you prefer to have a more proactive plan in place going forward — or are you comfortable staying reactive?"`}
        </ScriptBlock>
        <Callout type="info" title="Long-Term Value">
          We don't want just a sale — we want a long-term client. Identifying whether they're reactive or proactive helps you understand their lifetime value and shape your ongoing relationship strategy.
        </Callout>
      </DocSection>

      <DocSection title="Timeline Expectations &amp; Natural Deadlines">
        <p>Shift the focus to when they need this solved:</p>
        <ScriptBlock label="Timeline Questions">
          {`"When would you like this work to be completed?"

"If you say 'as soon as possible' — what does that really mean? Is there a hard deadline?"

"Is there an event, a date, or a season driving this timeline?"`}
        </ScriptBlock>
        <p className="mt-4">
          Once you get a clear answer, <strong>work backward</strong> to create a natural signing deadline:
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2 text-stone-700">
          <li>How long will the work / onboarding / implementation take?</li>
          <li>How soon is your team available to start?</li>
          <li>What's the latest they can sign for you to meet their deadline?</li>
        </ul>
        <ScriptBlock label="Setting the Natural Deadline">
          {`"Based on everything we've discussed, we would need to have the agreement signed by [date] so we can get you into our schedule and have this completed by [their deadline].

Does that timeline work for you?"`}
        </ScriptBlock>
        <Callout type="success" title="Why This Works">
          You're not creating artificial urgency. You're aligning with <strong>their</strong> goals and working backward to show them the logical signing deadline. When you follow up, you're not chasing — you're reminding them of their own stated needs.
        </Callout>
      </DocSection>

      <DocSection title="Mapping Their Process to Your Mutual Action Plan">
        <p className="mb-4">Once you understand their buying process, translate it into a Mutual Action Plan (MAP) with specific TT milestones:</p>
        <ol className="list-decimal pl-5 space-y-2 text-stone-700">
          <li><strong>Discovery Complete</strong> → Gap confirmed, champion identified (Today)</li>
          <li><strong>Demo / Solution Walkthrough</strong> → Show how TT solves their diagnosed problem (This week)</li>
          <li><strong>Stakeholder Alignment</strong> → Champion presents to VP HR / CEO with your business case (Week 2)</li>
          <li><strong>Security and IT Review</strong> → Share SOC 2, SSO setup guide, DPA (Week 2-3, run in parallel)</li>
          <li><strong>Procurement / Contract Review</strong> → Standard terms, volume discounts if applicable (Week 3-4)</li>
          <li><strong>Signed Agreement</strong> → Contract executed (Week 4-6)</li>
          <li><strong>Implementation Kickoff</strong> → CSM assigned, data migration begins (Week 5-7)</li>
          <li><strong>Go-Live</strong> → Team trained, career site live, first roles posted (Week 8-10)</li>
        </ol>
        <ScriptBlock label="Presenting the MAP">
          {`"Based on what you've shared about your process, let me suggest a timeline that gets you live before your next hiring push.

I'll put together a mutual action plan — basically a shared checklist with dates — so we both know exactly what needs to happen and when. That way nothing falls through the cracks on either side.

The companies that implement fastest are the ones who run IT review and procurement in parallel. Can we get your IT contact looped in this week so they can start the security review while we finalize the business case?"`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="Common TT Buying Process Blockers">
        <p className="mb-4">These are the four most common blockers in Service Alignment deals — and exactly how to handle each one:</p>
        <div className="space-y-4">
          <div className="border-l-4 border-rose-400 pl-4 py-3 bg-rose-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">🔒 Security Questionnaire</h4>
            <p className="text-sm text-stone-600 mb-2"><strong>What they say:</strong> {`"IT needs to complete a security review before we can proceed."`}</p>
            <p className="text-sm text-stone-700"><strong>Your move:</strong> {`"We have a pre-completed security questionnaire and SOC 2 Type II report ready. Can I send that to your IT team today so they can review in parallel while we finalize the business case?"`}</p>
          </div>
          <div className="border-l-4 border-rose-400 pl-4 py-3 bg-rose-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">🔗 IT / SSO Review</h4>
            <p className="text-sm text-stone-600 mb-2"><strong>What they say:</strong> {`"IT wants to make sure it integrates with our SSO."`}</p>
            <p className="text-sm text-stone-700"><strong>Your move:</strong> {`"We support SAML 2.0 SSO out of the box — Google Workspace, Azure AD, Okta, you name it. I can set up a 15-minute technical call with your IT lead and our solutions engineer to confirm compatibility this week."`}</p>
          </div>
          <div className="border-l-4 border-rose-400 pl-4 py-3 bg-rose-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">📋 Procurement / Legal</h4>
            <p className="text-sm text-stone-600 mb-2"><strong>What they say:</strong> {`"This needs to go through procurement."`}</p>
            <p className="text-sm text-stone-700"><strong>Your move:</strong> {`"Understood. Can you introduce me to your procurement contact? I'll send over our standard terms and DPA so they have everything they need upfront. Companies like Savills went through a full procurement cycle with us — we know the drill and can move quickly."`}</p>
          </div>
          <div className="border-l-4 border-rose-400 pl-4 py-3 bg-rose-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">🇪🇺 GDPR / DPA Review</h4>
            <p className="text-sm text-stone-600 mb-2"><strong>What they say:</strong> {`"Legal needs to review the data processing agreement."`}</p>
            <p className="text-sm text-stone-700"><strong>Your move:</strong> {`"We're fully GDPR compliant and process data in EU data centers. I'll send over our standard DPA — most legal teams can review it in a few days since it follows the standard controller-processor framework. We do this with hundreds of companies across Europe."`}</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Follow-Up with Precision">
        <p>
          Because you mapped their buying process, you can now follow up on specific steps — not just {`"checking in"`}:
        </p>
        <ScriptBlock label="Precision Follow-Up Examples">
          {`"I know you mentioned this needed to go through [Finance/Board/VP of Ops] — has that review happened yet?"

"You said you wanted this completed by end of month, and we talked about signing by Friday. It's Friday afternoon — where are we at?"

"Has the proposal been shared with [Decision Maker Name] yet? Would it help if I sent them a summary directly?"`}
        </ScriptBlock>
        <p className="mt-3 text-sm text-stone-600">
          Each follow-up references their own words, their own timeline, and their own stakeholders. This isn't pushy — it's helpful.
        </p>
      </DocSection>

      <DocSection title="What This Unlocks">
        <p>By the end of this step, you should have clarity on:</p>
        <div className="space-y-2 mt-3">
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            <span className="text-stone-700">Who is involved in approving the purchase</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            <span className="text-stone-700">What their internal decision-making process looks like</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            <span className="text-stone-700">Whether they're a reactive or proactive buyer</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            <span className="text-stone-700">Whether they normally budget for solutions like this</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            <span className="text-stone-700">Their target completion date and resulting signing deadline</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            <span className="text-stone-700">Specific steps and people to reference in follow-ups</span>
          </div>
        </div>
      </DocSection>
    </div>
  );
}
