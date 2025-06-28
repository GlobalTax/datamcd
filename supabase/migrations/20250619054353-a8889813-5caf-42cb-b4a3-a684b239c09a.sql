
-- Optimización de políticas RLS para mejorar el rendimiento
-- Reemplazar auth.uid() con (select auth.uid()) para evitar re-evaluación por fila

-- 1. Limpiar políticas duplicadas y optimizar tabla profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON public.profiles  
  FOR UPDATE USING ((select auth.uid()) = id);

CREATE POLICY "Allow profile creation" ON public.profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage profiles" ON public.profiles
  FOR ALL USING (
    CASE 
      WHEN (select auth.uid()) IS NULL THEN false
      ELSE public.get_current_user_role() IN ('admin', 'advisor', 'asesor', 'superadmin')
    END
  );

-- 2. Optimizar políticas de franchisees (eliminar duplicadas)
DROP POLICY IF EXISTS "Users can view own franchisee data" ON public.franchisees;
DROP POLICY IF EXISTS "Users can update own franchisee data" ON public.franchisees;
DROP POLICY IF EXISTS "Users can insert own franchisee data" ON public.franchisees;
DROP POLICY IF EXISTS "Advisors can view all franchisees" ON public.franchisees;
DROP POLICY IF EXISTS "Advisors can create franchisees" ON public.franchisees;
DROP POLICY IF EXISTS "Advisors can update franchisees" ON public.franchisees;
DROP POLICY IF EXISTS "Advisors can delete franchisees" ON public.franchisees;
DROP POLICY IF EXISTS "Enable all access for advisors on franchisees" ON public.franchisees;
DROP POLICY IF EXISTS "Enable read access for franchisees to own data" ON public.franchisees;

CREATE POLICY "Franchisees can view own data" ON public.franchisees
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Franchisees can update own data" ON public.franchisees
  FOR UPDATE USING (user_id = (select auth.uid()));

CREATE POLICY "Franchisees can insert own data" ON public.franchisees
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Advisors can manage all franchisees" ON public.franchisees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (select auth.uid()) 
      AND role IN ('admin', 'advisor', 'asesor', 'superadmin')
    )
  );

-- 3. Optimizar políticas de restaurants
DROP POLICY IF EXISTS "Franchisees can view their restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Franchisees can update their restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Franchisees can insert restaurants" ON public.restaurants;

CREATE POLICY "Franchisees can view their restaurants" ON public.restaurants
  FOR SELECT USING (
    franchisee_id IN (
      SELECT id FROM public.franchisees WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Franchisees can update their restaurants" ON public.restaurants
  FOR UPDATE USING (
    franchisee_id IN (
      SELECT id FROM public.franchisees WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Franchisees can insert restaurants" ON public.restaurants
  FOR INSERT WITH CHECK (
    franchisee_id IN (
      SELECT id FROM public.franchisees WHERE user_id = (select auth.uid())
    )
  );

-- 4. Optimizar políticas de franchisee_restaurants (eliminar duplicadas)
DROP POLICY IF EXISTS "Franchisees can view own assigned restaurants" ON public.franchisee_restaurants;
DROP POLICY IF EXISTS "Franquiciados pueden ver sus restaurantes asignados" ON public.franchisee_restaurants;
DROP POLICY IF EXISTS "Franchisees can insert restaurant assignments" ON public.franchisee_restaurants;
DROP POLICY IF EXISTS "Franquiciados pueden actualizar sus restaurantes asignados" ON public.franchisee_restaurants;
DROP POLICY IF EXISTS "Advisors can manage all restaurant assignments" ON public.franchisee_restaurants;
DROP POLICY IF EXISTS "Asesores pueden gestionar asignaciones de restaurantes" ON public.franchisee_restaurants;

CREATE POLICY "Franchisees can view assigned restaurants" ON public.franchisee_restaurants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.franchisees 
      WHERE id = franchisee_id AND user_id = (select auth.uid())
    )
  );

CREATE POLICY "Franchisees can update assigned restaurants" ON public.franchisee_restaurants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.franchisees 
      WHERE id = franchisee_id AND user_id = (select auth.uid())
    )
  );

CREATE POLICY "Franchisees can insert restaurant assignments" ON public.franchisee_restaurants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.franchisees 
      WHERE id = franchisee_id AND user_id = (select auth.uid())
    )
  );

CREATE POLICY "Advisors can manage restaurant assignments" ON public.franchisee_restaurants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (select auth.uid()) 
      AND role IN ('admin', 'advisor', 'asesor', 'superadmin')
    )
  );

-- 5. Optimizar políticas de base_restaurants (eliminar duplicadas)
DROP POLICY IF EXISTS "Superadmins y asesores pueden gestionar restaurantes base" ON public.base_restaurants;
DROP POLICY IF EXISTS "Franquiciados pueden ver restaurantes base" ON public.base_restaurants;

CREATE POLICY "Advisors can manage base restaurants" ON public.base_restaurants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (select auth.uid()) 
      AND role IN ('admin', 'advisor', 'asesor', 'superadmin')
    )
  );

