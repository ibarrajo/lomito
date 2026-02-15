# Lomito Infrastructure

## Architecture Overview

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Browser    │────▶│  Vercel (Web)    │     │  App Store  │
│  lomito.org  │     │  Static Export   │     │  (iOS/And)  │
└──────┬───────┘     └──────────────────┘     └──────┬──────┘
       │                                             │
       └──────────────┬──────────────────────────────┘
                      ▼
              ┌───────────────┐
              │   Supabase    │
              │  PostgreSQL   │
              │  + PostGIS    │
              │  Auth / RLS   │
              │  Edge Fns     │
              │  Storage      │
              └───────┬───────┘
                      │
           ┌──────────┼──────────┐
           ▼          ▼          ▼
       ┌───────┐  ┌───────┐  ┌───────┐
       │  GA4  │  │  FCM  │  │Resend │
       │(proxy)│  │(push) │  │(email)│
       └───────┘  └───────┘  └───────┘
```

## Services

### Web — Vercel

- **Type:** Static export (Expo web → `npx expo export --platform web`)
- **Deploy:** Auto-deploy from `main` branch
- **Config:** `apps/mobile/vercel.json`
- **Routing:** SPA rewrite — all paths → `/index.html` (Expo Router handles client-side routing)
- **DNS:** `lomito.org` → Vercel

### Backend — Supabase

- **Database:** PostgreSQL with PostGIS extension for geospatial queries
- **Auth:** Email magic links, SMS OTP (Supabase Auth)
- **Storage:** Case photos with signed URLs
- **Edge Functions:** Analytics proxy, donation processing, email escalation, notifications
- **Realtime:** Case timeline subscriptions

### Analytics — GA4 via Edge Function

- **Measurement ID:** `G-4996ET6VLS`
- **Flow:** Client → `POST /functions/v1/track-event` → Edge Function → GA4 Measurement Protocol
- **Why proxy:** Swappable analytics provider, avoids ad blockers, server-side validation

### Notifications

- **Push:** Firebase Cloud Messaging (FCM) for iOS and Android
- **Email:** Resend for transactional emails (escalation notifications, magic links)

### Payments — Mercado Pago

- **Status:** Feature-flagged off (`donations` flag)
- **Methods:** OXXO (cash), SPEI (bank transfer), credit/debit card
- **International:** Stripe (future)

### CI/CD — GitHub Actions

- **Pipeline:** Push to `main` → lint + typecheck → Vercel auto-deploy
- **Checks:** `npx tsc --noEmit` and `npm run lint`

## Environment Variables

### Client-side (Expo — `apps/mobile/.env`)

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (public) |
| `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` | Mapbox public token |
| `EXPO_PUBLIC_PROJECT_ID` | Expo project ID (push notifications) |
| `EXPO_PUBLIC_MERCADO_PAGO_PUBLIC_KEY` | Mercado Pago public key |

### Supabase Edge Functions (Secrets)

| Variable | Description |
|----------|-------------|
| `GA4_MEASUREMENT_ID` | Google Analytics 4 measurement ID |
| `GA4_API_SECRET` | GA4 Measurement Protocol API secret |
| `RESEND_API_KEY` | Resend email service API key |
| `MERCADO_PAGO_ACCESS_TOKEN` | Mercado Pago server-side token |

### Vercel (Build Environment)

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Same as client .env — injected at build time |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Same as client .env — injected at build time |
| `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` | Same as client .env — injected at build time |

## Setup from Scratch

### 1. Clone and install

```bash
git clone https://github.com/ibarrajo/lomito.git
cd lomito
npm install
```

### 2. Supabase

```bash
npx supabase start          # Local development
npx supabase db reset        # Apply migrations + seed data
```

For production, create a Supabase project at [supabase.com](https://supabase.com) and set Edge Function secrets:

```bash
supabase secrets set GA4_MEASUREMENT_ID=G-4996ET6VLS
supabase secrets set GA4_API_SECRET=<your-api-secret>
supabase secrets set RESEND_API_KEY=<your-resend-key>
```

### 3. Environment file

```bash
cp apps/mobile/.env.example apps/mobile/.env
# Fill in your API keys
```

### 4. Run locally

```bash
npm run dev        # Native (Expo Go)
npm run dev:web    # Web (localhost:8081)
```

### 5. Deploy

- **Web:** Push to `main` — Vercel auto-deploys
- **Native:** `eas build --platform all` (requires EAS CLI)
- **Edge Functions:** `supabase functions deploy track-event`
