
import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { ConnectionStatus } from '@/components/dashboard/ConnectionStatus';
import { useAuth } from '@/hooks/AuthProvider';

export default function DashboardPage() {
  const { user, franchisee, restaurants, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <p className="text-gray-600">Cargando datos reales...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acceso requerido
          </h2>
          <p className="text-gray-600 mb-4">
            Por favor, inicia sesión para acceder al dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader 
        user={user} 
        franchisee={franchisee}
      />
      
      <ConnectionStatus />
      
      <DashboardMetrics 
        restaurants={restaurants || []}
        franchisee={franchisee}
      />
    </div>
  );
}
