/**
 * PhotoViewerModal Component
 * Full-screen photo viewer with swipe navigation.
 */

import { useState, useRef } from 'react';
import {
  View,
  Modal,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Body } from '@lomito/ui/components/typography';
import { colors, spacing, iconSizes } from '@lomito/ui/theme/tokens';
import type { CaseMedia } from '@lomito/shared/types/database';

interface PhotoViewerModalProps {
  visible: boolean;
  media: CaseMedia[];
  initialIndex: number;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function PhotoViewerModal({
  visible,
  media,
  initialIndex,
  onClose,
}: PhotoViewerModalProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const renderPhoto = ({ item }: { item: CaseMedia }) => (
    <View style={styles.photoContainer}>
      <Image
        source={{ uri: item.url }}
        style={styles.photo}
        contentFit="contain"
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        transition={200}
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.container}>
        {/* Backdrop - tap to close */}
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityLabel={t('case.closeViewer')}
          accessibilityRole="button"
        />

        {/* Photo carousel */}
        <FlatList
          ref={flatListRef}
          data={media}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={renderPhoto}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
        />

        {/* Close button */}
        <View style={styles.closeButton}>
          <Pressable
            onPress={onClose}
            style={styles.closeButtonPressable}
            accessibilityLabel={t('case.closeViewer')}
            accessibilityRole="button"
          >
            <X color={colors.white} size={iconSizes.default} />
          </Pressable>
        </View>

        {/* Photo counter */}
        <View style={styles.counter}>
          <Body color={colors.white} style={styles.counterText}>
            {t('case.photoOf', {
              current: currentIndex + 1,
              total: media.length,
            })}
          </Body>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  closeButton: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
  },
  closeButtonPressable: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  container: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  counter: {
    alignItems: 'center',
    bottom: spacing.lg,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  counterText: Platform.select({
    web: {
      textShadow: '0 1px 3px rgba(0, 0, 0, 0.75)',
    },
    default: {
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { height: 1, width: 0 },
      textShadowRadius: 3,
    },
  }) as object,
  photo: {
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
  },
  photoContainer: {
    alignItems: 'center',
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    width: SCREEN_WIDTH,
  },
});
