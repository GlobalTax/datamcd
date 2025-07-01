
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredRole?: 'admin' | 'franchisee' | 'manager' | 'asesor' | 'asistente' | 'superadmin';
}

const ProtectedRoute = ({ children, allowedRoles, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Show loading with timeout protection
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if no user
  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Check role permissions
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      console.log('ProtectedRoute - Role not allowed:', user.role, 'Required:', allowedRoles);
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
            <p className="text-gray-600 mt-2">No tienes permisos para acceder a esta página.</p>
          </div>
        </div>
      );
    }
  }

  if (requiredRole) {
    if (requiredRole === 'asesor') {
      if (!['asesor', 'admin', 'superadmin'].includes(user.role)) {
        console.log('ProtectedRoute - Asesor role required, user has:', user.role);
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
              <p className="text-gray-600 mt-2">No tienes permisos para acceder a esta página.</p>
            </div>
          </div>
        );
      }
    } else if (user.role !== requiredRole) {
      console.log('ProtectedRoute - Required role not met:', user.role, 'vs', requiredRole);
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
            <p className="text-gray-600 mt-2">No tienes permisos para acceder a esta página.</p>
          </div>
        </div>
      );
    }
  }

  console.log('ProtectedRoute - Access granted for user:', user.id, 'role:', user.role);
  return <>{children}</>;
};

export default ProtectedRoute;
