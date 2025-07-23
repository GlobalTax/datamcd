
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from './auth';

// Adaptador para convertir User de Supabase a nuestro tipo personalizado
export const adaptSupabaseUser = (supabaseUser: SupabaseUser): User => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    full_name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || '',
    role: supabaseUser.user_metadata?.role || 'franchisee',
    phone: supabaseUser.user_metadata?.phone || supabaseUser.phone || '',
    created_at: supabaseUser.created_at,
    updated_at: supabaseUser.updated_at,
  };
};

// Función helper para verificar si un usuario de Supabase es válido
export const isValidSupabaseUser = (user: SupabaseUser | null): user is SupabaseUser => {
  return user !== null && user.email !== undefined;
};
