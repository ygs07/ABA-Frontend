
import { API_MODE, fetchApi } from '@/lib/api';

export type DashboardData = {
  scope: 'merchant' | 'organization';
  products: {
    total: number;
    active: number;
    lowStock: number;
    outOfStock: number;
  };
  sales: {
    orderCount: number;
    revenue: number;
  };
  revenueSeries: Array<{ date: string; revenue: number }>;
  salesByCategory: Array<{ name: string; revenue: number }>;
  recentOrders: Array<{
    id: number;
    orderNumber: string;
    customerName: string;
    createdAt: string;
    totalAmount: number;
    status: string;
  }>;
};

export type DashboardRange = 'today' | 'last_7_days' | 'last_30_days' | 'quarter' | 'year';

export const getDashboardData = async (range: DashboardRange): Promise<DashboardData> => {
  if (API_MODE !== 'mock') {
    return fetchApi<DashboardData>(`/api/v1/dashboard/overview?range=${range}`);
  }

  return {
    scope: 'organization',
    products: { total: 0, active: 0, lowStock: 0, outOfStock: 0 },
    sales: { orderCount: 0, revenue: 0 },
    revenueSeries: [],
    salesByCategory: [],
    recentOrders: [],
  };
};

export const getWidgetData = async () => ({});
