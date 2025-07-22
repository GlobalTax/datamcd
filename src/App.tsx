
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/auth/AuthProvider';
import { ImpersonationProvider } from '@/hooks/useImpersonation';
import { AdminRoute } from '@/components/AdminRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AppLayout } from '@/components/layout/AppLayout';
import AuthPage from '@/pages/AuthPage';
import UnifiedDashboardPage from '@/pages/UnifiedDashboardPage';
import ValuationApp from '@/pages/ValuationApp';
import BudgetValuationPage from '@/pages/BudgetValuationPage';
import RestaurantPage from '@/pages/RestaurantPage';

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
                <Route
                  path="/dashboard"
                  element={
                    <LayoutWrapper>
                      <UnifiedDashboardPage />
                    </LayoutWrapper>
                  }
                />
                <Route
                  path="/restaurant"
                  element={
                    <LayoutWrapper>
                      <RestaurantPage />
                    </LayoutWrapper>
                  }
                />
                <Route
                  path="/valuation"
                  element={
                    <LayoutWrapper>
                      <ValuationApp />
                    </LayoutWrapper>
                  }
                />
                <Route
                  path="/budget-valuation"
                  element={
                    <LayoutWrapper>
                      <BudgetValuationPage />
                    </LayoutWrapper>
                  }
                />
                <Route
                  path="/admin/*"
                  element={
                    <AdminRoute>
                      <LayoutWrapper>
                        <div className="p-6">
                          <h1 className="text-2xl font-bold">Panel de Administración</h1>
                          <p className="text-gray-600 mt-2">Gestión avanzada del sistema</p>
                        </div>
                      </LayoutWrapper>
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
