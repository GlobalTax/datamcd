import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Query keys para franchisees
export const franchiseeKeys = {
  all: ['franchisees'] as const,
  lists: () => [...franchiseeKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...franchiseeKeys.lists(), { filters }] as const,
  details: () => [...franchiseeKeys.all, 'detail'] as const,
  detail: (id: string) => [...franchiseeKeys.details(), id] as const,
  current: () => [...franchiseeKeys.all, 'current'] as const,
};

// Hook para obtener todos los franquiciados
export const useFranchisees = () => {
  return useQuery({
    queryKey: franchiseeKeys.lists(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('franchisees')
        .select('*')
        .order('franchisee_name');
      
      if (error) throw error;
      return data;
    },
  });
};

// Hook para obtener un franquiciado específico
export const useFranchisee = (franchiseeId?: string) => {
  return useQuery({
    queryKey: franchiseeKeys.detail(franchiseeId || ''),
    queryFn: async () => {
      if (!franchiseeId) return null;
      
      const { data, error } = await supabase
        .from('franchisees')
        .select(`
          *,
          franchisee_restaurants(
            *,
            base_restaurant:base_restaurants(*)
          )
        `)
        .eq('id', franchiseeId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!franchiseeId,
  });
};

// Hook para obtener el franquiciado actual del usuario
export const useCurrentFranchisee = () => {
  return useQuery({
    queryKey: franchiseeKeys.current(),
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('franchisees')
        .select(`
          *,
          franchisee_restaurants(
            *,
            base_restaurant:base_restaurants(*)
          )
        `)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // No franchisee found
        throw error;
      }
      return data;
    },
  });
};

// Mutation para crear franquiciado
export const useCreateFranchisee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (franchiseeData: any) => {
      const { data, error } = await supabase
        .from('franchisees')
        .insert(franchiseeData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: franchiseeKeys.all });
      toast({
        title: "Franquiciado creado",
        description: "El franquiciado se ha creado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear franquiciado",
        description: error.message || "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    },
  });
};

// Mutation para actualizar franquiciado
export const useUpdateFranchisee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Record<string, any>) => {
      const { data, error } = await supabase
        .from('franchisees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: franchiseeKeys.all });
      queryClient.setQueryData(franchiseeKeys.detail(data.id), data);
      toast({
        title: "Franquiciado actualizado",
        description: "Los cambios se han guardado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar franquiciado",
        description: error.message || "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    },
  });
};