
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import DataImportDialog from '@/components/DataImportDialog';

interface DashboardHeaderProps {
  franchiseeName: string;
  selectedYear: number;
  selectedRestaurant: string;
  restaurants: any[];
  onYearChange: (year: number) => void;
  onRestaurantChange: (restaurantId: string) => void;
  onImportComplete: () => void;
  onExport: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  franchiseeName,
  selectedYear,
  selectedRestaurant,
  restaurants,
  onYearChange,
  onRestaurantChange,
  onImportComplete,
  onExport
}) => {
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Generar años disponibles
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
  };

  const availableYears = generateYears();

  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Análisis Financiero</h1>
        <p className="text-gray-600">
          Análisis integral de rendimiento - {franchiseeName}
        </p>
      </div>
      
      <div className="flex gap-3">
        <Select value={selectedYear.toString()} onValueChange={(value) => onYearChange(parseInt(value))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedRestaurant} onValueChange={onRestaurantChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Restaurantes</SelectItem>
            {restaurants.map(restaurant => (
              <SelectItem key={restaurant.id} value={restaurant.id}>
                {restaurant.base_restaurant?.restaurant_name || `Restaurante ${restaurant.base_restaurant?.site_number}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DataImportDialog 
          isOpen={showImportDialog}
          onOpenChange={setShowImportDialog}
          onImportComplete={() => {
            onImportComplete();
            setShowImportDialog(false);
          }}
        />

        <Button variant="outline" onClick={onExport}>
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>
    </div>
  );
};
