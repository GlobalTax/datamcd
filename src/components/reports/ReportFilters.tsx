
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { X, Filter, Download } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface ReportFiltersProps {
  onFiltersChange: (filters: ReportFilters) => void;
  onExport: (format: 'csv' | 'excel' | 'pdf') => void;
  isExporting?: boolean;
  restaurants?: Array<{ id: string; name: string; site_number: string }>;
}

export interface ReportFilters {
  reportType: string;
  dateRange?: DateRange;
  restaurants: string[];
  category?: string;
  status?: string;
  searchTerm?: string;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  onFiltersChange,
  onExport,
  isExporting = false,
  restaurants = []
}) => {
  const [filters, setFilters] = React.useState<ReportFilters>({
    reportType: 'financial',
    restaurants: [],
    searchTerm: ''
  });

  const [selectedRestaurants, setSelectedRestaurants] = React.useState<string[]>([]);

  const updateFilters = (newFilters: Partial<ReportFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const removeRestaurant = (restaurantId: string) => {
    const updated = selectedRestaurants.filter(id => id !== restaurantId);
    setSelectedRestaurants(updated);
    updateFilters({ restaurants: updated });
  };

  const clearAllFilters = () => {
    const clearedFilters: ReportFilters = {
      reportType: 'financial',
      restaurants: [],
      searchTerm: ''
    };
    setFilters(clearedFilters);
    setSelectedRestaurants([]);
    onFiltersChange(clearedFilters);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Reporte
          </CardTitle>
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            Limpiar Filtros
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tipo de Reporte */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo de Reporte</label>
            <Select 
              value={filters.reportType} 
              onValueChange={(value) => updateFilters({ reportType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="financial">Financiero (P&L)</SelectItem>
                <SelectItem value="payroll">Nómina</SelectItem>
                <SelectItem value="incidents">Incidencias</SelectItem>
                <SelectItem value="performance">Rendimiento</SelectItem>
                <SelectItem value="comparative">Comparativo</SelectItem>
                <SelectItem value="operational">Operacional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Categoría</label>
            <Select 
              value={filters.category || ''} 
              onValueChange={(value) => updateFilters({ category: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="revenue">Ingresos</SelectItem>
                <SelectItem value="costs">Costos</SelectItem>
                <SelectItem value="labor">Mano de Obra</SelectItem>
                <SelectItem value="operations">Operaciones</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Estado</label>
            <Select 
              value={filters.status || ''} 
              onValueChange={(value) => updateFilters({ status: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Búsqueda</label>
            <Input
              placeholder="Buscar..."
              value={filters.searchTerm || ''}
              onChange={(e) => updateFilters({ searchTerm: e.target.value })}
            />
          </div>
        </div>

        {/* Rango de Fechas */}
        <div>
          <label className="text-sm font-medium mb-2 block">Rango de Fechas</label>
          <DatePickerWithRange
            date={filters.dateRange}
            onDateChange={(dateRange) => updateFilters({ dateRange })}
          />
        </div>

        {/* Restaurantes Seleccionados */}
        <div>
          <label className="text-sm font-medium mb-2 block">Restaurantes</label>
          <Select
            onValueChange={(value) => {
              if (!selectedRestaurants.includes(value)) {
                const updated = [...selectedRestaurants, value];
                setSelectedRestaurants(updated);
                updateFilters({ restaurants: updated });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar restaurantes..." />
            </SelectTrigger>
            <SelectContent>
              {restaurants.map((restaurant) => (
                <SelectItem 
                  key={restaurant.id} 
                  value={restaurant.id}
                  disabled={selectedRestaurants.includes(restaurant.id)}
                >
                  {restaurant.name} (#{restaurant.site_number})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedRestaurants.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedRestaurants.map((restaurantId) => {
                const restaurant = restaurants.find(r => r.id === restaurantId);
                return restaurant ? (
                  <Badge key={restaurantId} variant="secondary" className="flex items-center gap-1">
                    {restaurant.name}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeRestaurant(restaurantId)}
                    />
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Botones de Exportación */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => onExport('csv')}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onExport('excel')}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Excel
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onExport('pdf')}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
