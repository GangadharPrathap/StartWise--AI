import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Read from Vite environment variables instead of hardcoding
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Graceful initialization — don't crash if Firebase isn't configured
const hasConfig = firebaseConfig.apiKey && firebaseConfig.projectId;

let app = null;
let auth = null;
let db = null;

if (hasConfig) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  console.warn("⚠️ Firebase not configured. Set VITE_FIREBASE_* variables in .env");
}

const provider = hasConfig ? new GoogleAuthProvider() : null;

export { auth, db };

export const signInWithGoogle = async () => {
  if (!auth || !provider) {
    throw new Error("Firebase not configured. Set VITE_FIREBASE_* in .env");
  }
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Auth Error - Google Sign-In Failed:", error);
    throw error;
  }
};

export const logout = async () => {
  if (!auth) return;
  try {
    await signOut(auth);
    console.log("✅ Logout Success");
  } catch (error) {
    console.error("❌ Logout Error:", error);
    throw error;
  }
};
