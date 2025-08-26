
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useRestaurantContext } from '@/providers/RestaurantContext';
import { useRestaurantAccess } from '@/hooks/useRestaurantAccess';
import { Loader2 } from 'lucide-react';
import { RestaurantSelectionCard } from '@/components/restaurant/RestaurantSelectionCard';
import type { RestaurantRole } from '@/types/domains/restaurant/rbac';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  adminOnly?: boolean;
  requiredRestaurantRoles?: Array<RestaurantRole>;
}

const ProtectedRoute = ({ children, requiredRoles, adminOnly, requiredRestaurantRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { currentRestaurantId } = useRestaurantContext();
  const [showTimeout, setShowTimeout] = useState(false);

  // Solo verificar acceso a restaurante si se requieren roles específicos
  const { hasAccess: hasRestaurantAccess, isLoading: restaurantLoading, userRole } = useRestaurantAccess(
    currentRestaurantId || '',
    requiredRestaurantRoles?.[0] // Usar el primer rol como mínimo requerido
  );

  // Timeout para evitar loading infinito
  useEffect(() => {
    const isLoading = loading || (requiredRestaurantRoles && restaurantLoading);
    if (isLoading) {
      const timeoutId = setTimeout(() => {
        setShowTimeout(true);
      }, 10000); // 10 segundos timeout

      return () => clearTimeout(timeoutId);
    } else {
      setShowTimeout(false);
    }
  }, [loading, restaurantLoading, requiredRestaurantRoles]);

  // Si está cargando y no hemos alcanzado el timeout, mostrar spinner
  const isAuthLoading = loading || (requiredRestaurantRoles && restaurantLoading);
  if (isAuthLoading && !showTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">
            {loading ? 'Verificando autenticación...' : 'Verificando permisos de restaurante...'}
          </p>
        </div>
      </div>
    );
  }

  // Si hemos alcanzado el timeout, redirigir a auth
  if (showTimeout) {
    return <Navigate to="/auth" replace />;
  }

  // Si no hay usuario, redirigir a auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Verificar roles globales primero
  const isGlobalAdmin = ['admin', 'superadmin'].includes(user.role || '');

  // Role-based access control (roles globales)
  if (adminOnly && !isGlobalAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">No tienes permisos para acceder a esta página</p>
        </div>
      </div>
    );
  }

  if (requiredRoles && requiredRoles.length > 0 && !isGlobalAdmin) {
    if (!requiredRoles.includes(user.role || '')) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">No tienes permisos para acceder a esta página</p>
          </div>
        </div>
      );
    }
  }

  // Verificar roles de restaurante si se requieren
  if (requiredRestaurantRoles && !isGlobalAdmin) {
    // Si no hay restaurante seleccionado, mostrar tarjeta de selección
    if (!currentRestaurantId) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <RestaurantSelectionCard />
        </div>
      );
    }

    // Verificar acceso al restaurante
    if (!hasRestaurantAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">No tienes permisos para acceder a este restaurante</p>
            <p className="text-sm text-muted-foreground mt-1">
              Se requiere rol: {requiredRestaurantRoles.join(' o ')} (tu rol actual: {userRole || 'ninguno'})
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
