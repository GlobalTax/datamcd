import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/notifications';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

export interface Franchisee {
  id: string;
  franchisee_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  notes: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export const useFranchisees = () => {
  const [franchisees, setFranchisees] = useState<Franchisee[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFranchisees = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('franchisees')
        .select(`
          *,
          profiles (
            id,
            full_name,
            email,
            created_at
          )
        `)
        .order('franchisee_name');

      if (error) throw error;
      
      setFranchisees(data || []);
    } catch (error) {
      console.error('Error fetching franchisees:', error);
      showError('Error al cargar los franquiciados');
    } finally {
      setLoading(false);
    }
  };

  const createFranchisee = async (franchiseeData: Omit<Franchisee, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('franchisees')
        .insert(franchiseeData);

      if (error) throw error;
      
      showSuccess('Franquiciado creado correctamente');
      await fetchFranchisees();
    } catch (error) {
      console.error('Error creating franchisee:', error);
      showError('Error al crear el franquiciado');
    }
  };

  const updateFranchisee = async (id: string, updates: Partial<Franchisee>) => {
    try {
      const { error } = await supabase
        .from('franchisees')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      showSuccess('Franquiciado actualizado correctamente');
      await fetchFranchisees();
    } catch (error) {
      console.error('Error updating franchisee:', error);
      showError('Error al actualizar el franquiciado');
    }
  };

  useEffect(() => {
    fetchFranchisees();
  }, []);

  return {
    franchisees,
    loading,
    createFranchisee,
    updateFranchisee,
    refetch: fetchFranchisees
  };
};
