// Script pour configurer le premier utilisateur administrateur
// Exécutez ce script avec Node.js après avoir créé votre compte Firebase

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
  serverTimestamp 
} = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC8oDb6P233ChqVTi5jWyoQAytN8_jDZec",
  authDomain: "stramflow.firebaseapp.com",
  projectId: "stramflow",
  storageBucket: "stramflow.firebasestorage.app",
  messagingSenderId: "813946686204",
  appId: "1:813946686204:web:bb0ce03ce479afb5b32579",
  measurementId: "G-VNR14F6EMX"
};

// Informations de l'admin
const adminEmail = "gadjicheikh15@gmail.com";
const adminPassword = "Messigadji2982";
const adminName = "Gadji"; // Nom mis à jour selon votre demande

async function setupAdmin() {
  try {
    // Initialiser Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    let userCredential;
    
    try {
      // Essayer de créer un nouvel utilisateur
      console.log(`Création du compte utilisateur pour ${adminEmail}...`);
      userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log("Compte utilisateur créé avec succès");
    } catch (createError) {
      // Si l'utilisateur existe déjà, essayer de se connecter
      if (createError.code === 'auth/email-already-in-use') {
        console.log("Utilisateur existant, tentative de connexion...");
        userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        console.log("Connexion réussie");
      } else {
        throw createError;
      }
    }
    
    // Récupérer l'UID de l'utilisateur
    const uid = userCredential.user.uid;
    console.log(`UID de l'utilisateur: ${uid}`);
    
    // Créer un document administrateur dans Firestore
    console.log("Création du document admin dans Firestore...");
    await setDoc(doc(db, "admins", uid), {
      email: adminEmail,
      name: adminName,
      role: "super_admin",
      isActive: true,
      createdAt: serverTimestamp(),
      permissions: {
        canManageMovies: true,
        canManageSeries: true,
        canManageUsers: true,
        canManageAdmins: true,
        canManageSettings: true,
        canViewStats: true,
        canManageComments: true
      }
    });
    
    console.log("Compte administrateur configuré avec succès!");
    console.log(`Email: ${adminEmail}`);
    console.log(`Nom: ${adminName}`);
    console.log(`Role: super_admin`);
    console.log("\nVous pouvez maintenant vous connecter à l'interface admin.");
    
    // Déconnecter
    await auth.signOut();
    
  } catch (error) {
    console.error("Erreur lors de la configuration de l'administrateur:", error);
  }
}

setupAdmin();