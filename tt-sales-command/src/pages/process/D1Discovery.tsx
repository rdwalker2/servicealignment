import { DocHeader, DocSection, Callout, ScriptBlock } from '../../components/process/DocComponents';

export default function D1Discovery() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        stage="D1"
        title="Discovery (Find the Pain)" 
        subtitle="Uncover the root cause of the broken process." 
      />

      <DocSection title="Objective: Be the Detective">
        <p>
          The goal of the Discovery stage is not to qualify the prospect for a demo—it is to <strong>qualify the problem</strong>. You must act as a detective to uncover the root cause of the buyer's broken process.
        </p>
        <Callout type="rule" title="The 20/80 Rule">
          In D1, you should be talking 20% of the time and listening 80% of the time. If you find yourself pitching features, you have failed the Discovery stage.
        </Callout>
      </DocSection>

      <DocSection title="Execution Workflow">
        <p>Your discovery must identify three critical elements:</p>
        <ul className="list-disc pl-5 space-y-2 mb-6">
          <li><strong>The Trigger:</strong> What event caused them to start looking for a solution right now?</li>
          <li><strong>The Blast Radius:</strong> Who else in the organization is affected by this broken process?</li>
          <li><strong>The Cost of Inaction:</strong> What happens if they do nothing?</li>
        </ul>

        <ScriptBlock label="The Golden Rule Question">
          Instead of asking generic questions like "Tell me about your company," ask:

          "What happens if you don't fix this in 6 months?"
        </ScriptBlock>
      </DocSection>

      <DocSection title="Gating: Checkpoint 1 (Need & Urgency)">
        <p>
          You cannot advance a deal to D2 without passing <strong>Checkpoint 1: The Urgency Test</strong>.
        </p>
        <Callout type="warning" title="Checkpoint 1 Requirements">
          The prospect must explicitly acknowledge severe pain and the consequences of inaction. If they say "It would be nice to have," the deal dies here. This prevents <strong>Timing</strong> and <strong>Competition</strong> fatalities.
        </Callout>
      </DocSection>
    </div>
  );
}
