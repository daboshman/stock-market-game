import {
  collection,
  doc,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import { getFirebaseDb } from '../client';
import { Holding } from '@/types/portfolio';

export async function getHoldings(userId: string): Promise<Holding[]> {
  const snap = await getDocs(collection(getFirebaseDb(), 'portfolios', userId, 'holdings'));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      symbol: d.id,
      quantity: data.quantity,
      averageCost: data.averageCost,
      totalCost: data.totalCost,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    };
  });
}

export async function getHolding(userId: string, symbol: string): Promise<Holding | null> {
  const snap = await getDoc(doc(getFirebaseDb(), 'portfolios', userId, 'holdings', symbol));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    symbol,
    quantity: data.quantity,
    averageCost: data.averageCost,
    totalCost: data.totalCost,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  };
}
