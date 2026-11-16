/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Package, MapPin, Calendar, CreditCard, CheckCircle2, Clock, Truck } from 'lucide-react';
import { OrderDetail } from '../types';
import { AmountText } from '@/components/patterns/AmountText';
import { formatDate, formatDateTime } from '@/lib/format';

interface OrderSuccessDetailsProps {
  order: OrderDetail;
}

function calculateEstimatedDelivery(createdAtStr?: string, method?: string) {
  const baseDate = createdAtStr ? new Date(createdAtStr) : new Date();
  const normalizedMethod = (method || '').toLowerCase();

  const startDays = normalizedMethod.includes('express') ? 1 : 2;
  const endDays = normalizedMethod.includes('express') ? 2 : 4;

  const startDate = new Date(baseDate);
  startDate.setDate(startDate.getDate() + startDays);

  const endDate = new Date(baseDate);
  endDate.setDate(endDate.getDate() + endDays);

  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

export function OrderSuccessDetails({ order }: OrderSuccessDetailsProps) {
  const primaryPayment = order.payments?.[0];
  const items = order.items ?? [];

  const totalAmountKobo = Math.round(Number(order.total_amount || 0) * 100);
  const deliveryCostKobo = Math.round(Number(order.delivery_cost || 0) * 100);
  const subtotalKobo = items.length > 0
    ? items.reduce((acc, item) => acc + Math.round(Number(item.total_price || (Number(item.unit_price) * item.quantity)) * 100), 0)
    : Math.max(0, totalAmountKobo - deliveryCostKobo);

  const deliveryMethodLabel = order.delivery_method
    ? `${order.delivery_method.charAt(0).toUpperCase()}${order.delivery_method.slice(1)} Delivery`
    : 'Standard Delivery';

  const estimatedDelivery = calculateEstimatedDelivery(order.createdAt, order.delivery_method);

  const paymentMethodLabel = primaryPayment?.payment_method === 'wallet' || order.payment_method === 2
    ? 'Aba Wallet'
    : primaryPayment?.payment_method === 'card' || order.payment_method === 1
      ? 'Card / Paystack'
      : primaryPayment?.payment_method
        ? `${primaryPayment.payment_method.charAt(0).toUpperCase()}${primaryPayment.payment_method.slice(1)}`
        : 'Payment Confirmed';

  return (
    <div className="bg-white border border-border shadow-sm rounded-xl overflow-hidden mb-8">
      {/* Header bar */}
      <div className="bg-surface-1 px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-text-muted mb-1">Order Number</p>
          <p className="font-mono font-bold text-text text-base sm:text-lg">{order.order_number}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs uppercase tracking-wider font-semibold text-text-muted mb-1">Total Paid</p>
          <p className="font-bold text-text text-xl">
            <AmountText amountInKobo={totalAmountKobo} />
          </p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Purchased Items */}
        <div>
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-600" />
            Items in this Order ({items.length})
          </h3>
          <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
            {items.map((item) => {
              const product = item.productVariant?.product;
              const variant = item.productVariant;
              const imgUrl = product?.images?.[0]?.url;
              const unitPriceKobo = Math.round(Number(item.unit_price) * 100);
              const totalPriceKobo = Math.round(Number(item.total_price || (Number(item.unit_price) * item.quantity)) * 100);

              return (
                <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-surface-1/50 transition-colors">
                  <div className="w-16 h-16 bg-surface-2 rounded border border-border overflow-hidden shrink-0 flex items-center justify-center">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={product?.name || 'Product'}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Package className="w-6 h-6 text-text-muted opacity-40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text truncate">{product?.name || 'Item'}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted mt-1">
                      {variant?.name && variant.name.toLowerCase() !== 'default' && (
                        <span className="bg-surface-2 px-2 py-0.5 rounded font-medium text-text">
                          {variant.name}
                        </span>
                      )}
                      {variant?.sku && (
                        <span className="font-mono text-text-muted">SKU: {variant.sku}</span>
                      )}
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-text text-sm sm:text-base">
                      <AmountText amountInKobo={totalPriceKobo} />
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-text-muted">
                        <AmountText amountInKobo={unitPriceKobo} /> each
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
          {/* Delivery & Shipping */}
          <div className="space-y-4">
            <h3 className="font-semibold text-text flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-600" />
              Delivery Details
            </h3>
            <div className="bg-surface-1 p-4 rounded-lg space-y-3 border border-border/60">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                <div className="text-sm">
                  {order.deliveryAddress?.name && (
                    <p className="font-semibold text-text">{order.deliveryAddress.name}</p>
                  )}
                  <p className="text-text-muted">{order.deliveryAddress?.street || 'Local delivery'}</p>
                  <p className="text-text-muted">
                    {[order.deliveryAddress?.city, order.deliveryAddress?.state, order.deliveryAddress?.zip]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 pt-2 border-t border-border/40">
                <Calendar className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-text">{deliveryMethodLabel}</p>
                  <p className="text-text-muted">Estimated Delivery: {estimatedDelivery}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold text-text flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-600" />
              Payment & Summary
            </h3>
            <div className="bg-surface-1 p-4 rounded-lg space-y-3 border border-border/60 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Payment Method</span>
                <span className="font-medium text-text">{paymentMethodLabel}</span>
              </div>
              {primaryPayment?.reference && (
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Reference</span>
                  <span className="font-mono text-xs font-semibold text-text">{primaryPayment.reference}</span>
                </div>
              )}
              {primaryPayment?.status && (
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Payment Status</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-success-bg text-success-dark border border-success-main/30 uppercase">
                    <CheckCircle2 className="w-3 h-3" />
                    {primaryPayment.status}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-border/60 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="font-medium text-text"><AmountText amountInKobo={subtotalKobo} /></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Delivery Fee</span>
                  <span className="font-medium text-text"><AmountText amountInKobo={deliveryCostKobo} /></span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border/60 text-base font-bold text-text">
                  <span>Total</span>
                  <span className="text-brand-700"><AmountText amountInKobo={totalAmountKobo} /></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline tracker */}
        <div className="pt-4 border-t border-border">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-600" />
            Order Progress
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-1 border border-success-main/30">
              <div className="w-6 h-6 rounded-full bg-success-main text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-text">Order Confirmed</p>
                <p className="text-xs text-text-muted">{order.createdAt ? formatDateTime(order.createdAt) : 'Just now'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-1 border border-border">
              <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <div>
                <p className="font-bold text-text">Processing</p>
                <p className="text-xs text-text-muted">Merchant packing items</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-1 border border-border opacity-70">
              <div className="w-6 h-6 rounded-full bg-surface-2 text-text-muted flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <div>
                <p className="font-bold text-text">Delivery</p>
                <p className="text-xs text-text-muted">{estimatedDelivery}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
