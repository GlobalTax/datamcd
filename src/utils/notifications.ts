
// Sistema de notificaciones centralizado
// Reemplaza el uso de toast (sonner) con un sistema personalizable

export const showSuccess = (message: string) => {
  console.log(`✅ SUCCESS: ${message}`);
  // En un entorno real, aquí usarías tu sistema de notificaciones preferido
  // Por ejemplo: mostrar en UI, enviar a analytics, etc.
};

export const showError = (message: string) => {
  console.error(`❌ ERROR: ${message}`);
  // Aquí puedes agregar lógica adicional como:
  // - Logging a base de datos
  // - Envío a servicio de monitoreo
  // - Mostrar en UI personalizada
};

export const showInfo = (message: string) => {
  console.info(`ℹ️ INFO: ${message}`);
};

export const showWarning = (message: string) => {
  console.warn(`⚠️ WARNING: ${message}`);
};

// Función de compatibilidad para reemplazar toast directamente
export const toast = {
  success: showSuccess,
  error: showError,
  info: showInfo,
  warning: showWarning
};

// Exportaciones por defecto para facilitar la migración
export { showSuccess as success, showError as error, showInfo as info, showWarning as warning };
