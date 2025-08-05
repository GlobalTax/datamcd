import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EInformaCompanyData {
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
  datos_adicionales?: any;
}

interface EInformaAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
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

async function validateCIF(cif: string) {
  // Validación básica del formato de CIF español
  const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/;
  const isValid = cifRegex.test(cif.toUpperCase());
  
  console.log(`CIF Validation - ${cif}: ${isValid ? 'VALID' : 'INVALID'}`);
  
  return new Response(
    JSON.stringify({ 
      cif, 
      valid: isValid,
      message: isValid ? 'CIF válido' : 'Formato de CIF inválido'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getEInformaToken(): Promise<string> {
  console.log('=== Getting eInforma token ===');
  
  const clientId = Deno.env.get('EINFORMA_CLIENT_ID');
  const clientSecret = Deno.env.get('EINFORMA_CLIENT_SECRET');
  
  console.log('Client ID configured:', !!clientId);
  console.log('Client Secret configured:', !!clientSecret);
  
  if (!clientId || !clientSecret) {
    throw new Error('eInforma credentials not configured. Please configure EINFORMA_CLIENT_ID and EINFORMA_CLIENT_SECRET in Supabase secrets.');
  }

  try {
    // URL según documentación oficial de eInforma
    console.log('Getting eInforma token with credentials:', !!clientId, !!clientSecret);
    const tokenResponse = await fetch('https://developers.einforma.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    console.log('Token response status:', tokenResponse.status);
    console.log('Token response headers:', Object.fromEntries(tokenResponse.headers));

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('eInforma token error response:', errorText);
      throw new Error(`Failed to get eInforma token: ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData: EInformaAuthResponse = await tokenResponse.json();
    console.log('Token obtained successfully, expires in:', tokenData.expires_in);
    return tokenData.access_token;
  } catch (error) {
    console.error('Error getting eInforma token:', error);
    throw error;
  }
}

async function searchCompanyByCIF(cif: string, accessToken: string): Promise<any> {
  console.log('=== Searching company by CIF:', cif, '===');
  
  try {
    // URL según documentación oficial de eInforma - buscar por nombre/CIF
    const searchUrl = `https://developers.einforma.com/companies?name=${encodeURIComponent(cif)}`;
    console.log('Search URL:', searchUrl);
    
    const searchResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Search response status:', searchResponse.status);
    console.log('Search response headers:', Object.fromEntries(searchResponse.headers));

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('eInforma search error response:', errorText);
      throw new Error(`Failed to search company: ${searchResponse.status} - ${errorText}`);
    }

    const searchData = await searchResponse.json();
    console.log('Search response data:', JSON.stringify(searchData, null, 2));
    
    // Verificar estructura de respuesta según documentación eInforma
    if (!searchData.resultado?.empresa || searchData.resultado.empresa.length === 0) {
      console.log('No companies found for CIF:', cif);
      return null;
    }

    const company = searchData.resultado.empresa[0];
    console.log('Company found:', company);
    return company;
  } catch (error) {
    console.error('Error searching company:', error);
    throw error;
  }
}

async function getCompanyReport(companyId: string, accessToken: string): Promise<any> {
  console.log('=== Getting company report for ID:', companyId, '===');
  
  try {
    // URL según documentación oficial de eInforma
    const reportUrl = `https://developers.einforma.com/companies/${companyId}/report`;
    console.log('Report URL:', reportUrl);
    
    const reportResponse = await fetch(reportUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Report response status:', reportResponse.status);

    if (!reportResponse.ok) {
      const errorText = await reportResponse.text();
      console.error('eInforma report error response:', errorText);
      throw new Error(`Failed to get company report: ${reportResponse.status} - ${errorText}`);
    }

    const reportData = await reportResponse.json();
    console.log('Report obtained successfully');
    return reportData;
  } catch (error) {
    console.error('Error getting company report:', error);
    throw error;
  }
}

async function enrichCompanyData(supabaseClient: any, cif: string) {
  try {
    // Obtener token de autenticación
    const accessToken = await getEInformaToken();
    console.log('eInforma token obtained successfully');

    // Buscar empresa por CIF
    const companyBasicData = await searchCompanyByCIF(cif, accessToken);
    
    if (!companyBasicData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No se encontró la empresa con el CIF proporcionado' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Company found:', companyBasicData.denominacion || companyBasicData.name);

    // Obtener reporte detallado (opcional, puede tener coste adicional)
    let detailedReport = null;
    try {
      detailedReport = await getCompanyReport(companyBasicData.id, accessToken);
    } catch (error) {
      console.warn('Could not get detailed report:', error.message);
      // Continúar con datos básicos si no se puede obtener el reporte detallado
    }

    // Mapear datos de eInforma a nuestro formato según documentación
    const mappedData: EInformaCompanyData = {
      cif: cif.toUpperCase(),
      razon_social: companyBasicData.denominacion || '',
      nombre_comercial: companyBasicData.nombreComercial?.[0] || companyBasicData.denominacion,
      domicilio_fiscal: companyBasicData.domicilioSocial,
      codigo_postal: null, // No disponible en búsqueda básica
      municipio: companyBasicData.localidad,
      provincia: companyBasicData.provincia,
      codigo_cnae: companyBasicData.cnae,
      descripcion_cnae: null, // No disponible en búsqueda básica  
      situacion_aeat: companyBasicData.situacion || 'ACTIVA',
      fecha_constitucion: companyBasicData.fechaConstitucion,
      capital_social: companyBasicData.capitalSocial,
      forma_juridica: companyBasicData.formaJuridica,
      telefono: companyBasicData.telefono?.[0],
      email: companyBasicData.email,
      web: companyBasicData.web?.[0],
      empleados_estimados: companyBasicData.empleados,
      facturacion_estimada: companyBasicData.ventas,
      rating_crediticio: null, // No disponible en búsqueda básica
      datos_adicionales: {
        fuente: 'eInforma API',
        consulta_date: new Date().toISOString(),
        company_id: companyBasicData.id,
        fecha_ultimo_balance: companyBasicData.fechaUltimoBalance,
        identificativo: companyBasicData.identificativo,
        tipo_denominacion: companyBasicData.tipoDenominacion,
        cargo_principal: companyBasicData.cargoPrincipal,
        anio_ventas: companyBasicData.anioVentas,
        fax: companyBasicData.fax?.[0],
        detailed_report: detailedReport ? 'available' : 'not_available'
      }
    };

    // Insertar o actualizar datos en la base de datos
    const { data, error } = await supabaseClient
      .from('company_data')
      .upsert({
        ...mappedData,
        validado_einforma: true,
        fecha_ultima_actualizacion: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving company data:', error);
      throw error;
    }

    console.log(`Company data enriched from eInforma for CIF: ${cif}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data,
        message: 'Datos de empresa enriquecidos correctamente desde eInforma' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error enriching company data from eInforma:', error);
    
    // Si hay error de credenciales, devolver mensaje específico
    if (error.message.includes('credentials not configured')) {
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