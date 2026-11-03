'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/patterns/PageHeader';
import { DataTable } from '@/components/patterns/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AmountText } from '@/components/patterns/AmountText';
import { getOrders } from '@/features/sales/api/sales.api';
import { Order } from '@/features/sales/types';
import { toast } from 'sonner';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter(o => 
    o.orderNumber.toLowerCase().includes(search.toLowerCase()) || 
    o.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { 
      accessorKey: 'orderNumber', 
      header: 'Order #',
      cell: (info: any) => (
        <Link href={`/erp/orders/${info.row.original.id}`} className="font-mono font-medium text-sm text-primary hover:underline">
          {info.getValue()}
        </Link>
      )
    },
    { 
      accessorKey: 'createdAt', 
      header: 'Date',
      cell: (info: any) => {
        const d = new Date(info.getValue());
        return <span className="text-sm">{d.toLocaleDateString()}</span>;
      }
    },
    { 
      accessorKey: 'customerName', 
      header: 'Customer',
      cell: (info: any) => <span className="font-medium text-sm">{info.getValue()}</span>
    },
    { 
      accessorKey: 'channel', 
      header: 'Channel',
      cell: (info: any) => <span className="text-sm text-text-muted">{info.getValue()}</span>
    },
    { 
      accessorKey: 'totalAmount', 
      header: 'Total',
      cell: (info: any) => <span className="text-sm font-medium"><AmountText amountInKobo={info.getValue()} /></span>
    },
    { 
      accessorKey: 'paymentStatus', 
      header: 'Payment',
      cell: (info: any) => {
        const status = info.getValue() as string;
        let color = 'bg-surface-2 text-text-muted border-border';
        if (status === 'Paid') color = 'bg-success-bg text-success border-success-border';
        if (status === 'Unpaid') color = 'bg-error-bg text-error border-error-border';
        if (status === 'Partially Paid') color = 'bg-warning-bg text-warning-dark border-warning-border';
        return <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${color}`}>{status}</span>;
      }
    },
    { 
      accessorKey: 'fulfilmentStatus', 
      header: 'Fulfilment',
      cell: (info: any) => {
        const status = info.getValue() as string;
        let color = 'bg-surface-2 text-text-muted border-border';
        if (status === 'Fulfilled') color = 'bg-success-bg text-success border-success-border';
        if (status === 'Unfulfilled') color = 'bg-warning-bg text-warning-dark border-warning-border';
        return <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${color}`}>{status}</span>;
      }
    },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: (info: any) => {
        const status = info.getValue() as string;
        let color = 'bg-surface-2 text-text-muted border-border';
        if (status === 'Completed') color = 'bg-success-bg text-success border-success-border';
        if (status === 'Pending' || status === 'Processing' || status === 'Ready') color = 'bg-primary/10 text-primary border-primary/20';
        if (status === 'Cancelled') color = 'bg-error-bg text-error border-error-border';
        
        return <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${color}`}>{status}</span>;
      }
    },
    {
      id: 'actions',
      header: '',
      cell: (info: any) => {
        return (
          <div className="flex justify-end gap-1">
            <Link href={`/erp/orders/${info.row.original.id}`}>
              <Button variant="ghost" size="sm" className="text-xs">View</Button>
            </Link>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      <PageHeader 
        title="Orders" 
        description="Manage customer orders across all channels."
        action={
          <div className="flex gap-2">
            <Button variant="outline">Export</Button>
            <Link href="/erp/orders/new">
              <Button>New Order</Button>
            </Link>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full max-w-md">
          <Input 
            placeholder="Search order number or customer..." 
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
          data={filtered} 
          columns={columns} 
          isLoading={isLoading}
          emptyMessage="No orders found."
        />
      </div>
    </div>
  );
}
