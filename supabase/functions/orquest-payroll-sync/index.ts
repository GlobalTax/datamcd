import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrquestPayrollData {
  [key: string]: any;
}

interface PayrollSyncRequest {
  action: 'import_payroll';
  franchiseeId: string;
  serviceId?: string;
  startDate: string;
  endDate: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Orquest payroll sync function called');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Validar que el request tiene body
    let requestBody: PayrollSyncRequest;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error('Invalid JSON in request body:', error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid JSON in request body',
          payroll_records_imported: 0 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { action, franchiseeId, serviceId = '1058', startDate, endDate } = requestBody;
    console.log('Payroll sync request:', { action, franchiseeId, serviceId, startDate, endDate });

    if (!franchiseeId || !startDate || !endDate) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'franchiseeId, startDate, and endDate are required',
          payroll_records_imported: 0 
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
          payroll_records_imported: 0 
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
      businessId,
      targetService: serviceId
    });

    if (!orquestApiKey) {
      console.error('ORQUEST_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Orquest API key not configured',
          payroll_records_imported: 0 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let payrollRecordsImported = 0;

    if (action === 'import_payroll') {
      console.log(`Starting payroll import for service ${serviceId} from ${startDate} to ${endDate}`);
      
      try {
        // Endpoint para obtener datos de nómina de Orquest
        // Usando el endpoint de medidas/métricas que puede incluir datos de payroll
        const payrollEndpoint = `${orquestBaseUrl}/importer/api/v2/businesses/${businessId}/services/${serviceId}/measures`;
        
        console.log('Calling Orquest payroll endpoint:', payrollEndpoint);
        
        const payrollResponse = await fetch(payrollEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${orquestApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: startDate,
            to: endDate,
            demandTypes: ['PAYROLL', 'LABOR_COST', 'HOURS_WORKED'] // Tipos específicos de datos de nómina
          }),
          signal: AbortSignal.timeout(30000), // 30 segundos
        });

        console.log('Orquest payroll API response status:', payrollResponse.status);

        if (!payrollResponse.ok) {
          const errorText = await payrollResponse.text();
          console.error('Orquest payroll API error response:', errorText);
          
          // Si el endpoint específico no funciona, intentar con datos de empleados mejorados
          console.log('Trying alternative endpoint for payroll data...');
          
          const alternativeEndpoint = `${orquestBaseUrl}/importer/api/v2/businesses/${businessId}/services/${serviceId}/employees/payroll`;
          
          const alternativeResponse = await fetch(alternativeEndpoint, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${orquestApiKey}`,
            },
            signal: AbortSignal.timeout(30000),
          });

          if (!alternativeResponse.ok) {
            throw new Error(`Orquest payroll API error: ${payrollResponse.status} - ${errorText}`);
          }

          const alternativeText = await alternativeResponse.text();
          console.log('Alternative Orquest payroll response received');
          
          let payrollData: OrquestPayrollData[];
          try {
            payrollData = JSON.parse(alternativeText);
          } catch (parseError) {
            console.error('Error parsing alternative Orquest payroll response:', parseError);
            throw new Error('Invalid JSON response from Orquest payroll API');
          }

          await processPayrollData(payrollData, serviceId, franchiseeId, startDate, endDate, supabase);
          payrollRecordsImported = payrollData.length;
          
        } else {
          const responseText = await payrollResponse.text();
          console.log('Orquest payroll API response received');

          let payrollData: OrquestPayrollData[];
          try {
            payrollData = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Error parsing Orquest payroll response:', parseError);
            throw new Error('Invalid JSON response from Orquest payroll API');
          }

          if (!Array.isArray(payrollData)) {
            console.error('Orquest payroll response is not an array:', typeof payrollData);
            throw new Error('Expected array of payroll data from Orquest API');
          }

          console.log(`Received ${payrollData.length} payroll records from Orquest`);

          await processPayrollData(payrollData, serviceId, franchiseeId, startDate, endDate, supabase);
          payrollRecordsImported = payrollData.length;
        }

      } catch (fetchError) {
        console.error('Error calling Orquest payroll API:', fetchError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: `Failed to import payroll from Orquest API: ${fetchError.message}`,
            payroll_records_imported: 0,
          }), 
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    console.log(`Payroll sync completed. Records imported: ${payrollRecordsImported}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payroll sync completed successfully',
        payroll_records_imported: payrollRecordsImported,
        service_id: serviceId,
        period: `${startDate} to ${endDate}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in payroll sync function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        payroll_records_imported: 0,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function processPayrollData(
  payrollData: OrquestPayrollData[],
  serviceId: string,
  franchiseeId: string,
  startDate: string,
  endDate: string,
  supabase: any
): Promise<void> {
  console.log('Processing payroll data...');

  // Primero, obtener empleados existentes para hacer el mapping
  const { data: existingEmployees, error: empError } = await supabase
    .from('orquest_employees')
    .select('id, service_id, nombre, apellidos, nif')
    .eq('service_id', serviceId)
    .eq('franchisee_id', franchiseeId);

  if (empError) {
    console.error('Error fetching existing employees:', empError);
    throw new Error('Could not fetch existing employees for payroll mapping');
  }

  console.log(`Found ${existingEmployees?.length || 0} existing employees for mapping`);

  // Procesar cada registro de payroll
  for (const payrollRecord of payrollData) {
    try {
      console.log('Processing payroll record:', payrollRecord);

      // Buscar el empleado correspondiente
      const employee = existingEmployees?.find(emp => 
        emp.id === payrollRecord.employee_id || 
        emp.nif === payrollRecord.nif ||
        (emp.nombre === payrollRecord.nombre && emp.apellidos === payrollRecord.apellidos)
      );

      if (!employee) {
        console.warn('Employee not found for payroll record:', payrollRecord);
        continue;
      }

      // Convertir datos de Orquest al formato de employee_payroll
      const payrollData = {
        employee_id: employee.id,
        period_start: startDate,
        period_end: endDate,
        regular_hours: payrollRecord.horas_regulares || payrollRecord.regular_hours || 0,
        overtime_hours: payrollRecord.horas_extra || payrollRecord.overtime_hours || 0,
        base_pay: payrollRecord.salario_base || payrollRecord.base_salary || 0,
        overtime_pay: payrollRecord.pago_extra || payrollRecord.overtime_pay || 0,
        bonuses: payrollRecord.bonificaciones || payrollRecord.bonuses || 0,
        commissions: payrollRecord.comisiones || payrollRecord.commissions || 0,
        social_security: payrollRecord.seguridad_social || payrollRecord.social_security || 0,
        income_tax: payrollRecord.impuesto_renta || payrollRecord.income_tax || 0,
        other_deductions: payrollRecord.otras_deducciones || payrollRecord.other_deductions || 0,
        gross_pay: payrollRecord.salario_bruto || payrollRecord.gross_pay || 0,
        net_pay: payrollRecord.salario_neto || payrollRecord.net_pay || 0,
        status: 'imported',
        notes: `Imported from Orquest service ${serviceId}`,
        created_by: null, // Sistema automatizado
      };

      console.log('Mapped payroll data:', payrollData);

      // Insertar o actualizar registro de payroll
      const { error: insertError } = await supabase
        .from('employee_payroll')
        .upsert(payrollData, {
          onConflict: 'employee_id,period_start,period_end'
        });

      if (insertError) {
        console.error('Error inserting payroll record:', insertError);
      } else {
        console.log(`Payroll record imported for employee ${employee.id}`);
      }

    } catch (error) {
      console.error('Error processing individual payroll record:', error);
    }
  }
}