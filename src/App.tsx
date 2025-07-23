
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/hooks/auth/AuthProvider';
import { ImpersonationProvider } from '@/hooks/useImpersonation';
import { FranchiseeProvider } from '@/contexts/FranchiseeContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import OptimizedDashboardPage from '@/pages/OptimizedDashboardPage';
import FranchiseesPage from '@/pages/FranchiseesPage';
import RestaurantManagementPage from '@/pages/RestaurantManagementPage';
import { AuthPage } from '@/pages/AuthPage';
import ProtectedRoute from '@/components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ImpersonationProvider>
            <FranchiseeProvider>
              <Router>
                <Routes>
                  <Route path="/auth" element={<AuthPage />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <OptimizedDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/franchisees"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                        <FranchiseesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/restaurant"
                    element={
                      <ProtectedRoute allowedRoles={['franchisee', 'admin', 'superadmin']}>
                        <RestaurantManagementPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Router>
              <Toaster />
            </FranchiseeProvider>
          </ImpersonationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
