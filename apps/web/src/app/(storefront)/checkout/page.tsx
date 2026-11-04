'use client';

import { brand } from '@/config/brand';

import { Suspense, useState, useEffect } from 'react';

import Link from 'next/link';

import { useRouter } from 'next/navigation';

import { Check, ShieldCheck, MapPin, Truck, CreditCard, Wallet, AlertCircle, Loader2, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useQuery, useMutation } from '@tanstack/react-query';

import { getCart } from '@/features/cart/api';

import { useCartStore } from '@/features/cart/store';

import { getDeliveryAddresses, initializeCheckout, processCheckout } from '@/features/checkout/api';

import { CheckoutAddressInput } from '@/features/checkout/schemas';

import { AmountText } from '@/components/patterns/AmountText';

import { ErrorState } from '@/components/patterns/ErrorState';

import { getCustomerWalletBalance, getShoppingCreditBalance } from '@/features/portal/api';

const MOCK_REFERRERS = [

{ id: '1', name: 'Chisom Nwokwu', moniker: '@chisomn', code: 'REF-CN2026', image: 'https://i.pravatar.cc/150?u=chisomn' },

{ id: '2', name: 'Aba Merchant Hub', moniker: '@abahub', code: 'REF-ABA8', image: 'https://i.pravatar.cc/150?u=abahub' },

{ id: '3', name: 'Emeka Onyeka', moniker: '@emeka_o', code: 'REF-EMK01', image: 'https://i.pravatar.cc/150?u=emeka_o' },

{ id: '4', name: 'Sarah Chidimma', moniker: '@sarahc', code: 'REF-SC44', image: 'https://i.pravatar.cc/150?u=sarahc' },

{ id: '5', name: 'David Okafor', moniker: '@davido', code: 'REF-DO99', image: 'https://i.pravatar.cc/150?u=davido' },

];

function CheckoutContent() {

  const router = useRouter();

  const clearCart = useCartStore((state) => state.clearCart);

  const [step, setStep] = useState(1);

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card');
  const [useShoppingCredits, setUseShoppingCredits] = useState(true);

  const [selectedDeliveryAddressId, setSelectedDeliveryAddressId] = useState<number | undefined>();
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const [referralInput, setReferralInput] = useState('');

  const [searchResults, setSearchResults] = useState<typeof MOCK_REFERRERS>([]);

  const [appliedReferral, setAppliedReferral] = useState<{ code: string, name: string } | null>(null);

useEffect(() => {

if (referralInput.trim().length > 1) {

      const query = referralInput.toLowerCase();

      const results = MOCK_REFERRERS.filter(r =>

r.name.toLowerCase().includes(query) ||

r.moniker.toLowerCase().includes(query) ||

r.code.toLowerCase().includes(query)

);

setSearchResults(results);

    } else {

setSearchResults([]);

    }

  }, [referralInput]);

  const [addressForm, setAddressForm] = useState<CheckoutAddressInput>({

    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: ''

});

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

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

  useEffect(() => {
    if (selectedDeliveryAddressId || !savedAddresses.length) return;
    const defaultAddress = savedAddresses[0];
    setSelectedDeliveryAddressId(defaultAddress.id);
    setAddressForm({
      fullName: defaultAddress.name,
      phone: '',
      street: defaultAddress.street,
      city: defaultAddress.city,
      state: defaultAddress.state,
      zipCode: defaultAddress.zip,
    });
  }, [savedAddresses, selectedDeliveryAddressId]);

// 2. Initialize Checkout Session

  const { data: sessionData, isLoading: isSessionLoading } = useQuery({

    queryKey: ['checkoutSession', cartData?.id],

queryFn: async () => {

      if (!cartData?.id) return null;

const res = await initializeCheckout(cartData.id);

      return res.data;

},

    enabled: !!cartData?.id

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
        (appliedReferral?.code ?? referralInput.trim()) || undefined,
        useShoppingCredits,
);

      return res.data;

},

onSuccess: async (data) => {

      await clearCart();

      if (data.authorizationUrl) {

window.location.assign(data.authorizationUrl);

        return;

}

router.push(`/checkout/success?orderId=${data.orderId}`);

}

});

  const handlePlaceOrder = () => {

processMutation.mutate();

};

  const steps = [

{ num: 1, title: 'Customer Info' },

{ num: 2, title: 'Delivery Address' },

{ num: 3, title: 'Delivery Method' },

{ num: 4, title: 'Payment' },

{ num: 5, title: 'Review' },

];

