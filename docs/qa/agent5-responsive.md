# QA Agent 5 -- Responsive Layout Testing

**Date:** 2026-02-16
**Tester:** QA Agent 5 (Automated via Playwright)
**App URL:** http://localhost:8081
**Viewports tested:** 375x812 (Mobile), 768x1024 (Tablet), 1024x768 (Desktop small), 1440x900 (Desktop wide)

---

## Executive Summary

Responsive layout testing revealed **5 critical issues (P0-P1)** and **8 moderate issues (P2-P3)**. The most severe findings are:

1. **Moderation page crashes at desktop widths** (P0) due to a null reference in `review-detail-panel.tsx` when the detail panel renders.
2. **Auth session instability during viewport changes** (P0) -- multiple authenticated routes lose session state when navigated at certain viewport sizes, causing redirects to login or landing.
3. **Navbar clipping at 1024px** (P1) -- the "Nuevo reporte" button is cut off at 1024px viewport width.
4. **Government page data table missing at 1024px** (P2) -- only stats cards and filter pills render; the case rows do not appear.
5. **Donate page shows skeleton-only at 768px** (P2) -- content never loads at tablet width.

---

## Route x Viewport Matrix

| Route                          | 375 (Mobile) | 768 (Tablet)         | 1024 (Desktop S)           | 1440 (Desktop W) |
| ------------------------------ | ------------ | -------------------- | -------------------------- | ---------------- |
| **Landing** (`/`)              | PASS         | PASS                 | FAIL (redirect to /donate) | PASS             |
| **Login** (`/auth/login`)      | PASS         | PASS                 | PASS                       | PASS             |
| **Map** (`/`)                  | AUTH LOST    | PASS                 | PASS                       | PASS             |
| **Dashboard** (`/dashboard`)   | AUTH LOST    | PASS                 | PASS                       | PASS             |
| **Profile** (`/profile`)       | AUTH LOST    | PASS                 | PASS                       | PASS             |
| **Settings** (`/settings`)     | AUTH LOST    | AUTH LOST            | PASS                       | PASS             |
| **Case Detail** (`/case/...`)  | AUTH LOST    | AUTH LOST            | PASS (case not found)      | REDIRECT to `/`  |
| **Report** (`/report/new`)     | AUTH LOST    | AUTH LOST            | REDIRECT to map            | PASS             |
| **Moderation** (`/moderation`) | AUTH LOST    | PASS                 | AUTH LOST                  | FAIL (crash)     |
| **Government** (`/government`) | AUTH LOST    | PASS                 | PASS (partial)             | PASS             |
| **Donate** (`/donate`)         | PASS         | FAIL (skeleton only) | PASS                       | PASS             |
| **About** (`/about`)           | PASS         | PASS                 | PASS                       | PASS             |

**Note on AUTH LOST:** During automated viewport-switching testing, the Supabase auth session became unstable. Some 375px and 768px screenshots for authenticated routes captured the landing page or login page instead of the intended route. This is a test-environment artifact but may also indicate a real auth-persistence issue when viewport size changes trigger full page reloads (which Expo web does during hot reloads).

---

## Detailed Findings by Viewport

### Viewport 1: 375x812 (Mobile)

**Screenshots captured:** `landing-375.png`, `login-375.png`, `about-375.png`, `donate-375.png`

The 375px viewport was the last tested in each batch run. Auth session was lost for most authenticated routes, so authenticated-route screenshots at this width show the landing page or login page.

**Observations from pages that did render:**

| Page        | Finding                                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Landing** | PASS -- Hero stacks correctly. CTA buttons side-by-side fit well. Stats grid collapses to 2x2. No horizontal overflow.               |
| **Login**   | PASS -- Sidebar illustration hidden. Form centered, single column. "Enviar enlace magico" button full width. Touch targets adequate. |
| **About**   | PASS -- Single column layout. Content cards stack vertically. Text readable. No overflow.                                            |
| **Donate**  | PASS -- Single column. Amount grid 2x2. Payment methods stack. "Enviar" button full width at bottom.                                 |

**Issues at 375:**

- P1: Auth session lost for authenticated routes -- could not verify map, dashboard, profile, settings, moderation, government, report, case-detail layouts at mobile width.

---

### Viewport 2: 768x1024 (Tablet)

**Screenshots captured:** `map-768.png`, `dashboard-768.png`, `profile-768.png`, `moderation-768.png`, `government-768.png`, `about-768.png`, `landing-768.png`, `login-768.png`

