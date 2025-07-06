import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useImpersonation } from '@/hooks/useImpersonation';

interface QueryContext {
  isImpersonating: boolean;
  impersonatedFranchiseeId?: string;
  originalUserId?: string;
}

export const useSupabaseInterceptor = () => {
  const { isImpersonating, impersonatedFranchisee } = useImpersonation();
  const queryLogRef = useRef<Array<{ query: string, context: QueryContext, timestamp: number }>>([]);

  const logQuery = useCallback((query: string, context: QueryContext) => {
    queryLogRef.current.push({
      query,
      context,
      timestamp: Date.now()
    });
    
    // Keep only last 50 queries
    if (queryLogRef.current.length > 50) {
      queryLogRef.current = queryLogRef.current.slice(-50);
    }

    console.log('SUPABASE_INTERCEPTOR:', {
      query,
      context,
      isImpersonating: context.isImpersonating,
      franchiseeId: context.impersonatedFranchiseeId
    });
  }, []);

  const createContextualClient = useCallback(() => {
    const context: QueryContext = {
      isImpersonating,
      impersonatedFranchiseeId: impersonatedFranchisee?.id,
      originalUserId: undefined
    };

    logQuery('Creating contextual client', context);

    // Retornar el cliente original de Supabase con logging
    // Las consultas serán manejadas por las políticas RLS actualizadas
    return {
      ...supabase,
      from: (table: any) => {
        logQuery(`Query to table: ${table}`, context);
        return supabase.from(table);
      }
    };
  }, [isImpersonating, impersonatedFranchisee, logQuery]);

  const getQueryLogs = useCallback(() => {
    return queryLogRef.current;
  }, []);

  const clearQueryLogs = useCallback(() => {
    queryLogRef.current = [];
  }, []);

  return {
    createContextualClient,
    getQueryLogs,
    clearQueryLogs
  };
};
