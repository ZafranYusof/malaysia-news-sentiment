import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase safely — only auth is eagerly loaded.
// Analytics and AI are lazy-loaded to reduce initial bundle size.
let app;
let auth;
let googleProvider;

try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } else {
    console.warn("⚠️ Firebase API Key missing. Authentication features will be disabled.");
    auth = { onAuthStateChanged: (cb) => { cb(null); return () => {}; } }; 
    googleProvider = {};
  }
} catch (err) {
  console.error("Firebase initialization failed:", err);
  auth = { onAuthStateChanged: (cb) => { cb(null); return () => {}; } };
}

// Lazy-load Firebase Analytics (code-split into separate chunk)
let _analyticsPromise = null;
export function getAnalyticsLazy() {
  if (!_analyticsPromise) {
    _analyticsPromise = (async () => {
      if (typeof window === "undefined" || !app) return null;
      try {
        const { getAnalytics } = await import("firebase/analytics");
        return getAnalytics(app);
      } catch (err) {
        console.warn("Firebase Analytics failed to initialize:", err);
        return null;
      }
    })();
  }
  return _analyticsPromise;
}

// Lazy-load Firebase AI / Gemini model (code-split into separate chunk)
let _geminiPromise = null;
export function getGeminiModel() {
  if (!_geminiPromise) {
    _geminiPromise = (async () => {
      if (!app) return null;
      try {
        const { getAI, getGenerativeModel, GoogleAIBackend } = await import("firebase/ai");
        const ai = getAI(app, { backend: new GoogleAIBackend() });
        return getGenerativeModel(ai, { model: "gemini-2.5-flash" });
      } catch (err) {
        console.warn("Firebase AI initialization failed:", err);
        return null;
      }
    })();
  }
  return _geminiPromise;
}

// Initialize analytics after first paint (non-blocking)
if (typeof window !== "undefined" && app) {
  requestIdleCallback?.(() => getAnalyticsLazy()) ?? setTimeout(() => getAnalyticsLazy(), 3000);
}

export { auth, googleProvider };
export default app;
