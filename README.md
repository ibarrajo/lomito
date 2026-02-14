# Lomito

**Open-source civic platform for animal welfare in Mexico**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://img.shields.io/badge/CI-passing-brightgreen.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

## What is Lomito?

Lomito is a map-centric civic platform for reporting and tracking animal welfare issues in Mexico, launching in Tijuana, Baja California. Think "311 for street animals" — citizens report strays, abuse, or missing pets via a map pin drop with photos, cases get tracked publicly with full timelines, and municipal authorities are held accountable through email escalation and transparency dashboards.

The platform combines jurisdiction-aware case tracking powered by PostGIS geospatial queries, automated email escalation to government authorities with configurable reminder schedules, and public impact dashboards showing resolution metrics. All reports are geolocated and automatically assigned to the correct municipal jurisdiction, ensuring accountability and efficient routing.

Built with a mobile-first approach, Lomito works on iOS, Android, and web from a single React Native codebase. The platform prioritizes accessibility, privacy, and performance on mid-range devices over cellular networks.

## Key Features

- **Map-based case reporting** with PostGIS geospatial indexing and viewport-bounded queries
- **Automated jurisdiction assignment** using ST_Contains PostGIS queries on municipal boundary polygons
- **Multi-step report submission** with client-side image compression (max 1200px, JPEG 0.8, EXIF GPS stripped)
- **Moderator review queue** with verify/reject/flag actions scoped by jurisdiction via RLS policies
- **Community flagging** with auto-hide threshold (3 flags)
- **Email escalation to government authorities** with structured templates and per-case reply-to addresses
- **Auto-escalation reminders** (5/15/30 days) with resolution deadline tracking
- **Government portal** with folio assignment, official responses, and status updates
- **Real-time case timeline** with push notifications via Firebase Cloud Messaging
- **Impact dashboard** with resolution metrics, response time analytics, and jurisdiction comparison
- **Mercado Pago donations** supporting OXXO, SPEI, and card payments (international via Stripe)
- **Bilingual interface** (Spanish primary, English secondary) via react-i18next

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React Native (Expo SDK 52+) |
| **Routing** | Expo Router v4 (file-based) |
| **Backend** | Supabase (PostgreSQL + PostGIS + Auth + Realtime + Storage + Edge Functions) |
| **Maps** | Mapbox GL (react-native-mapbox-gl on native, mapbox-gl-js on web) |
| **Notifications** | Firebase Cloud Messaging (push) + Resend (email) |
| **Payments** | Mercado Pago (Mexico: OXXO, SPEI, card) + Stripe (international) |
| **Analytics** | PostHog (public-facing dashboard) |
| **i18n** | react-i18next |
| **Language** | TypeScript (strict mode) |

## Architecture

Lomito is organized as a monorepo with three main packages:

```
lomito/
├── apps/mobile/          # Expo app (iOS + Android + Web)
│   ├── app/              # Expo Router file-based routes
│   ├── components/       # Screen-specific components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Supabase client, PostHog, Mapbox config
│   └── assets/           # Fonts, images, icons
├── packages/
│   ├── shared/           # Types, constants, i18n translations, utils
│   │   └── i18n/         # es.json, en.json
│   └── ui/               # Shared UI component library
├── supabase/
│   ├── migrations/       # SQL migration files
│   ├── seed/             # Seed data (jurisdictions, test cases)
│   └── functions/        # Edge Functions
└── docs/                 # Specs, plans, style guide, ADRs
```

## Getting Started

### Prerequisites

- Node.js 18+ (Node 20+ recommended)
- npm 9+
- Expo CLI (`npm install -g expo-cli`)
- Supabase CLI (`npm install -g supabase`)

### Clone & Install

```bash
git clone https://github.com/your-org/lomito.git
cd lomito
npm install
```

### Environment Setup

Copy the environment template and fill in your API keys:

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Required environment variables:
- `EXPO_PUBLIC_SUPABASE_URL` — Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Your Supabase anon key
- `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` — Mapbox public token
- `EXPO_PUBLIC_PROJECT_ID` — Expo project ID (for push notifications)
- `EXPO_PUBLIC_MERCADO_PAGO_PUBLIC_KEY` — Mercado Pago public key

### Run Migrations

Start your local Supabase instance and apply migrations:

```bash
npx supabase start
npx supabase db reset
```

### Start Development Server

```bash
npx expo start
```

This will open the Expo DevTools in your browser. Scan the QR code with the Expo Go app (iOS/Android) or press `w` to open in web browser.

## Project Structure

```
lomito/
├── apps/mobile/
│   ├── app/
│   │   ├── (auth)/           # Auth flow screens
│   │   ├── (tabs)/           # Main tab navigation
│   │   ├── case/[id].tsx     # Case detail screen
│   │   └── _layout.tsx       # Root layout
│   ├── components/           # UI components
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Config & clients
│   └── assets/               # Static assets
├── packages/
│   ├── shared/
│   │   ├── src/
│   │   │   ├── types/        # TypeScript types
│   │   │   ├── constants/    # App constants
│   │   │   ├── i18n/         # Translations (es.json, en.json)
│   │   │   └── utils/        # Utility functions
│   └── ui/
│       └── src/
│           └── components/   # Shared UI components
├── supabase/
│   ├── migrations/           # Database migrations
│   ├── seed/                 # Seed data
│   └── functions/            # Edge Functions
└── docs/
    ├── specs/                # Product & engineering specs
    ├── style/                # Design system docs
    └── plans/                # Development plans
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on:
- Development workflow
- Code conventions
- Pull request process
- Issue guidelines

## License

MIT License - see [LICENSE](LICENSE) for details.

Copyright (c) 2025-2026 Lomito Contributors

## Links

- **Website:** [lomito.org](https://lomito.org)
- **Documentation:** [docs/](docs/)
- **Issue Tracker:** [GitHub Issues](https://github.com/your-org/lomito/issues)
- **Code of Conduct:** [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
