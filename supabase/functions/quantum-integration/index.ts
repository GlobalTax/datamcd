import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { handleCorsPreflightRequest, createCorsResponse } from '../_shared/cors.ts';

interface QuantumAccount {
  codigo: string;
  nombre: string;
  tipo: string;
  saldo: number;
  debe: number;
  haber: number;
}

interface QuantumResponse {
  success: boolean;
  data: QuantumAccount[];
  message?: string;
}

interface SyncRequest {
  franchisee_id: string;
  restaurant_id?: string;
  period_start: string;
  period_end: string;
  sync_type?: 'manual' | 'automatic';
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(origin);
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const quantumApiKey = Deno.env.get('QUANTUM_API_KEY');
    const quantumBaseUrl = Deno.env.get('QUANTUM_BASE_URL') || 'https://api.quantum-economics.com';

    if (!quantumApiKey) {
      throw new Error('QUANTUM_API_KEY not configured');
    }

    const { franchisee_id, restaurant_id, period_start, period_end, sync_type = 'manual' }: SyncRequest = await req.json();

    console.log(`Starting Quantum sync for franchisee ${franchisee_id}, period ${period_start} to ${period_end}`);

    // Crear log de sincronización
    const { data: syncLog, error: syncLogError } = await supabaseClient
      .from('quantum_sync_logs')
      .insert({
        franchisee_id,
        restaurant_id,
        sync_type,
        status: 'processing'
      })
      .select()
      .single();

    if (syncLogError) {
      throw new Error(`Error creating sync log: ${syncLogError.message}`);
    }

    console.log(`Created sync log with ID: ${syncLog.id}`);

    // Obtener configuración del franquiciado para Quantum
    const { data: franchisee, error: franchiseeError } = await supabaseClient
      .from('franchisees')
      .select('*')
      .eq('id', franchisee_id)
      .single();

    if (franchiseeError) {
      throw new Error(`Error fetching franchisee: ${franchiseeError.message}`);
    }

    // Llamar a la API de Quantum Economics
    const quantumUrl = `${quantumBaseUrl}/api/balances/sumas-saldos`;
    const quantumParams = new URLSearchParams({
      'fecha_desde': period_start,
      'fecha_hasta': period_end,
      'formato': 'json'
    });

    console.log(`Calling Quantum API: ${quantumUrl}?${quantumParams}`);

