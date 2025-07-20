import React, { useState } from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertBanner } from '@/components/ui/alert-banner';
import { KpiChip } from '@/components/ui/kpi-chip';
import { IntegrationsConfig } from './IntegrationsConfig';
import { UserManagement } from './UserManagement';
import { AlertsConfig } from './AlertsConfig';
import { AuditLogs } from './AuditLogs';
import { 
  Settings, 
  Users, 
  Shield, 
  Activity,
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

export const SystemConfigPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('integrations');

  // Mock data para el dashboard de administración
  const systemStats = {
    totalUsers: 156,
    activeIntegrations: 3,
    pendingAlerts: 8,
    systemHealth: 'healthy'
  };

  return (
    <StandardLayout
      title="Configuración del Sistema"
      description="Panel de administración para SysAdmins"
    >
      <div className="space-y-6">
        {/* Banner de información */}
        <AlertBanner
          variant="info"
          title="Panel de Administración"
        >
          Solo los administradores del sistema pueden acceder a estas configuraciones.
        </AlertBanner>

        {/* KPIs del Sistema */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KpiChip
            value={systemStats.totalUsers.toString()}
            label="Usuarios Totales"
            trend="up"
          />
          <KpiChip
            value={systemStats.activeIntegrations.toString()}
            label="Integraciones Activas"
            trend="neutral"
          />
          <KpiChip
            value={systemStats.pendingAlerts.toString()}
            label="Alertas Pendientes"
            trend="down"
          />
          <KpiChip
            value={systemStats.systemHealth === 'healthy' ? 'Saludable' : 'Con Issues'}
            label="Estado del Sistema"
            trend={systemStats.systemHealth === 'healthy' ? 'up' : 'down'}
          />
        </div>

        {/* Tabs de Configuración */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Integraciones
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alertas
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Auditoría
            </TabsTrigger>
          </TabsList>

          <TabsContent value="integrations" className="space-y-4">
            <IntegrationsConfig />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <UserManagement />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <AlertsConfig />
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <AuditLogs />
          </TabsContent>
        </Tabs>
      </div>
    </StandardLayout>
  );
};