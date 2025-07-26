import { supabase } from '@/integrations/supabase/client';
import { 
  OrquestService, 
  OrquestSyncResponse,
  OrquestMeasure, 
  OrquestMeasureType, 
  OrquestMeasuresSyncResponse,
  OrquestMeasuresQueryParams 
} from '@/types/orquest';

// Types para servicios consolidados
export interface OrquestEmployee {
  id: string;
  service_id: string;
  nombre: string | null;
  apellidos: string | null;
  email: string | null;
  telefono: string | null;
  puesto: string | null;
  departamento: string | null;
  fecha_alta: string | null;
  fecha_baja: string | null;
  estado: string | null;
  datos_completos: any;
  updated_at: string | null;
}

export interface OrquestMeasureSent {
  id: string;
  franchisee_id: string;
  service_id: string;
  measure_type: string;
  value: number;
  period_from: string;
  period_to: string;
  restaurant_id?: string;
  sent_at: string;
  status: string;
  error_message?: string;
  orquest_response?: any;
  created_at: string;
  updated_at: string;
}

export interface OrquestMeasureReceived {
  id: string;
  service_id: string;
  measure_type: string;
  value: number;
  from_time: string;
  to_time: string;
  measure_category: string;
  franchisee_id: string;
  raw_data: any;
  created_at: string;
  updated_at: string;
}

export interface SendMeasureResponse {
  success: boolean;
  measures_sent: number;
  measure_type?: string;
  value?: number;
  service_id?: string;
  error?: string;
}

export interface FetchMeasuresResponse {
  success: boolean;
  measures_fetched: number;
  service_id?: string;
  period?: { from: string; to: string };
  error?: string;
}

