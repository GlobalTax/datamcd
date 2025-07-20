
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { Franchisee } from '@/types/auth';
import { toast } from 'sonner';

export const useAllFranchisees = () => {
  const { user } = useUnifiedAuth();
  const [franchisees, setFranchisees] = useState<Franchisee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllFranchisees = async () => {
    console.log('useAllFranchisees - Starting fetch for role:', user?.role);
    
    try {
      if (!user) {
        console.log('useAllFranchisees - No user found');
        setLoading(false);
        return;
      }

      if (!['admin', 'superadmin'].includes(user.role)) {
        console.log('useAllFranchisees - User role not authorized:', user.role);
        setError('No tienes permisos para ver los franquiciados');
        toast.error('No tienes permisos para ver los franquiciados');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      console.log('useAllFranchisees - Making Supabase query for all franchisees');
      
      const { data: franchiseesData, error: franchiseesError } = await supabase
        .from('franchisees')
        .select(`
          *,
          profiles:user_id(email, full_name, phone)
        `)
        .order('created_at', { ascending: false });

      if (franchiseesError) {
        console.error('Error fetching franchisees:', franchiseesError);
        setError(`Error al cargar los franquiciados: ${franchiseesError.message}`);
        toast.error('Error al cargar los franquiciados: ' + franchiseesError.message);
        setLoading(false);
        return;
      }

      // Obtener el conteo de restaurantes por franquiciado
      const { data: restaurantCounts, error: countError } = await supabase
        .from('franchisee_restaurants')
        .select('franchisee_id')
        .eq('status', 'active');

      if (countError) {
        console.error('Error fetching restaurant counts:', countError);
      }

      // Crear un mapa de conteos por franquiciado
      const countMap = new Map<string, number>();
      if (restaurantCounts) {
        restaurantCounts.forEach(restaurant => {
          if (restaurant.franchisee_id) {
            const currentCount = countMap.get(restaurant.franchisee_id) || 0;
            countMap.set(restaurant.franchisee_id, currentCount + 1);
          }
        });
      }

      // Agregar el conteo de restaurantes a cada franquiciado
      const franchiseesWithCounts = (franchiseesData || []).map(franchisee => ({
        ...franchisee,
        total_restaurants: countMap.get(franchisee.id) || 0
      }));

      console.log('useAllFranchisees - Setting franchisees data with restaurant counts:', franchiseesWithCounts.length);
      setFranchisees(franchiseesWithCounts);
      
      if (!franchiseesWithCounts || franchiseesWithCounts.length === 0) {
        console.log('useAllFranchisees - No franchisees found in database');
        toast.info('No se encontraron franquiciados');
      } else {
        console.log(`useAllFranchisees - Found ${franchiseesWithCounts.length} franchisees`);
        toast.success(`Se cargaron ${franchiseesWithCounts.length} franquiciados`);
      }
    } catch (err) {
      console.error('Error in fetchAllFranchisees:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar los franquiciados';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useAllFranchisees useEffect triggered, user:', user);
    fetchAllFranchisees();
  }, [user?.id, user?.role]);

  return {
    franchisees,
    loading,
    error,
    refetch: fetchAllFranchisees
  };
};
