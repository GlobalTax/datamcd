
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
  console.log('DashboardTabs - Rendering tabs with restaurants:', restaurants.length);
  console.log('DashboardTabs - Available tabs: metrics, performance, comparison, profitability, historical');
  
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
          <div className="p-4 border rounded-lg bg-white">
            <h3 className="text-lg font-semibold mb-4">Pestaña de Datos Históricos</h3>
            <p className="text-gray-600 mb-4">Esta pestaña debería estar visible ahora.</p>
            <HistoricalDataTab />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
