# Lomito Design Tokens

## Colors

### Primary

| Token               | Hex     | RGB           | Usage                                              |
| ------------------- | ------- | ------------- | -------------------------------------------------- |
| color-primary       | #13ECC8 | 19, 236, 200  | Primary buttons, active states, brand accent, CTAs |
| color-primary-dark  | #0FBDA0 | 15, 189, 160  | Pressed states, hover states                       |
| color-primary-light | #E6FDF9 | 230, 253, 249 | Primary tinted backgrounds, highlight areas        |

### Secondary

| Token                 | Hex     | RGB           | Usage                                       |
| --------------------- | ------- | ------------- | ------------------------------------------- |
| color-secondary       | #1E293B | 30, 41, 59    | Navy text, headings, dark UI elements       |
| color-secondary-light | #F1F5F9 | 241, 245, 249 | Light slate backgrounds, secondary surfaces |

### Accent

| Token        | Hex     | RGB          | Usage                                        |
| ------------ | ------- | ------------ | -------------------------------------------- |
| color-accent | #F2994A | 242, 153, 74 | Warnings, attention markers, warm highlights |

### Neutrals

| Token             | Hex     | Usage                            |
| ----------------- | ------- | -------------------------------- |
| color-neutral-900 | #1E293B | Body text, headings              |
| color-neutral-700 | #334155 | Secondary text, captions         |
| color-neutral-500 | #64748B | Placeholders, disabled states    |
| color-neutral-400 | #94A3B8 | Borders, dividers                |
| color-neutral-200 | #E2E8F0 | Input borders, card strokes      |
| color-neutral-100 | #F6F8F8 | Page backgrounds, card fills     |
| color-white       | #FFFFFF | Card surfaces, input backgrounds |

### Dark Surfaces

| Token                 | Hex     | Usage                                                  |
| --------------------- | ------- | ------------------------------------------------------ |
| color-dark-bg         | #101d22 | Dark mode page backgrounds (hero sections)             |
| color-dark-surface    | #18282f | Dark mode card surfaces, section backgrounds           |
| color-dark-surface-lt | #20343d | Dark mode elevated surfaces, hover states, input fills |

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
| color-error   | #DC2626 | #FEF2F2    | Error states, abuse reports   |
| color-warning | #F59E0B | #FFFBEB    | Warning states, pending items |
| color-success | #059669 | #ECFDF5    | Success states, resolved      |
| color-info    | #2563EB | #EFF6FF    | Information, help text        |

## Typography

### Font Families

| Role           | Font           | Weight                           | Source       |
| -------------- | -------------- | -------------------------------- | ------------ |
| Display / Body | Public Sans    | Regular (400) through Bold (700) | Google Fonts |
| Monospace      | JetBrains Mono | Regular (400)                    | Google Fonts |

### Type Scale (Mobile)

| Element    | Size | Weight       | Line Height | Token        |
| ---------- | ---- | ------------ | ----------- | ------------ |
| Display    | 36px | Bold 700     | 1.2         | text-display |
| Heading 1  | 28px | Bold 700     | 1.25        | text-h1      |
| Heading 2  | 22px | Semibold 600 | 1.3         | text-h2      |
| Heading 3  | 18px | Semibold 600 | 1.35        | text-h3      |
| Body       | 15px | Regular 400  | 1.5         | text-body    |
| Body Small | 13px | Regular 400  | 1.45        | text-small   |
| Caption    | 11px | Medium 500   | 1.4         | text-caption |
| Button     | 14px | Bold 700     | 1.0         | text-button  |

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
| Status tags                  | 6px                   |
| Badges and pills             | 9999px                |
| Avatar / profile images      | 50% (circle)          |
| Map pins                     | Custom SVG (teardrop) |

## Shadows (Neutral)

| Level        | Value                                                         |
| ------------ | ------------------------------------------------------------- |
| Card         | 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)  |
| Elevated     | 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04) |
| Bottom sheet | 0 -4px 24px rgba(31, 35, 40, 0.15)                            |

## Icons

