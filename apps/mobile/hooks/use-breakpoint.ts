import { useWindowDimensions } from 'react-native';
import { breakpoints } from '@lomito/ui/src/theme/tokens';

type Breakpoint = keyof typeof breakpoints;

interface BreakpointResult {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
}

export function useBreakpoint(): BreakpointResult {
  const { width } = useWindowDimensions();

  const breakpoint: Breakpoint =
    width >= breakpoints.wide
      ? 'wide'
      : width >= breakpoints.desktop
        ? 'desktop'
        : width >= breakpoints.tablet
          ? 'tablet'
          : 'mobile';

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop' || breakpoint === 'wide',
    width,
  };
}
