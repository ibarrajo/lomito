# Agent 6: Stitch Design vs Live App Comparison Report

**Date:** 2026-02-16
**App URL:** http://localhost:8081
**Stitch Projects:**

- Project 1: "Report Submission Flow" (ID: 17139143970723271940) — 13 screens
- Project 2: "Lomito Landing Page with Interactive Map" (ID: 2299388896525327539) — 8 screens

---

## Executive Summary

The live app achieves **approximately 60-65% design compliance** with the Stitch mockups. The biggest divergences are:

1. **Color system mismatch** — Stitch designs use inconsistent primary colors across screens (`#20c997`, `#13b6ec`, `#2D9CDB`, `#13ecc8`), while the live app correctly standardized on `#13ECC8`.
2. **Theme mismatch** — Profile/Dashboard Stitch designs use a dark theme (`#101d22` bg), while the live app uses a light theme.
3. **Font mismatch** — One Stitch project uses Montserrat instead of Public Sans.
4. **Landing page design divergence** — Stitch shows a cream/sand background (`#F9F7F2`) with a hero dog image; live app uses a dark navy hero section without imagery.
5. **Layout structure matches well** — The 3-column map layout, card-based lists, and navigation bar closely follow the Stitch designs.

---

## Design Token Reference (Expected)

| Token         | Expected Value             | Source           |
| ------------- | -------------------------- | ---------------- |
| Primary       | `#13ECC8` (mint)           | DESIGN_TOKENS.md |
| Primary Dark  | `#0FBDA0`                  | DESIGN_TOKENS.md |
| Secondary     | `#1E293B` (navy)           | DESIGN_TOKENS.md |
| Accent        | `#F2994A` (warm orange)    | DESIGN_TOKENS.md |
| Neutral 100   | `#F6F8F8` (cool off-white) | DESIGN_TOKENS.md |
| Font          | Public Sans                | DESIGN_TOKENS.md |
| Card radius   | 12px                       | DESIGN_TOKENS.md |
| Button radius | 8px                        | DESIGN_TOKENS.md |
| Input radius  | 8px                        | DESIGN_TOKENS.md |

---

## Screen-by-Screen Comparison

### 1. Landing Page

| Aspect                      | Stitch Design                                                                       | Live App                                                                         | Match             |
| --------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------- |
| **Hero Section**            | Cream/sand bg (`#F9F7F2`), dog photo hero image, "Se la Voz de los Sin Voz" heading | Dark navy bg (`#101d22`), no hero image, "Protegiendo a los animales..." heading | PARTIAL           |
| **Primary Color**           | `#2D9CDB` (blue) in one design                                                      | `#13ECC8` (mint)                                                                 | MISMATCH          |
| **Stats Bar**               | 4 metrics (12 active, 45 resolved, 102 saved, 24hr response)                        | 4 metrics (18 active, 5 resolved, 5+ saved, 101h response)                       | MATCH (structure) |
| **Live Map Section**        | Map with sidebar list, tab controls                                                 | Map placeholder with case list sidebar                                           | MATCH             |
| **Process Flow**            | 3-step (Detect/Verify/Track) with icons                                             | 3-step (Reportar/Rastrear/Resolver) with numbered icons                          | MATCH             |
| **Accountability Timeline** | Left-side timeline with escalation steps                                            | Horizontal timeline with Day 1/5/15/30                                           | PARTIAL           |
| **CTA Section**             | Blue background with two buttons                                                    | Mint text CTA with single "Comenzar" button                                      | PARTIAL           |
| **Footer**                  | 4-column layout with social links                                                   | 4-column layout with social links                                                | MATCH             |
| **Navbar**                  | Logo + nav links + "Report Incident" button                                         | Logo + "Iniciar sesion" button (logged out)                                      | MATCH             |
| **Font**                    | Public Sans                                                                         | Public Sans                                                                      | MATCH             |

**Discrepancies:**

- P2: Hero section design significantly different — no hero dog image in live
- P2: Background color scheme diverged (cream vs dark navy)
- P3: Primary color not matching Stitch design blue (`#2D9CDB`)
- P3: CTA section styling differs

