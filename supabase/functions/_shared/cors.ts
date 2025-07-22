
export interface CorsConfig {
  allowedOrigins?: string[];
  allowedHeaders?: string[];
  allowedMethods?: string[];
  allowCredentials?: boolean;
}

export function createCorsHeaders(origin: string | null, config: CorsConfig = {}) {
  const {
    allowedOrigins = getDefaultAllowedOrigins(),
    allowedHeaders = [
      'authorization',
      'x-client-info', 
      'apikey',
      'content-type',
      'x-supabase-auth'
    ],
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowCredentials = true
  } = config;

  // Verificar si el origen está permitido
  const isOriginAllowed = origin && isAllowedOrigin(origin, allowedOrigins);
  
  // Log de intentos de acceso no autorizados
  if (origin && !isOriginAllowed) {
    console.warn(`CORS: Blocked request from unauthorized origin: ${origin}`);
  }

  return {
    'Access-Control-Allow-Origin': isOriginAllowed ? origin : 'null',
    'Access-Control-Allow-Headers': allowedHeaders.join(', '),
    'Access-Control-Allow-Methods': allowedMethods.join(', '),
    'Access-Control-Allow-Credentials': allowCredentials.toString(),
    'Access-Control-Max-Age': '86400', // 24 horas
    'Vary': 'Origin'
  };
}

function getDefaultAllowedOrigins(): string[] {
  const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS');
  if (allowedOrigins) {
    return allowedOrigins.split(',').map(origin => origin.trim());
  }

  // Fallback seguro para diferentes entornos
  const developmentMode = Deno.env.get('DEVELOPMENT_MODE') === 'true';
  
  const defaultOrigins = [
    'https://ckvqfrppnfhoadcpqhld.lovableproject.com', // Producción
    'https://*.lovableproject.com' // Otros subdominios de Lovable
  ];

  if (developmentMode) {
    defaultOrigins.push(
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    );
  }

  return defaultOrigins;
}

function isAllowedOrigin(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.some(allowed => {
    // Soporte para wildcards
    if (allowed.includes('*')) {
      const pattern = allowed.replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(origin);
    }
    return origin === allowed;
  });
}

export function handleCorsPreflightRequest(origin: string | null, config?: CorsConfig) {
  const headers = createCorsHeaders(origin, config);
  return new Response(null, { 
    status: 204,
    headers 
  });
}

export function createCorsResponse(data: any, origin: string | null, config?: CorsConfig, status = 200) {
  const headers = createCorsHeaders(origin, config);
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    }
  });
}
