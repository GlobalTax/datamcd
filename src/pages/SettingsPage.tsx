
import React from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, Bell, Shield, Database } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <StandardLayout
      title="Configuración"
      description="Configura tu perfil y preferencias del sistema"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Perfil de Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input 
                  id="fullName" 
                  defaultValue={user?.full_name || ''} 
                  placeholder="Tu nombre completo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  defaultValue={user?.email || ''} 
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input 
                  id="phone" 
                  defaultValue={user?.phone || ''} 
                  placeholder="Tu número de teléfono"
                />
              </div>
              
              <Button className="w-full">
                Actualizar Perfil
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibir alertas por correo electrónico
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de Incidencias</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar sobre nuevas incidencias
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reportes Semanales</Label>
                  <p className="text-sm text-muted-foreground">
                    Resumen semanal de métricas
                  </p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de Presupuesto</Label>
                  <p className="text-sm text-muted-foreground">
                    Avisos sobre desviaciones presupuestarias
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                <Input 
                  id="currentPassword" 
                  type="password"
                  placeholder="Contraseña actual"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input 
                  id="newPassword" 
                  type="password"
                  placeholder="Nueva contraseña"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input 
                  id="confirmPassword" 
                  type="password"
                  placeholder="Confirmar nueva contraseña"
                />
              </div>
              
              <Button className="w-full">
                Cambiar Contraseña
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Preferencias del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium">Interfaz</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Oscuro</Label>
                    <p className="text-sm text-muted-foreground">
                      Activar tema oscuro
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Navegación Compacta</Label>
                    <p className="text-sm text-muted-foreground">
                      Reducir espacio en la navegación
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Datos</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-guardar</Label>
                    <p className="text-sm text-muted-foreground">
                      Guardar cambios automáticamente
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sincronización</Label>
                    <p className="text-sm text-muted-foreground">
                      Sincronizar datos en tiempo real
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardLayout>
  );
};

export default SettingsPage;
