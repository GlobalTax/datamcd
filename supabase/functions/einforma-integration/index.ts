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
  const clientId = Deno.env.get('EINFORMA_CLIENT_ID');
  const clientSecret = Deno.env.get('EINFORMA_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    throw new Error('eInforma credentials not configured');
  }

  // URL corregida según documentación oficial de eInforma
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

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('eInforma token error:', errorText);
    throw new Error(`Failed to get eInforma token: ${tokenResponse.status} ${errorText}`);
  }

  const tokenData: EInformaAuthResponse = await tokenResponse.json();
  return tokenData.access_token;
}

async function searchCompanyByCIF(cif: string, accessToken: string): Promise<any> {
  // URL y parámetros corregidos según documentación oficial de eInforma
  const searchResponse = await fetch(`https://developers.einforma.com/api/v1/companies?companySearch=${encodeURIComponent(cif)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!searchResponse.ok) {
    const errorText = await searchResponse.text();
    console.error('eInforma search error:', errorText);
    throw new Error(`Failed to search company: ${searchResponse.status} ${errorText}`);
  }

  const searchData: EInformaCompanySearchResponse = await searchResponse.json();
  
  if (!searchData.data || searchData.data.length === 0) {
    return null;
  }

  return searchData.data[0];
}

async function getCompanyReport(companyId: string, accessToken: string): Promise<any> {
  // URL corregida para endpoint de reportes detallados
  const reportResponse = await fetch(`https://developers.einforma.com/api/v1/companies/${companyId}/report`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!reportResponse.ok) {
    const errorText = await reportResponse.text();
    console.error('eInforma report error:', errorText);
    throw new Error(`Failed to get company report: ${reportResponse.status} ${errorText}`);
  }

  return await reportResponse.json();
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

    console.log('Company found:', companyBasicData.name);

    // Obtener reporte detallado (opcional, puede tener coste adicional)
    let detailedReport = null;
    try {
      detailedReport = await getCompanyReport(companyBasicData.id, accessToken);
    } catch (error) {
      console.warn('Could not get detailed report:', error.message);
      // Continúar con datos básicos si no se puede obtener el reporte detallado
    }

    // Mapear datos de eInforma a nuestro formato
    const mappedData: EInformaCompanyData = {
      cif: cif.toUpperCase(),
      razon_social: companyBasicData.name,
      nombre_comercial: companyBasicData.comercialName || companyBasicData.name,
      domicilio_fiscal: companyBasicData.address,
      codigo_postal: companyBasicData.postalCode,
      municipio: companyBasicData.city,
      provincia: companyBasicData.province,
      codigo_cnae: companyBasicData.cnae,
      descripcion_cnae: companyBasicData.cnaeDescription,
      situacion_aeat: companyBasicData.status || 'ACTIVA',
      fecha_constitucion: companyBasicData.constitutionDate,
      capital_social: companyBasicData.capital,
      forma_juridica: companyBasicData.legalForm,
      telefono: companyBasicData.phone,
      email: companyBasicData.email,
      web: companyBasicData.web,
      empleados_estimados: companyBasicData.employees,
      facturacion_estimada: companyBasicData.turnover,
      rating_crediticio: companyBasicData.rating,
      datos_adicionales: {
        fuente: 'eInforma API',
        consulta_date: new Date().toISOString(),
        company_id: companyBasicData.id,
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