import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../admin';
import { Holding } from '@/types/portfolio';

export async function getHoldingsServer(userId: string): Promise<Holding[]> {
  const snap = await adminDb.collection(`portfolios/${userId}/holdings`).get();
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

export async function getHoldingServer(userId: string, symbol: string): Promise<Holding | null> {
  const snap = await adminDb.doc(`portfolios/${userId}/holdings/${symbol}`).get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  return {
    symbol,
    quantity: data.quantity,
    averageCost: data.averageCost,
    totalCost: data.totalCost,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  };
}
