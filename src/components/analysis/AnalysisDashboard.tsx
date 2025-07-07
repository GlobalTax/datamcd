
import React, { useState } from 'react';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { useDataExport } from '@/hooks/useDataExport';
import { toast } from 'sonner';
import { DashboardHeader } from './DashboardHeader';
import { DashboardKPIs } from './DashboardKPIs';
import { DashboardTabs } from './DashboardTabs';

export const AnalysisDashboard = () => {
  const { effectiveFranchisee, restaurants } = useUnifiedAuth();
  const { exportRestaurantsData } = useDataExport();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('all');

  const handleImportComplete = () => {
    window.location.reload();
  };

  const handleExport = () => {
    try {
      exportRestaurantsData(restaurants);
      toast.success('Datos exportados correctamente');
    } catch (error) {
      toast.error('Error al exportar los datos');
    }
  };

  if (!effectiveFranchisee) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Cargando datos del franquiciado...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        franchiseeName={effectiveFranchisee.franchisee_name}
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