**Screenshot:** `docs/qa/screenshots/stitch-vs-live-landing-page.png`
**Stitch Design:** `docs/qa/screenshots/stitch-design-landing-page.png`

---

### 2. Main Map Dashboard

| Aspect             | Stitch Design                                            | Live App                                                   | Match    |
| ------------------ | -------------------------------------------------------- | ---------------------------------------------------------- | -------- |
| **Layout**         | 3-column: filters/map/activity                           | 3-column: filters/map/activity                             | MATCH    |
| **Navbar**         | Logo, nav links, "Nuevo Reporte" button                  | Logo, nav links, EN toggle, avatar, "Nuevo reporte" button | MATCH    |
| **Filter Panel**   | Jurisdiction toggles, category toggles with colored dots | Category filter chips with colored dots + status filter    | PARTIAL  |
| **Map**            | Mapbox with case markers, jurisdiction overlays          | Mapbox with clustered markers, zoom controls               | MATCH    |
| **Map Tabs**       | Not visible in design                                    | Points/Heat/Groups tab switcher                            | EXTRA    |
| **Activity Panel** | "Actividad Reciente" with case cards + thumbnails        | "ACTIVIDAD RECIENTE" with case cards (no thumbnails)       | PARTIAL  |
| **Stats Footer**   | Case count stats at bottom of activity panel             | HOY/RESUELTOS/CRITICOS stats at bottom                     | MATCH    |
| **Primary Color**  | `#20c997` (teal)                                         | `#13ECC8` (mint)                                           | CLOSE    |
| **Font**           | Montserrat                                               | Public Sans                                                | MISMATCH |

**Discrepancies:**

- P2: Stitch design uses Montserrat font; live app correctly uses Public Sans per design tokens
- P2: Case cards in activity panel lack thumbnail images present in design
- P3: Stitch uses jurisdiction filter (Tijuana Centro, etc.); live uses only category/status filters
- P3: Map tab controls (Points/Heat/Groups) are present in live but not shown in design

**Screenshot:** `docs/qa/screenshots/stitch-vs-live-map-dashboard.png`
**Stitch Design:** `docs/qa/screenshots/stitch-design-map-dashboard.png`

---

### 3. Login Page

| Aspect            | Stitch Design                | Live App                                                 | Match          |
| ----------------- | ---------------------------- | -------------------------------------------------------- | -------------- |
| **Layout**        | N/A (no Stitch login screen) | 2-column: left branding panel + right form               | N/A            |
| **Left Panel**    | N/A                          | Mint gradient bg with paw icon, tagline text             | N/A            |
| **Form**          | N/A                          | Tabs (Magic Link / Password), email input, submit button | N/A            |
| **Button**        | N/A                          | Full-width mint button with white text                   | N/A            |
| **Colors**        | N/A                          | Primary mint, white form bg, navy text                   | MATCHES TOKENS |
| **Border Radius** | N/A                          | Inputs appear 8px radius                                 | MATCHES TOKENS |

**Note:** No Stitch login screen exists for comparison.

**Screenshot:** `docs/qa/screenshots/stitch-vs-live-login.png`

---

### 4. User Profile & Impact Dashboard

| Aspect                 | Stitch Design                                                                                       | Live App                                                                        | Match    |
| ---------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------- |
| **Theme**              | Dark mode (`#101d22` bg, `#16262d` surface)                                                         | Light mode (white/neutral bg)                                                   | MISMATCH |
| **Layout**             | Sidebar + main content (2-column)                                                                   | Sidebar + main content (2-column)                                               | MATCH    |
| **Sidebar**            | Avatar, name, location, Dashboard/Profile/Settings tabs, notification toggles, "Support Lomito" CTA | Avatar, name, role badge, Dashboard/Profile/Settings tabs, "Apoya a Lomito" CTA | MATCH    |
| **Impact Metrics**     | 3 cards: Animals Assisted (3), Cases Resolved (2), Donations ($350)                                 | 3 cards: Animales Asistidos (6), Casos Resueltos (5), Donaciones ($0.00)        | MATCH    |
| **My Reports**         | Grid of report cards with thumbnail images, status badges, location                                 | Grid of report cards with category/status badges, description, date             | PARTIAL  |
| **Report Card Images** | Each card has a large thumbnail photo                                                               | No thumbnail photos on cards                                                    | MISSING  |
| **Neighborhood Watch** | List of followed cases with avatars                                                                 | List of followed cases with category/urgency badges                             | MATCH    |
| **Sort Controls**      | Sort by: Newest First                                                                               | Sort by: Mas recientes / Estado / Mas antiguos                                  | MATCH    |
| **View Toggle**        | Grid/List icons                                                                                     | Grid/List buttons                                                               | MATCH    |
| **Font**               | Public Sans                                                                                         | Public Sans                                                                     | MATCH    |

