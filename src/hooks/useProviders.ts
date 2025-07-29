import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Provider, CreateProviderData } from "@/types/newIncident";

export const useProviders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener proveedores
  const {
    data: providers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("providers")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Provider[];
    },
  });

  // Crear proveedor
  const createProvider = useMutation({
    mutationFn: async (providerData: CreateProviderData) => {
      const { data, error } = await supabase
        .from("providers")
        .insert({
          ...providerData,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      toast({
        title: "Proveedor creado",
        description: "El proveedor se ha creado correctamente.",
      });
    },
    onError: (error) => {
      console.error("Error creating provider:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el proveedor.",
        variant: "destructive",
      });
    },
  });

  // Actualizar proveedor
  const updateProvider = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Provider> & { id: string }) => {
      const { data, error } = await supabase
        .from("providers")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      toast({
        title: "Proveedor actualizado",
        description: "El proveedor se ha actualizado correctamente.",
      });
    },
    onError: (error) => {
      console.error("Error updating provider:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el proveedor.",
        variant: "destructive",
      });
    },
  });

  // Desactivar proveedor
  const deactivateProvider = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("providers")
        .update({ is_active: false })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      toast({
        title: "Proveedor desactivado",
        description: "El proveedor se ha desactivado correctamente.",
      });
    },
    onError: (error) => {
      console.error("Error deactivating provider:", error);
      toast({
        title: "Error",
        description: "No se pudo desactivar el proveedor.",
        variant: "destructive",
      });
    },
  });

  return {
    providers,
    isLoading,
    error,
    createProvider,
    updateProvider,
    deactivateProvider,
  };
};