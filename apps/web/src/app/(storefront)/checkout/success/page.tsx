'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, ChevronRight, Loader2, Package, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/lib/api';
import { AmountText } from '@/components/patterns/AmountText';

type OrderSummary = { id: number; order_number: string; total_amount: string | number };

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference') ?? searchParams.get('trxref');
  const [orderId, setOrderId] = useState(searchParams.get('orderId'));
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(Boolean(reference));
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(Boolean(orderId));

  useEffect(() => {
    if (!reference) return;

    const verifyPayment = async () => {
      try {
        const payment = await fetchApi<{
          order_id: number;
          status: 'successful' | 'pending' | 'failed';
        }>(`/api/v1/payments/paystack/${encodeURIComponent(reference)}/verify`);
        if (payment.status !== 'successful') {
          throw new Error('Your payment has not been confirmed yet.');
        }
        setOrderId(String(payment.order_id));
      } catch (error) {
        setVerificationError(
          error instanceof Error
            ? error.message
            : 'Unable to verify your payment.',
        );
      } finally {
        setIsVerifying(false);
      }
    };

    void verifyPayment();
  }, [reference]);

  useEffect(() => {
    if (!orderId) return;
    setIsLoadingOrder(true);
    fetchApi<OrderSummary>(`/api/v1/orders/id/${encodeURIComponent(orderId)}`)
      .then(setOrder)
      .catch((error) => setVerificationError(error instanceof Error ? error.message : 'Unable to load your order.'))
      .finally(() => setIsLoadingOrder(false));
  }, [orderId]);

  if (isVerifying || isLoadingOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-32 mt-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-text">Confirming your payment</h1>
        <p className="text-text-muted mt-2">Please wait while we verify your Paystack payment.</p>
      </div>
    );
  }

  if (verificationError) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-32 mt-20 text-center">
        <AlertCircle className="w-10 h-10 text-error mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-text">Payment verification pending</h1>
        <p className="text-text-muted mt-2">{verificationError}</p>
        <Link href="/portal/orders" className="inline-block mt-6">
          <Button>View My Orders</Button>
        </Link>
      </div>
    );
  }

  const orderNumber = order?.order_number ?? (orderId ? `Order #${orderId}` : 'Your order');
  
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-20">
      
      {/* Success Banner */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success-bg border-4 border-success-main/20 mb-6">
          <CheckCircle2 className="w-10 h-10 text-success-dark" />
        </div>
        <h1 className="text-3xl font-extrabold text-text tracking-tight mb-2">Order Confirmed!</h1>
        <p className="text-lg text-text-muted">Thank you for your purchase. Your order has been successfully placed.</p>
      </div>

      <div className="bg-white border border-border shadow-sm rounded-xl overflow-hidden mb-8">
        <div className="bg-surface-1 px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div>
             <p className="text-sm text-text-muted mb-1">Order Number</p>
             <p className="font-bold text-text font-mono">{orderNumber}</p>
           </div>
           <div className="sm:text-right">
             <p className="text-sm text-text-muted mb-1">Total Amount</p>
             <p className="font-bold text-text text-lg">{order ? <AmountText amountInKobo={Math.round(Number(order.total_amount) * 100)} /> : '—'}</p>
           </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-600" />
              Delivery Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-text">Jane Doe</p>
                  <p className="text-sm text-text-muted">123 Market Street, Victoria Island, Lagos</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-text">Estimated Delivery</p>
                  <p className="text-sm text-text-muted">Oct 3 - Oct 5, 2026</p>
                </div>
              </div>
            </div>
          </div>

          <div>
             <h3 className="font-semibold text-text mb-4">What happens next?</h3>
             <ul className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-surface-2 before:to-transparent">
                <li className="flex items-center gap-3 relative">
                  <div className="w-4 h-4 rounded-full bg-success-main ring-4 ring-white z-10 shrink-0"></div>
                  <span className="text-sm text-text">Order placed successfully</span>
                </li>
                <li className="flex items-center gap-3 relative">
                  <div className="w-4 h-4 rounded-full bg-brand-200 ring-4 ring-white z-10 shrink-0"></div>
                  <span className="text-sm text-text-muted">Merchant processing your items</span>
                </li>
                <li className="flex items-center gap-3 relative">
                  <div className="w-4 h-4 rounded-full bg-surface-2 ring-4 ring-white z-10 shrink-0"></div>
                  <span className="text-sm text-text-muted">Order shipped for delivery</span>
                </li>
             </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href={orderId ? `/portal/orders/${orderId}` : '/portal/orders'} className="flex-1">
          <Button variant="outline" size="lg" className="w-full h-12">View Order Details</Button>
        </Link>
        <Link href="/shop" className="flex-1">
          <Button size="lg" className="w-full h-12">Continue Shopping <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </Link>
      </div>

    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
