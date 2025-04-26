import type { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Vérifier la méthode
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { public_id } = req.body;
    
    if (!public_id) {
      return res.status(400).json({ message: 'No public_id provided' });
    }

    // Supprimer l'image de Cloudinary
    const result = await cloudinary.uploader.destroy(public_id);

    // Vérifier si la suppression a réussi
    if (result.result === 'ok') {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ 
        message: 'Failed to delete image',
        result
      });
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return res.status(500).json({ message: 'Failed to delete image' });
  }
}