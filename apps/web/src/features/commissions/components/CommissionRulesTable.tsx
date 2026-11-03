'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCommissionPlans } from '../api';
import { DataTable } from '@/components/patterns/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CommissionRulesTable() {
  const { data, isLoading } = useQuery({
    queryKey: ['commission-plans'],
    queryFn: () => getCommissionPlans()
  });

  const columns = [
    {
      header: 'Plan Name',
      accessorKey: 'name',
      cell: (info: any) => <span className="font-medium">{info.getValue()}</span>
    },
    {
      header: 'Version',
      accessorKey: 'version',
      cell: (info: any) => <span className="text-sm">v{info.getValue()}</span>
    },
    {
      header: 'Trigger',
      accessorKey: 'trigger',
      cell: (info: any) => <span className="text-sm">{info.getValue()}</span>
    },
    {
      header: 'Levels',
      accessorKey: 'levels',
      cell: (info: any) => <span className="text-sm font-medium">{info.getValue()}</span>
    },
    {
      header: 'Status',
      accessorKey: 'active',
      cell: (info: any) => (
        <Badge variant={info.getValue() ? 'default' : 'secondary'}>
          {info.getValue() ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      id: 'actions',
      cell: (info: any) => (
        <div className="flex gap-2">
          <Link href={`/erp/commissions/rules/${encodeURIComponent(info.row.original.id)}`}><Button variant="outline" size="sm">Edit</Button></Link>
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
