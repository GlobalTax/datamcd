import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrquestService {
  id: string;
  name?: string;
  lat?: number;
  lon?: number;
  timeZone?: string;
  [key: string]: any;
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
    const orquestBaseUrl = Deno.env.get('ORQUEST_BASE_URL') || 'https://pre-mc.orquest.es';
    const businessId = Deno.env.get('ORQUEST_BUSINESS_ID') || 'MCDONALDS_ES';

    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      hasOrquestKey: !!orquestApiKey,
      orquestBaseUrl,
      businessId
    });

    if (!orquestApiKey) {
      console.error('ORQUEST_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Orquest API key not configured',
          services_updated: 0 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validar que el request tiene body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error('Invalid JSON in request body:', error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid JSON in request body',
          services_updated: 0 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { action } = requestBody;
    console.log('Action requested:', action);

    const supabase = createClient(supabaseUrl, supabaseKey);
    let servicesUpdated = 0;

    if (action === 'sync_all') {
      const servicesEndpoint = `${orquestBaseUrl}/importer/api/v2/businesses/${businessId}/services`;
      console.log('Starting sync with Orquest API');
      console.log('Calling endpoint:', servicesEndpoint);
      
      try {
        // Llamada a la API de Orquest para obtener servicios
        const orquestResponse = await fetch(servicesEndpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${orquestApiKey}`,
          },
          // Agregar timeout
          signal: AbortSignal.timeout(30000), // 30 segundos
        });

        console.log('Orquest API response status:', orquestResponse.status);
        console.log('Orquest API response headers:', Object.fromEntries(orquestResponse.headers.entries()));

        if (!orquestResponse.ok) {
          const errorText = await orquestResponse.text();
          console.error('Orquest API error response:', errorText);
          throw new Error(`Orquest API error: ${orquestResponse.status} - ${errorText}`);
        }

        const responseText = await orquestResponse.text();
        console.log('Orquest API raw response:', responseText);

        let orquestServices: OrquestService[];
        try {
          orquestServices = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Error parsing Orquest response as JSON:', parseError);
          throw new Error('Invalid JSON response from Orquest API');
        }

        if (!Array.isArray(orquestServices)) {
          console.error('Orquest response is not an array:', typeof orquestServices);
          throw new Error('Expected array of services from Orquest API');
        }

        console.log(`Received ${orquestServices.length} services from Orquest`);

        // Actualizar servicios en Supabase
        for (const service of orquestServices) {
          try {
            console.log('Processing service:', service.id);
            
            const { error } = await supabase
              .from('servicios_orquest')
              .upsert({
                id: service.id,
                nombre: service.name || null,
                latitud: service.lat || null,
                longitud: service.lon || null,
                zona_horaria: service.timeZone || null,
                datos_completos: service,
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
      } catch (fetchError) {
        console.error('Error calling Orquest API:', fetchError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: `Failed to sync with Orquest API: ${fetchError.message}`,
            services_updated: servicesUpdated,
          }), 
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } else {
      console.log('Unknown action:', action);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Unknown action: ${action}`,
          services_updated: 0,
        }), 
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
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