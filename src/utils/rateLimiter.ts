/**
 * Rate Limiting System - McDonald's Franchisee Management Portal
 * 
 * Sistema de limitación de velocidad para proteger endpoints críticos
 * contra ataques de fuerza bruta y abuso de API.
 */

import { supabase } from '@/integrations/supabase/client';
import { RateLimitConfig, RateLimitEntry } from '@/types';

// Configuraciones de rate limiting por endpoint
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Autenticación - más restrictivo
  '/auth/login': {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5, // 5 intentos por IP
    endpoint: '/auth/login'
  },
  '/auth/signup': {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 3, // 3 registros por IP
    endpoint: '/auth/signup'
  },
  '/auth/reset-password': {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 3, // 3 intentos de reset
    endpoint: '/auth/reset-password'
  },
  
  // Edge Functions críticas
  '/functions/v1/biloop-integration': {
    windowMs: 1 * 60 * 1000, // 1 minuto
    maxRequests: 30, // 30 requests por minuto
    endpoint: '/functions/v1/biloop-integration'
  },
  '/functions/v1/quantum-integration': {
    windowMs: 1 * 60 * 1000, // 1 minuto
    maxRequests: 20, // 20 requests por minuto
    endpoint: '/functions/v1/quantum-integration'
  },
  '/functions/v1/orquest-webhook': {
    windowMs: 1 * 60 * 1000, // 1 minuto
    maxRequests: 100, // 100 webhooks por minuto
    endpoint: '/functions/v1/orquest-webhook'
  },
  
  // API de configuración
  '/functions/v1/secure-config': {
    windowMs: 5 * 60 * 1000, // 5 minutos
    maxRequests: 50, // 50 requests por 5 min
    endpoint: '/functions/v1/secure-config'
  },
  
  // APIs de integración
  '/functions/v1/delivery-integration': {
    windowMs: 1 * 60 * 1000, // 1 minuto
    maxRequests: 25, // 25 requests por minuto
    endpoint: '/functions/v1/delivery-integration'
  },
  '/functions/v1/pos-integration': {
    windowMs: 1 * 60 * 1000, // 1 minuto
    maxRequests: 25, // 25 requests por minuto
    endpoint: '/functions/v1/pos-integration'
  },
  '/functions/v1/accounting-integration': {
    windowMs: 1 * 60 * 1000, // 1 minuto
    maxRequests: 25, // 25 requests por minuto
    endpoint: '/functions/v1/accounting-integration'
  }
};

// Configuración de bloqueo temporal para IPs abusivas
export const PROGRESSIVE_BLOCKING = {
  firstViolation: 5 * 60 * 1000,    // 5 minutos
  secondViolation: 15 * 60 * 1000,  // 15 minutos
  thirdViolation: 60 * 60 * 1000,   // 1 hora
  persistent: 24 * 60 * 60 * 1000   // 24 horas para violaciones persistentes
};

/**
 * Función para obtener la IP real del cliente
 */
export const getClientIP = (request: Request): string => {
  // Verificar headers comunes de proxies
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  
  // Fallback para desarrollo
  return 'unknown';
};

/**
 * Función para verificar si una IP está bloqueada
 */
export const isIPBlocked = async (ip: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('rate_limit_blocks')
      .select('blocked_until')
      .eq('ip', ip)
      .gte('blocked_until', new Date().toISOString())
      .single();
      
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking IP block:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in isIPBlocked:', error);
    return false;
  }
};

/**
 * Función para bloquear una IP temporalmente
 */
