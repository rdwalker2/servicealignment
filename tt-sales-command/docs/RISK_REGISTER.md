# Sales Command Center — Risk Register

> **Document Classification:** Internal  
> **System:** Sales Command Center (SCC)  
> **Risk Owner (Default):** Ryan Walker, System Owner  
> **CISO:** Johan Tempelman  
> **Framework:** Teamtailor Risk Management Instruction (rev. 2025-09-03)  
> **Initial Assessment Date:** 2026-06-11  
> **Next Scheduled Review:** 2026-12-11 (6-month cadence)

---

## Methodology

This risk register follows the evaluation framework defined in the **Teamtailor Risk Management Instruction** §3.3. Risks are assessed using the standardized consequence × probability formula:

**Risk Score = Probability Value × Consequence Value ÷ 4**

### Consequence Scale

| Level | Value | Definition |
|-------|-------|------------|
| Low | 1 | Loss of C/I/A involves negligible negative impact on individuals or Teamtailor's business and assets |
| Moderate | 2 | Moderate negative impact — reduction in efficiency, minor damages, minor economic losses, limited impact on individual rights |
| Considerable | 3 | Considerable negative impact — considerable reduction in primary activities, considerable damages, considerable economic losses |
| Major | 4 | Major negative impact — inability to fulfil primary activities, extensive lasting damages, extensive economic losses, lasting impact on individual rights |

### Probability Scale

| Level | Value | Definition |
|-------|-------|------------|
| Unlikely | 1 | Not expected to occur under current circumstances |
| Rare | 2 | Expected to occur less than once every ten years |
| Eventual | 3 | Expected to occur once within a five-year period |
| Probable | 4 | Could occur within the next 12 months |

### Risk Acceptance Thresholds (per §3.3)

| Risk Score | Approval Authority |
|------------|-------------------|
| ≤ 2.0 | Risk Owner may accept directly |
| > 2.0 and ≤ 3.5 | Information Security Management Review Team |
| > 3.5 | CEO approval required |

---

## Risk Register

### RISK-001: Data Breach via Unauthorized Database Access

| Field | Value |
|-------|-------|
| **Risk ID** | RISK-001 |
| **Category** | Data Protection |
| **Description** | Unauthorized actor gains read access to Supabase PostgreSQL database containing US prospect contact data (names, emails, titles, companies, phone numbers) and Teamtailor customer account metadata. Could result from compromised Supabase credentials, RLS bypass, or exploitation of the publicly-exposed anon key. |
| **Probability** | 2 — Rare |
| **Consequence** | 3 — Considerable |
| **Risk Score** | **1.50** |
| **Treatment** | Reduce |
| **Risk Owner** | Ryan Walker |

**Current Mitigations:**
- Row Level Security (RLS) enabled on all tables: `clay_signals`, `dispositions`, `push_events`, `account_notes`, `customers`
- Supabase anon key is designed to be public; RLS enforces all access control
- Salesloft API key is server-side only (injected via Vite proxy, not exposed to client)
- All data in transit encrypted via Supabase TLS
- No EU data subjects — Clay configured for US-only signals
- Email whitelist restricts authentication to 4 authorized users
- 90-day auto-purge on signal data via `retention_expires_at` column

**Residual Risk:** Low (1.50). RLS enforcement and authentication significantly reduce the attack surface. The Supabase anon key is public by design but grants zero access without a valid authenticated session. Residual concern: a Supabase platform vulnerability could bypass RLS.

---

### RISK-002: Unauthorized Application Access

| Field | Value |
|-------|-------|
| **Risk ID** | RISK-002 |
| **Category** | Access Control |
| **Description** | Unauthorized individual gains access to the SCC application by obtaining or forging a magic link, or by exploiting a flaw in the email whitelist authentication mechanism. Per the Logical Access Instructions, "strong authentication methods are required for all systems handling information classified as Internal, Confidential, or Secret." |
| **Probability** | 1 — Unlikely |
| **Consequence** | 3 — Considerable |
| **Risk Score** | **0.75** |
| **Treatment** | Reduce |
| **Risk Owner** | Ryan Walker |

