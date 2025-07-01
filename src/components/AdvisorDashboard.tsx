import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Store, 
  TrendingUp, 
  FileText, 
  Settings, 
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AdvisorStats {
  totalFranchisees: number;
  activeFranchisees: number;
  totalRestaurants: number;
  pendingReviews: number;
  recentActivity: number;
}

export const AdvisorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats] = useState<AdvisorStats>({
    totalFranchisees: 24,
    activeFranchisees: 22,
    totalRestaurants: 67,
    pendingReviews: 8,
    recentActivity: 15
  });

  if (!user || !['asesor', 'admin', 'superadmin'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
          <p className="text-gray-600 mt-2">No tienes permisos para acceder al panel de asesor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Asesor</h1>
            <p className="text-gray-600 mt-1">Gestión integral de franquiciados y restaurantes</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm">
              {user.full_name || user.email}
            </Badge>
            <Button size="sm" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Franquiciados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFranchisees}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Franquiciados Activos</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeFranchisees}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Restaurantes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRestaurants}</p>
              </div>
              <Store className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revisiones Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingReviews}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actividad Reciente</p>
                <p className="text-2xl font-bold text-purple-600">{stats.recentActivity}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="franchisees">Franquiciados</TabsTrigger>
          <TabsTrigger value="restaurants">Restaurantes</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: 'Nuevo restaurante agregado', franchisee: 'Carlos García', time: '2h' },
                    { action: 'Presupuesto actualizado', franchisee: 'María López', time: '4h' },
                    { action: 'Revisión de P&L completada', franchisee: 'Juan Pérez', time: '6h' },
                    { action: 'Nuevo franquiciado registrado', franchisee: 'Ana Martínez', time: '1d' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.franchisee}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{activity.time}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-20 flex-col">
                    <Users className="h-6 w-6 mb-2" />
                    <span className="text-sm">Nuevo Franquiciado</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Store className="h-6 w-6 mb-2" />
                    <span className="text-sm">Agregar Restaurante</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <FileText className="h-6 w-6 mb-2" />
                    <span className="text-sm">Generar Reporte</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Upload className="h-6 w-6 mb-2" />
                    <span className="text-sm">Importar Datos</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Franchisees Tab */}
        <TabsContent value="franchisees" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gestión de Franquiciados</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar franquiciado..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Franquiciado
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Franquiciado</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Restaurantes</th>
                      <th className="text-left py-3 px-4">Estado</th>
                      <th className="text-left py-3 px-4">Última Actividad</th>
                      <th className="text-left py-3 px-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Carlos García', email: 'carlos@mcdonalds.com', restaurants: 3, status: 'Activo', lastActivity: '2h' },
                      { name: 'María López', email: 'maria@mcdonalds.com', restaurants: 2, status: 'Activo', lastActivity: '4h' },
                      { name: 'Juan Pérez', email: 'juan@mcdonalds.com', restaurants: 1, status: 'Pendiente', lastActivity: '1d' }
                    ].map((franchisee, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{franchisee.name}</td>
                        <td className="py-3 px-4 text-gray-600">{franchisee.email}</td>
                        <td className="py-3 px-4">{franchisee.restaurants}</td>
                        <td className="py-3 px-4">
                          <Badge variant={franchisee.status === 'Activo' ? 'default' : 'secondary'}>
                            {franchisee.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{franchisee.lastActivity}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        
        <TabsContent value="restaurants" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gestión de Restaurantes</CardTitle>
                <div className="flex items-center gap-3">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Restaurante
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'McDonald\'s Centro', address: 'Calle Principal 123', franchisee: 'Carlos García', status: 'Activo' },
                  { name: 'McDonald\'s Norte', address: 'Avenida Norte 456', franchisee: 'María López', status: 'Activo' },
                  { name: 'McDonald\'s Sur', address: 'Plaza Sur 789', franchisee: 'Juan Pérez', status: 'En Construcción' }
                ].map((restaurant, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{restaurant.name}</h3>
                          <p className="text-sm text-gray-600">{restaurant.address}</p>
                        </div>
                        <Badge variant={restaurant.status === 'Activo' ? 'default' : 'secondary'}>
                          {restaurant.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">Franquiciado: {restaurant.franchisee}</p>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reportes y Análisis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-32 flex-col">
                  <TrendingUp className="h-8 w-8 mb-2" />
                  <span>Reporte de Ventas</span>
                  <span className="text-xs text-gray-500">Análisis mensual</span>
                </Button>
                <Button variant="outline" className="h-32 flex-col">
                  <Store className="h-8 w-8 mb-2" />
                  <span>Rendimiento por Restaurante</span>
                  <span className="text-xs text-gray-500">Comparativas</span>
                </Button>
                <Button variant="outline" className="h-32 flex-col">
                  <Users className="h-8 w-8 mb-2" />
                  <span>Reporte de Franquiciados</span>
                  <span className="text-xs text-gray-500">Estado general</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gestión de Documentos</CardTitle>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Documento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Manual de Operaciones.pdf', type: 'Manual', size: '2.5 MB', date: '2024-01-15' },
                  { name: 'Contrato Tipo.docx', type: 'Contrato', size: '1.2 MB', date: '2024-01-10' },
                  { name: 'Guía de Seguridad.pdf', type: 'Guía', size: '3.1 MB', date: '2024-01-05' }
                ].map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-blue-500" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-500">{doc.type} • {doc.size} • {doc.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Notificaciones</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      Notificaciones por email
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      Alertas de rendimiento
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Reportes automáticos
                    </label>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Preferencias</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      Modo oscuro
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      Auto-guardado
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvisorDashboard;
