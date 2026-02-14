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
- **Depends on:** P1-T7 (map), P1-T6 (auth)
- **Spec:** `docs/specs/PROJECT_BRIEF.md` (Phase 2), CLAUDE.md (Database Schema)
- **Deliverables:**
  - `apps/mobile/app/report/new.tsx` — Multi-step report form screen (step 1: category + animal type, step 2: map pin drop for location, step 3: description + urgency, step 4: review + submit)
  - `apps/mobile/app/report/_layout.tsx` — Stack layout for report flow
  - `apps/mobile/hooks/use-create-case.ts` — Hook: inserts into `cases` table via Supabase, handles loading/error state
  - `apps/mobile/components/report/category-picker.tsx` — Grid of category cards (abuse, stray, missing) with icons and colors from tokens
  - `apps/mobile/components/report/animal-type-picker.tsx` — Animal type selector (dog, cat, bird, other)
  - `apps/mobile/components/report/urgency-picker.tsx` — Urgency level selector (low, medium, high, critical) with color coding
  - `apps/mobile/components/report/location-picker.tsx` — Mapbox map with draggable pin for location selection, shows current address
  - `apps/mobile/components/report/review-step.tsx` — Summary of report before submission with edit links back to previous steps
  - i18n: add `report.step1Title`, `report.step2Title`, `report.step3Title`, `report.step4Title`, `report.selectCategory`, `report.selectAnimalType`, `report.selectUrgency`, `report.dropPin`, `report.reviewSubmit` keys to both es.json and en.json
- **Commit:** `feat(report): implement multi-step case report submission flow`
- [ ] Done

### P2-T2: Image compression pipeline
- **Depends on:** P2-T1
- **Spec:** CLAUDE.md (Performance Budgets, Key Technical Decisions #4)
- **Deliverables:**
  - `apps/mobile/lib/image-compression.ts` — Compress images: max 1200px longest edge, JPEG quality 0.8, strip EXIF GPS data. Use `expo-image-manipulator` for resize/compress.
  - `apps/mobile/lib/image-upload.ts` — Upload compressed images to Supabase Storage bucket `case-media`, returns public URL. Generates thumbnail (400px).
  - `apps/mobile/hooks/use-image-picker.ts` — Hook wrapping `expo-image-picker`: pick from camera or gallery, compress, return local URI + metadata
  - `apps/mobile/components/report/photo-picker.tsx` — Photo attachment UI: grid of thumbnails (max 5), add button, remove button, shows compression progress
  - Update `apps/mobile/app/report/new.tsx` — Add photo step between step 3 (description) and step 4 (review), show photo thumbnails in review
  - i18n: add `report.addPhotos`, `report.maxPhotos`, `report.compressing`, `report.removePhoto` keys to both JSON files
- **Commit:** `feat(report): add client-side image compression and upload pipeline`
- [ ] Done

### P2-T3: Case detail screen
- **Depends on:** P2-T1
- **Spec:** `docs/specs/PROJECT_BRIEF.md` (Phase 2)
- **Deliverables:**
  - `apps/mobile/app/case/[id].tsx` — Case detail screen with dynamic route
  - `apps/mobile/hooks/use-case.ts` — Hook: fetches case by ID with media and timeline, realtime subscription on case_timeline
  - `apps/mobile/components/case/photo-gallery.tsx` — Horizontal scrollable photo gallery using `expo-image` with blurhash placeholders, tap to fullscreen
  - `apps/mobile/components/case/timeline.tsx` — Vertical timeline of case events from case_timeline table, icon + text per action type, timestamp
  - `apps/mobile/components/case/case-header.tsx` — Category badge, status badge, animal type, urgency indicator, folio number, jurisdiction name
  - `apps/mobile/components/case/case-map.tsx` — Small static map showing case location pin
  - i18n: add `case.details`, `case.timeline`, `case.photos`, `case.jurisdiction`, `case.folio`, `case.reportedBy`, `case.noPhotos`, `case.noTimeline` keys to both JSON files
- **Commit:** `feat(case): add case detail screen with photo gallery and timeline`
- [ ] Done

### P2-T4: Map filters and clustering
- **Depends on:** P1-T7
- **Spec:** `docs/specs/PROJECT_BRIEF.md` (Phase 2)
- **Deliverables:**
  - `apps/mobile/components/map/filter-bar.tsx` — Horizontal scrollable filter bar above map: category pills (all, abuse, stray, missing), status pills (all, pending, verified, in_progress, resolved)
  - `apps/mobile/hooks/use-map-filters.ts` — Hook: manages filter state (selectedCategories, selectedStatuses), applies to Supabase query
  - `apps/mobile/components/map/cluster-layer.tsx` — Mapbox clustering: group nearby pins into circles with count, gradient from dominant category color, expand on tap
  - Update `apps/mobile/app/(tabs)/index.tsx` — Integrate filter bar and clustering, re-fetch cases when filters change, viewport-bounded queries using map bounds
  - i18n: add `map.allCategories`, `map.allStatuses`, `map.casesInView`, `map.clusterCount` keys to both JSON files
- **Commit:** `feat(map): add filter bar and pin clustering`
- [ ] Done

### P2-T5: Jurisdiction boundary overlays
- **Depends on:** P1-T4 (schema), P1-T7 (map)
- **Spec:** `.claude/rules/database.md` (PostGIS section)
- **Deliverables:**
  - `apps/mobile/hooks/use-jurisdictions.ts` — Hook: fetches jurisdiction boundary polygons from Supabase, simplifies with ST_Simplify for current zoom level
  - `apps/mobile/components/map/jurisdiction-layer.tsx` — Mapbox FillLayer + LineLayer rendering jurisdiction boundaries as semi-transparent overlays with labeled names
  - `supabase/functions/jurisdiction-boundaries/index.ts` — Edge Function: returns simplified GeoJSON for jurisdictions within a bounding box, zoom-adaptive simplification
  - Update `apps/mobile/app/(tabs)/index.tsx` — Add jurisdiction overlay toggle, show jurisdiction name on boundary tap
  - i18n: add `map.showBoundaries`, `map.hideBoundaries`, `map.jurisdictionInfo` keys to both JSON files
- **Commit:** `feat(map): add jurisdiction boundary overlays with zoom-adaptive simplification`
- [ ] Done

---

## Phase 3: Moderation + Notifications

### P3-T1: Moderator review queue
### P3-T2: Community flagging
### P3-T3: Push notifications (FCM)
### P3-T4: Notification preferences

---

## Phase 4: Government Integration

### P4-T1: Email escalation system
### P4-T2: Inbound email parsing
### P4-T3: Government account portal
### P4-T4: Auto-escalation timers

---

## Phase 5: Launch Readiness

### P5-T1: Mercado Pago donations
### P5-T2: Public impact dashboard
### P5-T3: About Us page
### P5-T4: Legal documents
### P5-T5: Performance audit
### P5-T6: App Store + Play Store submission
