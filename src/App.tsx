
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import AdvisorAuthPage from "./pages/AdvisorAuthPage";
import DashboardPage from "./pages/DashboardPage";
import OptimizedDashboardPage from "./pages/OptimizedDashboardPage";
import RestaurantPage from "./pages/RestaurantPage";
import RestaurantManagementPage from "./pages/RestaurantManagementPage";
import ProfitLossPage from "./pages/ProfitLossPage";
import HistoricalDataPage from "./pages/HistoricalDataPage";
import AnalysisPage from "./pages/AnalysisPage";
import AdvisorPage from "./pages/AdvisorPage";
import FranchiseeDetailPage from "./pages/FranchiseeDetailPage";
import ValuationApp from "./pages/ValuationApp";
import SettingsPage from "./pages/SettingsPage";
import AnnualBudgetPage from "./pages/AnnualBudgetPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/advisor-auth" element={<AdvisorAuthPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['franchisee']}>
                    <OptimizedDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard-legacy"
                element={
                  <ProtectedRoute allowedRoles={['franchisee']}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/restaurant"
                element={
                  <ProtectedRoute allowedRoles={['franchisee']}>
                    <RestaurantManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/restaurant-admin"
                element={
                  <ProtectedRoute allowedRoles={['franchisee']}>
                    <RestaurantPage />
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
              <Route
                path="/advisor"
                element={
                  <ProtectedRoute allowedRoles={['asesor', 'admin', 'superadmin']}>
                    <AdvisorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/advisor/franchisee/:franchiseeId"
                element={
                  <ProtectedRoute allowedRoles={['asesor', 'admin', 'superadmin']}>
                    <FranchiseeDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/valuation"
                element={
                  <ProtectedRoute allowedRoles={['franchisee']}>
                    <ValuationApp />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
