import * as admin from 'firebase-admin';

// Vérifier si Firebase Admin est déjà initialisé
if (!admin.apps.length) {
  // Traiter la clé privée correctement
  // Les caractères \n doivent être convertis en vrais sauts de ligne
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
    ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: privateKey
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    });
    
    console.log('Firebase Admin initialisé avec succès');
  } catch (error) {
    console.error('Erreur d\'initialisation de Firebase Admin:', error);
  }
}

export const firebaseAdmin = admin;
export const adminAuth = admin.auth();
export const adminFirestore = admin.firestore();
export const adminStorage = admin.storage();