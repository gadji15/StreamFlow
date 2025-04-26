// Script pour tester la connexion à Firebase et les permissions
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function testFirebasePermissions() {
  console.log("Initializing Firebase...");
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  console.log("Testing Firebase connection and permissions...");
  
  try {
    // Test collection
    const testCollRef = collection(db, 'test_collection');
    console.log("Reading from test_collection...");
    const snapshot = await getDocs(testCollRef);
    
    console.log(`Found ${snapshot.size} documents in test_collection`);
    
    // Write a test document
    console.log("Writing a test document...");
    const testDocId = `test_doc_${Date.now()}`;
    const testDocRef = doc(db, 'test_collection', testDocId);
    await setDoc(testDocRef, { 
      created: new Date().toISOString(),
      testValue: "This is a test"
    });
    
    console.log(`Test document created with ID: ${testDocId}`);
    
    // Read it back
    console.log("Reading back the test document...");
    const docsAfter = await getDocs(testCollRef);
    console.log(`Found ${docsAfter.size} documents in test_collection`);
    
    // Clean up
    console.log("Deleting test document...");
    await deleteDoc(testDocRef);
    console.log("Test document deleted successfully!");
    
    // Try to read another collection
    console.log("\nTesting access to different collections:");
    
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      console.log(`✅ Users collection: Access successful, found ${usersSnapshot.size} documents`);
    } catch (error) {
      console.log(`❌ Users collection: Permission denied - ${error.message}`);
    }
    
    try {
      const moviesRef = collection(db, 'movies');
      const moviesSnapshot = await getDocs(moviesRef);
      console.log(`✅ Movies collection: Access successful, found ${moviesSnapshot.size} documents`);
    } catch (error) {
      console.log(`❌ Movies collection: Permission denied - ${error.message}`);
    }
    
    console.log("\n✅ Firebase connection and permissions test complete! Everything looks good.");
    
  } catch (error) {
    console.error("❌ Error testing Firebase:", error);
    console.log("\nPossible causes:");
    console.log("1. Firebase credentials are incorrect");
    console.log("2. Firestore security rules are too restrictive");
    console.log("3. The Firebase project doesn't exist or has been deleted");
    console.log("4. Network connectivity issues");
    
    console.log("\nCheck your Firestore rules in the Firebase console and make sure they allow access for development.");
  }
}

testFirebasePermissions();