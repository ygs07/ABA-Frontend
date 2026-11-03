import { useEffect, useState } from 'react';
import { Order } from '../types';
import { AmountText } from '@/components/patterns/AmountText';
import { Button } from '@/components/ui/button';

interface OrderItemsTabProps {
  order: Order;
  onUpdateItem: (itemId: string, data: { quantity?: number; status?: number }) => Promise<void>;
}

const statusCodeByText: Record<string, number> = {
  pending: 1,
  processing: 2,
  shipped_or_ready_for_pickup: 3,
  complete: 4,
  cancelled: 5,
  refund_requested: 6,
};

export function OrderItemsTab({ order, onUpdateItem }: OrderItemsTabProps) {
  const [drafts, setDrafts] = useState<Record<string, { quantity: number; status: number }>>({});

  useEffect(() => {
    setDrafts(Object.fromEntries(order.lines.map((line) => [line.id, {
      quantity: line.quantity,
      status: statusCodeByText[line.status?.toLowerCase() ?? 'pending'] ?? 1,
    }])));
  }, [order]);

  const updateDraft = (lineId: string, changes: Partial<{ quantity: number; status: number }>) => {
    setDrafts((current) => ({ ...current, [lineId]: { ...current[lineId], ...changes } }));
  };

  const saveLine = async (line: Order['lines'][number]) => {
    const draft = drafts[line.id];
    const currentStatus = statusCodeByText[line.status?.toLowerCase() ?? 'pending'] ?? 1;
    await onUpdateItem(line.id, {
      ...(draft.quantity !== line.quantity ? { quantity: draft.quantity } : {}),
      ...(draft.status !== currentStatus ? { status: draft.status } : {}),
    });
  };

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap min-w-[800px]">
          <thead className="bg-surface-2 text-text-muted">
            <tr>
              <th className="px-6 py-3 font-medium">Product / SKU</th>
              <th className="px-6 py-3 font-medium text-center">Qty</th>
              <th className="px-6 py-3 font-medium text-right">Unit Price</th>
              <th className="px-6 py-3 font-medium text-right">Discount</th>
              <th className="px-6 py-3 font-medium text-right">Tax</th>
              <th className="px-6 py-3 font-medium text-right">Line Total</th>
              <th className="px-6 py-3 font-medium text-center">Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {order.lines.map(line => (
              <tr key={line.id}>
                <td className="px-6 py-4">
                  <p className="font-medium text-text">{line.productName}</p>
                  <p className="text-xs text-text-muted font-mono mt-0.5">{line.sku}</p>
                </td>
                <td className="px-6 py-4 text-center font-medium"><input type="number" min="1" value={drafts[line.id]?.quantity ?? line.quantity} onChange={(event) => updateDraft(line.id, { quantity: Number(event.target.value) })} className="h-8 w-16 rounded border border-border bg-surface px-2 text-center" /></td>
                <td className="px-6 py-4 text-right"><AmountText amountInKobo={line.unitPrice} /></td>
                <td className="px-6 py-4 text-right"><AmountText amountInKobo={line.discount} /></td>
                <td className="px-6 py-4 text-right"><AmountText amountInKobo={line.tax} /></td>
                <td className="px-6 py-4 text-right font-medium"><AmountText amountInKobo={line.lineTotal} /></td>
                <td className="px-6 py-4 text-center"><select value={drafts[line.id]?.status ?? 1} onChange={(event) => updateDraft(line.id, { status: Number(event.target.value) })} className="h-8 rounded border border-border bg-surface px-2 text-xs"><option value="1">Pending</option><option value="2">Processing</option><option value="3">Shipped / ready</option><option value="4">Complete</option><option value="5">Cancelled</option><option value="6">Refund requested</option></select></td>
                <td className="px-6 py-4 text-right"><Button size="sm" variant="outline" onClick={() => void saveLine(line)}>Save</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-surface-2 p-6 border-t border-border flex justify-end">
        <div className="w-full max-w-xs space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Subtotal</span>
            <span className="font-medium"><AmountText amountInKobo={order.subtotal} /></span>
          </div>
          {order.discountTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Order Discount</span>
              <span className="text-error font-medium">-<AmountText amountInKobo={order.discountTotal} /></span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Tax (VAT/Consumption)</span>
            <span className="font-medium"><AmountText amountInKobo={order.taxTotal} /></span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Delivery Fee</span>
            <span className="font-medium"><AmountText amountInKobo={order.deliveryFee} /></span>
          </div>
          <div className="flex justify-between items-center font-medium text-lg pt-4 border-t border-border">
            <span>Total</span>
            <span className="text-primary font-bold"><AmountText amountInKobo={order.totalAmount} /></span>
          </div>
        </div>
      </div>
    </div>
  );
}
