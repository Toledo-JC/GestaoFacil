import { useContext } from 'react';
import { CollaboratorContext } from '../contexts/CollaboratorContext';

export function useCollaborators() {
  const context = useContext(CollaboratorContext);
  if (!context) {
    throw new Error('useCollaborators must be used within CollaboratorProvider');
  }
  return context;
}
