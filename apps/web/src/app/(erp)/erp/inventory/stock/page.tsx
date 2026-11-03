'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/patterns/PageHeader';
import { DataTable } from '@/components/patterns/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AmountText } from '@/components/patterns/AmountText';
import { getStockLevels } from '@/features/inventory/api/inventory.api';
import { StockLevel } from '@/features/inventory/types';
import { toast } from 'sonner';

export default function StockLevelsPage() {
  const [stocks, setStocks] = useState<StockLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchStock = async () => {
    setIsLoading(true);
    try {
      const data = await getStockLevels();
      setStocks(data);
    } catch (err) {
      toast.error('Failed to load stock levels');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const filtered = stocks.filter(s => 
    s.productName.toLowerCase().includes(search.toLowerCase()) || 
    s.sku.toLowerCase().includes(search.toLowerCase()) ||
    s.locationName.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { 
      accessorKey: 'product', 
      header: 'Product',
      cell: (info: any) => {
        const s = info.row.original as StockLevel;
        return (
          <div>
            <div className="font-medium text-sm line-clamp-1">{s.productName}</div>
            <div className="text-text-muted text-xs">{s.sku} • {s.type}</div>
          </div>
        );
      }
    },
    { 
      accessorKey: 'locationName', 
      header: 'Location',
      cell: (info: any) => <span className="text-sm">{info.getValue()}</span>
    },
    { 
      accessorKey: 'onHand', 
      header: 'On Hand',
      cell: (info: any) => <span className="font-medium text-sm">{info.getValue()}</span>
    },
    { 
      accessorKey: 'reserved', 
      header: 'Reserved',
      cell: (info: any) => <span className="text-sm text-text-muted">{info.getValue()}</span>
    },
    { 
      accessorKey: 'available', 
      header: 'Available',
      cell: (info: any) => {
        const s = info.row.original as StockLevel;
        const available = info.getValue() as number;
        let color = 'text-success font-medium';
        if (available === 0) color = 'text-error font-medium';
        else if (available <= s.reorderLevel) color = 'text-warning-dark font-medium';
        return <span className={`text-sm ${color}`}>{available}</span>;
      }
    },
    { 
      accessorKey: 'pipeline', 
      header: 'Pipeline',
      cell: (info: any) => {
        const s = info.row.original as StockLevel;
        return (
          <div className="text-xs">
            {s.inTransit > 0 && <div><span className="text-primary font-medium">+{s.inTransit}</span> In Transit</div>}
            {s.onOrder > 0 && <div><span className="text-text-muted">+{s.onOrder}</span> On Order</div>}
            {s.inTransit === 0 && s.onOrder === 0 && <span className="text-text-muted">-</span>}
          </div>
        );
      }
    },
    { 
      accessorKey: 'totalValue', 
      header: 'Value',
      cell: (info: any) => <span className="text-sm"><AmountText amountInKobo={info.getValue()} /></span>
    },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: (info: any) => {
        const status = info.getValue() as string;
        let color = 'bg-surface-2 text-text-muted border-border';
        if (status === 'In Stock') color = 'bg-success-bg text-success border-success-border';
        if (status === 'Low Stock') color = 'bg-warning-bg text-warning-dark border-warning-border';
        if (status === 'Out of Stock') color = 'bg-error-bg text-error border-error-border';
        
        return <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${color}`}>{status}</span>;
      }
    },
    {
      id: 'actions',
      header: '',
      cell: (info: any) => {
        const stockLevel = info.row.original as StockLevel;
        return (
          <div className="flex justify-end gap-1">
            <Link href={`/erp/inventory/adjustments/new?stockId=${encodeURIComponent(stockLevel.id)}`}>
              <Button variant="ghost" size="sm" className="text-xs">Adjust</Button>
            </Link>
            <Button variant="ghost" size="sm" className="text-xs">Movements</Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      <PageHeader 
        title="Stock Levels" 
        description="Comprehensive view of all inventory across warehouses and store locations."
        action={
          <div className="flex gap-2">
            <Button variant="outline">Export CSV</Button>
            <Link href="/erp/inventory/adjustments/new">
              <Button>Stock Adjustment</Button>
            </Link>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full max-w-md">
          <Input 
            placeholder="Search by product, SKU, or location..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none">Filters</Button>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <DataTable 
          data={filtered} 
          columns={columns} 
          isLoading={isLoading}
          emptyMessage="No stock records found."
        />
      </div>
    </div>
  );
}
