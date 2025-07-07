import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Plus,
  Search,
  Settings,
} from 'lucide-react';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AlertRule {
  id: string;
  alert_type: 'performance' | 'financial' | 'operational' | 'compliance';
  title: string;
  description?: string;
  conditions: any;
  is_active: boolean;
  created_at: string;
}

interface AlertInstance {
  id: string;
  alert_id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  data?: any;
  is_acknowledged: boolean;
  created_at: string;
  alert?: AlertRule;
}

export const NotificationCenter: React.FC = () => {
  const { user } = useUnifiedAuth();
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [alertInstances, setAlertInstances] = useState<AlertInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [showCreateRule, setShowCreateRule] = useState(false);

  const [newRule, setNewRule] = useState({
    alert_type: 'performance' as const,
    title: '',
    description: '',
    conditions: {}
  });

  const fetchAlertRules = async () => {
    try {
      const { data, error } = await supabase
        .from('advisor_alerts')
        .select('*')
        .eq('advisor_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlertRules((data || []).map(item => ({
        ...item,
        alert_type: item.alert_type as 'performance' | 'financial' | 'operational' | 'compliance'
      })));
    } catch (error) {
      console.error('Error fetching alert rules:', error);
      toast.error('Error al cargar reglas de alerta');
    }
  };

  const fetchAlertInstances = async () => {
    try {
      // Simular datos de alerta hasta que se implementen los triggers
      const mockAlerts: AlertInstance[] = [
        {
          id: '1',
          alert_id: '1',
          severity: 'high',
          message: 'Ventas por debajo del objetivo mensual en Restaurante Madrid Centro',
          is_acknowledged: false,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          alert: {
            id: '1',
            alert_type: 'performance',
            title: 'Bajo rendimiento de ventas',
            conditions: {},
            is_active: true,
            created_at: new Date().toISOString()
          }
        },
        {
          id: '2',
          alert_id: '2',
          severity: 'medium',
          message: 'Costos de operación superiores al presupuesto en Barcelona Este',
          is_acknowledged: false,
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          alert: {
            id: '2',
            alert_type: 'financial',
            title: 'Exceso en costos operativos',
            conditions: {},
            is_active: true,
            created_at: new Date().toISOString()
          }
        }
      ];
      setAlertInstances(mockAlerts);
    } catch (error) {
      console.error('Error fetching alert instances:', error);
      toast.error('Error al cargar alertas');
    }
  };

  const createAlertRule = async () => {
    try {
      if (!newRule.title.trim()) {
        toast.error('El título es requerido');
        return;
      }

      const { error } = await supabase
        .from('advisor_alerts')
        .insert({
          advisor_id: user?.id,
          alert_type: newRule.alert_type,
          title: newRule.title,
          description: newRule.description,
          conditions: newRule.conditions,
          is_active: true
        });

      if (error) throw error;

      toast.success('Regla de alerta creada exitosamente');
      setShowCreateRule(false);
      setNewRule({
        alert_type: 'performance',
        title: '',
        description: '',
        conditions: {}
      });
      fetchAlertRules();
    } catch (error) {
      console.error('Error creating alert rule:', error);
      toast.error('Error al crear regla de alerta');
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    // Simular acknowledgment local hasta implementar la funcionalidad completa
    setAlertInstances(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, is_acknowledged: true }
          : alert
      )
    );
    toast.success('Alerta marcada como revisada');
  };

  const toggleAlertRule = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('advisor_alerts')
        .update({ is_active: !isActive })
        .eq('id', ruleId);

      if (error) throw error;

      toast.success(`Regla ${!isActive ? 'activada' : 'desactivada'} exitosamente`);
      fetchAlertRules();
    } catch (error) {
      console.error('Error toggling alert rule:', error);
      toast.error('Error al cambiar estado de la regla');
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchAlertRules(), fetchAlertInstances()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredAlerts = alertInstances.filter(alert => {
    const matchesSearch = alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.alert?.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'medium': return <Bell className="w-4 h-4 text-yellow-600" />;
      case 'low': return <Bell className="w-4 h-4 text-blue-600" />;
      default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    return 'Hace menos de 1 hora';
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="alerts" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="alerts">Alertas Activas</TabsTrigger>
            <TabsTrigger value="rules">Reglas de Alerta</TabsTrigger>
          </TabsList>
          
          <Button onClick={() => setShowCreateRule(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Regla
          </Button>
        </div>

        <TabsContent value="alerts" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar alertas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Severidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las severidades</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="low">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Alertas */}
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className={`${alert.is_acknowledged ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{alert.alert?.title || 'Alerta del Sistema'}</h4>
                          <Badge className={getSeverityColor(alert.severity)} variant="outline">
                            {alert.severity}
                          </Badge>
                          {alert.is_acknowledged && (
                            <Badge className="bg-green-100 text-green-800" variant="outline">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Revisada
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">{formatTimeAgo(alert.created_at)}</p>
                      </div>
                    </div>
                    
                    {!alert.is_acknowledged && (
                      <Button
                        onClick={() => acknowledgeAlert(alert.id)}
                        variant="outline"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Marcar como Revisada
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredAlerts.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay alertas</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || severityFilter !== 'all' 
                      ? 'No se encontraron alertas con los filtros aplicados'
                      : 'No hay alertas activas en este momento'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="grid gap-4">
            {alertRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Settings className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{rule.title}</h4>
                          <Badge variant="outline" className="capitalize">
                            {rule.alert_type}
                          </Badge>
                          <Badge className={rule.is_active ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"} variant="outline">
                            {rule.is_active ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </div>
                        {rule.description && (
                          <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Creada el {new Date(rule.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => toggleAlertRule(rule.id, rule.is_active)}
                      variant="outline"
                      size="sm"
                    >
                      {rule.is_active ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {alertRules.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay reglas de alerta</h3>
                  <p className="text-muted-foreground mb-4">
                    Crea reglas personalizadas para recibir alertas automáticas
                  </p>
                  <Button onClick={() => setShowCreateRule(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primera Regla
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal para crear nueva regla */}
      {showCreateRule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Nueva Regla de Alerta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tipo de Alerta</label>
                <Select value={newRule.alert_type} onValueChange={(value: any) => setNewRule({...newRule, alert_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">Rendimiento</SelectItem>
                    <SelectItem value="financial">Financiero</SelectItem>
                    <SelectItem value="operational">Operacional</SelectItem>
                    <SelectItem value="compliance">Cumplimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  value={newRule.title}
                  onChange={(e) => setNewRule({...newRule, title: e.target.value})}
                  placeholder="Título de la regla"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  value={newRule.description}
                  onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                  placeholder="Descripción opcional"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={createAlertRule} className="flex-1">
                  Crear Regla
                </Button>
                <Button onClick={() => setShowCreateRule(false)} variant="outline">
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};