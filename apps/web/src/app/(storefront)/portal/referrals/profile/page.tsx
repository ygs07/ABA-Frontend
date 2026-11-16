import { MarketerProfile } from '@/features/referrals/components/MarketerProfile';
import { mockNetworkUsers } from '@/features/referrals/mocks';
import { brand } from '@/config/brand';

export default function MarketerProfilePage() {
  const profileId = `${brand.referralCodePrefix}492`;
  const profileData = mockNetworkUsers[profileId];

  // Mock metrics
  const mockMetrics = {
    teamSizeByLevel: [
      { name: 'Level 1', size: 8 },
      { name: 'Level 2', size: 12 },
      { name: 'Level 3', size: 4 },
    ],
    activeInactive: [
      { name: 'Active', count: 18 },
      { name: 'Inactive', count: 6 },
    ],
    salesByLevel: [
      { name: 'Level 1', sales: 250000000 },
      { name: 'Level 2', sales: 150000000 },
      { name: 'Level 3', sales: 50000000 },
    ],
    growthTrend: [
      { name: 'Jan', value: 2 },
      { name: 'Feb', value: 5 },
      { name: 'Mar', value: 12 },
      { name: 'Apr', value: 18 },
      { name: 'May', value: 24 },
    ],
    earningsSources: [
      { name: 'Direct Commission', value: 4500000 },
      { name: 'Level 1 Override', value: 2100000 },
      { name: 'Level 2 Override', value: 800000 },
      { name: 'Campaign Bonus', value: 1500000 },
    ],
  };

  return (
    <div className="container mx-auto">
      <MarketerProfile profile={profileData} metrics={mockMetrics} />
    </div>
  );
}
