// Exportaciones centralizadas de hooks de datos
export { useRestaurants, useRestaurant } from './useRestaurants';
export { useFranchisees, useFranchisee } from './useFranchisees';
export { useEmployees, useEmployee } from './useEmployees';

// Re-export de hooks existentes para compatibilidad
export { useBudgets } from './useBudgets';
export { useOrquest } from './useOrquest';

// Nuevos hooks especializados refactorizados
export { useFranchiseeData, useFranchiseeById } from './useFranchiseeData';
export { useFranchiseeOperations } from './useFranchiseeOperations';
export { useRestaurantData, useRestaurantDataLegacy } from './useRestaurantData';
export { useBaseRestaurants } from './useBaseRestaurants';