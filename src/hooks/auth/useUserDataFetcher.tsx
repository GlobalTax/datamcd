
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Franchisee, Restaurant } from '@/types/auth';

export const useUserDataFetcher = () => {
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      console.log('Fetching user data for:', userId);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
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
        const { data: franchiseeData, error: franchiseeError } = await supabase
          .from('franchisees')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (franchiseeError) {
          console.error('Error fetching franchisee:', franchiseeError);
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
            // Propiedades adicionales para compatibilidad
            profiles: {
              email: profileData.email,
              phone: profileData.phone,
              full_name: profileData.full_name
            },
            hasAccount: true,
            isOnline: false,
            lastAccess: new Date().toISOString()
          };

          // Fetch restaurants
          const { data: restaurantData, error: restaurantError } = await supabase
            .from('franchisee_restaurants')
            .select(`
              *,
              base_restaurant:base_restaurants(*)
            `)
            .eq('franchisee_id', franchisee.id);

          if (restaurantError) {
            console.error('Error fetching restaurants:', restaurantError);
          } else if (restaurantData) {
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
        }
      }

      return { user, franchisee, restaurants };
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      throw error;
    }
  }, []);

  return { fetchUserData };
};
