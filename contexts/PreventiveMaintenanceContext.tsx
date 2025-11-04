import React, { createContext, useState, useCallback, ReactNode } from 'react';
import {
  PreventiveMaintenance,
  PreventiveMaintenanceWithDetails,
  PreventiveTemplate,
  PreventiveExecution,
  MaintenanceNotification,
  MaintenanceCalendarEvent,
} from '../types';
import { preventiveMaintenanceService } from '../services/preventive-maintenance.service';
import { preventiveTemplateService } from '../services/preventive-template.service';
import { maintenanceNotificationService } from '../services/maintenance-notification.service';

interface PreventiveMaintenanceContextType {
  // Preventive Maintenances
  preventives: PreventiveMaintenance[];
  loadPreventives: () => Promise<void>;
  createPreventive: (preventive: Omit<PreventiveMaintenance, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PreventiveMaintenance>;
  updatePreventive: (id: number, data: Partial<PreventiveMaintenance>) => Promise<void>;
  getPreventiveDetails: (id: number) => Promise<PreventiveMaintenanceWithDetails | null>;
  recordExecution: (execution: Omit<PreventiveExecution, 'id' | 'createdAt'>) => Promise<void>;

  // Templates
  templates: PreventiveTemplate[];
  loadTemplates: () => Promise<void>;
  createTemplate: (template: Omit<PreventiveTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PreventiveTemplate>;
  updateTemplate: (id: number, data: Partial<PreventiveTemplate>) => Promise<void>;

  // Notifications
  notifications: MaintenanceNotification[];
  loadNotifications: () => Promise<void>;
  getDueNotifications: () => Promise<MaintenanceNotification[]>;

  // Calendar
  calendarEvents: MaintenanceCalendarEvent[];
  loadCalendarEvents: (startDate: string, endDate: string) => Promise<void>;

  // Alerts
  duePreventives: PreventiveMaintenance[];
  overduePreventives: PreventiveMaintenance[];
  loadAlerts: () => Promise<void>;

  // State
  loading: boolean;
  refresh: () => Promise<void>;
}

export const PreventiveMaintenanceContext = createContext<PreventiveMaintenanceContextType | undefined>(undefined);

export function PreventiveMaintenanceProvider({ children }: { children: ReactNode }) {
  const [preventives, setPreventives] = useState<PreventiveMaintenance[]>([]);
  const [templates, setTemplates] = useState<PreventiveTemplate[]>([]);
  const [notifications, setNotifications] = useState<MaintenanceNotification[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<MaintenanceCalendarEvent[]>([]);
  const [duePreventives, setDuePreventives] = useState<PreventiveMaintenance[]>([]);
  const [overduePreventives, setOverduePreventives] = useState<PreventiveMaintenance[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPreventives = useCallback(async () => {
    try {
      const data = await preventiveMaintenanceService.getActive();
      setPreventives(data);
    } catch (error) {
      console.error('Error loading preventives:', error);
    }
  }, []);

  const createPreventive = useCallback(async (preventive: Omit<PreventiveMaintenance, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPreventive = await preventiveMaintenanceService.create(preventive);
    
    // Schedule notifications if next execution date is set
    if (newPreventive.nextExecutionDate) {
      await maintenanceNotificationService.scheduleNotificationsForPreventive(
        newPreventive.id,
        newPreventive.nextExecutionDate,
        newPreventive.alertDaysBefore
      );
    }
    
    await loadPreventives();
    await loadAlerts();
    return newPreventive;
  }, [loadPreventives]);

  const updatePreventive = useCallback(async (id: number, data: Partial<PreventiveMaintenance>) => {
    await preventiveMaintenanceService.update(id, data);
    
    // Reschedule notifications if next execution date changed
    if (data.nextExecutionDate) {
      const preventive = await preventiveMaintenanceService.getById(id);
      if (preventive) {
        await maintenanceNotificationService.scheduleNotificationsForPreventive(
          id,
          data.nextExecutionDate,
          data.alertDaysBefore || preventive.alertDaysBefore
        );
      }
    }
    
    await loadPreventives();
    await loadAlerts();
  }, [loadPreventives]);

  const getPreventiveDetails = useCallback(async (id: number) => {
    return await preventiveMaintenanceService.getWithDetails(id);
  }, []);

  const recordExecution = useCallback(async (execution: Omit<PreventiveExecution, 'id' | 'createdAt'>) => {
    await preventiveMaintenanceService.recordExecution(execution);
    await loadPreventives();
    await loadAlerts();
  }, [loadPreventives]);

  const loadTemplates = useCallback(async () => {
    try {
      const data = await preventiveTemplateService.getActive();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  }, []);

  const createTemplate = useCallback(async (template: Omit<PreventiveTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate = await preventiveTemplateService.create(template);
    await loadTemplates();
    return newTemplate;
  }, [loadTemplates]);

  const updateTemplate = useCallback(async (id: number, data: Partial<PreventiveTemplate>) => {
    await preventiveTemplateService.update(id, data);
    await loadTemplates();
  }, [loadTemplates]);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await maintenanceNotificationService.getPending();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, []);

  const getDueNotifications = useCallback(async () => {
    return await maintenanceNotificationService.getDueNotifications();
  }, []);

  const loadCalendarEvents = useCallback(async (startDate: string, endDate: string) => {
    try {
      const events = await preventiveMaintenanceService.getCalendarEvents(startDate, endDate);
      setCalendarEvents(events);
    } catch (error) {
      console.error('Error loading calendar events:', error);
    }
  }, []);

  const loadAlerts = useCallback(async () => {
    try {
      const [due, overdue] = await Promise.all([
        preventiveMaintenanceService.getDuePreventives(7),
        preventiveMaintenanceService.getOverduePreventives(),
      ]);
      setDuePreventives(due);
      setOverduePreventives(overdue);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPreventives(),
        loadTemplates(),
        loadNotifications(),
        loadAlerts(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [loadPreventives, loadTemplates, loadNotifications, loadAlerts]);

  return (
    <PreventiveMaintenanceContext.Provider
      value={{
        preventives,
        loadPreventives,
        createPreventive,
        updatePreventive,
        getPreventiveDetails,
        recordExecution,
        templates,
        loadTemplates,
        createTemplate,
        updateTemplate,
        notifications,
        loadNotifications,
        getDueNotifications,
        calendarEvents,
        loadCalendarEvents,
        duePreventives,
        overduePreventives,
        loadAlerts,
        loading,
        refresh,
      }}
    >
      {children}
    </PreventiveMaintenanceContext.Provider>
  );
}
