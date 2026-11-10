'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { downloadOrderInvoice, getOrderById, updateOrderItem, updateOrderStatus } from '@/features/sales/api/sales.api';
import { Order } from '@/features/sales/types';
import { Button } from '@/components/ui/button';
import { KpiCard } from '@/components/patterns/KpiCard';
import { AmountText } from '@/components/patterns/AmountText';
import { toast } from 'sonner';
import { OrderOverviewTab } from '@/features/sales/components/OrderOverviewTab';
import { OrderItemsTab } from '@/features/sales/components/OrderItemsTab';
import { OrderPaymentsTab } from '@/features/sales/components/OrderPaymentsTab';
import { OrderFulfilmentTab } from '@/features/sales/components/OrderFulfilmentTab';
import { OrderReturnsTab } from '@/features/sales/components/OrderReturnsTab';
import { OrderTimelineTab } from '@/features/sales/components/OrderTimelineTab';
import { OrderCommissionsTab } from '@/features/sales/components/OrderCommissionsTab';
const TABS = ['Overview', 'Items', 'Payments', 'Commissions', 'Fulfilment', 'Returns', 'Timeline'];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);

  const fulfilOrder = async () => {
    if (!order) return;
    const nextStatus = order.status === 'Pending'
      ? 2
      : order.status === 'Processing'
        ? 3
        : order.status === 'Shipped / Ready for pickup'
          ? 4
          : null;
    if (!nextStatus) return;
    try {
      const updatedOrder = await updateOrderStatus(order.id, nextStatus);
      setOrder(updatedOrder);
      toast.success('Order moved to its next fulfilment stage');
    } catch {
      toast.error('Failed to update the order status');
    }
  };
  const printInvoice = async () => {
    if (!order) return;
    try {
      await downloadOrderInvoice(order.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to download the invoice');
    }
  };

  const updateStatus = async () => {
    if (!order || !selectedStatus) return;
    try {
      const updatedOrder = await updateOrderStatus(order.id, selectedStatus);
      setOrder(updatedOrder);
      toast.success('Order status updated and customer notified');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update order status');
    }
  };

  const updateItem = async (itemId: string, data: { quantity?: number; status?: number }) => {
    if (!order) return;
    try {
      const updatedOrder = await updateOrderItem(order.id, itemId, data);
      setOrder(updatedOrder);
      toast.success('Order item updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update order item');
    }
  };

  useEffect(() => {
    getOrderById(id)
      .then(setOrder)
      .catch(() => {
        toast.error('Order not found');
        router.push('/erp/orders');
      })
      .finally(() => setIsLoading(false));
  }, [id, router]);

  if (isLoading) return <div className="p-8 text-center text-text-muted">Loading Order...</div>;
  if (!order) return null;

  return (
    <div className="space-y-6 pb-20 pt-4 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-h3 font-mono">{order.orderNumber}</h1>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              {order.status}
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-surface-2 text-text-muted border border-border">
              {order.channel}
            </span>
          </div>
          <div className="text-sm text-text-muted">
            Customer: <span className="font-medium text-text">{order.customerName}</span> • Placed: {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void printInvoice()}>Print Invoice</Button>
          <Button variant="outline">Record Payment</Button>
          {!['Completed', 'Cancelled', 'Refunded'].includes(order.status) && <Button onClick={fulfilOrder}>Advance Order</Button>}
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1"><p className="font-medium">Update order status</p><p className="text-sm text-text-muted">Customers receive an email with a tracking link after each change.</p></div>
        <select value={selectedStatus ?? ''} onChange={(event) => setSelectedStatus(Number(event.target.value) || null)} className="h-10 rounded-md border border-border bg-surface px-3 text-sm">
          <option value="">Choose next status</option>
          {order.status === 'Pending' && <option value="2">Processing</option>}
          {(order.status === 'Pending' || order.status === 'Processing') && <option value="5">Cancelled</option>}
          {order.status === 'Processing' && <option value="3">Shipped / Ready for pickup</option>}
          {order.status === 'Shipped / Ready for pickup' ? <option value="4">Order complete</option> : null}
          {['Pending', 'Processing', 'Shipped / Ready for pickup', 'Completed'].includes(order.status) && <option value="6">Refund requested</option>}
        </select>
        <Button onClick={updateStatus} disabled={!selectedStatus}>Update status</Button>
      </div>

      {/* Step Indicator */}
      <div className="bg-surface p-4 rounded-xl border border-border overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px]">
          <div className="flex flex-col items-center flex-1">
            <div className="w-8 h-8 rounded-full bg-success text-white flex items-center justify-center text-sm mb-2">✓</div>
            <span className="text-xs font-medium text-success">Placed</span>
          </div>
          <div className={`h-1 flex-1 ${order.paymentStatus === 'Paid' ? 'bg-success' : order.paymentStatus === 'Partially Paid' ? 'bg-warning-bg' : 'bg-surface-2'}`}></div>
          <div className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mb-2 ${order.paymentStatus === 'Paid' ? 'bg-success text-white' :
                order.paymentStatus === 'Partially Paid' ? 'bg-warning-bg border-2 border-warning-dark text-warning-dark' :
                  'bg-surface-2 text-text-muted'
              }`}>
              {order.paymentStatus === 'Paid' ? '✓' : '2'}
            </div>
            <span className={`text-xs font-medium ${order.paymentStatus === 'Unpaid' ? 'text-text-muted' : order.paymentStatus === 'Partially Paid' ? 'text-warning-dark' : 'text-success'}`}>
              Paid
            </span>
          </div>
          <div className={`h-1 flex-1 ${order.fulfilmentStatus === 'Fulfilled' ? 'bg-success' : 'bg-surface-2'}`}></div>
          <div className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mb-2 ${order.fulfilmentStatus === 'Fulfilled' ? 'bg-success text-white' :
                'bg-surface-2 text-text-muted'
              }`}>
              {order.fulfilmentStatus === 'Fulfilled' ? '✓' : '3'}
            </div>
            <span className={`text-xs font-medium ${order.fulfilmentStatus === 'Fulfilled' ? 'text-success' : 'text-text-muted'}`}>Packed</span>
          </div>
          <div className={`h-1 flex-1 ${order.status === 'Completed' ? 'bg-success' : 'bg-surface-2'}`}></div>
          <div className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mb-2 ${order.status === 'Completed' ? 'bg-success text-white' : 'bg-surface-2 text-text-muted'
              }`}>4</div>
            <span className={`text-xs font-medium ${order.status === 'Completed' ? 'text-success' : 'text-text-muted'}`}>Delivered</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Order Total" value={<AmountText amountInKobo={order.totalAmount} />} />
        <KpiCard title="Amount Paid" value={<AmountText amountInKobo={order.amountPaid} />} className={order.amountPaid > 0 ? 'text-success' : ''} />
        <KpiCard title="Balance Due" value={<AmountText amountInKobo={order.balanceDue} />} className={order.balanceDue > 0 ? 'text-error' : 'text-success'} />
        <KpiCard title="Payment Status" value={order.paymentStatus} />
      </div>

      {/* Tabs */}
      <div className="border-b border-border flex overflow-x-auto no-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text hover:border-border'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'Overview' && <OrderOverviewTab order={order} />}
        {activeTab === 'Items' && <OrderItemsTab order={order} onUpdateItem={updateItem} />}
        {activeTab === 'Payments' && <OrderPaymentsTab order={order} />}
        {activeTab === 'Commissions' && <OrderCommissionsTab orderId={order.id} />}
        {activeTab === 'Fulfilment' && <OrderFulfilmentTab order={order} />}
        {activeTab === 'Returns' && <OrderReturnsTab order={order} />}
        {activeTab === 'Timeline' && <OrderTimelineTab order={order} />}
      </div>

    </div>
  );
}
