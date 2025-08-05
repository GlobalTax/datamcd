import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Updated CompanyData interface according to specifications
interface CompanyData {
  name: string;
  nif: string;
  address_street?: string;
  address_city?: string;
  address_postal_code?: string;
  business_sector?: string;
  legal_representative?: string;
  status: 'activo' | 'inactivo';
  client_type: 'empresa';
  is_mock?: boolean; // Flag to indicate if data is simulated
}

// OAuth2 token cache
interface TokenCache {
  token: string;
  expires_at: number;
}

let tokenCache: TokenCache | null = null;

// eInforma usa autenticación básica, no OAuth
interface EInformaSearchResponse {
  empresa: Array<{
    id: string;
    denominacion: string;
    nombreComercial?: string[];
    cif: string;
    domicilioSocial?: string;
    localidad?: string;
    provincia?: string;
    cnae?: string;
    situacion?: string;
    fechaConstitucion?: string;
    capitalSocial?: number;
    formaJuridica?: string;
    telefono?: string[];
    email?: string;
    web?: string[];
    empleados?: number;
    ventas?: number;
    fechaUltimoBalance?: string;
    identificativo?: string;
    tipoDenominacion?: string;
    cargoPrincipal?: string;
    anioVentas?: string;
    fax?: string[];
  }>;
}

