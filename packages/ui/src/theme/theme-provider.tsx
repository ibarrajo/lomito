/**
 * Theme Provider
 * Provides design tokens via React context to all descendant components.
 */

import { createContext, useContext, type ReactNode } from 'react';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  shadowStyles,
  iconSizes,
  iconStrokeWidth,
} from './tokens';

const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  shadowStyles,
  iconSizes,
  iconStrokeWidth,
} as const;

type Theme = typeof theme;

const ThemeContext = createContext<Theme>(theme);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

export type { Theme };
