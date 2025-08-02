// === SERVICIO DE GESTIÓN DE FRANQUICIADOS ===
// Extrae toda la lógica de negocio de FranchiseesManagement.tsx

import { supabase } from '@/integrations/supabase/client';
import { BaseService, ServiceResponse } from '../base/BaseService';
import { logger } from '../base/LoggerService';
import { errorService } from '../base/ErrorService';
import type { Franchisee } from '@/types/domains/franchisee';

export interface FranchiseeFilters {
  search?: string;
  hasAccount?: boolean;
  isOnline?: boolean;
  totalRestaurants?: {
    min?: number;
    max?: number;
  };
  lastAccess?: {
    from?: string;
    to?: string;
  };
}

export interface CreateFranchiseeData {
  franchisee_name: string;
  company_name?: string;
  tax_id?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface UpdateFranchiseeData extends Partial<CreateFranchiseeData> {
  id: string;
}

export class FranchiseeManagementService extends BaseService {
  constructor() {
    super('FranchiseeManagementService');
  }

  async getFranchisees(): Promise<ServiceResponse<Franchisee[]>> {
    return this.executeQuery(async () => {
      logger.info('Fetching franchisees', { component: 'FranchiseeManagementService' });

      const { data, error } = await supabase
        .from('franchisees')
        .select(`
          *,
          profiles:user_id (email, full_name, phone),
          franchisee_restaurants!franchisee_restaurants_franchisee_id_fkey (
            status
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching franchisees', { 
          error, 
          component: 'FranchiseeManagementService' 
        });
        throw errorService.createDatabaseError('fetch', 'franchisees');
      }

      const processedFranchisees = (data || []).map(franchisee => ({
        ...franchisee,
        hasAccount: !!franchisee.user_id,
        total_restaurants: franchisee.franchisee_restaurants?.length || 0,
        isOnline: false, // Determinar desde logs de acceso
        lastAccess: null // Determinar desde logs de acceso
      }));

      logger.info(`Successfully fetched ${processedFranchisees.length} franchisees`, {
        component: 'FranchiseeManagementService',
        count: processedFranchisees.length
      });

      return this.createResponse(processedFranchisees);
    }, 'getFranchisees');
  }

  async createFranchisee(franchiseeData: CreateFranchiseeData): Promise<ServiceResponse<Franchisee>> {
    return this.executeQuery(async () => {
      logger.info('Creating franchisee', { 
        component: 'FranchiseeManagementService',
        franchisee_name: franchiseeData.franchisee_name 
      });

      const { data, error } = await supabase
        .from('franchisees')
        .insert([franchiseeData])
        .select()
        .single();

      if (error) {
        logger.error('Error creating franchisee', { 
          error, 
          franchiseeData,
          component: 'FranchiseeManagementService' 
        });
        throw errorService.createDatabaseError('create', 'franchisees');
      }

      logger.info('Successfully created franchisee', {
        component: 'FranchiseeManagementService',
        franchiseeId: data.id,
        franchisee_name: data.franchisee_name
      });

      return this.createResponse(data);
    }, 'createFranchisee');
  }

  async updateFranchisee(franchiseeData: UpdateFranchiseeData): Promise<ServiceResponse<Franchisee>> {
    return this.executeQuery(async () => {
      const { id, ...updateData } = franchiseeData;
      
      logger.info('Updating franchisee', { 
        component: 'FranchiseeManagementService',
        franchiseeId: id 
      });

      const { data, error } = await supabase
        .from('franchisees')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating franchisee', { 
          error, 
          franchiseeId: id,
          component: 'FranchiseeManagementService' 
        });
        throw errorService.createDatabaseError('update', 'franchisees');
      }

      logger.info('Successfully updated franchisee', {
        component: 'FranchiseeManagementService',
        franchiseeId: data.id
      });

      return this.createResponse(data);
    }, 'updateFranchisee');
  }

  async deleteFranchisee(franchiseeId: string): Promise<ServiceResponse<boolean>> {
    return this.executeQuery(async () => {
      logger.info('Deleting franchisee', { 
        component: 'FranchiseeManagementService',
        franchiseeId 
      });

      const { error } = await supabase
        .from('franchisees')
        .delete()
        .eq('id', franchiseeId);

      if (error) {
        logger.error('Error deleting franchisee', { 
          error, 
          franchiseeId,
          component: 'FranchiseeManagementService' 
        });
        throw errorService.createDatabaseError('delete', 'franchisees');
      }

      logger.info('Successfully deleted franchisee', {
        component: 'FranchiseeManagementService',
        franchiseeId
      });

      return this.createResponse(true);
    }, 'deleteFranchisee');
  }

  filterFranchisees(franchisees: Franchisee[], filters: FranchiseeFilters): Franchisee[] {
    return franchisees.filter(franchisee => {
      // Filtro de búsqueda
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          franchisee.franchisee_name.toLowerCase().includes(searchTerm) ||
          franchisee.company_name?.toLowerCase().includes(searchTerm) ||
          franchisee.tax_id?.toLowerCase().includes(searchTerm);
        
        if (!matchesSearch) return false;
      }

      // Filtro de cuenta
      if (filters.hasAccount !== undefined) {
        if (filters.hasAccount !== franchisee.hasAccount) return false;
      }

      // Filtro de restaurantes
      if (filters.totalRestaurants) {
        const { min, max } = filters.totalRestaurants;
        const total = franchisee.total_restaurants || 0;
        
        if (min !== undefined && total < min) return false;
        if (max !== undefined && total > max) return false;
      }

      return true;
    });
  }

  validateFranchiseeData(data: CreateFranchiseeData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.franchisee_name?.trim()) {
      errors.push('El nombre del franquiciado es requerido');
    }

    if (data.tax_id && data.tax_id.length < 8) {
      errors.push('El NIF/CIF debe tener al menos 8 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const franchiseeManagementService = new FranchiseeManagementService();