import { supabase } from '@/integrations/supabase/client';

// Lista de claves sensibles que deben ser eliminadas del localStorage
const SENSITIVE_KEYS = [
  'api_key',
  'api-key',
  'apikey',
  'secret',
  'token',
  'password',
  'credential',
  'auth',
  'delivery-config',
  'pos-config',
  'accounting-config',
  'integration-config'
];

// Función para detectar claves sensibles en localStorage
export const detectSensitiveData = (): string[] => {
  const foundKeys: string[] = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        // Verificar si la clave contiene términos sensibles
        const isSensitive = SENSITIVE_KEYS.some(sensitiveKey => 
          key.toLowerCase().includes(sensitiveKey.toLowerCase())
        );
        
        if (isSensitive) {
          foundKeys.push(key);
        }
        
        // También verificar el contenido para detectar patrones de API keys
        try {
          const value = localStorage.getItem(key);
          if (value && typeof value === 'string') {
            // Detectar patrones comunes de API keys
            const apiKeyPatterns = [
              /sk-[a-zA-Z0-9]{32,}/i, // OpenAI style
              /pk-[a-zA-Z0-9]{32,}/i, // Stripe style
              /AIza[a-zA-Z0-9_-]{35}/i, // Google API
              /ya29\.[a-zA-Z0-9_-]+/i, // Google OAuth
              /[a-zA-Z0-9]{32,}/i // Generic long strings
            ];
            
            const containsApiKey = apiKeyPatterns.some(pattern => pattern.test(value));
            if (containsApiKey && !foundKeys.includes(key)) {
              foundKeys.push(key);
            }
          }
        } catch (e) {
          // Ignorar errores de parsing
        }
      }
    }
  } catch (error) {
    console.error('Error detecting sensitive data:', error);
  }
  
  return foundKeys;
};

// Función para limpiar datos sensibles
export const cleanupSensitiveData = async (): Promise<{
  success: boolean;
  cleanedKeys: string[];
  error?: string;
}> => {
  try {
    const sensitiveKeys = detectSensitiveData();
    
    // Eliminar claves sensibles del localStorage
    sensitiveKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
        console.log(`Removed sensitive key: ${key}`);
      } catch (error) {
        console.error(`Error removing key ${key}:`, error);
      }
    });
    
    // También limpiar sessionStorage
    const sessionKeys: string[] = [];
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          const isSensitive = SENSITIVE_KEYS.some(sensitiveKey => 
            key.toLowerCase().includes(sensitiveKey.toLowerCase())
          );
          if (isSensitive) {
            sessionKeys.push(key);
            sessionStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning sessionStorage:', error);
    }
    
    // Registrar la limpieza en la base de datos
    try {
      await supabase.rpc('cleanup_local_storage_data');
    } catch (error) {
      console.error('Error logging cleanup:', error);
    }
    
    return {
      success: true,
      cleanedKeys: [...sensitiveKeys, ...sessionKeys]
    };
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    return {
      success: false,
      cleanedKeys: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Función para verificar si hay datos sensibles
export const hasSensitiveData = (): boolean => {
  return detectSensitiveData().length > 0;
};

// Función para ejecutar limpieza automática al cargar la app
export const performSecurityAudit = async (): Promise<void> => {
  const sensitiveKeys = detectSensitiveData();
  
  if (sensitiveKeys.length > 0) {
    console.warn('⚠️ SECURITY ALERT: Sensitive data detected in localStorage:', sensitiveKeys);
    
    // Realizar limpieza automática
    const result = await cleanupSensitiveData();
    
    if (result.success) {
      console.log('✅ Security cleanup completed. Removed keys:', result.cleanedKeys);
    } else {
      console.error('❌ Security cleanup failed:', result.error);
    }
  }
};