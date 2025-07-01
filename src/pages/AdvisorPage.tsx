
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBaseRestaurants } from '@/hooks/useBaseRestaurants';
import { AdvisorDashboard } from '@/components/AdvisorDashboard';
import FranchiseesManagement from '@/components/FranchiseesManagement';
import BaseRestaurantsTable from '@/components/BaseRestaurantsTable';
import UserManagement from '@/components/UserManagement';
import { AdvisorReports } from '@/components/advisor/AdvisorReports';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  Store, 
  TrendingUp, 
  UserCog, 
  FileText, 
  Building2 
} from 'lucide-react';

export default function AdvisorPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { restaurants, loading: restaurantsLoading, refetch } = useBaseRestaurants();

  if (loading || restaurantsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel de asesor...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'asesor') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
            <p className="text-gray-600">No tienes permisos para acceder al panel de asesor.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'franchisees', label: 'Franquiciados', icon: Users },
    { id: 'restaurants', label: 'Restaurantes', icon: Store },
    { id: 'users', label: 'Usuarios', icon: UserCog },
    { id: 'reports', label: 'Reportes', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <Building2 className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Asesor</h1>
              <p className="text-gray-600 font-medium">
                Bienvenido, {user.full_name}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'dashboard' && <AdvisorDashboard />}
          {activeTab === 'franchisees' && <FranchiseesManagement />}
          {activeTab === 'restaurants' && <BaseRestaurantsTable />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'reports' && <AdvisorReports advisorId={user.id} />}
        </div>
      </div>
    </div>
  );
}
