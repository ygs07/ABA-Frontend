'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/patterns/PageHeader';
import { DataTable } from '@/components/patterns/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KpiCard } from '@/components/patterns/KpiCard';
import { AmountText } from '@/components/patterns/AmountText';
import { getProductOverview, getProducts, ProductOverview } from '@/features/products/api/products.api';
import { Product } from '@/features/products/types';
import { toast } from 'sonner';

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [overview, setOverview] = useState<ProductOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const [productsResponse, overviewResponse] = await Promise.all([
        getProducts(),
        getProductOverview(),
      ]);
      setProducts(productsResponse.data);
      setOverview(overviewResponse);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { 
      accessorKey: 'product', 
      header: 'Product',
      cell: (info: any) => {
        const p = info.row.original as Product;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 overflow-hidden rounded bg-surface-2 border border-border flex items-center justify-center shrink-0">
              {p.images[0] ? (
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              )}
            </div>
            <div>
              <div className="font-medium line-clamp-1">{p.name}</div>
              <div className="text-text-muted text-xs">{p.sku}</div>
            </div>
          </div>
        );
      }
    },
    { 
      accessorKey: 'categoryName', 
      header: 'Category',
      cell: (info: any) => (
        <div>
          <div className="text-sm">{info.getValue()}</div>
          <div className="text-text-muted text-xs">{info.row.original.type}</div>
        </div>
      )
    },
    { 
      accessorKey: 'price', 
      header: 'Price / Cost',
      cell: (info: any) => {
        const p = info.row.original as Product;
        if (p.type === 'Raw material') {
          return (
            <div>
              <div className="text-sm font-medium"><AmountText amountInKobo={p.price} /></div>
              <div className="text-text-muted text-xs">Cost only</div>
            </div>
          );
        }
        return (
          <div>
            <div className="text-sm font-medium"><AmountText amountInKobo={p.sellingPrice} /></div>
            <div className="text-text-muted text-xs">Cost: <AmountText amountInKobo={p.price} /></div>
          </div>
        );
      }
    },
    { 
      accessorKey: 'inventory', 
      header: 'Inventory',
      cell: (info: any) => {
        const p = info.row.original as Product;
        
        let stockStatusColor = 'bg-surface-2 text-text';
        let stockLabel = 'In Stock';
        
        if (p.totalStock === 0) {
          stockStatusColor = 'bg-error-bg text-error border-error-border';
          stockLabel = 'Out of Stock';
        } else if (p.totalStock <= p.reorderLevel) {
          stockStatusColor = 'bg-warning-bg text-warning-dark border-warning-border';
          stockLabel = 'Low Stock';
        }

        return (
          <div>
            <div className="text-sm font-medium">{p.totalStock} {p.unitOfMeasure}</div>
            {p.hasVariants ? (
              <div className="text-text-muted text-xs">{p.variants.length} variants</div>
            ) : (
              <span className={`inline-block mt-1 px-1.5 py-[1px] rounded text-[10px] font-medium border ${stockStatusColor}`}>
                {stockLabel}
              </span>
            )}
          </div>
        );
      }
    },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: (info: any) => {
        const status = info.getValue() as string;
        const color = status === 'Active' ? 'bg-success-bg text-success border-success-border' : 'bg-surface-2 text-text-muted border-border';
        return <span className={`px-2 py-0.5 rounded text-xs font-medium border ${color}`}>{status}</span>;
      }
    },
    {
      id: 'actions',
      header: '',
      cell: (info: any) => {
        const p = info.row.original as Product;
        return (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="sm">Edit</Button>
            <Link href={`/erp/products/${p.id}`}>
              <Button variant="ghost" size="sm">View</Button>
            </Link>
          </div>
        );
      }
    }
  ];

  const kpis = [
    { label: 'Total Products', value: overview?.totalProducts },
    { label: 'Active', value: overview?.activeProducts },
    { label: 'Low Stock', value: overview?.lowStock },
    { label: 'Out of Stock', value: overview?.outOfStock },
  ];

  return (
    <div className="space-y-6 pb-20">
      <PageHeader 
        title="Products" 
        description="Catalogue of all finished goods, materials, and services."
        action={
          <div className="flex gap-2">
            <Button variant="outline">Import</Button>
            <Link href="/erp/products/new">
              <Button>Add Product</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <KpiCard
            key={kpi.label}
            title={kpi.label}
            value={kpi.value === undefined ? '—' : kpi.value.toLocaleString()}
          />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full max-w-md">
          <Input 
            placeholder="Search by name or SKU..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none">Filters</Button>
          <Button variant="outline" className="flex-1 sm:flex-none">Export</Button>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <DataTable 
          data={filteredProducts} 
          columns={columns} 
          isLoading={isLoading}
          emptyMessage="No products found."
        />
      </div>
    </div>
  );
}
