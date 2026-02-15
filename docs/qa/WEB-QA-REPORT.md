# Lomito Web QA Report

**Date:** 2026-02-15
**Environment:** Local dev (Expo 8081, Supabase 54331)
**Browser:** Chromium (Playwright)
**Viewport:** 1280x800 (desktop)
**Test Account:** test@lomito.org (citizen role)

---

## User Stories

### US-1: First-Time Visitor (Unauthenticated)
> As a concerned citizen visiting lomito.org for the first time, I want to understand what the platform does and how to get started, so I can decide whether to create an account and report an animal welfare issue.

**Flow:** Landing page -> Browse About/Donate/Legal -> Click "Reportar Ahora" or "Iniciar sesion" -> Register -> Verify -> Map

### US-2: Returning Citizen (Authenticated)
> As a registered citizen, I want to log in, view the map of reported cases, submit a new report with photos and location, and track its status over time.

**Flow:** Login (magic link/SMS) -> Map -> New Report (5-step wizard) -> My Reports (Profile) -> Case Detail -> Track updates

### US-3: Community Donor
> As someone who cares about animal welfare, I want to donate to support the platform's operating costs (server, SMS) using local payment methods like OXXO or credit card.

**Flow:** Landing/Navbar -> Donate -> Select amount -> Choose payment method -> Submit

### US-4: Settings & Preferences
> As a user, I want to manage my notification preferences, switch between Spanish and English, and access legal documents and support pages.

**Flow:** Settings -> Toggle notifications -> Switch language -> View Privacy/Terms -> Sign out

### US-5: Moderator Review
> As a volunteer moderator, I want to review pending cases in my jurisdiction, verify or flag them, and escalate urgent cases to government authorities.

**Flow:** Login -> Moderation tab -> Review queue -> Verify/Flag/Escalate case

### US-6: Government Response
> As a government official, I want to see escalated cases in my jurisdiction and respond to them with official status updates.

**Flow:** Login -> Government portal -> View escalated cases -> Update status -> Post response

---

## Route Checklist & Findings

### Legend
- [x] Pass
- [ ] Fail / Issue found
- [~] Works but has issues (non-blocking)

---

### 1. Landing Page — `/(public)/index.tsx`
**User Story:** US-1

| Check | Status | Notes |
|-------|--------|-------|
| Page loads without errors | [x] | 0 JS errors, 3 warnings (shadow deprecation, Mapbox token, push notifications) |
| Hero section renders | [x] | Tagline, subtitle, two CTAs present |
| "Reportar Ahora" CTA works | [x] | Navigates to auth (unauthenticated) |
| "Ver Mapa" CTA works | [x] | Navigates to auth (unauthenticated) |
| How It Works section | [x] | 3-step cards with icons render correctly |
| Community section | [x] | Mission text present |
| Footer renders | [x] | Links to About, Donate, Privacy, Terms all work |
| Language toggle in footer | [x] | "English" button present |
| Responsive layout | [x] | Content constrained with Container max-width |
| All text in Spanish | [x] | All user-facing strings localized |
| "Iniciar sesion" header CTA | [x] | Navigates to /auth/login |

**Issues:**
- **P3 — UX:** Authenticated users who visit the landing page are NOT redirected to the app. They see the landing page with "Iniciar sesion" button even though they're logged in. The auth guard (line 38 in `_layout.tsx`) only redirects unauthenticated users away from protected routes, not authenticated users away from `(public)`.

---

### 2. Login — `/auth/login.tsx`
**User Story:** US-1, US-2

| Check | Status | Notes |
|-------|--------|-------|
| Page loads | [x] | Split layout: branding sidebar + form |
| Magic link tab | [x] | Email input + send button |
| SMS tab | [x] | Phone input visible when selected |
| Magic link sends | [x] | Email arrives in local Mailpit |
| Magic link login works | [x] | Token in URL hash -> session created -> redirected to app |
| AppModal confirmation | [x] | "Revisa tu correo..." modal appears on send |
| "No tienes cuenta?" link | [x] | Navigates to /auth/register |
| All text in Spanish | [x] | Headings, labels, buttons localized |
| Auth redirect (authenticated) | [x] | Authenticated user redirected to /(tabs) |

