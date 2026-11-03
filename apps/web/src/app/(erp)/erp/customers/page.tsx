'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/patterns/PageHeader';
import { DataTable } from '@/components/patterns/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KpiCard } from '@/components/patterns/KpiCard';
import { AmountText } from '@/components/patterns/AmountText';
import {
  CustomerOverview,
  getCustomerOverview,
  getCustomers,
} from '@/features/customers/api/customers.api';
import { Customer } from '@/features/customers/types';
import { toast } from 'sonner';

export default function CustomersListPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [overview, setOverview] = useState<CustomerOverview | null>(null);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const [data, customerOverview] = await Promise.all([
        getCustomers(),
        getCustomerOverview(),
      ]);
      setCustomers(data);
      setOverview(customerOverview);
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.firstName.toLowerCase().includes(search.toLowerCase()) || 
    c.lastName.toLowerCase().includes(search.toLowerCase()) ||
    c.customerNo.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const columns = [
    { 
      accessorKey: 'customer', 
      header: 'Customer',
      cell: (info: any) => {
        const c = info.row.original as Customer;
        const name = c.type === 'Business' ? c.companyName : `${c.firstName} ${c.lastName}`;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-xs">
              {c.firstName.substring(0, 1).toUpperCase()}{c.lastName.substring(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{name}</div>
              <div className="text-text-muted text-xs">{c.customerNo}</div>
            </div>
          </div>
        );
      }
    },
    { 
      accessorKey: 'phone', 
      header: 'Phone / Email',
      cell: (info: any) => {
        const c = info.row.original as Customer;
        return (
          <div>
            <div className="font-medium">{c.phone}</div>
            {c.email && <div className="text-text-muted text-xs">{c.email}</div>}
          </div>
        );
      }
    },
    { 
      accessorKey: 'ordersCount', 
      header: 'Orders',
      cell: (info: any) => <span className="font-medium">{info.getValue()}</span>
    },
    { 
      accessorKey: 'totalSpent', 
      header: 'Total Spent',
      cell: (info: any) => <AmountText amountInKobo={info.getValue()} className="font-medium" />
    },
    { 
      accessorKey: 'walletBalance', 
      header: 'Wallet',
      cell: (info: any) => <AmountText amountInKobo={info.getValue()} className="font-medium text-success" />
    },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: (info: any) => {
        const status = info.getValue() as string;
        const color = status === 'Active' ? 'bg-success-bg text-success border-success-border' : 'bg-error-bg text-error border-error-border';
        return <span className={`px-2 py-0.5 rounded text-xs font-medium border ${color}`}>{status}</span>;
      }
    },
    {
      id: 'actions',
      header: '',
      cell: (info: any) => {
        const c = info.row.original as Customer;
        return (
          <div className="flex justify-end">
            <Link href={`/erp/customers/${c.id}`}>
              <Button variant="ghost" size="sm">View</Button>
            </Link>
          </div>
        );
      }
    }
  ];

  const kpis = [
    { label: 'Total Customers', value: overview?.totalCustomers.toLocaleString() ?? '—' },
    { label: 'New This Month', value: overview ? `+${overview.newCustomersThisMonth.toLocaleString()}` : '—' },
    { label: 'Active (90d)', value: overview?.activeCustomersLast90Days.toLocaleString() ?? '—' },
    { label: 'With Referrals', value: overview?.customersWithReferrals.toLocaleString() ?? '—' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Customers" 
        description="Manage your buyers, their orders, and referrals."
        action={
          <Link href="/erp/customers/new">
            <Button>Add Customer</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <KpiCard key={kpi.label} title={kpi.label} value={kpi.value} />
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="w-full max-w-md">
          <Input 
            placeholder="Search by name, phone, or customer no..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Filters</Button>
          <Button variant="outline">Export</Button>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <DataTable 
          data={filteredCustomers} 
          columns={columns} 
          isLoading={isLoading}
          emptyMessage="No customers found."
        />
      </div>
    </div>
  );
}
