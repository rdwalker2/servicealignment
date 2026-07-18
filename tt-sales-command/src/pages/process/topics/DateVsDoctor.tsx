import { DocHeader, DocSection, Callout, ScriptBlock } from '../../../components/process/DocComponents';

export default function DateVsDoctor() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        title="Date vs. Doctor's Visit" 
        subtitle="The single most important frame shift in your sales career — stop courting, start diagnosing." 
      />

      <DocSection title="The Origin Story">
        <p>
          A popular sales trainer once posted that you shouldn't set agendas at the top of sales calls. She compared a sales conversation to a date — saying if you sat down at dinner and immediately laid out an agenda, "This is how this date is going to go," you'd be eating alone by the time the appetizer arrived.
        </p>
        <p className="mt-3">
          This post connected a critical dot: <strong>many salespeople treat their discovery calls like a date.</strong> And this disconnect is visible in thousands of call reviews and coaching sessions.
        </p>
      </DocSection>

      <DocSection title="The Critical Question">
        <p>
          Dating is a form of courtship — one party is trying to attract the other into a relationship. But ask yourself this:
        </p>
        <Callout type="rule" title="Do your buyers attend your sales meetings because they want to be courted? Or because they are experiencing pain and seeking relief?">
          If we go back to buyer's intent, the answer is obvious: they are looking for relief from pain. They are attending a doctor's visit, not a date.
        </Callout>
        <p className="mt-3">
          The problem is clear: when your prospects come expecting a doctor's visit, but you treat them like someone you're trying to court, <strong>things go sideways fast.</strong>
        </p>
      </DocSection>

      <DocSection title="What Happens When You Use the Wrong Frame">
        <p className="mb-4">Normal things you'd say on a date sound extremely odd in a doctor's visit environment — and vice versa:</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="border-l-4 border-rose-400 pl-4 py-3 bg-rose-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">🍷 Date Phrases (in a sales call)</h4>
            <ul className="text-[14px] text-stone-600 space-y-2">
              <li>• "Thanks so much for making time to meet with me!"</li>
              <li>• "I'm excited to get to know you better."</li>
              <li>• "So, tell me about yourself."</li>
            </ul>
            <p className="text-[13px] text-rose-600 mt-3 font-medium">
              These are normal on a date — but imagine your doctor saying them. It would be bizarre and raise red flags about their competence.
            </p>
          </div>
          <div className="border-l-4 border-emerald-400 pl-4 py-3 bg-emerald-50/30 rounded-r-lg">
            <h4 className="font-bold text-stone-900 mb-2">🏥 Doctor Phrases (in a sales call)</h4>
            <ul className="text-[14px] text-stone-600 space-y-2">
              <li>• "What problem are you trying to solve?"</li>
              <li>• "What's your budget to address this?"</li>
              <li>• "Who else is involved in this decision?"</li>
            </ul>
            <p className="text-[13px] text-emerald-600 mt-3 font-medium">
              These feel strange on a date — but they're completely natural when you've set the right frame as a trusted advisor.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="The Insurance Question Test">
        <p>
          Imagine being on a first date and someone asks: <em>"Do you have health insurance? If so, what kind?"</em> Your reaction would be: "That's really none of your business." It's weird and inappropriate.
        </p>
        <p className="mt-3">
          But at a doctor's visit? That question is completely normal. It's expected.
        </p>
        <Callout type="info" title="The Budget Question Works the Same Way">
          Asking "What's your budget?" in a courtship environment gets you strange looks and annoyed responses. But when you've set the frame as a trusted advisor helping diagnose their pain, budget questions become as natural as a doctor asking about insurance. The environment dictates what questions feel normal.
        </Callout>
      </DocSection>

      <DocSection title="The Date-Like Approach Reveals Your Intent">
        <p>
          When you approach sales like a courtship, it raises big red flags about your intentions. The prospect is left wondering:
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2 mb-4">
          <li><strong>Are you there to court them?</strong> — i.e., to charm them into buying regardless of fit</li>
          <li><strong>Or are you there to help them?</strong> — i.e., to diagnose their situation and recommend the best path forward</li>
        </ul>
        <p>
          The date-like approach makes it very clear you're trying to court them. And prospects who came for a doctor's visit will disengage immediately.
        </p>
      </DocSection>

      <DocSection title="The Diagnostic Mindset">
        <p>
          Reset your frame. The way you've been thinking about what a sales interaction should look like has been deeply flawed.
        </p>
        <ScriptBlock label="Doctor's Visit Opening vs. Date Opening">
          ❌ Date: "Hey! So excited to chat today. Tell me a little about yourself and your company."

          ✅ Doctor: "Here's how these calls go — I'll start by asking you some questions to understand what's going on. The goal is that you come out of this with a plan of action, even if that plan doesn't include us. Sound good?"
        </ScriptBlock>
        <Callout type="success" title="The Transformation">
          A simple shift in your discovery calls — from treating them like a date to treating them like a doctor's visit — will transform your results. It eliminates awkwardness, positions you as a trusted advisor, and helps you close more deals. Keep this in mind as you engage with every part of the 4D process.
        </Callout>
      </DocSection>

      <DocSection title="The TT Doctor's Office Script">
        <p>Here's the exact Teamtailor version of the Doctor's Office opening vs. the Date opening:</p>

        <ScriptBlock label="❌ Date Opening — Don't Do This">
{"Hey! Thanks so much for taking the time. Tell me a little about your company! How many employees do you have? That's great! So we're Teamtailor and we're an all-in-one recruiting platform that helps companies attract and hire..."}
        </ScriptBlock>

        <Callout type="warning" title="Why This Fails">
          You've just told the prospect you're here to pitch. They'll politely listen, ask for a follow-up email, and ghost you. You've entered courtship mode and they know it.
        </Callout>

        <ScriptBlock label="✅ Doctor's Office Opening — Do This">
{"Here's how these calls typically go — I'll ask you about your current hiring process, where candidates are dropping off, what tools you're using today, and what outcomes you're trying to achieve. By the end, we'll both know if it makes sense to keep talking. Sound fair?"}
        </ScriptBlock>

        <Callout type="success" title="Why This Works">
          You've set the frame as a diagnostic. You've told them what to expect. You've given them an out ("we'll both know if it makes sense"). This is push-pull + doctor's visit combined. They relax because you're not selling — you're evaluating.
        </Callout>
      </DocSection>

      <DocSection title="The TT Diagnostic Question Flow">
        <p>Once you've set the Doctor's Office frame, use this diagnostic sequence to systematically uncover pain:</p>

        <div className="space-y-3 mt-4">
          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[#FF2A7F]/10 flex items-center justify-center text-[#FF2A7F] text-sm font-black shrink-0">1</span>
            <div>
              <p className="font-bold text-stone-800">"What's your biggest hiring bottleneck right now?"</p>
              <p className="text-[13px] text-stone-500 mt-1">Opens the door to: screening speed, career site quality, time-to-hire, HM responsiveness</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[#FF2A7F]/10 flex items-center justify-center text-[#FF2A7F] text-sm font-black shrink-0">2</span>
            <div>
              <p className="font-bold text-stone-800">"Walk me through what happens from req-open to offer-accepted."</p>
              <p className="text-[13px] text-stone-500 mt-1">Reveals: process gaps, manual steps, where they lose time and candidates</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[#FF2A7F]/10 flex items-center justify-center text-[#FF2A7F] text-sm font-black shrink-0">3</span>
            <div>
              <p className="font-bold text-stone-800">"Where are candidates falling out of your funnel?"</p>
              <p className="text-[13px] text-stone-500 mt-1">Pinpoints: career site drop-off, application abandonment, interview no-shows, offer declines</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[#FF2A7F]/10 flex items-center justify-center text-[#FF2A7F] text-sm font-black shrink-0">4</span>
            <div>
              <p className="font-bold text-stone-800">"What have you tried to fix it?"</p>
              <p className="text-[13px] text-stone-500 mt-1">Uncovers: HRIS ATS limitations, agency dependency, manual workarounds — sets up CP2 (Gap Test)</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-full bg-[#FF2A7F]/10 flex items-center justify-center text-[#FF2A7F] text-sm font-black shrink-0">5</span>
            <div>
              <p className="font-bold text-stone-800">"What happened?"</p>
              <p className="text-[13px] text-stone-500 mt-1">The kill shot: forces them to admit their solution didn't work. Now they're ready for an alternative.</p>
            </div>
          </div>
        </div>

        <Callout type="rule" title="Never Skip Question 5">
          Questions 1-4 build the picture. Question 5 locks in the gap. If their previous fix worked, you don't have a deal anyway. If it didn't — and it usually didn't — you've just earned CP2 passage.
        </Callout>
      </DocSection>
    </div>
  );
}
