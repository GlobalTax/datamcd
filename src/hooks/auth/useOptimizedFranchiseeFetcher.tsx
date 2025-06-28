
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOptimizedFranchiseeFetcher = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchFranchiseeData = useCallback(async (userId: string) => {
    console.log('useOptimizedFranchiseeFetcher - Starting optimized fetch for user:', userId);
    setIsLoading(true);
    
    try {
      // Timeout aumentado para permitir que las consultas optimizadas se completen
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Optimized franchisee query timeout')), 10000)
      );
      
      // Consulta optimizada que usa el índice idx_franchisees_user_id_optimized
      const queryPromise = supabase
        .from('franchisees')
        .select('id, user_id, franchisee_name, company_name, total_restaurants, created_at, updated_at')
        .eq('user_id', userId)
        .single();

      const { data: franchisee, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('useOptimizedFranchiseeFetcher - Database error:', error);
        throw error;
      }

      if (franchisee) {
        console.log('useOptimizedFranchiseeFetcher - Franchisee found:', franchisee);
        return franchisee;
      } else {
        console.log('useOptimizedFranchiseeFetcher - No franchisee found, creating temporary one');
        return {
          id: `temp-${userId}`,
          user_id: userId,
          franchisee_name: 'Franquiciado Temporal',
          company_name: 'Empresa Temporal',
          total_restaurants: 0
        };
      }
    } catch (error) {
      console.log('useOptimizedFranchiseeFetcher - Error or timeout:', error);
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
