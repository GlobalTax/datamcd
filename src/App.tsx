
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/AuthProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import OptimizedDashboardPage from "./pages/OptimizedDashboardPage";
import RestaurantPage from "./pages/RestaurantPage";
import AnalysisPage from "./pages/AnalysisPage";
import ValuationApp from "./pages/ValuationApp";
import AnnualBudgetPage from "./pages/AnnualBudgetPage";
import ProfitLossPage from "./pages/ProfitLossPage";
import HistoricalDataPage from "./pages/HistoricalDataPage";
import BudgetValuationPage from "./pages/BudgetValuationPage";
import AdvisorPage from "./pages/AdvisorPage";
import AdvisorAuthPage from "./pages/AdvisorAuthPage";
import FranchiseeDetailPage from "./pages/FranchiseeDetailPage";
import RestaurantManagementPage from "./pages/RestaurantManagementPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/advisor-auth" element={<AdvisorAuthPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/optimized-dashboard"
                  element={
                    <ProtectedRoute>
                      <OptimizedDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/restaurant/:id"
                  element={
                    <ProtectedRoute>
                      <RestaurantPage />
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
                <Route
                  path="/valuation"
                  element={
                    <ProtectedRoute>
                      <ValuationApp />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/budget/:restaurantId"
                  element={
                    <ProtectedRoute>
                      <AnnualBudgetPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profit-loss"
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
                  path="/budget-valuation"
                  element={
                    <ProtectedRoute>
                      <BudgetValuationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/advisor"
                  element={
                    <ProtectedRoute allowedRoles={['advisor', 'admin', 'superadmin']}>
                      <AdvisorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/franchisee/:id"
                  element={
                    <ProtectedRoute allowedRoles={['advisor', 'admin', 'superadmin']}>
                      <FranchiseeDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/restaurant-management"
                  element={
                    <ProtectedRoute allowedRoles={['advisor', 'admin', 'superadmin']}>
                      <RestaurantManagementPage />
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
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
