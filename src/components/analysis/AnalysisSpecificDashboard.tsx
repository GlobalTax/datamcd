
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFranchiseeRestaurants } from '@/hooks/useFranchiseeRestaurants';
import { AnalysisTabs } from './AnalysisTabs';

export const AnalysisSpecificDashboard: React.FC = () => {
  const { franchisee } = useAuth();
  const { restaurants, loading } = useFranchiseeRestaurants();
  
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('all');

  console.log('=== AnalysisSpecificDashboard DEBUG ===');
  console.log('Franchisee:', franchisee?.franchisee_name);
  console.log('Restaurants:', restaurants?.length || 0);
  console.log('Selected year:', selectedYear);
  console.log('Selected restaurant:', selectedRestaurant);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análisis Financiero</h1>
          <p className="text-gray-600">
            Análisis integral de rendimiento - {franchisee?.franchisee_name}
          </p>
        </div>
        
        <div className="flex gap-3">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            {[2020, 2021, 2022, 2023, 2024, 2025].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select 
            value={selectedRestaurant} 
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">Todos los Restaurantes</option>
            {restaurants.map(restaurant => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.base_restaurant?.restaurant_name || `Restaurante ${restaurant.base_restaurant?.site_number}`}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <AnalysisTabs
        selectedYear={selectedYear}
        selectedRestaurant={selectedRestaurant}
        restaurants={restaurants}
      />
    </div>
  );
};
