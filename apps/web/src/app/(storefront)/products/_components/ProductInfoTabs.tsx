'use client';
import React, { useState } from 'react';
import { Product } from '@/features/products/types';
import { FileText, List, Truck, ShieldCheck, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductInfoTabsProps {
  product: Product;
}

type TabKey = 'description' | 'specifications' | 'delivery';

export function ProductInfoTabs({ product }: ProductInfoTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('description');

  return (
    <div className="mt-8 bg-surface rounded-2xl border border-border overflow-hidden">
      {/* Tab Headers */}
      <div className="flex overflow-x-auto border-b border-border hide-scrollbar bg-surface-1">
        <button
          onClick={() => setActiveTab('description')}
          className={cn(
            "flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors relative whitespace-nowrap",
            activeTab === 'description' ? "text-brand-600" : "text-text-muted hover:text-text hover:bg-surface-2"
          )}
        >
          <FileText className="w-4 h-4" />
          Product Description
          {activeTab === 'description' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600" />
          )}
        </button>
        {/* <button
          onClick={() => setActiveTab('specifications')}
          className={cn(
            "flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors relative whitespace-nowrap",
            activeTab === 'specifications' ? "text-brand-600" : "text-text-muted hover:text-text hover:bg-surface-2"
          )}
        >
          <List className="w-4 h-4" />
          Specifications
          {activeTab === 'specifications' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600" />
          )}
        </button> */}
        <button
          id="delivery-tab-btn"
          onClick={() => setActiveTab('delivery')}
          className={cn(
            "flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors relative whitespace-nowrap",
            activeTab === 'delivery' ? "text-brand-600" : "text-text-muted hover:text-text hover:bg-surface-2"
          )}
        >
          <Truck className="w-4 h-4" />
          Delivery & Returns
          {activeTab === 'delivery' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6 md:p-8">
        {/* Description Tab */}
        {activeTab === 'description' && (
          <div className="animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-text mb-6">About this product</h3>
            <div className="prose prose-sm sm:prose-base max-w-none text-text-muted leading-relaxed">
              {product.description ? (
                <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }} />
              ) : (
                <p className="italic">No detailed description provided by the seller.</p>
              )}
            </div>
            
            {/* Value Props Section */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-brand-900 text-sm">Quality Assured</h4>
                  <p className="text-brand-700 text-sm mt-1">This product meets our strict quality standards.</p>
                </div>
              </div>
              <div className="bg-surface-2 border border-border rounded-xl p-4 flex items-start gap-3">
                <Truck className="w-5 h-5 text-text shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-text text-sm">Fast Dispatch</h4>
                  <p className="text-text-muted text-sm mt-1">Usually ships within 24 hours of payment.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Specifications Tab */}
        {/* {activeTab === 'specifications' && (
          <div className="animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-text mb-6">Technical Specifications</h3>
            
            {product.attributes && product.attributes.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm text-left">
                  <tbody className="divide-y divide-border">
                    {product.attributes.map((attr, idx) => (
                      <tr key={idx} className="even:bg-surface-1 hover:bg-surface-2 transition-colors">
                        <th className="px-6 py-4 font-medium text-text-muted w-1/3 border-r border-border bg-surface-1/50">
                          {attr.name}
                        </th>
                        <td className="px-6 py-4 text-text font-medium">
                          {attr.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-surface-1 rounded-xl border border-dashed border-border">
                <List className="w-8 h-8 text-text-muted mx-auto mb-3 opacity-50" />
                <p className="text-text-muted">No technical specifications available for this item.</p>
              </div>
            )}
          </div>
        )} */}

        {/* Delivery Tab */}
        {activeTab === 'delivery' && (
          <div className="animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-text mb-6">Shipping & Returns Information</h3>
            
            <div className="space-y-8">
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-text mb-3">
                  <Truck className="w-5 h-5 text-brand-600" />
                  Delivery Options
                </h4>
                <div className="bg-surface-1 rounded-xl border border-border p-5 space-y-4">
                  <div className="flex justify-between items-start pb-4 border-b border-border">
                    <div>
                      <div className="font-medium text-text">Standard Delivery</div>
                      <div className="text-sm text-text-muted mt-1">Estimated 2-5 working days</div>
                    </div>
                    <div className="font-semibold text-text">Calculated at checkout</div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-text">Express Delivery</div>
                      <div className="text-sm text-text-muted mt-1">Estimated 1-2 working days</div>
                    </div>
                    <div className="font-semibold text-text">Calculated at checkout</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="flex items-center gap-2 font-semibold text-text mb-3">
                  <ShieldCheck className="w-5 h-5 text-brand-600" />
                  Return Policy
                </h4>
                <div className="bg-surface-1 rounded-xl border border-border p-5 text-sm text-text-muted leading-relaxed">
                  <p className="mb-3">
                    We want you to be completely satisfied with your purchase. If you change your mind, you can return the item within <strong>14 days</strong> of receiving it.
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                      Item must be in its original condition and packaging.
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                      Buyer is responsible for return shipping costs unless the item is defective.
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                      Refunds are processed within 3-5 business days of receiving the return.
                    </li>
                  </ul>
                  <a href="#" className="text-brand-600 font-medium hover:underline inline-flex items-center gap-1">
                    Read full return policy <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
