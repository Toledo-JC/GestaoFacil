import { useContext } from 'react';
import { AppLockContext } from '../contexts/AppLockContext';

export function useAppLock() {
  const context = useContext(AppLockContext);
  
  if (!context) {
    throw new Error('useAppLock must be used within AppLockProvider');
  }
  
  return context;
}
