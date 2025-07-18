// Hooks de compatibilidad para migración gradual
import { useAuth } from './AuthProvider';

// Mantenemos compatibilidad con useUnifiedAuth
export const useUnifiedAuth = () => {
  const auth = useAuth();
  
  // Agregar campos adicionales que algunos componentes esperan
  return {
    ...auth,
    // Campos legacy para compatibilidad
    supabaseClient: () => {
      // Cliente básico sin logging para componentes que no lo necesitan
      const { supabase } = require('@/integrations/supabase/client');
      return supabase;
    },
    
    // Alias para compatibilidad
    getDebugInfo: auth.getDebugInfo
  };
};

// También exportamos useAuth como alias
export { useAuth } from './AuthProvider';