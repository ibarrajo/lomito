/**
 * Photo Picker Component
 * Grid-based photo picker for the report form with camera and gallery selection.
 */

import React, { useRef } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Image as ImageIcon, X } from 'lucide-react-native';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { BodySmall, Skeleton } from '@lomito/ui';
import { colors, spacing, borderRadius } from '@lomito/ui/src/theme/tokens';
import { useImagePicker } from '../../hooks/use-image-picker';
import { PhotoActionSheet } from './photo-action-sheet';

const MAX_PHOTOS = 5;

interface PhotoPickerProps {
  onImagesChange?: (images: string[]) => void;
}

/**
 * Photo picker component for selecting and managing photos in the report form.
 * - Supports camera and gallery selection
 * - Grid layout (2 columns)
 * - Max 5 photos
 * - Shows compression loading state
 * - Remove functionality for each photo
 */
export function PhotoPicker({ onImagesChange }: PhotoPickerProps) {
  const { t } = useTranslation();
  const { images, pickFromCamera, pickFromGallery, removeImage, loading } =
    useImagePicker();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Notify parent of image changes
  const onImagesChangeRef = useRef(onImagesChange);
  onImagesChangeRef.current = onImagesChange;

  React.useEffect(() => {
    onImagesChangeRef.current?.(images.map((img) => img.uri));
  }, [images]);

  const handleAddPhoto = () => {
    // On web, go directly to gallery (no bottom sheet support)
    if (Platform.OS === 'web') {
      pickFromGallery();
      return;
    }

    // On native, show bottom sheet
    bottomSheetRef.current?.present();
  };

  const canAddMore = images.length < MAX_PHOTOS;

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        {/* Photo Grid */}
        <View style={styles.grid}>
          {/* Existing Photos */}
          {images.map((image, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image
                source={{ uri: image.uri }}
                style={styles.photo}
                contentFit="cover"
                accessibilityLabel={t('report.photos')}
              />
              {/* Remove Button */}
              <Pressable
                style={styles.removeButton}
                onPress={() => removeImage(index)}
                accessibilityLabel={t('report.removePhoto')}
                accessibilityRole="button"
              >
                <X size={16} color={colors.white} strokeWidth={2.5} />
              </Pressable>
            </View>
          ))}

          {/* Add Photo Card */}
          {canAddMore && (
            <Pressable
              style={styles.addPhotoCard}
              onPress={handleAddPhoto}
              disabled={loading}
              accessibilityLabel={t('report.addPhotos')}
              accessibilityRole="button"
            >
              {loading ? (
                <Skeleton width={80} height={24} borderRadius={spacing.xs} />
              ) : (
                <>
                  <View style={styles.addPhotoIconContainer}>
                    <ImageIcon
                      size={24}
                      color={colors.neutral500}
                      strokeWidth={1.5}
                    />
                  </View>
                  <BodySmall
                    color={colors.neutral700}
                    style={styles.addPhotoText}
                  >
                    {t('report.addPhoto')}
                  </BodySmall>
                </>
              )}
            </Pressable>
          )}
        </View>

        {/* Photo Count Indicator */}
        <View style={styles.footer}>
          <BodySmall color={colors.neutral500}>
            {t('report.photoSpecs')}
          </BodySmall>
          {loading && (
            <BodySmall color={colors.neutral500}>
              {t('report.compressing')}
            </BodySmall>
          )}
        </View>
        <View style={styles.photoCount}>
          <BodySmall color={colors.neutral500}>
            {images.length} / {MAX_PHOTOS} {t('report.photos').toLowerCase()}
          </BodySmall>
        </View>

        {/* Photo Action Sheet (native only) */}
        <PhotoActionSheet
          ref={bottomSheetRef}
          onCameraPress={pickFromCamera}
          onGalleryPress={pickFromGallery}
        />
      </View>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  addPhotoCard: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: colors.neutral100,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.button,
    borderStyle: 'dashed',
    borderWidth: 2,
    justifyContent: 'center',
    width: '48%',
  },
  addPhotoIconContainer: {
    marginBottom: spacing.xs,
  },
  addPhotoText: {
    textAlign: 'center',
  },
  container: {
    width: '100%',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photo: {
    borderRadius: borderRadius.button,
    height: '100%',
    width: '100%',
  },
  photoContainer: {
    aspectRatio: 1,
    position: 'relative',
    width: '48%',
  },
  photoCount: {
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  removeButton: {
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: borderRadius.card,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.xs,
    top: spacing.xs,
    width: 24,
  },
});
