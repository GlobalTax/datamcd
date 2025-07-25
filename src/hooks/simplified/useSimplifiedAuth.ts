// Hook simplificado para eliminar dependencias de role y simplificar el acceso
import { useAuth } from '@/hooks/auth/AuthProvider';

export const useSimplifiedAuth = () => {
  const authData = useAuth();
  
  return {
    ...authData,
    // Todos los usuarios autenticados son tratados como superadmin
    userRole: 'superadmin',
    isAdmin: true,
    isAuthorized: !!authData.user,
    // Simplificado: no hay impersonación
    effectiveFranchisee: authData.franchisee,
    isImpersonating: false
  };
};