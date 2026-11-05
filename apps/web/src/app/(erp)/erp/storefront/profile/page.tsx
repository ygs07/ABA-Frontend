'use client';

import { ChangeEvent, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

type MerchantProfile = {
  id: number;
  business_name: string;
  avatar: { id: number; url: string; original_name: string } | null;
  banner: { id: number; url: string; original_name: string } | null;
};

type MediaScope = 'merchant_avatar' | 'merchant_banner';

export default function MerchantStorefrontProfilePage() {
  const queryClient = useQueryClient();
  const { data: merchant, isLoading } = useQuery({
    queryKey: ['merchant-storefront-profile'],
    queryFn: () => fetchApi<MerchantProfile>('/api/v1/merchants/me'),
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const upload = async (scope: MediaScope, file: File) => {
    const formData = new FormData();
    formData.append('scope', scope);
    formData.append('file', file);
    await fetchApi('/api/v1/merchants/me/storefront-media', { method: 'POST', body: formData });
  };

  const save = async () => {
    if (!logo && !banner) return toast.message('Choose a logo or banner image first.');
    setIsSaving(true);
    try {
      await Promise.all([
        logo ? upload('merchant_avatar', logo) : Promise.resolve(),
        banner ? upload('merchant_banner', banner) : Promise.resolve(),
      ]);
      setLogo(null);
      setBanner(null);
      await queryClient.invalidateQueries({ queryKey: ['merchant-storefront-profile'] });
      toast.success('Storefront media updated.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update storefront media.');
    } finally {
      setIsSaving(false);
    }
  };

  const chooseFile = (setter: (file: File | null) => void) => (event: ChangeEvent<HTMLInputElement>) => {
    setter(event.target.files?.[0] ?? null);
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-brand-600" /></div>;

  return <div className="mx-auto max-w-5xl space-y-6 pb-20">
    <PageHeader title="Storefront Profile" description="Update the logo and banner displayed on your public storefront." />
    <div className="rounded-xl border border-border bg-surface p-6">
      <h2 className="text-lg font-semibold">{merchant?.business_name}</h2>
      <p className="mt-1 text-sm text-text-muted">PNG, JPEG, or WebP images up to 10 MB. Replacing an image removes the previous file from storage.</p>
      <div className="mt-6 grid gap-6 md:grid-cols-[180px_1fr]">
        <label className="block"><span className="mb-2 block text-sm font-medium">Store logo</span><div className="flex aspect-square w-44 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-surface-2">{logo || merchant?.avatar ? <img src={logo ? URL.createObjectURL(logo) : merchant!.avatar!.url} alt="Store logo" className="h-full w-full object-cover" /> : <ImagePlus className="h-7 w-7 text-text-muted" />}</div><input type="file" accept="image/png,image/jpeg,image/webp" className="mt-3 block w-full text-sm" onChange={chooseFile(setLogo)} /></label>
        <label className="block"><span className="mb-2 block text-sm font-medium">Storefront banner</span><div className="flex aspect-[3/1] w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-surface-2">{banner || merchant?.banner ? <img src={banner ? URL.createObjectURL(banner) : merchant!.banner!.url} alt="Storefront banner" className="h-full w-full object-cover" /> : <ImagePlus className="h-7 w-7 text-text-muted" />}</div><input type="file" accept="image/png,image/jpeg,image/webp" className="mt-3 block w-full text-sm" onChange={chooseFile(setBanner)} /></label>
      </div>
      <div className="mt-6 border-t border-border pt-5"><Button onClick={() => void save()} disabled={isSaving}>{isSaving ? 'Saving…' : 'Save storefront media'}</Button></div>
    </div>
  </div>;
}
