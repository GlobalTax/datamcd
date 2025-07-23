import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BiloopCompany {
  id: string;
  name: string;
  taxId: string;
  address?: string;
  city?: string;
  email?: string;
  phone?: string;
}

export interface BiloopInvoice {
  id: string;
  number: string;
  date: string;
  companyId: string;
  companyName: string;
  total: number;
  status: string;
  dueDate?: string;
}

export interface BiloopCustomer {
  id: string;
  name: string;
  taxId: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface BiloopEmployee {
  id: string;
  name: string;
  surname: string;
  email?: string;
  phone?: string;
  dni?: string;
  position?: string;
  department?: string;
  salary?: number;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'inactive';
  contractType?: string;
  socialSecurityNumber?: string;
}

export interface BiloopWorker {
  id: string;
  name: string;
  surname: string;
  email?: string;
  phone?: string;
  dni?: string;
  position?: string;
  department?: string;
  status: 'active' | 'inactive';
  contractType?: string;
  workCenter?: string;
  category?: string;
}

export interface BiloopWorkerConcept {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: string;
  amount?: number;
  percentage?: number;
  formula?: string;
}

export interface BiloopEmployeeTransform {
  employees: BiloopEmployee[];
  companyId: string;
  format: 'a3nom' | 'a3eco' | 'a3';
}

export interface BiloopProfessionalPayment {
  id: string;
  professionalId: string;
  amount: number;
  date: string;
  description?: string;
  status: 'pending' | 'paid' | 'overdue';
  dueDate?: string;
}

export const useBiloop = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const callBiloopAPI = async (endpoint: string, method = 'GET', body?: any, params?: Record<string, string>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('biloop-integration', {
        body: { endpoint, method, body, params }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Verificar si la respuesta indica un error de la API de Biloop
      if (data && typeof data === 'object' && data.status === 'KO') {
        throw new Error(data.message || 'Error en la API de Biloop');
      }

      return data;
    } catch (error) {
      console.error('Biloop API error:', error);
      toast({
        title: 'Error de conexión con Biloop',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCompanies = async (): Promise<BiloopCompany[]> => {
    const data = await callBiloopAPI('/api-global/v1/companies');
    return data.companies || data || [];
  };

  const getInvoices = async (companyId?: string, dateFrom?: string, dateTo?: string): Promise<BiloopInvoice[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    const data = await callBiloopAPI('/api-global/v1/invoices', 'GET', undefined, params);
    return data.invoices || data || [];
  };

  const getCustomers = async (companyId?: string): Promise<BiloopCustomer[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;

    const data = await callBiloopAPI('/api-global/v1/customers', 'GET', undefined, params);
    return data.customers || data || [];
  };

  const createCustomer = async (customer: Omit<BiloopCustomer, 'id'>): Promise<BiloopCustomer> => {
    const data = await callBiloopAPI('/api-global/v1/customers', 'POST', customer);
    return data;
  };

  const createInvoice = async (invoice: Omit<BiloopInvoice, 'id'>): Promise<BiloopInvoice> => {
    const data = await callBiloopAPI('/api-global/v1/invoices', 'POST', invoice);
    return data;
  };

  const getInventory = async (companyId?: string): Promise<any[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;

    const data = await callBiloopAPI('/api-global/v1/inventory', 'GET', undefined, params);
    return data.items || data || [];
  };

  // Métodos específicos para empleados
  const getEmployees = async (companyId?: string): Promise<BiloopEmployee[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;

    const data = await callBiloopAPI('/api-global/v1/employees', 'GET', undefined, params);
    return data.employees || data || [];
  };

  const createEmployee = async (employee: Omit<BiloopEmployee, 'id'>): Promise<BiloopEmployee> => {
    const data = await callBiloopAPI('/api-global/v1/employees', 'POST', employee);
    return data;
  };

  const transformEmployeesToA3 = async (transformData: BiloopEmployeeTransform): Promise<string> => {
    const endpoint = `/api-global/v1/a3/transform/employees/json-to-${transformData.format}`;
    const data = await callBiloopAPI(endpoint, 'POST', {
      employees: transformData.employees,
      companyId: transformData.companyId
    });
    
    toast({
      title: 'Transformación exitosa',
      description: `Empleados transformados a formato ${transformData.format.toUpperCase()}`,
    });
    
    return data.txtContent || data.file || data;
  };

  const getProfessionalPayments = async (
    from: string, 
    to: string, 
    companyId?: string
  ): Promise<BiloopProfessionalPayment[]> => {
    const params: Record<string, string> = { from, to };
    if (companyId) params.companyId = companyId;

    const data = await callBiloopAPI('/api-global/v1/professional_payments', 'GET', undefined, params);
    return data.payments || data || [];
  };

  const getOverduePayments = async (
    from: string, 
    to: string, 
    companyId?: string
  ): Promise<BiloopProfessionalPayment[]> => {
    const params: Record<string, string> = { from, to };
    if (companyId) params.companyId = companyId;

    const data = await callBiloopAPI('/api-global/v1/professional_overdue_payments', 'GET', undefined, params);
    return data.overduePayments || data || [];
  };

  const getMovements = async (
    from: string,
    to: string,
    companyId?: string
  ): Promise<any[]> => {
    const params: Record<string, string> = { from, to };
    if (companyId) params.companyId = companyId;

    const data = await callBiloopAPI('/api-global/v1/movements', 'GET', undefined, params);
    return data.movements || data || [];
  };

  const transformMovementsToA3ECO = async (movements: any[], companyId: string): Promise<string> => {
    const data = await callBiloopAPI('/api-global/v1/a3/transform/movements/json-to-a3eco', 'POST', {
      movements,
      companyId
    });
    
    toast({
      title: 'Transformación exitosa',
      description: 'Movimientos transformados a formato A3ECO',
    });
    
    return data.txtContent || data.file || data;
  };

  // Métodos específicos para trabajadores (labor)
  const getWorkers = async (companyId?: string): Promise<BiloopWorker[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;

    const data = await callBiloopAPI('/api-global/v1/labor/getWorkers', 'GET', undefined, params);
    return data.workers || data || [];
  };

  const getWorkersConcepts = async (companyId?: string): Promise<BiloopWorkerConcept[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;

    const data = await callBiloopAPI('/api-global/v1/labor/getWorkersConcepts', 'GET', undefined, params);
    return data.concepts || data || [];
  };

  const testConnection = async (): Promise<boolean> => {
    try {
      // Probar conexión básica con el endpoint de empresas
      const data = await callBiloopAPI('/api-global/v1/companies');
      toast({
        title: 'Conexión exitosa',
        description: 'Conectado correctamente a Biloop',
      });
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar a Biloop. Verifica las credenciales y endpoints.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    loading,
    // Métodos generales
    getCompanies,
    getInvoices,
    getCustomers,
    createCustomer,
    createInvoice,
    getInventory,
    testConnection,
    callBiloopAPI,
    
    // Métodos específicos para empleados
    getEmployees,
    createEmployee,
    transformEmployeesToA3,
    getProfessionalPayments,
    getOverduePayments,
    getMovements,
    transformMovementsToA3ECO,
    
    // Métodos específicos para trabajadores (labor)
    getWorkers,
    getWorkersConcepts,
  };
};