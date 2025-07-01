
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/notifications';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone?: string;
}

interface BaseRestaurant {
  id: string;
  restaurant_name: string;
  site_number: string;
  address: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  restaurant_type: string;
  property_type?: string;
  autonomous_community?: string;
  franchisee_name?: string;
  franchisee_email?: string;
  company_tax_id?: string;
  square_meters?: number;
  seating_capacity?: number;
  opening_date?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

interface FranchiseeRestaurant {
  id: string;
  franchisee_id: string;
  base_restaurant_id?: string;
  franchise_start_date?: string;
  franchise_end_date?: string;
  lease_start_date?: string;
  lease_end_date?: string;
  monthly_rent?: number;
  franchise_fee_percentage?: number;
  advertising_fee_percentage?: number;
  last_year_revenue?: number;
  average_monthly_sales?: number;
  status?: string;
  notes?: string;
  assigned_at: string;
  updated_at: string;
  base_restaurant?: BaseRestaurant | null;
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
  company_name?: string;
  tax_id?: string;
  created_at: string;
  updated_at: string;
  franchisee_restaurants: FranchiseeRestaurant[];
  profiles: Profile | null;
}

export const useFranchiseeDetail = (franchiseeId: string) => {
  const [franchisee, setFranchisee] = useState<FranchiseeDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFranchiseeDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('franchisees')
        .select(`
          *,
          franchisee_restaurants (
            id,
            franchisee_id,
            base_restaurant_id,
            franchise_start_date,
            franchise_end_date,
            lease_start_date,
            lease_end_date,
            monthly_rent,
            franchise_fee_percentage,
            advertising_fee_percentage,
            last_year_revenue,
            average_monthly_sales,
            status,
            notes,
            assigned_at,
            updated_at,
            base_restaurant:base_restaurants (*)
          ),
          profiles (
            id,
            full_name,
            email,
            role,
            phone
          )
        `)
        .eq('id', franchiseeId)
        .single();

      if (supabaseError) throw supabaseError;
      
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
        company_name: data.company_name,
        tax_id: data.tax_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        franchisee_restaurants: data.franchisee_restaurants || [],
        profiles: data.profiles
      };
      
      setFranchisee(mappedData);
    } catch (error) {
      console.error('Error fetching franchisee detail:', error);
      setError('Error al cargar los detalles del franquiciado');
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
    error,
    updateFranchisee,
    refetch: fetchFranchiseeDetail
  };
};
