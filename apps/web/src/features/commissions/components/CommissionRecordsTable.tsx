'use client';

import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCommissionRecords, releaseCommission, reverseCommission } from '../api';
import { DataTable } from '@/components/patterns/DataTable';
import { Badge } from '@/components/ui/badge';
import { AmountText } from '@/components/patterns/AmountText';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/store';

export function CommissionRecordsTable() {
  const queryClient = useQueryClient();
  const canManageCommissions = useAuthStore((state) =>
    state.user?.userType === 'Admin' || state.user?.userType === 'Super Admin',
  );
  const { data, isLoading } = useQuery({
    queryKey: ['commission-records'],
    queryFn: () => getCommissionRecords()
  });
  const releaseMutation = useMutation({
    mutationFn: releaseCommission,
    onSuccess: () => {
      toast.success('Commission released to the beneficiary wallet');
      void queryClient.invalidateQueries({ queryKey: ['commission-records'] });
      void queryClient.invalidateQueries({ queryKey: ['commission-kpis'] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Unable to release commission'),
  });
  const reverseMutation = useMutation({
    mutationFn: reverseCommission,
    onSuccess: () => {
      toast.success('Commission reversed');
      void queryClient.invalidateQueries({ queryKey: ['commission-records'] });
      void queryClient.invalidateQueries({ queryKey: ['commission-kpis'] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Unable to reverse commission'),
  });

  const columns = [
    {
      header: 'COM #',
      accessorKey: 'commissionNumber',
      cell: (info: any) => <span className="font-mono text-sm">{info.getValue()}</span>
    },
    {
      header: 'Date',
      accessorKey: 'date',
      cell: (info: any) => <span className="text-sm">{format(new Date(info.getValue()), 'MMM d, yyyy')}</span>
    },
    {
      header: 'Beneficiary',
      accessorKey: 'beneficiaryName',
      cell: (info: any) => <span className="font-medium">{info.getValue()}</span>
    },
    {
      header: 'Source Order',
      accessorKey: 'sourceOrderNumber',
      cell: (info: any) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs text-brand-500 cursor-pointer">{info.getValue()}</span>
          <span className="text-[10px] text-text-muted">{info.row.original.sourceCustomerName}</span>
        </div>
      )
    },
    {
      header: 'Level',
      accessorKey: 'level',
      cell: (info: any) => <Badge variant="outline">L{info.getValue()}</Badge>
    },
    {
      header: 'Commission',
      accessorKey: 'amount',
      cell: (info: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-success-dark"><AmountText amountInKobo={info.getValue()} /></span>
          <span className="text-[10px] text-text-muted">{info.row.original.rate}% of <AmountText amountInKobo={info.row.original.baseAmount} /></span>
        </div>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => {
        const val = info.getValue();
        let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
        if (val === 'Held' || val === 'Released') variant = 'default';
        else if (val === 'Pending') variant = 'secondary';
        else if (val === 'Reversed') variant = 'destructive';
        return <Badge variant={variant}>{val}</Badge>;
      }
    },
    {
      id: 'actions',
      cell: (info: any) => (
        <div className="flex gap-2">
          {canManageCommissions && <>
            {info.row.original.status === 'Held' && <Button variant="outline" size="sm" loading={releaseMutation.isPending} onClick={() => releaseMutation.mutate(info.row.original.id)}>Release</Button>}
            {['Pending', 'Held'].includes(info.row.original.status) && <Button variant="ghost" size="sm" className="text-error" loading={reverseMutation.isPending} onClick={() => reverseMutation.mutate(info.row.original.id)}>Reverse</Button>}
          </>}
        </div>
      )
    }
  ];

  return (
    <DataTable
      data={data?.data || []}
      columns={columns}
      isLoading={isLoading}
    />
  );
}
