
import { DashboardView } from '@/features/dashboard/components/DashboardView';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ErpDashboardPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get('aba_auth_token')?.value) {
    redirect('/auth/login?next=/erp/dashboard');
  }

  if (cookieStore.get('aba_auth_role')?.value === 'Customer') {
    redirect('/portal/dashboard');
  }

  return <DashboardView />;
}
