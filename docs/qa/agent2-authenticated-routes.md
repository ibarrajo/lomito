# QA Report: Authenticated Routes (Agent 2)

**Date:** 2026-02-16
**Viewport:** 1440x900 (Desktop)
**Browser:** Chromium (Playwright)
**Test User:** dev@lomito.org (password login)

---

## Summary

Tested 13 authenticated routes at 1440x900. Found **2 P0 crashes**, **2 P1 issues**, and several P2/P3 items. The Moderation screen is completely broken due to a null-safety crash in `review-detail-panel.tsx`. Login via hard navigation (URL bar) is unreliable and causes redirect loops; only SPA navigation from the landing page works.

---

## 1. Login Flow

### Findings

- **Password login via SPA navigation works:** Click "Iniciar sesion" on landing page, switch to "Contrasena" tab, fill credentials, submit. Redirects to authenticated map view.
- **Login via hard navigation (URL bar to `/auth/login`) is broken:** The app repeatedly redirects away from the login page to various public routes (`/about`, `/legal/privacy`, `/legal/terms`, `/impact`) in what appears to be an infinite redirect loop. Session tokens in localStorage are cleared on page reload.
- **Login form button label is misleading:** The submit button on the password tab is labeled "Contrasena" (Password) instead of something like "Iniciar sesion" (Sign in).
- **Browser autofill interference:** The email field was pre-filled with `maria@example.com` from browser autofill on subsequent visits.

### Issues

| ID     | Severity | Description                                                                                                                |
| ------ | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| AUTH-1 | **P1**   | Hard navigation to `/auth/login` causes infinite redirect loop through public routes. Only SPA navigation works for login. |
| AUTH-2 | **P2**   | Login submit button label says "Contrasena" instead of "Iniciar sesion" or "Entrar"                                        |
| AUTH-3 | **P2**   | Session tokens in localStorage are cleared on full page reload, breaking session persistence across hard navigations       |

---

## 2. WebNavbar Audit

### Verified Links (authenticated, map view)

| Link                 | Present                                | Navigates Correctly              |
| -------------------- | -------------------------------------- | -------------------------------- |
| Lomito.org (home)    | Yes                                    | Yes                              |
| Mapa                 | Yes (active state highlighted in mint) | Yes                              |
| Tablero              | Yes                                    | Yes                              |
| Acerca de Lomito     | Yes                                    | Yes                              |
| Donar                | Yes                                    | Yes                              |
| Moderacion           | Yes                                    | Crashes (see Moderation section) |
| Gobierno             | Yes                                    | Yes                              |
| EN (language toggle) | Yes                                    | Yes                              |
| Avatar (DA/MG)       | Yes                                    | Opens dropdown                   |
| + Nuevo reporte      | Yes (mint button)                      | Yes                              |

### Issues

| ID    | Severity | Description                                                                                                                                                                                                            |
| ----- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NAV-1 | **P2**   | Moderation and Government links disappear from navbar on Profile and Settings pages. They are only visible when the user has admin/moderator role context (the app seems to switch user contexts between navigations). |
| NAV-2 | **P3**   | Active state only shown on current route -- works correctly with mint color highlight                                                                                                                                  |

---

## 3. Avatar Dropdown

### Verified

- Click avatar button shows dropdown with:
  - User name: "Dev Admin"
  - "Perfil" link
  - "Configuracion" link
  - "Cerrar sesion" button
- Close overlay ("Cerrar menu") works correctly
- All dropdown links navigate correctly

### Issues

None found.

---

## 4. Language Toggle

### Verified

- **EN button in navbar** toggles all UI text from Spanish to English
- **ES button** reverts back to Spanish
- Toggling is instant with no page reload
- All text elements update: navbar links, filter labels, category names, status labels, stat cards, button text
- Spanish: Mapa, Tablero, Acerca de Lomito, Donar, Moderacion, Gobierno
- English: Map, Dashboard, About Lomito, Donate, Moderation, Government

### Issues

None found -- i18n toggle works correctly.

---

## 5. Map Screen (`/`)

**Screenshot:** `docs/qa/screenshots/map-1440.png`

### Verified

- Map container loads with Mapbox GL (clusters visible on Tijuana area)
- **Filter panel (left):** Category filters (11 categories: Maltrato, Herido, Callejero, Extraviado, Riesgo zoonotico, Animal muerto, Perro peligroso, Animal en peligro, Venta ilegal, Fauna silvestre, Ruido molesto) + Status filters (Pendiente, Verificado, En progreso, Resuelto) + Reset button
- **Map controls:** Pins/Heatmap/Clusters tabs, Show boundaries button, Zoom in/out, Mapbox attribution
- **Activity panel (right):** "Actividad reciente" header with "Ver todo" button, scrollable list of case cards with category, status, description, time, animal type
- **Stats bar (bottom):** 4 HOY, 5 RESUELTOS, 7 CRITICOS
- **No footer on map page** -- correct behavior
- "Datos actualizados en tiempo real" notice at bottom of filter panel

