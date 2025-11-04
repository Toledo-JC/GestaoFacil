import { serviceOrderService } from './service-order.service';
import { collaboratorService } from './collaborator.service';
import { OperationalEfficiencyReport } from '../types';

// ============================================
// OPERATIONAL EFFICIENCY SERVICE
// ============================================

export const operationalEfficiencyService = {
  async generateReport(startDate: string, endDate: string): Promise<{ data: OperationalEfficiencyReport | null; error: string | null }> {
    try {
      const { data: orders } = await serviceOrderService.getAll();
      const { data: collaborators } = await collaboratorService.getAll();

      if (!orders || !collaborators) {
        return { data: null, error: 'Failed to load data' };
      }

      // Filter completed orders by period
      const periodOrders = orders.filter(o => {
        if (o.status !== 'COMPLETED') return false;
        const orderDate = new Date(o.completedAt || o.createdAt);
        return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
      });

      // Service performance
      const serviceStats = new Map<string, { count: number; totalDuration: number; totalCost: number; totalRevenue: number }>();

      periodOrders.forEach(order => {
        const serviceType = order.title.split(' - ')[0] || 'Geral';
        const current = serviceStats.get(serviceType) || { count: 0, totalDuration: 0, totalCost: 0, totalRevenue: 0 };
        
        serviceStats.set(serviceType, {
          count: current.count + 1,
          totalDuration: current.totalDuration + (order.actualHours || order.estimatedHours || 0),
          totalCost: current.totalCost + (order.total * 0.6), // Simplified cost
          totalRevenue: current.totalRevenue + order.total,
        });
      });

      const servicePerformance = Array.from(serviceStats.entries()).map(([serviceType, stats]) => ({
        serviceType,
        count: stats.count,
        averageDuration: stats.totalDuration / stats.count,
        averageCost: stats.totalCost / stats.count,
        averageRevenue: stats.totalRevenue / stats.count,
        profitMargin: ((stats.totalRevenue - stats.totalCost) / stats.totalRevenue) * 100,
      }));

      // Collaborator productivity
      const collaboratorStats = new Map<number, { orders: number; hours: number; revenue: number }>();

      periodOrders.forEach(order => {
        // Simplified: assume each order has one collaborator
        const collabId = 1; // In real implementation, get from service_order_collaborators
        const current = collaboratorStats.get(collabId) || { orders: 0, hours: 0, revenue: 0 };
        
        collaboratorStats.set(collabId, {
          orders: current.orders + 1,
          hours: current.hours + (order.actualHours || order.estimatedHours || 0),
          revenue: current.revenue + order.total,
        });
      });

      const collaboratorProductivity = Array.from(collaboratorStats.entries()).map(([collabId, stats]) => {
        const collab = collaborators.find(c => c.id === collabId);
        return {
          collaboratorId: collabId,
          collaboratorName: collab?.name || 'Unknown',
          totalServices: stats.orders,
          totalHours: stats.hours,
          averageHoursPerService: stats.hours / stats.orders,
          revenueGenerated: stats.revenue,
          costPerHour: stats.revenue / stats.hours,
          efficiency: (stats.orders / stats.hours) * 100, // Orders per hour * 100
        };
      });

      // Resource utilization (simplified)
      const totalHoursWorked = Array.from(collaboratorStats.values()).reduce((sum, s) => sum + s.hours, 0);
      const totalHoursAvailable = collaborators.filter(c => c.active).length * 160; // 160h/month per collaborator

      // Quality metrics (simplified with placeholder data)
      const qualityMetrics = {
        averageRating: 4.5,
        reworkRate: 5,
        onTimeCompletion: 85,
        customerSatisfaction: 90,
      };

      // Cost analysis
      const totalRevenue = periodOrders.reduce((sum, o) => sum + o.total, 0);
      const totalCosts = totalRevenue * 0.6; // Simplified
      const laborCosts = totalCosts * 0.5;
      const materialCosts = totalCosts * 0.3;
      const overheadCosts = totalCosts * 0.2;

      const report: OperationalEfficiencyReport = {
        period: { start: startDate, end: endDate },
        servicePerformance,
        collaboratorProductivity,
        resourceUtilization: {
          totalHoursAvailable,
          totalHoursWorked,
          utilizationRate: (totalHoursWorked / totalHoursAvailable) * 100,
          idleHours: totalHoursAvailable - totalHoursWorked,
          overtimeHours: Math.max(0, totalHoursWorked - totalHoursAvailable),
        },
        qualityMetrics,
        costAnalysis: {
          totalCosts,
          laborCosts,
          materialCosts,
          overheadCosts,
          costPerService: totalCosts / periodOrders.length,
        },
        generatedAt: new Date().toISOString(),
      };

      return { data: report, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};
