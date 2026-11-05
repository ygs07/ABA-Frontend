'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCustomerById } from '@/features/customers/api/customers.api';
import { Customer } from '@/features/customers/types';
import { KpiCard } from '@/components/patterns/KpiCard';
import { AmountText } from '@/components/patterns/AmountText';
import { toast } from 'sonner';

import { CustomerOrdersTab } from '@/features/customers/components/CustomerOrdersTab';
import { CustomerPaymentsTab } from '@/features/customers/components/CustomerPaymentsTab';
import { CustomerAddressesTab } from '@/features/customers/components/CustomerAddressesTab';
import { CustomerActivityTab } from '@/features/customers/components/CustomerActivityTab';

const TABS = ['Overview', 'Orders', 'Payments', 'Addresses', 'Activity'];

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    getCustomerById(id)
      .then(setCustomer)
      .catch(() => {
        toast.error('Customer not found');
        router.push('/erp/customers');
      })
      .finally(() => setIsLoading(false));
  }, [id, router]);

  if (isLoading) {
    return <div className="p-8 text-center text-text-muted">Loading customer details...</div>;
  }

  if (!customer) return null;

  const name = customer.type === 'Business' ? customer.companyName : `${customer.firstName} ${customer.lastName}`;
  const statusColor = customer.status === 'Active' ? 'bg-success-bg text-success border-success-border' : 'bg-error-bg text-error border-error-border';

  // Calculate AOV safely
  const avgOrderValue = customer.ordersCount > 0 ? Math.floor(customer.totalSpent / customer.ordersCount) : 0;

  return (
    <div className="space-y-6 pb-20 pt-4">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">
            {customer.firstName.substring(0, 1).toUpperCase()}{customer.lastName.substring(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-h3">{name}</h1>
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusColor}`}>
                {customer.status}
              </span>
              <span className="px-2 py-0.5 rounded text-xs bg-surface-2 border border-border">
                {customer.customerGroup}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span>{customer.customerNo}</span>
              <span>•</span>
              <span>{customer.phone}</span>
              {customer.email && (
                <>
                  <span>•</span>
                  <span>{customer.email}</span>
                </>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard title="Total Spent" value={<AmountText amountInKobo={customer.totalSpent} />} />
        <KpiCard title="Orders" value={customer.ordersCount} />
        <KpiCard title="Avg Order Value" value={<AmountText amountInKobo={avgOrderValue} />} />
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border flex overflow-x-auto no-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text hover:border-border'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">

              {/* Contact Info */}
              <div className="bg-surface p-6 rounded-xl border border-border">
                <h3 className="text-h4 mb-4">Contact Info</h3>
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-text-muted text-xs mb-1">Phone Number</dt>
                    <dd className="font-medium">{customer.phone}</dd>
                  </div>
                  {customer.email && (
                    <div>
                      <dt className="text-text-muted text-xs mb-1">Email</dt>
                      <dd className="font-medium">{customer.email}</dd>
                    </div>
                  )}
                  {customer.type === 'Business' && (
                    <div>
                      <dt className="text-text-muted text-xs mb-1">RC Number</dt>
                      <dd className="font-medium">{customer.rcNumber || 'Not provided'}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-text-muted text-xs mb-1">Referral Code</dt>
                    <dd className="font-mono text-xs p-1.5 bg-surface-2 rounded border border-border inline-block">
                      {customer.referralCode}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-text-muted text-xs mb-1">Registered On</dt>
                    <dd className="font-medium">{new Date(customer.registeredAt).toLocaleDateString()}</dd>
                  </div>
                </dl>
              </div>

            </div>

            <div className="md:col-span-2 space-y-6">
              <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h3 className="font-medium text-lg">Recent Orders</h3>
                </div>
                {(customer.orders ?? []).length === 0 ? (
                  <p className="p-8 text-center text-sm text-text-muted">No recent orders found for this customer.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {customer.orders?.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between gap-4 px-6 py-4 text-sm">
                        <div>
                          <p className="font-mono font-medium text-primary">{order.orderNumber}</p>
                          <p className="text-text-muted">{new Date(order.createdAt).toLocaleDateString()} · {order.itemCount} item{order.itemCount === 1 ? '' : 's'}</p>
                        </div>
                        <div className="text-right">
                          <AmountText amountInKobo={order.total} />
                          <p className="mt-1 text-xs text-text-muted">{String(order.status)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Orders' && <CustomerOrdersTab customer={customer} />}
        {activeTab === 'Payments' && <CustomerPaymentsTab customer={customer} />}
        {activeTab === 'Addresses' && <CustomerAddressesTab customer={customer} />}
        {activeTab === 'Activity' && <CustomerActivityTab customer={customer} />}
      </div>

    </div>
  );
}
