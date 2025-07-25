
import React, { useState } from 'react';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { useDataExport } from '@/hooks/useDataExport';
import { toast } from 'sonner';
import { DashboardHeader } from './DashboardHeader';
import { DashboardKPIs } from './DashboardKPIs';
import { DashboardTabs } from './DashboardTabs';
import { QuantumSyncStatus } from '@/components/quantum/QuantumSyncStatus';
import { QuantumDataDialog } from '@/components/quantum/QuantumDataDialog';
import { Button } from '@/components/ui/button';

export const AnalysisDashboard = () => {
  const { franchisee, restaurants } = useUnifiedAuth();
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

      {/* Integración con Quantum Economics */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <QuantumSyncStatus />
        </div>
        <div className="flex flex-col justify-center">
          <QuantumDataDialog>
            <Button variant="outline" size="lg" className="w-full">
              Ver Datos Quantum
            </Button>
          </QuantumDataDialog>
        </div>
      </div>

      <DashboardTabs
        selectedYear={selectedYear}
        selectedRestaurant={selectedRestaurant}
        restaurants={restaurants}
      />
    </div>
  );
};
