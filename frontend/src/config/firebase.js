import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBPmVAizuPmImqaoZ7Zpo3NAUZFwMktwyA",
  authDomain: "malaysisentimentdashboard.firebaseapp.com",
  projectId: "malaysisentimentdashboard",
  storageBucket: "malaysisentimentdashboard.firebasestorage.app",
  messagingSenderId: "506698735118",
  appId: "1:506698735118:web:d55f6a5bc9d2a634eca65f",
  measurementId: "G-W3NCEK5Z52"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Analytics is only available in browser environments
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { auth, googleProvider, analytics };
export default app;
