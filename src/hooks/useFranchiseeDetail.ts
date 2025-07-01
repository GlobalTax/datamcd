
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/notifications';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface BaseRestaurant {
  id: string;
  restaurant_name: string;
  site_number: string;
}

interface FranchiseeRestaurant {
  id: string;
  base_restaurant: BaseRestaurant | null;
}

export interface FranchiseeDetail {
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
  franchisee_restaurants: FranchiseeRestaurant[];
  profiles: Profile | null;
}

export const useFranchiseeDetail = (franchiseeId: string) => {
  const [franchisee, setFranchisee] = useState<FranchiseeDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFranchiseeDetail = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('franchisees')
        .select(`
          *,
          franchisee_restaurants (
            id,
            base_restaurant:base_restaurants (*)
          ),
          profiles (
            id,
            full_name,
            email,
            role
          )
        `)
        .eq('id', franchiseeId)
        .single();

      if (error) throw error;
      
      // Map the database data to our interface
      const mappedData: FranchiseeDetail = {
        id: data.id,
        franchisee_name: data.franchisee_name,
        contact_email: data.franchisee_name, // Using franchisee_name as fallback
        contact_phone: data.company_name || '', // Using company_name as fallback
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zip_code: data.postal_code || '',
        notes: data.company_name || '', // Using company_name as fallback for notes
        created_at: data.created_at,
        updated_at: data.updated_at,
        franchisee_restaurants: data.franchisee_restaurants || [],
        profiles: data.profiles
      };
      
      setFranchisee(mappedData);
    } catch (error) {
      console.error('Error fetching franchisee detail:', error);
      showError('Error al cargar los detalles del franquiciado');
    } finally {
      setLoading(false);
    }
  };

  const updateFranchisee = async (updates: Partial<FranchiseeDetail>) => {
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
        .eq('id', franchiseeId);

      if (error) throw error;
      
      showSuccess('Franquiciado actualizado correctamente');
      await fetchFranchiseeDetail();
    } catch (error) {
      console.error('Error updating franchisee:', error);
      showError('Error al actualizar el franquiciado');
    }
  };

  useEffect(() => {
    if (franchiseeId) {
      fetchFranchiseeDetail();
    }
  }, [franchiseeId]);

  return {
    franchisee,
    loading,
    updateFranchisee,
    refetch: fetchFranchiseeDetail
  };
};
