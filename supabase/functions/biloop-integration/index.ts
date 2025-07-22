
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCorsPreflightRequest, createCorsResponse } from '../_shared/cors.ts';
import { edgeLogger } from '../_shared/edgeLogger.ts';

serve(async (req) => {
  const origin = req.headers.get('origin');
  const requestId = `biloop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(origin);
  }

  const context = {
    functionName: 'biloop-integration',
    requestId,
    method: req.method,
    path: new URL(req.url).pathname
  };

  try {
    edgeLogger.info('Biloop integration request started', context);

    const { endpoint, method = 'GET', body, params } = await req.json();

    // Get Biloop credentials from environment
    const baseUrl = Deno.env.get('BILOOP_BASEURL');
    const subscriptionKey = Deno.env.get('BILOOP_SUBSCRIPTION_KEY');
    const user = Deno.env.get('BILOOP_USER');
    const password = Deno.env.get('BILOOP_PASSWORD');
    let token = Deno.env.get('BILOOP_TOKEN');

    // Validate required credentials (sin logear los valores)
    if (!baseUrl || !subscriptionKey || !user || !password) {
      edgeLogger.error('Missing Biloop credentials', { ...context, status: 401 }, {
        hasBaseUrl: !!baseUrl, 
        hasSubscriptionKey: !!subscriptionKey, 
        hasUser: !!user, 
        hasPassword: !!password 
      });
      throw new Error('Missing required Biloop credentials');
    }

    edgeLogger.info('Biloop integration processing', context, { 
      endpoint,
      method,
      hasParams: !!params 
    });

    // Function to get a fresh token
    async function getToken() {
      try {
        edgeLogger.debug('Requesting fresh token', context);
        
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

        edgeLogger.info('Token request completed', context, { 
          status: tokenResponse.status,
          ok: tokenResponse.ok 
        });
        
        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          edgeLogger.error('Token request failed', context, {
            status: tokenResponse.status,
            statusText: tokenResponse.statusText,
            hasErrorResponse: !!errorText
          });
          throw new Error(`Token request failed: ${tokenResponse.status}`);
        }

        const tokenData = await tokenResponse.json();
        edgeLogger.info('Token received successfully', context);
        return tokenData.token || tokenData;
      } catch (error) {
        edgeLogger.error('Error getting token', context, error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('Network error: Cannot connect to Biloop API. Check connectivity and URL.');
        }
        throw error;
      }
    }

    // Get fresh token if not provided
    if (!token) {
      edgeLogger.debug('No token found, getting fresh token', context);
      token = await getToken();
    }

    // Build URL with params if provided
    let url = `${baseUrl}${endpoint}`;
    if (params) {
      const urlParams = new URLSearchParams(params);
      url += `?${urlParams.toString()}`;
    }
    
    edgeLogger.info('Making request to Biloop API', context, { 
      hasBody: !!body,
      hasParams: !!params 
    });

    // Make request to Biloop API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

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
      
      context.status = biloopResponse.status;
      context.duration = Date.now() - startTime;
      
      edgeLogger.info('Biloop API response received', context, { 
        status: biloopResponse.status,
        ok: biloopResponse.ok 
      });

      // If unauthorized, try with a fresh token
      if (biloopResponse.status === 401 || biloopResponse.status === 403) {
        edgeLogger.warn('Token expired, getting fresh token', context);
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

        context.status = retryResponse.status;
        context.duration = Date.now() - startTime;

        if (!retryResponse.ok) {
          edgeLogger.error('Retry request failed', context);
          throw new Error(`Biloop API error: ${retryResponse.status} ${retryResponse.statusText}`);
        }

        const data = await retryResponse.json();
        edgeLogger.info('Retry request successful', context);
        return createCorsResponse(data, origin);
      }

      if (!biloopResponse.ok) {
        edgeLogger.error('API request failed', context);
        throw new Error(`Biloop API error: ${biloopResponse.status} ${biloopResponse.statusText}`);
      }

      const data = await biloopResponse.json();
      edgeLogger.info('Biloop API response processed successfully', context);

      return createCorsResponse(data, origin);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        context.status = 504;
        throw new Error('Request timeout: Biloop API did not respond within 30 seconds');
      }
      throw fetchError;
    }

  } catch (error) {
    context.status = context.status || 500;
    context.duration = Date.now() - startTime;
    
    edgeLogger.error('Error in biloop-integration function', context, error);
    
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
    
    return createCorsResponse({
      error: errorMessage,
      details: 'Biloop integration error',
      timestamp: new Date().toISOString()
    }, origin, {}, statusCode);
  }
});
