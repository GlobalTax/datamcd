import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: string;
}

/**
 * Hook para buscar usuarios existentes en el sistema
 */
export const useUserSearch = () => {
  const { toast } = useToast();
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);

  /**
   * Buscar usuarios por email
   */
  const searchUsers = useCallback(async (email: string) => {
    if (!email.trim()) return;

    try {
      setSearching(true);
      setSearchResults([]);

      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .ilike('email', `%${email.trim()}%`)
        .limit(10);

      if (error) throw error;

      setSearchResults(data || []);

    } catch (err) {
      console.error('Error searching users:', err);
      toast({
        title: "Error",
        description: "No se pudo realizar la búsqueda de usuarios",
        variant: "destructive"
      });
    } finally {
      setSearching(false);
    }
  }, [toast]);

  /**
   * Buscar usuario exacto por email
   */
  const findUserByEmail = useCallback(async (email: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('email', email.trim())
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data || null;

    } catch (err) {
      console.error('Error finding user by email:', err);
      return null;
    }
  }, []);

  /**
   * Limpiar resultados de búsqueda
   */
  const clearResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  return {
    searchResults,
    searching,
    searchUsers,
    findUserByEmail,
    clearResults
  };
};