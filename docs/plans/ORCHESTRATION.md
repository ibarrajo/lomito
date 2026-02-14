# Lomito Orchestration Plan

## How This Works

This file defines all tasks organized by phase. When starting a new session or resuming work, the orchestrator reads this file and hydrates Claude Code's native Task system using `TaskCreate`. Tasks that are already marked `[x]` below should NOT be re-created.

### Session startup protocol

```
1. Check existing tasks: "Show me all tasks"
2. If no tasks exist, hydrate from this file (current phase only)
3. If tasks exist, check for completed/blocked status and continue
4. Delegate unblocked tasks to subagents
5. After all tasks in a phase complete, move to the next phase
```

### Task execution protocol (for each task)

```
1. Create task via TaskCreate with subject, description, and dependencies
2. Delegate to subagent: "Use a subagent to implement [task]. Read [relevant spec] first."
3. Subagent completes work, runs typecheck + lint
4. Orchestrator verifies: files exist, types pass, conventions followed
5. Commit: git add -A && git commit -m "[conventional commit message]"
6. Mark task completed via TaskUpdate
```

---

## Phase 1: Foundation (Scaffold + Design System + Schema)

### P1-T1: Expo monorepo scaffolding
- **Depends on:** nothing
- **Spec:** `docs/specs/ENGINEERING_GUIDE.md` Part 2
- **Deliverables:**
  - `apps/mobile/` — Expo app with Expo Router v4, TypeScript strict
  - `packages/shared/` — workspace with types, constants, i18n skeleton
  - `packages/ui/` — workspace for shared UI components
  - Root `package.json` with npm workspaces
  - `tsconfig.json` (root + per-package)
  - `.eslintrc.js` + `.prettierrc` + `.editorconfig`
  - `.gitignore` comprehensive for RN + Expo + Supabase
  - Core deps installed: expo-router, react-native-reanimated, expo-image, react-i18next, lucide-react-native, @supabase/supabase-js
- **Commit:** `chore: scaffold Expo monorepo with workspaces`
- [x] Done

### P1-T2: Design token implementation
- **Depends on:** P1-T1
- **Spec:** `docs/style/DESIGN_TOKENS.md`
- **Deliverables:**
  - `packages/ui/src/theme/tokens.ts` — all color, spacing, typography, shadow, radius tokens as TypeScript constants
  - `packages/ui/src/theme/theme-provider.tsx` — React context provider for theme access
  - `packages/ui/src/theme/index.ts` — barrel export
  - Fonts loaded via expo-font (DM Sans, Source Sans 3, JetBrains Mono)
- **Commit:** `feat(ui): implement design tokens and theme provider`
- [x] Done

### P1-T3: Core UI components
- **Depends on:** P1-T2
- **Spec:** `docs/style/DESIGN_TOKENS.md` (Component Specs section)
- **Deliverables:**
  - `packages/ui/src/components/button.tsx` — Primary, Secondary, Ghost, Destructive variants
  - `packages/ui/src/components/card.tsx` — Standard + map summary (category left border)
  - `packages/ui/src/components/text-input.tsx` — With label, error, focus states
  - `packages/ui/src/components/badge.tsx` — Category badges (colored pills)
  - `packages/ui/src/components/typography.tsx` — H1, H2, H3, Body, BodySmall, Caption, ButtonText
  - `packages/ui/src/components/skeleton.tsx` — Shimmer loading placeholder
  - All components use theme tokens. All have accessibilityLabel props.
- **Commit:** `feat(ui): add core component library (Button, Card, Input, Badge, Typography, Skeleton)`
- [x] Done

### P1-T4: Supabase schema and RLS
- **Depends on:** P1-T1
- **Spec:** CLAUDE.md (Database Schema section) + `.claude/rules/database.md`
- **Deliverables:**
  - `supabase/migrations/00001_initial_schema.sql` — All core tables with PostGIS, RLS enabled, indexes
  - `supabase/migrations/00002_rls_policies.sql` — Citizen, moderator, government, admin policies
  - `apps/mobile/lib/supabase.ts` — Supabase client init (anon key from env)
  - `packages/shared/src/types/database.ts` — TypeScript types matching schema (manual for now, later generated)
- **Commit:** `feat(db): initial schema with PostGIS, RLS policies, and client setup`
- [x] Done

### P1-T5: i18n setup
- **Depends on:** P1-T1
- **Spec:** `docs/specs/ENGINEERING_GUIDE.md` Part 6
- **Deliverables:**
  - `packages/shared/src/i18n/config.ts` — i18next configuration
  - `packages/shared/src/i18n/es.json` — Spanish strings (first 50 keys: nav, common actions, auth screens)
  - `packages/shared/src/i18n/en.json` — English strings (same 50 keys)
  - `apps/mobile/app/_layout.tsx` — i18n provider wrapping app
