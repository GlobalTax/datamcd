import React from 'react';
import { RestaurantRedirect } from './RestaurantRedirect';

/**
 * Mapeo de rutas legacy a secciones de restaurante
 */
const LEGACY_ROUTE_MAPPING = {
  '/dashboard': 'hub',
  '/restaurant': 'hub',
  '/employees': 'staff',
  '/annual-budget': 'budget',
  '/profit-loss': 'profit-loss',
  '/incidents': 'incidents',
  '/analysis': 'analytics',
  '/biloop': 'integrations',
  '/orquest': 'integrations',
} as const;

/**
 * Componente para redirigir desde /dashboard a la nueva estructura
 */
export const DashboardRedirect: React.FC = () => (
  <RestaurantRedirect 
    section="hub" 
    message="Redirigiendo al panel principal del restaurante..." 
  />
);

/**
 * Componente para redirigir desde /restaurant a la nueva estructura
 */
export const RestaurantListRedirect: React.FC = () => (
  <RestaurantRedirect 
    section="hub" 
    message="Redirigiendo al panel del restaurante..." 
  />
);

/**
 * Componente para redirigir desde /employees a la nueva estructura
 */
export const EmployeesRedirect: React.FC = () => (
  <RestaurantRedirect 
    section="staff" 
    message="Redirigiendo a gestión de personal..." 
  />
);

/**
 * Componente para redirigir desde /annual-budget a la nueva estructura
 */
export const BudgetRedirect: React.FC = () => (
  <RestaurantRedirect 
    section="budget" 
    message="Redirigiendo a presupuestos..." 
  />
);

/**
 * Componente para redirigir desde /profit-loss a la nueva estructura
 */
export const ProfitLossRedirect: React.FC = () => (
  <RestaurantRedirect 
    section="profit-loss" 
    message="Redirigiendo a estados financieros..." 
  />
);

/**
 * Componente para redirigir desde /incidents a la nueva estructura
 */
export const IncidentsRedirect: React.FC = () => (
  <RestaurantRedirect 
    section="incidents" 
    message="Redirigiendo a gestión de incidencias..." 
  />
);

/**
 * Componente para redirigir desde /analysis a la nueva estructura
 */
export const AnalysisRedirect: React.FC = () => (
  <RestaurantRedirect 
    section="analytics" 
    message="Redirigiendo a análisis..." 
  />
);

/**
 * Componente para redirigir desde /biloop y /orquest a integraciones
 */
export const IntegrationsRedirect: React.FC = () => (
  <RestaurantRedirect 
    section="integrations" 
    message="Redirigiendo a integraciones..." 
  />
);