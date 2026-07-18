import { DocHeader, DocSection, Callout } from '../../../components/process/DocComponents';

export default function Axnot() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        title="AXNOT Framework" 
        subtitle="The 5-step process for handling objections effectively." 
      />

      <DocSection title="What is AXNOT?">
        <p>
          Objections are a natural part of the sales process. The AXNOT framework gives you a structured way to handle them without being defensive or combative.
        </p>
      </DocSection>

      <DocSection title="The 5 Steps of AXNOT">
        <div className="space-y-4 mt-2">
          
          <div className="border border-sky-200 p-4 rounded-lg bg-sky-50/30">
            <h4 className="font-bold text-sky-900 mb-1">A - Appreciate</h4>
            <p className="text-[14px] text-sky-800">
              Acknowledge their concern. "I completely understand why you'd feel that way." or "That makes a lot of sense."
            </p>
          </div>

          <div className="border border-indigo-200 p-4 rounded-lg bg-indigo-50/30">
            <h4 className="font-bold text-indigo-900 mb-1">X - Cross off</h4>
            <p className="text-[14px] text-indigo-800">
              Isolate the objection. "Aside from the price, is there any other reason we couldn't move forward?"
            </p>
          </div>

          <div className="border border-violet-200 p-4 rounded-lg bg-violet-50/30">
            <h4 className="font-bold text-violet-900 mb-1">N - New Idea</h4>
            <p className="text-[14px] text-violet-800">
              Introduce a new perspective or reframe the concern. "Have you considered how much time your team is currently wasting on manual data entry?"
            </p>
          </div>

          <div className="border border-fuchsia-200 p-4 rounded-lg bg-fuchsia-50/30">
            <h4 className="font-bold text-fuchsia-900 mb-1">O - Own it</h4>
            <p className="text-[14px] text-fuchsia-800">
              Provide evidence or a case study that addresses their specific concern head-on.
            </p>
          </div>

          <div className="border border-rose-200 p-4 rounded-lg bg-rose-50/30">
            <h4 className="font-bold text-rose-900 mb-1">T - Transition</h4>
            <p className="text-[14px] text-rose-800">
              Move the conversation back to the next step. "With that in mind, does it make sense to get this scheduled?"
            </p>
          </div>

        </div>
      </DocSection>
    </div>
  );
}