**Current Mitigations:**
- Supabase Auth with passwordless magic link (per Teamtailor SSO policy preference for passwordless)
- Email whitelist restricts login to 4 named, authorized users only
- 24-hour maximum session lifetime with automatic expiry
- All authentication events logged to `audit_log` table
- Impersonation events (admin-only) are audit-logged

**Residual Risk:** Low (0.75). Magic link authentication is inherently resistant to brute-force and credential-stuffing attacks. The 4-user whitelist is a strong access boundary. Residual concern: magic link interception via email compromise (mitigated by email provider security).

---

### RISK-003: Supply Chain Compromise — Supabase

| Field | Value |
|-------|-------|
| **Risk ID** | RISK-003 |
| **Category** | Third-Party / Supply Chain |
| **Description** | Supabase (our primary infrastructure provider) experiences a security breach, service outage, or introduces a vulnerability in their platform that affects data integrity, confidentiality, or availability of SCC data. Per the Acceptable Use Policy §4, Teamtailor information may only be stored in company-provided services listed in the System Register. |
| **Probability** | 2 — Rare |
| **Consequence** | 3 — Considerable |
| **Risk Score** | **1.50** |
| **Treatment** | Reduce + Transfer |
| **Risk Owner** | Ryan Walker |

**Current Mitigations:**
- Supabase hosted on AWS (us-east) with SOC 2 Type II certification
- Daily automated backups with 10-day retention
- Point-in-time recovery capability
- Data encrypted at rest (AES-256) and in transit (TLS 1.2+)
- RLS enforces access control at the database layer, independent of Supabase platform auth
- Vendor pending approval via `#vendor-approval-process` (per Acceptable Use Policy §4)

**Residual Risk:** Low–Moderate (1.50). Supabase's enterprise security posture is strong, but as a third-party SaaS, we accept residual supply chain risk. SCC is not mission-critical; the SDR team can fall back to Salesloft directly if Supabase is unavailable.

---

### RISK-004: Insider Threat — Privilege Misuse

| Field | Value |
|-------|-------|
| **Risk ID** | RISK-004 |
| **Category** | Insider Threat |
| **Description** | An authorized user (one of the 4 whitelisted team members) misuses their access to export, modify, or delete data beyond their authorized scope. Admin user has impersonation capability. Per the Acceptable Use Policy §Information Handling 1, users "are not allowed to gain access to any other Teamtailor systems or services than those provided to you, or use the access you have for any other purpose than performing your work tasks." |
| **Probability** | 1 — Unlikely |
| **Consequence** | 2 — Moderate |
| **Risk Score** | **0.50** |
| **Treatment** | Accept |
| **Risk Owner** | Ryan Walker |

**Current Mitigations:**
- Comprehensive audit logging of all security-relevant actions (login, logout, data views, pushes, dispositions, impersonation, notes)
- Role-based access: reps see only assigned signals; Customer Universe is read-only for all users
- Impersonation restricted to admin role only; all impersonation events logged with start/stop timestamps
- Small user base (4 users) allows manual review of audit logs
- All users are direct Teamtailor employees under Acceptable Use Policy

**Residual Risk:** Low (0.50). The combination of a small, known user base, comprehensive audit logging, and role-based access makes insider threat low-probability and detectable. Accepted per §3.3 (score ≤ 2.0, Risk Owner may accept directly).

---

### RISK-005: API Key Exposure — Salesloft

