# Sales Command Center — System Register Entry

> **Purpose:** This document contains the System Register entry for the Sales Command Center (SCC) application, formatted for inclusion in the Teamtailor System Register on Notion per the Information Security Policy and Logical Access Instructions.  
> **Document Classification:** Internal  
> **Prepared By:** Ryan Walker  
> **Date:** 2026-06-11

---

## System Overview

| Field | Value |
|-------|-------|
| **System Name** | Sales Command Center (SCC) |
| **System Owner** | Ryan Walker |
| **Department** | Sales — US SDR Team |
| **Description** | Internal sales productivity tool that aggregates enriched prospect signals from Clay, surfaces them to SDRs via a Signal Board, and enables one-click cadence enrollment via the Salesloft API. Also provides a read-only Customer Universe view of Teamtailor's account base. |
| **System Category** | Non-customer-facing internal service (Tier 3 per IT Continuity Plan) |
| **Status** | Active |
| **Go-Live Date** | 2026-06-10 |
| **Last Security Review** | 2026-06-11 |
| **Next Scheduled Review** | 2026-12-11 |

---

## Users and Access

| Field | Value |
|-------|-------|
| **Total Users** | 4 |
| **User Base** | 1 Admin (Ryan Walker) + 3 SDR Reps (Jack Luther, Moe Aqel, Tyler Hanson) |
| **Access Provisioning** | Email added to whitelist in `AuthContext.tsx` + Supabase Dashboard user creation |
| **Access Deprovisioning** | Remove email from whitelist; disable user in Supabase Dashboard |
| **Access Review Cadence** | Every 6 months (aligned with Logical Access Instructions) |

### Access Matrix

| User | Role | Signal Board | Customer Universe | Clay Setup | Admin Panel | Impersonation |
|------|------|-------------|-------------------|------------|-------------|---------------|
| Ryan Walker | Admin | ✅ All signals | ✅ Read-only | ✅ | ✅ | ✅ |
| Jack Luther | Rep | ✅ Assigned only | ✅ Read-only | ❌ | ❌ | ❌ |
| Moe Aqel | Rep | ✅ Assigned only | ✅ Read-only | ❌ | ❌ | ❌ |
| Tyler Hanson | Rep | ✅ Assigned only | ✅ Read-only | ❌ | ❌ | ❌ |

---

## Authentication

| Field | Value |
|-------|-------|
| **Authentication Method** | Supabase Auth — passwordless magic link |
| **SSO Integration** | Not integrated with Teamtailor IdP (Supabase Auth is standalone) |
| **MFA** | Not currently enforced (Supabase Auth supports TOTP MFA — planned for future enablement) |
| **Session Lifetime** | 24-hour maximum session duration |
| **Password Policy** | N/A — passwordless authentication (no passwords) |

---

## Data Classification

### Data Stored / Processed

| Data Set | Classification | Description | Contains PII | Data Subjects |
|----------|---------------|-------------|-------------|---------------|
| **Clay Signal Data** | Internal | Enriched US business contact data: name, email, title, company, phone, signal metadata | Yes (business contact info) | US business prospects only |
| **Customer Universe** | Confidential | Teamtailor account metadata: company name, website, segment, NPS score, billing country | No (aggregated account data) | N/A — company-level data |
| **Dispositions** | Internal | Sales disposition status per account (e.g., "Working", "Passed", "Not a fit") | No | N/A |
| **Push Events** | Internal | Log of contacts pushed to Salesloft cadences | Yes (contact name, email) | US business prospects |
| **Account Notes** | Internal | Free-text notes added by SDRs to accounts | Potentially (if rep includes contact details) | US business prospects |
| **Audit Logs** | Internal | Authentication events, user actions, impersonation logs | Yes (user email, IP) | SCC users (4 Teamtailor employees) |

### Data NOT Stored

- ❌ No EU data subjects (Clay configured for US-only signals)
- ❌ No financial data (no ARR, contract values, billing information)
- ❌ No candidate/applicant data
- ❌ No Teamtailor customer PII (only aggregated account metadata)
- ❌ No passwords or user credentials (Supabase-managed)

---

## Hosting and Infrastructure

| Component | Provider | Location | Details |
|-----------|----------|----------|---------|
| **Database** | Supabase (PostgreSQL) | AWS us-east | Managed PostgreSQL with Row Level Security, daily backups, 10-day retention |
| **Authentication** | Supabase Auth | AWS us-east | Passwordless magic link; email whitelist |
| **Frontend** | React SPA (Vite + TypeScript) | Deployed via hosting platform | Static site — no server-side rendering |
| **Source Code** | GitHub | GitHub Cloud | Private repository; CI/CD via GitHub Actions |
| **API Proxy** | Vite dev server / hosting platform proxy | Co-located with frontend | Salesloft API key injected server-side |

### Infrastructure Security

| Control | Status |
|---------|--------|
| Encryption at rest | ✅ AES-256 (Supabase default) |
| Encryption in transit | ✅ TLS 1.2+ (all connections) |
| Row Level Security | ✅ Enabled on all tables |
| Network isolation | ✅ Supabase managed VPC |
| DDoS protection | ✅ Supabase/AWS Shield |

---

## Third-Party Integrations

