
// Security Cleanup Utilities
import { supabase } from '@/integrations/supabase/client';

export interface SecurityAuditResult {
  cleanedKeys: number;
  success: boolean;
  errors?: string[];
}

export const performSecurityAudit = async (): Promise<SecurityAuditResult> => {
  try {
    let cleanedKeys = 0;
    const errors: string[] = [];

    // Limpiar tokens expirados de localStorage
    const tokenKeys = Object.keys(localStorage).filter(key => 
      key.includes('token') || key.includes('auth') || key.includes('session')
    );

    for (const key of tokenKeys) {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          // Verificar si el token está expirado
          const parsed = JSON.parse(value);
          if (parsed.expires_at && new Date(parsed.expires_at) < new Date()) {
            localStorage.removeItem(key);
            cleanedKeys++;
          }
        }
      } catch (error) {
        // Si no se puede parsear, es probablemente un token corrupto
        localStorage.removeItem(key);
        cleanedKeys++;
      }
    }

    // Limpiar datos de sesión obsoletos en Supabase
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        errors.push(`Session refresh failed: ${error.message}`);
      }
    } catch (error) {
      errors.push(`Session cleanup failed: ${error}`);
    }

    return {
      cleanedKeys,
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    return {
      cleanedKeys: 0,
      success: false,
      errors: [`Security audit failed: ${error}`]
    };
  }
};

// Función para limpiar cookies de autenticación
export const clearAuthCookies = (): number => {
  let cleared = 0;
  const cookies = document.cookie.split(';');
  
  for (const cookie of cookies) {
    const [name] = cookie.split('=');
    const cleanName = name.trim();
    
    if (cleanName.includes('auth') || cleanName.includes('session') || cleanName.includes('token')) {
      document.cookie = `${cleanName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      cleared++;
    }
  }
  
  return cleared;
};

// Función para validar la integridad de tokens
export const validateTokenIntegrity = (token: string): boolean => {
  try {
    // Verificación básica de estructura JWT
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Verificar que cada parte esté en base64
    for (const part of parts) {
      try {
        atob(part.replace(/-/g, '+').replace(/_/g, '/'));
      } catch {
        return false;
      }
    }
    
    return true;
  } catch {
    return false;
  }
};
