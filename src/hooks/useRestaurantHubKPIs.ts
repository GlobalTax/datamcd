import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedRestaurant } from './useUnifiedRestaurants';

export interface RestaurantHubKPIs {
  // KPIs Generales
  totalRevenue: number;
  revenueGrowth: number;
  
  // Equipo
  activeEmployees: number;
  monthlyTurnover: number;
  
  // Nómina
  monthlyCost: number;
  hoursWorked: number;
  
  // P&L
  ebitda: number;
  netMargin: number;
  
  // Presupuesto
  monthlyDeviation: number;
  yearProgress: number;
  
  // Incidencias
  activeIncidents: number;
  avgResolutionTime: number;
  
  // Integraciones
  orquestStatus: 'connected' | 'disconnected' | 'error';
  biloopStatus: 'connected' | 'disconnected' | 'error';
  lastSync: string | null;
  
  // Documentos
  pendingDocuments: number;
  lastUpdate: string | null;
}

export const useRestaurantHubKPIs = (restaurantId: string | undefined): {
  kpis: RestaurantHubKPIs | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} => {
  // Usar el hook de restaurante unificado para datos básicos
  const { data: restaurant } = useUnifiedRestaurant(restaurantId);

  const query = useQuery({
    queryKey: ['restaurant-hub-kpis', restaurantId],
    queryFn: async (): Promise<RestaurantHubKPIs> => {
      if (!restaurantId) {
        throw new Error('Restaurant ID is required');
      }

      console.log('Fetching KPIs for restaurant:', restaurantId);

      // Parallelizar todas las consultas para mejor performance
      const [
        employeesData,
        incidentsData,
        budgetData,
        integrationsData,
        payrollData,
        timeTrackingData
      ] = await Promise.allSettled([
        // Empleados activos (usar restaurant_id)
        supabase
          .from('employees')
          .select('id', { count: 'exact', head: true })
          .eq('restaurant_id', restaurantId)
          .eq('status', 'active'),
        
        // Incidencias activas (usar restaurant_id)
        supabase
          .from('incidents')
          .select('id, created_at, resolved_at', { count: 'exact' })
          .eq('restaurant_id', restaurantId)
          .in('status', ['open', 'pending', 'in_progress']),
        
        // Presupuesto año actual (usar restaurant_id)
        supabase
          .from('annual_budgets')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .eq('year', new Date().getFullYear()),
        
        // Configuraciones de integración (usar restaurant_id)
        supabase
          .from('integration_configs')
          .select('integration_type, is_active, last_sync')
          .eq('restaurant_id', restaurantId),

        // Nómina del mes actual (provisional - evitar query compleja)
        Promise.resolve({ data: [], error: null }),

        // Horas trabajadas del mes actual (usar restaurant_id)
        supabase
          .from('employee_time_tracking')
          .select('total_hours')
          .eq('restaurant_id', restaurantId)
          .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
          .lt('date', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split('T')[0])
      ]);

      // Procesar resultados con valores por defecto
      const employeeCount = employeesData.status === 'fulfilled' ? employeesData.value.count || 0 : 0;
      const incidentsResult = incidentsData.status === 'fulfilled' ? incidentsData.value : { count: 0, data: [] };
      const budgets = budgetData.status === 'fulfilled' ? budgetData.value.data || [] : [];
      const integrations = integrationsData.status === 'fulfilled' ? integrationsData.value.data || [] : [];
      const payroll = payrollData.status === 'fulfilled' ? payrollData.value.data || [] : [];
      const timeTracking = timeTrackingData.status === 'fulfilled' ? timeTrackingData.value.data || [] : [];

      // Usar datos del restaurante unificado
      const totalRevenue = restaurant?.last_year_revenue || 0;
      const monthlyRevenue = restaurant?.average_monthly_sales || 0;
      
      // Calcular progreso del año (% del año transcurrido)
      const now = new Date();
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const yearProgress = ((now.getTime() - yearStart.getTime()) / (365 * 24 * 60 * 60 * 1000)) * 100;
      
      // Calcular desviación presupuestaria (simplificado)
      const currentMonth = now.getMonth();
      const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      let budgetedForMonth = 0;
      budgets.forEach(budget => {
        budgetedForMonth += budget[monthKeys[currentMonth]] || 0;
      });
      const monthlyDeviation = budgetedForMonth > 0 ? 
        ((monthlyRevenue - budgetedForMonth) / budgetedForMonth) * 100 : 0;

      // Calcular costes de nómina del mes
      const monthlyCost = payroll.reduce((sum, p) => sum + (p.gross_pay || 0), 0);

      // Calcular horas trabajadas del mes
      const hoursWorked = timeTracking.reduce((sum, t) => sum + (t.total_hours || 0), 0);

      // Tiempo promedio de resolución de incidencias (en horas)
      const resolvedIncidents = (incidentsResult.data || []).filter(i => i.resolved_at);
      let avgResolutionTime = 0;
      if (resolvedIncidents.length > 0) {
        const totalTime = resolvedIncidents.reduce((sum, incident) => {
          const created = new Date(incident.created_at);
          const resolved = new Date(incident.resolved_at);
          return sum + (resolved.getTime() - created.getTime());
        }, 0);
        avgResolutionTime = totalTime / resolvedIncidents.length / (1000 * 60 * 60); // en horas
      }

      // Estados de integración
      const orquestIntegration = integrations.find(i => i.integration_type === 'orquest');
      const biloopIntegration = integrations.find(i => i.integration_type === 'biloop');
      
      const orquestStatus = orquestIntegration?.is_active ? 'connected' : 'disconnected';
      const biloopStatus = biloopIntegration?.is_active ? 'connected' : 'disconnected';
      
      const lastSyncTimes = integrations.map(i => i.last_sync).filter(Boolean);
      const lastSync = lastSyncTimes.length > 0 ? 
        Math.max(...lastSyncTimes.map(d => new Date(d).getTime())) : null;

      return {
        // KPIs Generales
        totalRevenue,
        revenueGrowth: 0, // TODO: Calcular basado en datos históricos
        
        // Equipo  
        activeEmployees: employeeCount,
        monthlyTurnover: 0, // TODO: Calcular basado en contrataciones/bajas
        
        // Nómina
        monthlyCost,
        hoursWorked,
        
        // P&L
        ebitda: 0, // TODO: Calcular basado en P&L data
        netMargin: 0, // TODO: Calcular basado en P&L data
        
        // Presupuesto
        monthlyDeviation,
        yearProgress,
        
        // Incidencias
        activeIncidents: incidentsResult.count || 0,
        avgResolutionTime,
        
        // Integraciones
        orquestStatus,
        biloopStatus,
        lastSync: lastSync ? new Date(lastSync).toISOString() : null,
        
        // Documentos
        pendingDocuments: 0, // TODO: Implementar sistema de documentos
        lastUpdate: null, // TODO: Implementar sistema de documentos
      };
    },
    enabled: !!restaurantId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // Refrescar cada 5 minutos
  });

  return {
    kpis: query.data || null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
};