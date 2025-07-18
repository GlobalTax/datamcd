
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStaticData } from './useStaticData';
import { useOptimizedUserDataFetcher } from './auth/useOptimizedUserDataFetcher';
import { User, Franchisee } from '@/types/auth';

export const useOptimizedFastAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [franchisee, setFranchisee] = useState<Franchisee | null>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getFranchiseeData, getRestaurantsData, isUsingCache } = useStaticData();
  const { fetchUserData } = useOptimizedUserDataFetcher();
  
  useEffect(() => {
    const initOptimizedAuth = async () => {
      try {
        console.log('useOptimizedFastAuth - Starting optimized auth initialization');
        
        // Verificar sesión actual
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('useOptimizedFastAuth - Session found, using optimized data fetching');
          
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
            // Usar los nuevos fetchers optimizados
            console.log('useOptimizedFastAuth - Attempting optimized real data fetch');
            const optimizedUserData = await fetchUserData(session.user.id);
            
            if (optimizedUserData.franchisee && !optimizedUserData.franchisee.id.startsWith('temp-')) {
              console.log('useOptimizedFastAuth - Optimized real data loaded successfully');
              setUser(optimizedUserData);
              setFranchisee(optimizedUserData.franchisee);
              setRestaurants(optimizedUserData.restaurants);
            } else {
              console.log('useOptimizedFastAuth - Using fallback data with optimized structure');
              const fallbackFranchisee = await getFranchiseeData(session.user.id);
              setFranchisee(fallbackFranchisee);
              
              const fallbackRestaurants = await getRestaurantsData(fallbackFranchisee.id);
              setRestaurants(fallbackRestaurants);
            }
          } catch (error) {
            console.log('useOptimizedFastAuth - Error with optimized fetch, using fallback');
            const fallbackFranchisee = await getFranchiseeData(session.user.id);
            setFranchisee(fallbackFranchisee);
            
            const fallbackRestaurants = await getRestaurantsData(fallbackFranchisee.id);
            setRestaurants(fallbackRestaurants);
          }
        } else {
          console.log('useOptimizedFastAuth - No session found, using demo data');
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
        console.error('useOptimizedFastAuth - Critical error:', error);
        
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
    
    initOptimizedAuth();
    
    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useOptimizedFastAuth - Auth state changed:', event);
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
