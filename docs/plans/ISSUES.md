# Lomito — Issues & Blockers

Items here need human input before the relevant task can proceed.

## Open

### ISSUE-003: EAS project setup

- **Blocks:** First native build
- **Needed:** Run `eas init` and `eas build:configure` after Expo scaffolding is complete. Requires Expo account.
- **Status:** OPEN

### ISSUE-004: Edge Function secrets deployment

- **Blocks:** Payments (Mercado Pago), email notifications (Resend inbound)
- **Secrets Status:**
  - RESEND_API_KEY: SET
  - GA4_MEASUREMENT_ID: SET
  - GA4_API_SECRET: SET
  - POSTHOG_API_KEY: SET (as Supabase secret)
  - MERCADO_PAGO_ACCESS_TOKEN: PENDING (need Mercado Pago account)
  - MERCADO_PAGO_WEBHOOK_SECRET: PENDING (need Mercado Pago account)
  - INBOUND_EMAIL_WEBHOOK_SECRET: PENDING (need Resend inbound webhook config)
- **Edge Functions Deployed (10/10):**
  - send-notification
  - track-event
  - escalate-case
  - auto-escalation-check
  - jurisdiction-boundaries
  - create-donation
  - donation-webhook
  - inbound-email
  - delete-account
  - (shared module: `_shared`)
- **Database Migrations:** All migrations pushed to production (latest: `20260424170000_security_hardening.sql`)
- **Status:** PARTIALLY RESOLVED

### ISSUE-005: MFA rollout policy

- **Blocks:** Forced/optional MFA enrollment for elevated roles
- **Needed:** Product decision on enrollment policy:
  - Who is required to enroll (admin only? government + moderator? all elevated roles?)
  - Grace period for existing accounts
  - Recovery flow (backup codes vs. support-mediated reset)
  - UX entry point (forced on first login post-rollout, vs. settings page only)
- **Status:** OPEN — needs product input before implementation

### ISSUE-006: PII access audit log

- **Blocks:** Compliance traceability for moderator/government PII reads
- **Needed:** Product + legal decision on audit scope:
  - Which events log a row (every reporter PII read? only flagged actions like rejection/escalation?)
  - Retention period
  - Who can read the audit log (admin only? jurisdiction-scoped?)
  - Whether to surface "viewed by X" to the reporter
- **Status:** OPEN — needs product input before schema design

### ISSUE-007: Realtime channel auth-aware publishing

- **Blocks:** RLS-equivalent enforcement on Realtime fan-out
- **Needed:** Architectural rewrite of how Supabase Realtime publishes case updates so that subscribers only receive payloads they're authorized to see (mirroring RLS at the channel layer). Currently RLS guards the table read, but Realtime broadcasts can leak fields to clients without the same scoping.
- **Status:** OPEN — own feature branch; touches publisher and all subscribers

### ISSUE-008: Expo SDK 55+ upgrade (when stable)

- **Blocks:** Closing the remaining 15 transitive npm vulnerabilities
- **Current state (2026-04-24):** We're already on Expo SDK 54 (`expo: ~54.0.33`). The audit dropped from 32 → 15 on branch `chore/audit-fix-non-breaking` via:
  - `npm audit fix` (non-breaking patches; closed 12 transitive vulns)
  - Removed deprecated `@types/mapbox-gl` (mapbox-gl 3.x ships its own bundled types). This permanently fixes the `tsc` boundary issue cited in `3a33804`.
  - Bumped `@typescript-eslint` v6 → v8 (closed 5 high-severity vulns)
- **Remaining 15 vulns are all inside the Expo SDK 54 internal tree:** `expo`, `@expo/cli`, `@expo/config`, `@expo/config-plugins`, `@expo/metro-config`, `@expo/prebuild-config`, `expo-asset`, `expo-constants`, `expo-linking`, `expo-notifications`, `expo-router`, plus shared transitives `xcode`, `uuid`, `postcss`, `minimatch`. These will not close without an Expo SDK 55+ stable release upstream.
- **Needed:** Wait for Expo SDK 55 stable, then upgrade on a feature branch with native testing on iOS, Android, and web. Verify Expo Router, Reanimated, Mapbox bridge, and EAS build all still work post-upgrade.
- **Status:** OPEN — gated on upstream Expo release; non-actionable until then

## Resolved

### ISSUE-001: Supabase project credentials

- **Blocks:** P1-T4 (schema), P1-T6 (auth)
- **Needed:** Create Supabase project at supabase.com. Provide `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env`.
- **Status:** RESOLVED — Credentials configured in `.env`

### ISSUE-002: Mapbox access token

- **Blocks:** P1-T7 (map)
- **Needed:** Create Mapbox account. Provide `MAPBOX_ACCESS_TOKEN` in `.env`.
- **Status:** RESOLVED — Token configured in `.env`

### ISSUE-009: Security hardening pass (2026-04-24)

- **Scope shipped across commits `3bc23ec` → `3a33804`:**
  - Atomic `reject_case` RPC and service-role transition guard bypass
  - Reject-reason validation, atomic RPC wiring, i18n hardening, locale-aware dates
  - DB hardening: `search_path` lockdown, `WITH CHECK` clauses, `actor_id` guard
  - Edge functions: CORS allowlist, webhook fail-closed posture, idempotency keys on `donation-webhook` and `inbound-email`
  - Auth hardening, Content-Security-Policy header, GitHub Actions pinned to commit SHAs
- **Verified in production (post-deploy):**
  - `supabase migration list --linked` → all 38 rows show Local == Remote
  - CSP header live on `https://lomito.org` (verified via response-header inspection)
  - Pre-commit triple (`format:check`, `lint`, `tsc --noEmit`) clean on `main`
  - CI green on `3a33804`
- **Caveat (defense-in-depth only):** Supabase edge-function gateway strips/overrides app-layer Origin allowlist responses and adds `access-control-allow-origin: *`. Real CSRF defenses (JWT verification, donor-ID/JWT binding, rate limits, amount ceilings) are in place and load-bearing; the Origin allowlist is non-load-bearing. File a Supabase support ticket if true origin enforcement is required.
- **Status:** RESOLVED
