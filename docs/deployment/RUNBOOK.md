# Lomito Deployment Runbook

Complete step-by-step guide for deploying Lomito from scratch.

## Overview

Lomito is deployed across multiple platforms and services:

- **Mobile Apps**: iOS and Android via Expo Application Services (EAS) to App Store and Google Play
- **Web App**: Static hosting via Expo Web (same codebase)
- **Backend**: Supabase (hosted PostgreSQL + PostGIS + Auth + Storage + Edge Functions)
- **Maps**: Mapbox GL
- **Email**: Resend (transactional email for escalations + inbound email routing)
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Payments**: Mercado Pago (Mexico: OXXO, SPEI) + Stripe (international)
- **Analytics**: PostHog (self-service, public dashboard)

---

## Prerequisites

### Accounts Required

1. **Supabase** — https://supabase.com (free tier available, Pro recommended)
2. **Mapbox** — https://www.mapbox.com (free tier: 50k map loads/month)
3. **Resend** — https://resend.com (free tier: 3k emails/month, 100/day)
4. **Firebase** — https://console.firebase.google.com (free Spark plan)
5. **Mercado Pago** — https://www.mercadopago.com.mx (Mexico business account)
6. **Stripe** — https://stripe.com (optional, for international donations)
7. **Apple Developer Account** — https://developer.apple.com ($99/year)
8. **Google Play Console** — https://play.google.com/console ($25 one-time)
9. **Expo Application Services (EAS)** — https://expo.dev (free tier limited, Production plan recommended)

### Tools Required

- Node.js 18+ and npm/yarn
- Git
- Expo CLI: `npm install -g expo-cli eas-cli`
- Supabase CLI: `npm install -g supabase` (for local dev)
- Xcode (Mac only, for iOS builds and testing)
- Android Studio (for Android testing)

---

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New project"
3. Choose organization (or create one)
4. Project name: `lomito-production` (or `lomito-dev` for staging)
5. Database password: generate a strong password, save it securely
6. Region: choose closest to Tijuana (e.g., `us-west-1` or `us-west-2`)
7. Click "Create new project"

### 1.2 Get API Credentials

Once the project is created:

1. Go to Project Settings → API
2. Copy `Project URL` → this is your `EXPO_PUBLIC_SUPABASE_URL`
3. Copy `anon public` key → this is your `EXPO_PUBLIC_SUPABASE_ANON_KEY`
4. Copy `service_role` key (keep this secret, only for Edge Functions) → this is `SUPABASE_SERVICE_ROLE_KEY`

### 1.3 Run Migrations

All database migrations are in `/Users/elninja/Code/lomito/supabase/migrations/`. Run them in order:

**Using Supabase CLI (recommended for local dev):**

```bash
cd /Users/elninja/Code/lomito
supabase link --project-ref <your-project-ref>
supabase db push
```

**Or manually via Supabase Dashboard:**

1. Go to SQL Editor in the Supabase dashboard
2. Run each migration file in order (see [SUPABASE.md](./SUPABASE.md) for full migration list)

### 1.4 Deploy Edge Functions

See [SUPABASE.md](./SUPABASE.md) for detailed Edge Function deployment steps.

Quick version:

```bash
cd /Users/elninja/Code/lomito

# Deploy all functions
supabase functions deploy send-notification
supabase functions deploy inbound-email
supabase functions deploy escalate-case
supabase functions deploy auto-escalation-check
supabase functions deploy jurisdiction-boundaries
supabase functions deploy create-donation
supabase functions deploy donation-webhook

# Set required secrets (see Step 2 below)
supabase secrets set RESEND_API_KEY=your-key
supabase secrets set MERCADO_PAGO_ACCESS_TOKEN=your-token
supabase secrets set MERCADO_PAGO_WEBHOOK_SECRET=your-secret
supabase secrets set INBOUND_EMAIL_WEBHOOK_SECRET=your-secret
```

---

## Step 2: External Services Setup

### 2.1 Mapbox

