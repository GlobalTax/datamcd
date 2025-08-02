// === SERVICIO DE GESTIÓN DE RESTAURANTES BASE ===
// Extrae toda la lógica de negocio de BaseRestaurantsTable.tsx

import { supabase } from '@/integrations/supabase/client';
import { BaseService, ServiceResponse } from '../base/BaseService';
import { logger } from '../base/LoggerService';
import { errorService } from '../base/ErrorService';
import type { BaseRestaurant } from '@/types/domains/restaurant';

export interface CreateBaseRestaurantData {
  site_number: string;
  restaurant_name: string;
  address: string;
  city: string;
  state?: string;
  postal_code?: string;
  country?: string;
  restaurant_type: 'traditional' | 'mccafe' | 'drive_thru' | 'express';
  property_type?: string;
  autonomous_community?: string;
  square_meters?: number;
  seating_capacity?: number;
  opening_date?: string;
  franchisee_name?: string;
  franchisee_email?: string;
  company_tax_id?: string;
}

export interface UpdateBaseRestaurantData extends Partial<CreateBaseRestaurantData> {
  id: string;
}

export interface BaseRestaurantFilters {
  search?: string;
  restaurantType?: string[];
  autonomousCommunity?: string[];
  propertyType?: string[];
  city?: string[];
  hasAssignment?: boolean;
}

export class BaseRestaurantService extends BaseService {
  constructor() {
    super('BaseRestaurantService');
  }

