import { StockLevel, StockMovement, Warehouse } from '../types';
import { API_MODE, fetchApi } from '@/lib/api';

export type StockAdjustmentRecord = {
  id: number;
  sku: string;
  quantity: number;
  product?: { id: number; name: string } | null;
  productVariant?: { id: number; name: string; product?: { id: number; name: string } | null } | null;
};

type BackendProductStock = {
  id: number;
  name: string;
  type?: number | null;
  base_cost_price?: string | number | null;
  reorder_level?: number | null;
  category?: { name: string } | null;
};

type BackendErpStockRecord = StockAdjustmentRecord & {
  product?: BackendProductStock | null;
  productVariant?: (StockAdjustmentRecord['productVariant'] & {
    product?: BackendProductStock | null;
  }) | null;
};

type PaginatedStockRecords = { data: BackendErpStockRecord[] };

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const MOCK_WAREHOUSES: Warehouse[] = [
  { id: 'wh-1', name: 'Central Warehouse (Ikeja)', type: 'Central', address: 'Plot 4, Industrial Estate, Ikeja', isActive: true },
  { id: 'wh-2', name: 'Production Floor A', type: 'Production', address: 'Plot 4, Industrial Estate, Ikeja', isActive: true },
  { id: 'wh-3', name: 'Ikeja Flagship Store', type: 'Shop', address: '123 Retail Avenue, Ikeja', isActive: true },
  { id: 'wh-4', name: 'Quarantine Zone', type: 'Quarantine', address: 'Plot 4, Industrial Estate, Ikeja', isActive: true },
];

const MOCK_STOCK_LEVELS: StockLevel[] = [
  {
    id: 'stock-1',
    productId: 'prod-1',
    productName: 'Premium Cotton T-Shirt',
    sku: 'APP-TS-001',
    category: 'Apparel',
    type: 'Finished good',
    locationId: 'wh-1',
    locationName: 'Central Warehouse (Ikeja)',
    onHand: 1500,
    reserved: 200,
    available: 1300,
    inTransit: 0,
    onOrder: 500,
    reorderLevel: 500,
    unitCost: 800000, // 8,000 NGN
    totalValue: 1200000000, // 12m NGN
    status: 'In Stock'
  },
  {
    id: 'stock-2',
    productId: 'prod-2',
    productName: 'Raw Cotton 100%',
    sku: 'RAW-COT-01',
    category: 'Fabric',
    type: 'Raw material',
    locationId: 'wh-1',
    locationName: 'Central Warehouse (Ikeja)',
    onHand: 40,
    reserved: 10,
    available: 30,
    inTransit: 100,
    onOrder: 200,
    reorderLevel: 100,
    unitCost: 150000, // 1,500 NGN per kg
    totalValue: 6000000,
    status: 'Low Stock'
  },
  {
    id: 'stock-3',
    productId: 'prod-1',
    productName: 'Premium Cotton T-Shirt',
    sku: 'APP-TS-001',
    category: 'Apparel',
    type: 'Finished good',
    locationId: 'wh-3',
    locationName: 'Ikeja Flagship Store',
    onHand: 0,
    reserved: 0,
    available: 0,
    inTransit: 50,
    onOrder: 0,
    reorderLevel: 20,
    unitCost: 800000,
    totalValue: 0,
    status: 'Out of Stock'
  }
];

export const getStockLevels = async (): Promise<StockLevel[]> => {
  if (API_MODE !== 'mock') {
    const response = await fetchApi<PaginatedStockRecords>('/api/v1/stocks/erp?limit=100');
    return response.data.map((stockRecord) => {
      const product = stockRecord.productVariant?.product ?? stockRecord.product;
      const productName = product?.name ?? stockRecord.productVariant?.name ?? 'Product';
      const unitCost = Number(product?.base_cost_price ?? 0) * 100;
      const productType = product?.type === 2 ? 'Raw material' : 'Finished good';
      const reorderLevel = product?.reorder_level ?? 0;
      const status: StockLevel['status'] = stockRecord.quantity === 0
        ? 'Out of Stock'
        : stockRecord.quantity <= reorderLevel
          ? 'Low Stock'
          : 'In Stock';
      return {
        id: String(stockRecord.id),
        productId: String(product?.id ?? stockRecord.productVariant?.id ?? ''),
        productName,
        sku: stockRecord.sku,
        category: product?.category?.name ?? 'Uncategorized',
        type: productType,
        locationId: '',
        locationName: 'Default stock',
        onHand: stockRecord.quantity,
        reserved: 0,
        available: stockRecord.quantity,
        inTransit: 0,
        onOrder: 0,
        reorderLevel,
        unitCost,
        totalValue: unitCost * stockRecord.quantity,
        status,
      };
    });
  }
  await delay(800);
  return MOCK_STOCK_LEVELS;
};

