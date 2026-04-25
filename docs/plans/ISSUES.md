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

### ISSUE-007: Realtime row-data exposure on case-detail subscriptions

- **Blocks:** Closing the residual Realtime leak on `case_timeline` and `cases` per-case subscriptions
- **Audit findings (2026-04-24):** The cases SELECT RLS policy is intentionally permissive (`auth.uid() IS NOT NULL`) to support the public reports ticker on lomito.org and the product's transparency mission, so tightening RLS would break public read paths (`recent-reports-ticker.tsx`, `use-government-cases.ts`, `use-subscribed-cases.ts`). Realtime postgres_changes broadcasts therefore deliver full row payloads to every authenticated subscriber.
- **Already fixed (commit `a0e5070`):** The dashboard's `cases-realtime` postgres_changes subscription was the worst offender — it broadcast every case row to every subscriber for a callback that discarded the payload. Replaced with a Supabase Broadcast channel (`cases:public`) backed by trigger `notify_cases_changed_trg` (migration `20260425005402_realtime_broadcast_cases_changed.sql`), carrying only a timestamp.
- **Residual scope:** The per-case subscriptions in `apps/mobile/hooks/use-case.ts` still use postgres_changes:
  - `case_timeline:${caseId}` — applies `payload.new` (the full timeline row including JSONB `details`) directly to state. Server-side filter is `case_id=eq.${caseId}` but a malicious client can subscribe with a different filter and receive other timelines because RLS allows it.
  - `case_status:${caseId}` — already field-gated in the callback (only `status`, `urgency`, `flag_count`, `folio`, `escalated_at`, `marked_unresponsive`, `government_response_at`, `incident_at`, `updated_at`), but the underlying broadcast still carries the full row.
- **Needed:** Either (a) similar broadcast triggers that publish only safe fields and have the client re-fetch via `get_case_by_id` RPC, or (b) move PII columns (reporter_id, raw description) to a separate restricted table so the cases broadcast naturally carries only public fields. Option (b) is the cleaner long-term design but requires schema migration + audit of every reader.
- **Status:** OPEN — narrowed scope after the dashboard fix; remaining work needs product input on the field-level visibility model

### ISSUE-008: Expo SDK 55+ upgrade (when stable)

- **Blocks:** Closing the remaining 15 transitive npm vulnerabilities
- **Current state (2026-04-24):** We're already on Expo SDK 54 (`expo: ~54.0.33`). The audit dropped from 32 → 15 on branch `chore/audit-fix-non-breaking` via:
  - `npm audit fix` (non-breaking patches; closed 12 transitive vulns)
  - Removed deprecated `@types/mapbox-gl` (mapbox-gl 3.x ships its own bundled types). This permanently fixes the `tsc` boundary issue cited in `3a33804`.
  - Bumped `@typescript-eslint` v6 → v8 (closed 5 high-severity vulns)
- **Remaining 15 vulns are all inside the Expo SDK 54 internal tree:** `expo`, `@expo/cli`, `@expo/config`, `@expo/config-plugins`, `@expo/metro-config`, `@expo/prebuild-config`, `expo-asset`, `expo-constants`, `expo-linking`, `expo-notifications`, `expo-router`, plus shared transitives `xcode`, `uuid`, `postcss`, `minimatch`. These will not close without an Expo SDK 55+ stable release upstream.
- **Needed:** Wait for Expo SDK 55 stable, then upgrade on a feature branch with native testing on iOS, Android, and web. Verify Expo Router, Reanimated, Mapbox bridge, and EAS build all still work post-upgrade.
- **Status:** OPEN — gated on upstream Expo release; non-actionable until then

### ISSUE-011: Web bundle 15× over CLAUDE.md target (1.7 MB mapbox eagerly loaded)

- **Blocks:** Hitting CLAUDE.md performance budget (web bundle < 500 KB initial; currently ~7.83 MB / 7.47 MB after gzip-equivalent measurement)
- **Source-map analysis (commit pending):** Top contributors to the 7.5 MB main bundle:
  - `mapbox-gl` — **1.72 MB (22.5%)** — eagerly imported by `landing-map.web.tsx`, `map-view.web.tsx`, `location-picker.web.tsx`, `lib/mapbox.web.ts`. Used only on map-displaying screens.
  - `lucide-react-native` — **549 KB (7.2%)** — though every site uses named imports (`import { Mail } from 'lucide-react-native'`), the package's ESM shape doesn't tree-shake under Metro. The whole icon library lands in the bundle.
  - `[unmapped]` — 694 KB (9.1%) — Metro runtime, polyfills, internal helpers.
  - `react-dom` — 164 KB (2.1%).
  - `react-native-reanimated` — ~150 KB across many files.
- **Needed:**
  1. Lazy-import `mapbox-gl` via `React.lazy` / dynamic import inside the map components, gated on the route. Estimated saving: 1.5–1.7 MB (single biggest win).
  2. Investigate per-icon imports for `lucide-react-native` (e.g., the `lucide-react-native/icons/*` deep-import path), or switch to a different icon library that tree-shakes properly. Estimated saving: 400–500 KB.
  3. Audit `react-native-reanimated` for unused animation modules.
  4. After above, set a stricter bundle ceiling (start at 4 MB, target 1 MB).
- **Mitigations shipped:**
  - `scripts/check-bundle-size.sh` (`npm run bundle:check`) verifies the bundle stays under 8 MB so future regressions are caught locally pre-deploy. Override via `BUNDLE_LIMIT_BYTES` env var. Not yet wired into CI (would need env-var secrets configured for the production-like web build).
- **Status:** OPEN — meaningful refactor; each item is a separate PR

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

### ISSUE-010: Silent error swallows in moderation/government catch blocks

- **Audit (2026-04-25):** Six catch blocks across `folio-input.tsx`, `official-response.tsx`, and `review-actions.tsx` (verify, reject, flag, reopen) caught the error, displayed a localized modal to the user, and dropped the error on the floor. Production failures left no signal in console/telemetry. Audit also confirmed no Sentry/logger utility exists; project convention is `console.error` (74 existing usages elsewhere in `apps/mobile`).
- **Fix:** Added `console.error('<context>:', err)` to all six sites before the modal is shown, matching the existing convention. Renamed catch bindings back from `_err`/`_error` to `err`/`error` since they are now used.
- **Status:** RESOLVED