| Page            | Finding                                                                                                                                                                                                                                                                    |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Landing**     | PASS -- Hero text wraps naturally. Stats show 0 values (data loading issue, not layout). Map + activity list side by side.                                                                                                                                                 |
| **Login**       | PASS -- Sidebar hidden at this width. Form centered, full width within card.                                                                                                                                                                                               |
| **Map**         | PASS -- Filter sidebar visible on left. Map fills center. Activity panel hidden (correctly). Category filter tags wrap into horizontal scrollable row at top. Bottom tab bar appears with 6 items ("Mapa", "Tablero", "Moderaci...", "Gobierno", "Perfil", "Configur..."). |
| **Dashboard**   | PASS -- Stats cards 3-column row. "Mis Reportes" horizontal scroll cards. "Vigilancia vecinal" list below. Bottom tab bar visible. Profile sidebar hidden.                                                                                                                 |
| **Profile**     | PASS -- Single column. Avatar + name + role at top. Stats cards in a row. "Configuracion" CTA button full width.                                                                                                                                                           |
| **Moderation**  | PASS -- Card list layout (no detail panel sidebar). Each case card shows category, urgency, animal type, description, date, and 3 action buttons (Verificar/Rechazar/Senalar).                                                                                             |
| **Government**  | PASS -- Card list layout instead of table. Each card shows category, urgency, animal type, description, folio, and 3 action buttons.                                                                                                                                       |
| **About**       | PASS -- Single column, readable text. Content sections stack.                                                                                                                                                                                                              |
| **Donate**      | FAIL -- Shows only skeleton loading bars. Content never rendered.                                                                                                                                                                                                          |
| **Settings**    | FAIL -- Redirected to map (auth lost).                                                                                                                                                                                                                                     |
| **Report**      | FAIL -- Redirected to landing (auth lost).                                                                                                                                                                                                                                 |
| **Case Detail** | FAIL -- Redirected to map (auth lost).                                                                                                                                                                                                                                     |

**Issues at 768:**

- P2: **Donate page skeleton-only** -- at 768px, the donate page renders skeleton placeholders but real content never appears. Could be a timing issue or responsive rendering bug.
- P2: **Bottom tab bar labels truncated** -- "Moderaci...", "Configur..." text is clipped. The 6-item tab bar is tight at 768px.
- P2: **Navbar horizontal overflow risk** -- at 768px, the top navbar shows 6 links ("Lomito.org", "Mapa", "Tablero", "Acerca de Lomito", "Donar", "Moderacion") and the text becomes cramped. "Gobierno" link is pushed off or hidden.

---

### Viewport 3: 1024x768 (Desktop small)

**Screenshots captured:** `map-1024.png`, `dashboard-1024.png`, `profile-1024.png`, `settings-1024.png`, `government-1024.png`, `about-1024.png`, `donate-1024.png`, `case-detail-1024.png`, `landing-1024.png`, `login-1024.png`

| Page            | Finding                                                                                                                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Landing**     | FAIL -- Redirected to `/donate` page. Landing page was not accessible at this viewport during testing.                                                                              |
| **Login**       | PASS -- Split layout: illustration sidebar on left, form on right.                                                                                                                  |
| **Map**         | PASS -- Three-column layout: filter sidebar, map, activity panel. All fit within viewport. Activity panel shows skeleton loading for case cards.                                    |
| **Dashboard**   | PASS -- Stats cards in row. Report cards horizontal scroll. Sidebar profile card visible on left.                                                                                   |
| **Profile**     | PASS -- Two-column: sidebar + profile content. Sidebar slightly clipped at bottom.                                                                                                  |
| **Settings**    | PASS -- Centered content. Account info + preferences. Clean layout.                                                                                                                 |
| **Government**  | PARTIAL -- Stats cards render (30 Assigned, 0 Overdue, 0.2d avg, Operational). Filter pills render. But case data table body is empty -- no rows visible despite "30 casos" header. |
| **About**       | PASS -- Content sections stack. Readable width.                                                                                                                                     |
| **Donate**      | PASS -- Two-column: form left, info sidebar right.                                                                                                                                  |
| **Case Detail** | PASS -- Shows "Case not found" (test UUID does not exist in DB). Layout itself is correct with navbar, centered content, footer.                                                    |
| **Moderation**  | FAIL -- Auth session lost, redirected to login page.                                                                                                                                |
| **Report**      | FAIL -- Redirected to map (different auth session loaded).                                                                                                                          |

**Issues at 1024:**

