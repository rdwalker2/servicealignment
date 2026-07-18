---
name: enrich-with-moltsets
description: Automates the enrichment of commercial properties using the MoltSets API. Triggers when asked to enrich targets, fetch property managers/owners, or run MoltSets.
---

# MoltSets Enrichment Skill

This skill provides a dedicated script and workflow for enriching property owners and facility directors via the MoltSets API.

## Workflow

1. Execute this skill by running the background script: `node .agents/skills/enrich-with-moltsets/scripts/bulk_enrich.cjs`
2. The script will:
   - Poll the `accounts` table for target properties.
   - For each property, hit the MoltSets `search_people` API to find their Property Manager, Facility Director, or Owner.
   - Hit MoltSets `linkedin-to-best-email` to resolve their contact info.
   - Inject the enriched decision-maker into the `clay_signals` table for proactive outreach.

## Running the Script

Use the `run_command` tool to execute:
```bash
node .agents/skills/enrich-with-moltsets/scripts/bulk_enrich.cjs
```
The script will process the queue and output progress to the console.
