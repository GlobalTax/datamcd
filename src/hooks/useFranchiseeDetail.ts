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
      
      setFranchisee(data);
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
          ...updates,
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
