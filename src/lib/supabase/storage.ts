
'use server';

import { supabase } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// This is a centralized and secure module for handling all file uploads and deletions.

/**
 * A generic and secure file upload function.
 * @param file The file to upload.
 * @param bucket The Supabase Storage bucket name (e.g., 'leader-photos').
 * @param oldUrl An optional URL of a previous file to delete upon successful upload.
 * @returns The public URL of the newly uploaded file.
 */
async function uploadFile(file: File, bucket: string, oldUrl?: string | null): Promise<string> {
    if (!file) {
        throw new Error('No file was provided for the upload operation.');
    }

    const fileName = `${uuidv4()}-${file.name}`;
    const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false, // We use upsert: false to prevent overwriting files with the same name, ensuring uniqueness.
        });

    if (uploadError) {
        console.error('Supabase Storage Upload Error:', uploadError);
        throw new Error(`Failed to upload file to the ${bucket} bucket.`);
    }

    // If a new file was uploaded successfully, we can safely delete the old one.
    if (oldUrl) {
        // This is a fire-and-forget operation. We don't want the UI to show an error
        // if the old file deletion fails for some reason (e.g., it was already deleted).
        deleteStorageFile(supabase, oldUrl, bucket).catch(console.error);
    }

    const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    if (!publicUrlData.publicUrl) {
        // This would be a critical failure, as a file was uploaded but we can't get its URL.
        throw new Error('A file was uploaded, but we failed to retrieve its public URL.');
    }

    return publicUrlData.publicUrl;
}

/**
 * Uploads a leader's photo to the 'leader-photos' bucket.
 * @param photoFile The photo file to upload.
 * @param oldPhotoUrl Optional: The URL of the old photo to delete.
 * @returns The public URL of the uploaded photo.
 */
export async function uploadLeaderPhoto(photoFile: File, oldPhotoUrl?: string | null): Promise<string> {
    return uploadFile(photoFile, 'leader-photos', oldPhotoUrl);
}

/**
 * Uploads a leader's manifesto to the 'leader-manifestos' bucket.
 * @param manifestoFile The manifesto file (PDF) to upload.
 * @param oldManifestoUrl Optional: The URL of the old manifesto to delete.
 * @returns The public URL of the uploaded manifesto.
 */
export async function uploadLeaderManifesto(manifestoFile: File, oldManifestoUrl?: string | null): Promise<string> {
    return uploadFile(manifestoFile, 'leader-manifestos', oldManifestoUrl);
}

/**
 * Deletes a file from a specified Supabase Storage bucket.
 * This is used when a leader profile is deleted entirely.
 * @param fileUrl The public URL of the file to delete.
 * @param bucket The bucket where the file is stored.
 */
import { SupabaseClient } from '@supabase/supabase-js';

export async function deleteStorageFile(db: SupabaseClient, fileUrl: string | null | undefined, bucket: string): Promise<void> {
    if (!fileUrl) return; // Nothing to delete

    let fileName = fileUrl.split('/').pop();
    if (!fileName) {
        console.error('Could not extract a valid file name from the URL:', fileUrl);
        return;
    }
    // Decode the file name to handle URL-encoded characters (e.g., spaces as %20)
    fileName = decodeURIComponent(fileName);

    const { error } = await db.storage.from(bucket).remove([fileName]);

    if (error && error.message !== 'The resource was not found') {
        // We log the error but don't throw, as this operation shouldn't block the main user action (e.g., deleting a leader profile).
        console.error(`Failed to delete file '${fileName}' from bucket '${bucket}'. Supabase Error:`, error);
    } else if (error && error.message === 'The resource was not found') {
        console.warn(`Attempted to delete file '${fileName}' from bucket '${bucket}', but it was not found. This might indicate it was already deleted or the URL was invalid.`);
    } else {
        console.log(`Successfully deleted file '${fileName}' from bucket '${bucket}'.`);
    }
}
