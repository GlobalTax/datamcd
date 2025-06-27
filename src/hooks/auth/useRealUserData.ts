
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Franchisee } from '@/types/auth';
import { UserDataResult } from './types';

export const useRealUserData = () => {
  // Timeout helper para evitar bloqueos
  const withTimeout = useCallback(async <T>(
    promise: Promise<T>, 
    timeoutMs: number = 8000
  ): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }, []);

  // Cargar datos del usuario real
  const loadRealUserData = useCallback(async (userId: string): Promise<UserDataResult> => {
    console.log('loadRealUserData - Starting for user:', userId);
    
    try {
      // Ejecutar la consulta del perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw profileError;
      }

      if (!profile) {
        throw new Error('Profile not found');
      }

      // Validar el rol antes de asignarlo
      const validRoles = ['franchisee', 'asesor', 'admin', 'superadmin', 'manager', 'asistente'];
      const userRole = validRoles.includes(profile.role) ? profile.role as User['role'] : 'franchisee';

      const userData: User = {
        id: profile.id,
        email: profile.email,
        role: userRole,
        full_name: profile.full_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Si es franchisee, cargar datos adicionales
      if (profile.role === 'franchisee') {
        try {
          const { data: franchiseeData, error: franchiseeError } = await supabase
            .from('franchisees')
            .select('id, user_id, franchisee_name, company_name, total_restaurants, created_at, updated_at')
            .eq('user_id', userId)
            .maybeSingle();

          if (!franchiseeError && franchiseeData) {
            const { data: restaurantsData } = await supabase
              .from('franchisee_restaurants')
              .select(`
                id,
                monthly_rent,
                last_year_revenue,
                status,
                base_restaurant:base_restaurants!inner(
                  id,
                  site_number,
                  restaurant_name,
                  address,
                  city,
                  restaurant_type
                )
              `)
              .eq('franchisee_id', franchiseeData.id)
              .eq('status', 'active')
              .limit(20);

            console.log('Real data loaded successfully');
            return {
              user: userData,
              franchisee: franchiseeData,
              restaurants: restaurantsData || []
            };
          }
        } catch (error) {
          console.log('Franchisee data not available:', error);
        }
      }

      return { user: userData };
    } catch (error) {
      console.error('Error loading real user data:', error);
      throw error;
    }
  }, []);

  return { loadRealUserData };
};
