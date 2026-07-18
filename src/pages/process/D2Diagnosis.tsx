import { DocHeader, DocSection, Callout, ScriptBlock } from '../../components/process/DocComponents';

export default function D2Diagnosis() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        stage="D2"
        title="Diagnosis (Be the Doctor)" 
        subtitle="Reframe surface-level symptoms into urgent business problems." 
      />

      <DocSection title="Objective: Elevate the Pain">
        <p>
          The goal of Diagnosis is to take the symptom they gave you in D1 and connect it to a massive business gap. You are the doctor diagnosing the disease, not just treating the symptom.
        </p>
      </DocSection>

      <DocSection title="Execution Workflow">
        <p>Follow this exact sequence when diagnosing the problem:</p>
        <ol className="list-decimal pl-5 space-y-2 mb-6 font-medium text-stone-700">
          <li><strong>Listen to the symptom</strong></li>
          <li><strong>Acknowledge it</strong></li>
          <li><strong>Deliver the bigger problem</strong> (Reframe)</li>
          <li><strong>Ask a Reveal Question</strong></li>
          <li><strong>Pause</strong> (Let them fill the silence)</li>
          <li><strong>Frame the demo</strong> around this specific gap</li>
        </ol>

        <ScriptBlock label="The Reframe Script">
          "I hear that your recruiting process is slow (Symptom). 
          
          But typically when we see that, the real issue is that hiring managers are completely disconnected from the Provider, meaning your talent team is doing double the admin work (Bigger Problem). 
          
          How much time is your team spending just chasing down feedback?" (Reveal Question)
        </ScriptBlock>
      </DocSection>

      <DocSection title="The Halftime Check">
        <Callout type="rule" title="MANDATORY PAUSE">
          There is a mandatory pause between D2 and D3. Reps must evaluate CP1 and CP2 with their manager. If either fails, the deal goes back to D1 or is lost. You do not advance to D3. <strong>You cannot save a deal at D3 that was lost at D1.</strong>
        </Callout>
      </DocSection>

      <DocSection title="Gating: Checkpoint 2 (Solution & Resources)">
        <Callout type="warning" title="Checkpoint 2 Requirements">
          Do they agree that new or external resources are needed? The prospect must admit their internal efforts or current vendor have failed. This prevents <strong>Competition</strong> and <strong>Price</strong> fatalities.
        </Callout>
      </DocSection>
    </div>
  );
}
