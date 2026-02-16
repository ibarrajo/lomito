# QA Report: Public (Unauthenticated) Routes

**Date:** 2026-02-16
**Viewport:** 1440x900
**Browser:** Chrome (Playwright)
**Tester:** QA Agent 1

---

## Summary

Tested all public routes at `http://localhost:8081` in an unauthenticated state. The landing page, about page, legal pages, and auth pages all render correctly. However, there is a significant routing instability: **public routes intermittently redirect to `/auth/login` when stale Supabase auth tokens exist in localStorage**. This is the single most impactful issue found.

**Total issues found:** 10 (1 P0, 2 P1, 3 P2, 4 P3)

---

## Route-by-Route Findings

### 1. Landing Page (`/`)

**URL behavior:** Navigating to `http://localhost:8081/` with clean localStorage stays on `/` and renders the public landing page. With stale auth tokens, it redirects to `/auth/login`.

**What renders (from accessibility snapshot):**

- **PublicWebHeader:** Lomito.org logo link + "Iniciar sesion" button. No nav links in the header (differs from about/legal pages which have Inicio, Impacto, Como funciona, Transparencia links).
- **Hero section:** "Activo ahora en Tijuana" badge, H1 "Protegiendo a los animales de nuestra comunidad, juntos", description text, two CTA buttons: "Reportar Ahora" (mint, arrow icon) and "Ver Mapa" (outlined).
- **Stats bar:** 18 Casos Activos, 5 Resueltos Este Mes, 5+ Vidas Salvadas, 101h Tiempo Promedio de Respuesta. These appear to be live data from the database.
- **Live Impact Map section:** "Mapa de Impacto en Vivo" heading with a case list showing 8 recent cases with timestamps and statuses. The map area appears as a placeholder with "Tijuana" text.
- **Process Steps:** "Del reporte al rescate" with 3 steps: Reportar, Rastrear, Resolver.
- **Transparency section:** "Construido sobre Transparencia" with 3 cards: Datos de Codigo Abierto, Historial Permanente, Verificacion Comunitaria.
- **Accountability timeline:** "Forzamos la rendicion de cuentas" with Day 1/5/15/30 escalation timeline.
- **CTA Banner:** "Listo para hacer la diferencia?" with "Comenzar" button.
- **LandingFooter:** Full footer with columns (see section 2).

**Screenshot:** `docs/qa/screenshots/landing-1440.png`

**Issues:**

- Case descriptions in the "Live Impact Map" section are in English ("Dog left in hot car in parking...", "Puppy found by the beach...") while the rest of the page is in Spanish. These appear to come from seed data. **(P3 - data/i18n)**
- The map placeholder area is mostly empty with just "Tijuana" text -- no actual map renders in the landing page preview. This is by design (static preview), but the visual impression is of a broken map. **(P3 - visual polish)**

---

### 2. LandingFooter Link Audit

The landing page uses `LandingFooter` component (`apps/mobile/components/landing/landing-footer.tsx`).

#### Platform Links (3)

| Link          | Route            | Status                                                 |
| ------------- | ---------------- | ------------------------------------------------------ |
| Mapa          | `/auth/login`    | Working (redirects to login for unauthenticated users) |
| Nuevo reporte | `/auth/register` | Working (redirects to register)                        |
| Tablero       | `/auth/login`    | Working (redirects to login)                           |

#### Resources Links (3)

| Link                 | Route    | Status                                                                |
| -------------------- | -------- | --------------------------------------------------------------------- |
| Acerca de Lomito     | `/about` | Working                                                               |
| Blog                 | `#`      | **Placeholder** - no-op (href is `#`, onPress checks `route !== '#'`) |
| Preguntas frecuentes | `#`      | **Placeholder** - no-op                                               |

#### Community Links (4)

| Link           | Route | Status                                                               |
| -------------- | ----- | -------------------------------------------------------------------- |
| Voluntariado   | `#`   | **Placeholder** - no-op                                              |
| ONGs aliadas   | `#`   | **Placeholder** - no-op                                              |
| Casos de exito | `#`   | **Placeholder** - no-op                                              |
| Blog           | `#`   | **Placeholder** - no-op (duplicate Blog link from Resources section) |

#### Legal Links (3)

| Link                 | Route            | Status                  |
| -------------------- | ---------------- | ----------------------- |
| Aviso de Privacidad  | `/legal/privacy` | Working                 |
| Terminos de Servicio | `/legal/terms`   | Working                 |
| Contacto             | `#`              | **Placeholder** - no-op |

