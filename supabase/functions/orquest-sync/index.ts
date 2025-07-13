import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrquestService {
  id: string;
  nombre?: string;
  latitud?: number;
  longitud?: number;
  zona_horaria?: string;
  datos_completos?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Orquest sync function called');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const orquestApiKey = Deno.env.get('ORQUEST_API_KEY');
    const orquestBaseUrl = Deno.env.get('ORQUEST_BASE_URL') || 'https://api.orquest.com';

    if (!orquestApiKey) {
      console.error('ORQUEST_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Orquest API key not configured' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { action } = await req.json();

    let servicesUpdated = 0;

    if (action === 'sync_all') {
      console.log('Starting sync with Orquest API');
      
      // Llamada a la API de Orquest para obtener servicios
      const orquestResponse = await fetch(`${orquestBaseUrl}/services`, {
        headers: {
          'Authorization': `Bearer ${orquestApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!orquestResponse.ok) {
        throw new Error(`Orquest API error: ${orquestResponse.status}`);
      }

      const orquestServices: OrquestService[] = await orquestResponse.json();
      console.log(`Received ${orquestServices.length} services from Orquest`);

      // Actualizar servicios en Supabase
      for (const service of orquestServices) {
        try {
          const { error } = await supabase
            .from('servicios_orquest')
            .upsert({
              id: service.id,
              nombre: service.nombre,
              latitud: service.latitud,
              longitud: service.longitud,
              zona_horaria: service.zona_horaria,
              datos_completos: service.datos_completos,
              updated_at: new Date().toISOString(),
            });

          if (error) {
            console.error('Error upserting service:', service.id, error);
          } else {
            servicesUpdated++;
            console.log('Service updated:', service.id);
          }
        } catch (error) {
          console.error('Error processing service:', service.id, error);
        }
      }
    }

    const response = {
      success: true,
      services_updated: servicesUpdated,
      last_sync: new Date().toISOString(),
    };

    console.log('Sync completed successfully:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in orquest-sync function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        services_updated: 0,
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});