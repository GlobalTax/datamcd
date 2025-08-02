// === SERVICIO DE GESTIÓN DE ASESORES ===
// Extrae toda la lógica de negocio de AdvisorManagement.tsx

import { supabase } from '@/integrations/supabase/client';
import { BaseService, ServiceResponse } from '../base/BaseService';
import { logger } from '../base/LoggerService';
import { errorService } from '../base/ErrorService';
import type { User } from '@/types/domains/auth';

export class AdvisorService extends BaseService {
  constructor() {
    super('AdvisorService');
  }

  async getAdvisors(): Promise<ServiceResponse<User[]>> {
    return this.executeQuery(async () => {
      logger.info('Fetching advisors', { component: 'AdvisorService' });

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'superadmin'])
        .order('created_at', { ascending: false });

      if (error) {
        const errorMsg = 'Error al cargar administradores';
        logger.error(errorMsg, { error, component: 'AdvisorService' });
        throw errorService.createDatabaseError('fetch', 'profiles');
      }

      const typedAdvisors = (data || []).map(advisorData => ({
        ...advisorData,
        role: advisorData.role as 'admin' | 'superadmin'
      }));

      logger.info(`Successfully fetched ${typedAdvisors.length} advisors`, {
        component: 'AdvisorService',
        count: typedAdvisors.length
      });

      return this.createResponse(typedAdvisors);
    }, 'getAdvisors');
  }

  async deleteAdvisor(advisorId: string, advisorName: string): Promise<ServiceResponse<boolean>> {
    return this.executeQuery(async () => {
      logger.info('Deleting advisor', { 
        component: 'AdvisorService',
        advisorId,
        advisorName 
      });

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', advisorId);

      if (error) {
        const errorMsg = 'Error al eliminar administrador';
        logger.error(errorMsg, { 
          error, 
          advisorId, 
          advisorName,
          component: 'AdvisorService' 
        });
        throw errorService.createDatabaseError('delete', 'profiles');
      }

      logger.info('Successfully deleted advisor', {
        component: 'AdvisorService',
        advisorId,
        advisorName
      });

      return this.createResponse(true);
    }, 'deleteAdvisor');
  }

  canDeleteAdvisor(currentUserRole: string, targetAdvisorRole: string): boolean {
    // Lógica de permisos centralizada
    if (currentUserRole === 'superadmin') {
      return targetAdvisorRole !== 'superadmin'; // Superadmin no puede eliminar otros superadmin
    }
    
    if (currentUserRole === 'admin') {
      return targetAdvisorRole === 'franchisee' || targetAdvisorRole === 'staff';
    }

    return false;
  }

  getRoleBadgeVariant(role: string): 'destructive' | 'default' | 'secondary' {
    switch (role) {
      case 'superadmin':
        return 'destructive';
      case 'admin':
        return 'default';
      default:
        return 'secondary';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'superadmin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'franchisee':
        return 'Franquiciado';
      case 'staff':
        return 'Personal';
      default:
        return role;
    }
  }
}

export const advisorService = new AdvisorService();