-- Crear tabla de datos de Profit & Loss
CREATE TABLE IF NOT EXISTS public.profit_loss_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  
  -- Ingresos
  net_sales NUMERIC NOT NULL DEFAULT 0,
  other_revenue NUMERIC DEFAULT 0,
  total_revenue NUMERIC GENERATED ALWAYS AS (net_sales + COALESCE(other_revenue, 0)) STORED,
  
  -- Costo de ventas
  food_cost NUMERIC DEFAULT 0,
  paper_cost NUMERIC DEFAULT 0,
  total_cost_of_sales NUMERIC GENERATED ALWAYS AS (COALESCE(food_cost, 0) + COALESCE(paper_cost, 0)) STORED,
  
  -- Costos laborales
  management_labor NUMERIC DEFAULT 0,
  crew_labor NUMERIC DEFAULT 0,
  benefits NUMERIC DEFAULT 0,
  total_labor NUMERIC GENERATED ALWAYS AS (COALESCE(management_labor, 0) + COALESCE(crew_labor, 0) + COALESCE(benefits, 0)) STORED,
  
  -- Gastos operativos
  rent NUMERIC DEFAULT 0,
  utilities NUMERIC DEFAULT 0,
  maintenance NUMERIC DEFAULT 0,
  advertising NUMERIC DEFAULT 0,
  insurance NUMERIC DEFAULT 0,
  supplies NUMERIC DEFAULT 0,
  other_expenses NUMERIC DEFAULT 0,
  total_operating_expenses NUMERIC GENERATED ALWAYS AS (
    COALESCE(rent, 0) + COALESCE(utilities, 0) + COALESCE(maintenance, 0) + 
    COALESCE(advertising, 0) + COALESCE(insurance, 0) + COALESCE(supplies, 0) + 
    COALESCE(other_expenses, 0)
  ) STORED,
  
  -- Tarifas McDonald's
  franchise_fee NUMERIC DEFAULT 0,
  advertising_fee NUMERIC DEFAULT 0,
  rent_percentage NUMERIC DEFAULT 0,
  total_mcdonalds_fees NUMERIC GENERATED ALWAYS AS (
    COALESCE(franchise_fee, 0) + COALESCE(advertising_fee, 0) + COALESCE(rent_percentage, 0)
  ) STORED,
  
  -- Cálculos finales
  gross_profit NUMERIC GENERATED ALWAYS AS (
    (net_sales + COALESCE(other_revenue, 0)) - 
    (COALESCE(food_cost, 0) + COALESCE(paper_cost, 0))
  ) STORED,
  
  operating_income NUMERIC GENERATED ALWAYS AS (
    (net_sales + COALESCE(other_revenue, 0)) - 
    (COALESCE(food_cost, 0) + COALESCE(paper_cost, 0)) - 
    (COALESCE(management_labor, 0) + COALESCE(crew_labor, 0) + COALESCE(benefits, 0)) - 
    (COALESCE(rent, 0) + COALESCE(utilities, 0) + COALESCE(maintenance, 0) + 
     COALESCE(advertising, 0) + COALESCE(insurance, 0) + COALESCE(supplies, 0) + 
     COALESCE(other_expenses, 0)) - 
    (COALESCE(franchise_fee, 0) + COALESCE(advertising_fee, 0) + COALESCE(rent_percentage, 0))
  ) STORED,
  
  -- Metadatos
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT,
  notes TEXT,
  
  -- Constraint para evitar duplicados
  UNIQUE(restaurant_id, year, month)
);

-- Crear tabla de plantillas de P&L
CREATE TABLE IF NOT EXISTS public.profit_loss_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.profit_loss_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profit_loss_templates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profit_loss_data
CREATE POLICY "Profit loss data access policy" ON public.profit_loss_data
  FOR ALL USING (
    CASE 
      WHEN get_current_user_role() = ANY(ARRAY['admin', 'advisor', 'asesor', 'superadmin']) THEN true
      ELSE restaurant_id IN (
        SELECT r.site_number 
        FROM restaurants r 
        JOIN franchisees f ON r.franchisee_id = f.id 
        WHERE f.user_id = auth.uid()
      )
    END
  )
  WITH CHECK (
    CASE 
      WHEN get_current_user_role() = ANY(ARRAY['admin', 'advisor', 'asesor', 'superadmin']) THEN true
      ELSE restaurant_id IN (
        SELECT r.site_number 
        FROM restaurants r 
        JOIN franchisees f ON r.franchisee_id = f.id 
        WHERE f.user_id = auth.uid()
      )
    END
  );

-- Políticas RLS para profit_loss_templates
CREATE POLICY "Profit loss templates access policy" ON public.profit_loss_templates
  FOR ALL USING (
    CASE 
      WHEN get_current_user_role() = ANY(ARRAY['admin', 'advisor', 'asesor', 'superadmin']) THEN true
      ELSE auth.uid() IS NOT NULL
    END
  )
  WITH CHECK (get_current_user_role() = ANY(ARRAY['admin', 'advisor', 'asesor', 'superadmin']));

-- Trigger para actualizar updated_at
CREATE TRIGGER update_profit_loss_data_updated_at
    BEFORE UPDATE ON public.profit_loss_data
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar plantilla por defecto
INSERT INTO public.profit_loss_templates (name, description, template_data, is_default)
VALUES (
  'Plantilla McDonald''s Estándar',
  'Plantilla estándar para P&L de restaurantes McDonald''s',
  '{
    "revenue": {
      "net_sales": 0,
      "other_revenue": 0
    },
    "cost_of_sales": {
      "food_cost": 0,
      "paper_cost": 0
    },
    "labor": {
      "management_labor": 0,
      "crew_labor": 0,
      "benefits": 0
    },
    "operating_expenses": {
      "rent": 0,
      "utilities": 0,
      "maintenance": 0,
      "advertising": 0,
      "insurance": 0,
      "supplies": 0,
      "other_expenses": 0
    },
    "mcdonalds_fees": {
      "franchise_fee": 0,
      "advertising_fee": 0,
      "rent_percentage": 0
    }
  }',
  true
) ON CONFLICT DO NOTHING;