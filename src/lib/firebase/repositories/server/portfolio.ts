import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../admin';
import { Portfolio } from '@/types/portfolio';

export async function getPortfolioServer(userId: string): Promise<Portfolio | null> {
  const snap = await adminDb.doc(`portfolios/${userId}`).get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  return {
    cashBalance: data.cashBalance,
    totalInvested: data.totalInvested,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  };
}

export async function createPortfolioIfNotExistsServer(userId: string) {
  const ref = adminDb.doc(`portfolios/${userId}`);
  const snap = await ref.get();
  if (snap.exists) return;

  const startingBalance = Number(process.env.DEFAULT_STARTING_BALANCE ?? 100000);

  await ref.set({
    cashBalance: startingBalance,
    totalInvested: 0,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}
