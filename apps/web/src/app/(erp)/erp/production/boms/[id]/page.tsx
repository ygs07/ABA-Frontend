'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { KpiCard } from '@/components/patterns/KpiCard';
import { AmountText } from '@/components/patterns/AmountText';
import { getBomById } from '@/features/production/api/production.api';
import { Bom } from '@/features/production/types';
import { toast } from 'sonner';

export default function BOMDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [bom, setBom] = useState<Bom | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBom = async () => {
      try {
        const res = await getBomById(id);
        setBom(res.data);
      } catch (err) {
        toast.error('BOM not found');
        router.push('/erp/production/boms');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBom();
  }, [id, router]);

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!bom) return null;

  const variant = bom.status === 'Active' ? 'success' : bom.status === 'Draft' ? 'warning' : 'neutral';

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title={bom.bomNumber}
        description={`Bill of Materials for ${bom.finishedProductName}`}
        action={
          <div className="flex gap-2 items-center">
            <span className="mr-2">
              {bom.status}
              {/* <StatusBadge status={bom.status} variant={variant as any} /> */}
            </span>
            {bom.status === 'Draft' && (
              <Button>Activate BOM</Button>
            )}
            <Button variant="outline">Edit</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Version" value={`v${bom.version}`} />
        <KpiCard title="Yield Quantity" value={`${bom.yieldQty} ${bom.yieldUnit}`} />
        <KpiCard title="Components" value={bom.components.length.toString()} />
        <KpiCard title="Standard Cost" value={<AmountText amountInKobo={bom.stdCost} />} />
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface-2 flex items-center justify-between">
          <h3 className="font-semibold">Component List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-2/50 text-text-muted border-b border-border">
              <tr>
                <th className="text-left font-medium p-4">Component</th>
                <th className="text-right font-medium p-4">Quantity</th>
                <th className="text-right font-medium p-4">Est. Unit Cost</th>
                <th className="text-right font-medium p-4">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {bom.components.map(comp => (
                <tr key={comp.id} className="border-b border-border/50 hover:bg-surface-2/30">
                  <td className="p-4">
                    <div className="font-medium">{comp.productName}</div>
                    <div className="text-xs text-text-muted">{comp.id}</div>
                  </td>
                  <td className="p-4 text-right">{comp.quantity} {comp.unit}</td>
                  <td className="p-4 text-right"><AmountText amountInKobo={comp.cost} /></td>
                  <td className="p-4 text-right"><AmountText amountInKobo={comp.cost * comp.quantity} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
