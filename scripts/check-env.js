#!/usr/bin/env node

const requiredEnvVars = [
  // Firebase
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  
  // Firebase Admin
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY',
  'FIREBASE_ADMIN_PROJECT_ID',
  
  // Auth
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  
  // Cloudinary
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'NEXT_PUBLIC_CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  
  // TMDB
  'TMDB_API_KEY',
];

// Fonction pour vérifier une variable d'environnement
function checkEnvVar(varName) {
  if (!process.env[varName]) {
    console.error(`❌ Variable d'environnement manquante: ${varName}`);
    return false;
  }
  
  if (varName.includes('KEY') && process.env[varName].includes('votre')) {
    console.warn(`⚠️ Variable pas encore personnalisée: ${varName}`);
    return false;
  }
  
  return true;
}

// Vérification des variables requises
let allValid = true;
console.log('🔍 Vérification des variables d'environnement...\n');

for (const varName of requiredEnvVars) {
  if (checkEnvVar(varName)) {
    console.log(`✅ ${varName}`);
  } else {
    allValid = false;
  }
}

console.log('\n');
if (allValid) {
  console.log('✅ Toutes les variables d'environnement requises sont définies!');
  process.exit(0);
} else {
  console.error('❌ Certaines variables d'environnement sont manquantes ou incorrectes');
  process.exit(1);
}