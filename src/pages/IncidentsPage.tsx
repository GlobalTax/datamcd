
import React from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, CheckCircle, Plus } from 'lucide-react';

const IncidentsPage: React.FC = () => {
  return (
    <StandardLayout
      title="Incidencias"
      description="Gestión de incidencias y reportes operativos"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Incidencias Abiertas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">Requieren atención</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Siendo atendidas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resueltas Hoy</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Cerradas exitosamente</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4h</div>
              <p className="text-xs text-muted-foreground">Tiempo de resolución</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Incidencias Recientes</span>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Incidencia
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  id: 'INC-001', 
                  title: 'Máquina de helados fuera de servicio',
                  restaurant: 'Madrid Centro #1',
                  priority: 'high',
                  status: 'open',
                  time: '2h ago'
                },
                { 
                  id: 'INC-002', 
                  title: 'Problema con terminal de pago',
                  restaurant: 'Madrid Centro #2',
                  priority: 'medium',
                  status: 'in-progress',
                  time: '4h ago'
                },
                { 
                  id: 'INC-003', 
                  title: 'Falta de stock en Big Mac',
                  restaurant: 'Madrid Centro #3',
                  priority: 'low',
                  status: 'resolved',
                  time: '6h ago'
                },
              ].map((incident) => (
                <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-5 h-5 ${
                      incident.priority === 'high' ? 'text-red-600' :
                      incident.priority === 'medium' ? 'text-orange-600' :
                      'text-blue-600'
                    }`} />
                    <div>
                      <p className="font-medium">{incident.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {incident.restaurant} • {incident.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      incident.status === 'open' ? 'destructive' :
                      incident.status === 'in-progress' ? 'default' :
                      'outline'
                    }>
                      {incident.status === 'open' ? 'Abierta' :
                       incident.status === 'in-progress' ? 'En Proceso' :
                       'Resuelta'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{incident.time}</span>
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardLayout>
  );
};

export default IncidentsPage;
