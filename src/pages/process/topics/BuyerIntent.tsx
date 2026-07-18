import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function BuyerIntent() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        title="Buyer's Intent" 
        subtitle="Understanding what your buyers are actually trying to accomplish — and why it matters more than your pitch." 
      />

      <DocSection title="The Core Truth: Why Buyers Buy">
        <p>
          Your prospective buyers are not sitting around bored, looking for new friends. They have full lives, distractions, and responsibilities. They're not hopping on a sales call for fun — they're doing it for a reason.
        </p>
        <p className="mt-3">
          That reason is simple: <strong>they are looking for the best solution to solve a problem that is causing them pain and keeping them from achieving important outcomes.</strong>
        </p>
        <Callout type="rule" title="The Buyer's Intent Principle">
          People don't want to buy things. They don't want to be sold things. They want to solve problems. Your entire process must be built around this truth.
        </Callout>
      </DocSection>

      <DocSection title="The Current State of Sales">
        <p>
          According to Forrester research, nearly <strong>70% of potential buyers don't want to interact with a sales rep at all</strong> during their buying process. If this is true, we have a foundational problem in how we approach sales.
        </p>
        <p className="mt-3">
          The obvious question is: <em>why?</em> Why don't they want to talk to us? To understand that, we need to step into their shoes. If we can grasp what they're trying to accomplish, we can understand why they don't see us as a valuable part of their journey.
        </p>
        <Callout type="warning" title="The Hard Truth">
          Our prospects don't want to talk to us. If we can't understand why, we can't fix it. The problem isn't them — it's us.
        </Callout>
      </DocSection>

      <DocSection title="Trusted Advisor vs. Feature Vendor">
        <p>
          The key phrase in buyer's intent is <strong>"actual problems."</strong> Most prospects have no idea what their real problem is. They're not experts in what we do. According to LinkedIn's Annual State of Sales Report, <strong>88% of buyers purchase only when they see a salesperson as a trusted advisor.</strong>
        </p>
        <p className="mt-3">
          A trusted advisor is someone who collaborates with clients as a strategic partner, tailoring guidance to their needs and objectives. If you don't take on this role, you will lose — more and more salespeople are moving in this direction.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="border-l-4 border-rose-400 pl-4 py-3 bg-rose-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">❌ Feature Vendor</h4>
            <ul className="text-[14px] text-stone-600 space-y-1">
              <li>• Pitches products to anyone who will listen</li>
              <li>• Focuses on what the solution does</li>
              <li>• Relies on tricks and instinct to close</li>
              <li>• Asks "Tell me about yourself"</li>
              <li>• Treats calls like a courtship</li>
            </ul>
          </div>
          <div className="border-l-4 border-emerald-400 pl-4 py-3 bg-emerald-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-1">✅ Trusted Advisor</h4>
            <ul className="text-[14px] text-stone-600 space-y-1">
              <li>• Helps prospects solve their real problems</li>
              <li>• Focuses on what the problem actually is</li>
              <li>• Follows a repeatable diagnostic process</li>
              <li>• Asks "What problem are you trying to solve?"</li>
              <li>• Treats calls like a doctor's visit</li>
            </ul>
          </div>
        </div>
      </DocSection>

      <DocSection title="The Biggest Obstacle Is You">
        <p>
          The habits that have helped you survive are the same ones that will prevent you from thriving. You've developed unhealthy tendencies and tactics that might work on one prospect but turn off many others.
        </p>
        <p className="mt-3">
          You have to let go of the idea that being likable is what closes deals. Being likable isn't what makes someone spend $15,000 or more. You have to commit to a better way — a process that prioritizes your prospect's needs over your survival instincts.
        </p>
        <Callout type="info" title="Why Process Beats Instinct">
          While the details of each situation vary, the fundamental reasons buyers make decisions are remarkably consistent. They want to solve the problems causing them the most pain and keeping them from key outcomes. Consistency with a process and playbook reliably delivers value and closes more sales at a higher price, faster.
        </Callout>
      </DocSection>

      <DocSection title="The Three Outcomes of Becoming a Trusted Advisor">
        <div className="space-y-3 mt-2">
          <div className="border-l-4 border-amber-400 pl-4 py-2">
            <h4 className="font-bold text-stone-900">1. Higher Closing Rates</h4>
            <p className="text-[14px] text-stone-600">When you solve real problems, prospects choose you — not because of your pitch, but because of your process.</p>
          </div>
          <div className="border-l-4 border-blue-400 pl-4 py-2">
            <h4 className="font-bold text-stone-900">2. More Referrals</h4>
            <p className="text-[14px] text-stone-600">Prospects will tell their colleagues about the experience — even if they don't buy. Your pipeline fills from both directions.</p>
          </div>
          <div className="border-l-4 border-violet-400 pl-4 py-2">
            <h4 className="font-bold text-stone-900">3. Increased Lifetime Customer Value</h4>
            <p className="text-[14px] text-stone-600">When you position as a trusted advisor in sales, you transform yourself and your company into more than just a commodity or a price.</p>
          </div>
        </div>
        <p className="mt-4 text-stone-600 italic">
          These three factors are why top sales reps continue to win at the highest levels. The tools are here — now it's on you to execute.
        </p>
      </DocSection>
    </div>
  );
}
