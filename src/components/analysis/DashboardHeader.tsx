
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { DataImportDialog } from '@/components/DataImportDialog';
import { SearchableRestaurantSelect } from '@/components/ui/searchable-restaurant-select';

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

        <div className="w-48">
          <SearchableRestaurantSelect
            restaurants={restaurants.map(r => ({
              id: r.id,
              name: r.base_restaurant?.restaurant_name || `Restaurante ${r.base_restaurant?.site_number}`,
              site_number: r.base_restaurant?.site_number || 'N/A'
            }))}
            value={selectedRestaurant}
            onValueChange={onRestaurantChange}
            includeAllOption
            allOptionLabel="Todos los Restaurantes"
            compact
          />
        </div>

        <DataImportDialog onImportComplete={onImportComplete} />

        <Button variant="outline" onClick={onExport}>
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>
    </div>
  );
};
