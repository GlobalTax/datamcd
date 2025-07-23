import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AppProvider } from '@/contexts/AppContext';
import { ImpersonationProvider } from '@/hooks/useImpersonation';
import { FranchiseeProvider } from '@/contexts/FranchiseeContext';
import { AuthProvider } from '@/hooks/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';

// Auth pages
import { AuthPage } from '@/pages/AuthPage';
import AdvisorAuthPage from '@/pages/AdvisorAuthPage';

// Dashboard pages
import OptimizedDashboardPage from '@/pages/OptimizedDashboardPage';
import AdvisorPage from '@/pages/AdvisorPage';

// Management pages
import RestaurantManagementPage from '@/pages/RestaurantManagementPage';
import FranchiseeDetailPage from '@/pages/FranchiseeDetailPage';
import EmployeePage from '@/pages/EmployeePage';

// Analysis and reporting
import AnalysisPage from '@/pages/AnalysisPage';
import ValuationPage from '@/pages/ValuationPage';
import AnnualBudgetPage from '@/pages/AnnualBudgetPage';
import HistoricalDataPage from '@/pages/HistoricalDataPage';

// Admin pages
import FranchiseesPage from '@/pages/FranchiseesPage';
import IntegrationsPage from '@/pages/IntegrationsPage';
import OrquestPage from '@/pages/OrquestPage';
import BiloopPage from '@/pages/BiloopPage';
import SystemConfigPage from '@/pages/SystemConfigPage';
import IntegrationStatusPage from '@/pages/IntegrationStatusPage';

// Other pages
import IncidentsPage from '@/pages/IncidentsPage';
import LaborDashboardPage from '@/pages/LaborDashboardPage';
import NotificationsDashboardPage from '@/pages/NotificationsDashboardPage';
import SettingsPage from '@/pages/SettingsPage';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AuthProvider>
          <ImpersonationProvider>
            <FranchiseeProvider>
              <Router>
                <div className="min-h-screen bg-background">
                  <Routes>
                    {/* Auth routes */}
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/advisor-auth" element={<AdvisorAuthPage />} />
                    
                    {/* Protected routes */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <OptimizedDashboardPage />
                      </ProtectedRoute>
                    } />
                    
                    {/* Role-based routes */}
                    <Route path="/advisor" element={
                      <RoleBasedRoute allowedRoles={['admin', 'superadmin', 'asesor']}>
                        <AdvisorPage />
                      </RoleBasedRoute>
                    } />
                    
                    <Route path="/franchisee/:franchiseeId" element={
                      <RoleBasedRoute allowedRoles={['admin', 'superadmin', 'asesor']}>
                        <FranchiseeDetailPage />
                      </RoleBasedRoute>
                    } />
                    
                    {/* Management routes */}
                    <Route path="/restaurant" element={
                      <ProtectedRoute>
                        <RestaurantManagementPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/employees" element={
                      <ProtectedRoute>
                        <EmployeePage />
                      </ProtectedRoute>
                    } />
                    
                    {/* Analysis routes */}
                    <Route path="/analysis" element={
                      <ProtectedRoute>
                        <AnalysisPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/valuation" element={
                      <ProtectedRoute>
                        <ValuationPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/annual-budget" element={
                      <ProtectedRoute>
                        <AnnualBudgetPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/historical-data" element={
                      <ProtectedRoute>
                        <HistoricalDataPage />
                      </ProtectedRoute>
                    } />
                    
                    {/* Admin routes */}
                    <Route path="/franchisees" element={
                      <RoleBasedRoute allowedRoles={['admin', 'superadmin', 'asesor']}>
                        <FranchiseesPage />
                      </RoleBasedRoute>
                    } />
                    
                    <Route path="/integrations" element={
                      <RoleBasedRoute allowedRoles={['admin', 'superadmin']}>
                        <IntegrationsPage />
                      </RoleBasedRoute>
                    } />
                    
                    <Route path="/orquest" element={
                      <RoleBasedRoute allowedRoles={['admin', 'superadmin']}>
                        <OrquestPage />
                      </RoleBasedRoute>
                    } />
                    
                    <Route path="/biloop" element={
                      <RoleBasedRoute allowedRoles={['admin', 'superadmin']}>
                        <BiloopPage />
                      </RoleBasedRoute>
                    } />
                    
                    <Route path="/system-config" element={
                      <RoleBasedRoute allowedRoles={['superadmin']}>
                        <SystemConfigPage />
                      </RoleBasedRoute>
                    } />
                    
                    {/* Other routes */}
                    <Route path="/incidents" element={
                      <ProtectedRoute>
                        <IncidentsPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/integration-status" element={
                      <ProtectedRoute>
                        <IntegrationStatusPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/labor-dashboard" element={
                      <ProtectedRoute>
                        <LaborDashboardPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/notifications" element={
                      <ProtectedRoute>
                        <NotificationsDashboardPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    } />
                    
                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </div>
                <Toaster />
              </Router>
            </FranchiseeProvider>
          </ImpersonationProvider>
        </AuthProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
