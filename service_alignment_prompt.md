# Service Alignment - Project Initialization Prompt

Copy and paste the following prompt into your new Antigravity project to kickstart development. 

***

**Prompt for Gemini 3.1 Pro (High):**

I want to build a new web application called **Service Alignment (Predictive Marketing / Roof Health Monitor)**. This is a predictive marketing platform that monitors commercial roofs 24/7 using signals like weather, satellite imagery (Google Maps/Lightbox), and permits. When it detects an issue or opportunity, it triggers a personalized "Your roof just pinged us" outreach. 

The goal is to replace "spray and pray" lead generation with highly targeted, proactive, high-conversion outreach to prospects (like JLL Portfolio) by immediately showing them a custom Roof Health Score, proof of the issue, and recommended next steps.

**Tech Stack (Important: Use the same infrastructure we used for Teamtailor)**:
- **Frontend**: React, Vite, Tailwind CSS (Vanilla CSS where needed for high-end styling)
- **Backend/DB**: Supabase (We are starting fresh with a new Supabase project for this)
- **Deployment**: Vercel or Netlify

**Design Aesthetics (Critical)**:
- We need this to look incredibly premium, high-end, and modern. It needs to "wow" users at first glance.
- Implement a sleek design system with a tailored color palette. For the JLL example, we used JLL Red (`#E1251B`), Deep Red (`#B81A10`), Gold (`#C8932E`), and Ink (`#0F0F0F`).
- Use modern typography (e.g., Archivo or Inter).
- Add micro-animations, glassmorphism (`backdrop-filter: blur`), and hover effects so the interface feels dynamic and alive.

**Phase 1 Execution Plan**:
1. **Initialize the App**: Spin up a new Vite React app with Tailwind CSS.
2. **Supabase Setup**: Provide me with the SQL scripts needed to set up the initial tables in my new Supabase project (e.g., `prospects`, `roof_signals`, `outreach_campaigns`).
3. **Build the Landing Page (The "Money Making Machine")**:
   - Create a sample dynamic landing page tailored for a prospect (e.g., "JLL Portfolio · Roof Health Monitor").
   - Include a sticky, blurred header with a strong CTA (e.g., "Review Roof Report").
   - Build a hero section that displays the prospect's "Custom Roof Health Score" using color-coded metrics (Red, Orange, Yellow, Green).
   - Show "proof" data points (weather events, satellite pings, permit age).
   - Add recommended next steps to drive immediate conversion.
4. **Build the Internal Dashboard**:
   - A view for our sales team to see all monitored roofs, recent "pings" or alerts (e.g., "Hail storm hit 75201"), and the status of outbound personalized messages.

Please start by outlining your approach, then run the necessary commands to initialize the Vite app, and provide the initial SQL for the new Supabase database. Do not use generic mock data in the long term; ensure everything hooks up to Supabase.
