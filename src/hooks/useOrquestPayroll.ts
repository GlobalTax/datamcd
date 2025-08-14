import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PayrollSyncResponse {
  success: boolean;
  message?: string;
  error?: string;
  payroll_records_imported: number;
  service_id?: string;
  period?: string;
}

export const useOrquestPayroll = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const importPayrollFromOrquest = async (
    franchiseeId: string,
    serviceId: string = '1058',
    startDate: string = '2025-01-01',
    endDate: string = '2025-01-31'
  ): Promise<PayrollSyncResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!franchiseeId) {
        throw new Error('franchiseeId is required for payroll import');
      }
      
      // Validate franchiseeId format
      if (!franchiseeId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        throw new Error('Invalid franchiseeId format. Expected UUID format.');
      }
      
      console.log('Importing payroll from Orquest:', {
        franchiseeId,
        serviceId,
        startDate,
        endDate
      });
      
      const { data, error: syncError } = await supabase.functions.invoke('orquest-payroll-sync', {
        body: { 
          action: 'import_payroll',
          franchiseeId,
          serviceId,
          startDate,
          endDate
        }
      });

      if (syncError) {
        console.error('Orquest payroll sync error:', syncError);
        throw syncError;
      }

      const successMessage = data.payroll_records_imported > 0
        ? `${data.payroll_records_imported} registros de nómina importados exitosamente del servicio ${data.service_id}`
        : 'Importación completada sin nuevos registros';
      
      toast({
        title: "Importación de nómina exitosa",
        description: successMessage,
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en la importación de nómina';
      console.error('Orquest payroll import error:', err);
      setError(errorMessage);
      toast({
        title: "Error en importación de nómina",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const importPayrollForPeriod = async (
    franchiseeId: string,
    year: number,
    month: number,
    serviceId: string = '1058'
  ): Promise<PayrollSyncResponse | null> => {
    // Crear fechas de inicio y fin para el mes especificado
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate(); // Último día del mes
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
    
    return await importPayrollFromOrquest(franchiseeId, serviceId, startDate, endDate);
  };

  const importJanuaryPayroll = async (franchiseeId: string): Promise<PayrollSyncResponse | null> => {
    return await importPayrollForPeriod(franchiseeId, 2025, 1, '1058');
  };

  return {
    loading,
    error,
    importPayrollFromOrquest,
    importPayrollForPeriod,
    importJanuaryPayroll,
  };
};