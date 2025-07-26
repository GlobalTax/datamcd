import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { BaseRestaurant, FranchiseeRestaurant } from '@/types/franchiseeRestaurant';

export interface UnifiedRestaurant extends BaseRestaurant {
  assignment?: {
    id: string;
    franchisee_id: string;
    franchise_start_date?: string;
    franchise_end_date?: string;
    monthly_rent?: number;
    last_year_revenue?: number;
    average_monthly_sales?: number;
    status?: string;
    assigned_at: string;
  };
  franchisee_info?: {
    id: string;
    franchisee_name: string;
    company_name?: string;
    city?: string;
    state?: string;
  };
  isAssigned: boolean;
}

export interface RestaurantFilters {
  franchiseeId?: string;
  status?: string;
  city?: string;
  state?: string;
}

export interface RestaurantConfig {
  franchiseeId?: string;
  includeAssignments?: boolean;
  includeBase?: boolean;
  filters?: RestaurantFilters;
}

export class RestaurantService {
  static async getBaseRestaurants(): Promise<BaseRestaurant[]> {
    try {
      const { data, error } = await supabase
        .from('base_restaurants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching base restaurants', { error: error.message });
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('RestaurantService.getBaseRestaurants failed', { error });
      throw error;
    }
  }

  static async getFranchiseeRestaurants(franchiseeId?: string): Promise<FranchiseeRestaurant[]> {
    try {
      let query = supabase
        .from('franchisee_restaurants')
        .select(`
          *,
          base_restaurant:base_restaurants(*)
        `)
        .eq('status', 'active')
        .order('assigned_at', { ascending: false });

      if (franchiseeId) {
        query = query.eq('franchisee_id', franchiseeId);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error fetching franchisee restaurants', { 
          error: error.message, 
          franchiseeId 
        });
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('RestaurantService.getFranchiseeRestaurants failed', { error, franchiseeId });
      throw error;
    }
  }

  static async getUnifiedRestaurants(): Promise<UnifiedRestaurant[]> {
    try {
      // Obtener todos los restaurantes base
      const baseRestaurants = await this.getBaseRestaurants();

      // Obtener todas las asignaciones con información del franquiciado
      const { data: assignments, error: assignmentError } = await supabase
        .from('franchisee_restaurants')
        .select(`
          *,
          franchisee:franchisee_id (
            id,
            franchisee_name,
            company_name,
            city,
            state
          )
        `)
        .eq('status', 'active');

      if (assignmentError) {
        logger.warn('Error fetching restaurant assignments', { error: assignmentError.message });
      }

      // Combinar los datos
      const unifiedRestaurants: UnifiedRestaurant[] = baseRestaurants.map(restaurant => {
        const assignment = assignments?.find(a => a.base_restaurant_id === restaurant.id);
        
        return {
          ...restaurant,
          assignment: assignment ? {
            id: assignment.id,
            franchisee_id: assignment.franchisee_id,
            franchise_start_date: assignment.franchise_start_date,
            franchise_end_date: assignment.franchise_end_date,
            monthly_rent: assignment.monthly_rent,
            last_year_revenue: assignment.last_year_revenue,
            average_monthly_sales: assignment.average_monthly_sales,
            status: assignment.status,
            assigned_at: assignment.assigned_at
          } : undefined,
          franchisee_info: assignment?.franchisee ? {
            id: assignment.franchisee.id,
            franchisee_name: assignment.franchisee.franchisee_name,
            company_name: assignment.franchisee.company_name,
            city: assignment.franchisee.city,
            state: assignment.franchisee.state
          } : undefined,
          isAssigned: !!assignment
        };
      });

      logger.info('Successfully fetched unified restaurants', {
        total: unifiedRestaurants.length,
        assigned: unifiedRestaurants.filter(r => r.isAssigned).length,
        available: unifiedRestaurants.filter(r => !r.isAssigned).length
      });

      return unifiedRestaurants;
    } catch (error) {
      logger.error('RestaurantService.getUnifiedRestaurants failed', { error });
      throw error;
    }
  }

  static async createBaseRestaurant(restaurantData: Omit<BaseRestaurant, 'id' | 'created_at' | 'updated_at'>): Promise<BaseRestaurant> {
    try {
      const { data, error } = await supabase
        .from('base_restaurants')
        .insert(restaurantData)
        .select()
        .single();

      if (error) {
        logger.error('Error creating base restaurant', { error: error.message, restaurantData });
        throw error;
      }

      logger.info('Base restaurant created successfully', { restaurantId: data.id });
      return data;
    } catch (error) {
      logger.error('RestaurantService.createBaseRestaurant failed', { error, restaurantData });
      throw error;
    }
  }

  static async updateBaseRestaurant(id: string, restaurantData: Partial<BaseRestaurant>): Promise<BaseRestaurant> {
    try {
      const { data, error } = await supabase
        .from('base_restaurants')
        .update(restaurantData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating base restaurant', { error: error.message, id, restaurantData });
        throw error;
      }

      logger.info('Base restaurant updated successfully', { restaurantId: id });
      return data;
    } catch (error) {
      logger.error('RestaurantService.updateBaseRestaurant failed', { error, id, restaurantData });
      throw error;
    }
  }

  static async deleteBaseRestaurant(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('base_restaurants')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Error deleting base restaurant', { error: error.message, id });
        throw error;
      }

      logger.info('Base restaurant deleted successfully', { restaurantId: id });
    } catch (error) {
      logger.error('RestaurantService.deleteBaseRestaurant failed', { error, id });
      throw error;
    }
  }

  static async assignRestaurant(franchiseeId: string, baseRestaurantId: string, assignmentData?: Partial<FranchiseeRestaurant>): Promise<FranchiseeRestaurant> {
    try {
      const { data, error } = await supabase
        .from('franchisee_restaurants')
        .insert({
          franchisee_id: franchiseeId,
          base_restaurant_id: baseRestaurantId,
          status: 'active',
          assigned_at: new Date().toISOString(),
          ...assignmentData
        })
        .select()
        .single();

      if (error) {
        logger.error('Error assigning restaurant', { 
          error: error.message, 
          franchiseeId, 
          baseRestaurantId 
        });
        throw error;
      }

      logger.info('Restaurant assigned successfully', { 
        assignmentId: data.id,
        franchiseeId,
        baseRestaurantId 
      });
      return data;
    } catch (error) {
      logger.error('RestaurantService.assignRestaurant failed', { 
        error, 
        franchiseeId, 
        baseRestaurantId 
      });
      throw error;
    }
  }
}