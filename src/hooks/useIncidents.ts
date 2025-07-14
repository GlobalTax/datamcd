import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateIncidentData, UpdateIncidentData, RestaurantIncident } from "@/types/incident";
import { useToast } from "@/hooks/use-toast";

export const useIncidents = (restaurantId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: incidents,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["incidents", restaurantId],
    queryFn: async () => {
      let query = supabase
        .from("restaurant_incidents")
        .select(`
          *,
          restaurant:franchisee_restaurants!inner(
            id,
            base_restaurant:base_restaurants(restaurant_name, site_number)
          ),
          reported_user:profiles!restaurant_incidents_reported_by_fkey(full_name),
          assigned_user:profiles!restaurant_incidents_assigned_to_fkey(full_name)
        `)
        .order("created_at", { ascending: false });

      if (restaurantId) {
        query = query.eq("restaurant_id", restaurantId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
  });

  const createIncident = useMutation({
    mutationFn: async (incidentData: CreateIncidentData) => {
      const { data, error } = await supabase
        .from("restaurant_incidents")
        .insert({
          ...incidentData,
          reported_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      toast({
        title: "Incidencia creada",
        description: "La incidencia se ha creado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la incidencia.",
        variant: "destructive",
      });
    },
  });

  const updateIncident = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateIncidentData & { id: string }) => {
      const { data, error } = await supabase
        .from("restaurant_incidents")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      toast({
        title: "Incidencia actualizada",
        description: "La incidencia se ha actualizado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la incidencia.",
        variant: "destructive",
      });
    },
  });

  const deleteIncident = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("restaurant_incidents")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      toast({
        title: "Incidencia eliminada",
        description: "La incidencia se ha eliminado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la incidencia.",
        variant: "destructive",
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
  };
};