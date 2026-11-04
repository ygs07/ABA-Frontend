'use client';

import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { approveCommission, getCommissionRecords, reverseCommission } from '../api';
import { DataTable } from '@/components/patterns/DataTable';
import { Badge } from '@/components/ui/badge';
import { AmountText } from '@/components/patterns/AmountText';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CommissionRecord } from '../types';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/store';

export function CommissionApprovalsTable() {
  const [selectedRecord, setSelectedRecord] = React.useState<CommissionRecord | null>(null);
  const [action, setAction] = React.useState<'approve' | 'reverse' | null>(null);
  const queryClient = useQueryClient();
  const canManageCommissions = useAuthStore((state) =>
    state.user?.userType === 'Admin' || state.user?.userType === 'Super Admin',
  );
  const { data, isLoading } = useQuery({
    queryKey: ['commission-records'],
    queryFn: () => getCommissionRecords()
  });

  // Filter only pending records
  const pendingRecords = data?.data.filter(r => r.status === 'Pending') || [];
  const closeDialog = () => {
    setSelectedRecord(null);
    setAction(null);
  };
  const actionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRecord || !action) return;
      if (action === 'approve') return approveCommission(selectedRecord.id);
      return reverseCommission(selectedRecord.id);
    },
    onSuccess: () => {
      toast.success(action === 'approve' ? 'Commission approved' : 'Commission reversed');
      void queryClient.invalidateQueries({ queryKey: ['commission-records'] });
      void queryClient.invalidateQueries({ queryKey: ['commission-kpis'] });
      closeDialog();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Unable to update commission'),
  });

  const columns = [
    {
      header: 'COM #',
      accessorKey: 'commissionNumber',
      cell: (info: any) => <span className="font-mono text-sm">{info.getValue()}</span>
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
      header: 'Date',
      accessorKey: 'date',
      cell: (info: any) => <span className="text-sm">{format(new Date(info.getValue()), 'MMM d')}</span>
    },
    {
      id: 'actions',
      cell: (info: any) => (
        <div className="flex gap-2">
          {canManageCommissions && <>
            <Button variant="primary" size="sm" onClick={() => { setSelectedRecord(info.row.original); setAction('approve'); }}>Approve</Button>
            <Button variant="outline" size="sm" className="text-error border-error-muted hover:bg-error-light hover:text-error" onClick={() => { setSelectedRecord(info.row.original); setAction('reverse'); }}>Reverse</Button>
          </>}
        </div>
      )
    }
  ];

  return (
    <>
    <DataTable
      data={pendingRecords}
      columns={columns}
      isLoading={isLoading}
    />
    <Dialog open={Boolean(selectedRecord && action)} onOpenChange={(open) => { if (!open) closeDialog(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{action === 'approve' ? 'Approve commission?' : 'Reverse commission?'}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-text-muted">
          {action === 'approve'
            ? `Approve ${selectedRecord?.commissionNumber} for ${selectedRecord?.beneficiaryName}?`
            : `Reverse ${selectedRecord?.commissionNumber} for ${selectedRecord?.beneficiaryName}?`}
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>Cancel</Button>
          <Button variant={action === 'reverse' ? 'destructive' : 'primary'} loading={actionMutation.isPending} onClick={() => actionMutation.mutate()}>
            {action === 'approve' ? 'Confirm approval' : 'Confirm reversal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
