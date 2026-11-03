
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/patterns/PageHeader';
import { KpiCard } from '@/components/patterns/KpiCard';
import { ShoppingCart, DollarSign, Package, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardRange, getDashboardData } from '../api/dashboard.api';

const formatNaira = (amount: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
  }).format(amount);

export function DashboardView() {
  const [range, setRange] = useState<DashboardRange>('last_7_days');
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', range],
    queryFn: () => getDashboardData(range),
  });

  const value = (number?: number) =>
    isLoading || number === undefined ? '—' : number.toLocaleString();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, here is what's happening today.`}
        action={
          <select
            value={range}
            onChange={(event) => setRange(event.target.value as DashboardRange)}
            className="h-9 px-3 py-1 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="today">Today</option>
            <option value="last_7_days">Last 7 days</option>
            <option value="last_30_days">Last 30 days</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        }
      />

      {isError && (
        <p className="rounded-lg border border-error-border bg-error-bg px-4 py-3 text-sm text-error">
          Dashboard data could not be loaded. Please refresh and try again.
        </p>
      )}

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Revenue"
          value={isLoading || !data ? '—' : formatNaira(data.sales.revenue)}
          supportingText={`${value(data?.sales.orderCount)} orders`}
          href="/erp/orders"
          icon={DollarSign}
        />
        <KpiCard
          title="Total Products"
          value={value(data?.products.total)}
          supportingText={`${value(data?.products.active)} active`}
          href="/erp/products"
          icon={Package}
        />
        <KpiCard
          title="Low Stock"
          value={value(data?.products.lowStock)}
          supportingText={`${value(data?.products.outOfStock)} out of stock`}
          href="/erp/inventory"
          icon={AlertTriangle}
        />
        <KpiCard
          title="Orders"
          value={value(data?.sales.orderCount)}
          supportingText={data ? `${data.scope === 'merchant' ? 'Merchant' : 'Organization'} scope` : undefined}
          href="/erp/orders"
          icon={ShoppingCart}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-border shadow-sm p-5 h-80 flex flex-col">
          <h3 className="font-semibold text-text mb-4">Revenue Over Time</h3>
          <div className="flex-1 flex items-end gap-2 text-brand-200">
            {data?.revenueSeries.length ? data.revenueSeries.map((entry) => {
              const maximumRevenue = Math.max(...data.revenueSeries.map((point) => point.revenue), 1);
              return (
                <div key={entry.date} className="flex-1 min-w-3 bg-brand-500 rounded-t-sm hover:bg-brand-600 transition-colors" title={`${entry.date}: ${formatNaira(entry.revenue)}`} style={{ height: `${Math.max((entry.revenue / maximumRevenue) * 100, 3)}%` }} />
              );
            }) : <p className="m-auto text-sm text-text-muted">No revenue in this period.</p>}
          </div>
          <div className="flex justify-between text-xs text-text-muted mt-2"><span>{data?.revenueSeries[0]?.date ?? ''}</span><span>{data?.revenueSeries.at(-1)?.date ?? ''}</span></div>
        </div>

        <div className="bg-white rounded-lg border border-border shadow-sm p-5 h-80 flex flex-col">
          <h3 className="font-semibold text-text mb-4">Sales by Category</h3>
          <div className="flex-1 space-y-3 overflow-y-auto">
            {data?.salesByCategory.length ? data.salesByCategory.map((category) => {
              const totalRevenue = data.salesByCategory.reduce((total, entry) => total + entry.revenue, 0) || 1;
              const percentage = (category.revenue / totalRevenue) * 100;
              return <div key={category.name}><div className="flex justify-between text-sm mb-1"><span>{category.name}</span><span className="font-medium">{formatNaira(category.revenue)}</span></div><div className="h-2 rounded bg-surface-2"><div className="h-2 rounded bg-brand-500" style={{ width: `${percentage}%` }} /></div></div>;
            }) : <p className="pt-16 text-center text-sm text-text-muted">No category sales in this period.</p>}
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="font-semibold text-text">Recent Orders</h3>
          <Link href="/erp/orders"><Button variant="outline" size="sm">View All</Button></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-1 text-text-muted text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-text">
              {isLoading ? <tr><td colSpan={5} className="px-4 py-8 text-center text-text-muted">Loading orders…</td></tr> : data?.recentOrders.length ? data.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-1">
                  <td className="px-4 py-3 font-medium"><Link href={`/erp/orders/${order.id}`} className="hover:text-brand-600">{order.orderNumber}</Link></td>
                  <td className="px-4 py-3">{order.customerName}</td>
                  <td className="px-4 py-3 text-text-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">{formatNaira(order.totalAmount)}</td>
                  <td className="px-4 py-3 text-center"><span className="inline-block px-2 py-1 bg-brand-50 text-brand-700 text-xs rounded-full font-medium capitalize">{order.status.replaceAll('_', ' ')}</span></td>
                </tr>
              )) : <tr><td colSpan={5} className="px-4 py-8 text-center text-text-muted">No orders in this period.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