### Issues

| ID    | Severity | Description                                                                                                                                                                                |
| ----- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| MAP-1 | **P3**   | Case descriptions in activity panel are in English while UI is in Spanish. E.g., "Dog left in hot car in parking lot..." should be in Spanish or clearly marked as user-submitted content. |

---

## 6. Case Detail (`/case/[id]`)

**Screenshot:** `docs/qa/screenshots/case-detail-1440.png`

### Verified (case `00000000-0000-0000-0001-000000000008`)

- **Breadcrumbs:** Inicio > Casos > Folio TJ-2026-005
- **Hero image** with case photos as background
- **Status/Category tags:** "En progreso" + "Maltrato" overlaid on hero
- **Animal type + date:** "Perro" / "16 de febrero de 2026"
- **Stats row:** Gravedad (Critica), Estado (En progreso), Creado (hace 6 horas)
- **"Escalar a autoridades" button** (mint, full-width)
- **Description section** with case text
- **Photos section** with 3 thumbnail images
- **Community discussion** sidebar with comment input ("Escribe un comentario...")
- **Donation progress:** "0 MXN recaudados" / "Meta: 2500 MXN"
- **Footer IS present** -- correct behavior

### Issues

| ID     | Severity | Description                                                                                                                          |
| ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| CASE-1 | **P2**   | "Case not found" error message on invalid case UUID is in English, not Spanish. Should use `t()` key. File: case detail error state. |
| CASE-2 | **P3**   | No breadcrumb navigation -- "Inicio" and "Casos" appear as plain text links but functionality not tested.                            |

---

## 7. Dashboard (`/dashboard`)

**Screenshot:** `docs/qa/screenshots/dashboard-1440.png`

### Verified

- **User sidebar:** Avatar (DA), "Dev Admin", "Administrador" role badge, nav links (Tablero, Mi Perfil, Configuracion), "Apoya a Lomito" donation CTA
- **Stats cards:** 30 Casos Reportados, 5 Casos Resueltos, 17% Tasa de Respuesta
- **"Mis Reportes" section:** Horizontal scrollable cards with category color coding, description preview, timestamps
- **"Vigilancia vecinal" section:** List of cases in user's jurisdiction with status badges and timestamps
- **Footer present** with Plataforma/Comunidad/Legal sections

### Issues

None found -- dashboard renders correctly.

---

## 8. Profile (`/profile`)

**Screenshot:** `docs/qa/screenshots/profile-1440.png`

### Verified

- **User info:** "Maria Garcia Lopez", Ciudadano role, "Guardian Civico Niv 4" badge
- **Contact info:** Municipio (Tijuana), Telefono (+526642345678)
- **Stats:** Animales Asistidos (11), Casos Resueltos (0, "10 pendientes"), Donaciones Totales ($6000.00)
- **"Mis Reportes" section:** 11 reportes, Grid/List toggle, sort options (Mas recientes, Estado, Mas antiguos)
- **Case cards** with category, status, description, date
- **"Vigilancia vecinal"** section with nearby cases and urgency badges
- **Footer present**

### Issues

| ID     | Severity | Description                                                                                                                                                                                                                                                                          |
| ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| PROF-1 | **P2**   | User identity inconsistency: Map page shows "DA" (Dev Admin) avatar, but Profile page shows "MG" (Maria Garcia Lopez / Ciudadano). The app appears to resolve to different user profiles depending on which token is in use. This suggests a session/user resolution race condition. |
| PROF-2 | **P3**   | Moderation and Government links disappear from navbar when on Profile (only 4 nav links visible: Mapa, Tablero, Acerca de Lomito, Donar)                                                                                                                                             |

---

## 9. Settings (`/settings`)

**Screenshot:** `docs/qa/screenshots/settings-1440.png`

### Verified

- **Cuenta section:** "Maria Garcia Lopez" / maria@example.com
- **Preferencias > Notificaciones:** Push, Email, Report updates -- all with toggle switches (all ON)
- **Preferencias > Idioma:** Espanol (selected) / English radio buttons
- **Acerca de section:** Links to Acerca de Lomito, Donar, Sugerir Contacto de Autoridad
- **Legal section** (partially visible, cut off by viewport)
- **Footer present**

### Issues

| ID    | Severity | Description                                                                                                                                  |
| ----- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| SET-1 | **P3**   | "Legal" section heading is cut off at viewport bottom; requires scrolling. Consider adjusting layout.                                        |
| SET-2 | **P3**   | No "Sign out" button visible in settings page main content (only in avatar dropdown). Settings page should have a prominent sign-out option. |

