
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  // Simplified: no role restrictions for superadmin mode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
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

  // Simplified: Only check if user is authenticated
  // No role-based restrictions for development phase

  return <>{children}</>;
};

export default ProtectedRoute;
