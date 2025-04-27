import { NextRequest, NextResponse } from 'next/server';
import { cloudinary, CLOUDINARY_FOLDERS } from '@/lib/cloudinary/config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Types de médias autorisés
const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Parser le corps de la requête
    const body = await req.json();
    const { image, folder, publicId, tags } = body;

    if (!image) {
      return NextResponse.json({ error: 'Image manquante' }, { status: 400 });
    }

    // Vérifier le format de l'image
    const formatMatch = image.match(/^data:(image\/\w+);base64,/);
    if (!formatMatch || !ALLOWED_FORMATS.includes(formatMatch[1])) {
      return NextResponse.json({ 
        error: 'Format d\'image invalide. Formats acceptés: JPEG, PNG, WebP' 
      }, { status: 400 });
    }

    // Vérifier la taille de l'image
    const base64Data = image.split(',')[1];
    const fileSize = Buffer.from(base64Data, 'base64').length;
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `Image trop volumineuse. Taille maximale: ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      }, { status: 400 });
    }

    // Sélectionner le dossier de destination
    const targetFolder = CLOUDINARY_FOLDERS[folder?.toUpperCase()] || CLOUDINARY_FOLDERS.MISC;

    // Définir les options d'upload
    const uploadOptions = {
      folder: targetFolder,
      public_id: publicId, // Optionnel
      resource_type: 'image',
      tags: tags || [],
      // Optimisations automatiques
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' }
      ]
    };

    // Uploader l'image vers Cloudinary
    const result = await cloudinary.uploader.upload(image, uploadOptions);

    // Journaliser l'upload
    console.log(`Image uploadée: ${result.public_id} (${Math.round(result.bytes / 1024)}KB)`);

    // Retourner les informations de l'image
    return NextResponse.json({
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      created_at: result.created_at
    });
  } catch (error: any) {
    console.error('Erreur lors de l\'upload vers Cloudinary:', error);
    return NextResponse.json(
      { error: 'Erreur serveur: ' + (error.message || 'Erreur inconnue') },
      { status: 500 }
    );
  }
}