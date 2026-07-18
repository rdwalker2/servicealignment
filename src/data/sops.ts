export interface SOPStep {
  id: string;
  task: string;
  isCritical?: boolean;
}

export interface SOPChecklist {
  id: string;
  title: string;
  description: string;
  category: 'Preparation' | 'Onsite' | 'Execution' | 'Closeout';
  steps: SOPStep[];
}

export const CHECKLISTS: SOPChecklist[] = [
  {
    id: 'on-the-way',
    title: 'On The Way Checklist',
    description: 'Ensure the truck is loaded and the client is informed before departure.',
    category: 'Preparation',
    steps: [
      { id: '1', task: 'Call the point of contact to provide ETA.', isCritical: true },
      { id: '2', task: 'Review the Work Order and NTE (Not-To-Exceed) amount.' },
      { id: '3', task: 'Verify all materials required for the Work Order are stocked on the truck.', isCritical: true },
      { id: '4', task: 'Ensure iPad/Tablet is charged and ready for photos.' }
    ]
  },
  {
    id: 'get-onsite',
    title: 'When You Get Onsite',
    description: 'Professionalism and safety upon arrival.',
    category: 'Onsite',
    steps: [
      { id: '1', task: 'Park in designated contractor areas, not in front of main entrances.' },
      { id: '2', task: 'Check in with the Facility Manager or main office.', isCritical: true },
      { id: '3', task: 'Ask the client: "Are there any specific areas leaking inside today?"' },
      { id: '4', task: 'Set up cones around the truck.' }
    ]
  },
  {
    id: 'setting-up',
    title: 'Setting Up the Job (Safety)',
    description: 'Establishing a safe work environment.',
    category: 'Preparation',
    steps: [
      { id: '1', task: 'Set up the ladder at a 4:1 ratio (75-degree angle).' },
      { id: '2', task: 'Tie off the ladder securely.', isCritical: true },
      { id: '3', task: 'Ensure harness and lanyard are inspected and worn if within 6 feet of the edge.' },
      { id: '4', task: 'Hoist materials using proper buckets and ropes.' }
    ]
  },
  {
    id: 'on-the-roof',
    title: 'Now That You\'re On The Roof',
    description: 'Investigating and repairing the core issue.',
    category: 'Execution',
    steps: [
      { id: '1', task: 'Take "Before" photos of the overall roof and specific defect areas.', isCritical: true },
      { id: '2', task: 'Investigate the leak source (check penetrations, seams, and drains).' },
      { id: '3', task: 'Assess if the repair will exceed the NTE. If yes, call Sales immediately.', isCritical: true },
      { id: '4', task: 'Perform permanent repair (clean, prime, weld/seal).', isCritical: true },
      { id: '5', task: 'Take "During" and "After" photos of the repair.' }
    ]
  },
  {
    id: 'onsite-upsells',
    title: 'Onsite Upsells Checklist',
    description: 'Identifying additional revenue opportunities (Target: $2k/week).',
    category: 'Execution',
    steps: [
      { id: '1', task: 'Inspect high-traffic areas for membrane wear and damage.' },
      { id: '2', task: 'Inspect roof penetrations (HVAC units, skylights, vent stacks).' },
      { id: '3', task: 'Measure deficiencies (linear feet, square feet).' },
      { id: '4', task: 'Create "My Proposal" in the app for additional work found.', isCritical: true }
    ]
  },
  {
    id: 'checking-out',
    title: 'Checking Out & Before We Leave',
    description: 'Ensuring a clean site and satisfied client.',
    category: 'Closeout',
    steps: [
      { id: '1', task: 'Remove all trash and debris from the roof. "Act as if it were your roof."', isCritical: true },
      { id: '2', task: 'Secure roof hatch or access doors.' },
      { id: '3', task: 'Check out with the Facility Manager and explain the repairs made.' },
      { id: '4', task: 'Sync all photos and notes to the service ticket before leaving the parking lot.', isCritical: true }
    ]
  }
];
