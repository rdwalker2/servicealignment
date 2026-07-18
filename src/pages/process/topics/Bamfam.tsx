import { DocHeader, DocSection, Callout } from '../../../components/process/DocComponents';
import { Calendar, Clock, AlertTriangle, ArrowRight, MousePointerClick } from 'lucide-react';

export default function Bamfam() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32 space-y-12">
      <DocHeader 
        title="BAMFAM" 
        subtitle="Book A Meeting From A Meeting." 
      />

      <DocSection title="What is BAMFAM?">
        <div className="flex gap-6 items-start mb-6">
          <div className="w-16 h-16 bg-[#FF2A7F]/10 rounded-2xl flex items-center justify-center shrink-0">
            <Calendar className="text-[#FF2A7F]" size={32} />
          </div>
          <div>
            <p className="text-lg text-stone-700 leading-relaxed mb-4">
              BAMFAM stands for "Book A Meeting From A Meeting." It is the most fundamental rule of sales pipeline velocity. You should <strong>never</strong> leave a live conversation without the next concrete step locked on the calendar.
            </p>
            <p className="text-stone-600">
              "Let's touch base next week" or "Shoot me an email and we'll find a time" are polite ways for a deal to die. A prospect who is genuinely interested will commit 15 minutes of their future time.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="The Psychology of BAMFAM">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          
          <div className="border border-sky-200 p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-white shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-sky-500" />
              <h4 className="font-bold text-sky-900 text-lg">Momentum is Everything</h4>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">
              Deals die when momentum stalls. The longer the gap between meetings, the higher the chance their priorities shift or a competitor swoops in. Forcing the calendar look creates accountability.
            </p>
          </div>

          <div className="border border-indigo-200 p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-white shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-4">
              <MousePointerClick className="text-indigo-500" />
              <h4 className="font-bold text-indigo-900 text-lg">Avoid the Async Chase</h4>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">
              Sending an email asking "When are you free next week?" often leads to crickets, triggering a desperate cycle of "Just bubbling this up!" emails. Lock it in while you have their attention.
            </p>
          </div>

        </div>
      </DocSection>

      <DocSection title="How to BAMFAM (The Playbook)">
        <p className="mb-6 text-stone-600">Don't ask if they want to meet again. Prescribe the next step as the logical conclusion of the current meeting.</p>

        <div className="space-y-6">
          <div className="bg-white border-l-4 border-emerald-500 p-6 rounded-r-xl shadow-sm">
            <h4 className="font-bold text-stone-900 mb-2 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs">Step 1</span> Summarize & Validate
            </h4>
            <p className="text-sm text-stone-600 mb-3">Reiterate their pain and the value you've agreed upon to ensure they feel the momentum.</p>
            <div className="bg-emerald-50 p-3 rounded border border-emerald-100 text-sm text-emerald-900 italic">
              "Based on what you shared about the agency spend and the hiring manager bottlenecks, I think we have a strong case for moving forward."
            </div>
          </div>

          <div className="bg-white border-l-4 border-emerald-500 p-6 rounded-r-xl shadow-sm">
            <h4 className="font-bold text-stone-900 mb-2 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs">Step 2</span> The Prescriptive Ask
            </h4>
            <p className="text-sm text-stone-600 mb-3">Tell them what happens next. Give two specific options (The Alternative Choice Close).</p>
            <div className="bg-emerald-50 p-3 rounded border border-emerald-100 text-sm text-emerald-900 italic">
              "The typical next step here is a deeper dive with your TA team to look at the Career Site builder. I have my calendar open—does Tuesday morning or Thursday afternoon look better for you?"
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection title="Handling the BAMFAM Objection">
        <div className="border border-rose-200 rounded-xl overflow-hidden mt-4 shadow-sm">
          <div className="bg-rose-50 border-b border-rose-100 p-5 flex items-start gap-3">
            <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={20} />
            <div>
              <span className="font-bold text-rose-900 block text-lg">"Just send me an email and we'll figure it out."</span>
              <p className="text-sm text-rose-700 mt-1">The classic dodge. They are trying to regain control or avoid commitment.</p>
            </div>
          </div>
          <div className="bg-white p-6 space-y-4 text-sm text-stone-700">
            <p><strong>Your Response (The Placeholder Pushback):</strong></p>
            <p className="italic">"I'm happy to do that, Sarah. Just to make sure we don't end up playing calendar ping-pong next week, let's just put a 15-minute placeholder on the calendar now for Wednesday. If things change on your end, you can just decline or propose a new time from the invite. How does 2 PM look?"</p>
          </div>
        </div>
      </DocSection>

    </div>
  );
}