#### Social Icons (3)

| Icon      | Handler                | Status                                                                                                             |
| --------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Facebook  | **No onPress handler** | **Broken** - renders as a button with `accessibilityRole="link"` but has no navigation/URL. Clicking does nothing. |
| Twitter   | **No onPress handler** | **Broken** - same as Facebook                                                                                      |
| Instagram | **No onPress handler** | **Broken** - same as Instagram                                                                                     |

**Note:** The `PageFooter` component (used on about/legal pages) DOES have proper `Linking.openURL()` handlers for social icons pointing to `facebook.com/lomito.org`, `twitter.com/lomito_org`, and `instagram.com/lomito.org`. The `LandingFooter` is missing these handlers.

#### Language Toggle

- Present in footer as a button labeled "English" (when in Spanish mode)
- Toggles between `en` and `es` via `i18n.changeLanguage()`
- Working

#### Disclaimer

- "Lomito no es un sitio gubernamental" -- displays correctly

---

### 3. About Page (`/about`)

**URL behavior:** Stays on `/about` with clean localStorage. Redirects to `/auth/login` with stale tokens.

**What renders:**

- **PublicWebHeader:** Lomito.org logo + nav links (Inicio, Impacto, Como funciona, Transparencia) + "Iniciar sesion" button. This is a different/richer header than the landing page.
- **Content sections:**
  - H1 "Acerca de Lomito"
  - "Nuestra Mision" subtitle
  - "Por que construimos Lomito?" section
  - "Nuestra Mision" section (duplicated heading text with subtitle)
  - "Que estamos construyendo?" section
  - "Nuestro Equipo" section
  - "Codigo Abierto" subsection
  - "Proximas funciones" roadmap list: Android App (Planeado), iOS App (Planeado), Pet Registry (Planeado), AI Pet Finder (Explorando), Public Data OSINT (Explorando)
  - "Contactanos" section with links to lomito.org and hello@lomito.org
- **PageFooter:** Different footer from landing page. Has Platform (Mapa, Nuevo reporte, Tablero), Community (Acerca de Lomito, Impacto de la Plataforma, Donar), Legal (Aviso de Privacidad, Terminos de Servicio) sections. Social icons have proper URLs. Copyright line.

**Console errors on about page:**

- `Encountered two children with the same key` (3 occurrences) -- React key collision
- `Failed to load resource: 401` on `/functions/v1/track-event`

**Screenshot:** `docs/qa/screenshots/about-1440.png`

**Issues:**

- React key collision: "Encountered two children with the same key" errors appear 3 times when the about page renders. This suggests a list rendering issue (likely in the roadmap items or contact links). **(P2 - console error)**

---

### 4. Donate Page (`/donate`)

**URL behavior:** Initially loads at `/donate` with clean localStorage, then redirects to `/auth/login` after a few seconds.

**What renders:** The donate page briefly loads and then redirects. The donate route is listed in `publicRoutes` in `_layout.tsx` (line 51), but the donate page itself may have a `<Redirect>` or auth check that forces login.

**Console errors:** `Error fetching dashboard stats` -- the donate page appears to fetch dashboard stats which fails without auth.

**Screenshot:** `docs/qa/screenshots/donate-1440.png` (captured after redirect to login page)

**Issues:**

- Donate page redirects unauthenticated users to login despite being in `publicRoutes`. If donations should be possible without authentication, this is broken. If login is required, the route should not be in `publicRoutes` and should display a clear message. **(P1 - route protection logic)**

---

### 5. Legal Pages

#### Privacy (`/legal/privacy`)

**URL behavior:** Stays on `/legal/privacy` with clean localStorage. Renders correctly.

**What renders:**

- PublicWebHeader with nav links
- "AVISO DE PRIVACIDAD" heading
- Full privacy policy in Spanish covering: Responsable del tratamiento, Datos personales que recabamos, Finalidades del tratamiento, Comparticion de datos, Derechos ARCO, Revocacion del consentimiento, Cookies, Seguridad, Retencion, Transferencia internacional, Menores de edad, Modificaciones, Contacto (privacidad@lomito.org)
- PageFooter with language toggle

**Screenshot:** `docs/qa/screenshots/privacy-1440.png`

**Language toggle:** Present in footer. The content is in Spanish only (this is legal content, expected behavior per CLAUDE.md).

**Issues:** None observed.

#### Terms (`/legal/terms`)

**URL behavior:** Stays on `/legal/terms` with clean localStorage.

**Screenshot:** `docs/qa/screenshots/terms-1440.png`

