
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/hooks/auth/AuthProvider';
import { FranchiseeProvider } from '@/contexts/FranchiseeContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AdminRoute } from '@/components/AdminRoute';

// Pages
import UnifiedDashboardPage from '@/pages/UnifiedDashboardPage';
import DashboardPage from '@/pages/DashboardPage';
import RestaurantManagementPage from '@/pages/RestaurantManagementPage';
import ProfitLossPage from '@/pages/ProfitLossPage';
import SettingsPage from '@/pages/SettingsPage';
import AnalysisPage from '@/pages/AnalysisPage';
import FranchiseesPage from '@/pages/FranchiseesPage';
import OrquestPage from '@/pages/OrquestPage';
import BiloopPage from '@/pages/BiloopPage';
import IntegrationsPage from '@/pages/IntegrationsPage';
import IntegrationStatusPage from '@/pages/IntegrationStatusPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FranchiseeProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<div>Login Page - Coming Soon</div>} />
                
                {/* Protected routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Navigate to="/dashboard" replace />
                  </ProtectedRoute>
                } />

                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <UnifiedDashboardPage />
                  </ProtectedRoute>
                } />

                <Route path="/dashboard-legacy" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />

                <Route path="/restaurant/manage" element={
                  <ProtectedRoute>
                    <RestaurantManagementPage />
                  </ProtectedRoute>
                } />

                <Route path="/employees" element={
                  <ProtectedRoute>
                    <div>Employees Page - Coming Soon</div>
                  </ProtectedRoute>
                } />

                <Route path="/scheduling" element={
                  <ProtectedRoute>
                    <div>Scheduling Page - Coming Soon</div>
                  </ProtectedRoute>
                } />

                <Route path="/payroll" element={
                  <ProtectedRoute>
                    <div>Payroll Page - Coming Soon</div>
                  </ProtectedRoute>
                } />

                <Route path="/annual-budget" element={
                  <ProtectedRoute>
                    <div>Budget Page - Coming Soon</div>
                  </ProtectedRoute>
                } />

                <Route path="/profit-loss" element={
                  <ProtectedRoute>
                    <ProfitLossPage />
                  </ProtectedRoute>
                } />

                <Route path="/valuation" element={
                  <ProtectedRoute>
                    <div>Valuation Page - Coming Soon</div>
                  </ProtectedRoute>
                } />

                <Route path="/incidents" element={
                  <ProtectedRoute>
                    <div>Incidents Page - Coming Soon</div>
                  </ProtectedRoute>
                } />

                <Route path="/settings" element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } />

                <Route path="/analysis" element={
                  <ProtectedRoute>
                    <AnalysisPage />
                  </ProtectedRoute>
                } />

                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <div>Notifications Page - Coming Soon</div>
                  </ProtectedRoute>
                } />

                <Route path="/integration-status" element={
                  <ProtectedRoute>
                    <IntegrationStatusPage />
                  </ProtectedRoute>
                } />

                {/* Admin only routes */}
                <Route path="/franchisees" element={
                  <AdminRoute>
                    <FranchiseesPage />
                  </AdminRoute>
                } />

                <Route path="/orquest" element={
                  <AdminRoute>
                    <OrquestPage />
                  </AdminRoute>
                } />

                <Route path="/biloop" element={
                  <AdminRoute>
                    <BiloopPage />
                  </AdminRoute>
                } />

                <Route path="/integrations" element={
                  <AdminRoute>
                    <IntegrationsPage />
                  </AdminRoute>
                } />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
            <Toaster richColors position="top-right" />
          </Router>
        </FranchiseeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
