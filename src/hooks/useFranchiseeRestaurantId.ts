import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to convert base_restaurant_id to franchisee_restaurant_id
 * This is needed because URLs use base_restaurant_id but database operations need franchisee_restaurant_id
 */
export const useFranchiseeRestaurantId = (baseRestaurantId: string) => {
  const [franchiseeRestaurantId, setFranchiseeRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!baseRestaurantId) {
      setLoading(false);
      return;
    }

    const fetchFranchiseeRestaurantId = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('[useFranchiseeRestaurantId] Converting base_restaurant_id:', baseRestaurantId);

        const { data, error: queryError } = await supabase
          .from('franchisee_restaurants')
          .select('id')
          .eq('base_restaurant_id', baseRestaurantId)
          .eq('status', 'active')
          .single();

        if (queryError) {
          console.error('[useFranchiseeRestaurantId] Error fetching franchisee_restaurant_id:', queryError);
          setError(queryError.message);
          setFranchiseeRestaurantId(null);
        } else if (data) {
          console.log('[useFranchiseeRestaurantId] Found franchisee_restaurant_id:', data.id);
          setFranchiseeRestaurantId(data.id);
        } else {
          console.log('[useFranchiseeRestaurantId] No active franchisee restaurant found for base_restaurant_id:', baseRestaurantId);
          setError('No active franchisee restaurant found');
          setFranchiseeRestaurantId(null);
        }
      } catch (err) {
        console.error('[useFranchiseeRestaurantId] Unexpected error:', err);
        setError('Failed to fetch restaurant mapping');
        setFranchiseeRestaurantId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFranchiseeRestaurantId();
  }, [baseRestaurantId]);

  return { 
    franchiseeRestaurantId, 
    loading, 
    error,
    // Also return the base ID for components that might need both
    baseRestaurantId 
  };
};