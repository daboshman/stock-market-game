import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { getFirebaseAuth } from './client';

const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  await signInWithRedirect(getFirebaseAuth(), provider);
}

export async function handleRedirectResult() {
  return getRedirectResult(getFirebaseAuth());
}

export async function signOut() {
  await firebaseSignOut(getFirebaseAuth());
}