---

## 10. Report Flow (`/report/new`)

**Screenshot:** `docs/qa/screenshots/report-1440.png`

### Verified

- **Step indicator:** "Paso 1 de 5"
- **Title:** "Que sucedio?"
- **"Atras" back link** at top
- **Sidebar:** "Tu reporte importa" with info bullets: "Anonimo y seguro", "Los reportes se revisan en 48 horas", "Tu identidad permanece protegida", "Las autoridades son notificadas cuando es necesario"
- **Category grid:** 10 category cards with icons and descriptions (Maltrato, Herido, Callejero, Extraviado, Riesgo zoonotico, Animal muerto, Perro peligroso, Animal en peligro, Venta ilegal, Fauna silvestre)
- **"Siguiente" button** at bottom (mint)
- **No footer** on report page -- correct behavior

### Issues

None found -- report step 1 renders correctly.

---

## 11. Moderation (`/moderation`)

**Screenshot:** `docs/qa/screenshots/moderation-1440.png`

### Verified

- **PAGE CRASHES** immediately with uncaught error

### Issues

| ID    | Severity | Description                                                                                                                                                                                                                                                                                                                                                                           |
| ----- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MOD-1 | **P0**   | **Crash:** `TypeError: Cannot read properties of undefined (reading '0')` in `components/moderation/review-detail-panel.tsx:102:50`. Code: `const longitude = caseData.location.coordinates[0]` -- `caseData.location` is undefined for some cases (likely cases with null/missing GeoJSON location). This crashes the entire moderation screen with a React error boundary fallback. |

---

## 12. Government (`/government`)

**Screenshot:** `docs/qa/screenshots/government-1440.png`

### Verified

- **Title:** "Portal gubernamental" / "30 casos"
- **KPI cards:** 30 Casos Asignados, 0 Por Vencer, 0.2d Tiempo Promedio de Resolucion, Operativo (Estado del Sistema)
- **Filter tabs:** Todos, Escalados, Pendiente de respuesta, En progreso, Resuelto
- **Case table** with columns: Folio, Categoria, Creado, Urgencia, Escalados, Estado
- Sample rows showing cases with Maltrato/Callejero/Herido categories, Critica/Alta urgency, various statuses
- **Footer present**

### Issues

None found -- government portal renders correctly.

---

## 13. Authority Form (`/authority/submit`)

**Screenshot:** `docs/qa/screenshots/authority-1440.png`

### Verified

- **Title:** "Sugerir Contacto de Autoridad"
- **Description text** explaining purpose
- **Form fields:** Nombre de Dependencia o Departamento, Departamento Especifico (Opcional), Persona de Contacto (Opcional), Correo Electronico (Opcional), Telefono (Opcional), Sitio Web (Opcional), Tipos de Reporte que Atiende, Notas Adicionales (Opcional)
- All fields have appropriate placeholder text
- **Footer present**

### Issues

None found.

---

## 14. PageFooter Audit

Examined footer on Dashboard page.

### Footer Structure

- **Lomito.org** / "Hecho con amor en Tijuana"
- **Plataforma:** Mapa, Nuevo reporte, Tablero
- **Comunidad:** Acerca de Lomito, Impacto de la Plataforma, Donar
- **Legal:** Aviso de Privacidad, Terminos de Servicio
- **Social icons:** Facebook, Twitter, Instagram
- **Copyright:** "(c) 2026 Lomito.org -- Plataforma Civica de Bienestar Animal"
- **Language toggle:** "English" button in footer

### Footer Presence by Route

| Route               | Footer        | Correct |
| ------------------- | ------------- | ------- |
| `/` (Map)           | No            | Yes     |
| `/dashboard`        | Yes           | Yes     |
| `/profile`          | Yes           | Yes     |
| `/settings`         | Yes           | Yes     |
| `/case/[id]`        | Yes           | Yes     |
| `/report/new`       | No            | Yes     |
| `/government`       | Yes           | Yes     |
| `/moderation`       | N/A (crashes) | --      |
| `/authority/submit` | Yes           | Yes     |

### Issues

| ID    | Severity | Description                                                                                                                                                              |
| ----- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FTR-1 | **P3**   | Public landing page footer has "Recursos" section with Blog and Preguntas frecuentes links that go to `#` placeholders. Authenticated footer lacks these links entirely. |
| FTR-2 | **P3**   | Authenticated footer missing "Contacto" link that exists in public footer's Legal section.                                                                               |

---

## 15. Console Errors Summary

### Critical Errors

