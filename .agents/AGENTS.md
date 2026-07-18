# Global Rules for Service Alignment (Predictive Marketing Platform)

## 1. Core Platform Identity
- **Vision:** This platform is a "Predictive Marketing" engine (Infusionsoft 100.0) that monitors commercial roofs 24/7.
- **Goal:** Proactive, high-conversion outreach that beats traditional lead gen. We ONLY reach out to roofs that might need us.

## 2. Architecture & Data Sources
- **Predictive Signals:** The system relies heavily on external data ingestion (NOAA weather alerts, Google Maps/Lightbox satellite imagery, local permit data).
- **Roof Health Score:** The central metric for the platform. All deals and properties must be evaluated based on their calculated Roof Health Score. 
- **Data Truth:** Never rely on mock UI data (e.g., `seedData.ts`) as source-of-truth for real opportunities. Real deals must be verified against the live database or explicitly provided pipeline files.

## 3. UI & Experience Guidelines
- **Prospect Experience:** Landing pages and Business Cases must lead with value (Roof Health Score, Proof of damage, Recommended Next Steps) to trigger the "Your roof just pinged us" personalized experience.
- **Sales Process:** Adhere strictly to the 4D methodology (Discovery, Diagnosis, Demo, Decision) when building internal CRM and Pipeline views for the sales reps.
