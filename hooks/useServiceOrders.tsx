import { useContext } from 'react';
import { ServiceOrderContext } from '../contexts/ServiceOrderContext';

export function useServiceOrders() {
  const context = useContext(ServiceOrderContext);
  
  if (!context) {
    throw new Error('useServiceOrders must be used within ServiceOrderProvider');
  }
  
  return context;
}