- P1: **Navbar "Nuevo reporte" button clipped** -- at 1024px width, the right side of the navbar is cut off. The "DA" profile avatar and "Nuevo reporte" button are partially or fully hidden behind the viewport edge. Visible in `dashboard-1024.png`, `profile-1024.png`, `settings-1024.png`, `government-1024.png`, `about-1024.png`, `donate-1024.png`.
- P2: **Government data table empty** -- stats show "30 Casos Asignados" but the table body has no rows. May be a data-loading or responsive rendering issue at this breakpoint.
- P1: **Landing page routing bug at 1024px** -- navigating to `/` as unauthenticated user at 1024px redirected to `/donate` instead of showing the landing page hero.

---

### Viewport 4: 1440x900 (Desktop wide)

**Screenshots captured:** `map-1440.png`, `dashboard-1440.png`, `profile-1440.png`, `settings-1440.png`, `moderation-1440.png`, `government-1440.png`, `about-1440.png`, `donate-1440.png`, `report-1440.png`, `case-detail-1440.png`, `landing-1440.png`, `login-1440.png`

| Page            | Finding                                                                                                                                                                                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Landing**     | PASS -- Full-width hero. 4-column stats bar. Map + activity list side by side.                                                                                                                                                                                 |
| **Login**       | PASS -- Split layout with illustration. Form properly centered in right panel.                                                                                                                                                                                 |
| **Map**         | PASS -- Three-column: filters, map, activity panel. Map markers and clusters visible. Stats footer (4 HOY, 5 RESUELTOS, 7 CRITICOS).                                                                                                                           |
| **Dashboard**   | PASS -- Left sidebar (profile card) + main content. Stats cards row, report cards horizontal scroll, footer.                                                                                                                                                   |
| **Profile**     | PASS -- Left sidebar + profile content area. Municipality, phone info displayed. Stats cards at bottom (partially visible, cut by scroll).                                                                                                                     |
| **Settings**    | PASS -- Clean centered layout. Account section + notification preferences with toggles.                                                                                                                                                                        |
| **Moderation**  | FAIL (CRASH) -- Uncaught Error: "Cannot read properties of undefined (reading '0')". Source: `components/moderation/review-detail-panel.tsx:102:50`. The detail panel tries to access `caseData.location.coordinates[0]` but `caseData.location` is undefined. |
| **Government**  | PASS -- Stats dashboard (30 Assigned, 0 Overdue, 0.2d avg, Operational). Table with filter pills. One case row visible (TJ-2026-010).                                                                                                                          |
| **About**       | PASS -- Content sections properly constrained. Blockquote styling.                                                                                                                                                                                             |
| **Donate**      | PASS -- Two-column layout: donation form left, info/testimonial right.                                                                                                                                                                                         |
| **Report**      | PASS -- Left sidebar info panel + category grid (2-column). Step progress bar. "Siguiente" button at bottom.                                                                                                                                                   |
| **Case Detail** | REDIRECT -- Redirected to `/` (map). The test UUID does not exist in DB, causing a redirect.                                                                                                                                                                   |

**Issues at 1440:**

- P0: **Moderation page crash** -- `review-detail-panel.tsx:102` accesses `caseData.location.coordinates` without null-checking. When a case lacks GeoJSON location data, the entire page crashes with an unhandled error overlay.

---

## Issues Summary

### P0 -- Critical (Blocks Usage)

| #   | Issue                           | Viewport(s)             | Route         | Description                                                                                                                                                                                                                                                                                                                                 |
| --- | ------------------------------- | ----------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Moderation crash on desktop** | 1440 (and likely 1024+) | `/moderation` | `review-detail-panel.tsx:102:50` throws "Cannot read properties of undefined (reading '0')" when accessing `caseData.location.coordinates[0]`. The detail panel, which only renders at desktop widths, does not null-check the location field. At tablet/mobile widths, the card-list view renders without the detail panel and works fine. |

### P1 -- High (Significant UX Degradation)

| #   | Issue                                         | Viewport(s) | Route                         | Description                                                                                                                                                                                                                                                                       |
| --- | --------------------------------------------- | ----------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2   | **Navbar button clipping at 1024px**          | 1024        | All authenticated routes      | The "Nuevo reporte" CTA button and "DA" profile avatar are partially cut off at the right edge of the viewport. The navbar does not collapse to a hamburger menu at this breakpoint, but the content exceeds the available width.                                                 |
| 3   | **Landing page routing bug at 1024px**        | 1024        | `/` (unauthenticated)         | Navigating to `/` at 1024px viewport when logged out redirects to `/donate` instead of showing the landing page. This appears to be a routing/redirect logic issue.                                                                                                               |
| 4   | **Auth session instability across viewports** | 375, 768    | Multiple authenticated routes | During sequential viewport testing, authenticated session state is intermittently lost. While partially a test-environment artifact (Expo web reloads on viewport change), it suggests fragile auth-persistence logic that may affect real users who resize their browser window. |

