import { redirect } from 'next/navigation';

/** Rewards and points have been retired in favour of commissions and shopping credits. */
export default function AdminRewardsPage() {
  redirect('/erp/dashboard');
}
