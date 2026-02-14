/**
 * Image compression utilities
 * Resizes and compresses images before upload to meet performance budget.
 */

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
 * Compresses an image to meet performance requirements.
 * - Resizes: longest edge max 1200px, maintains aspect ratio
 * - Compresses: JPEG quality 0.8
 * - Strips EXIF data automatically via expo-image-manipulator
 *
 * @param uri - Source image URI
 * @returns Compressed image with metadata
 */
export async function compressImage(uri: string): Promise<CompressedImage> {
  try {
    // Get image dimensions to calculate resize
    const imageInfo = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );

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
      }
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
  try {
    // Get image dimensions
    const imageInfo = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );

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
      }
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
