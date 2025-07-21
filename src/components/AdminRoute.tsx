
import React from 'react';
import ProtectedRoute from './ProtectedRoute';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['admin', 'superadmin', 'asesor']}>
      {children}
    </ProtectedRoute>
  );
};
