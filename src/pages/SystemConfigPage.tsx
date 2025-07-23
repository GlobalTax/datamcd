
import React from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Shield, Database, Users, Bell } from 'lucide-react';

const SystemConfigPage: React.FC = () => {
  return (
    <StandardLayout
      title="Configuración del Sistema"
      description="Configuración avanzada y administración del sistema"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">Sesiones activas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Base de Datos</CardTitle>
              <Database className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.7%</div>
              <p className="text-xs text-muted-foreground">Disponibilidad</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Seguridad</CardTitle>
              <Shield className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Activa</div>
              <p className="text-xs text-muted-foreground">Todos los sistemas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <Bell className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Configuración General</span>
                <Settings className="w-5 h-5 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Configuración de Autenticación', status: 'configured' },
                  { name: 'Políticas de Seguridad', status: 'configured' },
                  { name: 'Configuración de Backup', status: 'configured' },
                  { name: 'Configuración de Logging', status: 'configured' },
                  { name: 'Configuración de Notificaciones', status: 'pending' },
                ].map((config) => (
                  <div key={config.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{config.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={config.status === 'configured' ? 'default' : 'outline'}>
                        {config.status === 'configured' ? 'Configurado' : 'Pendiente'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Gestión de Usuarios</span>
                <Users className="w-5 h-5 text-green-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Administradores</span>
                  <Badge variant="outline">5 usuarios</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Asesores</span>
                  <Badge variant="outline">12 usuarios</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Franquiciados</span>
                  <Badge variant="outline">110 usuarios</Badge>
                </div>
                
                <Button className="w-full">
                  Gestionar Usuarios
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StandardLayout>
  );
};

export default SystemConfigPage;
