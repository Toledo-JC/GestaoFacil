import { useContext } from 'react';
import { EquipmentContext } from '../contexts/EquipmentContext';

export function useEquipments() {
  const context = useContext(EquipmentContext);
  if (!context) {
    throw new Error('useEquipments must be used within EquipmentProvider');
  }
  return context;
}
