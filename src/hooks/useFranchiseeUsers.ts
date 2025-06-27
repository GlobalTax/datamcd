
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/AuthProvider';

export interface FranchiseeUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
}

export const useFranchiseeUsers = (franchiseeId: string) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<FranchiseeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    if (!user || !franchiseeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Obtener usuarios asociados al franquiciado
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'franchisee')
        .order('full_name');

      if (error) {
        throw error;
      }

      // Mapear a la interfaz esperada
      const mappedUsers: FranchiseeUser[] = (data || []).map(profile => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name || '',
        avatar_url: '' // No tenemos avatar_url en profiles, pero lo necesita la interfaz
      }));

      setUsers(mappedUsers);
    } catch (err) {
      console.error('Error fetching franchisee users:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, [franchiseeId, user]);

  return {
    users,
    loading,
    error,
    refetch
  };
};
