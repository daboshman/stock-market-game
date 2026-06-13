'use client';

import { TradeType } from '@/lib/trading/types';
import { formatCurrency } from '@/lib/utils/format';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

interface TradeConfirmModalProps {
  symbol: string;
  type: TradeType;
  quantity: number;
  price: number;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function TradeConfirmModal({
  symbol,
  type,
  quantity,
  price,
  loading,
  onConfirm,
  onCancel,
}: TradeConfirmModalProps) {
  const total = quantity * price;
  const isBuy = type === 'BUY';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Confirm {type}</h2>

        <div className="space-y-3 mb-6">
          <Row label="Symbol" value={symbol} />
          <Row label="Action" value={type} highlight={isBuy ? 'green' : 'red'} />
          <Row label="Quantity" value={`${quantity} share${quantity !== 1 ? 's' : ''}`} />
          <Row label="Est. Price" value={formatCurrency(price)} />
          <div className="border-t border-white/8 pt-3">
            <Row
              label="Est. Total"
              value={`${isBuy ? '-' : '+'}${formatCurrency(total)}`}
              highlight={isBuy ? 'red' : 'green'}
              bold
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-5">
          Execution price may differ slightly from the estimate. This is a simulated trade only.
        </p>

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={isBuy ? 'primary' : 'danger'}
            className="flex-1"
            onClick={onConfirm}
            loading={loading}
          >
            {isBuy ? 'Buy' : 'Sell'} {symbol}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
  bold,
}: {
  label: string;
  value: string;
  highlight?: 'green' | 'red';
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span
        className={cn(
          bold ? 'font-semibold' : 'font-medium',
          highlight === 'green' ? 'text-emerald-400' : highlight === 'red' ? 'text-red-400' : 'text-white'
        )}
      >
        {value}
      </span>
    </div>
  );
}
