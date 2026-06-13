import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Lazy init — only called at request time inside Route Handlers, never at build time.
function getAdminApp() {
  if (getApps().length > 0) return getApp();

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    // Surfaces as 503 in the trade route — helps distinguish from a bad token (401)
    throw new AdminConfigError(
      `Firebase Admin SDK env vars not set. ` +
        `PROJECT_ID=${!!process.env.FIREBASE_PROJECT_ID} ` +
        `CLIENT_EMAIL=${!!process.env.FIREBASE_CLIENT_EMAIL} ` +
        `PRIVATE_KEY=${!!privateKey}`
    );
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

export class AdminConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminConfigError';
  }
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}
