import React from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from '@/contexts/auth';
import { ImpersonationProvider } from '@/hooks/useImpersonation';
import { ConnectionStatusProvider } from "@/components/common/ConnectionStatusProvider";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { RestaurantContextProvider } from "@/providers/RestaurantContext";
import { useRestaurantPrefetch } from "@/hooks/useRestaurantPrefetch";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import AdvisorAuthPage from "./pages/AdvisorAuthPage";
import AdvisorPage from "./pages/AdvisorPage";
import FranchiseeDetailPage from "./pages/FranchiseeDetailPage";
import FranchiseeManagementPage from "./pages/FranchiseeManagementPage";
import ValuationApp from "./pages/ValuationApp";
import SettingsPage from "./pages/SettingsPage";
import HistoricalDataPage from "./pages/HistoricalDataPage";
import FinancialSummaryPage from "./pages/FinancialSummaryPage";
import WorkersPage from "./pages/WorkersPage";

// Legacy pages (will be phased out)
import RestaurantManagementPage from "./pages/RestaurantManagementPage";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import RestaurantPanelPage from "./pages/RestaurantPanelPage";

// New restaurant-based pages
import RestaurantHubPage from "./pages/restaurant/RestaurantHubPage";
import RestaurantStaffPage from "./pages/restaurant/RestaurantStaffPage";
import RestaurantPayrollPage from "./pages/restaurant/RestaurantPayrollPage";
import RestaurantBudgetPage from "./pages/restaurant/RestaurantBudgetPage";
import RestaurantProfitLossPage from "./pages/restaurant/RestaurantProfitLossPage";
import RestaurantIncidentsPage from "./pages/restaurant/RestaurantIncidentsPage";
import RestaurantAnalyticsPage from "./pages/restaurant/RestaurantAnalyticsPage";
import RestaurantIntegrationsPage from "./pages/restaurant/RestaurantIntegrationsPage";

// Legacy redirects
import {
  DashboardRedirect,
  RestaurantListRedirect,
  EmployeesRedirect,
  BudgetRedirect,
  ProfitLossRedirect,
  IncidentsRedirect,
  AnalysisRedirect,
  IntegrationsRedirect
} from "./components/navigation/LegacyRouteRedirects";

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

          {/* ============= RESTAURANT-BASED ROUTES (NEW) ============= */}
          <Route
            path="/restaurant/:restaurantId/hub"
            element={
              <ProtectedRoute>
                <RestaurantHubPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant/:restaurantId/staff"
            element={
              <ProtectedRoute>
                <RestaurantStaffPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant/:restaurantId/payroll"
            element={
              <ProtectedRoute>
                <RestaurantPayrollPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant/:restaurantId/budget"
            element={
              <ProtectedRoute>
                <RestaurantBudgetPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant/:restaurantId/profit-loss"
            element={
              <ProtectedRoute>
                <RestaurantProfitLossPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant/:restaurantId/incidents"
            element={
              <ProtectedRoute>
                <RestaurantIncidentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant/:restaurantId/analytics"
            element={
              <ProtectedRoute>
                <RestaurantAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant/:restaurantId/integrations"
            element={
              <ProtectedRoute>
                <RestaurantIntegrationsPage />
              </ProtectedRoute>
            }
          />

          {/* ============= LEGACY REDIRECTS ============= */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant"
            element={
              <ProtectedRoute>
                <RestaurantListRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <EmployeesRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/annual-budget"
            element={
              <ProtectedRoute>
                <BudgetRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profit-loss"
            element={
              <ProtectedRoute>
                <ProfitLossRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incidents"
            element={
              <ProtectedRoute>
                <IncidentsRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis"
            element={
              <ProtectedRoute>
                <AnalysisRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/biloop"
            element={
              <ProtectedRoute>
                <IntegrationsRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orquest"
            element={
              <ProtectedRoute>
                <IntegrationsRedirect />
              </ProtectedRoute>
            }
          />

          {/* ============= LEGACY RESTAURANT ROUTES (KEEP FOR COMPATIBILITY) ============= */}
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

          {/* ============= ADMIN & ADVISOR ROUTES ============= */}
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

          {/* ============= GLOBAL ROUTES (NOT RESTAURANT-SPECIFIC) ============= */}
          <Route
            path="/valuation"
            element={
              <ProtectedRoute>
                <ValuationApp />
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
          <Route
            path="/historical-data"
            element={
              <ProtectedRoute>
                <HistoricalDataPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workers"
            element={
              <ProtectedRoute>
                <WorkersPage />
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

          {/* ============= LEGACY ROUTES (TEMPORARY - WILL BE REMOVED) ============= */}
          <Route
            path="/restaurants"
            element={
              <ProtectedRoute>
                <RestaurantManagementPage />
              </ProtectedRoute>
            }
          />
          {/* Legacy P&L redirect with site number */}
          <Route
            path="/profit-loss/:siteNumber"
            element={
              <ProtectedRoute>
                <ProfitLossRedirect />
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
            <TooltipProvider>
              <AppWithRestaurantContext />
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ConnectionStatusProvider>
    </ErrorBoundary>
  );
}

export default App;
