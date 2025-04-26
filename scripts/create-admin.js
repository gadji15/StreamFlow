// Script pour créer un utilisateur administrateur
const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} = require('firebase/auth');
const { 
  getFirestore, 
  doc, 
  setDoc,
  getDoc
} = require('firebase/firestore');

// Charger les variables d'environnement depuis .env.local
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

// Information de l'administrateur à créer
const adminEmail = "admin@streamflow.com";
const adminPassword = "Admin123!";
const adminName = "Administrateur";

async function createAdmin() {
  try {
    console.log('\n🔧 CRÉATION D\'UN COMPTE ADMINISTRATEUR 🔧\n');
    console.log('Initialisation de Firebase...');
    
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    let userCredential;
    let userId;
    
    try {
      // Tenter de créer un nouvel utilisateur administrateur
      console.log(`Création de l'utilisateur admin (${adminEmail})...`);
      userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      userId = userCredential.user.uid;
      console.log(`✅ Utilisateur créé avec succès! UID: ${userId}`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        // Si l'utilisateur existe déjà, on se connecte
        console.log('L\'email existe déjà, tentative de connexion...');
        userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        userId = userCredential.user.uid;
        console.log(`✅ Connexion réussie! UID: ${userId}`);
      } else {
        throw error;
      }
    }
    
    // Vérifier si l'utilisateur est déjà un administrateur
    const adminRef = doc(db, "admins", userId);
    const adminDoc = await getDoc(adminRef);
    
    if (adminDoc.exists()) {
      console.log('✅ L\'utilisateur est déjà configuré comme administrateur');
      console.log(`Données admin: ${JSON.stringify(adminDoc.data(), null, 2)}`);
    } else {
      // Ajouter l'utilisateur à la collection des administrateurs
      console.log('Ajout des données administrateur dans Firestore...');
      await setDoc(adminRef, {
        email: adminEmail,
        name: adminName,
        role: "super_admin",
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });
      console.log('✅ Données administrateur créées avec succès!');
    }
    
    console.log('\n✅ CONFIGURATION ADMINISTRATEUR TERMINÉE!\n');
    console.log('Vous pouvez maintenant vous connecter à l\'interface d\'administration avec:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Mot de passe: ${adminPassword}`);
    console.log(`\nAccédez à: http://localhost:3000/admin/auth/login\n`);
    
  } catch (error) {
    console.error('\n❌ ERREUR lors de la création de l\'administrateur:');
    console.error(error);
    
    if (error.code === 'auth/invalid-email') {
      console.log('\n⚠️ L\'adresse email n\'est pas valide');
    } else if (error.code === 'auth/weak-password') {
      console.log('\n⚠️ Le mot de passe est trop faible (minimum 6 caractères)');
    } else if (error.code === 'auth/network-request-failed') {
      console.log('\n⚠️ Problème de connexion réseau');
    } else if (error.code === 'auth/operation-not-allowed') {
      console.log('\n⚠️ La méthode de connexion par email/mot de passe n\'est pas activée');
      console.log('Activez-la dans la console Firebase: Authentication > Sign-in method > Email/Password');
    }
  }
}

createAdmin();