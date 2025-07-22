
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { handleCorsPreflightRequest, createCorsResponse, createCorsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  const origin = req.headers.get('origin');
  
  // Handle CORS preflight requests con restricciones específicas para webhooks
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(origin, {
      allowedOrigins: getWebhookAllowedOrigins(),
      allowedMethods: ['POST', 'OPTIONS']
    });
  }

  try {
    console.log('Orquest webhook called from origin:', origin);
    
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

    return createCorsResponse(
      { success: true, processed: event_type },
      origin,
      { allowedOrigins: getWebhookAllowedOrigins() }
    );

  } catch (error) {
    console.error('Error in orquest-webhook function:', error);
    return createCorsResponse(
      { success: false, error: error.message },
      origin,
      { allowedOrigins: getWebhookAllowedOrigins() },
      500
    );
  }
});

function getWebhookAllowedOrigins(): string[] {
  const webhookOrigins = Deno.env.get('WEBHOOK_ORIGINS');
  if (webhookOrigins) {
    return webhookOrigins.split(',').map(origin => origin.trim());
  }
  
  // Orígenes específicos para webhooks de Orquest
  return [
    'https://pre-mc.orquest.es',
    'https://mc.orquest.es',
    'https://api.orquest.es',
    'https://ckvqfrppnfhoadcpqhld.lovableproject.com' // Nuestra aplicación
  ];
}
