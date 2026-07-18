---
name: generate-roi-projections
description: Generates a multi-year ROI model and Good/Better/Best pricing based on the Roof Wars Playbook methodology. Triggers when asked to calculate ROI, build a business case, or generate a proposal for a roof.
---

# Generate ROI Projections Skill

This skill calculates the "Cost of Inaction" and "Good/Better/Best" pricing for a commercial roof based on the Roof Wars Handbook (4D Sales Methodology).

## Methodology

The financial model relies on the following logic:
- **Cost of Inaction:** Calculates immediate CapEx liability, disruption costs, and maintenance spikes. Assumes 40% accelerated decay over 10 years if unmitigated.
- **Good (Reactive/Band-Aid):** $0.45/sqft. Mitigates immediate leak risk, no warranty extension.
- **Better (Restoration):** $7.20/sqft. Preserves asset, extends warranty by 10-15 years.
- **Best (Replacement):** $15.00/sqft. Resets lifecycle to Year 0.

## Workflow

1. The data pipeline is driven by the `scripts/generate-roi-model.ts` script.
2. Ensure the property exists in the `roof_properties` table and has a valid `square_footage`. If it does not, you must run an ingestion script first (via the `ingest-portfolio` skill).
3. Use the `run_command` tool to execute the ROI generator via `npx tsx`:
   ```bash
   # Generate for a specific property (e.g., C&W Regional Hub)
   npx tsx scripts/generate-roi-model.ts "property_name"

   # Or run for the entire database
   npx tsx scripts/generate-roi-model.ts
   ```
4. The script will automatically compute the ROI multipliers and inject a fully populated `DiscoverySession` record into the database.
5. The prospect's personalized "Business Case" landing page (`/prospector/:token`) will instantly reflect the new financial data.
