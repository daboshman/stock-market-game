import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '../../admin';
import { User } from '@/types/user';

export async function getUserServer(uid: string): Promise<User | null> {
  const snap = await getAdminDb().doc(`users/${uid}`).get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  return {
    uid,
    displayName: data.displayName,
    email: data.email,
    photoURL: data.photoURL,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  };
}

export async function createUserIfNotExistsServer(
  uid: string,
  profile: Pick<User, 'displayName' | 'email' | 'photoURL'>
) {
  const ref = getAdminDb().doc(`users/${uid}`);
  const snap = await ref.get();
  if (snap.exists) return;

  await ref.set({
    uid,
    displayName: profile.displayName,
    email: profile.email,
    photoURL: profile.photoURL,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}
