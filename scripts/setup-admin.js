// Ce script crée le premier administrateur dans Firebase
const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword 
} = require('firebase/auth');
const { 
  getFirestore, 
  doc, 
  setDoc 
} = require('firebase/firestore');

// Chargez les variables d'environnement depuis .env.local
require('dotenv').config({ path: '.env.local' });

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Informations de l'administrateur à créer
const adminEmail = "admin@streamflow.com";
const adminPassword = "Admin123!";
const adminName = "Administrateur";

async function setupAdmin() {
  try {
    console.log('Initialisation de Firebase...');
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    let userCredential;
    let userId;
    
    try {
      // Tenter de créer le compte administrateur
      console.log(`Création du compte admin (${adminEmail})...`);
      userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      userId = userCredential.user.uid;
      console.log(`✅ Compte administrateur créé avec succès! UID: ${userId}`);
    } catch (createError) {
      if (createError.code === 'auth/email-already-in-use') {
        console.log('L\'email existe déjà, tentative de connexion...');
        // Si l'utilisateur existe déjà, on se connecte
        userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        userId = userCredential.user.uid;
        console.log(`✅ Connexion réussie au compte existant! UID: ${userId}`);
      } else {
        throw createError;
      }
    }
    
    // Ajouter/mettre à jour les données de l'admin dans Firestore
    console.log('Enregistrement des données administrateur dans Firestore...');
    await setDoc(doc(db, "admins", userId), {
      email: adminEmail,
      name: adminName,
      role: "super_admin",
      isActive: true,
      createdAt: new Date().toISOString()
    });
    
    console.log('\n✅ Configuration de l\'administrateur terminée!');
    console.log(`\nVous pouvez maintenant vous connecter à l'interface d'administration avec:`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Mot de passe: ${adminPassword}`);
  } catch (error) {
    console.error('\n❌ Erreur lors de la configuration de l\'administrateur:');
    console.error(error);
  }
}

setupAdmin();