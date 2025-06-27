
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Franchisee } from '@/types/auth';
import { useStaticData } from '../useStaticData';
import { UserDataResult } from './useUnifiedAuthTypes';

export const useUnifiedAuthData = () => {
  const { getFranchiseeData, getRestaurantsData } = useStaticData();

  // Validar rol del usuario
  const validateUserRole = (role: string): User['role'] => {
    const validRoles = ['franchisee', 'asesor', 'admin', 'superadmin', 'manager', 'asistente'];
    return validRoles.includes(role) ? role as User['role'] : 'franchisee';
  };

  // Cargar datos del usuario real
  const loadRealUserData = useCallback(async (userId: string): Promise<UserDataResult> => {
    console.log('loadRealUserData - Starting for user:', userId);
    
    try {
      // Cargar perfil del usuario
      const profileQuery = supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('id', userId)
        .maybeSingle();

      const { data: profile, error: profileError } = await profileQuery;

      if (profileError) {
        console.error('Profile error:', profileError);
        throw profileError;
      }

      if (!profile) {
        throw new Error('Profile not found');
      }

      const userData: User = {
        id: profile.id,
        email: profile.email,
        role: validateUserRole(profile.role),
        full_name: profile.full_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Si es franchisee, cargar datos adicionales
      if (profile.role === 'franchisee') {
        try {
          const franchiseeQuery = supabase
            .from('franchisees')
            .select('id, user_id, franchisee_name, company_name, total_restaurants, created_at, updated_at')
            .eq('user_id', userId)
            .maybeSingle();

          const { data: franchiseeData, error: franchiseeError } = await franchiseeQuery;

          if (!franchiseeError && franchiseeData) {
            const restaurantsQuery = supabase
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

            const { data: restaurantsData } = await restaurantsQuery;

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

  // Cargar datos de fallback
  const loadFallbackData = useCallback(async () => {
    console.log('Loading fallback data');
    
    const fallbackUser: User = {
      id: 'fallback-user',
      email: 'fallback@ejemplo.com',
      role: 'franchisee',
      full_name: 'Usuario Fallback',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const fallbackFranchisee = await getFranchiseeData('fallback-user');
    const fallbackRestaurants = await getRestaurantsData(fallbackFranchisee.id);

    return {
      user: fallbackUser,
      franchisee: fallbackFranchisee,
      restaurants: fallbackRestaurants
    };
  }, [getFranchiseeData, getRestaurantsData]);

  return {
    loadRealUserData,
    loadFallbackData
  };
};
