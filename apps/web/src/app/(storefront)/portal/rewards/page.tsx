import { Metadata } from 'next';
import { PageHeader } from '@/components/patterns/PageHeader';
import {
  RewardRulesOverview,
  RewardSummaryCards,
  RewardsLedgerTable,
} from '@/features/rewards/components';
import { brand } from '@/config/brand';

export const metadata: Metadata = {
  title: `My ${brand.rewardsName}`,
};

export default async function CustomerRewardsPage() {
  const userId = 'user-1'; // Hardcoded for mock portal

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader 
        title={`My ${brand.rewardsName}`} 
        description="View your balance, history, and how to earn."
      />

      <RewardSummaryCards userId={userId} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <RewardsLedgerTable userId={userId} />
        </div>

        <div className="space-y-8">
          <RewardRulesOverview />

          <div className="border rounded-xl bg-gray-50 shadow-sm overflow-hidden">
            <div className="p-6 pb-2 border-b border-border">
              <h3 className="text-lg font-semibold">Redeem Points</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 text-center py-4">
                Coming soon! Check back later for exciting ways to spend your points.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
