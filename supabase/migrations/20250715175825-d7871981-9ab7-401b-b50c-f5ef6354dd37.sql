-- Crear extensiones requeridas para integración Quantum Economics
CREATE TABLE public.quantum_accounting_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  franchisee_id uuid NOT NULL,
  restaurant_id uuid NOT NULL,
  quantum_account_code text NOT NULL,
  account_name text NOT NULL,
  account_type text NOT NULL, -- activo, pasivo, patrimonio, ingresos, gastos
  balance numeric(15,2) NOT NULL DEFAULT 0,
  period_start date NOT NULL,
  period_end date NOT NULL,
  last_sync timestamp with time zone NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'quantum',
  raw_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Crear tabla para configuración de mapeo de cuentas
CREATE TABLE public.quantum_account_mapping (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quantum_account_code text NOT NULL,
  quantum_account_name text NOT NULL,
  profit_loss_category text NOT NULL, -- revenue, cost_of_sales, labor, operating_expenses, mcdonalds_fees
  profit_loss_field text NOT NULL, -- net_sales, food_cost, crew_labor, etc.
  mapping_type text NOT NULL DEFAULT 'automatic', -- automatic, manual, custom
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Crear tabla para sincronizaciones
CREATE TABLE public.quantum_sync_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  franchisee_id uuid NOT NULL,
  restaurant_id uuid,
  sync_type text NOT NULL, -- manual, automatic, scheduled
  status text NOT NULL DEFAULT 'processing', -- processing, success, error
  records_processed integer NOT NULL DEFAULT 0,
  records_imported integer NOT NULL DEFAULT 0,
  records_skipped integer NOT NULL DEFAULT 0,
  error_message text,
  sync_started_at timestamp with time zone NOT NULL DEFAULT now(),
  sync_completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Añadir campos a profit_loss_data para rastreabilidad
ALTER TABLE public.profit_loss_data 
ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS quantum_sync_id uuid REFERENCES public.quantum_sync_logs(id),
ADD COLUMN IF NOT EXISTS last_quantum_sync timestamp with time zone;

-- Crear índices
CREATE INDEX idx_quantum_accounting_data_franchisee ON public.quantum_accounting_data(franchisee_id);
CREATE INDEX idx_quantum_accounting_data_restaurant ON public.quantum_accounting_data(restaurant_id);
CREATE INDEX idx_quantum_accounting_data_period ON public.quantum_accounting_data(period_start, period_end);
CREATE INDEX idx_quantum_sync_logs_franchisee ON public.quantum_sync_logs(franchisee_id);
CREATE INDEX idx_profit_loss_quantum_sync ON public.profit_loss_data(quantum_sync_id);

-- Enable RLS
ALTER TABLE public.quantum_accounting_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quantum_account_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quantum_sync_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para quantum_accounting_data
CREATE POLICY "Franchisees can view their quantum accounting data" 
ON public.quantum_accounting_data 
FOR SELECT 
USING (
  franchisee_id IN (
    SELECT f.id FROM franchisees f WHERE f.user_id = auth.uid()
  ) OR
  get_current_user_role() = ANY(ARRAY['admin', 'asesor', 'advisor', 'superadmin'])
);

CREATE POLICY "System can insert quantum accounting data" 
ON public.quantum_accounting_data 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update quantum accounting data" 
ON public.quantum_accounting_data 
FOR UPDATE 
USING (true);

-- Políticas RLS para quantum_account_mapping
CREATE POLICY "Anyone can view account mapping" 
ON public.quantum_account_mapping 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage account mapping" 
ON public.quantum_account_mapping 
FOR ALL 
USING (get_current_user_role() = ANY(ARRAY['admin', 'asesor', 'advisor', 'superadmin']));

-- Políticas RLS para quantum_sync_logs
CREATE POLICY "Franchisees can view their sync logs" 
ON public.quantum_sync_logs 
FOR SELECT 
USING (
  franchisee_id IN (
    SELECT f.id FROM franchisees f WHERE f.user_id = auth.uid()
  ) OR
  get_current_user_role() = ANY(ARRAY['admin', 'asesor', 'advisor', 'superadmin'])
);

CREATE POLICY "System can insert sync logs" 
ON public.quantum_sync_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update sync logs" 
ON public.quantum_sync_logs 
FOR UPDATE 
USING (true);

-- Insertar mapeos básicos de cuentas comunes
INSERT INTO public.quantum_account_mapping (quantum_account_code, quantum_account_name, profit_loss_category, profit_loss_field) VALUES
('7000', 'Ventas', 'revenue', 'net_sales'),
('7001', 'Otros Ingresos', 'revenue', 'other_revenue'),
('6000', 'Coste Alimentos', 'cost_of_sales', 'food_cost'),
('6001', 'Material Packaging', 'cost_of_sales', 'paper_cost'),
('6400', 'Sueldos Personal', 'labor', 'crew_labor'),
('6401', 'Sueldos Gerencia', 'labor', 'management_labor'),
('6402', 'Seguridad Social', 'labor', 'benefits'),
('6200', 'Alquiler', 'operating_expenses', 'rent'),
('6210', 'Electricidad', 'operating_expenses', 'utilities'),
('6211', 'Gas', 'operating_expenses', 'utilities'),
('6212', 'Agua', 'operating_expenses', 'utilities'),
('6300', 'Mantenimiento', 'operating_expenses', 'maintenance'),
('6500', 'Publicidad Local', 'operating_expenses', 'advertising'),
('6600', 'Seguros', 'operating_expenses', 'insurance'),
('6700', 'Material Oficina', 'operating_expenses', 'supplies'),
('6800', 'Otros Gastos', 'operating_expenses', 'other_expenses'),
('6900', 'Canon Franquicia', 'mcdonalds_fees', 'franchise_fee'),
('6901', 'Fondo Publicidad', 'mcdonalds_fees', 'advertising_fee'),
('6902', 'Alquiler %', 'mcdonalds_fees', 'rent_percentage');