**Issues:**
- **P2 — A11y:** `aria-hidden` warning on element that contains focused content (console warning)
- **P3 — HTML:** `<div>` nested inside `<button>` causes React DOM nesting warnings (2 errors in console)

---

### 3. Register — `/auth/register.tsx`
**User Story:** US-1

| Check | Status | Notes |
|-------|--------|-------|
| Page loads | [x] | Split layout matches login |
| Name, email, phone, municipality fields | [x] | All present with placeholders |
| Password field | [x] | Present with show/hide toggle |
| Terms checkbox | [x] | Links to Privacy and Terms |
| Submit button | [x] | "Crear cuenta" |
| Link to login | [x] | "Ya tienes cuenta? Iniciar sesion" |
| All text in Spanish | [x] | Localized |

**Issues:** None found on visual inspection.

---

### 4. Map — `/(tabs)/index.tsx`
**User Story:** US-2

| Check | Status | Notes |
|-------|--------|-------|
| Desktop navbar visible | [x] | Lomito, Mapa, Tablero, Acerca de Lomito, Donar, EN, Nuevo reporte |
| "Mapa" highlighted as active | [x] | Primary color underline |
| Category filter bar | [x] | Todos, Maltrato, Callejero, Extraviado |
| Status filter bar | [x] | Todos, Pendiente, Verificado, En progreso, Resuelto |
| Map placeholder | [x] | Shows "Set EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN" message |
| Boundary toggle button | [x] | Present |
| FAB "+" button | [x] | Bottom-right, terra cotta color |
| "Nuevo reporte" navbar CTA | [x] | Navigates to /report/new |
| Bottom tabs hidden (desktop) | [x] | Only navbar visible |
| All text in Spanish | [x] | Filter labels localized |

**Issues:**
- **P2 — UX:** FAB button visible on desktop even though "Nuevo reporte" is already in the navbar. Should be hidden on desktop (per plan Task 3.3).
- **P3 — i18n:** Map placeholder text "Map" and "Set EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN in .env to enable the map." is in English (developer message, acceptable).

---

### 5. Dashboard — `/(tabs)/dashboard.tsx`
**User Story:** US-2

| Check | Status | Notes |
|-------|--------|-------|
| Page loads | [x] | Renders with navbar |
| Title "Tablero de impacto" | [x] | Localized |
| Error state for missing RPC | [x] | Shows error message (expected - no DB function) |
| Navbar active state | [~] | "Tablero" not highlighted as active (URL is /dashboard, not matching nav link detection) |

**Issues:**
- **P1 — Backend:** `get_dashboard_stats` RPC function missing from DB. Needs migration.
- **P2 — UX:** Error message shows raw technical text: `"Error: Could not find the function public.get_dashboard_stats..."`. Should show user-friendly error.
- **P2 — Nav:** "Tablero" nav link not highlighted when on /dashboard route.

---

### 6. Profile — `/(tabs)/profile.tsx`
**User Story:** US-2

| Check | Status | Notes |
|-------|--------|-------|
| Page loads | [x] | Renders with navbar |
| Avatar placeholder | [x] | Gray circle with skeleton loading |
| Name skeleton | [x] | Shows loading skeleton (profile table missing) |
| Empty state "Sin reportes" | [x] | Localized empty state message |
| No link to Profile in navbar | [~] | Profile is only accessible via bottom tabs (hidden on desktop) |

**Issues:**
- **P1 — Nav:** No way to navigate to Profile page on desktop web. Bottom tabs are hidden and navbar has no Profile/avatar link. User is stuck.
- **P2 — Backend:** Profile data not loading (expected - profiles table missing).

---

### 7. Settings — `/(tabs)/settings.tsx`
**User Story:** US-4

| Check | Status | Notes |
|-------|--------|-------|
| Page loads | [x] | Full settings UI renders |
| Account section | [x] | Shows email (test@lomito.org) |
| Notification toggles (3) | [x] | Push, Email, Report updates - all toggle |
| Language picker | [x] | Espanol/English radio buttons |
| Nav links (About, Donate) | [x] | Present and clickable |
| Legal links (Privacy, Terms) | [x] | Present and clickable |
| Sign out button | [x] | "Cerrar sesion" button present |
| All text in Spanish | [x] | Localized |
| No link to Settings in navbar | [~] | Only accessible via bottom tabs (hidden on desktop) |