1. Go to https://account.mapbox.com/access-tokens/
2. Create a new token with these scopes:
   - `styles:read`
   - `fonts:read`
   - `downloads:read`
3. Copy the token → this is your `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`

**For iOS:** Add token to `Info.plist` (handled by Expo config plugin)

**For Android:** Token goes in environment variables (handled by Expo build)

### 2.2 Firebase (Push Notifications)

1. Go to https://console.firebase.google.com
2. Create a new project: `lomito-production`
3. Enable Google Analytics (optional but recommended)
4. **iOS Setup:**
   - Add iOS app
   - Bundle ID: `org.lomito.app` (must match `apps/mobile/app.json`)
   - Download `GoogleService-Info.plist`
   - Place in `apps/mobile/` directory (already in `.gitignore`)
5. **Android Setup:**
   - Add Android app
   - Package name: `org.lomito.app` (must match `apps/mobile/app.json`)
   - Download `google-services.json`
   - Place in `apps/mobile/` directory (already in `.gitignore`)
6. **Get FCM Server Key:**
   - Go to Project Settings → Cloud Messaging
   - Copy Server Key (legacy) or create a new one
   - Save for later (used in Edge Functions if needed)

### 2.3 Resend (Email)

**Domain Verification:**

1. Go to https://resend.com/domains
2. Add domain: `lomito.org`
3. Add DNS records to your domain registrar:

```
TXT  @  resend-verification  v=resend1 ...
MX   @  feedback-smtp.resend.com  10
TXT  @  v=spf1 include:amazonses.com ~all
CNAME resend._domainkey  resend._domainkey.resend.com
```

4. Wait for verification (usually < 1 hour)

**Inbound Email Routing:**

1. Go to https://resend.com/inbound
2. Create inbound route:
   - **Match**: `case-*@reply.lomito.org`
   - **Forward to**: Your Supabase Edge Function URL for `inbound-email`
     - Example: `https://<project-ref>.supabase.co/functions/v1/inbound-email`
3. Generate webhook secret:
   - Go to Webhooks → Create webhook
   - URL: same as above
   - Events: `email.received`
   - Copy the signing secret → this is `INBOUND_EMAIL_WEBHOOK_SECRET`

**API Key:**

1. Go to https://resend.com/api-keys
2. Create API key with full send permissions
3. Copy the key → this is `RESEND_API_KEY`

### 2.4 Mercado Pago

1. Create a Mercado Pago business account (Mexico)
2. Go to https://www.mercadopago.com.mx/developers/panel
3. Create an application: "Lomito Donations"
4. Get credentials (use Production credentials for production):
   - `Access Token` → this is `MERCADO_PAGO_ACCESS_TOKEN`
   - `Public Key` → this is `EXPO_PUBLIC_MERCADO_PAGO_PUBLIC_KEY`
5. **Webhook Setup:**
   - Go to Webhooks
   - Create webhook:
     - URL: `https://<project-ref>.supabase.co/functions/v1/donation-webhook`
     - Events: `payment`
   - Copy webhook secret → this is `MERCADO_PAGO_WEBHOOK_SECRET`

### 2.5 PostHog (Optional)

1. Create account at https://posthog.com
2. Create project: "Lomito"
3. Copy API key → this is `EXPO_PUBLIC_POSTHOG_KEY`
4. Copy project host → this is `EXPO_PUBLIC_POSTHOG_HOST`

---

## Step 3: Environment Configuration

### 3.1 Local Development

Create `apps/mobile/.env` (copy from `.env.example`):

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Mapbox
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token

# Push Notifications (Expo Project ID)
EXPO_PUBLIC_PROJECT_ID=your-expo-project-id

# Mercado Pago
EXPO_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=your-mercado-pago-public-key

# PostHog (optional)
EXPO_PUBLIC_POSTHOG_KEY=your-posthog-key
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 3.2 EAS Build Environment Variables

For production builds, set environment variables in EAS:

```bash
cd apps/mobile

# Set secrets for EAS
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key"
eas secret:create --scope project --name EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN --value "your-mapbox-token"
eas secret:create --scope project --name EXPO_PUBLIC_MERCADO_PAGO_PUBLIC_KEY --value "your-public-key"
# ... add all EXPO_PUBLIC_* variables
```

