// Mock Regrid / Lightbox API Integration
// In production, this requires an active Regrid/Lightbox API Key

export async function fetchAerialFootprint(address: string) {
  const MOCK_REGRID_API_KEY = 'rg.mock-api-key';

  console.log(`[AerialFootprint] Querying property tax APIs for address: ${address}`);

  // Simulate network delay for API lookup
  await new Promise(resolve => setTimeout(resolve, 800));

  // Determine a realistic footprint size and age based on the company string for demo
  let sq_ft = 85000;
  let year_built = 1998;

  if (address.toLowerCase().includes('logistics') || address.toLowerCase().includes('distribution')) {
    sq_ft = Math.floor(Math.random() * 200000) + 150000;
    year_built = 2005;
  } else if (address.toLowerCase().includes('office')) {
    sq_ft = Math.floor(Math.random() * 50000) + 30000;
    year_built = 1985;
  }

  const currentYear = new Date().getFullYear();
  const age = currentYear - year_built;

  return {
    address,
    exact_square_footage: sq_ft,
    year_built: year_built,
    building_age_years: age,
    parcel_boundary_wkt: "POLYGON((-84.512 39.103, -84.511 39.103, -84.511 39.104, -84.512 39.104, -84.512 39.103))",
    ownership: "Institutional Holdings LLC"
  };
}
