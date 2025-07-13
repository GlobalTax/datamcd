import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Orquest webhook called');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const webhookData = await req.json();
    console.log('Webhook data received:', webhookData);

    const { event_type, service_id, data, timestamp } = webhookData;

    switch (event_type) {
      case 'service_updated':
      case 'service_created':
        const { error: upsertError } = await supabase
          .from('servicios_orquest')
          .upsert({
            id: service_id,
            nombre: data.nombre,
            latitud: data.latitud,
            longitud: data.longitud,
            zona_horaria: data.zona_horaria,
            datos_completos: data.datos_completos,
            updated_at: timestamp,
          });

        if (upsertError) {
          console.error('Error upserting service:', upsertError);
          throw upsertError;
        }
        break;

      case 'service_deleted':
        const { error: deleteError } = await supabase
          .from('servicios_orquest')
          .delete()
          .eq('id', service_id);

        if (deleteError) {
          console.error('Error deleting service:', deleteError);
          throw deleteError;
        }
        break;

      default:
        console.log('Unknown event type:', event_type);
    }

    console.log(`Webhook processed successfully: ${event_type} for service ${service_id}`);

    return new Response(
      JSON.stringify({ success: true, processed: event_type }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in orquest-webhook function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});