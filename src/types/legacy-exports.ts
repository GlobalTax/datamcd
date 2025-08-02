// === EXPORTACIONES LEGACY PARA COMPATIBILIDAD ===
// Archivo temporal para mantener compatibilidad durante la migración

export * from './domains';

// Alias para evitar breaking changes
export type { RestaurantValuationSummary as RestaurantValuation } from './domains/restaurant';