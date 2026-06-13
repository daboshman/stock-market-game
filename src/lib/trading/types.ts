export type TradeType = 'BUY' | 'SELL';

export interface TradeRequest {
  symbol: string;
  type: TradeType;
  quantity: number;
}

export interface TradeResult {
  transactionId: string;
  newCashBalance: number;
  executionPrice: number;
  totalValue: number;
}

export class TradeError extends Error {
  constructor(
    message: string,
    public code: 'INSUFFICIENT_FUNDS' | 'INSUFFICIENT_SHARES' | 'INVALID_QUANTITY' | 'NO_HOLDING' | 'QUOTE_FAILED'
  ) {
    super(message);
    this.name = 'TradeError';
  }
}
