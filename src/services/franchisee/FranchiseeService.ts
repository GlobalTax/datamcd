// Servicio de Franquiciados usando el patrón base
import { supabase } from '@/integrations/supabase/client';
import { BaseService, ServiceResponse, createResponse } from '../base/BaseService';
import type { Franchisee } from '@/types/core';

export class FranchiseeService extends BaseService {
  constructor() {
    super('FranchiseeService');
  }
  async getFranchisees(): Promise<ServiceResponse<Franchisee[]>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('franchisees')
        .select(`
          *,
          profiles:user_id (email, full_name, phone),
          franchisee_restaurants!franchisee_restaurants_franchisee_id_fkey (
            status
          )
        `)
        .order('franchisee_name');

      if (error) return createResponse(null, error.message);

      const franchisees = (data || []).map((franchisee: any) => ({
        ...franchisee,
        total_restaurants: franchisee.franchisee_restaurants?.filter(
          (fr: any) => fr.status === 'active'
        ).length || 0,
        profiles: franchisee.profiles
      }));

      return createResponse(franchisees);
    }, 'FranchiseeService.getFranchisees');
  }

  async getFranchisee(id: string): Promise<ServiceResponse<Franchisee>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('franchisees')
        .select(`
          *,
          profiles:user_id (email, full_name, phone)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) return createResponse(null, error.message);
      if (!data) return createResponse(null, 'Franquiciado no encontrado');

      return createResponse({
        ...data,
        profiles: data.profiles
      });
    }, 'FranchiseeService.getFranchisee');
  }

  async createFranchisee(franchiseeData: Omit<Franchisee, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<Franchisee>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('franchisees')
        .insert(franchiseeData)
        .select()
        .single();

      if (error) return createResponse(null, error.message);
      return createResponse(data);
    }, 'FranchiseeService.createFranchisee');
  }

  async updateFranchisee(id: string, updates: Partial<Franchisee>): Promise<ServiceResponse<Franchisee>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('franchisees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) return createResponse(null, error.message);
      return createResponse(data);
    }, 'FranchiseeService.updateFranchisee');
  }

  async deleteFranchisee(id: string): Promise<ServiceResponse<void>> {
    return this.executeQuery(async () => {
      const { error } = await supabase
        .from('franchisees')
        .delete()
        .eq('id', id);

      if (error) return createResponse(null, error.message);
      return createResponse(null);
    }, 'FranchiseeService.deleteFranchisee');
  }
}

export const franchiseeService = new FranchiseeService();