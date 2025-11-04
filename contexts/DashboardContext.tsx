import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { DashboardMetrics, RevenueChartData, DashboardWidget } from '../types';
import { dashboardService } from '../services/dashboard.service';

interface DashboardContextType {
  metrics: DashboardMetrics | null;
  revenueChart: RevenueChartData[];
  widgets: DashboardWidget[];
  loading: boolean;
  
  loadMetrics: (startDate?: string, endDate?: string) => Promise<void>;
  loadRevenueChart: (months?: number) => Promise<void>;
  updateWidgets: (widgets: DashboardWidget[]) => Promise<void>;
  refresh: () => Promise<void>;
}

const defaultMetrics: DashboardMetrics = {
  financial: {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    averageTicket: 0,
    pendingReceivables: 0,
    overdueReceivables: 0,
    monthRevenue: 0,
    monthExpenses: 0,
    monthProfit: 0,
    revenueGrowth: 0,
    profitGrowth: 0,
  },
  operational: {
    totalOrders: 0,
    completedOrders: 0,
    inProgressOrders: 0,
    averageCompletionTime: 0,
    efficiency: 100,
    onTimeDelivery: 100,
    monthOrders: 0,
    ordersGrowth: 0,
    averageOrderValue: 0,
    topServices: [],
  },
  clients: {
    totalClients: 0,
    activeClients: 0,
    newClients: 0,
    retentionRate: 0,
    averageSatisfaction: 0,
    topClients: [],
    churnRate: 0,
    clientGrowth: 0,
  },
  inventory: {
    totalProducts: 0,
    stockValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    turnoverRate: 0,
    topProducts: [],
    slowMovingItems: 0,
  },
  team: {
    totalCollaborators: 0,
    activeCollaborators: 0,
    totalCommissions: 0,
    paidCommissions: 0,
    pendingCommissions: 0,
    averageProductivity: 0,
    topPerformers: [],
  },
};

const defaultWidgets: DashboardWidget[] = [
  { id: 'revenue', type: 'KPI', title: 'Faturamento', position: 0, visible: true },
  { id: 'profit', type: 'KPI', title: 'Lucro', position: 1, visible: true },
  { id: 'orders', type: 'KPI', title: 'Ordens', position: 2, visible: true },
  { id: 'clients', type: 'KPI', title: 'Clientes', position: 3, visible: true },
  { id: 'revenue-chart', type: 'CHART', title: 'Faturamento Mensal', position: 4, visible: true },
  { id: 'stock-alerts', type: 'ALERT', title: 'Alertas de Estoque', position: 5, visible: true },
  { id: 'preventives', type: 'LIST', title: 'Preventivas', position: 6, visible: true },
];

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<DashboardMetrics>(defaultMetrics);
  const [revenueChart, setRevenueChart] = useState<RevenueChartData[]>([]);
  const [widgets, setWidgets] = useState<DashboardWidget[]>(defaultWidgets);
  const [loading, setLoading] = useState(false);

  const loadMetrics = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      const data = await dashboardService.getMetrics(startDate, endDate);
      setMetrics(data);
    } catch (error) {
      console.error('Error loading dashboard metrics:', error);
      setMetrics(defaultMetrics);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRevenueChart = useCallback(async (months: number = 6) => {
    try {
      const data = await dashboardService.getRevenueChart(months);
      setRevenueChart(data);
    } catch (error) {
      console.error('Error loading revenue chart:', error);
      setRevenueChart([]);
    }
  }, []);

  const updateWidgets = useCallback(async (newWidgets: DashboardWidget[]) => {
    setWidgets(newWidgets);
    // TODO: Persist to storage
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([
      loadMetrics(),
      loadRevenueChart(6),
    ]);
  }, [loadMetrics, loadRevenueChart]);

  return (
    <DashboardContext.Provider
      value={{
        metrics,
        revenueChart,
        widgets,
        loading,
        loadMetrics,
        loadRevenueChart,
        updateWidgets,
        refresh,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
