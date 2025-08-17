import React from 'react';
import { useRestaurantAccess } from '@/hooks/useRestaurantAccess';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { LoadingFallback } from '@/components/common/LoadingFallback';
import type { RestaurantAccessControlProps } from '@/types/domains/restaurant/rbac';

/**
 * Componente de control de acceso basado en permisos de restaurante
 */
export const RestaurantAccessControl: React.FC<RestaurantAccessControlProps> = ({
  restaurantId,
  requiredRole,
  children,
  fallback
}) => {
  const { hasAccess, isLoading, userRole } = useRestaurantAccess(restaurantId, requiredRole);

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert className="border-destructive/50 text-destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No tienes permisos suficientes para acceder a esta sección.
          {requiredRole && (
            <span className="block mt-1 text-sm text-muted-foreground">
              Se requiere rol: {requiredRole} (tu rol actual: {userRole || 'ninguno'})
            </span>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};