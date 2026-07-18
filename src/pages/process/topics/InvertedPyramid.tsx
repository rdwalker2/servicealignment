import { DocHeader, DocSection, Callout } from '../../../components/process/DocComponents';
import { AlignCenter, AlignJustify, Search, Target, HelpCircle } from 'lucide-react';

export default function InvertedPyramid() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32 space-y-12">
      <DocHeader 
        title="The Inverted Pyramid" 
        subtitle="A psychological framework for uncovering deep pain and urgency." 
      />

      <DocSection title="What is the Inverted Pyramid?">
        <p className="text-lg text-stone-700 leading-relaxed mb-4">
          Discovery is not an interrogation. It's a structured conversation that guides the prospect to realize their own pain. The Inverted Pyramid prevents you from asking narrow, threatening questions too early, ensuring you build trust before extracting sensitive information.
        </p>
      </DocSection>

      <DocSection title="The Three Layers of Discovery">
        <div className="flex flex-col items-center mt-8 space-y-2">
          
          {/* Top Tier */}
          <div className="w-full bg-sky-50 border border-sky-200 p-6 text-center relative overflow-hidden group hover:bg-sky-100 transition-colors shadow-sm">
            <div className="flex justify-center mb-3 text-sky-500"><AlignJustify size={24} /></div>
            <h4 className="font-bold text-sky-900 mb-2 uppercase tracking-widest text-sm">Tier 1: Broad & Open (Context)</h4>
            <p className="text-[14px] text-sky-800 max-w-xl mx-auto mb-4">
              Goal: Get them talking about their world, their goals, and their current state without feeling pressured. Listen for emotional cues.
            </p>
            <div className="bg-white/60 p-3 rounded text-sm text-sky-900 text-left border border-sky-100 max-w-2xl mx-auto italic">
              "Walk me through what happens when a hiring manager requests a new headcount today — start to finish."<br/><br/>
              "When you think about your hiring goals for Q3, what's keeping you up at night?"
            </div>
          </div>

          {/* Middle Tier */}
          <div className="w-3/4 bg-indigo-50 border border-indigo-200 p-6 text-center relative overflow-hidden group hover:bg-indigo-100 transition-colors shadow-sm">
            <div className="flex justify-center mb-3 text-indigo-500"><AlignCenter size={24} /></div>
            <h4 className="font-bold text-indigo-900 mb-2 uppercase tracking-widest text-sm">Tier 2: Probing (The Pain)</h4>
            <p className="text-[14px] text-indigo-800 max-w-xl mx-auto mb-4">
              Goal: Drill down into the specific frictions they mentioned in Tier 1. Make them articulate the negative consequences.
            </p>
            <div className="bg-white/60 p-3 rounded text-sm text-indigo-900 text-left border border-indigo-100 max-w-xl mx-auto italic">
              "You mentioned hiring managers are slow to give feedback. What exactly is the bottleneck there?"<br/><br/>
              "How is that delay impacting your offer acceptance rate?"
            </div>
          </div>

          {/* Bottom Tier */}
          <div className="w-1/2 bg-violet-50 border border-violet-200 p-6 text-center rounded-b-xl relative overflow-hidden group hover:bg-violet-100 transition-colors shadow-sm">
            <div className="flex justify-center mb-3 text-violet-500"><Target size={24} /></div>
            <h4 className="font-bold text-violet-900 mb-2 uppercase tracking-widest text-sm">Tier 3: Specific & Closed (The Impact)</h4>
            <p className="text-[14px] text-violet-800 max-w-md mx-auto mb-4">
              Goal: Quantify the pain and confirm understanding. If you can't attach a number or a hard timeline, there is no urgency.
            </p>
            <div className="bg-white/60 p-3 rounded text-sm text-violet-900 text-left border border-violet-100 mx-auto italic">
              "So you're saying you spend 15 hours a week just chasing feedback?"<br/><br/>
              "If you don't hit that 50 headcount goal by December, what happens to the product roadmap?"
            </div>
          </div>

        </div>
      </DocSection>

      <DocSection title="Mapping to MEDDPICC">
        <p className="mb-4 text-stone-600">The Inverted Pyramid is how you uncover the <strong>I (Implicate Pain)</strong> and <strong>M (Metrics)</strong> in MEDDPICC without sounding like an interrogator.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-stone-200 p-5 rounded-xl bg-white">
            <h5 className="font-bold text-rose-700 flex items-center gap-2 mb-2">Implicate the Pain</h5>
            <p className="text-sm text-stone-600">Use Tier 2 (Probing) to uncover the business pain (e.g., missed revenue targets, high agency spend) behind the technical pain (e.g., clunky UI, poor reporting).</p>
          </div>
          <div className="border border-stone-200 p-5 rounded-xl bg-white">
            <h5 className="font-bold text-emerald-700 flex items-center gap-2 mb-2">Identify the Metrics</h5>
            <p className="text-sm text-stone-600">Use Tier 3 (Specific) to attach numbers to the pain. "How much is agency spend costing you per quarter?" "What is your current time-to-hire in days?"</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="The TEDW Framework">
        <Callout type="tip" title="Use TEDW to stay open-ended in Tier 1">
          When you feel yourself asking a Yes/No question too early, pivot to a TEDW opener:
          <ul className="list-disc pl-5 mt-2 space-y-1 font-mono text-sm text-stone-700">
            <li><strong>T</strong>ell me about...</li>
            <li><strong>E</strong>xplain how...</li>
            <li><strong>D</strong>escribe the process of...</li>
            <li><strong>W</strong>alk me through...</li>
          </ul>
        </Callout>
      </DocSection>
    </div>
  );
}
