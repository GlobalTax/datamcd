-- Actualizar todas las políticas RLS para usar roles existentes
-- Eliminar función actual que puede causar problemas
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- Recrear función con roles que realmente existen
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'franchisee' -- valor por defecto
  );
$$;

-- Actualizar políticas de advisor_alert_instances
DROP POLICY IF EXISTS "Advisors can view alert instances" ON public.advisor_alert_instances;
CREATE POLICY "Advisors can view alert instances" 
ON public.advisor_alert_instances 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]));

-- Actualizar políticas de advisor_alerts
DROP POLICY IF EXISTS "Advisors can manage alerts" ON public.advisor_alerts;
CREATE POLICY "Advisors can manage alerts" 
ON public.advisor_alerts 
FOR ALL 
USING ((advisor_id = auth.uid()) OR (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])));

-- Actualizar políticas de advisor_communications
DROP POLICY IF EXISTS "Advisors can manage communications" ON public.advisor_communications;
CREATE POLICY "Advisors can manage communications" 
ON public.advisor_communications 
FOR ALL 
USING ((advisor_id = auth.uid()) OR (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])));

-- Actualizar políticas de advisor_report_templates
DROP POLICY IF EXISTS "Advisors can manage report templates" ON public.advisor_report_templates;
CREATE POLICY "Advisors can manage report templates" 
ON public.advisor_report_templates 
FOR ALL 
USING ((advisor_id = auth.uid()) OR (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])));

DROP POLICY IF EXISTS "Public templates are viewable" ON public.advisor_report_templates;
CREATE POLICY "Public templates are viewable" 
ON public.advisor_report_templates 
FOR SELECT 
USING ((is_public = true) AND (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])));

-- Actualizar políticas de advisor_reports
DROP POLICY IF EXISTS "Advisors can manage reports" ON public.advisor_reports;
CREATE POLICY "Advisors can manage reports" 
ON public.advisor_reports 
FOR ALL 
USING ((advisor_id = auth.uid()) OR (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])));

-- Actualizar políticas de advisor_tasks
DROP POLICY IF EXISTS "Advisors can manage tasks" ON public.advisor_tasks;
CREATE POLICY "Advisors can manage tasks" 
ON public.advisor_tasks 
FOR ALL 
USING ((advisor_id = auth.uid()) OR (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])));

-- Actualizar políticas de base_restaurants
DROP POLICY IF EXISTS "Base restaurants access policy" ON public.base_restaurants;
DROP POLICY IF EXISTS "Unified base restaurants access policy" ON public.base_restaurants;
DROP POLICY IF EXISTS "base_restaurants_advisor_policy" ON public.base_restaurants;

CREATE POLICY "Unified base restaurants access policy" 
ON public.base_restaurants 
FOR ALL 
USING (
  CASE
    WHEN (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])) THEN true
    ELSE true
  END
)
WITH CHECK (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]));

-- Actualizar políticas de employees
DROP POLICY IF EXISTS "Advisors can manage all employees" ON public.employees;
CREATE POLICY "Advisors can manage all employees" 
ON public.employees 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]));

-- Actualizar políticas de franchisee_access_log
DROP POLICY IF EXISTS "Advisors can view access logs" ON public.franchisee_access_log;
CREATE POLICY "Advisors can view access logs" 
ON public.franchisee_access_log 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]));

-- Actualizar políticas de franchisee_activity_log
DROP POLICY IF EXISTS "Advisors can view activity logs" ON public.franchisee_activity_log;
CREATE POLICY "Advisors can view activity logs" 
ON public.franchisee_activity_log 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]));

-- Actualizar políticas de franchisee_invitations
DROP POLICY IF EXISTS "Franchisee invitations access policy" ON public.franchisee_invitations;
CREATE POLICY "Franchisee invitations access policy" 
ON public.franchisee_invitations 
FOR ALL 
USING (
  CASE
    WHEN (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])) THEN true
    ELSE (EXISTS ( SELECT 1
       FROM franchisees f
      WHERE ((f.id = franchisee_invitations.franchisee_id) AND (f.user_id = auth.uid()))))
  END
)
WITH CHECK (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]));

-- Actualizar políticas de franchisee_restaurants
DROP POLICY IF EXISTS "Franchisee restaurants access policy" ON public.franchisee_restaurants;
DROP POLICY IF EXISTS "Unified franchisee restaurants access policy" ON public.franchisee_restaurants;
DROP POLICY IF EXISTS "franchisee_restaurants_advisor_policy" ON public.franchisee_restaurants;

CREATE POLICY "Unified franchisee restaurants access policy" 
ON public.franchisee_restaurants 
FOR ALL 
USING (
  CASE
    WHEN (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])) THEN true
    WHEN (get_current_user_role() = 'franchisee'::text) THEN (EXISTS ( SELECT 1
       FROM franchisees
      WHERE ((franchisees.id = franchisee_restaurants.franchisee_id) AND (franchisees.user_id = auth.uid()))))
    WHEN (get_current_user_role() = 'staff'::text) THEN user_is_staff_of_franchisee(franchisee_id)
    ELSE false
  END
)
WITH CHECK (
  CASE
    WHEN (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])) THEN true
    WHEN (get_current_user_role() = 'franchisee'::text) THEN (EXISTS ( SELECT 1
       FROM franchisees
      WHERE ((franchisees.id = franchisee_restaurants.franchisee_id) AND (franchisees.user_id = auth.uid()))))
    WHEN (get_current_user_role() = 'staff'::text) THEN user_is_staff_of_franchisee(franchisee_id)
    ELSE false
  END
);

