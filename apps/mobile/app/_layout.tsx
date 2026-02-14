import '../../../packages/shared/src/i18n/config';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { ThemeProvider, Skeleton } from '@lomito/ui';
import { colors } from '@lomito/ui/src/theme/tokens';
import { useAuth } from '../hooks/use-auth';
import { useNotifications } from '../hooks/use-notifications';
import { PerformanceMonitor } from '../lib/performance';

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Initialize notifications only when user is authenticated
  useNotifications();

  // Measure cold start on first render
  useEffect(() => {
    const coldStartTime = PerformanceMonitor.measureColdStart();
    if (coldStartTime > 0) {
      console.log(`App cold start completed in ${coldStartTime}ms`);
    }
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!session && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/auth/login');
    } else if (session && inAuthGroup) {
      // Redirect to main app if authenticated
      router.replace('/(tabs)');
    }
  }, [session, loading, segments, router]);

  if (loading) {
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
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="auth/verify" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="case/[id]" options={{ headerShown: true, title: 'Case Details' }} />
        <Stack.Screen name="report" />
        <Stack.Screen name="about" />
        <Stack.Screen name="donate" />
        <Stack.Screen name="legal" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
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
    paddingHorizontal: 16,
  },
  skeletonTop: {
    marginBottom: 32,
  },
  skeletonItem: {
    marginBottom: 16,
  },
});
