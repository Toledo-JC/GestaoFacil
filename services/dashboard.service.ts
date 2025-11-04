import { Platform } from 'react-native';
import { 
  DashboardMetrics, 
  FinancialMetrics, 
  OperationalMetrics,
  ClientMetrics,
  InventoryMetrics,
  TeamMetrics,
  RevenueChartData,
  TimeSeriesData
} from '../types';
import { storageService } from './storage.service';
import { financialReportService } from './financial-report.service';
import { productService } from './product.service';

// ============================================
// DASHBOARD SERVICE - ANALYTICS & METRICS
// ============================================

export const dashboardService = {
  async getMetrics(startDate?: string, endDate?: string): Promise<DashboardMetrics> {
    const [financial, operational, clients, inventory, team] = await Promise.all([
      this.getFinancialMetrics(startDate, endDate),
      this.getOperationalMetrics(startDate, endDate),
      this.getClientMetrics(startDate, endDate),
      this.getInventoryMetrics(),
      this.getTeamMetrics(startDate, endDate),
    ]);

    return {
      financial,
      operational,
      clients,
      inventory,
      team,
    };
  },

  async getFinancialMetrics(startDate?: string, endDate?: string): Promise<FinancialMetrics> {
    if (Platform.OS === 'web') {
      return this.getWebFinancialMetrics(startDate, endDate);
    }

    const db = storageService.getDatabase();
    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().split('T')[0];

    // Total revenue (all time or period)
    const revenueQuery = startDate && endDate
      ? `SELECT COALESCE(SUM(amount), 0) as total FROM accounts_receivable WHERE status = 'RECEIVED' AND payment_date BETWEEN ? AND ?`
      : `SELECT COALESCE(SUM(amount), 0) as total FROM accounts_receivable WHERE status = 'RECEIVED'`;
    
    const revenueParams = startDate && endDate ? [startDate, endDate] : [];
    const revenueResult = await db.getFirstAsync(revenueQuery, revenueParams);
    const totalRevenue = revenueResult?.total || 0;

    // Total expenses
    const expenseQuery = startDate && endDate
      ? `SELECT COALESCE(SUM(amount), 0) as total FROM accounts_payable WHERE status = 'PAID' AND payment_date BETWEEN ? AND ?`
      : `SELECT COALESCE(SUM(amount), 0) as total FROM accounts_payable WHERE status = 'PAID'`;
    
    const expenseParams = startDate && endDate ? [startDate, endDate] : [];
    const expenseResult = await db.getFirstAsync(expenseQuery, expenseParams);
    const totalExpenses = expenseResult?.total || 0;

    // Month revenue
    const monthRevenueResult = await db.getFirstAsync(
      `SELECT COALESCE(SUM(amount), 0) as total FROM accounts_receivable 
       WHERE status = 'RECEIVED' AND payment_date >= ?`,
      [monthStartStr]
    );
    const monthRevenue = monthRevenueResult?.total || 0;

    // Month expenses
    const monthExpenseResult = await db.getFirstAsync(
      `SELECT COALESCE(SUM(amount), 0) as total FROM accounts_payable 
       WHERE status = 'PAID' AND payment_date >= ?`,
      [monthStartStr]
    );
    const monthExpenses = monthExpenseResult?.total || 0;

    // Pending and overdue receivables
    const pendingResult = await db.getFirstAsync(
      `SELECT COALESCE(SUM(amount), 0) as total FROM accounts_receivable WHERE status = 'PENDING'`
    );
    const pendingReceivables = pendingResult?.total || 0;

    const overdueResult = await db.getFirstAsync(
      `SELECT COALESCE(SUM(amount), 0) as total FROM accounts_receivable WHERE status = 'OVERDUE'`
    );
    const overdueReceivables = overdueResult?.total || 0;

    // Average ticket (completed orders)
    const ticketResult = await db.getFirstAsync(
      `SELECT COALESCE(AVG(total), 0) as avg FROM service_orders WHERE status = 'COMPLETED'`
    );
    const averageTicket = ticketResult?.avg || 0;

    // Calculate metrics
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const monthProfit = monthRevenue - monthExpenses;

    // Growth calculations (compare with previous month)
    const prevMonthStart = new Date(monthStart);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthEnd = new Date(monthStart);
    prevMonthEnd.setDate(0);

    const prevRevenueResult = await db.getFirstAsync(
      `SELECT COALESCE(SUM(amount), 0) as total FROM accounts_receivable 
       WHERE status = 'RECEIVED' AND payment_date BETWEEN ? AND ?`,
      [prevMonthStart.toISOString().split('T')[0], prevMonthEnd.toISOString().split('T')[0]]
    );
    const prevRevenue = prevRevenueResult?.total || 0;

    const prevExpenseResult = await db.getFirstAsync(
      `SELECT COALESCE(SUM(amount), 0) as total FROM accounts_payable 
       WHERE status = 'PAID' AND payment_date BETWEEN ? AND ?`,
      [prevMonthStart.toISOString().split('T')[0], prevMonthEnd.toISOString().split('T')[0]]
    );
    const prevExpenses = prevExpenseResult?.total || 0;
    const prevProfit = prevRevenue - prevExpenses;

    const revenueGrowth = prevRevenue > 0 ? ((monthRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const profitGrowth = prevProfit > 0 ? ((monthProfit - prevProfit) / prevProfit) * 100 : 0;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      averageTicket,
      pendingReceivables,
      overdueReceivables,
      monthRevenue,
      monthExpenses,
      monthProfit,
      revenueGrowth,
      profitGrowth,
    };
  },

  async getOperationalMetrics(startDate?: string, endDate?: string): Promise<OperationalMetrics> {
    if (Platform.OS === 'web') {
      return this.getWebOperationalMetrics(startDate, endDate);
    }

    const db = storageService.getDatabase();
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().split('T')[0];

    // Total orders
    const totalResult = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM service_orders`
    );
    const totalOrders = totalResult?.count || 0;

    // Completed orders
    const completedResult = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM service_orders WHERE status = 'COMPLETED'`
    );
    const completedOrders = completedResult?.count || 0;

    // In progress orders
    const inProgressResult = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM service_orders WHERE status = 'IN_PROGRESS'`
    );
    const inProgressOrders = inProgressResult?.count || 0;

    // Average completion time (in hours)
    const avgTimeResult = await db.getFirstAsync(
      `SELECT COALESCE(AVG(actual_hours), 0) as avg FROM service_orders WHERE status = 'COMPLETED' AND actual_hours IS NOT NULL`
    );
    const averageCompletionTime = avgTimeResult?.avg || 0;

    // Efficiency (completed vs estimated time)
    const efficiencyResult = await db.getFirstAsync(
      `SELECT 
        COALESCE(AVG(actual_hours), 0) as actual,
        COALESCE(AVG(estimated_hours), 0) as estimated
       FROM service_orders 
       WHERE status = 'COMPLETED' AND actual_hours IS NOT NULL AND estimated_hours IS NOT NULL`
    );
    const actualTime = efficiencyResult?.actual || 0;
    const estimatedTime = efficiencyResult?.estimated || 1;
    const efficiency = estimatedTime > 0 ? (estimatedTime / actualTime) * 100 : 100;

    // On-time delivery (completed within estimated time)
    const onTimeResult = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM service_orders 
       WHERE status = 'COMPLETED' AND actual_hours <= estimated_hours`
    );
    const onTimeCount = onTimeResult?.count || 0;
    const onTimeDelivery = completedOrders > 0 ? (onTimeCount / completedOrders) * 100 : 0;

    // Month orders
    const monthOrdersResult = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM service_orders WHERE created_at >= ?`,
      [monthStartStr]
    );
    const monthOrders = monthOrdersResult?.count || 0;

    // Previous month for growth
    const prevMonthStart = new Date(monthStart);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthEnd = new Date(monthStart);
    prevMonthEnd.setDate(0);

    const prevMonthOrdersResult = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM service_orders WHERE created_at BETWEEN ? AND ?`,
      [prevMonthStart.toISOString().split('T')[0], prevMonthEnd.toISOString().split('T')[0]]
    );
    const prevMonthOrders = prevMonthOrdersResult?.count || 0;
    const ordersGrowth = prevMonthOrders > 0 ? ((monthOrders - prevMonthOrders) / prevMonthOrders) * 100 : 0;

    // Average order value
    const avgValueResult = await db.getFirstAsync(
      `SELECT COALESCE(AVG(total), 0) as avg FROM service_orders WHERE status = 'COMPLETED'`
    );
    const averageOrderValue = avgValueResult?.avg || 0;

    // Top services (from items)
    const topServicesRows = await db.getAllAsync(
      `SELECT 
        description as service,
        COUNT(*) as count,
        SUM(total) as revenue
       FROM service_order_items
       WHERE type = 'SERVICE'
       GROUP BY description
       ORDER BY revenue DESC
       LIMIT 5`
    );
    const topServices = topServicesRows.map((row: any) => ({
      service: row.service,
      count: row.count,
      revenue: row.revenue,
    }));

    return {
      totalOrders,
      completedOrders,
      inProgressOrders,
      averageCompletionTime,
      efficiency,
      onTimeDelivery,
      monthOrders,
      ordersGrowth,
      averageOrderValue,
      topServices,
    };
  },

  async getClientMetrics(startDate?: string, endDate?: string): Promise<ClientMetrics> {
    if (Platform.OS === 'web') {
      return this.getWebClientMetrics(startDate, endDate);
    }

    const db = storageService.getDatabase();
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().split('T')[0];

    // Total clients
    const totalResult = await db.getFirstAsync(`SELECT COUNT(*) as count FROM clients`);
    const totalClients = totalResult?.count || 0;

    // Active clients (with at least one order)
    const activeResult = await db.getFirstAsync(
      `SELECT COUNT(DISTINCT client_id) as count FROM service_orders`
    );
    const activeClients = activeResult?.count || 0;

    // New clients this month
    const newResult = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM clients WHERE created_at >= ?`,
      [monthStartStr]
    );
    const newClients = newResult?.count || 0;

    // Retention rate (clients with orders in last 90 days)
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - 90);
    const retentionResult = await db.getFirstAsync(
      `SELECT COUNT(DISTINCT client_id) as count FROM service_orders WHERE created_at >= ?`,
      [retentionDate.toISOString().split('T')[0]]
    );
    const retainedClients = retentionResult?.count || 0;
    const retentionRate = totalClients > 0 ? (retainedClients / totalClients) * 100 : 0;

    // Average satisfaction (from ratings)
    const satisfactionResult = await db.getFirstAsync(
      `SELECT COALESCE(AVG(rating), 0) as avg FROM service_orders WHERE rating IS NOT NULL`
    );
    const averageSatisfaction = satisfactionResult?.avg || 0;

    // Top clients
    const topClientsRows = await db.getAllAsync(
      `SELECT 
        c.id as client_id,
        c.name as client_name,
        COALESCE(SUM(so.total), 0) as total_spent,
        COUNT(so.id) as order_count
       FROM clients c
       LEFT JOIN service_orders so ON c.id = so.client_id
       GROUP BY c.id
       ORDER BY total_spent DESC
       LIMIT 10`
    );
    const topClients = topClientsRows.map((row: any) => ({
      clientId: row.client_id,
      clientName: row.client_name,
      totalSpent: row.total_spent,
      orderCount: row.order_count,
    }));

    // Churn rate (clients without orders in 90+ days)
    const churnedResult = await db.getFirstAsync(
      `SELECT COUNT(DISTINCT c.id) as count FROM clients c
       LEFT JOIN service_orders so ON c.id = so.client_id AND so.created_at >= ?
       WHERE so.id IS NULL`,
      [retentionDate.toISOString().split('T')[0]]
    );
    const churnedClients = churnedResult?.count || 0;
    const churnRate = totalClients > 0 ? (churnedClients / totalClients) * 100 : 0;

    // Client growth
    const prevMonthStart = new Date(monthStart);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthEnd = new Date(monthStart);
    prevMonthEnd.setDate(0);

    const prevTotalResult = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM clients WHERE created_at < ?`,
      [monthStartStr]
    );
    const prevTotal = prevTotalResult?.count || 0;
    const clientGrowth = prevTotal > 0 ? ((totalClients - prevTotal) / prevTotal) * 100 : 0;

    return {
      totalClients,
      activeClients,
      newClients,
      retentionRate,
      averageSatisfaction,
      topClients,
      churnRate,
      clientGrowth,
    };
  },

  async getInventoryMetrics(): Promise<InventoryMetrics> {
    if (Platform.OS === 'web') {
      return this.getWebInventoryMetrics();
    }

    const db = storageService.getDatabase();

    // Total products
    const totalResult = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM products WHERE active = 1`
    );
    const totalProducts = totalResult?.count || 0;

    // Stock value
    const valueResult = await db.getFirstAsync(
      `SELECT COALESCE(SUM(stock_quantity * cost_price), 0) as total FROM products WHERE active = 1`
    );
    const stockValue = valueResult?.total || 0;

    // Low stock items
    const lowStockResult = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM products 
       WHERE active = 1 AND track_stock = 1 AND stock_quantity <= min_stock AND stock_quantity > 0`
    );
    const lowStockItems = lowStockResult?.count || 0;

    // Out of stock items
    const outStockResult = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM products 
       WHERE active = 1 AND track_stock = 1 AND stock_quantity = 0`
    );
    const outOfStockItems = outStockResult?.count || 0;

    // Turnover rate (simplified - sales / average stock)
    const turnoverResult = await db.getFirstAsync(
      `SELECT 
        COALESCE(SUM(CASE WHEN type = 'SALE' THEN quantity ELSE 0 END), 0) as sales,
        COALESCE(AVG(stock_quantity), 1) as avg_stock
       FROM products p
       LEFT JOIN stock_movements sm ON p.id = sm.product_id
       WHERE p.active = 1`
    );
    const sales = turnoverResult?.sales || 0;
    const avgStock = turnoverResult?.avg_stock || 1;
    const turnoverRate = avgStock > 0 ? sales / avgStock : 0;

    // Top products by value
    const topProductsRows = await db.getAllAsync(
      `SELECT 
        id as product_id,
        name as product_name,
        stock_quantity as quantity,
        (stock_quantity * cost_price) as value
       FROM products
       WHERE active = 1
       ORDER BY value DESC
       LIMIT 10`
    );
    const topProducts = topProductsRows.map((row: any) => ({
      productId: row.product_id,
      productName: row.product_name,
      quantity: row.quantity,
      value: row.value,
    }));

    // Slow moving items (no movement in 90 days)
    const slowDate = new Date();
    slowDate.setDate(slowDate.getDate() - 90);
    const slowResult = await db.getFirstAsync(
      `SELECT COUNT(DISTINCT p.id) as count FROM products p
       LEFT JOIN stock_movements sm ON p.id = sm.product_id AND sm.movement_date >= ?
       WHERE p.active = 1 AND sm.id IS NULL`,
      [slowDate.toISOString().split('T')[0]]
    );
    const slowMovingItems = slowResult?.count || 0;

    return {
      totalProducts,
      stockValue,
      lowStockItems,
      outOfStockItems,
      turnoverRate,
      topProducts,
      slowMovingItems,
    };
  },

  async getTeamMetrics(startDate?: string, endDate?: string): Promise<TeamMetrics> {
    if (Platform.OS === 'web') {
      return this.getWebTeamMetrics(startDate, endDate);
    }

    const db = storageService.getDatabase();

    // Total collaborators
    const totalResult = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM collaborators`
    );
    const totalCollaborators = totalResult?.count || 0;

    // Active collaborators
    const activeResult = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM collaborators WHERE active = 1`
    );
    const activeCollaborators = activeResult?.count || 0;

    // Total commissions
    const totalCommResult = await db.getFirstAsync(
      `SELECT COALESCE(SUM(amount), 0) as total FROM commissions`
    );
    const totalCommissions = totalCommResult?.total || 0;

    // Paid commissions
    const paidResult = await db.getFirstAsync(
      `SELECT COALESCE(SUM(amount), 0) as total FROM commissions WHERE status = 'PAID'`
    );
    const paidCommissions = paidResult?.total || 0;

    // Pending commissions
    const pendingResult = await db.getFirstAsync(
      `SELECT COALESCE(SUM(amount), 0) as total FROM commissions WHERE status = 'PENDING'`
    );
    const pendingCommissions = pendingResult?.total || 0;

    // Average productivity (services per collaborator)
    const productivityResult = await db.getFirstAsync(
      `SELECT COALESCE(AVG(service_count), 0) as avg FROM (
        SELECT collaborator_id, COUNT(*) as service_count
        FROM service_order_collaborators
        GROUP BY collaborator_id
      )`
    );
    const averageProductivity = productivityResult?.avg || 0;

    // Top performers
    const topPerformersRows = await db.getAllAsync(
      `SELECT 
        c.id as collaborator_id,
        c.name as collaborator_name,
        COUNT(soc.id) as service_count,
        COALESCE(SUM(soc.commission_amount), 0) as total_commission
       FROM collaborators c
       LEFT JOIN service_order_collaborators soc ON c.id = soc.collaborator_id
       WHERE c.active = 1
       GROUP BY c.id
       ORDER BY total_commission DESC
       LIMIT 10`
    );
    const topPerformers = topPerformersRows.map((row: any) => ({
      collaboratorId: row.collaborator_id,
      collaboratorName: row.collaborator_name,
      serviceCount: row.service_count,
      totalCommission: row.total_commission,
    }));

    return {
      totalCollaborators,
      activeCollaborators,
      totalCommissions,
      paidCommissions,
      pendingCommissions,
      averageProductivity,
      topPerformers,
    };
  },

  async getRevenueChart(months: number = 6): Promise<RevenueChartData[]> {
    if (Platform.OS === 'web') {
      return this.getWebRevenueChart(months);
    }

    const db = storageService.getDatabase();
    const data: RevenueChartData[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const startStr = monthStart.toISOString().split('T')[0];
      const endStr = monthEnd.toISOString().split('T')[0];

      const revenueResult = await db.getFirstAsync(
        `SELECT COALESCE(SUM(amount), 0) as total FROM accounts_receivable 
         WHERE status = 'RECEIVED' AND payment_date BETWEEN ? AND ?`,
        [startStr, endStr]
      );

      const expenseResult = await db.getFirstAsync(
        `SELECT COALESCE(SUM(amount), 0) as total FROM accounts_payable 
         WHERE status = 'PAID' AND payment_date BETWEEN ? AND ?`,
        [startStr, endStr]
      );

      const revenue = revenueResult?.total || 0;
      const expenses = expenseResult?.total || 0;

      data.push({
        month: monthStart.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        revenue,
        expenses,
        profit: revenue - expenses,
      });
    }

    return data;
  },

  // Web fallback methods
  async getWebFinancialMetrics(startDate?: string, endDate?: string): Promise<FinancialMetrics> {
    return {
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
    };
  },

  async getWebOperationalMetrics(startDate?: string, endDate?: string): Promise<OperationalMetrics> {
    return {
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
    };
  },

  async getWebClientMetrics(startDate?: string, endDate?: string): Promise<ClientMetrics> {
    return {
      totalClients: 0,
      activeClients: 0,
      newClients: 0,
      retentionRate: 0,
      averageSatisfaction: 0,
      topClients: [],
      churnRate: 0,
      clientGrowth: 0,
    };
  },

  async getWebInventoryMetrics(): Promise<InventoryMetrics> {
    return {
      totalProducts: 0,
      stockValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      turnoverRate: 0,
      topProducts: [],
      slowMovingItems: 0,
    };
  },

  async getWebTeamMetrics(startDate?: string, endDate?: string): Promise<TeamMetrics> {
    return {
      totalCollaborators: 0,
      activeCollaborators: 0,
      totalCommissions: 0,
      paidCommissions: 0,
      pendingCommissions: 0,
      averageProductivity: 0,
      topPerformers: [],
    };
  },

  async getWebRevenueChart(months: number): Promise<RevenueChartData[]> {
    return [];
  },
};