See [EAS.md](./EAS.md) for full details.

---

## Step 4: Seed Data

### 4.1 Jurisdiction Boundaries

Lomito requires PostGIS jurisdiction boundaries for auto-assignment. For Tijuana:

1. Download INEGI municipal boundaries (GeoJSON or Shapefile format)
   - Source: https://www.inegi.org.mx/app/biblioteca/ficha.html?upc=889463674658
2. Convert to GeoJSON with EPSG:4326 (WGS84)
3. Use `supabase/seed/load-jurisdictions.sql` to load boundaries:

```sql
INSERT INTO jurisdictions (name, level, geometry, authority_name, authority_email, escalation_enabled, verified)
VALUES (
  'Tijuana',
  'municipality',
  ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[...]}'),
  'Gobierno Municipal de Tijuana',
  'bienestar.animal@tijuana.gob.mx',
  true,
  true
);
```

Repeat for all municipalities, delegaciones, and colonias you want to support.

### 4.2 Test Users

Create test accounts for each role:

```sql
-- Citizen (created via Supabase Auth UI or app signup)
-- Moderator
INSERT INTO profiles (id, full_name, role, municipality)
VALUES ('user-uuid', 'Test Moderator', 'moderator', 'Tijuana');

INSERT INTO user_jurisdictions (user_id, jurisdiction_id)
SELECT 'user-uuid', id FROM jurisdictions WHERE name = 'Tijuana';

-- Government user
INSERT INTO profiles (id, full_name, role, municipality)
VALUES ('gov-user-uuid', 'Government Rep', 'government', 'Tijuana');

INSERT INTO user_jurisdictions (user_id, jurisdiction_id)
SELECT 'gov-user-uuid', id FROM jurisdictions WHERE name = 'Tijuana';
```

### 4.3 Test Cases (Optional)

```sql
INSERT INTO cases (reporter_id, category, animal_type, description, location, urgency, status)
VALUES (
  'reporter-uuid',
  'stray',
  'dog',
  'Perro callejero en bulevar necesita rescate',
  ST_SetSRID(ST_MakePoint(-117.0382, 32.5149), 4326)::geography,
  'medium',
  'pending'
);
```

---

## Step 5: Local Development

### 5.1 Install Dependencies

```bash
cd /Users/elninja/Code/lomito
npm install
```

### 5.2 Start Expo Dev Server

```bash
cd apps/mobile
npx expo start
```

Options:

- Press `i` → open iOS Simulator
- Press `a` → open Android Emulator
- Press `w` → open in web browser
- Scan QR code with Expo Go app (iOS/Android) for testing on physical device

### 5.3 Test on Device

**iOS:**

- Install Expo Go from App Store
- Scan QR code from terminal

**Android:**

- Install Expo Go from Play Store
- Scan QR code from terminal

**Note:** Expo Go has limitations (no custom native code). For full testing, build a development client (see [EAS.md](./EAS.md)).

---

## Step 6: Build

### 6.1 Configure EAS

1. Ensure `apps/mobile/eas.json` is configured correctly
2. Set EAS project ID in `app.json`:

```bash
cd apps/mobile
eas init
# This updates app.json with your EAS project ID
```

3. Update `eas.json` with your Apple and Google credentials (see [EAS.md](./EAS.md))

### 6.2 Build for iOS

```bash
cd apps/mobile

# Production build (for App Store submission)
eas build --platform ios --profile production

# Wait for build to complete (15-30 minutes)
# Download IPA from EAS dashboard or via CLI
```

### 6.3 Build for Android

```bash
cd apps/mobile

# Production build (for Play Store submission)
eas build --platform android --profile production

# Wait for build to complete (15-30 minutes)
# Download AAB from EAS dashboard or via CLI
```

**Note:** First build requires setting up certificates/keystores. EAS will prompt you. See [EAS.md](./EAS.md) for details.

---

## Step 7: Submit to App Stores

