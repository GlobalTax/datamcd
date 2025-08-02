// === SERVICIO DE GESTIÓN DE TABLA DE RESTAURANTES ===
// Extrae la lógica de filtrado, paginación y operaciones de BaseRestaurantsTable

import { BaseService, ServiceResponse } from '../base/BaseService';
import { logger } from '../base/LoggerService';
import { errorService } from '../base/ErrorService';
import { baseRestaurantService, CreateBaseRestaurantData, UpdateBaseRestaurantData } from './BaseRestaurantService';
import type { BaseRestaurant } from '@/types/franchiseeRestaurant';

export interface RestaurantTableFilters {
  search?: string;
  restaurantType?: string;
  propertyType?: string;
  autonomous_community?: string;
  city?: string;
}

export interface RestaurantTableState {
  currentPage: number;
  itemsPerPage: number;
  searchTerm: string;
  filters: RestaurantTableFilters;
}

export interface ColumnSettings {
  franchiseeInfo: boolean;
  propertyDetails: boolean;
  dates: boolean;
  location: boolean;
}

export class RestaurantTableService extends BaseService {
  private readonly defaultItemsPerPage = 40;

  constructor() {
    super('RestaurantTableService');
  }

  filterRestaurants(restaurants: BaseRestaurant[], filters: RestaurantTableFilters): BaseRestaurant[] {
    return restaurants.filter(restaurant => {
      // Filtro de búsqueda
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          restaurant.restaurant_name.toLowerCase().includes(searchTerm) ||
          restaurant.site_number.toLowerCase().includes(searchTerm) ||
          (restaurant.city && restaurant.city.toLowerCase().includes(searchTerm)) ||
          (restaurant.address && restaurant.address.toLowerCase().includes(searchTerm));
        
        if (!matchesSearch) return false;
      }

      // Filtro por tipo de restaurante
      if (filters.restaurantType && restaurant.restaurant_type !== filters.restaurantType) {
        return false;
      }

      // Filtro por tipo de propiedad
      if (filters.propertyType && restaurant.property_type !== filters.propertyType) {
        return false;
      }

      // Filtro por comunidad autónoma
      if (filters.autonomous_community && restaurant.autonomous_community !== filters.autonomous_community) {
        return false;
      }

      // Filtro por ciudad
      if (filters.city && restaurant.city !== filters.city) {
        return false;
      }

      return true;
    });
  }

  calculatePagination(totalItems: number, currentPage: number, itemsPerPage: number = this.defaultItemsPerPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return {
      totalPages,
      startIndex,
      endIndex,
      currentPage: Math.max(1, Math.min(currentPage, totalPages))
    };
  }

  paginateRestaurants(restaurants: BaseRestaurant[], currentPage: number, itemsPerPage: number = this.defaultItemsPerPage): BaseRestaurant[] {
    const { startIndex, endIndex } = this.calculatePagination(restaurants.length, currentPage, itemsPerPage);
    return restaurants.slice(startIndex, endIndex);
  }

  async createRestaurant(restaurantData: CreateBaseRestaurantData): Promise<ServiceResponse<BaseRestaurant>> {
    return this.executeQuery(async () => {
      logger.info('Creating restaurant via table service', { 
        component: 'RestaurantTableService',
        restaurant_name: restaurantData.restaurant_name 
      });

      const validation = this.validateRestaurantData(restaurantData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const createResponse = await baseRestaurantService.createBaseRestaurant(restaurantData);
      
      if (!createResponse.success) {
        throw new Error('Error creating restaurant');
      }

      logger.info('Successfully created restaurant via table service', {
        component: 'RestaurantTableService',
        restaurantId: createResponse.data?.id
      });

      return createResponse;
    }, 'createRestaurant');
  }

  async updateRestaurant(restaurantId: string, restaurantData: Partial<CreateBaseRestaurantData>): Promise<ServiceResponse<BaseRestaurant>> {
    return this.executeQuery(async () => {
      logger.info('Updating restaurant via table service', { 
        component: 'RestaurantTableService',
        restaurantId 
      });

      const validation = this.validateRestaurantData(restaurantData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const updateResponse = await baseRestaurantService.updateBaseRestaurant({
        id: restaurantId,
        ...restaurantData
      } as UpdateBaseRestaurantData);
      
      if (!updateResponse.success) {
        throw new Error('Error updating restaurant');
      }

      logger.info('Successfully updated restaurant via table service', {
        component: 'RestaurantTableService',
        restaurantId
      });

      return updateResponse;
    }, 'updateRestaurant');
  }

  async deleteRestaurant(restaurantId: string): Promise<ServiceResponse<boolean>> {
    return this.executeQuery(async () => {
      logger.info('Deleting restaurant via table service', { 
        component: 'RestaurantTableService',
        restaurantId 
      });

      const deleteResponse = await baseRestaurantService.deleteBaseRestaurant(restaurantId);
      
      if (!deleteResponse.success) {
        throw new Error('Error deleting restaurant');
      }

      logger.info('Successfully deleted restaurant via table service', {
        component: 'RestaurantTableService',
        restaurantId
      });

      return deleteResponse;
    }, 'deleteRestaurant');
  }

  validateRestaurantData(data: Partial<CreateBaseRestaurantData>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.restaurant_name !== undefined && !data.restaurant_name?.trim()) {
      errors.push('El nombre del restaurante es requerido');
    }

    if (data.site_number !== undefined && !data.site_number?.trim()) {
      errors.push('El número de sitio es requerido');
    }

    if (data.city !== undefined && !data.city?.trim()) {
      errors.push('La ciudad es requerida');
    }

    if (data.address !== undefined && !data.address?.trim()) {
      errors.push('La dirección es requerida');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  createGoogleMapsLink(address?: string, city?: string): string | null {
    if (!address && !city) return null;
    
    const fullAddress = [address, city].filter(Boolean).join(', ');
    const encodedAddress = encodeURIComponent(fullAddress);
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  getRestaurantTypeLabel(type?: string): string {
    const typeLabels: Record<string, string> = {
      traditional: 'Tradicional',
      mccafe: 'McCafé',
      drive_thru: 'Drive Thru',
      express: 'Express',
      delivery: 'Delivery'
    };
    
    return typeLabels[type || ''] || type || '-';
  }

  getPropertyTypeColor(type?: string): string {
    const colorMap: Record<string, string> = {
      own: 'bg-green-100 text-green-800',
      rent: 'bg-blue-100 text-blue-800',
      franchise: 'bg-purple-100 text-purple-800',
      lease: 'bg-orange-100 text-orange-800'
    };
    
    return colorMap[type || ''] || 'bg-gray-100 text-gray-800';
  }
}

export const restaurantTableService = new RestaurantTableService();