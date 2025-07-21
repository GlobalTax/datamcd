
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { useImpersonation } from '@/hooks/useImpersonation';
import { Franchisee } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

interface FranchiseeContextType {
  selectedFranchisee: Franchisee | null;
  allFranchisees: Franchisee[];
  isLoading: boolean;
  error: string | null;
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
  const [allFranchisees, setAllFranchisees] = useState<Franchisee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, loading: authLoading } = useAuth();
  const { effectiveFranchisee, isImpersonating } = useImpersonation();

  // Cargar todos los franquiciados si el usuario es admin
  const loadAllFranchisees = async () => {
    if (!user || authLoading) return;
    
    if (['admin', 'superadmin', 'asesor'].includes(user.role)) {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('FranchiseeContext - Loading all franchisees for admin user');
        const { data, error: supabaseError } = await supabase
          .from('franchisees')
          .select('*')
          .order('franchisee_name');

        if (supabaseError) {
          console.error('FranchiseeContext - Error loading franchisees:', supabaseError);
          setError('Error al cargar franquiciados');
          setAllFranchisees([]);
        } else {
          console.log(`FranchiseeContext - Loaded ${data?.length || 0} franchisees`);
          setAllFranchisees(data || []);
        }
      } catch (error) {
        console.error('FranchiseeContext - Unexpected error loading franchisees:', error);
        setError('Error inesperado al cargar franquiciados');
        setAllFranchisees([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log('FranchiseeContext - User is not admin, clearing all franchisees');
      setAllFranchisees([]);
    }
  };

  // Efecto para cargar franquiciados cuando cambia el usuario
  useEffect(() => {
    if (!authLoading && user) {
      loadAllFranchisees();
    }
  }, [user, authLoading]);

  // Efecto para sincronizar el franquiciado seleccionado
  useEffect(() => {
    if (!authLoading && user) {
      if (isImpersonating && effectiveFranchisee) {
        console.log('FranchiseeContext - Using impersonated franchisee:', effectiveFranchisee.franchisee_name);
        setSelectedFranchisee(effectiveFranchisee);
      } else if (user.role === 'franchisee' && effectiveFranchisee) {
        console.log('FranchiseeContext - Using user franchisee:', effectiveFranchisee.franchisee_name);
        setSelectedFranchisee(effectiveFranchisee);
      } else if (['admin', 'superadmin', 'asesor'].includes(user.role)) {
        // Para admins, mantener el franquiciado seleccionado si hay uno
        console.log('FranchiseeContext - Admin user, maintaining selected franchisee');
        if (!selectedFranchisee && allFranchisees.length > 0) {
          setSelectedFranchisee(allFranchisees[0]);
        }
      } else {
        console.log('FranchiseeContext - No valid franchisee found');
        setSelectedFranchisee(null);
      }
    }
  }, [user, authLoading, effectiveFranchisee, isImpersonating, allFranchisees]);

  const selectFranchisee = (franchisee: Franchisee | null) => {
    console.log('FranchiseeContext - Selecting franchisee:', franchisee?.franchisee_name || 'null');
    setSelectedFranchisee(franchisee);
  };

  const refreshFranchisees = async () => {
    console.log('FranchiseeContext - Manual refresh requested');
    await loadAllFranchisees();
  };

  const value: FranchiseeContextType = {
    selectedFranchisee,
    allFranchisees,
    isLoading,
    error,
    selectFranchisee,
    refreshFranchisees
  };

  return (
    <FranchiseeContext.Provider value={value}>
      {children}
    </FranchiseeContext.Provider>
  );
};
