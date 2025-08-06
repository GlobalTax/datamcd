import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// CompanyData interface matching the database schema
interface CompanyData {
  id?: string;
  cif: string;
  razon_social?: string;
  nombre_comercial?: string;
  domicilio_fiscal?: string;
  codigo_postal?: string;
  municipio?: string;
  provincia?: string;
  codigo_cnae?: string;
  descripcion_cnae?: string;
  situacion_aeat?: string;
  fecha_constitucion?: string;
  capital_social?: number;
  forma_juridica?: string;
  telefono?: string;
  email?: string;
  web?: string;
  empleados_estimados?: number;
  facturacion_estimada?: number;
  rating_crediticio?: string;
  fecha_ultima_actualizacion?: string;
  datos_adicionales?: any;
  validado_einforma?: boolean;
  created_at?: string;
  updated_at?: string;
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

    const { action, cif, restaurant_id } = await req.json();
    console.log(`eInforma Integration - Action: ${action}, CIF: ${cif}, Restaurant: ${restaurant_id}`);

    switch (action) {
      case 'validate_cif':
        return await validateCIF(cif);
      
      case 'enrich_company':
        return await enrichCompanyData(supabaseClient, cif, restaurant_id);
      
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
    'B66176728': {
      cif: 'B66176728',
      razon_social: 'SANT ADRIA 633 SL',
      nombre_comercial: 'McDonald\'s Sant Adrià',
      domicilio_fiscal: 'Carrer de la Concòrdia, 633, Sant Adrià de Besòs',
      codigo_postal: '08030',
      municipio: 'Sant Adrià de Besòs',
      provincia: 'Barcelona',
      codigo_cnae: '5610',
      descripcion_cnae: 'Restaurantes y puestos de comidas',
      situacion_aeat: 'ACTIVA',
      fecha_constitucion: '2010-03-15',
      capital_social: 3000,
      forma_juridica: 'Sociedad Limitada',
      telefono: '936548901',
      email: 'info@santadria633.com',
      empleados_estimados: 25,
      facturacion_estimada: 850000,
      rating_crediticio: 'A',
      validado_einforma: true,
      datos_adicionales: { is_mock: true, source: 'development' }
    },
    'A09936527': {
      cif: 'A09936527',
      razon_social: 'BARCELONA TAJO SA',
      nombre_comercial: 'McDonald\'s Barcelona Tajo',
      domicilio_fiscal: 'Avinguda del Tajo, 45, 08038 Barcelona',
      codigo_postal: '08038',
      municipio: 'Barcelona',
      provincia: 'Barcelona',
      codigo_cnae: '5610',
      descripcion_cnae: 'Restaurantes y puestos de comidas',
      situacion_aeat: 'ACTIVA',
      fecha_constitucion: '2015-09-20',
      capital_social: 75000,
      forma_juridica: 'Sociedad Anónima',
      telefono: '934567890',
      email: 'info@barcelonatajo.es',
      web: 'https://www.mcdonalds.es',
      empleados_estimados: 35,
      facturacion_estimada: 1800000,
      rating_crediticio: 'A-',
      validado_einforma: true,
      datos_adicionales: { 
        is_mock: true, 
        source: 'development',
        site_number: '1193'
      }
    },
    'B67261552': {
      cif: 'B67261552',
      razon_social: 'Tecnología Avanzada S.L.',
      domicilio_fiscal: 'Calle Gran Vía 123, Madrid',
      codigo_postal: '28001',
      municipio: 'Madrid',
      provincia: 'Madrid',
      descripcion_cnae: 'Desarrollo de software',
      situacion_aeat: 'ACTIVA',
      empleados_estimados: 15,
      validado_einforma: true,
      datos_adicionales: { is_mock: true, source: 'development' }
    }
  };
  
  return companies[nif as keyof typeof companies] || {
    cif: nif,
    razon_social: `Empresa Ejemplo ${nif}`,
    domicilio_fiscal: 'Calle Ejemplo 1, Madrid',
    codigo_postal: '28000',
    municipio: 'Madrid',
    provincia: 'Madrid',
    descripcion_cnae: 'Actividades empresariales',
    situacion_aeat: 'ACTIVA',
    empleados_estimados: 10,
    validado_einforma: true,
    datos_adicionales: { is_mock: true, source: 'development' }
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
    
    // Map eInforma response to our database schema
    const mappedData: CompanyData = {
      cif: cif.toUpperCase(),
      razon_social: reportData.denominacion || reportData.name || reportData.razonSocial,
      nombre_comercial: reportData.nombreComercial?.[0] || reportData.comercialName,
      domicilio_fiscal: reportData.domicilioSocial?.direccionCompleta || 
                       `${reportData.domicilioSocial?.direccion || ''}, ${reportData.domicilioSocial?.localidad || ''}`.trim(),
      codigo_postal: reportData.domicilioSocial?.codigoPostal || reportData.postalCode,
      municipio: reportData.domicilioSocial?.localidad || reportData.city,
      provincia: reportData.domicilioSocial?.provincia || reportData.province,
      codigo_cnae: reportData.cnae?.codigo || reportData.cnae,
      descripcion_cnae: reportData.cnae?.descripcion || reportData.cnaeDescription,
      situacion_aeat: reportData.situacionAeat || reportData.status?.toUpperCase(),
      fecha_constitucion: reportData.fechaConstitucion || reportData.constitutionDate,
      capital_social: reportData.capitalSocial || reportData.capital,
      forma_juridica: reportData.formaJuridica || reportData.legalForm,
      telefono: reportData.telefono?.[0] || reportData.phone,
      email: reportData.email,
      web: reportData.web?.[0] || reportData.web,
      empleados_estimados: reportData.empleados || reportData.employees,
      facturacion_estimada: reportData.ventas || reportData.turnover,
      rating_crediticio: reportData.rating,
      fecha_ultima_actualizacion: new Date().toISOString(),
      validado_einforma: true,
      datos_adicionales: {
        source: 'einforma_api',
        original_response: reportData,
        enrichment_date: new Date().toISOString()
      }
    };
    
    return mappedData;
    
  } catch (error) {
    console.error('Error getting company report:', error);
    throw error;
  }
}

async function enrichCompanyData(supabaseClient: any, cif: string, restaurant_id?: string) {
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

    console.log('Company found:', companyData.razon_social, isFromAPI ? '(from API)' : '(mock data)');

    // Save/update company data in database
    try {
      const { data: savedData, error: saveError } = await supabaseClient
        .from('company_data')
        .upsert({
          ...companyData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'cif'
        })
        .select()
        .single();

      if (saveError) {
        console.error('Error saving company data:', saveError);
      } else {
        console.log('Company data saved successfully:', savedData.cif);
        companyData = savedData;
      }

      // Update restaurant's company_tax_id if restaurant_id is provided
      if (restaurant_id) {
        console.log('Updating restaurant company_tax_id:', restaurant_id, cif);
        
        const { error: updateError } = await supabaseClient
          .from('base_restaurants')
          .update({ 
            company_tax_id: cif.toUpperCase(),
            updated_at: new Date().toISOString()
          })
          .eq('id', restaurant_id);

        if (updateError) {
          console.error('Error updating restaurant company_tax_id:', updateError);
        } else {
          console.log('Restaurant company_tax_id updated successfully');
        }
      }

    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      // Continue without saving to database
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: companyData,
        is_mock: !isFromAPI,
        message: isFromAPI 
          ? 'Datos de empresa obtenidos desde eInforma y guardados'
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