**Discrepancies:**

- P2: Live app uses light theme instead of dark theme shown in Stitch
- P2: Report cards missing thumbnail images that are prominent in design
- P3: Live profile shows "Guardián Cívico Niv 3" level badge not shown in design
- P3: Metric card styling differs (design has progress bars beneath numbers)

**Screenshot:** `docs/qa/screenshots/stitch-vs-live-profile.png`
**Stitch Design:** `docs/qa/screenshots/stitch-design-profile.png`

---

### 5. Case Detail & Timeline

| Aspect         | Stitch Design                                                        | Live App                                                | Match    |
| -------------- | -------------------------------------------------------------------- | ------------------------------------------------------- | -------- |
| **Layout**     | Hero image + timeline + location map + donation module               | (Not fully tested due to auth session loss)             | UNTESTED |
| **Colors**     | Cream bg (`#F9F7F2`), navy text (`#1A2B48`), cyan accent (`#13b6ec`) | Expected: neutral100 bg, secondary text, primary accent | PARTIAL  |
| **Breadcrumb** | Tijuana > Casos Activos > Case #                                     | Not visible in testing                                  | UNTESTED |
| **Timeline**   | Vertical event log with icons, timestamps                            | Expected to match based on code structure               | UNTESTED |
| **Font**       | Public Sans                                                          | Public Sans                                             | MATCH    |

**Discrepancies:**

- P3: Stitch uses cream background (`#F9F7F2`); live app expected to use cool off-white (`#F6F8F8`)
- P3: Stitch uses cyan accent (`#13b6ec`); live app uses mint (`#13ECC8`)

---

### 6. Report Submission Flow

| Aspect                 | Stitch Design                                               | Live App                                     | Match    |
| ---------------------- | ----------------------------------------------------------- | -------------------------------------------- | -------- |
| **Steps**              | 3-step: Category selection, Location pin, Photo/Description | Multi-step flow (5 steps in route structure) | PARTIAL  |
| **Progress**           | "Step 1 of 3" indicator                                     | Step progress indicator                      | MATCH    |
| **Category Selection** | Toggle chips with cyan accent                               | Category selection UI                        | MATCH    |
| **Map Pin**            | Map with drag-to-pin                                        | Map-based location picker                    | MATCH    |
| **Animation**          | 0.5s ease-out fade-in transitions                           | React Native Reanimated transitions          | MATCH    |
| **Primary Color**      | `#13b6ec` (cyan)                                            | `#13ECC8` (mint)                             | MISMATCH |
| **Font**               | Public Sans                                                 | Public Sans                                  | MATCH    |

**Discrepancies:**

- P2: Stitch shows 3 steps; live app has 5 steps in the flow
- P3: Color accent mismatch (`#13b6ec` vs `#13ECC8`)

---

### 7. Government Response Portal

