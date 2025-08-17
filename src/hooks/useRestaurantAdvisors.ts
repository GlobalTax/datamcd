import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import type { AdvisorRestaurant, AdvisorAccessLevel } from '@/types/domains/restaurant/rbac';

/**
 * Hook para gestionar asesores asignados a un restaurante
 */
export const useRestaurantAdvisors = (restaurantId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [advisors, setAdvisors] = useState<AdvisorRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Obtener asesores del restaurante
   */
  const fetchAdvisors = useCallback(async () => {
    if (!restaurantId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('advisor_restaurant')
        .select(`
          id,
          advisor_user_id,
          restaurant_id,
          assigned_at,
          assigned_by,
          is_active,
          access_level,
          created_at,
          updated_at,
          advisor:profiles!advisor_user_id (
            id,
            email,
            full_name
          ),
          restaurant:franchisee_restaurants!restaurant_id (
            id,
            base_restaurants!base_restaurant_id (
              restaurant_name,
              site_number
            )
          )
        `)
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Formatear datos para el tipo esperado
      const formattedData = data?.map(item => ({
        ...item,
        access_level: item.access_level as AdvisorAccessLevel,
        restaurant: item.restaurant ? {
          id: item.restaurant.id,
          restaurant_name: item.restaurant.base_restaurants?.restaurant_name || '',
          site_number: item.restaurant.base_restaurants?.site_number || ''
        } : undefined
      })) || [];

      setAdvisors(formattedData);
    } catch (err) {
      console.error('Error fetching restaurant advisors:', err);
      setError(err as Error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los asesores del restaurante",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [restaurantId, toast]);

  /**
   * Asignar asesor al restaurante
   */
  const assignAdvisor = useCallback(async (
    advisorUserId: string,
    accessLevel: AdvisorAccessLevel = 'read'
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('advisor_restaurant')
        .insert({
          advisor_user_id: advisorUserId,
          restaurant_id: restaurantId,
          assigned_by: user.id,
          access_level: accessLevel
        });

      if (error) throw error;

      toast({
        title: "Asesor asignado",
        description: "El asesor ha sido asignado al restaurante exitosamente"
      });

      fetchAdvisors();
      return true;

    } catch (err) {
      console.error('Error assigning advisor:', err);
      toast({
        title: "Error",
        description: "No se pudo asignar el asesor al restaurante",
        variant: "destructive"
      });
      return false;
    }
  }, [user, restaurantId, fetchAdvisors, toast]);

  /**
   * Actualizar nivel de acceso del asesor
   */
  const updateAdvisorAccess = useCallback(async (
    advisorId: string,
    accessLevel: AdvisorAccessLevel
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('advisor_restaurant')
        .update({ access_level: accessLevel })
        .eq('id', advisorId);

      if (error) throw error;

      toast({
        title: "Acceso actualizado",
        description: "El nivel de acceso del asesor ha sido actualizado"
      });

      fetchAdvisors();
      return true;

    } catch (err) {
      console.error('Error updating advisor access:', err);
      toast({
        title: "Error",
        description: "No se pudo actualizar el acceso del asesor",
        variant: "destructive"
      });
      return false;
    }
  }, [fetchAdvisors, toast]);

  /**
   * Desasignar asesor del restaurante
   */
  const unassignAdvisor = useCallback(async (advisorId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('advisor_restaurant')
        .update({ is_active: false })
        .eq('id', advisorId);

      if (error) throw error;

      toast({
        title: "Asesor desasignado",
        description: "El asesor ha sido desasignado del restaurante"
      });

      fetchAdvisors();
      return true;

    } catch (err) {
      console.error('Error unassigning advisor:', err);
      toast({
        title: "Error",
        description: "No se pudo desasignar el asesor",
        variant: "destructive"
      });
      return false;
    }
  }, [fetchAdvisors, toast]);

  /**
   * Obtener asesores disponibles para asignar
   */
  const getAvailableAdvisors = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('role', 'asesor')
        .not('id', 'in', `(${advisors.map(a => a.advisor_user_id).join(',')})`);

      if (error) throw error;
      return data || [];

    } catch (err) {
      console.error('Error fetching available advisors:', err);
      return [];
    }
  }, [advisors]);

  useEffect(() => {
    fetchAdvisors();
  }, [fetchAdvisors]);

  return {
    advisors,
    loading,
    error,
    fetchAdvisors,
    assignAdvisor,
    updateAdvisorAccess,
    unassignAdvisor,
    getAvailableAdvisors,
    refetch: fetchAdvisors
  };
};