import { initializeApp } from "firebase/app";
// Naya Import: Persistence ke liye
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Storage Package
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCRCL4X7BGmumch8xwTv3-s3oA9K9yA2eo",
  authDomain: "crochet-startup.firebaseapp.com",
  projectId: "crochet-startup",
  storageBucket: "crochet-startup.firebasestorage.app",
  messagingSenderId: "973888981194",
  appId: "1:973888981194:web:8dd9c5b7118059eebf8c33",
  measurementId: "G-6399K702WC"
};

const app = initializeApp(firebaseConfig);

// --- AUTH SETUP (Login Save Rakhne ke liye) ---
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (e) {
  // Agar kabhi initializeAuth fail ho jaye (jaise web pe), toh normal getAuth use karo
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);