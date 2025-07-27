import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BiloopCompany {
  id: string;
  franchisee_id: string;
  biloop_company_id: string;
  company_name: string;
  is_active: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBiloopCompanyData {
  biloop_company_id: string;
  company_name: string;
  is_primary?: boolean;
}

export const useBiloopCompanies = (franchiseeId?: string) => {
  const [companies, setCompanies] = useState<BiloopCompany[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCompanies = async (targetFranchiseeId?: string) => {
    if (!targetFranchiseeId || !isValidUUID(targetFranchiseeId)) {
      setCompanies([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('franchisee_biloop_companies')
        .select('*')
        .eq('franchisee_id', targetFranchiseeId)
        .eq('is_active', true)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setCompanies(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar empresas de Biloop';
      setError(errorMessage);
      console.error('Error fetching Biloop companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCompany = async (companyData: CreateBiloopCompanyData, targetFranchiseeId: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!isValidUUID(targetFranchiseeId)) {
        throw new Error('ID de franquiciado inválido');
      }

      const { data, error } = await supabase
        .from('franchisee_biloop_companies')
        .insert({
          franchisee_id: targetFranchiseeId,
          biloop_company_id: companyData.biloop_company_id,
          company_name: companyData.company_name,
          is_primary: companyData.is_primary || false,
        })
        .select()
        .single();

      if (error) throw error;

      // Actualizar la lista local
      await fetchCompanies(targetFranchiseeId);

      toast({
        title: "Empresa añadida",
        description: `La empresa ${companyData.company_name} se ha añadido correctamente`,
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al añadir empresa';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (companyId: string, updates: Partial<BiloopCompany>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('franchisee_biloop_companies')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', companyId)
        .select()
        .single();

      if (error) throw error;

      // Actualizar la lista local
      setCompanies(prev => 
        prev.map(company => 
          company.id === companyId ? { ...company, ...updates } : company
        )
      );

      toast({
        title: "Empresa actualizada",
        description: "Los cambios se han guardado correctamente",
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar empresa';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const setPrimaryCompany = async (companyId: string) => {
    return await updateCompany(companyId, { is_primary: true });
  };

  const deactivateCompany = async (companyId: string) => {
    return await updateCompany(companyId, { is_active: false });
  };

  const getPrimaryCompany = () => {
    return companies.find(company => company.is_primary && company.is_active);
  };

  const getActiveCompanies = () => {
    return companies.filter(company => company.is_active);
  };

  const isValidUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  const hasCompanies = () => {
    return companies.length > 0;
  };

  const hasMultipleCompanies = () => {
    return companies.length > 1;
  };

  useEffect(() => {
    if (franchiseeId) {
      fetchCompanies(franchiseeId);
    }
  }, [franchiseeId]);

  return {
    companies,
    loading,
    error,
    fetchCompanies,
    addCompany,
    updateCompany,
    setPrimaryCompany,
    deactivateCompany,
    getPrimaryCompany,
    getActiveCompanies,
    hasCompanies,
    hasMultipleCompanies,
  };
};