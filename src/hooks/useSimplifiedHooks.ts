// Hooks simplificados que eliminan todas las verificaciones de role
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/AuthProvider';

// Hook para baseRestaurants sin verificación de roles
export const useSimplifiedBaseRestaurants = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('base_restaurants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching base restaurants:', error);
        setError(error.message);
      } else {
        setRestaurants(data || []);
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [user]);

  return {
    restaurants,
    loading,
    error,
    refetch: fetchRestaurants,
    userRole: 'superadmin' // Simplificado
  };
};

// Hook para franchiseeRestaurants sin verificación de roles
export const useSimplifiedFranchiseeRestaurants = () => {
  const { user, franchisee } = useAuth();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('franchisee_restaurants')
        .select(`
          *,
          base_restaurant:base_restaurants(*)
        `)
        .eq('status', 'active');

      if (franchisee) {
        query = query.eq('franchisee_id', franchisee.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching franchisee restaurants:', error);
        setError(error.message);
      } else {
        setRestaurants(data || []);
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user, franchisee]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return {
    restaurants,
    loading,
    error,
    refetch: fetchRestaurants
  };
};

// Hook para franchisees sin verificación de roles
export const useSimplifiedFranchisees = () => {
  const { user } = useAuth();
  const [franchisees, setFranchisees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFranchisees = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('franchisees')
        .select(`
          *,
          profiles!franchisees_user_id_fkey(
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching franchisees:', error);
        setError(error.message);
      } else {
        setFranchisees(data || []);
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFranchisees();
  }, [fetchFranchisees]);

  return {
    franchisees,
    loading,
    error,
    refetch: fetchFranchisees,
    userRole: 'superadmin' // Simplificado
  };
};

// Hook para userCreation sin verificación de roles
export const useSimplifiedUserCreation = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createUser = useCallback(async (userData: any) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    setLoading(true);
    try {
      // Lógica simplificada para crear usuario
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: {
          full_name: userData.fullName,
          role: userData.role
        }
      });

      if (error) throw error;
      return data;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    createUser,
    loading,
    canCreateUser: !!user // Simplificado
  };
};

// Hook para unifiedRestaurants sin verificación de roles
export const useSimplifiedUnifiedRestaurants = () => {
  const { user, franchisee } = useAuth();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch both base and franchisee restaurants
      const [baseRestaurants, franchiseeRestaurants] = await Promise.all([
        supabase.from('base_restaurants').select('*'),
        franchisee 
          ? supabase.from('franchisee_restaurants')
              .select('*, base_restaurant:base_restaurants(*)')
              .eq('franchisee_id', franchisee.id)
          : Promise.resolve({ data: [] })
      ]);

      const combined = [
        ...(baseRestaurants.data || []),
        ...(franchiseeRestaurants.data || [])
      ];

      setRestaurants(combined);
    } catch (error: any) {
      console.error('Error fetching unified restaurants:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user, franchisee]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return {
    restaurants,
    loading,
    error,
    refetch: fetchRestaurants,
    userRole: 'superadmin' // Simplificado
  };
};