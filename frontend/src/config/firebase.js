import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase safely
let app;
let auth;
let googleProvider;
let ai;
let geminiModel;

try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    
    // Initialize Firebase AI Logic
    try {
      ai = getAI(app, { backend: new GoogleAIBackend() });
      geminiModel = getGenerativeModel(ai, { model: "gemini-2.5-flash" }); // Updated to 2.5-flash
    } catch (aiErr) {
      console.warn("Firebase AI initialization failed:", aiErr);
    }
  } else {
    console.warn("⚠️ Firebase API Key missing. Authentication features will be disabled.");
    // Provide dummy safe versions to avoid crashing imports
    auth = { onAuthStateChanged: (cb) => { cb(null); return () => {}; } }; 
    googleProvider = {};
  }
} catch (err) {
  console.error("Firebase initialization failed:", err);
  auth = { onAuthStateChanged: (cb) => { cb(null); return () => {}; } };
}

// Analytics is only available in browser environments
let analytics;
if (typeof window !== "undefined" && app) {
  try {
    analytics = getAnalytics(app);
  } catch (err) {
    console.warn("Firebase Analytics failed to initialize:", err);
  }
}

export { auth, googleProvider, analytics, geminiModel };
export default app;
