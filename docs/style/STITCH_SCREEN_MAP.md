# Stitch Design Screen Mapping

**Stitch Project ID:** 17139143970723271940

This document maps Stitch design screens to Lomito app routes and implementation status.

## Design Alignment Decisions

During the February 2025 QA pass, we aligned Lomito's implementation with Stitch designs while making key decisions:

1. **Brand colors**: Kept Lomito's primary mint (#13ECC8) instead of Stitch's teal variants for brand consistency
2. **Light mode default**: Stitch designs featured dark mode; we use light mode by default with strategic dark hero sections
3. **Mobile-first responsive**: Adapted Stitch's desktop-heavy layouts to mobile-first patterns using our breakpoint system
4. **Component library**: Built React Native components using design tokens rather than pixel-perfect Stitch copies

## Screen Mapping

| Stitch Screen Title   | Screen ID            | App Route            | Status |
| --------------------- | -------------------- | -------------------- | ------ |
| Landing Page          | 17139143970723271941 | `/(public)/index`    | Done   |
| Sign Up / Register    | 17139143970723271942 | `/auth/register`     | Done   |
| Login                 | 17139143970723271943 | `/auth/login`        | Done   |
| Verify Email          | 17139143970723271944 | `/auth/verify`       | Done   |
| Map View (Main)       | 17139143970723271945 | `/(tabs)/index`      | Done   |
| Report New Case       | 17139143970723271946 | `/report/new`        | Done   |
| Case Detail           | 17139143970723271947 | `/case/[id]`         | Done   |
| User Profile          | 17139143970723271948 | `/(tabs)/profile`    | Done   |
| Moderation Queue      | 17139143970723271949 | `/(tabs)/moderation` | Done   |
| Government Dashboard  | 17139143970723271950 | `/(tabs)/government` | Done   |
| Public Dashboard      | 17139143970723271951 | `/(public)/impact`   | Done   |
| Donate                | 17139143970723271952 | `/donate`            | Done   |
| Settings              | 17139143970723271953 | `/(tabs)/settings`   | Done   |
| About                 | 17139143970723271954 | `/about`             | Done   |
| Terms of Service      | 17139143970723271955 | `/legal/terms`       | Done   |
| Privacy Policy        | 17139143970723271956 | `/legal/privacy`     | Done   |
| Submit Authority Info | 17139143970723271957 | `/authority/submit`  | Done   |

## Component Pattern Reference

Key components implemented based on Stitch patterns:

### Layout Components

- **AppShell** (`apps/mobile/components/app-shell.tsx`): Desktop navigation bar with logo, nav links, language toggle, user menu
- **Container** (`packages/ui/src/components/container.tsx`): Max-width responsive container with breakpoint-based padding
- **ResponsiveGrid** (`packages/ui/src/components/responsive-grid.tsx`): 1/2/3/4 column grid based on breakpoint

### Navigation

- **WebNavbar** (`apps/mobile/components/web-navbar.tsx`): Desktop sticky top nav (64px height)
- **TabBar** (native): Bottom tab navigation on mobile, left sidebar on tablet+

### Data Display

- **KPI Cards** (`apps/mobile/components/government/kpi-card.tsx`): Icon + value + label + trend
- **Bar Chart** (`apps/mobile/components/dashboard/jurisdiction-bar-chart.tsx`): Y-axis + bars + labels
- **Line Chart** (`apps/mobile/components/dashboard/trend-line-chart.tsx`): Grid + line + points
- **Ranking Table** (`apps/mobile/components/dashboard/efficiency-ranking-table.tsx`): Rank + name + metric + bar

### Feature Components

- **Queue Sidebar** (`apps/mobile/components/moderation/queue-sidebar.tsx`): 320px left panel with search + scrollable list
- **Review Detail Panel** (`apps/mobile/components/moderation/review-detail-panel.tsx`): Right panel for moderation actions
- **Case Detail Panel** (`apps/mobile/components/government/case-detail-panel.tsx`): Right panel for government case view
- **Trust Badges** (`apps/mobile/components/donate/trust-badges.tsx`): SSL + PCI compliance cards
- **Gamification Badge** (`apps/mobile/components/profile/gamification-badge.tsx`): "Civic Guardian Lvl X" pill
- **Transparency Section** (`apps/mobile/components/landing/transparency-section.tsx`): 3-card feature grid for landing

### Split-Pane Layouts

Desktop-specific pattern (hidden on mobile, vertical stack on tablet):

- **Moderation**: Queue sidebar (left 320px) + Review detail (right fill)
- **Government**: Case table or map (left) + Case detail panel (right 400px)
- **Map + Detail**: Map (main) + Case summary card (overlay bottom on mobile, right 400px on desktop)

## Design Token Usage

All components use tokens from `packages/ui/src/theme/tokens.ts`:

- **Colors**: `colors.primary`, `colors.secondary`, `colors.neutral*`, `colors.category.*`
- **Typography**: `typography.h1/h2/h3/body/small/caption/button`
- **Spacing**: `spacing.xs/sm/md/lg/xl/xxl` (4px base grid)
- **Border Radius**: `borderRadius.card/button/input/pill/tag`
- **Breakpoints**: `breakpoints.mobile/tablet/desktop/wide`
- **Layout**: `layout.maxContentWidth/navbarHeight/mapPanelWidth`
- **Motion**: `motion.duration.*/easing.*/spring.*`

## Accessibility

All screens implement:

- Screen readers: `accessibilityLabel` on all interactive elements
- Keyboard navigation: Tab order, Enter/Space for actions
- Touch targets: Minimum 44x44px (iOS HIG)
- Color contrast: WCAG AA minimum (4.5:1 for body text, 3:1 for large text)
- Reduced motion: Respect `prefers-reduced-motion` system preference

## i18n

All user-facing strings use `t('namespace.key')` with translations in:

- `packages/shared/src/i18n/es.json` (Spanish - primary)
- `packages/shared/src/i18n/en.json` (English - secondary)

Language toggle in settings and web navbar.

## Next Steps

When adding new screens:

1. Reference this mapping to maintain consistency with Stitch design language
2. Use existing component patterns before creating new ones
3. Always use design tokens (never hardcode colors/spacing/typography)
4. Test on mobile, tablet, and desktop breakpoints
5. Ensure accessibility labels and keyboard navigation
6. Add translations to both `es.json` and `en.json`
