-- ===== PIVOTE DEL MODELO DE DATOS: RESTAURANT_ID =====
-- Paso 1: Añadir columnas restaurant_id faltantes y franchisee_id como metadato

-- Añadir restaurant_id a employee_time_tracking
ALTER TABLE public.employee_time_tracking 
ADD COLUMN restaurant_id uuid REFERENCES public.franchisee_restaurants(id);

-- Añadir restaurant_id a integration_configs
ALTER TABLE public.integration_configs 
ADD COLUMN restaurant_id uuid REFERENCES public.franchisee_restaurants(id);

-- Añadir franchisee_id como metadato a tablas principales
ALTER TABLE public.employees 
ADD COLUMN franchisee_id uuid REFERENCES public.franchisees(id);

ALTER TABLE public.annual_budgets 
ADD COLUMN franchisee_id uuid REFERENCES public.franchisees(id);

ALTER TABLE public.employee_payroll 
ADD COLUMN franchisee_id uuid REFERENCES public.franchisees(id);

ALTER TABLE public.employee_time_off 
ADD COLUMN franchisee_id uuid REFERENCES public.franchisees(id);

-- Paso 2: Poblar columnas con datos existentes
-- Poblar restaurant_id en employee_time_tracking desde employees
UPDATE public.employee_time_tracking 
SET restaurant_id = e.restaurant_id
FROM public.employees e 
WHERE e.id = employee_time_tracking.employee_id;

-- Poblar restaurant_id en integration_configs desde franchisee asignado (usar primera relación activa)
UPDATE public.integration_configs 
SET restaurant_id = (
  SELECT fr.id 
  FROM public.franchisee_restaurants fr 
  WHERE fr.franchisee_id = integration_configs.franchisee_id 
    AND fr.status = 'active' 
  LIMIT 1
);

-- Poblar franchisee_id en employees
UPDATE public.employees 
SET franchisee_id = fr.franchisee_id
FROM public.franchisee_restaurants fr 
WHERE fr.id = employees.restaurant_id;

-- Poblar franchisee_id en annual_budgets
UPDATE public.annual_budgets 
SET franchisee_id = fr.franchisee_id
FROM public.franchisee_restaurants fr 
WHERE fr.id = annual_budgets.restaurant_id;

-- Poblar franchisee_id en employee_payroll
UPDATE public.employee_payroll 
SET franchisee_id = e.franchisee_id
FROM public.employees e 
WHERE e.id = employee_payroll.employee_id;

-- Poblar franchisee_id en employee_time_off
UPDATE public.employee_time_off 
SET franchisee_id = e.franchisee_id
FROM public.employees e 
WHERE e.id = employee_time_off.employee_id;

-- Paso 3: Crear vista unified_restaurants
CREATE OR REPLACE VIEW public.unified_restaurants AS
SELECT 
  fr.id as id,                           -- ID de franchisee_restaurant (principal)
  br.id as base_restaurant_id,           -- ID del restaurante base
  br.site_number,
  br.restaurant_name,
  br.address,
  br.city,
  br.state,
  br.postal_code,
  br.country,
  br.restaurant_type,
  br.opening_date,
  br.square_meters,
  br.seating_capacity,
  br.autonomous_community,
  br.property_type,
  fr.status,
  fr.franchisee_id,
  fr.franchise_start_date,
  fr.franchise_end_date,
  fr.lease_start_date,
  fr.lease_end_date,
  fr.monthly_rent,
  fr.franchise_fee_percentage,
  fr.advertising_fee_percentage,
  fr.last_year_revenue,
  fr.average_monthly_sales,
  fr.notes,
  f.franchisee_name,
  f.company_name,
  f.tax_id,
  f.city as franchisee_city,
  f.country as franchisee_country,
  br.created_at as base_created_at,
  fr.assigned_at,
  fr.updated_at,
  -- Campos calculados para el hub
  CASE 
    WHEN fr.status = 'active' THEN 'Activo'
    WHEN fr.status = 'inactive' THEN 'Inactivo'
    WHEN fr.status = 'pending' THEN 'Pendiente'
    WHEN fr.status = 'closed' THEN 'Cerrado'
    ELSE 'Desconocido'
  END as status_display,
  -- Indicador de asignación
  true as is_assigned
FROM public.franchisee_restaurants fr
JOIN public.base_restaurants br ON fr.base_restaurant_id = br.id
JOIN public.franchisees f ON fr.franchisee_id = f.id;

-- Paso 4: Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_employee_time_tracking_restaurant_id 
ON public.employee_time_tracking(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_integration_configs_restaurant_id 
ON public.integration_configs(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_employees_franchisee_id 
ON public.employees(franchisee_id);

CREATE INDEX IF NOT EXISTS idx_annual_budgets_franchisee_id 
ON public.annual_budgets(franchisee_id);

-- Paso 5: Actualizar RLS policies para usar restaurant_id como filtro principal
-- Employee time tracking - usar restaurant_id
DROP POLICY IF EXISTS "Employee time tracking access" ON public.employee_time_tracking;
CREATE POLICY "Employee time tracking restaurant access" ON public.employee_time_tracking
FOR ALL USING (
  restaurant_id IN (
    SELECT fr.id FROM public.franchisee_restaurants fr
    JOIN public.franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid() OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
  )
);

-- Integration configs - usar restaurant_id como filtro principal
DROP POLICY IF EXISTS "Franchisee integration configs access" ON public.integration_configs;
CREATE POLICY "Restaurant integration configs access" ON public.integration_configs
FOR ALL USING (
  (restaurant_id IN (
    SELECT fr.id FROM public.franchisee_restaurants fr
    JOIN public.franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid()
  )) OR 
  (franchisee_id IN (
    SELECT f.id FROM public.franchisees f
    WHERE f.user_id = auth.uid()
  )) OR 
  (get_current_user_role() = ANY(ARRAY['admin', 'superadmin']))
)
WITH CHECK (
  (restaurant_id IN (
    SELECT fr.id FROM public.franchisee_restaurants fr
    JOIN public.franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid()
  )) OR 
  (franchisee_id IN (
    SELECT f.id FROM public.franchisees f
    WHERE f.user_id = auth.uid()
  )) OR 
  (get_current_user_role() = ANY(ARRAY['admin', 'superadmin']))
);

-- Crear policy para la vista unified_restaurants
CREATE POLICY "Unified restaurants access" ON public.unified_restaurants
FOR SELECT USING (
  (franchisee_id IN (
    SELECT f.id FROM public.franchisees f
    WHERE f.user_id = auth.uid()
  )) OR 
  (get_current_user_role() = ANY(ARRAY['admin', 'superadmin']))
);

-- Habilitar RLS en la vista (aunque las políticas se heredan de las tablas base)
-- ALTER VIEW public.unified_restaurants OWNER TO postgres;

-- Paso 6: Crear función auxiliar para obtener restaurants de un usuario
CREATE OR REPLACE FUNCTION public.get_user_restaurants(user_uuid uuid DEFAULT auth.uid())
RETURNS TABLE(restaurant_id uuid, franchisee_id uuid, restaurant_name text, site_number text)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
    fr.id as restaurant_id,
    fr.franchisee_id,
    br.restaurant_name,
    br.site_number
  FROM franchisee_restaurants fr
  JOIN base_restaurants br ON br.id = fr.base_restaurant_id
  JOIN franchisees f ON f.id = fr.franchisee_id
  WHERE f.user_id = user_uuid AND fr.status = 'active';
$$;