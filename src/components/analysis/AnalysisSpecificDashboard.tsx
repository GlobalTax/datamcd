
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFranchiseeRestaurants } from '@/hooks/useFranchiseeRestaurants';
import { DashboardHeader } from './DashboardHeader';
import { AnalysisTabs } from './AnalysisTabs';

export const AnalysisSpecificDashboard: React.FC = () => {
  const { franchisee } = useAuth();
  const { restaurants, isLoading } = useFranchiseeRestaurants();
  
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('all');

  console.log('=== AnalysisSpecificDashboard DEBUG ===');
  console.log('Franchisee:', franchisee?.franchisee_name);
  console.log('Restaurants:', restaurants?.length || 0);
  console.log('Selected year:', selectedYear);
  console.log('Selected restaurant:', selectedRestaurant);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedRestaurant={selectedRestaurant}
        setSelectedRestaurant={setSelectedRestaurant}
        restaurants={restaurants}
      />
      
      <AnalysisTabs
        selectedYear={selectedYear}
        selectedRestaurant={selectedRestaurant}
        restaurants={restaurants}
      />
    </div>
  );
};
