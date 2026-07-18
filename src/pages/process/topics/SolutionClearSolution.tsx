import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function SolutionClearSolution() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader
        stage="D3"
        title="Clear Solution — The Treatment Plan"
        subtitle="Map your method directly to diagnosed problems. Bear the burden of complexity — simplify relentlessly."
      />

      <DocSection title="Stop Drowning Prospects in Information">
        <p>
          The more complex your solution presentation, the more <strong>calories your prospects have to burn</strong> to understand what you're presenting. And they won't do it. You are losing their attention with complex demos.
        </p>
        <p className="mt-2">
          It is <em>our</em> job to bear the burden of complexity and do the hard work to simplify how we explain our solution.
        </p>
        <Callout type="warning" title="The New Rep Trap">
          When you first start, you have a simplistic understanding that doesn't confuse prospects — but probably underwhelms them. A few months in, you learn more and start overwhelming them. This is why new reps who start strong often hit an early slump. Top reps reach the point where they've <strong>reduced complexity while maximizing the ability to convey power</strong>.
        </Callout>
      </DocSection>

      <DocSection title="It's Not About Specifics — It's About Trust">
        <p>
          What we've learned is that it's not really about the specifics of your solution. It's about whether or not they trust you can <strong>get them to the other side</strong>. Can they rely on you? Do they have confidence in your ability to solve the problems they're dealing with?
        </p>
        <p className="mt-2">
          All of this has been informed by buyer survey feedback and buyer interviews. And we noticed it mimics the world of healthcare:
        </p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li><strong>Credentials</strong> tell them WHY they should listen to you (covered in Proven Results)</li>
          <li><strong>Treatment Plan</strong> is HOW you will get them to health (this section)</li>
          <li><strong>Timelines</strong> are WHEN points of value will be reached (covered in Timeline & Price)</li>
        </ul>
      </DocSection>

      <DocSection title="The Rule of 3">
        <Callout type="rule" title="Structure Your Solution in 3s">
          3 sections of your general approach. 3 bullets per section. This rule prevents rambling and forces you to prioritize only the most critical value drivers. Keep it tight and be diligent about what goes into each section.
        </Callout>
        <p className="mt-3">
          Do the work to outline the <strong>20% that will drive 80% of the value</strong>. The most important piece of your solution will be around your <strong>method</strong> — how you actually solve their problems. Start this entire section with your method.
        </p>
        <div className="bg-stone-900 border border-stone-700 rounded-lg p-5 mt-4">
          <h4 className="font-bold text-white mb-3 text-[14px]">Service Alignment's Method — The Rule of 3</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-stone-800 border border-stone-700 rounded-lg p-3 text-center">
              <div className="font-bold text-emerald-400 text-sm">1. Attract</div>
              <p className="text-xs text-stone-400 mt-1">Career site + employer brand + job distribution — get the right candidates to see you and want to apply</p>
            </div>
            <div className="bg-stone-800 border border-stone-700 rounded-lg p-3 text-center">
              <div className="font-bold text-blue-400 text-sm">2. Automate</div>
              <p className="text-xs text-stone-400 mt-1">AI screening + smart scheduling + triggers — eliminate manual work so recruiters recruit instead of doing admin</p>
            </div>
            <div className="bg-stone-800 border border-stone-700 rounded-lg p-3 text-center">
              <div className="font-bold text-amber-400 text-sm">3. Optimize</div>
              <p className="text-xs text-stone-400 mt-1">Analytics + talent pools + continuous improvement — know what's working, re-engage past candidates, get better every cycle</p>
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-3 italic">Every prospect pain maps to one of these three pillars. Lead with the one that matches their biggest problem.</p>
        </div>
      </DocSection>

      <DocSection title="Pain-to-Solution Mapping">
        <p>
          Your objective is to <strong>clearly connect the dots</strong> between the problems they're experiencing (diagnosed in D2) and the components of your solution that solve them.
        </p>
        <Callout type="info" title="Remember Their Intention">
          They intend to find the best solution to solve the actual problems causing enough pain and keeping them from important enough outcomes. Your job is to make that connection unmistakable.
        </Callout>
        <p className="mt-3">
          The mistake most salespeople make: they assume the prospect will automatically connect the dots themselves. <strong>They won't.</strong> You must:
        </p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>Make it obvious — explicitly state how each component solves their exact problem</li>
          <li>Simplify the explanation to reduce mental effort for the prospect</li>
          <li>Use their own language from discovery — mirror their words back</li>
        </ul>
        <p className="mt-3">
          The more effort it takes for them to process information, the less likely they are to retain it, stay engaged, or take action. When a prospect starts mentally checking out, you've lost the deal.
        </p>
      </DocSection>

      <DocSection title="Connecting the Dots: Talk Track">
        <ScriptBlock label="Solution Presentation — Service Alignment">
          {`"So based on what we've uncovered — [restate 2-3 problems from D2] 
— here's how we solve each of these.

Service Alignment works across three pillars:

1. ATTRACT — [Problem: 'You said candidates can't find you / 
   your career page doesn't represent who you are'] → We give 
   you a fully branded career site, mobile-first, with 128+ 
   job board integrations so jobs get in front of the right 
   people automatically.

2. AUTOMATE — [Problem: 'Your team is manually screening 
   every resume / scheduling is back-and-forth'] → AI Copilot 
   screens and ranks candidates. Smart Schedule eliminates 
   the calendar ping-pong. Triggers handle follow-ups 
   automatically so nobody falls through the cracks.

3. OPTIMIZE — [Problem: 'You don't know where your hires 
   come from / you can't re-engage past candidates'] → 
   Real-time analytics show you exactly which sources are 
   producing hires. Connect builds a talent pool of 
   silver-medalists you can activate for future roles.

What questions do you have about how we approach this?"`}
        </ScriptBlock>

        <div className="mt-4 overflow-x-auto">
          <p className="text-[13px] font-bold text-stone-700 mb-2">Quick Reference: Pain → Feature Mapping</p>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b-2 border-stone-200">
                <th className="text-left py-2 px-3 text-stone-500">They Say...</th>
                <th className="text-left py-2 px-3 text-stone-500">Pillar</th>
                <th className="text-left py-2 px-3 text-stone-500">Show Them</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-stone-100">
                <td className="py-2 px-3 italic text-stone-600">"We don't have a real career page"</td>
                <td className="py-2 px-3 font-bold text-emerald-600">Attract</td>
                <td className="py-2 px-3 text-stone-700">Career site builder — pull up a customer example live</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-2 px-3 italic text-stone-600">"I'm reading every resume manually"</td>
                <td className="py-2 px-3 font-bold text-blue-600">Automate</td>
                <td className="py-2 px-3 text-stone-700">AI Copilot screening — show the 5.4x hire rate stat</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-2 px-3 italic text-stone-600">"Scheduling is a nightmare"</td>
                <td className="py-2 px-3 font-bold text-blue-600">Automate</td>
                <td className="py-2 px-3 text-stone-700">Smart Schedule with calendar integration</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-2 px-3 italic text-stone-600">"70% of applicants aren't qualified"</td>
                <td className="py-2 px-3 font-bold text-blue-600">Automate</td>
                <td className="py-2 px-3 text-stone-700">Knockout questions + AI screening</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-2 px-3 italic text-stone-600">"We're paying headhunters"</td>
                <td className="py-2 px-3 font-bold text-amber-600">Optimize</td>
                <td className="py-2 px-3 text-stone-700">Connect talent pools — Foot Asylum: 17.1% CRM hires</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-2 px-3 italic text-stone-600">"I don't know what's working"</td>
                <td className="py-2 px-3 font-bold text-amber-600">Optimize</td>
                <td className="py-2 px-3 text-stone-700">Analytics dashboard — source-of-hire, pipeline velocity</td>
              </tr>
              <tr>
                <td className="py-2 px-3 italic text-stone-600">"Our Provider / HRIS is an afterthought"</td>
                <td className="py-2 px-3 font-bold text-emerald-600">Attract</td>
                <td className="py-2 px-3 text-stone-700">Full platform tour — show what a dedicated Provider looks like</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection title="Handling Detail-Oriented Prospects">
        <p>
          If you're worried about the expert prospect who wants to go deep, don't change your structure. Instead, use the engagement check periodically:
        </p>
        <ScriptBlock label="Open-Ended Engagement Check">
          {`"What questions do you have?"

NOT: "Do you have any questions?" (closed-ended — invites "no")

"What questions do you have?" (open-ended — invites dialogue)

Ask this after each major section. It identifies where they 
want depth, and you can happily oblige without derailing the 
entire presentation for everyone.`}
        </ScriptBlock>
      </DocSection>

      <DocSection title="Solution Roadmaps vs. Generic Proposals">
        <Callout type="info" title="A New Approach to Proposals">
          Use Solution Roadmaps — a long-form format that walks them step by step through what actually matters. No more generic PDF proposals. Instead, a structured plan that helps them truly understand the solution. Speak to prospects in a way they understand. They are not experts in your field — they just want their problem solved, quickly and effectively.
        </Callout>
      </DocSection>
    </div>
  );
}
