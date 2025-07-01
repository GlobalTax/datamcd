
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Franchisee, Restaurant } from '@/types/auth';

export const useUserDataFetcher = () => {
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      console.log('useUserDataFetcher - Fetching user data for:', userId);

      // Función helper para manejar timeouts
      const withTimeout = (promise: Promise<any>, timeoutMs: number = 10000): Promise<any> => {
        return Promise.race([
          promise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
          )
        ]);
      };

      // Fetch user profile with timeout - crear promesa verdadera
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data: profileData, error: profileError } = await withTimeout(
        Promise.resolve(profilePromise),
        8000
      );

      if (profileError) {
        console.error('useUserDataFetcher - Error fetching profile:', profileError);
        throw new Error(`Error al cargar perfil: ${profileError.message}`);
      }

      if (!profileData) {
        throw new Error('Perfil de usuario no encontrado');
      }

      const user: User = {
        id: profileData.id,
        email: profileData.email,
        full_name: profileData.full_name,
        role: profileData.role as 'franchisee' | 'asesor' | 'admin' | 'superadmin' | 'manager' | 'asistente',
        phone: profileData.phone,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at
      };

      let franchisee: Franchisee | null = null;
      let restaurants: Restaurant[] = [];

      // If user is franchisee, fetch franchisee data and restaurants
      if (user.role === 'franchisee') {
        try {
          const franchiseePromise = supabase
            .from('franchisees')
            .select('*')
            .eq('user_id', userId)
            .single();

          const { data: franchiseeData, error: franchiseeError } = await withTimeout(
            Promise.resolve(franchiseePromise),
            8000
          );

          if (franchiseeError) {
            console.error('useUserDataFetcher - Error fetching franchisee:', franchiseeError);
            // No lanzar error aquí, solo log. El usuario puede no tener datos de franquiciado aún
          } else if (franchiseeData) {
            franchisee = {
              id: franchiseeData.id,
              user_id: franchiseeData.user_id,
              franchisee_name: franchiseeData.franchisee_name,
              company_name: franchiseeData.company_name,
              tax_id: franchiseeData.tax_id,
              address: franchiseeData.address,
              city: franchiseeData.city,
              state: franchiseeData.state,
              postal_code: franchiseeData.postal_code,
              country: franchiseeData.country,
              created_at: franchiseeData.created_at,
              updated_at: franchiseeData.updated_at,
              total_restaurants: franchiseeData.total_restaurants,
              // Propiedades adicionales para compatibilidad - usar datos del perfil
              profiles: {
                email: profileData.email,
                phone: profileData.phone,
                full_name: profileData.full_name
              },
              hasAccount: true,
              isOnline: false,
              lastAccess: new Date().toISOString()
            };

            // Fetch restaurants only if franchisee exists
            try {
              const restaurantsPromise = supabase
                .from('franchisee_restaurants')
                .select(`
                  *,
                  base_restaurant:base_restaurants(*)
                `)
                .eq('franchisee_id', franchisee.id)
                .eq('status', 'active');

              const { data: restaurantData, error: restaurantError } = await withTimeout(
                Promise.resolve(restaurantsPromise),
                10000
              );

              if (restaurantError) {
                console.error('useUserDataFetcher - Error fetching restaurants:', restaurantError);
                // No lanzar error, restaurantes pueden estar vacíos
              } else if (restaurantData && restaurantData.length > 0) {
                restaurants = restaurantData
                  .filter(item => item.base_restaurant)
                  .map(item => {
                    // Asegurar que el status sea uno de los valores permitidos
                    const validStatus = ['active', 'inactive', 'pending', 'closed'];
                    const status = validStatus.includes(item.status) ? item.status : 'active';
                    
                    return {
                      id: item.base_restaurant.id,
                      franchisee_id: item.franchisee_id,
                      site_number: item.base_restaurant.site_number,
                      restaurant_name: item.base_restaurant.restaurant_name,
                      address: item.base_restaurant.address,
                      city: item.base_restaurant.city,
                      state: item.base_restaurant.state,
                      postal_code: item.base_restaurant.postal_code,
                      country: item.base_restaurant.country,
                      opening_date: item.base_restaurant.opening_date,
                      restaurant_type: item.base_restaurant.restaurant_type || 'traditional',
                      status: status as 'active' | 'inactive' | 'pending' | 'closed',
                      square_meters: item.base_restaurant.square_meters,
                      seating_capacity: item.base_restaurant.seating_capacity,
                      created_at: item.base_restaurant.created_at,
                      updated_at: item.base_restaurant.updated_at
                    };
                  });
              }
            } catch (restaurantError) {
              console.error('useUserDataFetcher - Restaurant fetch timeout:', restaurantError);
              // Continuar sin restaurantes
            }
          }
        } catch (franchiseeError) {
          console.error('useUserDataFetcher - Franchisee fetch timeout:', franchiseeError);
          // Continuar sin datos de franquiciado
        }
      }

      console.log('useUserDataFetcher - Successfully loaded data:', {
        user: { id: user.id, role: user.role },
        franchisee: !!franchisee,
        restaurantsCount: restaurants.length
      });

      return { user, franchisee, restaurants };
    } catch (error) {
      console.error('useUserDataFetcher - Critical error:', error);
      throw error;
    }
  }, []);

  return { fetchUserData };
};
