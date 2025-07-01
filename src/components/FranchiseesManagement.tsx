
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useFranchisees, Franchisee } from '@/hooks/useFranchisees';
import { showSuccess, showError } from '@/utils/notifications';
import { CreateFranchiseeDialog } from './CreateFranchiseeDialog';
import { EditFranchiseeDialog } from './EditFranchiseeDialog';

const FranchiseesManagement = () => {
  const { franchisees, loading, createFranchisee, updateFranchisee } = useFranchisees();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedFranchisee, setSelectedFranchisee] = useState<Franchisee | null>(null);
  const [isEditingOpen, setIsEditingOpen] = useState(false);

  const handleCreateFranchisee = async (franchiseeData: Omit<Franchisee, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createFranchisee(franchiseeData);
      setIsCreating(false);
      showSuccess('Franquiciado creado correctamente');
    } catch (error) {
      showError('Error al crear el franquiciado');
    }
  };

  const handleUpdateFranchisee = async (id: string, data: Partial<Franchisee>) => {
    try {
      await updateFranchisee(id, data);
      setIsEditingOpen(false);
      setSelectedFranchisee(null);
      showSuccess('Franquiciado actualizado correctamente');
    } catch (error) {
      showError('Error al actualizar el franquiciado');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Franquiciados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button onClick={() => setIsCreating(true)}>Crear Franquiciado</Button>
        </div>

        {loading ? (
          <p>Cargando franquiciados...</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {franchisees.map((franchisee) => (
                  <TableRow key={franchisee.id}>
                    <TableCell className="font-medium">{franchisee.franchisee_name}</TableCell>
                    <TableCell>{franchisee.contact_email}</TableCell>
                    <TableCell>{franchisee.contact_phone}</TableCell>
                    <TableCell>{franchisee.city}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFranchisee(franchisee);
                          setIsEditingOpen(true);
                        }}
                      >
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <CreateFranchiseeDialog
          isOpen={isCreating}
          onOpenChange={setIsCreating}
          onCreate={handleCreateFranchisee}
        />

        <EditFranchiseeDialog
          isOpen={isEditingOpen}
          onOpenChange={setIsEditingOpen}
          franchisee={selectedFranchisee}
          onUpdate={handleUpdateFranchisee}
        />
      </CardContent>
    </Card>
  );
};

export default FranchiseesManagement;
