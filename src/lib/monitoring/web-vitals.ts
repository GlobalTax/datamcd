import { logger } from '@/lib/logger';

// Initialize Web Vitals + lightweight performance observers
export function initMonitoring() {
  try {
    // Dynamically import web-vitals to keep initial bundle lean
    import('web-vitals').then(({ onCLS, onFID, onLCP, onINP, onTTFB }) => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      const base = {
        component: 'web-vitals',
        path: location.pathname,
        navType: nav?.type,
      } as const;

      const report = (metric: any) => {
        // Round to 2 decimals to avoid high-cardinality logs
        const value = typeof metric.value === 'number' ? Number(metric.value.toFixed(2)) : metric.value;
        logger.info(`WebVital:${metric.name}`, {
          ...base,
          id: metric.id,
          value,
          rating: metric.rating,
        });
      };

      onCLS(report);
      onFID(report);
      onINP?.(report); // INP is supported in newer browsers
      onLCP(report);
      onTTFB(report);
    }).catch((e) => {
      logger.warn('web-vitals import failed', { component: 'web-vitals', error: (e as Error)?.message });
    });

    // Long tasks observer (blocks >=50ms)
    if ('PerformanceObserver' in window) {
      try {
        const po = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            // @ts-ignore Long Task entries
            const name = (entry as any).name || 'longtask';
            if (entry.duration >= 50) {
              logger.warn('LongTask', {
                component: 'perf',
                name,
                duration: Number(entry.duration.toFixed(2)),
                startTime: Number(entry.startTime.toFixed(2)),
                path: location.pathname,
              });
            }
          });
        });
        // @ts-ignore type not always in lib.dom
        po.observe({ type: 'longtask', buffered: true });
      } catch { }
    }

    // After load, flag slow resources (>2000ms)
    window.addEventListener('load', () => {
      setTimeout(() => {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        resources
          .filter((r) => r.duration > 2000)
          .slice(0, 10) // limit noise
          .forEach((r) => {
            logger.warn('SlowResource', {
              component: 'perf',
              name: r.name,
              initiatorType: r.initiatorType,
              duration: Number(r.duration.toFixed(2)),
              transferSize: r.transferSize,
              path: location.pathname,
            });
          });
      }, 2000);
    }, { once: true });
  } catch (e) {
    logger.warn('initMonitoring failed', { component: 'web-vitals', error: (e as Error)?.message });
  }
}
