
import { useEffect, useState } from 'react';
import { useRoutePreloader } from '@/utils/routePreloader';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuthCompat';

interface PerformanceData {
  routeLoadTime: number;
  totalLoadTime: number;
  memoryUsage?: number;
  connectionType?: string;
}

export const usePerformance = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const { preloadHighPriority, preloadContextual, setupHoverPreloading } = useRoutePreloader();
  const { user } = useUnifiedAuth();

  useEffect(() => {
    // Inicializar preloading
    preloadHighPriority();
    setupHoverPreloading();

    if (user?.role) {
      preloadContextual(user.role);
    }
  }, [user?.role, preloadHighPriority, preloadContextual, setupHoverPreloading]);

  useEffect(() => {
    // Medir performance de la página
    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const data: PerformanceData = {
          routeLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
          totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
        };

        // Agregar información de memoria si está disponible
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          data.memoryUsage = memory.usedJSHeapSize;
        }

        // Agregar información de conexión si está disponible
        if ('connection' in navigator) {
          const connection = (navigator as any).connection;
          data.connectionType = connection.effectiveType;
        }

        setPerformanceData(data);
      }
    };

    // Medir cuando la página esté completamente cargada
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  const trackRouteChange = (routeName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`Route ${routeName} loaded in ${duration.toFixed(2)}ms`);
      
      // Reportar a analytics si es necesario
      if (duration > 2000) {
        console.warn(`Slow route load detected: ${routeName} took ${duration.toFixed(2)}ms`);
      }
    };
  };

  return {
    performanceData,
    trackRouteChange
  };
};
