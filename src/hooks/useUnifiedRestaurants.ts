import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { BaseRestaurant, FranchiseeRestaurant } from '@/types/franchiseeRestaurant';
import { toast } from 'sonner';

export interface UnifiedRestaurant extends BaseRestaurant {
  assignment?: {
    id: string;
    franchisee_id: string;
    franchise_start_date?: string;
    franchise_end_date?: string;
    monthly_rent?: number;
    last_year_revenue?: number;
    average_monthly_sales?: number;
    status?: string;
    assigned_at: string;
  };
  franchisee_info?: {
    id: string;
    franchisee_name: string;
    company_name?: string;
    city?: string;
    state?: string;
  };
  isAssigned: boolean;
}

export const useUnifiedRestaurants = () => {
  const { user } = useUnifiedAuth();
  const [restaurants, setRestaurants] = useState<UnifiedRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnifiedRestaurants = async () => {
    if (!user || !['asesor', 'admin', 'superadmin'].includes(user.role)) {
      console.log('User role not authorized for unified restaurants:', user?.role);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching unified restaurants for user:', user.id, 'with role:', user.role);

      // Obtener todos los restaurantes base
      const { data: baseRestaurants, error: baseError } = await supabase
        .from('base_restaurants')
        .select('*')
        .order('created_at', { ascending: false });

      if (baseError) {
        console.error('Error fetching base restaurants:', baseError);
        setError(baseError.message);
        return;
      }

      // Obtener todas las asignaciones con información del franquiciado
      const { data: assignments, error: assignmentError } = await supabase
        .from('franchisee_restaurants')
        .select(`
          *,
          franchisee:franchisee_id (
            id,
            franchisee_name,
            company_name,
            city,
            state
          )
        `)
        .eq('status', 'active');

      if (assignmentError) {
        console.error('Error fetching restaurant assignments:', assignmentError);
        // Continuar sin asignaciones si hay error
      }

      // Combinar los datos
      const unifiedRestaurants: UnifiedRestaurant[] = (baseRestaurants || []).map(restaurant => {
        const assignment = assignments?.find(a => a.base_restaurant_id === restaurant.id);
        
        return {
          ...restaurant,
          assignment: assignment ? {
            id: assignment.id,
            franchisee_id: assignment.franchisee_id,
            franchise_start_date: assignment.franchise_start_date,
            franchise_end_date: assignment.franchise_end_date,
            monthly_rent: assignment.monthly_rent,
            last_year_revenue: assignment.last_year_revenue,
            average_monthly_sales: assignment.average_monthly_sales,
            status: assignment.status,
            assigned_at: assignment.assigned_at
          } : undefined,
          franchisee_info: assignment?.franchisee ? {
            id: assignment.franchisee.id,
            franchisee_name: assignment.franchisee.franchisee_name,
            company_name: assignment.franchisee.company_name,
            city: assignment.franchisee.city,
            state: assignment.franchisee.state
          } : undefined,
          isAssigned: !!assignment
        };
      });

      console.log('Successfully unified restaurants:', unifiedRestaurants.length, 'total');
      console.log('Assigned restaurants:', unifiedRestaurants.filter(r => r.isAssigned).length);
      console.log('Available restaurants:', unifiedRestaurants.filter(r => !r.isAssigned).length);
      
      setRestaurants(unifiedRestaurants);
    } catch (err) {
      console.error('Error in fetchUnifiedRestaurants:', err);
      setError('Error al cargar los restaurantes');
      toast.error('Error al cargar los restaurantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useUnifiedRestaurants useEffect triggered, user:', user?.id, 'role:', user?.role);
    fetchUnifiedRestaurants();
  }, [user?.id, user?.role]);

  return {
    restaurants,
    loading,
    error,
    refetch: fetchUnifiedRestaurants,
    stats: {
      total: restaurants.length,
      assigned: restaurants.filter(r => r.isAssigned).length,
      available: restaurants.filter(r => !r.isAssigned).length
    }
  };
};