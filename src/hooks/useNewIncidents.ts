import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { 
  Incident, 
  CreateIncidentData, 
  UpdateIncidentData, 
  IncidentWithRelations,
  IncidentFilters 
} from "@/types/newIncident";

export const useNewIncidents = (filters?: IncidentFilters) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Consulta de incidentes con el nuevo esquema
  const {
    data: incidents,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["new-incidents", filters],
    queryFn: async () => {
      try {
        console.log("useNewIncidents - Fetching incidents", { filters });
        logger.info("Fetching incidents", { filters, component: "useNewIncidents" });
        
        let query = supabase
          .from("incidents")
          .select(`
            *,
            restaurant:base_restaurants(
              id,
              restaurant_name,
              site_number
            ),
            provider:providers(
              id,
              name,
              provider_type
            )
          `)
          .order("created_at", { ascending: false })
          .limit(100); // Paginación básica

        // Aplicar filtros
        if (filters) {
          if (filters.status?.length) {
            query = query.in("status", filters.status);
          }
          if (filters.priority?.length) {
            query = query.in("priority", filters.priority);
          }
          if (filters.type?.length) {
            query = query.in("type", filters.type);
          }
          if (filters.restaurant_id?.length) {
            query = query.in("restaurant_id", filters.restaurant_id);
          }
          if (filters.provider_id?.length) {
            query = query.in("provider_id", filters.provider_id);
          }
          if (filters.assigned_to?.length) {
            query = query.in("assigned_to", filters.assigned_to);
          }
          if (filters.source?.length) {
            query = query.in("source", filters.source);
          }
          if (filters.date_from) {
            query = query.gte("created_at", filters.date_from);
          }
          if (filters.date_to) {
            query = query.lte("created_at", filters.date_to);
          }
          if (filters.search) {
            query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
          }
        }

        const { data, error } = await query;
        
        console.log("useNewIncidents - Query result:", { data, error, count: data?.length });
        
        if (error) {
          console.error("useNewIncidents - Database error:", error);
          logger.error("Error fetching incidents", { error: error.message, filters }, error);
          throw error;
        }
        
        logger.info("Incidents fetched successfully", { count: data?.length || 0 });
        
        // Transformar los datos para que coincidan con IncidentWithRelations
        const transformedData = data?.map(incident => ({
          ...incident,
          restaurant: incident.restaurant ? {
            id: incident.restaurant.id,
            name: incident.restaurant.restaurant_name,
            site_number: incident.restaurant.site_number
          } : undefined
        })) || [];
        
        console.log("useNewIncidents - Transformed data:", transformedData);
        
        return transformedData as IncidentWithRelations[];
      } catch (error) {
        logger.error("Failed to fetch incidents", { filters }, error as Error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30000, // Cache por 30 segundos
  });

  // Crear incidencia
  const createIncident = useMutation({
    mutationFn: async (incidentData: CreateIncidentData) => {
      try {
        logger.info("Creating incident", { title: incidentData.title, component: "useNewIncidents" });
        
        const user = await supabase.auth.getUser();
        if (!user.data.user) {
          throw new Error("Usuario no autenticado");
        }

        const { data, error } = await supabase
          .from("incidents")
          .insert({
            ...incidentData,
            reported_by: user.data.user.id,
            status: 'open'
          })
          .select()
          .single();

        if (error) {
          logger.error("Database error creating incident", { error: error.message }, error);
          throw error;
        }
        
        logger.info("Incident created successfully", { id: data.id });
        return data;
      } catch (error) {
        logger.error("Failed to create incident", { incidentData }, error as Error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["new-incidents"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      logger.info("Incident creation successful", { id: data.id });
      toast({
        title: "Incidencia creada",
        description: "La incidencia se ha creado correctamente.",
      });
    },
    onError: (error) => {
      logger.error("Incident creation failed", {}, error as Error);
      toast({
        title: "Error",
        description: "No se pudo crear la incidencia. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
    retry: 2,
    retryDelay: 1000,
  });

  // Actualizar incidencia
  const updateIncident = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateIncidentData & { id: string }) => {
      const { data, error } = await supabase
        .from("incidents")
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["new-incidents"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      toast({
        title: "Incidencia actualizada",
        description: "La incidencia se ha actualizado correctamente.",
      });
    },
    onError: (error) => {
      console.error("Error updating incident:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la incidencia.",
        variant: "destructive",
      });
    },
  });

  // Eliminar incidencia
  const deleteIncident = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("incidents")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["new-incidents"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      toast({
        title: "Incidencia eliminada",
        description: "La incidencia se ha eliminado correctamente.",
      });
    },
    onError: (error) => {
      console.error("Error deleting incident:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la incidencia.",
        variant: "destructive",
      });
    },
  });

  // Resolver incidencia (helper)
  const resolveIncident = useMutation({
    mutationFn: async ({ id, resolution_notes }: { id: string; resolution_notes?: string }) => {
      const { data, error } = await supabase
        .from("incidents")
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolution_notes,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["new-incidents"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      toast({
        title: "Incidencia resuelta",
        description: "La incidencia se ha marcado como resuelta.",
      });
    },
  });

  return {
    incidents,
    isLoading,
    error,
    createIncident,
    updateIncident,
    deleteIncident,
    resolveIncident,
  };
};