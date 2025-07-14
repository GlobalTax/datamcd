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

interface OrquestEmployee {
  id: string;
  serviceId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  [key: string]: any;
}

interface OrquestMeasure {
  value: number;
  from: string;
  to: string;
  measure: string;
}

interface SendMeasuresRequest {
  action: string;
  franchiseeId: string;
  serviceId?: string;
  measureType?: string;
  periodFrom?: string;
  periodTo?: string;
}

interface FetchMeasuresRequest {
  action: string;
  franchiseeId: string;
  serviceId: string;
  startDate: string;
  endDate: string;
  demandTypes?: string[];
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

    const { action, franchiseeId } = requestBody;
    console.log('Action requested:', action, 'for franchisee:', franchiseeId);

    if (!franchiseeId) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'franchiseeId is required',
          services_updated: 0 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obtener configuración de Orquest para este franquiciado
    const { data: configData, error: configError } = await supabase
      .from('integration_configs')
      .select('configuration')
      .eq('franchisee_id', franchiseeId)
      .eq('integration_type', 'orquest')
      .single();

    if (configError || !configData) {
      console.error('Orquest configuration not found for franchisee:', franchiseeId);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Orquest configuration not found for this franchisee',
          services_updated: 0 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const config = configData.configuration;
    const orquestApiKey = config.api_key;
    const orquestBaseUrl = config.base_url || 'https://pre-mc.orquest.es';
    const businessId = config.business_id || 'MCDONALDS_ES';

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

    let servicesUpdated = 0;
    let employeesUpdated = 0;

    if (action === 'sync_all' || action === 'sync_employees') {
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
        if (action === 'sync_all') {
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
        }

        // Sincronizar empleados si se solicita
        if (action === 'sync_employees' || action === 'sync_all') {
          console.log('Starting employee sync');
          
          // Para cada servicio, sincronizar sus empleados
          for (const service of orquestServices) {
            try {
              const employeesEndpoint = `${orquestBaseUrl}/importer/api/v2/businesses/${businessId}/services/${service.id}/employees`;
              console.log(`Fetching employees for service ${service.id}:`, employeesEndpoint);
              
              const employeesResponse = await fetch(employeesEndpoint, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${orquestApiKey}`,
                },
                signal: AbortSignal.timeout(30000),
              });

              if (!employeesResponse.ok) {
                console.error(`Error fetching employees for service ${service.id}:`, employeesResponse.status);
                continue;
              }

              const employeesText = await employeesResponse.text();
              let orquestEmployees: OrquestEmployee[];
              
              try {
                orquestEmployees = JSON.parse(employeesText);
              } catch (parseError) {
                console.error(`Error parsing employees response for service ${service.id}:`, parseError);
                continue;
              }

              if (!Array.isArray(orquestEmployees)) {
                console.log(`No employees found for service ${service.id}`);
                continue;
              }

              console.log(`Processing ${orquestEmployees.length} employees for service ${service.id}`);

              // Actualizar empleados en Supabase
              for (const employee of orquestEmployees) {
                try {
                  const { error } = await supabase
                    .from('orquest_employees')
                    .upsert({
                      id: employee.id,
                      service_id: service.id,
                      nombre: employee.firstName || null,
                      apellidos: employee.lastName || null,
                      email: employee.email || null,
                      telefono: employee.phone || null,
                      puesto: employee.position || null,
                      departamento: employee.department || null,
                      fecha_alta: employee.startDate ? new Date(employee.startDate).toISOString().split('T')[0] : null,
                      fecha_baja: employee.endDate ? new Date(employee.endDate).toISOString().split('T')[0] : null,
                      estado: employee.status || 'active',
                      datos_completos: employee,
                      updated_at: new Date().toISOString(),
                    });

                  if (error) {
                    console.error('Error upserting employee:', employee.id, error);
                  } else {
                    employeesUpdated++;
                    console.log('Employee updated:', employee.id);
                  }
                } catch (error) {
                  console.error('Error processing employee:', employee.id, error);
                }
              }
            } catch (error) {
              console.error(`Error syncing employees for service ${service.id}:`, error);
            }
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
    } else if (action === 'send_measures') {
      console.log('Starting measures send to Orquest');
      const { serviceId, measureType, periodFrom, periodTo } = requestBody as SendMeasuresRequest;
      
      if (!serviceId || !measureType || !periodFrom || !periodTo) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'serviceId, measureType, periodFrom, and periodTo are required for send_measures action',
            measures_sent: 0,
          }), 
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      try {
        // Obtener datos del P&L para el período especificado
        const { data: profitLossData, error: plError } = await supabase
          .from('profit_loss_data')
          .select('*')
          .gte('created_at', periodFrom)
          .lte('created_at', periodTo)
          .order('created_at', { ascending: false })
          .limit(1);

        if (plError || !profitLossData?.length) {
          console.error('No profit & loss data found for period:', periodFrom, periodTo);
          return new Response(
            JSON.stringify({ 
              success: false,
              error: 'No profit & loss data found for the specified period',
              measures_sent: 0,
            }), 
            {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const plData = profitLossData[0];
        let measureValue = 0;

        // Mapear tipos de medidas a valores del P&L
        switch (measureType) {
          case 'SALES':
            measureValue = plData.net_sales || 0;
            break;
          case 'LABOR_COST':
            measureValue = plData.total_labor || 0;
            break;
          case 'FOOD_COST':
            measureValue = plData.food_cost || 0;
            break;
          case 'OPERATING_EXPENSES':
            measureValue = plData.total_operating_expenses || 0;
            break;
          case 'NET_PROFIT':
            measureValue = plData.operating_income || 0;
            break;
          default:
            throw new Error(`Unknown measure type: ${measureType}`);
        }

        // Preparar payload para Orquest
        const orquestMeasure: OrquestMeasure = {
          value: measureValue,
          from: periodFrom,
          to: periodTo,
          measure: measureType
        };

        // Enviar medida a Orquest
        const measuresEndpoint = `${orquestBaseUrl}/api/v1/import/business/${businessId}/product/${serviceId}/measures`;
        console.log('Sending measure to Orquest:', measuresEndpoint, orquestMeasure);

        const orquestResponse = await fetch(measuresEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${orquestApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orquestMeasure),
          signal: AbortSignal.timeout(30000),
        });

        const responseText = await orquestResponse.text();
        console.log('Orquest measures response:', orquestResponse.status, responseText);

        // Registrar el envío en la base de datos
        const measureRecord = {
          franchisee_id: franchiseeId,
          service_id: serviceId,
          measure_type: measureType,
          value: measureValue,
          period_from: periodFrom,
          period_to: periodTo,
          restaurant_id: plData.restaurant_id || null,
          status: orquestResponse.ok ? 'sent' : 'failed',
          error_message: orquestResponse.ok ? null : responseText,
          orquest_response: responseText ? JSON.parse(responseText) : null,
        };

        const { error: insertError } = await supabase
          .from('orquest_measures_sent')
          .insert(measureRecord);

        if (insertError) {
          console.error('Error recording measure send:', insertError);
        }

        if (!orquestResponse.ok) {
          throw new Error(`Orquest API error: ${orquestResponse.status} - ${responseText}`);
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            measures_sent: 1,
            measure_type: measureType,
            value: measureValue,
            service_id: serviceId,
          }), 
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );

      } catch (error) {
        console.error('Error sending measures to Orquest:', error);
        
        // Registrar el error
        const errorRecord = {
          franchisee_id: franchiseeId,
          service_id: serviceId,
          measure_type: measureType,
          value: 0,
          period_from: periodFrom,
          period_to: periodTo,
          status: 'failed',
          error_message: error.message,
        };

        await supabase
          .from('orquest_measures_sent')
          .insert(errorRecord);

        return new Response(
          JSON.stringify({ 
            success: false,
            error: `Failed to send measures to Orquest: ${error.message}`,
            measures_sent: 0,
          }), 
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } else if (action === 'send_forecast') {
      console.log('Starting forecast send to Orquest');
      
      try {
        // Obtener datos de presupuestos anuales
        const { data: annualBudgets, error: budgetError } = await supabase
          .from('annual_budgets')
          .select(`
            *,
            franchisee_restaurants!annual_budgets_restaurant_id_fkey (
              id,
              franchisee_id,
              base_restaurant_id,
              base_restaurants (
                site_number,
                restaurant_name
              )
            )
          `)
          .gte('year', new Date().getFullYear())
          .lte('year', new Date().getFullYear() + 1);

        if (budgetError || !annualBudgets?.length) {
          console.error('No budget data found for forecast:', budgetError);
          return new Response(
            JSON.stringify({ 
              success: false,
              error: 'No budget data found for forecast',
              forecasts_sent: 0,
            }), 
            {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Agrupar por restaurante y año
        const restaurantGroups = {};
        annualBudgets.forEach(budget => {
          const key = `${budget.restaurant_id}-${budget.year}`;
          if (!restaurantGroups[key]) {
            restaurantGroups[key] = {
              restaurant: budget.franchisee_restaurants,
              year: budget.year,
              budgets: []
            };
          }
          restaurantGroups[key].budgets.push(budget);
        });

        let forecastsSent = 0;
        const errors = [];

        for (const [key, group] of Object.entries(restaurantGroups)) {
          try {
            // Buscar servicio de Orquest correspondiente
            const { data: service } = await supabase
              .from('servicios_orquest')
              .select('id, nombre')
              .ilike('nombre', `%${group.restaurant.base_restaurants.site_number}%`)
              .maybeSingle();

            if (!service) {
              console.log(`No Orquest service found for restaurant ${group.restaurant.base_restaurants.site_number}`);
              continue;
            }

            // Construir forecasts mensuales
            const monthlyForecasts = [];
            const revenueBudget = group.budgets.find(b => b.category === 'revenue' || b.category === 'ingresos');
            
            if (revenueBudget) {
              const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
              
              months.forEach((month, index) => {
                const monthValue = revenueBudget[month] || 0;
                if (monthValue > 0) {
                  monthlyForecasts.push({
                    demandTypeName: 'SALES',
                    businessDate: `${group.year}-${String(index + 1).padStart(2, '0')}-01`,
                    value: monthValue
                  });
                }
              });
            }

            if (monthlyForecasts.length === 0) {
              console.log(`No forecast data to send for restaurant ${group.restaurant.base_restaurants.site_number}`);
              continue;
            }

            // Enviar forecast a Orquest
            const forecastEndpoint = `${orquestBaseUrl}/api/v1/import/business/${businessId}/product/${service.id}/forecast`;
            console.log('Sending forecast to Orquest:', forecastEndpoint);

            const orquestResponse = await fetch(forecastEndpoint, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${orquestApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(monthlyForecasts),
              signal: AbortSignal.timeout(30000),
            });

            const responseText = await orquestResponse.text();
            console.log('Orquest forecast response:', orquestResponse.status, responseText);

            // Registrar en base de datos
            const { error: insertError } = await supabase
              .from('orquest_forecasts_sent')
              .insert({
                service_id: service.id,
                forecast_type: 'budget_based',
                period_from: `${group.year}-01-01T00:00:00Z`,
                period_to: `${group.year}-12-31T23:59:59Z`,
                forecast_data: monthlyForecasts,
                franchisee_id: group.restaurant.franchisee_id,
                restaurant_id: group.restaurant.id,
                status: orquestResponse.ok ? 'sent' : 'error',
                orquest_response: responseText ? JSON.parse(responseText) : null,
                error_message: orquestResponse.ok ? null : `HTTP ${orquestResponse.status}: ${responseText}`
              });

            if (insertError) {
              console.error('Error recording forecast send:', insertError);
            }

            if (orquestResponse.ok) {
              forecastsSent++;
            } else {
              errors.push({
                service_id: service.id,
                error: `HTTP ${orquestResponse.status}: ${responseText}`
              });
            }

          } catch (error) {
            console.error('Error processing forecast for restaurant:', group.restaurant.base_restaurants.site_number, error);
            errors.push({
              restaurant: group.restaurant.base_restaurants.site_number,
              error: error.message
            });
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            forecasts_sent: forecastsSent,
            errors_count: errors.length,
            details: { errors }
          }), 
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );

      } catch (error) {
        console.error('Error sending forecasts to Orquest:', error);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: `Failed to send forecasts to Orquest: ${error.message}`,
            forecasts_sent: 0,
          }), 
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } else if (action === 'fetch_measures') {
      console.log('Starting measures fetch from Orquest');
      const { serviceId, startDate, endDate, demandTypes } = requestBody as FetchMeasuresRequest;
      
      if (!serviceId || !startDate || !endDate) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'serviceId, startDate, and endDate are required for fetch_measures action',
            measures_fetched: 0,
          }), 
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      try {
        const demandTypeParams = (demandTypes || ['SALES', 'TICKETS']).join(',');
        const measuresEndpoint = `${orquestBaseUrl}/api/v1/business/${businessId}/product/${serviceId}/demand/from/${startDate}/to/${endDate}?demandTypeNames=${demandTypeParams}`;
        
        console.log('Fetching measures from Orquest:', measuresEndpoint);

        const orquestResponse = await fetch(measuresEndpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${orquestApiKey}`,
          },
          signal: AbortSignal.timeout(30000),
        });

        if (!orquestResponse.ok) {
          const errorText = await orquestResponse.text();
          throw new Error(`Orquest API error: ${orquestResponse.status} - ${errorText}`);
        }

        const responseData = await orquestResponse.json();
        console.log('Orquest measures response:', responseData);

        let measuresInserted = 0;

        if (Array.isArray(responseData)) {
          for (const measure of responseData) {
            try {
              const { error: insertError } = await supabase
                .from('orquest_measures')
                .upsert({
                  service_id: serviceId,
                  measure_type: measure.demandTypeName || measure.type,
                  value: measure.value || measure.demand || 0,
                  from_time: measure.fromTime || measure.from || startDate,
                  to_time: measure.toTime || measure.to || endDate,
                  measure_category: 'real',
                  business_id: businessId,
                });

              if (insertError) {
                console.error('Error inserting measure:', insertError);
              } else {
                measuresInserted++;
              }
            } catch (error) {
              console.error('Error processing measure:', measure, error);
            }
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            measures_fetched: measuresInserted,
            service_id: serviceId,
            period: { from: startDate, to: endDate },
          }), 
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );

      } catch (error) {
        console.error('Error fetching measures from Orquest:', error);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: `Failed to fetch measures from Orquest: ${error.message}`,
            measures_fetched: 0,
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
      employees_updated: employeesUpdated,
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