**Issues:** None observed (similar structure to privacy page).

---

### 6. Impact Page

**URL behavior:**

- `/impact` -- redirects to `/` (the public landing). There is no top-level `/impact` route file.
- The actual impact page lives at `apps/mobile/app/(public)/impact.tsx`, accessible via the `(public)` route group.
- Expo Router exposes it at the root URL when navigated internally, but direct URL navigation to `/impact` does not match.

**Issues:**

- `/impact` is not directly accessible by URL. The about page and PageFooter link to `/(public)/impact`, but Expo Router rewrites `(public)` group URLs to `/`. A user clicking a footer link may end up at the landing page instead of impact. **(P2 - route accessibility)**

---

### 7. Auth Pages

#### Login (`/auth/login`)

**URL behavior:** Stays on `/auth/login`. Renders correctly.

**What renders:**

- Split layout: left panel with paw emoji, "Protegiendo a los animales de nuestra comunidad", "Plataforma civica para Tijuana"; right panel with login form
- Lomito.org branding + "Hecho con amor en Tijuana"
- H1: "Bienvenido de vuelta!"
- Two tabs: "Enviar enlace magico" (active) and "Contrasena"
- Email field with placeholder "tu@ejemplo.com"
- "Enviar enlace magico" submit button (mint/teal)
- "No tienes cuenta? Registrarse" link at bottom

**Screenshot:** `docs/qa/screenshots/login-1440.png`

**Issues:** None observed. Layout is clean and functional.

#### Register (`/auth/register`)

**URL behavior:** Stays on `/auth/register`. Renders correctly.

**What renders:**

- Split layout: left panel with "Unete a nuestra comunidad", "Juntos podemos proteger a los animales de Tijuana"
- Lomito.org branding
- H1: "Crear cuenta"
- Form fields: Nombre completo, Correo electronico, Numero de telefono (+52 664 placeholder), Municipio (dropdown, "Selecciona municipio"), Contrasena
- Two checkboxes: "Acepto el aviso de privacidad", "Acepto los terminos de servicio"
- "Crear cuenta" submit button (mint/teal)
- "Ya tienes cuenta? Iniciar sesion" link

**Screenshot:** `docs/qa/screenshots/register-1440.png`

**Issues:**

- The password field had pre-filled text `password123` visible in the snapshot. This appears to be from Chrome autofill or a previous test session rather than a default value, but it was notable. **(P3 - investigate if default value)**

---

### 8. Route Protection (Unauthenticated Access)

All protected routes correctly redirect unauthenticated users to `/` (the public landing page):

| Route         | Final URL                | Behavior                    |
| ------------- | ------------------------ | --------------------------- |
| `/dashboard`  | `http://localhost:8081/` | Redirects to public landing |
| `/profile`    | `http://localhost:8081/` | Redirects to public landing |
| `/moderation` | `http://localhost:8081/` | Redirects to public landing |
| `/government` | `http://localhost:8081/` | Redirects to public landing |
| `/settings`   | `http://localhost:8081/` | Redirects to public landing |
| `/report/new` | `http://localhost:8081/` | Redirects to public landing |

**Issues:**

- Protected routes redirect to `/` (the public landing) rather than `/auth/login`. This is the intended behavior per `_layout.tsx` line 56-57 (`router.replace('/(public)')`), but it means users don't get a clear "please log in" message -- they just see the landing page. **(P2 - UX)**

---

### 9. Console Errors

#### Persistent Errors (appear on every page load)

| Error                                                       | Frequency  | Severity                                                                         |
| ----------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------- |
| `Failed to load resource: 401 on /functions/v1/track-event` | Every page | P1 -- analytics edge function requires auth, fails for all unauthenticated users |
| `"shadow*" style props are deprecated`                      | Every page | P3 -- React Native deprecation warning                                           |
| `"textShadow*" style props are deprecated`                  | Every page | P3 -- React Native deprecation warning                                           |
| `[expo-notifications] Listening to push...`                 | Every page | P3 -- expected on web, harmless                                                  |

#### Page-Specific Errors

| Error                                          | Page(s)                    | Severity                                                 |
| ---------------------------------------------- | -------------------------- | -------------------------------------------------------- |
| `AuthApiError: Invalid Refresh Token`          | Landing (with stale token) | P1 -- causes redirect cascade                            |
| `Encountered two children with the same key`   | About, Legal pages         | P2 -- React key collision                                |
| `Error fetching dashboard stats`               | Donate                     | P2 -- page fetches data without auth                     |
| `Error: Failed to fetch https://api.mapbox...` | After map page loads       | P3 -- Mapbox API error (likely missing token or network) |
| `Layout children must be of type Screen`       | Multiple pages             | P3 -- Expo Router layout warning                         |
| `props.pointerEvents is deprecated`            | Map page                   | P3 -- RN deprecation                                     |

