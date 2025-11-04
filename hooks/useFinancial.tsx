import { useContext } from 'react';
import { FinancialContext } from '../contexts/FinancialContext';

export function useFinancial() {
  const context = useContext(FinancialContext);
  
  if (!context) {
    throw new Error('useFinancial must be used within FinancialProvider');
  }
  
  return context;
}
