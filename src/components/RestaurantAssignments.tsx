
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/notifications';

interface RestaurantAssignment {
  id: string;
  franchisee_id: string;
  base_restaurant_id: string;
  base_restaurant: {
    id: string;
    restaurant_name: string;
  };
}

const RestaurantAssignments = ({ franchiseeId }: { franchiseeId: string }) => {
  const [assignments, setAssignments] = useState<RestaurantAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('franchisee_restaurants')
        .select(`
          *,
          base_restaurant:base_restaurants (*)
        `)
        .eq('franchisee_id', franchiseeId);

      if (error) throw error;
      
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      showError('Error al cargar las asignaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('franchisee_restaurants')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
      
      showSuccess('Asignación eliminada correctamente');
      await fetchAssignments();
    } catch (error) {
      console.error('Error removing assignment:', error);
      showError('Error al eliminar la asignación');
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [franchiseeId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asignaciones de Restaurantes</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Cargando asignaciones...</p>
        ) : assignments.length === 0 ? (
          <p>No hay restaurantes asignados a este franquiciado.</p>
        ) : (
          <ul>
            {assignments.map((assignment) => (
              <li key={assignment.id} className="flex items-center justify-between py-2 border-b">
                <span>{assignment.base_restaurant?.restaurant_name}</span>
                <Button 
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveAssignment(assignment.id)}
                >
                  Eliminar
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default RestaurantAssignments;
