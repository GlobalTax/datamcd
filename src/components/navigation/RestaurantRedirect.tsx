import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useRestaurantContext } from '@/providers/RestaurantContext';
import { useFranchiseeRestaurants } from '@/hooks/useFranchiseeRestaurants';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { logger } from '@/lib/logger';

interface RestaurantRedirectProps {
  /** Sección a la que redirigir (por defecto 'hub') */
  section?: string;
  /** Mensaje de redirección opcional */
  message?: string;
}

/**
 * Componente que redirige inteligentemente al último restaurante activo
 * o al primer restaurante disponible del usuario
 */
export const RestaurantRedirect: React.FC<RestaurantRedirectProps> = ({ 
  section = 'hub',
  message 
}) => {
  const { currentRestaurantId, setRestaurantId } = useRestaurantContext();
  const { restaurants, loading: restaurantsLoading } = useFranchiseeRestaurants();
  const { user, effectiveFranchisee } = useUnifiedAuth();

  useEffect(() => {
    logger.info('RestaurantRedirect: Determining redirect target', {
      currentRestaurantId,
      restaurantsCount: restaurants.length,
      userRole: user?.role,
      effectiveFranchisee: !!effectiveFranchisee
    });
  }, [currentRestaurantId, restaurants, user, effectiveFranchisee]);

  // Mostrar loading mientras se cargan los datos
  if (restaurantsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {message || 'Redirigiendo...'}
          </p>
        </div>
      </div>
    );
  }

  // Determinar el restaurante de destino
  const getTargetRestaurantId = (): string | null => {
    // Caso 1: Ya hay un restaurante seleccionado en el contexto
    if (currentRestaurantId) {
      // Verificar que el restaurante sigue siendo accesible
      const isAccessible = restaurants.some(r => r.id === currentRestaurantId);
      if (isAccessible) {
        return currentRestaurantId;
      }
    }

    // Caso 2: No hay restaurante seleccionado o no es accesible
    if (restaurants.length > 0) {
      const firstRestaurant = restaurants[0];
      // Actualizar el contexto con el primer restaurante
      setRestaurantId(firstRestaurant.id);
      return firstRestaurant.id;
    }

    // Caso 3: No hay restaurantes disponibles
    return null;
  };

  const targetRestaurantId = getTargetRestaurantId();

  // Si no hay restaurantes disponibles, mostrar mensaje
  if (!targetRestaurantId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 font-bold text-xl">!</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No hay restaurantes disponibles
          </h2>
          <p className="text-gray-600 mb-4">
            No tienes acceso a ningún restaurante en este momento. 
            Contacta con tu administrador si crees que esto es un error.
          </p>
          <div className="text-sm text-gray-500">
            Usuario: {user?.email}<br />
            Rol: {user?.role}
          </div>
        </div>
      </div>
    );
  }

  // Redirigir al restaurante objetivo
  const redirectPath = `/restaurant/${targetRestaurantId}/${section}`;
  
  logger.info('RestaurantRedirect: Redirecting', {
    targetRestaurantId,
    section,
    redirectPath
  });

  return <Navigate to={redirectPath} replace />;
};