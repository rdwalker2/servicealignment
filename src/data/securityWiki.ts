import type { WikiFeature } from './productWiki';

export const securityWikiData: WikiFeature[] = [
  {
    id: 'gdpr-compliance',
    title: 'GDPR Compliance',
    subtitle: 'Data processing and privacy in the EU',
    category: 'compliance',
    status: 'verified',
    whatItDoes: 'Service Alignment is fully GDPR compliant, ensuring all candidate and employee data is processed securely according to EU regulations.',
    howItWorks: '1. Candidates must consent to data processing upon applying.\n2. Automated data retention policies delete candidate data after a customizable period.\n3. Candidates can request data deletion or export at any time.\n4. All data is hosted on AWS servers located within the EU (Stockholm/Ireland).',
    whatNotToSay: 'Do not say "we own the candidate data." The customer is the Data Controller, Service Alignment is the Data Processor.',
    tags: ['gdpr', 'privacy', 'eu', 'data'],
    lastVerified: '2026-06-01',
    verifiedBy: 'InfoSec Team',
    prospectQA: [
      {
        q: 'Where is our data hosted?',
        a: 'Our primary data centers are hosted by Amazon Web Services (AWS) within the EU (Stockholm and Ireland) to ensure strict GDPR compliance.'
      },
      {
        q: 'Can candidates delete their own data?',
        a: 'Yes, candidates can use the self-service portal to request deletion or export of their data.'
      }
    ]
  },
  {
    id: 'soc2-type2',
    title: 'SOC2 Type II',
    subtitle: 'Security, Availability, and Confidentiality',
    category: 'certifications',
    status: 'verified',
    whatItDoes: 'Service Alignment holds a SOC2 Type II certification, demonstrating our commitment to rigorous security practices and data protection over time.',
    howItWorks: 'Our systems undergo continuous auditing for security, availability, processing integrity, confidentiality, and privacy. The full report can be provided under NDA.',
    tags: ['soc2', 'security', 'audit', 'enterprise'],
    lastVerified: '2026-01-15',
    verifiedBy: 'Compliance Team'
  },
  {
    id: 'sso-saml',
    title: 'SSO (Single Sign-On)',
    subtitle: 'Enterprise Identity Management',
    category: 'access',
    status: 'verified',
    whatItDoes: 'We support SAML 2.0 and OpenID Connect for Single Sign-On, allowing enterprise customers to manage Service Alignment access via Okta, Azure AD, or Google Workspace.',
    howItWorks: '1. Configure the Identity Provider (IdP) with Service Alignment’s ACS URL.\n2. Upload the IdP metadata XML to Service Alignment.\n3. Enforce SSO for all company users to disable standard password logins.',
    implementationNotes: 'SSO requires the Enterprise plan or the SSO Add-on. Implementation usually takes 1-2 hours of IT collaboration.',
    tags: ['sso', 'saml', 'okta', 'azure', 'security']
  }
];
