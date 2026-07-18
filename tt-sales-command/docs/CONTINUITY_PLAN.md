# Sales Command Center — Business Continuity Plan

> **Document Classification:** Internal  
> **System:** Sales Command Center (SCC)  
> **System Owner:** Ryan Walker  
> **CISO:** Johan Tempelman  
> **Framework:** Teamtailor IT Continuity Plan (rev. 2025-05-21)  
> **Document Created:** 2026-06-11  
> **Next Scheduled Review:** 2026-12-11 (6-month cadence)

---

## 1. Purpose and Scope

This Business Continuity Plan (BCP) documents the strategies, procedures, and responsibilities for maintaining and restoring the Sales Command Center (SCC) application in the event of a service disruption. It is aligned with the **Teamtailor IT Continuity Plan** and classifies SCC as a **non-customer-facing internal service** (Priority Tier 3 per Teamtailor's continuity priorities).

### Continuity Priority Classification

Per the Teamtailor IT Continuity Plan, services are prioritized in three tiers:

| Priority | Category | SCC Classification |
|----------|----------|-------------------|
| **Tier 1** | Teamtailor Application (career sites, candidate applications) | ❌ Not applicable |
| **Tier 2** | Customer-facing supporting services (support switchboard, email, ticketing) | ❌ Not applicable |
| **Tier 3** | Non-customer-facing services (dev environments, business IT, internal tools) | ✅ **SCC falls here** |

**Key Principle:** SCC is an internal sales productivity tool. If SCC is fully unavailable, the SDR team continues operating using Salesloft directly. There is **no customer-facing impact** from an SCC outage.

---

## 2. Recovery Objectives

| Metric | Target | Justification |
|--------|--------|---------------|
| **RPO (Recovery Point Objective)** | 24 hours | Supabase daily automated backups. Signal data is ephemeral and re-enrichable from Clay. |
| **RTO (Recovery Time Objective)** | 1 hour | Application redeploy from Git; database restore from Supabase backup. |
| **MTPD (Maximum Tolerable Period of Disruption)** | 48 hours | SDR team can operate via Salesloft directly during extended outages. |
| **Fallback Mode** | Salesloft Direct | All core SDR functions (cadence enrollment, prospect management) available without SCC. |

---

## 3. Service Dependencies

### 3.1 Dependency Map

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Clay      │────▶│  Supabase    │◀────│   GitHub     │
│  (Enrichment)│     │  (Database   │     │  (Source     │
│              │     │   + Auth)    │     │   Control)   │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │  SCC React  │
                    │    SPA      │
                    │ (Frontend)  │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │  Salesloft  │
                    │   (API)     │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │ Salesforce  │
                    │  (CRM)      │
                    └─────────────┘
```

### 3.2 Dependency Details

| Dependency | Type | Criticality | SLA / Availability | Impact if Unavailable |
|------------|------|-------------|-------------------|----------------------|
| **Supabase** | Infrastructure (PostgreSQL + Auth) | **Critical** | 99.9% (Supabase Pro) | Complete SCC outage — no data access, no authentication |
| **Salesloft API** | Integration | **High** | 99.9% (enterprise SLA) | Cannot push contacts to cadences; Signal Board remains readable |
| **GitHub** | Source Control | **Medium** | 99.9% | Cannot deploy updates; existing deployment unaffected |
| **Clay** | Data Enrichment | **Medium** | N/A (webhook-based) | No new signals arrive; existing signals unaffected |
| **Vercel / Hosting** | Frontend Hosting | **Critical** | 99.99% | Frontend inaccessible; backend data unaffected |
| **Salesforce** | Downstream CRM | **Low** | 99.9% | No direct impact — Salesloft handles Salesforce sync independently |

---

## 4. Failure Scenarios and Recovery Procedures

### 4.1 Supabase Outage (Critical Path)

**Scenario:** Supabase experiences a service disruption affecting the PostgreSQL database, authentication, or both.

**Impact:** Complete SCC outage. Users cannot log in, view signals, or push contacts.

**Detection:**
- Supabase status page monitoring ([status.supabase.com](https://status.supabase.com))
- User-reported access failures
- Application error monitoring

**Recovery Procedure:**

| Step | Action | Responsible | Time Estimate |
|------|--------|------------|---------------|
| 1 | Confirm outage via Supabase status page | Ryan Walker | 5 min |
| 2 | Notify SDR team to switch to Salesloft direct mode | Ryan Walker | 5 min |
| 3 | Monitor Supabase status for resolution | Ryan Walker | Ongoing |
| 4 | Once restored, verify database connectivity | Ryan Walker | 10 min |
| 5 | Verify authentication flow works | Ryan Walker | 5 min |
| 6 | Confirm data integrity (spot-check signal counts, recent records) | Ryan Walker | 15 min |
| 7 | Notify SDR team of service restoration | Ryan Walker | 5 min |

**If Supabase cannot recover within 24 hours:**

| Step | Action | Responsible |
|------|--------|------------|
| 1 | Assess whether a new Supabase project is needed | Ryan Walker |
| 2 | Provision new Supabase project from the latest daily backup | Ryan Walker |
| 3 | Update environment variables to point to new project | Ryan Walker |
| 4 | Re-deploy application with updated configuration | Ryan Walker |
| 5 | Re-trigger Clay webhook to backfill any missed signals | Ryan Walker |

---

### 4.2 Salesloft API Outage

**Scenario:** Salesloft API is unreachable or returning errors, preventing contact pushes to cadences.

**Impact:** Partial degradation. Signal Board, Customer Universe, dispositions, and notes remain fully functional. Only the "Push to Cadence" action is affected.

**Detection:**
- API error responses (HTTP 5xx) logged in browser console
- User-reported push failures
- Salesloft status page

**Recovery Procedure:**

| Step | Action | Responsible | Time Estimate |
|------|--------|------------|---------------|
| 1 | Confirm outage via Salesloft status page | Ryan Walker | 5 min |
| 2 | Advise reps to manually add contacts in Salesloft UI as needed | Ryan Walker | 5 min |
| 3 | Monitor Salesloft status for resolution | Ryan Walker | Ongoing |
| 4 | Once restored, reps can retry failed pushes from SCC | Reps | 15 min |

**No data loss occurs** — push events are recorded in `push_events` table regardless of Salesloft API response, enabling retry.

---

### 4.3 Frontend Hosting Outage

**Scenario:** The hosting platform serving the React SPA is unavailable.

**Impact:** Frontend inaccessible. All backend data in Supabase remains intact and secure.

**Recovery Procedure:**

| Step | Action | Responsible | Time Estimate |
|------|--------|------------|---------------|
| 1 | Confirm hosting outage | Ryan Walker | 5 min |
| 2 | If platform-wide outage: wait for provider resolution | Ryan Walker | Varies |
| 3 | If deployment-specific: redeploy from GitHub `main` branch | Ryan Walker | 10 min |
| 4 | If provider cannot recover: deploy to alternative platform (Netlify, Cloudflare Pages) | Ryan Walker | 30 min |
| 5 | Update DNS / access URL if platform changed | Ryan Walker | 15 min |
| 6 | Notify SDR team of new URL if applicable | Ryan Walker | 5 min |

---

### 4.4 GitHub Outage

**Scenario:** GitHub is unavailable, preventing code pushes, CI/CD, or deployment.

**Impact:** Minimal. Existing deployment continues operating. New deployments and code changes are blocked.

**Recovery Procedure:**

| Step | Action | Responsible | Time Estimate |
|------|--------|------------|---------------|
| 1 | Confirm GitHub outage via [githubstatus.com](https://githubstatus.com) | Ryan Walker | 5 min |
| 2 | Defer any planned deployments | Ryan Walker | — |
| 3 | If urgent code changes needed: deploy from local Git clone | Ryan Walker | 15 min |
| 4 | Resume normal workflow once GitHub recovers | Ryan Walker | 5 min |

---

### 4.5 Clay Webhook Failure

**Scenario:** Clay stops sending enrichment data to Supabase via webhook.

**Impact:** No new signals appear on the Signal Board. Existing signals and all other features remain functional.

**Recovery Procedure:**

| Step | Action | Responsible | Time Estimate |
|------|--------|------------|---------------|
| 1 | Identify gap in signal flow (no new signals arriving) | Ryan Walker | 30 min |
| 2 | Check Clay dashboard for webhook errors | Ryan Walker | 10 min |
| 3 | Verify Supabase webhook endpoint is accessible | Ryan Walker | 5 min |
| 4 | Re-trigger Clay table run to backfill missed signals | Ryan Walker | 15 min |
| 5 | Verify signals flowing to Signal Board | Ryan Walker | 5 min |

---

### 4.6 Data Corruption or Accidental Deletion

**Scenario:** Data in Supabase is corrupted or accidentally deleted (e.g., errant SQL query, application bug).

**Impact:** Data integrity loss. Severity depends on scope of corruption/deletion.

**Recovery Procedure:**

| Step | Action | Responsible | Time Estimate |
|------|--------|------------|---------------|
| 1 | Identify scope of data loss/corruption via audit logs | Ryan Walker | 15 min |
| 2 | Assess whether point-in-time recovery (PITR) is needed | Ryan Walker | 10 min |
| 3 | For minor issues: restore specific records from backup | Ryan Walker | 30 min |
| 4 | For major corruption: initiate Supabase PITR to last known good state | Ryan Walker | 1 hour |
| 5 | Re-trigger Clay webhook for any signals lost during recovery window | Ryan Walker | 15 min |
| 6 | Verify data integrity post-restoration | Ryan Walker | 30 min |

---

## 5. Incident Response

### 5.1 Incident Classification

Per the **Teamtailor Acceptable Use Policy §9**, potential security incidents should be reported via the **"Report incident/strange thing"** workflow in the `#stranger-things` Slack channel.

| Severity | Definition | Example | Response Time |
|----------|-----------|---------|---------------|
| **P1 — Critical** | Complete service outage or confirmed data breach | Supabase compromise, unauthorized data access | Immediate |
| **P2 — High** | Major feature degradation or suspected security event | Salesloft API failure, suspicious login attempt | Within 1 hour |
| **P3 — Medium** | Minor feature issue or non-urgent security concern | Clay webhook delay, UI rendering bug | Within 4 hours |
| **P4 — Low** | Cosmetic issue or improvement opportunity | Minor UI inconsistency | Next business day |

### 5.2 Incident Response Workflow

```
1. DETECT         → Monitoring alert, user report, or automated check
       │
2. TRIAGE         → Classify severity (P1–P4), assess blast radius
       │
3. CONTAIN        → Isolate affected component; switch to fallback if needed
       │
4. COMMUNICATE    → Notify stakeholders per Communication Plan (§6)
       │
5. REMEDIATE      → Execute relevant Recovery Procedure (§4)
       │
6. VERIFY         → Confirm service restoration and data integrity
       │
7. POST-MORTEM    → Document root cause, timeline, and prevention measures
```

### 5.3 Incident Response Contacts

| Role | Name | Contact Method |
|------|------|---------------|
| **System Owner / First Responder** | Ryan Walker | Slack DM, mobile |
| **CISO** | Johan Tempelman | Slack DM, `#stranger-things` channel |
| **SDR Team Lead** | Ryan Walker | Slack `#sales-team` channel |
| **SDR Reps** | Jack Luther, Moe Aqel, Tyler Hanson | Slack DM |

---

## 6. Communication Plan

### 6.1 Internal Communication

| Audience | Channel | When | Message |
|----------|---------|------|---------|
| **SDR Team** (Jack, Moe, Tyler) | Slack `#sales-team` or DM | Within 15 min of P1/P2 incident | Outage notification + fallback instructions |
| **CISO** (Johan Tempelman) | Slack `#stranger-things` workflow | For any P1 security incident | Incident details per AUP §9 reporting workflow |
| **Management** | Slack DM to direct manager | For P1 incidents lasting >2 hours | Status update and estimated resolution |
| **All stakeholders** | Slack `#sales-team` | Upon resolution | Service restored notification |

### 6.2 Fallback Communication to SDR Team

**Template — SCC Outage Notification:**

> **⚠️ SCC is temporarily unavailable.**  
> **Cause:** [brief description]  
> **ETA for resolution:** [estimate]  
> **Fallback:** Please use Salesloft directly for all prospecting activity until further notice. All existing cadence enrollments are unaffected.  
> I'll update this thread when service is restored.

---

## 7. Data Backup Strategy

### 7.1 Backup Architecture

| Component | Backup Method | Frequency | Retention | Location |
|-----------|--------------|-----------|-----------|----------|
| **Supabase PostgreSQL** | Automated daily full backup | Daily | 10 days | Supabase-managed (AWS us-east) |
| **Supabase PostgreSQL** | WAL (Write-Ahead Log) archival | Every 60 seconds | 10 days | Supabase-managed |
| **Application Source Code** | Git version control | Every commit | Indefinite | GitHub |
| **Environment Configuration** | `.env` file | Manual | On developer machines | Local + documented in secure note |
| **Clay Enrichment Data** | Clay platform retention | N/A | Per Clay retention policy | Clay platform |
| **Salesforce/Salesloft Data** | Platform-native backups | N/A | Per platform policies | Salesloft / Salesforce |

### 7.2 Backup Verification

Per the Teamtailor IT Continuity Plan, "backup restore tests are conducted at least every 6 months."

| Activity | Frequency | Next Due | Responsible |
|----------|-----------|----------|------------|
| Verify Supabase backup exists and is recent | Monthly | 2026-07-11 | Ryan Walker |
| Test full database restore from backup | Every 6 months | 2026-12-11 | Ryan Walker |
| Verify Git repository integrity | Quarterly | 2026-09-11 | Ryan Walker |
| Document restore test results | Each test | — | Ryan Walker |

### 7.3 Data Recovery Priority

In the event of a complete data loss, data should be recovered in the following order:

| Priority | Data Set | Source | Criticality |
|----------|----------|--------|-------------|
| 1 | Customer Universe | Teamtailor CRM export | High — needed for account context |
| 2 | Active Signal Board data | Clay re-enrichment (webhook re-trigger) | High — needed for daily workflow |
| 3 | Dispositions & Account Notes | Supabase backup | Medium — team working context |
| 4 | Push Event History | Supabase backup | Low — historical record only |
| 5 | Audit Logs | Supabase backup | Low — compliance record |

---

## 8. Plan Testing and Maintenance

### 8.1 Testing Schedule

| Test Type | Frequency | Next Due | Method |
|-----------|-----------|----------|--------|
| **Tabletop exercise** | Annually | 2027-06-11 | Walk through P1 scenario with team |
| **Backup restore test** | Every 6 months | 2026-12-11 | Restore Supabase backup to test project |
| **Failover test** | Annually | 2027-06-11 | Simulate Salesloft API outage, verify fallback |
| **Communication test** | Every 6 months | 2026-12-11 | Send test notification via communication plan channels |

### 8.2 Plan Review

This continuity plan must be reviewed and updated:
- **At minimum:** Every 6 months (aligned with Teamtailor's management review cadence)
- **On any of the following triggers:**
  - Change in hosting provider or infrastructure
  - Addition of new service dependencies
  - Change in team membership (users added/removed)
  - Post-incident lessons learned
  - Changes to Teamtailor IT Continuity Plan

---

## Revision History

| Date | Updated By | Summary |
|------|-----------|---------|
| 2026-06-11 | Ryan Walker | Initial business continuity plan — aligned with Teamtailor IT Continuity Plan framework |

---

## Related Documents

- [SECURITY.md](./SECURITY.md) — Security documentation and controls
- [RISK_REGISTER.md](./RISK_REGISTER.md) — Risk register and assessments
- [SYSTEM_REGISTER.md](./SYSTEM_REGISTER.md) — System register entry for Notion
- Teamtailor IT Continuity Plan (CISO, rev. 2025-05-21)
- Teamtailor Acceptable Use Policy §9 (incident reporting)
- Teamtailor Risk Management Instruction (CISO, rev. 2025-09-03)
