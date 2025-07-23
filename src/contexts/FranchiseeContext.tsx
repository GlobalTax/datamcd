
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { useImpersonation } from '@/hooks/useImpersonation';
import { Franchisee } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { secureLogger } from '@/utils/secureLogger';

interface FranchiseeContextType {
  selectedFranchisee: Franchisee | null;
  availableFranchisees: Franchisee[];
  isLoading: boolean;
  error: string | null;
  canSelectFranchisee: boolean;
  setSelectedFranchisee: (franchisee: Franchisee | null) => void;
  selectFranchisee: (franchisee: Franchisee | null) => void;
  refreshFranchisees: () => Promise<void>;
}

const FranchiseeContext = createContext<FranchiseeContextType | undefined>(undefined);

export const useFranchiseeContext = () => {
  const context = useContext(FranchiseeContext);
  if (context === undefined) {
    throw new Error('useFranchiseeContext must be used within a FranchiseeProvider');
  }
  return context;
};

interface FranchiseeProviderProps {
  children: ReactNode;
}

export const FranchiseeProvider: React.FC<FranchiseeProviderProps> = ({ children }) => {
  const [selectedFranchisee, setSelectedFranchisee] = useState<Franchisee | null>(null);
  const [availableFranchisees, setAvailableFranchisees] = useState<Franchisee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, loading: authLoading } = useAuth();
  const { getEffectiveFranchisee, isImpersonating } = useImpersonation();

  const effectiveFranchisee = getEffectiveFranchisee(null);
  
  // Mejorar la verificación de roles con logging detallado
  const canSelectFranchisee = React.useMemo(() => {
    const userRole = user?.role;
    const canSelect = ['admin', 'superadmin', 'asesor'].includes(userRole || '');
    
    secureLogger.debug('FranchiseeContext - Role verification', {
      userRole,
      canSelect,
      userId: user?.id,
      authLoading
    });
    
    return canSelect;
  }, [user?.role, user?.id, authLoading]);

  // Cargar franquiciados disponibles para usuarios admin
  const loadAvailableFranchisees = React.useCallback(async () => {
    if (!user || authLoading) {
      secureLogger.debug('FranchiseeContext - Skipping load, no user or auth loading', {
        hasUser: !!user,
        authLoading
      });
      return;
    }
    
    if (!canSelectFranchisee) {
      secureLogger.debug('FranchiseeContext - User cannot select franchisees, clearing list', {
        userRole: user.role,
        canSelectFranchisee
      });
      setAvailableFranchisees([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      secureLogger.info('FranchiseeContext - Loading franchisees for admin user', {
        userId: user.id,
        userRole: user.role
      });
      
      const { data, error: supabaseError } = await supabase
        .from('franchisees')
        .select('*')
        .order('franchisee_name');

      if (supabaseError) {
        throw supabaseError;
      }

      const franchisees = data || [];
      setAvailableFranchisees(franchisees);
      
      secureLogger.info('FranchiseeContext - Successfully loaded franchisees', {
        count: franchisees.length,
        franchiseeNames: franchisees.map(f => f.franchisee_name)
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      secureLogger.error('FranchiseeContext - Error loading franchisees', err);
      setError(`Error al cargar franquiciados: ${errorMessage}`);
      setAvailableFranchisees([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, authLoading, canSelectFranchisee]);

  // Sincronizar franquiciado seleccionado
  const syncSelectedFranchisee = React.useCallback(() => {
    if (!user || authLoading) {
      secureLogger.debug('FranchiseeContext - Skipping sync, no user or auth loading');
      return;
    }

    if (isImpersonating && effectiveFranchisee) {
      secureLogger.info('FranchiseeContext - Using impersonated franchisee', {
        franchiseeName: effectiveFranchisee.franchisee_name,
        franchiseeId: effectiveFranchisee.id
      });
      setSelectedFranchisee(effectiveFranchisee);
      return;
    }

    if (user.role === 'franchisee' && effectiveFranchisee) {
      secureLogger.info('FranchiseeContext - Using franchisee user data', {
        franchiseeName: effectiveFranchisee.franchisee_name,
        franchiseeId: effectiveFranchisee.id
      });
      setSelectedFranchisee(effectiveFranchisee);
      return;
    }

    if (canSelectFranchisee) {
      // Para admins, auto-seleccionar el primer franquiciado disponible si no hay uno seleccionado
      if (!selectedFranchisee && availableFranchisees.length > 0) {
        const firstFranchisee = availableFranchisees[0];
        secureLogger.info('FranchiseeContext - Auto-selecting first franchisee for admin', {
          franchiseeName: firstFranchisee.franchisee_name,
          franchiseeId: firstFranchisee.id
        });
        setSelectedFranchisee(firstFranchisee);
      }
      return;
    }

    // No hay franquiciado válido
    secureLogger.warn('FranchiseeContext - No valid franchisee found', {
      userRole: user.role,
      hasEffectiveFranchisee: !!effectiveFranchisee,
      isImpersonating
    });
    setSelectedFranchisee(null);
  }, [user, authLoading, effectiveFranchisee, isImpersonating, availableFranchisees, canSelectFranchisee, selectedFranchisee]);

  // Efectos para cargar y sincronizar datos
  useEffect(() => {
    loadAvailableFranchisees();
  }, [loadAvailableFranchisees]);

  useEffect(() => {
    syncSelectedFranchisee();
  }, [syncSelectedFranchisee]);

  const selectFranchisee = React.useCallback((franchisee: Franchisee | null) => {
    secureLogger.info('FranchiseeContext - Manually selecting franchisee', {
      franchiseeName: franchisee?.franchisee_name || 'null',
      franchiseeId: franchisee?.id || 'null'
    });
    setSelectedFranchisee(franchisee);
  }, []);

  const refreshFranchisees = React.useCallback(async () => {
    secureLogger.info('FranchiseeContext - Manual refresh requested');
    await loadAvailableFranchisees();
  }, [loadAvailableFranchisees]);

  const value: FranchiseeContextType = {
    selectedFranchisee,
    availableFranchisees,
    isLoading,
    error,
    canSelectFranchisee,
    setSelectedFranchisee,
    selectFranchisee,
    refreshFranchisees
  };

  return (
    <FranchiseeContext.Provider value={value}>
      {children}
    </FranchiseeContext.Provider>
  );
};
