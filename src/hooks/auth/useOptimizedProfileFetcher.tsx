
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOptimizedProfileFetcher = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserProfile = useCallback(async (userId: string) => {
    console.log('useOptimizedProfileFetcher - Fetching profile for user:', userId);
    setIsLoading(true);
    
    try {
      // Consulta directa sin timeout agresivo para mayor confiabilidad
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, phone, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('useOptimizedProfileFetcher - Database error:', error);
        throw error;
      }

      console.log('useOptimizedProfileFetcher - Raw response data:', { data: profile, error });
      
      if (profile) {
        console.log('useOptimizedProfileFetcher - Profile found:', profile);
        return profile;
      } else {
        console.log('useOptimizedProfileFetcher - No profile found, returning null to use session data');
        return null; // Devolver null para que useUnifiedAuth use datos de sesión
      }
    } catch (error) {
      console.error('useOptimizedProfileFetcher - Error details:', error);
      return null; // Devolver null para que useUnifiedAuth use datos de sesión
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchUserProfile, isLoading };
};
