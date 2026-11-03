'use client';
import Link from 'next/link';
import { PageHeader } from '@/components/patterns/PageHeader';
import { KpiCard } from '@/components/patterns/KpiCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/patterns/DataTable';
import { useQuery } from '@tanstack/react-query';
import { getReferralRecords } from '@/features/referrals/api';

export default function ReferralsDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['referral-records'],
    queryFn: getReferralRecords,
  });
  const referrals = data?.data ?? [];
  const referrers = new Set(referrals.map((referral) => referral.referrerName));
  const columns = [
    { accessorKey: 'referralNumber', header: 'Ref #' },
    { accessorKey: 'referrerName', header: 'Referrer (Upline)' },
    { accessorKey: 'referredCustomerName', header: 'Referred Customer' },
    { accessorKey: 'level', header: 'Network Level', cell: (info: any) => `L${info.getValue()}` },
    { accessorKey: 'sourceChannel', header: 'Source' },
    { accessorKey: 'dateReferred', header: 'Date Referred', cell: (info: any) => new Date(info.getValue()).toLocaleDateString() },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: (info: any) => {
        const s = info.getValue();
        let color = 'bg-surface-2 text-text-muted';
        if (s === 'Registered') color = 'bg-success-bg text-success border border-success-border';
        return <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>{s}</span>;
      }
    },
    {
      id: 'actions',
      header: '',
      cell: () => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" className="h-8 text-xs">View</Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-20 mx-auto">
      <PageHeader 
        title="Referrals Dashboard" 
        description="Monitor network growth, qualifications, and flagged activities."
        action={
          <div className="flex gap-2">
            <Link href="/erp/referrals/network">
              <Button variant="outline">Network Tree Explorer</Button>
            </Link>
            <Link href="/erp/commissions/rules">
              <Button>Commission Rules</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Total Referrers" value={referrers.size} />
        <KpiCard title="Total Referrals" value={referrals.length} className="text-success" />
        <KpiCard title="Active Codes" value={new Set(referrals.map((referral) => referral.referrerCode)).size} />
        <KpiCard title="Flagged / Suspicious" value="—" className="text-error" />
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center bg-surface-2">
          <h3 className="font-medium">Recent Referrals</h3>
          <div className="flex gap-2">
            <Input placeholder="Search code or name..." className="h-9 w-64 text-sm" />
            <select className="h-9 rounded-md border border-border bg-surface px-3 text-sm focus:ring-primary">
              <option>All Statuses</option>
              <option>Qualified</option>
              <option>Pending</option>
              <option>Flagged</option>
            </select>
          </div>
        </div>
        <DataTable data={referrals} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
