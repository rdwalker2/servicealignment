/**
 * ZoomInfo / Ocean.io API Stub (Mock Provider)
 * Role: Corporate Entity Resolution
 * Purpose: Takes a mailing address or shell LLC name and resolves the parent
 * Property Management Company or REIT.
 */

export interface ZoomInfoCompanyResponse {
  company_name: string;
  domain: string;
  industry: string;
  employee_count: number;
  confidence_score: number;
}

export async function resolveParentCompany(mailingAddress: string, shellName: string): Promise<ZoomInfoCompanyResponse | null> {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log(`[ZoomInfo] Resolving parent entity for mailing address: ${mailingAddress}`);

  // Mock ZoomInfo Corporate Registry Database
  const mockDb: Record<string, ZoomInfoCompanyResponse> = {
    '250 Vesey St': {
      company_name: 'Brookfield Properties',
      domain: 'brookfieldproperties.com',
      industry: 'Commercial Real Estate',
      employee_count: 5000,
      confidence_score: 98
    },
    'Pier 1, Bay 1': {
      company_name: 'Prologis',
      domain: 'prologis.com',
      industry: 'Industrial Logistics',
      employee_count: 3200,
      confidence_score: 95
    },
    '123 Corporate Way': {
      company_name: 'JLL (Jones Lang LaSalle)',
      domain: 'jll.com',
      industry: 'Real Estate Management',
      employee_count: 100000,
      confidence_score: 89
    }
  };

  const match = Object.keys(mockDb).find(k => mailingAddress.includes(k));
  
  if (match) {
    return mockDb[match];
  }

  // Fallback: Assume the shell company is the actual operating business
  return {
    company_name: shellName.replace(' LLC', ''),
    domain: shellName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
    industry: 'Real Estate',
    employee_count: 50,
    confidence_score: 55
  };
}
