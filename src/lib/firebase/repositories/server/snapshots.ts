import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../admin';
import { PortfolioSnapshot } from '@/types/portfolio';

export async function getSnapshotsServer(
  userId: string,
  count = 30
): Promise<PortfolioSnapshot[]> {
  const snap = await adminDb
    .collection(`portfolios/${userId}/snapshots`)
    .orderBy('timestamp', 'desc')
    .limit(count)
    .get();

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

export async function addSnapshotServer(
  userId: string,
  snapshot: Omit<PortfolioSnapshot, 'id' | 'timestamp'>
) {
  await adminDb.collection(`portfolios/${userId}/snapshots`).add({
    ...snapshot,
    timestamp: FieldValue.serverTimestamp(),
  });
}
