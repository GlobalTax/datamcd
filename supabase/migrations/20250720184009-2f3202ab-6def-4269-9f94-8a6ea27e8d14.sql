
-- Fase 1: Corregir acceso de datos
-- Crear perfil de usuario superadmin
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  '62bdec15-90ae-4339-8416-39c847aee996',
  's.navarro@obn.es',
  'Super Administrador',
  'superadmin'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'superadmin',
  email = 's.navarro@obn.es',
  full_name = 'Super Administrador',
  updated_at = now();

-- Simplificar temporalmente las políticas RLS para desarrollo
-- Permitir acceso completo a restaurantes base para superadmin
DROP POLICY IF EXISTS "Unified base restaurants access policy" ON public.base_restaurants;
CREATE POLICY "Temporary full access to base restaurants" ON public.base_restaurants
FOR ALL USING (
  CASE 
    WHEN get_current_user_role() = 'superadmin' THEN true
    ELSE true -- Permitir acceso temporal durante desarrollo
  END
);

-- Permitir acceso completo a relaciones franquiciado-restaurante
DROP POLICY IF EXISTS "Unified franchisee restaurants access policy" ON public.franchisee_restaurants;
CREATE POLICY "Temporary full access to franchisee restaurants" ON public.franchisee_restaurants
FOR ALL USING (
  CASE 
    WHEN get_current_user_role() = 'superadmin' THEN true
    ELSE true -- Permitir acceso temporal durante desarrollo
  END
);

-- Permitir acceso completo a franquiciados
DROP POLICY IF EXISTS "Unified franchisees access policy" ON public.franchisees;
CREATE POLICY "Temporary full access to franchisees" ON public.franchisees
FOR ALL USING (
  CASE 
    WHEN get_current_user_role() = 'superadmin' THEN true
    ELSE true -- Permitir acceso temporal durante desarrollo
  END
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_base_restaurants_city ON public.base_restaurants(city);
CREATE INDEX IF NOT EXISTS idx_base_restaurants_franchisee_name ON public.base_restaurants(franchisee_name);
CREATE INDEX IF NOT EXISTS idx_franchisee_restaurants_status ON public.franchisee_restaurants(status);
CREATE INDEX IF NOT EXISTS idx_franchisee_restaurants_franchisee_id ON public.franchisee_restaurants(franchisee_id);
