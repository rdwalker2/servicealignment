/**
 * BatchData API Stub (Mock Provider)
 * Role: Real Estate Data / Tax Assessor Data
 * Purpose: Pierce the LLC veil to find the true property owner and mailing address.
 */

export interface BatchDataPropertyResponse {
  address: string;
  parcel_id: string;
  owner_name: string; // Often an LLC
  mailing_address: string; // The crucial link to the parent company
  building_sqft: number;
  year_built: number;
}

export async function resolvePropertyTaxes(address: string): Promise<BatchDataPropertyResponse | null> {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 800));

  console.log(`[BatchData] Resolving ownership for: ${address}`);

  // Mock Tax Assessor Database (simulating "LLC Masking")
  const mockDb: Record<string, BatchDataPropertyResponse> = {
    '1151 Galleria Blvd, Roseville, CA': {
      address: '1151 Galleria Blvd, Roseville, CA',
      parcel_id: '015-160-045-000',
      owner_name: 'ROSEVILLE GALLERIA LLC',
      mailing_address: '250 Vesey St, 15th Floor, New York, NY', // This is Brookfield's HQ!
      building_sqft: 1300000,
      year_built: 2000
    },
    '8000 Metro Air Pkwy, Sacramento, CA': {
      address: '8000 Metro Air Pkwy, Sacramento, CA',
      parcel_id: '201-0300-112-0000',
      owner_name: 'METRO AIR PARK INDUSTRIAL LLC',
      mailing_address: 'Pier 1, Bay 1, San Francisco, CA', // Prologis HQ
      building_sqft: 450000,
      year_built: 2018
    },
    'default': {
      address: address,
      parcel_id: `999-${Math.floor(Math.random() * 1000)}-000`,
      owner_name: 'GENERIC REALTY HOLDINGS LLC',
      mailing_address: '123 Corporate Way, Chicago, IL',
      building_sqft: 100000,
      year_built: 1995
    }
  };

  const match = Object.keys(mockDb).find(k => address.includes(k.split(',')[0]));
  return match ? mockDb[match] : mockDb['default'];
}
