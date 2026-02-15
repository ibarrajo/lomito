# Visual QA & Functionality Audit

**Date:** 2026-02-14
**Scope:** All web-accessible pages at desktop viewport (1280px)

---

## Bug Fixed During Audit

**Public routes redirect to landing page** — `/about`, `/donate`, `/legal/privacy`, `/legal/terms` all redirected unauthenticated users back to `/(public)` because the root layout's auth guard didn't include these routes in its allow-list. Fixed by adding `['about', 'donate', 'legal']` to the `publicRoutes` array in `_layout.tsx`.

---

## Page-by-Page Findings

### 1. Landing Page (`/(public)`)

**Status:** Good after redesign

**Positives:**

- Left-aligned hero with step flow visualization avoids the centered-everything AI look
- Asymmetric bento grid (1 large + 2 stacked small) adds visual variety
- Community section with accent bar is distinctive
- Footer is horizontal and compact — not an overblown 4-column grid
- Proper heading hierarchy (h1 > h2 > h3)
- All text localized via `t()`, language toggle works

**Issues to fix:**

- [ ] **Large left card has excessive empty space** — the `minHeight: 240` forces the card tall even when content is short. The right stacked cards match better because they size to content. Remove `minHeight` on `bentoLarge` or reduce to 180.
- [ ] **Step flow hero visual has no visual anchor** — the step cards on the right side float without a clear connection to the hero. Consider adding a subtle heading like "How it works" above the steps, or a thin border/background grouping.
- [ ] **"Iniciar sesión" button on hero says "login" but has accessibilityLabel for "View Map"** — the CTA secondary button text shows `auth.login` but the aria label uses `landing.ctaViewMap`. Mismatch.
- [ ] **No back-to-top on long scroll** — not critical, but the page has 4 sections and no quick return to top.

### 2. Login Page (`/auth/login`)

**Status:** Needs significant desktop polish

**Issues:**

- [ ] **Full-width form on desktop** — the form stretches edge-to-edge at 1280px. On desktop web, auth forms should be centered with max-width ~440px. This is the single biggest visual issue.
- [ ] **No branding on the page** — no logo, no app name, no illustration. Just a bare form floating on white. Compare to any modern auth page — there should be at minimum the Lomito wordmark above the form.
- [ ] **Uses `Alert.alert()` for success/error** — on web this renders as `window.alert()`, a native browser dialog. Should use AppModal or toast.
- [ ] **Tab switcher text alignment** — "Enviar enlace mágico" and "Enviar código por SMS" are left-aligned within their tabs. On desktop, center-aligning the tab labels would look better.
- [ ] **No visual hierarchy between tabs and form** — the tab and form blend into one block. Add vertical spacing or a subtle separator.

### 3. Register Page (`/auth/register`)

**Status:** Needs significant desktop polish

**Issues:**

- [ ] **Full-width form on desktop** — same as login. Form stretches full width. Needs max-width ~480px centered container.
- [ ] **No branding** — same as login. No logo or wordmark.
- [ ] **Uses `Alert.alert()` for validation/success** — same web issue as login.
- [ ] **Municipality dropdown** — shows "Selecciona municipio" as a flat text input rather than a proper dropdown/picker. On web, this should be a `<select>` or a styled dropdown.
- [ ] **Checkbox styling** — the privacy/terms checkboxes are small and hard to click. Touch targets appear smaller than 44px minimum.
- [ ] **Password field console warning** — "Password field is not contained in a form" (DOM warning from browser).

### 4. About Page (`/about`)

**Status:** Functional, needs visual refinement

**Positives:**

- Container wrapper at 720px works well for prose
- Heading hierarchy correct (h1 in header, h2 for sections)
- Contact links functional

**Issues:**

- [ ] **Very sparse content** — "Nuestra Misión", "Nuestro Equipo", "Código Abierto" are each 1-2 sentences. Feels like placeholder text, not a real about page.
- [ ] **"Código Abierto" heading nests inside "Nuestro Equipo" card visually** — it's indented as if it's a subsection rather than a peer section. Needs its own card.
- [ ] **No hero or visual** — just stacked cards. Adding a small illustration, photo, or even a colored banner with the mission statement would help.
- [ ] **No navigation back to landing page** — the back button uses `router.back()`, which may not work if the user navigated directly to `/about` via URL. Should fall back to `/`.
- [ ] **No footer** — unlike the landing page, there's no footer with nav links. The page just ends.

### 5. Donate Page (`/donate`)

**Status:** Functional, needs desktop adaptation

**Positives:**

- Payment method selection is clear (card, OXXO, SPEI)
- Amount picker with presets + custom input is good UX
- Info text updates based on selected payment method

**Issues:**

- [ ] **Full-width on desktop** — the donation form stretches edge-to-edge. Should be max-width ~560px centered.
- [ ] **Uses raw `Text` instead of Typography components** — `headerTitle` uses `...typography.h1` spread instead of `<H1>`. Same for `infoText`, `submitButtonText`.
- [ ] **Uses `Alert.alert()` for errors/processing** — web `window.alert()` issue.
- [ ] **Back button goes to previous page** — if user arrived from landing page, they go back to landing. But if they typed the URL directly, `router.back()` does nothing useful. Should have a fallback.
- [ ] **Custom amount field shows "$0" initially** — the "$0" looks odd, an empty field with placeholder "$0 MXN" would be cleaner.
- [ ] **No explanation of what donations support** — the page jumps straight to amount. Adding a brief sentence about where money goes (server costs, operations) would increase trust and conversion.

