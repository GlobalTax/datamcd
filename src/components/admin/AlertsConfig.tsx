import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  RefreshCw, 
  Plus, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Alert {
  id: string;
  alert_type: string;
  title: string;
  description?: string;
  conditions: Record<string, any>;
  is_active: boolean;
  created_at: string;
  advisor_id: string;
}

export const AlertsConfig: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);

  const [formData, setFormData] = useState({
    alert_type: '',
    title: '',
    description: '',
    conditions: {
      metric: '',
      operator: '',
      threshold: '',
      period: '24h'
    },
    is_active: true
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('advisor_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data?.map(alert => ({
        ...alert,
        conditions: alert.conditions as Record<string, any>
      })) || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Error al cargar alertas');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAlert = async () => {
    try {
      if (editingAlert) {
        // Update existing alert
        const { error } = await supabase
          .from('advisor_alerts')
          .update({
            title: formData.title,
            description: formData.description,
            conditions: formData.conditions,
            is_active: formData.is_active
          })
          .eq('id', editingAlert.id);

        if (error) throw error;
        toast.success('Alerta actualizada exitosamente');
      } else {
        // Create new alert
        const { error } = await supabase
          .from('advisor_alerts')
          .insert([{
            alert_type: formData.alert_type,
            title: formData.title,
            description: formData.description,
            conditions: formData.conditions,
            is_active: formData.is_active,
            advisor_id: 'system' // For system alerts
          }]);

        if (error) throw error;
        toast.success('Alerta creada exitosamente');
      }

      resetForm();
      fetchAlerts();
    } catch (error) {
      console.error('Error saving alert:', error);
      toast.error('Error al guardar alerta');
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      const { error } = await supabase
        .from('advisor_alerts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Alerta eliminada exitosamente');
      fetchAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast.error('Error al eliminar alerta');
    }
  };

  const resetForm = () => {
    setFormData({
      alert_type: '',
      title: '',
      description: '',
      conditions: {
        metric: '',
        operator: '',
        threshold: '',
        period: '24h'
      },
      is_active: true
    });
    setEditingAlert(null);
    setShowCreateForm(false);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'financial':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'operational':
        return <Users className="w-5 h-5 text-orange-600" />;
      case 'system':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const alertTypes = [
    { value: 'performance', label: 'Rendimiento' },
    { value: 'financial', label: 'Financiero' },
    { value: 'operational', label: 'Operacional' },
    { value: 'system', label: 'Sistema' }
  ];

  const metrics = [
    { value: 'revenue', label: 'Ingresos' },
    { value: 'costs', label: 'Costes' },
    { value: 'profit_margin', label: 'Margen de Beneficio' },
    { value: 'labor_cost', label: 'Coste Laboral' },
    { value: 'incidents_count', label: 'Número de Incidencias' },
    { value: 'system_uptime', label: 'Uptime del Sistema' }
  ];

  const operators = [
    { value: 'greater_than', label: 'Mayor que' },
    { value: 'less_than', label: 'Menor que' },
    { value: 'equals', label: 'Igual a' },
    { value: 'percentage_change', label: 'Cambio porcentual' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Cargando alertas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Configuración de Alertas</h2>
          <p className="text-muted-foreground">Define umbrales y condiciones para alertas automáticas</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nueva Alerta
        </Button>
      </div>

      {/* Alert Cards */}
      <div className="grid gap-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-3">
                {getAlertIcon(alert.alert_type)}
                <div>
                  <CardTitle className="text-lg">{alert.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={alert.is_active ? "default" : "secondary"}>
                  {alert.is_active ? 'Activa' : 'Inactiva'}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingAlert(alert);
                    setFormData({
                      alert_type: alert.alert_type,
                      title: alert.title,
                      description: alert.description || '',
                      conditions: {
                        metric: alert.conditions.metric || '',
                        operator: alert.conditions.operator || '',
                        threshold: alert.conditions.threshold || '',
                        period: alert.conditions.period || '24h'
                      },
                      is_active: alert.is_active
                    });
                    setShowCreateForm(true);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteAlert(alert.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Métrica</Label>
                  <p className="text-muted-foreground">{alert.conditions.metric || 'No definida'}</p>
                </div>
                <div>
                  <Label className="font-medium">Condición</Label>
                  <p className="text-muted-foreground">
                    {alert.conditions.operator} {alert.conditions.threshold}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Período</Label>
                  <p className="text-muted-foreground">{alert.conditions.period || '24h'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Alert Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingAlert ? 'Editar Alerta' : 'Nueva Alerta'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="alert_type">Tipo de Alerta</Label>
                    <Select
                      value={formData.alert_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, alert_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {alertTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Título de la alerta"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción detallada de la alerta"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Métrica</Label>
                    <Select
                      value={formData.conditions.metric}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        conditions: { ...prev.conditions, metric: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar métrica" />
                      </SelectTrigger>
                      <SelectContent>
                        {metrics.map(metric => (
                          <SelectItem key={metric.value} value={metric.value}>
                            {metric.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Operador</Label>
                    <Select
                      value={formData.conditions.operator}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        conditions: { ...prev.conditions, operator: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Operador" />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map(operator => (
                          <SelectItem key={operator.value} value={operator.value}>
                            {operator.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Umbral</Label>
                    <Input
                      value={formData.conditions.threshold}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        conditions: { ...prev.conditions, threshold: e.target.value }
                      }))}
                      placeholder="Valor umbral"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Alerta activa</Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveAlert}>
                    {editingAlert ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};