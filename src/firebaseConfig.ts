// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore
import { getStorage } from "firebase/storage";   // Import Storage

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCdpu9ju16MmSsFnLckTbb_IZC8fg_dLa0",
  authDomain: "gutachtenportal24.firebaseapp.com",
  projectId: "gutachtenportal24",
  storageBucket: "gutachtenportal24.firebasestorage.app",
  messagingSenderId: "96879633979",
  appId: "1:96879633979:web:110ecda57a7a7909e31e1e",
  measurementId: "G-MD6JHD1PCG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);   // Initialize Firestore
const storage = getStorage(app); // Initialize Storage

export { app, auth, db, storage }; // Export all initialized services