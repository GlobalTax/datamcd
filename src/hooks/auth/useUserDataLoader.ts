
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Franchisee } from '@/types/auth';
import { useAuthTimeouts } from './useAuthTimeouts';

export const useUserDataLoader = () => {
  const { withTimeout } = useAuthTimeouts();

  // Cargar datos del usuario real con reintentos
  const loadRealUserData = useCallback(async (userId: string, retries: number = 2): Promise<{
    user: User;
    franchisee?: Franchisee;
    restaurants?: any[];
  }> => {
    console.log('loadRealUserData - Starting for user:', userId, 'retries left:', retries);
    
    try {
      // Cargar perfil correctamente - convertir a Promise completo
      const profilePromise = Promise.resolve(
        supabase
          .from('profiles')
          .select('id, email, full_name, role')
          .eq('id', userId)
          .maybeSingle()
      );

      const { data: profile, error: profileError } = await withTimeout(profilePromise, 5000);

      if (profileError) {
        console.error('Profile error:', profileError);
        if (retries > 0) {
          console.log('Retrying profile query...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          return loadRealUserData(userId, retries - 1);
        }
        throw profileError;
      }

      if (!profile) {
        throw new Error('Profile not found');
      }

      // Validar el rol
      const validRoles = ['franchisee', 'asesor', 'admin', 'superadmin', 'manager', 'asistente'];
      const userRole = validRoles.includes(profile.role) ? profile.role : 'franchisee';

      const userData: User = {
        id: profile.id,
        email: profile.email,
        role: userRole as User['role'],
        full_name: profile.full_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Si es franchisee, cargar datos adicionales
      if (profile.role === 'franchisee') {
        try {
          const franchiseePromise = Promise.resolve(
            supabase
              .from('franchisees')
              .select('id, user_id, franchisee_name, company_name, total_restaurants, created_at, updated_at')
              .eq('user_id', userId)
              .maybeSingle()
          );

          const { data: franchiseeData, error: franchiseeError } = await withTimeout(franchiseePromise, 5000);

          if (!franchiseeError && franchiseeData) {
            const restaurantsPromise = Promise.resolve(
              supabase
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
                .limit(20)
            );

            const { data: restaurantsData } = await withTimeout(restaurantsPromise, 8000);

            console.log('Real data loaded successfully');
            return {
              user: userData,
              franchisee: franchiseeData,
              restaurants: restaurantsData || []
            };
          } else if (franchiseeError) {
            console.log('Franchisee data error:', franchiseeError);
            // Crear datos de franquiciado si no existen
            try {
              const { data: newFranchisee, error: createError } = await supabase
                .from('franchisees')
                .insert({
                  user_id: userId,
                  franchisee_name: profile.full_name || profile.email,
                  company_name: `Empresa de ${profile.full_name || profile.email}`,
                  total_restaurants: 0
                })
                .select()
                .single();

              if (!createError && newFranchisee) {
                console.log('Created new franchisee data');
                return {
                  user: userData,
                  franchisee: newFranchisee,
                  restaurants: []
                };
              }
            } catch (createErr) {
              console.log('Could not create franchisee data:', createErr);
            }
          }
        } catch (error) {
          console.log('Franchisee data not available:', error);
        }
      }

      return { user: userData };
    } catch (error) {
      console.error('Error loading real user data:', error);
      if (retries > 0) {
        console.log('Retrying loadRealUserData...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return loadRealUserData(userId, retries - 1);
      }
      throw error;
    }
  }, [withTimeout]);

  return { loadRealUserData };
};
