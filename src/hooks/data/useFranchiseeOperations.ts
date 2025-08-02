// === HOOK ESPECIALIZADO PARA OPERACIONES DE FRANQUICIADOS ===
// Reemplaza la funcionalidad de operaciones de useFranchisees

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { franchiseeManagementService, CreateFranchiseeData, UpdateFranchiseeData } from '@/services/franchisee/FranchiseeManagementService';
import { franchiseeDataKeys } from './useFranchiseeData';
import { toast } from 'sonner';

export function useFranchiseeOperations() {
  const queryClient = useQueryClient();

  // Mutation para crear franquiciados
  const createMutation = useMutation({
    mutationFn: (data: CreateFranchiseeData & { user_id?: string }) =>
      franchiseeManagementService.createFranchisee(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: franchiseeDataKeys.all });
        toast.success('Franquiciado creado exitosamente');
      } else {
        toast.error(response.error || 'Error al crear el franquiciado');
      }
    },
    onError: (error) => {
      toast.error('Error inesperado al crear el franquiciado');
      console.error('Create franchisee error:', error);
    },
  });

  // Mutation para actualizar franquiciados
  const updateMutation = useMutation({
    mutationFn: (data: UpdateFranchiseeData) =>
      franchiseeManagementService.updateFranchisee(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: franchiseeDataKeys.all });
        toast.success('Franquiciado actualizado exitosamente');
      } else {
        toast.error(response.error || 'Error al actualizar el franquiciado');
      }
    },
    onError: (error) => {
      toast.error('Error inesperado al actualizar el franquiciado');
      console.error('Update franchisee error:', error);
    },
  });

  // Mutation para eliminar franquiciados
  const deleteMutation = useMutation({
    mutationFn: (id: string) => franchiseeManagementService.deleteFranchisee(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: franchiseeDataKeys.all });
        toast.success('Franquiciado eliminado exitosamente');
      } else {
        toast.error(response.error || 'Error al eliminar el franquiciado');
      }
    },
    onError: (error) => {
      toast.error('Error inesperado al eliminar el franquiciado');
      console.error('Delete franchisee error:', error);
    },
  });

  return {
    // Create operations
    create: createMutation.mutate,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    // Update operations
    update: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,

    // Delete operations
    delete: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,

    // Combined states
    isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    hasError: !!createMutation.error || !!updateMutation.error || !!deleteMutation.error,

    // Utils
    validateData: franchiseeManagementService.validateFranchiseeData.bind(franchiseeManagementService)
  };
}