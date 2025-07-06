import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Franchisee } from '@/types/auth';

interface ImpersonationContextType {
  impersonatedFranchisee: Franchisee | null;
  isImpersonating: boolean;
  startImpersonation: (franchisee: Franchisee) => void;
  stopImpersonation: () => void;
  getEffectiveFranchisee: (userFranchisee?: Franchisee | null) => Franchisee | null;
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined);

export const useImpersonation = () => {
  const context = useContext(ImpersonationContext);
  if (context === undefined) {
    throw new Error('useImpersonation must be used within an ImpersonationProvider');
  }
  return context;
};

interface ImpersonationProviderProps {
  children: ReactNode;
}

export const ImpersonationProvider: React.FC<ImpersonationProviderProps> = ({ children }) => {
  const [impersonatedFranchisee, setImpersonatedFranchisee] = useState<Franchisee | null>(null);

  // Cargar estado de impersonación desde sessionStorage al inicializar
  useEffect(() => {
    const savedImpersonation = sessionStorage.getItem('impersonatedFranchisee');
    if (savedImpersonation) {
      try {
        const franchisee = JSON.parse(savedImpersonation);
        setImpersonatedFranchisee(franchisee);
      } catch (error) {
        console.error('Error loading impersonation state:', error);
        sessionStorage.removeItem('impersonatedFranchisee');
      }
    }
  }, []);

  const startImpersonation = (franchisee: Franchisee) => {
    setImpersonatedFranchisee(franchisee);
    sessionStorage.setItem('impersonatedFranchisee', JSON.stringify(franchisee));
    
    // Log de auditoría detallado
    console.log('Impersonation started:', {
      impersonatedFranchisee: franchisee.franchisee_name,
      franchiseeId: franchisee.id,
      userId: franchisee.user_id,
      timestamp: new Date().toISOString()
    });
    
    // Log para debugging
    console.log('Full franchisee data for impersonation:', franchisee);
  };

  const stopImpersonation = () => {
    const previousFranchisee = impersonatedFranchisee;
    setImpersonatedFranchisee(null);
    sessionStorage.removeItem('impersonatedFranchisee');
    
    // Log de auditoría
    console.log('Impersonation stopped:', {
      previousFranchisee: previousFranchisee?.franchisee_name,
      timestamp: new Date().toISOString()
    });
  };

  const getEffectiveFranchisee = (userFranchisee?: Franchisee | null): Franchisee | null => {
    const effectiveFranchisee = impersonatedFranchisee || userFranchisee || null;
    
    // Log para debugging cuando hay impersonación activa
    if (impersonatedFranchisee) {
      console.log('Using impersonated franchisee:', {
        name: impersonatedFranchisee.franchisee_name,
        id: impersonatedFranchisee.id,
        userId: impersonatedFranchisee.user_id
      });
    }
    
    return effectiveFranchisee;
  };

  const isImpersonating = Boolean(impersonatedFranchisee);

  const value = {
    impersonatedFranchisee,
    isImpersonating,
    startImpersonation,
    stopImpersonation,
    getEffectiveFranchisee,
  };

  return (
    <ImpersonationContext.Provider value={value}>
      {children}
    </ImpersonationContext.Provider>
  );
};