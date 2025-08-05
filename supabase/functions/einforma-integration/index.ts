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

async function enrichCompanyData(supabaseClient: any, cif: string) {
  try {
    // En una implementación real, aquí se haría la llamada a la API de eInforma
    // Por ahora, simulamos datos de ejemplo
    const mockData: EInformaCompanyData = {
      cif: cif.toUpperCase(),
      razon_social: `EMPRESA EJEMPLO ${cif} S.L.`,
      nombre_comercial: `Comercial ${cif}`,
      domicilio_fiscal: 'Calle Ejemplo, 123',
      codigo_postal: '28001',
      municipio: 'Madrid',
      provincia: 'Madrid',
      codigo_cnae: '5610',
      descripcion_cnae: 'Restaurantes y puestos de comidas',
      situacion_aeat: 'ACTIVA',
      fecha_constitucion: '2020-01-15',
      capital_social: 50000,
      forma_juridica: 'SOCIEDAD DE RESPONSABILIDAD LIMITADA',
      telefono: '910123456',
      email: 'info@ejemplo.com',
      web: 'www.ejemplo.com',
      empleados_estimados: 25,
      facturacion_estimada: 500000,
      rating_crediticio: 'B',
      datos_adicionales: {
        fuente: 'eInforma API',
        consulta_date: new Date().toISOString(),
        version: '1.0'
      }
    };

    // Insertar o actualizar datos en la base de datos
    const { data, error } = await supabaseClient
      .from('company_data')
      .upsert({
        ...mockData,
        validado_einforma: true,
        fecha_ultima_actualizacion: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving company data:', error);
      throw error;
    }

    console.log(`Company data enriched for CIF: ${cif}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data,
        message: 'Datos de empresa enriquecidos correctamente' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error enriching company data:', error);
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