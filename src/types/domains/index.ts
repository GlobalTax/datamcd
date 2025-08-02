// === ÍNDICE PRINCIPAL DE TIPOS POR DOMINIOS ===
// Exportaciones centralizadas organizadas por contexto de negocio

// Dominio de Autenticación
export * from './auth';

// Dominio de Franquiciados
export * from './franchisee';

// Dominio de Restaurantes
export * from './restaurant';

// Dominio de Empleados
export * from './employee';

// Dominio de Presupuestos
export * from './budget';

// Dominio Financiero
export * from './financial';

// Dominio de Incidencias
export * from './incident';

// Dominio de Asesores
export * from './advisor';

// Dominio de Integraciones
export * from './integration';

// Dominio Común/Infraestructura
export * from './common';

// === RE-EXPORTS PARA COMPATIBILIDAD ===
// Mantener compatibilidad con imports existentes

// Tipos de autenticación (legacy)
export type {
  User,
  AuthContextType
} from './auth';

export type { Franchisee, FranchiseeStaff } from './franchisee';
export type { Restaurant } from './restaurant';

// Tipos de restaurantes (legacy)
export type {
  BaseRestaurant,
  FranchiseeRestaurant
} from './restaurant';

// Tipos de empleados (legacy)
export type {
  Employee
} from './employee';

// Tipos de presupuestos (legacy)
export type {
  BudgetData,
  ActualData,
  BudgetDataHookReturn
} from './budget';

// Tipos financieros (legacy)
export type {
  ProfitLossFormData,
  YearlyData,
  DetailedYearlyData,
  ValuationInputs,
  ProjectionData,
  RestaurantValuation as FinancialRestaurantValuation
} from './financial';

// Tipos de incidencias (legacy)
export type {
  Incident,
  NewIncident,
  IncidentFilters,
  AdvancedIncidentFilters
} from './incident';

// Tipos de integraciones (legacy)
export type {
  OrquestService,
  OrquestConfig,
  OrquestMeasure
} from './integration';

// Tipos comunes (legacy)
export type {
  LogLevel,
  LogContext,
  LogEntry,
  ServiceResponse,
  PaginatedResponse,
  Contact,
  ContactType
} from './common';