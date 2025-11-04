import { serviceOrderService } from './service-order.service';
import { clientService } from './client.service';
import { accountsReceivableService } from './accounts-receivable.service';
import { ClientAnalysisReport } from '../types';

// ============================================
// CLIENT ANALYSIS SERVICE
// ============================================

export const clientAnalysisService = {
  async generateReport(startDate: string, endDate: string): Promise<{ data: ClientAnalysisReport | null; error: string | null }> {
    try {
      const { data: clients } = await clientService.getAll();
      const { data: orders } = await serviceOrderService.getAll();
      const { data: receivables } = await accountsReceivableService.getAll({});

      if (!clients || !orders || !receivables) {
        return { data: null, error: 'Failed to load data' };
      }

      // Filter data by period
      const periodOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
      });

      // Top clients by revenue
      const clientRevenue = new Map<number, number>();
      const clientOrders = new Map<number, number>();
      const clientLastOrder = new Map<number, string>();

      periodOrders.forEach(order => {
        const current = clientRevenue.get(order.clientId) || 0;
        clientRevenue.set(order.clientId, current + order.total);

        const count = clientOrders.get(order.clientId) || 0;
        clientOrders.set(order.clientId, count + 1);

        const lastDate = clientLastOrder.get(order.clientId);
        if (!lastDate || order.createdAt > lastDate) {
          clientLastOrder.set(order.clientId, order.createdAt);
        }
      });

      const topClients = Array.from(clientRevenue.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([clientId, revenue]) => {
          const client = clients.find(c => c.id === clientId);
          const orderCount = clientOrders.get(clientId) || 0;
          return {
            clientId,
            clientName: client?.name || 'Unknown',
            totalRevenue: revenue,
            totalOrders: orderCount,
            averageTicket: revenue / orderCount,
            lastOrderDate: clientLastOrder.get(clientId) || '',
            profitability: revenue * 0.3, // Simplified
          };
        });

      // Client retention
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const activeClientIds = new Set(
        orders
          .filter(o => new Date(o.createdAt) >= thirtyDaysAgo)
          .map(o => o.clientId)
      );

      const totalClients = clients.length;
      const activeClients = activeClientIds.size;
      const inactiveClients = totalClients - activeClients;
      const retentionRate = (activeClients / totalClients) * 100;

      const newClientsCount = clients.filter(c => 
        new Date(c.createdAt) >= new Date(startDate) && new Date(c.createdAt) <= new Date(endDate)
      ).length;

      // Risk clients (no orders in 90+ days)
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const riskClients = clients
        .filter(c => {
          const lastOrder = clientLastOrder.get(c.id);
          return lastOrder && new Date(lastOrder) < ninetyDaysAgo;
        })
        .slice(0, 10)
        .map(c => {
          const lastOrderDate = clientLastOrder.get(c.id)!;
          const daysSince = Math.floor((now.getTime() - new Date(lastOrderDate).getTime()) / (1000 * 60 * 60 * 24));
          return {
            clientId: c.id,
            clientName: c.name,
            reason: 'Sem pedidos há mais de 90 dias',
            daysSinceLastOrder: daysSince,
            lifetimeValue: clientRevenue.get(c.id) || 0,
          };
        });

      // Client lifetime value
      const ltValues = Array.from(clientRevenue.values()).sort((a, b) => b - a);
      const average = ltValues.reduce((sum, v) => sum + v, 0) / ltValues.length;
      const median = ltValues[Math.floor(ltValues.length / 2)];

      const report: ClientAnalysisReport = {
        period: { start: startDate, end: endDate },
        topClients,
        clientRetention: {
          totalClients,
          activeClients,
          inactiveClients,
          retentionRate,
          newClients: newClientsCount,
          lostClients: 0, // Simplified
        },
        clientSegmentation: [], // Simplified
        riskClients,
        clientLifetimeValue: {
          average,
          median,
          top10: ltValues[0] || 0,
          bottom10: ltValues[ltValues.length - 1] || 0,
        },
        generatedAt: new Date().toISOString(),
      };

      return { data: report, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};
