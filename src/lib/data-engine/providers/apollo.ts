/**
 * Apollo.io API Stub (Mock Provider)
 * Role: Human Contact / Decision Maker Discovery
 * Purpose: Searches a specific company domain for people with titles like
 * "Facility Manager", "Director of Real Estate", or "Property Manager".
 */

export interface ApolloContactResponse {
  first_name: string;
  last_name: string;
  title: string;
  email: string;
  mobile_phone: string;
  linkedin_url: string;
  email_status: 'verified' | 'catch_all' | 'unverifiable';
}

export async function findDecisionMakers(domain: string, titles: string[]): Promise<ApolloContactResponse[]> {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 600));

  console.log(`[Apollo] Searching for [${titles.join('|')}] at domain: ${domain}`);

  const mockDb: Record<string, ApolloContactResponse[]> = {
    'brookfieldproperties.com': [
      {
        first_name: 'Sarah',
        last_name: 'Chen',
        title: 'VP of Facilities Management',
        email: 'sarah.chen@brookfieldproperties.com',
        mobile_phone: '+1 (307) 555-4418',
        linkedin_url: 'https://linkedin.com/in/sarah-chen-mock',
        email_status: 'verified'
      }
    ],
    'prologis.com': [
      {
        first_name: 'David',
        last_name: 'Johnson',
        title: 'Regional Facilities Director',
        email: 'djohnson@prologis.com',
        mobile_phone: '+1 (214) 555-6818',
        linkedin_url: 'https://linkedin.com/in/david-j-mock',
        email_status: 'verified'
      }
    ]
  };

  if (mockDb[domain]) {
    return mockDb[domain];
  }

  // Generate a realistic random contact for unknown domains
  const firstNames = ['Michael', 'Jessica', 'Robert', 'Amanda', 'Christopher'];
  const lastNames = ['Miller', 'Martinez', 'Smith', 'Williams', 'Brown'];
  
  const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lName = lastNames[Math.floor(Math.random() * lastNames.length)];

  return [
    {
      first_name: fName,
      last_name: lName,
      title: 'Facility Manager',
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}@${domain}`,
      mobile_phone: `+1 (${Math.floor(Math.random()*900)+100}) 555-${Math.floor(Math.random()*9000)+1000}`,
      linkedin_url: `https://linkedin.com/in/${fName.toLowerCase()}-${lName.toLowerCase()}-mock`,
      email_status: 'verified'
    }
  ];
}
