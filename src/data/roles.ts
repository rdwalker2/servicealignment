export interface RoleKPI {
  label: string;
  description: string;
}

export interface Role {
  id: string;
  title: string;
  icon: string;
  summary: string;
  deliverables: RoleKPI[];
  bonusStructure: string;
  dailyRoutine: {
    morning: string[];
    afternoon: string[];
  };
}

export const ROLES: Role[] = [
  {
    id: 'general-manager',
    title: 'General Manager',
    icon: 'Briefcase',
    summary: 'The General Manager is responsible for the overall profitability of the branch. They oversee all projects with the support of the Production Team and Superintendent. Target gross margin is 60%.',
    deliverables: [
      { label: 'Divisional Revenue', description: 'Total billed revenue tracked daily, weekly, monthly. Ensure service tickets are invoiced within 72 hours of completion.' },
      { label: 'Divisional NET Profit', description: 'Manage costs and efficiently budget to result in a positive net profit. Goal: 60% Gross Margin.' },
      { label: 'ARR (Annual Recurring Revenue)', description: 'Ensure ARR increases monthly. 80% of proposals delivered without a PM visit must include a single annual inspection.' },
    ],
    bonusStructure: 'Quarterly Bonus based on Deliverables - 1% of the Quarter\'s (3-Months) Net Profit. Penalty reductions applied if quarterly revenue, net, or NPS goals are missed.',
    dailyRoutine: {
      morning: [
        'Review and approve dispatch and inspection approvals in real time.',
        'Work with the service coordinator to schedule urgent tickets.'
      ],
      afternoon: [
        'Review all tickets in "Hold" or "Resolved" and move to next action.',
        'Random quality control (QC) visits on 2-3 jobs per week.',
        'Connect with salesmen to review pipeline and open Qwikbids.'
      ]
    }
  },
  {
    id: 'superintendent',
    title: 'Superintendent',
    icon: 'HardHat',
    summary: 'The Superintendent manages the field operations, ensuring that the schedule meets weekly revenue requirements. They are responsible for $10,000 weekly revenue per van.',
    deliverables: [
      { label: 'Field Operations', description: 'Lead the 7:00 AM service huddle, dispatch crews, and manage the field workforce.' },
      { label: 'Quality Control', description: 'Conduct onsite job visits, review invoice checklists, and update the scoreboard.' },
      { label: 'Training & Safety', description: 'Perform monthly safety training, hands-on training, and bi-weekly Foreman 1:1s.' }
    ],
    bonusStructure: 'Incentivized by the completion of scheduled maintenance and minimizing non-billable hours. Bonus tied to overall branch profitability and zero safety incidents.',
    dailyRoutine: {
      morning: [
        '7:00 AM Service Huddle.',
        'Inbox Zero (AM).',
        'Invoice Checklist Photo Review and Documentation.',
        'Price site bids and inspections.'
      ],
      afternoon: [
        'Onsite Job Visits (Inspect what you expect).',
        'Confirm Material Availability for next day.',
        'Tracking Billable vs. Non-Billable Hours.',
        'Inbox Zero (PM).'
      ]
    }
  },
  {
    id: 'service-coordinator',
    title: 'Service Coordinator',
    icon: 'Headphones',
    summary: 'The central hub for all dispatch and scheduling. They ensure maximum efficiency by minimizing "window time" and ensuring techs are routed effectively.',
    deliverables: [
      { label: 'Dispatch Management', description: 'Triage incoming service calls and align the right technician to the right job based on skill level and location.' },
      { label: 'Customer Communication', description: 'Keep the client informed on ETA, delays, and completion status.' },
      { label: 'Invoice Preparation', description: 'Ensure all documentation, photos, and time-entries are collected so the GM can invoice within 72 hours.' }
    ],
    bonusStructure: 'Based on minimizing tech window time, maximizing billable hours, and hitting the 72-hour invoice turnaround target.',
    dailyRoutine: {
      morning: [
        'Review overnight emergencies and prioritize dispatch.',
        'Confirm today\'s schedule with Superintendent.',
        'Update clients on morning ETAs.'
      ],
      afternoon: [
        'Finalize next day\'s schedule.',
        'Chase down missing photos/notes from field techs.',
        'Prepare resolved tickets for GM billing review.'
      ]
    }
  },
  {
    id: 'service-foreman',
    title: 'Service Foreman',
    icon: 'Wrench',
    summary: 'The leader of the service truck. Responsible for executing repairs to manufacturer specifications and driving the Onsite Upsell goal.',
    deliverables: [
      { label: 'Repair Execution', description: 'Perform leak investigations and permanent repairs using TPO/EPDM/PVC standards.' },
      { label: 'Onsite Upsells', description: 'Generate $2,000 a week in upsells by identifying additional repair opportunities during service calls.' },
      { label: 'NTE Management', description: 'Manage the Not-To-Exceed limit. Call salesman immediately if investigation reveals more damage than the NTE allows.' }
    ],
    bonusStructure: 'Commission or spiffs paid out on successful Onsite Upsells (My Proposal) that convert into permanent repairs.',
    dailyRoutine: {
      morning: [
        'Attend 7:00 AM Huddle.',
        'Complete "On the Way" checklist.',
        'Complete "When You Get Onsite" checklist and setup safety.'
      ],
      afternoon: [
        'Execute repairs and capture clear, story-telling photos.',
        'Look for membrane wear, HVAC penetration issues, and hatch access wear for upsells.',
        'Complete "Checking Out" and "Before We Leave" checklists.'
      ]
    }
  },
  {
    id: 'technician',
    title: 'Technician',
    icon: 'Tool',
    summary: 'Supports the Foreman in executing the Perfect Service Checklist and ensuring the truck is stocked, safe, and ready for deployment.',
    deliverables: [
      { label: 'Safety & Setup', description: 'Ensure all safety protocols are followed, ladders tied off, and work zones established.' },
      { label: 'Material Management', description: 'Track materials used and notify Superintendent when truck stock is low.' },
      { label: 'Skill Development', description: 'Learn the lifecycle of a leak, positive/negative air pressure, and heat-welding techniques.' }
    ],
    bonusStructure: 'Progression-based pay increases based on passing Written Assessments and Hands-On Training modules.',
    dailyRoutine: {
      morning: [
        'Load the truck and ensure materials match the day\'s POs.',
        'Assist Foreman with site setup and safety.'
      ],
      afternoon: [
        'Execute assigned repairs under Foreman supervision.',
        'Clean up site completely. "Act as if it were your roof."'
      ]
    }
  }
];
