export type TradeType = 'BUY' | 'SELL';

export interface TradeRequest {
  userId: string;
  symbol: string;
  type: TradeType;
  quantity: number;
  price: number;
}

export interface TradeResult {
  success: boolean;
  transactionId: string;
  newCashBalance: number;
  message: string;
}

export interface TradeValidationError {
  code: 'INSUFFICIENT_FUNDS' | 'INSUFFICIENT_SHARES' | 'INVALID_QUANTITY' | 'MARKET_CLOSED';
  message: string;
}
