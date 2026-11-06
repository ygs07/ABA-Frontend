'use client';

import { PageHeader } from '@/components/patterns/PageHeader';
import { CommissionRulesTable } from '@/features/commissions/components/CommissionRulesTable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuthStore } from '@/features/auth/store';

export default function CommissionRulesPage() {
  const userType = useAuthStore((state) => state.user?.userType ?? state.activeRole);
  const canManageRules = userType === 'Admin' || userType === 'Super Admin';
  return (
    <div className="space-y-6 pb-20 mx-auto">
      <PageHeader 
        title="Plans & Rules" 
        description="Configure commission plans, earning rules, and network depth."
        backHref="/erp/commissions"
        action={canManageRules ? (
          <Link href="/erp/commissions/rules/new">
            <Button>Create Plan</Button>
          </Link>
        ) : undefined}
      />
      <CommissionRulesTable />
    </div>
  );
}

