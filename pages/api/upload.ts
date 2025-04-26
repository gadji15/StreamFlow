import type { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';
import { IncomingForm } from 'formidable';
import fs from 'fs';

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Désactiver le body parsing par défaut de Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Analyser la requête avec formidable
    const form = new IncomingForm();
    
    const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    // Récupérer le fichier
    const file = files.file[0];
    
    // Options de téléchargement
    const uploadOptions: any = {};
    
    // Ajouter les options si présentes dans les champs
    if (fields.folder) {
      uploadOptions.folder = fields.folder[0];
    }
    
    if (fields.public_id) {
      uploadOptions.public_id = fields.public_id[0];
    }
    
    if (fields.transformation) {
      try {
        uploadOptions.transformation = JSON.parse(fields.transformation[0]);
      } catch (e) {
        console.error('Erreur lors du parsing de la transformation:', e);
      }
    }
    
    if (fields.tags) {
      uploadOptions.tags = fields.tags[0];
    }
    
    // Télécharger l'image vers Cloudinary
    const result = await cloudinary.uploader.upload(file.filepath, uploadOptions);
    
    // Supprimer le fichier temporaire
    fs.unlinkSync(file.filepath);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    return res.status(500).json({ error: 'Erreur lors du téléchargement' });
  }
}