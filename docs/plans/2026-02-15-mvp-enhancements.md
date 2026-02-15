# MVP Enhancements Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Polish Lomito for MVP launch with legal clarity, feature flags, branding, sharing, footer consistency, homepage engagement, and expanded About page.

**Architecture:** Incremental enhancements to existing Expo Router + React Native web app. Feature flags via a simple config module. Branding assets as static files. About page expansion with dynamic roadmap data.

**Tech Stack:** React Native, Expo Router, react-i18next, SVG/PNG assets

---

## Task 1: Legal Disclaimer — Not a Government Website

**Files:**

- Modify: `apps/mobile/app/about.tsx`
- Modify: `apps/mobile/app/legal/privacy.tsx` (content update)
- Modify: `apps/mobile/app/legal/terms.tsx` (content update)
- Modify: `apps/mobile/app/(public)/index.tsx` (footer disclaimer)
- Modify: `packages/shared/src/i18n/es.json`
- Modify: `packages/shared/src/i18n/en.json`

**What to do:**

1. Add a prominent disclaimer banner to the About page, below the title:
   - ES: "Lomito es una plataforma cívica independiente creada por y para la comunidad. No es un sitio web gubernamental ni está patrocinado, avalado o afiliado a ninguna entidad de gobierno."
   - EN: "Lomito is an independent civic platform created by and for the community. It is not a government website and is not sponsored, endorsed, or affiliated with any government entity."
   - Style: neutral100 background, secondary color left border, Body text

2. Add the same disclaimer to the Privacy Policy and Terms of Service pages as the first paragraph after the title.

3. Add a short footer disclaimer on the landing page footer:
   - ES: "Lomito no es un sitio gubernamental"
   - EN: "Lomito is not a government website"

4. Add all new i18n keys under `"legal"` namespace in both JSON files.

---

## Task 2: Feature Flags Mechanism

**Files:**

- Create: `packages/shared/src/feature-flags.ts`
- Modify: `apps/mobile/app/donate.tsx`
- Modify: `apps/mobile/app/auth/login.tsx`
- Modify: `apps/mobile/components/navigation/web-navbar.tsx`
- Modify: `apps/mobile/app/(tabs)/settings.tsx`
- Modify: `apps/mobile/app/(public)/index.tsx`

**What to do:**

1. Create `packages/shared/src/feature-flags.ts`:

```typescript
/**
 * Feature flags for MVP.
 * Toggle features on/off without code changes.
 * In the future, these can be driven by remote config.
 */
export const featureFlags = {
  /** Enable the donations page and donate nav links */
  donations: false,
  /** Enable SMS/phone login tab on auth screens */
  smsLogin: false,
  /** Enable push notifications settings */
  pushNotifications: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}
```

2. In `donate.tsx`: If `!isFeatureEnabled('donations')`, show a "Coming soon" message instead of the form. Add i18n keys `donate.comingSoon` / `donate.comingSoonDescription`.

3. In `auth/login.tsx`: If `!isFeatureEnabled('smsLogin')`, hide the SMS tab entirely. Show only the magic link form.

4. In `web-navbar.tsx`: If `!isFeatureEnabled('donations')`, hide the "Donar" nav link.

5. In `settings.tsx`: If `!isFeatureEnabled('donations')`, hide the "Donar" button in nav links section.

6. In `(public)/index.tsx` landing page: If `!isFeatureEnabled('donations')`, hide the "Donar" footer link.

---

## Task 3: Logo and OpenGraph Assets

**Files:**

- Create: `apps/mobile/assets/images/logo.svg` (source)
- Create: `apps/mobile/assets/images/logo-full.png` (wordmark, 400x100)
- Create: `apps/mobile/assets/images/og-default.png` (1200x630 OpenGraph)
- Create: `apps/mobile/assets/images/favicon.png` (32x32)
- Modify: `apps/mobile/app/(public)/_layout.tsx` (add meta tags on web)

**What to do:**

This task requires graphic design input. For now, create placeholder assets:

