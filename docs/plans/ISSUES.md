# Lomito — Issues & Blockers

Items here need human input before the relevant task can proceed.

## Open

### ISSUE-003: EAS project setup

- **Blocks:** First native build
- **Needed:** Run `eas init` and `eas build:configure` after Expo scaffolding is complete. Requires Expo account.
- **Status:** OPEN

### ISSUE-004: Edge Function secrets deployment

- **Blocks:** Payments (Mercado Pago), analytics (GA4), email notifications (Resend)
- **Needed:** Set secrets via `supabase secrets set` for: `SUPABASE_SERVICE_ROLE_KEY`, `MERCADO_PAGO_ACCESS_TOKEN`, `MERCADO_PAGO_WEBHOOK_SECRET`, `GA4_MEASUREMENT_ID`, `GA4_API_SECRET`, `RESEND_API_KEY`
- **Status:** OPEN

## Resolved

### ISSUE-001: Supabase project credentials

- **Blocks:** P1-T4 (schema), P1-T6 (auth)
- **Needed:** Create Supabase project at supabase.com. Provide `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env`.
- **Status:** RESOLVED — Credentials configured in `.env`

### ISSUE-002: Mapbox access token

- **Blocks:** P1-T7 (map)
- **Needed:** Create Mapbox account. Provide `MAPBOX_ACCESS_TOKEN` in `.env`.
- **Status:** RESOLVED — Token configured in `.env`
