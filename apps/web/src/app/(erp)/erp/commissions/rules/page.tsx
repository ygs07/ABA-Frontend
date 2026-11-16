'use client';

import { PageHeader } from '@/components/patterns/PageHeader';
import { CommissionRulesTable } from '@/features/commissions/components/CommissionRulesTable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store';
import { getCommissionRules } from '@/features/commissions/api';

export default function CommissionRulesPage() {
  const userType = useAuthStore((state) => state.user?.userType ?? state.activeRole);
  const canManageRules = userType === 'Admin' || userType === 'Super Admin';
  const { data: rulesResponse, isLoading: isLoadingRules } = useQuery({
    queryKey: ['commission-rules'],
    queryFn: getCommissionRules,
    enabled: canManageRules,
  });
  const existingRule = rulesResponse?.data[0];
  return (
    <div className="space-y-6 pb-20 mx-auto">
      <PageHeader 
        title="Commission Plan & Rules" 
        description="View and manage the active platform commission plan, calculation base, and per-level rules."
        backHref="/erp/commissions"
        action={canManageRules && !isLoadingRules ? (
          <Link href={existingRule ? `/erp/commissions/rules/${existingRule.id}` : '/erp/commissions/rules/new'}>
            <Button>{existingRule ? 'Update Plan' : 'Create Plan'}</Button>
          </Link>
        ) : undefined}
      />
      <CommissionRulesTable />
    </div>
  );
}

