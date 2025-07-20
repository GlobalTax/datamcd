
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { DashboardSummary } from '@/components/dashboard/DashboardSummary';
import { RestaurantsSection } from '@/components/dashboard/RestaurantsSection';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { FranchiseesSection } from '@/components/admin/FranchiseesSection';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { useUnifiedRestaurants } from '@/hooks/useUnifiedRestaurants';
import { LoadingState } from '@/components/layout/LoadingState';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, effectiveFranchisee, isImpersonating } = useUnifiedAuth();
  const { restaurants, loading, stats } = useUnifiedRestaurants();

  const handleNavigateToValuation = () => {
    navigate('/valuation');
  };

  const handleNavigateToAnnualBudget = () => {
    navigate('/annual-budget');
  };

  const handleNavigateToProfitLoss = (siteNumber: string) => {
    navigate(`/profit-loss?site=${siteNumber}`);
  };

  if (loading) {
    return (
      <StandardLayout
        title="Dashboard"
        description="Panel principal de gestión"
      >
        <LoadingState />
      </StandardLayout>
    );
  }

  // Determinar si es asesor
  const isAdvisor = user?.role === 'asesor' || user?.role === 'admin' || user?.role === 'superadmin';

  // Preparar datos para mostrar - adaptar formato para compatibilidad
  const displayRestaurants = restaurants.map(restaurant => ({
    id: restaurant.id,
    name: restaurant.restaurant_name,
    restaurant_name: restaurant.restaurant_name,
    location: restaurant.city,
    city: restaurant.city,
    address: restaurant.address,
    site_number: restaurant.site_number,
    siteNumber: restaurant.site_number,
    franchiseeName: restaurant.franchisee_info?.franchisee_name,
    franchise_start_date: restaurant.assignment?.franchise_start_date,
    franchise_end_date: restaurant.assignment?.franchise_end_date,
    restaurant_type: restaurant.restaurant_type,
    status: restaurant.assignment?.status || 'active',
    lastYearRevenue: restaurant.assignment?.last_year_revenue || 0,
    baseRent: restaurant.assignment?.monthly_rent || 0,
    isOwnedByMcD: false,
    isAssigned: restaurant.isAssigned
  }));

  // Para franquiciados, filtrar solo restaurantes asignados
  const franchiseeRestaurants = isAdvisor ? restaurants : restaurants.filter(r => r.isAssigned);
  const franchiseeId = effectiveFranchisee?.id || '';

  return (
    <StandardLayout
      title={isAdvisor ? "Panel de Gestión Global" : "Mi Dashboard"}
      description={isAdvisor ? 
        "Gestión completa de restaurantes y franquiciados" : 
        "Panel principal de gestión de mis restaurantes"
      }
    >
      <div className="space-y-6">
        {/* Banner de impersonación para asesores */}
        {isImpersonating && isAdvisor && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-blue-800 font-medium">
                Vista como franquiciado: {effectiveFranchisee?.franchisee_name}
              </p>
            </div>
          </div>
        )}

        <DashboardSummary 
          totalRestaurants={isAdvisor ? stats.total : franchiseeRestaurants.length}
          displayRestaurants={displayRestaurants}
          isTemporaryData={restaurants.length === 0}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RestaurantsSection 
              franchiseeId={franchiseeId}
              franchiseeRestaurants={franchiseeRestaurants}
              hasSupabaseRestaurants={restaurants.length > 0}
              allLocalRestaurants={displayRestaurants}
            />
          </div>
          <div>
            <QuickActions 
              displayRestaurants={displayRestaurants}
              onNavigateToValuation={handleNavigateToValuation}
              onNavigateToAnnualBudget={handleNavigateToAnnualBudget}
              onNavigateToProfitLoss={handleNavigateToProfitLoss}
            />
          </div>
        </div>

        {/* Panel específico para asesores */}
        {isAdvisor && !isImpersonating && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-4">Panel de Asesor</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-red-100">
                  <h4 className="font-medium text-gray-900">Total Restaurantes</h4>
                  <p className="text-2xl font-bold text-red-600">{stats.total}</p>
                  <p className="text-sm text-gray-600">{stats.assigned} asignados</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-red-100">
                  <h4 className="font-medium text-gray-900">Disponibles</h4>
                  <p className="text-2xl font-bold text-orange-600">{stats.available}</p>
                  <p className="text-sm text-gray-600">Sin asignar</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-red-100">
                  <h4 className="font-medium text-gray-900">Franquiciados</h4>
                  <p className="text-2xl font-bold text-red-600">
                    {new Set(restaurants.filter(r => r.isAssigned).map(r => r.franchisee_info?.id)).size}
                  </p>
                  <p className="text-sm text-gray-600">Activos</p>
                </div>
              </div>
            </div>
            
            <FranchiseesSection 
              totalFranchisees={new Set(restaurants.filter(r => r.isAssigned).map(r => r.franchisee_info?.id)).size}
              activeFranchisees={new Set(restaurants.filter(r => r.isAssigned).map(r => r.franchisee_info?.id)).size}
            />
          </div>
        )}
      </div>
    </StandardLayout>
  );
};

export default DashboardPage;
