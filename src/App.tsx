
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
                  <ProtectedRoute>
                    <OptimizedDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard-legacy"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/restaurant"
                element={
                  <ProtectedRoute>
                    <RestaurantManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/restaurant/:restaurantId"
                element={
                  <ProtectedRoute>
                    <RestaurantDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analysis"
                element={
                  <ProtectedRoute>
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
                  <ProtectedRoute>
                    <ProfitLossPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/historical-data"
                element={
                  <ProtectedRoute>
                    <HistoricalDataPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/annual-budget"
                element={
                  <ProtectedRoute>
                    <AnnualBudgetPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/advisor"
                element={
                  <ProtectedRoute>
                    <AdvisorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/advisor/franchisee/:franchiseeId"
                element={
                  <ProtectedRoute>
                    <FranchiseeDetailPage />
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
                path="/employees"
                element={
                  <ProtectedRoute>
                    <EmployeePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orquest"
                element={
                  <ProtectedRoute>
                    <OrquestPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/incidents"
                element={
                  <ProtectedRoute>
                    <IncidentManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/biloop" element={<BiloopPage />} />
              <Route
                path="/workers"
                element={
                  <ProtectedRoute>
                    <WorkersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/labor-dashboard"
                element={
                  <ProtectedRoute>
                    <LaborDashboardPage />
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