### 6. Privacy Policy (`/legal/privacy`)

**Status:** Good, minor issues

**Positives:**

- Container wrapper at 720px, readable prose width
- Complete legal content in Spanish
- Proper heading structure

**Issues:**

- [ ] **Duplicate header** — "Última actualización: February 2026" appears twice (once in English, once in the document body in Spanish). The Container-injected one shows the English date format.
- [ ] **Section headings are ALL CAPS plain text** — not using H2/H3 components, just styled Text. This hurts heading hierarchy for screen readers.
- [ ] **No footer navigation** — page ends abruptly. No way to navigate to terms, about, or back to landing without browser back button.

### 7. Terms of Service (`/legal/terms`)

**Status:** Good, same issues as privacy

**Issues:**

- [ ] **Same duplicate header** as privacy page.
- [ ] **Same ALL CAPS headings** — not semantic headings, just styled text.
- [ ] **No footer navigation** — same as privacy.
- [ ] **Long document, no table of contents** — at 15+ sections, a quick-link TOC at top would help navigation.

---

## Cross-Cutting Issues

### Desktop Layout

| Issue                                        | Pages Affected             | Priority |
| -------------------------------------------- | -------------------------- | -------- |
| Forms stretch full-width on desktop          | Login, Register, Donate    | **High** |
| No consistent page footer                    | About, Donate, Legal pages | Medium   |
| No branding on auth screens                  | Login, Register            | **High** |
| Back button doesn't handle direct URL visits | About, Donate              | Low      |

### Code Quality

| Issue                                           | Pages Affected          | Priority |
| ----------------------------------------------- | ----------------------- | -------- |
| `Alert.alert()` renders as browser alert on web | Login, Register, Donate | **High** |
| Raw `Text` instead of Typography components     | Donate                  | Medium   |
| Typography spread styles instead of components  | Donate                  | Low      |

### Accessibility

| Issue                                                        | Pages Affected | Priority |
| ------------------------------------------------------------ | -------------- | -------- |
| Legal headings are visual-only (ALL CAPS text, not semantic) | Privacy, Terms | Medium   |
| Register checkboxes may be below 44px touch target           | Register       | Medium   |
| CTA aria-label mismatch on landing page                      | Landing        | Low      |

### Content

| Issue                                          | Pages Affected | Priority |
| ---------------------------------------------- | -------------- | -------- |
| About page content feels like placeholders     | About          | Medium   |
| Donate page lacks trust-building copy          | Donate         | Medium   |
| Legal pages show duplicate "Last updated" line | Privacy, Terms | Low      |

---

## Priority Recommendations

### P0 — Must fix before launch

1. **Center auth forms on desktop** — wrap login/register in a centered max-width container (~440px). This is the most jarring desktop issue.
2. **Replace `Alert.alert()` with AppModal on web** — browser `window.alert()` breaks the experience.

### P1 — Should fix before launch

3. **Center donate form on desktop** — max-width ~560px.
4. **Add Lomito branding to auth pages** — wordmark + tagline above the form.
5. **Add consistent footer to all public pages** — reuse the landing page footer pattern.
6. **Fix legal page heading hierarchy** — use H2 components instead of ALL CAPS styled text.

### P2 — Polish

7. **Improve about page content** — expand mission, team, open-source sections.
8. **Add trust copy to donate page** — "Your donation supports..." paragraph.
9. **Fix bento card heights** on landing page.
10. **Fix CTA aria-label mismatch** on landing page.
11. **Add visual warmth to auth pages** — colored sidebar on desktop, accent elements.
12. **Add hero banner to about page** — colored card with mission statement.

### P3 — Responsive Width Testing

Test all pages at these viewports and document layout issues:

| Viewport           | Width  | Target                                             |
| ------------------ | ------ | -------------------------------------------------- |
| Mobile (iPhone SE) | 375px  | Forms fill width, no horizontal scroll             |
| Mobile (iPhone 14) | 390px  | Same as SE                                         |
| Tablet portrait    | 768px  | Forms centered, bento grid collapses gracefully    |
| Small desktop      | 1024px | Navbar visible, tabs hidden, sidebar shows on auth |
| Wide desktop       | 1440px | Content constrained to 1280px max-width            |

**Pages to test at each width:**

- [ ] Landing page (`/(public)`)
- [ ] Login (`/auth/login`)
- [ ] Register (`/auth/register`)
- [ ] About (`/about`)
- [ ] Donate (`/donate`)
- [ ] Legal/Privacy (`/legal/privacy`)
- [ ] Legal/Terms (`/legal/terms`)
- [ ] Map (authenticated, `/(tabs)`)
- [ ] Dashboard (authenticated, `/(tabs)/dashboard`)
- [ ] Profile (authenticated, `/(tabs)/profile`)
- [ ] Settings (authenticated, `/(tabs)/settings`)
- [ ] Report flow (`/report/new`)
- [ ] Case detail (`/case/[id]`)
