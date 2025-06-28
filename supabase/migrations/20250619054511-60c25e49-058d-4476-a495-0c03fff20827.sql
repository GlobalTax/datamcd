
-- Optimización adicional: Consolidar políticas múltiples permisivas para mejorar rendimiento
-- Combinar políticas superpuestas en políticas únicas más eficientes

-- 1. Consolidar políticas de profiles en una sola política por acción
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;

CREATE POLICY "Profiles access policy" ON public.profiles
  FOR ALL USING (
    CASE 
      WHEN (select auth.uid()) IS NULL THEN false
      WHEN public.get_current_user_role() IN ('admin', 'advisor', 'asesor', 'superadmin') THEN true
      ELSE (select auth.uid()) = id
    END
  )
  WITH CHECK (
    CASE 
      WHEN (select auth.uid()) IS NULL THEN true -- Allow creation for new users
      WHEN public.get_current_user_role() IN ('admin', 'advisor', 'asesor', 'superadmin') THEN true
      ELSE (select auth.uid()) = id
    END
  );

-- 2. Consolidar políticas de franchisees
DROP POLICY IF EXISTS "Franchisees can view own data" ON public.franchisees;
DROP POLICY IF EXISTS "Franchisees can update own data" ON public.franchisees;
DROP POLICY IF EXISTS "Franchisees can insert own data" ON public.franchisees;
DROP POLICY IF EXISTS "Advisors can manage all franchisees" ON public.franchisees;

CREATE POLICY "Franchisees access policy" ON public.franchisees
  FOR ALL USING (
    CASE
      WHEN public.get_current_user_role() IN ('admin', 'advisor', 'asesor', 'superadmin') THEN true
      ELSE user_id = (select auth.uid())
    END
  )
  WITH CHECK (
    CASE
      WHEN public.get_current_user_role() IN ('admin', 'advisor', 'asesor', 'superadmin') THEN true
      ELSE user_id = (select auth.uid())
    END
  );

-- 3. Consolidar políticas de franchisee_restaurants
DROP POLICY IF EXISTS "Franchisees can view assigned restaurants" ON public.franchisee_restaurants;
DROP POLICY IF EXISTS "Franchisees can update assigned restaurants" ON public.franchisee_restaurants;
DROP POLICY IF EXISTS "Franchisees can insert restaurant assignments" ON public.franchisee_restaurants;
DROP POLICY IF EXISTS "Advisors can manage restaurant assignments" ON public.franchisee_restaurants;

CREATE POLICY "Franchisee restaurants access policy" ON public.franchisee_restaurants
  FOR ALL USING (
    CASE
      WHEN public.get_current_user_role() IN ('admin', 'advisor', 'asesor', 'superadmin') THEN true
      ELSE EXISTS (
        SELECT 1 FROM public.franchisees 
        WHERE id = franchisee_id AND user_id = (select auth.uid())
      )
    END
  )
  WITH CHECK (
    CASE
      WHEN public.get_current_user_role() IN ('admin', 'advisor', 'asesor', 'superadmin') THEN true
      ELSE EXISTS (
        SELECT 1 FROM public.franchisees 
        WHERE id = franchisee_id AND user_id = (select auth.uid())
      )
    END
  );

-- 4. Consolidar políticas de base_restaurants
DROP POLICY IF EXISTS "Advisors can manage base restaurants" ON public.base_restaurants;
DROP POLICY IF EXISTS "Franchisees can view base restaurants" ON public.base_restaurants;

CREATE POLICY "Base restaurants access policy" ON public.base_restaurants
  FOR ALL USING (
    CASE
      WHEN public.get_current_user_role() IN ('admin', 'advisor', 'asesor', 'superadmin') THEN true
      WHEN public.get_current_user_role() = 'franchisee' THEN true -- Solo lectura para franchisees
      ELSE false
    END
  )
  WITH CHECK (
    public.get_current_user_role() IN ('admin', 'advisor', 'asesor', 'superadmin')
  );

-- 5. Consolidar políticas de franchisee_invitations
DROP POLICY IF EXISTS "Advisors can manage invitations" ON public.franchisee_invitations;
DROP POLICY IF EXISTS "Franchisees can view own invitations" ON public.franchisee_invitations;

CREATE POLICY "Franchisee invitations access policy" ON public.franchisee_invitations
  FOR ALL USING (
    CASE
      WHEN public.get_current_user_role() IN ('advisor', 'admin', 'superadmin', 'asesor') THEN true
      ELSE EXISTS (
        SELECT 1 FROM public.franchisees f
        WHERE f.id = franchisee_id AND f.user_id = (select auth.uid())
      )
    END
  )
  WITH CHECK (
    public.get_current_user_role() IN ('advisor', 'admin', 'superadmin', 'asesor')
  );

-- 6. Consolidar políticas de profit_loss_data
DROP POLICY IF EXISTS "Franchisees can view P&L data" ON public.profit_loss_data;
DROP POLICY IF EXISTS "Franchisees can insert P&L data" ON public.profit_loss_data;
DROP POLICY IF EXISTS "Franchisees can update P&L data" ON public.profit_loss_data;
DROP POLICY IF EXISTS "Admins can manage P&L data" ON public.profit_loss_data;

CREATE POLICY "Profit loss data access policy" ON public.profit_loss_data
  FOR ALL USING (
    CASE
      WHEN public.get_current_user_role() IN ('admin', 'advisor', 'asesor', 'superadmin') THEN true
      ELSE restaurant_id IN (
        SELECT r.site_number 
        FROM public.restaurants r
        JOIN public.franchisees f ON r.franchisee_id = f.id
        WHERE f.user_id = (select auth.uid())
      )
    END
  )
  WITH CHECK (
    CASE
      WHEN public.get_current_user_role() IN ('admin', 'advisor', 'asesor', 'superadmin') THEN true
      ELSE restaurant_id IN (
        SELECT r.site_number 
        FROM public.restaurants r
        JOIN public.franchisees f ON r.franchisee_id = f.id
        WHERE f.user_id = (select auth.uid())
      )
    END
  );

-- 7. Mantener política simple para profit_loss_templates
DROP POLICY IF EXISTS "Authenticated users can view templates" ON public.profit_loss_templates;
DROP POLICY IF EXISTS "Admins can manage templates" ON public.profit_loss_templates;

CREATE POLICY "Profit loss templates access policy" ON public.profit_loss_templates
  FOR ALL USING (
    CASE
      WHEN public.get_current_user_role() IN ('admin', 'advisor', 'asesor', 'superadmin') THEN true
      ELSE (select auth.uid()) IS NOT NULL -- Solo lectura para usuarios autenticados
    END
  )
  WITH CHECK (
    public.get_current_user_role() IN ('admin', 'advisor', 'asesor', 'superadmin')
  );
