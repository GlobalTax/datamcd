
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredRole?: 'admin' | 'franchisee' | 'staff' | 'superadmin';
}

const ProtectedRoute = ({ children, allowedRoles, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [showTimeout, setShowTimeout] = useState(false);

  // Timeout para evitar loading infinito
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        setShowTimeout(true);
      }, 10000); // 10 segundos timeout

      return () => clearTimeout(timeoutId);
    } else {
      setShowTimeout(false);
    }
  }, [loading]);

  // Si está cargando y no hemos alcanzado el timeout, mostrar spinner
  if (loading && !showTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Verificando autenticación...</p>
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

  // Check if user has required role - usando allowedRoles principalmente
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
            <p className="text-gray-600 mt-2">No tienes permisos para acceder a esta página.</p>
            <p className="text-sm text-gray-500 mt-1">Rol actual: {user.role}</p>
          </div>
        </div>
      );
    }
  }

  // Check if user has required role - para admin permitir también superadmin
  if (requiredRole) {
    if (requiredRole === 'admin') {
      // Si se requiere admin, permitir admin y superadmin
      if (!['admin', 'superadmin'].includes(user.role)) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
              <p className="text-gray-600 mt-2">No tienes permisos para acceder a esta página.</p>
              <p className="text-sm text-gray-500 mt-1">Se requiere rol de administrador</p>
            </div>
          </div>
        );
      }
    } else if (user.role !== requiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
            <p className="text-gray-600 mt-2">No tienes permisos para acceder a esta página.</p>
            <p className="text-sm text-gray-500 mt-1">Rol requerido: {requiredRole}</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
