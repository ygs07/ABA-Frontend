'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, FileText, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/patterns/PageHeader';
import { fetchApi } from '@/lib/api';

type KycProfile = {
  id: number;
  status: number;
  date_of_birth?: string;
  nationality?: string;
  residential_address?: string;
  city?: string;
  state?: string;
  lga?: string;
  submitted_at?: string;
  rejection_reason?: string;
  user?: { first_name: string; last_name: string; email: string; phone?: string };
  documents: Array<{ id: number; document_type: string; media: { id: number; url: string; original_name: string } }>;
  reviews: Array<{ id: number; status: number; comment?: string; createdAt: string; reviewer?: { first_name: string; last_name: string } }>;
};

const statusLabels: Record<number, string> = { 1: 'Pending', 2: 'Under review', 3: 'Approved', 4: 'Rejected' };

export default function KycDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [kyc, setKyc] = useState<KycProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadKyc = useCallback(async () => {
    setIsLoading(true);
    try {
      setKyc(await fetchApi<KycProfile>(`/api/v1/kyc/profiles/${id}`));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load KYC profile.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { void loadKyc(); }, [loadKyc]);

  const reviewProfile = async (status: 3 | 4) => {
    const comment = rejectionReason.trim();
    if (status === 4 && !comment) {
      toast.error('A rejection reason is required.');
      return;
    }
    setIsReviewing(true);
    try {
      await fetchApi(`/api/v1/kyc/profiles/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...(status === 4 ? { comment } : {}) }),
      });
      toast.success(status === 3 ? 'KYC profile approved.' : 'KYC profile rejected.');
      setIsRejecting(false);
      setRejectionReason('');
      await loadKyc();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to review KYC profile.');
    } finally {
      setIsReviewing(false);
    }
  };

  if (isLoading || !kyc) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-brand-600" /></div>;
  const canReview = kyc.status === 2;

  return <div className="space-y-6">
    <PageHeader title={`KYC #${kyc.id}`} description={`${kyc.user?.first_name ?? ''} ${kyc.user?.last_name ?? ''} · ${kyc.user?.email ?? ''}`} action={<Link href="/erp/kyc"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button></Link>} />
    <div className="grid gap-5 md:grid-cols-2">
      <section className="rounded-xl border border-border bg-white p-5"><h2 className="mb-4 font-bold">Identity</h2><p>Name: {kyc.user?.first_name} {kyc.user?.last_name}</p><p>Email: {kyc.user?.email}</p><p>Phone: {kyc.user?.phone ?? '—'}</p><p>DOB: {kyc.date_of_birth ?? '—'}</p><p>Nationality: {kyc.nationality ?? '—'}</p></section>
      <section className="rounded-xl border border-border bg-white p-5"><h2 className="mb-4 font-bold">Address & status</h2><p>{kyc.residential_address ?? '—'}</p><p>{kyc.city ?? '—'}, {kyc.state ?? '—'} {kyc.lga ?? ''}</p><p className="mt-3">Status: {statusLabels[kyc.status] ?? 'Unknown'}</p><p>Submitted: {kyc.submitted_at ? new Date(kyc.submitted_at).toLocaleString() : '—'}</p><p>Rejection reason: {kyc.rejection_reason ?? '—'}</p></section>
    </div>
    <section className="rounded-xl border border-border bg-white p-5"><h2 className="mb-4 font-bold">Documents</h2><div className="grid gap-3 sm:grid-cols-2">{kyc.documents.map((document) => <a key={document.id} href={document.media.url} target="_blank" rel="noreferrer" className="flex gap-3 rounded border border-border p-3"><FileText className="text-brand-600" /><span>{document.media.original_name} · document type {document.document_type}</span></a>)}</div></section>
    {canReview && <section className="rounded-xl border border-border bg-white p-5"><h2 className="mb-2 font-bold">Review decision</h2><p className="mb-4 text-sm text-text-muted">Approve this submission or reject it with a reason visible to the applicant.</p>{isRejecting && <textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} placeholder="Explain why this KYC submission is being rejected" className="mb-3 min-h-24 w-full rounded-lg border border-border p-3 text-sm outline-none focus:border-brand-500" maxLength={3000} />}<div className="flex flex-wrap gap-2"><Button disabled={isReviewing} onClick={() => void reviewProfile(3)}><CheckCircle2 className="mr-1.5 h-4 w-4" />Approve</Button>{isRejecting ? <><Button variant="destructive" disabled={isReviewing} onClick={() => void reviewProfile(4)}><XCircle className="mr-1.5 h-4 w-4" />Confirm rejection</Button><Button variant="outline" disabled={isReviewing} onClick={() => setIsRejecting(false)}>Cancel</Button></> : <Button variant="destructive" disabled={isReviewing} onClick={() => setIsRejecting(true)}><XCircle className="mr-1.5 h-4 w-4" />Reject</Button>}</div></section>}
    <section className="rounded-xl border border-border bg-white p-5"><h2 className="mb-4 font-bold">Review history</h2>{kyc.reviews.length ? kyc.reviews.map((review) => <p key={review.id} className="border-b py-3">{review.reviewer?.first_name} {review.reviewer?.last_name}: {review.comment || 'No comment'} ({new Date(review.createdAt).toLocaleString()})</p>) : <p className="text-sm text-text-muted">No review decisions yet.</p>}</section>
  </div>;
}
