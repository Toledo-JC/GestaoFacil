import { useContext } from 'react';
import { BackupContext } from '../contexts/BackupContext';

export function useBackup() {
  const context = useContext(BackupContext);
  
  if (!context) {
    throw new Error('useBackup must be used within BackupProvider');
  }
  
  return context;
}
