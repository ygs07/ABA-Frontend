'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, Plus, Building2, Search, Filter, Loader2, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCustomerWalletBalance, getShoppingCreditBalance, getUserBankAccounts, getWalletTransactions, initializeWalletFunding, requestWalletWithdrawal, verifyWalletFunding } from '@/features/portal/api';
import { AmountText } from '@/components/patterns/AmountText';
import { Alert } from '@/components/ui/alert';
import { toast } from 'sonner';
import { getAmountFontSize } from '@/lib/format';

export default function PortalWalletPage() {
  const queryClient = useQueryClient();
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [fundingAmount, setFundingAmount] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<number | null>(null);
  const [isStartingFunding, setIsStartingFunding] = useState(false);
  const [isRequestingWithdrawal, setIsRequestingWithdrawal] = useState(false);
  const { data: baseTransactions, isLoading, error } = useQuery({
    queryKey: ['portal_wallet_transactions'],
    queryFn: async () => {
      const res = await getWalletTransactions();
      return res.data;
    },
  });

  const { data: availableBalance, isLoading: isLoadingBalance, error: balanceError } = useQuery({
    queryKey: ['portal_wallet_balance'],
    queryFn: getCustomerWalletBalance,
  });

  const { data: shoppingCreditsKobo = 0 } = useQuery({ queryKey: ['shopping_credit_balance'], queryFn: getShoppingCreditBalance });

  const { data: bankAccounts = [], isLoading: isLoadingBankAccounts } = useQuery({
    queryKey: ['portal_bank_accounts'],
    queryFn: getUserBankAccounts,
  });
  const verifiedBankAccounts = bankAccounts.filter((account) => account.is_verified);
  const primaryBankAccount = verifiedBankAccounts.find((account) => account.is_primary) ?? verifiedBankAccounts[0];

  if (isLoading || isLoadingBalance) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error || balanceError || !baseTransactions || availableBalance === undefined) {
    return (
      <Alert variant="destructive">
        Failed to load wallet data. Please try again.
      </Alert>
    );
  }

  const transactions = baseTransactions;
  const totalInflow = transactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((total, transaction) => total + transaction.amount, 0);
  const totalOutflow = transactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((total, transaction) => total + Math.abs(transaction.amount), 0);

  const startWalletFunding = async () => {
    const amount = Number(fundingAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Enter a valid amount to fund your wallet.');
      return;
    }
    setIsStartingFunding(true);
    try {
      const checkout = await initializeWalletFunding(amount.toFixed(2));
      const { default: PaystackPop } = await import('@paystack/inline-js');
      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: checkout.publicKey,
        email: checkout.email,
        amount: checkout.amount,
        reference: checkout.reference,
        onSuccess: async ({ reference }) => {
          try {
            await verifyWalletFunding(reference);
            await Promise.all([
              queryClient.invalidateQueries({ queryKey: ['portal_wallet_balance'] }),
              queryClient.invalidateQueries({ queryKey: ['portal_wallet_transactions'] }),
              queryClient.invalidateQueries({ queryKey: ['portal_wallet'] }),
            ]);
            toast.success('Your wallet has been funded successfully.');
            setIsFundModalOpen(false);
            setFundingAmount('');
          } catch {
            toast.error('Payment was completed but wallet verification failed. Please refresh and try again.');
          }
        },
        onCancel: () => toast.message('Wallet funding was cancelled.'),
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to start Paystack checkout.');
    } finally {
      setIsStartingFunding(false);
    }
  };

  const requestWithdrawal = async () => {
    const amount = Number(withdrawalAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Enter a valid withdrawal amount.');
      return;
    }
    if (amount * 100 > availableBalance) {
      toast.error('Withdrawal amount cannot exceed your available wallet balance.');
      return;
    }
    const bankAccountId = selectedBankAccountId ?? primaryBankAccount?.id;
    if (!bankAccountId) {
      toast.error('Add and verify a settlement bank account before withdrawing.');
      return;
    }
    setIsRequestingWithdrawal(true);
    try {
      const payout = await requestWalletWithdrawal({ amount: amount.toFixed(2), bankAccountId });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['portal_wallet_balance'] }),
        queryClient.invalidateQueries({ queryKey: ['portal_wallet_transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['portal_wallet'] }),
      ]);
      toast.success(`Withdrawal ${payout.payout_number} requested. Net amount: ₦${Number(payout.net_amount).toLocaleString()}.`);
      setIsWithdrawModalOpen(false);
      setWithdrawalAmount('');
      setSelectedBankAccountId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to request withdrawal.');
    } finally {
      setIsRequestingWithdrawal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text">My Wallet</h1>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsWithdrawModalOpen(true)}>
            <Building2 className="w-4 h-4" /> Withdraw
          </Button>
          <Button className="flex items-center gap-2" onClick={() => setIsFundModalOpen(true)}>
            <Plus className="w-4 h-4" /> Fund Wallet
          </Button>
        </div>
      </div>

      {isFundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-label="Fund wallet">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-text">Fund Wallet</h2>
            <p className="mt-1 text-sm text-text-muted">Enter the amount you would like to add to your wallet.</p>
            <label className="mt-5 block text-sm font-medium text-text">Amount (₦)</label>
            <input autoFocus inputMode="decimal" value={fundingAmount} onChange={(event) => setFundingAmount(event.target.value)} placeholder="e.g. 5000" className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-brand-500" />
            <div className="mt-6 flex justify-end gap-3"><Button variant="outline" disabled={isStartingFunding} onClick={() => setIsFundModalOpen(false)}>Cancel</Button><Button disabled={isStartingFunding} onClick={() => void startWalletFunding()}>{isStartingFunding ? 'Opening checkout…' : 'Continue to Paystack'}</Button></div>
          </div>
        </div>
      )}

      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-label="Withdraw from wallet">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-text">Withdraw to bank</h2>
            <p className="mt-1 text-sm text-text-muted">Funds are reserved immediately and sent after payout approval. An approved KYC profile and verified bank account are required.</p>
            <p className="mt-3 text-sm font-medium text-text">Available balance: <AmountText amountInKobo={availableBalance} /></p>
            {isLoadingBankAccounts ? <div className="mt-5 flex items-center gap-2 text-sm text-text-muted"><Loader2 className="h-4 w-4 animate-spin" />Loading bank accounts…</div> : verifiedBankAccounts.length === 0 ? <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">You need a verified bank account before withdrawing.<Link href="/portal/bank-accounts" className="ml-1 font-semibold underline">Manage bank accounts</Link></div> : <><label className="mt-5 block text-sm font-medium text-text">Destination account</label><select value={selectedBankAccountId ?? primaryBankAccount?.id ?? ''} onChange={(event) => setSelectedBankAccountId(Number(event.target.value))} className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm"><option value="">Select verified account</option>{verifiedBankAccounts.map((account) => <option key={account.id} value={account.id}>{account.bank_name} · {account.account_number} · {account.account_name}</option>)}</select><label className="mt-4 block text-sm font-medium text-text">Amount (₦)</label><input autoFocus inputMode="decimal" value={withdrawalAmount} onChange={(event) => setWithdrawalAmount(event.target.value)} placeholder="e.g. 5000" className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-brand-500" /></>}
            <div className="mt-6 flex justify-end gap-3"><Button variant="outline" disabled={isRequestingWithdrawal} onClick={() => setIsWithdrawModalOpen(false)}>Cancel</Button><Button disabled={isRequestingWithdrawal || !verifiedBankAccounts.length} onClick={() => void requestWithdrawal()}>{isRequestingWithdrawal ? 'Requesting…' : 'Request withdrawal'}</Button></div>
          </div>
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Available Balance (Withdrawable) */}
        <div className="bg-brand-600 rounded-xl p-6 text-white shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <p className="text-brand-100 font-medium mb-1 text-sm">Available Cash Balance</p>
            <h2 className={`${getAmountFontSize(availableBalance)} font-bold tracking-tight break-words [overflow-wrap:anywhere]`}>
              <AmountText amountInKobo={availableBalance} className="text-left inline-block max-w-full" />
            </h2>
            <p className="text-xs text-brand-200 mt-2">Withdrawable to bank or spendable</p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-xs text-brand-100">
            <span>Inflow: <AmountText amountInKobo={totalInflow} /></span>
            <span>Outflow: <AmountText amountInKobo={totalOutflow} /></span>
          </div>
        </div>

        {/* Shopping Credits Card (Non-Withdrawable) */}
        <div className="bg-amber-50 rounded-xl border border-amber-300 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-amber-800 font-bold text-sm flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-amber-700" /> Shopping Credits
              </p>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-200 text-amber-900 uppercase">
                Non-Withdrawable
              </span>
            </div>
            <h2 className={`${getAmountFontSize(shoppingCreditsKobo)} break-all text-2xl font-black text-amber-900 tracking-tight sm:text-3xl`}>
              <AmountText amountInKobo={shoppingCreditsKobo} />
            </h2>
            <p className="text-xs text-amber-800/80 mt-2 leading-relaxed">
              Credited from referral activation fee. Valid for purchasing all BuyNaija marketplace products.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-200 text-xs text-amber-900 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> Automatically applied at checkout
          </div>
        </div>

        {/* Linked Bank Account */}
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-text mb-3 text-sm">Linked Bank Account</h3>
            {primaryBankAccount ? <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-surface-1">
              <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-text-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-text truncate">{primaryBankAccount.bank_name}</p>
                <p className="text-xs text-text-muted">{primaryBankAccount.account_number}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">{primaryBankAccount.account_name}</p>
              </div>
            </div> : <p className="rounded-lg border border-dashed border-border p-3 text-xs text-text-muted">No verified bank account linked.</p>}
          </div>
          <Link href="/portal/bank-accounts">
            <Button variant="ghost" size="sm" className="text-brand-600 hover:bg-brand-50 w-full mt-3 text-xs">Manage Bank Accounts</Button>
          </Link>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="p-4 sm:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-text">Transaction History</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search..."
                className="h-9 pl-9 pr-3 rounded-md border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-48"
              />
            </div>
            <Button variant="outline" size="sm" className="px-2 h-9">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="divide-y divide-border">
          {transactions.map((trx) => {
            const isCredit = trx.amount > 0;
            const Icon = isCredit ? ArrowDownLeft : ArrowUpRight;
            const iconColor = isCredit ? 'text-success-main' : 'text-text-muted';
            const iconBg = isCredit ? 'bg-success-50' : 'bg-surface-2';
            const amountColor = isCredit ? 'text-success-dark' : 'text-text';

            return (
              <div key={trx.id} className="p-4 sm:p-6 flex items-center gap-4 hover:bg-surface-1 transition-colors">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text truncate">{trx.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-text-muted">
                    <span>{new Date(trx.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="truncate">{trx.id}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={`font-bold ${amountColor}`}>
                    {isCredit ? '+' : ''}<AmountText amountInKobo={Math.abs(trx.amount)} />
                  </p>
                  <p className={`text-xs font-semibold mt-1 ${trx.status === 'Completed' ? 'text-text-muted' : 'text-error'}`}>
                    {trx.status}
                  </p>
                </div>
              </div>
            );
          })}
          {transactions.length === 0 && (
            <div className="p-8 text-center text-sm text-text-muted">No transactions found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
