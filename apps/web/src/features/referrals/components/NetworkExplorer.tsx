'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorState } from '@/components/patterns/ErrorState';
import { Loader2 } from 'lucide-react';
import { getNetworkTree } from '../api';
import { NetworkTree } from './NetworkTree';



export function NetworkExplorer({ initialRootId = '' }: { initialRootId?: string }) {
  const router = useRouter();
  const rootId = initialRootId.trim();
  const [searchInput, setSearchInput] = useState(initialRootId);
  const [maxLevels, setMaxLevels] = useState(3);

  const { data: treeNode, isLoading, error, refetch } = useQuery({
    queryKey: ['referral-network', rootId, maxLevels],
    queryFn: async () => {
      const res = await getNetworkTree(rootId, maxLevels);
      return res.data;
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(searchInput.trim()
      ? `/erp/referrals/network/${encodeURIComponent(searchInput.trim())}`
      : '/erp/referrals/network');
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMaxLevels(Number(e.target.value));
  };

  // Callback from children nodes clicking names to search quickly
  const handleQuickSearch = (id: string) => {
    router.push(`/erp/referrals/network/${id}`);
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      <PageHeader 
        title="Network Explorer" 
        description="Visualize the upline/downline hierarchy and sales distribution."
        backHref="/erp/referrals"
      />

      <form onSubmit={handleSearch} className="bg-surface rounded-xl border border-border p-4 flex gap-4 items-center">
        <div className="flex-1">
          <Input 
            placeholder="Search by user ID, username, or referral code..."
            className="w-full"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <select 
          className="h-10 rounded-md border bg-surface px-3 text-sm focus:ring-primary focus:border-primary"
          value={maxLevels}
          onChange={handleLevelChange}
        >
          <option value={3}>Show: 3 Levels Deep</option>
          <option value={5}>Show: 5 Levels Deep</option>
          <option value={999}>Show: All Levels</option>
        </select>
        <Button type="submit">Search</Button>
      </form>

      {!rootId && !isLoading && !error && (
        <p className="rounded-lg border border-brand-200 bg-brand-50 p-3 text-sm text-brand-800">Showing your own network. Administrators can search for any user ID, username, or referral code.</p>
      )}

      {/* Tree Visualization */}
      <div className="bg-surface-2 rounded-xl border border-border p-6 overflow-x-auto min-h-[400px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-full pt-10">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        ) : error || !treeNode ? (
          <ErrorState 
            title="User not found"
            description={error instanceof Error ? error.message : "Could not find the requested user in the network tree."}
            onRetry={() => refetch()}
          />
        ) : (
          <NetworkTree data={treeNode} anonymize={false} />
        )}
      </div>
    </div>
  );
}
