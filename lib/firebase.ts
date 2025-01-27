import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAE2TgGoruGjP6GG2s8BfmWhYW2VS1WsA",
  authDomain: "resto-ccc2a.firebaseapp.com",
  projectId: "resto-ccc2a",
  storageBucket: "resto-ccc2a.firebasestorage.app",
  messagingSenderId: "263573718529",
  appId: "1:263573718529:web:f31a35a939ee233f0be200",
  measurementId: "G-7W29W4L9DH",
};

// Initialize Firebase app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

// Ensure db and auth are initialized properly
if (!db || !auth) {
  console.error("Firebase initialization failed. Please check the configuration.");
}

export { db, auth };
