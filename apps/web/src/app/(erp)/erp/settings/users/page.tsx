'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/patterns/PageHeader';
import { DataTable } from '@/components/patterns/DataTable';
import { Input } from '@/components/ui/input';
import { fetchApi } from '@/lib/api';

type UserRecord = {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  username: string;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  user_type: { id: number; name: string } | null;
  roles: Array<{ id: number; name: string }>;
};

type UsersResponse = { data: UserRecord[]; meta: { totalItems: number } };

function displayName(user: UserRecord) {
  return [user.first_name, user.middle_name, user.last_name].filter(Boolean).join(' ');
}

export default function UsersListPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['erp-settings-users', search],
    queryFn: () => {
      const query = new URLSearchParams({ limit: '100', orderBy: 'createdAt:DESC' });
      if (search.trim()) query.set('search', search.trim());
      return fetchApi<UsersResponse>(`/api/v1/users?${query.toString()}`);
    },
  });
  const users = data?.data ?? [];
  const columns = [
    { header: 'User', accessorKey: 'email', cell: ({ row }: { row: { original: UserRecord } }) => { const user = row.original; return <div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{user.first_name.slice(0, 1).toUpperCase()}{user.last_name.slice(0, 1).toUpperCase()}</div><div><div className="font-medium text-text">{displayName(user)}</div><div className="text-xs text-text-muted">{user.email}</div></div></div>; } },
    { header: 'Username', accessorKey: 'username', cell: ({ row }: { row: { original: UserRecord } }) => <span className="font-mono text-sm">{row.original.username}</span> },
    { header: 'Role(s)', accessorKey: 'roles', cell: ({ row }: { row: { original: UserRecord } }) => <div className="flex flex-wrap gap-1">{row.original.roles.length ? row.original.roles.map((role) => <span key={role.id} className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-xs font-medium">{role.name}</span>) : <span className="text-text-muted">—</span>}</div> },
    { header: 'User type', accessorKey: 'user_type', cell: ({ row }: { row: { original: UserRecord } }) => <span>{row.original.user_type?.name ?? '—'}</span> },
    { header: 'Email', accessorKey: 'emailVerifiedAt', cell: ({ row }: { row: { original: UserRecord } }) => <span className={row.original.emailVerifiedAt ? 'text-success' : 'text-text-muted'}>{row.original.emailVerifiedAt ? 'Verified' : 'Unverified'}</span> },
    { header: 'Last active', accessorKey: 'lastLoginAt', cell: ({ row }: { row: { original: UserRecord } }) => row.original.lastLoginAt ? <span className="text-text-muted">{new Date(row.original.lastLoginAt).toLocaleString()}</span> : <span className="text-text-muted">Never</span> },
  ];

  return <div className="mx-auto max-w-7xl space-y-6 pb-20">
    <PageHeader title="Users" description="Users visible within your permitted scope." />
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4"><div className="relative max-w-sm flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" /><Input placeholder="Search by name, email, username, or phone..." className="h-10 w-full pl-9" value={search} onChange={(event) => setSearch(event.target.value)} /></div><span className="text-sm text-text-muted">{data?.meta.totalItems ?? 0} user{data?.meta.totalItems === 1 ? '' : 's'}</span></div>
    <div className="rounded-xl border border-border bg-surface"><DataTable data={users} columns={columns} isLoading={isLoading} emptyMessage="No users match the current scope or search." pageSize={20} /></div>
  </div>;
}
