export function calculateAverageCost(
  existingQty: number,
  existingAvgCost: number,
  addedQty: number,
  addedPrice: number
): number {
  const totalCost = existingQty * existingAvgCost + addedQty * addedPrice;
  return totalCost / (existingQty + addedQty);
}

export function calculateUnrealizedPL(
  quantity: number,
  averageCost: number,
  currentPrice: number
): { amount: number; percent: number } {
  const amount = quantity * (currentPrice - averageCost);
  const percent = averageCost > 0 ? ((currentPrice - averageCost) / averageCost) * 100 : 0;
  return { amount, percent };
}

export function calculateMarketValue(quantity: number, currentPrice: number): number {
  return quantity * currentPrice;
}

export function calculateAllocationPercent(holdingValue: number, totalPortfolioValue: number): number {
  if (totalPortfolioValue <= 0) return 0;
  return (holdingValue / totalPortfolioValue) * 100;
}
