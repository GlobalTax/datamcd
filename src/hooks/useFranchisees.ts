import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Franchisee } from '@/types/auth';
import { toast } from 'sonner';

export const useFranchisees = () => {
  const { user } = useAuth();
  const [franchisees, setFranchisees] = useState<Franchisee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFranchisees = async () => {
    console.log('fetchFranchisees - Starting fetch, user:', user);
    
    if (!user) {
      console.log('fetchFranchisees - No user found');
      setLoading(false);
      return;
    }

    if (user.role !== 'asesor' && user.role !== 'admin' && user.role !== 'superadmin') {
      console.log('fetchFranchisees - User role is not authorized:', user.role);
      setError('No tienes permisos para ver los franquiciados');
      toast.error('No tienes permisos para ver los franquiciados');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('fetchFranchisees - Making Supabase query for franchisees');
      
      const { data: franchiseesData, error: franchiseesError } = await supabase
        .from('franchisees')
        .select(`
          *,
          profiles:user_id(email, full_name)
        `)
        .order('created_at', { ascending: false });

      if (franchiseesError) {
        console.error('Error fetching franchisees:', franchiseesError);
        setError(`Error al cargar los franquiciados: ${franchiseesError.message}`);
        toast.error('Error al cargar los franquiciados: ' + franchiseesError.message);
        setLoading(false);
        return;
      }

      console.log('fetchFranchisees - Getting restaurant counts from base_restaurants');
      
      // Obtener el conteo de restaurantes por franquiciado desde base_restaurants
      const { data: restaurantCounts, error: countError } = await supabase
        .from('base_restaurants')
        .select('franchisee_name')
        .not('franchisee_name', 'is', null);

      if (countError) {
        console.error('Error fetching restaurant counts:', countError);
      }

      // Crear un mapa de conteos por nombre de franquiciado
      const countMap = new Map<string, number>();
      if (restaurantCounts) {
        restaurantCounts.forEach(restaurant => {
          if (restaurant.franchisee_name) {
            const currentCount = countMap.get(restaurant.franchisee_name) || 0;
            countMap.set(restaurant.franchisee_name, currentCount + 1);
          }
        });
      }

      // Agregar el conteo de restaurantes a cada franquiciado
      const franchiseesWithCounts = (franchiseesData || []).map(franchisee => ({
        ...franchisee,
        total_restaurants: countMap.get(franchisee.franchisee_name) || 0
      }));

      console.log('fetchFranchisees - Setting franchisees data with restaurant counts:', franchiseesWithCounts);
      setFranchisees(franchiseesWithCounts);
      
      if (!franchiseesWithCounts || franchiseesWithCounts.length === 0) {
        console.log('fetchFranchisees - No franchisees found in database');
        toast.info('No se encontraron franquiciados');
      } else {
        console.log(`fetchFranchisees - Found ${franchiseesWithCounts.length} franchisees`);
        toast.success(`Se cargaron ${franchiseesWithCounts.length} franquiciados`);
      }
    } catch (err) {
      console.error('Error in fetchFranchisees:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar los franquiciados';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const assignRestaurant = async (franchiseeId: string, baseRestaurantId: string) => {
    try {
      const { error } = await supabase
        .from('franchisee_restaurants')
        .insert({
          franchisee_id: franchiseeId,
          base_restaurant_id: baseRestaurantId,
          status: 'active'
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Este restaurante ya está asignado a este franquiciado');
        } else {
          toast.error('Error al asignar el restaurante');
        }
        return false;
      }

      toast.success('Restaurante asignado correctamente');
      return true;
    } catch (err) {
      console.error('Error assigning restaurant:', err);
      toast.error('Error al asignar el restaurante');
      return false;
    }
  };

  useEffect(() => {
    console.log('useFranchisees useEffect triggered, user:', user);
    fetchFranchisees();
  }, [user?.id, user?.role]);

  return {
    franchisees,
    loading,
    error,
    refetch: fetchFranchisees,
    assignRestaurant
  };
};
