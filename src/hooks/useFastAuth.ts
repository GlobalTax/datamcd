
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStaticData } from './useStaticData';
import { User, Franchisee } from '@/types/auth';

export const useFastAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [franchisee, setFranchisee] = useState<Franchisee | null>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getFranchiseeData, getRestaurantsData, isUsingCache } = useStaticData();
  
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('useFastAuth - Starting real data initialization');
        
        // Verificar sesión actual
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('useFastAuth - Session found, fetching real data');
          
          // Crear usuario inmediatamente con datos de sesión
          const userData: User = {
            id: session.user.id,
            email: session.user.email || 'usuario@ejemplo.com',
            role: 'franchisee',
            full_name: session.user.user_metadata?.full_name || 'Usuario',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          setUser(userData);
          
          try {
            // Intentar obtener datos reales del franquiciado con timeout más largo
            console.log('useFastAuth - Attempting to fetch real franchisee data');
            const { data: franchiseeData, error: franchiseeError } = await Promise.race([
              supabase
                .from('franchisees')
                .select('*')
                .eq('user_id', session.user.id)
                .maybeSingle(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Franchisee timeout')), 10000)
              )
            ]) as any;
            
            if (franchiseeData && !franchiseeError) {
              console.log('useFastAuth - Real franchisee data loaded successfully');
              setFranchisee(franchiseeData);
              
              try {
                // Intentar obtener restaurantes reales
                console.log('useFastAuth - Attempting to fetch real restaurants data');
                const { data: restaurantsData, error: restaurantsError } = await Promise.race([
                  supabase
                    .from('franchisee_restaurants')
                    .select(`
                      *,
                      base_restaurant:base_restaurants(*)
                    `)
                    .eq('franchisee_id', franchiseeData.id)
                    .eq('status', 'active'),
                  new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Restaurants timeout')), 10000)
                  )
                ]) as any;
                
                if (restaurantsData && !restaurantsError && restaurantsData.length > 0) {
                  console.log('useFastAuth - Real restaurants data loaded successfully');
                  setRestaurants(restaurantsData);
                } else {
                  console.log('useFastAuth - No real restaurants found, using fallback');
                  const fallbackRestaurants = await getRestaurantsData(franchiseeData.id);
                  setRestaurants(fallbackRestaurants);
                }
              } catch (error) {
                console.log('useFastAuth - Error loading restaurants, using fallback');
                const fallbackRestaurants = await getRestaurantsData(franchiseeData.id);
                setRestaurants(fallbackRestaurants);
              }
            } else {
              console.log('useFastAuth - No real franchisee found, using fallback');
              const fallbackFranchisee = await getFranchiseeData(session.user.id);
              setFranchisee(fallbackFranchisee);
              
              const fallbackRestaurants = await getRestaurantsData(fallbackFranchisee.id);
              setRestaurants(fallbackRestaurants);
            }
          } catch (error) {
            console.log('useFastAuth - Error loading franchisee, using fallback');
            const fallbackFranchisee = await getFranchiseeData(session.user.id);
            setFranchisee(fallbackFranchisee);
            
            const fallbackRestaurants = await getRestaurantsData(fallbackFranchisee.id);
            setRestaurants(fallbackRestaurants);
          }
        } else {
          console.log('useFastAuth - No session found, using demo data');
          // Solo usar datos demo si no hay sesión
          const demoUser: User = {
            id: 'demo-user',
            email: 'demo@ejemplo.com',
            role: 'franchisee',
            full_name: 'Usuario Demo',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          setUser(demoUser);
          
          const demoFranchisee = await getFranchiseeData('demo-user');
          setFranchisee(demoFranchisee);
          
          const demoRestaurants = await getRestaurantsData(demoFranchisee.id);
          setRestaurants(demoRestaurants);
        }
        
      } catch (error) {
        console.error('useFastAuth - Critical error, using complete fallback:', error);
        
        // Solo en caso de error crítico usar fallback completo
        const fallbackUser: User = {
          id: 'fallback-user',
          email: 'fallback@ejemplo.com',
          role: 'franchisee',
          full_name: 'Usuario Fallback',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setUser(fallbackUser);
        
        const fallbackFranchisee = await getFranchiseeData('fallback-user');
        setFranchisee(fallbackFranchisee);
        
        const fallbackRestaurants = await getRestaurantsData(fallbackFranchisee.id);
        setRestaurants(fallbackRestaurants);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
    
    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useFastAuth - Auth state changed:', event);
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setFranchisee(null);
          setRestaurants([]);
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  return {
    user,
    franchisee,
    restaurants,
    loading,
    isUsingCache
  };
};
