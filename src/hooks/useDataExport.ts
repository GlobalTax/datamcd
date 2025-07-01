
import { useState } from 'react';
import { useProfitLossCalculations } from '@/hooks/useProfitLossCalculations';
import { showSuccess, showError } from '@/utils/notifications';

export const useDataExport = () => {
  const [exporting, setExporting] = useState(false);
  const { formatCurrency } = useProfitLossCalculations();

  const exportToCSV = async (data: any[], filename: string) => {
    try {
      setExporting(true);
      
      if (!data || data.length === 0) {
        showError('No hay datos para exportar');
        return;
      }

      // Convert data to CSV
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => Object.values(row).join(','));
      const csvContent = [headers, ...rows].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSuccess('Datos exportados correctamente');
    } catch (error) {
      console.error('Error exporting data:', error);
      showError('Error al exportar los datos');
    } finally {
      setExporting(false);
    }
  };

  const exportRestaurantsData = (restaurants: any[]) => {
    try {
      if (!restaurants || restaurants.length === 0) {
        showError('No hay datos de restaurantes para exportar');
        return;
      }

      const exportData = restaurants.map(restaurant => ({
        nombre: restaurant.base_restaurant?.restaurant_name || 'N/A',
        numero_sitio: restaurant.base_restaurant?.site_number || 'N/A',
        direccion: restaurant.base_restaurant?.address || 'N/A',
        ciudad: restaurant.base_restaurant?.city || 'N/A',
        tipo: restaurant.base_restaurant?.restaurant_type || 'N/A',
        estado: restaurant.status || 'N/A',
        renta_mensual: restaurant.monthly_rent || 0,
        ingresos_ultimo_año: restaurant.last_year_revenue || 0
      }));

      exportToCSV(exportData, 'restaurantes_franquicia');
    } catch (error) {
      console.error('Error exporting restaurants data:', error);
      showError('Error al exportar los datos de restaurantes');
    }
  };

  return {
    exporting,
    exportToCSV,
    exportRestaurantsData
  };
};
