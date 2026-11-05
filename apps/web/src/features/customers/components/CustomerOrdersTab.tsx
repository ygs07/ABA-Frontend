import { Customer } from '../types';
import { AmountText } from '@/components/patterns/AmountText';

interface Props {
  customer: Customer;
}

export function CustomerOrdersTab({ customer }: Props) {
  const orders = customer.orders ?? [];

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border bg-surface-2/30">
        <h3 className="font-medium">Order History</h3>
      </div>
      
      {orders.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-text-muted text-sm mb-4">No orders found for this customer.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-surface-2 text-text-muted">
              <tr>
                <th className="px-6 py-3 font-medium">Order #</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Items</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Paid</th>
                <th className="px-6 py-3 font-medium">Balance</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map(order => {
                const paid = order.payments.filter((payment) => payment.status === 'successful').reduce((total, payment) => total + payment.amount, 0);
                return <tr key={order.id} className="hover:bg-surface-2/50 cursor-pointer">
                  <td className="px-6 py-4 font-mono font-medium text-primary">{order.orderNumber}</td>
                  <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{order.itemCount}</td>
                  <td className="px-6 py-4"><AmountText amountInKobo={order.total} /></td>
                  <td className="px-6 py-4"><AmountText amountInKobo={paid} /></td>
                  <td className="px-6 py-4 text-error"><AmountText amountInKobo={Math.max(0, order.total - paid)} /></td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded text-xs border border-border bg-surface-2">
                      {String(order.status)}
                    </span>
                  </td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
