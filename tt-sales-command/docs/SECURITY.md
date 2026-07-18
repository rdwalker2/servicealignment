# Sales Command Center — Security Documentation

## System Overview

| Field | Value |
|-------|-------|
| **System Name** | Sales Command Center (SCC) |
| **System Owner** | Ryan Walker |
| **Department** | Sales (US SDR Team) |
| **Users** | 4 (1 admin + 3 reps) |
| **Data Classification** | Internal (signals), Confidential (customer universe) |
| **Hosting** | Supabase (AWS us-east) |
| **Last Security Review** | 2026-06-11 |

## Architecture

```
Clay (signal enrichment) → Supabase (PostgreSQL + Auth) → React SPA → Salesloft API → Salesforce
```

- **Frontend**: React + Vite (TypeScript)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth (magic link / SSO)
- **API Proxy**: Vite dev server proxy injects Salesloft auth header server-side

## Authentication & Access Control

- **Method**: Supabase Auth with magic link (passwordless, per TT SSO policy)
- **Email Whitelist**: Only 4 authorized emails can log in
- **Session Expiry**: 24-hour maximum session lifetime
- **Impersonation**: Admin can impersonate reps (all impersonation events are audit-logged)
- **Deprovisioning**: Remove email from whitelist in `AuthContext.tsx`; disable user in Supabase Dashboard

### Access Matrix

| User | Role | Signal Board | Customer Universe | Clay Setup | Impersonation |
|------|------|-------------|-------------------|------------|---------------|
| Ryan Walker | Admin | ✅ All signals | ✅ Read-only | ✅ | ✅ |
| Jack Luther | Rep | ✅ Assigned only | ✅ Read-only | ❌ | ❌ |
| Moe Aqel | Rep | ✅ Assigned only | ✅ Read-only | ❌ | ❌ |
| Tyler Hanson | Rep | ✅ Assigned only | ✅ Read-only | ❌ | ❌ |

## Data Handling

### Signal Board Data (Classification: Internal)
- **Source**: Clay enrichment via webhook → Supabase
- **Contents**: US business contact data (name, email, title, company, phone)
- **No EU data subjects** — Clay is configured for US-only signals
- **Retention**: 90-day auto-purge via `retention_expires_at` column
- **RLS**: Enabled on `clay_signals`, `dispositions`, `push_events`, `account_notes`

### Customer Universe Data (Classification: Confidential)
- **Source**: Teamtailor CRM export → Supabase
- **Contents**: Account metadata (name, website, segment, NPS, billing country)
- **No financial data** (no ARR, contract values)
- **RLS**: Enabled on `customers` table — authenticated users only
- **Read-only**: No mutations from the app

## Audit Logging

All security-relevant actions are logged to the `audit_log` table:

| Action | When |
|--------|------|
| `login` | User logs in (email, auth method) |
| `logout` | User logs out |
| `view_signals` | Signal Board page loaded |
| `push_to_cadence` | Contact/account pushed to Salesloft cadence |
| `change_disposition` | Account disposition changed |
| `impersonate_start` | Admin starts impersonating a rep |
| `impersonate_stop` | Admin stops impersonation |
| `open_clay_setup` | Admin opens Clay configuration panel |
| `add_note` | Note added to an account |

## Incident Response

Report security incidents via the **Report incident/strange thing** workflow in the `#stranger-things` Slack channel (per AUP §9).

## API Key Management

| Key | Storage | Exposure |
|-----|---------|----------|
| Supabase URL | `.env` (VITE_ prefix, client-side) | Designed to be public |
| Supabase Anon Key | `.env` (VITE_ prefix, client-side) | Designed to be public — RLS enforces access |
| Salesloft API Key | `.env` (no VITE_ prefix) | Server-side only — injected via Vite proxy |

All secrets are excluded from git via `.gitignore`.

## Continuity

| Metric | Value |
|--------|-------|
| **RPO** | 24 hours (Supabase daily backups) |
| **RTO** | 1 hour (redeploy from Git) |
| **Fallback** | SDR team uses Salesloft directly |
| **Backups** | Supabase automated daily, 10-day retention |

## Data Retention

| Data Set | Classification | Retention Period | Mechanism | Source of Truth |
|----------|---------------|-----------------|-----------|----------------|
| Clay Signal Data | Internal | 90 days | Auto-purge via `retention_expires_at` column | Clay platform |
| Customer Universe | Confidential | Refreshed quarterly | Manual CRM export overwrite | Teamtailor CRM / Salesforce |
| Dispositions | Internal | Indefinite (while account active) | Reviewed during semi-annual access review | SCC (Supabase) |
| Push Events | Internal | 90 days | Aligned with signal retention | SCC (Supabase) |
| Account Notes | Internal | Indefinite (while account active) | Reviewed during semi-annual access review | SCC (Supabase) |
| Audit Logs | Internal | 1 year | Annual review and pruning | SCC (Supabase) |

