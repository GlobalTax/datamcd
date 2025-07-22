/**
 * Rate Limiting Middleware para Edge Functions - McDonald's Portal
 * 
 * Middleware específico para implementar rate limiting en Edge Functions críticas
 * Protege contra ataques de fuerza bruta y abuso de API.
 */

// Interfaz para el resultado del rate limiting
export interface RateLimitResult {
  allowed: boolean;
  remainingRequests?: number;
  resetTime?: Date;
  response?: Response;
}

// Configuraciones de rate limiting específicas para Edge Functions
export const EDGE_FUNCTION_LIMITS = {
  // Autenticación y configuración
  'secure-config': {
    windowMs: 5 * 60 * 1000, // 5 minutos
    maxRequests: 50,
    blockDuration: 10 * 60 * 1000 // 10 minutos de bloqueo
  },
  
  // Integraciones externas
  'biloop-integration': {
    windowMs: 1 * 60 * 1000, // 1 minuto
    maxRequests: 30,
    blockDuration: 5 * 60 * 1000 // 5 minutos de bloqueo
  },
  
  'quantum-integration': {
    windowMs: 1 * 60 * 1000, // 1 minuto
    maxRequests: 20,
    blockDuration: 5 * 60 * 1000 // 5 minutos de bloqueo
  },
  
  // Webhooks (más permisivos)
  'orquest-webhook': {
    windowMs: 1 * 60 * 1000, // 1 minuto
    maxRequests: 100,
    blockDuration: 2 * 60 * 1000 // 2 minutos de bloqueo
  },
  
  // Integraciones de configuración
  'delivery-integration': {
    windowMs: 1 * 60 * 1000, // 1 minuto
    maxRequests: 25,
    blockDuration: 5 * 60 * 1000 // 5 minutos de bloqueo
  },
  
  'pos-integration': {
    windowMs: 1 * 60 * 1000, // 1 minuto
    maxRequests: 25,
    blockDuration: 5 * 60 * 1000 // 5 minutos de bloqueo
  },
  
  'accounting-integration': {
    windowMs: 1 * 60 * 1000, // 1 minuto
    maxRequests: 25,
    blockDuration: 5 * 60 * 1000 // 5 minutos de bloqueo
  }
};

/**
 * Obtener la IP real del cliente desde headers
 */
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  
  return 'unknown';
}

/**
 * Storage en memoria para rate limiting (para Edge Functions)
 * En producción se debería usar una base de datos compartida
 */
class InMemoryRateLimitStore {
  private records: Map<string, { count: number; resetTime: number; blocked?: number }> = new Map();
  private violations: Map<string, number[]> = new Map();

  getRecord(key: string): { count: number; resetTime: number; blocked?: number } | null {
    return this.records.get(key) || null;
  }

  setRecord(key: string, count: number, resetTime: number): void {
    this.records.set(key, { count, resetTime });
  }

  incrementRecord(key: string): number {
    const record = this.records.get(key);
    if (record) {
      record.count++;
      return record.count;
    }
    return 0;
  }

  blockIP(key: string, duration: number): void {
    const blockedUntil = Date.now() + duration;
    const record = this.records.get(key) || { count: 0, resetTime: 0 };
    record.blocked = blockedUntil;
    this.records.set(key, record);
  }

  isBlocked(key: string): boolean {
    const record = this.records.get(key);
    if (record?.blocked && record.blocked > Date.now()) {
      return true;
    }
    
    // Limpiar bloqueo expirado
    if (record?.blocked) {
      delete record.blocked;
    }
    
    return false;
  }

  addViolation(ip: string): void {
    const now = Date.now();
    const violations = this.violations.get(ip) || [];
    violations.push(now);
    
    // Mantener solo violaciones de las últimas 24 horas
    const filtered = violations.filter(time => now - time < 24 * 60 * 60 * 1000);
    this.violations.set(ip, filtered);
  }

  getViolationCount(ip: string): number {
    const now = Date.now();
    const violations = this.violations.get(ip) || [];
    return violations.filter(time => now - time < 24 * 60 * 60 * 1000).length;
  }

