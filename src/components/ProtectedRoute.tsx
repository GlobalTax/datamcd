
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, requiredRoles, adminOnly }: ProtectedRouteProps) => {
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

  // Role-based access control
  if (adminOnly && !['admin', 'superadmin'].includes(user.role || '')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">No tienes permisos para acceder a esta página</p>
        </div>
      </div>
    );
  }

  if (requiredRoles && requiredRoles.length > 0) {
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

  return <>{children}</>;
};

export default ProtectedRoute;
