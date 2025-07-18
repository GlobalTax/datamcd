-- Recrear todas las políticas RLS usando roles existentes (admin, superadmin, franchisee)

-- Políticas para advisor_alert_instances
CREATE POLICY "Advisors can view alert instances" 
ON public.advisor_alert_instances 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]));

-- Políticas para advisor_alerts
CREATE POLICY "Advisors can manage alerts" 
ON public.advisor_alerts 
FOR ALL 
USING ((advisor_id = auth.uid()) OR (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])));

-- Políticas para advisor_communications
CREATE POLICY "Advisors can manage communications" 
ON public.advisor_communications 
FOR ALL 
USING ((advisor_id = auth.uid()) OR (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])));

-- Políticas para advisor_report_templates
CREATE POLICY "Advisors can manage report templates" 
ON public.advisor_report_templates 
FOR ALL 
USING ((advisor_id = auth.uid()) OR (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])));

CREATE POLICY "Public templates are viewable" 
ON public.advisor_report_templates 
FOR SELECT 
USING ((is_public = true) AND (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])));

-- Políticas para advisor_reports
CREATE POLICY "Advisors can manage reports" 
ON public.advisor_reports 
FOR ALL 
USING ((advisor_id = auth.uid()) OR (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])));

-- Políticas para advisor_tasks
CREATE POLICY "Advisors can manage tasks" 
ON public.advisor_tasks 
FOR ALL 
USING ((advisor_id = auth.uid()) OR (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])));

-- Políticas para audit_logs
CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]));

-- Políticas para base_restaurants
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

-- Políticas para employees
CREATE POLICY "Advisors can manage all employees" 
ON public.employees 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]));

-- Políticas para employee_payroll
CREATE POLICY "Employee payroll access" 
ON public.employee_payroll 
FOR ALL 
USING (employee_id IN ( SELECT e.id
   FROM ((employees e
     JOIN franchisee_restaurants fr ON ((fr.id = e.restaurant_id)))
     JOIN franchisees f ON ((f.id = fr.franchisee_id)))
  WHERE ((f.user_id = auth.uid()) OR (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])))));

-- Políticas para employee_time_off
CREATE POLICY "Employee time off access" 
ON public.employee_time_off 
FOR ALL 
USING (employee_id IN ( SELECT e.id
   FROM ((employees e
     JOIN franchisee_restaurants fr ON ((fr.id = e.restaurant_id)))
     JOIN franchisees f ON ((f.id = fr.franchisee_id)))
  WHERE ((f.user_id = auth.uid()) OR (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])))));

-- Políticas para employee_time_tracking
CREATE POLICY "Employee time tracking access" 
ON public.employee_time_tracking 
FOR ALL 
USING (employee_id IN ( SELECT e.id
   FROM ((employees e
     JOIN franchisee_restaurants fr ON ((fr.id = e.restaurant_id)))
     JOIN franchisees f ON ((f.id = fr.franchisee_id)))
  WHERE ((f.user_id = auth.uid()) OR (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])))));

-- Políticas para franchisee_access_log
CREATE POLICY "Advisors can view access logs" 
ON public.franchisee_access_log 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]));

-- Políticas para franchisee_activity_log
CREATE POLICY "Advisors can view activity logs" 
ON public.franchisee_activity_log 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]));

-- Políticas para franchisee_invitations
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

-- Políticas para franchisee_restaurants
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

-- Políticas para franchisee_staff
CREATE POLICY "Admins can manage all staff" 
ON public.franchisee_staff 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]));

-- Políticas para franchisees
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

-- Políticas para integration_configs
CREATE POLICY "Franchisee integration configs access" 
ON public.integration_configs 
FOR ALL 
USING ((get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])) OR (franchisee_id IN ( SELECT franchisees.id
   FROM franchisees
  WHERE (franchisees.user_id = auth.uid()))))
WITH CHECK ((get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])) OR (franchisee_id IN ( SELECT franchisees.id
   FROM franchisees
  WHERE (franchisees.user_id = auth.uid()))));

-- Políticas para orquest_employee_mapping
CREATE POLICY "Admins can manage employee mapping" 
ON public.orquest_employee_mapping 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]));

-- Políticas para orquest_measure_types
CREATE POLICY "Admins can manage measure types" 
ON public.orquest_measure_types 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]));

-- Políticas para orquest_employees
CREATE POLICY "Franchisees can view their orquest employees" 
ON public.orquest_employees 
FOR SELECT 
USING ((franchisee_id IN ( SELECT f.id
   FROM franchisees f
  WHERE (f.user_id = auth.uid()))) OR (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])));

-- Políticas para orquest_forecasts_sent
CREATE POLICY "Franchisees can view their sent forecasts" 
ON public.orquest_forecasts_sent 
FOR SELECT 
USING ((franchisee_id IN ( SELECT f.id
   FROM franchisees f
  WHERE (f.user_id = auth.uid()))) OR (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])));

-- Políticas para orquest_measures
CREATE POLICY "Franchisees can view their received measures" 
ON public.orquest_measures 
FOR SELECT 
USING ((franchisee_id IN ( SELECT f.id
   FROM franchisees f
  WHERE (f.user_id = auth.uid()))) OR (service_id IN ( SELECT s.id
   FROM (servicios_orquest s
     JOIN franchisees f ON ((s.franchisee_id = f.id)))
  WHERE (f.user_id = auth.uid()))) OR (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])));

-- Políticas para orquest_measures_sent
CREATE POLICY "Franchisees can view their sent measures" 
ON public.orquest_measures_sent 
FOR SELECT 
USING ((franchisee_id IN ( SELECT f.id
   FROM franchisees f
  WHERE (f.user_id = auth.uid()))) OR (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])));

-- Políticas para incident_comments
CREATE POLICY "Users can manage comments on accessible incidents" 
ON public.incident_comments 
FOR ALL 
USING ((incident_id IN ( SELECT restaurant_incidents.id
   FROM restaurant_incidents
  WHERE (restaurant_incidents.restaurant_id IN ( SELECT fr.id
           FROM (franchisee_restaurants fr
             JOIN franchisees f ON ((f.id = fr.franchisee_id)))
          WHERE ((f.user_id = auth.uid()) OR user_is_staff_of_franchisee(f.id)))))) OR (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])));

-- Limpiar políticas duplicadas
DROP POLICY IF EXISTS "base_restaurants_select_all" ON public.base_restaurants;
DROP POLICY IF EXISTS "base_restaurants_select_policy" ON public.base_restaurants;
DROP POLICY IF EXISTS "franchisee_restaurants_select" ON public.franchisee_restaurants;
DROP POLICY IF EXISTS "franchisee_restaurants_select_policy" ON public.franchisee_restaurants;
DROP POLICY IF EXISTS "franchisee_restaurants_update_policy" ON public.franchisee_restaurants;
DROP POLICY IF EXISTS "franchisees_insert_policy" ON public.franchisees;
DROP POLICY IF EXISTS "franchisees_select_own" ON public.franchisees;
DROP POLICY IF EXISTS "franchisees_select_policy" ON public.franchisees;
DROP POLICY IF EXISTS "franchisees_update_policy" ON public.franchisees;