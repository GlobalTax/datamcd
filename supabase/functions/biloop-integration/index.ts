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
    const { endpoint, method = 'GET', body, params, company_id } = await req.json();

    // Get Biloop credentials from environment with better error handling
    const baseUrl = Deno.env.get('BILOOP_BASEURL');
    const subscriptionKey = Deno.env.get('BILOOP_SUBSCRIPTION_KEY');
    const user = Deno.env.get('BILOOP_USER');
    const password = Deno.env.get('BILOOP_PASSWORD');
    let token = Deno.env.get('BILOOP_TOKEN');

    // Validate required credentials
    if (!baseUrl || !subscriptionKey || !user || !password) {
      console.error('Missing Biloop credentials:', { 
        hasBaseUrl: !!baseUrl, 
        hasSubscriptionKey: !!subscriptionKey, 
        hasUser: !!user, 
        hasPassword: !!password 
      });
      throw new Error('Missing required Biloop credentials');
    }

    console.log('Biloop integration called for endpoint:', endpoint);
    console.log('Company ID provided:', company_id);
    console.log('Using base URL:', baseUrl);

    // Function to get a fresh token with better error handling
    async function getToken() {
      try {
        console.log('Attempting to get token from:', `${baseUrl}/api-global/v1/token`);
        
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

        console.log('Token request status:', tokenResponse.status);
        
        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('Token request failed:', {
            status: tokenResponse.status,
            statusText: tokenResponse.statusText,
            response: errorText
          });
          throw new Error(`Token request failed: ${tokenResponse.status} - ${errorText}`);
        }

        const tokenData = await tokenResponse.json();
        console.log('Token received successfully');
        return tokenData.token || tokenData;
      } catch (error) {
        console.error('Error getting token:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('Network error: Cannot connect to Biloop API. Check connectivity and URL.');
        }
        throw error;
      }
    }

    // Get fresh token if not provided or if request fails with current token
    if (!token) {
      console.log('No token found, getting fresh token...');
      token = await getToken();
    }

    // Build URL with params including company_id
    let url = `${baseUrl}${endpoint}`;
    const urlParams = new URLSearchParams();
    
    // Add company_id if provided (required for most endpoints)
    if (company_id) {
      urlParams.append('company_id', company_id);
    }
    
    // Add other params
    if (params) {
      Object.keys(params).forEach(key => {
        urlParams.append(key, params[key]);
      });
    }
    
    const paramsString = urlParams.toString();
    if (paramsString) {
      url += `?${paramsString}`;
    }
    
    console.log('Making request to:', url);

    // Make request to Biloop API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
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
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Response status:', biloopResponse.status);

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
          const errorText = await retryResponse.text();
          console.error('Retry request failed:', errorText);
          throw new Error(`Biloop API error: ${retryResponse.status} ${retryResponse.statusText} - ${errorText}`);
        }

        const data = await retryResponse.json();
        console.log('Retry request successful');
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!biloopResponse.ok) {
        const errorText = await biloopResponse.text();
        console.error('API request failed:', errorText);
        throw new Error(`Biloop API error: ${biloopResponse.status} ${biloopResponse.statusText} - ${errorText}`);
      }

      const data = await biloopResponse.json();
      console.log('Biloop API response received successfully');

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout: Biloop API did not respond within 30 seconds');
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('Error in biloop-integration function:', error);
    
    // Provide more specific error information
    let errorMessage = error.message || 'Unknown error';
    let statusCode = 500;
    
    if (errorMessage.includes('Network error') || errorMessage.includes('fetch')) {
      statusCode = 502;
      errorMessage = 'Service unavailable: Cannot connect to Biloop API';
    } else if (errorMessage.includes('timeout')) {
      statusCode = 504;
      errorMessage = 'Gateway timeout: Biloop API request timed out';
    } else if (errorMessage.includes('credentials')) {
      statusCode = 401;
      errorMessage = 'Authentication error: Invalid Biloop credentials';
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Biloop integration error',
        timestamp: new Date().toISOString()
      }), 
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});