Per the **Acceptable Use Policy §Information Handling 7f**, data is "kept in a form which makes it possible to identify individuals from it for no longer than is necessary." The 90-day auto-purge on signal data enforces this requirement. All retention periods are documented and verifiable.

## Incident Response

### Reporting

Per the **Teamtailor Acceptable Use Policy §9**, all potential security incidents must be reported via the **"Report incident/strange thing"** workflow in the `#stranger-things` Slack channel.

### Severity Classification

| Severity | Definition | Response Time | Escalation |
|----------|-----------|---------------|------------|
| **P1 — Critical** | Confirmed data breach, complete service outage, or unauthorized data access | Immediate | CISO (Johan Tempelman) + Management |
| **P2 — High** | Major feature degradation, suspected security event, or failed authentication anomaly | Within 1 hour | CISO notification |
| **P3 — Medium** | Minor feature issue, Clay webhook delay, or non-urgent security concern | Within 4 hours | System Owner review |
| **P4 — Low** | Cosmetic issue or improvement opportunity | Next business day | — |

### Response Workflow

1. **Detect** — Monitoring alert, user report, or automated check
2. **Triage** — Classify severity (P1–P4), assess scope and blast radius
3. **Contain** — Isolate affected component; activate fallback (Salesloft direct mode) if needed
4. **Communicate** — Notify affected users and stakeholders per communication plan
5. **Remediate** — Execute recovery procedure per [Continuity Plan](./CONTINUITY_PLAN.md) §4
6. **Verify** — Confirm service restoration and data integrity
7. **Post-Mortem** — Document root cause, timeline, and prevention measures

### Incident Response Contacts

| Role | Name | Contact |
|------|------|---------|
| System Owner / First Responder | Ryan Walker | Slack DM |
| CISO | Johan Tempelman | `#stranger-things` channel |
| SDR Reps | Jack Luther, Moe Aqel, Tyler Hanson | Slack DM |

## Vulnerability Management

- `npm audit` run before each deployment
- GitHub Actions CI checks on every PR
- No known vulnerabilities in dependencies (last check: 2026-06-11)
- Vulnerability severity classification follows the **Teamtailor Vulnerability Management Instructions**: Critical (15-day fix), High (45-day fix), Medium (120-day fix), Low (as-available)

## Compliance Cross-Reference

| Teamtailor Policy | Key Requirement | SCC Control | Status |
|-------------------|----------------|-------------|--------|
| **Acceptable Use Policy §6** | API keys treated as secrets | Salesloft key server-side only; excluded from Git | ✅ |
| **Acceptable Use Policy §4** | Data stored only in approved services | Supabase vendor approval pending | 🟡 |
| **Acceptable Use Policy §8** | MFA when available | Supabase Auth supports TOTP MFA — planned | 🟡 |
| **Acceptable Use Policy §9** | Incident reporting via `#stranger-things` | Documented in Incident Response section | ✅ |
| **Information Security Policy** | Systems explicitly listed and documented | System Register entry prepared | 🟡 |
| **Information Security Policy** | Risk-based approach | Risk Register completed — 10 risks assessed | ✅ |
| **Logical Access Instructions** | Unique logins, least privilege, RBAC | Supabase Auth + email whitelist + RLS | ✅ |
| **Logical Access Instructions** | Account deactivation on termination | Whitelist removal + Supabase disable | ✅ |
| **Logical Access Instructions** | Access reviews every 6 months | Scheduled for 2026-12-11 | 🟡 |
| **Risk Management Instruction** | Annual risk assessment + risk register | Risk Register completed (2026-06-11) | ✅ |
| **IT Continuity Plan** | RPO/RTO defined, backup strategy | RPO 24h / RTO 1h documented | ✅ |
| **IT Continuity Plan** | Backup restore tests every 6 months | Scheduled for 2026-12-11 | 🟡 |
| **Vulnerability Management** | Dependency scanning on PR | GitHub Actions CI + `npm audit` | ✅ |
| **AI Dos & Don'ts** | AI tool vendor approval before use | Vendor approval pending | 🟡 |

## Related Governance Documents

| Document | Path | Description |
|----------|------|-------------|
| **Risk Register** | [RISK_REGISTER.md](./RISK_REGISTER.md) | 10 identified risks assessed per Teamtailor Risk Management Instruction |
| **Business Continuity Plan** | [CONTINUITY_PLAN.md](./CONTINUITY_PLAN.md) | Recovery procedures, RPO/RTO, dependency analysis, communication plan |
| **System Register Entry** | [SYSTEM_REGISTER.md](./SYSTEM_REGISTER.md) | System metadata for Notion System Register submission |

---

## Revision History

| Date | Updated By | Summary |
|------|-----------|---------|
| 2026-06-11 | Ryan Walker | Initial security documentation |
| 2026-06-11 | Ryan Walker | Added data retention, expanded incident response, compliance cross-reference, governance document links |