  async getBaseRestaurants(): Promise<ServiceResponse<BaseRestaurant[]>> {
    return this.executeQuery(async () => {
      logger.info('Fetching base restaurants', { component: 'BaseRestaurantService' });

      const { data, error } = await supabase
        .from('base_restaurants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching base restaurants', { 
          error, 
          component: 'BaseRestaurantService' 
        });
        throw errorService.createDatabaseError('fetch', 'base_restaurants');
      }

      logger.info(`Successfully fetched ${data?.length || 0} base restaurants`, {
        component: 'BaseRestaurantService',
        count: data?.length || 0
      });

      return this.createResponse(data?.map(restaurant => ({
        ...restaurant,
        restaurant_type: restaurant.restaurant_type as 'traditional' | 'mccafe' | 'drive_thru' | 'express'
      })) || []);
    }, 'getBaseRestaurants');
  }

  async createBaseRestaurant(restaurantData: CreateBaseRestaurantData): Promise<ServiceResponse<BaseRestaurant>> {
    return this.executeQuery(async () => {
      logger.info('Creating base restaurant', { 
        component: 'BaseRestaurantService',
        restaurant_name: restaurantData.restaurant_name,
        site_number: restaurantData.site_number
      });

      // Validar datos antes de crear
      const validation = this.validateRestaurantData(restaurantData);
      if (!validation.isValid) {
        throw errorService.createValidationError('restaurant data', validation.errors.join(', '));
      }

      const { data, error } = await supabase
        .from('base_restaurants')
        .insert([restaurantData])
        .select()
        .single();

      if (error) {
        logger.error('Error creating base restaurant', { 
          error, 
          restaurantData,
          component: 'BaseRestaurantService' 
        });
        throw errorService.createDatabaseError('create', 'base_restaurants');
      }

      logger.info('Successfully created base restaurant', {
        component: 'BaseRestaurantService',
        restaurantId: data.id,
        restaurant_name: data.restaurant_name
      });

      return this.createResponse({
        ...data,
        restaurant_type: data.restaurant_type as 'traditional' | 'mccafe' | 'drive_thru' | 'express'
      });
    }, 'createBaseRestaurant');
  }

  async updateBaseRestaurant(restaurantData: UpdateBaseRestaurantData): Promise<ServiceResponse<BaseRestaurant>> {
    return this.executeQuery(async () => {
      const { id, ...updateData } = restaurantData;
      
      logger.info('Updating base restaurant', { 
        component: 'BaseRestaurantService',
        restaurantId: id 
      });

      const { data, error } = await supabase
        .from('base_restaurants')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating base restaurant', { 
          error, 
          restaurantId: id,
          component: 'BaseRestaurantService' 
        });
        throw errorService.createDatabaseError('update', 'base_restaurants');
      }

      logger.info('Successfully updated base restaurant', {
        component: 'BaseRestaurantService',
        restaurantId: data.id
      });

      return this.createResponse({
        ...data,
        restaurant_type: data.restaurant_type as 'traditional' | 'mccafe' | 'drive_thru' | 'express'
      });
    }, 'updateBaseRestaurant');
  }

  async deleteBaseRestaurant(restaurantId: string): Promise<ServiceResponse<boolean>> {
    return this.executeQuery(async () => {
      logger.info('Deleting base restaurant', { 
        component: 'BaseRestaurantService',
        restaurantId 
      });

      const { error } = await supabase
        .from('base_restaurants')
        .delete()
        .eq('id', restaurantId);

      if (error) {
        logger.error('Error deleting base restaurant', { 
          error, 
          restaurantId,
          component: 'BaseRestaurantService' 
        });
        throw errorService.createDatabaseError('delete', 'base_restaurants');
      }

      logger.info('Successfully deleted base restaurant', {
        component: 'BaseRestaurantService',
        restaurantId
      });

      return this.createResponse(true);
    }, 'deleteBaseRestaurant');
  }

  filterRestaurants(restaurants: BaseRestaurant[], filters: BaseRestaurantFilters): BaseRestaurant[] {
    return restaurants.filter(restaurant => {
      // Filtro de búsqueda
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          restaurant.restaurant_name.toLowerCase().includes(searchTerm) ||
          restaurant.site_number.toLowerCase().includes(searchTerm) ||
          restaurant.city?.toLowerCase().includes(searchTerm) ||
          restaurant.address?.toLowerCase().includes(searchTerm);
        
        if (!matchesSearch) return false;
      }

      // Filtro por tipo de restaurante
      if (filters.restaurantType && filters.restaurantType.length > 0) {
        if (!filters.restaurantType.includes(restaurant.restaurant_type)) return false;
      }

      // Filtro por comunidad autónoma
      if (filters.autonomousCommunity && filters.autonomousCommunity.length > 0) {
        if (!restaurant.autonomous_community || 
            !filters.autonomousCommunity.includes(restaurant.autonomous_community)) {
          return false;
        }
      }

      // Filtro por tipo de propiedad
      if (filters.propertyType && filters.propertyType.length > 0) {
        if (!restaurant.property_type || 
            !filters.propertyType.includes(restaurant.property_type)) {
          return false;
        }
      }

      // Filtro por ciudad
      if (filters.city && filters.city.length > 0) {
        if (!restaurant.city || !filters.city.includes(restaurant.city)) {
          return false;
        }
      }

      return true;
    });
  }

  validateRestaurantData(data: CreateBaseRestaurantData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.restaurant_name?.trim()) {
      errors.push('El nombre del restaurante es requerido');
    }

    if (!data.site_number?.trim()) {
      errors.push('El número de local es requerido');
    }

    if (!data.address?.trim()) {
      errors.push('La dirección es requerida');
    }

    if (!data.city?.trim()) {
      errors.push('La ciudad es requerida');
    }

    if (data.square_meters && data.square_meters < 0) {
      errors.push('Los metros cuadrados deben ser un número positivo');
    }

    if (data.seating_capacity && data.seating_capacity < 0) {
      errors.push('La capacidad de asientos debe ser un número positivo');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  getRestaurantTypeLabel(type: string): string {
    const types: Record<string, string> = {
      'traditional': 'Tradicional',
      'mccafe': 'McCafé',
      'drive_thru': 'Drive Thru',
      'express': 'Express'
    };
    return types[type] || type;
  }

  getPropertyTypeColor(type?: string): string {
    const colors: Record<string, string> = {
      'owned': 'bg-green-100 text-green-800',
      'leased': 'bg-blue-100 text-blue-800',
      'franchised': 'bg-purple-100 text-purple-800'
    };
    return colors[type || ''] || 'bg-gray-100 text-gray-800';
  }
}

export const baseRestaurantService = new BaseRestaurantService();