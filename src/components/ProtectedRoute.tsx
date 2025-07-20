
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
  const { user, loading, getDebugInfo } = useAuth();
  const [showTimeout, setShowTimeout] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // Detectar modo desarrollo
  useEffect(() => {
    const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('lovable');
    setDebugMode(isDev);
  }, []);

  // Timeout para evitar loading infinito - reducido para debugging
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        console.log('ProtectedRoute - Loading timeout reached');
        console.log('ProtectedRoute - Debug info:', getDebugInfo?.());
        setShowTimeout(true);
      }, 10000); // Reducido a 10 segundos para detectar problemas más rápido

      return () => clearTimeout(timeoutId);
    } else {
      setShowTimeout(false);
    }
  }, [loading, getDebugInfo]);

  // Si está cargando y no hemos alcanzado el timeout, mostrar spinner
  if (loading && !showTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Verificando autenticación...</p>
          {debugMode && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left text-sm max-w-md">
              <strong>Debug Info:</strong>
              <pre className="text-xs">{JSON.stringify(getDebugInfo?.(), null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Si hemos alcanzado el timeout, redirigir a auth
  if (showTimeout) {
    console.log('ProtectedRoute - Timeout reached, redirecting to auth');
    console.log('ProtectedRoute - Final debug info:', getDebugInfo?.());
    return <Navigate to="/auth" replace />;
  }

  // Si no hay usuario, redirigir a auth
  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('ProtectedRoute - User found:', { email: user.email, role: user.role });

  // Check if user has required role - usando allowedRoles principalmente
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      console.log('ProtectedRoute - User role not in allowed roles:', user.role, allowedRoles);
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
            <p className="text-gray-600 mt-2">No tienes permisos para acceder a esta página.</p>
            <p className="text-sm text-gray-500 mt-1">Rol actual: {user.role}</p>
            <p className="text-sm text-gray-500">Roles permitidos: {allowedRoles.join(', ')}</p>
            {debugMode && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left text-sm max-w-md mx-auto">
                <strong>Debug Info:</strong>
                <pre className="text-xs">{JSON.stringify(getDebugInfo?.(), null, 2)}</pre>
              </div>
            )}
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
              <p className="text-sm text-gray-500">Tu rol: {user.role}</p>
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
            <p className="text-sm text-gray-500">Tu rol: {user.role}</p>
          </div>
        </div>
      );
    }
  }

  console.log('ProtectedRoute - Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;