-- Actualizar políticas de franchisees
DROP POLICY IF EXISTS "Franchisees access policy" ON public.franchisees;
DROP POLICY IF EXISTS "Unified franchisees access policy" ON public.franchisees;

CREATE POLICY "Unified franchisees access policy" 
ON public.franchisees 
FOR ALL 
USING (
  CASE
    WHEN (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])) THEN true
    WHEN (get_current_user_role() = 'franchisee'::text) THEN (user_id = auth.uid())
    WHEN (get_current_user_role() = 'staff'::text) THEN user_is_staff_of_franchisee(id)
    ELSE false
  END
)
WITH CHECK (
  CASE
    WHEN (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])) THEN true
    WHEN (get_current_user_role() = 'franchisee'::text) THEN (user_id = auth.uid())
    WHEN (get_current_user_role() = 'staff'::text) THEN user_is_staff_of_franchisee(id)
    ELSE false
  END
);

-- Actualizar políticas de integration_configs
DROP POLICY IF EXISTS "Franchisee integration configs access" ON public.integration_configs;
CREATE POLICY "Franchisee integration configs access" 
ON public.integration_configs 
FOR ALL 
USING ((get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])) OR (franchisee_id IN ( SELECT franchisees.id
   FROM franchisees
  WHERE (franchisees.user_id = auth.uid()))))
WITH CHECK ((get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])) OR (franchisee_id IN ( SELECT franchisees.id
   FROM franchisees
  WHERE (franchisees.user_id = auth.uid()))));

-- Actualizar políticas de orquest tables
DROP POLICY IF EXISTS "Admins and advisors can manage employee mapping" ON public.orquest_employee_mapping;
DROP POLICY IF EXISTS "Admins and advisors can view employee mapping" ON public.orquest_employee_mapping;
CREATE POLICY "Admins can manage employee mapping" 
ON public.orquest_employee_mapping 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]));

DROP POLICY IF EXISTS "Admins and advisors can manage measure types" ON public.orquest_measure_types;
DROP POLICY IF EXISTS "Admins and advisors can view measure types" ON public.orquest_measure_types;
CREATE POLICY "Admins can manage measure types" 
ON public.orquest_measure_types 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]));

-- Actualizar políticas de orquest_employees
DROP POLICY IF EXISTS "Franchisees can view their orquest employees" ON public.orquest_employees;
CREATE POLICY "Franchisees can view their orquest employees" 
ON public.orquest_employees 
FOR SELECT 
USING ((franchisee_id IN ( SELECT f.id
   FROM franchisees f
  WHERE (f.user_id = auth.uid()))) OR (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])));

-- Actualizar políticas de orquest_forecasts_sent
DROP POLICY IF EXISTS "Franchisees can view their sent forecasts" ON public.orquest_forecasts_sent;
CREATE POLICY "Franchisees can view their sent forecasts" 
ON public.orquest_forecasts_sent 
FOR SELECT 
USING ((franchisee_id IN ( SELECT f.id
   FROM franchisees f
  WHERE (f.user_id = auth.uid()))) OR (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])));

-- Actualizar políticas de orquest_measures
DROP POLICY IF EXISTS "Franchisees can view their received measures" ON public.orquest_measures;
CREATE POLICY "Franchisees can view their received measures" 
ON public.orquest_measures 
FOR SELECT 
USING ((franchisee_id IN ( SELECT f.id
   FROM franchisees f
  WHERE (f.user_id = auth.uid()))) OR (service_id IN ( SELECT s.id
   FROM (servicios_orquest s
     JOIN franchisees f ON ((s.franchisee_id = f.id)))
  WHERE (f.user_id = auth.uid()))) OR (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])));

-- Actualizar políticas de orquest_measures_sent (la política estaba cortada)
DROP POLICY IF EXISTS "Franchisees can view their sent measures" ON public.orquest_measures_sent;
CREATE POLICY "Franchisees can view their sent measures" 
ON public.orquest_measures_sent 
FOR SELECT 
USING ((franchisee_id IN ( SELECT f.id
   FROM franchisees f
  WHERE (f.user_id = auth.uid()))) OR (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])));

-- Limpiar políticas duplicadas en base_restaurants
DROP POLICY IF EXISTS "base_restaurants_select_all" ON public.base_restaurants;
DROP POLICY IF EXISTS "base_restaurants_select_policy" ON public.base_restaurants;

-- Limpiar políticas duplicadas en franchisee_restaurants
DROP POLICY IF EXISTS "franchisee_restaurants_select" ON public.franchisee_restaurants;
DROP POLICY IF EXISTS "franchisee_restaurants_select_policy" ON public.franchisee_restaurants;
DROP POLICY IF EXISTS "franchisee_restaurants_update_policy" ON public.franchisee_restaurants;

-- Limpiar políticas duplicadas en franchisees
DROP POLICY IF EXISTS "franchisees_insert_policy" ON public.franchisees;
DROP POLICY IF EXISTS "franchisees_select_own" ON public.franchisees;
DROP POLICY IF EXISTS "franchisees_select_policy" ON public.franchisees;
DROP POLICY IF EXISTS "franchisees_update_policy" ON public.franchisees;