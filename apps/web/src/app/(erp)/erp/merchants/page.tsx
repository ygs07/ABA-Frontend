'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/patterns/PageHeader';
import { DataTable } from '@/components/patterns/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AmountText } from '@/components/patterns/AmountText';
import { Merchant } from '@/features/merchants/types';
import { toast } from 'sonner';
import { getMerchants } from '@/features/merchant/api';

export default function MerchantsListPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchMerchants = async () => {
    setIsLoading(true);
    try {
      const data = await getMerchants();
      setMerchants(data?.data);
    } catch {
      toast.error('Failed to load merchants');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchMerchants();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredMerchants = merchants.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.merchantNo.toLowerCase().includes(search.toLowerCase()) ||
    m.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      accessorKey: 'merchant',
      header: 'Merchant',
      cell: (info: { row: { original: Merchant } }) => {
        const m = info.row.original as Merchant;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
              {m.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-medium line-clamp-1">{m.name}</div>
              <div className="text-text-muted text-xs">{m.merchantNo} • {m.type}</div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'owner',
      header: 'Owner / Contact',
      cell: (info: { row: { original: Merchant } }) => {
        const m = info.row.original as Merchant;
        return (
          <div>
            <div className="text-sm">{m.ownerName}</div>
            <div className="text-text-muted text-xs">{m.phone}</div>
          </div>
        );
      }
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: (info: { row: { original: Merchant } }) => {
        const m = info.row.original as Merchant;
        return <span className="text-sm">{m.address || '—'}</span>;
      }
    },
    {
      accessorKey: 'sales',
      header: 'Sales (30d)',
      cell: (info: { row: { original: Merchant } }) => {
        const m = info.row.original as Merchant;
        return (
          <div>
            <div className="text-sm font-medium"><AmountText amountInKobo={m.salesPeriod} /></div>
            <div className="text-text-muted text-xs">{m.ordersCount} orders</div>
          </div>
        );
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info: { getValue: () => unknown }) => {
        const status = info.getValue() as string;
        let color = 'bg-surface-2 text-text-muted border-border';
        if (status === 'Active') color = 'bg-success-bg text-success border-success-border';
        if (status === 'Pending') color = 'bg-warning-bg text-warning-dark border-warning-border';
        if (status === 'Suspended') color = 'bg-error-bg text-error border-error-border';

        return <span className={`px-2 py-0.5 rounded text-xs font-medium border ${color}`}>{status}</span>;
      }
    },
    {
      id: 'actions',
      header: '',
      cell: (info: { row: { original: Merchant } }) => {
        const m = info.row.original as Merchant;
        return (
          <div className="flex justify-end gap-1">
            <Link href={`/erp/merchants/${m.id}`}>
              <Button variant="ghost" size="sm">View</Button>
            </Link>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Merchants"
        description="Manage partner outlets, franchises, and their sales performance."
        action={
          <div className="flex gap-2">
            <Link href="/erp/merchants/onboarding-applications">
              <Button variant="outline">Onboarding Applications</Button>
            </Link>
            <Link href="/erp/merchants/new">
              <Button>Add Merchant</Button>
            </Link>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full max-w-md">
          <Input
            placeholder="Search by name, owner, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none">Filters</Button>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <DataTable
          data={filteredMerchants}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No merchants found."
        />
      </div>
    </div>
  );
}
