
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredRole?: 'admin' | 'franchisee' | 'staff' | 'superadmin';
}

const ProtectedRoute = ({ children, allowedRoles, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
