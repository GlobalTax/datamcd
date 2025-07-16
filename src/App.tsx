
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UnifiedAuthProvider } from "@/hooks/auth/useUnifiedAuth";
import { ImpersonationProvider } from "@/hooks/useImpersonation";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import AdvisorAuthPage from "./pages/AdvisorAuthPage";
import NewDashboardPage from "./pages/NewDashboardPage";
import RestaurantHub from "./pages/RestaurantHub";
import AdvisorPage from "./pages/AdvisorPage";
import FranchiseeDetailPage from "./pages/FranchiseeDetailPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

// Legacy imports for backward compatibility
import DashboardPage from "./pages/DashboardPage";
import OptimizedDashboardPage from "./pages/OptimizedDashboardPage";
import RestaurantPage from "./pages/RestaurantPage";
import RestaurantManagementPage from "./pages/RestaurantManagementPage";
import ProfitLossPage from "./pages/ProfitLossPage";
import HistoricalDataPage from "./pages/HistoricalDataPage";
import AnalysisPage from "./pages/AnalysisPage";
import ValuationApp from "./pages/ValuationApp";
import AnnualBudgetPage from "./pages/AnnualBudgetPage";
import EmployeePage from "./pages/EmployeePage";
import OrquestPage from "./pages/OrquestPage";
import IncidentManagementPage from "./pages/IncidentManagementPage";
import BiloopPage from "./pages/BiloopPage";
import WorkersPage from "./pages/WorkersPage";
import LaborDashboardPage from "./pages/LaborDashboardPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UnifiedAuthProvider>
        <ImpersonationProvider>
          <TooltipProvider>
          <BrowserRouter>
            <Toaster />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/advisor-auth" element={<AdvisorAuthPage />} />
              {/* Nueva estructura unificada */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['franchisee', 'asesor', 'admin', 'superadmin', 'advisor']}>
                    <NewDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/restaurant/:restaurantId"
                element={
                  <ProtectedRoute allowedRoles={['franchisee', 'asesor', 'admin', 'superadmin', 'advisor']}>
                    <RestaurantHub />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/restaurant/:restaurantId/*"
                element={
                  <ProtectedRoute allowedRoles={['franchisee', 'asesor', 'admin', 'superadmin', 'advisor']}>
                    <RestaurantHub />
                  </ProtectedRoute>
                }
              />

              {/* Rutas legacy para compatibilidad */}
              <Route
                path="/dashboard-legacy"
                element={
                  <ProtectedRoute allowedRoles={['franchisee']}>
                    <OptimizedDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/restaurant-old"
                element={
                  <ProtectedRoute allowedRoles={['franchisee']}>
                    <RestaurantManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analysis"
                element={
                  <ProtectedRoute allowedRoles={['franchisee']}>
                    <AnalysisPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profit-loss"
                element={<Navigate to="/profit-loss/001" replace />}
              />
              <Route
                path="/profit-loss/:siteNumber"
                element={
                  <ProtectedRoute allowedRoles={['franchisee']}>
                    <ProfitLossPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/historical-data"
                element={
                  <ProtectedRoute allowedRoles={['franchisee']}>
                    <HistoricalDataPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/annual-budget"
                element={
                  <ProtectedRoute allowedRoles={['franchisee']}>
                    <AnnualBudgetPage />
                  </ProtectedRoute>
                }
              />
              {/* Panel de asesor eliminado - ahora todos usan el dashboard unificado */}
              <Route
                path="/valuation"
                element={
                  <ProtectedRoute allowedRoles={['franchisee']}>
                    <ValuationApp />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employees"
                element={
                  <ProtectedRoute allowedRoles={['franchisee']}>
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
                  <ProtectedRoute allowedRoles={['franchisee']}>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/biloop"
                element={
                  <ProtectedRoute allowedRoles={['franchisee', 'asesor', 'admin', 'superadmin']}>
                    <BiloopPage />
                  </ProtectedRoute>
                }
              />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
        </ImpersonationProvider>
      </UnifiedAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