**Issues:**
- **P1 — Nav:** Same as Profile - no way to navigate to Settings on desktop web. Needs user avatar dropdown in navbar.
- **P3 — UX:** "CUENTA" label uses all-caps styling that looks like a section header, but the design tokens call for H2 sections.

---

### 8. New Report — `/report/new.tsx`
**User Story:** US-2

| Check | Status | Notes |
|-------|--------|-------|
| Page loads | [x] | Multi-step wizard renders |
| Step indicator "1 / 5" | [x] | Progress bar with 5 segments |
| "Atras" back button | [x] | Present |
| Category selection (3 cards) | [x] | Maltrato, Callejero, Extraviado |
| Animal type chips (4) | [x] | Perro, Gato, Ave, Otro |
| "Siguiente" button disabled | [x] | Correctly disabled until selection |
| All headings in Spanish | [x] | "Que sucedio?" localized |

**Issues:**
- **P1 — i18n:** Category descriptions show raw i18n keys instead of translated text. **Root cause:** Case mismatch — code generates `categoryAbuseDescription` (camelCase) but JSON files have `categoryabuseDescription` (all lowercase). Fix: rename keys in both `es.json` and `en.json`:
  - `report.categoryabuseDescription` -> `report.categoryAbuseDescription`
  - `report.categorystrayDescription` -> `report.categoryStrayDescription`
  - `report.categorymissingDescription` -> `report.categoryMissingDescription`
- **P3 — UX:** Category cards have placeholder colored backgrounds (pink, yellow, blue) but no icons.

---

### 9. Case Detail — `/case/[id].tsx`
**User Story:** US-2

| Check | Status | Notes |
|-------|--------|-------|
| Page loads | [x] | Renders with navbar and heading |
| Title "Detalles del caso" | [x] | Localized |
| Error state | [x] | Shows error when case not found |

**Issues:**
- **P1 — Backend:** Cases table missing from DB. Needs migration.
- **P2 — i18n:** Error message "Failed to fetch case" is in English. Needs translation.

---

### 10. About — `/about.tsx`
**User Story:** US-1, US-4

| Check | Status | Notes |
|-------|--------|-------|
| Page loads | [x] | Renders correctly |
| "Acerca de Lomito" active in navbar | [x] | Highlighted with primary color |
| Mission section | [x] | Card with description |
| Team section | [x] | Card with description |
| Open Source section | [x] | Card with contribution invite |
| Contact links (Website, GitHub, Email) | [x] | All present with external link icons |
| Footer | [x] | Standard footer with nav links |
| All text in Spanish | [x] | Localized |
| Responsive max-width | [x] | Content properly constrained |

**Issues:** None.

---

### 11. Donate — `/donate.tsx`
**User Story:** US-3

| Check | Status | Notes |
|-------|--------|-------|
| Page loads | [x] | Renders correctly |
| "Donar" active in navbar | [x] | Highlighted with primary color |
| Trust card ("A donde va tu donacion") | [x] | Transparency messaging |
| Amount presets ($50, $100, $200, $500) | [x] | $100 selected by default |
| Custom amount input | [x] | "Monto personalizado" with $ and MXN |
| Minimum notice | [x] | "Minimo $10 MXN" |
| Payment methods | [x] | Tarjeta de credito/debito (card) selected |
| Submit CTA | [x] | "Enviar $100 MXN" |
| Back arrow | [x] | Present |
| All text in Spanish | [x] | Localized |
| Responsive centered layout | [x] | Content properly constrained |

**Issues:** None on visual inspection.

---

### 12. Privacy Policy — `/legal/privacy.tsx`
**User Story:** US-4

| Check | Status | Notes |
|-------|--------|-------|
| Page loads | [x] | Renders correctly |
| Title "Aviso de Privacidad" | [x] | In page header |
| Semantic headings (H2) | [x] | ALL CAPS sections rendered as H2 by LegalTextRenderer |
| Body text readable | [x] | Max-width constrained, good line length |
| Content in Spanish | [x] | Legal document in es-MX as expected |
| Navbar visible (authenticated) | [x] | Full navbar present |

**Issues:** None.

---

### 13. Terms of Service — `/legal/terms.tsx`
**User Story:** US-4

| Check | Status | Notes |
|-------|--------|-------|
| Page loads | [x] | Same layout as Privacy |
| Semantic headings | [x] | Renders correctly |
| Content in Spanish | [x] | Legal document in es-MX |

