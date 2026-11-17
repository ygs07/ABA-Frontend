'use client';

import React, { useDeferredValue, useMemo, useState } from 'react';
import Link from 'next/link';
import { Package, Search, Filter, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getCustomerOrders } from '@/features/portal/api';
import { AmountText } from '@/components/patterns/AmountText';
import { Alert } from '@/components/ui/alert';

export default function PortalOrdersPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const deferredSearch = useDeferredValue(search);
  const serverStatus = tab === 'completed' ? 4 : tab === 'cancelled' ? 5 : undefined;
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['portal_orders', deferredSearch, serverStatus, startDate, endDate],
    queryFn: async () => {
      const res = await getCustomerOrders({ search: deferredSearch, status: serverStatus, startDate, endDate });
      return res.data;
    }
  });

  const visibleOrders = useMemo(() => {
    if (tab !== 'active') return orders ?? [];
    return (orders ?? []).filter((order) => ['Pending', 'Processing', 'Shipped'].includes(order.status));
  }, [orders, tab]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing': return 'bg-warning-light text-warning-dark border-warning-border';
      case 'Shipped': return 'bg-brand-50 text-brand-700 border-brand-200';
      case 'Delivered': return 'bg-success-bg text-success-dark border-success-border';
      case 'Cancelled': return 'bg-error-50 text-error-dark border-error-border';
      default: return 'bg-surface-2 text-text-muted border-border';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error || !orders) {
    return (
      <Alert variant="destructive">
        Failed to load orders. Please try again.
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text">Order History</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10 pl-9 pr-3 rounded-md border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-64"
            />
          </div>
          <Button variant="outline" className="px-3" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen} aria-label="Filter orders">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {filtersOpen && <div className="flex flex-col gap-3 rounded-lg border border-border bg-white p-4 sm:flex-row sm:items-end">
        <label className="text-sm font-medium text-text">From<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-1 block h-10 rounded-md border border-border px-3 text-sm" /></label>
        <label className="text-sm font-medium text-text">To<input type="date" value={endDate} min={startDate || undefined} onChange={(event) => setEndDate(event.target.value)} className="mt-1 block h-10 rounded-md border border-border px-3 text-sm" /></label>
        {(startDate || endDate) && <Button type="button" variant="ghost" onClick={() => { setStartDate(''); setEndDate(''); }}>Clear dates</Button>}
      </div>}

      <div className="flex space-x-6 border-b border-border mb-6">
        {([['all', 'All Orders'], ['active', 'Active'], ['completed', 'Completed'], ['cancelled', 'Cancelled']] as const).map(([value, label]) => <button key={value} onClick={() => setTab(value)} className={`pb-2 border-b-2 font-medium text-sm ${tab === value ? 'border-brand-600 text-brand-600' : 'border-transparent text-text-muted hover:text-text'}`}>{label}</button>)}
      </div>

      <div className="space-y-4">
        {visibleOrders.length === 0 ? (
          <div className="text-center py-12 text-text-muted">You have no orders yet.</div>
        ) : (
          visibleOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-border shadow-sm overflow-hidden hover:border-brand-300 transition-colors">
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 overflow-hidden bg-surface-2 rounded-lg flex items-center justify-center shrink-0">
                    {order.items[0]?.imageUrl ? (
                      <img src={order.items[0].imageUrl} alt={order.items[0].imageOriginalName || order.items[0].productName} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-text-muted" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-text">{order.id}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted">
                      {new Date(order.date).toLocaleDateString()} • {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • Sold by <span className="text-brand-600">Merchant</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full border-t sm:border-t-0 border-border pt-4 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-text-muted mb-0.5">Order Total</p>
                    <p className="font-bold text-text text-lg"><AmountText amountInKobo={order.total} /></p>
                  </div>
                  <Link href={`/portal/orders/${order.id}`}>
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                      View Details
                    </Button>
                    <Button variant="ghost" size="sm" className="sm:hidden p-0 h-auto">
                      <ChevronRight className="w-5 h-5 text-text-muted" />
                    </Button>
                  </Link>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
