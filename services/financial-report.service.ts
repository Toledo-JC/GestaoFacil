import { FinancialSummary, MonthlyReport, CategoryReport } from '../types';
import { bankAccountService } from './bank-account.service';
import { accountsReceivableService } from './accounts-receivable.service';
import { accountsPayableService } from './accounts-payable.service';

// ============================================
// FINANCIAL REPORT SERVICE
// ============================================

export const financialReportService = {
  async getSummary(): Promise<FinancialSummary> {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    // Total balance from all active bank accounts
    const totalBalance = await bankAccountService.getTotalBalance();

    // Get all receivables and payables
    const allReceivables = await accountsReceivableService.getAll();
    const allPayables = await accountsPayableService.getAll();

    // Month revenue (received this month)
    const monthRevenue = allReceivables
      .filter(r => 
        r.status === 'RECEIVED' && 
        r.paymentDate && 
        r.paymentDate >= firstDayOfMonth && 
        r.paymentDate <= lastDayOfMonth
      )
      .reduce((sum, r) => sum + r.amount, 0);

    // Month expenses (paid this month)
    const monthExpenses = allPayables
      .filter(p => 
        p.status === 'PAID' && 
        p.paymentDate && 
        p.paymentDate >= firstDayOfMonth && 
        p.paymentDate <= lastDayOfMonth
      )
      .reduce((sum, p) => sum + p.amount, 0);

    // Month profit
    const monthProfit = monthRevenue - monthExpenses;

    // Pending receivables
    const pendingReceivables = allReceivables
      .filter(r => r.status === 'PENDING')
      .reduce((sum, r) => sum + r.amount, 0);

    // Overdue receivables
    const overdueReceivables = allReceivables
      .filter(r => r.status === 'OVERDUE')
      .reduce((sum, r) => sum + r.amount, 0);

    // Pending payables
    const pendingPayables = allPayables
      .filter(p => p.status === 'PENDING')
      .reduce((sum, p) => sum + p.amount, 0);

    // Overdue payables
    const overduePayables = allPayables
      .filter(p => p.status === 'OVERDUE')
      .reduce((sum, p) => sum + p.amount, 0);

    // Projected balance
    const projectedBalance = totalBalance + pendingReceivables - pendingPayables;

    return {
      totalBalance,
      monthRevenue,
      monthExpenses,
      monthProfit,
      pendingReceivables,
      overdueReceivables,
      pendingPayables,
      overduePayables,
      projectedBalance,
    };
  },

  async getMonthlyReports(months: number = 6): Promise<MonthlyReport[]> {
    const reports: MonthlyReport[] = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

      const allReceivables = await accountsReceivableService.getAll();
      const allPayables = await accountsPayableService.getAll();

      const revenue = allReceivables
        .filter(r => 
          r.status === 'RECEIVED' && 
          r.paymentDate && 
          r.paymentDate >= firstDay && 
          r.paymentDate <= lastDay
        )
        .reduce((sum, r) => sum + r.amount, 0);

      const expenses = allPayables
        .filter(p => 
          p.status === 'PAID' && 
          p.paymentDate && 
          p.paymentDate >= firstDay && 
          p.paymentDate <= lastDay
        )
        .reduce((sum, p) => sum + p.amount, 0);

      const profit = revenue - expenses;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

      reports.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        revenue,
        expenses,
        profit,
        profitMargin,
      });
    }

    return reports;
  },

  async getCategoryReport(type: 'INCOME' | 'EXPENSE', months: number = 1): Promise<CategoryReport[]> {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - (months - 1), 1).toISOString().split('T')[0];
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const categoryMap = new Map<number, { name: string; total: number; transactions: number }>();

    if (type === 'INCOME') {
      const allReceivables = await accountsReceivableService.getAll();
      const filtered = allReceivables.filter(r => 
        r.status === 'RECEIVED' && 
        r.paymentDate && 
        r.paymentDate >= startDate && 
        r.paymentDate <= endDate
      );

      filtered.forEach(r => {
        const categoryId = r.categoryId || 0;
        const existing = categoryMap.get(categoryId) || { name: 'Sem Categoria', total: 0, transactions: 0 };
        categoryMap.set(categoryId, {
          ...existing,
          total: existing.total + r.amount,
          transactions: existing.transactions + 1,
        });
      });
    } else {
      const allPayables = await accountsPayableService.getAll();
      const filtered = allPayables.filter(p => 
        p.status === 'PAID' && 
        p.paymentDate && 
        p.paymentDate >= startDate && 
        p.paymentDate <= endDate
      );

      filtered.forEach(p => {
        const categoryId = p.categoryId;
        const existing = categoryMap.get(categoryId) || { name: 'Sem Categoria', total: 0, transactions: 0 };
        categoryMap.set(categoryId, {
          ...existing,
          total: existing.total + p.amount,
          transactions: existing.transactions + 1,
        });
      });
    }

    const total = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.total, 0);
    
    return Array.from(categoryMap.entries()).map(([id, data]) => ({
      categoryId: id,
      categoryName: data.name,
      total: data.total,
      percentage: total > 0 ? (data.total / total) * 100 : 0,
      transactions: data.transactions,
    }));
  },
};
