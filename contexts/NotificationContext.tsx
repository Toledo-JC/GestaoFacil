import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as ExpoNotifications from 'expo-notifications';
import { notificationService } from '../services/notification.service';
import { smartAlertSystem } from '../services/smart-alert.service';
import {
  Notification,
  NotificationSettings,
  NotificationCategory,
  NotificationSummary,
  NotificationInsight,
} from '../types';

// ============================================
// CONTEXT TYPE
// ============================================

interface NotificationContextType {
  notifications: Notification[];
  summary: NotificationSummary | null;
  insights: NotificationInsight[];
  loading: boolean;
  unreadCount: number;
  urgentCount: number;

  // Actions
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: (category?: NotificationCategory) => Promise<void>;
  snoozeNotification: (id: number, hours: number) => Promise<void>;
  archiveNotification: (id: number) => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  
  // Settings
  getSettings: (category: NotificationCategory) => Promise<NotificationSettings | null>;
  updateSettings: (settings: Partial<NotificationSettings> & { category: NotificationCategory }) => Promise<void>;

  // Smart Alerts
  runSmartAnalysis: () => Promise<void>;
}

// ============================================
// CONTEXT
// ============================================

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [insights, setInsights] = useState<NotificationInsight[]>([]);
  const [loading, setLoading] = useState(true);

  // Configure expo-notifications
  useEffect(() => {
    if (Platform.OS !== 'web') {
      ExpoNotifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    }
  }, []);

  // Load notifications
  const refreshNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await notificationService.getAll({ limit: 50 });
      setNotifications(data);

      const { data: summaryData } = await notificationService.getSummary();
      setSummary(summaryData);
    } catch (error) {
      console.error('[NotificationContext] Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize
  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  // Run smart analysis periodically
  useEffect(() => {
    const interval = setInterval(() => {
      runSmartAnalysis();
    }, 30 * 60 * 1000); // Every 30 minutes

    return () => clearInterval(interval);
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    await notificationService.markAsRead(id);
    await refreshNotifications();
  }, [refreshNotifications]);

  const markAllAsRead = useCallback(async (category?: NotificationCategory) => {
    await notificationService.markAllAsRead(category);
    await refreshNotifications();
  }, [refreshNotifications]);

  const snoozeNotification = useCallback(async (id: number, hours: number) => {
    const until = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    await notificationService.snooze(id, until);
    await refreshNotifications();
  }, [refreshNotifications]);

  const archiveNotification = useCallback(async (id: number) => {
    await notificationService.archive(id);
    await refreshNotifications();
  }, [refreshNotifications]);

  const deleteNotification = useCallback(async (id: number) => {
    await notificationService.delete(id);
    await refreshNotifications();
  }, [refreshNotifications]);

  const getSettings = useCallback(async (category: NotificationCategory) => {
    const { data } = await notificationService.getSettings(category);
    return data;
  }, []);

  const updateSettings = useCallback(async (settings: Partial<NotificationSettings> & { category: NotificationCategory }) => {
    await notificationService.updateSettings(settings);
  }, []);

  const runSmartAnalysis = useCallback(async () => {
    try {
      await smartAlertSystem.analyzeAndNotify();
      const { data: insightsData } = await smartAlertSystem.generateInsights();
      setInsights(insightsData);
      await refreshNotifications();
    } catch (error) {
      console.error('[NotificationContext] Smart analysis error:', error);
    }
  }, [refreshNotifications]);

  const value: NotificationContextType = {
    notifications,
    summary,
    insights,
    loading,
    unreadCount: summary?.unread || 0,
    urgentCount: summary?.urgent || 0,

    refreshNotifications,
    markAsRead,
    markAllAsRead,
    snoozeNotification,
    archiveNotification,
    deleteNotification,

    getSettings,
    updateSettings,

    runSmartAnalysis,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