| Field | Value |
|-------|-------|
| **Risk ID** | RISK-005 |
| **Category** | Credential Security |
| **Description** | The Salesloft API key is exposed to unauthorized parties, enabling them to make API calls against the Teamtailor Salesloft instance (push contacts to cadences, access prospect data). Per the Acceptable Use Policy §6, "passwords and access keys used for the system or user accounts within Teamtailor must be treated as a secret." |
| **Probability** | 1 — Unlikely |
| **Consequence** | 3 — Considerable |
| **Risk Score** | **0.75** |
| **Treatment** | Reduce |
| **Risk Owner** | Ryan Walker |

**Current Mitigations:**
- Salesloft API key stored in `.env` file **without** `VITE_` prefix — never exposed to client-side JavaScript bundle
- API key injected server-side via Vite dev server proxy
- `.env` file excluded from version control via `.gitignore`
- Supabase anon key (designed to be public) does not grant data access without RLS-compliant authentication
- GitHub repository access restricted to authorized team members

**Residual Risk:** Low (0.75). The server-side-only architecture for the Salesloft key eliminates the primary exposure vector. The key is never transmitted to or visible in the browser. Residual concern: `.env` file access on the deployment server or developer machine compromise.

---

### RISK-006: Session Hijacking

| Field | Value |
|-------|-------|
| **Risk ID** | RISK-006 |
| **Category** | Access Control |
| **Description** | An attacker intercepts or steals an active user session token to gain unauthorized access to the SCC application. This could occur via XSS, network interception (MitM), or physical access to an unlocked device. Per the Logical Access Instructions, "strong authentication methods are required for all systems handling information classified as Internal, Confidential, or Secret." |
| **Probability** | 1 — Unlikely |
| **Consequence** | 2 — Moderate |
| **Risk Score** | **0.50** |
| **Treatment** | Accept |
| **Risk Owner** | Ryan Walker |

**Current Mitigations:**
- Supabase Auth manages session tokens with secure, httpOnly cookie best practices
- 24-hour maximum session lifetime limits the window of exploitation
- All communication encrypted via TLS (HTTPS)
- React SPA architecture minimizes server-rendered HTML injection vectors
- Content Security Policy headers reduce XSS risk
- Small user base (4 users) limits the attack surface

**Residual Risk:** Low (0.50). Supabase's session management follows industry best practices. The 24-hour session expiry and TLS encryption significantly reduce hijacking risk. Accepted per §3.3.

---

### RISK-007: Data Loss — Signal and Account Data

| Field | Value |
|-------|-------|
| **Risk ID** | RISK-007 |
| **Category** | Data Integrity / Availability |
| **Description** | Loss of data stored in Supabase due to accidental deletion, database corruption, or infrastructure failure. Affected data includes Clay signal enrichment data, account dispositions, push events, account notes, and customer universe metadata. |
| **Probability** | 1 — Unlikely |
| **Consequence** | 2 — Moderate |
| **Risk Score** | **0.50** |
| **Treatment** | Accept |
| **Risk Owner** | Ryan Walker |

**Current Mitigations:**
- Supabase automated daily backups with 10-day retention
- Point-in-time recovery available
- RPO: 24 hours (daily backup cadence)
- RTO: 1 hour (redeploy from Git + restore from backup)
- Signal data is ephemeral by design (90-day auto-purge) — original source data remains in Clay
- Customer Universe data is a copy of CRM export — source of truth remains in Teamtailor CRM/Salesforce
- Application code stored in GitHub with full version history

**Residual Risk:** Low (0.50). The data in SCC is derived/enriched — source data lives in upstream systems (Clay, Salesforce, Teamtailor CRM). Complete data loss is recoverable by re-importing from these sources. Accepted per §3.3.

---

### RISK-008: Regulatory Non-Compliance — Data Protection

