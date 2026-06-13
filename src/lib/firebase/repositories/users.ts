import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseDb } from '../client';
import { User } from '@/types/user';

export async function getUser(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(getFirebaseDb(), 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    displayName: data.displayName,
    email: data.email,
    photoURL: data.photoURL,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  };
}

export async function createUserIfNotExists(
  uid: string,
  profile: Pick<User, 'displayName' | 'email' | 'photoURL'>
) {
  const db = getFirebaseDb();
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  await setDoc(ref, {
    uid,
    displayName: profile.displayName,
    email: profile.email,
    photoURL: profile.photoURL,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