- Library: lucide-react-native (Lucide icons)
- Sizes: 20px (inline), 24px (nav/actions), 32px (empty states)
- Stroke width: 1.5px (Lucide default)
- Color: inherits from text color; use semantic colors for category icons on map

## Component Specs

### Buttons

- Primary: bg color-primary, text color-secondary (dark on mint), 8px radius, 48px min height, 16px h-padding. Pressed: bg color-primary-dark.
- Secondary: bg white, 1px border color-neutral-200, text color-secondary. Pressed: bg color-neutral-100.
- Ghost: bg transparent, no border, text color-primary.
- Destructive: bg color-error, text white.
- Disabled: opacity 0.5, no pointer events.

### Cards

- White background, 12px radius, neutral card shadow, 1px border color-neutral-200, 16px padding.
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

On desktop (>=1024px), headings scale up for better readability at distance:

| Element    | Mobile | Desktop | Delta |
| ---------- | ------ | ------- | ----- |
| Display    | 36px   | 44px    | +8px  |
| Heading 1  | 28px   | 36px    | +8px  |
| Heading 2  | 22px   | 26px    | +4px  |
| Heading 3  | 18px   | 21px    | +3px  |
| Body       | 15px   | 16px    | +1px  |
| Body Small | 13px   | 14px    | +1px  |

## Component Specs (Desktop)

### Navbar

- Height: 64px, sticky top, white background
- Bottom border: 1px neutral-200
- Shadow: card shadow (neutral)
- Left: Logo icon + "Lomito.org" wordmark
- Center: Navigation links (active = primary color underline, 2px)
- Right: Language toggle, user avatar dropdown, primary CTA button
- All labels use `t()` translations

### Modal (AppModal)

- Overlay: neutral-900 at 50% opacity
- Card: white, max-width 400px, border-radius 12px (card)
- Title: H2, message: Body
- Action buttons: right-aligned, primary + ghost variants
- Entry animation: scale 0.95->1.0 + opacity 0->1, duration-normal

### Language Picker

- Two options: Espanol, English
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

## Component Patterns

### Split-Pane Layouts

Desktop moderation and government dashboards use a split-pane pattern:

- **Left sidebar (320px)**: Scrollable list of items (pending cases, reports) with search input and status badges
- **Right detail panel (fills remaining width)**: Full detail view of selected item
- **Selection state**: Selected item in sidebar has `primaryLight` background and `primary` border
- **Empty state**: Right panel shows centered empty state when no item is selected
- **Example components**: `queue-sidebar.tsx`, `review-detail-panel.tsx`, `case-detail-panel.tsx`

### KPI Cards

Used in government dashboard and impact screens:

- **Structure**: Icon (emoji, 32px) + Large value (H1) + Label (small) + Optional trend indicator
- **Layout**: Centered content, white background, card border, flex: 1 for equal widths in row
- **Trend colors**: Green (success) for up, red (error) for down, gray (neutral500) for neutral
- **Min width**: 150px to prevent excessive squishing on mobile
- **Example component**: `kpi-card.tsx`

### Data Visualization

Custom chart components for dashboard screens:

#### Bar Chart

- **Y-axis**: Left-aligned labels (0-100 scale), right-aligned text in caption size
- **Bars**: Rounded corners (4px), primaryDark fill, responsive height based on max value
- **X-axis labels**: Jurisdiction names below bars in small font, truncated if needed
- **Example component**: `jurisdiction-bar-chart.tsx`

#### Line Chart

- **Grid lines**: Horizontal lines at 25/50/75/100, neutral200 color
- **Line**: Primary color, 2px stroke width, connected points
- **Points**: Circles at data points, primary fill
- **Example component**: `trend-line-chart.tsx`

#### Ranking Table

- **Rows**: Rank number + jurisdiction name + metric value + visual bar indicator
- **Bar indicator**: Horizontal bar showing relative value, primaryDark fill
- **Top performer**: First row gets success color accent
- **Example component**: `efficiency-ranking-table.tsx`

### Gamification Badges

User profile gamification system:

