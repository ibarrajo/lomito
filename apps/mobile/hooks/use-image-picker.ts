/**
 * Hook for image picking with camera and gallery
 * Handles permissions, picking, compression, and state management.
 */

import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { compressImage, type CompressedImage } from '../lib/image-compression';

const MAX_IMAGES = 5;

interface ImagePickerResult {
  images: CompressedImage[];
  pickFromCamera: () => Promise<void>;
  pickFromGallery: () => Promise<void>;
  removeImage: (index: number) => void;
  loading: boolean;
}

/**
 * Hook for picking and managing images from camera or gallery.
 * - Requests permissions automatically
 * - Compresses images after picking
 * - Limits to max 5 images
 * - Manages loading state during compression
 */
export function useImagePicker(): ImagePickerResult {
  const [images, setImages] = useState<CompressedImage[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Picks an image from the camera.
   * Requests camera permissions if needed.
   */
  const pickFromCamera = useCallback(async () => {
    try {
      if (images.length >= MAX_IMAGES) {
        return;
      }

      // Request camera permissions (web has no permission API)
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Camera permission denied');
          return;
        }
      }

      setLoading(true);

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1, // We'll compress ourselves
        exif: false, // Don't include EXIF data
      });

      if (!result.canceled && result.assets[0]) {
        // Compress the image
        const compressed = await compressImage(result.assets[0].uri);
        setImages((prev) => [...prev, compressed]);
      }
    } catch (error) {
      console.error('Failed to pick image from camera:', error);
    } finally {
      setLoading(false);
    }
  }, [images.length]);

  /**
   * Picks images from the gallery.
   * Requests media library permissions if needed.
   */
  const pickFromGallery = useCallback(async () => {
    try {
      if (images.length >= MAX_IMAGES) {
        return;
      }

      // Request media library permissions (web has no permission API)
      if (Platform.OS !== 'web') {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Media library permission denied');
          return;
        }
      }

      setLoading(true);

      // Calculate how many more images we can add
      const remaining = MAX_IMAGES - images.length;

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1, // We'll compress ourselves
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        exif: false, // Don't include EXIF data
      });

      if (!result.canceled && result.assets.length > 0) {
        // Compress all picked images
        const compressPromises = result.assets.map(
          (asset: ImagePicker.ImagePickerAsset) => compressImage(asset.uri),
        );
        const compressed = await Promise.all(compressPromises);

        setImages((prev) => [...prev, ...compressed]);
      }
    } catch (error) {
      console.error('Failed to pick images from gallery:', error);
    } finally {
      setLoading(false);
    }
  }, [images.length]);

  /**
   * Removes an image at the specified index.
   */
  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    images,
    pickFromCamera,
    pickFromGallery,
    removeImage,
    loading,
  };
}
