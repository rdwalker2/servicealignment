import { resolvePropertyTaxes } from './providers/batchdata';
import { resolveParentCompany } from './providers/zoominfo';
import { findDecisionMakers } from './providers/apollo';

export interface EnrichmentResult {
  property: {
    address: string;
    parcel_id: string;
    building_sqft: number;
    year_built: number;
  };
  managementCompany: {
    name: string;
    domain: string;
    industry: string;
  };
  decisionMaker: {
    first_name: string;
    last_name: string;
    title: string;
    email: string;
    mobile_phone: string;
  };
}

export class EnrichmentOrchestrator {
  
  /**
   * Run the full waterfall pipeline to map an address to a human contact.
   * This completely replaces the need for third-party orchestrators like Clay.
   * 
   * @param rawAddress - The physical address of the property (e.g. from a weather polygon intersection)
   */
  static async runPipeline(rawAddress: string): Promise<EnrichmentResult | null> {
    console.log(`\n🚀 [Orchestrator] Starting Waterfall for: ${rawAddress}`);

    // STEP 1: Ownership Resolution (Pierce the LLC)
    // We hit the tax assessor data to find out who *actually* gets the mail for this property.
    console.log(`[Step 1] Attempting to pierce LLC veil...`);
    const propertyData = await resolvePropertyTaxes(rawAddress);
    if (!propertyData) {
      console.log(`❌ [Orchestrator] Failed Step 1: Could not locate parcel data.`);
      return null;
    }
    console.log(`  └─ Found Owner: ${propertyData.owner_name}`);
    console.log(`  └─ Mailing Address: ${propertyData.mailing_address}`);

    // STEP 2: Entity Resolution (Find the Parent Company)
    // We use the mailing address to query corporate registries to find the actual REIT or Property Manager.
    console.log(`\n[Step 2] Resolving Parent Management Company...`);
    const companyData = await resolveParentCompany(propertyData.mailing_address, propertyData.owner_name);
    if (!companyData) {
      console.log(`❌ [Orchestrator] Failed Step 2: Could not resolve parent entity.`);
      return null;
    }
    console.log(`  └─ Found Parent: ${companyData.company_name} (${companyData.domain})`);

    // STEP 3: Identity Resolution (Find the Decision Maker)
    // Now that we have the parent domain, we query for Facility Managers.
    console.log(`\n[Step 3] Querying Decision Makers at ${companyData.company_name}...`);
    const contacts = await findDecisionMakers(companyData.domain, ['Facility Manager', 'Director of Real Estate', 'Property Manager']);
    if (!contacts || contacts.length === 0) {
      console.log(`❌ [Orchestrator] Failed Step 3: No contacts found at ${companyData.domain}.`);
      return null;
    }

    const decisionMaker = contacts[0]; // Take the first best match
    console.log(`  └─ Found Contact: ${decisionMaker.first_name} ${decisionMaker.last_name} (${decisionMaker.title})`);
    console.log(`  └─ Mobile: ${decisionMaker.mobile_phone}`);

    console.log(`\n✅ [Orchestrator] Pipeline Complete for ${rawAddress}`);
    
    // Return the normalized relational payload ready for Database insertion
    return {
      property: {
        address: propertyData.address,
        parcel_id: propertyData.parcel_id,
        building_sqft: propertyData.building_sqft,
        year_built: propertyData.year_built
      },
      managementCompany: {
        name: companyData.company_name,
        domain: companyData.domain,
        industry: companyData.industry
      },
      decisionMaker: {
        first_name: decisionMaker.first_name,
        last_name: decisionMaker.last_name,
        title: decisionMaker.title,
        email: decisionMaker.email,
        mobile_phone: decisionMaker.mobile_phone
      }
    };
  }
}
