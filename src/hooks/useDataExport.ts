import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export const useDataExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async (elementId: string, filename: string) => {
    try {
      setIsExporting(true);
      const element = document.getElementById(elementId);
      if (!element) {
        toast.error('Elemento no encontrado para exportar');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${filename}.pdf`);
      toast.success('PDF exportado correctamente');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Error al exportar PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async (data: any[], filename: string, sheetName = 'Datos') => {
    try {
      setIsExporting(true);
      
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      
      XLSX.writeFile(wb, `${filename}.xlsx`);
      toast.success('Excel exportado correctamente');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Error al exportar Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const exportEmployeesToExcel = (employees: any[], filename = 'empleados') => {
    const formattedData = employees.map(emp => ({
      'Número': emp.employee_number,
      'Nombre': emp.first_name,
      'Apellidos': emp.last_name,
      'Email': emp.email || '',
      'Teléfono': emp.phone || '',
      'Puesto': emp.position,
      'Departamento': emp.department || '',
      'Tipo Contrato': emp.contract_type,
      'Fecha Contratación': new Date(emp.hire_date).toLocaleDateString('es-ES'),
      'Salario Base': emp.base_salary || 0,
      'Horas Semanales': emp.weekly_hours || 0,
      'Vacaciones/Año': emp.vacation_days_per_year,
      'Vacaciones Usadas': emp.vacation_days_used,
      'Estado': emp.status
    }));

    exportToExcel(formattedData, filename, 'Empleados');
  };

  const exportRestaurantsData = (data: any[], filename = 'restaurantes') => {
    exportToExcel(data, filename, 'Restaurantes');
  };

  return {
    isExporting,
    exportToPDF,
    exportToExcel,
    exportEmployeesToExcel,
    exportRestaurantsData
  };
};