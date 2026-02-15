# Lomito Design Tokens

## Colors

### Primary

| Token               | Hex     | RGB           | Usage                                                      |
| ------------------- | ------- | ------------- | ---------------------------------------------------------- |
| color-primary       | #D4662B | 212, 102, 43  | Primary buttons, active states, brand accent, CTAs         |
| color-primary-dark  | #A34D1E | 163, 77, 30   | Primary text on light backgrounds, pressed states, headers |
| color-primary-light | #FFF8F3 | 255, 248, 243 | Primary tinted backgrounds, highlight areas                |

### Secondary

| Token                 | Hex     | RGB           | Usage                                          |
| --------------------- | ------- | ------------- | ---------------------------------------------- |
| color-secondary       | #1A6B54 | 26, 107, 84   | Success states, resolved cases, trust signals  |
| color-secondary-light | #E8F3EF | 232, 243, 239 | Resolved case backgrounds, positive highlights |

### Accent

| Token        | Hex     | RGB          | Usage                                            |
| ------------ | ------- | ------------ | ------------------------------------------------ |
| color-accent | #E8A838 | 232, 168, 56 | Warnings, attention markers, stray category pins |

### Neutrals

| Token             | Hex     | Usage                            |
| ----------------- | ------- | -------------------------------- |
| color-neutral-900 | #1F2328 | Body text, headings              |
| color-neutral-700 | #4A5568 | Secondary text, captions         |
| color-neutral-500 | #718096 | Placeholders, disabled states    |
| color-neutral-400 | #A0AEC0 | Borders, dividers                |
| color-neutral-200 | #E2E8F0 | Input borders, card strokes      |
| color-neutral-100 | #F7F8FA | Page backgrounds, card fills     |
| color-white       | #FFFFFF | Card surfaces, input backgrounds |

### Semantic (Case Categories)

| Category   | Pin Color | Hex     | Background |
| ---------- | --------- | ------- | ---------- |
| Abuse      | Red       | #C53030 | #FFF5F5    |
| Stray      | Amber     | #DD6B20 | #FFFAF0    |
| Missing    | Blue      | #2B6CB0 | #EBF8FF    |
| Resolved   | Green     | #276749 | #F0FFF4    |
| Unresolved | Gray      | #718096 | #F7F8FA    |

### Status Colors

| Token         | Hex     | Background | Usage                         |
| ------------- | ------- | ---------- | ----------------------------- |
| color-error   | #C53030 | #FFF5F5    | Error states, abuse reports   |
| color-warning | #DD6B20 | #FFFAF0    | Warning states, pending items |
| color-success | #276749 | #F0FFF4    | Success states, resolved      |
| color-info    | #2B6CB0 | #EBF8FF    | Information, help text        |

## Typography

### Font Families

| Role            | Font           | Weight                        | Source       |
| --------------- | -------------- | ----------------------------- | ------------ |
| Display / H1-H2 | DM Sans        | Bold (700)                    | Google Fonts |
| Body / H3+      | Source Sans 3  | Regular (400), Semibold (600) | Google Fonts |
| Monospace       | JetBrains Mono | Regular (400)                 | Google Fonts |

### Type Scale (Mobile)

| Element    | Size | Weight       | Line Height | Token        |
| ---------- | ---- | ------------ | ----------- | ------------ |
| Display    | 32px | Bold 700     | 1.2         | text-display |
| Heading 1  | 24px | Bold 700     | 1.25        | text-h1      |
| Heading 2  | 20px | Semibold 600 | 1.3         | text-h2      |
| Heading 3  | 17px | Semibold 600 | 1.35        | text-h3      |
| Body       | 15px | Regular 400  | 1.5         | text-body    |
| Body Small | 13px | Regular 400  | 1.45        | text-small   |
| Caption    | 11px | Regular 400  | 1.4         | text-caption |
| Button     | 15px | Semibold 600 | 1.0         | text-button  |

## Spacing

All spacing uses an 8px base grid.

| Token     | Value | Usage                                     |
| --------- | ----- | ----------------------------------------- |
| space-xs  | 4px   | Tight internal padding, icon-to-label gap |
| space-sm  | 8px   | Default inner padding, list item spacing  |
| space-md  | 16px  | Card padding, section gaps within cards   |
| space-lg  | 24px  | Section spacing, content area padding     |
| space-xl  | 32px  | Major section breaks, screen edge padding |
| space-2xl | 48px  | Hero sections, page-level spacing         |

