import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import type { RestaurantMember, RestaurantRole, RestaurantMembersFilters } from '@/types/domains/restaurant/rbac';

/**
 * Hook para gestionar miembros de un restaurante
 */
export const useRestaurantMembers = (restaurantId: string, filters: RestaurantMembersFilters = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<RestaurantMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Obtener miembros del restaurante
   */
  const fetchMembers = useCallback(async () => {
    if (!restaurantId) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('restaurant_members')
        .select(`
          id,
          user_id,
          restaurant_id,
          role,
          assigned_at,
          assigned_by,
          is_active,
          permissions,
          created_at,
          updated_at,
          user:profiles!user_id (
            id,
            email,
            full_name,
            role
          )
        `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.role) {
        query = query.eq('role', filters.role);
      }
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters.search) {
        query = query.or(`profiles.email.ilike.%${filters.search}%,profiles.full_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Convertir tipos de datos de Supabase a tipos esperados
      const typedMembers = (data || []).map(member => ({
        ...member,
        role: member.role as RestaurantRole,
        permissions: member.permissions as Record<string, any>
      }));

      setMembers(typedMembers);
    } catch (err) {
      console.error('Error fetching restaurant members:', err);
      setError(err as Error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los miembros del restaurante",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [restaurantId, filters, toast]);

  /**
   * Agregar miembro al restaurante
   */
  const addMember = useCallback(async (
    userId: string, 
    role: RestaurantRole,
    permissions: Record<string, any> = {}
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('restaurant_members')
        .insert({
          user_id: userId,
          restaurant_id: restaurantId,
          role,
          assigned_by: user.id,
          permissions
        });

      if (error) throw error;

      toast({
        title: "Miembro agregado",
        description: "El miembro ha sido agregado al restaurante exitosamente"
      });

      fetchMembers();
      return true;

    } catch (err) {
      console.error('Error adding restaurant member:', err);
      toast({
        title: "Error",
        description: "No se pudo agregar el miembro al restaurante",
        variant: "destructive"
      });
      return false;
    }
  }, [user, restaurantId, fetchMembers, toast]);

  /**
   * Actualizar rol de miembro
   */
  const updateMemberRole = useCallback(async (
    memberId: string, 
    newRole: RestaurantRole
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('restaurant_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Rol actualizado",
        description: "El rol del miembro ha sido actualizado exitosamente"
      });

      fetchMembers();
      return true;

    } catch (err) {
      console.error('Error updating member role:', err);
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol del miembro",
        variant: "destructive"
      });
      return false;
    }
  }, [fetchMembers, toast]);

  /**
   * Actualizar permisos de miembro
   */
  const updateMemberPermissions = useCallback(async (
    memberId: string, 
    permissions: Record<string, any>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('restaurant_members')
        .update({ permissions })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Permisos actualizados",
        description: "Los permisos del miembro han sido actualizados"
      });

      fetchMembers();
      return true;

    } catch (err) {
      console.error('Error updating member permissions:', err);
      toast({
        title: "Error",
        description: "No se pudieron actualizar los permisos",
        variant: "destructive"
      });
      return false;
    }
  }, [fetchMembers, toast]);

  /**
   * Desactivar miembro
   */
  const deactivateMember = useCallback(async (memberId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('restaurant_members')
        .update({ is_active: false })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Miembro desactivado",
        description: "El miembro ha sido desactivado del restaurante"
      });

      fetchMembers();
      return true;

    } catch (err) {
      console.error('Error deactivating member:', err);
      toast({
        title: "Error",
        description: "No se pudo desactivar el miembro",
        variant: "destructive"
      });
      return false;
    }
  }, [fetchMembers, toast]);

  /**
   * Reactivar miembro
   */
  const reactivateMember = useCallback(async (memberId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('restaurant_members')
        .update({ is_active: true })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Miembro reactivado",
        description: "El miembro ha sido reactivado en el restaurante"
      });

      fetchMembers();
      return true;

    } catch (err) {
      console.error('Error reactivating member:', err);
      toast({
        title: "Error",
        description: "No se pudo reactivar el miembro",
        variant: "destructive"
      });
      return false;
    }
  }, [fetchMembers, toast]);

  /**
   * Eliminar miembro completamente
   */
  const removeMember = useCallback(async (memberId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('restaurant_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Miembro eliminado",
        description: "El miembro ha sido eliminado del restaurante"
      });

      fetchMembers();
      return true;

    } catch (err) {
      console.error('Error removing member:', err);
      toast({
        title: "Error",
        description: "No se pudo eliminar el miembro",
        variant: "destructive"
      });
      return false;
    }
  }, [fetchMembers, toast]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    loading,
    error,
    fetchMembers,
    addMember,
    updateMemberRole,
    updateMemberPermissions,
    deactivateMember,
    reactivateMember,
    removeMember,
    refetch: fetchMembers
  };
};