| Error                                                                                              | Count | Severity | Location                                                         |
| -------------------------------------------------------------------------------------------------- | ----- | -------- | ---------------------------------------------------------------- |
| `TypeError: Cannot read properties of undefined (reading '0')` at `review-detail-panel.tsx:102:50` | 4x    | **P0**   | Moderation page -- crashes on `caseData.location.coordinates[0]` |
| `401 Unauthorized` on `track-event` edge function                                                  | 15+   | **P1**   | Every page load -- analytics tracking failing                    |
| `401 Unauthorized` on `jurisdiction-boundaries` edge function                                      | 1x    | **P2**   | Map page -- boundary fetch failing                               |
| `Error fetching case: Case not found`                                                              | 4x    | **P2**   | Case detail with invalid UUID                                    |
| `Error fetching jurisdictions: Failed to fetch jurisdictions: Unauthorized`                        | 1x    | **P2**   | Map boundary layer                                               |

### Warnings (notable, not exhaustive)

| Warning                                                              | Count           | Notes                                        |
| -------------------------------------------------------------------- | --------------- | -------------------------------------------- |
| `"shadow*" style props are deprecated`                               | Every page load | React Native Web deprecation                 |
| `"textShadow*" style props are deprecated`                           | Every page load | React Native Web deprecation                 |
| `Layout children must be of type Screen`                             | Many            | Expo Router layout warnings                  |
| `props.pointerEvents is deprecated`                                  | Many            | React Native Web deprecation                 |
| `[expo-notifications] Listening to push tokens not supported on web` | Every page load | Expected on web                              |
| `Encountered two children with the same key`                         | Multiple        | About page -- duplicate key in rendered list |
| `Blocked aria-hidden on an element because focus was found inside`   | Case detail     | Accessibility issue                          |

---

## All Issues (Prioritized)

| ID      | Severity | Route                   | Description                                                                                                |
| ------- | -------- | ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| MOD-1   | **P0**   | `/moderation`           | Moderation page crashes: `caseData.location.coordinates[0]` undefined. File: `review-detail-panel.tsx:102` |
| AUTH-1  | **P1**   | `/auth/login`           | Hard navigation to login page causes infinite redirect loop through public routes                          |
| AUTH-3  | **P1**   | All                     | Session tokens cleared on full page reload, breaking deep links and refresh                                |
| TRACK-1 | **P1**   | All                     | `track-event` edge function returns 401 on every page -- analytics completely broken                       |
| PROF-1  | **P2**   | `/profile`              | User identity inconsistency between Map (Dev Admin/DA) and Profile (Maria Garcia Lopez/MG)                 |
| NAV-1   | **P2**   | `/profile`, `/settings` | Moderation/Government links disappear from navbar on some pages                                            |
| CASE-1  | **P2**   | `/case/[id]`            | "Case not found" error text is hardcoded English, not i18n                                                 |
| AUTH-2  | **P2**   | `/auth/login`           | Login submit button labeled "Contrasena" instead of action verb                                            |
| ABOUT-1 | **P2**   | `/about`                | "Encountered two children with the same key" React error on About page                                     |
| SET-2   | **P3**   | `/settings`             | No sign-out button in settings main content                                                                |
| MAP-1   | **P3**   | `/`                     | Case descriptions in English while UI is in Spanish (user content)                                         |
| FTR-1   | **P3**   | Footer                  | Blog/FAQ links go to `#` placeholders                                                                      |
| FTR-2   | **P3**   | Footer                  | Missing "Contacto" link in authenticated footer                                                            |
| SET-1   | **P3**   | `/settings`             | Legal section cut off at viewport bottom                                                                   |

---

## Screenshot Inventory

| File                                       | Route               | Description                                              |
| ------------------------------------------ | ------------------- | -------------------------------------------------------- |
| `docs/qa/screenshots/map-1440.png`         | `/`                 | Authenticated map with filters, clusters, activity panel |
| `docs/qa/screenshots/dashboard-1440.png`   | `/dashboard`        | Dashboard with stats, reports, neighborhood watch        |
| `docs/qa/screenshots/profile-1440.png`     | `/profile`          | User profile with impact metrics, case list              |
| `docs/qa/screenshots/settings-1440.png`    | `/settings`         | Settings with notifications, language, about/legal       |
| `docs/qa/screenshots/case-detail-1440.png` | `/case/[id]`        | Case detail with hero, stats, photos, comments           |
| `docs/qa/screenshots/report-1440.png`      | `/report/new`       | Report step 1 category selection                         |
| `docs/qa/screenshots/moderation-1440.png`  | `/moderation`       | CRASH -- error overlay screenshot                        |
| `docs/qa/screenshots/government-1440.png`  | `/government`       | Government portal with KPI cards, case table             |
| `docs/qa/screenshots/authority-1440.png`   | `/authority/submit` | Authority contact suggestion form                        |
