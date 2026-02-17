/**
 * Image compression utilities
 * Resizes and compresses images before upload to meet performance budget.
 */

import { Platform } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

export interface CompressedImage {
  uri: string;
  width: number;
  height: number;
  fileSize?: number;
}

const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.8;
const THUMBNAIL_MAX_DIMENSION = 400;

/**
 * Web-specific compression using Canvas API.
 * expo-image-manipulator hangs on web, so we use native browser APIs.
 */
async function compressImageWeb(
  uri: string,
  maxDimension: number,
  quality: number,
): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const { width, height } = img;
      const longestEdge = Math.max(width, height);
      let targetWidth = width;
      let targetHeight = height;

      if (longestEdge > maxDimension) {
        const scale = maxDimension / longestEdge;
        targetWidth = Math.round(width * scale);
        targetHeight = Math.round(height * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);

      resolve({
        uri: dataUrl,
        width: targetWidth,
        height: targetHeight,
      });
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = uri;
  });
}

/**
 * Compresses an image to meet performance requirements.
 * - Resizes: longest edge max 1200px, maintains aspect ratio
 * - Compresses: JPEG quality 0.8
 * - Strips EXIF data automatically via expo-image-manipulator
 *
 * @param uri - Source image URI
 * @returns Compressed image with metadata
 */
export async function compressImage(uri: string): Promise<CompressedImage> {
  // Use Canvas API on web — expo-image-manipulator hangs on web platform
  if (Platform.OS === 'web') {
    return compressImageWeb(uri, MAX_DIMENSION, JPEG_QUALITY);
  }

  try {
    // Get image dimensions to calculate resize
    const imageInfo = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
    });

    const { width, height } = imageInfo;
    const longestEdge = Math.max(width, height);

    // Calculate resize dimensions if needed
    const resize =
      longestEdge > MAX_DIMENSION
        ? {
            width: width > height ? MAX_DIMENSION : undefined,
            height: height >= width ? MAX_DIMENSION : undefined,
          }
        : undefined;

    // Apply resize and compression
    const manipulateActions: ImageManipulator.Action[] = resize
      ? [{ resize }]
      : [];

    const result = await ImageManipulator.manipulateAsync(
      uri,
      manipulateActions,
      {
        compress: JPEG_QUALITY,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error('Failed to compress image');
  }
}

/**
 * Generates a thumbnail version of an image.
 * - Resizes: longest edge max 400px
 * - Compresses: JPEG quality 0.8
 *
 * @param uri - Source image URI
 * @returns Thumbnail image with metadata
 */
export async function generateThumbnail(uri: string): Promise<CompressedImage> {
  // Use Canvas API on web — expo-image-manipulator hangs on web platform
  if (Platform.OS === 'web') {
    return compressImageWeb(uri, THUMBNAIL_MAX_DIMENSION, JPEG_QUALITY);
  }

  try {
    // Get image dimensions
    const imageInfo = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
    });

    const { width, height } = imageInfo;
    const longestEdge = Math.max(width, height);

    // Calculate resize dimensions
    const resize =
      longestEdge > THUMBNAIL_MAX_DIMENSION
        ? {
            width: width > height ? THUMBNAIL_MAX_DIMENSION : undefined,
            height: height >= width ? THUMBNAIL_MAX_DIMENSION : undefined,
          }
        : undefined;

    // Apply resize and compression
    const manipulateActions: ImageManipulator.Action[] = resize
      ? [{ resize }]
      : [];

    const result = await ImageManipulator.manipulateAsync(
      uri,
      manipulateActions,
      {
        compress: JPEG_QUALITY,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Thumbnail generation failed:', error);
    throw new Error('Failed to generate thumbnail');
  }
}
