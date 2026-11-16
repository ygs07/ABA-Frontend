'use client';

import { brand } from '@/config/brand';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';

import Link from 'next/link';

import { useRouter } from 'next/navigation';

import { Check, ShieldCheck, MapPin, Truck, CreditCard, Wallet, AlertCircle, Loader2, Search, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { useQuery, useMutation } from '@tanstack/react-query';

import { getCart } from '@/features/cart/api';

import { useCartStore } from '@/features/cart/store';

import { getDeliveryAddresses, initializeCheckout, processCheckout, searchReferralCandidates, type ReferralCandidate } from '@/features/checkout/api';

import { CheckoutAddressInput } from '@/features/checkout/schemas';

import { AmountText } from '@/components/patterns/AmountText';

import { ErrorState } from '@/components/patterns/ErrorState';

import { getCustomerWalletBalance, getShoppingCreditBalance } from '@/features/portal/api';
import { useAuthStore } from '@/features/auth/store';
import { NIGERIAN_STATES } from '@/lib/constants/nigeria';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

const CHECKOUT_STORAGE_KEY = 'aba_checkout_state';

interface SavedCheckoutState {
  cartFingerprint?: string;
  step?: number;
  paymentMethod?: 'card' | 'wallet';
  deliveryMethod?: 1 | 2 | 3;
  useShoppingCredits?: boolean;
  selectedDeliveryAddressId?: number;
  addressForm?: CheckoutAddressInput;
  appliedReferral?: { code: string; name: string } | null;
}

function CheckoutContent() {

  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const clearCart = useCartStore((state) => state.clearCart);

  const hasRestoredRef = useRef(false);
  const hasRedirectedEmptyCartRef = useRef(false);
  const [step, setStep] = useState(1);
  const [isRestored, setIsRestored] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card');
  const [deliveryMethod, setDeliveryMethod] = useState<1 | 2 | 3>(1);
  const [useShoppingCredits, setUseShoppingCredits] = useState(true);

  const [selectedDeliveryAddressId, setSelectedDeliveryAddressId] = useState<number | undefined>();
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const [referralInput, setReferralInput] = useState('');

  const [searchResults, setSearchResults] = useState<ReferralCandidate[]>([]);
  const [selectedReferral, setSelectedReferral] = useState<ReferralCandidate | null>(null);

  const [appliedReferral, setAppliedReferral] = useState<{ code: string, name: string } | null>(null);
  const debouncedReferralInput = useDebouncedValue(referralInput, 350);

  useEffect(() => {
    const query = debouncedReferralInput.trim();
    if (query.length < 2) return;

    let cancelled = false;
    void (async () => {
      try {
        const results = await searchReferralCandidates(query);
        if (!cancelled) {
          setSearchResults(results);
        }
      } catch {
        if (!cancelled) {
          setSearchResults([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedReferralInput]);

  const [addressForm, setAddressForm] = useState<CheckoutAddressInput>({

    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: ''

  });

  const updateUrlStep = (newStep: number) => {
    if (typeof window === 'undefined') return;
    const currentUrl = new URL(window.location.href);
    if (currentUrl.searchParams.get('step') === String(newStep)) return;
    currentUrl.searchParams.set('step', String(newStep));
    window.history.replaceState(null, '', currentUrl.pathname + currentUrl.search);
  };

  // 1. Fetch Cart for Summary

  const { data: cartData, isLoading: isCartLoading, error: cartError } = useQuery({

    queryKey: ['cart'],

    queryFn: async () => {

      const res = await getCart();

      return res.data;

    }

  });

  const { data: walletBalance = 0, isLoading: isWalletLoading } = useQuery({

    queryKey: ['portal_wallet_balance'],

    queryFn: getCustomerWalletBalance,

  });

  const { data: savedAddressesData, isLoading: isAddressesLoading, error: addressesError } = useQuery({
    queryKey: ['delivery-addresses'],
    queryFn: getDeliveryAddresses,
  });
  const { data: shoppingCreditBalance = 0 } = useQuery({ queryKey: ['shopping_credit_balance'], queryFn: getShoppingCreditBalance });

  const savedAddresses = savedAddressesData?.data ?? [];
  const deliveryFee = deliveryMethod === 2 ? 300000 : deliveryMethod === 1 ? 150000 : 0;
  const shoppingCreditApplied = useShoppingCredits ? Math.min(shoppingCreditBalance, (cartData?.subtotal ?? 0) + deliveryFee) : 0;
  const checkoutTotal = Math.max(0, (cartData?.subtotal ?? 0) + deliveryFee - shoppingCreditApplied);
  const hasInsufficientWallet = walletBalance < checkoutTotal;

  const hasValidAddress = Boolean(
    selectedDeliveryAddressId ||
    (addressForm.fullName?.trim() && addressForm.street?.trim() && addressForm.city?.trim() && addressForm.state?.trim())
  );

  const goToStep = useCallback((newStep: number) => {
    let target = Math.max(1, Math.min(newStep, 5));
    if (target >= 3 && !hasValidAddress) {
      target = 2;
    }
    if (target >= 5 && paymentMethod === 'wallet' && hasInsufficientWallet) {
      target = 4;
    }
    setStep(target);
    updateUrlStep(target);
  }, [hasInsufficientWallet, hasValidAddress, paymentMethod]);

  const nextStep = () => goToStep(step + 1);

  const prevStep = () => goToStep(step - 1);

  useEffect(() => {
    if (!user) return;
    setAddressForm((currentAddress) => ({
      ...currentAddress,
      fullName: currentAddress.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name,
      phone: currentAddress.phone || user.phone || '',
    }));
  }, [user]);

  useEffect(() => {
    if (selectedDeliveryAddressId || !savedAddresses.length) return;
    const defaultAddress = savedAddresses[0];
    setSelectedDeliveryAddressId(defaultAddress.id);
    setAddressForm({
      fullName: defaultAddress.name,
      phone: user?.phone ?? '',
      street: defaultAddress.street,
      city: defaultAddress.city,
      state: defaultAddress.state,
      zipCode: defaultAddress.zip,
    });
  }, [savedAddresses, selectedDeliveryAddressId, user?.phone]);

  useEffect(() => {
    if (typeof window === 'undefined' || hasRestoredRef.current) return;
    if (isCartLoading) return;
    hasRestoredRef.current = true;

    if (!cartData || !cartData.items || cartData.items.length === 0) {
      try {
        localStorage.removeItem(CHECKOUT_STORAGE_KEY);
      } catch { }
      queueMicrotask(() => {
        setStep(1);
        updateUrlStep(1);
        setIsRestored(true);
      });
      return;
    }

    let savedState: SavedCheckoutState | null = null;
    try {
      const raw = localStorage.getItem(CHECKOUT_STORAGE_KEY);
      if (raw) savedState = JSON.parse(raw);
    } catch {
      savedState = null;
    }

    const currentUrl = new URL(window.location.href);
    const stepParam = currentUrl.searchParams.get('step');
    const parsedStep = stepParam ? parseInt(stepParam, 10) : null;
    let candidateStep = 1;

    if (parsedStep && parsedStep >= 1 && parsedStep <= 5) {
      candidateStep = parsedStep;
    } else if (savedState?.step && savedState.step >= 1 && savedState.step <= 5) {
      candidateStep = savedState.step;
    }

    const effectiveAddress = savedState?.addressForm ?? addressForm;
    const hasAddress = Boolean(
      savedState?.selectedDeliveryAddressId ||
      (effectiveAddress.fullName?.trim() && effectiveAddress.street?.trim() && effectiveAddress.city?.trim() && effectiveAddress.state?.trim())
    );

    let validatedStep = candidateStep;
    if (candidateStep >= 3 && !hasAddress) {
      validatedStep = 2;
    }
    const effectivePayment = savedState?.paymentMethod ?? paymentMethod;
    if (validatedStep >= 5 && effectivePayment === 'wallet' && hasInsufficientWallet) {
      validatedStep = 4;
    }

    queueMicrotask(() => {
      if (savedState) {
        if (savedState.paymentMethod === 'card' || savedState.paymentMethod === 'wallet') {
          setPaymentMethod(savedState.paymentMethod);
        }
        if (savedState.deliveryMethod === 1 || savedState.deliveryMethod === 2 || savedState.deliveryMethod === 3) {
          setDeliveryMethod(savedState.deliveryMethod);
        }
        if (typeof savedState.useShoppingCredits === 'boolean') {
          setUseShoppingCredits(savedState.useShoppingCredits);
        }
        if (typeof savedState.selectedDeliveryAddressId === 'number') {
          setSelectedDeliveryAddressId(savedState.selectedDeliveryAddressId);
        }
        if (savedState.addressForm) {
          setAddressForm((prev) => ({
            ...prev,
            ...savedState?.addressForm,
          }));
        }
        if (savedState.appliedReferral) {
          setAppliedReferral(savedState.appliedReferral);
        }
      }
      setStep(validatedStep);
      updateUrlStep(validatedStep);
      setIsRestored(true);
    });
  }, [addressForm, cartData, hasInsufficientWallet, isCartLoading, paymentMethod]);

  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const stepParam = urlParams.get('step');
      if (stepParam) {
        const parsed = parseInt(stepParam, 10);
        if (parsed >= 1 && parsed <= 5) {
          goToStep(parsed);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [goToStep]);

  useEffect(() => {
    if (typeof window === 'undefined' || !isRestored) return;
    if (!cartData || !cartData.items || cartData.items.length === 0) {
      try {
        localStorage.removeItem(CHECKOUT_STORAGE_KEY);
      } catch { }
      return;
    }

    const stateToSave: SavedCheckoutState = {
      cartFingerprint: `${cartData.items.length}_${cartData.subtotal}`,
      step,
      paymentMethod,
      deliveryMethod,
      useShoppingCredits,
      selectedDeliveryAddressId,
      addressForm,
      appliedReferral,
    };

    try {
      localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch { }
  }, [
    addressForm,
    appliedReferral,
    cartData,
    deliveryMethod,
    isRestored,
    paymentMethod,
    selectedDeliveryAddressId,
    step,
    useShoppingCredits,
  ]);

  // 2. Initialize Checkout Session

  const { data: sessionData, isLoading: isSessionLoading } = useQuery({

    queryKey: ['checkoutSession', cartData?.id],

    queryFn: async () => {

      if (!cartData?.id) return null;

      const res = await initializeCheckout(cartData.id);

      return res.data;

    },

    enabled: Boolean(cartData?.id && cartData.items.length > 0)

  });

  // 3. Process Checkout Mutation

  const processMutation = useMutation({

    mutationFn: async () => {

      if (!sessionData?.id) throw new Error('No active session');

      const res = await processCheckout(
        sessionData.id,
        addressForm,
        { method: paymentMethod },
        selectedDeliveryAddressId,
        deliveryMethod,
        appliedReferral?.code,
        useShoppingCredits,
      );

      return res.data;

    },

    onSuccess: async (data) => {

      await clearCart();
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(CHECKOUT_STORAGE_KEY);
        } catch { }
      }

      if (data.authorizationUrl) {

        window.location.assign(data.authorizationUrl);

        return;

      }

      router.push(`/checkout/success?orderId=${data.orderId}`);

    }

  });

  const handlePaymentNextStep = () => {
    if (paymentMethod === 'wallet' && hasInsufficientWallet) {
      toast.error('Insufficient funds', {
        description: 'Your wallet balance is lower than the purchase amount. Please fund your wallet to continue.',
        action: {
          label: 'Fund Wallet',
          onClick: () => window.open('/portal/wallet', '_blank'),
        },
      });
      return;
    }
    nextStep();
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === 'wallet' && hasInsufficientWallet) {
      toast.error('Insufficient funds', {
        description: 'Your wallet balance is lower than the purchase amount. Please fund your wallet to continue.',
        action: {
          label: 'Fund Wallet',
          onClick: () => window.open('/portal/wallet', '_blank'),
        },
      });
      goToStep(4);
      return;
    }
    processMutation.mutate();
  };

  const steps = [

    { num: 1, title: 'Customer Info' },

    { num: 2, title: 'Delivery Address' },

    { num: 3, title: 'Delivery Method' },

    { num: 4, title: 'Payment' },

    { num: 5, title: 'Review' },

  ];

  const isCartEmpty = !isCartLoading && !cartError && (!cartData || cartData.items.length === 0);

  useEffect(() => {
    if (!isCartEmpty || processMutation.isPending || processMutation.isSuccess) return;
    if (hasRedirectedEmptyCartRef.current) return;
    hasRedirectedEmptyCartRef.current = true;
    toast.info('Your cart is empty. Add items before proceeding to checkout.');
    router.replace('/cart');
  }, [isCartEmpty, processMutation.isPending, processMutation.isSuccess, router]);

  if (isCartLoading || isSessionLoading || isWalletLoading || isAddressesLoading || isCartEmpty) {

    return (

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex justify-center items-center h-64">

        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />

      </div>

    );

  }

  if (cartError || !cartData) {

    return (

      <ErrorState

        title="Failed to load checkout"

        description="Please try again."

      />

    );

  }

  if (cartData.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center mt-20">
        <h1 className="text-3xl font-bold text-text mb-4">Your cart is empty</h1>
        <p className="text-text-muted mb-8">You cannot proceed to checkout with an empty cart.</p>
        <Link href="/shop">
          <Button size="lg" className="rounded-full px-8">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">

      <div className="mb-8">

        <Link href="/cart" className="text-sm text-brand-600 hover:underline">← Back to Cart</Link>

        <h1 className="text-3xl font-bold text-text mt-4">Checkout</h1>

      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Main Checkout Flow */}

        <div className="flex-1">

          {/* Progress Indicator */}

          <div className="flex items-center justify-between mb-8 relative">

            <div className="absolute left-0 top-1/3 -translate-y-1/2 w-full h-1 bg-surface-2 -z-10"></div>

            <div className="absolute left-0 top-1/3 -translate-y-1/2 h-1 bg-brand-600 -z-10 transition-all" style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}></div>

            {steps.map(s => (

              <div key={s.num} className="flex flex-col items-center">

                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${step > s.num ? 'bg-brand-600 border-brand-600 text-white' :

                  step === s.num ? 'bg-white border-brand-600 text-brand-600' : 'bg-white border-border text-text-muted'

                  }`}>

                  {step > s.num ? <Check className="w-4 h-4" /> : s.num}

                </div>

                <span className={`text-xs mt-2 hidden sm:block ${step >= s.num ? 'font-semibold text-text' : 'text-text-muted'}`}>{s.title}</span>

              </div>

            ))}

          </div>

          {shoppingCreditBalance > 0 && (
            <label className="mb-8 flex cursor-pointer items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
              <input type="checkbox" checked={useShoppingCredits} onChange={(event) => setUseShoppingCredits(event.target.checked)} className="mt-1 h-4 w-4" />
              <span><span className="block text-sm font-semibold text-amber-900">Use Shopping Credits</span><span className="block text-xs text-amber-800">Apply up to <AmountText amountInKobo={shoppingCreditBalance} /> from your non-withdrawable shopping credits before charging your selected payment method.</span></span>
            </label>
          )}

          {processMutation.isError && (

            <ErrorState

              title="Failed to process checkout"

              description={processMutation.error instanceof Error ? processMutation.error.message : 'Checkout failed. Please try again.'}

            />

          )}

          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden min-h-[400px]">

            {/* STEP 1: Info */}

            {step === 1 && (

              <div className="p-6 md:p-8 animate-in fade-in slide-in-from-right-4">

                <h2 className="text-xl font-bold text-text mb-6">Contact Information</h2>

                <div className="space-y-4">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                      <label className="block text-sm font-medium text-text mb-1">First Name</label>

                      <input type="text" className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm" value={user?.firstName ?? ''} readOnly />

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-text mb-1">Last Name</label>

                      <input type="text" className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm" value={user?.lastName ?? ''} readOnly />

                    </div>

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-text mb-1">Email Address</label>

                    <input type="email" className="w-full h-10 px-3 rounded-md border border-border bg-surface-1 text-sm text-text-muted" value={user?.email ?? ''} readOnly />

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-text mb-1">Phone Number</label>

                    <input type="tel" className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-brand-500 outline-none" value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} />

                  </div>

                </div>

                <div className="mt-8 flex justify-end">

                  <Button onClick={nextStep} size="lg">Continue to Address</Button>

                </div>

              </div>

            )}

            {/* STEP 2: Address */}

            {step === 2 && (

              <div className="p-6 md:p-8 animate-in fade-in slide-in-from-right-4">

                <h2 className="text-xl font-bold text-text mb-6">Delivery Address</h2>

                {addressesError && <p className="mb-4 text-sm text-error">Unable to load your saved addresses.</p>}
                <div className="space-y-3 mb-5">
                  {savedAddresses.map((savedAddress) => {
                    const isSelected = selectedDeliveryAddressId === savedAddress.id && !isAddingAddress;
                    return (
                      <button
                        type="button"
                        key={savedAddress.id}
                        onClick={() => {
                          setSelectedDeliveryAddressId(savedAddress.id);
                          setIsAddingAddress(false);
                          setAddressForm({ fullName: savedAddress.name, phone: '', street: savedAddress.street, city: savedAddress.city, state: savedAddress.state, zipCode: savedAddress.zip });
                        }}
                        className={`w-full border-2 rounded-lg p-4 text-left cursor-pointer relative flex items-start gap-4 ${isSelected ? 'border-brand-600 bg-brand-50' : 'border-border bg-white hover:border-brand-300'}`}
                      >
                        <MapPin className="mt-1 w-5 h-5 text-brand-600" />
                        <div>
                          <p className="font-semibold text-text">{savedAddress.name}</p>
                          <p className="text-sm text-text-muted mt-1">{savedAddress.street}</p>
                          <p className="text-sm text-text-muted">{savedAddress.city}, {savedAddress.state} {savedAddress.zip}</p>
                        </div>
                        {isSelected && <Check className="absolute top-4 right-4 w-5 h-5 text-brand-600" />}
                      </button>
                    );
                  })}
                </div>

                <button type="button" onClick={() => { setSelectedDeliveryAddressId(undefined); setIsAddingAddress(true); }} className="text-brand-600 font-medium text-sm hover:underline">+ Add a new address</button>

                {(isAddingAddress || savedAddresses.length === 0) && (
                  <div className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-border bg-surface-1 p-4 sm:grid-cols-2">
                    <input value={addressForm.fullName} onChange={(event) => setAddressForm({ ...addressForm, fullName: event.target.value })} placeholder="Address label (e.g. Home)" className="h-10 rounded-md border border-border bg-white px-3 text-sm" />
                    <input value={addressForm.phone} onChange={(event) => setAddressForm({ ...addressForm, phone: event.target.value })} placeholder="Phone number" className="h-10 rounded-md border border-border bg-white px-3 text-sm" />
                    <input value={addressForm.street} onChange={(event) => setAddressForm({ ...addressForm, street: event.target.value })} placeholder="Street address" className="h-10 rounded-md border border-border bg-white px-3 text-sm sm:col-span-2" />
                    <input value={addressForm.city} onChange={(event) => setAddressForm({ ...addressForm, city: event.target.value })} placeholder="City" className="h-10 rounded-md border border-border bg-white px-3 text-sm" />
                    <select
                      value={addressForm.state}
                      onChange={(event) => setAddressForm({ ...addressForm, state: event.target.value })}
                      aria-label="State"
                      className="h-10 rounded-md border border-border bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="">Select State</option>
                      {NIGERIAN_STATES.map((stateName) => (
                        <option key={stateName} value={stateName}>
                          {stateName}
                        </option>
                      ))}
                    </select>
                    <input value={addressForm.zipCode} onChange={(event) => setAddressForm({ ...addressForm, zipCode: event.target.value })} placeholder="Postal code (optional)" className="h-10 rounded-md border border-border bg-white px-3 text-sm" />
                  </div>
                )}

                <div className="mt-8 flex justify-between">

                  <Button variant="outline" onClick={prevStep}>Back</Button>

                  <Button onClick={nextStep} size="lg" disabled={!selectedDeliveryAddressId && (!addressForm.fullName || !addressForm.street || !addressForm.city || !addressForm.state)}>Continue to Delivery</Button>

                </div>

              </div>

            )}

            {/* STEP 3: Delivery */}

            {step === 3 && (

              <div className="p-6 md:p-8 animate-in fade-in slide-in-from-right-4">

                <h2 className="text-xl font-bold text-text mb-6">Delivery Method</h2>

                <div className="space-y-4">

                  <label className={`border-2 rounded-lg p-4 flex items-center justify-between cursor-pointer ${deliveryMethod === 1 ? 'border-brand-600 bg-brand-50' : 'border-border bg-white'}`}>

                    <div className="flex items-center gap-3">

                      <input type="radio" name="delivery" checked={deliveryMethod === 1} onChange={() => setDeliveryMethod(1)} className="text-brand-600 w-4 h-4" />

                      <div>

                        <p className="font-semibold text-text flex items-center gap-2"><Truck className="w-4 h-4" /> Standard Delivery</p>

                        <p className="text-sm text-text-muted">3-5 Business Days</p>

                      </div>

                    </div>

                    <span className="font-bold"><AmountText amountInKobo={150000} /></span>

                  </label>

                  <label className={`border-2 rounded-lg p-4 flex items-center justify-between cursor-pointer ${deliveryMethod === 2 ? 'border-brand-600 bg-brand-50' : 'border-border bg-white hover:border-brand-300'}`}>

                    <div className="flex items-center gap-3">

                      <input type="radio" name="delivery" checked={deliveryMethod === 2} onChange={() => setDeliveryMethod(2)} className="text-brand-600 w-4 h-4" />

                      <div>

                        <p className="font-semibold text-text">Express Delivery</p>

                        <p className="text-sm text-text-muted">1-2 Business Days</p>

                      </div>

                    </div>

                    <span className="font-bold"><AmountText amountInKobo={300000} /></span>

                  </label>

                </div>

                <div className="mt-8 flex justify-between">

                  <Button variant="outline" onClick={prevStep}>Back</Button>

                  <Button onClick={nextStep} size="lg">Continue to Payment</Button>

                </div>

              </div>

            )}

            {/* STEP 4: Payment */}

            {step === 4 && (

              <div className="p-6 md:p-8 animate-in fade-in slide-in-from-right-4">

                <h2 className="text-xl font-bold text-text mb-6">Payment Method</h2>

                <div className="space-y-4">

                  <label className={`border-2 rounded-lg p-4 flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-brand-600 bg-brand-50' : 'border-border bg-white'}`}>

                    <div className="flex items-center gap-3">

                      <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="text-brand-600 w-4 h-4" />

                      <div>

                        <p className="font-semibold text-text flex items-center gap-2"><CreditCard className="w-4 h-4" /> Credit / Debit Card</p>

                      </div>

                    </div>

                  </label>

                  <label className={`border-2 rounded-lg p-4 flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'wallet' ? 'border-brand-600 bg-brand-50' : 'border-border bg-white'}`}>

                    <div className="flex items-center gap-3">

                      <input type="radio" name="payment" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} className="text-brand-600 w-4 h-4" />

                      <div>

                        <p className="font-semibold text-text flex items-center gap-2"><Wallet className="w-4 h-4" /> {brand.shortName} Wallet</p>

                        <p className="text-sm text-text-muted flex items-center gap-2 flex-wrap">
                          <span>Balance: <AmountText amountInKobo={walletBalance} /></span>
                          {hasInsufficientWallet && (
                            <span className="text-xs text-error font-medium">
                              (Needs <AmountText amountInKobo={checkoutTotal - walletBalance} /> more)
                            </span>
                          )}
                        </p>

                      </div>

                    </div>

                    {hasInsufficientWallet && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-error/10 text-error border border-error/20 shrink-0">
                        Insufficient funds
                      </span>
                    )}

                  </label>

                </div>

                {paymentMethod === 'card' && (

                  <div className="mt-6 bg-surface-1 p-4 rounded-lg border border-border">

                    <p className="text-sm text-text-muted text-center">You will be redirected to our secure payment gateway to complete your purchase after reviewing your order.</p>

                  </div>

                )}

                {paymentMethod === 'wallet' && (

                  <div className={`mt-6 p-4 rounded-lg border ${hasInsufficientWallet ? 'bg-error/5 border-error/30' : 'bg-surface-1 border-border'}`}>

                    {hasInsufficientWallet ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-error">Insufficient funds</p>
                            <p className="text-xs text-text-muted mt-0.5">
                              Your wallet balance (<AmountText amountInKobo={walletBalance} />) is lower than the order total (<AmountText amountInKobo={checkoutTotal} />). Please fund your wallet to continue.
                            </p>
                          </div>
                        </div>
                        <Link
                          href="/portal/wallet"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-brand-600 text-white hover:bg-brand-700 shrink-0 self-start sm:self-auto transition-colors"
                        >
                          Fund Wallet <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ) : (
                      <p className="text-sm text-text-muted text-center">
                        Payment will be deducted directly from your wallet balance.
                      </p>
                    )}

                  </div>

                )}

                <div className="mt-8 flex justify-between">

                  <Button variant="outline" onClick={prevStep}>Back</Button>

                  <Button onClick={handlePaymentNextStep} size="lg">Review Order</Button>

                </div>

              </div>

            )}

            {/* STEP 5: Review */}

            {step === 5 && (

              <div className="p-6 md:p-8 animate-in fade-in slide-in-from-right-4">

                <h2 className="text-xl font-bold text-text mb-6">Review Your Order</h2>

                <div className="bg-warning-light/30 border border-warning-main/30 rounded-lg p-4 flex items-start gap-3 mb-6">

                  <AlertCircle className="w-5 h-5 text-warning-dark shrink-0" />

                  <p className="text-sm text-warning-dark">Please review your order details carefully before placing your order. Orders cannot be easily modified once placed.</p>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                  <div className="bg-surface-1 p-4 rounded-lg border border-border">

                    <div className="flex justify-between items-center mb-2">

                      <h3 className="font-semibold text-text">Delivery Address</h3>

                      <button onClick={() => goToStep(2)} className="text-xs text-brand-600 hover:underline">Edit</button>

                    </div>

                    <p className="text-sm text-text-muted">{addressForm.fullName}</p>

                    <p className="text-sm text-text-muted">{addressForm.street}, {addressForm.city}</p>

                    <p className="text-sm text-text-muted">{addressForm.phone}</p>

                  </div>

                  <div className="bg-surface-1 p-4 rounded-lg border border-border">

                    <div className="flex justify-between items-center mb-2">

                      <h3 className="font-semibold text-text">Payment & Delivery</h3>

                      <button onClick={() => goToStep(3)} className="text-xs text-brand-600 hover:underline">Edit</button>

                    </div>

                    <p className="text-sm text-text-muted capitalize">Method: {paymentMethod === 'card' ? 'Card Payment (Gateway)' : `${brand.shortName} Wallet`}</p>

                    <p className="text-sm text-text-muted">Shipping: {deliveryMethod === 2 ? 'Express Delivery' : 'Standard Delivery'} (<AmountText amountInKobo={deliveryFee} />)</p>

                  </div>

                </div>

                <div className="mt-8 flex justify-between">

                  <Button variant="outline" onClick={prevStep} disabled={processMutation.isPending}>Back</Button>

                  <Button

                    onClick={handlePlaceOrder}

                    size="lg"

                    className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50"

                    disabled={processMutation.isPending}

                  >

                    {processMutation.isPending ? (

                      <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Processing...</span>

                    ) : (

                      <>Place Order (<AmountText amountInKobo={checkoutTotal} />)</>

                    )}

                  </Button>

                </div>

              </div>

            )}

          </div>

        </div>

        {/* Order Summary Sidebar */}

        <div className="w-full lg:w-[380px] shrink-0">

          <div className="bg-white rounded-xl border border-border shadow-sm p-6 sticky top-24">

            <h2 className="text-lg font-bold text-text mb-4">Summary</h2>

            <div className="max-h-60 overflow-y-auto mb-4 divide-y divide-border pr-2">

              {cartData.items.map(item => (

                <div key={item.id} className="py-3 flex gap-3">

                  <div className="w-12 h-12 rounded border border-border shrink-0 overflow-hidden bg-surface-1">

                    {item.productImage && <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />}

                  </div>

                  <div className="flex-1">

                    <p className="text-sm font-medium text-text line-clamp-1">{item.productName}</p>

                    <div className="flex justify-between items-center mt-1">

                      <span className="text-xs text-text-muted">Qty: {item.quantity}</span>

                      <span className="text-sm font-bold text-text"><AmountText amountInKobo={item.price * item.quantity} /></span>

                    </div>

                  </div>

                </div>

              ))}

            </div>

            {/* Referral Section */}

            <div className="mb-6 border-t border-border pt-4">

              <h3 className="text-sm font-semibold mb-2">Referred by someone?</h3>

              {appliedReferral ? (

                <div className="flex items-center justify-between bg-success-light/30 border border-success-main/30 rounded p-3 text-sm">

                  <div>

                    <span className="block text-success-dark font-medium flex items-center gap-1">

                      <Check className="w-4 h-4" /> Referral applied

                    </span>

                    <span className="text-success-dark/80 text-xs">Supporting {appliedReferral.name}</span>

                  </div>

                  <button onClick={() => setAppliedReferral(null)} className="text-success-dark hover:text-success-dark/70 font-medium text-xs">

                    Remove

                  </button>

                </div>

              ) : (

                <div className="flex flex-col gap-2 relative">

                  <div className="relative">

                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />

                    <input

                      type="text"

                      // placeholder="Search name or referral code..."

                      placeholder='enter Aba, Emeka, Sarah'

                      value={referralInput}

                      onChange={(e) => {
                        const value = e.target.value;
                        setReferralInput(value);
                        setSelectedReferral(null);
                        if (value.trim().length < 2) {
                          setSearchResults([]);
                        }
                      }}

                      className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"

                    />

                  </div>

                  {searchResults.length > 0 && (

                    <div className="absolute top-11 left-0 w-full bg-white border border-border rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">

                      {searchResults.map(user => (

                        <button
                          type="button"
                          key={user.customerId}

                          className="flex items-center gap-3 p-3 border-b border-border last:border-0 hover:bg-surface-1 cursor-pointer transition-colors"

                          onClick={() => {
                            setSelectedReferral(user);
                            setSearchResults([]);
                          }}

                        >

                          <div className="flex-1 overflow-hidden">

                            <p className="font-medium text-sm text-text truncate">{user.name}</p>

                            <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">

                              <span>{user.username ? `@${user.username}` : 'Customer'}</span>

                              <span>•</span>

                              <span className="font-mono">{user.referralCode}</span>

                            </div>

                          </div>

                        </button>

                      ))}

                    </div>

                  )}

                  {selectedReferral && (
                    <div className="flex items-center justify-between rounded border border-brand-200 bg-brand-50 p-3 text-sm">
                      <span>Use <strong>{selectedReferral.name}</strong>&apos;s referral code?</span>
                      <div className="flex gap-2"><Button type="button" size="sm" variant="outline" onClick={() => setSelectedReferral(null)}>Cancel</Button><Button type="button" size="sm" onClick={() => { setAppliedReferral({ code: selectedReferral.referralCode, name: selectedReferral.name }); setSelectedReferral(null); setReferralInput(''); setSearchResults([]); }}>Confirm</Button></div>
                    </div>
                  )}
                  <p className="text-xs text-text-muted">Search by referral code or username, then confirm the customer who referred you.</p>

                </div>

              )}

            </div>

            <div className="space-y-3 text-sm mb-6 border-t border-border pt-4">

              <div className="flex justify-between">

                <span className="text-text-muted">Subtotal</span>

                <span className="font-medium text-text"><AmountText amountInKobo={cartData.subtotal} /></span>

              </div>

              {shoppingCreditApplied > 0 && (
                <div className="flex justify-between text-success-dark">
                  <span>Shopping credits</span>
                  <span className="font-medium">−<AmountText amountInKobo={shoppingCreditApplied} /></span>
                </div>
              )}

              <div className="flex justify-between">

                <span className="text-text-muted">Delivery</span>

                <span className="font-medium text-text"><AmountText amountInKobo={deliveryFee} /></span>

              </div>

              <div className="border-t border-border pt-3 mt-2">

                <div className="flex justify-between items-center">

                  <span className="font-bold text-text text-base">Total</span>

                  <span className="font-bold text-brand-600 text-xl"><AmountText amountInKobo={checkoutTotal} /></span>

                </div>

              </div>

            </div>

            <div className="flex items-center gap-2 text-xs text-text-muted justify-center bg-surface-1 p-2 rounded">

              <ShieldCheck className="w-4 h-4 text-success-main" />

              <span>SSL Secured Payment</span>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
