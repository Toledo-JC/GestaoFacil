import { serviceOrderService } from './service-order.service';
import { SeasonalityReport } from '../types';

// ============================================
// SEASONALITY REPORT SERVICE
// ============================================

export const seasonalityService = {
  async generateReport(startDate: string, endDate: string): Promise<{ data: SeasonalityReport | null; error: string | null }> {
    try {
      const { data: orders } = await serviceOrderService.getAll();

      if (!orders) {
        return { data: null, error: 'Failed to load orders' };
      }

      // Filter completed orders
      const completedOrders = orders.filter(o => o.status === 'COMPLETED');

      // Monthly trends
      const monthlyData = new Map<string, { orders: number; revenue: number; services: Set<string> }>();

      completedOrders.forEach(order => {
        const date = new Date(order.completedAt || order.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const current = monthlyData.get(key) || { orders: 0, revenue: 0, services: new Set<string>() };
        current.orders++;
        current.revenue += order.total;
        current.services.add(order.title.split(' - ')[0] || 'Geral');
        monthlyData.set(key, current);
      });

      const monthlyTrends = Array.from(monthlyData.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, data]) => {
          const [year, month] = key.split('-');
          return {
            month: new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('pt-BR', { month: 'long' }),
            year: parseInt(year),
            totalOrders: data.orders,
            totalRevenue: data.revenue,
            averageTicket: data.revenue / data.orders,
            topServices: Array.from(data.services).slice(0, 3),
          };
        });

      // Weekly patterns
      const weeklyData = Array.from({ length: 7 }, (_, i) => ({
        dayOfWeek: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][i],
        totalOrders: 0,
        totalRevenue: 0,
      }));

      completedOrders.forEach(order => {
        const date = new Date(order.completedAt || order.createdAt);
        const dayIndex = date.getDay();
        weeklyData[dayIndex].totalOrders++;
        weeklyData[dayIndex].totalRevenue += order.total;
      });

      const weeksCount = Math.ceil(completedOrders.length / 7);
      const weeklyPatterns = weeklyData.map(day => ({
        dayOfWeek: day.dayOfWeek,
        averageOrders: day.totalOrders / weeksCount,
        averageRevenue: day.totalRevenue / weeksCount,
        peakHours: ['08:00-10:00', '14:00-16:00'], // Simplified
      }));

      // Seasonal peaks (quarters)
      const quarterlyData = new Map<string, { orders: number; revenue: number }>();

      completedOrders.forEach(order => {
        const date = new Date(order.completedAt || order.createdAt);
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        const key = `Q${quarter} ${date.getFullYear()}`;
        
        const current = quarterlyData.get(key) || { orders: 0, revenue: 0 };
        current.orders++;
        current.revenue += order.total;
        quarterlyData.set(key, current);
      });

      const seasonalPeaks = Array.from(quarterlyData.entries())
        .map(([period, data]) => ({
          period,
          orders: data.orders,
          revenue: data.revenue,
          growthRate: 0, // Simplified
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 4);

      // Demand forecast (simplified linear projection)
      const lastMonthRevenue = monthlyTrends[monthlyTrends.length - 1]?.totalRevenue || 0;
      const avgGrowth = 1.05; // 5% growth assumption

      const demandForecast = Array.from({ length: 3 }, (_, i) => {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + i + 1);
        return {
          month: nextMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
          predictedOrders: Math.round((monthlyTrends[monthlyTrends.length - 1]?.totalOrders || 0) * Math.pow(avgGrowth, i + 1)),
          predictedRevenue: lastMonthRevenue * Math.pow(avgGrowth, i + 1),
          confidence: 85 - (i * 5), // Confidence decreases over time
        };
      });

      // Historical comparison (current year vs previous)
      const currentYear = new Date().getFullYear();
      const yearlyComparison = new Map<number, { current: number; previous: number }>();

      for (let month = 0; month < 12; month++) {
        const currentKey = `${currentYear}-${String(month + 1).padStart(2, '0')}`;
        const previousKey = `${currentYear - 1}-${String(month + 1).padStart(2, '0')}`;
        
        yearlyComparison.set(month, {
          current: monthlyData.get(currentKey)?.revenue || 0,
          previous: monthlyData.get(previousKey)?.revenue || 0,
        });
      }

      const historicalComparison = Array.from(yearlyComparison.entries()).map(([month, data]) => {
        const monthName = new Date(2000, month).toLocaleDateString('pt-BR', { month: 'long' });
        return {
          period: monthName,
          currentYear: data.current,
          previousYear: data.previous,
          growth: data.previous > 0 ? ((data.current - data.previous) / data.previous) * 100 : 0,
        };
      });

      const report: SeasonalityReport = {
        period: { start: startDate, end: endDate },
        monthlyTrends,
        weeklyPatterns,
        seasonalPeaks,
        demandForecast,
        historicalComparison,
        generatedAt: new Date().toISOString(),
      };

      return { data: report, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};
