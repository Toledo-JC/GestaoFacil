
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AppLockSettings } from '../types';
import { settingsService } from '../services/settings.service';
import { storageService } from '../services/storage.service';

interface AppLockContextType {
  isLocked: boolean;
  lockSettings: AppLockSettings | null;
  loading: boolean;
  enableLock: (pin: string, useBiometric?: boolean) => Promise<void>;
  disableLock: () => Promise<void>;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
}

export const AppLockContext = createContext<AppLockContextType | undefined>(undefined);

export function AppLockProvider({ children }: { children: ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const [lockSettings, setLockSettings] = useState<AppLockSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLockSettings();
  }, []);

  const loadLockSettings = async () => {
    try {
      await storageService.init();
      const settings = await settingsService.getLockSettings();
      setLockSettings(settings);
      
      if (settings?.enabled) {
        setIsLocked(true);
      }
    } catch (error) {
      console.error('Error loading lock settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const enableLock = async (pin: string, useBiometric: boolean = false) => {
    const settings: AppLockSettings = {
      enabled: true,
      pin,
      useBiometric,
    };

    await settingsService.saveLockSettings(settings);
    setLockSettings(settings);
  };

  const disableLock = async () => {
    const settings: AppLockSettings = {
      enabled: false,
      useBiometric: false,
    };

    await settingsService.saveLockSettings(settings);
    setLockSettings(settings);
    setIsLocked(false);
  };

  const unlock = async (pin: string): Promise<boolean> => { // Fix: Added '=>' for arrow function
    const isValid = await settingsService.verifyPin(pin);
    
    if (isValid) {
      setIsLocked(false);
      return true;
    }
    
    return false;
  };

  const lock = () => {
    if (lockSettings?.enabled) {
      setIsLocked(true);
    }
  };

  return (
    <AppLockContext.Provider
      value={{
        isLocked,
        lockSettings,
        loading,
        enableLock,
        disableLock,
        unlock,
        lock,
      }}
    >
      {children}
    </AppLockContext.Provider>
  );
}
