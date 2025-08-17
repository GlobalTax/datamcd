import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/AuthProvider';
import type { RestaurantRole, RestaurantAccessCheck } from '@/types/domains/restaurant/rbac';

/**
 * Hook para verificar acceso a un restaurante específico
 */
export const useRestaurantAccess = (restaurantId: string, requiredRole?: RestaurantRole) => {
  const { user } = useAuth();
  const [accessCheck, setAccessCheck] = useState<RestaurantAccessCheck>({
    hasAccess: false,
    userRole: null,
    isLoading: true
  });

  const checkAccess = useCallback(async () => {
    if (!user || !restaurantId) {
      setAccessCheck({ hasAccess: false, userRole: null, isLoading: false });
      return;
    }

    // Admin/Superadmin siempre tienen acceso
    if (['admin', 'superadmin'].includes(user.role || '')) {
      setAccessCheck({ hasAccess: true, userRole: 'owner', isLoading: false });
      return;
    }

    try {
      setAccessCheck(prev => ({ ...prev, isLoading: true }));

      // Verificar si es asesor
      const { data: advisorAccess } = await supabase.rpc('advisor_has_restaurant_access', {
        _advisor_id: user.id,
        _restaurant_id: restaurantId
      });

      if (advisorAccess) {
        setAccessCheck({ hasAccess: true, userRole: 'viewer', isLoading: false });
        return;
      }

      // Verificar membresía en restaurante
      const { data: userRole } = await supabase.rpc('get_user_restaurant_role', {
        _user_id: user.id,
        _restaurant_id: restaurantId
      });

      if (!userRole) {
        setAccessCheck({ hasAccess: false, userRole: null, isLoading: false });
        return;
      }

      // Verificar si el rol cumple con el requerimiento
      let hasRequiredAccess = true;
      if (requiredRole) {
        const { data: hasAccess } = await supabase.rpc('user_has_restaurant_access', {
          _user_id: user.id,
          _restaurant_id: restaurantId,
          _required_role: requiredRole
        });
        hasRequiredAccess = hasAccess || false;
      }

      setAccessCheck({
        hasAccess: hasRequiredAccess,
        userRole: userRole as RestaurantRole,
        isLoading: false
      });

    } catch (error) {
      console.error('Error checking restaurant access:', error);
      setAccessCheck({ hasAccess: false, userRole: null, isLoading: false });
    }
  }, [user, restaurantId, requiredRole]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  /**
   * Verificar acceso específico sin cambiar el estado
   */
  const checkSpecificAccess = useCallback(async (specificRole?: RestaurantRole): Promise<boolean> => {
    if (!user || !restaurantId) return false;
    
    if (['admin', 'superadmin'].includes(user.role || '')) return true;

    try {
      // Verificar asesor
      const { data: advisorAccess } = await supabase.rpc('advisor_has_restaurant_access', {
        _advisor_id: user.id,
        _restaurant_id: restaurantId
      });

      if (advisorAccess && (!specificRole || specificRole === 'viewer')) {
        return true;
      }

      // Verificar membresía
      const { data: hasAccess } = await supabase.rpc('user_has_restaurant_access', {
        _user_id: user.id,
        _restaurant_id: restaurantId,
        _required_role: specificRole
      });

      return hasAccess || false;
    } catch (error) {
      console.error('Error checking specific access:', error);
      return false;
    }
  }, [user, restaurantId]);

  /**
   * Verificar si el usuario puede realizar una acción específica
   */
  const canPerformAction = useCallback((action: 'view' | 'create' | 'edit' | 'delete'): boolean => {
    const { hasAccess, userRole } = accessCheck;
    
    if (!hasAccess || !userRole) return false;

    // Admin/Superadmin pueden todo
    if (['admin', 'superadmin'].includes(user?.role || '')) return true;

    switch (action) {
      case 'view':
        return ['owner', 'manager', 'staff', 'viewer'].includes(userRole);
      case 'create':
        return ['owner', 'manager', 'staff'].includes(userRole);
      case 'edit':
        return ['owner', 'manager', 'staff'].includes(userRole);
      case 'delete':
        return ['owner', 'manager'].includes(userRole);
      default:
        return false;
    }
  }, [accessCheck, user]);

  return {
    ...accessCheck,
    checkAccess,
    checkSpecificAccess,
    canPerformAction,
    refetch: checkAccess
  };
};