CREATE POLICY "Franchisees can view base restaurants" ON public.base_restaurants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (select auth.uid()) 
      AND role = 'franchisee'
    )
  );

-- 6. Optimizar políticas de profit_loss_data
DROP POLICY IF EXISTS "Franchisees can view P&L data for their restaurants" ON public.profit_loss_data;
DROP POLICY IF EXISTS "Franchisees can insert P&L data for their restaurants" ON public.profit_loss_data;
DROP POLICY IF EXISTS "Franchisees can update P&L data for their restaurants" ON public.profit_loss_data;
DROP POLICY IF EXISTS "Admins can insert P&L data" ON public.profit_loss_data;
DROP POLICY IF EXISTS "Admins can update P&L data" ON public.profit_loss_data;

CREATE POLICY "Franchisees can view P&L data" ON public.profit_loss_data
  FOR SELECT USING (
    restaurant_id IN (
      SELECT r.site_number 
      FROM public.restaurants r
      JOIN public.franchisees f ON r.franchisee_id = f.id
      WHERE f.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Franchisees can insert P&L data" ON public.profit_loss_data
  FOR INSERT WITH CHECK (
    restaurant_id IN (
      SELECT r.site_number 
      FROM public.restaurants r
      JOIN public.franchisees f ON r.franchisee_id = f.id
      WHERE f.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Franchisees can update P&L data" ON public.profit_loss_data
  FOR UPDATE USING (
    restaurant_id IN (
      SELECT r.site_number 
      FROM public.restaurants r
      JOIN public.franchisees f ON r.franchisee_id = f.id
      WHERE f.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can manage P&L data" ON public.profit_loss_data
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (select auth.uid()) 
      AND role IN ('admin', 'advisor', 'asesor', 'superadmin')
    )
  );

-- 7. Optimizar políticas de profit_loss_templates
DROP POLICY IF EXISTS "Admins can insert templates" ON public.profit_loss_templates;
DROP POLICY IF EXISTS "Admins can update templates" ON public.profit_loss_templates;
DROP POLICY IF EXISTS "Admins can delete templates" ON public.profit_loss_templates;
DROP POLICY IF EXISTS "Authenticated users can view templates" ON public.profit_loss_templates;

CREATE POLICY "Authenticated users can view templates" ON public.profit_loss_templates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage templates" ON public.profit_loss_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (select auth.uid()) 
      AND role IN ('admin', 'advisor', 'asesor', 'superadmin')
    )
  );

-- 8. Optimizar políticas de annual_budgets
DROP POLICY IF EXISTS "Users can view annual budgets for their restaurants" ON public.annual_budgets;
DROP POLICY IF EXISTS "Users can create annual budgets for their restaurants" ON public.annual_budgets;
DROP POLICY IF EXISTS "Users can update annual budgets for their restaurants" ON public.annual_budgets;
DROP POLICY IF EXISTS "Users can delete annual budgets for their restaurants" ON public.annual_budgets;

CREATE POLICY "Users can view annual budgets" ON public.annual_budgets
  FOR SELECT USING (
    restaurant_id IN (
      SELECT fr.id 
      FROM franchisee_restaurants fr
      JOIN franchisees f ON f.id = fr.franchisee_id
      WHERE f.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create annual budgets" ON public.annual_budgets
  FOR INSERT WITH CHECK (
    restaurant_id IN (
      SELECT fr.id 
      FROM franchisee_restaurants fr
      JOIN franchisees f ON f.id = fr.franchisee_id
      WHERE f.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update annual budgets" ON public.annual_budgets
  FOR UPDATE USING (
    restaurant_id IN (
      SELECT fr.id 
      FROM franchisee_restaurants fr
      JOIN franchisees f ON f.id = fr.franchisee_id
      WHERE f.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete annual budgets" ON public.annual_budgets
  FOR DELETE USING (
    restaurant_id IN (
      SELECT fr.id 
      FROM franchisee_restaurants fr
      JOIN franchisees f ON f.id = fr.franchisee_id
      WHERE f.user_id = (select auth.uid())
    )
  );

-- 9. Optimizar políticas de restaurant_budgets
DROP POLICY IF EXISTS "Franquiciados pueden gestionar presupuestos de sus restaurantes" ON public.restaurant_budgets;

CREATE POLICY "Franchisees can manage restaurant budgets" ON public.restaurant_budgets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.franchisee_restaurants fr
      JOIN public.franchisees f ON f.id = fr.franchisee_id
      WHERE fr.id = franchisee_restaurant_id AND f.user_id = (select auth.uid())
    )
  );

-- 10. Optimizar políticas de monthly_tracking
DROP POLICY IF EXISTS "Franquiciados pueden gestionar seguimiento de sus restaurantes" ON public.monthly_tracking;

CREATE POLICY "Franchisees can manage monthly tracking" ON public.monthly_tracking
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.franchisee_restaurants fr
      JOIN public.franchisees f ON f.id = fr.franchisee_id
      WHERE fr.id = franchisee_restaurant_id AND f.user_id = (select auth.uid())
    )
  );

-- 11. Optimizar políticas de valuation_budgets
DROP POLICY IF EXISTS "Franchisees can view their own valuation budgets" ON public.valuation_budgets;
DROP POLICY IF EXISTS "Franchisees can create their own valuation budgets" ON public.valuation_budgets;
DROP POLICY IF EXISTS "Franchisees can update their own valuation budgets" ON public.valuation_budgets;
DROP POLICY IF EXISTS "Franchisees can delete their own valuation budgets" ON public.valuation_budgets;

CREATE POLICY "Franchisees can view valuation budgets" ON public.valuation_budgets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.franchisee_restaurants fr
      JOIN public.franchisees f ON f.id = fr.franchisee_id
      WHERE fr.id = franchisee_restaurant_id 
      AND f.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Franchisees can create valuation budgets" ON public.valuation_budgets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.franchisee_restaurants fr
      JOIN public.franchisees f ON f.id = fr.franchisee_id
      WHERE fr.id = franchisee_restaurant_id 
      AND f.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Franchisees can update valuation budgets" ON public.valuation_budgets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.franchisee_restaurants fr
      JOIN public.franchisees f ON f.id = fr.franchisee_id
      WHERE fr.id = franchisee_restaurant_id 
      AND f.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Franchisees can delete valuation budgets" ON public.valuation_budgets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.franchisee_restaurants fr
      JOIN public.franchisees f ON f.id = fr.franchisee_id
      WHERE fr.id = franchisee_restaurant_id 
      AND f.user_id = (select auth.uid())
    )
  );

-- 12. Optimizar políticas de restaurant_valuations (manejar políticas existentes)
DROP POLICY IF EXISTS "Authenticated users can create restaurant valuations" ON public.restaurant_valuations;
DROP POLICY IF EXISTS "Users can update their own restaurant valuations" ON public.restaurant_valuations;
DROP POLICY IF EXISTS "Users can delete their own restaurant valuations" ON public.restaurant_valuations;
DROP POLICY IF EXISTS "Users can view all restaurant valuations" ON public.restaurant_valuations;

CREATE POLICY "Users can view all restaurant valuations" ON public.restaurant_valuations
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create restaurant valuations" ON public.restaurant_valuations
  FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Users can update own restaurant valuations" ON public.restaurant_valuations
  FOR UPDATE USING (created_by = (select auth.uid()));

CREATE POLICY "Users can delete own restaurant valuations" ON public.restaurant_valuations
  FOR DELETE USING (created_by = (select auth.uid()));

-- 13. Optimizar políticas de valuation_scenarios
DROP POLICY IF EXISTS "Authenticated users can create valuation scenarios" ON public.valuation_scenarios;
DROP POLICY IF EXISTS "Users can view all valuation scenarios" ON public.valuation_scenarios;
DROP POLICY IF EXISTS "Users can update valuation scenarios" ON public.valuation_scenarios;
DROP POLICY IF EXISTS "Users can delete valuation scenarios" ON public.valuation_scenarios;

CREATE POLICY "Users can view all valuation scenarios" ON public.valuation_scenarios
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create valuation scenarios" ON public.valuation_scenarios
  FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Users can update valuation scenarios" ON public.valuation_scenarios
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete valuation scenarios" ON public.valuation_scenarios
  FOR DELETE USING (true);

-- 14. Optimizar políticas de franchisee_invitations (eliminar duplicadas)
DROP POLICY IF EXISTS "Enable all access for advisors on invitations" ON public.franchisee_invitations;
DROP POLICY IF EXISTS "Enable read access for franchisees to own invitations" ON public.franchisee_invitations;

CREATE POLICY "Advisors can manage invitations" ON public.franchisee_invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (select auth.uid()) 
      AND role IN ('advisor', 'admin', 'superadmin', 'asesor')
    )
  );

