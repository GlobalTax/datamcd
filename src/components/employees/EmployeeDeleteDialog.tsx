import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Employee } from '@/types/employee';

interface EmployeeDeleteDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (employeeId: string) => Promise<boolean>;
}

export const EmployeeDeleteDialog: React.FC<EmployeeDeleteDialogProps> = ({
  employee,
  open,
  onOpenChange,
  onDelete
}) => {
  const handleDelete = async () => {
    if (!employee) return;
    
    const success = await onDelete(employee.id);
    if (success) {
      onOpenChange(false);
    }
  };

  if (!employee) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar empleado?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de eliminar a <strong>{employee.first_name} {employee.last_name}</strong>.
            Esta acción no se puede deshacer y eliminará todos los datos relacionados 
            (horarios, nóminas, solicitudes de vacaciones, etc.).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};