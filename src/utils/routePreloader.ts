
// Preloader de rutas para mejorar la experiencia de usuario
// Precarga componentes antes de que el usuario navegue a ellos

interface RoutePreloadConfig {
  route: string;
  priority: 'high' | 'medium' | 'low';
  preloadCondition?: () => boolean;
}

class RoutePreloader {
  private preloadedRoutes = new Set<string>();
  private preloadPromises = new Map<string, Promise<any>>();

  // Configuración de rutas para precargar
  private routeConfigs: RoutePreloadConfig[] = [
    { route: 'restaurant', priority: 'high' },
    { route: 'analysis', priority: 'high' },
    { route: 'valuation', priority: 'medium' },
    { route: 'historical-data', priority: 'medium' },
    { route: 'settings', priority: 'low' },
    { route: 'workers', priority: 'medium' },
  ];

  // Mapeo de rutas a sus imports dinámicos
  private routeImports: Record<string, () => Promise<any>> = {
    restaurant: () => import('@/pages/RestaurantPage'),
    valuation: () => import('@/pages/ValuationApp'),
    'budget-valuation': () => import('@/pages/BudgetValuationPage'),
    advisor: () => import('@/pages/AdvisorPage'),
    analysis: () => import('@/pages/AnalysisPage'),
    'historical-data': () => import('@/pages/HistoricalDataPage'),
    'profit-loss': () => import('@/pages/ProfitLossPage'),
    franchisees: () => import('@/pages/FranchiseesPage'),
    'advanced-reports': () => import('@/pages/AdvancedReportsPage'),
    'labor-dashboard': () => import('@/pages/LaborDashboardPage'),
    notifications: () => import('@/pages/NotificationsDashboardPage'),
    'system-config': () => import('@/pages/SystemConfigPage'),
    settings: () => import('@/pages/SettingsPage'),
    workers: () => import('@/pages/WorkersPage'),
    orquest: () => import('@/pages/OrquestPage'),
    'incident-management': () => import('@/pages/IncidentManagementPage'),
  };

  // Precargar una ruta específica
  async preloadRoute(routeName: string): Promise<void> {
    if (this.preloadedRoutes.has(routeName)) {
      return;
    }

    const importFn = this.routeImports[routeName];
    if (!importFn) {
      console.warn(`Route ${routeName} not found in preloader config`);
      return;
    }

    if (this.preloadPromises.has(routeName)) {
      await this.preloadPromises.get(routeName);
      return;
    }

    const preloadPromise = importFn()
      .then(() => {
        this.preloadedRoutes.add(routeName);
        console.log(`✅ Preloaded route: ${routeName}`);
      })
      .catch((error) => {
        console.error(`❌ Failed to preload route ${routeName}:`, error);
      })
      .finally(() => {
        this.preloadPromises.delete(routeName);
      });

    this.preloadPromises.set(routeName, preloadPromise);
    await preloadPromise;
  }

  // Precargar rutas de alta prioridad
  preloadHighPriorityRoutes(): void {
    const highPriorityRoutes = this.routeConfigs
      .filter(config => config.priority === 'high')
      .map(config => config.route);

    // Usar requestIdleCallback si está disponible
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        highPriorityRoutes.forEach(route => this.preloadRoute(route));
      });
    } else {
      // Fallback con setTimeout
      setTimeout(() => {
        highPriorityRoutes.forEach(route => this.preloadRoute(route));
      }, 1000);
    }
  }

  // Precargar rutas cuando el usuario hace hover sobre un link
  setupHoverPreloading(): void {
    // Usar IntersectionObserver para detectar cuando los links entran en view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const link = entry.target as HTMLAnchorElement;
          const pathname = new URL(link.href).pathname;
          const routeName = pathname.substring(1); // Remover el '/' inicial
          
          if (this.routeImports[routeName]) {
            this.preloadRoute(routeName);
          }
        }
      });
    }, {
      rootMargin: '100px' // Precargar cuando el link está 100px antes de ser visible
    });

    // Observar todos los links internos
    const observeLinks = () => {
      document.querySelectorAll('a[href^="/"]').forEach((link) => {
        observer.observe(link);
      });
    };

    // Configurar el observer inicialmente y después de cambios en el DOM
    observeLinks();
    
    // Re-observar links cuando cambie el DOM
    const mutationObserver = new MutationObserver(() => {
      observeLinks();
    });
    
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Precargar rutas basado en el contexto del usuario
  preloadContextualRoutes(userRole: string): void {
    const contextualRoutes: Record<string, string[]> = {
      franchisee: ['restaurant', 'analysis', 'workers'],
      asesor: ['restaurant', 'analysis', 'franchisees', 'advanced-reports'],
      admin: ['system-config', 'advanced-reports', 'franchisees'],
      superadmin: ['system-config', 'advanced-reports', 'franchisees']
    };

    const routesToPreload = contextualRoutes[userRole] || [];
    
    routesToPreload.forEach((route, index) => {
      // Escalonar la precarga para no sobrecargar
      setTimeout(() => {
        this.preloadRoute(route);
      }, index * 500);
    });
  }

  // Obtener estadísticas de precarga
  getPreloadStats() {
    return {
      preloadedCount: this.preloadedRoutes.size,
      totalRoutes: Object.keys(this.routeImports).length,
      preloadedRoutes: Array.from(this.preloadedRoutes),
      pendingPreloads: this.preloadPromises.size
    };
  }
}

// Instancia singleton del preloader
export const routePreloader = new RoutePreloader();

// Hook para usar el preloader en componentes React
export const useRoutePreloader = () => {
  return {
    preloadRoute: (routeName: string) => routePreloader.preloadRoute(routeName),
    preloadHighPriority: () => routePreloader.preloadHighPriorityRoutes(),
    setupHoverPreloading: () => routePreloader.setupHoverPreloading(),
    preloadContextual: (userRole: string) => routePreloader.preloadContextualRoutes(userRole),
    getStats: () => routePreloader.getPreloadStats()
  };
};
