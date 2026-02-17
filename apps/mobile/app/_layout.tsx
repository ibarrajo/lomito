import '../../../packages/shared/src/i18n/config';
import { useEffect, useRef } from 'react';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform } from 'react-native';
import { ThemeProvider, Skeleton } from '@lomito/ui';
import { colors, spacing } from '@lomito/ui/src/theme/tokens';
import {
  useFonts,
  PublicSans_400Regular,
  PublicSans_500Medium,
  PublicSans_600SemiBold,
  PublicSans_700Bold,
} from '@expo-google-fonts/public-sans';
import { useAuth } from '../hooks/use-auth';
import { useUserProfile } from '../hooks/use-user-profile';
import { useNotifications } from '../hooks/use-notifications';
import { PerformanceMonitor } from '../lib/performance';
import { initAnalytics, trackPageView } from '../lib/analytics';
import { AppShell } from '../components/navigation/app-shell';

function RootLayoutNav() {
  const { session, loading } = useAuth();
  // Only fetch profile when authenticated — avoids blocking public routes
  const { loading: profileLoading } = useUserProfile(!!session);
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();
  // Stores the route the user originally wanted to visit before being
  // redirected to login. Cleared once the post-auth redirect is performed.
  const pendingRedirect = useRef<string | null>(null);

  // Initialize notifications only when user is authenticated
  useNotifications();

  // Initialize analytics and measure cold start on first render
  useEffect(() => {
    initAnalytics().catch((err: unknown) => {
      if (__DEV__) {
        console.warn('[Analytics] Init failed:', err);
      }
    });

    const coldStartTime = PerformanceMonitor.measureColdStart();
    if (coldStartTime > 0) {
      console.log(`App cold start completed in ${coldStartTime}ms`);
    }
  }, []);

  // Auto page-view tracking on web
  useEffect(() => {
    if (Platform.OS === 'web' && pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  // Wait for both auth and profile to be ready before redirecting
  const isReady = !loading && (!session || !profileLoading);

  useEffect(() => {
    if (!isReady) return;

    // Wait for segments to be resolved
    const currentSegment = segments[0] as string | undefined;
    if (!currentSegment) return;

    const inAuthGroup = currentSegment === 'auth';

    // Routes accessible without authentication
    const publicRoutes = [
      '(public)',
      'auth',
      'about',
      'donate',
      'legal',
      'impact',
      'authority',
      'case',
    ];
    const inPublicRoute = publicRoutes.includes(currentSegment);

    // Special case: treat root '/' as public route (resolves to (public)/index)
    const isRootPath = pathname === '/' || pathname === '/(public)';

    // Pathname-based public path check: guards against transient segment
    // mismatches on web during hydration (e.g. segments briefly resolving to
    // a different route before settling on the correct deep-link target).
    // Case detail pages are always publicly accessible — anyone can view a case.
    const isPublicPathname =
      pathname.startsWith('/case/') ||
      pathname.startsWith('/about') ||
      pathname.startsWith('/donate') ||
      pathname.startsWith('/legal/') ||
      pathname.startsWith('/impact') ||
      pathname.startsWith('/authority/');

    const shouldTreatAsPublic = inPublicRoute || isRootPath || isPublicPathname;

    if (!session && !shouldTreatAsPublic) {
      // Redirect unauthenticated users to login (prevent loop).
      // Save their intended destination so we can restore it after auth.
      if (pathname !== '/auth/login') {
        pendingRedirect.current = pathname;
        router.replace('/auth/login');
      }
    } else if (session && inAuthGroup) {
      // Redirect to main app if authenticated (prevent loop).
      // Honour the saved redirect from before the login screen was shown.
      if (pathname !== '/' && !pathname.startsWith('/(tabs)')) {
        const destination = pendingRedirect.current ?? '/(tabs)/dashboard';
        pendingRedirect.current = null;
        router.replace(destination as Parameters<typeof router.replace>[0]);
      }
    }
  }, [session, isReady, segments, router, pathname]);

  // Always render the Stack so Expo Router preserves the initial URL on web.
  // Conditionally rendering (returning skeleton instead of Stack) causes Expo
  // Router to lose the deep-link URL when the Stack mounts for the first time.
  return (
    <AppShell>
      <StatusBar style="auto" />
      {!isReady && (
        <View style={[styles.loadingContainer, styles.loadingOverlay]}>
          <Skeleton width="100%" height={60} style={styles.skeletonTop} />
          <Skeleton width="90%" height={40} style={styles.skeletonItem} />
          <Skeleton width="85%" height={40} style={styles.skeletonItem} />
          <Skeleton width="92%" height={40} style={styles.skeletonItem} />
          <Skeleton width="88%" height={40} style={styles.skeletonItem} />
        </View>
      )}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(public)" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="auth/verify" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="case/[id]"
          options={{
            headerShown: Platform.OS !== 'web',
            title: '',
          }}
        />
        <Stack.Screen name="report" />
        <Stack.Screen name="about" />
        <Stack.Screen name="donate" />
        <Stack.Screen name="impact" />
        <Stack.Screen name="legal" />
      </Stack>
    </AppShell>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Public Sans': PublicSans_400Regular,
    'PublicSans-Regular': PublicSans_400Regular,
    'PublicSans-Medium': PublicSans_500Medium,
    'PublicSans-SemiBold': PublicSans_600SemiBold,
    'PublicSans-Bold': PublicSans_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Skeleton width="100%" height={60} style={styles.skeletonTop} />
        <Skeleton width="90%" height={40} style={styles.skeletonItem} />
        <Skeleton width="85%" height={40} style={styles.skeletonItem} />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  loadingOverlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 100,
  },
  skeletonItem: {
    marginBottom: spacing.md,
  },
  skeletonTop: {
    marginBottom: spacing.xl,
  },
});
