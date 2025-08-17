
import React from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth/AuthProvider";
import { ImpersonationProvider } from "@/hooks/useImpersonation";
import { ConnectionStatusProvider } from "@/components/common/ConnectionStatusProvider";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { RestaurantContextProvider } from "@/providers/RestaurantContext";
import { useRestaurantPrefetch } from "@/hooks/useRestaurantPrefetch";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import AdvisorAuthPage from "./pages/AdvisorAuthPage";
import DashboardPage from "./pages/DashboardPage";
import OptimizedDashboardPage from "./pages/OptimizedDashboardPage";
import RestaurantManagementPage from "./pages/RestaurantManagementPage";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import RestaurantPanelPage from "./pages/RestaurantPanelPage";
import ProfitLossPage from "./pages/ProfitLossPage";
import HistoricalDataPage from "./pages/HistoricalDataPage";
import AnalysisPage from "./pages/AnalysisPage";
import AdvisorPage from "./pages/AdvisorPage";
import FranchiseeDetailPage from "./pages/FranchiseeDetailPage";
import FranchiseeManagementPage from "./pages/FranchiseeManagementPage";
import ValuationApp from "./pages/ValuationApp";
import SettingsPage from "./pages/SettingsPage";
import AnnualBudgetPage from "./pages/AnnualBudgetPage";
import FinancialSummaryPage from "./pages/FinancialSummaryPage";
import EmployeePage from "./pages/EmployeePage";
import OrquestPage from "./pages/OrquestPage";
import IncidentManagementPage from "./pages/IncidentManagementPage";
import BiloopPage from "./pages/BiloopPage";
import WorkersPage from "./pages/WorkersPage";


import NotFound from "./pages/NotFound";
import { mark, measure } from '@/lib/monitoring/marks';
import { PerfDebugPanel } from '@/components/debug/PerfDebugPanel';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        if (error?.status === 401 || error?.status === 403) return false;
        return failureCount < 3;
      },
    },
    mutations: {
      retry: (failureCount, error: any) => {
        if (error?.status === 401 || error?.status === 403) return false;
        return failureCount < 2;
      },
    },
  },
});

function RouteChangePerf() {
  const location = useLocation();
  React.useEffect(() => {
    const label = `nav:${location.pathname}`;
    try {
      mark(`${label}:start`, { path: location.pathname });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          measure(label, `${label}:start`, undefined, { path: location.pathname });
        });
      });
    } catch {}
  }, [location.pathname]);
  return null;
}

function AppWithRestaurantContext() {
  const { prefetchRestaurantData } = useRestaurantPrefetch();
  
  return (
    <RestaurantContextProvider onRestaurantChange={prefetchRestaurantData}>
      <BrowserRouter>
        <Toaster />
        <RouteChangePerf />
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
            path="/restaurant/:restaurantId/panel"
            element={
              <ProtectedRoute>
                <RestaurantPanelPage />
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
            path="/resumen-financiero"
            element={
              <ProtectedRoute>
                <FinancialSummaryPage />
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
             path="/franchisees"
             element={
               <ProtectedRoute>
                 <FranchiseeManagementPage />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
        {import.meta.env.MODE === 'development' && <PerfDebugPanel />}
      </BrowserRouter>
    </RestaurantContextProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ConnectionStatusProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ImpersonationProvider>
              <TooltipProvider>
                <AppWithRestaurantContext />
              </TooltipProvider>
            </ImpersonationProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ConnectionStatusProvider>
    </ErrorBoundary>
  );
}

export default App;
