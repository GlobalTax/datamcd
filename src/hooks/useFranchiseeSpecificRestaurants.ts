
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { FranchiseeRestaurant } from '@/types/franchiseeRestaurant';
import { toast } from 'sonner';

export const useFranchiseeSpecificRestaurants = (franchiseeId?: string) => {
  const { user } = useUnifiedAuth();
  const [restaurants, setRestaurants] = useState<FranchiseeRestaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = async (targetFranchiseeId: string) => {
    console.log('useFranchiseeSpecificRestaurants - Fetching restaurants for franchisee:', targetFranchiseeId);
    
    try {
      setLoading(true);
      setError(null);

      // Consulta optimizada directa
      const { data, error } = await supabase
        .from('franchisee_restaurants')
        .select(`
          *,
          base_restaurant:base_restaurant_id (
            id,
            site_number,
            restaurant_name,
            address,
            city,
            state,
            postal_code,
            country,
            restaurant_type,
            square_meters,
            seating_capacity,
            franchisee_name,
            franchisee_email,
            company_tax_id,
            opening_date,
            property_type,
            autonomous_community,
            created_at,
            updated_at,
            created_by
          ),
          franchisees (
            id,
            franchisee_name,
            company_name,
            tax_id,
            city,
            state
          )
        `)
        .eq('franchisee_id', targetFranchiseeId)
        .eq('status', 'active');

      console.log('useFranchiseeSpecificRestaurants - Query result:', { 
        data: data?.length || 0, 
        error,
        franchiseeId: targetFranchiseeId 
      });

      if (error) {
        console.error('Error fetching specific restaurants:', error);
        throw error;
      }

      const validRestaurants = Array.isArray(data) ? data : [];
      setRestaurants(validRestaurants);
      
      if (validRestaurants.length === 0) {
        console.log('useFranchiseeSpecificRestaurants - No restaurants found for franchisee');
      } else {
        console.log(`useFranchiseeSpecificRestaurants - Found ${validRestaurants.length} restaurants`);
      }
    } catch (err) {
      console.error('Error in fetchRestaurants:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar los restaurantes';
      setError(errorMessage);
      setRestaurants([]);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (franchiseeId && user) {
      console.log('useFranchiseeSpecificRestaurants - useEffect triggered for franchisee:', franchiseeId);
      fetchRestaurants(franchiseeId);
    } else {
      setRestaurants([]);
      setLoading(false);
      setError(null);
    }
  }, [franchiseeId, user?.id]);

  return {
    restaurants,
    loading,
    error,
    refetch: () => franchiseeId ? fetchRestaurants(franchiseeId) : Promise.resolve()
  };
};
