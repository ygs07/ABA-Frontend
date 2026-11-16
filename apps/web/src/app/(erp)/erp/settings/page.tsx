'use client';
import { brand } from '@/config/brand';


import { PageHeader } from '@/components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      <PageHeader 
        title="Global Settings" 
        description="Manage company details, regional preferences, and system defaults."
        action={<Button>Save Changes</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Navigation Sidebar */}
        {/* <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start bg-surface-2">Company Profile</Button>
          <Button variant="ghost" className="w-full justify-start text-text-muted hover:bg-surface-2 hover:text-text">Regional & Taxes</Button>
          <Button variant="ghost" className="w-full justify-start text-text-muted hover:bg-surface-2 hover:text-text">Notifications</Button>
          <Button variant="ghost" className="w-full justify-start text-text-muted hover:bg-surface-2 hover:text-text">API & Webhooks</Button>
        </div> */}

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          
          <div className="bg-surface rounded-xl border border-border p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-1">Company Profile</h2>
              <p className="text-sm text-text-muted">Information displayed on customer-facing documents like invoices and receipts.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Legal Company Name</label>
                <Input defaultValue="${brand.shortName} Enterprises Ltd." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tax ID / TIN</label>
                <Input defaultValue="29910482-0001" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Support Email</label>
                <Input defaultValue="support@${brand.domain}" type="email" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Headquarters Address</label>
                <Input defaultValue="14 Industrial Avenue, Surulere, Lagos, Nigeria" />
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-border p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-1">Regional Defaults</h2>
              <p className="text-sm text-text-muted">Formatting rules for currency, dates, and default tax rates.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Base Currency</label>
                <select className="w-full flex h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" disabled>
                  <option>Nigerian Naira (NGN)</option>
                </select>
                <p className="text-xs text-text-muted">Base currency cannot be changed once transactions exist.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Timezone</label>
                <select className="w-full flex h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <option>Africa/Lagos (GMT+1)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Default VAT Rate (%)</label>
                <Input defaultValue="7.5" type="number" step="0.1" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
