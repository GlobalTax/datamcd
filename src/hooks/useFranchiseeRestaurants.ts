
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { FranchiseeRestaurant } from '@/types/franchiseeRestaurant';
import { toast } from 'sonner';

export const useFranchiseeRestaurants = (franchiseeId?: string) => {
  const { user, franchisee, restaurants: authRestaurants } = useUnifiedAuth();
  const [restaurants, setRestaurants] = useState<FranchiseeRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = async () => {
    console.log('useFranchiseeRestaurants - fetchRestaurants started');
    console.log('useFranchiseeRestaurants - User:', user ? { id: user.id, role: user.role } : null);
    console.log('useFranchiseeRestaurants - Franchisee ID param:', franchiseeId);
    console.log('useFranchiseeRestaurants - Context Franchisee:', franchisee ? { id: franchisee.id, name: franchisee.franchisee_name } : null);
    
    try {
      if (!user) {
        console.log('useFranchiseeRestaurants - No user found');
        setRestaurants([]);
        setError(null);
        setLoading(false);
        return;
      }

      // Determinar qué franquiciado usar: el parámetro o el del contexto
      const targetFranchiseeId = franchiseeId || franchisee?.id;
      const targetFranchisee = franchiseeId ? null : franchisee; // Si viene por parámetro, no tenemos el objeto completo
      
      if (!targetFranchiseeId) {
        console.log('useFranchiseeRestaurants - No franchisee ID available');
        setRestaurants([]);
        setError('No se encontró información del franquiciado');
        setLoading(false);
        return;
      }

      // Si es un franquiciado temporal, crear datos de prueba para desarrollo
      if (targetFranchiseeId.startsWith('temp-')) {
        console.log('useFranchiseeRestaurants - Temporary franchisee detected, using mock data');
        
        // Crear datos de prueba para franquiciados temporales
        const mockRestaurants: FranchiseeRestaurant[] = [
          {
            id: 'mock-1',
            franchisee_id: targetFranchiseeId,
            base_restaurant_id: 'mock-base-1',
            status: 'active',
            assigned_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            base_restaurant: {
              id: 'mock-base-1',
              site_number: '001',
              restaurant_name: 'McDonald\'s Test 1',
              address: 'Calle Principal 123',
              city: 'Madrid',
              state: 'Madrid',
              postal_code: '28001',
              country: 'España',
              restaurant_type: 'traditional',
              square_meters: 200,
              seating_capacity: 80,
              franchisee_name: targetFranchisee?.franchisee_name || 'Franquiciado Test',
              franchisee_email: user?.email || '',
              company_tax_id: 'B12345678',
              opening_date: '2020-01-01',
              property_type: 'owned',
              autonomous_community: 'Madrid',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: user?.id || null
            }
          },
          {
            id: 'mock-2',
            franchisee_id: targetFranchiseeId,
            base_restaurant_id: 'mock-base-2',
            status: 'active',
            assigned_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            base_restaurant: {
              id: 'mock-base-2',
              site_number: '002',
              restaurant_name: 'McDonald\'s Test 2',
              address: 'Avenida de la Paz 456',
              city: 'Barcelona',
              state: 'Cataluña',
              postal_code: '08001',
              country: 'España',
              restaurant_type: 'traditional',
              square_meters: 180,
              seating_capacity: 75,
              franchisee_name: targetFranchisee?.franchisee_name || 'Franquiciado Test',
              franchisee_email: user?.email || '',
              company_tax_id: 'B12345678',
              opening_date: '2021-03-15',
              property_type: 'leased',
              autonomous_community: 'Cataluña',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: user?.id || null
            }
          }
        ];
        
        console.log('useFranchiseeRestaurants - Setting mock restaurants:', mockRestaurants.length);
        setRestaurants(mockRestaurants);
        toast.success(`Se cargaron ${mockRestaurants.length} restaurantes de prueba`);
        
        setError(null);
        setLoading(false);
        return;
      }

      // Para franquiciados reales, consultar la base de datos
      setLoading(true);
      setError(null);

      console.log('useFranchiseeRestaurants - Fetching restaurants for franchisee:', targetFranchiseeId);

      const { data, error } = await supabase
        .from('franchisee_restaurants')
        .select(`
          *,
          base_restaurant:base_restaurant_id (
            id,
            site_number,
            restaurant_name,
            address,
            city,
            state,
            postal_code,
            country,
            restaurant_type,
            square_meters,
            seating_capacity,
            franchisee_name,
            franchisee_email,
            company_tax_id,
            opening_date,
            property_type,
            autonomous_community,
            created_at,
            updated_at,
            created_by
          )
        `)
        .eq('franchisee_id', targetFranchiseeId)
        .eq('status', 'active');

      console.log('useFranchiseeRestaurants - Query result:', { data: data?.length || 0, error });

      if (error) {
        console.error('Error fetching restaurants:', error);
        setError(`Error al cargar restaurantes: ${error.message}`);
        setRestaurants([]);
        toast.error('Error al cargar restaurantes: ' + error.message);
        return;
      }

      const validRestaurants = Array.isArray(data) ? data : [];
      console.log('useFranchiseeRestaurants - Setting restaurants:', validRestaurants.length);
      setRestaurants(validRestaurants);
      
      if (validRestaurants.length === 0) {
        console.log('useFranchiseeRestaurants - No restaurants found for franchisee');
        toast.info('No se encontraron restaurantes asignados');
      } else {
        console.log(`useFranchiseeRestaurants - Found ${validRestaurants.length} restaurants`);
        toast.success(`Se cargaron ${validRestaurants.length} restaurantes`);
      }
    } catch (err) {
      console.error('Error in fetchRestaurants:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar los restaurantes';
      setError(errorMessage);
      setRestaurants([]);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useFranchiseeRestaurants - useEffect triggered');
    fetchRestaurants();
  }, [user?.id, franchisee?.id, franchiseeId]);

  return {
    restaurants,
    loading,
    error,
    refetch: fetchRestaurants
  };
};
