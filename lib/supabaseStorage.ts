import { supabase } from './supabaseClient'

/**
 * Upload un fichier dans le bucket Supabase Storage.
 * @param bucket string - Nom du bucket (ex: 'images')
 * @param path string - Chemin/nom du fichier dans le bucket (ex: 'user-123/photo.png')
 * @param file File|Blob
 * @returns {publicUrl, error}
 */
export async function uploadToStorage(bucket: string, path: string, file: File | Blob) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
  if (error) return { publicUrl: null, error }

  // Récupère l’URL publique du fichier uploadé
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
  return { publicUrl: urlData?.publicUrl || null, error: null }
}

/**
 * Supprime un fichier du bucket Supabase Storage.
 * @param bucket string - Nom du bucket
 * @param path string - Chemin/nom du fichier
 */
export async function deleteFromStorage(bucket: string, path: string) {
  return await supabase.storage.from(bucket).remove([path])
}