if (isCartLoading || isSessionLoading || isWalletLoading || isAddressesLoading) {

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

                {shoppingCreditBalance > 0 && (
                  <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
                    <input type="checkbox" checked={useShoppingCredits} onChange={(event) => setUseShoppingCredits(event.target.checked)} className="mt-1 h-4 w-4" />
                    <span><span className="block text-sm font-semibold text-amber-900">Use Shopping Credits</span><span className="block text-xs text-amber-800">Apply up to <AmountText amountInKobo={shoppingCreditBalance} /> from your non-withdrawable shopping credits before charging your selected payment method.</span></span>
                  </label>
                )}

                <span className={`text-xs mt-2 hidden sm:block ${step >= s.num ? 'font-semibold text-text' : 'text-text-muted'}`}>{s.title}</span>

              </div>

            ))}

          </div>

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

                      <input type="text" className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-brand-500 outline-none" defaultValue="Jane" />

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-text mb-1">Last Name</label>

                      <input type="text" className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-brand-500 outline-none" defaultValue="Doe" />

                    </div>

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-text mb-1">Email Address</label>

                    <input type="email" className="w-full h-10 px-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-brand-500 outline-none" defaultValue="jane.doe@example.com" />

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
                    <input value={addressForm.state} onChange={(event) => setAddressForm({ ...addressForm, state: event.target.value })} placeholder="State" className="h-10 rounded-md border border-border bg-white px-3 text-sm" />
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

                  <label className="border-2 border-brand-600 rounded-lg p-4 bg-brand-50 flex items-center justify-between cursor-pointer">

                    <div className="flex items-center gap-3">

                      <input type="radio" name="delivery" defaultChecked className="text-brand-600 w-4 h-4" />

                      <div>

                        <p className="font-semibold text-text flex items-center gap-2"><Truck className="w-4 h-4" /> Standard Delivery</p>

                        <p className="text-sm text-text-muted">3-5 Business Days</p>

                      </div>

                    </div>

                    <span className="font-bold"><AmountText amountInKobo={250000} /></span>

                  </label>

                  <label className="border border-border rounded-lg p-4 bg-white flex items-center justify-between cursor-pointer hover:border-brand-300">

                    <div className="flex items-center gap-3">

                      <input type="radio" name="delivery" className="text-brand-600 w-4 h-4" />

                      <div>

                        <p className="font-semibold text-text">Express Delivery</p>

                        <p className="text-sm text-text-muted">1-2 Business Days</p>

                      </div>

                    </div>

                    <span className="font-bold"><AmountText amountInKobo={500000} /></span>

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

                        <p className="text-sm text-text-muted">Balance: <AmountText amountInKobo={walletBalance} /></p>

                      </div>

                    </div>

                  </label>

                </div>

                {paymentMethod === 'card' && (

                  <div className="mt-6 bg-surface-1 p-4 rounded-lg border border-border">

                    <p className="text-sm text-text-muted text-center">You will be redirected to our secure payment gateway to complete your purchase after reviewing your order.</p>

                  </div>

                )}

                <div className="mt-8 flex justify-between">

                  <Button variant="outline" onClick={prevStep}>Back</Button>

                  <Button onClick={nextStep} size="lg">Review Order</Button>

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

                      <button onClick={() => setStep(2)} className="text-xs text-brand-600 hover:underline">Edit</button>

                    </div>

                    <p className="text-sm text-text-muted">{addressForm.fullName}</p>

                    <p className="text-sm text-text-muted">{addressForm.street}, {addressForm.city}</p>

                    <p className="text-sm text-text-muted">{addressForm.phone}</p>

                  </div>

                  <div className="bg-surface-1 p-4 rounded-lg border border-border">

                    <div className="flex justify-between items-center mb-2">

                      <h3 className="font-semibold text-text">Payment & Delivery</h3>

                      <button onClick={() => setStep(3)} className="text-xs text-brand-600 hover:underline">Edit</button>

                    </div>

                    <p className="text-sm text-text-muted capitalize">Method: {paymentMethod === 'card' ? 'Card Payment (Gateway)' : '{brand.shortName} Wallet'}</p>

                    <p className="text-sm text-text-muted">Shipping: Standard Delivery</p>

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

                      <>Place Order (<AmountText amountInKobo={cartData.total} />)</>

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

onChange={(e) => setReferralInput(e.target.value)}

className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"

                    />

                  </div>

                  {searchResults.length > 0 && (

                    <div className="absolute top-11 left-0 w-full bg-white border border-border rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">

                      {searchResults.map(user => (

                        <div

key={user.id}

className="flex items-center gap-3 p-3 border-b border-border last:border-0 hover:bg-surface-1 cursor-pointer transition-colors"

onClick={() => {

setAppliedReferral({ code: user.code, name: user.moniker });

setReferralInput('');

setSearchResults([]);

                          }}

                        >

                          <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full object-cover shrink-0" />

                          <div className="flex-1 overflow-hidden">

                            <p className="font-medium text-sm text-text truncate">{user.name}</p>

                            <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">

                              <span>{user.moniker}</span>

                              <span>•</span>

                              <span className="font-mono">{user.code}</span>

                            </div>

                          </div>

                        </div>

                      ))}

                    </div>

                  )}

                  <p className="text-xs text-text-muted">Enter the name or referral code of the person who referred you.</p>

                </div>

              )}

            </div>

            <div className="space-y-3 text-sm mb-6 border-t border-border pt-4">

              <div className="flex justify-between">

                <span className="text-text-muted">Subtotal</span>

                <span className="font-medium text-text"><AmountText amountInKobo={cartData.subtotal} /></span>

              </div>

              <div className="flex justify-between">

                <span className="text-text-muted">Delivery</span>

                <span className="font-medium text-text"><AmountText amountInKobo={cartData.deliveryFee} /></span>

              </div>

              <div className="border-t border-border pt-3 mt-2">

                <div className="flex justify-between items-center">

                  <span className="font-bold text-text text-base">Total</span>

                  <span className="font-bold text-brand-600 text-xl"><AmountText amountInKobo={cartData.total} /></span>

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