---

## Issues Summary

### P0 - Critical

1. **Stale auth token causes public route redirects to `/auth/login`** -- When a user has a stale/expired Supabase refresh token in localStorage (e.g., from a previous session), ALL public routes (`/`, `/about`, `/donate`, `/legal/*`) intermittently redirect to `/auth/login`. The root cause is that the `_layout.tsx` auth guard triggers a redirect during the token refresh failure cycle. This means returning visitors who previously logged in but whose session expired will be unable to view any public content until they manually clear their browser storage. **File:** `/Users/elninja/Code/lomito/apps/mobile/app/_layout.tsx` lines 45-68.

### P1 - High

2. **Analytics `track-event` edge function returns 401 for unauthenticated users** -- Every public page load triggers a call to `/functions/v1/track-event` that returns 401. This means no analytics are collected for unauthenticated visitors (the majority of first-time users).
3. **LandingFooter social icons have no click handlers** -- The Facebook, Twitter, and Instagram icons in the `LandingFooter` component (used on the landing page) have `accessibilityRole="link"` but no `onPress` handler, meaning they do nothing when clicked. The `PageFooter` (used on about/legal pages) correctly links to social URLs. **File:** `/Users/elninja/Code/lomito/apps/mobile/components/landing/landing-footer.tsx` lines 128-157.

### P2 - Medium

4. **Donate page redirects despite being in `publicRoutes`** -- The donate page is listed in `publicRoutes` but still redirects unauthenticated users, likely because the page component itself fetches dashboard stats or has its own auth requirement.
5. **`/impact` not directly accessible by URL** -- The impact page at `(public)/impact.tsx` is not reachable via direct URL navigation to `/impact`. Expo Router does not expose route group paths in the URL bar.
6. **React key collisions on about/legal pages** -- "Encountered two children with the same key" errors appear 3 times, indicating a list rendering bug.
7. **Protected routes redirect to landing page instead of login** -- When unauthenticated users try to access `/dashboard`, `/profile`, etc., they are sent to the public landing page rather than the login page with a "please sign in" message.

### P3 - Low

8. **Case descriptions in English on Spanish landing page** -- Seed data case descriptions ("Dog left in hot car...") appear in English within the otherwise-Spanish landing page.
9. **7 placeholder footer links** -- Blog (x2), FAQ, Voluntariado, ONGs aliadas, Casos de exito, Contacto all point to `#` and do nothing. These should either be implemented or removed.
10. **Deprecated React Native style props** -- `shadow*`, `textShadow*`, and `props.pointerEvents` deprecation warnings appear on every page.

---

## Screenshots Taken

| Screenshot               | Path                                    |
| ------------------------ | --------------------------------------- |
| Landing page (1440x900)  | `docs/qa/screenshots/landing-1440.png`  |
| About page (1440x900)    | `docs/qa/screenshots/about-1440.png`    |
| Donate page (1440x900)   | `docs/qa/screenshots/donate-1440.png`   |
| Privacy page (1440x900)  | `docs/qa/screenshots/privacy-1440.png`  |
| Terms page (1440x900)    | `docs/qa/screenshots/terms-1440.png`    |
| Login page (1440x900)    | `docs/qa/screenshots/login-1440.png`    |
| Register page (1440x900) | `docs/qa/screenshots/register-1440.png` |

**Note:** The about and donate screenshots captured the login page due to the stale-token redirect issue (P0). The landing page screenshot was captured correctly.

---

## Two Footer Components

The app has two different footer components used on public pages:

1. **`LandingFooter`** (`/Users/elninja/Code/lomito/apps/mobile/components/landing/landing-footer.tsx`) -- Used on the landing page (`/`). Has 5 columns (Brand, Platform, Resources, Community, Legal) + social icons (no handlers) + language toggle + disclaimer.

2. **`PageFooter`** (`/Users/elninja/Code/lomito/apps/mobile/components/shared/page-footer.tsx`) -- Used on about, legal, and other content pages. Has 4 columns (Brand, Platform, Community, Legal) + social icons (with proper URLs to facebook.com/lomito.org, twitter.com/lomito_org, instagram.com/lomito.org) + copyright + language toggle.

These should be consolidated into a single footer component for consistency.
