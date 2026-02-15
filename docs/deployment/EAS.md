# EAS Build and Deployment Guide

Complete guide for building and deploying Lomito iOS and Android apps using Expo Application Services (EAS).

---

## Overview

Lomito uses **EAS Build** for creating native iOS and Android binaries, and **EAS Submit** for uploading to app stores.

**Key Benefits:**

- Serverless build infrastructure (no Mac required for iOS builds)
- Automatic code signing and credential management
- Over-the-air (OTA) updates via EAS Update
- Build caching for faster iteration

---

## Prerequisites

### Accounts

- **Expo Account** — Sign up at https://expo.dev
- **Apple Developer Account** — $99/year, required for iOS App Store
- **Google Play Console** — $25 one-time fee, required for Android Play Store

### Tools

- **EAS CLI** installed globally:

  ```bash
  npm install -g eas-cli
  ```

- **Expo CLI** (optional but recommended):
  ```bash
  npm install -g expo-cli
  ```

### Credentials

**For iOS:**

- Apple ID and password
- App-specific password (if 2FA enabled)
- App Store Connect API key (recommended for CI/CD)

**For Android:**

- Google Play Console service account JSON (for automatic submission)

---

## Project Initialization

### 1. Login to EAS

```bash
eas login
```

Enter your Expo account credentials.

### 2. Initialize EAS in Project

```bash
cd /Users/elninja/Code/lomito/apps/mobile
eas init
```

This:

- Creates or updates `eas.json` (already exists in the project)
- Generates a unique EAS project ID
- Updates `app.json` with the project ID under `extra.eas.projectId`

**Current `eas.json` configuration:**

```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true },
      "android": { "buildType": "apk" }
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": false },
      "android": { "buildType": "apk" }
    },
    "production": {
      "autoIncrement": true,
      "ios": { "simulator": false },
      "android": { "buildType": "aab" }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "TBD",
        "ascAppId": "TBD",
        "appleTeamId": "TBD"
      },
      "android": {
        "serviceAccountKeyPath": "./google-services.json",
        "track": "production"
      }
    }
  }
}
```

### 3. Update Submit Configuration

**For iOS:**

1. Go to App Store Connect → Apps → Your App
2. Copy the **App ID** (numeric, e.g., `1234567890`)
3. Go to https://developer.apple.com/account → Membership
4. Copy your **Team ID**
5. Update `eas.json`:

```json
"ios": {
  "appleId": "your-email@example.com",
  "ascAppId": "1234567890",
  "appleTeamId": "ABCDE12345"
}
```

**For Android:**

1. Go to Google Play Console → Setup → API access
2. Create a service account and download JSON key
3. Save as `apps/mobile/google-play-service-account.json` (add to `.gitignore`)
4. Update `eas.json`:

```json
"android": {
  "serviceAccountKeyPath": "./google-play-service-account.json",
  "track": "production"
}
```

---

## Environment Variables

### Setting Secrets for EAS Builds

EAS builds do not read `.env` files by default. You must set environment variables as EAS secrets.

```bash
cd /Users/elninja/Code/lomito/apps/mobile

# Set secrets (project-scoped)
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key"
eas secret:create --scope project --name EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN --value "your-mapbox-token"
eas secret:create --scope project --name EXPO_PUBLIC_MERCADO_PAGO_PUBLIC_KEY --value "your-public-key"
eas secret:create --scope project --name EXPO_PUBLIC_PROJECT_ID --value "your-expo-project-id"

# List all secrets (values are hidden)
eas secret:list

# Delete a secret
eas secret:delete --name EXPO_PUBLIC_SUPABASE_URL
```

**Note:** All secrets with the `EXPO_PUBLIC_` prefix are embedded in the app bundle. Never put sensitive keys (like service role keys) in client-side environment variables.

---

## Build Profiles

### Development Profile

**Purpose:** For local testing on physical devices and simulators. Includes Expo Dev Client for live reloading.

**Build:**

```bash
# iOS (simulator)
eas build --platform ios --profile development

# iOS (device, requires Apple Developer account)
eas build --platform ios --profile development --device

# Android (APK for device/emulator)
eas build --platform android --profile development
```

**Install:**

- Download APK/IPA from EAS dashboard or CLI
- Drag APK to Android emulator or use `adb install`
- Drag IPA to iOS simulator or install via Xcode Devices

### Preview Profile

**Purpose:** For internal testing with stakeholders (TestFlight, internal Play Store track).

**Build:**

```bash
# iOS
eas build --platform ios --profile preview

# Android
eas build --platform android --profile preview
```

**Distribute:**

- iOS: Upload to TestFlight via `eas submit` or manually
- Android: Upload to internal testing track in Play Console