interface EInformaCompanySearchResponse {
  data: Array<{
    id: string;
    name: string;
    comercialName?: string;
    cif: string;
    address?: string;
    postalCode?: string;
    city?: string;
    province?: string;
    cnae?: string;
    cnaeDescription?: string;
    constitutionDate?: string;
    capital?: number;
    legalForm?: string;
    phone?: string;
    email?: string;
    web?: string;
    employees?: number;
    turnover?: number;
    rating?: string;
    status?: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { action, cif } = await req.json();
    console.log(`eInforma Integration - Action: ${action}, CIF: ${cif}`);

    switch (action) {
      case 'validate_cif':
        return await validateCIF(cif);
      
      case 'enrich_company':
        return await enrichCompanyData(supabaseClient, cif);
      
      case 'get_company_data':
        return await getCompanyData(supabaseClient, cif);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Acción no válida' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error in einforma-integration function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Enhanced validation for NIF, CIF, and NIE
function validateNIF(nif: string): boolean {
  const cleanNif = nif.trim().toUpperCase();
  
  // NIF: 8 digits + letter (e.g., 12345678Z)
  const nifRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
  if (nifRegex.test(cleanNif)) {
    const numbers = cleanNif.substring(0, 8);
    const letter = cleanNif.substring(8, 9);
    const validLetters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const expectedLetter = validLetters[parseInt(numbers) % 23];
    return letter === expectedLetter;
  }
  
  // CIF: letter + 7 digits + digit/letter (e.g., B12345678)
  const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/;
  if (cifRegex.test(cleanNif)) {
    return true; // Basic format validation for CIF
  }
  
  // NIE: X/Y/Z + 7 digits + letter (e.g., X1234567L)
  const nieRegex = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
  if (nieRegex.test(cleanNif)) {
    const niePrefix = cleanNif.substring(0, 1);
    const numbers = cleanNif.substring(1, 8);
    const letter = cleanNif.substring(8, 9);
    
    // Convert NIE prefix to number
    const prefixMap: {[key: string]: string} = { 'X': '0', 'Y': '1', 'Z': '2' };
    const fullNumber = prefixMap[niePrefix] + numbers;
    
    const validLetters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const expectedLetter = validLetters[parseInt(fullNumber) % 23];
    return letter === expectedLetter;
  }
  
  return false;
}

async function validateCIF(cif: string) {
  const isValid = validateNIF(cif);
  
  console.log(`NIF/CIF/NIE Validation - ${cif}: ${isValid ? 'VALID' : 'INVALID'}`);
  
  return new Response(
    JSON.stringify({ 
      cif, 
      valid: isValid,
      message: isValid ? 'NIF/CIF/NIE válido' : 'Formato de NIF/CIF/NIE inválido'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// OAuth2 token management
async function getOAuth2Token(): Promise<string> {
  console.log('=== Getting OAuth2 token ===');
  
  // Check if we have a valid cached token
  if (tokenCache && Date.now() < tokenCache.expires_at) {
    console.log('Using cached token');
    return tokenCache.token;
  }
  
  const clientId = Deno.env.get('EINFORMA_CLIENT_ID');
  const clientSecret = Deno.env.get('EINFORMA_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    console.log('OAuth2 credentials not configured, using development mode');
    throw new Error('DEVELOPMENT_MODE');
  }
  
  console.log('OAuth2 credentials configured, requesting token');
  
  try {
    const tokenResponse = await fetch('https://developers.einforma.com/api/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'buscar:consultar:empresas'
      })
    });
    
    if (!tokenResponse.ok) {
      throw new Error(`OAuth2 token request failed: ${tokenResponse.status}`);
    }
    
    const tokenData = await tokenResponse.json();
    console.log('OAuth2 token obtained successfully');
    
    // Cache the token (expires in 1 hour by default, cache for 50 minutes)
    tokenCache = {
      token: tokenData.access_token,
      expires_at: Date.now() + (50 * 60 * 1000) // 50 minutes
    };
    
    return tokenData.access_token;
  } catch (error) {
    console.error('Error obtaining OAuth2 token:', error);
    throw error;
  }
}

// Generate mock company data for development mode
function generateMockCompanyData(nif: string): CompanyData {
  const companies = {
    'B67261552': {
      name: 'Tecnología Avanzada S.L.',
      nif: 'B67261552',
      address_street: 'Calle Gran Vía 123',
      address_city: 'Madrid',
      address_postal_code: '28001',
      business_sector: 'Desarrollo de software',
      legal_representative: 'Juan Pérez García',
      status: 'activo' as const,
      client_type: 'empresa' as const,
      is_mock: true
    },
    'A12345678': {
      name: 'Distribuciones del Norte S.A.',
      nif: 'A12345678',
      address_street: 'Avenida de la Constitución 456',
      address_city: 'Barcelona',
      address_postal_code: '08001',
      business_sector: 'Distribución comercial',
      legal_representative: 'María López Sánchez',
      status: 'activo' as const,
      client_type: 'empresa' as const,
      is_mock: true
    }
  };
  
  return companies[nif as keyof typeof companies] || {
    name: `Empresa Ejemplo ${nif}`,
    nif: nif,
    address_street: 'Calle Ejemplo 1',
    address_city: 'Madrid',
    address_postal_code: '28000',
    business_sector: 'Actividades empresariales',
    legal_representative: 'Representante Legal',
    status: 'activo' as const,
    client_type: 'empresa' as const,
    is_mock: true
  };
}

async function getCompanyReportByCIF(cif: string, token: string): Promise<CompanyData> {
  console.log('=== Getting company report for CIF:', cif, '===');
  
  const url = `https://developers.einforma.com/api/v1/companies/${cif}/report`;
  
  try {
    console.log('Calling eInforma API:', url);
    
    const reportResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'McDonald\'s-Portal/2.0'
      }
    });
    
    console.log('Response status:', reportResponse.status);
    
    if (!reportResponse.ok) {
      throw new Error(`API request failed: ${reportResponse.status}`);
    }
    
    const reportData = await reportResponse.json();
    console.log('Success with eInforma API');
    
    // Map eInforma response to our CompanyData format
    const mappedData: CompanyData = {
      name: reportData.denominacion || reportData.name || reportData.razon_social || 'Nombre no disponible',
      nif: cif.toUpperCase(),
      address_street: reportData.domicilioSocial?.direccion || reportData.address_street,
      address_city: reportData.domicilioSocial?.localidad || reportData.localidad || reportData.address_city,
      address_postal_code: reportData.domicilioSocial?.codigoPostal || reportData.address_postal_code,
      business_sector: reportData.cnae?.descripcion || reportData.cnae_descripcion || reportData.business_sector,
      legal_representative: reportData.representante_legal || reportData.legal_representative,
      status: (reportData.situacionAeat === 'ACTIVA' || reportData.status === 'active') ? 'activo' : 'inactivo',
      client_type: 'empresa',
      is_mock: false
    };
    
    return mappedData;
    
  } catch (error) {
    console.error('Error getting company report:', error);
    throw error;
  }
}

async function enrichCompanyData(supabaseClient: any, cif: string) {
  try {
    let companyData: CompanyData;
    let isFromAPI = false;
    
    try {
      // Try to get OAuth2 token
      const token = await getOAuth2Token();
      console.log('eInforma OAuth2 token obtained successfully');
      
      // Get company report from eInforma API
      companyData = await getCompanyReportByCIF(cif, token);
      isFromAPI = true;
      
    } catch (error) {
      if (error.message === 'DEVELOPMENT_MODE') {
        console.log('Using development mode - returning mock data');
        companyData = generateMockCompanyData(cif);
        isFromAPI = false;
      } else {
        throw error;
      }
    }

    console.log('Company found:', companyData.name, isFromAPI ? '(from API)' : '(mock data)');

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: companyData,
        is_mock: companyData.is_mock || false,
        message: isFromAPI 
          ? 'Datos de empresa obtenidos desde eInforma'
          : 'Datos de empresa simulados (modo desarrollo)'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error enriching company data from eInforma:', error);
    
    // If credentials error, return specific message
    if (error.message.includes('OAuth2') || error.message.includes('credentials')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Credenciales de eInforma no configuradas. Contacte con el administrador.',
          code: 'CREDENTIALS_NOT_CONFIGURED'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getCompanyData(supabaseClient: any, cif: string) {
  try {
    const { data, error } = await supabaseClient
      .from('company_data')
      .select('*')
      .eq('cif', cif.toUpperCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data || null,
        found: !!data 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error getting company data:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}