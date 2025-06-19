
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStaticData } from './useStaticData';
import { User, Franchisee } from '@/types/auth';

export const useOptimizedAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [franchisee, setFranchisee] = useState<Franchisee | null>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'fallback'>('connecting');
  const { getFranchiseeData, getRestaurantsData, isUsingCache } = useStaticData();

  const quickTimeout = (promise: Promise<any>, timeoutMs: number = 3000) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  };

  const tryQuickProfile = async (userId: string): Promise<any> => {
    try {
      console.log('useOptimizedAuth - Trying quick profile fetch');
      
      const profilePromise = supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('id', userId)
        .single()
        .then(response => response);

      const profile = await quickTimeout(profilePromise, 2000);
      
      if (profile.data) {
        console.log('useOptimizedAuth - Quick profile loaded successfully');
        setConnectionStatus('connected');
        return profile.data;
      }
      throw new Error('No profile data');
    } catch (error) {
      console.log('useOptimizedAuth - Quick profile failed:', error);
      throw error;
    }
  };

  const tryQuickFranchisee = async (userId: string): Promise<any> => {
    try {
      console.log('useOptimizedAuth - Trying quick franchisee fetch');
      
      const franchiseePromise = supabase
        .from('franchisees')
        .select('id, user_id, franchisee_name, company_name, total_restaurants')
        .eq('user_id', userId)
        .single()
        .then(response => response);

      const franchisee = await quickTimeout(franchiseePromise, 2000);
      
      if (franchisee.data) {
        console.log('useOptimizedAuth - Quick franchisee loaded successfully');
        return franchisee.data;
      }
      throw new Error('No franchisee data');
    } catch (error) {
      console.log('useOptimizedAuth - Quick franchisee failed:', error);
      throw error;
    }
  };

  const tryQuickRestaurants = async (franchiseeId: string): Promise<any[]> => {
    try {
      console.log('useOptimizedAuth - Trying quick restaurants fetch');
      
      const restaurantsPromise = supabase
        .from('franchisee_restaurants')
        .select(`
          id,
          monthly_rent,
          last_year_revenue,
          status,
          base_restaurant:base_restaurants!inner(
            id,
            site_number,
            restaurant_name,
            address,
            city,
            restaurant_type
          )
        `)
        .eq('franchisee_id', franchiseeId)
        .eq('status', 'active')
        .limit(10)
        .then(response => response);

      const restaurants = await quickTimeout(restaurantsPromise, 3000);
      
      if (restaurants.data) {
        console.log('useOptimizedAuth - Quick restaurants loaded successfully');
        return restaurants.data;
      }
      return [];
    } catch (error) {
      console.log('useOptimizedAuth - Quick restaurants failed:', error);
      return [];
    }
  };

  useEffect(() => {
    const initOptimizedAuth = async () => {
      try {
        console.log('useOptimizedAuth - Starting optimized initialization');
        setConnectionStatus('connecting');
        
        // Verificar sesión actual rápidamente
        const { data: { session } } = await quickTimeout(
          supabase.auth.getSession(), 
          1000
        );
        
        if (session?.user) {
          console.log('useOptimizedAuth - Session found, attempting quick data load');
          
          // Crear usuario básico inmediatamente
          const userData: User = {
            id: session.user.id,
            email: session.user.email || 'usuario@ejemplo.com',
            role: 'franchisee',
            full_name: session.user.user_metadata?.full_name || 'Usuario',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          setUser(userData);

          // Intentar carga rápida en paralelo
          try {
            const [profileResult, franchiseeResult] = await Promise.allSettled([
              tryQuickProfile(session.user.id),
              tryQuickFranchisee(session.user.id)
            ]);

            if (profileResult.status === 'fulfilled') {
              setUser(profileResult.value);
            }

            if (franchiseeResult.status === 'fulfilled') {
              setFranchisee(franchiseeResult.value);
              
              // Intentar cargar restaurantes si el franquiciado se cargó exitosamente
              const restaurantsData = await tryQuickRestaurants(franchiseeResult.value.id);
              setRestaurants(restaurantsData);
              
              if (restaurantsData.length > 0) {
                console.log('useOptimizedAuth - All real data loaded successfully');
                setConnectionStatus('connected');
                setLoading(false);
                return;
              }
            }

            // Si llegamos aquí, algo falló - usar fallback
            console.log('useOptimizedAuth - Some data failed, using fallback');
            setConnectionStatus('fallback');
            
          } catch (error) {
            console.log('useOptimizedAuth - Real data load failed, using fallback');
            setConnectionStatus('fallback');
          }

          // Fallback con datos estáticos
          const fallbackFranchisee = await getFranchiseeData(session.user.id);
          setFranchisee(fallbackFranchisee);
          
          const fallbackRestaurants = await getRestaurantsData(fallbackFranchisee.id);
          setRestaurants(fallbackRestaurants);
          
        } else {
          console.log('useOptimizedAuth - No session, using demo data');
          setConnectionStatus('fallback');
          
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
        console.error('useOptimizedAuth - Critical error:', error);
        setConnectionStatus('fallback');
        
        // Fallback completo
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
        console.log('useOptimizedAuth - Auth state changed:', event);
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setFranchisee(null);
          setRestaurants([]);
          setConnectionStatus('connecting');
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
    connectionStatus,
    isUsingCache: connectionStatus === 'fallback' || isUsingCache
  };
};
