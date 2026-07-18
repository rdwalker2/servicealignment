import { DocHeader, DocSection, Callout } from '../../../components/process/DocComponents';
import { Phone, AlertTriangle, ShieldCheck, Clock, MessageCircle } from 'lucide-react';

export default function GoldenMinute() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32 space-y-12">
      <DocHeader 
        title="The Golden Minute" 
        subtitle="Mastering the first 60 seconds of a cold call." 
      />

      <DocSection title="What is the Golden Minute?">
        <p className="text-lg text-stone-700 leading-relaxed">
          You have exactly 60 seconds to earn the right to the next 5 minutes. The Golden Minute is the highly structured, psychological framework for the beginning of a cold call that disarms the prospect, establishes relevance, and gains permission to continue.
        </p>
        <p className="text-stone-600 mt-4">
          Most cold calls fail because reps sound like salespeople. The Golden Minute is designed to make you sound like a peer, a consultant, and someone who understands their specific world.
        </p>
      </DocSection>

      <DocSection title="The Three Steps of the Golden Minute">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          
          <div className="border border-sky-200 p-6 rounded-2xl bg-gradient-to-b from-sky-50 to-white shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 mb-4 font-bold text-lg">1</div>
              <h4 className="font-bold text-sky-900 mb-2 text-lg">The Hook</h4>
              <p className="text-[13px] font-bold text-sky-700 mb-2 uppercase tracking-wider">Pattern Interrupt</p>
              <p className="text-[14px] text-stone-600 leading-relaxed mb-4">
                Break their auto-pilot "hang up on a salesperson" reflex. You must immediately acknowledge the interruption.
              </p>
              <div className="bg-white p-3 rounded-lg border border-sky-100 text-sm italic text-stone-700 shadow-sm">
                "Hi Sarah, it's Alex from Service Alignment. I know I'm catching you out of the blue, do you have a brief moment?"
              </div>
            </div>
          </div>

          <div className="border border-indigo-200 p-6 rounded-2xl bg-gradient-to-b from-indigo-50 to-white shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4 font-bold text-lg">2</div>
              <h4 className="font-bold text-indigo-900 mb-2 text-lg">The Intro</h4>
              <p className="text-[13px] font-bold text-indigo-700 mb-2 uppercase tracking-wider">Establish Relevance</p>
              <p className="text-[14px] text-stone-600 leading-relaxed mb-4">
                Deliver a hyper-relevant, 15-second value proposition tied directly to their persona or a recent trigger event.
              </p>
              <div className="bg-white p-3 rounded-lg border border-indigo-100 text-sm italic text-stone-700 shadow-sm">
                "The reason for my call is I noticed you're aggressively hiring for engineering roles right now, but your current Provider doesn't have an engineering career page..."
              </div>
            </div>
          </div>

          <div className="border border-violet-200 p-6 rounded-2xl bg-gradient-to-b from-violet-50 to-white shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-100 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 mb-4 font-bold text-lg">3</div>
              <h4 className="font-bold text-violet-900 mb-2 text-lg">The Permission</h4>
              <p className="text-[13px] font-bold text-violet-700 mb-2 uppercase tracking-wider">The Soft Ask</p>
              <p className="text-[14px] text-stone-600 leading-relaxed mb-4">
                Ask a low-friction question to transition into Discovery. Do not ask for a meeting yet. Ask about their process.
              </p>
              <div className="bg-white p-3 rounded-lg border border-violet-100 text-sm italic text-stone-700 shadow-sm">
                "How are you currently handling the sourcing for those hard-to-fill tech roles?"
              </div>
            </div>
          </div>

        </div>
      </DocSection>

      <DocSection title="Tonality & Execution">
        <p className="mb-6 text-stone-600">The exact words you use only matter if your tone conveys confidence and peer-level authority.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-stone-50 border border-stone-200 p-5 rounded-xl flex gap-4">
            <div className="shrink-0 pt-1"><Clock className="text-stone-400" size={20} /></div>
            <div>
              <h5 className="font-bold text-stone-900 mb-1">Pacing & Pauses</h5>
              <p className="text-sm text-stone-600">Speak 10% slower than your natural pace. Embrace the silence after you ask your hook question. Let them answer before you rush into the Intro.</p>
            </div>
          </div>
          
          <div className="bg-stone-50 border border-stone-200 p-5 rounded-xl flex gap-4">
            <div className="shrink-0 pt-1"><ShieldCheck className="text-emerald-500" size={20} /></div>
            <div>
              <h5 className="font-bold text-stone-900 mb-1">Downward Inflection</h5>
              <p className="text-sm text-stone-600">End your sentences with a downward inflection. Upward inflection (uptalk) makes you sound unsure, like you are asking for permission to exist.</p>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection title="Handling Early Objections (The Brush-Off)">
        <p className="mb-4 text-stone-600">Prospects will reflexively try to get off the phone. Do not panic. Use the <strong>Acknowledge, Pivot, and Soft Ask</strong> framework.</p>

        <div className="space-y-4">
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <div className="bg-rose-50 border-b border-stone-200 p-4">
              <span className="font-bold text-rose-800">"I'm stepping into a meeting right now."</span>
            </div>
            <div className="bg-white p-5 text-sm text-stone-700">
              <strong>Your Response:</strong> "I completely understand. I'll be super brief so you can get to your meeting. I was just calling because [Insert 10-second Relevance]. Is this something that's on your radar for this quarter?"
            </div>
          </div>

          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <div className="bg-rose-50 border-b border-stone-200 p-4">
              <span className="font-bold text-rose-800">"We already use Workday/Greenhouse."</span>
            </div>
            <div className="bg-white p-5 text-sm text-stone-700">
              <strong>Your Response:</strong> "That makes sense, most of the TA leaders I speak with are using a legacy platform. Usually when I talk to teams using [Competitor], they mention struggling with candidate conversion rates on their career site. How is that performing for you today?"
            </div>
          </div>
          
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <div className="bg-rose-50 border-b border-stone-200 p-4">
              <span className="font-bold text-rose-800">"Send me an email."</span>
            </div>
            <div className="bg-white p-5 text-sm text-stone-700">
              <strong>Your Response:</strong> "I'm happy to do that, Sarah. Just to make sure I don't spam you with irrelevant information, what's your biggest priority right now when it comes to hiring? I'll tailor the email to that."
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection title="Pro Tips">
        <Callout type="warning" title="Tone is Everything">
          Your tone of voice accounts for 80% of the Golden Minute's success. Speak clearly, confidently, and slightly slower than your natural pace. Practice your hook out loud 50 times before your first dial block.
        </Callout>
      </DocSection>
    </div>
  );
}