- **Commit:** `feat(i18n): setup react-i18next with initial es/en translations`
- [x] Done

### P1-T6: Auth flow
- **Depends on:** P1-T3, P1-T4, P1-T5
- **Spec:** `docs/specs/PRD.md` (User Registration section)
- **Deliverables:**
  - `apps/mobile/app/auth/login.tsx` — Magic link + SMS OTP login screen
  - `apps/mobile/app/auth/register.tsx` — Registration: name, email, phone, municipality dropdown, privacy acceptance
  - `apps/mobile/app/auth/verify.tsx` — OTP verification screen
  - `apps/mobile/hooks/use-auth.ts` — Auth state hook wrapping Supabase auth
  - Auth guard in `_layout.tsx` redirecting unauthenticated users
- **Commit:** `feat(auth): implement magic link + SMS OTP login and registration`
- [x] Done

### P1-T7: Map screen (basic)
- **Depends on:** P1-T3, P1-T4
- **Spec:** `docs/specs/ENGINEERING_GUIDE.md` Part 3 (Sitemap, route `/`)
- **Deliverables:**
  - `apps/mobile/app/(tabs)/index.tsx` — Full-screen Mapbox map, centered on Tijuana (32.5149, -117.0382)
  - `apps/mobile/components/map/map-view.tsx` — Mapbox wrapper component
  - `apps/mobile/components/map/case-pin.tsx` — Custom SVG pin component, color-coded by category
  - `apps/mobile/components/map/case-summary-card.tsx` — Bottom sheet summary on pin tap
  - Basic data fetch from Supabase cases table within viewport bounds
- **Commit:** `feat(map): implement Mapbox map with case pins and summary cards`
- [x] Done

---

## Phase 2: Core Reporting

### P2-T1: Report submission flow
- **Commit:** `feat(report): implement multi-step case report submission flow`
- [x] Done

### P2-T2: Image compression pipeline
- **Commit:** `feat(report): add client-side image compression and upload pipeline`
- [x] Done

### P2-T3: Case detail screen
- **Commit:** `feat(case): add case detail screen with photo gallery and timeline`
- [x] Done

### P2-T4: Map filters and clustering
- **Commit:** `feat(map): add filter bar and pin clustering`
- [x] Done

### P2-T5: Jurisdiction boundary overlays
- **Commit:** `feat(map): add jurisdiction boundary overlays with zoom-adaptive simplification`
- [x] Done

---

## Phase 3: Moderation + Notifications

### P3-T1: Moderator review queue
- **Commit:** `feat(moderation): add moderator review queue with verify/reject/flag actions`
- [x] Done

### P3-T2: Community flagging
- **Commit:** `feat(moderation): add community flagging with auto-hide at 3 flags`
- [x] Done

### P3-T3: Push notifications (FCM)
- **Commit:** `feat(notifications): add push notifications for case updates`
- [x] Done

### P3-T4: Notification preferences
- **Commit:** `feat(settings): add notification preference toggles`
- [x] Done

---

## Phase 4: Government Integration

### P4-T1: Email escalation system
- **Commit:** `feat(escalation): add email escalation to jurisdiction authorities`
- [x] Done

### P4-T2: Inbound email parsing
- **Commit:** `feat(escalation): add inbound email parsing for government replies`
- [x] Done

### P4-T3: Government account portal
- **Commit:** `feat(government): add government portal with case management and folio assignment`
- [x] Done

### P4-T4: Auto-escalation timers
- **Commit:** `feat(escalation): add auto-escalation timers with 5/15/30 day reminders`
- [x] Done

---

## Phase 5: Launch Readiness

### P5-T1: Mercado Pago donations
- **Depends on:** P1-T4 (schema), P1-T6 (auth)
- **Spec:** `docs/specs/PROJECT_BRIEF.md` (Phase 5 — "Mercado Pago donation integration")
- **Deliverables:**
  - `supabase/functions/create-donation/index.ts` — Edge Function: creates Mercado Pago payment preference (checkout link). Supports OXXO, SPEI, credit/debit card. Returns checkout URL.
  - `supabase/functions/donation-webhook/index.ts` — Edge Function: receives Mercado Pago IPN webhook, updates donation status in DB, inserts success/failure record
  - `apps/mobile/app/donate.tsx` — Donation screen: amount picker (preset + custom), payment method selector, opens Mercado Pago checkout via WebBrowser
  - `apps/mobile/hooks/use-donate.ts` — Hook: createDonation, tracks payment state
  - `apps/mobile/components/donate/amount-picker.tsx` — Preset amounts ($50, $100, $200, $500 MXN) + custom input
  - `apps/mobile/components/donate/payment-methods.tsx` — Payment method selector (card, OXXO, SPEI)
  - i18n: add `donate.title`, `donate.amount`, `donate.customAmount`, `donate.paymentMethod`, `donate.processing`, `donate.thankYou`, `donate.error` keys to both JSON files
