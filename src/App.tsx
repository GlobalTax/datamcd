
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/auth/AuthProvider';
import { ImpersonationProvider } from '@/hooks/useImpersonation';
import { AdminRoute } from '@/components/AdminRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingFallback } from '@/components/common/LoadingFallback';

// Importaciones eager (rutas principales)
import AuthPage from '@/pages/AuthPage';
import UnifiedDashboardPage from '@/pages/UnifiedDashboardPage';

// Importaciones lazy (rutas secundarias)
const RestaurantPage = React.lazy(() => import('@/pages/RestaurantPage'));
const ValuationApp = React.lazy(() => import('@/pages/ValuationApp'));
const BudgetValuationPage = React.lazy(() => import('@/pages/BudgetValuationPage'));
const AdvisorPage = React.lazy(() => import('@/pages/AdvisorPage'));
const AnalysisPage = React.lazy(() => import('@/pages/AnalysisPage'));
const HistoricalDataPage = React.lazy(() => import('@/pages/HistoricalDataPage'));
const ProfitLossPage = React.lazy(() => import('@/pages/ProfitLossPage'));
const FranchiseesPage = React.lazy(() => import('@/pages/FranchiseesPage'));
const AdvancedReportsPage = React.lazy(() => import('@/pages/AdvancedReportsPage'));
const LaborDashboardPage = React.lazy(() => import('@/pages/LaborDashboardPage'));
const NotificationsDashboardPage = React.lazy(() => import('@/pages/NotificationsDashboardPage'));
const SystemConfigPage = React.lazy(() => import('@/pages/SystemConfigPage'));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage'));
const WorkersPage = React.lazy(() => import('@/pages/WorkersPage'));
const OrquestPage = React.lazy(() => import('@/pages/OrquestPage'));
const IncidentManagementPage = React.lazy(() => import('@/pages/IncidentManagementPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Componente wrapper para páginas que necesitan el layout
const LayoutWrapper = ({ children }: { children: React.ReactNode }) => (
  <AppLayout>{children}</AppLayout>
);

// Componente wrapper que combina Suspense y Layout
const LazyPageWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingFallback message="Cargando página..." variant="page" />}>
    <LayoutWrapper>{children}</LayoutWrapper>
  </Suspense>
);

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ImpersonationProvider>
            <Router>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                
                {/* Rutas principales (eager loading) */}
                <Route
                  path="/dashboard"
                  element={
                    <LayoutWrapper>
                      <UnifiedDashboardPage />
                    </LayoutWrapper>
                  }
                />

                {/* Rutas secundarias (lazy loading) */}
                <Route
                  path="/restaurant"
                  element={
                    <LazyPageWrapper>
                      <RestaurantPage />
                    </LazyPageWrapper>
                  }
                />
                <Route
                  path="/valuation"
                  element={
                    <LazyPageWrapper>
                      <ValuationApp />
                    </LazyPageWrapper>
                  }
                />
                <Route
                  path="/budget-valuation"
                  element={
                    <LazyPageWrapper>
                      <BudgetValuationPage />
                    </LazyPageWrapper>
                  }
                />
                <Route
                  path="/advisor"
                  element={
                    <LazyPageWrapper>
                      <AdvisorPage />
                    </LazyPageWrapper>
                  }
                />
                <Route
                  path="/analysis"
                  element={
                    <LazyPageWrapper>
                      <AnalysisPage />
                    </LazyPageWrapper>
                  }
                />
                <Route
                  path="/historical-data"
                  element={
                    <LazyPageWrapper>
                      <HistoricalDataPage />
                    </LazyPageWrapper>
                  }
                />
                <Route
                  path="/profit-loss/:siteNumber"
                  element={
                    <LazyPageWrapper>
                      <ProfitLossPage />
                    </LazyPageWrapper>
                  }
                />
                <Route
                  path="/franchisees"
                  element={
                    <LazyPageWrapper>
                      <FranchiseesPage />
                    </LazyPageWrapper>
                  }
                />
                <Route
                  path="/advanced-reports"
                  element={
                    <LazyPageWrapper>
                      <AdvancedReportsPage />
                    </LazyPageWrapper>
                  }
                />
                <Route
                  path="/labor-dashboard"
                  element={
                    <LazyPageWrapper>
                      <LaborDashboardPage />
                    </LazyPageWrapper>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <LazyPageWrapper>
                      <NotificationsDashboardPage />
                    </LazyPageWrapper>
                  }
                />
                <Route
                  path="/workers"
                  element={
                    <LazyPageWrapper>
                      <WorkersPage />
                    </LazyPageWrapper>
                  }
                />
                <Route
                  path="/orquest"
                  element={
                    <LazyPageWrapper>
                      <OrquestPage />
                    </LazyPageWrapper>
                  }
                />
                <Route
                  path="/incident-management"
                  element={
                    <LazyPageWrapper>
                      <IncidentManagementPage />
                    </LazyPageWrapper>
                  }
                />
                <Route
                  path="/system-config"
                  element={
                    <LazyPageWrapper>
                      <SystemConfigPage />
                    </LazyPageWrapper>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <LazyPageWrapper>
                      <SettingsPage />
                    </LazyPageWrapper>
                  }
                />
                <Route
                  path="/admin/*"
                  element={
                    <AdminRoute>
                      <LazyPageWrapper>
                        <div className="p-6">
                          <h1 className="text-2xl font-bold">Panel de Administración</h1>
                          <p className="text-gray-600 mt-2">Gestión avanzada del sistema</p>
                        </div>
                      </LazyPageWrapper>
                    </AdminRoute>
                  }
                />
                
                {/* Ruta catch-all para manejar rutas no encontradas */}
                <Route
                  path="*"
                  element={
                    <LayoutWrapper>
                      <div className="p-6 text-center">
                        <h1 className="text-2xl font-bold text-gray-900">Página no encontrada</h1>
                        <p className="text-gray-600 mt-2">La ruta que buscas no existe.</p>
                        <button 
                          onClick={() => window.location.href = '/dashboard'}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Volver al Dashboard
                        </button>
                      </div>
                    </LayoutWrapper>
                  }
                />
              </Routes>
              <Toaster />
            </Router>
          </ImpersonationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
