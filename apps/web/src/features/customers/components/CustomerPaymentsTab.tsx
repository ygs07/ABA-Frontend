import { Customer } from '../types';
import { AmountText } from '@/components/patterns/AmountText';

interface Props {
  customer: Customer;
}

export function CustomerPaymentsTab({ customer }: Props) {
  const payments = (customer.orders ?? []).flatMap((order) =>
    order.payments.map((payment) => ({ ...payment, orderNumber: order.orderNumber })),
  );

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border bg-surface-2/30">
        <h3 className="font-medium">Payment History</h3>
      </div>
      
      {payments.length === 0 ? (
        <div className="p-12 text-center text-sm text-text-muted">
          No payments found for this customer.
        </div>
      ) : <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-surface-2 text-text-muted">
            <tr>
              <th className="px-6 py-3 font-medium">Ref</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Method</th>
              <th className="px-6 py-3 font-medium">Amount</th>
              <th className="px-6 py-3 font-medium">Order</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.map(payment => (
              <tr key={payment.id} className="hover:bg-surface-2/50 cursor-pointer">
                <td className="px-6 py-4 font-mono text-text-muted">{payment.reference}</td>
                <td className="px-6 py-4">{new Date(payment.paidAt ?? payment.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 capitalize">{payment.method?.replaceAll('_', ' ') ?? '—'}</td>
                <td className="px-6 py-4 font-medium"><AmountText amountInKobo={payment.amount} /></td>
                <td className="px-6 py-4 font-mono text-primary">{payment.orderNumber}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded text-xs border border-border bg-surface-2 capitalize">
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
    </div>
  );
}
