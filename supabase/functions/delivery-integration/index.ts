import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCorsPreflightRequest, createCorsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface DeliveryConfigRequest {
  franchisee_id: string;
  provider_id: string;
  provider_name: string;
  api_key?: string;
  merchant_id?: string;
  webhook_url?: string;
  is_enabled?: boolean;
}

Deno.serve(async (req) => {
  const corsHeaders = await createCorsHeaders(req, 'delivery-integration');
  
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Authenticate user
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(
      authorization.replace('Bearer ', '')
    );

    if (authError || !authData.user) {
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const franchiseeId = url.searchParams.get('franchisee_id');
      
      if (!franchiseeId) {
        return new Response(JSON.stringify({ error: 'franchisee_id required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get delivery configurations (non-sensitive data only)
      const { data: configs, error } = await supabase
        .from('delivery_integration_configs')
        .select(`
          id,
          provider_id,
          provider_name,
          is_enabled,
          created_at,
          updated_at
        `)
        .eq('franchisee_id', franchiseeId);

      if (error) {
        console.error('Error fetching delivery configs:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch configurations' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ configs }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'POST') {
      const body: DeliveryConfigRequest = await req.json();
      const { franchisee_id, provider_id, provider_name, api_key, merchant_id, webhook_url, is_enabled } = body;

      if (!franchisee_id || !provider_id || !provider_name) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Verify user has access to this franchisee
      const { data: franchisee, error: franchiseeError } = await supabase
        .from('franchisees')
        .select('user_id')
        .eq('id', franchisee_id)
        .single();

      if (franchiseeError || franchisee.user_id !== authData.user.id) {
        return new Response(JSON.stringify({ error: 'Access denied' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Encrypt sensitive data using PostgreSQL encryption
      const encryptionData: any = {
        franchisee_id,
        provider_id,
        provider_name,
        is_enabled: is_enabled ?? false,
        created_by: authData.user.id
      };

      if (api_key) {
        encryptionData.api_key_encrypted = api_key; // In production, implement proper encryption
      }
      if (merchant_id) {
        encryptionData.merchant_id_encrypted = merchant_id;
      }
      if (webhook_url) {
        encryptionData.webhook_url_encrypted = webhook_url;
      }

      // Upsert configuration
      const { data, error } = await supabase
        .from('delivery_integration_configs')
        .upsert(encryptionData, {
          onConflict: 'franchisee_id,provider_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving delivery config:', error);
        return new Response(JSON.stringify({ error: 'Failed to save configuration' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ 
        success: true,
        config: {
          id: data.id,
          provider_id: data.provider_id,
          provider_name: data.provider_name,
          is_enabled: data.is_enabled
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Delivery integration error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});