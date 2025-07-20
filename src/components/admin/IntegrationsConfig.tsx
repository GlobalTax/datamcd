import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  RefreshCw, 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  Plus,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Integration {
  id: string;
  integration_type: string;
  config_name: string;
  api_endpoint?: string;
  is_active: boolean;
  last_sync?: string;
  configuration: Record<string, any>;
}

export const IntegrationsConfig: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    integration_type: '',
    config_name: '',
    api_endpoint: '',
    is_active: true,
    configuration: {}
  });

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('integration_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations(data?.map(integration => ({
        ...integration,
        configuration: integration.configuration as Record<string, any>
      })) || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast.error('Error al cargar integraciones');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIntegration = async () => {
    try {
      if (editingIntegration) {
        // Update existing integration
        const { error } = await supabase
          .from('integration_configs')
          .update({
            config_name: formData.config_name,
            api_endpoint: formData.api_endpoint,
            is_active: formData.is_active,
            configuration: formData.configuration
          })
          .eq('id', editingIntegration.id);

        if (error) throw error;
        toast.success('Integración actualizada exitosamente');
      } else {
        // Create new integration
        const { error } = await supabase
          .from('integration_configs')
          .insert([{
            integration_type: formData.integration_type,
            config_name: formData.config_name,
            api_endpoint: formData.api_endpoint,
            is_active: formData.is_active,
            configuration: formData.configuration,
            advisor_id: 'system' // For system integrations
          }]);

        if (error) throw error;
        toast.success('Integración creada exitosamente');
      }

      resetForm();
      fetchIntegrations();
    } catch (error) {
      console.error('Error saving integration:', error);
      toast.error('Error al guardar integración');
    }
  };

  const handleDeleteIntegration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('integration_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Integración eliminada exitosamente');
      fetchIntegrations();
    } catch (error) {
      console.error('Error deleting integration:', error);
      toast.error('Error al eliminar integración');
    }
  };

  const resetForm = () => {
    setFormData({
      integration_type: '',
      config_name: '',
      api_endpoint: '',
      is_active: true,
      configuration: {}
    });
    setEditingIntegration(null);
    setShowAddForm(false);
  };

  const getIntegrationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'orquest':
        return '⏰';
      case 'payroll':
        return '💰';
      case 'pos':
        return '🛒';
      default:
        return '🔌';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Cargando integraciones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Integraciones</h2>
          <p className="text-muted-foreground">Configura y administra las integraciones del sistema</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nueva Integración
        </Button>
      </div>

      {/* Integration Cards */}
      <div className="grid gap-4">
        {integrations.map((integration) => (
          <Card key={integration.id} className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getIntegrationIcon(integration.integration_type)}</span>
                <div>
                  <CardTitle className="text-lg">{integration.config_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{integration.integration_type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={integration.is_active ? "default" : "secondary"}>
                  {integration.is_active ? 'Activa' : 'Inactiva'}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingIntegration(integration);
                    setFormData({
                      integration_type: integration.integration_type,
                      config_name: integration.config_name,
                      api_endpoint: integration.api_endpoint || '',
                      is_active: integration.is_active,
                      configuration: integration.configuration
                    });
                    setShowAddForm(true);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteIntegration(integration.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Endpoint</Label>
                  <p className="text-muted-foreground break-all">{integration.api_endpoint || 'No configurado'}</p>
                </div>
                <div>
                  <Label className="font-medium">Última Sincronización</Label>
                  <p className="text-muted-foreground">
                    {integration.last_sync ? 
                      new Date(integration.last_sync).toLocaleString() : 
                      'Nunca'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <Card className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingIntegration ? 'Editar Integración' : 'Nueva Integración'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="integration_type">Tipo</Label>
                    <Input
                      id="integration_type"
                      value={formData.integration_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, integration_type: e.target.value }))}
                      placeholder="orquest, payroll, pos..."
                      disabled={!!editingIntegration}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="config_name">Nombre</Label>
                    <Input
                      id="config_name"
                      value={formData.config_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, config_name: e.target.value }))}
                      placeholder="Nombre descriptivo"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="api_endpoint">API Endpoint</Label>
                  <Input
                    id="api_endpoint"
                    value={formData.api_endpoint}
                    onChange={(e) => setFormData(prev => ({ ...prev, api_endpoint: e.target.value }))}
                    placeholder="https://api.ejemplo.com"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Integración activa</Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveIntegration}>
                    {editingIntegration ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </Card>
      )}
    </div>
  );
};