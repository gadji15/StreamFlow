// Importation de dotenv pour charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;

// Configuration de Cloudinary avec vos variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, // dhmlmtkrk
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,       // 654321789113238
  api_secret: process.env.CLOUDINARY_API_SECRET,             // gZ3D7cDaTuOJcZTkz55JdTKnwPA
  secure: true
});

// Fonction pour tester la connexion
async function testCloudinaryConnection() {
  try {
    // Essayer de récupérer les infos du compte
    const result = await cloudinary.api.ping();
    console.log('✅ Connexion à Cloudinary réussie!');
    console.log(`   Cloud: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`);
    console.log(`   API connectée: ${result.status === 'ok'}`);
    
    // Vérifier les limites du compte
    const usage = await cloudinary.api.usage();
    console.log('📊 Utilisation du compte:');
    console.log(`   Bande passante: ${Math.round(usage.bandwidth / 1024 / 1024)} MB`);
    console.log(`   Stockage: ${Math.round(usage.storage / 1024 / 1024)} MB`);
    console.log(`   Ressources: ${usage.resources}`);
    
  } catch (error) {
    console.error('❌ Erreur de connexion à Cloudinary:');
    console.error(`   Message: ${error.message}`);
    console.error('   Veuillez vérifier vos identifiants dans .env.local');
  }
}

testCloudinaryConnection();