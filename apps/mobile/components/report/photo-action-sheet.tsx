/**
 * Photo Action Sheet Component
 * Bottom sheet for selecting between camera and gallery options.
 */

import React, { forwardRef, useCallback } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { Body } from '@lomito/ui';
import { colors, spacing, borderRadius } from '@lomito/ui/src/theme/tokens';

interface PhotoActionSheetProps {
  onCameraPress: () => void;
  onGalleryPress: () => void;
}

/**
 * Bottom sheet modal for choosing between camera and gallery.
 * - Only renders on native platforms (iOS/Android)
 * - Web fallback should be handled by parent
 */
export const PhotoActionSheet = forwardRef<
  BottomSheetModal,
  PhotoActionSheetProps
>(({ onCameraPress, onGalleryPress }, ref) => {
  const { t } = useTranslation();

  const handleCameraPress = useCallback(() => {
    if (ref && typeof ref === 'object' && ref.current) {
      ref.current.dismiss();
    }
    onCameraPress();
  }, [onCameraPress, ref]);

  const handleGalleryPress = useCallback(() => {
    if (ref && typeof ref === 'object' && ref.current) {
      ref.current.dismiss();
    }
    onGalleryPress();
  }, [onGalleryPress, ref]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.5}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    [],
  );

  // Don't render on web
  if (Platform.OS === 'web') {
    return null;
  }

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={[240]}
      index={0}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.bottomSheet}
    >
      <View style={styles.content}>
        {/* Take Photo Option */}
        <Pressable
          style={styles.option}
          onPress={handleCameraPress}
          accessibilityLabel={t('report.takePhoto')}
          accessibilityRole="button"
        >
          <View style={styles.iconContainer}>
            <Camera size={24} color={colors.secondary} strokeWidth={1.5} />
          </View>
          <Body color={colors.neutral700}>{t('report.takePhoto')}</Body>
        </Pressable>

        {/* Choose from Gallery Option */}
        <Pressable
          style={styles.option}
          onPress={handleGalleryPress}
          accessibilityLabel={t('report.chooseFromGallery')}
          accessibilityRole="button"
        >
          <View style={styles.iconContainer}>
            <ImageIcon size={24} color={colors.secondary} strokeWidth={1.5} />
          </View>
          <Body color={colors.neutral700}>{t('report.chooseFromGallery')}</Body>
        </Pressable>

        {/* Cancel Button */}
        <Pressable
          style={styles.cancelButton}
          onPress={() => {
            if (ref && typeof ref === 'object' && ref.current) {
              ref.current.dismiss();
            }
          }}
          accessibilityLabel={t('report.cancelAction')}
          accessibilityRole="button"
        >
          <Body color={colors.neutral500}>{t('report.cancelAction')}</Body>
        </Pressable>
      </View>
    </BottomSheetModal>
  );
});

PhotoActionSheet.displayName = 'PhotoActionSheet';

const styles = StyleSheet.create({
  bottomSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.card,
    borderTopRightRadius: borderRadius.card,
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.button,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
  },
  content: {
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  indicator: {
    backgroundColor: colors.neutral200,
  },
  option: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.button,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
