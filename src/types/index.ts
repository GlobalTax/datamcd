// === PUNTO DE ENTRADA PRINCIPAL PARA TIPOS ===
// Sistema de tipos reorganizado por dominios

// Exportar todos los tipos desde la nueva estructura de dominios
export * from './domains';

// === ARCHIVOS LEGACY MANTENIDOS POR COMPATIBILIDAD ===
// Estos archivos se mantendrán temporalmente para evitar breaking changes
// Se eliminarán en futuras versiones una vez migradas todas las referencias

// Nota: Los archivos legacy individuales seguirán existiendo pero ahora
// re-exportan desde la nueva estructura de dominios para mantener compatibilidad

// === CONVENCIONES DE LA NUEVA ARQUITECTURA ===
/*
Estructura de tipos por dominios:
- src/types/domains/auth/           - Autenticación y usuarios
- src/types/domains/franchisee/     - Franquiciados y staff
- src/types/domains/restaurant/     - Restaurantes y asignaciones
- src/types/domains/employee/       - Empleados, nóminas, tiempo
- src/types/domains/budget/         - Presupuestos y datos reales
- src/types/domains/financial/      - P&L, valuaciones, métricas
- src/types/domains/incident/       - Incidencias y gestión
- src/types/domains/advisor/        - Asesores y reportes
- src/types/domains/integration/    - Integraciones externas
- src/types/domains/common/         - Infraestructura y compartidos

Beneficios:
1. Separación clara de responsabilidades
2. Tipos organizados por contexto de negocio
3. Fácil localización y mantenimiento
4. Reducción de dependencias circulares
5. Mejor escalabilidad del sistema de tipos
*/