  // Limpiar registros antiguos periódicamente
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, record] of this.records.entries()) {
      if (record.resetTime < now && (!record.blocked || record.blocked < now)) {
        this.records.delete(key);
      }
    }
  }
}

// Instancia global del store (para Edge Functions)
const rateLimitStore = new InMemoryRateLimitStore();

/**
 * Middleware principal de rate limiting para Edge Functions
 */
export async function applyRateLimit(
  request: Request,
  functionName: string
): Promise<RateLimitResult> {
  const ip = getClientIP(request);
  const config = EDGE_FUNCTION_LIMITS[functionName as keyof typeof EDGE_FUNCTION_LIMITS];
  
  if (!config) {
    // Si no hay configuración específica, permitir
    return { allowed: true };
  }

  const key = `${ip}:${functionName}`;
  const now = Date.now();
  
  // Verificar si la IP está bloqueada
  if (rateLimitStore.isBlocked(key)) {
    return {
      allowed: false,
      response: createRateLimitResponse(
        'IP temporarily blocked due to rate limit violations',
        429,
        0,
        new Date(now + config.blockDuration)
      )
    };
  }

  const record = rateLimitStore.getRecord(key);
  
  if (!record || record.resetTime < now) {
    // Crear nueva ventana
    const resetTime = now + config.windowMs;
    rateLimitStore.setRecord(key, 1, resetTime);
    
    return {
      allowed: true,
      remainingRequests: config.maxRequests - 1,
      resetTime: new Date(resetTime)
    };
  }

  if (record.count >= config.maxRequests) {
    // Rate limit excedido
    handleRateLimitViolation(ip, functionName, record.count);
    rateLimitStore.blockIP(key, config.blockDuration);
    
    return {
      allowed: false,
      response: createRateLimitResponse(
        'Rate limit exceeded',
        429,
        0,
        new Date(record.resetTime)
      )
    };
  }

  // Incrementar contador
  const newCount = rateLimitStore.incrementRecord(key);
  
  return {
    allowed: true,
    remainingRequests: config.maxRequests - newCount,
    resetTime: new Date(record.resetTime)
  };
}

/**
 * Manejar violaciones de rate limit
 */
function handleRateLimitViolation(ip: string, functionName: string, requestCount: number): void {
  rateLimitStore.addViolation(ip);
  const violationCount = rateLimitStore.getViolationCount(ip);
  
  console.warn(`🚨 RATE LIMIT VIOLATION: IP ${ip} exceeded limit on ${functionName}`, {
    ip,
    functionName,
    requestCount,
    violationCount,
    timestamp: new Date().toISOString()
  });
  
  // En producción, aquí se podría enviar alerta a sistemas de monitoreo
  if (violationCount >= 5) {
    console.error(`🔥 CRITICAL: IP ${ip} has ${violationCount} violations in 24h - potential attack`);
  }
}

/**
 * Crear respuesta de rate limit
 */
function createRateLimitResponse(
  message: string,
  status: number,
  remaining: number,
  resetTime: Date
): Response {
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message,
      retryAfter: Math.ceil((resetTime.getTime() - Date.now()) / 1000)
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil((resetTime.getTime() - Date.now()) / 1000).toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': resetTime.getTime().toString(),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    }
  );
}

/**
 * Función helper para limpiar el store periódicamente
 */
export function startCleanupTimer(): void {
  setInterval(() => {
    rateLimitStore.cleanup();
  }, 5 * 60 * 1000); // Limpiar cada 5 minutos
}

/**
 * Middleware de CORS + Rate Limiting combinado
 */
export async function handleCorsAndRateLimit(
  request: Request,
  functionName: string
): Promise<{ proceed: boolean; response?: Response }> {
  // Manejar CORS preflight
  if (request.method === 'OPTIONS') {
    return {
      proceed: false,
      response: new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
        }
      })
    };
  }

  // Aplicar rate limiting
  const rateLimitResult = await applyRateLimit(request, functionName);
  
  if (!rateLimitResult.allowed) {
    return {
      proceed: false,
      response: rateLimitResult.response
    };
  }

  return { proceed: true };
}