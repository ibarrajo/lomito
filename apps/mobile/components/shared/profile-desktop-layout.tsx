/**
 * ProfileDesktopLayout Component
 * Wrapper that renders a left sidebar on desktop and just children on mobile.
 */

import { View, StyleSheet } from 'react-native';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { spacing, colors } from '@lomito/ui/src/theme/tokens';
import { ProfileSidebar } from '../profile/profile-sidebar';

interface ProfileDesktopLayoutProps {
  children: React.ReactNode;
}

export function ProfileDesktopLayout({ children }: ProfileDesktopLayoutProps) {
  const { isDesktop } = useBreakpoint();

  if (!isDesktop) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <ProfileSidebar />
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral100,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  content: {
    flex: 9,
  },
  sidebar: {
    alignSelf: 'flex-start',
    flex: 3,
  },
});
