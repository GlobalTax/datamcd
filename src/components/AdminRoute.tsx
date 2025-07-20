
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!['admin', 'superadmin'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
          <p className="text-gray-600 mt-2">Se requieren permisos de administrador.</p>
          <p className="text-sm text-gray-500 mt-1">Tu rol: {user.role}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
