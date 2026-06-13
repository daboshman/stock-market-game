'use client';

import { useState } from 'react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useHoldings } from '@/hooks/useHoldings';
import { useExecuteTrade } from '@/hooks/useExecuteTrade';
import { useStockQuote } from '@/hooks/useStockQuote';
import { TradeConfirmModal } from './TradeConfirmModal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { TradeType } from '@/lib/trading/types';

interface TradeFormProps {
  symbol: string;
  defaultType?: TradeType;
  onClose: () => void;
  onSuccess?: (newCashBalance: number) => void;
}

export function TradeForm({ symbol, defaultType = 'BUY', onClose, onSuccess }: TradeFormProps) {
  const [tradeType, setTradeType] = useState<TradeType>(defaultType);
  const [quantity, setQuantity] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: quote, isLoading: quoteLoading } = useStockQuote(symbol);
  const { data: portfolio } = usePortfolio();
  const { data: holdings } = useHoldings();
  const { mutate: executeTrade, isPending } = useExecuteTrade();

  const currentHolding = holdings?.find((h) => h.symbol === symbol);
  const qty = parseInt(quantity, 10);
  const price = quote?.price ?? 0;
  const total = isNaN(qty) || qty <= 0 ? 0 : qty * price;

  const maxBuyQty = price > 0 && portfolio ? Math.floor(portfolio.cashBalance / price) : 0;
  const maxSellQty = currentHolding?.quantity ?? 0;

  const buyError =
    tradeType === 'BUY' && !isNaN(qty) && qty > 0 && portfolio && total > portfolio.cashBalance
      ? `Insufficient funds (max ${maxBuyQty} shares)`
      : null;

  const sellError =
    tradeType === 'SELL' && !isNaN(qty) && qty > 0 && qty > maxSellQty
      ? `You only hold ${maxSellQty} share${maxSellQty !== 1 ? 's' : ''}`
      : null;

  const canSubmit =
    !isNaN(qty) &&
    qty > 0 &&
    price > 0 &&
    !buyError &&
    !sellError &&
    !(tradeType === 'SELL' && maxSellQty === 0);

  function handleSubmit() {
    setErrorMsg(null);
    setShowConfirm(true);
  }

  function handleConfirm() {
    executeTrade(
      { symbol, type: tradeType, quantity: qty },
      {
        onSuccess: (result) => {
          setShowConfirm(false);
          setSuccessMsg(
            `${tradeType === 'BUY' ? 'Bought' : 'Sold'} ${qty} share${qty !== 1 ? 's' : ''} of ${symbol} at ${formatCurrency(result.executionPrice)}`
          );
          setQuantity('');
          onSuccess?.(result.newCashBalance);
        },
        onError: (err) => {
          setShowConfirm(false);
          setErrorMsg(err.message);
        },
      }
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white">Trade {symbol}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              ✕
            </button>
          </div>

          {/* BUY / SELL tabs */}
          <div className="flex rounded-xl overflow-hidden border border-white/8 mb-5">
            {(['BUY', 'SELL'] as TradeType[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTradeType(t); setErrorMsg(null); setSuccessMsg(null); }}
                className={cn(
                  'flex-1 py-2 text-sm font-semibold transition-colors',
                  tradeType === t
                    ? t === 'BUY'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {quoteLoading && (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          )}

          {quote && (
            <>
              <div className="bg-white/4 rounded-xl p-3 mb-4 flex items-center justify-between text-sm">
                <span className="text-gray-400">Current Price</span>
                <span className="text-white font-semibold">{formatCurrency(price)}</span>
              </div>

              {tradeType === 'BUY' && portfolio && (
                <p className="text-xs text-gray-500 mb-3">
                  Available: {formatCurrency(portfolio.cashBalance)} · Max {maxBuyQty} shares
                </p>
              )}
              {tradeType === 'SELL' && (
                <p className="text-xs text-gray-500 mb-3">
                  {maxSellQty > 0
                    ? `Holding: ${maxSellQty} share${maxSellQty !== 1 ? 's' : ''}`
                    : `You don't hold any ${symbol}`}
                </p>
              )}

              <div className="mb-4">
                <label className="text-xs text-gray-400 mb-1 block">Shares</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => { setQuantity(e.target.value); setErrorMsg(null); setSuccessMsg(null); }}
                  placeholder="0"
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {total > 0 && (
                <div className="bg-white/4 rounded-xl p-3 mb-4 flex items-center justify-between text-sm">
                  <span className="text-gray-400">Est. Total</span>
                  <span className="text-white font-semibold">{formatCurrency(total)}</span>
                </div>
              )}

              {(buyError || sellError || errorMsg) && (
                <p className="text-sm text-red-400 mb-3">{buyError ?? sellError ?? errorMsg}</p>
              )}

              {successMsg && (
                <p className="text-sm text-emerald-400 mb-3">{successMsg}</p>
              )}

              <Button
                className="w-full"
                variant={tradeType === 'BUY' ? 'primary' : 'danger'}
                size="lg"
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                Review {tradeType === 'BUY' ? 'Buy' : 'Sell'} Order
              </Button>
            </>
          )}
        </div>
      </div>

      {showConfirm && quote && (
        <TradeConfirmModal
          symbol={symbol}
          type={tradeType}
          quantity={qty}
          price={price}
          loading={isPending}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
