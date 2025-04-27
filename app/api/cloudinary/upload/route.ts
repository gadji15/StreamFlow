import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Configurer Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Parser le corps de la requête
    const body = await req.json();
    const { image, folder } = body;

    if (!image) {
      return NextResponse.json({ error: 'Image manquante' }, { status: 400 });
    }

    // Vérifier le format de l'image
    if (!image.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Format d\'image invalide' }, { status: 400 });
    }

    // Définir les options d'upload
    const uploadOptions = {
      folder: folder || 'streamflow',
      resource_type: 'image',
      // Ajouter des transformations si nécessaire
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' }
      ]
    };

    // Uploader l'image vers Cloudinary
    const result = await cloudinary.uploader.upload(image, uploadOptions);

    // Retourner les informations de l'image
    return NextResponse.json({
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format
    });
  } catch (error: any) {
    console.error('Erreur lors de l\'upload vers Cloudinary:', error);
    return NextResponse.json(
      { error: 'Erreur serveur: ' + (error.message || 'Erreur inconnue') },
      { status: 500 }
    );
  }
}