import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Client-Side Firebase SDK Initialization
 * If custom environment keys are not configured, uses demo/sandbox configuration
 * to ensure the preview works seamlessly without runtime crashes.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKeyCineGeminiProduction',
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || 'cinegemini-app.firebaseapp.com',
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || 'cinegemini-app',
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || 'cinegemini-app.appspot.com',
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: metaEnv.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456',
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (err) {
  console.warn('Firebase client initialization warning:', err);
}

export { app, auth, db };
