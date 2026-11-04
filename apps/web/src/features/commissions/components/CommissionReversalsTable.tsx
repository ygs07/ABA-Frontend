'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCommissionRecords } from '../api';
import { DataTable } from '@/components/patterns/DataTable';
import { Badge } from '@/components/ui/badge';
import { AmountText } from '@/components/patterns/AmountText';
import { format } from 'date-fns';

export function CommissionReversalsTable() {
  const { data, isLoading } = useQuery({
    queryKey: ['commission-records'],
    queryFn: () => getCommissionRecords()
  });

  const reversedRecords = data?.data.filter((record) => record.status === 'Reversed') || [];

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
          <span className="text-[10px] text-text-muted">Cancelled / Refunded</span>
        </div>
      )
    },
    {
      header: 'Reversal Amount',
      accessorKey: 'amount',
      cell: (info: any) => (
        <span className="font-medium text-error"><AmountText amountInKobo={info.getValue()} /></span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => {
        const val = info.getValue();
        return <Badge variant="destructive">{val}</Badge>;
      }
    },
    {
      id: 'actions',
      cell: (info: any) => (
        <div className="flex gap-2">
          <span className="text-xs text-text-muted">Finalized</span>
        </div>
      )
    }
  ];

  return (
    <DataTable
      data={reversedRecords}
      columns={columns}
      isLoading={isLoading}
    />
  );
}
