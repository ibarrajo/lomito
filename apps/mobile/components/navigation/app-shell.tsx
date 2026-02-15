/**
 * AppShell Component
 * Layout wrapper that orchestrates navigation based on platform and breakpoint.
 *
 * Behavior:
 * - Native platforms (iOS/Android): Pass children through unchanged (mobile tabs handle nav)
 * - Mobile web: Pass children through unchanged (mobile tabs handle nav)
 * - Tablet/Desktop web (authenticated): Render WebNavbar at top + children content area below
 * - Public/auth routes: Pass children through (public layout has its own header)
 * - Desktop web footer: Render PageFooter after content on non-fullscreen routes
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSegments, usePathname } from 'expo-router';
import { WebNavbar } from './web-navbar';
import { PageFooter } from '../shared/page-footer';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { useAuth } from '../../hooks/use-auth';
import { layout } from '@lomito/ui/src/theme/tokens';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const { session } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();

  // Routes that should NOT have a footer (fullscreen routes)
  const fullscreenRoutes = ['/', '/(tabs)', '/report'];
  const shouldShowFooter = !fullscreenRoutes.some((route) => pathname.startsWith(route));

  // On native platforms or mobile web, pass children through unchanged
  if (Platform.OS !== 'web' || isMobile) {
    return <>{children}</>;
  }

  // Don't show WebNavbar on public or auth routes (they have their own headers)
  const inPublicGroup = segments[0] === '(public)';
  const inAuthGroup = segments[0] === 'auth';
  if (!session || inPublicGroup || inAuthGroup) {
    return <>{children}</>;
  }

  // On tablet/desktop web for authenticated users, render navbar at top + footer (conditionally)
  if (isTablet || isDesktop) {
    return (
      <View style={styles.container}>
        <WebNavbar />
        <View style={styles.contentWrapper}>
          <View style={styles.content}>{children}</View>
          {shouldShowFooter && <PageFooter />}
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    paddingTop: layout.navbarHeight,
  },
});
