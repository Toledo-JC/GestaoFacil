import { storageService } from './storage.service';
import {
  Notification,
  NotificationSettings,
  NotificationSchedule,
  NotificationPattern,
  NotificationType,
  NotificationCategory,
  NotificationPriority,
  NotificationStatus,
  NotificationSummary,
} from '../types';

// ============================================
// NOTIFICATION SERVICE
// ============================================

export const notificationService = {
  // ============================================
  // NOTIFIC CRUD OPERATIONS
  // ============================================

  async create(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<{ data: Notification | null; error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const notifications = (await storageService.webGet<Notification[]>('notifications')) || [];
        const newNotification: Notification = {
          ...notification,
          id: Date.now(),
          createdAt: new Date().toISOString(),
        };
        notifications.unshift(newNotification);
        await storageService.webSet('notifications', notifications);
        return { data: newNotification, error: null };
      }

      const db = storageService.getDatabase();
      const result = await db.runAsync(
        `INSERT INTO notifications (
          type, category, priority, status, title, message,
          action_url, action_label, data, scheduled_for, sent_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          notification.type,
          notification.category,
          notification.priority,
          notification.status,
          notification.title,
          notification.message,
          notification.actionUrl || null,
          notification.actionLabel || null,
          notification.data ? JSON.stringify(notification.data) : null,
          notification.scheduledFor || null,
          notification.sentAt || null,
        ]
      );

      const created = await db.getFirstAsync<Notification>(
        'SELECT * FROM notifications WHERE id = ?',
        [result.lastInsertRowId]
      );

      return { data: created || null, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async getAll(filter?: {
    status?: NotificationStatus;
    category?: NotificationCategory;
    priority?: NotificationPriority;
    limit?: number;
  }): Promise<{ data: Notification[]; error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        let notifications = (await storageService.webGet<Notification[]>('notifications')) || [];
        if (filter?.status) {
          notifications = notifications.filter(n => n.status === filter.status);
        }
        if (filter?.category) {
          notifications = notifications.filter(n => n.category === filter.category);
        }
        if (filter?.priority) {
          notifications = notifications.filter(n => n.priority === filter.priority);
        }
        if (filter?.limit) {
          notifications = notifications.slice(0, filter.limit);
        }
        return { data: notifications, error: null };
      }

      const db = storageService.getDatabase();
      let query = 'SELECT * FROM notifications WHERE 1=1';
      const params: any[] = [];

      if (filter?.status) {
        query += ' AND status = ?';
        params.push(filter.status);
      }

      if (filter?.category) {
        query += ' AND category = ?';
        params.push(filter.category);
      }

      if (filter?.priority) {
        query += ' AND priority = ?';
        params.push(filter.priority);
      }

      query += ' ORDER BY created_at DESC';

      if (filter?.limit) {
        query += ' LIMIT ?';
        params.push(filter.limit);
      }

      const notifications = await db.getAllAsync<Notification>(query, params);

      return { data: notifications, error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  },

  async markAsRead(id: number): Promise<{ error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const notifications = (await storageService.webGet<Notification[]>('notifications')) || [];
        const notification = notifications.find(n => n.id === id);
        if (notification) {
          notification.status = 'READ';
          notification.readAt = new Date().toISOString();
          await storageService.webSet('notifications', notifications);
        }
        return { error: null };
      }

      const db = storageService.getDatabase();
      await db.runAsync(
        'UPDATE notifications SET status = ?, read_at = ? WHERE id = ?',
        ['READ', new Date().toISOString(), id]
      );

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async markAllAsRead(category?: NotificationCategory): Promise<{ error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const notifications = (await storageService.webGet<Notification[]>('notifications')) || [];
        const now = new Date().toISOString();
        notifications.forEach(n => {
          if (n.status === 'PENDING' && (!category || n.category === category)) {
            n.status = 'READ';
            n.readAt = now;
          }
        });
        await storageService.webSet('notifications', notifications);
        return { error: null };
      }

      const db = storageService.getDatabase();
      let query = 'UPDATE notifications SET status = ?, read_at = ? WHERE status = ?';
      const params: any[] = ['READ', new Date().toISOString(), 'PENDING'];

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      await db.runAsync(query, params);

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async snooze(id: number, until: string): Promise<{ error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const notifications = (await storageService.webGet<Notification[]>('notifications')) || [];
        const notification = notifications.find(n => n.id === id);
        if (notification) {
          notification.status = 'SNOOZED';
          notification.snoozedUntil = until;
          await storageService.webSet('notifications', notifications);
        }
        return { error: null };
      }

      const db = storageService.getDatabase();
      await db.runAsync(
        'UPDATE notifications SET status = ?, snoozed_until = ? WHERE id = ?',
        ['SNOOZED', until, id]
      );

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async archive(id: number): Promise<{ error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const notifications = (await storageService.webGet<Notification[]>('notifications')) || [];
        const notification = notifications.find(n => n.id === id);
        if (notification) {
          notification.status = 'ARCHIVED';
          notification.archivedAt = new Date().toISOString();
          await storageService.webSet('notifications', notifications);
        }
        return { error: null };
      }

      const db = storageService.getDatabase();
      await db.runAsync(
        'UPDATE notifications SET status = ?, archived_at = ? WHERE id = ?',
        ['ARCHIVED', new Date().toISOString(), id]
      );

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async delete(id: number): Promise<{ error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const notifications = (await storageService.webGet<Notification[]>('notifications')) || [];
        const filtered = notifications.filter(n => n.id !== id);
        await storageService.webSet('notifications', filtered);
        return { error: null };
      }

      const db = storageService.getDatabase();
      await db.runAsync('DELETE FROM notifications WHERE id = ?', [id]);

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async getSummary(): Promise<{ data: NotificationSummary | null; error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const notifications = (await storageService.webGet<Notification[]>('notifications')) || [];
        
        const summary: NotificationSummary = {
          total: notifications.length,
          unread: notifications.filter(n => n.status === 'PENDING').length,
          snoozed: notifications.filter(n => n.status === 'SNOOZED').length,
          urgent: notifications.filter(n => n.priority === 'URGENT' && n.status === 'PENDING').length,
          byCategory: {
            FINANCIAL: notifications.filter(n => n.category === 'FINANCIAL').length,
            OPERATIONAL: notifications.filter(n => n.category === 'OPERATIONAL').length,
            CLIENT: notifications.filter(n => n.category === 'CLIENT').length,
            ANALYTICS: notifications.filter(n => n.category === 'ANALYTICS').length,
            SYSTEM: notifications.filter(n => n.category === 'SYSTEM').length,
          },
          byPriority: {
            LOW: notifications.filter(n => n.priority === 'LOW').length,
            NORMAL: notifications.filter(n => n.priority === 'NORMAL').length,
            HIGH: notifications.filter(n => n.priority === 'HIGH').length,
            URGENT: notifications.filter(n => n.priority === 'URGENT').length,
          },
          recentAlerts: notifications.slice(0, 5),
        };

        return { data: summary, error: null };
      }

      const db = storageService.getDatabase();
      
      const total = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM notifications'
      );

      const unread = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM notifications WHERE status = 'PENDING'`
      );

      const snoozed = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM notifications WHERE status = 'SNOOZED'`
      );

      const urgent = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM notifications WHERE priority = 'URGENT' AND status = 'PENDING'`
      );

      const byCategory = await db.getAllAsync<{ category: NotificationCategory; count: number }>(
        'SELECT category, COUNT(*) as count FROM notifications GROUP BY category'
      );

      const byPriority = await db.getAllAsync<{ priority: NotificationPriority; count: number }>(
        'SELECT priority, COUNT(*) as count FROM notifications GROUP BY priority'
      );

      const recentAlerts = await db.getAllAsync<Notification>(
        `SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5`
      );

      const summary: NotificationSummary = {
        total: total?.count || 0,
        unread: unread?.count || 0,
        snoozed: snoozed?.count || 0,
        urgent: urgent?.count || 0,
        byCategory: {
          FINANCIAL: 0,
          OPERATIONAL: 0,
          CLIENT: 0,
          ANALYTICS: 0,
          SYSTEM: 0,
        },
        byPriority: {
          LOW: 0,
          NORMAL: 0,
          HIGH: 0,
          URGENT: 0,
        },
        recentAlerts,
      };

      byCategory.forEach(item => {
        summary.byCategory[item.category] = item.count;
      });

      byPriority.forEach(item => {
        summary.byPriority[item.priority] = item.count;
      });

      return { data: summary, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // ============================================
  // SETTINGS
  // ============================================

  async getSettings(category: NotificationCategory): Promise<{ data: NotificationSettings | null; error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const settings = await storageService.webGet<NotificationSettings>(`notification_settings_${category}`);
        return { data: settings, error: null };
      }

      const db = storageService.getDatabase();
      const settings = await db.getFirstAsync<NotificationSettings>(
        'SELECT * FROM notification_settings WHERE category = ?',
        [category]
      );

      return { data: settings || null, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async updateSettings(settings: Partial<NotificationSettings> & { category: NotificationCategory }): Promise<{ error: string | null }> {
    try {
      if (storageService.isWebPlatform()) {
        const existing = await storageService.webGet<NotificationSettings>(`notification_settings_${settings.category}`);
        const updated = { ...existing, ...settings, updatedAt: new Date().toISOString() };
        await storageService.webSet(`notification_settings_${settings.category}`, updated);
        return { error: null };
      }

      const db = storageService.getDatabase();
      await db.runAsync(
        `INSERT OR REPLACE INTO notification_settings (
          category, enabled, push_enabled, email_enabled, whatsapp_enabled,
          quiet_hours_start, quiet_hours_end, group_similar,
          sound_enabled, vibration_enabled, priority, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          settings.category,
          settings.enabled !== undefined ? (settings.enabled ? 1 : 0) : 1,
          settings.pushEnabled !== undefined ? (settings.pushEnabled ? 1 : 0) : 1,
          settings.emailEnabled !== undefined ? (settings.emailEnabled ? 1 : 0) : 0,
          settings.whatsappEnabled !== undefined ? (settings.whatsappEnabled ? 1 : 0) : 0,
          settings.quietHoursStart || null,
          settings.quietHoursEnd || null,
          settings.groupSimilar !== undefined ? (settings.groupSimilar ? 1 : 0) : 1,
          settings.soundEnabled !== undefined ? (settings.soundEnabled ? 1 : 0) : 1,
          settings.vibrationEnabled !== undefined ? (settings.vibrationEnabled ? 1 : 0) : 1,
          settings.priority || 'NORMAL',
          new Date().toISOString(),
        ]
      );

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },
};
