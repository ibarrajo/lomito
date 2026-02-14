/**
 * Design System Tokens
 * Single source of truth for colors, typography, spacing, and other design primitives.
 * Read from /docs/style/DESIGN_TOKENS.md
 */

export const colors = {
  // Primary
  primary: '#D4662B',
  primaryDark: '#A34D1E',
  primaryLight: '#FFF8F3',

  // Secondary
  secondary: '#1A6B54',
  secondaryLight: '#E8F3EF',

  // Accent
  accent: '#E8A838',

  // Neutrals
  neutral900: '#1F2328',
  neutral700: '#4A5568',
  neutral500: '#718096',
  neutral400: '#A0AEC0',
  neutral200: '#E2E8F0',
  neutral100: '#F7F8FA',
  white: '#FFFFFF',

  // Category colors (for case pins and backgrounds)
  category: {
    abuse: {
      pin: '#C53030',
      background: '#FFF5F5',
    },
    stray: {
      pin: '#DD6B20',
      background: '#FFFAF0',
    },
    missing: {
      pin: '#2B6CB0',
      background: '#EBF8FF',
    },
    resolved: {
      pin: '#276749',
      background: '#F0FFF4',
    },
    unresolved: {
      pin: '#718096',
      background: '#F7F8FA',
    },
  },

  // Status/semantic colors
  error: '#C53030',
  errorDark: '#9B2C2C',
  errorBackground: '#FFF5F5',
  warning: '#DD6B20',
  warningBackground: '#FFFAF0',
  success: '#276749',
  successBackground: '#F0FFF4',
  info: '#2B6CB0',
  infoBackground: '#EBF8FF',
} as const;

export const typography = {
  // Font families
  fontFamily: {
    display: 'DM Sans',
    body: 'Source Sans 3',
    mono: 'JetBrains Mono',
  },

  // Type scale
  display: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 1.2,
    fontFamily: 'DM Sans',
  },
  h1: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 1.25,
    fontFamily: 'DM Sans',
  },
  h2: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 1.3,
    fontFamily: 'Source Sans 3',
  },
  h3: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 1.35,
    fontFamily: 'Source Sans 3',
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 1.5,
    fontFamily: 'Source Sans 3',
  },
  small: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 1.45,
    fontFamily: 'Source Sans 3',
  },
  caption: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 1.4,
    fontFamily: 'Source Sans 3',
  },
  button: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 1.0,
    fontFamily: 'Source Sans 3',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  card: 12,
  button: 8,
  input: 8,
  pill: 9999,
  avatar: 9999,
} as const;

/**
 * Shadow styles for web (CSS box-shadow strings).
 * For React Native, use shadowStyles instead.
 */
export const shadows = {
  card: '0 1px 3px rgba(164, 77, 30, 0.08), 0 1px 2px rgba(164, 77, 30, 0.06)',
  elevated: '0 4px 12px rgba(164, 77, 30, 0.12), 0 2px 4px rgba(164, 77, 30, 0.08)',
  bottomSheet: '0 -4px 24px rgba(31, 35, 40, 0.15)',
} as const;

/**
 * Shadow styles for React Native.
 * Uses shadowColor, shadowOffset, shadowOpacity, shadowRadius for iOS.
 * Uses elevation for Android.
 */
export const shadowStyles = {
  card: {
    shadowColor: '#A34D1E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#A34D1E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomSheet: {
    shadowColor: '#1F2328',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
  },
} as const;

export const iconSizes = {
  inline: 20,
  default: 24,
  large: 32,
} as const;

export const iconStrokeWidth = 1.5;

export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

export const layout = {
  maxContentWidth: 1280,
  navbarHeight: 64,
  sidebarWidth: 280,
  mapPanelWidth: 400,
  containerPadding: { mobile: 16, tablet: 24, desktop: 32 },
} as const;

export const motion = {
  duration: { instant: 100, fast: 200, normal: 300, slow: 500 },
  easing: {
    default: [0.4, 0, 0.2, 1] as readonly number[],
    decelerate: [0, 0, 0.2, 1] as readonly number[],
    accelerate: [0.4, 0, 1, 1] as readonly number[],
  },
  spring: { damping: 15, stiffness: 150, mass: 1 },
} as const;
