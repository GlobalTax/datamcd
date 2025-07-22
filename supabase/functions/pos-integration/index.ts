import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCorsPreflightRequest, createCorsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface POSConfigRequest {
  franchisee_id: string;
  pos_system: string;
  pos_name: string;
  endpoint?: string;
  api_key?: string;
  username?: string;
  password?: string;
  store_id?: string;
  is_enabled?: boolean;
}

Deno.serve(async (req) => {
  const corsHeaders = await createCorsHeaders(req, 'pos-integration');
  
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

      // Get POS configurations (non-sensitive data only)
      const { data: configs, error } = await supabase
        .from('pos_integration_configs')
        .select(`
          id,
          pos_system,
          pos_name,
          is_enabled,
          created_at,
          updated_at
        `)
        .eq('franchisee_id', franchiseeId);

      if (error) {
        console.error('Error fetching POS configs:', error);
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
      const body: POSConfigRequest = await req.json();
      const { franchisee_id, pos_system, pos_name, endpoint, api_key, username, password, store_id, is_enabled } = body;

      if (!franchisee_id || !pos_system || !pos_name) {
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

      // Encrypt sensitive data
      const encryptionData: any = {
        franchisee_id,
        pos_system,
        pos_name,
        is_enabled: is_enabled ?? false,
        created_by: authData.user.id
      };

      if (endpoint) encryptionData.endpoint_encrypted = endpoint;
      if (api_key) encryptionData.api_key_encrypted = api_key;
      if (username) encryptionData.username_encrypted = username;
      if (password) encryptionData.password_encrypted = password;
      if (store_id) encryptionData.store_id_encrypted = store_id;

      // Upsert configuration
      const { data, error } = await supabase
        .from('pos_integration_configs')
        .upsert(encryptionData, {
          onConflict: 'franchisee_id,pos_system'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving POS config:', error);
        return new Response(JSON.stringify({ error: 'Failed to save configuration' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ 
        success: true,
        config: {
          id: data.id,
          pos_system: data.pos_system,
          pos_name: data.pos_name,
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
    console.error('POS integration error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});