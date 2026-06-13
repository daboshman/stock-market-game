import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirebaseAuth } from './client';

const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const result = await signInWithPopup(getFirebaseAuth(), provider);
  return result.user;
}

export async function signOut() {
  await firebaseSignOut(getFirebaseAuth());
}