export const getStockRecords = async (): Promise<StockAdjustmentRecord[]> => {
  if (API_MODE !== 'mock') {
    const response = await fetchApi<PaginatedStockRecords>('/api/v1/stocks/erp?limit=100');
    return response.data;
  }

  return MOCK_STOCK_LEVELS.map((stockLevel, index) => ({
    id: index + 1,
    sku: stockLevel.sku,
    quantity: stockLevel.onHand,
    product: { id: Number(index + 1), name: stockLevel.productName },
  }));
};

export const adjustStock = async (stockId: number, quantityChange: number): Promise<StockAdjustmentRecord> => {
  if (API_MODE !== 'mock') {
    return fetchApi<StockAdjustmentRecord>(`/api/v1/stocks/${encodeURIComponent(stockId)}/adjust`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantityChange }),
    });
  }

  const stockRecord = (await getStockRecords()).find((record) => record.id === stockId);
  if (!stockRecord) throw new Error('Stock record not found');
  if (stockRecord.quantity + quantityChange < 0) {
    throw new Error('Stock quantity cannot be negative');
  }
  return { ...stockRecord, quantity: stockRecord.quantity + quantityChange };
};

export const adjustProductStock = async (productId: number, quantityChange: number): Promise<StockAdjustmentRecord> => {
  if (API_MODE !== 'mock') {
    return fetchApi<StockAdjustmentRecord>(`/api/v1/stocks/products/${encodeURIComponent(productId)}/adjust`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantityChange }),
    });
  }

  const matchingStockRecord = (await getStockRecords()).find(
    (stockRecord) => stockRecord.product?.id === productId,
  );
  if (matchingStockRecord) return adjustStock(matchingStockRecord.id, quantityChange);
  if (quantityChange < 0) throw new Error('Cannot deduct stock before recording an initial quantity');
  return { id: Date.now(), sku: `PRODUCT-${productId}`, quantity: quantityChange, product: { id: productId, name: 'Product' } };
};

export const getWarehouses = async (): Promise<Warehouse[]> => {
  await delay(500);
  return MOCK_WAREHOUSES;
};

const MOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-1',
    movementNo: 'TRF-0010',
    date: '2026-09-30T10:30:00Z',
    type: 'transfer_out',
    productId: 'prod-1',
    productName: 'Premium Cotton T-Shirt',
    fromLocationId: 'wh-1',
    toLocationId: 'wh-3',
    quantity: -50,
    unitCost: 800000,
    totalValue: -40000000,
    balanceAfter: 1500,
    sourceDocument: { type: 'Transfer', id: 'trf-1', ref: 'TRF-1042' },
    userId: 'user-1',
    userName: 'Admin User'
  },
  {
    id: 'mov-2',
    movementNo: 'GRN-0310',
    date: '2026-09-29T14:15:00Z',
    type: 'receipt',
    productId: 'prod-2',
    productName: 'Raw Cotton 100%',
    toLocationId: 'wh-1',
    quantity: 40,
    unitCost: 150000,
    totalValue: 6000000,
    balanceAfter: 40,
    sourceDocument: { type: 'PO', id: 'po-1', ref: 'PO-2041' },
    userId: 'user-2',
    userName: 'Warehouse Manager'
  },
  {
    id: 'mov-3',
    movementNo: 'ADJ-004',
    date: '2026-09-28T09:00:00Z',
    type: 'adjustment_down',
    productId: 'prod-1',
    productName: 'Premium Cotton T-Shirt',
    fromLocationId: 'wh-1',
    quantity: -5,
    unitCost: 800000,
    totalValue: -4000000,
    balanceAfter: 1550,
    sourceDocument: { type: 'Adjustment', id: 'adj-1', ref: 'ADJ-109' },
    userId: 'user-2',
    userName: 'Warehouse Manager'
  }
];

export const getStockMovements = async (): Promise<StockMovement[]> => {
  await delay(800);
  return MOCK_MOVEMENTS;
};
