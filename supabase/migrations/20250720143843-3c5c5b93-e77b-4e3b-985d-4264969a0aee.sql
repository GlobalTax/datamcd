
-- Corregir la sincronización de IDs entre auth.users y profiles
-- Actualizar el perfil de s.navarro@obn.es para que coincida con el ID de auth.users
UPDATE public.profiles 
SET id = '62bdec15-90ae-4339-8416-39c847aee996'
WHERE email = 's.navarro@obn.es';

-- Crear función para obtener el rol del usuario actual (evita recursión en RLS)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(role, 'franchisee') FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Asegurar que los superadmins puedan ver todos los datos
CREATE POLICY "Superadmins can view all franchisees" ON public.franchisees
FOR SELECT USING (get_current_user_role() = 'superadmin');

CREATE POLICY "Superadmins can view all base restaurants" ON public.base_restaurants  
FOR SELECT USING (get_current_user_role() = 'superadmin');

CREATE POLICY "Superadmins can view all franchisee restaurants" ON public.franchisee_restaurants
FOR SELECT USING (get_current_user_role() = 'superadmin');