### Production Profile

**Purpose:** For App Store and Play Store releases.

**Build:**

```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

**Features:**

- `autoIncrement: true` — Auto-increments build number on each build
- iOS: Builds IPA (archive for App Store)
- Android: Builds AAB (Android App Bundle for Play Store)

---

## iOS-Specific Configuration

### Code Signing

EAS manages iOS code signing automatically. On first build:

1. EAS prompts: "Would you like us to handle distribution certificates for you?"
   - Answer: **Yes** (recommended)
2. EAS creates:
   - Distribution certificate
   - Provisioning profile
3. Credentials are stored securely in EAS and reused for future builds

**Manual credential management:**

```bash
# View credentials
eas credentials

# Revoke and recreate
eas credentials --platform ios
```

### Info.plist Permissions

Already configured in `apps/mobile/app.json`:

```json
"ios": {
  "infoPlist": {
    "NSLocationWhenInUseUsageDescription": "Lomito needs your location to show animal welfare cases near you and to automatically detect your jurisdiction when submitting a report.",
    "NSCameraUsageDescription": "Lomito needs access to your camera to take photos of animal welfare issues when creating a report.",
    "NSPhotoLibraryUsageDescription": "Lomito needs access to your photo library to attach photos to your reports."
  }
}
```

### App Store Connect Setup

1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill out:
   - **Platform:** iOS
   - **Name:** Lomito
   - **Primary Language:** Spanish (Mexico)
   - **Bundle ID:** `org.lomito.app` (must match `app.json`)
   - **SKU:** `lomito-ios-v1` (unique identifier)
   - **User Access:** Full Access
4. Save

**Set up App Information:**

- Category: Lifestyle
- Subcategory: Social Networking
- Content Rights: Yes (you own or have rights to use all content)

---

## Android-Specific Configuration

### Keystore

EAS creates and manages Android keystores automatically. On first build:

1. EAS prompts: "Would you like us to generate a new Android keystore?"
   - Answer: **Yes** (recommended)
2. EAS generates a keystore and stores it securely
3. Keystore is reused for all future builds (critical for app updates)

**Important:** Never lose your keystore. If you do, you cannot update your app in Play Store (you must publish a new app with a different package name).

**Manual keystore management:**

```bash
# View keystore credentials
eas credentials --platform android

# Download keystore (for backup)
eas credentials --platform android
# Select "Download credentials"
```

**Backup keystore securely** (encrypted cloud storage, password manager, etc.).

### Permissions

Already configured in `apps/mobile/app.json`:

```json
"android": {
  "permissions": [
    "ACCESS_COARSE_LOCATION",
    "ACCESS_FINE_LOCATION",
    "CAMERA",
    "READ_EXTERNAL_STORAGE",
    "WRITE_EXTERNAL_STORAGE"
  ]
}
```

### Google Play Console Setup

1. Go to https://play.google.com/console
2. Click "Create app"
3. Fill out:
   - **App name:** Lomito
   - **Default language:** Spanish (Latin America)
   - **App or game:** App
   - **Free or paid:** Free
4. Agree to policies and create app

**Set up store listing:**

- Category: Social
- Target audience: Teen (13+)
- Content rating: Complete questionnaire (see [APP_STORES.md](./APP_STORES.md))

---

## Build Commands

### iOS Production Build

```bash
cd /Users/elninja/Code/lomito/apps/mobile

eas build --platform ios --profile production
```

**Build process:**

1. Uploads source code to EAS
2. Installs dependencies
3. Runs prebuild (generates native iOS project)
4. Compiles native code
5. Signs IPA with distribution certificate
6. Uploads IPA to EAS servers

**Duration:** 15-30 minutes (first build), 10-15 minutes (subsequent builds with cache)

**Download IPA:**

```bash
# List recent builds
eas build:list --platform ios

# Download specific build
eas build:download --id <build-id>
```

### Android Production Build

```bash
cd /Users/elninja/Code/lomito/apps/mobile

eas build --platform android --profile production
```

**Build process:**

1. Uploads source code to EAS
2. Installs dependencies
3. Runs prebuild (generates native Android project)
4. Compiles native code with Gradle
5. Signs AAB with keystore
6. Uploads AAB to EAS servers

**Duration:** 15-30 minutes (first build), 10-15 minutes (subsequent builds with cache)

**Download AAB:**

```bash
# List recent builds
eas build:list --platform android

# Download specific build
eas build:download --id <build-id>
```

### Build Both Platforms

```bash
eas build --platform all --profile production
```

Runs iOS and Android builds in parallel.

---

## Submitting to App Stores

### iOS App Store Submission

```bash
cd /Users/elninja/Code/lomito/apps/mobile

