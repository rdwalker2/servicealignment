import { DocHeader, DocSection, Callout, ScriptBlock } from '../../components/process/DocComponents';
import PainToDemoMatrix from '../../components/process/PainToDemoMatrix';

export default function D3Demonstrate() {
  return (
    <div className="p-10 max-w-4xl mx-auto h-full overflow-y-auto pb-32">
      <DocHeader 
        stage="D3"
        title="Demonstrate (Show YOUR Solution)" 
        subtitle="Connect every screen directly back to the buyer's stated problems." 
      />

      <DocSection title="Objective: Not a Feature Tour">
        <p>
          The Demonstration stage is explicitly <em>not</em> a feature tour. If you are clicking through screens saying "and here you can do X," you are losing the deal. You must only show features that directly solve the gaps identified in D2.
        </p>
      </DocSection>

      <DocSection title="Interactive Demo Playbook">
        <p>
          Select the core pain you identified in D1 and D2 on the left. Memorize the 3-part demo formula on the right to ensure your presentation directly solves the buyer's problem.
        </p>
        <PainToDemoMatrix />
      </DocSection>

      <DocSection title="The Rule of 3">
        <Callout type="info" title="Structure Guidelines">
          Structure the demo in exactly 3 sections, with 3 key bullets each. This prevents rambling and forces you to prioritize only the most critical value drivers.
        </Callout>
      </DocSection>

      <DocSection title="Gating: Checkpoint 3 (Best-Fit Solution)">
        <Callout type="warning" title="Checkpoint 3 Requirements">
          Do they believe your solution is the best option and are they confident in choosing you? They must explicitly acknowledge the ROI and fit. This prevents <strong>Price</strong>, <strong>Trust</strong>, and <strong>Product Fit</strong> fatalities.
        </Callout>
      </DocSection>
    </div>
  );
}
