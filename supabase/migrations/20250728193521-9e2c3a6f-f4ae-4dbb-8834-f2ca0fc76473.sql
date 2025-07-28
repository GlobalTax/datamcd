-- Primero necesitamos crear la nueva estructura de annual_budgets
-- que referencie franchisee_restaurants en lugar de base_restaurants

-- 1. Crear nueva tabla temporal para annual_budgets con la estructura correcta
CREATE TABLE IF NOT EXISTS public.annual_budgets_new (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.franchisee_restaurants(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  jan NUMERIC DEFAULT 0,
  feb NUMERIC DEFAULT 0,
  mar NUMERIC DEFAULT 0,
  apr NUMERIC DEFAULT 0,
  may NUMERIC DEFAULT 0,
  jun NUMERIC DEFAULT 0,
  jul NUMERIC DEFAULT 0,
  aug NUMERIC DEFAULT 0,
  sep NUMERIC DEFAULT 0,
  oct NUMERIC DEFAULT 0,
  nov NUMERIC DEFAULT 0,
  dec NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID
);

-- 2. Copiar datos existentes si hay alguno válido
-- Solo copiar registros donde el restaurant_id corresponda a un franchisee_restaurant válido
INSERT INTO public.annual_budgets_new (
  id, restaurant_id, year, category, subcategory,
  jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec,
  created_at, updated_at, created_by
)
SELECT 
  ab.id, fr.id as restaurant_id, ab.year, ab.category, ab.subcategory,
  ab.jan, ab.feb, ab.mar, ab.apr, ab.may, ab.jun, 
  ab.jul, ab.aug, ab.sep, ab.oct, ab.nov, ab.dec,
  ab.created_at, ab.updated_at, ab.created_by
FROM public.annual_budgets ab
INNER JOIN public.franchisee_restaurants fr ON fr.base_restaurant_id = ab.restaurant_id
WHERE EXISTS (
  SELECT 1 FROM public.franchisee_restaurants fr2 WHERE fr2.base_restaurant_id = ab.restaurant_id
);

-- 3. Eliminar tabla antigua
DROP TABLE IF EXISTS public.annual_budgets;

-- 4. Renombrar nueva tabla
ALTER TABLE public.annual_budgets_new RENAME TO annual_budgets;

-- 5. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_annual_budgets_restaurant_year ON public.annual_budgets(restaurant_id, year);
CREATE INDEX IF NOT EXISTS idx_annual_budgets_category ON public.annual_budgets(category);

-- 6. Habilitar RLS
ALTER TABLE public.annual_budgets ENABLE ROW LEVEL SECURITY;

-- 7. Crear políticas RLS actualizadas
CREATE POLICY "Authenticated users can manage annual budgets" 
ON public.annual_budgets 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- 8. Corregir la tabla restaurant_incidents para que use franchisee_restaurants
-- Verificar si la columna restaurant_id ya apunta a franchisee_restaurants
DO $$
BEGIN
  -- Verificar si existe la foreign key incorrecta
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'restaurant_incidents' 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'restaurant_id'
    AND ccu.table_name = 'base_restaurants'
  ) THEN
    -- Eliminar foreign key antigua si existe
    ALTER TABLE public.restaurant_incidents 
    DROP CONSTRAINT IF EXISTS restaurant_incidents_restaurant_id_fkey;
    
    -- Agregar nueva foreign key a franchisee_restaurants
    ALTER TABLE public.restaurant_incidents 
    ADD CONSTRAINT restaurant_incidents_restaurant_id_fkey 
    FOREIGN KEY (restaurant_id) REFERENCES public.franchisee_restaurants(id) ON DELETE CASCADE;
  END IF;
END $$;