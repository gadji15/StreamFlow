import { v2 as cloudinary } from 'cloudinary';

// Configuration de Cloudinary
if (typeof window === 'undefined') {
  // Code côté serveur uniquement
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

// Types
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  created_at: string;
}

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  transformation?: any[];
  tags?: string[];
}

/**
 * Convertit un fichier en chaîne base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Télécharge une image vers Cloudinary via une API route Next.js
 */
export const uploadImage = async (
  file: File,
  options: UploadOptions = {}
): Promise<string> => {
  try {
    // Préparer les données du formulaire
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.folder) {
      formData.append('folder', options.folder);
    }
    
    if (options.publicId) {
      formData.append('public_id', options.publicId);
    }
    
    if (options.transformation) {
      formData.append('transformation', JSON.stringify(options.transformation));
    }
    
    if (options.tags && options.tags.length > 0) {
      formData.append('tags', options.tags.join(','));
    }
    
    // Envoyer la requête à notre API route Next.js
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors du téléchargement: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Erreur lors du téléchargement vers Cloudinary:', error);
    throw error;
  }
};

/**
 * Télécharge un poster de film
 */
export const uploadMoviePoster = async (
  file: File,
  movieId: string
): Promise<string> => {
  return uploadImage(file, {
    folder: 'movies/posters',
    publicId: `poster_${movieId}`,
    transformation: [{ width: 500, height: 750, crop: 'fill' }],
    tags: ['poster', 'movie', movieId]
  });
};

/**
 * Télécharge une image de fond de film
 */
export const uploadMovieBackdrop = async (
  file: File,
  movieId: string
): Promise<string> => {
  return uploadImage(file, {
    folder: 'movies/backdrops',
    publicId: `backdrop_${movieId}`,
    transformation: [{ width: 1920, height: 1080, crop: 'fill' }],
    tags: ['backdrop', 'movie', movieId]
  });
};

/**
 * Supprime une image de Cloudinary via une API route Next.js
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    const response = await fetch('/api/delete-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la suppression: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error);
    throw error;
  }
};

/**
 * Extrait l'ID public d'une URL Cloudinary
 */
export const getPublicIdFromUrl = (url: string): string | null => {
  // Format typique: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.ext
  const regex = /\/v\d+\/(.+)\.\w+$/;
  const match = url.match(regex);
  
  return match ? match[1] : null;
};