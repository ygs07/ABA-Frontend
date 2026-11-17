'use client';
import { brand } from '@/config/brand';


import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { approveMerchant, getMerchantById } from '@/features/merchant/api';
import { Merchant } from '@/features/merchants/types';
import { Button } from '@/components/ui/button';
import { KpiCard } from '@/components/patterns/KpiCard';
import { AmountText } from '@/components/patterns/AmountText';
import { DataTable } from '@/components/patterns/DataTable';
import { toast } from 'sonner';

const TABS = ['Overview', 'Referrals', 'Products', 'Orders & Sales', 'Inventory', 'Payments', 'Commissions', 'Staff', 'POS', 'Activity'];
type ValueCell<T> = { getValue: () => T };

export default function MerchantDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    getMerchantById(id)
      .then(res => setMerchant(res.data))
      .catch(() => {
        toast.error('Merchant not found');
        router.push('/merchants');
      })
      .finally(() => setIsLoading(false));
  }, [id, router]);

  if (isLoading) {
    return <div className="p-8 text-center text-text-muted">Loading merchant details...</div>;
  }

  if (!merchant) return null;

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const response = await approveMerchant(merchant.id);
      setMerchant((current) => current ? { ...current, ...response.data } : current);
      toast.success('Merchant approved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve merchant');
    } finally {
      setIsApproving(false);
    }
  };

  let statusColor = 'bg-surface-2 text-text-muted border-border';
  if (merchant.status === 'Active') statusColor = 'bg-success-bg text-success border-success-border';
  if (merchant.status === 'Pending') statusColor = 'bg-warning-bg text-warning-dark border-warning-border';
  if (merchant.status === 'Suspended') statusColor = 'bg-error-bg text-error border-error-border';

  // Mock products for the merchant price override table
  const mockProducts = [
    { id: '1', name: 'Premium Cotton T-Shirt', defaultPrice: 1500000, merchantPrice: 1400000, enabled: true },
    { id: '2', name: 'Classic Denim Jacket', defaultPrice: 2500000, merchantPrice: 2500000, enabled: true },
    { id: '3', name: 'Summer Shorts', defaultPrice: 850000, merchantPrice: null, enabled: false },
  ];

  const productColumns = [
    { accessorKey: 'name', header: 'Product' },
    { accessorKey: 'defaultPrice', header: 'Default Price', cell: (info: ValueCell<number>) => <AmountText amountInKobo={info.getValue()} /> },
    {
      accessorKey: 'merchantPrice',
      header: 'Merchant Price',
      cell: (info: ValueCell<number | null>) => {
        const val = info.getValue();
        return val ? <AmountText amountInKobo={val} className="text-primary font-medium" /> : <span className="text-text-muted text-sm">Uses Default</span>;
      }
    },
    {
      accessorKey: 'enabled',
      header: 'Enabled',
      cell: (info: ValueCell<boolean>) => info.getValue() ? <span className="text-success text-sm">Yes</span> : <span className="text-text-muted text-sm">No</span>
    },
    {
      id: 'actions',
      header: '',
      cell: () => <Button variant="ghost" size="sm">Edit Override</Button>
    }
  ];

  // Mock downline referrals
  const mockDownlines = [
    { id: 'R1', name: 'James Vendor Store', type: 'Merchant', date: '2023-10-12', status: 'Active', reward: 5000000 },
    { id: 'R2', name: 'Sarah & Co.', type: 'Customer', date: '2023-11-05', status: 'Active', reward: 1500000 },
    { id: 'R3', name: 'Lagos Traders', type: 'Merchant', date: '2024-01-20', status: 'Pending', reward: 0 },
  ];

  const referralColumns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'date', header: 'Join Date' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info: ValueCell<string>) => {
        const val = info.getValue();
        return <span className={`px-2 py-0.5 rounded text-xs font-medium ${val === 'Active' ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning-dark'}`}>{val}</span>;
      }
    },
    {
      accessorKey: 'reward',
      header: 'Commission Earned',
      cell: (info: ValueCell<number>) => <AmountText amountInKobo={info.getValue()} className="text-success font-medium" />
    }
  ];

  return (
    <div className="space-y-6 pb-20 pt-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 font-bold text-xl">
            {merchant.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-h3">{merchant.name}</h1>
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusColor}`}>
                {merchant.status}
              </span>
              <span className="px-2 py-0.5 rounded text-xs bg-surface-2 text-text border border-border">
                {merchant.type}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span className="font-mono">{merchant.merchantNo}</span>
              <span>•</span>
              <span>{merchant.city}, {merchant.state}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {merchant.status === 'Pending' && (
            <Button
              className="bg-success text-white hover:bg-success/90 border-transparent"
              disabled={isApproving}
              onClick={handleApprove}
            >
              {isApproving ? 'Approving…' : 'Approve Merchant'}
            </Button>
          )}
          <Button variant="outline">Open POS Settings</Button>
          <Button onClick={() => router.push(`/erp/merchants/${encodeURIComponent(merchant.id)}/edit`)}>Edit</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Sales (30d)" value={<AmountText amountInKobo={merchant.salesPeriod} />} />
        <KpiCard title="Orders (30d)" value={merchant.ordersCount.toString()} />
        <KpiCard title="Stock Value" value={<AmountText amountInKobo={merchant.stockValue} />} />
        <KpiCard
          title="Outstanding Balance"
          value={<AmountText amountInKobo={merchant.outstandingBalance} />}
          className={merchant.outstandingBalance > 0 ? "text-error" : "text-success"}
        />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Contact & Location */}
            <div className="bg-surface p-6 rounded-xl border border-border">
              <h3 className="text-h4 mb-4">Contact & Location</h3>
              <dl className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-text-muted text-xs mb-1">Owner Name</dt>
                    <dd className="font-medium">{merchant.ownerName}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted text-xs mb-1">Phone</dt>
                    <dd className="font-medium">{merchant.phone}</dd>
                  </div>
                </div>
                <div>
                  <dt className="text-text-muted text-xs mb-1">Email</dt>
                  <dd className="font-medium">{merchant.email}</dd>
                </div>
                <div className="pt-2 border-t border-border">
                  <dt className="text-text-muted text-xs mb-1">Address</dt>
                  <dd className="font-medium">{merchant.address}, {merchant.city}, {merchant.state}</dd>
                </div>
              </dl>
            </div>

            {/* Settlement & Commercial */}
            <div className="bg-surface p-6 rounded-xl border border-border">
              <h3 className="text-h4 mb-4">Settlement & Commercial</h3>
              <dl className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-text-muted text-xs mb-1">Bank Name</dt>
                    <dd className="font-medium">{merchant.settlementBank.bankName}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted text-xs mb-1">Account Number</dt>
                    <dd className="font-medium font-mono">{merchant.settlementBank.accountNumber}</dd>
                  </div>
                </div>
                <div>
                  <dt className="text-text-muted text-xs mb-1">Account Name</dt>
                  <dd className="font-medium">{merchant.settlementBank.accountName}</dd>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                  <div>
                    <dt className="text-text-muted text-xs mb-1">Frequency</dt>
                    <dd className="font-medium">{merchant.settlementFrequency}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted text-xs mb-1">Price List</dt>
                    <dd className="font-medium">{merchant.priceList}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted text-xs mb-1">Credit Limit</dt>
                    <dd className="font-medium"><AmountText amountInKobo={merchant.creditLimit} /></dd>
                  </div>
                  <div>
                    <dt className="text-text-muted text-xs mb-1">Max Discount</dt>
                    <dd className="font-medium">{merchant.discountLimit}%</dd>
                  </div>
                </div>
              </dl>
            </div>

          </div>
        )}

        {activeTab === 'Products' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-h4">Product Pricing Overrides</h3>
              <Button>Add Override</Button>
            </div>
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <DataTable
                data={mockProducts}
                columns={productColumns}
                isLoading={false}
              />
            </div>
          </div>
        )}

        {activeTab === 'Referrals' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface p-6 rounded-xl border border-border">
                <h4 className="text-text-muted text-xs font-medium uppercase tracking-wider mb-2">Referral Code</h4>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-mono font-bold text-text">${brand.shortName}-{merchant.name.substring(0, 3).toUpperCase()}-7X9</span>
                  <Button variant="outline" size="sm">Copy</Button>
                </div>
                <p className="text-sm text-text-muted mt-2">Share this code to earn commissions.</p>
              </div>

              <div className="bg-surface p-6 rounded-xl border border-border">
                <h4 className="text-text-muted text-xs font-medium uppercase tracking-wider mb-2">Referred By (Upline)</h4>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-text">{brand.name} SuperStore Ikeja</span>
                  <span className="text-sm text-text-muted">ID: MER-23948</span>
                </div>
              </div>

              <div className="bg-surface p-6 rounded-xl border border-border">
                <h4 className="text-text-muted text-xs font-medium uppercase tracking-wider mb-2">Network Earnings</h4>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-success"><AmountText amountInKobo={6500000} /></span>
                  <span className="text-sm text-text-muted">Total commissions earned from downlines</span>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface-2">
                <h3 className="font-semibold text-text">Downline Referrals</h3>
                <Button variant="outline" size="sm">View Tree</Button>
              </div>
              <DataTable
                data={mockDownlines}
                columns={referralColumns}
                isLoading={false}
              />
            </div>
          </div>
        )}

        {activeTab !== 'Overview' && activeTab !== 'Products' && activeTab !== 'Referrals' && (
          <div className="bg-surface p-12 text-center rounded-xl border border-border">
            <h3 className="font-medium text-lg mb-1">{activeTab}</h3>
            <p className="text-text-muted text-sm mb-4">This section is not yet implemented.</p>
            <Button variant="outline">Learn more</Button>
          </div>
        )}
      </div>

    </div>
  );
}
