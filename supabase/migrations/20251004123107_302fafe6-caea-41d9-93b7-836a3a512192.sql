-- Crear tabla para datos históricos de P&L
CREATE TABLE IF NOT EXISTS public.historical_profit_loss (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.franchisee_restaurants(id) ON DELETE CASCADE,
  franchisee_id uuid REFERENCES public.franchisees(id),
  
  -- Período
  year integer NOT NULL,
  month integer CHECK (month >= 1 AND month <= 12),
  period_type text NOT NULL DEFAULT 'monthly' CHECK (period_type IN ('monthly', 'quarterly', 'annual')),
  
  -- INGRESOS
  net_sales numeric NOT NULL DEFAULT 0,
  other_revenue numeric DEFAULT 0,
  
  -- COSTOS DE COMIDA
  food_cost numeric DEFAULT 0,
  food_employees numeric DEFAULT 0,
  waste numeric DEFAULT 0,
  paper_cost numeric DEFAULT 0,
  
  -- MANO DE OBRA
  crew_labor numeric DEFAULT 0,
  management_labor numeric DEFAULT 0,
  social_security numeric DEFAULT 0,
  travel_expenses numeric DEFAULT 0,
  
  -- GASTOS CONTROLABLES
  advertising numeric DEFAULT 0,
  promotion numeric DEFAULT 0,
  external_services numeric DEFAULT 0,
  uniforms numeric DEFAULT 0,
  operation_supplies numeric DEFAULT 0,
  maintenance numeric DEFAULT 0,
  utilities numeric DEFAULT 0,
  office_expenses numeric DEFAULT 0,
  cash_differences numeric DEFAULT 0,
  other_controllable numeric DEFAULT 0,
  
  -- GASTOS NO CONTROLABLES
  pac numeric DEFAULT 0,
  rent numeric DEFAULT 0,
  additional_rent numeric DEFAULT 0,
  royalty numeric DEFAULT 0,
  office_legal numeric DEFAULT 0,
  insurance numeric DEFAULT 0,
  taxes_licenses numeric DEFAULT 0,
  depreciation numeric DEFAULT 0,
  interest numeric DEFAULT 0,
  other_non_controllable numeric DEFAULT 0,
  
  -- OTROS
  non_product_sales numeric DEFAULT 0,
  non_product_cost numeric DEFAULT 0,
  draw_salary numeric DEFAULT 0,
  general_expenses numeric DEFAULT 0,
  loan_payment numeric DEFAULT 0,
  investment_own_funds numeric DEFAULT 0,
  
  -- Metadatos
  import_batch_id uuid,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  
  -- Índices únicos para evitar duplicados
  UNIQUE(restaurant_id, year, month, period_type)
);

-- Crear tabla para control de importaciones
CREATE TABLE IF NOT EXISTS public.import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES public.franchisee_restaurants(id) ON DELETE CASCADE,
  franchisee_id uuid REFERENCES public.franchisees(id),
  
  import_type text NOT NULL CHECK (import_type IN ('manual', 'csv', 'excel', 'api')),
  import_method text CHECK (import_method IN ('manual', 'csv', 'file', 'detailed')),
  
  records_imported integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  years_range text,
  
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_details jsonb,
  
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Habilitar RLS
ALTER TABLE public.historical_profit_loss ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para historical_profit_loss
CREATE POLICY "Simple historical PL policy" ON public.historical_profit_loss
FOR ALL USING (
  get_current_user_role() IN ('admin', 'superadmin', 'asesor') OR
  restaurant_id IN (
    SELECT fr.id FROM franchisee_restaurants fr 
    JOIN franchisees f ON f.id = fr.franchisee_id 
    WHERE f.user_id = auth.uid()
  )
);

-- Políticas RLS para import_batches
CREATE POLICY "Simple import batches policy" ON public.import_batches
FOR ALL USING (
  get_current_user_role() IN ('admin', 'superadmin', 'asesor') OR
  franchisee_id IN (SELECT id FROM franchisees WHERE user_id = auth.uid())
);

-- Trigger para updated_at
CREATE TRIGGER update_historical_profit_loss_updated_at
  BEFORE UPDATE ON public.historical_profit_loss
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Crear índices para mejor performance
CREATE INDEX idx_historical_pl_restaurant_year ON public.historical_profit_loss(restaurant_id, year DESC);
CREATE INDEX idx_historical_pl_year_month ON public.historical_profit_loss(year DESC, month DESC);
CREATE INDEX idx_import_batches_restaurant ON public.import_batches(restaurant_id, created_at DESC);