### P2 -- Medium (Noticeable Issues)

| #   | Issue                                   | Viewport(s) | Route                                      | Description                                                                                                                                                                                           |
| --- | --------------------------------------- | ----------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5   | **Donate page skeleton-only at 768px**  | 768         | `/donate`                                  | The donate page renders only skeleton loading bars at 768x1024 viewport. Content never appears.                                                                                                       |
| 6   | **Government table empty at 1024px**    | 1024        | `/government`                              | Stats show "30 Casos Asignados" but the data table has no visible rows. The table headers (Folio, Categoria, Creado, Urgencia, Escalados, Estado) render but no data populates.                       |
| 7   | **Bottom tab bar label truncation**     | 768         | Dashboard, Profile, Government, Moderation | Tab bar labels like "Moderaci..." and "Configur..." are truncated because the 6-item tab bar is too wide for the viewport. Consider using icons-only at this width or reducing to fewer visible tabs. |
| 8   | **Case detail route redirects to home** | 1440        | `/case/[id]`                               | When a case UUID is not found, the page redirects to `/` (map) instead of showing an error state in place. At 1024px it shows "Case not found" text correctly. The redirect behavior is inconsistent. |

### P3 -- Low (Minor Polish)

| #   | Issue                                             | Viewport(s) | Route                 | Description                                                                                                                                                                                                                          |
| --- | ------------------------------------------------- | ----------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 9   | **Landing page stats show 0 at 768px**            | 768         | `/` (unauthenticated) | The landing page stats bar shows "0 CASOS ACTIVOS", "0 RESUELTOS ESTE MES", "0 VIDAS SALVADAS", "--" for response time at 768px. At other viewports, it shows real data (18, 5, 5+, 101h). Likely a data-fetching timing issue.      |
| 10  | **Profile stats cards partially visible at 1440** | 1440        | `/profile`            | The "Animales Asistidos", "Casos Resueltos", "Donaciones Totales" stat cards at the bottom of the profile page are only partially visible (cut off by the viewport fold). The page needs scrolling or better content prioritization. |
| 11  | **Map activity panel skeleton at 1024**           | 1024        | `/` (map)             | The activity panel on the right side of the map shows skeleton loading cards and "0 HOY / 0 RESUELTOS / 0 CRITICOS" instead of real data. Likely a session-timing issue after auth re-establishment.                                 |
| 12  | **About page content cut at 1024**                | 1024        | `/about`              | The "Por que construimos Lomito?" section content is partially cut off -- only the heading is visible before the footer. Page appears shorter than expected at this viewport.                                                        |

---

## Cross-Cutting Responsive Observations

### Navigation Pattern Differences by Viewport

| Viewport         | Top Navbar                                                                         | Bottom Tab Bar                                                          | Sidebar                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 375 (Mobile)     | Simplified: "Lomito.org" + "Iniciar sesion" (public); no authenticated view tested | Expected: yes (not verified due to auth loss)                           | No                                                                                            |
| 768 (Tablet)     | Full horizontal: 6+ links, cramped                                                 | Yes: 6 tabs (Mapa, Tablero, Moderaci..., Gobierno, Perfil, Configur...) | No                                                                                            |
| 1024 (Desktop S) | Full horizontal: 7 links + profile + CTA (overflows)                               | No                                                                      | Profile sidebar on dashboard/profile pages                                                    |
| 1440 (Desktop W) | Full horizontal: 7 links + EN + profile + CTA (fits)                               | No                                                                      | Profile sidebar on dashboard/profile pages, filter sidebar on map, detail panel on moderation |

### Breakpoint Issues

- **768-1024px gap**: The transition from bottom-tab-bar mobile navigation to top-navbar-only desktop navigation happens somewhere in this range. At 768px, BOTH top navbar and bottom tab bar are visible, which may be redundant.
- **1024px is the pain point**: The navbar is too wide for this viewport. All 7 nav items plus profile avatar and CTA button do not fit. This width needs either a hamburger collapse or fewer visible items.
- **No hamburger menu observed**: At no viewport width did the navigation collapse to a hamburger/drawer menu. The smallest viewport (375px) showed a simplified public navbar ("Lomito.org" + login button), but authenticated mobile navigation was not testable.