## Border Radius

| Element                      | Value                 |
| ---------------------------- | --------------------- |
| Cards, modals, bottom sheets | 12px                  |
| Buttons                      | 8px                   |
| Input fields                 | 8px                   |
| Badges and pills             | 9999px                |
| Avatar / profile images      | 50% (circle)          |
| Map pins                     | Custom SVG (teardrop) |

## Shadows (Warm-Toned)

| Level        | Value                                                                 |
| ------------ | --------------------------------------------------------------------- |
| Card         | 0 1px 3px rgba(164, 77, 30, 0.08), 0 1px 2px rgba(164, 77, 30, 0.06)  |
| Elevated     | 0 4px 12px rgba(164, 77, 30, 0.12), 0 2px 4px rgba(164, 77, 30, 0.08) |
| Bottom sheet | 0 -4px 24px rgba(31, 35, 40, 0.15)                                    |

## Icons

- Library: lucide-react-native (Lucide icons)
- Sizes: 20px (inline), 24px (nav/actions), 32px (empty states)
- Stroke width: 1.5px (Lucide default)
- Color: inherits from text color; use semantic colors for category icons on map

## Component Specs

### Buttons

- Primary: bg color-primary, text white, 8px radius, 48px min height, 16px h-padding. Pressed: bg color-primary-dark.
- Secondary: bg transparent, 1px border color-primary, text color-primary. Pressed: bg color-primary-light.
- Ghost: bg transparent, no border, text color-primary.
- Destructive: bg color-error, text white.
- Disabled: opacity 0.5, no pointer events.

### Cards

- White background, 12px radius, warm card shadow, 16px padding.
- Map summary cards: 4px left border in category color.

### Inputs

- Height: 48px. Radius: 8px. Border: 1px color-neutral-200. Focus: 2px color-primary.
- Label: text-small, color-neutral-700, 4px gap to input.
- Error: border color-error, message in text-caption color-error.
- All inputs must have visible labels (no placeholder-only).

### Map Pins

- Custom SVG teardrop shape with paw-print silhouette.
- Color-coded by category (see Semantic Colors).
- Resolved pins: smaller, desaturated.
- Clusters: circle with count, gradient from dominant category color.

## Responsive Breakpoints

| Token              | Value  | Usage                          |
| ------------------ | ------ | ------------------------------ |
| breakpoint-mobile  | 0px    | Default, phone screens         |
| breakpoint-tablet  | 768px  | Tablet portrait, small laptops |
| breakpoint-desktop | 1024px | Desktop, laptop screens        |
| breakpoint-wide    | 1440px | Wide desktop monitors          |

## Layout Tokens

| Token                            | Value  | Usage                                   |
| -------------------------------- | ------ | --------------------------------------- |
| layout-max-content-width         | 1280px | Maximum content area width on desktop   |
| layout-navbar-height             | 64px   | Top navigation bar height (desktop web) |
| layout-sidebar-width             | 280px  | Reserved for future sidebar navigation  |
| layout-map-panel-width           | 400px  | Case detail panel on desktop map view   |
| layout-container-padding-mobile  | 16px   | Horizontal page padding on mobile       |
| layout-container-padding-tablet  | 24px   | Horizontal page padding on tablet       |
| layout-container-padding-desktop | 32px   | Horizontal page padding on desktop      |

## Motion Tokens

### Durations

| Token            | Value | Usage                                |
| ---------------- | ----- | ------------------------------------ |
| duration-instant | 100ms | Micro-interactions, toggles          |
| duration-fast    | 200ms | Button presses, chip toggles         |
| duration-normal  | 300ms | Page transitions, modals             |
| duration-slow    | 500ms | Complex animations, hero transitions |

### Easing Curves

| Token             | Value                        | Usage                                        |
| ----------------- | ---------------------------- | -------------------------------------------- |
| easing-default    | cubic-bezier(0.4, 0, 0.2, 1) | Standard movement (Material Design standard) |
| easing-decelerate | cubic-bezier(0, 0, 0.2, 1)   | Elements entering screen                     |
| easing-accelerate | cubic-bezier(0.4, 0, 1, 1)   | Elements leaving screen                      |