### 7.1 iOS App Store

```bash
cd apps/mobile

# Submit to App Store Connect
eas submit --platform ios --profile production
```

Or manually:

1. Download IPA from EAS
2. Upload via Xcode → Organizer → Distribute App
3. Fill out App Store Connect listing (see [APP_STORES.md](./APP_STORES.md))
4. Submit for review

**Timeline:** 1-3 days for initial review, 24-48 hours for updates

### 7.2 Android Play Store

```bash
cd apps/mobile

# Submit to Play Console
eas submit --platform android --profile production
```

Or manually:

1. Download AAB from EAS
2. Go to https://play.google.com/console
3. Create new app → Upload AAB to internal testing track
4. Fill out store listing (see [APP_STORES.md](./APP_STORES.md))
5. Submit for review

**Timeline:** 1-3 days for initial review, 1-2 days for updates

---

## Rollback Procedures

### Database Migration Rollback

If a migration causes issues, rollback using the commented rollback SQL at the top of each migration file:

```bash
# Via Supabase CLI
supabase db reset --db-url <your-db-connection-string>

# Or manually via SQL Editor
-- Run the rollback command from the migration file
DROP TABLE IF EXISTS ... CASCADE;
```

**Important:** Always test migrations in a staging environment first.

### App Rollback (OTA Update)

For non-native changes (JS bundle updates), use EAS Update to rollback:

```bash
cd apps/mobile

# Publish a rollback update
eas update --branch production --message "Rollback to previous version"
```

Users will receive the rollback the next time they open the app (or immediately if app is already open).

**For native changes (dependencies, config changes):** You must submit a new app binary to the stores. There is no instant rollback for native changes.

### Edge Function Rollback

Supabase Edge Functions are deployed via Git. To rollback:

```bash
# Revert the function code locally
git checkout <previous-commit> -- supabase/functions/<function-name>

# Redeploy
supabase functions deploy <function-name>
```

---

## Monitoring and Debugging

### Supabase Logs

- **Database Logs:** Supabase Dashboard → Logs → Database
- **Edge Function Logs:** Supabase Dashboard → Edge Functions → [Function Name] → Logs
- **API Logs:** Supabase Dashboard → Logs → API

### EAS Build Logs

```bash
# View build logs
eas build:list
eas build:view <build-id>
```

### App Logs (Production)

- **iOS:** Xcode → Window → Devices and Simulators → Select device → View logs
- **Android:** Android Studio → Logcat
- **Sentry (if configured):** View real-time crash reports

### Email Logs (Resend)

- Go to https://resend.com/emails
- View delivery status, opens, bounces

### Payment Logs (Mercado Pago)

- Go to Mercado Pago developer panel
- Webhooks → View webhook delivery attempts

---

## Production Checklist

Before launching to production:

- [ ] All migrations run successfully in production Supabase
- [ ] All Edge Functions deployed and secrets set
- [ ] Jurisdiction boundaries loaded for Tijuana (minimum)
- [ ] Test user accounts created for all roles
- [ ] Environment variables set in EAS
- [ ] iOS app submitted and approved in App Store Connect
- [ ] Android app submitted and approved in Play Console
- [ ] Resend domain verified and inbound routing configured
- [ ] Mercado Pago webhooks configured and tested
- [ ] Firebase FCM configured for both iOS and Android
- [ ] Privacy policy published at https://lomito.org/privacy
- [ ] Support page published at https://lomito.org/support
- [ ] Analytics (PostHog) configured and public dashboard live
- [ ] Test complete user flow: signup → create report → escalation → donation
- [ ] RLS policies tested for all roles
- [ ] Performance budgets verified (cold start < 2s, map < 1.5s)

---

## Support and Troubleshooting

For common deployment issues and solutions, see:

- [SUPABASE.md](./SUPABASE.md) — Database and Edge Function issues
- [EAS.md](./EAS.md) — Build and certificate issues
- [APP_STORES.md](./APP_STORES.md) — Store submission rejections

For questions, contact the development team or file an issue in the GitHub repository.
