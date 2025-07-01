
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Franchisee, Restaurant } from '@/types/auth';

export const useUserDataFetcher = () => {
  const fetchUserData = useCallback(async (userId: string, retryCount = 0) => {
    const maxRetries = 2;
    
    try {
      console.log(`useUserDataFetcher - Fetching user data for: ${userId} (attempt ${retryCount + 1})`);

      // Función helper para manejar timeouts más agresivos
      const withTimeout = (promise: Promise<any>, timeoutMs: number = 5000): Promise<any> => {
        return Promise.race([
          promise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
          )
        ]);
      };

      // Fetch user profile con timeout reducido
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data: profileData, error: profileError } = await withTimeout(
        Promise.resolve(profilePromise),
        4000
      );

      if (profileError) {
        console.error('useUserDataFetcher - Error fetching profile:', profileError);
        
        // Si falla por primera vez, intentar de nuevo
        if (retryCount < maxRetries) {
          console.log(`useUserDataFetcher - Retrying profile fetch (${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
          return fetchUserData(userId, retryCount + 1);
        }
        
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

      // Si es franchisee, cargar datos con fallback
      if (user.role === 'franchisee') {
        try {
          const franchiseePromise = supabase
            .from('franchisees')
            .select('*')
            .eq('user_id', userId)
            .single();

          const { data: franchiseeData, error: franchiseeError } = await withTimeout(
            Promise.resolve(franchiseePromise),
            4000
          );

          if (franchiseeError) {
            console.log('useUserDataFetcher - Franchisee data not found, creating basic user access');
            // No lanzar error, permitir acceso básico
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
              profiles: {
                email: profileData.email,
                phone: profileData.phone || '',
                full_name: profileData.full_name || ''
              },
              hasAccount: true,
              isOnline: false,
              lastAccess: new Date().toISOString()
            };

            // Cargar restaurantes con timeout más corto
            try {
              const restaurantsPromise = supabase
                .from('franchisee_restaurants')
                .select(`
                  *,
                  base_restaurant:base_restaurants(*)
                `)
                .eq('franchisee_id', franchisee.id)
                .eq('status', 'active')
                .limit(10); // Limitar resultados para mejorar velocidad

              const { data: restaurantData, error: restaurantError } = await withTimeout(
                Promise.resolve(restaurantsPromise),
                3000
              );

              if (restaurantError) {
                console.log('useUserDataFetcher - Restaurants data timeout, continuing without restaurants');
              } else if (restaurantData && restaurantData.length > 0) {
                restaurants = restaurantData
                  .filter(item => item.base_restaurant)
                  .map(item => {
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
              console.log('useUserDataFetcher - Restaurant fetch failed, continuing without restaurants');
            }
          }
        } catch (franchiseeError) {
          console.log('useUserDataFetcher - Franchisee fetch failed, allowing basic access');
        }
      }

      console.log('useUserDataFetcher - Successfully loaded data:', {
        user: { id: user.id, role: user.role },
        franchisee: !!franchisee,
        restaurantsCount: restaurants.length
      });

      return { user, franchisee, restaurants };
    } catch (error) {
      console.error('useUserDataFetcher - Error in attempt', retryCount + 1, ':', error);
      
      // Si aún tenemos reintentos disponibles, intentar de nuevo
      if (retryCount < maxRetries) {
        console.log(`useUserDataFetcher - Retrying full fetch (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Esperar más tiempo entre reintentos
        return fetchUserData(userId, retryCount + 1);
      }
      
      // Si se agotaron los reintentos, lanzar el error
      console.error('useUserDataFetcher - All retries failed');
      throw error;
    }
  }, []);

  return { fetchUserData };
};
