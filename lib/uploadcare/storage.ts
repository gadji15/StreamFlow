import { uploadFile } from 'uploadcare-widget';

// Type pour les options de téléchargement
export interface UploadOptions {
  publicKey: string;
  fileName?: string;
  folder?: string;
  maxSize?: number;
}

// Télécharger une image
export const uploadImage = async (
  file: File, 
  options: UploadOptions
): Promise<string> => {
  try {
    const result = await uploadFile(file, options);
    
    // Retourne l'URL de l'image téléchargée
    return result.cdnUrl;
  } catch (error) {
    console.error("Erreur lors du téléchargement de l'image:", error);
    throw error;
  }
};

// Télécharger un poster de film
export const uploadMoviePoster = async (
  file: File, 
  movieId: string
): Promise<string> => {
  return uploadImage(file, {
    publicKey: process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || '',
    fileName: `poster_${movieId}`,
    folder: 'movies/posters'
  });
};

// Télécharger une image de fond de film
export const uploadMovieBackdrop = async (
  file: File, 
  movieId: string
): Promise<string> => {
  return uploadImage(file, {
    publicKey: process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || '',
    fileName: `backdrop_${movieId}`,
    folder: 'movies/backdrops'
  });
};