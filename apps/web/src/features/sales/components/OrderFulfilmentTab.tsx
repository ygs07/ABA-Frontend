import { Order } from '../types';
import { Button } from '@/components/ui/button';
import { Package, Truck, CheckCircle2 } from 'lucide-react';

interface OrderFulfilmentTabProps {
  order: Order;
  isUpdating?: boolean;
  onPackItems?: () => void;
  onMarkDelivered?: () => void;
}

export function OrderFulfilmentTab({
  order,
  isUpdating = false,
  onPackItems,
  onMarkDelivered,
}: OrderFulfilmentTabProps) {
  const isFulfilled = order.fulfilmentStatus === 'Fulfilled';
  const canPack =
    !isFulfilled && (order.status === 'Pending' || order.status === 'Processing');
  const canDeliver =
    !isFulfilled &&
    (order.status === 'Processing' || order.status === 'Shipped / Ready for pickup');

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-xl border border-border p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-medium text-lg">Fulfilment Status: <span className={isFulfilled ? 'text-success' : 'text-warning-dark'}>{order.fulfilmentStatus}</span></h3>
          <p className="text-sm text-text-muted mt-1">Track packing and delivery of order items.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={!canPack || isUpdating}
            onClick={onPackItems}
          >
            Pack Items
          </Button>
          <Button
            variant={isFulfilled ? 'outline' : 'primary'}
            disabled={!canDeliver || isUpdating}
            onClick={onMarkDelivered}
          >
            Mark Delivered
          </Button>
        </div>
      </div>
      
      <div className="relative border-l-2 border-border ml-4 space-y-8 pb-4">
        {isFulfilled && (
          <div className="relative pl-6">
            <div className="absolute w-6 h-6 bg-success text-white rounded-full flex items-center justify-center -left-[13px] top-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-medium">Delivered</h4>
              <p className="text-sm text-text-muted mt-0.5">Order was marked as delivered to the customer.</p>
              <p className="text-xs text-text-muted mt-1 font-mono">{new Date(order.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        )}
        
        {(order.fulfilmentStatus === 'Fulfilled' || order.fulfilmentStatus === 'Partially Fulfilled') && (
          <div className="relative pl-6">
            <div className="absolute w-6 h-6 bg-primary/10 text-primary border border-primary/20 rounded-full flex items-center justify-center -left-[13px] top-0">
              <Truck className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="font-medium">Packed & Ready</h4>
              <p className="text-sm text-text-muted mt-0.5">Items were packed from inventory.</p>
              <div className="mt-3 bg-surface-2 p-3 rounded-lg text-sm border border-border inline-block min-w-[300px]">
                <div className="font-medium mb-2 border-b border-border pb-2">Packed Items</div>
                <ul className="space-y-1">
                  {order.lines.map(line => (
                    <li key={line.id} className="flex justify-between">
                      <span className="text-text-muted">{line.productName}</span>
                      <span className="font-medium">{line.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <div className="relative pl-6">
          <div className="absolute w-6 h-6 bg-surface-2 text-text-muted border border-border rounded-full flex items-center justify-center -left-[13px] top-0">
            <Package className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-medium">Order Placed</h4>
            <p className="text-sm text-text-muted mt-0.5">Order was placed and stock was reserved.</p>
            <p className="text-xs text-text-muted mt-1 font-mono">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
