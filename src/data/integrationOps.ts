export type TeamRole = {
  title: string;
  focus: string;
  description: string;
  icon: string;
};

export type Workflow = {
  id: string;
  title: string;
  description: string;
  steps: string[];
  pros: string[];
  cons: string[];
};

export type FAQ = {
  question: string;
  answer: string;
  audience: 'Sales' | 'CSM' | 'Both';
};

export const INTEGRATION_ROLES: TeamRole[] = [
  {
    title: 'Technology Partnership Managers (TPMs)',
    focus: 'Strategy & Commercial',
    description: 'Drive the development, launch, and lifecycle of integrations. They coordinate between Product, Tech, Sales, and Support. Internal TPMs focus on integrations we build; External TPMs support partners building towards our API.',
    icon: 'Briefcase'
  },
  {
    title: 'Integration Specialists',
    focus: 'Technical Triage & 2nd Line Support',
    description: 'Act as technical experts and the second line of support. They troubleshoot complex issues and coordinate directly with developers to fix bugs.',
    icon: 'Wrench'
  },
  {
    title: 'Integration Success Specialist',
    focus: 'Projects & Escalations',
    description: 'Internal consultant for large integration projects. Coordinates closely with customers, internal teams, and external partners to establish ownership and handle escalations.',
    icon: 'Target'
  },
  {
    title: 'Technical Product Specialist',
    focus: 'Enablement & Education',
    description: 'Educates internal teams on technical aspects, helps with escalation processes, and occasionally joins critical customer meetings to provide technical weight.',
    icon: 'GraduationCap'
  }
];

export const INTEGRATION_WORKFLOWS: Workflow[] = [
  {
    id: 'internal-build',
    title: 'Internal Build (Service Alignment builds it)',
    description: 'When a prospect or customer requests an integration that should be available on our Marketplace, and we decide to build it ourselves.',
    steps: [
      'Submit request via #integrations Slack channel.',
      'TPM reviews and adds to the prioritized backlog.',
      'Development is scoped and scheduled in a future cycle.'
    ],
    pros: [
      'We have full control over the user experience.',
      'Native integration feel within Service Alignment.'
    ],
    cons: [
      'Takes significantly longer due to internal prioritization.',
      'Competes with core product resources.'
    ]
  },
  {
    id: 'external-build',
    title: 'External Build (Partner builds it)',
    description: 'When a partner or third-party wants to integrate with Service Alignment using our open API.',
    steps: [
      'Send the partner the public "Integrate with Service Alignment" Notion page.',
      'Partner fills out request form to receive a Developer Sandbox.',
      'TPM provisions Sandbox (Do NOT use demo accounts for this).',
      'Partner builds, TPM reviews, tests, and approves for Marketplace launch.'
    ],
    pros: [
      'Much faster if the partner has dedicated dev resources.',
      'Offloads development work from our internal teams.'
    ],
    cons: [
      'We have less control over the final UX and timeline.'
    ]
  }
];

export const INTEGRATION_FAQS: FAQ[] = [
  {
    question: 'A customer says an integration is broken. What do I do?',
    answer: 'Direct them to the Support Team FIRST. Support runs initial tests and investigates. If it is a confirmed bug, Support escalates to the Integration Specialists. Do not bypass Support — doing so breaks the tracking process and delays resolution.',
    audience: 'Both'
  },
  {
    question: 'Can an Integration Specialist join my customer meeting?',
    answer: 'No. Our 3 Integration Specialists coordinate all global integration issues; their time is strictly dedicated to troubleshooting and working with devs. Support can help via chat, or you can ask for tips in #integrations beforehand.',
    audience: 'CSM'
  },
  {
    question: 'A prospect needs a custom, one-off integration just for them. Can we build it?',
    answer: 'We do not build custom 1:1 integrations. However, they can use their own developers (or a 3rd party agency) to build it using our open API. Share the API docs with them and CS can provision a Sandbox.',
    audience: 'Sales'
  },
  {
    question: 'I noticed documentation on an integration is wrong. How do I fix it?',
    answer: 'Use the "Documentation Update" workflow in the #integrations Slack channel to notify the team so we can correct the master list.',
    audience: 'Both'
  }
];

export const INTEGRATION_RULES = [
  'Never provision a Sandbox account for a partner yourself; always go through a TPM.',
  'Do not promise delivery timelines for Internal Builds until the TPM has confirmed the cycle.',
  'Always search the Master Integration List before submitting a question in #integrations.',
  'Bugs go to Support. Feature requests go to #integrations via workflow.'
];
