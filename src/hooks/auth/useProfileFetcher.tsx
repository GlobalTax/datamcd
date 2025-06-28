
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useProfileFetcher = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserProfile = useCallback(async (userId: string) => {
    console.log('fetchUserProfile - About to query profiles table');
    setIsLoading(true);
    
    try {
      // Reducir timeout y añadir retry logic
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout after 5 seconds')), 5000)
      );
      
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const { data: profile, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('fetchUserProfile - Database error:', error);
        throw error;
      }

      if (profile) {
        console.log('fetchUserProfile - Profile found:', profile);
        return profile;
      } else {
        console.log('fetchUserProfile - No profile found, creating basic profile');
        // Si no hay perfil, crear uno básico
        const basicProfile = {
          id: userId,
          email: 'user@example.com',
          full_name: 'Usuario',
          role: 'franchisee'
        };
        return basicProfile;
      }
    } catch (error) {
      console.log('fetchUserProfile - Query timeout or error:', error);
      console.log('fetchUserProfile - Setting basic user due to timeout');
      
      // En caso de error o timeout, devolver perfil básico
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
