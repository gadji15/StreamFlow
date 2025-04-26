import { v2 as cloudinary } from 'cloudinary';

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { public_id } = req.body;
    
    if (!public_id) {
      return res.status(400).json({ error: 'No public_id provided' });
    }

    // Supprimer l'image de Cloudinary
    const result = await cloudinary.uploader.destroy(public_id);

    return res.status(200).json({ result });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return res.status(500).json({ error: 'Failed to delete image' });
  }
}