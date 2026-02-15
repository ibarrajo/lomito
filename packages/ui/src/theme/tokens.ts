/**
 * Design System Tokens
 * Single source of truth for colors, typography, spacing, and other design primitives.
 * Read from /docs/style/DESIGN_TOKENS.md
 */

export const colors = {
  // Primary
  primary: '#13ECC8',
  primaryDark: '#0FBDA0',
  primaryLight: '#E6FDF9',

  // Secondary
  secondary: '#1E293B',
  secondaryLight: '#F1F5F9',

  // Accent
  accent: '#F2994A',

  // Neutrals
  neutral900: '#1E293B',
  neutral700: '#334155',
  neutral500: '#64748B',
  neutral400: '#94A3B8',
  neutral200: '#E2E8F0',
  neutral100: '#F6F8F8',
  white: '#FFFFFF',

  // Category colors (for case pins and backgrounds)
  category: {
    abuse: {
      pin: '#C53030',
      background: '#FFF5F5',
    },
    injured: {
      pin: '#DC2626',
      background: '#FEF2F2',
    },
    missing: {
      pin: '#2B6CB0',
      background: '#EBF8FF',
    },
    stray: {
      pin: '#DD6B20',
      background: '#FFFAF0',
    },
    zoonotic: {
      pin: '#7C3AED',
      background: '#F5F3FF',
    },
    dead_animal: {
      pin: '#6B7280',
      background: '#F9FAFB',
    },
    dangerous_dog: {
      pin: '#DC2626',
      background: '#FEF2F2',
    },
    distress: {
      pin: '#F59E0B',
      background: '#FFFBEB',
    },
    illegal_sales: {
      pin: '#B91C1C',
      background: '#FEF2F2',
    },
    wildlife: {
      pin: '#059669',
      background: '#ECFDF5',
    },
    noise_nuisance: {
      pin: '#6366F1',
      background: '#EEF2FF',
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
  error: '#DC2626',
  errorDark: '#B91C1C',
  errorBackground: '#FEF2F2',
  warning: '#F59E0B',
  warningBackground: '#FFFBEB',
  success: '#059669',
  successBackground: '#ECFDF5',
  info: '#2563EB',
  infoBackground: '#EFF6FF',
} as const;

export const typography = {
  // Font families
  fontFamily: {
    display: 'Public Sans',
    body: 'Public Sans',
    mono: 'JetBrains Mono',
  },

  // Type scale
  display: {
    fontSize: 36,
    fontWeight: '700' as const,
    lineHeight: 1.2,
    fontFamily: 'Public Sans',
  },
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 1.25,
    fontFamily: 'Public Sans',
  },
  h2: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 1.3,
    fontFamily: 'Public Sans',
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 1.35,
    fontFamily: 'Public Sans',
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 1.5,
    fontFamily: 'Public Sans',
  },
  small: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 1.45,
    fontFamily: 'Public Sans',
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 1.4,
    fontFamily: 'Public Sans',
  },
  button: {
    fontSize: 14,
    fontWeight: '700' as const,
    lineHeight: 1.0,
    fontFamily: 'Public Sans',
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
  tag: 6,
} as const;

/**
 * Shadow styles for web (CSS box-shadow strings).
 * For React Native, use shadowStyles instead.
 */
export const shadows = {
  card: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
  elevated: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
  bottomSheet: '0 -4px 24px rgba(31, 35, 40, 0.15)',
} as const;

/**
 * Shadow styles for React Native.
 * Uses shadowColor, shadowOffset, shadowOpacity, shadowRadius for iOS.
 * Uses elevation for Android.
 */
export const shadowStyles = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomSheet: {
    shadowColor: '#1E293B',
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
