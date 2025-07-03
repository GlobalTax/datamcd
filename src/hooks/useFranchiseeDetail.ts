
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Franchisee } from '@/types/auth';
import { FranchiseeRestaurant } from '@/types/franchiseeRestaurant';
import { toast } from 'sonner';

export const useFranchiseeDetail = (franchiseeId?: string) => {
  const [franchisee, setFranchisee] = useState<Franchisee | null>(null);
  const [restaurants, setRestaurants] = useState<FranchiseeRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFranchiseeDetail = async () => {
    if (!franchiseeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching franchisee detail for ID:', franchiseeId);

      // Obtener el franquiciado con información del perfil del usuario
      const { data: franchiseeData, error: franchiseeError } = await supabase
        .from('franchisees')
        .select(`
          *,
          profiles:user_id(
            email,
            full_name,
            phone
          )
        `)
        .eq('id', franchiseeId)
        .maybeSingle();

      if (franchiseeError) {
        console.error('Error fetching franchisee:', franchiseeError);
        setError(`Error al cargar el franquiciado: ${franchiseeError.message}`);
        return;
      }

      if (!franchiseeData) {
        console.error('Franchisee not found for ID:', franchiseeId);
        setError('Franquiciado no encontrado');
        return;
      }

      // Obtener los restaurantes vinculados
      const { data: restaurantsData, error: restaurantsError } = await supabase
        .from('franchisee_restaurants')
        .select(`
          *,
          base_restaurant:base_restaurants(*)
        `)
        .eq('franchisee_id', franchiseeId)
        .order('assigned_at', { ascending: false });

      if (restaurantsError) {
        console.error('Error fetching restaurants:', restaurantsError);
        setError(`Error al cargar los restaurantes: ${restaurantsError.message}`);
        return;
      }

      console.log('Franchisee data loaded:', franchiseeData);
      console.log('Restaurants data loaded:', restaurantsData);

      setFranchisee(franchiseeData);
      setRestaurants(restaurantsData || []);

    } catch (error) {
      console.error('Error in fetchFranchiseeDetail:', error);
      setError('Error inesperado al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFranchiseeDetail();
  }, [franchiseeId]);

  return {
    franchisee,
    restaurants,
    loading,
    error,
    refetch: fetchFranchiseeDetail
  };
};
