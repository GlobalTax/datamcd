
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/auth/AuthProvider';
import { ImpersonationProvider } from '@/hooks/useImpersonation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AdminRoute } from '@/components/AdminRoute';
import AuthPage from '@/pages/AuthPage';
import UnifiedDashboardPage from '@/pages/UnifiedDashboardPage';
import ValuationApp from '@/pages/ValuationApp';
import BudgetValuationPage from '@/pages/BudgetValuationPage';

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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ImpersonationProvider>
          <Router>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <UnifiedDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/valuation"
                element={
                  <ProtectedRoute>
                    <ValuationApp />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/budget-valuation"
                element={
                  <ProtectedRoute>
                    <BudgetValuationPage />
                  </ProtectedRoute>
                }
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
  );
}

export default App;
