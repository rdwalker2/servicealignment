import { useState } from 'react';

const GRADIENT_1 = '#1a1a2e';
const GRADIENT_2 = '#16213e';
const ACCENT = '#6366f1';
const ACCENT_LIGHT = '#818cf8';
const GREEN = '#10b981';
const AMBER = '#f59e0b';

const sectionStyle: React.CSSProperties = {
  maxWidth: 1100,
  margin: '0 auto',
  padding: '64px 32px',
};

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: 12,
  padding: 28,
  border: '1px solid rgba(0,0,0,0.06)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.65rem',
  fontWeight: 700,
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  color: ACCENT,
  marginBottom: 8,
};

const h2Style: React.CSSProperties = {
  fontSize: '1.8rem',
  fontWeight: 800,
  color: '#1a1a2e',
  marginBottom: 8,
  letterSpacing: '-0.02em',
};

const bodyStyle: React.CSSProperties = {
  fontSize: '0.92rem',
  lineHeight: 1.7,
  color: '#4b5563',
};

export default function GTMInfraWalkthrough() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", background: '#fafaf9', minHeight: '100vh' }}>

      {/* ════ HERO ════ */}
      <header style={{
        background: `linear-gradient(135deg, ${GRADIENT_1}, ${GRADIENT_2})`,
        padding: '80px 32px 64px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.15), transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: ACCENT_LIGHT, marginBottom: 16 }}>
            Teamtailor GTM Workspace
          </div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1 }}>
            GTM Data Infrastructure
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.6)', marginTop: 12, maxWidth: 600, lineHeight: 1.5 }}>
            How the audience engine, Clay enrichment, and ad targeting can connect — and what we need to align on.
          </p>

          <div style={{ display: 'flex', gap: 32, marginTop: 48, flexWrap: 'wrap' }}>
            {[
              { value: '2,722', label: 'Rippling Accounts', sub: 'Verified ATS users' },
              { value: '291', label: 'Greenhouse Accounts', sub: 'Verified & active' },
              { value: '10,301', label: 'School Districts', sub: 'K-12 public + charter' },
              { value: '✓', label: 'Customer Suppression', sub: 'Flagged at build · SFDC sync pending setup' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 28px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', minWidth: 180 }}>
                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{s.value}</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{s.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ════ SECTION 01: THE FLYWHEEL ════ */}
      <section style={{ ...sectionStyle }}>
        <div style={labelStyle}>01 — The Flywheel</div>
        <h2 style={h2Style}>How It All Connects</h2>
        <p style={{ ...bodyStyle, maxWidth: 640, marginBottom: 40 }}>
          Five systems feeding each other. Audiences go in, enriched contacts come out, ads warm them up, reps close them.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
          {[
            { num: '1', icon: '🔍', title: 'Audience Discovery', desc: 'Google dorking via Apify, TheirStack API, Clearbit domain resolution. Accounts land in Supabase with ATS, employee count, industry, location.', who: 'AI-Assisted', color: ACCENT },
            { num: '2', icon: '🧪', title: 'Clay Enrichment', desc: 'Clay pulls accounts directly from Supabase via HTTP source (or CSV export). Clay finds VP/Director contacts, emails, titles, phone numbers. Enriched data pushes back via webhook automatically.', who: 'Rev Ops', color: '#8b5cf6' },
            { num: '3', icon: '📡', title: 'Ad Targeting', desc: 'Supabase data feeds ad audiences. We\'ve designed the spec for a Pectus inbound connector that reads accounts + signals and segments them — need to align on the segmentation logic with marketing.', who: 'Marketing', color: '#ec4899' },
            { num: '4', icon: '📞', title: 'Reps Prospect', desc: 'Signal Board shows enriched contacts with intent scores. Clay auto-creates the Account + Contact in Salesforce with correct ownership. Reps push to Salesloft — activities sync back to SFDC seamlessly.', who: 'Sales', color: GREEN },
            { num: '5', icon: '🔄', title: 'Website Visitor Loop', desc: 'Website visitors identified by RB2B → webhook → Supabase → Signal Board. Reps see who visited. Marketing retargets with ads.', who: 'Automated', color: AMBER },
          ].map((step, i) => (
            <div key={step.num} style={{ display: 'flex', gap: 24, alignItems: 'flex-start', position: 'relative' }}>
              {/* Connector line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 48 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'white', fontWeight: 800, flexShrink: 0 }}>
                  {step.icon}
                </div>
                {i < 4 && <div style={{ width: 2, height: 48, background: `linear-gradient(to bottom, ${step.color}, rgba(0,0,0,0.06))` }} />}
              </div>
              <div style={{ ...cardStyle, flex: 1, marginBottom: i < 4 ? 0 : 0, padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{step.title}</h3>
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, color: step.color, background: `${step.color}12`, padding: '3px 10px', borderRadius: 99 }}>{step.who}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════ SECTION 02: SUPABASE ════ */}
      <section style={{ background: '#f5f3f0', padding: '64px 0' }}>
        <div style={sectionStyle}>
          <div style={labelStyle}>02 — Data Layer</div>
          <h2 style={h2Style}>How Supabase is Structured</h2>
          <p style={{ ...bodyStyle, maxWidth: 720, marginBottom: 12 }}>
            Everything lives in <strong>one Supabase database</strong>. There are no separate databases per audience — it's one unified set of tables. Audiences are separated by a column called <code style={{ background: '#e5e7eb', padding: '1px 6px', borderRadius: 3, fontSize: '0.82rem' }}>audience_source</code>, not by separate tables. This matters for Daniel (Clay) and Jesper (Ads) because they can query across all audiences with one API call or filter to a specific one.
          </p>

          {/* Architecture diagram */}
          <div style={{ ...cardStyle, marginBottom: 24, padding: 0, overflow: 'hidden' }}>
            <div style={{ background: '#f9fafb', padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Table Architecture</h3>
              <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: '4px 0 0' }}>One database, four core tables, linked by domain</p>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: 12, alignItems: 'center', marginBottom: 20 }}>
                <div style={{ background: `${ACCENT}08`, borderRadius: 8, padding: 16, border: `1px solid ${ACCENT}20`, textAlign: 'center' }}>
                  <code style={{ fontSize: '0.85rem', fontWeight: 700, color: ACCENT }}>accounts</code>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1a1a2e', marginTop: 4 }}>14,096</div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>All audiences in one table</div>
                  <div style={{ fontSize: '0.68rem', color: '#6b7280', marginTop: 4 }}>PK: domain</div>
                </div>
                <div style={{ fontSize: '1.2rem', color: '#d1d5db' }}>↔</div>
                <div style={{ background: '#8b5cf608', borderRadius: 8, padding: 16, border: '1px solid #8b5cf620', textAlign: 'center' }}>
                  <code style={{ fontSize: '0.85rem', fontWeight: 700, color: '#8b5cf6' }}>clay_signals</code>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1a1a2e', marginTop: 4 }}>867</div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Intent events + web visits</div>
                  <div style={{ fontSize: '0.68rem', color: '#6b7280', marginTop: 4 }}>FK: company_domain</div>
                </div>
                <div style={{ fontSize: '1.2rem', color: '#d1d5db' }}>↔</div>
                <div style={{ background: '#ec489908', borderRadius: 8, padding: 16, border: '1px solid #ec489920', textAlign: 'center' }}>
                  <code style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ec4899' }}>contacts</code>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1a1a2e', marginTop: 4 }}>4,764</div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>People at those companies</div>
                  <div style={{ fontSize: '0.68rem', color: '#6b7280', marginTop: 4 }}>FK: domain</div>
                </div>
              </div>

              {/* How audiences are separated */}
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: 8 }}>How audiences are separated</div>
                <div style={{ fontSize: '0.82rem', color: '#4b5563', lineHeight: 1.7 }}>
                  Every account row has an <code style={{ background: '#e5e7eb', padding: '1px 4px', borderRadius: 3, fontSize: '0.78rem' }}>audience_source</code> column. To get Rippling accounts, you filter <code style={{ background: '#e5e7eb', padding: '1px 4px', borderRadius: 3, fontSize: '0.78rem' }}>?audience_source=eq.rippling</code>. To get K-12, filter <code style={{ background: '#e5e7eb', padding: '1px 4px', borderRadius: 3, fontSize: '0.78rem' }}>?audience_source=eq.k12</code>. To get everything, don't filter. <strong>Same table, same columns, same API.</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Audience breakdown in the accounts table */}
          <div style={{ ...cardStyle, marginBottom: 24 }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 12px' }}>What's in the <code style={{ color: ACCENT }}>accounts</code> table</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { source: 'K-12 Districts', key: 'k12', count: '10,301', color: AMBER },
                { source: 'Rippling ATS', key: 'rippling', count: '2,722', color: ACCENT },
                { source: 'Greenhouse ATS', key: 'greenhouse', count: '291', color: GREEN },
                { source: 'Dayforce + HiBob', key: 'other', count: '228', color: '#8b5cf6' },
              ].map(a => (
                <div key={a.key} style={{ background: `${a.color}08`, borderRadius: 8, padding: 14, border: `1px solid ${a.color}20`, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: a.color }}>{a.count}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>{a.source}</div>
                  <div style={{ fontSize: '0.68rem', color: '#9ca3af', fontFamily: 'monospace' }}>{a.key}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 10, fontStyle: 'italic' }}>
              + 554 unenriched/inbound + 228 Dayforce/HiBob. Total: 14,096 rows. US-only — all international and CRM-import records have been removed.
            </div>
          </div>

          {/* Data quality matrix */}
          <div style={{ ...cardStyle, overflow: 'hidden', padding: 0 }}>
            <div style={{ background: '#f9fafb', padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>SFDC Field Coverage by Audience</h4>
              <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: '2px 0 0' }}>Shows which fields are populated per audience — important for ad targeting and Clay enrichment priorities</p>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Field', 'SFDC API Name', 'Rippling', 'Greenhouse', 'K-12', 'Why It Matters'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e5e7eb', fontSize: '0.72rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { field: 'Company Name', api: 'Name', rip: 100, gh: 100, k12: 100, why: 'Required for everything' },
                  { field: 'Domain', api: 'Email_Domain_Name__c', rip: 100, gh: 100, k12: 100, why: 'Primary key, links all tables' },
                  { field: 'Current ATS', api: 'Current_ATS_Provider__c', rip: 100, gh: 100, k12: 98, why: 'Core targeting field for ads' },
                  { field: 'Is Customer', api: 'Lifecycle_Stage__c', rip: 100, gh: 100, k12: 100, why: 'Suppression for ads + outreach' },
                  { field: 'Employee Count', api: 'Amount_of_Employees__c', rip: 90, gh: 66, k12: 99, why: 'Webhook converts integer to SFDC picklist range (e.g. 350 → "251-500")' },
                  { field: 'State', api: 'BillingState', rip: 89, gh: 31, k12: 10, why: 'Territory routing, geo targeting' },
                  { field: 'LinkedIn URL', api: 'LinkedIn_Company_URL__c', rip: 86, gh: 87, k12: 10, why: 'LinkedIn Matched Audiences' },
                  { field: 'Country', api: 'BillingCountry', rip: 86, gh: 11, k12: 10, why: 'Market segmentation' },
                  { field: 'Industry', api: 'Industry', rip: 85, gh: 57, k12: 10, why: 'Vertical segmentation' },
                  { field: 'City', api: 'BillingCity', rip: 84, gh: 32, k12: 10, why: 'Geo targeting for ads' },
                  { field: 'HR Provider', api: 'Current_HR_Provider__c', rip: 100, gh: 4, k12: 10, why: 'Competitor displacement angle' },
                  { field: 'Lifecycle Stage', api: 'Lifecycle_Stage__c', rip: 0, gh: 0, k12: 0, why: '⚠️ Needs SFDC sync to populate' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1a1a2e' }}>{r.field}</td>
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: '0.68rem', color: '#6b7280' }}>{r.api}</td>
                    {[r.rip, r.gh, r.k12].map((pct, j) => (
                      <td key={j} style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: pct >= 80 ? GREEN : pct >= 50 ? AMBER : pct > 0 ? '#ef4444' : '#d1d5db' }}>
                          {pct}%
                        </span>
                      </td>
                    ))}
                    <td style={{ padding: '8px 12px', color: '#6b7280', fontSize: '0.72rem' }}>{r.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ padding: '12px 20px', background: '#fffbeb', borderTop: '1px solid #fde68a' }}>
              <div style={{ fontSize: '0.78rem', color: '#92400e', lineHeight: 1.5 }}>
                <strong>Enrichment gaps.</strong> K-12 has State/City/Industry at only ~10% — top Clay enrichment priority. Greenhouse is also light on geo data (City 32%, Country 11%). Rippling is the strongest at 86-90% across the board. Lifecycle Stage is 0% everywhere — populates once Daniel's daily Clay sync from SFDC is running.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ SECTION 03: DANIEL / CLAY ════ */}
      <section style={sectionStyle}>
        <div style={labelStyle}>03 — Rev Ops</div>
        <h2 style={h2Style}>Clay Enrichment Pipeline</h2>
        <p style={{ ...bodyStyle, maxWidth: 640, marginBottom: 32 }}>
          Three steps: export an audience, enrich it in Clay, push it back. The webhook is live.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginBottom: 32 }}>
          {[
            { num: '1', title: 'Connect Clay to Supabase', desc: 'Clay can pull accounts directly via HTTP source — no CSV export needed. Use Supabase PostgREST endpoint with filters like audience_source=rippling&last_enriched_at=is.null to only pull un-enriched accounts.' },
            { num: '2', title: 'Enrich in Clay', desc: 'Enrichment config is ready: Company Lookup (HQ, employees, industry, revenue), VP/Director TA finding, CHRO/VP People finding, ATS detection. ~6 credits per account.' },
            { num: '3', title: 'Push Back', desc: 'Clay webhook is LIVE. Enriched data auto-upserts into both accounts (company-level) and clay_signals (contact-level). Deduplicates by email + domain.' },
          ].map(s => (
            <div key={s.num} style={cardStyle}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${ACCENT}15`, color: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', marginBottom: 12 }}>{s.num}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 6px' }}>{s.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Webhook card */}
        <div style={{ background: GRADIENT_1, borderRadius: 12, padding: 28, color: 'white' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: ACCENT_LIGHT, marginBottom: 12 }}>Webhook Details</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 2 }}>
            <div><span style={{ color: '#9ca3af' }}>Endpoint:</span> <span style={{ color: GREEN }}>POST /api/webhook/clay</span></div>
            <div><span style={{ color: '#9ca3af' }}>Format:</span> JSON — single record or array of records</div>
            <div><span style={{ color: '#9ca3af' }}>Auth:</span> None required (internal network)</div>
            <div><span style={{ color: '#9ca3af' }}>Fields:</span> Auto-normalized — <span style={{ color: AMBER }}>employee_count</span>, <span style={{ color: AMBER }}>employees</span>, <span style={{ color: AMBER }}>headcount</span> all map correctly</div>
            <div><span style={{ color: '#9ca3af' }}>Behavior:</span> Upserts into <span style={{ color: ACCENT_LIGHT }}>accounts</span> + <span style={{ color: ACCENT_LIGHT }}>clay_signals</span>, bumps signal scores on duplicates</div>
          </div>
        </div>
      </section>

      {/* ════ SECTION 04: JESPER / ADS ════ */}
      <section style={{ background: '#f5f3f0', padding: '64px 0' }}>
        <div style={sectionStyle}>
          <div style={labelStyle}>04 — Pectus Integration</div>
          <h2 style={h2Style}>Ad Audience Segmentation</h2>
          <p style={{ ...bodyStyle, maxWidth: 640, marginBottom: 16 }}>
            We've designed the spec for a Pectus inbound connector (<code style={{ fontSize: '0.82rem', background: '#f3f4f6', padding: '1px 6px', borderRadius: 3 }}>tt-signals</code>) that would read from Supabase and output account-level records with proposed ad actions. Here's the segmentation mapping we'd start with — does this work, or should it map differently?
          </p>

          {/* Resolved mapping note */}
          <div style={{ background: '#ecfdf5', borderRadius: 8, padding: 16, marginBottom: 24, borderLeft: `3px solid ${GREEN}` }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#065f46' }}>✅ SFDC Stages Mapped</div>
            <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: 4, lineHeight: 1.5 }}>
              Salesforce uses <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 4px', borderRadius: 3, fontSize: '0.75rem' }}>Lifecycle_Stage__c</code> with 3 values: <strong>Prospect</strong>, <strong>Customer</strong>, <strong>Churned</strong>. Our internal dispositions (working, engaged, meeting_set, etc.) provide granularity <em>within</em> the Prospect stage. Here's how they map to ad actions:
            </div>
          </div>

          {/* Ad action table */}
          <div style={{ ...cardStyle, marginBottom: 24, overflow: 'hidden', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>SFDC Lifecycle Stage</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Internal Disposition</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Ad Action</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Rationale</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { sfdc: 'Prospect', disposition: 'new, working', action: 'Prospecting', desc: 'Cold — ads reinforce outreach, build familiarity', color: ACCENT },
                  { sfdc: 'Prospect', disposition: 'engaged, meeting_set', action: 'Remarketing', desc: 'Warm — brand reinforcement during active deal cycle', color: '#8b5cf6' },
                  { sfdc: 'Prospect', disposition: 'nurture, not_now', action: 'Remarketing', desc: 'Long-term — stay top-of-mind until timing is right', color: AMBER },
                  { sfdc: 'Customer', disposition: '—', action: 'Suppress', desc: 'Already a customer — exclude from prospecting spend', color: GREEN },
                  { sfdc: 'Churned', disposition: 'disqualified', action: 'Suppress', desc: 'Exclude from all ad spend — don\'t waste budget', color: '#ef4444' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 20px', fontWeight: 600, color: '#1a1a2e', fontSize: '0.82rem' }}>{r.sfdc}</td>
                    <td style={{ padding: '12px 20px', fontFamily: 'monospace', fontSize: '0.78rem', color: '#6b7280' }}>{r.disposition}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: r.color, background: `${r.color}12`, padding: '3px 10px', borderRadius: 99 }}>{r.action}</span>
                    </td>
                    <td style={{ padding: '12px 20px', color: '#6b7280', fontSize: '0.82rem' }}>{r.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Output schema */}
          <div style={{ ...cardStyle, marginBottom: 24 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 12px' }}>Output Record (per account)</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['company_name', 'industry', 'employee_tier', 'employee_count', 'incumbent_ats', 'intent_tier', 'isp_score', 'event_score', 'primary_pain', 'pain_points', 'audience_source', 'ad_action', 'geo_state', 'geo_city', 'contact_emails', 'contacts[]'].map(f => (
                <code key={f} style={{ fontSize: '0.72rem', background: '#f3f4f6', padding: '3px 8px', borderRadius: 4, color: '#6b7280' }}>{f}</code>
              ))}
            </div>
          </div>

          {/* Access options */}
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', marginBottom: 16 }}>How to Access the Data</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {[
              { title: 'Direct Supabase API', desc: 'Query accounts and signals directly via PostgREST. Full filtering, pagination, real-time.', code: 'GET /rest/v1/accounts?audience_source=eq.rippling&select=*', badge: 'Ready' },
              { title: 'tt-signals Connector', desc: 'Pectus inbound app spec. Will fetch from Supabase, interpret into account-level records, and output ad actions. Ready to build once segmentation logic is aligned.', code: 'Will live in src/apps/inbound/tt-signals/', badge: 'Proposed' },
              { title: 'CSV Export', desc: 'Audience Builder UI exports CSVs. Can segment by ad_action for direct upload to ad platforms.', code: 'Audience Builder → Export', badge: 'Ready' },
            ].map(o => (
              <div key={o.title} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{o.title}</h4>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: GREEN, background: `${GREEN}12`, padding: '2px 8px', borderRadius: 99 }}>{o.badge}</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: '0 0 10px', lineHeight: 1.5 }}>{o.desc}</p>
                <code style={{ fontSize: '0.72rem', background: '#f3f4f6', padding: '4px 8px', borderRadius: 4, color: ACCENT, display: 'block' }}>{o.code}</code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ SECTION 05: LIVE EXAMPLE ════ */}
      <section style={{ background: '#f5f3f0', padding: '64px 0' }}>
        <div style={sectionStyle}>
          <div style={labelStyle}>05 — Live Example</div>
          <h2 style={h2Style}>What Happens When Someone Visits Our Pricing Page?</h2>
          <p style={{ ...bodyStyle, maxWidth: 720, marginBottom: 12 }}>
            Walk-through of a real scenario: a VP of Talent Acquisition from a B2B SaaS company visits teamtailor.com/pricing. The contact doesn't exist in Salesforce, and the account has no owner. Here's exactly what happens, step by step.
          </p>

          {/* The persona card */}
          <div style={{ ...cardStyle, marginBottom: 32, border: `2px solid ${ACCENT}`, background: `linear-gradient(135deg, #f8f7ff, white)` }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${ACCENT}, #8b5cf6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white', fontWeight: 800, flexShrink: 0 }}>SC</div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e' }}>Sarah Chen</div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>VP of Talent Acquisition · Acme Cloud · 340 employees · San Francisco</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, background: `${ACCENT}15`, color: ACCENT, padding: '2px 8px', borderRadius: 4 }}>Rippling ATS</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 4 }}>47 Open Roles</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: 4 }}>Not in SFDC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step-by-step flow */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              {
                num: '1',
                icon: '🌐',
                title: 'RB2B Identifies the Visitor',
                time: 'RB2B resolves (minutes)',
                detail: 'Sarah visits teamtailor.com/pricing. RB2B\'s JavaScript pixel matches her IP to her LinkedIn profile via reverse-IP resolution. RB2B fires a webhook to our server with her name, email, company, and the page she visited.',
                technical: 'POST /api/webhook/rb2b → flywheel.js receives payload with person.name, person.email, company.domain, company.employees',
                color: ACCENT,
              },
              {
                num: '2',
                icon: '🧪',
                title: 'Signal Scoring (No Signals Rejected)',
                time: '< 1 second',
                detail: 'The system scores the signal — it never hard-rejects. Acme Cloud has 340 employees (sweet spot, +15), Rippling ATS (direct competitor, +30), and Sarah visited the pricing page (+20). Total: 92/100, tier: "hot." A visitor from a 15,000-person company with no known ATS would still get through — they\'d just score lower (55, "monitor") instead of being blocked.',
                technical: 'flywheel.js scores: base 50 + ATS match + employee range + pricing page visit → score 92, icp_tier: "hot". Only ISP/freemail domains (gmail, yahoo) are dropped.',
                color: '#8b5cf6',
              },
              {
                num: '3',
                icon: '🔍',
                title: 'System Checks Salesforce for Ownership',
                time: '< 1 second',
                detail: 'The lead router asks: "Does acmecloud.io already exist in Salesforce with an account owner?" In this case, NO — the account isn\'t in SFDC. So it moves to the next check: "Has any rep been assigned this account before in our system?" Also NO — this is a net-new account.',
                technical: 'lead-router.js → Tier 1: accounts.sf_account_owner = null ✗ → Tier 2: accounts.assigned_rep_id = null ✗',
                color: '#ec4899',
              },
              {
                num: '4',
                icon: '🎯',
                title: 'Round-Robin Assignment',
                time: '< 1 second',
                detail: 'Since no one owns this account and it hasn\'t been assigned before, the router falls to round-robin: it looks at which rep was assigned last and gives this one to the next rep in rotation. If this account already had an owner in SFDC, the signal would go to that rep automatically.',
                technical: 'Step 1: sf_account_owner = null ✗ → Step 2: assigned_rep_id = null ✗ → Step 3: round-robin across all active reps. Writes to assignment_log with method="round_robin"',
                color: AMBER,
              },
              {
                num: '5',
                icon: '💾',
                title: 'Data Lands in Supabase',
                time: '< 2 seconds total',
                detail: 'Two things get written simultaneously: (1) A signal record in clay_signals with Sarah\'s name, title, email, the page she visited, her company details, and the intent score. (2) The accounts table gets updated — acmecloud.io now has assigned_rep_id set to whichever rep won the routing.',
                technical: 'INSERT → clay_signals (signal_score: 92, page_visited: "/pricing", signal_source: "rb2b"). UPDATE → accounts SET assigned_rep_id = "rep-rw"',
                color: GREEN,
              },
              {
                num: '6',
                icon: '🔄',
                title: 'Clay Creates SFDC Record',
                time: '< 3 seconds total',
                detail: 'Since RB2B data flows through Clay, our webhook response includes SFDC-ready payloads with exact Salesforce API field names. Clay takes the response — including the assigned rep\'s SFDC User ID as OwnerId — and auto-creates the Account + Contact in Salesforce. LeadSource is set to "Outbound", MailingCountry is populated, employee count is converted to the SFDC picklist range. By the time the rep sees the signal, the SFDC record already exists.',
                technical: 'Webhook response includes sfdc_account { Name, Email_Domain_Name__c, OwnerId: "005Vg...", LeadSource: "Outbound", Amount_of_Employees__c: "251-500", AccountSource: "Clay" } → Clay creates in SFDC',
                color: '#ec4899',
              },
              {
                num: '7',
                icon: '📋',
                title: 'Rep Sees It on Their Signal Board',
                time: 'Real-time',
                detail: 'The assigned rep opens the Signal Board and sees Acme Cloud at the top (sorted by score). They see: Sarah Chen, VP of TA, visited /pricing, score 92, Rippling ATS, 47 open roles, 340 employees. They click to see the AI research brief, pain points, and recommended talk track — then push her directly to a Salesloft cadence. Since the SFDC record already exists, Salesloft syncs activities back automatically.',
                technical: 'SignalBoard.tsx → fetchSignals() → clay_signals → grouped by company_domain → sorted by score DESC → rep sees account row with contact, signals, web activity, and action buttons. Push to Salesloft → activities sync to SFDC ✅ (record already exists)',
                color: '#6366f1',
              },
            ].map((step, i) => (
              <div key={step.num} style={{ display: 'flex', gap: 20, position: 'relative' }}>
                {/* Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 48 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: step.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', flexShrink: 0, zIndex: 1 }}>{step.icon}</div>
                  {i < 6 && <div style={{ width: 2, flex: 1, background: '#e5e7eb', minHeight: 20 }} />}
                </div>
                {/* Content */}
                <div style={{ ...cardStyle, flex: 1, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: step.color, textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>Step {step.num}</span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', margin: '2px 0 0' }}>{step.title}</h4>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#9ca3af', background: '#f3f4f6', padding: '2px 10px', borderRadius: 4, whiteSpace: 'nowrap' as const }}>{step.time}</span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#4b5563', margin: '8px 0 0', lineHeight: 1.65 }}>{step.detail}</p>
                  <div style={{ marginTop: 10, padding: '8px 12px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    <code style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.5, wordBreak: 'break-all' as const }}>{step.technical}</code>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Result callout */}
          <div style={{ background: `linear-gradient(135deg, ${ACCENT}08, ${GREEN}08)`, borderRadius: 12, padding: 24, border: `1px solid ${GREEN}30`, marginTop: 16 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#065f46', marginBottom: 8 }}>⚡ Total time from page visit → rep sees signal: minutes, not days</div>
            <div style={{ fontSize: '0.82rem', color: '#047857', lineHeight: 1.6 }}>
              RB2B identifies the visitor and fires to Clay within minutes. Our webhook scores, routes, and writes to Supabase instantly. The Signal Board is live — it auto-updates in real-time via Supabase Realtime, no refresh needed. The rep doesn't do any manual data entry, no lead assignment meeting, no waiting for marketing to pass it over. The system identified her, scored her, routed her, and surfaced her automatically.
            </div>
          </div>

          {/* What it looks like */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', marginBottom: 16 }}>What the Rep Sees in Their Signal Board</h3>
            <div style={{ ...cardStyle, overflow: 'hidden', padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['', 'Contact', 'Organization', 'Score', 'Signals', 'Web Activity', 'ATS', 'Stage'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e5e7eb', fontSize: '0.78rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: '#fefce8', borderBottom: '1px solid #fde68a' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 600, color: '#1a1a2e' }}>Sarah Chen</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>VP of Talent Acquisition</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 600, color: '#1a1a2e' }}>Acme Cloud</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>340 emp · San Francisco</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ef4444' }}>92</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: '0.78rem', color: '#374151', fontWeight: 500 }}>🔴 Pricing page visit · Rippling ATS user</div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>47 open roles · hiring velocity ↑</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: '0.78rem', color: '#374151' }}>/pricing</div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>3 pages · 3m 12s</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 4 }}>Rippling</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, background: `${GREEN}15`, color: GREEN, padding: '3px 10px', borderRadius: 99 }}>new</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 8, fontStyle: 'italic' }}>
              This is a real signal seeded into our live Signal Board. You can see it right now at /signal-board.
            </p>
          </div>
        </div>
      </section>

      {/* ════ SECTION 06: AUDIENCES BUILT ════ */}
      <section style={sectionStyle}>
        <div style={labelStyle}>06 — What We've Built</div>
        <h2 style={h2Style}>Audiences in Production</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginTop: 24 }}>
          {/* Rippling */}
          <div style={{ ...cardStyle, borderTop: `3px solid ${ACCENT}` }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 16px' }}>Rippling Audience</h3>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: ACCENT, lineHeight: 1 }}>2,722</div>
            <div style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: 20 }}>verified US accounts</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Still on Rippling ATS', value: '85% (2,327)' },
                { label: 'Switched to competitors', value: '395' },
                { label: 'Actively hiring', value: '1,180' },
                { label: 'Open roles tracked', value: '14,600+' },
              ].map(s => (
                <div key={s.label} style={{ fontSize: '0.78rem' }}>
                  <div style={{ color: '#9ca3af' }}>{s.label}</div>
                  <div style={{ fontWeight: 700, color: '#374151' }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 8 }}>Data Sources</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { source: 'Google Dorking (Apify)', count: 1351 },
                { source: 'Common Crawl + Wayback', count: 789 },
                { source: 'Legacy Domain Recovery', count: 215 },
                { source: 'TheirStack API', count: 162 },
                { source: 'Validation Passes', count: 205 },
              ].map(s => (
                <div key={s.source} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: '#6b7280' }}>{s.source}</span>
                  <span style={{ fontWeight: 600, color: '#374151' }}>{s.count.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 8 }}>Field Coverage</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[
                { field: 'Employee Range', pct: 90 },
                { field: 'State', pct: 90 },
                { field: 'LinkedIn', pct: 87 },
                { field: 'Industry', pct: 86 },
              ].map(f => (
                <span key={f.field} style={{ fontSize: '0.72rem', background: '#f3f4f6', padding: '3px 8px', borderRadius: 4, color: '#6b7280' }}>
                  {f.field} {f.pct}%
                </span>
              ))}
            </div>
          </div>

          {/* Greenhouse */}
          <div style={{ ...cardStyle, borderTop: `3px solid ${GREEN}` }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 16px' }}>Greenhouse Audience</h3>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: GREEN, lineHeight: 1 }}>291</div>
            <div style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: 20 }}>verified US accounts</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Verified via JSON API', value: '369 boards' },
                { label: 'Domains resolved', value: '297' },
                { label: 'Discovery method', value: 'Apify dorking' },
                { label: 'Target segment', value: '200-500 emp' },
              ].map(s => (
                <div key={s.label} style={{ fontSize: '0.78rem' }}>
                  <div style={{ color: '#9ca3af' }}>{s.label}</div>
                  <div style={{ fontWeight: 700, color: '#374151' }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ background: '#ecfdf5', borderRadius: 8, padding: 16, marginTop: 12 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#065f46' }}>Built for Mid-Market AEs</div>
              <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: 4 }}>
                200 accounts (100 per AE), 200-500 employees, Greenhouse ATS. Enrichment in progress — employee counts, industry, location.
              </div>
            </div>

            <div style={{ marginTop: 16, fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 8 }}>Pipeline Used</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { step: '1. Apify Google Search', detail: '41 queries, alphabet + keyword matrix' },
                { step: '2. Greenhouse JSON API', detail: 'Free verification, job counts' },
                { step: '3. Clearbit Autocomplete', detail: 'Domain resolution (free)' },
                { step: '4. Supabase Upsert', detail: 'audience_source = greenhouse' },
              ].map(s => (
                <div key={s.step} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: '#374151', fontWeight: 500 }}>{s.step}</span>
                  <span style={{ color: '#9ca3af' }}>{s.detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* School Districts */}
          <div style={{ ...cardStyle, borderTop: '3px solid #f59e0b' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 16px' }}>School Districts</h3>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: AMBER, lineHeight: 1 }}>10,301</div>
            <div style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: 20 }}>K-12 public + charter districts</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Discovery method', value: 'NCES database + dorking' },
                { label: 'Domain resolution', value: 'Clearbit + manual' },
                { label: 'ATS coverage', value: 'Scan in progress' },
                { label: 'Target segment', value: 'Public districts 50+ emp' },
              ].map(s => (
                <div key={s.label} style={{ fontSize: '0.78rem' }}>
                  <div style={{ color: '#9ca3af' }}>{s.label}</div>
                  <div style={{ fontWeight: 700, color: '#374151' }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ background: '#fffbeb', borderRadius: 8, padding: 16, marginTop: 12 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#92400e' }}>New Vertical for Teamtailor</div>
              <div style={{ fontSize: '0.78rem', color: '#a16207', marginTop: 4 }}>
                K-12 districts are a largely untapped market for modern ATS. Same enrichment pipeline as Rippling/Greenhouse — ready for Clay enrichment and ad targeting.
              </div>
            </div>

            <div style={{ marginTop: 16, fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 8 }}>Pipeline Used</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { step: '1. NCES District Database', detail: 'Federal data, all US districts' },
                { step: '2. Google Dorking (Apify)', detail: 'Career page discovery' },
                { step: '3. Domain Resolution', detail: 'Clearbit + manual verification' },
                { step: '4. Supabase Upsert', detail: 'audience_source = k12' },
              ].map(s => (
                <div key={s.step} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: '#374151', fontWeight: 500 }}>{s.step}</span>
                  <span style={{ color: '#9ca3af' }}>{s.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════ SECTION 06: SAMPLE DATA ════ */}
      <section style={sectionStyle}>
        <div style={labelStyle}>07 — Sample Data</div>
        <h2 style={h2Style}>What the Records Look Like</h2>
        <p style={{ ...bodyStyle, maxWidth: 640, marginBottom: 32 }}>
          Real account records from Supabase. This is the shape of data available for Clay enrichment and ad audience building.
        </p>

        <div style={{ ...cardStyle, overflow: 'hidden', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Company', 'Domain', 'Employees', 'Industry', 'ATS', 'Location', 'Source'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Gotab', domain: 'gotab.io', emp: '53', ind: 'Hospitality', ats: 'Rippling', loc: 'Arlington, VA', src: 'rippling' },
                { name: 'Mindset', domain: 'mindset.care', emp: '149', ind: 'Healthcare', ats: 'Rippling', loc: 'New York, NY', src: 'rippling' },
                { name: 'Woodland JUSD', domain: 'wjusd.org', emp: '200', ind: 'Education', ats: 'Edjoin', loc: 'Woodland, CA', src: 'k12' },
                { name: 'CICS', domain: 'everychildeverytime.com', emp: '89', ind: 'Healthcare', ats: 'Paycom', loc: 'Allentown, PA', src: 'rippling' },
              ].map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1a1a2e' }}>{r.name}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: ACCENT, fontSize: '0.75rem' }}>{r.domain}</td>
                  <td style={{ padding: '10px 14px', color: '#6b7280' }}>{r.emp}</td>
                  <td style={{ padding: '10px 14px', color: '#6b7280' }}>{r.ind}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: r.ats === 'Rippling' ? '#ef4444' : r.ats === 'Paycom' ? AMBER : '#9ca3af', background: r.ats === 'Rippling' ? '#fef2f2' : r.ats === 'Paycom' ? '#fffbeb' : '#f3f4f6', padding: '2px 8px', borderRadius: 4 }}>{r.ats}</span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#6b7280', fontSize: '0.75rem' }}>{r.loc}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: r.src === 'rippling' ? ACCENT : GREEN, background: r.src === 'rippling' ? `${ACCENT}12` : `${GREEN}12`, padding: '2px 8px', borderRadius: 4 }}>{r.src}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 12, fontStyle: 'italic' }}>
          Showing 4 of 14,096 accounts. Additional fields available: linkedin_company_url, billing_country, current_hr_provider, employee_range, lifecycle_stage, and more.
        </p>
      </section>

      {/* ════ SECTION 07: CONNECTION DETAILS ════ */}
      <section style={{ background: '#f5f3f0', padding: '64px 0' }}>
        <div style={sectionStyle}>
          <div style={labelStyle}>08 — Connection Details</div>
          <h2 style={h2Style}>How to Connect</h2>
          <p style={{ ...bodyStyle, maxWidth: 640, marginBottom: 32 }}>
            Everything needed to start pulling data or pushing enrichments. Endpoints are deployed on Railway — they just need the other side to connect.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Clay Webhook */}
            <div style={{ background: GRADIENT_1, borderRadius: 12, padding: 28, color: 'white' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#8b5cf6', marginBottom: 12 }}>Daniel — Clay Integration</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: 2.2 }}>
                <div><span style={{ color: '#9ca3af' }}>Webhook URL:</span></div>
                <div style={{ color: GREEN, wordBreak: 'break-all' as const }}>https://teamtailor-gtm-workspace-production.up.railway.app/api/webhook/clay</div>
                <div><span style={{ color: '#9ca3af' }}>Method:</span> POST</div>
                <div><span style={{ color: '#9ca3af' }}>Format:</span> JSON (single record or array of records)</div>
                <div><span style={{ color: '#9ca3af' }}>Auth:</span> None required</div>
              </div>

              <div style={{ marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', marginBottom: 8 }}>PUSH: EXPECTED CLAY COLUMNS (WEBHOOK)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {['company_name', 'domain', 'employee_count', 'industry', 'city', 'state', 'country', 'current_ats', 'full_name', 'email', 'job_title', 'linkedin_url', 'phone', 'utm_source', 'utm_campaign', 'utm_medium', 'utm_content', 'sf_account_id', 'sf_account_owner', 'sf_contact_id', 'contact_owner', 'lifecycle_stage'].map(f => (
                    <code key={f} style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 3, color: ACCENT_LIGHT }}>{f}</code>
                  ))}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 8, lineHeight: 1.5 }}>
                  Field names are auto-normalized. <span style={{ color: AMBER }}>employees</span>, <span style={{ color: AMBER }}>headcount</span>, <span style={{ color: AMBER }}>employee_count</span> all map correctly. Unknown fields are stored in <span style={{ color: ACCENT_LIGHT }}>raw_payload</span>.
                </div>
              </div>

              <div style={{ marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', marginBottom: 8 }}>PULL: HTTP SOURCE FOR CLAY TABLES</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.68rem', lineHeight: 2, color: ACCENT_LIGHT }}>
                  <div>GET https://tqmpaaxocpwmziivxkym.supabase.co/rest/v1/accounts</div>
                  <div>  ?audience_source=eq.rippling</div>
                  <div>  {'&'}select=company_name,domain,employee_count,industry,city,state,current_ats</div>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 8, lineHeight: 1.5 }}>
                  Clay can pull accounts directly via HTTP source — no CSV export needed. Add <span style={{ color: AMBER }}>{'&'}last_enriched_at=is.null</span> to only pull accounts that haven't been enriched yet.
                </div>
              </div>
            </div>

            {/* Supabase Direct */}
            <div style={{ background: GRADIENT_1, borderRadius: 12, padding: 28, color: 'white' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#ec4899', marginBottom: 12 }}>Jesper — Ad Audience API</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: 2.2 }}>
                <div><span style={{ color: '#9ca3af' }}>Base URL:</span></div>
                <div style={{ color: GREEN, wordBreak: 'break-all' as const }}>https://tqmpaaxocpwmziivxkym.supabase.co</div>
                <div><span style={{ color: '#9ca3af' }}>Format:</span> PostgREST (REST + filter syntax)</div>
                <div><span style={{ color: '#9ca3af' }}>Auth:</span> Bearer token (anon key or service key)</div>
              </div>

              <div style={{ marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', marginBottom: 8 }}>AD AUDIENCE QUERIES</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.68rem', lineHeight: 2, color: ACCENT_LIGHT }}>
                  <div><span style={{ color: '#9ca3af' }}>Rippling prospects:</span></div>
                  <div>  /accounts?audience_source=eq.rippling{'&'}is_existing_customer=eq.false</div>
                  <div><span style={{ color: '#9ca3af' }}>Mid-market (100-500 emp):</span></div>
                  <div>  /accounts?employee_count=gte.100{'&'}employee_count=lte.500</div>
                  <div><span style={{ color: '#9ca3af' }}>Suppress customers:</span></div>
                  <div>  /accounts?is_existing_customer=eq.true</div>
                  <div><span style={{ color: '#9ca3af' }}>K-12 audience:</span></div>
                  <div>  /accounts?audience_source=eq.k12</div>
                </div>
              </div>

              <div style={{ marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', marginBottom: 8 }}>AVAILABLE FIELDS FOR TARGETING</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {['company_name', 'domain', 'employee_count', 'employee_range', 'industry', 'current_ats', 'city', 'state', 'billing_country', 'audience_source', 'lifecycle_stage', 'is_existing_customer'].map(f => (
                    <code key={f} style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 3, color: ACCENT_LIGHT }}>{f}</code>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Readiness status */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', marginBottom: 16 }}>Integration Readiness</h3>
            <div style={{ ...cardStyle, overflow: 'hidden', padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <tbody>
                  {[
                    { name: 'Supabase Data Layer', status: 'Live', detail: '14,096 US accounts across 3 audiences, actively queryable', color: GREEN },
                    { name: 'Audience Builder UI', status: 'Live', detail: 'Filter, export, CSV download — working in production', color: GREEN },
                    { name: 'Clay Webhook', status: 'Deployed', detail: 'Endpoint accepting requests. Needs Daniel to point Clay table at it', color: ACCENT },
                    { name: 'RB2B Flywheel', status: 'Deployed', detail: 'Endpoint ready. Needs RB2B webhook URL configured in RB2B dashboard', color: ACCENT },
                    { name: 'Lead Routing Engine', status: 'Deployed', detail: 'Scoring + routing logic built. Activates when Clay or RB2B start sending', color: ACCENT },
                    { name: 'SFDC Field Mapping', status: 'Built', detail: 'All 15 fields mapped, picklist conversions coded — goes through Clay (already authorized)', color: GREEN },
                    { name: 'Salesforce Sync', status: 'Live', detail: 'SFDC writes go through Clay (already authorized). Webhook returns SFDC-ready payloads with exact API field names.', color: GREEN },
                    { name: 'tt-signals Connector', status: 'Proposed', detail: 'Spec designed. Needs Pectus contract spec + segmentation alignment', color: AMBER },
                    { name: 'Ad Segmentation Logic', status: 'Proposed', detail: 'Mapping designed, needs alignment on SFDC stages with Jesper', color: AMBER },
                  ].map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 20px', fontWeight: 600, color: '#1a1a2e' }}>{r.name}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: r.color, background: `${r.color}12`, padding: '3px 10px', borderRadius: 99 }}>{r.status}</span>
                      </td>
                      <td style={{ padding: '12px 20px', color: '#6b7280', fontSize: '0.82rem' }}>{r.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ════ SECTION 09: DATA FLOW ARCHITECTURE ════ */}
      <section style={sectionStyle}>
        <div style={labelStyle}>09 — How Data Flows</div>
        <h2 style={h2Style}>Clay Is the Bridge — Reps Work from the Signal Board</h2>
        <p style={{ ...bodyStyle, maxWidth: 700, marginBottom: 12 }}>
          No direct Supabase→Salesforce connection until legal/IT approval (timeline: end of August). Clay bridges data into SFDC — it's already authorized with full admin permissions. Reps see signals in the workspace and push contacts to Salesloft directly from the Signal Board. Activities sync back to SFDC automatically.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
          {/* What's confirmed */}
          <div style={{ ...cardStyle, borderTop: `3px solid ${GREEN}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a2e', margin: 0 }}>Confirmed</h3>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, background: `${GREEN}12`, color: GREEN, padding: '3px 10px', borderRadius: 99 }}>How it works</span>
            </div>
            {[
              { item: 'Clay → Salesforce', desc: 'Clay has full admin license in SFDC. Upserts Accounts + Contacts with zero additional cost on our current plan.' },
              { item: 'Workspace → Salesloft', desc: 'Reps push contacts to Salesloft cadences directly from the Signal Board. Activities sync back to SFDC automatically. Record must exist in SFDC first — Salesloft does NOT create new records.' },
              { item: 'Clay → Supabase (webhook)', desc: 'Clay POSTs enriched data to our webhook. We score, route, assign a rep, and return SFDC-ready field names in the response.' },
              { item: 'Supabase → Clay (HTTP source)', desc: 'Clay pulls account data from Supabase for enrichment, then pushes enriched results back to us + to SFDC.' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: GREEN, background: `${GREEN}12`, padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap' as const, marginTop: 2 }}>Live</span>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>{r.item}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', lineHeight: 1.4 }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Key constraints */}
          <div style={{ ...cardStyle, borderTop: `3px solid ${AMBER}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a2e', margin: 0 }}>Key Constraints</h3>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, background: `${AMBER}12`, color: '#92400e', padding: '3px 10px', borderRadius: 99 }}>Important</span>
            </div>
            {[
              { item: 'No direct Supabase → SFDC', desc: 'Connected App requires internal legal/IT approval at Teamtailor. Timeline: end of August. Clay bridges the gap until then.' },
              { item: 'Salesloft does NOT create records', desc: 'If a Contact doesn\'t exist in SFDC, Salesloft can\'t create it. Clay must create the Account + Contact in SFDC before the rep touches it.' },
              { item: '22 reps missing SFDC User IDs', desc: '3 pilot AEs (Moe, Jack, Tyler) have sf_user_id mapped for auto OwnerId. Remaining 22 US reps need their IDs added for full coverage.' },
              { item: 'Daily reverse sync needed', desc: 'Two scheduled Clay tables pulling SFDC ownership + lifecycle changes → push to our webhook. Without this, our data goes stale.' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: AMBER, background: `${AMBER}12`, padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap' as const, marginTop: 2 }}>Note</span>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>{r.item}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', lineHeight: 1.4 }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How they work together */}
        <div style={{ background: GRADIENT_1, borderRadius: 12, padding: 28, color: 'white', marginTop: 24 }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: ACCENT_LIGHT, marginBottom: 12 }}>Full loop</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr auto 1fr', gap: 12, alignItems: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>🗄️</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Supabase</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>Audiences + signals</div>
            </div>
            <div style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.3)' }}>→</div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>🧱</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Clay</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>Enrich + push to SFDC</div>
            </div>
            <div style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.3)' }}>→</div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>📊</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Salesforce</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>Source of truth</div>
            </div>
            <div style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.3)' }}>→</div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>📧</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Salesloft</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>Cadences + activity</div>
            </div>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', marginTop: 16, lineHeight: 1.6, maxWidth: 700 }}>
            Supabase holds audiences and intent signals. Our webhook returns SFDC-ready payloads — once Daniel adds the Clay→SFDC upsert step, records auto-create in Salesforce. Reps see signals in the workspace and push contacts to Salesloft cadences directly from the Signal Board. Activities sync back to SFDC. Once Daniel sets up the daily Clay sync, ownership and lifecycle changes flow back to Supabase to close the loop.
          </p>
        </div>
      </section>

      {/* ════ SECTION 10: SALESFORCE PROPOSAL ════ */}
      <section style={sectionStyle}>
        <div style={labelStyle}>10 — Proposal</div>
        <h2 style={h2Style}>Salesforce as Single Source of Truth</h2>
        <p style={{ ...bodyStyle, maxWidth: 680, marginBottom: 16 }}>
          For clean data across ad targeting, enrichment, and prospecting, Salesforce should be the authority on account ownership, stage, and type. Everything else feeds into it or reads from it.
        </p>

        {/* Status callout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
          <div style={{ background: '#ecfdf5', borderRadius: 8, padding: 16, borderLeft: `3px solid ${GREEN}` }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#065f46' }}>✅ SFDC sync is live — via Clay</div>
            <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: 4, lineHeight: 1.5 }}>
              Clay is already authorized to write to Salesforce. Our webhook returns SFDC-ready payloads with exact API field names (OwnerId, LeadSource, Amount_of_Employees__c, etc.). Daniel adds one step to his Clay workflow → records auto-create in SFDC.
            </div>
          </div>
          <div style={{ background: '#ecfdf5', borderRadius: 8, padding: 16, borderLeft: `3px solid ${GREEN}` }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#065f46' }}>✅ Rep roster with SFDC User IDs</div>
            <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: 4, lineHeight: 1.5 }}>
              All 3 AEs (Moe, Jack, Tyler) have their Salesforce User IDs mapped. OwnerId auto-populates in the webhook response — Clay passes it straight through.
            </div>
          </div>
        </div>

        {/* Bidirectional sync diagram */}
        <div style={{ ...cardStyle, marginBottom: 24, padding: 0, overflow: 'hidden' }}>
          <div style={{ background: '#f9fafb', padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Bidirectional Sync</h3>
            <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: '4px 0 0' }}>Salesforce stays the master — we read from it and write back to it</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', gap: 0 }}>
            {/* READ column */}
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: ACCENT, marginBottom: 16 }}>Read from Salesforce</div>
              {[
                { field: 'Lifecycle_Stage__c', why: 'Prospect / Customer / Churned — maps to ad segments and suppression logic' },
                { field: 'OwnerId (SFDC User ID)', why: 'Account ownership — maps to rep roster, routes signals to the right rep' },
                { field: 'Current_ATS_Provider__c', why: 'Competitive ATS — drives targeting priority (Rippling, Greenhouse, etc.)' },
                { field: 'Current ATS Renewal Date', why: 'Times outreach 3-6 months before contract renewal' },
                { field: 'Amount_of_Employees__c', why: 'Employee range for segment filtering (1-25 through 5000+)' },
              ].map((r, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a1a2e' }}>{r.field}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', lineHeight: 1.4 }}>{r.why}</div>
                </div>
              ))}
            </div>

            {/* Arrow column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid #f3f4f6', borderRight: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: '1.2rem', color: ACCENT }}>←</div>
              <div style={{ width: 1, height: 24, background: '#e5e7eb' }} />
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#9ca3af', transform: 'rotate(-90deg)', whiteSpace: 'nowrap' as const }}>SFDC</div>
              <div style={{ width: 1, height: 24, background: '#e5e7eb' }} />
              <div style={{ fontSize: '1.2rem', color: '#ec4899' }}>→</div>
            </div>

            {/* WRITE column */}
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#ec4899', marginBottom: 16 }}>Write to Salesforce</div>
              {[
                { field: 'New Accounts (Name, Email_Domain_Name__c, Website)', why: 'Accounts discovered through audience building that aren\'t in SFDC yet', sensitivity: 'Medium' },
                { field: 'Current_ATS_Provider__c', why: 'ATS detected via BuiltWith/career page scraping — fills gaps in SFDC data', sensitivity: 'Low' },
                { field: 'AccountSource = "Clay"', why: 'Tag accounts we discover so attribution is clean', sensitivity: 'Low' },
                { field: 'OwnerId (on net-new accounts)', why: 'Assigns account to the rep who discovered it — Clay sets OwnerId from our router', sensitivity: 'Low' },
              ].map((r, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a1a2e' }}>{r.field}</div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: r.sensitivity === 'High' ? '#ef4444' : AMBER, background: r.sensitivity === 'High' ? '#fef2f2' : '#fffbeb', padding: '2px 8px', borderRadius: 4 }}>{r.sensitivity}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', lineHeight: 1.4 }}>{r.why}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Why this matters */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {[
            { icon: '🎯', title: 'Ad Targeting Gets Accurate', desc: 'Ad segmentation maps to real SFDC stages instead of a local tracking system. Jesper targets based on where accounts actually are in the pipeline.' },
            { icon: '🔒', title: 'Data Stays Clean', desc: 'One source of truth for ownership, stage, and type. No conflicting data between Supabase and Salesforce. No orphaned accounts.' },
            { icon: '⚡', title: 'Reps Stay in Salesforce', desc: 'Reps don\'t need to learn a new tool for dispositioning. Signal Board reads from SFDC and writes back — their workflow doesn\'t change.' },
          ].map(c => (
            <div key={c.title} style={cardStyle}>
              <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{c.icon}</div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 6px' }}>{c.title}</h4>
              <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{c.desc}</p>
            </div>
          ))}
        </div>

        {/* ── What Ryan needs from Gordon ── */}
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a1a2e', marginBottom: 4 }}>How Clay Bridges the Gap</h3>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 20, maxWidth: 640 }}>
            Clay is already authorized to write to Salesforce — no Connected App needed. Here's how it works end-to-end.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {[
              {
                num: '1',
                title: 'Signal comes in (RB2B / Clay enrichment)',
                what: 'A website visitor is identified by RB2B, or Clay enriches an account from our Supabase audience. Data hits our webhook.',
                why: 'Our system scores the signal, assigns a rep via the router (SFDC owner → sticky → territory → round-robin), and returns the result.',
                effort: 'Automated',
                color: ACCENT,
              },
              {
                num: '2',
                title: 'Webhook returns SFDC-ready payload',
                what: 'The response includes sfdc_account and sfdc_contact objects with exact Salesforce API field names: OwnerId, LeadSource, Amount_of_Employees__c picklist range, AccountSource, MailingCountry — all pre-populated.',
                why: 'Daniel\'s Clay workflow reads these fields and passes them directly to the Salesforce create step. Zero manual mapping needed.',
                effort: 'Automated',
                color: '#8b5cf6',
              },
              {
                num: '3',
                title: 'Clay creates Account + Contact in SFDC',
                what: 'Clay takes the SFDC-ready payload and creates the record in Salesforce with the correct owner, lead source, and all required fields. No validation rule failures, no blank fields, no duplicate conflicts.',
                why: 'By the time a rep sees the signal and wants to act, the SFDC record already exists. Salesloft sync works immediately.',
                effort: 'One Clay workflow step',
                color: GREEN,
              },
              {
                num: '4',
                title: 'SFDC changes sync back to workspace',
                what: 'Clay periodically pulls SFDC account ownership and pushes to Supabase. If Gordon reassigns an account, our router automatically respects the new owner next time a signal comes in.',
                why: 'The workspace stays in sync with SFDC without needing a direct API connection. Bidirectional through Clay.',
                effort: 'Daily Clay schedule',
                color: AMBER,
              },
            ].map(ask => (
              <div key={ask.num} style={{ ...cardStyle, borderLeft: `3px solid ${ask.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: `${ask.color}15`, color: ask.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem', flexShrink: 0 }}>{ask.num}</div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{ask.title}</h4>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#9ca3af', background: '#f3f4f6', padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap' as const }}>{ask.effort}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.6, marginBottom: 8 }}>
                  <strong style={{ color: '#1a1a2e' }}>What happens:</strong> {ask.what}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.5 }}>
                  <strong>Why it matters:</strong> {ask.why}
                </div>
              </div>
            ))}
          </div>

          {/* Already resolved vs still open */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ ...cardStyle, background: '#ecfdf5', border: `1px solid ${GREEN}30` }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: GREEN, marginBottom: 10 }}>✅ Done</div>
              {[
                'SFDC field names mapped (all 15 fields)',
                'SFDC-ready payloads in webhook response (OwnerId, LeadSource, etc.)',
                'Rep roster — 25 US reps loaded, SFDC User IDs mapped for 3 pilot AEs (Moe, Jack, Tyler)',
                'Routing: SFDC owner → sticky → round-robin',
                'Size segments: SMB (1-250), Mid-Market (251-500), Enterprise (501+)',
                'Reverse sync ready — webhook accepts Account + Contact ownership updates',
                'Lifecycle → is_existing_customer auto-derivation (Customer = suppressed)',
                'Dedup by domain (accounts) and email+domain (contacts)',
                'SFDC IDs stored — Account ID, Contact ID, Owner ID tracked in Supabase',
                'UTM attribution — auto-parses utm_source/campaign/medium/content from RB2B page URLs',
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, fontSize: '0.78rem', color: '#047857', marginBottom: 4 }}>
                  <span style={{ color: GREEN, flexShrink: 0 }}>✓</span> {t}
                </div>
              ))}
            </div>

            <div style={{ ...cardStyle, background: '#fffbeb', border: `1px solid ${AMBER}30` }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#92400e', marginBottom: 10 }}>🟡 Needs Daniel</div>
              {[
                'SFDC upsert step — upsert Account by Email_Domain_Name__c, then Contact by Email with AccountId (upsert not create)',
                'Daily SFDC sync (Accounts + Contacts) — two scheduled Clay tables → push to webhook',
                'Error notifications — flag failed Clay→SFDC upserts in Slack',
                'Net-new: write all fields (Lifecycle_Stage__c = "Prospect"). Existing: just create Contact + write OwnerId — don\'t touch Lifecycle (SFDC is source of truth)',
                'UTM tags on Salesloft cadences — append utm_source/campaign/medium/content to links (one-time setup)',
                'SFDC User IDs for remaining 22 US reps — need sf_user_id so OwnerId populates for all reps',
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, fontSize: '0.78rem', color: '#92400e', marginBottom: 4 }}>
                  <span style={{ color: AMBER, flexShrink: 0 }}>→</span> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════ SECTION 09: SUGGESTED NEXT STEPS ════ */}
      <section style={{ background: `linear-gradient(135deg, ${GRADIENT_1}, ${GRADIENT_2})`, padding: '64px 0', color: 'white' }}>
        <div style={sectionStyle}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: ACCENT_LIGHT, marginBottom: 8 }}>11 — Suggested Next Steps</div>
          <h2 style={{ ...h2Style, color: 'white' }}>Ideas for Getting Started</h2>
          <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.5)', marginTop: 8, marginBottom: 32, maxWidth: 600 }}>
            These are suggestions based on what's ready today — open to discussion.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            {[
              {
                name: 'Rev Ops',
                role: 'Clay Enrichment',
                color: '#8b5cf6',
                tasks: [
                  'Test the webhook with a small batch (10-50 accounts)',
                  'Review the expected Clay column mapping above',
                  'Enrich a segment — e.g. Rippling 100-500 emp',
                  'Flag any fields you need that aren\'t in the schema',
                ],
              },
              {
                name: 'Marketing',
                role: 'Performance / Ads',
                color: '#ec4899',
                tasks: [
                  'Pull a sample audience via API or CSV export',
                  'Map your current segmentation to the proposed model',
                  'Identify which fields matter most for your targeting',
                  'Share how the tt-signals write step should behave',
                ],
              },
              {
                name: 'GTM Eng',
                role: 'Infrastructure',
                color: ACCENT,
                tasks: [
                  'Wire the SFDC account stages into segmentation',
                  'Build REST endpoints for ad-ready audience pulls',
                  'Complete Greenhouse enrichment pass',
                  'Adapt based on what Rev Ops and Marketing need',
                ],
              },
            ].map(p => (
              <div key={p.name} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem' }}>
                    {p.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>{p.role}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {p.tasks.map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>
                      <span style={{ color: p.color, fontWeight: 700, flexShrink: 0 }}>→</span>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ FOOTER ════ */}
      <footer style={{ padding: '32px 0', textAlign: 'center', fontSize: '0.78rem', color: '#9ca3af' }}>
        Teamtailor GTM Workspace · July 2026
      </footer>
    </div>
  );
}
