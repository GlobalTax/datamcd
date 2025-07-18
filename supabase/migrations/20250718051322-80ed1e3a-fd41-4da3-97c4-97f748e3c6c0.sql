-- Primero eliminar todas las políticas que dependen de la función
-- Luego eliminar la función y recrearla

-- Eliminar políticas de advisor_alert_instances
DROP POLICY IF EXISTS "Advisors can view alert instances" ON public.advisor_alert_instances;

-- Eliminar políticas de advisor_alerts
DROP POLICY IF EXISTS "Advisors can manage alerts" ON public.advisor_alerts;

-- Eliminar políticas de advisor_communications
DROP POLICY IF EXISTS "Advisors can manage communications" ON public.advisor_communications;

-- Eliminar políticas de advisor_report_templates
DROP POLICY IF EXISTS "Advisors can manage report templates" ON public.advisor_report_templates;
DROP POLICY IF EXISTS "Public templates are viewable" ON public.advisor_report_templates;

-- Eliminar políticas de advisor_reports
DROP POLICY IF EXISTS "Advisors can manage reports" ON public.advisor_reports;

-- Eliminar políticas de advisor_tasks
DROP POLICY IF EXISTS "Advisors can manage tasks" ON public.advisor_tasks;

-- Eliminar políticas de audit_logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

-- Eliminar políticas de base_restaurants
DROP POLICY IF EXISTS "Base restaurants access policy" ON public.base_restaurants;
DROP POLICY IF EXISTS "Unified base restaurants access policy" ON public.base_restaurants;
DROP POLICY IF EXISTS "base_restaurants_advisor_policy" ON public.base_restaurants;

-- Eliminar políticas de employees
DROP POLICY IF EXISTS "Advisors can manage all employees" ON public.employees;

-- Eliminar políticas de employee_payroll
DROP POLICY IF EXISTS "Employee payroll access" ON public.employee_payroll;

-- Eliminar políticas de employee_time_off
DROP POLICY IF EXISTS "Employee time off access" ON public.employee_time_off;

-- Eliminar políticas de employee_time_tracking
DROP POLICY IF EXISTS "Employee time tracking access" ON public.employee_time_tracking;

-- Eliminar políticas de franchisee_access_log
DROP POLICY IF EXISTS "Advisors can view access logs" ON public.franchisee_access_log;

-- Eliminar políticas de franchisee_activity_log
DROP POLICY IF EXISTS "Advisors can view activity logs" ON public.franchisee_activity_log;

-- Eliminar políticas de franchisee_invitations
DROP POLICY IF EXISTS "Franchisee invitations access policy" ON public.franchisee_invitations;

-- Eliminar políticas de franchisee_restaurants
DROP POLICY IF EXISTS "Franchisee restaurants access policy" ON public.franchisee_restaurants;
DROP POLICY IF EXISTS "Unified franchisee restaurants access policy" ON public.franchisee_restaurants;
DROP POLICY IF EXISTS "franchisee_restaurants_advisor_policy" ON public.franchisee_restaurants;

-- Eliminar políticas de franchisee_staff
DROP POLICY IF EXISTS "Admins can manage all staff" ON public.franchisee_staff;

-- Eliminar políticas de franchisees
DROP POLICY IF EXISTS "Franchisees access policy" ON public.franchisees;
DROP POLICY IF EXISTS "Unified franchisees access policy" ON public.franchisees;

-- Eliminar políticas de integration_configs
DROP POLICY IF EXISTS "Franchisee integration configs access" ON public.integration_configs;

-- Eliminar políticas de orquest_employee_mapping
DROP POLICY IF EXISTS "Admins and advisors can manage employee mapping" ON public.orquest_employee_mapping;
DROP POLICY IF EXISTS "Admins and advisors can view employee mapping" ON public.orquest_employee_mapping;

-- Eliminar políticas de orquest_measure_types
DROP POLICY IF EXISTS "Admins and advisors can manage measure types" ON public.orquest_measure_types;
DROP POLICY IF EXISTS "Admins and advisors can view measure types" ON public.orquest_measure_types;

-- Eliminar políticas de orquest_employees
DROP POLICY IF EXISTS "Franchisees can view their orquest employees" ON public.orquest_employees;

-- Eliminar políticas de orquest_forecasts_sent
DROP POLICY IF EXISTS "Franchisees can view their sent forecasts" ON public.orquest_forecasts_sent;

-- Eliminar políticas de orquest_measures
DROP POLICY IF EXISTS "Franchisees can view their received measures" ON public.orquest_measures;

-- Eliminar políticas de orquest_measures_sent
DROP POLICY IF EXISTS "Franchisees can view their sent measures" ON public.orquest_measures_sent;

-- Eliminar políticas relacionadas con profit_loss_data si existen
DROP POLICY IF EXISTS "Profit loss data access policy" ON public.profit_loss_data;

-- Eliminar políticas relacionadas con profit_loss_templates si existen
DROP POLICY IF EXISTS "Profit loss templates access policy" ON public.profit_loss_templates;

-- Eliminar políticas de profiles si existen
DROP POLICY IF EXISTS "Unified profiles access policy" ON public.profiles;

-- Eliminar políticas de servicios_orquest si existen
DROP POLICY IF EXISTS "Franchisees can view orquest services" ON public.servicios_orquest;
DROP POLICY IF EXISTS "Admins can manage orquest services" ON public.servicios_orquest;
DROP POLICY IF EXISTS "Franchisees can view their services" ON public.servicios_orquest;
DROP POLICY IF EXISTS "Franchisees can manage their services" ON public.servicios_orquest;

-- Eliminar políticas de restaurant_incidents si existen
DROP POLICY IF EXISTS "Advisors can view all incidents" ON public.restaurant_incidents;

-- Eliminar políticas de incident_comments
DROP POLICY IF EXISTS "Users can manage comments on accessible incidents" ON public.incident_comments;

-- Eliminar políticas de quantum tables si existen
DROP POLICY IF EXISTS "Franchisees can view their quantum accounting data" ON public.quantum_accounting_data;
DROP POLICY IF EXISTS "Admins can manage account mapping" ON public.quantum_account_mapping;
DROP POLICY IF EXISTS "Franchisees can view their sync logs" ON public.quantum_sync_logs;

-- Ahora recrear la función
DROP FUNCTION IF EXISTS public.get_current_user_role();

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