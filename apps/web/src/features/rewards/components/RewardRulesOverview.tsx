'use client';

import { useRewardRules } from '../queries';

export function RewardRulesOverview() {
  const { data: rules = [], isLoading } = useRewardRules();
  const activeRules = rules.filter((rule) => rule.active);

  return (
    <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="p-6 pb-2 border-b border-border">
        <h3 className="text-lg font-semibold">How to Earn</h3>
      </div>
      <div className="p-6">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading earning rules...</p>
        ) : (
          <ul className="space-y-4">
            {activeRules.map((rule) => (
              <li key={rule.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                <div>
                  <div className="font-medium text-sm">
                    {rule.key.replace('_', ' ').replace(/\b\w/g, (character) => character.toUpperCase())}
                  </div>
                  {rule.needsVerifiedPurchase && (
                    <div className="text-xs text-gray-500">Requires verified purchase</div>
                  )}
                </div>
                <div className="font-bold text-green-600">+{rule.points}</div>
              </li>
            ))}
            {activeRules.length === 0 && (
              <li className="text-sm text-gray-500">No active earning rules.</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