    const quantumResponse = await fetch(`${quantumUrl}?${quantumParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${quantumApiKey}`,
        'Content-Type': 'application/json',
        'X-Company-ID': franchisee.tax_id || 'default' // Usar tax_id como identificador de empresa
      }
    });

    if (!quantumResponse.ok) {
      throw new Error(`Quantum API error: ${quantumResponse.status} ${quantumResponse.statusText}`);
    }

    const quantumData: QuantumResponse = await quantumResponse.json();
    
    if (!quantumData.success) {
      throw new Error(`Quantum API returned error: ${quantumData.message}`);
    }

    console.log(`Received ${quantumData.data.length} accounts from Quantum`);

    // Obtener mapeos de cuentas
    const { data: accountMappings, error: mappingError } = await supabaseClient
      .from('quantum_account_mapping')
      .select('*')
      .eq('is_active', true);

    if (mappingError) {
      throw new Error(`Error fetching account mappings: ${mappingError.message}`);
    }

    const mappingMap = new Map(accountMappings.map(m => [m.quantum_account_code, m]));

    let processedCount = 0;
    let importedCount = 0;
    let skippedCount = 0;

    // Procesar datos de Quantum y guardar en la base de datos
    const accountingDataToInsert = [];
    const profitLossUpdates = new Map();

    for (const account of quantumData.data) {
      processedCount++;

      // Guardar datos contables raw
      accountingDataToInsert.push({
        franchisee_id,
        restaurant_id: restaurant_id || null,
        quantum_account_code: account.codigo,
        account_name: account.nombre,
        account_type: account.tipo,
        balance: account.saldo,
        period_start,
        period_end,
        raw_data: account,
        last_sync: new Date().toISOString()
      });

      // Mapear a P&L si existe mapeo
      const mapping = mappingMap.get(account.codigo);
      if (mapping) {
        if (!profitLossUpdates.has(mapping.profit_loss_category)) {
          profitLossUpdates.set(mapping.profit_loss_category, {});
        }
        
        const categoryData = profitLossUpdates.get(mapping.profit_loss_category);
        categoryData[mapping.profit_loss_field] = account.saldo;
        importedCount++;
      } else {
        skippedCount++;
        console.log(`No mapping found for account ${account.codigo} - ${account.nombre}`);
      }
    }

    // Insertar datos contables
    if (accountingDataToInsert.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('quantum_accounting_data')
        .upsert(accountingDataToInsert, {
          onConflict: 'franchisee_id,restaurant_id,quantum_account_code,period_start,period_end'
        });

      if (insertError) {
        throw new Error(`Error inserting accounting data: ${insertError.message}`);
      }
    }

    // Crear o actualizar datos de P&L
    if (profitLossUpdates.size > 0) {
      // Calcular año y mes del periodo
      const periodDate = new Date(period_start);
      const year = periodDate.getFullYear();
      const month = periodDate.getMonth() + 1;

      // Obtener restaurantes del franquiciado si no se especifica uno
      let restaurants = [];
      if (restaurant_id) {
        restaurants = [{ id: restaurant_id }];
      } else {
        const { data: franchiseeRestaurants } = await supabaseClient
          .from('franchisee_restaurants')
          .select('id')
          .eq('franchisee_id', franchisee_id);
        restaurants = franchiseeRestaurants || [];
      }

      for (const restaurant of restaurants) {
        // Combinar todos los datos de las categorías
        const profitLossData: any = {
          restaurant_id: restaurant.id,
          year,
          month,
          source: 'quantum',
          quantum_sync_id: syncLog.id,
          last_quantum_sync: new Date().toISOString()
        };

        // Agregar todos los campos mapeados
        for (const [category, fields] of profitLossUpdates.entries()) {
          Object.assign(profitLossData, fields);
        }

        // Calcular campos derivados
        if (profitLossData.net_sales && profitLossData.other_revenue) {
          profitLossData.total_revenue = profitLossData.net_sales + profitLossData.other_revenue;
        }
        if (profitLossData.food_cost && profitLossData.paper_cost) {
          profitLossData.total_cost_of_sales = profitLossData.food_cost + profitLossData.paper_cost;
        }
        if (profitLossData.management_labor && profitLossData.crew_labor && profitLossData.benefits) {
          profitLossData.total_labor = profitLossData.management_labor + profitLossData.crew_labor + profitLossData.benefits;
        }
        if (profitLossData.total_revenue && profitLossData.total_cost_of_sales) {
          profitLossData.gross_profit = profitLossData.total_revenue - profitLossData.total_cost_of_sales;
        }

        // Insertar o actualizar P&L
        const { error: upsertError } = await supabaseClient
          .from('profit_loss_data')
          .upsert(profitLossData, {
            onConflict: 'restaurant_id,year,month'
          });

        if (upsertError) {
          console.error(`Error upserting P&L data for restaurant ${restaurant.id}:`, upsertError);
        }
      }
    }

    // Actualizar log de sincronización
    await supabaseClient
      .from('quantum_sync_logs')
      .update({
        status: 'success',
        records_processed: processedCount,
        records_imported: importedCount,
        records_skipped: skippedCount,
        sync_completed_at: new Date().toISOString()
      })
      .eq('id', syncLog.id);

    console.log(`Sync completed successfully. Processed: ${processedCount}, Imported: ${importedCount}, Skipped: ${skippedCount}`);

    return createCorsResponse({
      success: true,
      sync_id: syncLog.id,
      records_processed: processedCount,
      records_imported: importedCount,
      records_skipped: skippedCount,
      message: 'Synchronization completed successfully'
    }, origin);

  } catch (error) {
    console.error('Error in quantum-integration function:', error);
    
    return createCorsResponse({
      success: false,
      error: error.message
    }, origin, {}, 500);
  }
});
