// Ce script ne fonctionne qu'en mode Node.js, pas dans le navigateur
// C'est normal pour un script de test en dehors du build Next.js
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Chemin vers une image de test
const testImagePath = path.join(__dirname, 'test-image.jpg');

// Fonction principale
async function testCloudinary() {
  console.log('🔍 Vérification de la configuration Cloudinary...');
  
  try {
    // Vérifier si toutes les variables d'environnement sont définies
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Variables d\'environnement Cloudinary manquantes. Vérifiez votre fichier .env.local');
    }
    
    console.log('✅ Variables d\'environnement Cloudinary détectées');
    
    // Vérifier si l'image de test existe
    if (!fs.existsSync(testImagePath)) {
      console.log('⚠️ Image de test non trouvée. Création d\'une image de test simple...');
      // Ici, on pourrait créer une image simple, mais pour ce test, on va juste signaler l'erreur
      throw new Error(`Image de test non trouvée : ${testImagePath}`);
    }
    
    // Télécharger l'image sur Cloudinary
    console.log('📤 Téléchargement d\'une image de test vers Cloudinary...');
    const uploadResult = await cloudinary.uploader.upload(testImagePath, {
      folder: 'streamflow-test'
    });
    
    console.log('✅ Image téléchargée avec succès!');
    console.log(`🔗 URL de l'image: ${uploadResult.secure_url}`);
    console.log(`🆔 Public ID: ${uploadResult.public_id}`);
    
    // Supprimer l'image après le test
    console.log('🗑️ Suppression de l\'image de test...');
    await cloudinary.uploader.destroy(uploadResult.public_id);
    
    console.log('✅ Image supprimée avec succès!');
    console.log('✅ TOUS LES TESTS CLOUDINARY SONT RÉUSSIS! ✅');
    
  } catch (error) {
    console.error('❌ ERREUR LORS DU TEST CLOUDINARY:');
    console.error(error);
    process.exit(1);
  }
}

// Exécuter la fonction de test
testCloudinary();