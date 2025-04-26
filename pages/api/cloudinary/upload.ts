import type { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }
  
  try {
    const { image, folder = 'streamflow' } = req.body;
    
    if (!image) {
      return res.status(400).json({ success: false, message: 'Aucune image fournie' });
    }
    
    // Uploader l'image vers Cloudinary
    const uploadOptions: any = {
      folder
    };
    
    // Utiliser un preset si configuré (pour limiter les transformations autorisées)
    if (process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
      uploadOptions.upload_preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    }
    
    const uploadResponse = await cloudinary.uploader.upload(image, uploadOptions);
    
    return res.status(200).json({
      success: true,
      public_id: uploadResponse.public_id,
      secure_url: uploadResponse.secure_url,
      resource_type: uploadResponse.resource_type
    });
  } catch (error: any) {
    console.error('Erreur lors du téléchargement vers Cloudinary:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Échec du téléchargement de l\'image',
      error: error.message
    });
  }
}