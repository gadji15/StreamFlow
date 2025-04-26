import type { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }
  
  try {
    const { public_id } = req.body;
    
    if (!public_id) {
      return res.status(400).json({ success: false, message: 'ID public non fourni' });
    }
    
    // Supprimer l'image de Cloudinary
    const result = await cloudinary.uploader.destroy(public_id);
    
    if (result.result === 'ok') {
      return res.status(200).json({
        success: true,
        message: 'Image supprimée avec succès'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Échec de la suppression de l\'image',
        result
      });
    }
  } catch (error: any) {
    console.error('Erreur lors de la suppression de Cloudinary:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Échec de la suppression de l\'image',
      error: error.message
    });
  }
}