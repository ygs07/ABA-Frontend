'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/patterns/PageHeader';
import { fetchApi } from '@/lib/api';

type Profile = { id: number; status: number; submitted_at?: string; user?: { first_name: string; last_name: string; email: string } };
const labels: Record<number, string> = { 1: 'Pending', 2: 'Under review', 3: 'Approved', 4: 'Rejected' };

export default function KycReviewPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); try { const result = await fetchApi<{ data: Profile[] }>('/api/v1/kyc/profiles?limit=100'); setProfiles(result.data ?? []); } catch { toast.error('Unable to load KYC submissions.'); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  return <div className="space-y-6"><PageHeader title="KYC Reviews" description="Review customer identity and address submissions."/><div className="overflow-hidden rounded-xl border border-border bg-white">{loading ? <div className="flex h-56 items-center justify-center"><Loader2 className="animate-spin text-brand-600"/></div> : <table className="w-full text-sm"><thead className="bg-surface-1 text-left text-xs text-text-muted"><tr><th className="p-4">Applicant</th><th className="p-4">Submitted</th><th className="p-4">Status</th><th/></tr></thead><tbody>{profiles.map(profile => <tr key={profile.id} className="border-t border-border"><td className="p-4"><p className="font-medium">{profile.user?.first_name} {profile.user?.last_name}</p><p className="text-xs text-text-muted">{profile.user?.email}</p></td><td className="p-4">{profile.submitted_at ? new Date(profile.submitted_at).toLocaleDateString() : '—'}</td><td className="p-4">{labels[profile.status] ?? 'Unknown'}</td><td className="p-4 text-right"><Link href={`/erp/kyc/${profile.id}`}><Button size="sm" variant="outline"><Eye className="mr-1 h-4 w-4"/>Review</Button></Link></td></tr>)}</tbody></table>}</div></div>;
}
