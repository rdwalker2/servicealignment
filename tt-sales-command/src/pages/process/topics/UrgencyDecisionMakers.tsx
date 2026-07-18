import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function UrgencyDecisionMakers() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        stage="D1"
        title="Urgency Test: Decision Makers" 
        subtitle="Identify who owns the problem and who has authority — by keeping the question connected to their objective." 
      />

      <DocSection title="Why Reps Struggle Here">
        <p>
          Too many reps either skip the decision-maker question entirely or struggle to get accurate information because the prospect shields the real decision makers from the process. But this shielding is happening because of <strong>how you are asking the questions</strong>.
        </p>
        <p className="mt-3">
          Prospects are more than willing to lay out who needs to be a part of the process — if we get more strategic with <strong>when</strong> and <strong>how</strong> we ask.
        </p>
      </DocSection>

      <DocSection title="The Connected-to-Objective Approach">
        <Callout type="rule" title="THE KEY RULE">
          The decision-maker question must stay connected to their objective. Think of it like a Venn diagram — if the question and the objective stay connected, it works seamlessly every single time. Disconnect them, and the prospect walls up.
        </Callout>
        <p className="mt-4">
          Since they already gave you a problem or goal in the Objective step, now we need to know:
        </p>
        <ol className="list-decimal pl-5 space-y-2 mt-3 font-medium text-stone-700">
          <li><strong>Who is responsible</strong> for solving that problem or achieving that goal? Who owns it?</li>
          <li><strong>Who makes the decisions</strong> — who has the authority to approve how it gets solved?</li>
          <li><strong>What is their process</strong> for purchasing solutions like this? (when applicable)</li>
        </ol>
        <p className="mt-4">
          We ask these because we're helping them build a plan. That plan is only as good as the inputs we get. Understanding what's going on from the perspective of the most important stakeholders is critical if <strong>you</strong> are going to help <strong>them</strong> create an effective plan of action.
        </p>
      </DocSection>

      <DocSection title="The TT Buying Committee: Who Shows Up and Why">
        <p className="mb-4">In Teamtailor deals, these are the five stakeholders you'll encounter. Each one cares about a different dimension of the hiring problem:</p>
        <div className="space-y-4">
          <div className="border-l-4 border-rose-400 pl-4 py-3 bg-rose-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">HR Director / VP of HR</h4>
            <p className="text-sm text-stone-600"><strong>Role in the deal:</strong> Problem owner and primary advocate. Lives with the hiring pain daily. Usually the person on your first call.</p>
            <p className="text-sm text-stone-600 mt-1"><strong>What they care about:</strong> Process efficiency, candidate experience, compliance (GDPR/EEOC), employer brand, reducing time-to-hire, team capacity.</p>
            <p className="text-sm text-stone-600 mt-1"><strong>Typical statement:</strong> "I'm spending 3 hours a day screening resumes and my hiring managers won't even log into our current system."</p>
          </div>

          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">CEO / Founder</h4>
            <p className="text-sm text-stone-600"><strong>Role in the deal:</strong> Often the decision maker at companies under 200 employees. Cares about growth velocity and cost control.</p>
            <p className="text-sm text-stone-600 mt-1"><strong>What they care about:</strong> Speed to fill roles, agency spend reduction, employer brand as competitive advantage, scaling operations. Thinks in terms of revenue impact and market timing.</p>
            <p className="text-sm text-stone-600 mt-1"><strong>Typical statement:</strong> "We need to hire 50 people in the next quarter to open our new locations. We can't afford to miss that window."</p>
          </div>

          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">CFO / Finance</h4>
            <p className="text-sm text-stone-600"><strong>Role in the deal:</strong> Budget authority. Usually not on the first call but must approve the spend. Most influential in deals over $15K ACV.</p>
            <p className="text-sm text-stone-600 mt-1"><strong>What they care about:</strong> ROI, cost-per-hire reduction, agency fee displacement, total cost of ownership vs. current spend. Needs numbers, not narratives.</p>
            <p className="text-sm text-stone-600 mt-1"><strong>Typical statement:</strong> "Show me what we're spending now and what we'd spend with you. I need to see the delta."</p>
          </div>

          <div className="border-l-4 border-violet-400 pl-4 py-3 bg-violet-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">TA Manager / Recruiting Lead</h4>
            <p className="text-sm text-stone-600"><strong>Role in the deal:</strong> Power user and workflow designer. Will be the heaviest daily user of Teamtailor. Can be your strongest internal champion or your biggest blocker.</p>
            <p className="text-sm text-stone-600 mt-1"><strong>What they care about:</strong> Workflow customization, automation rules, sourcing tools, reporting dashboards, interview scheduling, candidate communication. Evaluates the product technically.</p>
            <p className="text-sm text-stone-600 mt-1"><strong>Typical statement:</strong> "I need to see how custom workflows work. Can I build different pipelines for different departments?"</p>
          </div>

          <div className="border-l-4 border-emerald-400 pl-4 py-3 bg-emerald-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">IT / Security</h4>
            <p className="text-sm text-stone-600"><strong>Role in the deal:</strong> Gatekeeper in enterprise deals. Evaluates technical requirements. Can delay or block a deal if not engaged early.</p>
            <p className="text-sm text-stone-600 mt-1"><strong>What they care about:</strong> SSO/SAML integration, GDPR compliance, data residency, API access, HRIS integration (ADP, Workday, BambooHR), security certifications.</p>
            <p className="text-sm text-stone-600 mt-1"><strong>Typical statement:</strong> "Does it support SAML SSO? Where is the data hosted? Can we get a security questionnaire completed?"</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Buying Committee Patterns by Company Size">
        <p className="mb-4">The composition of the buying committee shifts based on company size. Understanding who's typically involved helps you ask the right questions and avoid surprises later:</p>
        <div className="space-y-4">
          <div className="p-4 bg-amber-50/40 rounded-lg border border-amber-200">
            <h4 className="font-bold text-stone-900 mb-2">SMB (20-100 Employees)</h4>
            <p className="text-sm text-stone-700"><strong>Who's involved:</strong> CEO/Founder + HR Manager/Office Manager (often the same person)</p>
            <p className="text-sm text-stone-700 mt-1"><strong>Decision speed:</strong> Fast — often 1-2 calls. CEO may be on the first call.</p>
            <p className="text-sm text-stone-700 mt-1"><strong>What to ask:</strong> "Is there anyone else besides yourself who would need to weigh in on this decision?" (Often: no.)</p>
            <p className="text-sm text-stone-700 mt-1"><strong>Watch out for:</strong> The Office Manager persona who has influence but no budget authority. They'll champion you internally but can't sign. Always confirm: "Who approves the budget for tools like this?"</p>
          </div>

          <div className="p-4 bg-blue-50/40 rounded-lg border border-blue-200">
            <h4 className="font-bold text-stone-900 mb-2">Mid-Market (100-500 Employees)</h4>
            <p className="text-sm text-stone-700"><strong>Who's involved:</strong> HR Director + TA Manager + CFO or VP of Finance</p>
            <p className="text-sm text-stone-700 mt-1"><strong>Decision speed:</strong> 2-4 weeks typical. Requires internal alignment and often a formal business case.</p>
            <p className="text-sm text-stone-700 mt-1"><strong>What to ask:</strong> "When you've purchased solutions in this price range before, what did that process look like internally? Who needed to sign off?"</p>
            <p className="text-sm text-stone-700 mt-1"><strong>Watch out for:</strong> The TA Manager who evaluates but doesn't decide. They'll go deep on features but can't commit budget. Get to the HR Director and connect to finance early.</p>
          </div>

          <div className="p-4 bg-violet-50/40 rounded-lg border border-violet-200">
            <h4 className="font-bold text-stone-900 mb-2">Enterprise (500+ Employees)</h4>
            <p className="text-sm text-stone-700"><strong>Who's involved:</strong> VP/SVP of HR + TA Director + IT/Security + Procurement + CFO</p>
            <p className="text-sm text-stone-700 mt-1"><strong>Decision speed:</strong> 4-12 weeks. Multi-stakeholder, often requires procurement review and security assessment.</p>
            <p className="text-sm text-stone-700 mt-1"><strong>What to ask:</strong> "For a platform that would be used across the organization — like Savills with their 15,000 employees — who are all the stakeholders that would need to be involved in evaluating and approving this?"</p>
            <p className="text-sm text-stone-700 mt-1"><strong>Watch out for:</strong> IT/Security becoming a silent blocker. Engage them proactively: "Should we schedule a separate session with your IT team to address security and integration requirements so that doesn't become a bottleneck?"</p>
          </div>
        </div>
        <Callout type="info" title="Cross-Reference">
          For a deeper dive into how the buying <em>process</em> works at each company size (approvals, timelines, procurement), see the Gap: Buying Process topic in D2. This section focuses on <em>who</em> is involved — not the mechanics of how they buy.
        </Callout>
      </DocSection>

      <DocSection title="Talk Track: Identifying the Decision Maker">
        <ScriptBlock label="After Establishing Their Objective">
          "Who is ultimately responsible for solving this [repeat their specific problem] you all are experiencing?"

          (Wait for the answer.)

          "Ok, and who ultimately will be making the decision on how this gets solved?"
        </ScriptBlock>
        <p className="mt-4 text-sm text-stone-600">
          Notice how both questions stay anchored to the specific problem they gave you. You're not asking "who's your boss?" — you're asking who owns <em>this problem</em>. That's the difference between resistance and cooperation.
        </p>
      </DocSection>

      <DocSection title="TT-Specific Stakeholder Discovery Scripts">
        <p className="mb-4">Here are Teamtailor-specific talk tracks for uncovering the full buying committee:</p>
        
        <ScriptBlock label="Finding the Budget Authority">
          "You mentioned this hiring challenge is costing you in agency fees and delayed projects. When it comes to investing in a solution to fix this — a platform like an ATS — who would need to approve that budget? Is that something you can greenlight, or does that go through finance?"
        </ScriptBlock>

        <ScriptBlock label="Surfacing the IT Stakeholder">
          "One thing I want to make sure we get right is the technical side — integrations with your HRIS, SSO setup, data security. Is there someone on your IT team who would need to evaluate that piece? I'd rather loop them in early than have it become a bottleneck later."
        </ScriptBlock>

        <ScriptBlock label="Identifying Hiring Manager Influence">
          "You mentioned your hiring managers are frustrated with the current process. When you're evaluating a new system, would any of those hiring managers want to see it in action? In our experience — like with Octavo Partnership where they achieved 100% hiring manager adoption — the deals that stick are the ones where hiring managers are part of the evaluation."
        </ScriptBlock>

        <ScriptBlock label="The 'Who Else' Question">
          "I want to make sure we build a plan that works for everyone involved. Outside of you and [decision maker they named] — is there anyone else who would need to see this, have input, or give a thumbs up before you could move forward? Sometimes there's a stakeholder people forget about until the last minute, and I'd rather help you think through that now."
        </ScriptBlock>
      </DocSection>

      <DocSection title="Handling Missing Stakeholders">
        <p>
          If the decision maker is not on the call, you're now aware of it early — and you can address it immediately rather than discovering it at proposal time.
        </p>
        <ScriptBlock label="When a Key Stakeholder Is Missing">
          "If you think it's important to bring Amy into this call to ensure we're all aligned on your current situation — so we can better navigate a path forward for you all — we can bring her on now.

          Or, as we talk, I'll be creating a summary of our conversation that we can send over to her when we're done, and she can use that to check for alignment.

          Which works best for you?"
        </ScriptBlock>
        <Callout type="info" title="Why This Works">
          You're giving them two options — both of which keep the stakeholder connected to the process. You're not asking permission to talk to their boss. You're offering to help ensure alignment on <strong>their</strong> plan.
        </Callout>
      </DocSection>

      <DocSection title="Continuing to Involve Decision Makers">
        <p>
          Throughout the rest of the call, reference the identified decision maker naturally to ensure you understand the full scope of decision-making:
        </p>
        <ScriptBlock label="Mid-Call Stakeholder Check">
          "What does Amy think about that? I know what you think, but does Amy see it the same way?"
        </ScriptBlock>
        <Callout type="warning" title="Don't Make Your Advocate Sell for You">
          Your main contact (your "advocate") should not be the one trying to sell this internally. Engage decision-makers directly whenever possible. Ensure the information you gather is well-rounded so your final Buyer's Action Plan resonates with everyone who reviews it — not just the person you spoke with.
        </Callout>
      </DocSection>

      <DocSection title="Stakeholder Mapping Checklist">
        <div className="space-y-2 mt-2">
          <div className="flex items-start gap-2">
            <span className="text-stone-400 mt-0.5">☐</span>
            <span className="text-stone-700"><strong>Problem Owner:</strong> Who is responsible for solving this?</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-stone-400 mt-0.5">☐</span>
            <span className="text-stone-700"><strong>Authority:</strong> Who makes the final decision on how it gets solved?</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-stone-400 mt-0.5">☐</span>
            <span className="text-stone-700"><strong>Buying Process:</strong> What is their process for purchasing solutions like this?</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-stone-400 mt-0.5">☐</span>
            <span className="text-stone-700"><strong>Presence:</strong> Are the key stakeholders on this call, or do we need to loop them in?</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-stone-400 mt-0.5">☐</span>
            <span className="text-stone-700"><strong>Alignment Plan:</strong> How will absent stakeholders get aligned? (summary document, follow-up call, etc.)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-stone-400 mt-0.5">☐</span>
            <span className="text-stone-700"><strong>IT/Security:</strong> Is there a technical evaluation required? Who handles that?</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-stone-400 mt-0.5">☐</span>
            <span className="text-stone-700"><strong>Hiring Managers:</strong> Will end users (hiring managers) be part of the evaluation?</span>
          </div>
        </div>
      </DocSection>

      <DocSection title="Common Mistakes">
        <div className="space-y-3 mt-2">
          <div className="border-l-4 border-rose-400 pl-4 py-2 bg-rose-50/30 rounded-r-lg">
            <p className="font-semibold text-stone-800">Asking "Who's the decision maker?" out of context</p>
            <p className="text-sm text-stone-600 mt-1">This triggers defense mechanisms. Keep it connected to their objective instead.</p>
          </div>
          <div className="border-l-4 border-rose-400 pl-4 py-2 bg-rose-50/30 rounded-r-lg">
            <p className="font-semibold text-stone-800">Skipping the question entirely</p>
            <p className="text-sm text-stone-600 mt-1">You'll discover you're missing stakeholders at proposal time — when it's too late to include their input.</p>
          </div>
          <div className="border-l-4 border-rose-400 pl-4 py-2 bg-rose-50/30 rounded-r-lg">
            <p className="font-semibold text-stone-800">Accepting vague answers</p>
            <p className="text-sm text-stone-600 mt-1">"I'll handle it internally" is not a stakeholder map. Probe: "Who specifically would need to approve the budget for this?"</p>
          </div>
          <div className="border-l-4 border-rose-400 pl-4 py-2 bg-rose-50/30 rounded-r-lg">
            <p className="font-semibold text-stone-800">Ignoring IT/Security in enterprise deals</p>
            <p className="text-sm text-stone-600 mt-1">Companies with 500+ employees almost always have a technical review. If you don't ask about it, it surfaces at the worst possible time and adds 2-4 weeks to your deal cycle.</p>
          </div>
          <div className="border-l-4 border-rose-400 pl-4 py-2 bg-rose-50/30 rounded-r-lg">
            <p className="font-semibold text-stone-800">Treating the TA Manager as the decision maker</p>
            <p className="text-sm text-stone-600 mt-1">TA Managers evaluate and recommend — they rarely hold budget authority. They are essential champions but don't confuse influence with authority. Always ask: "If you and your team decided this was the right fit, what would the approval process look like from there?"</p>
          </div>
        </div>
      </DocSection>
    </div>
  );
}