CREATE POLICY "Franchisees can view own invitations" ON public.franchisee_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.franchisees f
      WHERE f.id = franchisee_id 
      AND f.user_id = (select auth.uid())
    )
  );

-- 15. Optimizar políticas de franchisee_access_log
DROP POLICY IF EXISTS "Advisors can view all access logs" ON public.franchisee_access_log;
DROP POLICY IF EXISTS "System can insert access logs" ON public.franchisee_access_log;

CREATE POLICY "Advisors can view access logs" ON public.franchisee_access_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (select auth.uid()) 
      AND role IN ('advisor', 'admin', 'superadmin', 'asesor')
    )
  );

CREATE POLICY "System can insert access logs" ON public.franchisee_access_log
  FOR INSERT WITH CHECK (true);

-- 16. Optimizar políticas de franchisee_activity_log
DROP POLICY IF EXISTS "Advisors can view all activity logs" ON public.franchisee_activity_log;
DROP POLICY IF EXISTS "System can insert activity logs" ON public.franchisee_activity_log;

CREATE POLICY "Advisors can view activity logs" ON public.franchisee_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (select auth.uid()) 
      AND role IN ('advisor', 'admin', 'superadmin', 'asesor')
    )
  );

CREATE POLICY "System can insert activity logs" ON public.franchisee_activity_log
  FOR INSERT WITH CHECK (true);
