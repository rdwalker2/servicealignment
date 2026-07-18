---
name: ingest-portfolio
description: Automates property data ingestion and enrichment (square footage, coordinates, NOAA weather alerts, permits) into the database. Triggers when asked to ingest a portfolio, load properties, or fix pending/missing property data.
---

# Ingest Portfolio Skill

This skill provides instructions for populating and enriching the `roof_properties` database with real, live data.

## Workflow

1. The data pipeline is driven by various TypeScript ingestion scripts located in the `scripts/` directory.
2. When properties are missing metadata (like `square_footage` or `coordinates`), the frontend UI will display "Pending Data".
3. To resolve this, determine the correct ingestion script to run for the prospect:
   - For Cushman & Wakefield: `scripts/ingest-cushman.ts`
   - For JLL prototype: `scripts/seed-jll-prototype.ts`
   - General ingestion workflows: `scripts/master-real-ingestion.ts` or `scripts/enrich-properties.ts`
4. Use the `run_command` tool to execute the chosen script via `npx tsx`:
   ```bash
   npx tsx scripts/<script_name>.ts
   ```
5. Wait for the background task to complete. Once finished, inform the user that the database has been successfully populated and the UI should now reflect the real data.
