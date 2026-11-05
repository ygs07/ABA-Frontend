import { Customer } from '../types';

interface Props {
  customer: Customer;
}

export function CustomerActivityTab({ customer }: Props) {
  const activity = [
    ...(customer.orders ?? []).map((order) => ({
      id: `order-${order.id}`,
      action: 'Order placed',
      details: `Placed order ${order.orderNumber}`,
      date: order.createdAt,
      user: `${customer.firstName} ${customer.lastName}`,
    })),
    {
      id: 'registered',
      action: 'Customer registered',
      details: 'Customer account was created.',
      date: customer.registeredAt,
      user: 'System',
    },
  ].sort((first, second) => new Date(second.date).getTime() - new Date(first.date).getTime());

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h3 className="font-medium mb-6">Activity Timeline</h3>
      
      <div className="relative border-l border-border ml-3 space-y-8">
        {activity.map((activity) => (
          <div key={activity.id} className="relative pl-6">
            <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-border border-2 border-surface" />
            <div className="mb-1">
              <span className="font-medium text-text">{activity.action}</span>
              <span className="mx-2 text-text-muted">•</span>
              <span className="text-xs text-text-muted">
                {new Date(activity.date).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-text-muted mb-1">{activity.details}</p>
            <p className="text-xs text-text-muted">By: {activity.user}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
