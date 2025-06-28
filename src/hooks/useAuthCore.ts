
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';

interface UseAuthCoreReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthCore = (): UseAuthCoreReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadUserProfile = useCallback(async (userId: string): Promise<User | null> => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        setError('Error cargando perfil de usuario');
        return null;
      }

      // Asegurar que el rol es válido
      const validRoles = ['franchisee', 'asesor', 'admin', 'superadmin', 'manager', 'asistente'];
      const userRole = validRoles.includes(profile.role) ? profile.role : 'franchisee';

      return {
        id: profile.id,
        email: profile.email,
        role: userRole as User['role'],
        full_name: profile.full_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (err) {
      console.error('Profile loading failed:', err);
      setError('No se pudo cargar el perfil');
      return null;
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error: signInError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (signInError) {
        setError(signInError.message);
        return { error: signInError.message };
      }
      
      return {};
    } catch (err) {
      const errorMsg = 'Error de conexión';
      setError(errorMsg);
      return { error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            const userProfile = await loadUserProfile(session.user.id);
            if (mounted) {
              setUser(userProfile);
            }
          }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error('Auth initialization error:', err);
          setError('Error inicializando autenticación');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const userProfile = await loadUserProfile(session.user.id);
          setUser(userProfile);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setError(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signIn,
    signOut,
    clearError
  };
};
