'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, CheckCircle2, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { addUserBankAccount, getSettlementBanks, getUserBankAccounts, removeUserBankAccount, setPrimaryUserBankAccount, type SettlementBank, type UserBankAccount } from '@/features/portal/api';

export default function PortalBankAccountsPage() {
  const [accounts, setAccounts] = useState<UserBankAccount[]>([]);
  const [banks, setBanks] = useState<SettlementBank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const load = async () => {
    setIsLoading(true);
    try {
      const [accountList, bankList] = await Promise.all([getUserBankAccounts(), getSettlementBanks()]);
      setAccounts(accountList);
      setBanks(bankList);
    } catch { toast.error('Unable to load your bank accounts.'); }
    finally { setIsLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const addAccount = async () => {
    const selectedBank = banks.find((bank) => bank.code === bankCode);
    if (!selectedBank || !/^\d{10}$/.test(accountNumber)) { toast.error('Select a bank and enter a valid 10-digit account number.'); return; }
    setIsSaving(true);
    try {
      await addUserBankAccount({ bankName: selectedBank.name, bankCode, accountNumber, isPrimary: accounts.length === 0 });
      toast.success('Bank account verified and added.');
      setIsAdding(false); setBankCode(''); setAccountNumber(''); await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to add bank account.'); }
    finally { setIsSaving(false); }
  };

  const setPrimary = async (id: number) => { try { await setPrimaryUserBankAccount(id); toast.success('Primary settlement account updated.'); await load(); } catch { toast.error('Unable to set primary account.'); } };
  const remove = async (id: number) => { if (!window.confirm('Remove this bank account?')) return; try { await removeUserBankAccount(id); toast.success('Bank account removed.'); await load(); } catch { toast.error('Unable to remove bank account.'); } };

  return <div className="mx-auto max-w-3xl space-y-6">
    <div className="flex items-center justify-between gap-4"><div><h1 className="text-2xl font-bold text-text">Settlement Bank Accounts</h1><p className="mt-1 text-sm text-text-muted">Manage the accounts used for withdrawals and commission settlements.</p></div><Button onClick={() => setIsAdding(true)}><Plus className="mr-2 h-4 w-4" />Add account</Button></div>
    {isLoading ? <div className="flex h-40 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-brand-600" /></div> : accounts.length === 0 ? <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-text-muted">No settlement bank accounts yet.</div> : <div className="space-y-3">{accounts.map((account) => <div key={account.id} className="flex items-center gap-4 rounded-xl border border-border bg-white p-5"><div className="rounded-full bg-surface-2 p-3"><Building2 className="h-5 w-5 text-text-muted" /></div><div className="min-w-0 flex-1"><p className="font-semibold text-text">{account.bank_name} {account.is_primary && <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">Primary</span>}</p><p className="text-sm text-text-muted">{account.account_name} · {account.account_number}</p><p className="mt-1 flex items-center gap-1 text-xs text-success-dark"><CheckCircle2 className="h-3.5 w-3.5" /> Verified</p></div><div className="flex gap-2">{!account.is_primary && <Button size="sm" variant="outline" onClick={() => void setPrimary(account.id)}>Set primary</Button>}<Button size="sm" variant="ghost" onClick={() => void remove(account.id)} aria-label="Remove bank account"><Trash2 className="h-4 w-4 text-error" /></Button></div></div>)}</div>}
    {isAdding && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"><div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"><h2 className="text-lg font-bold">Add settlement account</h2><p className="mt-1 text-sm text-text-muted">Your account name will be verified with Paystack before it is saved.</p><label className="mt-5 block text-sm font-medium">Bank</label><select value={bankCode} onChange={(event) => setBankCode(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm"><option value="">Select bank</option>{banks.map((bank) => <option key={bank.code} value={bank.code}>{bank.name}</option>)}</select><label className="mt-4 block text-sm font-medium">Account number</label><input value={accountNumber} onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" placeholder="0123456789" className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm" /><div className="mt-6 flex justify-end gap-3"><Button variant="outline" disabled={isSaving} onClick={() => setIsAdding(false)}>Cancel</Button><Button disabled={isSaving} onClick={() => void addAccount()}>{isSaving ? 'Verifying…' : 'Verify & add'}</Button></div></div></div>}
    <Link href="/portal/wallet" className="inline-block text-sm font-medium text-brand-600 hover:underline">← Back to wallet</Link>
  </div>;
}
