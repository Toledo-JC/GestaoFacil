import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { collaboratorService } from '../services/collaborator.service';
import { Collaborator, CollaboratorFormData, CollaboratorWithStats } from '../types';

interface CollaboratorContextType {
  collaborators: Collaborator[];
  collaboratorsWithStats: CollaboratorWithStats[];
  loading: boolean;
  refreshCollaborators: () => Promise<void>;
  createCollaborator: (data: CollaboratorFormData) => Promise<Collaborator>;
  updateCollaborator: (id: number, data: Partial<CollaboratorFormData>) => Promise<Collaborator>;
  deleteCollaborator: (id: number) => Promise<void>;
  toggleActive: (id: number) => Promise<void>;
  searchCollaborators: (query: string) => Promise<Collaborator[]>;
}

export const CollaboratorContext = createContext<CollaboratorContextType | undefined>(undefined);

export function CollaboratorProvider({ children }: { children: ReactNode }) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [collaboratorsWithStats, setCollaboratorsWithStats] = useState<CollaboratorWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCollaborators = async () => {
    try {
      setLoading(true);
      const data = await collaboratorService.getAll();
      setCollaborators(data);

      const stats = await collaboratorService.getWithStats();
      setCollaboratorsWithStats(stats);
    } catch (error) {
      console.error('[CollaboratorContext] Error loading collaborators:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollaborators();
  }, []);

  const refreshCollaborators = async () => {
    await loadCollaborators();
  };

  const createCollaborator = async (data: CollaboratorFormData): Promise<Collaborator> => {
    const newCollaborator = await collaboratorService.create(data);
    await refreshCollaborators();
    return newCollaborator;
  };

  const updateCollaborator = async (
    id: number,
    data: Partial<CollaboratorFormData>
  ): Promise<Collaborator> => {
    const updated = await collaboratorService.update(id, data);
    await refreshCollaborators();
    return updated;
  };

  const deleteCollaborator = async (id: number): Promise<void> => {
    await collaboratorService.delete(id);
    await refreshCollaborators();
  };

  const toggleActive = async (id: number): Promise<void> => {
    await collaboratorService.toggleActive(id);
    await refreshCollaborators();
  };

  const searchCollaborators = async (query: string): Promise<Collaborator[]> => {
    return collaboratorService.search(query);
  };

  return (
    <CollaboratorContext.Provider
      value={{
        collaborators,
        collaboratorsWithStats,
        loading,
        refreshCollaborators,
        createCollaborator,
        updateCollaborator,
        deleteCollaborator,
        toggleActive,
        searchCollaborators,
      }}
    >
      {children}
    </CollaboratorContext.Provider>
  );
}
