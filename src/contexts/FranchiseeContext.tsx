
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { useAllFranchisees } from '@/hooks/useAllFranchisees';
import { Franchisee } from '@/types/auth';

interface FranchiseeContextType {
  selectedFranchisee: Franchisee | null;
  availableFranchisees: Franchisee[];
  setSelectedFranchisee: (franchisee: Franchisee | null) => void;
  isLoading: boolean;
  canSelectFranchisee: boolean;
}

const FranchiseeContext = createContext<FranchiseeContextType | undefined>(undefined);

interface FranchiseeProviderProps {
  children: ReactNode;
}

export const FranchiseeProvider: React.FC<FranchiseeProviderProps> = ({ children }) => {
  const { user, franchisee, effectiveFranchisee } = useUnifiedAuth();
  const { franchisees, loading } = useAllFranchisees();
  const [selectedFranchisee, setSelectedFranchiseeState] = useState<Franchisee | null>(null);

  // Determinar si el usuario puede seleccionar franquiciados
  const canSelectFranchisee = user?.role === 'admin' || user?.role === 'superadmin';

  // Persistir selección en localStorage
  const setSelectedFranchisee = (franchisee: Franchisee | null) => {
    setSelectedFranchiseeState(franchisee);
    if (franchisee) {
      localStorage.setItem('selectedFranchiseeId', franchisee.id);
    } else {
      localStorage.removeItem('selectedFranchiseeId');
    }
  };

  // Inicializar estado al cargar
  useEffect(() => {
    if (canSelectFranchisee && franchisees.length > 0) {
      const savedFranchiseeId = localStorage.getItem('selectedFranchiseeId');
      if (savedFranchiseeId) {
        const savedFranchisee = franchisees.find(f => f.id === savedFranchiseeId);
        if (savedFranchisee) {
          setSelectedFranchiseeState(savedFranchisee);
          return;
        }
      }
      // Si no hay selección guardada, seleccionar el primero
      setSelectedFranchiseeState(franchisees[0] || null);
    } else if (!canSelectFranchisee && (franchisee || effectiveFranchisee)) {
      // Para franquiciados normales, usar su propio franquiciado
      setSelectedFranchiseeState(effectiveFranchisee || franchisee);
    }
  }, [canSelectFranchisee, franchisees, franchisee, effectiveFranchisee]);

  const value: FranchiseeContextType = {
    selectedFranchisee,
    availableFranchisees: canSelectFranchisee ? franchisees : [],
    setSelectedFranchisee,
    isLoading: loading,
    canSelectFranchisee
  };

  return (
    <FranchiseeContext.Provider value={value}>
      {children}
    </FranchiseeContext.Provider>
  );
};

export const useFranchiseeContext = () => {
  const context = useContext(FranchiseeContext);
  if (context === undefined) {
    throw new Error('useFranchiseeContext must be used within a FranchiseeProvider');
  }
  return context;
};
