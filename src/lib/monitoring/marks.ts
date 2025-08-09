import { logger } from '@/lib/logger';

// Lightweight performance marks/measures helpers
export function mark(name: string, detail?: Record<string, any>) {
  try {
    performance.mark(name);
    if (process.env.NODE_ENV === 'development') {
      logger.debug('perf:mark', { name, ...detail, path: location.pathname });
    }
  } catch {}
}

export function measure(
  name: string,
  startMark?: string,
  endMark?: string,
  detail?: Record<string, any>
) {
  try {
    // If endMark not provided, measure until "now"
    // If startMark not provided, measure from navigation start
    performance.measure(name, startMark as any, endMark as any);
    const entries = performance.getEntriesByName(name);
    const entry = entries[entries.length - 1] as PerformanceMeasure | undefined;
    if (entry) {
      logger.info('PerfMeasure', {
        name,
        duration: Number(entry.duration.toFixed(2)),
        startTime: Number(entry.startTime.toFixed(2)),
        ...detail,
        path: location.pathname,
      });
    }
  } catch (e) {
    logger.warn('measure failed', { name, startMark, endMark, error: (e as Error)?.message });
  }
}

// Fire-and-forget interaction timing: measures until next paint
export function markInteraction(name: string, detail?: Record<string, any>) {
  const label = `int:${name}`;
  try {
    mark(`${label}:start`, detail);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        measure(label, `${label}:start`, undefined, detail);
      });
    });
  } catch {}
}
