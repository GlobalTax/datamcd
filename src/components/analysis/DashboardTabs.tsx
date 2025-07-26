
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HistoricalDataTab } from './HistoricalDataTab';
import { HistoricalYearsTab } from './HistoricalYearsTab';

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
  
  return (
    <div className="w-full">
      <Tabs defaultValue="years" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-auto">
          <TabsTrigger value="years" className="text-xs sm:text-sm whitespace-nowrap px-2 py-2 bg-green-200 border-2 border-green-500">
            Años Históricos
          </TabsTrigger>
          <TabsTrigger value="historical" className="text-xs sm:text-sm whitespace-nowrap px-2 py-2">
            Datos Históricos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="years" className="space-y-6 mt-0">
          <HistoricalYearsTab />
        </TabsContent>

        <TabsContent value="historical" className="space-y-6 mt-0">
          <HistoricalDataTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
