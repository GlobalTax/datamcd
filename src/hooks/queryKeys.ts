/**
 * Centralized query keys factory para todos los dominios
 * Sigue el patrón: [domain, 'list'|'detail', restaurantId, ...filters]
 */

// =============================================================================
// EMPLOYEES DOMAIN
// =============================================================================
export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (restaurantId: string, filters?: Record<string, any>) => 
    [...employeeKeys.lists(), restaurantId, { filters }] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
  byRestaurant: (restaurantId: string) => [...employeeKeys.all, 'restaurant', restaurantId] as const,
  payroll: (restaurantId: string, period?: string) => 
    [...employeeKeys.all, 'payroll', restaurantId, { period }] as const,
  timeTracking: (restaurantId: string, date?: string, employeeId?: string) => 
    [...employeeKeys.all, 'time-tracking', restaurantId, { date, employeeId }] as const,
  timeOff: (restaurantId: string) => 
    [...employeeKeys.all, 'time-off', restaurantId] as const,
} as const;

// =============================================================================
// PROFIT & LOSS DOMAIN
// =============================================================================
export const profitLossKeys = {
  all: ['profit-loss'] as const,
  lists: () => [...profitLossKeys.all, 'list'] as const,
  list: (restaurantId: string, year?: number) => 
    [...profitLossKeys.lists(), restaurantId, { year }] as const,
  details: () => [...profitLossKeys.all, 'detail'] as const,
  detail: (id: string) => [...profitLossKeys.details(), id] as const,
  templates: () => [...profitLossKeys.all, 'templates'] as const,
  byRestaurant: (restaurantId: string) => [...profitLossKeys.all, 'restaurant', restaurantId] as const,
  calculations: (restaurantId: string, year: number) => 
    [...profitLossKeys.all, 'calculations', restaurantId, year] as const,
} as const;

// =============================================================================
// BUDGET DOMAIN
// =============================================================================
export const budgetKeys = {
  all: ['budgets'] as const,
  lists: () => [...budgetKeys.all, 'list'] as const,
  annual: (restaurantId: string, year: number) => 
    [...budgetKeys.all, 'annual', restaurantId, year] as const,
  details: () => [...budgetKeys.all, 'detail'] as const,
  detail: (id: string) => [...budgetKeys.details(), id] as const,
  byRestaurant: (restaurantId: string) => [...budgetKeys.all, 'restaurant', restaurantId] as const,
  comparison: (restaurantId: string, year: number) => 
    [...budgetKeys.all, 'comparison', restaurantId, year] as const,
} as const;

// =============================================================================
// INCIDENTS DOMAIN
// =============================================================================
export const incidentKeys = {
  all: ['incidents'] as const,
  lists: () => [...incidentKeys.all, 'list'] as const,
  list: (restaurantId: string, filters?: Record<string, any>) => 
    [...incidentKeys.lists(), restaurantId, { filters }] as const,
  details: () => [...incidentKeys.all, 'detail'] as const,
  detail: (id: string) => [...incidentKeys.details(), id] as const,
  byRestaurant: (restaurantId: string) => [...incidentKeys.all, 'restaurant', restaurantId] as const,
  stats: (restaurantId: string) => [...incidentKeys.all, 'stats', restaurantId] as const,
  comments: (incidentId: string) => [...incidentKeys.all, 'comments', incidentId] as const,
} as const;

// =============================================================================
// RESTAURANT ANALYTICS DOMAIN
// =============================================================================
export const analyticsKeys = {
  all: ['analytics'] as const,
  restaurant: (restaurantId: string) => [...analyticsKeys.all, 'restaurant', restaurantId] as const,
  metrics: (restaurantId: string, period?: string) => 
    [...analyticsKeys.all, 'metrics', restaurantId, { period }] as const,
  kpis: (restaurantId: string) => [...analyticsKeys.all, 'kpis', restaurantId] as const,
  financials: (restaurantId: string, year?: number) => 
    [...analyticsKeys.all, 'financials', restaurantId, { year }] as const,
  personnel: (restaurantId: string) => [...analyticsKeys.all, 'personnel', restaurantId] as const,
  comparison: (restaurantIds: string[]) => 
    [...analyticsKeys.all, 'comparison', restaurantIds.sort()] as const,
} as const;

// =============================================================================
// RESTAURANTS DOMAIN
// =============================================================================
export const restaurantKeys = {
  all: ['restaurants'] as const,
  lists: () => [...restaurantKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...restaurantKeys.lists(), { filters }] as const,
  details: () => [...restaurantKeys.all, 'detail'] as const,
  detail: (id: string) => [...restaurantKeys.details(), id] as const,
  franchisee: (franchiseeId: string) => [...restaurantKeys.all, 'franchisee', franchiseeId] as const,
  unified: () => [...restaurantKeys.all, 'unified'] as const,
  base: () => [...restaurantKeys.all, 'base'] as const,
  members: (restaurantId: string) => [...restaurantKeys.all, 'members', restaurantId] as const,
  advisors: (restaurantId: string) => [...restaurantKeys.all, 'advisors', restaurantId] as const,
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Invalidar todas las queries relacionadas con un restaurante específico
 */
export const getRestaurantInvalidationKeys = (restaurantId: string) => [
  employeeKeys.byRestaurant(restaurantId),
  profitLossKeys.byRestaurant(restaurantId),
  budgetKeys.byRestaurant(restaurantId),
  incidentKeys.byRestaurant(restaurantId),
  analyticsKeys.restaurant(restaurantId),
];

/**
 * Obtener todas las query keys que contienen un restaurantId específico
 */
export const getAllRestaurantKeys = (restaurantId: string) => ({
  employees: employeeKeys.byRestaurant(restaurantId),
  profitLoss: profitLossKeys.byRestaurant(restaurantId),
  budgets: budgetKeys.byRestaurant(restaurantId),
  incidents: incidentKeys.byRestaurant(restaurantId),
  analytics: analyticsKeys.restaurant(restaurantId),
});

/**
 * Helper para invalidar queries de múltiples dominios para un restaurante
 */
export const invalidateRestaurantData = (queryClient: any, restaurantId: string) => {
  const keys = getRestaurantInvalidationKeys(restaurantId);
  keys.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
};