export class OrquestServiceAPI {
  // ============= SERVICIOS =============
  static async fetchServices(franchiseeId?: string): Promise<OrquestService[]> {
    let query = supabase
      .from('servicios_orquest')
      .select('*');
    
    if (franchiseeId) {
      query = query.eq('franchisee_id', franchiseeId);
    }
    
    const { data, error } = await query.order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async updateService(serviceId: string, updates: Partial<OrquestService>): Promise<void> {
    const { error } = await supabase
      .from('servicios_orquest')
      .update(updates)
      .eq('id', serviceId);
    
    if (error) throw error;
  }

  // ============= EMPLEADOS =============
  static async fetchEmployees(franchiseeId?: string): Promise<OrquestEmployee[]> {
    let query = supabase
      .from('orquest_employees')
      .select('*');
    
    if (franchiseeId) {
      query = query.eq('franchisee_id', franchiseeId);
    }
    
    const { data, error } = await query.order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  // ============= SINCRONIZACIÓN =============
  static async syncAll(franchiseeId: string): Promise<OrquestSyncResponse> {
    if (!franchiseeId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new Error('Invalid franchiseeId format. Expected UUID format.');
    }

    const { data, error } = await supabase.functions.invoke('orquest-sync', {
      body: { action: 'sync_all', franchiseeId }
    });

    if (error) throw error;
    return data;
  }

  static async syncEmployeesOnly(franchiseeId: string): Promise<OrquestSyncResponse> {
    if (!franchiseeId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new Error('Invalid franchiseeId format. Expected UUID format.');
    }

    const { data, error } = await supabase.functions.invoke('orquest-sync', {
      body: { action: 'sync_employees', franchiseeId }
    });

    if (error) throw error;
    return data;
  }

  // ============= MEDIDAS ENVIADAS =============
  static async fetchMeasuresSent(): Promise<OrquestMeasureSent[]> {
    const { data, error } = await supabase
      .from('orquest_measures_sent')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  }

  static async sendMeasure(
    franchiseeId: string,
    serviceId: string,
    measureType: string,
    periodFrom: string,
    periodTo: string
  ): Promise<SendMeasureResponse> {
    const { data, error } = await supabase.functions.invoke('orquest-sync', {
      body: { 
        action: 'send_measures', 
        franchiseeId,
        serviceId,
        measureType,
        periodFrom,
        periodTo
      }
    });

    if (error) throw error;
    return data;
  }

  // ============= MEDIDAS RECIBIDAS =============
  static async fetchMeasuresReceived(franchiseeId?: string): Promise<OrquestMeasureReceived[]> {
    let query = supabase
      .from('orquest_measures')
      .select('*');
    
    if (franchiseeId) {
      query = query.eq('franchisee_id', franchiseeId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async fetchMeasuresFromOrquest(
    franchiseeId: string,
    serviceId: string,
    startDate: string,
    endDate: string,
    demandTypes?: string[]
  ): Promise<FetchMeasuresResponse> {
    const { data, error } = await supabase.functions.invoke('orquest-sync', {
      body: {
        action: 'fetch_measures',
        franchiseeId,
        serviceId,
        startDate,
        endDate,
        demandTypes: demandTypes || ['SALES', 'TICKETS']
      }
    });

    if (error) throw error;
    return data;
  }

  // ============= MEDIDAS EXTENDIDAS =============
  static async fetchMeasures(params?: OrquestMeasuresQueryParams): Promise<OrquestMeasure[]> {
    let query = supabase
      .from('orquest_measures')
      .select('*')
      .order('from_time', { ascending: false });

    if (params) {
      if (params.service_id) {
        query = query.eq('service_id', params.service_id);
      }
      if (params.from_date) {
        query = query.gte('from_time', `${params.from_date}T00:00:00Z`);
      }
      if (params.to_date) {
        query = query.lte('from_time', `${params.to_date}T23:59:59Z`);
      }
      if (params.measure_types && params.measure_types.length > 0) {
        query = query.in('measure_type', params.measure_types);
      }
      if (params.category) {
        query = query.eq('measure_category', params.category);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as OrquestMeasure[];
  }

  static async fetchMeasureTypes(): Promise<OrquestMeasureType[]> {
    const { data, error } = await supabase
      .from('orquest_measure_types')
      .select('*')
      .eq('is_active', true)
      .order('display_name');

    if (error) throw error;
    return data || [];
  }

  static async syncMeasuresFromOrquest(
    franchiseeId: string,
    serviceId: string, 
    date: string
  ): Promise<OrquestMeasuresSyncResponse> {
    const { data, error } = await supabase.functions.invoke('orquest-sync', {
      body: { 
        action: 'fetch_measures', 
        franchiseeId,
        serviceId,
        startDate: date,
        endDate: date,
        demandTypes: ['SALES', 'TICKETS', 'FOOTFALL', 'ORDERS', 'AVERAGE_TICKET']
      }
    });

    if (error) throw error;
    
    return {
      success: true,
      measures_updated: data.measures_fetched || 0,
      measures_sent: 0,
      last_sync: new Date().toISOString(),
    };
  }

  static async addMeasure(measure: Omit<OrquestMeasure, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const { error } = await supabase
      .from('orquest_measures')
      .insert(measure);

    if (error) throw error;
  }

  static async updateMeasure(id: string, updates: Partial<OrquestMeasure>): Promise<void> {
    const { error } = await supabase
      .from('orquest_measures')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  static async deleteMeasure(id: string): Promise<void> {
    const { error } = await supabase
      .from('orquest_measures')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ============= UTILIDADES =============
  static getMeasuresByService(measures: OrquestMeasure[], serviceId: string): OrquestMeasure[] {
    return measures.filter(m => m.service_id === serviceId);
  }

  static getMeasuresByType(measures: OrquestMeasure[], measureType: string): OrquestMeasure[] {
    return measures.filter(m => m.measure_type === measureType);
  }

  static getMeasuresByPeriod(measures: OrquestMeasure[], startDate: string, endDate: string): OrquestMeasure[] {
    return measures.filter(m => 
      m.from_time >= `${startDate}T00:00:00Z` && 
      m.from_time <= `${endDate}T23:59:59Z`
    );
  }

  static getRecentMeasures(measures: OrquestMeasure[], days: number = 7): OrquestMeasure[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return measures.filter(m => new Date(m.from_time) >= cutoffDate);
  }

  static getMeasureTypeInfo(measureTypes: OrquestMeasureType[], measureType: string): OrquestMeasureType | undefined {
    return measureTypes.find(mt => mt.measure_type === measureType);
  }

  static formatMeasureValue(value: number, measureType: string, measureTypes: OrquestMeasureType[]): string {
    const typeInfo = this.getMeasureTypeInfo(measureTypes, measureType);
    const unit = typeInfo?.unit;
    
    if (unit === 'EUR') {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }).format(value);
    }
    if (unit === 'PERCENTAGE') {
      return `${value.toFixed(2)}%`;
    }
    if (unit === 'HOURS') {
      return `${value.toFixed(1)}h`;
    }
    if (unit === 'SCORE') {
      return `${value.toFixed(1)} pts`;
    }
    return value.toFixed(2);
  }

  static getMeasureDisplayName(measureTypes: OrquestMeasureType[], measureType: string): string {
    const typeInfo = this.getMeasureTypeInfo(measureTypes, measureType);
    return typeInfo?.display_name || measureType;
  }

  // Utilities para medidas enviadas y recibidas
  static getMeasuresSentByService(measures: OrquestMeasureSent[], serviceId: string): OrquestMeasureSent[] {
    return measures.filter(m => m.service_id === serviceId);
  }

  static getMeasuresSentByType(measures: OrquestMeasureSent[], measureType: string): OrquestMeasureSent[] {
    return measures.filter(m => m.measure_type === measureType);
  }

  static getRecentMeasuresSent(measures: OrquestMeasureSent[], days: number = 7): OrquestMeasureSent[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return measures.filter(m => new Date(m.sent_at) >= cutoffDate);
  }

  static getMeasuresReceivedByService(measures: OrquestMeasureReceived[], serviceId: string): OrquestMeasureReceived[] {
    return measures.filter(m => m.service_id === serviceId);
  }

  static getMeasuresReceivedByType(measures: OrquestMeasureReceived[], measureType: string): OrquestMeasureReceived[] {
    return measures.filter(m => m.measure_type === measureType);
  }

  static getMeasuresReceivedByPeriod(measures: OrquestMeasureReceived[], startDate: string, endDate: string): OrquestMeasureReceived[] {
    return measures.filter(m => {
      const fromTime = new Date(m.from_time);
      const toTime = new Date(m.to_time);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return fromTime >= start && toTime <= end;
    });
  }

  static getRecentMeasuresReceived(measures: OrquestMeasureReceived[], days: number = 7): OrquestMeasureReceived[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return measures.filter(m => 
      new Date(m.created_at) >= cutoffDate
    );
  }
}