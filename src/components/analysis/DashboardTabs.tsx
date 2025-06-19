
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
  console.log('DashboardTabs - Rendering with restaurants:', restaurants.length);
  
  return (
    <Tabs defaultValue="metrics" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="metrics">Métricas Financieras</TabsTrigger>
        <TabsTrigger value="performance">Rendimiento</TabsTrigger>
        <TabsTrigger value="comparison">Comparación</TabsTrigger>
        <TabsTrigger value="profitability">Rentabilidad</TabsTrigger>
        <TabsTrigger value="historical">Datos Históricos</TabsTrigger>
      </TabsList>

      <TabsContent value="metrics" className="space-y-6">
        <FinancialMetrics 
          selectedYear={selectedYear}
          selectedRestaurant={selectedRestaurant}
          restaurants={restaurants}
        />
      </TabsContent>

      <TabsContent value="performance" className="space-y-6">
        <PerformanceCharts 
          selectedYear={selectedYear}
          selectedRestaurant={selectedRestaurant}
          restaurants={restaurants}
        />
      </TabsContent>

      <TabsContent value="comparison" className="space-y-6">
        <RestaurantComparison 
          selectedYear={selectedYear}
          restaurants={restaurants}
        />
      </TabsContent>

      <TabsContent value="profitability" className="space-y-6">
        <ProfitabilityAnalysis 
          selectedYear={selectedYear}
          selectedRestaurant={selectedRestaurant}
          restaurants={restaurants}
        />
      </TabsContent>

      <TabsContent value="historical" className="space-y-6">
        <HistoricalDataTab />
      </TabsContent>
    </Tabs>
  );
};
