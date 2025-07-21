
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { useOptimizedQueries } from './useOptimizedQueries';

export interface UnifiedRestaurant {
  id: string;
  restaurant_name: string;
  site_number: string;
  address: string;
  city: string;
  state?: string;
  autonomous_community?: string;
  country?: string;
  postal_code?: string;
  restaurant_type?: string;
  opening_date?: string;
  created_at?: string;
  franchisee_info?: {
    id: string;
    franchisee_name: string;
    company_name?: string;
    city?: string;
    state?: string;
    user_id?: string;
  };
  assignment?: {
    id: string;
    status: string;
    franchise_start_date?: string;
    franchise_end_date?: string;
    last_year_revenue?: number;
    monthly_rent?: number;
    average_monthly_sales?: number;
    assigned_at?: string;
  };
  isAssigned: boolean;
}

export interface RestaurantStats {
  total: number;
  assigned: number;
  available: number;
  byFranchisee: Record<string, number>;
}

export const useUnifiedRestaurants = (specificFranchiseeId?: string) => {
  const { user, effectiveFranchisee } = useUnifiedAuth();
  const [restaurants, setRestaurants] = useState<UnifiedRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = useCallback(async () => {
    if (!user) {
      console.log('useUnifiedRestaurants: No user, skipping fetch');
      return;
    }

    console.log('Fetching unified restaurants for user:', user.id, 'with role:', user.role, 'specific franchisee:', specificFranchiseeId);
    
    try {
      setError(null);

      let baseQuery = supabase
        .from('base_restaurants')
        .select(`
          id,
          restaurant_name,
          site_number,
          address,
          city,
          state,
          country,
          postal_code,
          restaurant_type,
          franchisee_name
        `)
        .order('restaurant_name');

      const { data: baseRestaurants, error: baseError } = await baseQuery;

      if (baseError) {
        console.error('Error fetching base restaurants:', baseError);
        throw baseError;
      }

      let assignmentsQuery = supabase
        .from('franchisee_restaurants')
        .select(`
          id,
          base_restaurant_id,
          franchisee_id,
          status,
          franchise_start_date,
          franchise_end_date,
          last_year_revenue,
          monthly_rent,
          franchisees (
            id,
            franchisee_name,
            user_id
          )
        `)
        .eq('status', 'active');

      // Si se especifica un franquiciado, filtrar las asignaciones
      if (specificFranchiseeId) {
        assignmentsQuery = assignmentsQuery.eq('franchisee_id', specificFranchiseeId);
      }

      const { data: assignments, error: assignmentsError } = await assignmentsQuery;

      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError);
      }

      // Unificar datos
      const unifiedRestaurants: UnifiedRestaurant[] = (baseRestaurants || []).map(restaurant => {
        const assignment = (assignments || []).find(a => a.base_restaurant_id === restaurant.id);
        
        return {
          ...restaurant,
          franchisee_info: assignment?.franchisees ? {
            id: assignment.franchisees.id,
            franchisee_name: assignment.franchisees.franchisee_name,
            user_id: assignment.franchisees.user_id
          } : undefined,
          assignment: assignment ? {
            id: assignment.id,
            status: assignment.status,
            franchise_start_date: assignment.franchise_start_date,
            franchise_end_date: assignment.franchise_end_date,
            last_year_revenue: assignment.last_year_revenue,
            monthly_rent: assignment.monthly_rent
          } : undefined,
          isAssigned: !!assignment
        };
      });

      // Si se especifica un franquiciado, filtrar solo los restaurantes asignados a él
      const filteredRestaurants = specificFranchiseeId 
        ? unifiedRestaurants.filter(r => r.franchisee_info?.id === specificFranchiseeId)
        : unifiedRestaurants;

      setRestaurants(filteredRestaurants);
      
      const assignedCount = filteredRestaurants.filter(r => r.isAssigned).length;
      const totalCount = filteredRestaurants.length;
      
      console.log('Successfully unified restaurants:', totalCount, 'total');
      console.log('Assigned restaurants:', assignedCount);
      console.log('Available restaurants:', totalCount - assignedCount);
      
      if (specificFranchiseeId) {
        console.log('Restaurants for specific franchisee:', specificFranchiseeId, 'count:', totalCount);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error in fetchRestaurants:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, specificFranchiseeId]);

  // Usar queries optimizadas para evitar bucles infinitos
  const { loading: queryLoading } = useOptimizedQueries(
    fetchRestaurants,
    [user?.id, user?.role, specificFranchiseeId],
    {
      debounceMs: 500,
      maxRetries: 1,
      enabled: !!user
    }
  );

  // Estadísticas calculadas
  const stats = useMemo((): RestaurantStats => {
    const total = restaurants.length;
    const assigned = restaurants.filter(r => r.isAssigned).length;
    const available = total - assigned;
    
    const byFranchisee: Record<string, number> = {};
    restaurants.forEach(restaurant => {
      if (restaurant.franchisee_info) {
        const name = restaurant.franchisee_info.franchisee_name;
        byFranchisee[name] = (byFranchisee[name] || 0) + 1;
      }
    });

    return {
      total,
      assigned,
      available,
      byFranchisee
    };
  }, [restaurants]);

  // Filtrar restaurantes según el rol del usuario
  const filteredRestaurants = useMemo(() => {
    if (!user) return [];
    
    // Superadmin y admin ven todos los restaurantes
    if (['superadmin', 'admin'].includes(user.role)) {
      return restaurants;
    }
    
    // Franquiciados solo ven sus restaurantes asignados
    if (user.role === 'franchisee' && effectiveFranchisee) {
      return restaurants.filter(r => 
        r.franchisee_info?.user_id === effectiveFranchisee.user_id ||
        r.franchisee_info?.id === effectiveFranchisee.id
      );
    }
    
    return [];
  }, [restaurants, user, effectiveFranchisee]);

  return {
    restaurants: filteredRestaurants,
    allRestaurants: restaurants,
    loading: loading || queryLoading,
    error,
    stats,
    refetch: fetchRestaurants
  };
};
