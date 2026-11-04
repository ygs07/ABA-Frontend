'use client';

import { PageHeader } from '@/components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { approvePayout, getPayout, processPayout, rejectPayout } from '@/features/payouts/api';
import { Badge } from '@/components/ui/badge';
import { AmountText } from '@/components/patterns/AmountText';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

export default function PayoutDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const { data, isLoading } = useQuery({
    queryKey: ['payout', id],
    queryFn: () => getPayout(id)
  });
  const queryClient = useQueryClient();
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['payout', id] });
    await queryClient.invalidateQueries({ queryKey: ['payouts'] });
  };
  const approveMutation = useMutation({ mutationFn: () => approvePayout(id), onSuccess: async () => { toast.success('Payout approved'); await refresh(); }, onError: (error) => toast.error(error instanceof Error ? error.message : 'Unable to approve payout') });
  const processMutation = useMutation({ mutationFn: () => processPayout(id), onSuccess: async () => { toast.success('Transfer submitted to Paystack'); await refresh(); }, onError: (error) => toast.error(error instanceof Error ? error.message : 'Unable to process payout') });
  const rejectMutation = useMutation({ mutationFn: (reason: string) => rejectPayout(id, reason), onSuccess: async () => { toast.success('Payout rejected and funds restored'); await refresh(); }, onError: (error) => toast.error(error instanceof Error ? error.message : 'Unable to reject payout') });

  const reject = () => {
    const reason = window.prompt('Why is this payout being rejected?');
    if (reason?.trim()) rejectMutation.mutate(reason.trim());
  };

  if (isLoading) return <div>Loading...</div>;
  if (!data?.data) return <div>Payout not found</div>;

  const payout = data.data;

  return (
    <div className="space-y-6 pb-20 mx-auto max-w-5xl">
      <PageHeader 
        title={`Payout ${payout.payoutNumber}`} 
        description={`Requested by ${payout.payeeName} on ${new Date(payout.requestedDate).toLocaleDateString()}`}
        backHref="/erp/payouts"
        action={
          <div className="flex gap-2">
            {payout.status === 'Pending' && <Button variant="outline" onClick={reject} disabled={rejectMutation.isPending} className="text-error border-error-muted hover:bg-error-light hover:text-error">Reject</Button>}
            {payout.status === 'Pending' && <Button variant="primary" onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}>Approve Payout</Button>}
            {payout.status === 'Approved' && <Button variant="primary" onClick={() => processMutation.mutate()} disabled={processMutation.isPending}>Process Transfer</Button>}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
            <h3 className="font-bold text-lg border-b border-border pb-2">Payout Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-text-muted">Source</p>
                <p className="font-medium">{payout.source}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Status</p>
                <Badge variant="outline">{payout.status}</Badge>
              </div>
            </div>

            <div className="bg-surface-2 p-4 rounded-lg border border-border space-y-2">
              <div className="flex justify-between">
                <span className="text-text-muted text-sm">Amount Requested</span>
                <span className="font-medium"><AmountText amountInKobo={payout.amount} /></span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted text-sm">Processing Fee</span>
                <span className="font-medium text-error">-<AmountText amountInKobo={payout.fee} /></span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 mt-2 font-bold">
                <span>Net Transfer</span>
                <span className="text-success-dark"><AmountText amountInKobo={payout.netAmount} /></span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
            <h3 className="font-bold text-lg border-b border-border pb-2">Destination</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-text-muted">Bank Name</p>
                <p className="font-medium">{payout.destinationBank}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Account Number</p>
                <p className="font-mono">{payout.destinationAccount}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Account Name Matching</p>
                <div className="flex items-center gap-2 text-success-dark">
                  <span className="text-lg">✓</span>
                  <span className="text-sm font-medium">Matches Payee Name</span>
                </div>
              </div>
            </div>
          </div>
          
          {payout.batchId && (
            <div className="bg-surface rounded-xl border border-border p-6 space-y-2">
              <h3 className="font-bold text-lg">Batch Information</h3>
              <p className="text-sm text-text-muted">This payout is part of a batch.</p>
              <Button variant="outline" className="w-full mt-2">View Batch {payout.batchId}</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
