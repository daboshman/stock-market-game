import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from '../client';
import { WatchlistItem } from '@/types/portfolio';

export async function getWatchlist(userId: string): Promise<WatchlistItem[]> {
  const snap = await getDocs(collection(getFirebaseDb(), 'portfolios', userId, 'watchlist'));
  return snap.docs.map((d) => ({
    symbol: d.id,
    addedAt: d.data().addedAt?.toDate(),
  }));
}

export async function addToWatchlist(userId: string, symbol: string) {
  const db = getFirebaseDb();
  await setDoc(doc(db, 'portfolios', userId, 'watchlist', symbol), {
    symbol,
    addedAt: serverTimestamp(),
  });
}

export async function removeFromWatchlist(userId: string, symbol: string) {
  await deleteDoc(doc(getFirebaseDb(), 'portfolios', userId, 'watchlist', symbol));
}
