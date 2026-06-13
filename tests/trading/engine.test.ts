import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TradeError } from '@/lib/trading/types';

// ---- Mocks (hoisted before imports that use them) ----

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    serverTimestamp: () => ({ _serverTimestamp: true }),
  },
}));

type DocData = Record<string, unknown> | null;

interface FakeRef { path: string }

function makeMockDb(initial: Record<string, DocData>) {
  const state: Record<string, DocData> = { ...initial };

  const makeRef = (path: string): FakeRef => ({ path });

  return {
    doc: makeRef,
    collection: (col: string) => ({
      doc: () => makeRef(`${col}/generated-tx-id`),
    }),
    runTransaction: async (fn: (tx: unknown) => Promise<void>) => {
      const tx = {
        get: (ref: FakeRef) =>
          Promise.resolve({
            exists: ref.path in state && state[ref.path] !== null,
            data: () => state[ref.path],
          }),
        update: (ref: FakeRef, data: DocData) => {
          state[ref.path] = { ...state[ref.path], ...data };
        },
        set: (ref: FakeRef, data: DocData, _opts?: unknown) => {
          state[ref.path] = data;
        },
        create: (ref: FakeRef, data: DocData) => {
          state[ref.path] = data;
        },
        delete: (ref: FakeRef) => {
          state[ref.path] = null;
        },
      };
      await fn(tx);
    },
    _state: state,
  };
}

const mockDbRef = { current: makeMockDb({}) };

vi.mock('@/lib/firebase/admin', () => ({
  getAdminDb: () => mockDbRef.current,
}));

// ---- Import under test (after mocks are registered) ----
import { executeBuy, executeSell } from '@/lib/trading/engine';

// ---- Helpers ----

const USER = 'user-1';
const SYMBOL = 'AAPL';
const portfolioPath = `portfolios/${USER}`;
const holdingPath = `portfolios/${USER}/holdings/${SYMBOL}`;

function portfolio(cashBalance: number, totalInvested = 0): DocData {
  return { cashBalance, totalInvested };
}

function holding(quantity: number, averageCost: number): DocData {
  return {
    symbol: SYMBOL,
    quantity,
    averageCost,
    totalCost: quantity * averageCost,
  };
}

function freshDb(
  portfolioData: DocData,
  holdingData: DocData = null
): ReturnType<typeof makeMockDb> {
  return makeMockDb({
    [portfolioPath]: portfolioData,
    [holdingPath]: holdingData,
  });
}

// ---- Buy tests ----

describe('executeBuy', () => {
  it('deducts cash and creates a new holding', async () => {
    mockDbRef.current = freshDb(portfolio(10000));
    const result = await executeBuy(USER, SYMBOL, 10, 100);

    expect(result.newCashBalance).toBe(9000);
    expect(result.newTotalInvested).toBe(1000);
    expect(result.executionPrice).toBe(100);
    expect(result.totalValue).toBe(1000);

    const db = mockDbRef.current._state;
    expect(db[holdingPath]).toMatchObject({ quantity: 10, averageCost: 100 });
  });

  it('updates avg cost and quantity when adding to existing holding', async () => {
    // Existing: 10 shares @ $100, buying 10 more @ $120 → avg = $110
    mockDbRef.current = freshDb(portfolio(10000, 1000), holding(10, 100));
    const result = await executeBuy(USER, SYMBOL, 10, 120);

    expect(result.newTotalInvested).toBe(2200);
    const db = mockDbRef.current._state;
    expect(db[holdingPath]).toMatchObject({ quantity: 20, averageCost: 110 });
  });

  it('throws INSUFFICIENT_FUNDS when cash is too low', async () => {
    mockDbRef.current = freshDb(portfolio(50)); // only $50, trying to buy 10 @ $100
    await expect(executeBuy(USER, SYMBOL, 10, 100)).rejects.toThrow(TradeError);
    await expect(executeBuy(USER, SYMBOL, 10, 100)).rejects.toMatchObject({
      code: 'INSUFFICIENT_FUNDS',
    });
  });

  it('throws INSUFFICIENT_FUNDS when portfolio does not exist', async () => {
    mockDbRef.current = makeMockDb({}); // no portfolio doc
    await expect(executeBuy(USER, SYMBOL, 10, 100)).rejects.toMatchObject({
      code: 'INSUFFICIENT_FUNDS',
    });
  });

  it('creates a transaction record', async () => {
    mockDbRef.current = freshDb(portfolio(10000));
    await executeBuy(USER, SYMBOL, 5, 200);

    const txPath = `portfolios/${USER}/transactions/generated-tx-id`;
    const db = mockDbRef.current._state;
    expect(db[txPath]).toMatchObject({ type: 'BUY', symbol: SYMBOL, quantity: 5, price: 200 });
  });
});

// ---- Sell tests ----

describe('executeSell', () => {
  it('adds proceeds to cash and reduces holding quantity', async () => {
    mockDbRef.current = freshDb(portfolio(1000, 1000), holding(10, 100));
    const result = await executeSell(USER, SYMBOL, 5, 120);

    expect(result.newCashBalance).toBe(1600);
    expect(result.totalValue).toBe(600);

    const db = mockDbRef.current._state;
    expect(db[holdingPath]).toMatchObject({ quantity: 5 });
  });

  it('removes holding doc entirely when selling all shares', async () => {
    mockDbRef.current = freshDb(portfolio(1000, 500), holding(5, 100));
    await executeSell(USER, SYMBOL, 5, 100);

    const db = mockDbRef.current._state;
    expect(db[holdingPath]).toBeNull();
  });

  it('throws INSUFFICIENT_SHARES when trying to sell more than owned', async () => {
    mockDbRef.current = freshDb(portfolio(1000, 1000), holding(5, 100));
    await expect(executeSell(USER, SYMBOL, 10, 100)).rejects.toThrow(TradeError);
    await expect(executeSell(USER, SYMBOL, 10, 100)).rejects.toMatchObject({
      code: 'INSUFFICIENT_SHARES',
    });
  });

  it('throws NO_HOLDING when the user does not own the stock', async () => {
    mockDbRef.current = freshDb(portfolio(1000)); // no holding
    await expect(executeSell(USER, SYMBOL, 5, 100)).rejects.toMatchObject({
      code: 'NO_HOLDING',
    });
  });

  it('reduces totalInvested by cost basis of shares sold', async () => {
    // 10 shares @ avg $100 = $1000 invested. Sell 4 → reduce by 4*100 = $400
    mockDbRef.current = freshDb(portfolio(0, 1000), holding(10, 100));
    const result = await executeSell(USER, SYMBOL, 4, 110);

    expect(result.newTotalInvested).toBe(600);
  });

  it('creates a SELL transaction record', async () => {
    mockDbRef.current = freshDb(portfolio(500, 500), holding(5, 100));
    await executeSell(USER, SYMBOL, 2, 110);

    const txPath = `portfolios/${USER}/transactions/generated-tx-id`;
    expect(mockDbRef.current._state[txPath]).toMatchObject({
      type: 'SELL',
      symbol: SYMBOL,
      quantity: 2,
      price: 110,
    });
  });
});
