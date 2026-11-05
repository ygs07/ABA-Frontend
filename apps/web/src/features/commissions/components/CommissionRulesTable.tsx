'use client';

import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCommissionPlans, setCommissionPlanStatus } from '../api';
import { DataTable } from '@/components/patterns/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

export function CommissionRulesTable() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['commission-plans'],
    queryFn: () => getCommissionPlans()
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => setCommissionPlanStatus(id, isActive),
    onSuccess: () => {
      toast.success('Commission rule status updated');
      void queryClient.invalidateQueries({ queryKey: ['commission-plans'] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Unable to update rule status'),
  });

  const columns = [
    {
      header: 'Plan Name',
      accessorKey: 'name',
      cell: (info: any) => <span className="font-medium">{info.getValue()}</span>
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
      header: 'Rates',
      id: 'rates',
      cell: (info: any) => <span className="text-sm text-text-muted">{Object.entries(info.row.original.rates as Record<number, number>).map(([level, rate]) => `L${level}: ${rate}%`).join(' · ') || 'Not configured'}</span>
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
          <Button variant="ghost" size="sm" loading={statusMutation.isPending} onClick={() => statusMutation.mutate({ id: info.row.original.id, isActive: !info.row.original.active })}>{info.row.original.active ? 'Deactivate' : 'Activate'}</Button>
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
