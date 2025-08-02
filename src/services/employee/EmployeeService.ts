// Servicio de Empleados
import { supabase } from '@/integrations/supabase/client';
import { BaseService, ServiceResponse, createResponse } from '../base/BaseService';
import type { Employee } from '@/types/core';

export class EmployeeService extends BaseService {
  constructor() {
    super('EmployeeService');
  }
  async getEmployees(restaurantId?: string): Promise<ServiceResponse<Employee[]>> {
    return this.executeQuery(async () => {
      let query = supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (restaurantId) {
        query = query.eq('restaurant_id', restaurantId);
      }

      const { data, error } = await query;

      if (error) return createResponse(null, error.message);
      return createResponse(data || []);
    }, 'EmployeeService.getEmployees');
  }

  async getEmployee(id: string): Promise<ServiceResponse<Employee>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

      if (error) return createResponse(null, error.message);
      return createResponse(data);
    }, 'EmployeeService.getEmployee');
  }

  async createEmployee(employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<Employee>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('employees')
        .insert(employeeData)
        .select()
        .single();

      if (error) return createResponse(null, error.message);
      return createResponse(data);
    }, 'EmployeeService.createEmployee');
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<ServiceResponse<Employee>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) return createResponse(null, error.message);
      return createResponse(data);
    }, 'EmployeeService.updateEmployee');
  }

  async deleteEmployee(id: string): Promise<ServiceResponse<void>> {
    return this.executeQuery(async () => {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) return createResponse(null, error.message);
      return createResponse(undefined);
    }, 'EmployeeService.deleteEmployee');
  }
}

export const employeeService = new EmployeeService();