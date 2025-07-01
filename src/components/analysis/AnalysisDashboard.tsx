
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFranchiseeRestaurants } from '@/hooks/useFranchiseeRestaurants';
import { useDataExport } from '@/hooks/useDataExport';
import { showSuccess, showError } from '@/utils/notifications';
import { DashboardHeader } from './DashboardHeader';
import { DashboardKPIs } from './DashboardKPIs';
import { DashboardTabs } from './DashboardTabs';

export const AnalysisDashboard = () => {
  const { franchisee } = useAuth();
  const { restaurants } = useFranchiseeRestaurants();
  const { exportRestaurantsData } = useDataExport();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('all');

  const handleImportComplete = () => {
    window.location.reload();
  };

  const handleExport = () => {
    try {
      exportRestaurantsData(restaurants);
      showSuccess('Datos exportados correctamente');
    } catch (error) {
      showError('Error al exportar los datos');
    }
  };

  if (!franchisee) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Cargando datos del franquiciado...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        franchiseeName={franchisee.franchisee_name}
        selectedYear={selectedYear}
        selectedRestaurant={selectedRestaurant}
        restaurants={restaurants}
        onYearChange={setSelectedYear}
        onRestaurantChange={setSelectedRestaurant}
        onImportComplete={handleImportComplete}
        onExport={handleExport}
      />

      <DashboardKPIs restaurants={restaurants} />

      <DashboardTabs
        selectedYear={selectedYear}
        selectedRestaurant={selectedRestaurant}
        restaurants={restaurants}
      />
    </div>
  );
};
