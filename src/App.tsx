
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/auth/AuthProvider';
import { ImpersonationProvider } from '@/hooks/useImpersonation';
// import ProtectedRoute from '@/components/ProtectedRoute';
import { AdminRoute } from '@/components/AdminRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
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
                  element={<UnifiedDashboardPage />}
                />
                <Route
                  path="/dashboard"
                  element={<UnifiedDashboardPage />}
                />
                <Route
                  path="/restaurant"
                  element={<RestaurantPage />}
                />
                <Route
                  path="/valuation"
                  element={<ValuationApp />}
                />
                <Route
                  path="/budget-valuation"
                  element={<BudgetValuationPage />}
                />
                <Route
                  path="/admin/*"
                  element={
                    <AdminRoute>
                      <div>Panel de Administración</div>
                    </AdminRoute>
                  }
                />
              </Routes>
              <Toaster />
            </Router>
          </ImpersonationProvider>
        </AuthProvider>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
