
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  type: 'financial' | 'payroll' | 'incidents' | 'performance' | 'comparative' | 'operational';
  configuration: Record<string, any>;
  is_public: boolean;
  created_at: string;
}

export interface ScheduledReport {
  id: string;
  template_id: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  next_run: string;
  enabled: boolean;
  recipients: string[];
}

export const useAdvancedReports = () => {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('advisor_report_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Error al cargar plantillas de reportes');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (template: Omit<ReportTemplate, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('advisor_report_templates')
        .insert([template])
        .select()
        .single();

      if (error) throw error;
      
      setTemplates(prev => [data, ...prev]);
      toast.success('Plantilla creada exitosamente');
      return data;
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Error al crear plantilla');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTemplate = useCallback(async (id: string, template: Partial<ReportTemplate>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('advisor_report_templates')
        .update(template)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setTemplates(prev => prev.map(t => t.id === id ? data : t));
      toast.success('Plantilla actualizada exitosamente');
      return data;
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Error al actualizar plantilla');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('advisor_report_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success('Plantilla eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Error al eliminar plantilla');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateReport = useCallback(async (templateId: string, parameters: Record<string, any>) => {
    try {
      setLoading(true);
      
      // Mock implementation - in real app, this would call an edge function
      const mockData = await new Promise(resolve => {
        setTimeout(() => {
          resolve({
            id: `report-${Date.now()}`,
            template_id: templateId,
            data: generateMockReportData(),
            generated_at: new Date().toISOString(),
            parameters
          });
        }, 2000);
      });

      toast.success('Reporte generado exitosamente');
      return mockData;
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error al generar reporte');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const scheduleReport = useCallback(async (schedule: Omit<ScheduledReport, 'id'>) => {
    try {
      setLoading(true);
      
      // Mock implementation - in real app, this would use pg_cron or similar
      const mockSchedule = {
        ...schedule,
        id: `schedule-${Date.now()}`
      };

      setScheduledReports(prev => [...prev, mockSchedule]);
      toast.success('Reporte programado exitosamente');
      return mockSchedule;
    } catch (error) {
      console.error('Error scheduling report:', error);
      toast.error('Error al programar reporte');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateMockReportData = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i, 1).toLocaleDateString('es-ES', { month: 'short' }),
      revenue: Math.floor(Math.random() * 100000) + 150000,
      costs: Math.floor(Math.random() * 60000) + 80000,
      profit: Math.floor(Math.random() * 40000) + 20000
    }));
  };

  return {
    loading,
    templates,
    scheduledReports,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    generateReport,
    scheduleReport
  };
};
