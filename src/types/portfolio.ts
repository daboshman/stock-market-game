export interface Portfolio {
  cashBalance: number;
  totalInvested: number;
  startingBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Holding {
  symbol: string;
  quantity: number;
  averageCost: number;
  totalCost: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  type: 'BUY' | 'SELL';
  symbol: string;
  quantity: number;
  price: number;
  totalValue: number;
  timestamp: Date;
}

export interface WatchlistItem {
  symbol: string;
  addedAt: Date;
}

export interface PortfolioSnapshot {
  id: string;
  totalValue: number;
  cashBalance: number;
  investedValue: number;
  timestamp: Date;
}