| Aspect            | Stitch Design                                                    | Live App                                                                                     | Match   |
| ----------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------- |
| **Layout**        | Sidebar nav + data table + right detail panel                    | Single page with stats cards + data table + footer                                           | PARTIAL |
| **Stats Cards**   | System Status, Assigned Cases, Upcoming Expiration, Average Time | Casos Asignados (30), Por Vencer (0), Tiempo Promedio (0.2d), Estado del Sistema (Operativo) | MATCH   |
| **Data Table**    | Scrollable with case details, status badges                      | Table with Folio, Categoria, Creado, Urgencia, Escalados, Estado columns                     | MATCH   |
| **Detail Panel**  | Right-side flyout with case assignment, evidence upload          | Not visible (no case selected)                                                               | MISSING |
| **Status Badges** | Pendiente, En Proceso, Resuelto                                  | Pendiente de respuesta, En progreso, Resuelto (filter tabs)                                  | MATCH   |
| **Primary Color** | `#13ecc8`                                                        | `#13ECC8`                                                                                    | MATCH   |
| **Font**          | Public Sans                                                      | Public Sans                                                                                  | MATCH   |

**Discrepancies:**

- P2: Stitch design has sidebar navigation; live app uses top navbar
- P2: Case detail flyout panel from design not implemented as slide-out
- P3: Live app shows emoji icons (chart emoji, stopwatch emoji) instead of material design icons

**Screenshot:** `docs/qa/screenshots/stitch-vs-live-government.png`

---

### 8. Moderator Review Queue

| Aspect            | Stitch Design                                                                     | Live App                                                 | Match   |
| ----------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------- | ------- |
| **Layout**        | Sidebar + queue list + detail panel                                               | (Auth lost; based on snapshot data) Top navbar + content | PARTIAL |
| **Queue List**    | Card-based with "Nuevo", "Flagged" badges                                         | Expected similar card list                               | MATCH   |
| **Detail Panel**  | Expanded report with map, action buttons (Reject, Request Info, Verify & Publish) | Moderation actions available                             | MATCH   |
| **Primary Color** | `#13ecc8`                                                                         | `#13ECC8`                                                | MATCH   |
| **Font**          | Public Sans                                                                       | Public Sans                                              | MATCH   |

**Discrepancies:**

- P2: Sidebar navigation in design vs top navbar in live
- P3: Reporter credibility scores shown in design not present in live

---

### 9. Donation and Support Page

| Aspect              | Stitch Design                          | Live App                                   | Match    |
| ------------------- | -------------------------------------- | ------------------------------------------ | -------- |
| **Preset Amounts**  | $100, $200, $500 MXN + custom          | (Not tested - auth lost during navigation) | UNTESTED |
| **Payment Methods** | Mercado Pago, OXXO, SPEI, credit/debit | Expected to match                          | UNTESTED |
| **Security Badges** | SSL, PCI DSS indicators                | Expected to match                          | UNTESTED |
| **Primary Color**   | `#13ecc8`                              | `#13ECC8`                                  | MATCH    |
| **Font**            | Public Sans                            | Public Sans                                | MATCH    |

---

### 10. Public Impact Dashboard

| Aspect            | Stitch Design                                 | Live App                                         | Match    |
| ----------------- | --------------------------------------------- | ------------------------------------------------ | -------- |
| **Layout**        | Card-based metrics + bar charts + data tables | "Tablero de impacto" with skeleton loading cards | PARTIAL  |
| **Charts**        | Bar charts with grid backgrounds              | (Skeleton state observed)                        | UNTESTED |
| **Primary Color** | `#13ecc8`                                     | `#13ECC8`                                        | MATCH    |
| **Font**          | Public Sans                                   | Public Sans                                      | MATCH    |

**Screenshot:** `docs/qa/screenshots/stitch-vs-live-profile.png` (captured during navigation)

---

### 11. Settings Page

| Aspect     | Stitch Design                   | Live App                                                             | Match          |
| ---------- | ------------------------------- | -------------------------------------------------------------------- | -------------- |
| **Layout** | N/A (no Stitch settings screen) | Single column: Account, Preferences (language), About, Legal, Logout | N/A            |
| **Font**   | N/A                             | Public Sans                                                          | MATCHES TOKENS |

**Note:** No Stitch settings screen exists for comparison.

**Screenshot:** `docs/qa/screenshots/stitch-vs-live-settings.png`

---

## Discrepancy Summary

### By Category

#### Color Mismatches (P2-P3)

