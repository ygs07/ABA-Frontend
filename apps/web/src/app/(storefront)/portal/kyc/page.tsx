'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/lib/api';
import { useAuthStore } from '@/features/auth/store';

type KycDocument = {
  id: number;
  document_type: number;
  document_reference?: string | null;
  media: { id: number; url: string; original_name: string };
};

type KycProfile = {
  id: number;
  status: number;
  date_of_birth?: string | null;
  nationality?: string | null;
  residential_address?: string | null;
  city?: string | null;
  state?: string | null;
  lga?: string | null;
  submitted_at?: string | null;
  rejection_reason?: string | null;
  documents: KycDocument[];
};

type KycForm = {
  dateOfBirth: string;
  nationality: string;
  residentialAddress: string;
  city: string;
  state: string;
  lga: string;
};

const statusLabels: Record<number, string> = { 1: 'Draft', 2: 'Under review', 3: 'Approved', 4: 'Rejected' };
const documentLabels: Record<number, string> = { 1: 'National ID', 2: 'International passport', 3: "Driver's license", 4: 'Proof of address', 5: 'Business registration' };

function profileToForm(profile?: KycProfile | null): KycForm {
  return {
    dateOfBirth: profile?.date_of_birth ?? '',
    nationality: profile?.nationality ?? '',
    residentialAddress: profile?.residential_address ?? '',
    city: profile?.city ?? '',
    state: profile?.state ?? '',
    lga: profile?.lga ?? '',
  };
}

export default function PortalKycPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [profile, setProfile] = useState<KycProfile | null>(null);
  const [form, setForm] = useState<KycForm>(profileToForm());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const nextProfile = await fetchApi<KycProfile>('/api/v1/kyc/profile');
      setProfile(nextProfile);
      setForm(profileToForm(nextProfile));
    } catch (error) {
      if (!(error instanceof Error) || !error.message.toLowerCase().includes('not found')) {
        toast.error(error instanceof Error ? error.message : 'Unable to load KYC profile.');
      }
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) void loadProfile();
    else setIsLoading(false);
  }, [isAuthenticated]);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const savedProfile = await fetchApi<KycProfile>('/api/v1/kyc/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setProfile({ ...savedProfile, documents: profile?.documents ?? [] });
      toast.success('KYC profile saved.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save KYC profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const submitProfile = async () => {
    setIsSubmitting(true);
    try {
      await fetchApi('/api/v1/kyc/profile/submit', { method: 'POST' });
      toast.success('KYC profile submitted for review.');
      await loadProfile();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to submit KYC profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) return <div className="rounded-xl border border-border bg-white p-6">Please sign in to manage your KYC profile.</div>;
  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-brand-600" /></div>;

  const isEditable = !profile || profile.status === 1 || profile.status === 4;
  const allDetailsPresent = Object.values(form).slice(0, 5).every(Boolean);
  const canSubmit = Boolean(profile) && isEditable && allDetailsPresent && (profile?.documents.length ?? 0) > 0;

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold text-text">KYC Profile</h1><p className="mt-1 text-sm text-text-muted">Provide your identity and address details for account verification.</p></div>
    <section className="rounded-xl border border-border bg-white p-5"><div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-brand-600" /><div><p className="font-semibold">Verification status</p><p className="text-sm text-text-muted">{statusLabels[profile?.status ?? 1]}</p></div></div>{profile?.rejection_reason && <p className="mt-4 rounded-lg bg-error-50 p-3 text-sm text-error">Rejection reason: {profile.rejection_reason}</p>}</section>
    <form onSubmit={saveProfile} className="rounded-xl border border-border bg-white p-5"><h2 className="mb-4 font-bold">Personal and address details</h2><div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-medium">Date of birth<input type="date" value={form.dateOfBirth} disabled={!isEditable} onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })} className="mt-1 h-10 w-full rounded-md border border-border px-3 disabled:bg-surface-1" /></label><label className="text-sm font-medium">Nationality<input value={form.nationality} disabled={!isEditable} onChange={(event) => setForm({ ...form, nationality: event.target.value })} className="mt-1 h-10 w-full rounded-md border border-border px-3 disabled:bg-surface-1" /></label><label className="text-sm font-medium md:col-span-2">Residential address<input value={form.residentialAddress} disabled={!isEditable} onChange={(event) => setForm({ ...form, residentialAddress: event.target.value })} className="mt-1 h-10 w-full rounded-md border border-border px-3 disabled:bg-surface-1" /></label><label className="text-sm font-medium">City<input value={form.city} disabled={!isEditable} onChange={(event) => setForm({ ...form, city: event.target.value })} className="mt-1 h-10 w-full rounded-md border border-border px-3 disabled:bg-surface-1" /></label><label className="text-sm font-medium">State<input value={form.state} disabled={!isEditable} onChange={(event) => setForm({ ...form, state: event.target.value })} className="mt-1 h-10 w-full rounded-md border border-border px-3 disabled:bg-surface-1" /></label><label className="text-sm font-medium">LGA <span className="font-normal text-text-muted">(optional)</span><input value={form.lga} disabled={!isEditable} onChange={(event) => setForm({ ...form, lga: event.target.value })} className="mt-1 h-10 w-full rounded-md border border-border px-3 disabled:bg-surface-1" /></label></div>{isEditable && <div className="mt-5 flex flex-wrap gap-2"><Button type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save profile'}</Button><Button type="button" variant="outline" disabled={!canSubmit || isSubmitting} onClick={() => void submitProfile()}>{isSubmitting ? 'Submitting…' : 'Submit for review'}</Button></div>}</form>
    <section className="rounded-xl border border-border bg-white p-5"><div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="font-bold">KYC documents</h2><p className="text-sm text-text-muted">Documents are added through referral activation.</p></div>{isEditable && <Link href="/portal/referrals"><Button variant="outline">Add documents</Button></Link>}</div>{profile?.documents.length ? <div className="grid gap-3 sm:grid-cols-2">{profile.documents.map((document) => <a key={document.id} href={document.media.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-surface-1"><FileText className="h-5 w-5 text-brand-600" /><span><span className="block font-medium">{documentLabels[document.document_type] ?? 'Document'}</span><span className="block text-xs text-text-muted">{document.media.original_name}</span></span></a>)}</div> : <p className="text-sm text-text-muted">No documents uploaded yet.</p>}</section>
  </div>;
}
