# Lomito Design Tokens

## Colors

### Primary
| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| color-primary | #D4662B | 212, 102, 43 | Primary buttons, active states, brand accent, CTAs |
| color-primary-dark | #A34D1E | 163, 77, 30 | Primary text on light backgrounds, pressed states, headers |
| color-primary-light | #FFF8F3 | 255, 248, 243 | Primary tinted backgrounds, highlight areas |

### Secondary
| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| color-secondary | #1A6B54 | 26, 107, 84 | Success states, resolved cases, trust signals |
| color-secondary-light | #E8F3EF | 232, 243, 239 | Resolved case backgrounds, positive highlights |

### Accent
| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| color-accent | #E8A838 | 232, 168, 56 | Warnings, attention markers, stray category pins |

### Neutrals
| Token | Hex | Usage |
|-------|-----|-------|
| color-neutral-900 | #1F2328 | Body text, headings |
| color-neutral-700 | #4A5568 | Secondary text, captions |
| color-neutral-500 | #718096 | Placeholders, disabled states |
| color-neutral-400 | #A0AEC0 | Borders, dividers |
| color-neutral-200 | #E2E8F0 | Input borders, card strokes |
| color-neutral-100 | #F7F8FA | Page backgrounds, card fills |
| color-white | #FFFFFF | Card surfaces, input backgrounds |

### Semantic (Case Categories)
| Category | Pin Color | Hex | Background |
|----------|-----------|-----|-----------|
| Abuse | Red | #C53030 | #FFF5F5 |
| Stray | Amber | #DD6B20 | #FFFAF0 |
| Missing | Blue | #2B6CB0 | #EBF8FF |
| Resolved | Green | #276749 | #F0FFF4 |
| Unresolved | Gray | #718096 | #F7F8FA |

### Status Colors
| Token | Hex | Background | Usage |
|-------|-----|-----------|-------|
| color-error | #C53030 | #FFF5F5 | Error states, abuse reports |
| color-warning | #DD6B20 | #FFFAF0 | Warning states, pending items |
| color-success | #276749 | #F0FFF4 | Success states, resolved |
| color-info | #2B6CB0 | #EBF8FF | Information, help text |

## Typography

### Font Families
| Role | Font | Weight | Source |
|------|------|--------|--------|
| Display / H1-H2 | DM Sans | Bold (700) | Google Fonts |
| Body / H3+ | Source Sans 3 | Regular (400), Semibold (600) | Google Fonts |
| Monospace | JetBrains Mono | Regular (400) | Google Fonts |

### Type Scale (Mobile)
| Element | Size | Weight | Line Height | Token |
|---------|------|--------|-------------|-------|
| Display | 32px | Bold 700 | 1.2 | text-display |
| Heading 1 | 24px | Bold 700 | 1.25 | text-h1 |
| Heading 2 | 20px | Semibold 600 | 1.3 | text-h2 |
| Heading 3 | 17px | Semibold 600 | 1.35 | text-h3 |
| Body | 15px | Regular 400 | 1.5 | text-body |
| Body Small | 13px | Regular 400 | 1.45 | text-small |
| Caption | 11px | Regular 400 | 1.4 | text-caption |
| Button | 15px | Semibold 600 | 1.0 | text-button |

## Spacing

All spacing uses an 8px base grid.

| Token | Value | Usage |
|-------|-------|-------|
| space-xs | 4px | Tight internal padding, icon-to-label gap |
| space-sm | 8px | Default inner padding, list item spacing |
| space-md | 16px | Card padding, section gaps within cards |
| space-lg | 24px | Section spacing, content area padding |
| space-xl | 32px | Major section breaks, screen edge padding |
| space-2xl | 48px | Hero sections, page-level spacing |

## Border Radius

| Element | Value |
|---------|-------|
| Cards, modals, bottom sheets | 12px |
| Buttons | 8px |
| Input fields | 8px |
| Badges and pills | 9999px |
| Avatar / profile images | 50% (circle) |
| Map pins | Custom SVG (teardrop) |

## Shadows (Warm-Toned)

| Level | Value |
|-------|-------|
| Card | 0 1px 3px rgba(164, 77, 30, 0.08), 0 1px 2px rgba(164, 77, 30, 0.06) |
| Elevated | 0 4px 12px rgba(164, 77, 30, 0.12), 0 2px 4px rgba(164, 77, 30, 0.08) |
| Bottom sheet | 0 -4px 24px rgba(31, 35, 40, 0.15) |

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
