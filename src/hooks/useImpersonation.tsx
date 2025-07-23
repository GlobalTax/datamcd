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
    
    // Log de auditoría detallado con más información
    console.log('IMPERSONATION: Started impersonation:', {
      advisorUserId: 'current_user', // Se podría pasar como parámetro
      impersonatedFranchisee: franchisee.franchisee_name,
      franchiseeId: franchisee.id,
      franchiseeUserId: franchisee.user_id,
      timestamp: new Date().toISOString(),
      sessionStorage: 'updated'
    });
    
    // Log completo para debugging
    console.log('IMPERSONATION: Full franchisee data:', franchisee);
    
    // Verificar que el estado se actualizó correctamente
    setTimeout(() => {
      console.log('IMPERSONATION: Verification after state update:', {
        isImpersonating: Boolean(franchisee),
        storedData: sessionStorage.getItem('impersonatedFranchisee') ? 'present' : 'missing'
      });
    }, 100);
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