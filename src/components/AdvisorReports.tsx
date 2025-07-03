
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Building, Users, MapPin, TrendingUp, Calendar, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReportData {
  totalRestaurants: number;
  totalFranchisees: number;
  totalAssignments: number;
  unassignedRestaurants: number;
  franchiseesByCity: { city: string; count: number }[];
  restaurantsByType: { type: string; count: number; color: string }[];
  assignmentsByMonth: { month: string; count: number }[];
}

const COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#65a30d', '#059669', '#0891b2', '#2563eb', '#7c3aed'];

export const AdvisorReports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData>({
    totalRestaurants: 0,
    totalFranchisees: 0,
    totalAssignments: 0,
    unassignedRestaurants: 0,
    franchiseesByCity: [],
    restaurantsByType: [],
    assignmentsByMonth: []
  });
  const [loading, setLoading] = useState(true);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      // Obtener datos de restaurantes
      const { data: restaurants, error: restaurantsError } = await supabase
        .from('base_restaurants')
        .select('*');

      if (restaurantsError) {
        console.error('Error fetching restaurants:', restaurantsError);
        return;
      }

      // Obtener datos de franquiciados
      const { data: franchisees, error: franchiseesError } = await supabase
        .from('franchisees')
        .select('*');

      if (franchiseesError) {
        console.error('Error fetching franchisees:', franchiseesError);
        return;
      }

      // Obtener datos de asignaciones
      const { data: assignments, error: assignmentsError } = await supabase
        .from('franchisee_restaurants')
        .select('*, base_restaurant:base_restaurants(*)');

      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError);
        return;
      }

      // Procesar datos para reportes
      const totalRestaurants = restaurants?.length || 0;
      const totalFranchisees = franchisees?.length || 0;
      const totalAssignments = assignments?.length || 0;
      const unassignedRestaurants = totalRestaurants - totalAssignments;

      // Franquiciados por ciudad
      const cityCount = franchisees?.reduce((acc, franchisee) => {
        const city = franchisee.city || 'Sin especificar';
        acc[city] = (acc[city] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const franchiseesByCity = Object.entries(cityCount).map(([city, count]) => ({
        city,
        count
      }));

      // Restaurantes por tipo
      const typeCount = restaurants?.reduce((acc, restaurant) => {
        const type = restaurant.restaurant_type || 'traditional';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const restaurantsByType = Object.entries(typeCount).map(([type, count], index) => ({
        type: type === 'traditional' ? 'Tradicional' : 
              type === 'mccafe' ? 'McCafé' :
              type === 'drive_thru' ? 'Drive Thru' :
              type === 'express' ? 'Express' : type,
        count,
        color: COLORS[index % COLORS.length]
      }));

      // Asignaciones por mes (últimos 6 meses)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const monthlyAssignments = assignments?.filter(assignment => 
        new Date(assignment.assigned_at) >= sixMonthsAgo
      ).reduce((acc, assignment) => {
        const month = new Date(assignment.assigned_at).toLocaleDateString('es-ES', { 
          month: 'short', 
          year: 'numeric' 
        });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const assignmentsByMonth = Object.entries(monthlyAssignments).map(([month, count]) => ({
        month,
        count
      }));

      setReportData({
        totalRestaurants,
        totalFranchisees,
        totalAssignments,
        unassignedRestaurants,
        franchiseesByCity,
        restaurantsByType,
        assignmentsByMonth
      });

    } catch (err) {
      console.error('Error in fetchReportData:', err);
      toast.error('Error al cargar los datos de reporte');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Cargando reportes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Reportes y Análisis</h2>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Restaurantes</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{reportData.totalRestaurants}</div>
            <p className="text-xs text-muted-foreground">
              {reportData.unassignedRestaurants} sin asignar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Franquiciados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{reportData.totalFranchisees}</div>
            <p className="text-xs text-muted-foreground">Registrados en el sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asignaciones Activas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{reportData.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">
              {((reportData.totalAssignments / reportData.totalRestaurants) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Ocupación</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {reportData.totalRestaurants > 0 
                ? ((reportData.totalAssignments / reportData.totalRestaurants) * 100).toFixed(1) 
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Restaurantes asignados</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Franquiciados por ciudad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Franquiciados por Ciudad
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reportData.franchiseesByCity.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.franchiseesByCity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Restaurantes por tipo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Restaurantes por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reportData.restaurantsByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.restaurantsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {reportData.restaurantsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Asignaciones por mes */}
      {reportData.assignmentsByMonth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Asignaciones por Mes (Últimos 6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.assignmentsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#059669" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
