import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { 
  Backup, 
  BackupType, 
  BackupSettings, 
  BackupProgress,
  RestoreType,
  RestoreOptions,
  RestoreProgress,
  RestoreResult
} from '../types';
import { backupService } from '../services/backup.service';
import { restoreService } from '../services/restore.service';

interface BackupContextType {
  backups: Backup[];
  settings: BackupSettings | null;
  loading: boolean;
  
  loadBackups: () => Promise<void>;
  loadSettings: () => Promise<void>;
  createBackup: (
    type: BackupType, 
    options?: { compression?: boolean; encryption?: boolean },
    onProgress?: (progress: BackupProgress) => void
  ) => Promise<Backup>;
  deleteBackup: (id: number) => Promise<void>;
  shareBackup: (id: number) => Promise<string>;
  updateSettings: (settings: Partial<BackupSettings>) => Promise<void>;
  restoreFromBackup: (
    backupId: number,
    options: RestoreOptions,
    onProgress?: (progress: RestoreProgress) => void
  ) => Promise<RestoreResult>;
  restoreFromFile: (
    filePath: string,
    options: RestoreOptions,
    onProgress?: (progress: RestoreProgress) => void
  ) => Promise<RestoreResult>;
  refresh: () => Promise<void>;
}

export const BackupContext = createContext<BackupContextType | undefined>(undefined);

export function BackupProvider({ children }: { children: ReactNode }) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [settings, setSettings] = useState<BackupSettings | null>(null);
  const [loading, setLoading] = useState(false);

  const loadBackups = useCallback(async () => {
    try {
      setLoading(true);
      const data = await backupService.getAllBackups();
      setBackups(data);
    } catch (error) {
      console.error('Error loading backups:', error);
      setBackups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const data = await backupService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading backup settings:', error);
    }
  }, []);

  const createBackup = useCallback(async (
    type: BackupType,
    options?: { compression?: boolean; encryption?: boolean },
    onProgress?: (progress: BackupProgress) => void
  ) => {
    const backup = await backupService.createBackup(type, options, onProgress);
    await loadBackups();
    return backup;
  }, [loadBackups]);

  const deleteBackup = useCallback(async (id: number) => {
    await backupService.deleteBackup(id);
    await loadBackups();
  }, [loadBackups]);

  const shareBackup = useCallback(async (id: number) => {
    return await backupService.shareBackup(id);
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<BackupSettings>) => {
    await backupService.updateSettings(newSettings);
    await loadSettings();
  }, [loadSettings]);

  const restoreFromBackup = useCallback(async (
    backupId: number,
    options: RestoreOptions,
    onProgress?: (progress: RestoreProgress) => void
  ) => {
    return await restoreService.restoreFromBackup(backupId, options, onProgress);
  }, []);

  const restoreFromFile = useCallback(async (
    filePath: string,
    options: RestoreOptions,
    onProgress?: (progress: RestoreProgress) => void
  ) => {
    return await restoreService.restoreFromFile(filePath, options, onProgress);
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([loadBackups(), loadSettings()]);
  }, [loadBackups, loadSettings]);

  return (
    <BackupContext.Provider
      value={{
        backups,
        settings,
        loading,
        loadBackups,
        loadSettings,
        createBackup,
        deleteBackup,
        shareBackup,
        updateSettings,
        restoreFromBackup,
        restoreFromFile,
        refresh,
      }}
    >
      {children}
    </BackupContext.Provider>
  );
}
