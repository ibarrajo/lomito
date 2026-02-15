/**
 * Image upload utilities
 * Handles uploading images to Supabase Storage and creating database records.
 */

import { supabase } from './supabase';
import { generateThumbnail } from './image-compression';

export interface UploadedImage {
  url: string;
  thumbnailUrl: string;
}

const STORAGE_BUCKET = 'case-media';

/**
 * Uploads a case image to Supabase Storage and creates a database record.
 * - Uploads full image to: cases/{caseId}/{index}.jpg
 * - Generates and uploads thumbnail to: cases/{caseId}/thumb_{index}.jpg
 * - Inserts record into case_media table
 *
 * @param caseId - Case ID to associate the image with
 * @param imageUri - Local URI of the compressed image
 * @param index - Index/order of the image in the case
 * @returns Public URLs for full image and thumbnail
 */
export async function uploadCaseImage(
  caseId: string,
  imageUri: string,
  index: number,
): Promise<UploadedImage> {
  try {
    // Convert local URI to blob for upload
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Upload full image
    const imagePath = `cases/${caseId}/${index}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(imagePath, blob, {
        contentType: 'image/jpeg',
        cacheControl: '31536000', // 1 year
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Generate and upload thumbnail
    const thumbnail = await generateThumbnail(imageUri);
    const thumbnailResponse = await fetch(thumbnail.uri);
    const thumbnailBlob = await thumbnailResponse.blob();

    const thumbnailPath = `cases/${caseId}/thumb_${index}.jpg`;
    const { error: thumbnailUploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(thumbnailPath, thumbnailBlob, {
        contentType: 'image/jpeg',
        cacheControl: '31536000',
        upsert: false,
      });

    if (thumbnailUploadError) {
      throw thumbnailUploadError;
    }

    // Get public URLs
    const { data: imageData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(imagePath);

    const { data: thumbnailData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(thumbnailPath);

    // Insert record into case_media table
    const { error: dbError } = (await supabase.from('case_media').insert({
      case_id: caseId,
      url: imageData.publicUrl,
      thumbnail_url: thumbnailData.publicUrl,
      type: 'image' as const,
      order: index,
    } as never)) as { error: unknown };

    if (dbError) {
      console.error('Failed to insert case_media record:', dbError);
      // Don't throw here - the upload succeeded, DB insert is secondary
    }

    return {
      url: imageData.publicUrl,
      thumbnailUrl: thumbnailData.publicUrl,
    };
  } catch (error) {
    console.error('Image upload failed:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Uploads multiple images for a case.
 *
 * @param caseId - Case ID to associate the images with
 * @param imageUris - Array of local URIs of compressed images
 * @returns Array of uploaded image URLs
 */
export async function uploadCaseImages(
  caseId: string,
  imageUris: string[],
): Promise<UploadedImage[]> {
  const uploadPromises = imageUris.map((uri, index) =>
    uploadCaseImage(caseId, uri, index),
  );

  return Promise.all(uploadPromises);
}
