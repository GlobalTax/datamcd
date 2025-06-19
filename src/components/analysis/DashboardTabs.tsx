import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FinancialMetrics } from './FinancialMetrics';
import { PerformanceCharts } from './PerformanceCharts';
import { RestaurantComparison } from './RestaurantComparison';
import { ProfitabilityAnalysis } from './ProfitabilityAnalysis';
import { HistoricalDataTab } from './HistoricalDataTab';

interface DashboardTabsProps {
  selectedYear: number;
  selectedRestaurant: string;
  restaurants: any[];
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  selectedYear,
  selectedRestaurant,
  restaurants
}) => {
  console.log('=== DashboardTabs DEBUG ===');
  console.log('DashboardTabs - Rendering tabs with restaurants:', restaurants.length);
  console.log('DashboardTabs - Component loaded successfully');
  console.log('DashboardTabs - HistoricalDataTab imported:', !!HistoricalDataTab);
  console.log('DashboardTabs - About to render 5 tabs');
  
  return (
    <div className="w-full">
      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="metrics" className="text-sm">
            Métricas Financieras
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-sm">
            Rendimiento
          </TabsTrigger>
          <TabsTrigger value="comparison" className="text-sm">
            Comparación
          </TabsTrigger>
          <TabsTrigger value="profitability" className="text-sm">
            Rentabilidad
          </TabsTrigger>
          <TabsTrigger value="historical" className="text-sm">
            Datos Históricos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6 mt-0">
          <FinancialMetrics 
            selectedYear={selectedYear}
            selectedRestaurant={selectedRestaurant}
            restaurants={restaurants}
          />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6 mt-0">
          <PerformanceCharts 
            selectedYear={selectedYear}
            selectedRestaurant={selectedRestaurant}
            restaurants={restaurants}
          />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6 mt-0">
          <RestaurantComparison 
            selectedYear={selectedYear}
            restaurants={restaurants}
          />
        </TabsContent>

        <TabsContent value="profitability" className="space-y-6 mt-0">
          <ProfitabilityAnalysis 
            selectedYear={selectedYear}
            selectedRestaurant={selectedRestaurant}
            restaurants={restaurants}
          />
        </TabsContent>

        <TabsContent value="historical" className="space-y-6 mt-0">
          <div className="p-4 border-2 border-red-500 bg-yellow-100">
            <h2 className="text-xl font-bold text-red-600">DEBUG: PESTAÑA HISTÓRICOS</h2>
            <p>Si ves esto, la pestaña funciona correctamente</p>
          </div>
          <HistoricalDataTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
