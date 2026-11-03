'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, MapPin, CreditCard, Clock, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { downloadCustomerInvoice, getCustomerOrderById } from '@/features/portal/api';
import { AmountText } from '@/components/patterns/AmountText';
import { Alert } from '@/components/ui/alert';
import { toast } from 'sonner';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const orderId = unwrappedParams.id;

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['portal_order_detail', orderId],
    queryFn: async () => {
      const res = await getCustomerOrderById(orderId);
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          Failed to load order details. Please try again.
        </Alert>
      </div>
    );
  }

  const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = order.total - subtotal;

  const downloadInvoice = async () => {
    if (!order.backendId) {
      toast.error('Invoice download is unavailable for this order.');
      return;
    }
    try {
      await downloadCustomerInvoice(order.backendId);
    } catch (downloadError) {
      toast.error(downloadError instanceof Error ? downloadError.message : 'Unable to download the invoice.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portal/orders" className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-muted hover:bg-surface-2 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold text-text">Order Details</h1>
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-text">{order.id}</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wider bg-warning-light text-warning-dark border-warning-border">
              {order.status}
            </span>
          </div>
          <p className="text-sm text-text-muted flex items-center gap-2">
            <Clock className="w-4 h-4" /> Placed on {new Date(order.date).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => void downloadInvoice()}>
            <FileText className="w-4 h-4" /> Invoice
          </Button>
          <Button variant="destructive" className="bg-error hover:bg-error-hover text-white" disabled={order.status === 'Cancelled' || order.status === 'Delivered'}>
            Cancel Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content: Tracking & Items */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Timeline */}
          <div className="bg-white rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-bold text-text mb-6">Delivery Status</h3>
            <div className="relative">
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-border"></div>
              
              <div className="space-y-8 relative z-10">
                <div className={`flex gap-4 ${order.status === 'Cancelled' ? 'opacity-50' : ''}`}>
                  <div className="w-12 h-12 rounded-full bg-success-main text-white flex items-center justify-center border-4 border-white shadow-sm shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="pt-3">
                    <h4 className="font-bold text-text">Order Placed</h4>
                    <p className="text-sm text-text-muted">We have received your order.</p>
                  </div>
                </div>

                <div className={`flex gap-4 ${['Pending', 'Cancelled'].includes(order.status) ? 'opacity-50' : ''}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm shrink-0 ${['Processing', 'Shipped', 'Delivered'].includes(order.status) ? 'bg-warning-main text-white' : 'bg-surface-2 text-text-muted'}`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="pt-3">
                    <h4 className="font-bold text-text">Processing</h4>
                    <p className="text-sm text-text-muted">The merchant is preparing your items.</p>
                  </div>
                </div>

                <div className={`flex gap-4 ${['Pending', 'Processing', 'Cancelled'].includes(order.status) ? 'opacity-50' : ''}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm shrink-0 ${['Shipped', 'Delivered'].includes(order.status) ? 'bg-brand-600 text-white' : 'bg-surface-2 text-text-muted'}`}>
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="pt-3">
                    <h4 className="font-bold text-text">Shipped</h4>
                    <p className="text-sm text-text-muted">Your order has been handed over to the delivery partner.</p>
                  </div>
                </div>

                <div className={`flex gap-4 ${order.status !== 'Delivered' ? 'opacity-50' : ''}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm shrink-0 ${order.status === 'Delivered' ? 'bg-success-main text-white' : 'bg-surface-2 text-text-muted'}`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="pt-3">
                    <h4 className="font-bold text-text">Delivered</h4>
                    <p className="text-sm text-text-muted">Your order has arrived.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="bg-white rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-bold text-text mb-4">Items in Order</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface-2 px-4 py-3 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text">Order Items</span>
                </div>
              </div>
              <div className="divide-y divide-border">
                {order.items.map(item => (
                  <div key={item.id} className="p-4 flex items-center gap-4">
                    <div className="w-16 h-16 bg-surface-2 rounded overflow-hidden shrink-0 flex items-center justify-center">
                      <span className="text-brand-600 text-xs font-bold opacity-30">Image</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-text truncate">{item.productName}</h4>
                      <p className="text-sm font-medium mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-text"><AmountText amountInKobo={item.price} /></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Payment & Shipping Info */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-bold text-text mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Subtotal</span>
                <span className="font-medium text-text"><AmountText amountInKobo={subtotal} /></span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Delivery Fee</span>
                <span className="font-medium text-text"><AmountText amountInKobo={deliveryFee} /></span>
              </div>
              <div className="pt-3 border-t border-border flex justify-between">
                <span className="font-bold text-text">Total</span>
                <span className="font-bold text-brand-700 text-lg"><AmountText amountInKobo={order.total} /></span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-bold text-text mb-4">Payment Method</h3>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="font-semibold text-text capitalize">{order.paymentMethod}</p>
                <p className="text-sm text-text-muted"><AmountText amountInKobo={order.total} /> was deducted</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-bold text-text mb-4">Delivery Address</h3>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-text-muted" />
              </div>
              <div>
                <p className="font-semibold text-text">{order.shippingAddress.fullName}</p>
                <p className="text-sm text-text-muted mt-0.5">{order.shippingAddress.street}</p>
                <p className="text-sm text-text-muted">{order.shippingAddress.city}, {order.shippingAddress.zipCode}</p>
                <p className="text-sm text-text-muted mt-1">{order.shippingAddress.phone}</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
