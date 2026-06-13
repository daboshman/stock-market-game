import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase/admin';
import { calculateAverageCost } from './calculations';
import { TradeError, TradeResult } from './types';

export async function executeBuy(
  userId: string,
  symbol: string,
  quantity: number,
  price: number
): Promise<TradeResult> {
  const db = getAdminDb();
  const portfolioRef = db.doc(`portfolios/${userId}`);
  const holdingRef = db.doc(`portfolios/${userId}/holdings/${symbol}`);
  const txRef = db.collection(`portfolios/${userId}/transactions`).doc();

  let result!: TradeResult;

  await db.runTransaction(async (tx) => {
    const [portfolioSnap, holdingSnap] = await Promise.all([
      tx.get(portfolioRef),
      tx.get(holdingRef),
    ]);

    if (!portfolioSnap.exists) throw new TradeError('Portfolio not found', 'INSUFFICIENT_FUNDS');

    const portfolio = portfolioSnap.data()!;
    const totalCost = quantity * price;

    if (portfolio.cashBalance < totalCost) {
      throw new TradeError(
        `Insufficient funds. Need $${totalCost.toFixed(2)}, have $${portfolio.cashBalance.toFixed(2)}`,
        'INSUFFICIENT_FUNDS'
      );
    }

    const existing = holdingSnap.exists ? holdingSnap.data()! : null;
    const newQuantity = (existing?.quantity ?? 0) + quantity;
    const newAvgCost = existing
      ? calculateAverageCost(existing.quantity, existing.averageCost, quantity, price)
      : price;

    const newCashBalance = portfolio.cashBalance - totalCost;
    const newTotalInvested = (portfolio.totalInvested ?? 0) + totalCost;

    tx.update(portfolioRef, {
      cashBalance: newCashBalance,
      totalInvested: newTotalInvested,
      updatedAt: FieldValue.serverTimestamp(),
    });

    tx.set(holdingRef, {
      symbol,
      quantity: newQuantity,
      averageCost: newAvgCost,
      totalCost: newQuantity * newAvgCost,
      ...(existing ? {} : { createdAt: FieldValue.serverTimestamp() }),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    tx.create(txRef, {
      type: 'BUY',
      symbol,
      quantity,
      price,
      totalValue: totalCost,
      timestamp: FieldValue.serverTimestamp(),
    });

    result = { transactionId: txRef.id, newCashBalance, newTotalInvested, executionPrice: price, totalValue: totalCost };
  });

  return result;
}

export async function executeSell(
  userId: string,
  symbol: string,
  quantity: number,
  price: number
): Promise<TradeResult> {
  const db = getAdminDb();
  const portfolioRef = db.doc(`portfolios/${userId}`);
  const holdingRef = db.doc(`portfolios/${userId}/holdings/${symbol}`);
  const txRef = db.collection(`portfolios/${userId}/transactions`).doc();

  let result!: TradeResult;

  await db.runTransaction(async (tx) => {
    const [portfolioSnap, holdingSnap] = await Promise.all([
      tx.get(portfolioRef),
      tx.get(holdingRef),
    ]);

    if (!portfolioSnap.exists) throw new TradeError('Portfolio not found', 'NO_HOLDING');
    if (!holdingSnap.exists) throw new TradeError(`You don't hold any ${symbol}`, 'NO_HOLDING');

    const portfolio = portfolioSnap.data()!;
    const holding = holdingSnap.data()!;

    if (holding.quantity < quantity) {
      throw new TradeError(
        `Insufficient shares. Have ${holding.quantity}, trying to sell ${quantity}`,
        'INSUFFICIENT_SHARES'
      );
    }

    const totalValue = quantity * price;
    const newCashBalance = portfolio.cashBalance + totalValue;
    const costBasisSold = quantity * holding.averageCost;
    const newTotalInvested = Math.max(0, (portfolio.totalInvested ?? 0) - costBasisSold);

    tx.update(portfolioRef, {
      cashBalance: newCashBalance,
      totalInvested: newTotalInvested,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const newQuantity = holding.quantity - quantity;
    if (newQuantity === 0) {
      tx.delete(holdingRef);
    } else {
      tx.update(holdingRef, {
        quantity: newQuantity,
        totalCost: newQuantity * holding.averageCost,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    tx.create(txRef, {
      type: 'SELL',
      symbol,
      quantity,
      price,
      totalValue,
      timestamp: FieldValue.serverTimestamp(),
    });

    result = { transactionId: txRef.id, newCashBalance, newTotalInvested, executionPrice: price, totalValue };
  });

  return result;
}
