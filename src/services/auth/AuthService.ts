// Auth Service consolidado
import { supabase } from '@/integrations/supabase/client';
import { BaseService, ServiceResponse, createResponse } from '../base/BaseService';
import type { User, Franchisee } from '@/types/core';

export class AuthService extends BaseService {
  async signIn(email: string, password: string): Promise<ServiceResponse<{ user: User; session: any }>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) return createResponse(null, error.message);
      
      return createResponse({
        user: data.user as User,
        session: data.session
      });
    }, 'AuthService.signIn');
  }

  async signUp(email: string, password: string, fullName: string): Promise<ServiceResponse<User>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: fullName }
        }
      });
      
      if (error) return createResponse(null, error.message);
      
      return createResponse(data.user as User);
    }, 'AuthService.signUp');
  }

  async signOut(): Promise<ServiceResponse<void>> {
    return this.executeQuery(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) return createResponse(null, error.message);
      return createResponse(null);
    }, 'AuthService.signOut');
  }

  async getCurrentUser(): Promise<ServiceResponse<User>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) return createResponse(null, error.message);
      return createResponse(data.user as User);
    }, 'AuthService.getCurrentUser');
  }
}

export const authService = new AuthService();