
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { UnifiedAuthProvider } from '@/contexts/UnifiedAuthContext';
import { FranchiseeProvider } from '@/contexts/FranchiseeContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminRoute } from '@/components/AdminRoute';

// Pages
import LoginPage from '@/pages/LoginPage';
import UnifiedDashboardPage from '@/pages/UnifiedDashboardPage';
import DashboardPage from '@/pages/DashboardPage';
import RestaurantManagementPage from '@/pages/RestaurantManagementPage';
import EmployeesPage from '@/pages/EmployeesPage';
import SchedulingPage from '@/pages/SchedulingPage';
import PayrollPage from '@/pages/PayrollPage';
import BudgetPage from '@/pages/BudgetPage';
import ProfitLossPage from '@/pages/ProfitLossPage';
import ValuationPage from '@/pages/ValuationPage';
import IncidentsPage from '@/pages/IncidentsPage';
import SettingsPage from '@/pages/SettingsPage';
import AnalysisPage from '@/pages/AnalysisPage';
import FranchiseesPage from '@/pages/FranchiseesPage';
import NotificationsPage from '@/pages/NotificationsPage';
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
      <UnifiedAuthProvider>
        <FranchiseeProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                
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
                    <EmployeesPage />
                  </ProtectedRoute>
                } />

                <Route path="/scheduling" element={
                  <ProtectedRoute>
                    <SchedulingPage />
                  </ProtectedRoute>
                } />

                <Route path="/payroll" element={
                  <ProtectedRoute>
                    <PayrollPage />
                  </ProtectedRoute>
                } />

                <Route path="/annual-budget" element={
                  <ProtectedRoute>
                    <BudgetPage />
                  </ProtectedRoute>
                } />

                <Route path="/profit-loss" element={
                  <ProtectedRoute>
                    <ProfitLossPage />
                  </ProtectedRoute>
                } />

                <Route path="/valuation" element={
                  <ProtectedRoute>
                    <ValuationPage />
                  </ProtectedRoute>
                } />

                <Route path="/incidents" element={
                  <ProtectedRoute>
                    <IncidentsPage />
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
                    <NotificationsPage />
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
      </UnifiedAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
