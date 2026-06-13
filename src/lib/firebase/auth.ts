import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { getFirebaseAuth } from './client';

const provider = new GoogleAuthProvider();

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  // Covers iPhone/iPod/iPad and iPad in "Request Desktop Site" mode
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/**
 * Sign in with Google.
 * - Desktop/Android: opens a popup and returns the authenticated user.
 * - iOS: initiates a full-page redirect (returns null — page navigates away).
 */
export async function signInWithGoogle() {
  const auth = getFirebaseAuth();
  if (isIOS()) {
    await signInWithRedirect(auth, provider);
    return null; // browser is navigating away; caller should not act on this
  }
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

/**
 * Must be called on every app load to complete any pending redirect sign-in.
 * Returns the user if returning from a Google redirect, or null otherwise.
 */
export async function resolveRedirectResult() {
  try {
    const result = await getRedirectResult(getFirebaseAuth());
    return result?.user ?? null;
  } catch (err) {
    console.error('[auth] getRedirectResult failed:', err);
    return null;
  }
}

export async function signOut() {
  await firebaseSignOut(getFirebaseAuth());
}
