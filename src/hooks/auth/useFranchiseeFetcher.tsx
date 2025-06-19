
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useFranchiseeFetcher = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchFranchiseeData = useCallback(async (userId: string) => {
    console.log('fetchFranchiseeData - Starting for user:', userId);
    setIsLoading(true);
    
    try {
      // Timeout más corto y mejor manejo de errores
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Franchisee query timeout')), 5000)
      );
      
      const queryPromise = supabase
        .from('franchisees')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const { data: franchisee, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('fetchFranchiseeData - Database error:', error);
        throw error;
      }

      if (franchisee) {
        console.log('fetchFranchiseeData - Franchisee found:', franchisee);
        return franchisee;
      } else {
        console.log('fetchFranchiseeData - No franchisee found, creating temporary one');
        // Crear franquiciado temporal si no existe
        const tempFranchisee = {
          id: `temp-${userId}`,
          user_id: userId,
          franchisee_name: 'Franquiciado Temporal',
          company_name: 'Empresa Temporal',
          total_restaurants: 0
        };
        return tempFranchisee;
      }
    } catch (error) {
      console.log('fetchFranchiseeData - Timeout or error:', error);
      console.log('fetchFranchiseeData - Setting basic franchisee due to timeout');
      
      // Franquiciado de fallback en caso de error
      return {
        id: `temp-${userId}`,
        user_id: userId,
        franchisee_name: 'Franquiciado Temporal',
        company_name: 'Empresa Temporal',
        total_restaurants: 0
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchFranchiseeData, isLoading };
};
