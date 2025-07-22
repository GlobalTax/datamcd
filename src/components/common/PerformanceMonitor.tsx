
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Gauge, 
  Clock, 
  Zap, 
  Eye,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface PerformanceMetrics {
  ttfb: number; // Time to First Byte
  lcp: number;  // Largest Contentful Paint
  fid: number;  // First Input Delay
  cls: number;  // Cumulative Layout Shift
  fcp: number;  // First Contentful Paint
  routeChangeTime: number;
}

interface RoutePerformance {
  route: string;
  metrics: PerformanceMetrics;
  timestamp: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null);
  const [routeHistory, setRouteHistory] = useState<RoutePerformance[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Medir Core Web Vitals
    const measureCoreWebVitals = () => {
      if ('web-vital' in window) {
        return; // Usar la librería web-vitals si está disponible
      }

      // Implementación básica de métricas
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const metrics: PerformanceMetrics = {
          ttfb: navigation.responseStart - navigation.requestStart,
          lcp: 0, // Se actualizará con PerformanceObserver
          fid: 0, // Se actualizará con PerformanceObserver
          cls: 0, // Se actualizará con PerformanceObserver
          fcp: navigation.loadEventEnd - navigation.fetchStart,
          routeChangeTime: navigation.loadEventEnd - navigation.navigationStart
        };

        setCurrentMetrics(metrics);
      }
    };

    // Observer para LCP
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        setCurrentMetrics(prev => prev ? {
          ...prev,
          lcp: lastEntry.startTime
        } : null);
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.log('LCP observer not supported');
      }

      // Observer para FID
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          setCurrentMetrics(prev => prev ? {
            ...prev,
            fid: entry.processingStart - entry.startTime
          } : null);
        });
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.log('FID observer not supported');
      }

      // Observer para CLS
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        let clsValue = 0;
        
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });

        setCurrentMetrics(prev => prev ? {
          ...prev,
          cls: clsValue
        } : null);
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.log('CLS observer not supported');
      }
    }

    measureCoreWebVitals();

    // Medir tiempo de cambio de ruta
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    const measureRouteChange = (url: string) => {
      const startTime = performance.now();
      
      requestAnimationFrame(() => {
        const endTime = performance.now();
        const routeChangeTime = endTime - startTime;
        
        if (currentMetrics) {
          const routePerformance: RoutePerformance = {
            route: url,
            metrics: {
              ...currentMetrics,
              routeChangeTime
            },
            timestamp: Date.now()
          };

          setRouteHistory(prev => [...prev.slice(-9), routePerformance]); // Mantener últimos 10
        }
      });
    };

    history.pushState = function(...args) {
      measureRouteChange(args[2] || window.location.pathname);
      return originalPushState.apply(this, args);
    };

    history.replaceState = function(...args) {
      measureRouteChange(args[2] || window.location.pathname);
      return originalReplaceState.apply(this, args);
    };

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [currentMetrics]);

  const getScoreColor = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'bg-green-500';
    if (value <= thresholds.poor) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'Bueno';
    if (value <= thresholds.poor) return 'Mejorar';
    return 'Pobre';
  };

  if (!currentMetrics) {
    return null;
  }

  const coreWebVitalsConfig = {
    lcp: { good: 2500, poor: 4000, unit: 'ms' },
    fid: { good: 100, poor: 300, unit: 'ms' },
    cls: { good: 0.1, poor: 0.25, unit: '' },
    fcp: { good: 1800, poor: 3000, unit: 'ms' },
    ttfb: { good: 800, poor: 1800, unit: 'ms' }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Gauge className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 w-80 z-50">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              Performance Monitor
            </CardTitle>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {/* Core Web Vitals */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Core Web Vitals</h4>
            <div className="space-y-2">
              {Object.entries(coreWebVitalsConfig).map(([metric, config]) => {
                const value = currentMetrics[metric as keyof PerformanceMetrics];
                const percentage = Math.min((value / config.poor) * 100, 100);
                
                return (
                  <div key={metric} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-medium text-gray-700 uppercase">
                        {metric}
                      </span>
                      <Progress 
                        value={percentage} 
                        className="flex-1 h-2"
                      />
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <span className="font-mono">
                        {Math.round(value)}{config.unit}
                      </span>
                      <Badge 
                        variant="outline"
                        className={`text-xs ${getScoreColor(value, config).replace('bg-', 'text-').replace('500', '700')}`}
                      >
                        {getScoreLabel(value, config)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historial de rutas recientes */}
          {routeHistory.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Rutas Recientes</h4>
              <div className="space-y-1">
                {routeHistory.slice(-5).map((routePerf, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="font-mono text-gray-600 truncate">
                      {routePerf.route}
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{Math.round(routePerf.metrics.routeChangeTime)}ms</span>
                      {routePerf.metrics.routeChangeTime < 100 ? (
                        <TrendingUp className="w-3 h-3 text-green-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resumen general */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span>Estado general:</span>
              <Badge variant={
                currentMetrics.lcp < 2500 && currentMetrics.fid < 100 
                  ? 'default' 
                  : 'destructive'
              }>
                {currentMetrics.lcp < 2500 && currentMetrics.fid < 100 
                  ? 'Óptimo' 
                  : 'Necesita mejoras'
                }
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