### Footer Consistency

The footer is consistent across all viewports where it was visible:

- 4-column grid at 1024+ (Lomito.org, Plataforma, Comunidad, Legal)
- 4-column grid maintained at 768 (columns narrower but all visible)
- Social icons centered below
- Copyright line at bottom with "English" language toggle

### Content Width Constraints

- Landing hero: properly constrained at all widths
- About page: content sections have appropriate max-width
- Donate page: two-column layout collapses to single column appropriately at mobile
- Dashboard: sidebar hides at <1024px, content fills width

---

## Screenshots Reference

All screenshots saved to `/Users/elninja/Code/lomito/docs/qa/screenshots/`

### Public Routes (Unauthenticated)

| Route   | 375               | 768               | 1024                               | 1440               |
| ------- | ----------------- | ----------------- | ---------------------------------- | ------------------ |
| Landing | `landing-375.png` | `landing-768.png` | `landing-1024.png` (shows donate!) | `landing-1440.png` |
| Login   | `login-375.png`   | `login-768.png`   | `login-1024.png`                   | `login-1440.png`   |

### Authenticated Routes

| Route       | 375                             | 768                         | 1024                          | 1440                              |
| ----------- | ------------------------------- | --------------------------- | ----------------------------- | --------------------------------- |
| Map         | `map-375.png` (landing)         | `map-768.png`               | `map-1024.png`                | `map-1440.png`                    |
| Dashboard   | `dashboard-375.png` (landing)   | `dashboard-768.png`         | `dashboard-1024.png`          | `dashboard-1440.png`              |
| Profile     | `profile-375.png` (landing)     | `profile-768.png`           | `profile-1024.png`            | `profile-1440.png`                |
| Settings    | `settings-375.png` (landing)    | `settings-768.png` (map)    | `settings-1024.png`           | `settings-1440.png`               |
| Case Detail | `case-detail-375.png` (landing) | `case-detail-768.png` (map) | `case-detail-1024.png`        | `case-detail-1440.png` (redirect) |
| Report      | `report-375.png` (landing)      | `report-768.png` (landing)  | `report-1024.png` (map)       | `report-1440.png`                 |
| Moderation  | `moderation-375.png` (login)    | `moderation-768.png`        | `moderation-1024.png` (login) | `moderation-1440.png` (crash)     |
| Government  | `government-375.png` (landing)  | `government-768.png`        | `government-1024.png`         | `government-1440.png`             |
| Donate      | `donate-375.png`                | `donate-768.png` (skeleton) | `donate-1024.png`             | `donate-1440.png`                 |
| About       | `about-375.png`                 | `about-768.png`             | `about-1024.png`              | `about-1440.png`                  |

### Auxiliary Screenshots

- `landing-initial.png` -- initial page load at default viewport (authenticated, shows map)
- `profile-click.png` -- landing page after profile click (logout)
- `login-state.png` -- login page at 1440
- `login-filled.png` -- registration form with filled fields
- `login-ready.png` -- login form pre-submission
- `login-after.png` -- unmatched route at /map
- `sitemap.png` -- register page with error dialog
- `verify-login.png` -- dark dashboard UI (Stitch preview?)
- `current-state.png` -- report/new at 1440
- `login-redirect-375.png` -- register page at 375

---

## Recommendations

1. **Fix moderation crash (P0)**: Add null-check for `caseData.location` before accessing `.coordinates` in `review-detail-panel.tsx:102`. Use optional chaining: `caseData.location?.coordinates?.[0]`.

2. **Fix navbar overflow at 1024px (P1)**: Either collapse to hamburger menu at <1280px, or reduce visible nav items at 1024px. The "Nuevo reporte" button must always be accessible.

3. **Investigate landing page routing at 1024px (P1)**: The redirect to `/donate` when navigating to `/` at 1024px width needs debugging. This could be a race condition in the public layout routing.

4. **Add auth-persistence resilience (P1)**: Ensure Supabase auth session persists across viewport resize / page reloads. Consider using `supabase.auth.onAuthStateChange` more robustly.

5. **Fix donate page loading at 768px (P2)**: Debug why content fails to render at tablet width. May be a responsive conditional rendering issue.

6. **Fix government table data loading at 1024px (P2)**: Ensure the government case table populates at all widths, not just 1440px.

7. **Improve tab bar labels at 768px (P2)**: Use icon-only tabs or abbreviations when space is constrained.

8. **Standardize case-detail error handling (P2)**: Show "Case not found" consistently at all viewports rather than redirecting to home at some sizes.