- **Commit:** `feat(donations): add Mercado Pago donation flow with OXXO and SPEI support`
- [ ] Done

### P5-T2: Public impact dashboard
- **Depends on:** P1-T4 (schema)
- **Spec:** `docs/specs/PROJECT_BRIEF.md` (Phase 5 — "Public impact dashboard")
- **Deliverables:**
  - `apps/mobile/app/(tabs)/dashboard.tsx` — Dashboard tab screen: public-facing stats and charts
  - `apps/mobile/hooks/use-dashboard-stats.ts` — Hook: fetches aggregated stats via Supabase RPC (total cases, resolved %, by category, by jurisdiction, avg resolution time, donation total)
  - `supabase/migrations/20250214000012_dashboard_stats_function.sql` — SQL function returning aggregated stats (avoids exposing raw data)
  - `apps/mobile/components/dashboard/stat-card.tsx` — Card displaying single stat with icon, value, label
  - `apps/mobile/components/dashboard/category-chart.tsx` — Simple bar chart showing cases by category (abuse, stray, missing)
  - `apps/mobile/components/dashboard/resolution-rate.tsx` — Circular progress indicator showing resolution percentage
  - Update `apps/mobile/app/(tabs)/_layout.tsx` — Add Dashboard tab with `BarChart3` icon
  - i18n: add `dashboard.title`, `dashboard.totalCases`, `dashboard.resolvedRate`, `dashboard.byCategory`, `dashboard.byJurisdiction`, `dashboard.avgResolution`, `dashboard.totalDonations` keys to both JSON files
- **Commit:** `feat(dashboard): add public impact dashboard with stats and charts`
- [ ] Done

### P5-T3: About Us page
- **Depends on:** P1-T3 (UI components)
- **Spec:** `docs/specs/PROJECT_BRIEF.md` (Phase 5)
- **Deliverables:**
  - `apps/mobile/app/about.tsx` — About Us screen: mission statement, team info, open source links, contact, social media
  - `apps/mobile/components/about/mission-section.tsx` — Mission statement with Lomito branding
  - `apps/mobile/components/about/team-section.tsx` — Team/org info cards
  - `apps/mobile/components/about/links-section.tsx` — External links: GitHub repo, website, contact email, social media
  - i18n: add `about.title`, `about.mission`, `about.missionText`, `about.team`, `about.openSource`, `about.contact`, `about.website` keys to both JSON files
- **Commit:** `feat(about): add About Us page with mission, team, and links`
- [ ] Done

### P5-T4: Legal documents
- **Depends on:** P1-T5 (i18n)
- **Spec:** `docs/specs/PROJECT_BRIEF.md` (Phase 5 — "Legal documents: privacy notice, TOS, security policy")
- **Deliverables:**
  - `apps/mobile/app/legal/privacy.tsx` — Privacy notice screen (renders markdown/text content)
  - `apps/mobile/app/legal/terms.tsx` — Terms of service screen
  - `apps/mobile/app/legal/_layout.tsx` — Stack layout for legal screens
  - `packages/shared/src/legal/privacy-es.ts` — Privacy notice text (Spanish, LFPDP compliant)
  - `packages/shared/src/legal/privacy-en.ts` — Privacy notice text (English)
  - `packages/shared/src/legal/terms-es.ts` — Terms of service (Spanish)
  - `packages/shared/src/legal/terms-en.ts` — Terms of service (English)
  - i18n: add `legal.privacy`, `legal.terms`, `legal.lastUpdated` keys to both JSON files
- **Commit:** `feat(legal): add privacy notice and terms of service screens`
- [ ] Done

### P5-T5: Performance audit
- **Depends on:** all previous phases
- **Spec:** CLAUDE.md (Performance Budgets)
- **Deliverables:**
  - `apps/mobile/lib/performance.ts` — Performance monitoring utilities: measure cold start, screen transition times, API call durations
  - Review and optimize: lazy loading for screens, memoization audit (useMemo/useCallback), image optimization check, bundle size analysis
  - `docs/audit/performance-report.md` — Performance audit report with findings and optimizations applied
- **Commit:** `perf: performance audit and optimizations`
- [ ] Done

### P5-T6: App Store + Play Store submission
- **Depends on:** P5-T5, P5-T4
- **Spec:** `docs/specs/PROJECT_BRIEF.md` (Phase 5)
- **Deliverables:**
  - `apps/mobile/app.json` — Updated with store metadata: name, description, version, icon, splash, iOS/Android config
  - `apps/mobile/eas.json` — EAS Build configuration for production builds
  - `docs/store/app-store-listing.md` — App Store listing text (English + Spanish)
  - `docs/store/play-store-listing.md` — Play Store listing text (English + Spanish)
  - `docs/store/screenshots.md` — Screenshot requirements checklist
- **Commit:** `chore: prepare App Store and Play Store submission assets`
- [ ] Done
