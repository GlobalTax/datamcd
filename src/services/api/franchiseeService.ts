import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { Franchisee } from '@/types/auth';

export class FranchiseeService {
  static async getFranchisees(): Promise<Franchisee[]> {
    try {
      const { data, error } = await supabase
        .from('franchisees')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching franchisees', { error: error.message });
        throw error;
      }

      // Contar restaurantes asociados para cada franquiciado
      const franchiseesWithCount = await Promise.all(
        (data || []).map(async (franchisee) => {
          const { count } = await supabase
            .from('franchisee_restaurants')
            .select('*', { count: 'exact', head: true })
            .eq('franchisee_id', franchisee.id)
            .eq('status', 'active');

          return {
            ...franchisee,
            total_restaurants: count || 0,
            profiles: franchisee.profiles
          };
        })
      );

      logger.info('Successfully fetched franchisees', { count: franchiseesWithCount.length });
      return franchiseesWithCount;
    } catch (error) {
      logger.error('FranchiseeService.getFranchisees failed', { error });
      throw error;
    }
  }

  static async getFranchisee(id: string): Promise<Franchisee | null> {
    try {
      const { data, error } = await supabase
        .from('franchisees')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name,
            phone
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        logger.error('Error fetching franchisee', { error: error.message, id });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('FranchiseeService.getFranchisee failed', { error, id });
      throw error;
    }
  }

  static async createFranchisee(franchiseeData: Omit<Franchisee, 'id' | 'created_at' | 'updated_at'>): Promise<Franchisee> {
    try {
      const { data, error } = await supabase
        .from('franchisees')
        .insert(franchiseeData)
        .select()
        .single();

      if (error) {
        logger.error('Error creating franchisee', { error: error.message, franchiseeData });
        throw error;
      }

      logger.info('Franchisee created successfully', { franchiseeId: data.id });
      return data;
    } catch (error) {
      logger.error('FranchiseeService.createFranchisee failed', { error, franchiseeData });
      throw error;
    }
  }

  static async updateFranchisee(id: string, franchiseeData: Partial<Franchisee>): Promise<Franchisee> {
    try {
      const { data, error } = await supabase
        .from('franchisees')
        .update(franchiseeData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating franchisee', { error: error.message, id, franchiseeData });
        throw error;
      }

      logger.info('Franchisee updated successfully', { franchiseeId: id });
      return data;
    } catch (error) {
      logger.error('FranchiseeService.updateFranchisee failed', { error, id, franchiseeData });
      throw error;
    }
  }

  static async deleteFranchisee(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('franchisees')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Error deleting franchisee', { error: error.message, id });
        throw error;
      }

      logger.info('Franchisee deleted successfully', { franchiseeId: id });
    } catch (error) {
      logger.error('FranchiseeService.deleteFranchisee failed', { error, id });
      throw error;
    }
  }

  static async assignRestaurant(franchiseeId: string, baseRestaurantId: string): Promise<void> {
    try {
      // Verificar si ya existe la asignación
      const { data: existing } = await supabase
        .from('franchisee_restaurants')
        .select('id')
        .eq('franchisee_id', franchiseeId)
        .eq('base_restaurant_id', baseRestaurantId)
        .eq('status', 'active')
        .single();

      if (existing) {
        throw new Error('El restaurante ya está asignado a este franquiciado');
      }

      const { error } = await supabase
        .from('franchisee_restaurants')
        .insert({
          franchisee_id: franchiseeId,
          base_restaurant_id: baseRestaurantId,
          status: 'active',
          assigned_at: new Date().toISOString()
        });

      if (error) {
        logger.error('Error assigning restaurant to franchisee', { 
          error: error.message, 
          franchiseeId, 
          baseRestaurantId 
        });
        throw error;
      }

      logger.info('Restaurant assigned to franchisee successfully', { 
        franchiseeId, 
        baseRestaurantId 
      });
    } catch (error) {
      logger.error('FranchiseeService.assignRestaurant failed', { 
        error, 
        franchiseeId, 
        baseRestaurantId 
      });
      throw error;
    }
  }
}