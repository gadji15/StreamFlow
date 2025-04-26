// Script pour tester Cloudinary
require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

async function testCloudinary() {
  try {
    console.log('Test de téléchargement vers Cloudinary...');
    
    // Créer un fichier texte temporaire pour le test
    const tempFilePath = path.join(__dirname, 'test-upload.txt');
    fs.writeFileSync(tempFilePath, 'Ceci est un test de téléchargement Cloudinary');
    
    // Télécharger le fichier
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(tempFilePath, 
        { 
          folder: 'streamflow-tests',
          resource_type: 'raw' 
        }, 
        (error, result) => {
          // Supprimer le fichier temporaire
          fs.unlinkSync(tempFilePath);
          
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    
    console.log('\n✅ Téléchargement Cloudinary réussi!');
    console.log('URL du fichier:', result.secure_url);
    console.log('ID public:', result.public_id);
    
    // Vérifier si on peut accéder au fichier
    console.log('\nTest d\'accès au fichier...');
    await fetch(result.secure_url);
    console.log('✅ Fichier accessible!');
    
    console.log('\nCloudinary est correctement configuré et fonctionne.');
  } catch (error) {
    console.error('❌ Erreur lors du test Cloudinary:', error);
    
    if (error.message && error.message.includes('API key')) {
      console.log('\nVérifiez vos clés d\'API Cloudinary dans .env.local');
    }
  }
}

testCloudinary();