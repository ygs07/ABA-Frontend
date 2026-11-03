'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Eye, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/patterns/PageHeader';
import { fetchApi } from '@/lib/api';

type OnboardingApplication = {
  id: number;
  business_name: string;
  business_type: string;
  owner_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  bank_name: string;
  account_number: string;
  product_description: string;
  capacity: string;
  sample_photos_count: number;
  status: number;
  rejection_reason: string | null;
  submitted_at: string;
};

type ApplicationsResponse = { data: OnboardingApplication[] };

const statusLabel: Record<number, string> = {
  1: 'Submitted',
  2: 'Under review',
  3: 'Approved',
  4: 'Rejected',
};

export default function MerchantOnboardingApplicationsPage() {
  const [applications, setApplications] = useState<OnboardingApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<OnboardingApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchApi<ApplicationsResponse>('/api/v1/merchant-onboarding/applications?limit=100');
      setApplications(response.data ?? []);
    } catch {
      toast.error('Unable to load merchant onboarding applications.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const reviewApplication = async (status: 2 | 3 | 4) => {
    if (!selectedApplication) return;
    if (status === 4 && !rejectionReason.trim()) {
      toast.error('Provide a reason before rejecting this application.');
      return;
    }

    setIsReviewing(true);
    try {
      await fetchApi(`/api/v1/merchant-onboarding/applications/${selectedApplication.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          ...(status === 4 ? { rejectionReason: rejectionReason.trim() } : {}),
        }),
      });
      toast.success(`Application ${statusLabel[status].toLowerCase()}.`);
      setSelectedApplication(null);
      setRejectionReason('');
      await loadApplications();
    } catch {
      toast.error('Unable to update this application.');
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Merchant Onboarding Applications"
        description="Review submitted seller verification applications."
        action={<Link href="/erp/merchants"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Merchants</Button></Link>}
      />

      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        {isLoading ? (
          <div className="flex min-h-56 items-center justify-center text-text-muted"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Loading applications…</div>
        ) : applications.length === 0 ? (
          <div className="min-h-56 p-8 text-center text-sm text-text-muted">No onboarding applications have been submitted.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-1 text-xs uppercase tracking-wide text-text-muted">
                <tr><th className="px-5 py-3">Business</th><th className="px-5 py-3">Owner</th><th className="px-5 py-3">Submitted</th><th className="px-5 py-3">Status</th><th className="px-5 py-3" /></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td className="px-5 py-4"><p className="font-medium text-text">{application.business_name}</p><p className="text-xs text-text-muted">{application.business_type}</p></td>
                    <td className="px-5 py-4"><p>{application.owner_name}</p><p className="text-xs text-text-muted">{application.email}</p></td>
                    <td className="px-5 py-4 text-text-muted">{new Date(application.submitted_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4"><span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium">{statusLabel[application.status] ?? 'Unknown'}</span></td>
                    <td className="px-5 py-4 text-right"><Button size="sm" variant="outline" onClick={() => setSelectedApplication(application)}><Eye className="mr-1.5 h-4 w-4" />Review</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-label="Review merchant onboarding application">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-lg font-bold">{selectedApplication.business_name}</h2><p className="text-sm text-text-muted">{selectedApplication.owner_name} · {selectedApplication.email}</p></div><Button size="sm" variant="ghost" onClick={() => setSelectedApplication(null)}>Close</Button></div>
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <Detail label="Business type" value={selectedApplication.business_type} /><Detail label="Location" value={`${selectedApplication.address}, ${selectedApplication.city}, ${selectedApplication.state}`} />
              <Detail label="Bank account" value={`${selectedApplication.bank_name} · ${selectedApplication.account_number}`} /><Detail label="Monthly capacity" value={selectedApplication.capacity} />
              <Detail label="Product description" value={selectedApplication.product_description} /><Detail label="Sample photos" value={`${selectedApplication.sample_photos_count} selected`} />
            </div>
            {selectedApplication.status !== 3 && selectedApplication.status !== 4 && (
              <div className="mt-6 border-t border-border pt-5"><textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} placeholder="Rejection reason (required only when rejecting)" className="mb-3 min-h-20 w-full rounded-lg border border-border p-3 text-sm outline-none focus:border-brand-500" />
                <div className="flex flex-wrap gap-2"><Button variant="outline" disabled={isReviewing} onClick={() => void reviewApplication(2)}>Mark under review</Button><Button disabled={isReviewing} onClick={() => void reviewApplication(3)}><CheckCircle2 className="mr-1.5 h-4 w-4" />Approve</Button><Button variant="destructive" disabled={isReviewing} onClick={() => void reviewApplication(4)}><XCircle className="mr-1.5 h-4 w-4" />Reject</Button></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-surface-1 p-3"><p className="mb-1 text-xs font-medium text-text-muted">{label}</p><p className="text-text">{value}</p></div>;
}
