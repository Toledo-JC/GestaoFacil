import { notificationService } from './notification.service';
import { accountsReceivableService } from './accounts-receivable.service';
import { accountsPayableService } from './accounts-payable.service';
import { preventiveMaintenanceService } from './preventive-maintenance.service';
import { stockAlertService } from './stock-alert.service';
import { clientService } from './client.service';
import {
  SmartAlert,
  NotificationInsight,
  NotificationType,
  NotificationPriority,
  NotificationCategory,
} from '../types';

// ============================================
// SMART ALERT SYSTEM
// AI-Powered proactive notifications
// ============================================

export const smartAlertSystem = {
  // ============================================
  // ANALYZE & GENERATE ALERTS
  // ============================================

  async analyzeAndNotify(): Promise<{ generated: number; error: string | null }> {
    try {
      let count = 0;

      // Financial Alerts
      count += await this.checkFinancialAlerts();

      // Preventive Maintenance Alerts
      count += await this.checkPreventiveAlerts();

      // Stock Alerts
      count += await this.checkStockAlerts();

      // Client Alerts
      count += await this.checkClientAlerts();

      return { generated: count, error: null };
    } catch (error: any) {
      return { generated: 0, error: error.message };
    }
  },

  async checkFinancialAlerts(): Promise<number> {
    let count = 0;

    try {
      // Check overdue receivables
      const { data: receivables } = await accountsReceivableService.getAll({ status: 'OVERDUE' });
      if (receivables && receivables.length > 0) {
        const totalOverdue = receivables.reduce((sum, r) => sum + r.amount, 0);
        await notificationService.create({
          type: 'FINANCIAL_OVERDUE',
          category: 'FINANCIAL',
          priority: 'HIGH',
          status: 'PENDING',
          title: 'Contas em Atraso',
          message: `Você tem ${receivables.length} conta(s) em atraso totalizando R$ ${totalOverdue.toFixed(2)}`,
          actionUrl: '/accounts-receivable',
          actionLabel: 'Ver Contas',
          data: { count: receivables.length, total: totalOverdue },
          sentAt: new Date().toISOString(),
        });
        count++;
      }

      // Check due soon (7 days)
      const { data: payables } = await accountsPayableService.getAll({ status: 'PENDING' });
      if (payables) {
        const dueSoon = payables.filter(p => {
          const daysUntil = Math.floor((new Date(p.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return daysUntil >= 0 && daysUntil <= 7;
        });

        if (dueSoon.length > 0) {
          const total = dueSoon.reduce((sum, p) => sum + p.amount, 0);
          await notificationService.create({
            type: 'FINANCIAL_DUE',
            category: 'FINANCIAL',
            priority: 'NORMAL',
            status: 'PENDING',
            title: 'Contas a Vencer',
            message: `${dueSoon.length} conta(s) vencem nos próximos 7 dias - R$ ${total.toFixed(2)}`,
            actionUrl: '/accounts-payable',
            actionLabel: 'Ver Contas',
            data: { count: dueSoon.length, total },
            sentAt: new Date().toISOString(),
          });
          count++;
        }
      }
    } catch (error) {
      console.error('[SmartAlert] Financial alerts error:', error);
    }

    return count;
  },

  async checkPreventiveAlerts(): Promise<number> {
    let count = 0;

    try {
      const { data: preventives } = await preventiveMaintenanceService.getAll({ active: true });
      if (preventives) {
        const dueSoon = preventives.filter(p => {
          if (!p.nextExecutionDate) return false;
          const daysUntil = Math.floor((new Date(p.nextExecutionDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return daysUntil >= 0 && daysUntil <= p.alertDaysBefore;
        });

        if (dueSoon.length > 0) {
          await notificationService.create({
            type: 'PREVENTIVE_DUE',
            category: 'OPERATIONAL',
            priority: 'NORMAL',
            status: 'PENDING',
            title: 'Preventivas Próximas',
            message: `${dueSoon.length} manutenção(ões) preventiva(s) próxima(s)`,
            actionUrl: '/(tabs)/maintenance',
            actionLabel: 'Ver Preventivas',
            data: { count: dueSoon.length },
            sentAt: new Date().toISOString(),
          });
          count++;
        }

        const overdue = preventives.filter(p => {
          if (!p.nextExecutionDate) return false;
          return new Date(p.nextExecutionDate).getTime() < Date.now();
        });

        if (overdue.length > 0) {
          await notificationService.create({
            type: 'PREVENTIVE_OVERDUE',
            category: 'OPERATIONAL',
            priority: 'HIGH',
            status: 'PENDING',
            title: 'Preventivas Atrasadas',
            message: `${overdue.length} manutenção(ões) preventiva(s) atrasada(s)`,
            actionUrl: '/(tabs)/maintenance',
            actionLabel: 'Ver Preventivas',
            data: { count: overdue.length },
            sentAt: new Date().toISOString(),
          });
          count++;
        }
      }
    } catch (error) {
      console.error('[SmartAlert] Preventive alerts error:', error);
    }

    return count;
  },

  async checkStockAlerts(): Promise<number> {
    let count = 0;

    try {
      const { data: alerts } = await stockAlertService.getAll({ acknowledged: false });
      if (alerts) {
        const critical = alerts.filter(a => a.severity === 'CRITICAL');
        
        if (critical.length > 0) {
          await notificationService.create({
            type: 'STOCK_EMPTY',
            category: 'OPERATIONAL',
            priority: 'URGENT',
            status: 'PENDING',
            title: 'Alerta de Estoque Crítico',
            message: `${critical.length} produto(s) com estoque crítico`,
            actionUrl: '/(tabs)/inventory',
            actionLabel: 'Ver Estoque',
            data: { count: critical.length },
            sentAt: new Date().toISOString(),
          });
          count++;
        }
      }
    } catch (error) {
      console.error('[SmartAlert] Stock alerts error:', error);
    }

    return count;
  },

  async checkClientAlerts(): Promise<number> {
    let count = 0;

    try {
      const { data: clients } = await clientService.getAll();
      if (clients) {
        // Birthday alerts (today and next 7 days)
        const today = new Date();
        const birthdays = clients.filter(c => {
          if (!c.birthday) return false;
          const birthday = new Date(c.birthday);
          const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
          const daysUntil = Math.floor((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntil >= 0 && daysUntil <= 7;
        });

        if (birthdays.length > 0) {
          await notificationService.create({
            type: 'CLIENT_BIRTHDAY',
            category: 'CLIENT',
            priority: 'LOW',
            status: 'PENDING',
            title: 'Aniversários de Clientes',
            message: `${birthdays.length} cliente(s) fazem aniversário nos próximos 7 dias`,
            actionUrl: '/(tabs)/clients',
            actionLabel: 'Ver Clientes',
            data: { count: birthdays.length, clients: birthdays.map(c => ({ id: c.id, name: c.name, birthday: c.birthday })) },
            sentAt: new Date().toISOString(),
          });
          count++;
        }
      }
    } catch (error) {
      console.error('[SmartAlert] Client alerts error:', error);
    }

    return count;
  },

  // ============================================
  // GENERATE INSIGHTS
  // ============================================

  async generateInsights(): Promise<{ data: NotificationInsight[]; error: string | null }> {
    const insights: NotificationInsight[] = [];

    try {
      // Revenue trend insight
      // Preventive compliance insight
      // Stock turnover insight
      // Client retention insight

      // Placeholder insights for now
      insights.push({
        id: `insight_${Date.now()}_1`,
        category: 'FINANCIAL',
        title: 'Receita Crescendo',
        description: 'Sua receita está 15% acima do mês passado',
        trend: 'UP',
        impact: 'POSITIVE',
        actionable: false,
        data: { growth: 15 },
        generatedAt: new Date().toISOString(),
      });

      return { data: insights, error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  },

  // ============================================
  // SMART SCHEDULING
  // Based on user patterns
  // ============================================

  async scheduleSmartNotification(
    type: NotificationType,
    title: string,
    message: string,
    data?: any
  ): Promise<{ error: string | null }> {
    try {
      // Get user patterns for this notification type
      // Determine best time to send
      // For now, send immediately

      const category = this.getCategoryForType(type);
      const priority = this.getPriorityForType(type);

      await notificationService.create({
        type,
        category,
        priority,
        status: 'PENDING',
        title,
        message,
        data,
        sentAt: new Date().toISOString(),
      });

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  getCategoryForType(type: NotificationType): NotificationCategory {
    if (type.startsWith('FINANCIAL_')) return 'FINANCIAL';
    if (type.startsWith('PREVENTIVE_') || type.startsWith('STOCK_') || type.startsWith('OS_')) return 'OPERATIONAL';
    if (type.startsWith('CLIENT_')) return 'CLIENT';
    if (type.startsWith('ANALYTICS_')) return 'ANALYTICS';
    return 'SYSTEM';
  },

  getPriorityForType(type: NotificationType): NotificationPriority {
    if (type.includes('OVERDUE') || type.includes('URGENT') || type === 'STOCK_EMPTY') return 'URGENT';
    if (type.includes('DUE') || type === 'STOCK_LOW') return 'HIGH';
    if (type.includes('BIRTHDAY') || type.includes('INSIGHT')) return 'LOW';
    return 'NORMAL';
  },
};