### Spring Configuration

| Token            | Value | Usage                       |
| ---------------- | ----- | --------------------------- |
| spring-damping   | 15    | Reanimated spring damping   |
| spring-stiffness | 150   | Reanimated spring stiffness |
| spring-mass      | 1     | Reanimated spring mass      |

All animations must respect `useReducedMotion()` — skip or simplify when true.

## Desktop Typography Scale

On desktop (≥1024px), headings scale up for better readability at distance:

| Element    | Mobile | Desktop | Delta |
| ---------- | ------ | ------- | ----- |
| Display    | 32px   | 40px    | +8px  |
| Heading 1  | 24px   | 32px    | +8px  |
| Heading 2  | 20px   | 24px    | +4px  |
| Heading 3  | 17px   | 20px    | +3px  |
| Body       | 15px   | 16px    | +1px  |
| Body Small | 13px   | 14px    | +1px  |

## Component Specs (Desktop)

### Navbar

- Height: 64px, sticky top, white background
- Bottom border: 1px neutral-200
- Shadow: card shadow (warm-toned)
- Left: Logo wordmark
- Center: Navigation links (active = primary color underline, 2px)
- Right: Language toggle, user avatar dropdown, primary CTA button
- All labels use `t()` translations

### Modal (AppModal)

- Overlay: neutral-900 at 50% opacity
- Card: white, max-width 400px, border-radius 12px (card)
- Title: H2, message: Body
- Action buttons: right-aligned, primary + ghost variants
- Entry animation: scale 0.95→1.0 + opacity 0→1, duration-normal

### Language Picker

- Two options: Español, English
- Radio-style selection (circle indicator)
- Persists to AsyncStorage, applies via `i18n.changeLanguage()`

## Desktop Layout Patterns

### Split-Pane Map

On desktop, the map view uses a split layout:

- Left panel (400px): case list / case detail
- Right: full-height map
- Panel slides in/out with duration-normal easing-default

### Multi-Column Grid

Dashboard stats and landing page feature cards use a responsive grid:

- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns
- Min column width: 300px, gap: 16px

### Max-Width Containers

All page content wraps in a `Container` component:

- Max width: 1280px (layout-max-content-width)
- Centered with auto margins
- Responsive padding by breakpoint
- Prose content (about, legal): max-width 720px for readability
- Auth forms (login, register): max-width 440px, centered
- Single-action pages (donate): max-width 560px, centered

## Design Anti-Patterns (Avoiding the AI-Generated Look)

When building new pages or components, actively avoid these common AI-generated design tells:

### Layout

- **Never center everything** — left-align hero text, section headers, and body copy. Centered layouts feel generic and template-like.
- **Break the 3-identical-cards pattern** — use asymmetric layouts: one large card + two stacked small cards (bento grid), or vary card sizes deliberately. Never place 3 identically-sized cards in a row.
- **Vary section rhythms** — alternate between full-width sections, contained sections, and accent-bar callouts. Avoid identical spacing between every section.

### Visual Hierarchy

- **Use fewer, more purposeful icons** — don't put a Lucide icon on every card. Use icons where they add meaning (navigation, status indicators), not decoration.
- **Avoid symmetric icon-title-description cards** — if every card has `[icon] → [H3] → [Body]`, the page feels generated. Mix formats: some cards with icons, some without, some with accent borders instead.
- **Reduce excessive whitespace** — AI-generated pages tend to over-space. Tighten padding to what feels intentional, not empty.

### Content & Tone

- **Write specific, non-generic copy** — "Protecting our community's animals, together" is better than "Welcome to our platform". Reference Tijuana, Mexico, the specific problem being solved.
- **Show real data where possible** — stats, case counts, response times. Concrete numbers build trust more than abstract statements.
- **Avoid corporate-speak** — "empowering communities" reads like a template. "We report animal welfare issues to the authorities who are supposed to handle them" reads like humans wrote it.

### Components

- **Auth pages need identity** — a bare form on white looks like a template. Add the app wordmark, a tagline, or a colored sidebar. The user should know which app they're logging into.
- **Footers should be compact** — a single horizontal row with links is better than a massive 4-column footer grid that looks like a WordPress theme.
- **Prefer accent bars over icon decorations** — a 4px colored left border on a callout is more distinctive than a circle-with-icon above every section.
