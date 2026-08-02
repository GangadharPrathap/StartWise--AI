import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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
    console.error("Firebase not configured. VITE_FIREBASE_API_KEY:", import.meta.env.VITE_FIREBASE_API_KEY ? "SET" : "MISSING");
    throw new Error("Firebase not configured. Set VITE_FIREBASE_* environment variables in Vercel dashboard.");
  }
  try {
    // Try popup first (works on most desktop browsers)
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    // If popup is blocked or fails, fall back to redirect
    if (error.code === 'auth/popup-blocked' || 
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/cancelled-popup-request') {
      console.warn("Popup blocked, falling back to redirect sign-in...");
      await signInWithRedirect(auth, provider);
      return null; // Redirect will reload the page
    }
    console.error("Auth Error - Google Sign-In Failed:", error.code, error.message);
    throw error;
  }
};

// Handle redirect result on page load (for redirect sign-in fallback)
export const handleRedirectResult = async () => {
  if (!auth) return null;
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      console.log("✅ Redirect sign-in successful:", result.user.email);
      return result.user;
    }
    return null;
  } catch (error) {
    console.error("Redirect result error:", error);
    return null;
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
