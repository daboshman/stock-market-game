import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

async function deleteCollection(userId: string, name: string) {
  const db = getAdminDb();
  const ref = db.collection(`portfolios/${userId}/${name}`);
  let snap = await ref.limit(400).get();
  while (!snap.empty) {
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    snap = await ref.limit(400).get();
  }
}

export async function POST(request: NextRequest) {
  const idToken = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let userId: string;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    userId = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const startingBalance = Number(process.env.DEFAULT_STARTING_BALANCE ?? 100000);

  try {
    await Promise.all([
      deleteCollection(userId, 'holdings'),
      deleteCollection(userId, 'transactions'),
      deleteCollection(userId, 'snapshots'),
      deleteCollection(userId, 'watchlist'),
    ]);

    await getAdminDb().doc(`portfolios/${userId}`).update({
      cashBalance: startingBalance,
      totalInvested: 0,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[portfolio/reset]', err);
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 });
  }
}