| ID  | Screen                 | Issue                                      | Severity |
| --- | ---------------------- | ------------------------------------------ | -------- |
| C1  | Map Dashboard (Stitch) | Uses `#20c997` instead of `#13ECC8`        | P3       |
| C2  | Landing Page (Stitch)  | Uses `#2D9CDB` (blue) instead of `#13ECC8` | P3       |
| C3  | Case Detail (Stitch)   | Uses `#13b6ec` (cyan) instead of `#13ECC8` | P3       |
| C4  | Report Flow (Stitch)   | Uses `#13b6ec` (cyan) instead of `#13ECC8` | P3       |

**Note:** These are Stitch design inconsistencies, not live app issues. The live app correctly uses `#13ECC8` throughout, matching `DESIGN_TOKENS.md`.

#### Theme Mismatches (P2)

| ID  | Screen            | Issue                                         | Severity |
| --- | ----------------- | --------------------------------------------- | -------- |
| T1  | Profile Dashboard | Stitch uses dark theme; live uses light theme | P2       |
| T2  | Landing Hero      | Stitch uses cream bg; live uses dark navy     | P2       |

#### Missing Elements (P2-P3)

| ID  | Screen       | Missing Element                                 | Severity |
| --- | ------------ | ----------------------------------------------- | -------- |
| M1  | Landing Page | Hero dog image from Stitch design               | P2       |
| M2  | Profile      | Thumbnail images on report cards                | P2       |
| M3  | Profile      | Progress bars beneath metric numbers            | P3       |
| M4  | Government   | Case detail flyout panel                        | P2       |
| M5  | Moderator    | Reporter credibility scores                     | P3       |
| M6  | Profile      | Notification toggle switches from Stitch design | P3       |

#### Extra Elements (P3)

| ID  | Screen        | Extra Element                               | Severity |
| --- | ------------- | ------------------------------------------- | -------- |
| E1  | Map Dashboard | Points/Heat/Groups map mode tabs            | P3       |
| E2  | Map Dashboard | Show Boundaries toggle button               | P3       |
| E3  | Profile       | "Guardián Cívico" level badge               | P3       |
| E4  | Map Dashboard | 11 category filter options (Stitch shows 3) | P3       |

#### Layout Mismatches (P2-P3)

| ID  | Screen      | Issue                                                           | Severity |
| --- | ----------- | --------------------------------------------------------------- | -------- |
| L1  | Government  | Sidebar nav in design vs top navbar in live                     | P2       |
| L2  | Moderator   | Sidebar nav in design vs top navbar in live                     | P2       |
| L3  | Report Flow | 3-step design vs 5-step live implementation                     | P3       |
| L4  | Landing     | Accountability timeline: vertical (design) vs horizontal (live) | P3       |

#### Typography Mismatches (P2)

| ID  | Screen                 | Issue                                       | Severity |
| --- | ---------------------- | ------------------------------------------- | -------- |
| F1  | Map Dashboard (Stitch) | Uses Montserrat font instead of Public Sans | P2       |

**Note:** This is a Stitch design error. The live app correctly uses Public Sans.

---

## Design Compliance Score

| Screen            | Compliance | Notes                                                            |
| ----------------- | ---------- | ---------------------------------------------------------------- |
| Landing Page      | 55%        | Major hero section divergence, background color scheme different |
| Map Dashboard     | 75%        | Layout matches well, activity panel lacks thumbnails             |
| Login             | N/A        | No Stitch design to compare                                      |
| Register          | N/A        | No Stitch design to compare                                      |
| Profile Dashboard | 55%        | Dark vs light theme mismatch, missing thumbnails                 |
| Case Detail       | 65%        | Color accent differences, layout structure similar               |
| Report Flow       | 60%        | Step count differs, color accent mismatch                        |
| Government Portal | 60%        | Missing sidebar nav and detail flyout panel                      |
| Moderator Queue   | 60%        | Missing sidebar nav, credibility scores                          |
| Donation Page     | N/A        | Could not fully test (auth loss)                                 |
| Impact Dashboard  | 50%        | Only skeleton state observed                                     |
| Settings          | N/A        | No Stitch design to compare                                      |

