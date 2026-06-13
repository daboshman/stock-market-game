import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth as firebaseGetAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Lazy init — calling these functions from inside React components / event handlers
// ensures Firebase is never initialized at module evaluation time (which runs on the server).
export function getFirebaseAuth() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return firebaseGetAuth(app);
}

export function getFirebaseDb() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getFirestore(app);
}
