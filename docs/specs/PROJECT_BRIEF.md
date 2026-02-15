# Lomito — Project Brief for GSD

## What I'm Building

An open-source, map-centric civic platform for reporting and tracking animal welfare issues. Think "311 for street animals" — citizens report strays, abuse, or missing pets via a map pin drop with photos, cases get tracked publicly with full timelines, and municipal authorities are held accountable through email escalation and transparency dashboards.

## Target Users

1. Citizens in Tijuana, Mexico who encounter stray/abused/missing animals
2. Volunteer moderators from local animal welfare organizations
3. Municipal government animal control departments
4. Donors who want to support animal welfare infrastructure

## Tech Stack (Already Decided)

- React Native (Expo SDK 52+) with Expo Router v4
- Supabase (PostgreSQL + PostGIS, Auth, Realtime, Storage, Edge Functions)
- Mapbox GL for maps
- Firebase Cloud Messaging for push notifications
- Resend for transactional email
- Mercado Pago + Stripe for donations
- PostHog for analytics
- react-i18next for i18n (Spanish primary, English secondary)
- TypeScript strict mode throughout

## MVP Scope (What Gets Built)

### Phase 1: Foundation

- Expo monorepo scaffolding with packages/shared, packages/ui, apps/mobile
- Supabase project with PostGIS, schema migrations, RLS policies
- Auth flow: magic link + SMS OTP, registration with privacy notice acceptance
- Mapbox integration with Tijuana-centered map
- INEGI boundary data import for Baja California municipalities
- Jurisdiction boundary overlays on map
- Shared UI component library (Button, Card, Input, Badge, BottomSheet, Skeleton)

### Phase 2: Core Reporting

- Report submission: category, map pin, description, photos (1-5), video (optional), animal type, urgency
- Client-side image compression (1200px, JPEG 0.8, EXIF strip)
- Auto jurisdiction assignment via PostGIS ST_Contains
- Case detail screen with photo gallery, timeline, jurisdiction info
- Map pins color-coded by category with clustering
- Filter bar: category, status, date range

### Phase 3: Moderation + Notifications

- Moderator review queue (verify/reject/flag)
- RLS policies scoping moderator access to assigned jurisdictions
- Community flagging (3 flags auto-hides)
- Push notifications (FCM) for case updates
- Notification preferences screen

### Phase 4: Government Integration

- Email escalation: structured emails to authorities with per-case reply-to
- Inbound email parsing for government replies
- Government account invitation flow
- Government portal: case list, status updates, folio assignment
- Auto-escalation flags (5/15/30 day no-response)

### Phase 5: Donations + Dashboard + Launch

- Mercado Pago donation integration
- Public impact dashboard
- About Us page
- Legal documents (privacy notice, TOS, security policy)
- Performance audit, accessibility audit, localization audit
- App Store + Play Store submission
- Open source repository publication

## Constraints

- All code in English. Spanish only in i18n JSON files and legal docs.
- Free tier budget ($0/month operational) until 1,000+ users.
- Must work well on mid-range Android phones over 4G in Mexican cities.
- WCAG 2.1 AA accessibility compliance.
- Mexican LFPDP privacy law compliance.
- Client-side image compression mandatory (users on limited data plans).

## What Already Exists

- Domain: lomito.org (registered on Cloudflare)
- docs/specs/PRD.md — Complete product requirements document
- docs/specs/ENGINEERING_GUIDE.md — Style system, architecture, performance optimization, analytics, i18n, and week-by-week kickoff checklist
- docs/style/DESIGN_TOKENS.md — Complete design token reference with colors, typography, spacing, shadows

## Workflow Preferences

- YOLO mode (autonomous execution, no approval gates per task)
- Each task should be done by a fresh subagent to avoid context rot
- Atomic commits after each task
- Pre-commit hooks for typecheck + lint
- Maximum 3 tasks per plan to keep subagent context clean
- When blocked on something requiring my input, log it and move to the next available task
