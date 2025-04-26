import { v2 as cloudinary } from 'cloudinary';

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Type pour les options de téléchargement
interface UploadOptions {
  folder?: string;
  publicId?: string;
  transformation?: any[];
}

// Fonction pour télécharger une image
export const uploadImage = async (
  file: File,
  options: UploadOptions = {}
): Promise<string> => {
  // Convertir le fichier en base64
  const base64data = await fileToBase64(file);
  
  // Paramètres de téléchargement
  const uploadParams = {
    folder: options.folder || 'streamflow',
    public_id: options.publicId,
    transformation: options.transformation,
    resource_type: 'auto'
  };
  
  try {
    // Effectuer le téléchargement
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload(base64data, uploadParams, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
    
    // Retourner l'URL de l'image
    return result.secure_url;
  } catch (error) {
    console.error('Erreur lors du téléchargement vers Cloudinary:', error);
    throw error;
  }
};

// Télécharger un poster de film
export const uploadMoviePoster = async (
  file: File,
  movieId: string
): Promise<string> => {
  return uploadImage(file, {
    folder: 'movies/posters',
    publicId: `poster_${movieId}`,
    transformation: [{ width: 500, height: 750, crop: 'fill' }]
  });
};

// Télécharger une image de fond
export const uploadMovieBackdrop = async (
  file: File,
  movieId: string
): Promise<string> => {
  return uploadImage(file, {
    folder: 'movies/backdrops',
    publicId: `backdrop_${movieId}`,
    transformation: [{ width: 1920, height: 1080, crop: 'fill' }]
  });
};

// Fonction utilitaire pour convertir un fichier en base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};