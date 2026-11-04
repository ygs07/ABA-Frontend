'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCommissionKPIs, releaseEligibleCommissions } from '@/features/commissions/api';
import { PageHeader } from '@/components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { KpiCard } from '@/components/patterns/KpiCard';
import { AmountText } from '@/components/patterns/AmountText';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/store';

export default function CommissionsDashboardPage() {
  const queryClient = useQueryClient();
  const canManageCommissions = useAuthStore((state) =>
    state.user?.userType === 'Admin' || state.user?.userType === 'Super Admin',
  );
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['commission-kpis'],
    queryFn: () => getCommissionKPIs()
  });
  const releaseEligibleMutation = useMutation({
    mutationFn: releaseEligibleCommissions,
    onSuccess: () => {
      toast.success('Eligible commissions released');
      void queryClient.invalidateQueries({ queryKey: ['commission-kpis'] });
      void queryClient.invalidateQueries({ queryKey: ['commission-records'] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Unable to release eligible commissions'),
  });

  return (
    <div className="space-y-6 pb-20 mx-auto">
      <PageHeader 
        title="Commissions" 
        description="Track referral commissions across the network."
        action={
          <div className="flex gap-2">
            <Link href="/erp/commissions/records">
              <Button variant="outline">All Records</Button>
            </Link>
            <Link href="/erp/commissions/approvals">
              <Button>Pending Approvals</Button>
            </Link>
            {canManageCommissions && <Button variant="outline" loading={releaseEligibleMutation.isPending} onClick={() => releaseEligibleMutation.mutate()}>
              Release Eligible
            </Button>}
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard 
          title="Generated (Period)" 
          value={isLoading ? '...' : <AmountText amountInKobo={kpis?.generatedPeriod || 0} />} 
          className="text-success" 
        />
        <KpiCard 
          title="Pending Approval" 
          value={isLoading ? '...' : <AmountText amountInKobo={kpis?.pendingApproval || 0} />} 
          className="text-warning-dark"
        />
        <KpiCard 
          title="Approved (Unpaid)" 
          value={isLoading ? '...' : <AmountText amountInKobo={kpis?.approvedUnpaid || 0} />} 
          className="text-brand-500" 
        />
        <KpiCard 
          title="Paid (Period)" 
          value={isLoading ? '...' : <AmountText amountInKobo={kpis?.paidPeriod || 0} />} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-bold mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/erp/commissions/rules" className="p-4 rounded-xl border border-border bg-surface-2 hover:border-brand-500 transition-colors flex flex-col items-center justify-center text-center gap-2">
              <span className="text-2xl">⚙️</span>
              <span className="font-medium text-sm">Rules & Plans</span>
            </Link>
            <Link href="/erp/commissions/simulator" className="p-4 rounded-xl border border-border bg-surface-2 hover:border-brand-500 transition-colors flex flex-col items-center justify-center text-center gap-2">
              <span className="text-2xl">🧪</span>
              <span className="font-medium text-sm">Rule Simulator</span>
            </Link>
            <Link href="/erp/commissions/reversals" className="p-4 rounded-xl border border-border bg-surface-2 hover:border-brand-500 transition-colors flex flex-col items-center justify-center text-center gap-2">
              <span className="text-2xl">↩️</span>
              <span className="font-medium text-sm">Reversals</span>
            </Link>
            <Link href="/erp/payouts" className="p-4 rounded-xl border border-border bg-surface-2 hover:border-brand-500 transition-colors flex flex-col items-center justify-center text-center gap-2">
              <span className="text-2xl">💸</span>
              <span className="font-medium text-sm">Go to Payouts</span>
            </Link>
          </div>
        </div>
        
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-bold mb-4">Liability Snapshot</h2>
          <p className="text-sm text-text-muted mb-4">Current total outstanding commission liability matching the general ledger.</p>
          <div className="text-3xl font-bold">
            {isLoading ? '...' : <AmountText amountInKobo={kpis?.outstandingLiability || 0} />}
          </div>
        </div>
      </div>
    </div>
  );
}