export const blockIP = async (ip: string, endpoint: string, duration: number): Promise<void> => {
  try {
    const blockedUntil = new Date(Date.now() + duration).toISOString();
    
    const { error } = await supabase
      .from('rate_limit_blocks')
      .upsert({
        ip,
        endpoint,
        blocked_until: blockedUntil,
        reason: 'Rate limit exceeded',
        created_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error blocking IP:', error);
    }
  } catch (error) {
    console.error('Error in blockIP:', error);
  }
};

/**
 * Función principal de rate limiting
 */
export const checkRateLimit = async (
  ip: string, 
  endpoint: string
): Promise<{ allowed: boolean; remainingRequests?: number; resetTime?: Date }> => {
  try {
    // Verificar si la IP está bloqueada
    if (await isIPBlocked(ip)) {
      return { allowed: false };
    }
    
    // Obtener configuración para este endpoint
    const config = RATE_LIMIT_CONFIGS[endpoint];
    if (!config) {
      // Si no hay configuración específica, permitir
      return { allowed: true };
    }
    
    const windowStart = new Date(Date.now() - config.windowMs);
    
    // Obtener registros actuales para esta IP y endpoint
    const { data: existingRecords, error: fetchError } = await supabase
      .from('rate_limit_entries')
      .select('*')
      .eq('ip', ip)
      .eq('endpoint', endpoint)
      .gte('window_start', windowStart.toISOString())
      .order('window_start', { ascending: false })
      .limit(1);
      
    if (fetchError) {
      console.error('Error fetching rate limit records:', fetchError);
      // En caso de error, permitir la request (fail open)
      return { allowed: true };
    }
    
    const currentRecord = existingRecords?.[0];
    const now = new Date();
    
    if (currentRecord) {
      const recordWindowStart = new Date(currentRecord.window_start);
      const isInCurrentWindow = now.getTime() - recordWindowStart.getTime() < config.windowMs;
      
      if (isInCurrentWindow) {
        if (currentRecord.requests >= config.maxRequests) {
          // Rate limit excedido - bloquear IP si es necesario
          await handleRateLimitViolation(ip, endpoint, currentRecord.requests);
          return { 
            allowed: false, 
            remainingRequests: 0,
            resetTime: new Date(recordWindowStart.getTime() + config.windowMs)
          };
        }
        
        // Incrementar contador
        const { error: updateError } = await supabase
          .from('rate_limit_entries')
          .update({ 
            requests: currentRecord.requests + 1,
            last_request_at: now.toISOString()
          })
          .eq('id', currentRecord.id);
          
        if (updateError) {
          console.error('Error updating rate limit record:', updateError);
        }
        
        return { 
          allowed: true, 
          remainingRequests: config.maxRequests - currentRecord.requests - 1,
          resetTime: new Date(recordWindowStart.getTime() + config.windowMs)
        };
      }
    }
    
    // Crear nuevo registro de ventana
    const { error: createError } = await supabase
      .from('rate_limit_entries')
      .insert({
        ip,
        endpoint,
        requests: 1,
        window_start: now.toISOString(),
        last_request_at: now.toISOString()
      });
      
    if (createError) {
      console.error('Error creating rate limit record:', createError);
    }
    
    return { 
      allowed: true, 
      remainingRequests: config.maxRequests - 1,
      resetTime: new Date(now.getTime() + config.windowMs)
    };
    
  } catch (error) {
    console.error('Error in checkRateLimit:', error);
    // En caso de error, permitir la request (fail open)
    return { allowed: true };
  }
};

/**
 * Función para manejar violaciones de rate limit
 */
const handleRateLimitViolation = async (
  ip: string, 
  endpoint: string, 
  currentRequests: number
): Promise<void> => {
  try {
    // Obtener historial de violaciones para esta IP
    const { data: violations, error } = await supabase
      .from('rate_limit_violations')
      .select('*')
      .eq('ip', ip)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // últimas 24h
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching violations:', error);
      return;
    }
    
    const violationCount = violations?.length || 0;
    let blockDuration = PROGRESSIVE_BLOCKING.firstViolation;
    
    // Determinar duración del bloqueo basado en violaciones previas
    if (violationCount >= 3) {
      blockDuration = PROGRESSIVE_BLOCKING.persistent;
    } else if (violationCount === 2) {
      blockDuration = PROGRESSIVE_BLOCKING.thirdViolation;
    } else if (violationCount === 1) {
      blockDuration = PROGRESSIVE_BLOCKING.secondViolation;
    }
    
    // Registrar la violación
    const { error: violationError } = await supabase
      .from('rate_limit_violations')
      .insert({
        ip,
        endpoint,
        requests_count: currentRequests,
        block_duration: blockDuration,
        created_at: new Date().toISOString()
      });
      
    if (violationError) {
      console.error('Error recording violation:', violationError);
    }
    
    // Bloquear la IP
    await blockIP(ip, endpoint, blockDuration);
    
    console.warn(`🚨 SECURITY: IP ${ip} blocked for ${blockDuration}ms due to rate limit violation on ${endpoint}`);
    
  } catch (error) {
    console.error('Error handling rate limit violation:', error);
  }
};

/**
 * Función para limpiar registros antiguos (para mantenimiento)
 */
export const cleanupOldRecords = async (): Promise<void> => {
  try {
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 24 horas atrás
    
    // Limpiar entradas de rate limit antiguas
    await supabase
      .from('rate_limit_entries')
      .delete()
      .lt('window_start', cutoffDate);
      
    // Limpiar bloques expirados
    await supabase
      .from('rate_limit_blocks')
      .delete()
      .lt('blocked_until', new Date().toISOString());
      
    // Limpiar violaciones antiguas (mantener últimos 7 días para análisis)
    const violationsCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from('rate_limit_violations')
      .delete()
      .lt('created_at', violationsCutoff);
      
  } catch (error) {
    console.error('Error cleaning up old records:', error);
  }
};

/**
 * Middleware de rate limiting para Edge Functions
 */
export const rateLimitMiddleware = async (
  request: Request,
  endpoint: string
): Promise<{ allowed: boolean; response?: Response }> => {
  const ip = getClientIP(request);
  const result = await checkRateLimit(ip, endpoint);
  
  if (!result.allowed) {
    const response = new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: 'Too many requests from this IP address',
        endpoint,
        retryAfter: result.resetTime?.toISOString()
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': result.resetTime ? Math.ceil((result.resetTime.getTime() - Date.now()) / 1000).toString() : '60',
          'X-RateLimit-Limit': RATE_LIMIT_CONFIGS[endpoint]?.maxRequests.toString() || 'unknown',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.resetTime?.getTime().toString() || '0'
        }
      }
    );
    
    return { allowed: false, response };
  }
  
  return { allowed: true };
};