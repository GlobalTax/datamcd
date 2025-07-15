import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface SimpleAuthContextType {
  user: any | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};

export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener datos del usuario con el perfil completo
  const fetchUserProfile = async (userId: string) => {
    console.log('SimpleAuth: Fetching user profile for:', userId);
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('SimpleAuth: Error fetching profile:', error);
        return null;
      }

      console.log('SimpleAuth: Profile fetched successfully:', profile);
      return profile;
    } catch (error) {
      console.error('SimpleAuth: Exception fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('SimpleAuth: Initializing authentication system');
    
    // Configurar listener de cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('SimpleAuth: Auth state change:', event, session?.user?.id);
        
        setSession(session);
        
        if (session?.user) {
          console.log('SimpleAuth: User found, fetching profile');
          const profile = await fetchUserProfile(session.user.id);
          setUser(profile);
        } else {
          console.log('SimpleAuth: No session, clearing user');
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Verificar sesión inicial
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('SimpleAuth: Initial session check:', session?.user?.id);
      
      setSession(session);
      
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setUser(profile);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('SimpleAuth: Sign in error:', error);
        toast.error('Error de inicio de sesión: ' + error.message);
        return { error: error.message };
      }

      toast.success('Sesión iniciada correctamente');
      return {};
    } catch (error: any) {
      console.error('SimpleAuth: Sign in exception:', error);
      toast.error('Error inesperado al iniciar sesión');
      return { error: error.message };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('SimpleAuth: Sign up error:', error);
        toast.error('Error de registro: ' + error.message);
        return { error: error.message };
      }

      toast.success('Cuenta creada correctamente');
      return {};
    } catch (error: any) {
      console.error('SimpleAuth: Sign up exception:', error);
      toast.error('Error inesperado al crear cuenta');
      return { error: error.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('SimpleAuth: Sign out error:', error);
      }
      toast.success('Sesión cerrada');
    } catch (error) {
      console.error('SimpleAuth: Sign out exception:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  console.log('SimpleAuth: Current state:', { 
    user: user ? { id: user.id, role: user.role } : null, 
    session: !!session, 
    loading 
  });

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
};