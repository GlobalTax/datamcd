
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

  return {
    exporting,
    exportToCSV
  };
};
