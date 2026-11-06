'use client';

import { useQuery } from '@tanstack/react-query';
import { AmountText } from '@/components/patterns/AmountText';
import { Badge } from '@/components/ui/badge';
import { getCommissionRecords } from '@/features/commissions/api';

export function OrderCommissionsTab({ orderId }: { orderId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['order-commissions', orderId],
    queryFn: () => getCommissionRecords(orderId),
  });

  if (isLoading) {
    return <div className="rounded-xl border border-border bg-surface p-6 text-sm text-text-muted">Loading commissions…</div>;
  }

  const commissions = data?.data ?? [];
  if (!commissions.length) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <h2 className="font-semibold text-text">No commissions recorded</h2>
        <p className="mt-1 text-sm text-text-muted">Commission records will appear here when this order qualifies under the active platform rule.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-semibold text-text">Commission entitlements</h2>
        <p className="mt-1 text-sm text-text-muted">Referral commissions created from this order.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-surface-2 text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Beneficiary</th>
              <th className="px-5 py-3 font-medium">Rule</th>
              <th className="px-5 py-3 font-medium">Level</th>
              <th className="px-5 py-3 font-medium">Rate</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {commissions.map((commission) => (
              <tr key={commission.id}>
                <td className="px-5 py-4 font-medium text-text">{commission.beneficiaryName}</td>
                <td className="px-5 py-4 text-text-muted">{commission.planName}</td>
                <td className="px-5 py-4 text-text-muted">Level {commission.level}</td>
                <td className="px-5 py-4 text-text-muted">{commission.rate}%</td>
                <td className="px-5 py-4 font-medium text-text"><AmountText amountInKobo={commission.amount} /></td>
                <td className="px-5 py-4"><Badge variant={commission.status === 'Released' ? 'default' : 'secondary'}>{commission.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