| Service | Purpose | Data Flow Direction | Data Shared | Vendor Approval Status |
|---------|---------|-------------------|-------------|----------------------|
| **Supabase** | Database + Auth | Bidirectional | All SCC data (signals, dispositions, notes, audit logs) | Pending — submit via `#vendor-approval-process` |
| **Salesloft** | CRM cadence enrollment | SCC → Salesloft | Contact name, email, company for cadence enrollment | ✅ Already approved (Teamtailor standard tool) |
| **Clay** | Signal enrichment | Clay → Supabase (webhook) | Enriched US business contact data | Pending — submit via `#vendor-approval-process` |
| **Salesforce** | Downstream CRM (via Salesloft) | Salesloft → Salesforce | Indirect — Salesloft syncs to Salesforce independently | ✅ Already approved |
| **GitHub** | Source control + CI/CD | N/A (code only) | Application source code | ✅ Already approved |
| **Antigravity (AI)** | AI Coding Assistant | Antigravity ↔ Local Environment | Code generation, debugging, file editing (local environment only). No customer PII or production database access. | Pending — submit via `#vendor-approval-process` |

---

## Data Processing Purposes

| Purpose | Legal Basis | Description |
|---------|------------|-------------|
| **Sales prospecting** | Legitimate interest | Enriching and surfacing US business contact signals to SDRs for outbound sales outreach |
| **CRM cadence enrollment** | Legitimate interest | Pushing qualified prospects to Salesloft cadences for structured outreach sequences |
| **Account intelligence** | Legitimate interest | Providing SDRs with read-only context on existing Teamtailor customer accounts to prevent selling to existing customers and to identify expansion opportunities |
| **Audit and compliance** | Legitimate interest / Legal obligation | Logging user actions for security traceability per Teamtailor Information Security Policy |

### Data Retention

| Data Set | Retention Period | Mechanism |
|----------|-----------------|-----------|
| Clay Signal Data | 90 days | Auto-purge via `retention_expires_at` column |
| Customer Universe | Updated quarterly | Manual refresh from CRM export; old data overwritten |
| Dispositions | Indefinite (while account is active) | Reviewed during access reviews |
| Push Events | 90 days | Aligned with signal retention |
| Account Notes | Indefinite (while account is active) | Reviewed during access reviews |
| Audit Logs | 1 year | Reviewed and pruned annually |

---

## Compliance Status

| Requirement | Status | Notes |
|-------------|--------|-------|
| **System Register listing** | 🟡 In Progress | This document to be submitted to Notion System Register |
| **Risk assessment** | ✅ Complete | See [RISK_REGISTER.md](./RISK_REGISTER.md) — 10 risks assessed, all ≤ 2.0 |
| **Security documentation** | ✅ Complete | See [SECURITY.md](./SECURITY.md) |
| **Continuity plan** | ✅ Complete | See [CONTINUITY_PLAN.md](./CONTINUITY_PLAN.md) |
| **Vendor approval (Supabase)** | 🟡 Pending | To be submitted via `#vendor-approval-process` |
| **Vendor approval (Clay)** | 🟡 Pending | To be submitted via `#vendor-approval-process` |
| **Vendor approval (AI dev tools)** | 🟡 Pending | To be submitted via `#vendor-approval-process` |
| **Authentication** | ✅ Implemented | Supabase Auth (magic link) with email whitelist |
| **Row Level Security** | ✅ Enabled | All tables protected by RLS policies |
| **Audit logging** | ✅ Implemented | All security-relevant actions logged to `audit_log` table |
| **Data retention** | ✅ Implemented | 90-day auto-purge on signal data |
| **Vulnerability scanning** | ✅ Active | `npm audit` on deployment; GitHub Actions CI on PRs |
| **Access reviews** | 🟡 Scheduled | First review due 2026-12-11 (6-month cadence) |
| **Backup verification** | 🟡 Scheduled | First restore test due 2026-12-11 |

---

## Audit Trail

| Event | Date | Performed By |
|-------|------|-------------|
| System created | 2026-06-10 | Ryan Walker |
| Security hardening (auth, RLS, audit logging, API key remediation) | 2026-06-11 | Ryan Walker |
| Security documentation created | 2026-06-11 | Ryan Walker |
| Risk register completed | 2026-06-11 | Ryan Walker |
| Continuity plan documented | 2026-06-11 | Ryan Walker |
| System register entry prepared | 2026-06-11 | Ryan Walker |

---

## Document Information

| Field | Value |
|-------|-------|
| **Document Owner** | Ryan Walker (System Owner) |
| **Review Authority** | Johan Tempelman (CISO) |
| **Classification** | Internal |
| **Created** | 2026-06-11 |
| **Last Updated** | 2026-06-11 |

### Revision History

| Date | Updated By | Summary |
|------|-----------|---------|
| 2026-06-11 | Ryan Walker | Initial system register entry — prepared for Notion submission |

---

## Related Documents

- [SECURITY.md](./SECURITY.md) — Security documentation and controls
- [RISK_REGISTER.md](./RISK_REGISTER.md) — Risk register and assessments
- [CONTINUITY_PLAN.md](./CONTINUITY_PLAN.md) — Business continuity and recovery plan
- Teamtailor Information Security Policy (CEO approved, 2025-01-22)
- Teamtailor Logical Access Instructions (CISO, rev. 2025-08-15)
- Teamtailor Acceptable Use Policy (CISO, rev. 2025-09-23)
