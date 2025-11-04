import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Client } from '../types';
import { clientService } from '../services/client.service';

interface ClientContextType {
  clients: Client[];
  loading: boolean;
  refreshClients: () => Promise<void>;
  createClient: (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Client>;
  updateClient: (id: number, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: number) => Promise<void>;
  searchClients: (query: string) => Promise<void>;
}

export const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshClients = async () => {
    setLoading(true);
    await loadClients();
  };

  const createClient = async (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
    try {
      const newClient = await clientService.create(data);
      setClients(prev => [newClient, ...prev]);
      return newClient;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  };

  const updateClient = async (id: number, data: Partial<Client>) => {
    try {
      await clientService.update(id, data);
      await refreshClients();
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  };

  const deleteClient = async (id: number) => {
    try {
      await clientService.delete(id);
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  };

  const searchClients = async (query: string) => {
    try {
      if (query.trim() === '') {
        await refreshClients();
      } else {
        const results = await clientService.search(query);
        setClients(results);
      }
    } catch (error) {
      console.error('Error searching clients:', error);
    }
  };

  return (
    <ClientContext.Provider
      value={{
        clients,
        loading,
        refreshClients,
        createClient,
        updateClient,
        deleteClient,
        searchClients,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}
