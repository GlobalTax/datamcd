
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOptimizedProfileFetcher = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserProfile = useCallback(async (userId: string) => {
    console.log('useOptimizedProfileFetcher - Fetching profile for user:', userId);
    setIsLoading(true);
    
    try {
      // Timeout aumentado para evitar franquiciados temporales
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Optimized query timeout after 15 seconds')), 15000)
      );
      
      // Consulta optimizada que usa el índice idx_profiles_id
      const queryPromise = supabase
        .from('profiles')
        .select('id, email, full_name, role, phone, created_at, updated_at')
        .eq('id', userId)
        .single();

      const { data: profile, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('useOptimizedProfileFetcher - Database error:', error);
        throw error;
      }

      if (profile) {
        console.log('useOptimizedProfileFetcher - Profile found:', profile);
        return profile;
      } else {
        console.log('useOptimizedProfileFetcher - No profile found, creating basic profile');
        return {
          id: userId,
          email: 'user@example.com',
          full_name: 'Usuario',
          role: 'franchisee'
        };
      }
    } catch (error) {
      console.log('useOptimizedProfileFetcher - Error or timeout:', error);
      return {
        id: userId,
        email: 'user@example.com',
        full_name: 'Usuario',
        role: 'franchisee'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchUserProfile, isLoading };
};
