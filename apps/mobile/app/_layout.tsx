import '../../../packages/shared/src/i18n/config';
import { useEffect } from 'react';
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
import { trackPageView } from '../lib/analytics';
import { AppShell } from '../components/navigation/app-shell';

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const { loading: profileLoading } = useUserProfile();
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize notifications only when user is authenticated
  useNotifications();

  // Measure cold start on first render
  useEffect(() => {
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
    const shouldTreatAsPublic = inPublicRoute || isRootPath;

    if (!session && !shouldTreatAsPublic) {
      // Redirect unauthenticated users to login (prevent loop)
      if (pathname !== '/auth/login') {
        router.replace('/auth/login');
      }
    } else if (session && inAuthGroup) {
      // Redirect to main app if authenticated (prevent loop)
      if (pathname !== '/' && !pathname.startsWith('/(tabs)')) {
        router.replace('/(tabs)');
      }
    } else if (
      session &&
      currentSegment === '(public)' &&
      Platform.OS === 'web'
    ) {
      // Redirect authenticated users away from public landing on web (prevent loop)
      if (!pathname.startsWith('/(tabs)')) {
        router.replace('/(tabs)');
      }
    }
  }, [session, isReady, segments, router, pathname]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <Skeleton width="100%" height={60} style={styles.skeletonTop} />
        <Skeleton width="90%" height={40} style={styles.skeletonItem} />
        <Skeleton width="85%" height={40} style={styles.skeletonItem} />
        <Skeleton width="92%" height={40} style={styles.skeletonItem} />
        <Skeleton width="88%" height={40} style={styles.skeletonItem} />
      </View>
    );
  }

  return (
    <AppShell>
      <StatusBar style="auto" />
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
  skeletonItem: {
    marginBottom: spacing.md,
  },
  skeletonTop: {
    marginBottom: spacing.xl,
  },
});
