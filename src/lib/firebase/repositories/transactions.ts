import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
} from 'firebase/firestore';
import { getFirebaseDb } from '../client';
import { Transaction } from '@/types/portfolio';

export async function getTransactions(
  userId: string,
  pageSize = 20,
  cursor?: DocumentSnapshot
): Promise<{ transactions: Transaction[]; lastDoc: DocumentSnapshot | null }> {
  let q = query(
    collection(getFirebaseDb(), 'portfolios', userId, 'transactions'),
    orderBy('timestamp', 'desc'),
    limit(pageSize)
  );
  if (cursor) q = query(q, startAfter(cursor));

  const snap = await getDocs(q);
  const transactions = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      type: data.type as 'BUY' | 'SELL',
      symbol: data.symbol,
      quantity: data.quantity,
      price: data.price,
      totalValue: data.totalValue,
      timestamp: data.timestamp?.toDate(),
    };
  });

  return {
    transactions,
    lastDoc: snap.docs[snap.docs.length - 1] ?? null,
  };
}
