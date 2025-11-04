import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Equipment, EquipmentFormData, EquipmentWithStats } from '../types';
import { equipmentService } from '../services/equipment.service';

interface EquipmentContextType {
  equipments: Equipment[];
  loading: boolean;
  refreshEquipments: (clientId?: number) => Promise<void>;
  getEquipmentsWithStats: (clientId?: number) => Promise<EquipmentWithStats[]>;
  createEquipment: (data: EquipmentFormData) => Promise<Equipment>;
  updateEquipment: (id: number, data: Partial<EquipmentFormData>) => Promise<void>;
  deleteEquipment: (id: number) => Promise<void>;
  searchEquipments: (query: string, clientId?: number) => Promise<void>;
  getEquipmentCount: (clientId: number) => Promise<number>;
}

export const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

export function EquipmentProvider({ children }: { children: ReactNode }) {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEquipments();
  }, []);

  const loadEquipments = async (clientId?: number) => {
    try {
      const data = clientId 
        ? await equipmentService.getByClientId(clientId)
        : await equipmentService.getAll();
      setEquipments(data);
    } catch (error) {
      console.error('Error loading equipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshEquipments = async (clientId?: number) => {
    setLoading(true);
    await loadEquipments(clientId);
  };

  const getEquipmentsWithStats = async (clientId?: number): Promise<EquipmentWithStats[]> => {
    try {
      return await equipmentService.getWithStats(clientId);
    } catch (error) {
      console.error('Error loading equipments with stats:', error);
      return [];
    }
  };

  const createEquipment = async (data: EquipmentFormData): Promise<Equipment> => {
    try {
      const newEquipment = await equipmentService.create(data);
      setEquipments(prev => [newEquipment, ...prev]);
      return newEquipment;
    } catch (error) {
      console.error('Error creating equipment:', error);
      throw error;
    }
  };

  const updateEquipment = async (id: number, data: Partial<EquipmentFormData>) => {
    try {
      await equipmentService.update(id, data);
      await refreshEquipments();
    } catch (error) {
      console.error('Error updating equipment:', error);
      throw error;
    }
  };

  const deleteEquipment = async (id: number) => {
    try {
      await equipmentService.delete(id);
      setEquipments(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting equipment:', error);
      throw error;
    }
  };

  const searchEquipments = async (query: string, clientId?: number) => {
    try {
      if (query.trim() === '') {
        await refreshEquipments(clientId);
      } else {
        const results = await equipmentService.search(query, clientId);
        setEquipments(results);
      }
    } catch (error) {
      console.error('Error searching equipments:', error);
    }
  };

  const getEquipmentCount = async (clientId: number): Promise<number> => {
    try {
      return await equipmentService.getCountByClient(clientId);
    } catch (error) {
      console.error('Error getting equipment count:', error);
      return 0;
    }
  };

  return (
    <EquipmentContext.Provider
      value={{
        equipments,
        loading,
        refreshEquipments,
        getEquipmentsWithStats,
        createEquipment,
        updateEquipment,
        deleteEquipment,
        searchEquipments,
        getEquipmentCount,
      }}
    >
      {children}
    </EquipmentContext.Provider>
  );
}
