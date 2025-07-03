
import { useProfitLossCalculations } from '@/hooks/useProfitLossData';

export const useDataExport = () => {
  const { formatCurrency } = useProfitLossCalculations();

  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    console.log('Exporting data to CSV:', { filename, rowCount: data.length });
    
    try {
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header.toLowerCase().replace(/ /g, '_')];
            if (typeof value === 'number') {
              return value.toString();
            }
            return `"${value || ''}"`;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw new Error('Error al exportar los datos');
    }
  };

  const exportRestaurantsData = (restaurants: any[]) => {
    const headers = [
      'Nombre',
      'Site Number',
      'Ciudad',
      'Dirección',
      'Tipo',
      'Renta Mensual',
      'Facturación Último Año',
      'Tarifa Franquicia',
      'Tarifa Publicidad',
      'Estado'
    ];

    const exportData = restaurants.map(restaurant => ({
      nombre: restaurant.base_restaurant?.restaurant_name || '',
      site_number: restaurant.base_restaurant?.site_number || '',
      ciudad: restaurant.base_restaurant?.city || '',
      dirección: restaurant.base_restaurant?.address || '',
      tipo: restaurant.base_restaurant?.restaurant_type || '',
      renta_mensual: restaurant.monthly_rent || 0,
      facturación_último_año: restaurant.last_year_revenue || 0,
      tarifa_franquicia: restaurant.franchise_fee_percentage || 0,
      tarifa_publicidad: restaurant.advertising_fee_percentage || 0,
      estado: restaurant.status || ''
    }));

    exportToCSV(exportData, 'restaurantes', headers);
  };

  const exportProfitLossData = (data: any[]) => {
    const headers = [
      'Mes',
      'Año',
      'Ingresos Totales',
      'Costos Totales',
      'Beneficio Operativo',
      'Margen %'
    ];

    const exportData = data.map(item => ({
      mes: item.month,
      año: item.year,
      ingresos_totales: item.total_revenue || 0,
      costos_totales: (item.total_cost_of_sales || 0) + (item.total_labor || 0) + (item.total_operating_expenses || 0),
      beneficio_operativo: item.operating_income || 0,
      'margen_%': item.total_revenue > 0 ? ((item.operating_income / item.total_revenue) * 100).toFixed(2) : 0
    }));

    exportToCSV(exportData, 'profit_loss', headers);
  };

  return {
    exportToCSV,
    exportRestaurantsData,
    exportProfitLossData
  };
};
