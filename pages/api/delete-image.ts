import type { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { publicId } = req.body;
    
    if (!publicId) {
      return res.status(400).json({ error: 'publicId est requis' });
    }
    
    // Supprimer l'image de Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      return res.status(200).json({ success: true });
    } else {
      return res.status(404).json({ error: 'Image non trouvée ou déjà supprimée' });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return res.status(500).json({ error: 'Erreur lors de la suppression de l\'image' });
  }
}