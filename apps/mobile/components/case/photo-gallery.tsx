/**
 * PhotoGallery Component
 * Horizontal scrollable gallery of case photos.
 */

import { useState } from 'react';
import { View, FlatList, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Body } from '@lomito/ui/components/typography';
import { Card } from '@lomito/ui/components/card';
import { colors, spacing, borderRadius } from '@lomito/ui/theme/tokens';
import type { CaseMedia } from '@lomito/shared/types/database';
import { PhotoViewerModal } from './photo-viewer-modal';

interface PhotoGalleryProps {
  media: CaseMedia[];
}

export function PhotoGallery({ media }: PhotoGalleryProps) {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (media.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Body color={colors.neutral500}>{t('case.noPhotos')}</Body>
      </View>
    );
  }

  const handlePhotoPress = (index: number) => {
    setSelectedIndex(index);
  };

  return (
    <>
      <FlatList
        data={media}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => handlePhotoPress(index)}
            accessibilityLabel={t('case.photoOf', {
              current: index + 1,
              total: media.length,
            })}
            accessibilityRole="imagebutton"
          >
            <Card style={styles.photoCard}>
              <Image
                source={{ uri: item.thumbnail_url || item.url }}
                style={styles.photo}
                contentFit="cover"
                placeholder={
                  item.thumbnail_url
                    ? undefined
                    : { blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }
                }
                transition={200}
              />
            </Card>
          </Pressable>
        )}
      />

      {selectedIndex !== null && (
        <PhotoViewerModal
          visible={selectedIndex !== null}
          media={media}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.md,
  },
  photo: {
    aspectRatio: 4 / 3,
    borderRadius: borderRadius.card,
    width: 200,
  },
  photoCard: {
    marginRight: spacing.md,
    padding: 0,
  },
});
