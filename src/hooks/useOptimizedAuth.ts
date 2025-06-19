
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

  const quickTimeout = (promise: Promise<any>, timeoutMs: number = 8000) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  };

  const tryRealProfile = async (userId: string): Promise<any> => {
    try {
      console.log('useOptimizedAuth - Fetching real profile data');
      
      const profileQuery = supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('id', userId)
        .single();

      const { data: profile, error } = await quickTimeout(profileQuery, 5000);

      if (error) {
        console.error('useOptimizedAuth - Profile error:', error);
        throw error;
      }
      
      if (profile) {
        console.log('useOptimizedAuth - Real profile loaded successfully:', profile);
        return profile;
      }
      throw new Error('No profile data');
    } catch (error) {
      console.log('useOptimizedAuth - Profile fetch failed:', error);
      throw error;
    }
  };

  const tryRealFranchisee = async (userId: string): Promise<any> => {
    try {
      console.log('useOptimizedAuth - Fetching real franchisee data');
      
      const franchiseeQuery = supabase
        .from('franchisees')
        .select('id, user_id, franchisee_name, company_name, total_restaurants')
        .eq('user_id', userId)
        .single();

      const { data: franchisee, error } = await quickTimeout(franchiseeQuery, 5000);

      if (error) {
        console.error('useOptimizedAuth - Franchisee error:', error);
        throw error;
      }
      
      if (franchisee) {
        console.log('useOptimizedAuth - Real franchisee loaded successfully:', franchisee);
        return franchisee;
      }
      throw new Error('No franchisee data');
    } catch (error) {
      console.log('useOptimizedAuth - Franchisee fetch failed:', error);
      throw error;
    }
  };

  const tryRealRestaurants = async (franchiseeId: string): Promise<any[]> => {
    try {
      console.log('useOptimizedAuth - Fetching real restaurants data');
      
      const restaurantsQuery = supabase
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
        .limit(20);

      const { data: restaurants, error } = await quickTimeout(restaurantsQuery, 8000);

      if (error) {
        console.error('useOptimizedAuth - Restaurants error:', error);
        throw error;
      }
      
      console.log('useOptimizedAuth - Real restaurants loaded successfully:', restaurants?.length || 0);
      return restaurants || [];
    } catch (error) {
      console.log('useOptimizedAuth - Restaurants fetch failed:', error);
      return [];
    }
  };

  useEffect(() => {
    const initOptimizedAuth = async () => {
      try {
        console.log('useOptimizedAuth - Starting REAL data initialization');
        setConnectionStatus('connecting');
        
        // Verificar sesión actual
        const sessionQuery = supabase.auth.getSession();
        const { data: { session }, error: sessionError } = await quickTimeout(sessionQuery, 3000);
        
        if (sessionError) {
          console.error('useOptimizedAuth - Session error:', sessionError);
          throw sessionError;
        }
        
        if (session?.user) {
          console.log('useOptimizedAuth - Session found, loading REAL data for user:', session.user.id);
          
          try {
            // Intentar cargar perfil real
            const realProfile = await tryRealProfile(session.user.id);
            
            // Crear usuario con datos reales
            const userData: User = {
              id: realProfile.id,
              email: realProfile.email,
              role: realProfile.role,
              full_name: realProfile.full_name,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            setUser(userData);
            console.log('useOptimizedAuth - Real user data set');

            // Si es franchisee, cargar datos del franquiciado
            if (realProfile.role === 'franchisee') {
              try {
                const realFranchisee = await tryRealFranchisee(session.user.id);
                setFranchisee(realFranchisee);
                console.log('useOptimizedAuth - Real franchisee data set');
                
                // Cargar restaurantes reales
                const realRestaurants = await tryRealRestaurants(realFranchisee.id);
                setRestaurants(realRestaurants);
                console.log('useOptimizedAuth - Real restaurants data set:', realRestaurants.length);
                
                setConnectionStatus('connected');
                console.log('useOptimizedAuth - ALL REAL DATA LOADED SUCCESSFULLY');
                setLoading(false);
                return;
                
              } catch (franchiseeError) {
                console.log('useOptimizedAuth - Franchisee not found, this user may not be a franchisee yet');
                setConnectionStatus('connected'); // Usuario existe pero no es franquiciado
                setLoading(false);
                return;
              }
            } else {
              // Usuario no es franchisee
              setConnectionStatus('connected');
              setLoading(false);
              return;
            }
            
          } catch (profileError) {
            console.log('useOptimizedAuth - Profile not found, user may need profile creation');
            throw profileError;
          }
          
        } else {
          console.log('useOptimizedAuth - No session found');
          throw new Error('No session');
        }
        
      } catch (error) {
        console.error('useOptimizedAuth - Failed to load real data, using fallback:', error);
        setConnectionStatus('fallback');
        
        // Solo usar fallback si falla completamente
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
        } else if (event === 'SIGNED_IN' && session?.user) {
          // Recargar datos cuando el usuario se conecte
          setLoading(true);
          initOptimizedAuth();
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
