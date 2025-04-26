import type { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';

// Configuration Cloudinary
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
  // Vérifier la méthode
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { image, folder = 'streamflow', transformation = '' } = req.body;
    
    if (!image) {
      return res.status(400).json({ message: 'No image provided' });
    }

    // Options d'upload
    const uploadOptions: any = {
      folder
    };

    // Ajouter les transformations si spécifiées
    if (transformation) {
      uploadOptions.transformation = transformation;
    }

    // Upload l'image vers Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image, uploadOptions);

    // Retourner les informations de l'image
    return res.status(200).json({
      public_id: uploadResponse.public_id,
      secure_url: uploadResponse.secure_url,
      resource_type: uploadResponse.resource_type
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return res.status(500).json({ message: 'Failed to upload image' });
  }
}