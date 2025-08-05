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

async function getEInformaCredentials(): Promise<string> {
  console.log('=== Getting eInforma credentials ===');
  
  const apiKey = Deno.env.get('EINFORMA_API_KEY');
  
  console.log('API key configured:', !!apiKey);
  
  if (!apiKey) {
    throw new Error('eInforma API Key not configured. Please configure EINFORMA_API_KEY in Supabase secrets.');
  }

  return apiKey;
}

async function getCompanyReportByCIF(cif: string, apiKey: string): Promise<any> {
  console.log('=== Getting company report for CIF:', cif, '===');
  
  try {
    // URL correcta según la API developers de eInforma
    const reportUrl = `https://developers.einforma.com/api/v1/companies/${cif}/report`;
    console.log('Report URL:', reportUrl);
    
    const reportResponse = await fetch(reportUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'McDonald\'s-Portal/1.0'
      },
    });

    console.log('Report response status:', reportResponse.status);
    console.log('Report response headers:', Object.fromEntries(reportResponse.headers));

    if (!reportResponse.ok) {
      const errorText = await reportResponse.text();
      console.error('eInforma API error response:', errorText);
      throw new Error(`Failed to get company report: ${reportResponse.status} - ${errorText}`);
    }

    const reportData = await reportResponse.json();
    console.log('Report response data:', JSON.stringify(reportData, null, 2));
    return reportData;
  } catch (error) {
    console.error('Error getting company report:', error);
    throw error;
  }
}

async function enrichCompanyData(supabaseClient: any, cif: string) {
  try {
    // Obtener API Key
    const apiKey = await getEInformaCredentials();
    console.log('eInforma credentials obtained successfully');

    // Obtener reporte de empresa directamente por CIF
    const reportData = await getCompanyReportByCIF(cif, apiKey);
    
    if (!reportData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No se encontró la empresa con el CIF proporcionado' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Company found:', reportData.denominacion || reportData.name || reportData.razon_social);

    // Mapear datos de eInforma a nuestro formato según la respuesta real de la API
    const mappedData: EInformaCompanyData = {
      cif: cif.toUpperCase(),
      razon_social: reportData.denominacion || reportData.name || reportData.razon_social,
      nombre_comercial: reportData.nombreComercial || reportData.nombre_comercial,
      domicilio_fiscal: reportData.domicilioSocial?.direccion || reportData.domicilio_fiscal,
      codigo_postal: reportData.domicilioSocial?.codigoPostal || reportData.codigo_postal,
      municipio: reportData.domicilioSocial?.localidad || reportData.localidad || reportData.municipio,
      provincia: reportData.domicilioSocial?.provincia || reportData.provincia,
      codigo_cnae: reportData.cnae?.codigo || reportData.cnae_codigo || reportData.codigo_cnae,
      descripcion_cnae: reportData.cnae?.descripcion || reportData.cnae_descripcion || reportData.descripcion_cnae,
      situacion_aeat: reportData.situacionAeat || reportData.situacion_aeat || 'ACTIVA',
      fecha_constitucion: reportData.fechaConstitucion || reportData.fecha_constitucion,
      capital_social: reportData.capitalSocial ? parseFloat(reportData.capitalSocial) : 
                     reportData.capital_social ? parseFloat(reportData.capital_social) : null,
      forma_juridica: reportData.formaJuridica || reportData.forma_juridica,
      telefono: reportData.contacto?.telefono || reportData.telefono,
      email: reportData.contacto?.email || reportData.email,
      web: reportData.contacto?.web || reportData.web,
      empleados_estimados: reportData.empleados ? parseInt(reportData.empleados) : 
                          reportData.empleados_estimados ? parseInt(reportData.empleados_estimados) : null,
      facturacion_estimada: reportData.facturacion ? parseFloat(reportData.facturacion) : 
                           reportData.facturacion_estimada ? parseFloat(reportData.facturacion_estimada) : null,
      rating_crediticio: reportData.rating || reportData.rating_crediticio,
      datos_adicionales: {
        fuente: 'eInforma API v1',
        consulta_date: new Date().toISOString(),
        raw_data: reportData
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
    if (error.message.includes('API Key not configured')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'API Key de eInforma no configurada. Contacte con el administrador.',
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