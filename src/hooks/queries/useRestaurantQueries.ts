import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant } from '@/types/restaurant';
import { toast } from '@/hooks/use-toast';

// Query keys para cache consistency
export const restaurantKeys = {
  all: ['restaurants'] as const,
  lists: () => [...restaurantKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...restaurantKeys.lists(), { filters }] as const,
  details: () => [...restaurantKeys.all, 'detail'] as const,
  detail: (id: string) => [...restaurantKeys.details(), id] as const,
  franchisee: (franchiseeId: string) => [...restaurantKeys.all, 'franchisee', franchiseeId] as const,
};

// Hook para obtener todos los restaurantes base
export const useBaseRestaurants = () => {
  return useQuery({
    queryKey: restaurantKeys.lists(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('base_restaurants')
        .select('*')
        .order('restaurant_name');
      
      if (error) throw error;
      return data;
    },
  });
};

// Hook para obtener restaurantes de un franquiciado
export const useFranchiseeRestaurants = (franchiseeId?: string) => {
  return useQuery({
    queryKey: restaurantKeys.franchisee(franchiseeId || ''),
    queryFn: async () => {
      if (!franchiseeId) return [];
      
      const { data, error } = await supabase
        .from('franchisee_restaurants')
        .select(`
          *,
          base_restaurant:base_restaurants(*)
        `)
        .eq('franchisee_id', franchiseeId)
        .order('assigned_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!franchiseeId,
  });
};

// Hook para obtener un restaurante específico
export const useRestaurant = (restaurantId?: string) => {
  return useQuery({
    queryKey: restaurantKeys.detail(restaurantId || ''),
    queryFn: async () => {
      if (!restaurantId) return null;
      
      const { data, error } = await supabase
        .from('franchisee_restaurants')
        .select(`
          *,
          base_restaurant:base_restaurants(*),
          franchisee:franchisees(*)
        `)
        .eq('id', restaurantId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!restaurantId,
  });
};

// Mutation para crear restaurante
export const useCreateRestaurant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (restaurantData: Partial<Restaurant>) => {
      const { data, error } = await supabase
        .from('franchisee_restaurants')
        .insert(restaurantData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.all });
      toast({
        title: "Restaurante creado",
        description: "El restaurante se ha creado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear restaurante",
        description: error.message || "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    },
  });
};

// Mutation para actualizar restaurante
export const useUpdateRestaurant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Restaurant>) => {
      const { data, error } = await supabase
        .from('franchisee_restaurants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.all });
      queryClient.setQueryData(restaurantKeys.detail(data.id), data);
      toast({
        title: "Restaurante actualizado",
        description: "Los cambios se han guardado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar restaurante",
        description: error.message || "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    },
  });
};

// Hook para mapear ID de base restaurant a franchisee restaurant
export const useFranchiseeRestaurantId = (baseRestaurantId?: string) => {
  return useQuery({
    queryKey: ['franchisee-restaurant-mapping', baseRestaurantId],
    queryFn: async () => {
      if (!baseRestaurantId) return null;
      
      const { data, error } = await supabase
        .from('franchisee_restaurants')
        .select('id')
        .eq('base_restaurant_id', baseRestaurantId)
        .single();
      
      if (error) throw error;
      return data?.id || null;
    },
    enabled: !!baseRestaurantId,
  });
};