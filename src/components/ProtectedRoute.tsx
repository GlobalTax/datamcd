
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Loader2, AlertTriangle } from 'lucide-react';
import { AuthDebugger } from '@/components/debug/AuthDebugger';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredRole?: 'admin' | 'franchisee' | 'manager' | 'asesor' | 'asistente' | 'superadmin';
  showDebugger?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  allowedRoles, 
  requiredRole,
  showDebugger = process.env.NODE_ENV === 'development'
}: ProtectedRouteProps) => {
  const { user, loading, connectionStatus } = useUnifiedAuth();

  console.log('ProtectedRoute - Auth state:', { 
    user: user ? { id: user.id, role: user.role } : null, 
    loading, 
    connectionStatus 
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando autenticación...</p>
          <p className="text-xs text-gray-500 mt-1">Estado: {connectionStatus}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Verificar roles permitidos
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-6">
            {showDebugger && <AuthDebugger />}
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-2">Acceso Denegado</h1>
            <p className="text-gray-600 mb-4">
              No tienes permisos para acceder a esta página.
            </p>
            <p className="text-sm text-gray-500">
              Tu rol: <span className="font-medium">{user.role}</span><br/>
              Roles permitidos: <span className="font-medium">{allowedRoles.join(', ')}</span>
            </p>
          </div>
        </div>
      );
    }
  }

  // Verificar rol requerido específico
  if (requiredRole) {
    if (requiredRole === 'asesor') {
      if (!['asesor', 'admin', 'superadmin'].includes(user.role)) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md mx-auto p-6">
              {showDebugger && <AuthDebugger />}
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-red-600 mb-2">Acceso Denegado</h1>
              <p className="text-gray-600 mb-4">
                Esta página es solo para asesores y administradores.
              </p>
              <p className="text-sm text-gray-500">
                Tu rol actual: <span className="font-medium">{user.role}</span>
              </p>
            </div>
          </div>
        );
      }
    } else if (user.role !== requiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-6">
            {showDebugger && <AuthDebugger />}
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-2">Acceso Denegado</h1>
            <p className="text-gray-600 mb-4">
              No tienes el rol requerido para esta página.
            </p>
            <p className="text-sm text-gray-500">
              Rol requerido: <span className="font-medium">{requiredRole}</span><br/>
              Tu rol: <span className="font-medium">{user.role}</span>
            </p>
          </div>
        </div>
      );
    }
  }

  return (
    <>
      {showDebugger && <AuthDebugger />}
      {children}
    </>
  );
};

export default ProtectedRoute;
