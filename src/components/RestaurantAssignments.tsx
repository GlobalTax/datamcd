
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Building, MapPin, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RestaurantAssignment {
  id: string;
  franchisee_id: string;
  base_restaurant_id: string;
  status: string;
  assigned_at: string;
  base_restaurant: {
    id: string;
    site_number: string;
    restaurant_name: string;
    address: string;
    city: string;
    state: string;
    restaurant_type: string;
  };
  franchisee: {
    id: string;
    franchisee_name: string;
    company_name: string;
  };
}

export const RestaurantAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<RestaurantAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('franchisee_restaurants')
        .select(`
          *,
          base_restaurant:base_restaurants(*),
          franchisee:franchisees(*)
        `)
        .order('assigned_at', { ascending: false });

      if (error) {
        console.error('Error fetching assignments:', error);
        toast.error('Error al cargar las asignaciones');
        return;
      }

      setAssignments(data as RestaurantAssignment[]);
    } catch (err) {
      console.error('Error in fetchAssignments:', err);
      toast.error('Error al cargar las asignaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta asignación?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('franchisee_restaurants')
        .delete()
        .eq('id', assignmentId);

      if (error) {
        toast.error('Error al eliminar la asignación');
        return;
      }

      toast.success('Asignación eliminada correctamente');
      fetchAssignments();
    } catch (err) {
      console.error('Error removing assignment:', err);
      toast.error('Error al eliminar la asignación');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Cargando asignaciones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Asignaciones de Restaurantes</h2>
        <Badge variant="outline" className="text-sm">
          {assignments.length} asignaciones activas
        </Badge>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Building className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No hay asignaciones de restaurantes</p>
            <p className="text-sm text-gray-400 mt-2">
              Asigna restaurantes a franquiciados desde la pestaña de Restaurantes
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg flex items-center">
                    <Building className="w-5 h-5 mr-2 text-red-600" />
                    {assignment.base_restaurant.restaurant_name}
                  </span>
                  <Badge className={getStatusColor(assignment.status)}>
                    {getStatusLabel(assignment.status)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Site:</span>
                    <span className="text-sm">{assignment.base_restaurant.site_number}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      {assignment.base_restaurant.city}, {assignment.base_restaurant.state}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      {assignment.franchisee.franchisee_name}
                    </span>
                  </div>
                  
                  {assignment.franchisee.company_name && (
                    <div className="text-sm text-gray-600">
                      {assignment.franchisee.company_name}
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      Asignado: {new Date(assignment.assigned_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveAssignment(assignment.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar Asignación
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
