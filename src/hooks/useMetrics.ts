import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  MetricDefinition, 
  MetricSnapshot, 
  MetricDashboardData 
} from "@/types/newIncident";

export const useMetrics = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener definiciones de métricas
  const {
    data: metricDefinitions,
    isLoading: isLoadingDefinitions,
  } = useQuery({
    queryKey: ["metric-definitions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("metric_definitions")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true });

      if (error) throw error;
      return data as MetricDefinition[];
    },
  });

  // Obtener snapshots de métricas para dashboard
  const {
    data: dashboardMetrics,
    isLoading: isLoadingDashboard,
  } = useQuery({
    queryKey: ["metrics-dashboard"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("metric_snapshots")
        .select(`
          *,
          metric:metric_definitions(*)
        `)
        .eq("snapshot_date", today)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const snapshots = data as (MetricSnapshot & { metric: MetricDefinition })[];
      
      // Organizar métricas por código para fácil acceso
      const metricsMap = snapshots.reduce((acc, snapshot) => {
        if (snapshot.metric) {
          acc[snapshot.metric.code] = snapshot;
        }
        return acc;
      }, {} as Record<string, MetricSnapshot>);

      return {
        mttr: metricsMap['MTTR'],
        mtta: metricsMap['MTTA'],
        totalIncidents: metricsMap['INCIDENT_COUNT'],
        criticalIncidents: metricsMap['CRITICAL_INCIDENTS'],
        capexTotal: metricsMap['CAPEX_TOTAL'],
        allMetrics: snapshots
      };
    },
  });

  // Calcular métricas manualmente (para casos donde no hay snapshots)
  const calculateMetrics = useMutation({
    mutationFn: async (restaurantId?: string) => {
      const results = [];
      
      // Calcular MTTR
      let mttrQuery = supabase
        .from("incidents")
        .select("created_at, resolved_at")
        .not("resolved_at", "is", null);
      
      if (restaurantId) {
        mttrQuery = mttrQuery.eq("restaurant_id", restaurantId);
      }
      
      const { data: mttrData } = await mttrQuery;
      
      if (mttrData && mttrData.length > 0) {
        const avgResolutionTime = mttrData.reduce((acc, incident) => {
          const created = new Date(incident.created_at);
          const resolved = new Date(incident.resolved_at);
          return acc + (resolved.getTime() - created.getTime());
        }, 0) / mttrData.length;
        
        const mttrHours = avgResolutionTime / (1000 * 60 * 60);
        
        // Guardar snapshot
        await supabase.from("metric_snapshots").insert({
          metric_id: (await supabase.from("metric_definitions").select("id").eq("code", "MTTR").single()).data?.id,
          value: mttrHours,
          restaurant_id: restaurantId,
          snapshot_date: new Date().toISOString().split('T')[0]
        });
        
        results.push({ code: 'MTTR', value: mttrHours });
      }
      
      // Calcular conteos
      let countQuery = supabase
        .from("incidents")
        .select("priority", { count: 'exact' });
      
      if (restaurantId) {
        countQuery = countQuery.eq("restaurant_id", restaurantId);
      }
      
      const { count: totalCount } = await countQuery;
      const { count: criticalCount } = await countQuery.eq("priority", "critical");
      
      // Guardar snapshots de conteos
      if (totalCount !== null) {
        await supabase.from("metric_snapshots").insert({
          metric_id: (await supabase.from("metric_definitions").select("id").eq("code", "INCIDENT_COUNT").single()).data?.id,
          value: totalCount,
          restaurant_id: restaurantId,
          snapshot_date: new Date().toISOString().split('T')[0]
        });
        results.push({ code: 'INCIDENT_COUNT', value: totalCount });
      }
      
      if (criticalCount !== null) {
        await supabase.from("metric_snapshots").insert({
          metric_id: (await supabase.from("metric_definitions").select("id").eq("code", "CRITICAL_INCIDENTS").single()).data?.id,
          value: criticalCount,
          restaurant_id: restaurantId,
          snapshot_date: new Date().toISOString().split('T')[0]
        });
        results.push({ code: 'CRITICAL_INCIDENTS', value: criticalCount });
      }
      
      // Calcular CAPEX
      let capexQuery = supabase
        .from("incidents")
        .select("importe_carto");
      
      if (restaurantId) {
        capexQuery = capexQuery.eq("restaurant_id", restaurantId);
      }
      
      const { data: capexData } = await capexQuery;
      
      if (capexData) {
        const totalCapex = capexData.reduce((acc, incident) => {
          return acc + (incident.importe_carto || 0);
        }, 0);
        
        await supabase.from("metric_snapshots").insert({
          metric_id: (await supabase.from("metric_definitions").select("id").eq("code", "CAPEX_TOTAL").single()).data?.id,
          value: totalCapex,
          restaurant_id: restaurantId,
          snapshot_date: new Date().toISOString().split('T')[0]
        });
        results.push({ code: 'CAPEX_TOTAL', value: totalCapex });
      }
      
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metrics-dashboard"] });
      toast({
        title: "Métricas calculadas",
        description: "Las métricas se han actualizado correctamente.",
      });
    },
    onError: (error) => {
      console.error("Error calculating metrics:", error);
      toast({
        title: "Error",
        description: "No se pudieron calcular las métricas.",
        variant: "destructive",
      });
    },
  });

  // Obtener tendencias históricas
  const {
    data: historicalMetrics,
    isLoading: isLoadingHistorical,
  } = useQuery({
    queryKey: ["metrics-historical"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from("metric_snapshots")
        .select(`
          *,
          metric:metric_definitions(*)
        `)
        .gte("snapshot_date", thirtyDaysAgo.toISOString().split('T')[0])
        .order("snapshot_date", { ascending: true });

      if (error) throw error;
      return data as (MetricSnapshot & { metric: MetricDefinition })[];
    },
  });

  return {
    metricDefinitions,
    dashboardMetrics,
    historicalMetrics,
    isLoadingDefinitions,
    isLoadingDashboard,
    isLoadingHistorical,
    calculateMetrics,
  };
};