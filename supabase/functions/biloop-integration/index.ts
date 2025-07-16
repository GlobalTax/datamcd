import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { endpoint, method = 'GET', body, params } = await req.json();

    // Get Biloop credentials from environment
    const baseUrl = Deno.env.get('BILOOP_BASEURL') || 'https://obndesk.com';
    const subscriptionKey = Deno.env.get('BILOOP_SUBSCRIPTION_KEY') || '92de130f-82d6-4b49-9c99-cdea2f3617f3';
    const user = Deno.env.get('BILOOP_USER') || 'B60262359';
    const password = Deno.env.get('BILOOP_PASSWORD') || 'Doingto37@';
    let token = Deno.env.get('BILOOP_TOKEN');

    console.log('Biloop integration called for endpoint:', endpoint);

    // Function to get a fresh token
    async function getToken() {
      try {
        const tokenResponse = await fetch(`${baseUrl}/api-global/v1/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Subscription_key': subscriptionKey,
            'User': user,
            'Password': password,
          },
          body: JSON.stringify({})
        });

        if (!tokenResponse.ok) {
          throw new Error(`Token request failed: ${tokenResponse.status}`);
        }

        const tokenData = await tokenResponse.json();
        return tokenData.token || tokenData;
      } catch (error) {
        console.error('Error getting token:', error);
        throw error;
      }
    }

    // Get fresh token if not provided or if request fails with current token
    if (!token) {
      token = await getToken();
    }

    // Build URL with params if provided
    let url = `${baseUrl}${endpoint}`;
    if (params) {
      const urlParams = new URLSearchParams(params);
      url += `?${urlParams.toString()}`;
    }

    // Make request to Biloop API
    const biloopResponse = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Subscription_key': subscriptionKey,
        'User': user,
        'Password': password,
        'Token': token,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // If unauthorized, try with a fresh token
    if (biloopResponse.status === 401 || biloopResponse.status === 403) {
      console.log('Token expired, getting fresh token...');
      token = await getToken();
      
      const retryResponse = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Subscription_key': subscriptionKey,
          'User': user,
          'Password': password,
          'Token': token,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!retryResponse.ok) {
        throw new Error(`Biloop API error: ${retryResponse.status} ${retryResponse.statusText}`);
      }

      const data = await retryResponse.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!biloopResponse.ok) {
      throw new Error(`Biloop API error: ${biloopResponse.status} ${biloopResponse.statusText}`);
    }

    const data = await biloopResponse.json();
    console.log('Biloop API response received successfully');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in biloop-integration function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to connect to Biloop API'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});