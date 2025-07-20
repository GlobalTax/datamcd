import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthPage } from "./pages/AuthPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Importar el nuevo dashboard unificado
import UnifiedDashboardPage from "./pages/UnifiedDashboardPage";

// Mantener dashboards legacy para referencia temporal
import DashboardPage from "./pages/DashboardPage";
import OptimizedDashboardPage from "./pages/OptimizedDashboardPage";
import AnnualBudgetPage from "./pages/AnnualBudgetPage";
import BiloopPage from "./pages/BiloopPage";
import EmployeesPage from "./pages/EmployeesPage";
import HistoricalDataPage from "./pages/HistoricalDataPage";
import IncidentsPage from "./pages/IncidentsPage";
import LaborDashboardPage from "./pages/LaborDashboardPage";
import RestaurantPage from "./pages/RestaurantPage";
import SettingsPage from "./pages/SettingsPage";
import ValuationPage from "./pages/ValuationPage";
import ProfitLossPage from "./pages/ProfitLossPage";
import AnalysisDashboardPage from "./pages/AnalysisDashboardPage";
import OrquestDashboardPage from "./pages/OrquestDashboardPage";
import WorkersDashboardPage from "./pages/WorkersDashboardPage";
import AdvancedDashboard from "./components/advisor/AdvancedDashboard";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              {/* Auth Route */}
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Main Dashboard - Ahora usa el dashboard unificado */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <UnifiedDashboardPage />
                </ProtectedRoute>
              } />

              {/* Legacy Dashboards - Para migración gradual */}
              <Route path="/dashboard-legacy" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard-optimized" element={
                <ProtectedRoute>
                  <OptimizedDashboardPage />
                </ProtectedRoute>
              } />

              <Route path="/annual-budget" element={
                <ProtectedRoute>
                  <AnnualBudgetPage />
                </ProtectedRoute>
              } />
              <Route path="/biloop" element={
                <ProtectedRoute>
                  <BiloopPage />
                </ProtectedRoute>
              } />
              <Route path="/employees" element={
                <ProtectedRoute>
                  <EmployeesPage />
                </ProtectedRoute>
              } />
              <Route path="/historical-data" element={
                <ProtectedRoute>
                  <HistoricalDataPage />
                </ProtectedRoute>
              } />
              <Route path="/incidents" element={
                <ProtectedRoute>
                  <IncidentsPage />
                </ProtectedRoute>
              } />
              <Route path="/labor-dashboard" element={
                <ProtectedRoute>
                  <LaborDashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/restaurant" element={
                <ProtectedRoute>
                  <RestaurantPage />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/valuation" element={
                <ProtectedRoute>
                  <ValuationPage />
                </ProtectedRoute>
              } />
               <Route path="/profit-loss" element={
                <ProtectedRoute>
                  <ProfitLossPage />
                </ProtectedRoute>
              } />
              <Route path="/analysis" element={
                <ProtectedRoute>
                  <AnalysisDashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/orquest" element={
                <ProtectedRoute>
                  <OrquestDashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/workers" element={
                <ProtectedRoute>
                  <WorkersDashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/advisor" element={
                <ProtectedRoute>
                  <AdvancedDashboard />
                </ProtectedRoute>
              } />

              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