- **Badge display**: Pill-shaped badge with primary background, secondary text
- **Levels**: "Civic Guardian Lvl 1-4" based on case count (1, 3, 6, 11 thresholds)
- **Progress text**: "N more reports to reach Lvl X" in neutral500 below badge
- **Hidden for level 0**: Badge only shows once user has submitted at least 1 case
- **Example component**: `gamification-badge.tsx`

### Trust Badges

Security/compliance badges for payment pages:

- **Layout**: Icon (Shield/Lock, success color) + Title (bold) + Description (caption)
- **Structure**: Horizontal card with left icon, right content (title stacked on description)
- **Examples**: "SSL Secure - 256-bit encryption", "PCI DSS Compliant - Payment security"
- **Example component**: `trust-badges.tsx`

### Community Discussion Thread

Profile screen discussion/comment component pattern:

- **Thread items**: Avatar (48px circle) + Name + Timestamp + Message text
- **Actions**: Reply/Like buttons in neutral500, active state in primary
- **Nesting**: Indented replies with subtle left border to show thread hierarchy
- **Loading skeleton**: Gray placeholders while content loads
- **Example component**: `neighborhood-watch.tsx`

### Donation Progress Widget

Visual progress indicator for fundraising:

- **Progress bar**: Full-width bar with primaryDark fill showing percentage
- **Labels**: Current amount / goal amount above bar, percentage inside bar
- **Variants**: Can show "X days left" timer or supporter count
- **Call to action**: Primary button below with "Donate Now" text

## Design Alignment

Lomito's current design was aligned with Stitch designs (Project ID: 17139143970723271940) during a QA pass in February 2025. Key decisions:

- **Primary color**: Kept Lomito's mint (#13ECC8) instead of Stitch's teal variants for brand consistency
- **Light mode default**: Stitch designs were dark-mode heavy; we use light mode by default with dark hero sections for visual interest
- **Desktop-first wireframes**: Stitch provided desktop layouts; we adapted to mobile-first responsive patterns using breakpoints
- **Component library**: Used Stitch as inspiration but built components in React Native with design tokens, not pixel-perfect copies

See `STITCH_SCREEN_MAP.md` for full screen mapping.

## Design Anti-Patterns (Avoiding the AI-Generated Look)

When building new pages or components, actively avoid these common AI-generated design tells:

### Layout

- **Never center everything** — left-align hero text, section headers, and body copy. Centered layouts feel generic and template-like.
- **Break the 3-identical-cards pattern** — use asymmetric layouts: one large card + two stacked small cards (bento grid), or vary card sizes deliberately. Never place 3 identically-sized cards in a row.
- **Vary section rhythms** — alternate between full-width sections, contained sections, and accent-bar callouts. Avoid identical spacing between every section.

### Visual Hierarchy

- **Use fewer, more purposeful icons** — don't put a Lucide icon on every card. Use icons where they add meaning (navigation, status indicators), not decoration.
- **Avoid symmetric icon-title-description cards** — if every card has `[icon] -> [H3] -> [Body]`, the page feels generated. Mix formats: some cards with icons, some without, some with accent borders instead.
- **Reduce excessive whitespace** — AI-generated pages tend to over-space. Tighten padding to what feels intentional, not empty.

### Content & Tone

- **Write specific, non-generic copy** — "Protecting our community's animals, together" is better than "Welcome to our platform". Reference Tijuana, Mexico, the specific problem being solved.
- **Show real data where possible** — stats, case counts, response times. Concrete numbers build trust more than abstract statements.
- **Avoid corporate-speak** — "empowering communities" reads like a template. "We report animal welfare issues to the authorities who are supposed to handle them" reads like humans wrote it.

### Components

- **Auth pages need identity** — a bare form on white looks like a template. Add the app wordmark, a tagline, or a colored sidebar. The user should know which app they're logging into.
- **Footers should be compact** — a single horizontal row with links is better than a massive 4-column footer grid that looks like a WordPress theme.
- **Prefer accent bars over icon decorations** — a 4px colored left border on a callout is more distinctive than a circle-with-icon above every section.
