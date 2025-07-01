
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
      
      // Map the database data to our interface
      const mappedData = (data || []).map(item => ({
        id: item.id,
        franchisee_name: item.franchisee_name,
        contact_email: item.franchisee_name, // Using franchisee_name as fallback
        contact_phone: item.company_name || '', // Using company_name as fallback
        address: item.address || '',
        city: item.city || '',
        state: item.state || '',
        zip_code: item.postal_code || '',
        notes: item.company_name || '', // Using company_name as fallback for notes
        created_at: item.created_at,
        updated_at: item.updated_at,
        profiles: item.profiles
      }));
      
      setFranchisees(mappedData);
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
        .insert({
          franchisee_name: franchiseeData.franchisee_name,
          address: franchiseeData.address,
          city: franchiseeData.city,
          state: franchiseeData.state,
          postal_code: franchiseeData.zip_code,
          company_name: franchiseeData.notes // Map notes to company_name
        });

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
          franchisee_name: updates.franchisee_name,
          address: updates.address,
          city: updates.city,
          state: updates.state,
          postal_code: updates.zip_code,
          company_name: updates.notes,
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
