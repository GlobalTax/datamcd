
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, AuthState, User, Franchisee, Restaurant } from '@/types/auth';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    franchisee: null,
    restaurants: [],
    loading: true
  });

  const clearUserData = useCallback(() => {
    setState(prev => ({
      ...prev,
      user: null,
      franchisee: null,
      restaurants: []
    }));
  }, []);

  const fetchUserData = useCallback(async (userId: string): Promise<void> => {
    try {
      console.log('Fetching user data for:', userId);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      const user: User = {
        id: profileData.id,
        email: profileData.email,
        full_name: profileData.full_name,
        role: profileData.role,
        phone: profileData.phone,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at
      };

      // If user is franchisee, fetch franchisee data and restaurants
      if (user.role === 'franchisee') {
        const { data: franchiseeData, error: franchiseeError } = await supabase
          .from('franchisees')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (franchiseeError) {
          console.error('Error fetching franchisee:', franchiseeError);
        }

        const franchisee: Franchisee | null = franchiseeData ? {
          id: franchiseeData.id,
          user_id: franchiseeData.user_id,
          franchisee_name: franchiseeData.franchisee_name,
          company_name: franchiseeData.company_name,
          tax_id: franchiseeData.tax_id,
          address: franchiseeData.address,
          city: franchiseeData.city,
          state: franchiseeData.state,
          postal_code: franchiseeData.postal_code,
          country: franchiseeData.country,
          created_at: franchiseeData.created_at,
          updated_at: franchiseeData.updated_at,
          total_restaurants: franchiseeData.total_restaurants
        } : null;

        // Fetch restaurants
        let restaurants: Restaurant[] = [];
        if (franchisee) {
          const { data: restaurantData, error: restaurantError } = await supabase
            .from('franchisee_restaurants')
            .select(`
              *,
              base_restaurant:base_restaurants(*)
            `)
            .eq('franchisee_id', franchisee.id);

          if (restaurantError) {
            console.error('Error fetching restaurants:', restaurantError);
          } else if (restaurantData) {
            restaurants = restaurantData
              .filter(item => item.base_restaurant)
              .map(item => ({
                id: item.base_restaurant.id,
                franchisee_id: item.franchisee_id,
                site_number: item.base_restaurant.site_number,
                restaurant_name: item.base_restaurant.restaurant_name,
                address: item.base_restaurant.address,
                city: item.base_restaurant.city,
                state: item.base_restaurant.state,
                postal_code: item.base_restaurant.postal_code,
                country: item.base_restaurant.country,
                opening_date: item.base_restaurant.opening_date,
                restaurant_type: item.base_restaurant.restaurant_type,
                status: item.status || 'active',
                square_meters: item.base_restaurant.square_meters,
                seating_capacity: item.base_restaurant.seating_capacity,
                created_at: item.base_restaurant.created_at,
                updated_at: item.base_restaurant.updated_at
              }));
          }
        }

        setState(prev => ({
          ...prev,
          user,
          franchisee,
          restaurants,
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          user,
          franchisee: null,
          restaurants: [],
          loading: false
        }));
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const refreshData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchUserData(session.user.id);
    }
  }, [fetchUserData]);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('Attempting login for:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        toast.error(error.message);
        return { error: error.message };
      } else {
        console.log('Login successful');
        toast.success('Sesión iniciada correctamente');
        return {};
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast.error('Error inesperado al iniciar sesión');
      return { error: 'Error inesperado al iniciar sesión' };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return { error: error.message };
      } else {
        toast.success('Cuenta creada correctamente. Revisa tu email para confirmar tu cuenta.');
        return {};
      }
    } catch (error) {
      console.error('Unexpected signup error:', error);
      toast.error('Error inesperado al crear cuenta');
      return { error: 'Error inesperado al crear cuenta' };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      console.log('Starting logout process');
      
      clearUserData();
      setState(prev => ({ ...prev, session: null }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        if (!error.message.includes('Session not found')) {
          toast.error(error.message);
        }
      } else {
        console.log('Logout successful');
        toast.success('Sesión cerrada correctamente');
      }
    } catch (error) {
      console.error('Unexpected logout error:', error);
      clearUserData();
      setState(prev => ({ ...prev, session: null }));
    }
  }, [clearUserData]);

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        setState(prev => ({ ...prev, session }));
        
        if (session?.user) {
          await fetchUserData(session.user.id);
        } else {
          clearUserData();
          setState(prev => ({ ...prev, loading: false }));
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setState(prev => ({ ...prev, session }));
      
      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserData, clearUserData]);

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    refreshData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
