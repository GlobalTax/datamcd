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

  const testConnection = async (): Promise<boolean> => {
    try {
      await getCompanies();
      toast({
        title: 'Conexión exitosa',
        description: 'Conectado correctamente a Biloop',
      });
      return true;
    } catch (error) {
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar a Biloop',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    loading,
    getCompanies,
    getInvoices,
    getCustomers,
    createCustomer,
    createInvoice,
    getInventory,
    testConnection,
    callBiloopAPI,
  };
};