-- Crear tablas para las funcionalidades avanzadas del panel de asesor

-- Tabla para comunicaciones entre asesores y franquiciados
CREATE TABLE public.advisor_communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID NOT NULL,
  franchisee_id UUID NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('message', 'note', 'alert', 'meeting')),
  subject TEXT,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para tareas asignadas por asesores
CREATE TABLE public.advisor_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID NOT NULL,
  franchisee_id UUID NOT NULL,
  restaurant_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para alertas personalizables
CREATE TABLE public.advisor_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('performance', 'financial', 'operational', 'compliance')),
  title TEXT NOT NULL,
  description TEXT,
  conditions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  franchisee_id UUID,
  restaurant_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para alertas disparadas
CREATE TABLE public.advisor_alert_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID NOT NULL REFERENCES public.advisor_alerts(id) ON DELETE CASCADE,
  franchisee_id UUID,
  restaurant_id UUID,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  data JSONB,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para reportes guardados y plantillas
CREATE TABLE public.advisor_report_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL CHECK (report_type IN ('kpi', 'financial', 'operational', 'comparative')),
  configuration JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para reportes generados
CREATE TABLE public.advisor_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.advisor_report_templates(id),
  advisor_id UUID NOT NULL,
  report_name TEXT NOT NULL,
  report_data JSONB NOT NULL,
  parameters JSONB,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Tabla para logs de auditoría
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para configuraciones de integraciones
CREATE TABLE public.integration_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID NOT NULL,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('pos', 'accounting', 'marketing', 'external_api')),
  config_name TEXT NOT NULL,
  api_endpoint TEXT,
  api_key_encrypted TEXT,
  configuration JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en todas las nuevas tablas
ALTER TABLE public.advisor_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_alert_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para advisor_communications
CREATE POLICY "Advisors can manage communications" ON public.advisor_communications
FOR ALL USING (
  advisor_id = auth.uid() OR 
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin'])
);

CREATE POLICY "Franchisees can view their communications" ON public.advisor_communications
FOR SELECT USING (
  franchisee_id IN (
    SELECT f.id FROM public.franchisees f WHERE f.user_id = auth.uid()
  )
);

-- Políticas RLS para advisor_tasks
CREATE POLICY "Advisors can manage tasks" ON public.advisor_tasks
FOR ALL USING (
  advisor_id = auth.uid() OR 
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin'])
);

CREATE POLICY "Franchisees can view their tasks" ON public.advisor_tasks
FOR SELECT USING (
  franchisee_id IN (
    SELECT f.id FROM public.franchisees f WHERE f.user_id = auth.uid()
  )
);

-- Políticas RLS para advisor_alerts
CREATE POLICY "Advisors can manage alerts" ON public.advisor_alerts
FOR ALL USING (
  advisor_id = auth.uid() OR 
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin'])
);

-- Políticas RLS para advisor_alert_instances
CREATE POLICY "Advisors can view alert instances" ON public.advisor_alert_instances
FOR ALL USING (
  get_current_user_role() = ANY (ARRAY['asesor', 'admin', 'superadmin'])
);

-- Políticas RLS para advisor_report_templates
CREATE POLICY "Advisors can manage report templates" ON public.advisor_report_templates
FOR ALL USING (
  advisor_id = auth.uid() OR 
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin'])
);

CREATE POLICY "Public templates are viewable" ON public.advisor_report_templates
FOR SELECT USING (
  is_public = true AND get_current_user_role() = ANY (ARRAY['asesor', 'admin', 'superadmin'])
);

-- Políticas RLS para advisor_reports
CREATE POLICY "Advisors can manage reports" ON public.advisor_reports
FOR ALL USING (
  advisor_id = auth.uid() OR 
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin'])
);

-- Políticas RLS para audit_logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
FOR SELECT USING (
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin'])
);

-- Políticas RLS para integration_configs
CREATE POLICY "Advisors can manage integrations" ON public.integration_configs
FOR ALL USING (
  advisor_id = auth.uid() OR 
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin'])
);

-- Función para registrar cambios en audit_logs
CREATE OR REPLACE FUNCTION public.log_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id, 
    action_type, 
    table_name, 
    record_id, 
    old_values, 
    new_values
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para audit_logs en tablas críticas
CREATE TRIGGER audit_trigger_franchisees 
  AFTER INSERT OR UPDATE OR DELETE ON public.franchisees 
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_trail();

CREATE TRIGGER audit_trigger_franchisee_restaurants 
  AFTER INSERT OR UPDATE OR DELETE ON public.franchisee_restaurants 
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_trail();

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers de updated_at a las nuevas tablas
CREATE TRIGGER update_advisor_communications_updated_at
  BEFORE UPDATE ON public.advisor_communications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advisor_tasks_updated_at
  BEFORE UPDATE ON public.advisor_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advisor_alerts_updated_at
  BEFORE UPDATE ON public.advisor_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advisor_report_templates_updated_at
  BEFORE UPDATE ON public.advisor_report_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_integration_configs_updated_at
  BEFORE UPDATE ON public.integration_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();