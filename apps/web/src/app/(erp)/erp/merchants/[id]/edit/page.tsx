'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/patterns/PageHeader';
import { getMerchantById, updateMerchant } from '@/features/merchant/api';
import { Merchant } from '@/features/merchants/types';
import { toast } from 'sonner';

export default function EditMerchantPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { void getMerchantById(id).then((result) => setMerchant(result.data)).catch(() => { toast.error('Merchant not found.'); router.replace('/erp/merchants'); }); }, [id, router]);
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!merchant) return;
    setSaving(true);
    try { await updateMerchant(id, merchant); toast.success('Merchant updated.'); router.push(`/erp/merchants/${id}`); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to update merchant.'); }
    finally { setSaving(false); }
  }
  if (!merchant) return <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-brand-600" /></div>;
  const set = (key: keyof Merchant, value: string) => setMerchant((current) => current ? { ...current, [key]: value } : current);
  return <div className="max-w-3xl space-y-6 pb-20"><PageHeader title="Edit Merchant" description="Update the merchant store profile." backHref={`/erp/merchants/${id}`} /><form onSubmit={save} className="grid gap-5 rounded-xl border border-border bg-surface p-6 md:grid-cols-2"><label className="text-sm font-medium">Business name<Input className="mt-1" value={merchant.name} onChange={(event) => set('name', event.target.value)} required /></label><label className="text-sm font-medium">Owner name<Input className="mt-1" value={merchant.ownerName} onChange={(event) => set('ownerName', event.target.value)} required /></label><label className="text-sm font-medium">Email<Input className="mt-1" type="email" value={merchant.email} onChange={(event) => set('email', event.target.value)} required /></label><label className="text-sm font-medium">Phone<Input className="mt-1" value={merchant.phone} onChange={(event) => set('phone', event.target.value)} required /></label><label className="text-sm font-medium md:col-span-2">Address<Input className="mt-1" value={merchant.address} onChange={(event) => set('address', event.target.value)} required /></label><label className="text-sm font-medium">City<Input className="mt-1" value={merchant.city} onChange={(event) => set('city', event.target.value)} /></label><label className="text-sm font-medium">State<Input className="mt-1" value={merchant.state} onChange={(event) => set('state', event.target.value)} /></label><div className="flex gap-3 md:col-span-2"><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button></div></form></div>;
}
