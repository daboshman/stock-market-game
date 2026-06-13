import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseDb } from '../client';
import { Portfolio } from '@/types/portfolio';

export async function getPortfolio(userId: string): Promise<Portfolio | null> {
  const snap = await getDoc(doc(getFirebaseDb(), 'portfolios', userId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    cashBalance: data.cashBalance,
    totalInvested: data.totalInvested,
    startingBalance: data.startingBalance ?? 100000,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  };
}

export async function createPortfolioIfNotExists(userId: string) {
  const db = getFirebaseDb();
  const ref = doc(db, 'portfolios', userId);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  const startingBalance = 100000;

  await setDoc(ref, {
    cashBalance: startingBalance,
    totalInvested: 0,
    startingBalance,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
