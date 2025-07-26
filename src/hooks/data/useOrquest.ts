import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  OrquestService, 
  OrquestMeasure, 
  OrquestMeasureType,
  OrquestMeasuresQueryParams 
} from '@/types/orquest';
import { 
  OrquestServiceAPI,
  OrquestEmployee,
  OrquestMeasureSent,
  OrquestMeasureReceived,
  SendMeasureResponse,
  FetchMeasuresResponse
} from '@/services/api/orquestService';

interface OrquestConfig {
  mode?: 'services' | 'measures' | 'employees' | 'all';
  franchiseeId?: string;
  autoFetch?: boolean;
}

export const useOrquest = (config?: OrquestConfig) => {
  const [services, setServices] = useState<OrquestService[]>([]);
  const [employees, setEmployees] = useState<OrquestEmployee[]>([]);
  const [measuresSent, setMeasuresSent] = useState<OrquestMeasureSent[]>([]);
  const [measuresReceived, setMeasuresReceived] = useState<OrquestMeasureReceived[]>([]);
  const [measures, setMeasures] = useState<OrquestMeasure[]>([]);
  const [measureTypes, setMeasureTypes] = useState<OrquestMeasureType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { 
    mode = 'all', 
    franchiseeId, 
    autoFetch = true 
  } = config || {};

  // ============= SERVICIOS =============
  const fetchServices = async () => {
    if (mode !== 'services' && mode !== 'all') return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await OrquestServiceAPI.fetchServices(franchiseeId);
      setServices(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar servicios de Orquest';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateService = async (serviceId: string, updates: Partial<OrquestService>) => {
    try {
      await OrquestServiceAPI.updateService(serviceId, updates);
      await fetchServices();
      
      toast({
        title: "Servicio actualizado",
        description: "El servicio se ha actualizado correctamente",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar servicio';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // ============= EMPLEADOS =============
  const fetchEmployees = async () => {
    if (mode !== 'employees' && mode !== 'all') return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await OrquestServiceAPI.fetchEmployees(franchiseeId);
      setEmployees(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar empleados de Orquest';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ============= SINCRONIZACIÓN =============
  const syncServices = async () => {
    if (!franchiseeId) {
      throw new Error('franchiseeId is required for sync operations');
    }

    try {
      setLoading(true);
      
      const data = await OrquestServiceAPI.syncAll(franchiseeId);
      
      await Promise.all([fetchServices(), fetchEmployees()]);
      
      const successMessage = data.employees_updated 
        ? `${data.services_updated} servicios y ${data.employees_updated} empleados actualizados`
        : `${data.services_updated} servicios actualizados`;
      
      toast({
        title: "Sincronización exitosa",
        description: successMessage,
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en la sincronización';
      console.error('Orquest sync error:', err);
      setError(errorMessage);
      toast({
        title: "Error de sincronización",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const syncEmployees = async () => {
    if (!franchiseeId) {
      throw new Error('franchiseeId is required for sync operations');
    }

    try {
      setLoading(true);
      
      const data = await OrquestServiceAPI.syncEmployeesOnly(franchiseeId);
      
      await fetchEmployees();
      
      toast({
        title: "Sincronización de empleados exitosa",
        description: `${data.employees_updated || 0} empleados actualizados`,
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en la sincronización de empleados';
      console.error('Orquest employees sync error:', err);
      setError(errorMessage);
      toast({
        title: "Error de sincronización",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ============= MEDIDAS ENVIADAS =============
  const fetchMeasuresSent = async () => {
    if (mode !== 'measures' && mode !== 'all') return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await OrquestServiceAPI.fetchMeasuresSent();
      setMeasuresSent(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar medidas enviadas';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMeasure = async (
    serviceId: string,
    measureType: string,
    periodFrom: string,
    periodTo: string
  ): Promise<SendMeasureResponse | null> => {
    if (!franchiseeId) {
      throw new Error('franchiseeId is required for sending measures');
    }

    try {
      setLoading(true);
      
      const data = await OrquestServiceAPI.sendMeasure(
        franchiseeId,
        serviceId,
        measureType,
        periodFrom,
        periodTo
      );

      await fetchMeasuresSent();
      
      toast({
        title: "Medida enviada exitosamente",
        description: `${measureType}: ${data.value} enviado a servicio ${serviceId}`,
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar medida';
      setError(errorMessage);
      toast({
        title: "Error al enviar medida",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Métodos de conveniencia para enviar tipos específicos de medidas
  const sendSalesData = async (serviceId: string, periodFrom: string, periodTo: string) => {
    return sendMeasure(serviceId, 'SALES', periodFrom, periodTo);
  };

  const sendLaborCostData = async (serviceId: string, periodFrom: string, periodTo: string) => {
    return sendMeasure(serviceId, 'LABOR_COST', periodFrom, periodTo);
  };

  const sendFoodCostData = async (serviceId: string, periodFrom: string, periodTo: string) => {
    return sendMeasure(serviceId, 'FOOD_COST', periodFrom, periodTo);
  };

  const sendOperatingExpensesData = async (serviceId: string, periodFrom: string, periodTo: string) => {
    return sendMeasure(serviceId, 'OPERATING_EXPENSES', periodFrom, periodTo);
  };

  const sendNetProfitData = async (serviceId: string, periodFrom: string, periodTo: string) => {
    return sendMeasure(serviceId, 'NET_PROFIT', periodFrom, periodTo);
  };

  // ============= MEDIDAS RECIBIDAS =============
  const fetchMeasuresReceived = async () => {
    if (mode !== 'measures' && mode !== 'all') return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await OrquestServiceAPI.fetchMeasuresReceived(franchiseeId);
      setMeasuresReceived(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar medidas recibidas';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMeasuresFromOrquest = async (
    serviceId: string,
    startDate: string,
    endDate: string,
    demandTypes?: string[]
  ): Promise<FetchMeasuresResponse | null> => {
    if (!franchiseeId) {
      throw new Error('franchiseeId is required');
    }

    try {
      setLoading(true);
      setError(null);

      const data = await OrquestServiceAPI.fetchMeasuresFromOrquest(
        franchiseeId,
        serviceId,
        startDate,
        endDate,
        demandTypes
      );

      if (data?.success) {
        await fetchMeasuresReceived();
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching measures from Orquest';
      setError(errorMessage);
      console.error('Error fetching measures from Orquest:', err);
      return {
        success: false,
        measures_fetched: 0,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // ============= MEDIDAS EXTENDIDAS =============
  const fetchMeasures = async (params?: OrquestMeasuresQueryParams) => {
    if (mode !== 'measures' && mode !== 'all') return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await OrquestServiceAPI.fetchMeasures(params);
      setMeasures(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar medidas de Orquest';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMeasureTypes = async () => {
    if (mode !== 'measures' && mode !== 'all') return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await OrquestServiceAPI.fetchMeasureTypes();
      setMeasureTypes(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar tipos de medidas';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncMeasuresFromOrquest = async (serviceId: string, date: string) => {
    if (!franchiseeId) {
      throw new Error('franchiseeId is required for sync operations');
    }
    
    try {
      setLoading(true);
      
      const data = await OrquestServiceAPI.syncMeasuresFromOrquest(franchiseeId, serviceId, date);
      
      await fetchMeasures({ service_id: serviceId, from_date: date, to_date: date });
      
      toast({
        title: "Sincronización exitosa",
        description: `${data.measures_updated} medidas actualizadas desde Orquest`,
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en la sincronización de medidas';
      setError(errorMessage);
      toast({
        title: "Error de sincronización",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addMeasure = async (measure: Omit<OrquestMeasure, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      
      await OrquestServiceAPI.addMeasure(measure);
      await fetchMeasures();
      
      toast({
        title: "Medida agregada",
        description: "La medida se ha agregado correctamente",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar medida';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMeasure = async (id: string, updates: Partial<OrquestMeasure>) => {
    try {
      setLoading(true);
      setError(null);
      
      await OrquestServiceAPI.updateMeasure(id, updates);
      await fetchMeasures();
      
      toast({
        title: "Medida actualizada",
        description: "La medida se ha actualizado correctamente",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar medida';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteMeasure = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await OrquestServiceAPI.deleteMeasure(id);
      await fetchMeasures();
      
      toast({
        title: "Medida eliminada",
        description: "La medida se ha eliminado correctamente",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar medida';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ============= UTILIDADES =============
  const getMeasuresByService = (serviceId: string) => 
    OrquestServiceAPI.getMeasuresByService(measures, serviceId);

  const getMeasuresByType = (measureType: string) => 
    OrquestServiceAPI.getMeasuresByType(measures, measureType);

  const getMeasuresByPeriod = (startDate: string, endDate: string) => 
    OrquestServiceAPI.getMeasuresByPeriod(measures, startDate, endDate);

  const getRecentMeasures = (days: number = 7) => 
    OrquestServiceAPI.getRecentMeasures(measures, days);

  const getMeasureTypeInfo = (measureType: string) => 
    OrquestServiceAPI.getMeasureTypeInfo(measureTypes, measureType);

  const formatMeasureValue = (value: number, measureType: string) => 
    OrquestServiceAPI.formatMeasureValue(value, measureType, measureTypes);

  const getMeasureDisplayName = (measureType: string) => 
    OrquestServiceAPI.getMeasureDisplayName(measureTypes, measureType);

  // Utilities para medidas enviadas
  const getMeasuresSentByService = (serviceId: string) => 
    OrquestServiceAPI.getMeasuresSentByService(measuresSent, serviceId);

  const getMeasuresSentByType = (measureType: string) => 
    OrquestServiceAPI.getMeasuresSentByType(measuresSent, measureType);

  const getRecentMeasuresSent = (days: number = 7) => 
    OrquestServiceAPI.getRecentMeasuresSent(measuresSent, days);

  // Utilities para medidas recibidas
  const getMeasuresReceivedByService = (serviceId: string) => 
    OrquestServiceAPI.getMeasuresReceivedByService(measuresReceived, serviceId);

  const getMeasuresReceivedByType = (measureType: string) => 
    OrquestServiceAPI.getMeasuresReceivedByType(measuresReceived, measureType);

  const getMeasuresReceivedByPeriod = (startDate: string, endDate: string) => 
    OrquestServiceAPI.getMeasuresReceivedByPeriod(measuresReceived, startDate, endDate);

  const getRecentMeasuresReceived = (days: number = 7) => 
    OrquestServiceAPI.getRecentMeasuresReceived(measuresReceived, days);

  // ============= EFFECTS =============
  useEffect(() => {
    if (autoFetch) {
      fetchMeasureTypes();
      
      if (mode === 'services' || mode === 'all') {
        fetchServices();
      }
      if (mode === 'employees' || mode === 'all') {
        fetchEmployees();
      }
      if (mode === 'measures' || mode === 'all') {
        fetchMeasuresSent();
        fetchMeasuresReceived();
        fetchMeasures();
      }
    }
  }, [franchiseeId, mode, autoFetch]);

  return {
    // Estado
    services,
    employees,
    measuresSent,
    measuresReceived,
    measures,
    measureTypes,
    loading,
    error,

    // Servicios
    fetchServices,
    updateService,
    syncServices,

    // Empleados
    fetchEmployees,
    syncEmployees,

    // Medidas enviadas
    fetchMeasuresSent,
    sendMeasure,
    sendSalesData,
    sendLaborCostData,
    sendFoodCostData,
    sendOperatingExpensesData,
    sendNetProfitData,

    // Medidas recibidas
    fetchMeasuresReceived,
    fetchMeasuresFromOrquest,

    // Medidas extendidas
    fetchMeasures,
    fetchMeasureTypes,
    syncMeasuresFromOrquest,
    addMeasure,
    updateMeasure,
    deleteMeasure,

    // Utilidades
    getMeasuresByService,
    getMeasuresByType,
    getMeasuresByPeriod,
    getRecentMeasures,
    getMeasureTypeInfo,
    formatMeasureValue,
    getMeasureDisplayName,
    getMeasuresSentByService,
    getMeasuresSentByType,
    getRecentMeasuresSent,
    getMeasuresReceivedByService,
    getMeasuresReceivedByType,
    getMeasuresReceivedByPeriod,
    getRecentMeasuresReceived,

    // Refetch general
    refetch: () => {
      if (mode === 'services' || mode === 'all') fetchServices();
      if (mode === 'employees' || mode === 'all') fetchEmployees();
      if (mode === 'measures' || mode === 'all') {
        fetchMeasuresSent();
        fetchMeasuresReceived();
        fetchMeasures();
      }
    }
  };
};