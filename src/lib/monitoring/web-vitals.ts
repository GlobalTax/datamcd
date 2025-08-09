import { logger } from '@/lib/logger';

// Initialize Web Vitals + lightweight performance observers
export function initMonitoring() {
  try {
    const BUDGETS = { CLS: 0.1, LCP: 2500, INP: 200, TTFB: 800 } as const;
    const RESOURCE_BUDGETS = { JS_TOTAL: 600_000, CHUNK_MAX: 300_000 } as const;
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
        const payload = { ...base, id: metric.id, value, rating: metric.rating };
        logger.info(`WebVital:${metric.name}`, payload);

        try {
          // Performance budgets: warn when thresholds are exceeded
          const name = metric.name as 'CLS' | 'LCP' | 'INP' | 'TTFB' | string;
          const budget = (BUDGETS as any)[name];
          if (typeof budget === 'number' && typeof value === 'number' && value > budget) {
            logger.warn('PerfBudgetExceeded', { ...payload, budget, metric: name });
          }
        } catch {}
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

    // After load, flag slow resources (>2000ms) and check bundle budgets
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

        try {
          // Bundle size budgets (transfer size)
          const scripts = resources.filter((r) => r.initiatorType === 'script');
          const jsTotal = scripts.reduce((sum, r) => sum + (r.transferSize || 0), 0);
          const jsMaxChunk = scripts.reduce((max, r) => Math.max(max, r.transferSize || 0), 0);
          if (jsTotal > RESOURCE_BUDGETS.JS_TOTAL) {
            logger.warn('PerfBudgetExceeded:JS_TOTAL', {
              component: 'perf',
              path: location.pathname,
              value: jsTotal,
              budget: RESOURCE_BUDGETS.JS_TOTAL,
            });
          }
          if (jsMaxChunk > RESOURCE_BUDGETS.CHUNK_MAX) {
            logger.warn('PerfBudgetExceeded:CHUNK_MAX', {
              component: 'perf',
              path: location.pathname,
              value: jsMaxChunk,
              budget: RESOURCE_BUDGETS.CHUNK_MAX,
            });
          }
        } catch {}
      }, 2000);
    }, { once: true });
  } catch (e) {
    logger.warn('initMonitoring failed', { component: 'web-vitals', error: (e as Error)?.message });
  }
}
