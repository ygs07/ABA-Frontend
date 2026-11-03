'use client';

import { FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Package, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiError, fetchApi } from '@/lib/api';

type TrackingResult = {
  orderNumber: string;
  status: string;
  deliveryMethod: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
};

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('orderNumber') ?? '');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const trackOrder = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);
    try {
      const result = await fetchApi<TrackingResult>(
        `/api/v1/orders/track/${encodeURIComponent(orderNumber)}?email=${encodeURIComponent(email)}`,
      );
      setResult(result);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : 'We could not find that order.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface-1 py-24">
      <section className="mx-auto w-full max-w-xl px-4">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Package className="h-5 w-5" /></div>
            <div><h1 className="text-2xl font-bold text-text">Track your order</h1><p className="text-sm text-text-muted">Enter your order number and purchase email.</p></div>
          </div>
          <form onSubmit={trackOrder} className="space-y-4">
            <div><label className="mb-1.5 block text-sm font-medium">Order number</label><Input value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder="ORD-..." required /></div>
            <div><label className="mb-1.5 block text-sm font-medium">Email used for the order</label><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></div>
            {errorMessage && <p role="alert" className="rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error">{errorMessage}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Tracking order…' : <><Search className="mr-2 h-4 w-4" />Track order</>}</Button>
          </form>
          {result && <div className="mt-6 space-y-3 rounded-xl border border-border bg-surface-2 p-4 text-sm"><div className="flex justify-between"><span className="text-text-muted">Order</span><span className="font-mono font-medium">{result.orderNumber}</span></div><div className="flex justify-between"><span className="text-text-muted">Status</span><span className="font-semibold capitalize">{result.status.replaceAll('_', ' ')}</span></div><div className="flex justify-between"><span className="text-text-muted">Delivery</span><span className="capitalize">{result.deliveryMethod}</span></div><div className="flex justify-between"><span className="text-text-muted">Items</span><span>{result.itemCount}</span></div><div className="flex justify-between"><span className="text-text-muted">Last updated</span><span>{new Date(result.updatedAt).toLocaleString()}</span></div></div>}
        </div>
      </section>
    </main>
  );
}
