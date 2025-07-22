
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCorsPreflightRequest, createCorsResponse } from '../_shared/cors.ts';

interface ConfigRequest {
  integration_type: 'orquest' | 'biloop' | 'quantum';
  franchisee_id: string;
  config_data?: any;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(origin, {
      allowedMethods: ['GET', 'POST', 'OPTIONS']
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const { integration_type, franchisee_id, config_data }: ConfigRequest = await req.json();

    if (req.method === 'GET') {
      // Return only non-sensitive config information
      const { data: config, error } = await supabaseClient
        .from('integration_configs')
        .select('id, integration_type, config_name, is_active, last_sync, created_at')
        .eq('integration_type', integration_type)
        .eq('franchisee_id', franchisee_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Return base configuration without sensitive data
      const baseConfig = {
        orquest: {
          base_url: Deno.env.get('ORQUEST_BASE_URL') || 'https://pre-mc.orquest.es',
          business_id: 'MCDONALDS_ES'
        },
        biloop: {
          base_url: Deno.env.get('BILOOP_BASEURL') || 'https://api.biloop.com'
        },
        quantum: {
          base_url: Deno.env.get('QUANTUM_BASE_URL') || 'https://api.quantum-economics.com'
        }
      };

      return createCorsResponse({
        config: config || null,
        base_config: baseConfig[integration_type] || {},
        is_configured: !!config
      }, origin);
    }

    if (req.method === 'POST') {
      // Validate user has access to this franchisee
      const { data: franchisee, error: franchiseeError } = await supabaseClient
        .from('franchisees')
        .select('id')
        .eq('id', franchisee_id)
        .eq('user_id', user.id)
        .single();

      if (franchiseeError || !franchisee) {
        throw new Error('Access denied to this franchisee');
      }

      // Store configuration (non-sensitive data only)
      const { error: configError } = await supabaseClient
        .from('integration_configs')
        .upsert({
          advisor_id: user.id,
          franchisee_id,
          integration_type,
          config_name: `${integration_type} Configuration`,
          configuration: {
            enabled: true,
            configured_at: new Date().toISOString(),
            // Only store non-sensitive configuration
            ...config_data
          },
          is_active: true,
          last_sync: new Date().toISOString()
        }, {
          onConflict: 'franchisee_id,integration_type'
        });

      if (configError) {
        throw configError;
      }

      return createCorsResponse({
        success: true,
        message: 'Configuration saved successfully'
      }, origin);
    }

    throw new Error('Method not allowed');

  } catch (error) {
    console.error('Error in secure-config function:', error);
    
    return createCorsResponse({
      error: error.message,
      details: 'Configuration management error'
    }, origin, {}, 500);
  }
});
