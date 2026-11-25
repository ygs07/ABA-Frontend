'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ChevronRight, Loader2, Package, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/ui/MotionPrimitives';
import { SPRING_GENTLE } from '@/lib/motion';
import { API_MODE, fetchApi } from '@/lib/api';
import { getOrderDetail } from '@/features/checkout/api';
import { OrderSuccessDetails } from '@/features/checkout/components/OrderSuccessDetails';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference') ?? searchParams.get('trxref');
  const initialOrderId =
    searchParams.get('orderId') ||
    searchParams.get('order_id') ||
    searchParams.get('orderNumber') ||
    searchParams.get('order_number');

  // Verify Paystack transaction if reference is present
  const {
    data: paymentVerification,
    isLoading: isVerifying,
    error: verifyError,
  } = useQuery({
    queryKey: ['checkout_payment_verify', reference],
    queryFn: async () => {
      const payment = await fetchApi<{
        order_id: number;
        status: 'successful' | 'pending' | 'failed';
      }>(`/api/v1/payments/paystack/${encodeURIComponent(reference!)}/verify`);

      if (payment.status !== 'successful') {
        throw new Error('Your payment has not been confirmed yet.');
      }
      return payment;
    },
    enabled: Boolean(reference),
    retry: 1,
  });

  const effectiveOrderId = paymentVerification?.order_id
    ? String(paymentVerification.order_id)
    : initialOrderId || (API_MODE === 'mock' ? '1840' : null);

  // Load the order details
  const {
    data: order,
    isLoading: isLoadingOrder,
    error: orderError,
  } = useQuery({
    queryKey: ['checkout_success_order', effectiveOrderId],
    queryFn: () => getOrderDetail(effectiveOrderId!),
    enabled: Boolean(effectiveOrderId),
    retry: 1,
  });

  if (isVerifying || (isLoadingOrder && Boolean(effectiveOrderId))) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-32 mt-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-text">
          {isVerifying ? 'Confirming your payment' : 'Loading your order details'}
        </h1>
        <p className="text-text-muted mt-2">
          {isVerifying
            ? 'Please wait while we verify your Paystack payment.'
            : 'Fetching your confirmed order information.'}
        </p>
      </div>
    );
  }

  const errorMessage = verifyError instanceof Error
    ? verifyError.message
    : orderError instanceof Error
      ? orderError.message
      : null;

  if (errorMessage) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-32 mt-20 text-center">
        <AlertCircle className="w-10 h-10 text-error mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-text">Unable to confirm order</h1>
        <p className="text-text-muted mt-2">{errorMessage}</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link href="/portal/orders">
            <Button>View My Orders</Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-32 mt-20 text-center">
        <Package className="w-10 h-10 text-text-muted mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-text">No order found</h1>
        <p className="text-text-muted mt-2">We could not locate this order. Please check your order history.</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link href="/portal/orders">
            <Button>View My Orders</Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const portalOrderUrl = `/portal/orders/${order.id || order.order_number}`;
  const trackOrderUrl = `/track-order?orderNumber=${encodeURIComponent(order.order_number)}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-20">
      {/* Success Banner */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={SPRING_GENTLE}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success-bg border-4 border-success-main/20 mb-6"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-10 h-10 text-success-dark"
            aria-hidden="true"
          >
            <motion.path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}
            />
          </svg>
        </motion.div>
        <FadeIn delay={0.1}>
          <h1 className="text-3xl font-extrabold text-text tracking-tight mb-2">Order Confirmed!</h1>
          <p className="text-lg text-text-muted">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </FadeIn>
      </div>

      {/* Main Order Details Card */}
      <FadeIn delay={0.2}>
        <OrderSuccessDetails order={order} />
      </FadeIn>

      {/* Action Navigation */}
      <FadeIn delay={0.3} className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href={portalOrderUrl} className="flex-1">
          <Button variant="outline" size="lg" className="w-full h-12">
            View Order in Portal
          </Button>
        </Link>
        <Link href={trackOrderUrl} className="flex-1">
          <Button variant="outline" size="lg" className="w-full h-12">
            <Search className="w-4 h-4 mr-2" />
            Track Order
          </Button>
        </Link>
        <Link href="/shop" className="flex-1">
          <Button size="lg" className="w-full h-12">
            Continue Shopping <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </FadeIn>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
