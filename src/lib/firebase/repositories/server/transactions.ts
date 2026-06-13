import { getAdminDb } from '../../admin';
import { Transaction } from '@/types/portfolio';

export async function getTransactionsServer(
  userId: string,
  pageSize = 20
): Promise<Transaction[]> {
  const snap = await getAdminDb()
    .collection(`portfolios/${userId}/transactions`)
    .orderBy('timestamp', 'desc')
    .limit(pageSize)
    .get();

  return snap.docs.map((d) => {
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
}
