/**
 * AppModal Component
 * Cross-platform modal replacing Alert.alert() on web.
 * Uses RN Modal with overlay, centered card, and animated entry.
 */

import { useEffect } from 'react';
import { Modal, View, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';
import { H2, Body } from './typography';
import { Button } from './button';
import {
  colors,
  spacing,
  borderRadius,
  shadowStyles,
  motion,
} from '../theme/tokens';

interface ModalAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'destructive';
}

interface AppModalProps {
  visible: boolean;
  title: string;
  message?: string;
  actions: ModalAction[];
  onClose: () => void;
}

export function AppModal({
  visible,
  title,
  message,
  actions,
  onClose,
}: AppModalProps) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(reduceMotion ? 1 : 0.95);
  const opacity = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (visible) {
      scale.value = withTiming(1, { duration: motion.duration.normal });
      opacity.value = withTiming(1, { duration: motion.duration.normal });
    } else {
      scale.value = reduceMotion ? 1 : 0.95;
      opacity.value = reduceMotion ? 1 : 0;
    }
  }, [visible, scale, opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
        accessibilityLabel="Close modal"
        accessibilityRole="button"
      >
        <Animated.View style={[styles.card, animatedStyle]}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <H2 style={styles.title}>{title}</H2>
            {message && (
              <Body style={styles.message} color={colors.neutral700}>
                {message}
              </Body>
            )}
            <View style={styles.actions}>
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant ?? (index === actions.length - 1 ? 'primary' : 'ghost')}
                  onPress={action.onPress}
                  accessibilityLabel={action.label}
                  style={index > 0 ? styles.actionSpacing : undefined}
                >
                  {action.label}
                </Button>
              ))}
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(31, 35, 40, 0.5)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    maxWidth: 400,
    padding: spacing.lg,
    width: '100%',
    ...shadowStyles.elevated,
  },
  title: {
    marginBottom: spacing.sm,
  },
  message: {
    marginBottom: spacing.lg,
  },
  actions: {
    alignItems: 'stretch',
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  actionSpacing: {
    marginLeft: Platform.OS === 'web' ? spacing.sm : 0,
  },
});
