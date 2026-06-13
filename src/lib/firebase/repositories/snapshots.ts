import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { getFirebaseDb } from '../client';
import { PortfolioSnapshot } from '@/types/portfolio';

export async function getSnapshots(userId: string, count = 30): Promise<PortfolioSnapshot[]> {
  const q = query(
    collection(getFirebaseDb(), 'portfolios', userId, 'snapshots'),
    orderBy('timestamp', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        totalValue: data.totalValue,
        cashBalance: data.cashBalance,
        investedValue: data.investedValue,
        timestamp: data.timestamp?.toDate(),
      };
    })
    .reverse();
}
