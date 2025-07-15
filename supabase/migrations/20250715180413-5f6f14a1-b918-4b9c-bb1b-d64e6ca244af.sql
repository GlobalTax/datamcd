-- Crear cron job para sincronización automática con Quantum Economics cada 5 horas
SELECT cron.schedule(
  'quantum-auto-sync',
  '0 */5 * * *', -- Cada 5 horas
  $$
  SELECT
    net.http_post(
      url := 'https://ckvqfrppnfhoadcpqhld.supabase.co/functions/v1/quantum-integration',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrdnFmcnBwbmZob2FkY3BxaGxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMzg0OTgsImV4cCI6MjA2NTcxNDQ5OH0.5FfO-Nr8L01EwjPI_gf6rG2xucCLjRBQWAZzcXZsSAQ"}'::jsonb,
      body := json_build_object(
        'auto_sync', true,
        'period_start', (date_trunc('month', CURRENT_DATE))::text,
        'period_end', (date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day')::text
      )::jsonb
    ) as request_id;
  $$
);