# Submit latest production build
eas submit --platform ios --profile production

# Or submit a specific build
eas submit --platform ios --id <build-id>
```

**EAS will:**

1. Download IPA from build
2. Upload to App Store Connect via Transporter API
3. Mark build for TestFlight review (automatic)

**After submission:**

1. Go to App Store Connect → TestFlight
2. Wait for TestFlight review (1-24 hours)
3. Once approved, add build to App Store submission
4. Complete store listing (see [APP_STORES.md](./APP_STORES.md))
5. Submit for App Review

**Submission timeline:**

- TestFlight review: 1-24 hours
- App Review: 1-3 days (first submission), 24-48 hours (updates)

### Android Play Store Submission

```bash
cd /Users/elninja/Code/lomito/apps/mobile

# Submit latest production build
eas submit --platform android --profile production

# Or submit a specific build
eas submit --platform android --id <build-id>
```

**EAS will:**

1. Download AAB from build
2. Upload to Google Play Console via service account credentials
3. Publish to "production" track (or "internal" if specified in `eas.json`)

**After submission:**

1. Go to Play Console → Release → Production
2. Complete store listing if not done (see [APP_STORES.md](./APP_STORES.md))
3. Submit for review

**Submission timeline:**

- Initial review: 1-3 days
- Updates: 1-2 days

---

## Over-the-Air (OTA) Updates

### EAS Update

For non-native changes (JS bundle, assets), you can push OTA updates without app store review.

**Publish update:**

```bash
cd /Users/elninja/Code/lomito/apps/mobile

# Publish to production branch
eas update --branch production --message "Fix: corrected case status filter"
```

**Users receive the update:**

- Next time they open the app (if app is closed)
- Immediately (if app is already open and configured for instant updates)

**Important:**

- OTA updates only work for JS code and assets
- **Cannot update:**
  - Native dependencies (anything in `package.json` that requires native code)
  - `app.json` config changes (e.g., permissions, bundle ID)
  - Expo SDK version upgrades

For native changes, you must build and submit a new binary.

### Rollback

```bash
# View update history
eas update:list --branch production

# Rollback to previous update
eas update:rollback --branch production
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: EAS Build

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - name: Install dependencies
        run: npm install
      - name: Build iOS
        run: eas build --platform ios --profile production --non-interactive
      - name: Build Android
        run: eas build --platform android --profile production --non-interactive
```

**Required GitHub Secrets:**

- `EXPO_TOKEN` — Create at https://expo.dev/accounts/[account]/settings/access-tokens

---

## Troubleshooting

### Common Build Errors

**Error: "No bundle ID found"**

**Solution:**

- Verify `ios.bundleIdentifier` in `app.json` matches Apple Developer account
- Run `eas build:configure` to regenerate config

---

**Error: "Code signing failed"**

**Solution:**

- Run `eas credentials --platform ios`
- Select "Remove all credentials"
- Re-run build (EAS will regenerate credentials)

---

**Error: "Android build failed: AAPT2 error"**

**Solution:**

- Usually caused by invalid Android resource
- Check `android` block in `app.json` for errors
- Verify all required permissions are valid

---

**Error: "Build failed: Out of memory"**

**Solution:**

- Reduce bundle size (remove unused dependencies)
- Contact EAS support to request more build memory (paid plans only)

---

**Error: "Submission failed: Invalid provisioning profile"**

**Solution:**

- Regenerate provisioning profile: `eas credentials --platform ios`
- Re-run build and submit

---

### Build Logs

```bash
# View build logs in browser
eas build:view <build-id>

# View logs in terminal
eas build:logs <build-id>
```

---

## Performance Optimization

### Build Speed

- **Use caching:** EAS caches `node_modules` and Gradle dependencies by default
- **Reduce dependencies:** Audit `package.json` for unused packages
- **Parallelize builds:** Run iOS and Android builds simultaneously with `--platform all`

### Bundle Size

Lomito has performance budgets:

- **iOS IPA:** < 50MB (after App Store thinning)
- **Android APK:** < 30MB (AAB expands to ~40MB installed)
- **JS bundle:** < 2MB (mobile)

**Analyze bundle size:**

```bash
npx expo export --platform ios
npx expo export --platform android

# Check output in dist/ folder
```

**Reduce size:**

- Use Hermes engine (enabled by default in Expo SDK 52+)
- Enable `expo-asset` for on-demand asset loading
- Use WebP for images (supported in Expo Image)

---

## Support

**EAS Documentation:**

- https://docs.expo.dev/eas/

**Expo Forums:**

- https://forums.expo.dev/

**Discord:**

- https://chat.expo.dev/

For Lomito-specific build issues, contact the development team.