**Issues:** None.

---

### 14. Moderation — `/(tabs)/moderation.tsx`
**User Story:** US-5

| Check | Status | Notes |
|-------|--------|-------|
| Page loads | [x] | Renders with heading |
| Title "Casos pendientes" | [x] | Localized |
| Empty state "No hay casos pendientes" | [x] | Localized |
| Case count badge | [~] | Shows "0 cases" (English) |

**Issues:**
- **P2 — i18n:** "0 cases" counter text is hardcoded English at `moderation.tsx:93`: `{cases.length === 1 ? 'case' : 'cases'}`. Fix: use `t('moderation.casesCount', { count: cases.length })` with i18next plural rules.
- **P2 — Nav:** Moderation tab not visible in desktop navbar for moderator users (role-based nav not testable with citizen account).
- **P2 — Access:** Any authenticated user can access /moderation directly via URL. Should check role and show access denied.

---

### 15. Government Portal — `/(tabs)/government.tsx`
**User Story:** US-6

| Check | Status | Notes |
|-------|--------|-------|
| Page loads | [x] | Renders with heading |
| Title "Portal gubernamental" | [x] | Localized |
| Error state | [x] | Shows DB column error (expected) |

**Issues:**
- **P1 — Backend:** `cases.escalated_at` column missing. Needs migration.
- **P2 — i18n:** Error message is raw SQL error shown to user. Should be user-friendly. Also `government.tsx:140` has same hardcoded `'case' : 'cases'` English string as moderation.
- **P2 — Access:** Same as Moderation - any authenticated user can access /government via URL.

---

## Cross-Cutting Issues

### Navigation (P1)
- **No Profile/Settings access on desktop:** Bottom tabs are hidden on desktop web, and the navbar has no user avatar dropdown or links to Profile/Settings. This makes these pages completely inaccessible on desktop.
- **Recommendation:** Add user avatar button to right side of navbar that opens dropdown with: Profile, Settings, Sign Out.

### Auth Flow (P3)
- **Authenticated users see landing page:** When a logged-in user visits the root URL, they see the public landing page instead of being redirected to the app. The `_layout.tsx` auth guard doesn't redirect authenticated users away from `(public)` routes.
- **Recommendation:** Add redirect logic: `if (session && segments[0] === '(public)') router.replace('/(tabs)');`

### i18n (P1-P2)
- 3 report category description keys with case mismatch in JSON (P1)
- "Case Details" hardcoded in `_layout.tsx:72` Stack.Screen title (P2)
- "0 cases" hardcoded English in moderation.tsx:93 and government.tsx:140 (P2)
- Various error messages shown as raw technical text (P2)

### Backend (P1 - Blocked)
All DB-dependent features are blocked until migrations are run:
- `profiles` table (profile data, user display)
- `cases` table (map markers, case detail, moderation queue)
- `get_dashboard_stats` RPC function (dashboard)
- `cases.escalated_at` column (government portal)
- `notification_preferences` table (settings notification toggles)

### Console Warnings (P3)
- `Layout children must be of type Screen` — repeated across all tab routes. Likely from non-Screen children in tab layout.
- `shadow* style props are deprecated` — needs migration to `boxShadow` style.
- `props.pointerEvents is deprecated` — needs migration to `style.pointerEvents`.

---

## Priority Summary

| Priority | Count | Examples |
|----------|-------|---------|
| **P0** | 0 | — |
| **P1** | 4 | Desktop nav missing Profile/Settings; missing i18n keys in report form; DB migrations needed |
| **P2** | 7 | FAB on desktop; dashboard error UX; nav active states; role-based access; i18n gaps |
| **P3** | 5 | Authenticated landing page; console warnings; minor styling |

---

## Recommended Next Steps

1. **Add user avatar dropdown to desktop navbar** (P1 — unblocks Profile/Settings access)
2. **Add missing i18n keys** for report category descriptions (P1)
3. **Run database migrations** to unblock all data-dependent features (P1)
4. **Hide FAB on desktop** when navbar has "Nuevo reporte" (P2)
5. **Add role-based route guards** for moderation/government (P2)
6. **Redirect authenticated users** from landing page to app (P3)
7. **Replace raw error messages** with user-friendly i18n text (P2)
