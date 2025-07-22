
// Sanitización específica para audit logs
import { secureLogger } from './secureLogger';

interface AuditLogEntry {
  user_id: string;
  action_type: string;
  table_name: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
}

// Campos que nunca deben aparecer en audit logs
const AUDIT_BLACKLIST_FIELDS = [
  'password',
  'password_hash',
  'password_encrypted',
  'api_key',
  'api_key_encrypted',
  'token',
  'secret',
  'credential',
  'encrypted_credentials',
  'social_security_number',
  'bank_account',
  'private_key',
  'session_token',
  'refresh_token',
  'webhook_secret'
];

// Campos que deben ser parcialmente enmascarados
const AUDIT_MASK_FIELDS = [
  'email',
  'phone',
  'telephone',
  'mobile'
];

/**
 * Sanitiza valores para audit logs
 */
const sanitizeAuditValue = (key: string, value: any): any => {
  if (value === null || value === undefined) return value;
  
  const lowerKey = key.toLowerCase();
  
  // Remover campos completamente sensibles
  if (AUDIT_BLACKLIST_FIELDS.some(field => lowerKey.includes(field))) {
    return '[REDACTED]';
  }
  
  // Enmascarar campos parcialmente sensibles
  if (AUDIT_MASK_FIELDS.some(field => lowerKey.includes(field))) {
    if (typeof value === 'string' && value.length > 4) {
      return `${value.substring(0, 2)}****${value.substring(value.length - 2)}`;
    }
    return '[MASKED]';
  }
  
  // Si es un objeto, sanitizar recursivamente
  if (typeof value === 'object' && !Array.isArray(value)) {
    const sanitized: any = {};
    for (const [nestedKey, nestedValue] of Object.entries(value)) {
      sanitized[nestedKey] = sanitizeAuditValue(nestedKey, nestedValue);
    }
    return sanitized;
  }
  
  return value;
};

/**
 * Sanitiza un objeto completo para audit logs
 */
const sanitizeAuditObject = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeAuditValue(key, value);
  }
  
  return sanitized;
};

/**
 * Procesa y sanitiza una entrada de audit log antes de guardarla
 */
export const sanitizeAuditLogEntry = (entry: AuditLogEntry): AuditLogEntry => {
  const sanitized: AuditLogEntry = {
    user_id: entry.user_id,
    action_type: entry.action_type,
    table_name: entry.table_name,
    record_id: entry.record_id,
    ip_address: entry.ip_address ? 
      entry.ip_address.replace(/\.\d+$/, '.XXX') : // Enmascarar último octeto de IP
      undefined,
    user_agent: entry.user_agent
  };
  
  // Sanitizar old_values y new_values
  if (entry.old_values) {
    sanitized.old_values = sanitizeAuditObject(entry.old_values);
  }
  
  if (entry.new_values) {
    sanitized.new_values = sanitizeAuditObject(entry.new_values);
  }
  
  // Log de auditoría interna
  secureLogger.debug('Audit log sanitized', {
    table: entry.table_name,
    action: entry.action_type,
    hasOldValues: !!entry.old_values,
    hasNewValues: !!entry.new_values
  });
  
  return sanitized;
};

/**
 * Valida que una entrada de audit log no contenga datos sensibles
 */
export const validateAuditLogSafety = (entry: AuditLogEntry): boolean => {
  const entryString = JSON.stringify(entry).toLowerCase();
  
  // Buscar patrones peligrosos
  const dangerousPatterns = [
    /password['":\s]*[^,}]+/,
    /api[_-]?key['":\s]*[^,}]+/,
    /token['":\s]*[^,}]+/,
    /secret['":\s]*[^,}]+/,
    /credential['":\s]*[^,}]+/
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(entryString)) {
      secureLogger.security('Dangerous pattern detected in audit log', {
        table: entry.table_name,
        action: entry.action_type,
        pattern: pattern.source
      });
      return false;
    }
  }
  
  return true;
};

/**
 * Crea un filtro seguro para consultas de audit logs
 */
export const createSecureAuditLogFilter = () => {
  return {
    // Solo seleccionar campos seguros
    select: `
      user_id,
      action_type,
      table_name,
      record_id,
      created_at,
      ip_address,
      user_agent
    `,
    
    // Función para filtrar resultados adicionales
    filterResults: (logs: any[]) => {
      return logs.map(log => ({
        ...log,
        // Enmascarar IP si existe
        ip_address: log.ip_address ? 
          log.ip_address.replace(/\.\d+$/, '.XXX') : null,
        // Limpiar user agent de información sensible
        user_agent: log.user_agent ? 
          log.user_agent.replace(/\([^)]*\)/g, '(...)') : null
      }));
    }
  };
};
