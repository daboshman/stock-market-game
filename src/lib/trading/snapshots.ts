import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase/admin';

const MIN_INTERVAL_MS = 60_000;

export async function maybeWriteSnapshot(
  userId: string,
  data: { cashBalance: number; investedValue: number; totalValue: number }
) {
  const db = getAdminDb();
  const ref = db.collection(`portfolios/${userId}/snapshots`);

  const last = await ref.orderBy('timestamp', 'desc').limit(1).get();
  if (!last.empty) {
    const ts = last.docs[0].data().timestamp?.toMillis?.();
    if (ts && Date.now() - ts < MIN_INTERVAL_MS) return;
  }

  await ref.add({ ...data, timestamp: FieldValue.serverTimestamp() });
}
