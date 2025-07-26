// Servicio de Restaurantes
import { supabase } from '@/integrations/supabase/client';
import { BaseService, ServiceResponse, createResponse } from '../base/BaseService';
import type { Restaurant, BaseRestaurant, FranchiseeRestaurant } from '@/types/core';

export class RestaurantService extends BaseService {
  async getRestaurants(): Promise<ServiceResponse<Restaurant[]>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('franchisee_restaurants')
        .select(`
          *,
          base_restaurant:base_restaurant_id (*),
          franchisee:franchisee_id (*)
        `)
        .eq('status', 'active');

      if (error) return createResponse(null, error.message);
      
      const restaurants = (data || []).map((fr: any) => ({
        ...fr.base_restaurant,
        franchisee_id: fr.franchisee_id,
        status: fr.status,
        franchise_start_date: fr.franchise_start_date,
        franchise_end_date: fr.franchise_end_date,
        monthly_rent: fr.monthly_rent
      }));

      return createResponse(restaurants);
    }, 'RestaurantService.getRestaurants');
  }

  async createRestaurant(restaurantData: Omit<BaseRestaurant, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<BaseRestaurant>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('base_restaurants')
        .insert(restaurantData)
        .select()
        .single();

      if (error) return createResponse(null, error.message);
      return createResponse(data);
    }, 'RestaurantService.createRestaurant');
  }

  async assignRestaurant(franchiseeId: string, baseRestaurantId: string): Promise<ServiceResponse<FranchiseeRestaurant>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('franchisee_restaurants')
        .insert({
          franchisee_id: franchiseeId,
          base_restaurant_id: baseRestaurantId,
          status: 'active'
        })
        .select()
        .single();

      if (error) return createResponse(null, error.message);
      return createResponse(data);
    }, 'RestaurantService.assignRestaurant');
  }
}

export const restaurantService = new RestaurantService();