1. Logo concept: A friendly dog silhouette (paw print or dog face outline) in terra cotta (#D4662B) with "Lomito" wordmark in DM Sans Bold.

2. For MVP, generate simple text-based placeholders:
   - Logo: Use the existing "Lomito" text wordmark already in the navbar
   - OG image: Create a simple HTML-to-PNG with brand colors, tagline, and logo
   - Favicon: Simple "L" in terra cotta on white background

3. Add `<meta property="og:*">` tags to the web `<head>` via Expo's `expo-head` or a web-only head component in the public layout:
   - `og:title`: "Lomito — Plataforma civica para bienestar animal"
   - `og:description`: "Reporta y da seguimiento a problemas de bienestar animal en tu comunidad"
   - `og:image`: `/assets/images/og-default.png`
   - `og:type`: "website"
   - `og:url`: "https://lomito.org"

**NOTE:** Actual graphic design should be done by a designer. This task creates the infrastructure and placeholders.

---

## Task 4: Report Sharing Mechanism

**Files:**

- Modify: `apps/mobile/app/case/[id].tsx`
- Create: `apps/mobile/components/case/share-button.tsx`
- Modify: `packages/shared/src/i18n/es.json`
- Modify: `packages/shared/src/i18n/en.json`

**What to do:**

1. Create `share-button.tsx` component:
   - Uses `expo-sharing` on native, `navigator.share` on web (with clipboard fallback)
   - Share URL format: `https://lomito.org/case/{id}`
   - Share text: `t('case.shareText', { id: caseData.folio || caseData.id.slice(0,8) })`
   - Icon: lucide `Share2` icon
   - Button style: ghost/outline matching existing case detail actions

2. Add ShareButton to case detail header (next to existing FlagButton).

3. Add i18n keys:
   - `case.share`: "Compartir" / "Share"
   - `case.shareText`: "Mira este reporte de bienestar animal en Lomito: {{url}}" / "Check out this animal welfare report on Lomito: {{url}}"
   - `case.linkCopied`: "Enlace copiado" / "Link copied"

---

## Task 5: Footer on All Pertinent Web Pages

**Files:**

- Modify: `apps/mobile/components/navigation/app-shell.tsx`
- Modify: `apps/mobile/app/about.tsx`
- Modify: `apps/mobile/app/donate.tsx`
- Modify: `apps/mobile/app/(tabs)/dashboard.tsx`
- Modify: `apps/mobile/app/(tabs)/profile.tsx`
- Modify: `apps/mobile/app/(tabs)/settings.tsx`

**What to do:**

1. The `PageFooter` component already exists. The issue is it's only rendered inline on specific pages.

2. Strategy: Add footer rendering to the `AppShell` layout wrapper for desktop web, but only for non-fullscreen routes. The map and report wizard should NOT have a footer.

3. In `app-shell.tsx`:
   - Import `PageFooter` and `usePathname`
   - Define fullscreen routes that should NOT have footer: `['/', '/(tabs)', '/report']`
   - On desktop web, render `<PageFooter />` after the content `{children}` when NOT on a fullscreen route
   - Wrap content in a flex container so footer is pushed to bottom

4. Remove inline `<PageFooter />` from individual pages that already have it (about.tsx, landing page) since AppShell will provide it.

---

## Task 6: Map Preview + Recent Reports on Homepage

**Files:**

- Modify: `apps/mobile/app/(public)/index.tsx`
- Create: `apps/mobile/components/landing/recent-reports-ticker.tsx`
- Modify: `packages/shared/src/i18n/es.json`
- Modify: `packages/shared/src/i18n/en.json`

**What to do:**

1. Add a "Live Activity" section to the landing page between "How It Works" and "Community":
   - Section title: "Actividad reciente" / "Recent Activity"
   - Left side: Static map image/graphic of Tijuana (placeholder) with colored dots representing reports. For MVP, use a decorative map image since we can't show a live Mapbox map to unauthenticated users without burning API credits.
   - Right side: Scrolling ticker of recent reports (anonymized)

2. Create `recent-reports-ticker.tsx`:
   - For MVP without DB, show placeholder/mock data with realistic-looking entries
   - Each entry: category icon + color dot, anonymized location ("Col. Libertad"), time ago ("hace 2h"), status badge
   - Auto-scrolling vertical list with fade-in/fade-out animation
   - Respect `useReducedMotion()`

3. Add i18n keys:
   - `landing.recentActivity`: "Actividad reciente" / "Recent Activity"
   - `landing.recentActivityDescription`: "Reportes recientes de la comunidad" / "Recent community reports"

---

## Task 7: Expand About Page

**Files:**

- Modify: `apps/mobile/app/about.tsx`
- Modify: `packages/shared/src/i18n/es.json`
- Modify: `packages/shared/src/i18n/en.json`

**What to do:**

1. Add "Why We Build" section (after disclaimer, before Mission):
   - Content: Explain the problem (stray and mistreated animals in Mexican cities, lack of accountability, disconnected citizen complaints) and why Lomito exists (empower communities, create transparency, bridge the gap between citizens and authorities)
   - i18n keys: `about.whyTitle`, `about.whyContent`

2. Add "What We're Building" section (after Mission):
   - Content: Describe the platform — map-centric reporting, jurisdiction-aware tracking, government escalation, community moderation, public transparency dashboard
   - i18n keys: `about.whatTitle`, `about.whatContent`

3. Add "Roadmap" section (after Open Source):
   - Render a list of future features with status badges
   - Data structure:

   ```typescript
   const ROADMAP_ITEMS = [
     { key: 'androidApp', status: 'planned' },
     { key: 'iosApp', status: 'planned' },
     { key: 'petRegistry', status: 'planned' },
     { key: 'missingPetFinder', status: 'exploring' },
     { key: 'osintIngestion', status: 'exploring' },
   ];
   ```

   - Status badges: "Planeado" (planned, secondary color), "Explorando" (exploring, accent color), "En desarrollo" (in_progress, primary color), "Lanzado" (launched, success color)
   - Each item: title + short description from i18n

4. Add all i18n keys:
   - `about.roadmapTitle`: "Proximas funciones" / "Upcoming Features"
   - `about.roadmap.androidApp.title`: "Aplicacion Android" / "Android App"
   - `about.roadmap.androidApp.description`: "App nativa para dispositivos Android" / "Native app for Android devices"
   - `about.roadmap.iosApp.title`: "Aplicacion iOS" / "iOS App"
   - `about.roadmap.iosApp.description`: "App nativa para iPhone y iPad" / "Native app for iPhone and iPad"
   - `about.roadmap.petRegistry.title`: "Registro de mascotas" / "Pet Registry"
   - `about.roadmap.petRegistry.description`: "Registra a tu mascota con nombre, foto, estado de salud y datos del dueño" / "Register your pet with name, photo, health status, and owner information"
   - `about.roadmap.missingPetFinder.title`: "Buscador de mascotas con IA" / "AI Pet Finder"
   - `about.roadmap.missingPetFinder.description`: "Busca mascotas perdidas usando reconocimiento de imagenes con inteligencia artificial" / "Search for missing pets using AI-powered image recognition"
   - `about.roadmap.osintIngestion.title`: "Datos publicos (OSINT)" / "Public Data (OSINT)"
   - `about.roadmap.osintIngestion.description`: "Ingesta automatica de datos publicos sobre mascotas y reportes de bienestar animal" / "Automatic ingestion of public data about pets and animal welfare reports"
   - Status labels: `about.roadmap.status.planned`, `about.roadmap.status.exploring`, `about.roadmap.status.inProgress`, `about.roadmap.status.launched`

---

## Execution Order

```
Phase A: Task 2 (Feature Flags) — foundational, other tasks depend on it
Phase B (parallel): Task 1 (Legal) + Task 4 (Sharing) + Task 5 (Footer)
Phase C (parallel): Task 6 (Homepage) + Task 7 (About Page)
Phase D: Task 3 (Logo/OG) — can be done last, mostly asset creation
```

## Verification

1. **Typecheck:** `npx tsc --noEmit` passes
2. **Feature flags:** Donations page shows "coming soon", SMS tab hidden on login, Donar link hidden from navbar
3. **Legal:** Disclaimer visible on About, Privacy, Terms pages
4. **Footer:** Visible on About, Donate, Dashboard, Profile, Settings; NOT on Map or Report
5. **About roadmap:** Shows 5 future features with status badges
6. **i18n:** All new text available in both ES and EN