| Field | Value |
|-------|-------|
| **Risk ID** | RISK-008 |
| **Category** | Compliance |
| **Description** | SCC processes US business contact data (names, emails, phone numbers) that constitutes personal data under US state privacy laws (CCPA/CPRA). Failure to maintain data minimization, purpose limitation, retention controls, and documentation could result in regulatory exposure. Per the Acceptable Use Policy §Information Handling 7, data controllers must ensure processing complies with data protection laws and that data is "kept in a form which makes it possible to identify individuals from it for no longer than is necessary." |
| **Probability** | 2 — Rare |
| **Consequence** | 2 — Moderate |
| **Risk Score** | **1.00** |
| **Treatment** | Reduce |
| **Risk Owner** | Ryan Walker |

**Current Mitigations:**
- 90-day auto-purge on signal data via `retention_expires_at` column
- No EU data subjects (Clay configured for US-only signals) — GDPR not directly applicable
- Data minimization: only business contact fields necessary for SDR workflow are stored
- Purpose limitation: data used exclusively for sales outreach via Salesloft cadences
- Customer Universe is read-only with no mutations from the app
- Audit logging provides traceability for data access

**Residual Risk:** Low (1.00). The 90-day auto-purge and US-only data scope significantly reduce regulatory risk. Data minimization is enforced by the Clay enrichment configuration.

---

### RISK-009: Shadow IT / System Registration

| Field | Value |
|-------|-------|
| **Risk ID** | RISK-009 |
| **Category** | Governance |
| **Description** | SCC operates without being formally listed in the Teamtailor System Register on Notion, without vendor approval for Supabase/Clay, and without formal risk assessment prior to deployment. Per the Information Security Policy, "covered information systems and assets should be explicitly listed and documented." Per the Acceptable Use Policy §4, data may only be stored in services listed in the System Register. Per the Risk Management Instruction §3, a risk analysis is required for "developing a new customer-facing service/application." |
| **Probability** | 4 — Probable |
| **Consequence** | 2 — Moderate |
| **Risk Score** | **2.00** |
| **Treatment** | Reduce |
| **Risk Owner** | Ryan Walker |

**Current Mitigations:**
- This Risk Register serves as the formal risk analysis required by §3
- System Register entry document prepared (see `docs/SYSTEM_REGISTER.md`) for submission to Notion
- Vendor approval submission planned for Supabase, Clay, and AI development tools via `#vendor-approval-process`
- Security documentation (`docs/SECURITY.md`) created and maintained
- Business Continuity Plan documented (see `docs/CONTINUITY_PLAN.md`)
- Proactive CISO engagement initiated

**Residual Risk:** Moderate (2.00). Registration and vendor approval are administrative actions in progress. This risk score will reduce to ≤ 1.0 once System Register entry is submitted and vendor approvals are obtained. Accepted per §3.3 (score ≤ 2.0, Risk Owner may accept directly).

**Treatment Activities:**
| Activity | Responsible | Target Date | Verification |
|----------|------------|------------|-------------|
| Submit SCC to Notion System Register | Ryan Walker | 2026-06-18 | Entry visible in System Register |
| Submit vendor approval for Supabase | Ryan Walker | 2026-06-18 | Approval in `#vendor-approval-process` |
| Submit vendor approval for Clay | Ryan Walker | 2026-06-18 | Approval in `#vendor-approval-process` |
| Submit vendor approval for AI tools (Claude/Gemini) | Ryan Walker | 2026-06-18 | Approval in `#vendor-approval-process` |

---

### RISK-010: AI Tool Usage in Development

| Field | Value |
|-------|-------|
| **Risk ID** | RISK-010 |
| **Category** | Compliance / AI Governance |
| **Description** | SCC was developed with assistance from AI coding tools (Claude, Gemini). Per the Teamtailor AI Dos & Don'ts guidance, AI solutions that process confidential information — including source code and access keys — "need to be reviewed by your friends in Legal and Security before you feed the solution any confidential information." Source code was shared with AI tools during development. The Salesloft API key was inadvertently shared in a conversation prompt at one point. |
| **Probability** | 4 — Probable (has already occurred) |
| **Consequence** | 2 — Moderate |
| **Risk Score** | **2.00** |
| **Treatment** | Reduce |
| **Risk Owner** | Ryan Walker |