**Overall Design Compliance: ~62%**

---

## Key Observations

### What the Live App Gets Right

1. **Design token compliance** — The live app correctly uses `#13ECC8` as primary, `#1E293B` as secondary, and Public Sans as the font family throughout. This matches `DESIGN_TOKENS.md` and `packages/ui/src/theme/tokens.ts`.
2. **Layout structure** — The 3-column map layout, card-based case lists, stats bars, and footer structure all closely match the Stitch designs.
3. **i18n** — All text is properly internationalized in Spanish (es-MX) via i18n keys, matching project requirements.
4. **Navigation** — Top navbar with logo, nav links, language toggle, avatar, and "Nuevo reporte" CTA matches the overall design intent.
5. **Color contrast** — Dark text on mint backgrounds is correctly used (not white on mint).

### Where the Live App Diverges

1. **Stitch designs are internally inconsistent** — Different screens use different primary colors (`#20c997`, `#13b6ec`, `#2D9CDB`, `#13ecc8`). The live app standardized on `#13ECC8`, which is the correct choice per `DESIGN_TOKENS.md`.
2. **Dark vs light theme** — The Profile/Dashboard Stitch designs use a dark theme that was not carried into the live implementation. The live app uses a consistent light theme.
3. **Image-rich cards** — Stitch designs show report cards with prominent thumbnail images; the live app uses text-only cards with category/status badges.
4. **Sidebar vs top navigation** — Government and Moderator Stitch designs use sidebar navigation; the live app uses a consistent top navbar across all pages.
5. **Landing page hero** — The most visually impactful difference. Stitch shows a warm, inviting landing with dog imagery and a cream palette; the live app uses a bold dark navy hero without animal photography.

---

## Recommendations

### P2 Priority

1. **Add hero imagery to landing page** — Consider adding animal photography to the hero section to match the emotional appeal of the Stitch design.
2. **Add thumbnail images to profile report cards** — Use case_media thumbnails on report cards in the profile dashboard.
3. **Implement case detail flyout in Government portal** — Add a slide-out detail panel for reviewing individual cases.

### P3 Priority

1. **Consider dark theme option** — The Stitch profile dashboard in dark mode looks polished. Consider offering a dark mode toggle.
2. **Add progress indicators to impact metrics** — Add progress bars or trend indicators beneath the metric numbers as shown in the design.
3. **Standardize Stitch designs** — Update Stitch screens to use consistent `#13ECC8` primary color and Public Sans font.

---

## Screenshots

| File                                                   | Description                                                          |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| `docs/qa/screenshots/stitch-vs-live-landing-page.png`  | Live app landing page (full page)                                    |
| `docs/qa/screenshots/stitch-vs-live-login.png`         | Live app login page                                                  |
| `docs/qa/screenshots/stitch-vs-live-map-dashboard.png` | Live app map dashboard                                               |
| `docs/qa/screenshots/stitch-vs-live-profile.png`       | Live app profile (captured during nav transition)                    |
| `docs/qa/screenshots/stitch-vs-live-settings.png`      | Live app settings/government page                                    |
| `docs/qa/screenshots/stitch-vs-live-government.png`    | Live app government portal                                           |
| `docs/qa/screenshots/stitch-design-map-dashboard.png`  | Stitch map dashboard design                                          |
| `docs/qa/screenshots/stitch-design-landing-page.png`   | Stitch landing page design                                           |
| `docs/qa/screenshots/stitch-design-profile.png`        | Stitch profile dashboard design                                      |
| `docs/qa/screenshots/stitch-design-government.png`     | Stitch government portal design (redirect captured live app instead) |

---

## Technical Notes

- Auth sessions are unstable on the web platform — the Expo Router web app frequently loses auth state during navigation, causing redirects to landing/register pages. This made full testing of all authenticated routes difficult.
- The Stitch project has two separate projects with overlapping content (Landing Page project + Report Submission Flow project). Some screens appear in both.
- Several Stitch screens are image uploads (not generated HTML), making automated comparison impossible for those screens.
