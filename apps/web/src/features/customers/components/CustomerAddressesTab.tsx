import { Customer } from '../types';
import { MapPin } from 'lucide-react';

interface Props {
  customer: Customer;
}

export function CustomerAddressesTab({ customer }: Props) {
  return (
    <div className="space-y-6">
      <h3 className="font-medium text-lg">Saved Addresses</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customer.addresses.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-surface rounded-xl border border-border">
            <p className="text-text-muted text-sm">No addresses saved for this customer.</p>
          </div>
        ) : (
          customer.addresses.map((address) => (
            <div key={address.id} className="bg-surface p-5 rounded-xl border border-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium">{address.label}</span>
                  </div>
                  {address.isDefault && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                      Default
                    </span>
                  )}
                </div>
                <div className="text-sm text-text-muted space-y-1">
                  <p className="text-text font-medium">{customer.firstName} {customer.lastName}</p>
                  <p>{address.street}</p>
                  <p>{address.city}, {address.state}</p>
                  {address.lga && <p>{address.lga}</p>}
                  {address.landmark && <p>Landmark: {address.landmark}</p>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
