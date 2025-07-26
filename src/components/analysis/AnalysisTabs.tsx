
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FinancialMetrics } from './FinancialMetrics';
import { PerformanceCharts } from './PerformanceCharts';
import { RestaurantComparison } from './RestaurantComparison';
import { ProfitabilityAnalysis } from './ProfitabilityAnalysis';

interface AnalysisTabsProps {
  selectedYear: number;
  selectedRestaurant: string;
  restaurants: any[];
}

export const AnalysisTabs: React.FC<AnalysisTabsProps> = ({
  selectedYear,
  selectedRestaurant,
  restaurants
}) => {
  
  return (
    <div className="w-full">
      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6 h-auto">
          <TabsTrigger value="metrics" className="text-xs sm:text-sm whitespace-nowrap px-2 py-2">
            Métricas Financieras
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-xs sm:text-sm whitespace-nowrap px-2 py-2">
            Rendimiento
          </TabsTrigger>
          <TabsTrigger value="comparison" className="text-xs sm:text-sm whitespace-nowrap px-2 py-2">
            Comparación
          </TabsTrigger>
          <TabsTrigger value="profitability" className="text-xs sm:text-sm whitespace-nowrap px-2 py-2">
            Rentabilidad
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
      </Tabs>
    </div>
  );
};
