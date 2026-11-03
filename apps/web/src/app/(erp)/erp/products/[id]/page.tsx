'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductById } from '@/features/products/api/products.api';
import { Product } from '@/features/products/types';
import { PageHeader } from '@/components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { KpiCard } from '@/components/patterns/KpiCard';
import { AmountText } from '@/components/patterns/AmountText';
import { DataTable } from '@/components/patterns/DataTable';
import { toast } from 'sonner';

const TABS = ['Overview', 'Variants', 'Pricing', 'Inventory', 'Suppliers', 'BOM', 'History'];

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    getProductById(id)
      .then(setProduct)
      .catch(() => {
        toast.error('Product not found');
        router.push('/products');
      })
      .finally(() => setIsLoading(false));
  }, [id, router]);

  if (isLoading) {
    return <div className="p-8 text-center text-text-muted">Loading product details...</div>;
  }

  if (!product) return null;

  const statusColor = product.status === 'Active' ? 'bg-success-bg text-success border-success-border' : 'bg-surface-2 text-text-muted border-border';
  const margin = product.sellingPrice > 0 ? ((product.sellingPrice - product.price) / product.sellingPrice) * 100 : 0;

  const variantColumns = [
    { accessorKey: 'name', header: 'Variant Name', cell: (info: any) => <span className="font-medium">{info.getValue()}</span> },
    { accessorKey: 'sku', header: 'SKU', cell: (info: any) => <span className="text-sm text-text-muted">{info.getValue()}</span> },
    { accessorKey: 'cost', header: 'Cost', cell: (info: any) => <AmountText amountInKobo={info.getValue()} /> },
    { accessorKey: 'price', header: 'Price', cell: (info: any) => <AmountText amountInKobo={info.getValue()} /> },
    { 
      accessorKey: 'stockCount', 
      header: 'Stock', 
      cell: (info: any) => {
        const count = info.getValue() as number;
        const reorderLevel = info.row.original.reorderLevel;
        let color = 'text-text';
        if (count === 0) color = 'text-error font-medium';
        else if (count <= reorderLevel) color = 'text-warning-dark font-medium';
        return <span className={color}>{count}</span>;
      }
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: (info: any) => info.getValue() ? <span className="text-success text-xs">Active</span> : <span className="text-text-muted text-xs">Inactive</span>
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-surface-2 border border-border text-text-muted flex items-center justify-center shrink-0">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-h3">{product.name}</h1>
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusColor}`}>
                {product.status}
              </span>
              <span className="px-2 py-0.5 rounded text-xs bg-primary/10 text-primary border border-primary/20">
                {product.type}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span className="font-mono">{product.sku}</span>
              <span>•</span>
              <span>{product.categoryName}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">Duplicate</Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/erp/inventory/adjustments/new?productId=${encodeURIComponent(product.id)}`)}
          >
            Adjust Stock
          </Button>
          <Button>Edit</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KpiCard title="Selling Price" value={<AmountText amountInKobo={product.sellingPrice} />} />
        <KpiCard title="Cost" value={<AmountText amountInKobo={product.price} />} />
        <KpiCard title="Margin" value={`${margin.toFixed(1)}%`} />
        <KpiCard title="Stock on Hand" value={`${product.totalStock} ${product.unitOfMeasure}`} className={product.totalStock === 0 ? "text-error" : ""} />
        <KpiCard title="Sold (30d)" value="0" />
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border flex overflow-x-auto no-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab 
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
        
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface p-6 rounded-xl border border-border">
              <h3 className="text-h4 mb-4">Product Details</h3>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-text-muted text-xs mb-1">Category</dt>
                  <dd className="font-medium">{product.categoryName}</dd>
                </div>
                <div>
                  <dt className="text-text-muted text-xs mb-1">Brand</dt>
                  <dd className="font-medium">{product.brand || 'No brand specified'}</dd>
                </div>
                <div>
                  <dt className="text-text-muted text-xs mb-1">Unit of Measure</dt>
                  <dd className="font-medium">{product.unitOfMeasure}</dd>
                </div>
                <div>
                  <dt className="text-text-muted text-xs mb-1">Commissionable</dt>
                  <dd className="font-medium">{product.isCommissionable ? 'Yes' : 'No'}</dd>
                </div>
              </dl>
            </div>
            
            <div className="bg-surface p-6 rounded-xl border border-border">
              <h3 className="text-h4 mb-4">Inventory Settings</h3>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-text-muted text-xs mb-1">Tracking enabled</dt>
                  <dd className="font-medium">{product.trackInventory ? 'Yes' : 'No'}</dd>
                </div>
                <div>
                  <dt className="text-text-muted text-xs mb-1">Reorder Level</dt>
                  <dd className="font-medium">{product.reorderLevel}</dd>
                </div>
                <div>
                  <dt className="text-text-muted text-xs mb-1">Reorder Quantity</dt>
                  <dd className="font-medium">{product.reorderQuantity}</dd>
                </div>
                <div>
                  <dt className="text-text-muted text-xs mb-1">Allow Backorders</dt>
                  <dd className="font-medium">{product.allowBackorder ? 'Yes' : 'No'}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'Variants' && (
          <div className="space-y-4">
            {!product.hasVariants ? (
              <div className="bg-surface p-12 text-center rounded-xl border border-border">
                <h3 className="font-medium text-lg mb-1">No Variants</h3>
                <p className="text-text-muted text-sm">This is a simple product with no variants.</p>
              </div>
            ) : (
              <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <DataTable 
                  data={product.variants}
                  columns={variantColumns}
                  isLoading={false}
                  emptyMessage="No variants configured."
                />
              </div>
            )}
          </div>
        )}

        {activeTab !== 'Overview' && activeTab !== 'Variants' && (
          <div className="bg-surface p-12 text-center rounded-xl border border-border">
            <h3 className="font-medium text-lg mb-1">{activeTab}</h3>
            <p className="text-text-muted text-sm mb-4">This section is not yet implemented.</p>
          </div>
        )}
      </div>

    </div>
  );
}
