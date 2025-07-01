import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useBaseRestaurants } from '@/hooks/useBaseRestaurants';
import { showSuccess, showError } from '@/utils/notifications';

interface BaseRestaurant {
  id: string;
  restaurant_name: string;
  site_number: string;
  address: string;
  city: string;
  opening_date: string;
  restaurant_type: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

const BaseRestaurantsTable = () => {
  const { restaurants, loading, updateRestaurant, deleteRestaurant } = useBaseRestaurants();
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleUpdate = async (id: string, data: any) => {
    try {
      await updateRestaurant(id, data);
      setEditingId(null);
      showSuccess('Restaurante actualizado correctamente');
    } catch (error) {
      showError('Error al actualizar el restaurante');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRestaurant(id);
      showSuccess('Restaurante eliminado correctamente');
    } catch (error) {
      showError('Error al eliminar el restaurante');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Restaurantes Base</CardTitle>
        </CardHeader>
        <CardContent>
          Cargando restaurantes...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Restaurantes Base</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Lista de restaurantes base.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Número de Sitio</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {restaurants.map((restaurant) => (
              <TableRow key={restaurant.id}>
                <TableCell className="font-medium">{restaurant.site_number}</TableCell>
                <TableCell>
                  {editingId === restaurant.id ? (
                    <Input
                      defaultValue={restaurant.restaurant_name}
                      onBlur={(e) => handleUpdate(restaurant.id, { restaurant_name: e.target.value })}
                    />
                  ) : (
                    restaurant.restaurant_name
                  )}
                </TableCell>
                <TableCell>
                  {editingId === restaurant.id ? (
                    <Input
                      defaultValue={restaurant.address}
                      onBlur={(e) => handleUpdate(restaurant.id, { address: e.target.value })}
                    />
                  ) : (
                    restaurant.address
                  )}
                </TableCell>
                <TableCell>
                  {editingId === restaurant.id ? (
                    <Input
                      defaultValue={restaurant.city}
                      onBlur={(e) => handleUpdate(restaurant.id, { city: e.target.value })}
                    />
                  ) : (
                    restaurant.city
                  )}
                </TableCell>
                 <TableCell>
                  {editingId === restaurant.id ? (
                    <Input
                      defaultValue={restaurant.restaurant_type}
                      onBlur={(e) => handleUpdate(restaurant.id, { restaurant_type: e.target.value })}
                    />
                  ) : (
                    restaurant.restaurant_type
                  )}
                </TableCell>
                <TableCell>
                  {editingId === restaurant.id ? (
                    <Input
                      defaultValue={restaurant.status}
                      onBlur={(e) => handleUpdate(restaurant.id, { status: e.target.value })}
                    />
                  ) : (
                    restaurant.status
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {editingId === restaurant.id ? (
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                      Cancelar
                    </Button>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(restaurant.id)}>
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(restaurant.id)}>
                        Eliminar
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BaseRestaurantsTable;
