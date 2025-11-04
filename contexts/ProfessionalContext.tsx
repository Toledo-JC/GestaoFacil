import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Professional } from '../types';
import { professionalService } from '../services/professional.service';
import { storageService } from '../services/storage.service';

interface ProfessionalContextType {
  professional: Professional | null;
  loading: boolean;
  createProfessional: (data: Omit<Professional, 'id' | 'createdAt'>) => Promise<void>;
  updateProfessional: (data: Partial<Professional>) => Promise<void>;
}

export const ProfessionalContext = createContext<ProfessionalContextType | undefined>(undefined);

export function ProfessionalProvider({ children }: { children: ReactNode }) {
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfessional();
  }, []);

  const loadProfessional = async () => {
    try {
      console.log('[ProfessionalContext] 🚀 Starting initialization...');
      
      console.log('[ProfessionalContext] 📦 Initializing storage...');
      await storageService.init();
      console.log('[ProfessionalContext] ✅ Storage initialized successfully');
      
      console.log('[ProfessionalContext] 👤 Loading professional data...');
      const data = await professionalService.get();
      
      if (data) {
        console.log('[ProfessionalContext] ✅ Professional found:', data.name);
      } else {
        console.log('[ProfessionalContext] ℹ️ No professional registered yet (first time setup)');
      }
      
      setProfessional(data);
    } catch (error) {
      console.error('[ProfessionalContext] ❌ CRITICAL ERROR:', error);
      console.error('[ProfessionalContext] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Não bloqueia o app, permite que usuário veja tela de onboarding mesmo com erro
    } finally {
      setLoading(false);
      console.log('[ProfessionalContext] ✅ Initialization complete');
    }
  };

  const createProfessional = async (data: Omit<Professional, 'id' | 'createdAt'>) => {
    try {
      const newProfessional = await professionalService.create(data);
      setProfessional(newProfessional);
    } catch (error) {
      console.error('Error creating professional:', error);
      throw error;
    }
  };

  const updateProfessional = async (data: Partial<Professional>) => {
    try {
      await professionalService.update(data);
      const updated = await professionalService.get();
      setProfessional(updated);
    } catch (error) {
      console.error('Error updating professional:', error);
      throw error;
    }
  };

  return (
    <ProfessionalContext.Provider
      value={{
        professional,
        loading,
        createProfessional,
        updateProfessional,
      }}
    >
      {children}
    </ProfessionalContext.Provider>
  );
}