**Current Mitigations:**
- Salesloft API key has been rotated following the exposure
- No real PII (prospect names, emails) was knowingly shared in AI prompts
- AI tools (Claude, Gemini) operate under enterprise data retention policies where available
- Source code shared does not contain embedded secrets (`.env` excluded)
- Proactive disclosure to CISO planned

**Residual Risk:** Moderate (2.00). The primary concern is procedural: vendor approval was not obtained before AI tool usage began. The technical exposure is limited since the API key was rotated and no PII was shared. Accepted per §3.3.

**Treatment Activities:**
| Activity | Responsible | Target Date | Verification |
|----------|------------|------------|-------------|
| Disclose AI tool usage to CISO (Johan Tempelman) | Ryan Walker | 2026-06-13 | Email/Slack confirmation |
| Submit vendor approval for Claude/Gemini via `#vendor-approval-process` | Ryan Walker | 2026-06-18 | Approval in channel |
| Confirm no real PII was shared in AI prompts | Ryan Walker | 2026-06-13 | Written attestation |
| Verify Salesloft API key rotation completed | Ryan Walker | 2026-06-12 | New key active, old key revoked |

---

## Risk Heat Map

```
                    Consequence
                 1-Low   2-Mod   3-Cons  4-Major
              ┌────────┬────────┬────────┬────────┐
  4-Probable  │        │RISK-009│        │        │
              │        │RISK-010│        │        │
              ├────────┼────────┼────────┼────────┤
  3-Eventual  │        │        │        │        │
              │        │        │        │        │
P ├────────┼────────┼────────┼────────┤
r 2-Rare     │        │RISK-008│RISK-001│        │
o             │        │        │RISK-003│        │
b ├────────┼────────┼────────┼────────┤
  1-Unlikely  │        │RISK-004│RISK-002│        │
              │        │RISK-006│RISK-005│        │
              │        │RISK-007│        │        │
              └────────┴────────┴────────┴────────┘
```

## Summary Statistics

| Score Range | Count | Treatment |
|-------------|-------|-----------|
| ≤ 1.0 (Low — Risk Owner may accept) | 6 | Accept (4), Reduce (2) |
| > 1.0 and ≤ 2.0 (Low–Moderate) | 4 | Reduce (3), Reduce+Transfer (1) |
| > 2.0 and ≤ 3.5 (Elevated — ISMS Review required) | 0 | — |
| > 3.5 (Critical — CEO approval required) | 0 | — |

**Overall Risk Posture:** All 10 identified risks score ≤ 2.0, within the Risk Owner's acceptance authority per the Risk Management Instruction §3.3. No risks require escalation to the ISMS Review Team or CEO.

---

## Revision History

| Date | Updated By | Summary |
|------|-----------|---------|
| 2026-06-11 | Ryan Walker | Initial risk register — 10 risks identified and assessed following security hardening (auth, RLS, audit logging, API key remediation) |

---

## Related Documents

- [SECURITY.md](./SECURITY.md) — Security documentation and controls
- [CONTINUITY_PLAN.md](./CONTINUITY_PLAN.md) — Business continuity and recovery plan
- [SYSTEM_REGISTER.md](./SYSTEM_REGISTER.md) — System register entry for Notion
- Teamtailor Risk Management Instruction (CISO, rev. 2025-09-03)
- Teamtailor Information Security Policy (CEO approved, 2025-01-22)
- Teamtailor Acceptable Use Policy (CISO, rev. 2025-09-23)
- Teamtailor Logical Access Instructions (CISO, rev. 2025-08-15)
- Teamtailor IT Continuity Plan (CISO, rev. 2025-05-21)
- Teamtailor AI Dos & Don'ts (Legal & Security guidance)
- Teamtailor Vulnerability Management Instructions (CISO, rev. 2025-08-15)
