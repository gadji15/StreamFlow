// Script pour tester la configuration Cloudinary
const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const path = require('path');

// Chargez les variables d'environnement depuis .env.local
require('dotenv').config({ path: '.env.local' });

// Vérifier que les variables d'environnement sont définies
console.log('\n🔍 Vérification des variables d\'environnement Cloudinary:');
console.log(`CLOUDINARY_CLOUD_NAME: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? '✅' : '❌'}`);
console.log(`CLOUDINARY_API_KEY: ${process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ? '✅' : '❌'}`);
console.log(`CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? '✅' : '❌'}`);

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Fonction principale de test
async function testCloudinary() {
  try {
    console.log('\n🚀 Début du test Cloudinary...');
    
    // Créer un fichier test temporaire
    const tempFilePath = path.join(__dirname, 'test-cloudinary.txt');
    fs.writeFileSync(tempFilePath, 'Ce fichier est un test pour Cloudinary');
    console.log('✅ Fichier de test créé');
    
    // 1. Test d'upload
    console.log('\n📤 Test de téléchargement...');
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        tempFilePath, 
        { 
          folder: 'streamflow-test',
          resource_type: 'raw'
        }, 
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    
    console.log('✅ Téléchargement réussi!');
    console.log(`   URL: ${uploadResult.secure_url}`);
    console.log(`   ID Public: ${uploadResult.public_id}`);
    
    // Nettoyer le fichier temporaire
    fs.unlinkSync(tempFilePath);
    console.log('✅ Fichier temporaire supprimé');
    
    // 2. Test de récupération d'informations sur le fichier
    console.log('\n🔍 Test de récupération d\'informations...');
    const getResult = await new Promise((resolve, reject) => {
      cloudinary.api.resource(
        uploadResult.public_id,
        { resource_type: 'raw' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    
    console.log('✅ Récupération d\'informations réussie!');
    console.log(`   Type: ${getResult.resource_type}`);
    console.log(`   Format: ${getResult.format}`);
    console.log(`   Taille: ${getResult.bytes} bytes`);
    
    // 3. Test de suppression
    console.log('\n🗑️ Test de suppression...');
    const deleteResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        uploadResult.public_id,
        { resource_type: 'raw' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    
    console.log('✅ Suppression réussie!');
    console.log(`   Résultat: ${deleteResult.result}`);
    
    console.log('\n✅ Tous les tests Cloudinary ont réussi!');
    console.log('Votre configuration Cloudinary est correcte et fonctionne parfaitement.');
    
  } catch (error) {
    console.error('\n❌ ERREUR lors du test Cloudinary:');
    console.error(error);
    
    // Conseils de dépannage basés sur le type d'erreur
    if (error.message && error.message.includes('API key')) {
      console.log('\n⚠️ Votre clé API semble être incorrecte. Vérifiez NEXT_PUBLIC_CLOUDINARY_API_KEY dans .env.local');
    } else if (error.message && error.message.includes('API secret')) {
      console.log('\n⚠️ Votre secret API semble être incorrect. Vérifiez CLOUDINARY_API_SECRET dans .env.local');
    } else if (error.message && error.message.includes('cloud name')) {
      console.log('\n⚠️ Votre nom de cloud semble être incorrect. Vérifiez NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME dans .env.local');
    }
    
    console.log('\n📋 Assurez-vous que:');
    console.log('1. Vous avez créé un compte sur https://cloudinary.com');
    console.log('2. Vous avez copié les bonnes clés depuis le tableau de bord Cloudinary');
    console.log('3. Les variables d\'environnement sont correctement définies dans .env.local');
  }
}

// Exécuter le test
testCloudinary();