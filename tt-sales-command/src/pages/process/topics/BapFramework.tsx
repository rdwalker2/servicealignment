import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function BapFramework() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        title="The Buyer's Action Plan" 
        subtitle="The living document that puts you at the center of the decision-making process — not on the outside looking in." 
      />

      <DocSection title="What Is the Buyer's Action Plan?">
        <p>
          As trusted advisors, we guide our prospects through the perfect buyer's journey by helping them create a <strong>plan of action</strong>. This is exactly what they need — a plan that clearly outlines their best path forward to solving their biggest problems.
        </p>
        <p className="mt-3">
          The Buyer's Action Plan (BAP) is a valuable asset delivered to prospects at the end of each call. It continues to develop across the sales process, placing you at the center of the decision-making process instead of always being on the outside looking in.
        </p>
        <Callout type="success" title="The BAP Advantage">
          This plan creates a buying experience that is valuable to your prospects whether they choose you or not. But they will choose you far more often because of the clarity you give them while everybody else is confusing them. They'll also tell their colleagues, creating referrals at levels you've never experienced before.
        </Callout>
      </DocSection>

      <DocSection title="The Three Buyer Checkpoints">
        <p className="mb-4">
          The BAP is structured around three critical checkpoints. At each stage, if the prospect doesn't pass, you discover and disqualify — keeping your pipeline clean and your projections accurate.
        </p>
        <div className="space-y-4">
          <div className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Checkpoint 1: Do They Need to Act?</h4>
            <p className="text-[14px] text-stone-600 mb-2">
              We cannot immediately assume that the problem they're experiencing is a high enough priority to be solved. Companies have lots of problems, but they can't solve all of them — they prioritize and then decide where to put resources and budget.
            </p>
            <p className="text-[13px] text-stone-500">
              <strong>If they don't pass:</strong> Refunds, lack of engagement in fulfillment, and buyer's remorse are signs you missed this checkpoint. Discover it, have the conversation, and move on.
            </p>
          </div>

          <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Checkpoint 2: Do They Need Outside Help?</h4>
            <p className="text-[14px] text-stone-600 mb-2">
              Just because a problem is painful doesn't mean they need to buy something. The fastest way to solve something is to do it yourself or use your current vendor. We need to evaluate why their existing resources haven't been adequate.
            </p>
            <p className="text-[13px] text-stone-500">
              <strong>If they don't pass:</strong> If they don't believe they need new resources, more time will be wasted pitching to someone who's just going to solve it internally anyway. Call a spade a spade.
            </p>
          </div>

          <div className="border-l-4 border-violet-400 pl-4 py-3 bg-violet-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">Checkpoint 3: Who Has the Best Solution?</h4>
            <p className="text-[14px] text-stone-600 mb-2">
              If they need to take action AND they need outside help — then and only then does your solution matter. Now it's just a question of who solves it best.
            </p>
            <p className="text-[13px] text-stone-500">
              <strong>The secret:</strong> Great pitches are set up by good discovery and diagnosis. When you've passed the first two checkpoints, your presentation is laser focused. They're not wondering if they need it — they're evaluating who does it best.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="What the BAP Tracks">
        <p>
          The BAP evolves across calls, capturing and organizing information at each checkpoint stage:
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-3 mb-4">
          <li><strong>Problem Identified:</strong> The specific problem or goal the prospect raised that led them to this call</li>
          <li><strong>Consequences:</strong> The current or inevitable consequences if that problem remains unsolved</li>
          <li><strong>Priority Rating:</strong> Their own assessment of how urgent this is (the 1-10 scale)</li>
          <li><strong>Decision Makers:</strong> Who owns the problem and who has authority to act</li>
          <li><strong>Past Attempts:</strong> What they've already done to solve this and why it hasn't worked</li>
          <li><strong>Resource Gap:</strong> Why their existing resources are insufficient</li>
          <li><strong>Solution Alignment:</strong> How your solution specifically addresses the diagnosed problems</li>
        </ul>
        <Callout type="info" title="The Prospect Lean-In Moment">
          When you share the BAP with prospects, they lean in. They read the story of their lives that you've captured. As you replay it back, ask "What did we miss?" A common response: "This is a much clearer version than what's in my head."
        </Callout>
      </DocSection>

      <DocSection title="Scoring Deal Readiness">
        <p>
          The BAP functions as a built-in deal scoring system. At each checkpoint, you have a clear go/no-go decision:
        </p>
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
            <span className="text-lg">🔴</span>
            <div>
              <p className="font-medium text-stone-900">Checkpoint 1 Not Passed</p>
              <p className="text-[13px] text-stone-500">Pain isn't clear enough. Priority is too low. Disqualify or nurture.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
            <span className="text-lg">🟡</span>
            <div>
              <p className="font-medium text-stone-900">Checkpoint 2 Not Passed</p>
              <p className="text-[13px] text-stone-500">They can solve it themselves. No resource gap identified. Don't demo.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
            <span className="text-lg">🟢</span>
            <div>
              <p className="font-medium text-stone-900">All Checkpoints Passed</p>
              <p className="text-[13px] text-stone-500">They need to act, they need outside help, and you have a differentiated solution. Present with confidence.</p>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection title="Process, Not Script">
        <Callout type="rule" title="Think of This Like a Play in Sports">
          Plays put you in position to score — they do not score for you. We are not teaching you a mindless process that closes sales by itself. The process puts you in position to get critical information a heck of a lot easier than ever before, with a lot less resistance. But you ultimately have to dig in and get the information.
        </Callout>
        <p className="mt-3">
          The BAP is not a crazy robotic script. It's a set of very clear and logical checkpoints discovered with a repeatable set of questions and objectives. You won't sound like a robot — you'll sound like an expert who can help prospects understand how they'll achieve their most important goals.
        </p>
      </DocSection>
    </div>
  );
}
