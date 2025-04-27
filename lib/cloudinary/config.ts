import { v2 as cloudinary } from 'cloudinary';

// Configuration une seule fois au démarrage
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Dossiers Cloudinary pour organiser les médias
export const CLOUDINARY_FOLDERS = {
  PROFILES: 'streamflow/profiles',
  MOVIES: 'streamflow/movies',
  SERIES: 'streamflow/series',
  EPISODES: 'streamflow/episodes',
  BANNERS: 'streamflow/banners',
  MISC: 'streamflow/misc'
};

// Transformations Cloudinary prédéfinies
export const CLOUDINARY_TRANSFORMATIONS = {
  THUMBNAIL: {
    width: 200,
    height: 300,
    crop: 'fill',
    quality: 'auto:good'
  },
  POSTER: {
    width: 400,
    height: 600,
    crop: 'fill',
    quality: 'auto:good'
  },
  BACKDROP: {
    width: 1280,
    height: 720,
    crop: 'fill',
    quality: 'auto:good'
  },
  PROFILE: {
    width: 150,
    height: 150,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto:good'
  }
};

// Instance cloudinary configurée
export { cloudinary };

// Fonction utilitaire pour créer des URLs optimisées
export function getOptimizedUrl(publicId: string, transformation: any = {}) {
  return cloudinary.url(publicId, {
    secure: true,
    ...transformation
  });
}