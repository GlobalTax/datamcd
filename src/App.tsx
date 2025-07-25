
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth/AuthProvider";
import { ImpersonationProvider } from "@/hooks/useImpersonation";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import AdvisorAuthPage from "./pages/AdvisorAuthPage";
import DashboardPage from "./pages/DashboardPage";
import OptimizedDashboardPage from "./pages/OptimizedDashboardPage";
import RestaurantManagementPage from "./pages/RestaurantManagementPage";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import ProfitLossPage from "./pages/ProfitLossPage";
import HistoricalDataPage from "./pages/HistoricalDataPage";
import AnalysisPage from "./pages/AnalysisPage";
import AdvisorPage from "./pages/AdvisorPage";
import FranchiseeDetailPage from "./pages/FranchiseeDetailPage";
import ValuationApp from "./pages/ValuationApp";
import SettingsPage from "./pages/SettingsPage";
import AnnualBudgetPage from "./pages/AnnualBudgetPage";
import EmployeePage from "./pages/EmployeePage";
import OrquestPage from "./pages/OrquestPage";
import IncidentManagementPage from "./pages/IncidentManagementPage";
import BiloopPage from "./pages/BiloopPage";
import WorkersPage from "./pages/WorkersPage";
import LaborDashboardPage from "./pages/LaborDashboardPage";
import BudgetValuationPage from "./pages/BudgetValuationPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ImpersonationProvider>
          <TooltipProvider>
            <BrowserRouter>
              <Toaster />
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/advisor-auth" element={<AdvisorAuthPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['franchisee', 'superadmin', 'admin', 'asesor']}>
                    <OptimizedDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard-legacy"
                element={
                  <ProtectedRoute allowedRoles={['franchisee', 'superadmin', 'admin', 'asesor']}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/restaurant"
                element={
                  <ProtectedRoute allowedRoles={['franchisee', 'superadmin', 'admin', 'asesor']}>
                    <RestaurantManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/restaurant/:restaurantId"
                element={
                  <ProtectedRoute allowedRoles={['franchisee', 'superadmin', 'admin', 'asesor']}>
                    <RestaurantDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analysis"
                element={
                  <ProtectedRoute allowedRoles={['franchisee', 'superadmin', 'admin', 'asesor']}>
                    <AnalysisPage />
                  </ProtectedRoute>
                }
              />
              {/* Redirección de /profit-loss a /profit-loss/001 (primer restaurante) */}
              <Route
                path="/profit-loss"
                element={<Navigate to="/profit-loss/001" replace />}
              />
              <Route
                path="/profit-loss/:siteNumber"
                element={
                  <ProtectedRoute allowedRoles={['franchisee', 'superadmin', 'admin', 'asesor']}>
                    <ProfitLossPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/historical-data"
                element={
                  <ProtectedRoute allowedRoles={['franchisee', 'superadmin', 'admin', 'asesor']}>
                    <HistoricalDataPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/annual-budget"
                element={
                  <ProtectedRoute allowedRoles={['franchisee', 'superadmin', 'admin', 'asesor']}>
                    <AnnualBudgetPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/advisor"
                element={
                  <ProtectedRoute allowedRoles={['asesor', 'admin', 'superadmin', 'advisor']}>
                    <AdvisorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/advisor/franchisee/:franchiseeId"
                element={
                  <ProtectedRoute allowedRoles={['asesor', 'admin', 'superadmin', 'advisor']}>
                    <FranchiseeDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/valuation"
                element={
                  <ProtectedRoute allowedRoles={['franchisee', 'superadmin', 'admin', 'asesor']}>
                    <ValuationApp />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employees"
                element={
                  <ProtectedRoute allowedRoles={['franchisee', 'superadmin', 'admin', 'asesor']}>
                    <EmployeePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orquest"
                element={
                  <ProtectedRoute allowedRoles={['franchisee', 'asesor', 'admin', 'superadmin']}>
                    <OrquestPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/incidents"
                element={
                  <ProtectedRoute allowedRoles={['franchisee', 'staff', 'asesor', 'admin', 'superadmin']}>
                    <IncidentManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute allowedRoles={['franchisee', 'superadmin', 'admin', 'asesor']}>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/biloop" element={<BiloopPage />} />
              <Route
                path="/workers"
                element={
                  <ProtectedRoute allowedRoles={['franchisee', 'asesor', 'admin', 'superadmin']}>
                    <WorkersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/labor-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['franchisee', 'asesor', 'admin', 'superadmin']}>
                    <LaborDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/budget-valuation"
                element={
                  <ProtectedRoute allowedRoles={['franchisee', 'asesor', 'admin', 'superadmin']}>
                    <BudgetValuationPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ImpersonationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
