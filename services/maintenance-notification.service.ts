import { Platform } from 'react-native';
import { storageService } from './storage.service';
import { MaintenanceNotification } from '../types';

// ============================================
// MAINTENANCE NOTIFICATION SERVICE
// ============================================

export const maintenanceNotificationService = {
  async getAll(): Promise<MaintenanceNotification[]> {
    if (Platform.OS === 'web') {
      const notifications = await storageService.webGet<MaintenanceNotification[]>('maintenance_notifications');
      return notifications || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync(
      'SELECT * FROM maintenance_notifications ORDER BY scheduled_date DESC'
    );
    return rows.map(this.mapNotification);
  },

  async getPending(): Promise<MaintenanceNotification[]> {
    if (Platform.OS === 'web') {
      const notifications = await storageService.webGet<MaintenanceNotification[]>('maintenance_notifications');
      return notifications?.filter(n => n.status === 'PENDING') || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync(
      'SELECT * FROM maintenance_notifications WHERE status = ? ORDER BY scheduled_date',
      ['PENDING']
    );
    return rows.map(this.mapNotification);
  },

  async getByPreventive(preventiveId: number): Promise<MaintenanceNotification[]> {
    if (Platform.OS === 'web') {
      const notifications = await storageService.webGet<MaintenanceNotification[]>('maintenance_notifications');
      return notifications?.filter(n => n.preventiveId === preventiveId) || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync(
      'SELECT * FROM maintenance_notifications WHERE preventive_id = ? ORDER BY scheduled_date',
      [preventiveId]
    );
    return rows.map(this.mapNotification);
  },

  async getDueNotifications(): Promise<MaintenanceNotification[]> {
    const today = new Date().toISOString().split('T')[0];

    if (Platform.OS === 'web') {
      const notifications = await storageService.webGet<MaintenanceNotification[]>('maintenance_notifications');
      return notifications?.filter(n => 
        n.status === 'PENDING' && n.scheduledDate <= today
      ) || [];
    }

    const db = storageService.getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM maintenance_notifications 
       WHERE status = 'PENDING' AND scheduled_date <= ?
       ORDER BY scheduled_date`,
      [today]
    );
    return rows.map(this.mapNotification);
  },

  async create(notification: Omit<MaintenanceNotification, 'id' | 'createdAt'>): Promise<MaintenanceNotification> {
    const now = new Date().toISOString();

    if (Platform.OS === 'web') {
      const notifications = await storageService.webGet<MaintenanceNotification[]>('maintenance_notifications') || [];
      const newNotification: MaintenanceNotification = {
        id: Date.now(),
        ...notification,
        createdAt: now,
      };
      notifications.push(newNotification);
      await storageService.webSet('maintenance_notifications', notifications);
      return newNotification;
    }

    const db = storageService.getDatabase();
    const result = await db.runAsync(
      `INSERT INTO maintenance_notifications (
        preventive_id, type, scheduled_date, sent_date, status,
        message, error_message, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        notification.preventiveId,
        notification.type,
        notification.scheduledDate,
        notification.sentDate || null,
        notification.status,
        notification.message || null,
        notification.errorMessage || null,
        now,
      ]
    );

    const notifications = await this.getAll();
    const created = notifications.find(n => n.id === result.lastInsertRowId);
    if (!created) throw new Error('Failed to create notification');
    return created;
  },

  async markAsSent(id: number): Promise<void> {
    const now = new Date().toISOString();

    if (Platform.OS === 'web') {
      const notifications = await storageService.webGet<MaintenanceNotification[]>('maintenance_notifications') || [];
      const index = notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        notifications[index].status = 'SENT';
        notifications[index].sentDate = now;
        await storageService.webSet('maintenance_notifications', notifications);
      }
      return;
    }

    const db = storageService.getDatabase();
    await db.runAsync(
      'UPDATE maintenance_notifications SET status = ?, sent_date = ? WHERE id = ?',
      ['SENT', now, id]
    );
  },

  async markAsFailed(id: number, errorMessage: string): Promise<void> {
    if (Platform.OS === 'web') {
      const notifications = await storageService.webGet<MaintenanceNotification[]>('maintenance_notifications') || [];
      const index = notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        notifications[index].status = 'FAILED';
        notifications[index].errorMessage = errorMessage;
        await storageService.webSet('maintenance_notifications', notifications);
      }
      return;
    }

    const db = storageService.getDatabase();
    await db.runAsync(
      'UPDATE maintenance_notifications SET status = ?, error_message = ? WHERE id = ?',
      ['FAILED', errorMessage, id]
    );
  },

  async scheduleNotificationsForPreventive(
    preventiveId: number,
    nextExecutionDate: string,
    alertDaysBefore: number
  ): Promise<void> {
    // Delete existing pending notifications
    if (Platform.OS === 'web') {
      const notifications = await storageService.webGet<MaintenanceNotification[]>('maintenance_notifications') || [];
      const filtered = notifications.filter(n => 
        !(n.preventiveId === preventiveId && n.status === 'PENDING')
      );
      await storageService.webSet('maintenance_notifications', filtered);
    } else {
      const db = storageService.getDatabase();
      await db.runAsync(
        'DELETE FROM maintenance_notifications WHERE preventive_id = ? AND status = ?',
        [preventiveId, 'PENDING']
      );
    }

    // Schedule new notifications based on alert days
    const executionDate = new Date(nextExecutionDate);
    const alerts: Array<{ days: number; type: MaintenanceNotification['type'] }> = [];

    if (alertDaysBefore >= 7) alerts.push({ days: 7, type: 'ALERT_7_DAYS' });
    if (alertDaysBefore >= 3) alerts.push({ days: 3, type: 'ALERT_3_DAYS' });
    if (alertDaysBefore >= 1) alerts.push({ days: 1, type: 'ALERT_1_DAY' });

    for (const alert of alerts) {
      const scheduledDate = new Date(executionDate);
      scheduledDate.setDate(scheduledDate.getDate() - alert.days);

      await this.create({
        preventiveId,
        type: alert.type,
        scheduledDate: scheduledDate.toISOString().split('T')[0],
        status: 'PENDING',
        message: `Manutenção preventiva programada para daqui a ${alert.days} dia(s)`,
      });
    }
  },

  mapNotification(row: any): MaintenanceNotification {
    return {
      id: row.id,
      preventiveId: row.preventive_id,
      type: row.type,
      scheduledDate: row.scheduled_date,
      sentDate: row.sent_date,
      status: row.status,
      message: row.message,
      errorMessage: row.error_message,
      createdAt: row.created_at,
    };
  },
};
